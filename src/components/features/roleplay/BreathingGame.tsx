import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, CheckCircle } from 'lucide-react';

interface BreathingGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const BreathingGame: React.FC<BreathingGameProps> = ({ onExit, onScoreUpdate }) => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>('wait');
    const [timeLeft, setTimeLeft] = useState(4);
    const [isActive, setIsActive] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isActive) {
            const runCycle = () => {
                // INHALE (4s)
                setPhase('inhale');
                setTimeLeft(4);
                let count = 4;
                const timer = setInterval(() => {
                    count--;
                    setTimeLeft(count);
                    if (count <= 0) {
                        clearInterval(timer);

                        // HOLD (4s)
                        setPhase('hold');
                        setTimeLeft(4);
                        let holdCount = 4;
                        const holdTimer = setInterval(() => {
                            holdCount--;
                            setTimeLeft(holdCount);
                            if (holdCount <= 0) {
                                clearInterval(holdTimer);

                                // EXHALE (4s)
                                setPhase('exhale');
                                setTimeLeft(4);
                                let exhaleCount = 4;
                                const exhaleTimer = setInterval(() => {
                                    exhaleCount--;
                                    setTimeLeft(exhaleCount);
                                    if (exhaleCount <= 0) {
                                        clearInterval(exhaleTimer);
                                        runCycle(); // LOOP
                                    }
                                }, 1000);
                            }
                        }, 1000);
                    }
                }, 1000);
                return timer;
            };
            runCycle();
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleInteraction = () => {
        if (!isActive) {
            setIsActive(true);
            return;
        }

        // Gameplay: Tap during Exhale for points
        if (phase === 'exhale') {
            const points = 10;
            setScore(s => s + points);
            onScoreUpdate(points);
        }
    };

    const getInstruction = () => {
        switch (phase) {
            case 'inhale': return "Inspira...";
            case 'hold': return "Aguanta...";
            case 'exhale': return "Expira & Clica!";
            default: return "Clica per Iniciar";
        }
    };

    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return 'border-cyan-400 bg-cyan-500/20';
            case 'hold': return 'border-indigo-400 bg-indigo-500/20';
            case 'exhale': return 'border-emerald-400 bg-emerald-500/20';
            default: return 'border-white/20 bg-white/5';
        }
    };

    const getScale = () => {
        switch (phase) {
            case 'inhale': return 'scale-150';
            case 'hold': return 'scale-150'; // Stay expanded
            case 'exhale': return 'scale-100';
            default: return 'scale-100';
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl max-w-2xl mx-auto border border-white/10 bg-black aspect-square md:aspect-video flex flex-col items-center justify-center p-8 backdrop-blur-xl">

            {/* Background Dynamic Gradient */}
            <div className={`absolute inset-0 transition-opacity duration-[2000ms] bg-gradient-to-br ${phase === 'inhale' ? 'from-cyan-900/50 to-black' : phase === 'hold' ? 'from-indigo-900/50 to-black' : phase === 'exhale' ? 'from-emerald-900/50 to-black' : 'from-slate-900 to-black'}`}></div>

            <button onClick={onExit} className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md">✕</button>

            {/* Central Breathing Orb */}
            <div
                className="relative z-10 w-full max-w-sm aspect-square flex items-center justify-center cursor-pointer group"
                onClick={handleInteraction}
            >
                {/* Guide Ring */}
                <div className={`absolute w-64 h-64 border-2 rounded-full opacity-20 transform transition-all duration-1000 ${isActive ? 'scale-100 border-white' : 'scale-75 border-slate-500'}`}></div>

                {/* Main Orb */}
                <div className={`relative w-32 h-32 rounded-full border-4 transition-all duration-[4000ms] flex items-center justify-center shadow-[0_0_50px_currentColor] backdrop-blur-sm ${getPhaseColor()} ${getScale()}`}>
                    {!isActive ? (
                        <Play size={40} className="ml-2 text-white/80" fill="currentColor" />
                    ) : (
                        <span className="text-4xl font-light font-mono text-white">{timeLeft}</span>
                    )}
                </div>
            </div>

            {/* Instruction Text */}
            <div className="relative z-10 text-center mt-8 h-20">
                <h3 className="text-2xl font-light tracking-[0.2em] text-white uppercase mb-2 animate-pulse">{getInstruction()}</h3>
                {isActive && (
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 font-mono text-sm">
                        <CheckCircle size={14} className="text-emerald-400" />
                        Punts: {score}
                    </div>
                )}
            </div>
        </div>
    );
};
