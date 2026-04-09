import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth'; // Ensure this type is available or use 'any' if strictly needed initially
import { onAuthStateChanged, auth, db, doc, onSnapshot } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        await auth.signOut();
    };

    useEffect(() => {
        let profileUnsubscribe: () => void;

        const authUnsubscribe = onAuthStateChanged(auth, (u: any) => {
            setUser(u);
            if (u) {
                // Listen to User Profile changes in real-time
                const userRef = doc(db, "users", u.uid);
                profileUnsubscribe = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
                    }
                    // IMPORTANT: Only set loading to false AFTER we have attempted to fetch the profile
                    // This prevents the app from rendering the Dashboard with a null profile
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching profile:", error);
                    // Even on error, we must stop loading to avoid infinite spinner, 
                    // though App.tsx might handle the null profile visually.
                    setLoading(false);
                });
            } else {
                setUserProfile(null);
                setLoading(false); // No user, so no profile to wait for.
                if (profileUnsubscribe) profileUnsubscribe();
            }
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
