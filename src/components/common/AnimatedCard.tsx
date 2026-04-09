import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    className = "",
    delay = 0,
    onClick
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay, type: "spring", stiffness: 100 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${className}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};
