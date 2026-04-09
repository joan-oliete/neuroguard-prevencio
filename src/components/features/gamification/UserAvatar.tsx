import React, { useMemo } from 'react';
import { UserProfile } from '../../../types';
import { motion } from 'framer-motion';

interface UserAvatarProps {
    user?: UserProfile;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
    // Default avatar state if user doesn't have one set up yet
    const avatar = useMemo(() => ({
        skinTone: user?.avatar?.skinTone || '#f5d0b0',
        bodyType: user?.avatar?.bodyType || 'neutral',
        clothing: user?.avatar?.clothing || 'casual-tshirt',
        accessories: user?.avatar?.accessories || [], // Safe default
        currentXp: user?.avatar?.currentXp || 0,
        nextLevelXp: user?.avatar?.nextLevelXp || 100
    }), [user]);

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32'
    };

    // Simple geometric avatar composition (can be replaced by SVGs later)
    return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
            <motion.div
                className="w-full h-full rounded-full bg-blue-100 overflow-hidden border-4 border-white shadow-lg relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
            >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-sky-50" />

                {/* Body/Head base */}
                <div
                    className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-2/3 h-2/3 rounded-t-full"
                    style={{ backgroundColor: avatar.clothing === 'gold-armor' ? '#d4af37' : '#3b82f6' }}
                />
                <div
                    className="absolute top-[20%] left-1/2 -translate-x-1/2 w-1/2 h-1/2 rounded-full shadow-sm"
                    style={{ backgroundColor: avatar.skinTone }}
                />

                {/* Accessories (Simple conditional rendering) */}
                {avatar.accessories?.includes('glasses') && (
                    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-1/3 h-[5px] bg-slate-800 rounded-full" />
                )}

                {/* Level Badge */}
                {size !== 'sm' && (
                    <div className="absolute bottom-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                        Lvl {user?.level || 1}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
