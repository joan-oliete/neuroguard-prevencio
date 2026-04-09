import { useState, useCallback } from 'react';
import { doc, updateDoc, increment, db } from '../services/firebase';
import { UserProfile } from '../types';

export const useGamification = (user: UserProfile | null) => {
    const [isLevelingUp, setIsLevelingUp] = useState(false);

    const addXp = useCallback(async (amount: number) => {
        if (!user) return;

        console.log(`Adding ${amount} XP to user ${user.id}`);
        const userRef = doc(db, 'users', user.id);

        try {
            // Optimistic update logic could go here
            await updateDoc(userRef, {
                'avatar.currentXp': increment(amount),
                currency: increment(amount), // Currency also grows with XP usually
                streak: increment(0) // Just to touch the doc
            });

            // Check for Level Up (Simplified logic: Level * 100 XP needed)
            const currentXp = (user.avatar?.currentXp || 0) + amount;
            const currentLevel = user.level || 1;
            const xpNeeded = currentLevel * 100;

            if (currentXp >= xpNeeded) {
                // LEVEL UP!
                setIsLevelingUp(true);
                await updateDoc(userRef, {
                    level: increment(1),
                    'avatar.currentXp': currentXp - xpNeeded, // Overflow XP
                    'avatar.nextLevelXp': (currentLevel + 1) * 100
                });

                // Reset state after animation
                setTimeout(() => setIsLevelingUp(false), 3000);
            }

        } catch (error) {
            console.error("Error updating XP:", error);
        }
    }, [user]);

    return { addXp, isLevelingUp };
};
