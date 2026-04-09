import { useState, useEffect } from 'react';
import { db, doc, onSnapshot } from '../services/firebase';
import { RelapseManual, UserProfile } from '../types';
import { User } from 'firebase/auth';

/**
 * Custom hook to fetch and subscribe to the user's active manual.
 * @param user The current authenticated user.
 * @param userProfile The user's profile containing the activeManualId.
 * @returns The active manual object and a loading state.
 */
export const useManual = (user: User | null, userProfile: UserProfile | null) => {
    const [activeManual, setActiveManual] = useState<RelapseManual | null>(null);
    const [manualLoading, setManualLoading] = useState(true);

    useEffect(() => {
        // Reset state if inputs are missing
        if (!user || !userProfile?.activeManualId) {
            setManualLoading(false);
            setActiveManual(null);
            return;
        }

        setManualLoading(true);
        const manualRef = doc(db, `users/${user.uid}/manuals`, userProfile.activeManualId);

        const unsubscribe = onSnapshot(manualRef, (doc) => {
            if (doc.exists()) {
                setActiveManual({ id: doc.id, ...doc.data() } as RelapseManual);
            } else {
                console.warn("Manual actiu no trobat");
                setActiveManual(null);
            }
            setManualLoading(false);
        }, (error) => {
            console.error("Error fetching manual:", error);
            setManualLoading(false);
        });

        return unsubscribe;
    }, [user, userProfile?.activeManualId]); // Re-run if user or activeManualId changes

    return { activeManual, manualLoading };
};
