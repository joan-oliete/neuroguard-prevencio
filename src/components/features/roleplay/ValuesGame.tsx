import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { VALUES_SCENARIOS } from '../../../data/roleplayData';

interface ValuesGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const ValuesGame: React.FC<ValuesGameProps> = ({ onExit, onScoreUpdate }) => {
    const [step, setStep] = useState(0);
    const [showFeedback, setShowFeedback] = useState<string | null>(null);
    const [lastAlignment, setLastAlignment] = useState<'high' | 'low' | 'neutral' | null>(null);

    const scenario = VALUES_SCENARIOS[step % VALUES_SCENARIOS.length];

    const handleChoice = (alignment: string) => {
        setLastAlignment(alignment as any);

        if (alignment === 'high') {
            onScoreUpdate(30);
            setShowFeedback(scenario.feedback_high);
        } else {
            setShowFeedback("Aquesta opció no s'alinea del tot amb el teu valor. Intenta trobar un camí millor.");
        }
    };

    const nextStep = () => {
        setShowFeedback(null);
        setLastAlignment(null);
        setStep(prev => prev + 1);
    };

    return (
        <div className="h-[600px] w-full max-w-2xl mx-auto relative perspective-1000">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-emerald-50 rounded-3xl transform rotate-3 scale-95 opacity-50 z-0"></div>

            <div className="relative z-10 bg-white h-full rounded-3xl shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Compass className="animate-spin-slow" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl">Brúixola de Valors</h2>
                            <p className="text-emerald-100 text-xs">Alinea les accions amb els teus principis</p>
                        </div>
                    </div>
                    <button onClick={onExit} className="text-emerald-100 hover:text-white transition-colors">Sortir</button>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-8 flex flex-col justify-center relative">
                    <AnimatePresence mode='wait'>
                        {!showFeedback ? (
                            <motion.div
                                key={`scenario-${step}`}
                                initial={{ x: 300, opacity: 0, rotate: 10 }}
                                animate={{ x: 0, opacity: 1, rotate: 0 }}
                                exit={{ x: -300, opacity: 0, rotate: -10 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="w-full"
                            >
                                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-8 shadow-sm">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Dilema #{step + 1}</p>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-4">{scenario.dilemma}</h3>
                                    <p className="text-slate-600 text-lg italic">"{scenario.context}"</p>
                                </div>

                                <div className="space-y-3">
                                    {scenario.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleChoice(opt.alignment)}
                                            className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left font-medium text-slate-700 flex items-center justify-between group active:scale-[0.98]"
                                        >
                                            {opt.text}
                                            <div className="w-6 h-6 rounded-full border border-slate-300 group-hover:border-emerald-500 flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            /* Result / Feedback View */
                            <motion.div
                                key="feedback"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${lastAlignment === 'high' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                                    {lastAlignment === 'high' ? <CheckCircle size={48} /> : <Compass size={48} />}
                                </div>

                                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                    {lastAlignment === 'high' ? 'Valors Alineats!' : 'Desviació detectada'}
                                </h3>
                                <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                                    {showFeedback}
                                </p>

                                <button
                                    onClick={nextStep}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
                                >
                                    Següent Dilema <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
