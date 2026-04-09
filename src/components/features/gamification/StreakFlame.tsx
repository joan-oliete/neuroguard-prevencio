import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakFlameProps {
    days: number;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({ days }) => {
    // Intensity based on days
    // 0-2: Small, Orange
    // 3-6: Medium, Red
    // 7+: Large, Blue/Purple (Cosmic)

    let colorClass = "from-orange-400 to-yellow-500";
    let shadowClass = "shadow-[0_0_20px_rgba(251,146,60,0.5)]";
    let scale = 1;

    if (days >= 3) {
        colorClass = "from-red-500 to-orange-500";
        shadowClass = "shadow-[0_0_30px_rgba(239,68,68,0.6)]";
        scale = 1.2;
    }
    if (days >= 7) {
        colorClass = "from-violet-500 to-fuchsia-500";
        shadowClass = "shadow-[0_0_40px_rgba(139,92,246,0.8)]";
        scale = 1.3;
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <motion.div
                    animate={{ scale: [scale, scale * 1.1, scale] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`relative z-10 w-12 h-12 rounded-full bg-gradient-to-t ${colorClass} flex items-center justify-center ${shadowClass}`}
                >
                    <Flame className="text-white fill-white" size={24} />
                </motion.div>
                {/* Background Pulse */}
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [scale, scale * 1.4, scale] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-t ${colorClass} filter blur-xl -z-0`}
                />
            </div>
            <div className="mt-2 text-center">
                <span className="block text-2xl font-black text-white leading-none">{days}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dies Ratxa</span>
            </div>
        </div>
    );
};
