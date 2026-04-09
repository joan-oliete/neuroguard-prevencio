import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Zap, Wind, BookOpen, Skull } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BreathingExercise } from '../crisis/BreathingExercise';

interface BossArenaProps {
    onDefeat: () => void;
    onEscape: () => void;
    onAddXp: (amount: number) => void;
    userLevel: number;
}

export const BossArena: React.FC<BossArenaProps> = ({ onDefeat, onEscape, onAddXp, userLevel }) => {
    const { t } = useTranslation();
    const [bossHp, setBossHp] = useState(100);
    const [maxBossHp] = useState(100);
    const [playerHp, setPlayerHp] = useState(100);
    const [turn, setTurn] = useState<'player' | 'boss' | 'victory'>('player');
    const [activeTool, setActiveTool] = useState<'breathing' | 'diary' | null>(null);
    const [combatLog, setCombatLog] = useState<string[]>(["L'Ombra apareix!"]);
    const [victoryProcessed, setVictoryProcessed] = useState(false);

    // Boss Attack Logic
    useEffect(() => {
        if (turn === 'boss' && bossHp > 0) {
            const timer = setTimeout(() => {
                const damage = Math.floor(Math.random() * 10) + 5;
                setPlayerHp(prev => Math.max(0, prev - damage));
                addLog(`L'Ombra t'ataca! -${damage} HP`);
                setTurn('player');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [turn, bossHp]);

    // Check Victory
    useEffect(() => {
        if (bossHp <= 0 && !victoryProcessed) {
            setVictoryProcessed(true);
            setTurn('victory');
            addLog("L'Ombra es dissol! Has guanyat!");
            onAddXp(200); // Big reward
            setTimeout(onDefeat, 4000); // Auto-close after celebration
        }
    }, [bossHp, onDefeat, onAddXp, victoryProcessed]);

    const addLog = (msg: string) => setCombatLog(prev => [msg, ...prev].slice(0, 3));

    const handleAttack = (type: 'breathing' | 'diary') => {
        setActiveTool(type);
    };

    const handleToolComplete = (damage: number, message: string) => {
        setActiveTool(null);
        setBossHp(prev => Math.max(0, prev - damage));
        addLog(message);
        setTurn('boss');
    };

    // Render "The Shadow" (Visual)
    const BossSprite = () => (
        <motion.div
            animate={{
                y: [0, -20, 0],
                scale: [1, 1.05, 1],
                filter: ["brightness(1)", "brightness(1.5) hue-rotate(90deg)", "brightness(1)"]
            }}
            transition={{ duration: 3, repeat: Infinity, type: "tween" }}
            className="w-64 h-64 relative mx-auto"
        >
            <div className="absolute inset-0 bg-purple-900 rounded-full blur-[80px] opacity-60"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Skull size={120} className="text-purple-950 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
            </div>
            {/* Eyes */}
            <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute top-1/3 left-1/3 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_red]"
            ></motion.div>
            <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.1 }}
                className="absolute top-1/3 right-1/3 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_red]"
            ></motion.div>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
            </div>

            {/* HEADER: Health Bars + Exit */}
            <button
                onClick={onEscape}
                className="absolute top-4 right-4 z-50 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur transition-colors border border-slate-600"
                title="Fugir del combat"
            >
                <span className="sr-only">Sortir</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="w-full max-w-2xl bg-slate-800/80 backdrop-blur rounded-2xl p-4 mb-8 flex justify-between items-center border border-slate-700 relative z-10 mt-12 md:mt-0">
                {/* Player */}
                <div className="flex-1 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="text-red-500" fill="currentColor" size={20} />
                        <span className="font-bold text-white">Heroi (Nivell {userLevel})</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${playerHp}%` }}
                            className="h-full bg-red-500"
                        />
                    </div>
                    <span className="text-xs text-slate-400">{playerHp}/100</span>
                </div>

                {/* VS */}
                <div className="px-4 font-black text-2xl text-slate-500 italic">VS</div>

                {/* Boss */}
                <div className="flex-1 ml-4 text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                        <span className="font-bold text-purple-400">L'Ombra (Ansietat)</span>
                        <Skull className="text-purple-500" fill="currentColor" size={20} />
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                            className="h-full bg-purple-600 absolute right-0 top-0 bottom-0"
                            style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs text-slate-400">{Math.max(0, bossHp)}/{maxBossHp}</span>
                </div>
            </div>

            {/* BATTLEFIELD */}
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-4xl relative z-10">
                <AnimatePresence mode="wait">
                    {turn === 'victory' ? (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] mb-4">VICTÒRIA!</h1>
                            <p className="text-2xl text-white">Has purificat l'Ombra.</p>
                            <div className="mt-8 text-4xl animate-bounce">🛡️ +200 XP</div>
                        </motion.div>
                    ) : (
                        <BossSprite />
                    )}
                </AnimatePresence>

                {/* Combat Log */}
                <div className="mt-8 h-24 flex flex-col items-center justify-end space-y-2 pointer-events-none w-full">
                    <AnimatePresence>
                        {combatLog.map((log, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1 - i * 0.3, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-white font-bold text-lg bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm text-center"
                            >
                                {log}
                            </motion.p>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* CONTROLS */}
            {!activeTool && turn !== 'victory' && (
                <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-20 pb-8">
                    <button
                        onClick={() => handleAttack('breathing')}
                        disabled={turn !== 'player'}
                        className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 p-6 rounded-2xl shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:grayscale"
                    >
                        <Wind size={40} className="text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white font-bold text-xl">Alè de Calma</span>
                        <span className="text-blue-100 text-xs uppercase font-bold tracking-widest">Atac Màgic • 40 Dany</span>
                    </button>

                    <button
                        onClick={() => handleAttack('diary')}
                        disabled={turn !== 'player'}
                        className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 p-6 rounded-2xl shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:grayscale"
                    >
                        <Shield size={40} className="text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white font-bold text-xl">Escut de Realitat</span>
                        <span className="text-orange-100 text-xs uppercase font-bold tracking-widest">Defensa • 25 Dany</span>
                    </button>
                </div>
            )}

            {/* TOOLS OVERLAYS */}
            {activeTool === 'breathing' && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
                    {/* Simplified Wrapper for Breathing to catch completion */}
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => setActiveTool(null)}
                            className="absolute -top-12 right-0 text-white font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            Cancel·lar
                        </button>
                        <BreathingExercise
                            onClose={() => handleToolComplete(40, "Respiració completada! Atac CRÍTIC!")}
                            onAddXp={() => { }}
                        />
                    </div>
                </div>
            )}

            {activeTool === 'diary' && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative animate-fadeIn">
                        <button
                            onClick={() => setActiveTool(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield className="text-orange-500" />
                            Escut de Realitat
                        </h3>
                        <p className="text-slate-600 mb-6">Escriu un pensament positiu per desviar el cop de l'Ombra.</p>

                        <textarea
                            className="w-full p-4 border border-slate-200 rounded-xl mb-4 h-32 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                            placeholder="Sóc capaç de..."
                        ></textarea>

                        <button
                            onClick={() => handleToolComplete(25, "La realitat et protegeix! Cop bloquejat.")}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
                        >
                            Activar Escut
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
