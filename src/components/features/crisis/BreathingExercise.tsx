import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface BreathingExerciseProps {
    onClose: () => void;
    onAddXp?: (amount: number) => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose, onAddXp }) => {
    const { t } = useTranslation();
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [timer, setTimer] = useState(4); // Start with Inhale 4s
    const [cycleCount, setCycleCount] = useState(0);

    // 4-7-8 Rhythm
    const PHASES = {
        inhale: { duration: 4, next: 'hold' as const, color: 'text-sky-500', ring: 'border-sky-400', bg: 'bg-sky-50' },
        hold: { duration: 7, next: 'exhale' as const, color: 'text-indigo-500', ring: 'border-indigo-400', bg: 'bg-indigo-50' },
        exhale: { duration: 8, next: 'inhale' as const, color: 'text-emerald-500', ring: 'border-emerald-400', bg: 'bg-emerald-50' }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    // Phase transition
                    const nextPhase = PHASES[phase].next;
                    setPhase(nextPhase);

                    if (nextPhase === 'inhale') {
                        setCycleCount(c => c + 1);
                        if (onAddXp) onAddXp(10);
                    }

                    return PHASES[nextPhase].duration;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [phase]);

    // Dynamic styles based on phase
    const getScale = () => {
        if (phase === 'inhale') return 'scale-100'; // Growing (handled by CSS animation class)
        if (phase === 'hold') return 'scale-110';   // Static big
        if (phase === 'exhale') return 'scale-50';  // Shrinking
        return 'scale-100';
    };

    // Instruction text mapping
    const getInstruction = () => {
        switch (phase) {
            case 'inhale': return t('breathing.inhale', 'Inspira');
            case 'hold': return t('breathing.hold', 'Aguanta');
            case 'exhale': return t('breathing.exhale', 'Expira');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center">
                <h2 className="text-white/80 text-xl font-medium mb-12 tracking-wider uppercase">{t('breathing.title', 'Respiració 4-7-8')}</h2>

                {/* Visual Circle */}
                <div className="relative w-80 h-80 flex items-center justify-center">
                    {/* Outer Rings */}
                    <div className={`absolute inset-0 rounded-full border-4 ${PHASES[phase].ring} opacity-20 animate-pulse`}></div>
                    <div className={`absolute inset-4 rounded-full border-2 ${PHASES[phase].ring} opacity-10`}></div>

                    {/* Animated Core */}
                    <div
                        className={`w-40 h-40 rounded-full bg-white shadow-[0_0_100px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-[4000ms] ease-in-out
                            ${phase === 'inhale' ? 'scale-[2.0] duration-[4000ms]' : ''}
                            ${phase === 'hold' ? 'scale-[2.0] duration-0' : ''}
                            ${phase === 'exhale' ? 'scale-100 duration-[8000ms]' : ''}
                        `}
                    >
                        <span className={`text-4xl font-bold ${PHASES[phase].color} transition-colors duration-500`}>
                            {timer}
                        </span>
                    </div>

                    {/* Phase Label */}
                    <div className="absolute -bottom-24 text-center">
                        <p className="text-5xl font-bold text-white mb-2 tracking-tight transition-all duration-500">{getInstruction()}</p>
                        <p className="text-white/50 text-sm">Cicles completats: {cycleCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
