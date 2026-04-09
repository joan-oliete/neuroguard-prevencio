import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, onSnapshot, setDoc } from '../services/firebase';

interface GameConfig {
    promptDj: {
        weights: Record<string, number>;
    };
    difficulty: 'easy' | 'normal' | 'hard';
}

interface GameConfigContextType {
    config: GameConfig;
    updateConfig: (newConfig: Partial<GameConfig>) => Promise<void>;
}

const DEFAULT_CONFIG: GameConfig = {
    promptDj: {
        weights: {}
    },
    difficulty: 'normal'
};

const GameConfigContext = createContext<GameConfigContextType | undefined>(undefined);

export const GameConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);

    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, 'users', user.uid, 'gameConfig', 'settings');
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setConfig(snap.data() as GameConfig);
            } else {
                // Initialize if not exists
                setDoc(docRef, DEFAULT_CONFIG);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const updateConfig = async (newConfig: Partial<GameConfig>) => {
        if (!user) return;
        const docRef = doc(db, 'users', user.uid, 'gameConfig', 'settings');
        await setDoc(docRef, { ...config, ...newConfig }, { merge: true });
    };

    return (
        <GameConfigContext.Provider value={{ config, updateConfig }}>
            {children}
        </GameConfigContext.Provider>
    );
};

export const useGameConfig = () => {
    const context = useContext(GameConfigContext);
    if (!context) {
        throw new Error('useGameConfig must be used within a GameConfigProvider');
    }
    return context;
};
