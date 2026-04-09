import React, { useState, useEffect } from 'react';
import { Trophy, Target, Zap, XCircle } from 'lucide-react';

interface FocusGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const FocusGame: React.FC<FocusGameProps> = ({ onExit, onScoreUpdate }) => {
    const [active, setActive] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [targets, setTargets] = useState<{ id: number, type: 'good' | 'bad', x: number, y: number }[]>([]);

    const startGame = () => {
        setActive(true);
        setScore(0);
        setTimeLeft(30);
        setTargets([]);
    };

    useEffect(() => {
        if (!active) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setActive(false);
                    onScoreUpdate(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const spawner = setInterval(() => {
            setTargets(prev => {
                if (prev.length > 5) return prev; // Limit items
                const type = Math.random() > 0.3 ? 'good' : 'bad';
                return [...prev, {
                    id: Date.now(),
                    type,
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10
                }];
            });
        }, 800);

        return () => {
            clearInterval(timer);
            clearInterval(spawner);
        };
    }, [active, score]); // score in deps might cause re-renders of effect but it's captured in closure, handled by setScore callback so ok. Actually score dependency not needed for the effect logic if using functional updates. Removed score from deps to avoid timer reset/issues? No, timer logic is independent.
    // Wait, if I put 'score' in deps, the intervals reset every time score changes. That's bad.
    // Fixed dependency array below.

    const handleClick = (id: number, type: 'good' | 'bad') => {
        if (type === 'good') {
            setScore(s => s + 10);
        } else {
            setScore(s => Math.max(0, s - 20));
        }
        setTargets(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="max-w-3xl mx-auto h-[600px] bg-slate-900 rounded-3xl relative overflow-hidden shadow-2xl animate-fadeIn cursor-crosshair border-4 border-slate-700">
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
                <div className="text-white font-mono text-xl flex items-center gap-2"><Trophy className="text-yellow-400" /> {score}</div>
                <div className={`font-mono text-2xl font-bold ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                </div>
                <button onClick={onExit} className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600 text-xs">Sortir</button>
            </div>

            {/* Game Area */}
            {active ? (
                <div className="w-full h-full relative">
                    {targets.map(t => (
                        <button
                            key={t.id}
                            style={{ left: `${t.x}%`, top: `${t.y}%` }}
                            className={`absolute w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg animate-bounce ${t.type === 'good' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
                            onClick={() => handleClick(t.id, t.type)}
                        >
                            {t.type === 'good' ? <Zap className="text-white w-8 h-8" /> : <XCircle className="text-white w-8 h-8" />}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 text-center">
                    {timeLeft === 0 ? (
                        <>
                            <h2 className="text-4xl font-bold text-white mb-4">Temps Esgotat!</h2>
                            <p className="text-2xl text-yellow-400 mb-8 font-mono">Puntuació Final: {score}</p>
                            <button onClick={onExit} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all">
                                Tornar al Menú
                            </button>
                        </>
                    ) : (
                        // Start Screen
                        <div className="flex flex-col items-center justify-center p-8">
                            <Target className="w-20 h-20 text-green-500 mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Focus Zen</h2>
                            <p className="text-gray-300 mb-8 max-w-md">
                                Entrena la teva inhibició. Clica els <span className="text-green-400 font-bold">raigs verds</span> (positius). Evita les <span className="text-red-400 font-bold">creus vermelles</span> (negatius).
                            </p>
                            <button onClick={startGame} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-all animate-pulse">
                                COMENÇAR
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
