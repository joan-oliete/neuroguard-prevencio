import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Heart, Wind, Users, ArrowLeft, Trophy } from 'lucide-react';
import { UserProfile } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
// import { getUserContext } from '../../../services/contextAggregator'; // Optional dynamic scaling

interface BossBattleProps {
    onBack: () => void;
    onComplete: (xp: number) => void;
}

type TurnState = 'player' | 'boss' | 'win' | 'lose';

interface CombatLog {
    id: number;
    text: string;
    type: 'player' | 'boss' | 'info';
}

export const BossBattle: React.FC<BossBattleProps> = ({ onBack, onComplete }) => {
    const { userProfile } = useAuth();

    // Stats
    const [playerHp, setPlayerHp] = useState(100);
    const [maxPlayerHp, setMaxPlayerHp] = useState(100);
    const [bossHp, setBossHp] = useState(500);
    const [maxBossHp, setMaxBossHp] = useState(500);

    // State
    const [turn, setTurn] = useState<TurnState>('player');
    const [logs, setLogs] = useState<CombatLog[]>([]);
    const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

    // Effects
    const [shake, setShake] = useState(0);

    // Initialization
    useEffect(() => {
        if (userProfile) {
            // Scale Player
            const hp = 100 + (userProfile.level * 10) + (userProfile.streak * 5);
            setPlayerHp(hp);
            setMaxPlayerHp(hp);

            // Scale Boss
            const mHp = 300 + (userProfile.level * 50);
            setBossHp(mHp);
            setMaxBossHp(mHp);

            addLog("L'Ombra apareix! Utilitza les teves eines psicològiques per vèncer-la.", 'info');
        }
    }, [userProfile]);

    // Turn Logic
    useEffect(() => {
        if (turn === 'boss') {
            const timer = setTimeout(bossTurn, 1500);
            return () => clearTimeout(timer);
        }
    }, [turn]);

    const addLog = (text: string, type: CombatLog['type']) => {
        setLogs(prev => [{ id: Date.now(), text, type }, ...prev].slice(0, 5));
    };

    const handlePlayerAction = (action: string) => {
        if (turn !== 'player') return;

        let dmg = 0;
        let heal = 0;
        let logMsg = "";
        let cd = 0;

        switch (action) {
            case 'reframe':
                // Basic Attack (Reestructuració Cognitiva)
                dmg = Math.floor(Math.random() * 20) + 15;
                logMsg = `Has reestructurat un pensament negatiu! (-${dmg} a l'Ombra)`;
                break;
            case 'breath':
                // Heal (Respiració)
                heal = Math.floor(Math.random() * 15) + 10;
                logMsg = `Respires profundament i recuperes calma. (+${heal} HP)`;
                cd = 2;
                break;
            case 'social':
                // Special (Suport Social)
                if (cooldowns['social'] > 0) return;
                dmg = 50;
                logMsg = `Truques a un amic. L'Ombra es debilita per la connexió! (-${dmg})`;
                cd = 4;
                break;
        }

        // Apply effects
        if (dmg > 0) {
            setBossHp(h => Math.max(0, h - dmg));
            setShake(5);
            setTimeout(() => setShake(0), 200);
        }
        if (heal > 0) {
            setPlayerHp(h => Math.min(maxPlayerHp, h + heal));
        }

        // Cooldowns
        const nextCds = { ...cooldowns };
        Object.keys(nextCds).forEach(k => { if (nextCds[k] > 0) nextCds[k]--; });
        if (cd > 0) nextCds[action] = cd;
        setCooldowns(nextCds);

        addLog(logMsg, 'player');

        // Check Win
        if (bossHp - dmg <= 0) {
            setTurn('win');
        } else {
            setTurn('boss');
        }
    };

    const bossTurn = () => {
        // Boss Logic
        const attacks = [
            { name: "Dubte", dmg: 10, msg: "L'Ombra et xiuxiueja dubtes..." },
            { name: "Ansietat", dmg: 20, msg: "Sents una pressió al pit..." },
            { name: "Apatia", dmg: 5, msg: "L'Ombra intenta avorrir-te." }
        ];

        const atk = attacks[Math.floor(Math.random() * attacks.length)];
        // Crit chance based on anxiety? (Simulated)
        const isCrit = Math.random() > 0.8;
        const damage = isCrit ? atk.dmg * 1.5 : atk.dmg;

        setPlayerHp(h => Math.max(0, h - damage));
        addLog(`${atk.msg} (-${damage.toFixed(0)} HP)`, 'boss');

        if (playerHp - damage <= 0) {
            setTurn('lose');
        } else {
            setTurn('player');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden text-white font-sans">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-purple-900/20 blur-[100px]"></div>
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-red-900/10 blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="z-10 p-4 flex justify-between items-center">
                <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft /> Abandonar
                </button>
                <div className="text-sm font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    Torn: <span className={turn === 'player' ? "text-cyan-400" : "text-red-400 uppercase"}>{turn}</span>
                </div>
            </div>

            {/* Combat Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-4xl mx-auto w-full px-4 gap-8">

                {/* BOSS */}
                <div className="w-full flex justify-center flex-col items-center">
                    <motion.div
                        animate={{ x: shake ? [-5, 5, -5, 5, 0] : 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                    >
                        {/* Placeholder Monster */}
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-slate-800 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] border-4 border-slate-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-black opacity-80 animate-pulse"></div>
                            <Zap size={80} className="text-purple-500 relative z-10 filter drop-shadow-[0_0_10px_#a855f7]" />
                        </div>
                        {/* HP Bar */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-4 bg-slate-800 rounded-full border border-slate-600 overflow-hidden">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-red-500"
                            />
                        </div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center w-full">
                            <h2 className="text-2xl font-black text-purple-200 tracking-wider">L'OMBRA</h2>
                            <p className="text-xs text-purple-400 font-mono">{bossHp}/{maxBossHp} HP</p>
                        </div>
                    </motion.div>
                </div>

                {/* VS LOGS */}
                <div className="h-32 w-full max-w-md bg-black/40 backdrop-blur-sm rounded-xl p-4 overflow-y-auto border border-slate-700/50 space-y-2">
                    <AnimatePresence>
                        {logs.map(log => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-sm ${log.type === 'player' ? 'text-cyan-300' : log.type === 'boss' ? 'text-red-300' : 'text-slate-400 italic'}`}
                            >
                                {log.type === 'player' && '> '} {log.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* PLAYER */}
                <div className="w-full">
                    <div className="flex justify-between items-end mb-4 px-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-cyan-900/50 rounded-xl border border-cyan-500/30 flex items-center justify-center">
                                <Shield className="text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">{userProfile?.name || 'Heroi'}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-cyan-500"
                                            animate={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-cyan-400">{playerHp}/{maxPlayerHp}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTROLS */}
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            disabled={turn !== 'player'}
                            onClick={() => handlePlayerAction('reframe')}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                        >
                            <Zap className="text-yellow-400" />
                            <span className="font-bold text-xs uppercase">Reestructurar</span>
                        </button>

                        <button
                            disabled={turn !== 'player' || (cooldowns['breath'] || 0) > 0}
                            onClick={() => handlePlayerAction('breath')}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 p-4 rounded-xl flex flex-col items-center gap-2 transition-all relative"
                        >
                            <Wind className="text-emerald-400" />
                            <span className="font-bold text-xs uppercase">Respirar</span>
                            {cooldowns['breath'] ? (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl text-xl font-bold">{cooldowns['breath']}</div>
                            ) : null}
                        </button>

                        <button
                            disabled={turn !== 'player' || (cooldowns['social'] || 0) > 0}
                            onClick={() => handlePlayerAction('social')}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-slate-950 active:border-b-0 active:translate-y-1 p-4 rounded-xl flex flex-col items-center gap-2 transition-all relative"
                        >
                            <Users className="text-blue-400" />
                            <span className="font-bold text-xs uppercase">Demanar Ajuda</span>
                            {cooldowns['social'] ? (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl text-xl font-bold">{cooldowns['social']}</div>
                            ) : null}
                        </button>
                    </div>
                </div>
            </div>

            {/* OVERLAYS */}
            <AnimatePresence>
                {turn === 'win' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-md"
                    >
                        <div className="text-center p-8 bg-slate-900 border border-purple-500 rounded-3xl shadow-2xl max-w-sm mx-4">
                            <Trophy size={64} className="text-yellow-400 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-black text-white mb-2">VICTÒRIA!</h2>
                            <p className="text-slate-400 mb-6">Has dominat els teus pensaments intrusius.</p>
                            <button
                                onClick={() => onComplete(500)}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Reclamar 500 XP
                            </button>
                        </div>
                    </motion.div>
                )}

                {turn === 'lose' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-md"
                    >
                        <div className="text-center p-8 bg-slate-900 border border-red-900 rounded-3xl shadow-2xl max-w-sm mx-4">
                            <Heart size={64} className="text-slate-600 mx-auto mb-4" />
                            <h2 className="text-3xl font-black text-white mb-2"> derrotat...</h2>
                            <p className="text-slate-400 mb-6">L'Ombra ha guanyat avui. Però demà pots tornar-ho a provar.</p>
                            <button
                                onClick={onBack}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Tornar a la Base
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
