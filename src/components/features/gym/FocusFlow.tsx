import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Target, Zap } from 'lucide-react';

interface FocusFlowProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const FocusFlow: React.FC<FocusFlowProps> = ({ onExit, onScoreUpdate }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [targets, setTargets] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

    // Game loop refs
    const requestRef = useRef<number>();
    const lastSpawnTime = useRef<number>(0);

    // Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsPlaying(false);
            onScoreUpdate(score); // Final score update
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeLeft, score, onScoreUpdate]);

    // Game Loop
    const animate = (time: number) => {
        if (!isPlaying) return;

        if (time - lastSpawnTime.current > 1000) { // Spawn every second
            spawnTarget();
            lastSpawnTime.current = time;
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    const spawnTarget = () => {
        const id = Date.now();
        const x = Math.random() * 80 + 10; // 10% to 90%
        const y = Math.random() * 80 + 10;
        const size = Math.random() * 40 + 40; // 40px to 80px

        setTargets((prev) => [...prev, { id, x, y, size }]);

        // Auto-remove after 2s if not clicked
        setTimeout(() => {
            setTargets((prev) => prev.filter((t) => t.id !== id));
        }, 2000);
    };

    const handleTargetClick = (id: number) => {
        if (!isPlaying) return;
        setTargets((prev) => prev.filter((t) => t.id !== id));
        setScore((s) => s + 10);
        // Visual feedback handled by CSS active state or particle effect (simplified here)
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Dynamic Background (Simulating Video) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 animate-pulse-slow"></div>
                {/* Animated Particles/Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] animate-float-delayed"></div>
            </div>

            {/* Header */}
            <div className="relative z-20 flex justify-between items-center p-6 bg-black/20 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="text-white" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Focus Flow</h2>
                        <p className="text-xs text-white/50 font-mono">Puntuació: {score}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full font-mono text-sm border border-white/10">
                        <Zap size={14} className="text-yellow-400" />
                        <span>{timeLeft}s</span>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative z-10 flex-1 overflow-hidden cursor-crosshair">
                {!isPlaying && timeLeft > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="group relative px-8 py-4 bg-white text-slate-900 font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3"><Play fill="currentColor" /> COMENÇAR</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-300 to-sky-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                )}

                {/* Targets */}
                {targets.map((target) => (
                    <button
                        key={target.id}
                        onClick={() => handleTargetClick(target.id)}
                        style={{
                            left: `${target.x}%`,
                            top: `${target.y}%`,
                            width: `${target.size}px`,
                            height: `${target.size}px`
                        }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.5)] bg-white/10 backdrop-blur-md hover:bg-white/90 hover:scale-95 transition-all duration-100 flex items-center justify-center group animate-scaleIn"
                    >
                        <div className="w-1/2 h-1/2 bg-white rounded-full opacity-50 group-hover:opacity-100"></div>
                    </button>
                ))}

                {/* Game Over Screen */}
                {timeLeft === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-40 animate-fadeIn">
                        <div className="bg-white text-slate-900 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                            <h3 className="text-3xl font-black mb-2">Temps Esgotat!</h3>
                            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-600 mb-6">
                                {score}
                            </div>
                            <p className="text-slate-500 mb-8 font-medium">Punts totals aconseguits</p>
                            <button
                                onClick={() => { setTimeLeft(30); setScore(0); setTargets([]); setIsPlaying(true); }}
                                className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all"
                            >
                                Tornar a jugar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
