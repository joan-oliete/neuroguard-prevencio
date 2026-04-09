import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, ScanLine, Zap, Timer } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { COGNITIVE_CHALLENGES } from '../../../data/roleplayData';

interface CognitiveGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const CognitiveGame: React.FC<CognitiveGameProps> = ({ onExit, onScoreUpdate }) => {
    const [step, setStep] = useState(0);
    const [correct, setCorrect] = useState<boolean | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [streak, setStreak] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const challenge = COGNITIVE_CHALLENGES[step];

    useEffect(() => {
        let timer: any;
        if (isActive && timeLeft > 0 && correct === null) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimeout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft, correct]);

    const handleTimeout = () => {
        setCorrect(false);
        setStreak(0);
        setTimeout(nextLevel, 1500);
    };

    const handleAnswer = (index: number) => {
        if (correct !== null) return; // Prevent double clicks

        if (index === challenge.correctIndex) {
            setCorrect(true);
            const timeBonus = Math.floor(timeLeft * 2);
            const streakBonus = streak * 5;
            const totalPoints = 20 + timeBonus + streakBonus;

            onScoreUpdate(totalPoints);
            setStreak(s => s + 1);

            setTimeout(nextLevel, 1500);
        } else {
            setCorrect(false);
            setStreak(0);
            onScoreUpdate(-5); // Penalty
            setTimeout(nextLevel, 1500);
        }
    };

    const nextLevel = () => {
        setCorrect(null);
        setStep(prev => (prev + 1) % COGNITIVE_CHALLENGES.length);
        setTimeLeft(15);
        setIsActive(true);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 animate-fadeIn relative pb-24">

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden ring-1 ring-slate-100">

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-100/50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-50 rounded-2xl border border-brand-100 shadow-sm">
                            <Brain className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Neuro-Train</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100/80 px-2 py-1 rounded-lg w-fit mt-1">
                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                {isActive ? 'Processant...' : 'Pausat'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600 font-bold shadow-sm">
                            <Zap size={18} fill="currentColor" /> x{streak}
                        </div>
                        <button onClick={onExit} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Timer Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full mb-10 overflow-hidden relative">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft < 5 ? 'bg-rose-500' : 'bg-brand-500'}`}
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                    ></div>
                </div>

                {/* Challenge Card */}
                <div className="relative mb-8">
                    <div className={`p-10 rounded-3xl border text-center relative overflow-hidden transition-all duration-500 shadow-sm
                        ${correct === true ? 'bg-emerald-50 border-emerald-100' :
                            correct === false ? 'bg-rose-50 border-rose-100' :
                                'bg-white border-slate-200 shadow-lg'}`}>

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                            <ScanLine size={14} /> Pensament Distorsionat
                        </p>

                        <p className={`text-2xl md:text-3xl font-serif italic text-slate-800 transition-all leading-relaxed ${correct === null ? 'animate-float' : ''}`}>
                            "{challenge.distortion}"
                        </p>
                    </div>

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {correct !== null && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl backdrop-blur-md bg-white/30"
                            >
                                {correct ? (
                                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100 text-center transform scale-110">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={32} className="text-emerald-600" />
                                        </div>
                                        <p className="text-emerald-700 font-bold text-lg">Reestructurat!</p>
                                        <p className="text-emerald-600/80 text-sm font-medium">+20 XP</p>
                                    </div>
                                ) : (
                                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-rose-100 text-center transform scale-110">
                                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <XCircle size={32} className="text-rose-600" />
                                        </div>
                                        <p className="text-rose-700 font-bold text-lg">Intenta-ho de nou</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center text-slate-400 mb-6 font-medium text-sm">Selecciona el pensament alternatiu saludable:</p>

                <div className="grid gap-4 relative z-10">
                    {challenge.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={correct !== null}
                            className={`w-full p-5 rounded-2xl border text-left font-medium transition-all duration-200 group relative overflow-hidden px-6 shadow-sm
                                ${correct !== null
                                    ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50'
                                    : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 hover:shadow-md hover:-translate-y-0.5'
                                }
                            `}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-bold group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-slate-600 group-hover:text-slate-900 transition-colors leading-snug">{opt}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
