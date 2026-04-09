import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Wind, Play, Trophy, Sparkles, Star, ArrowRight, Gamepad2, Music } from 'lucide-react';
import { NEURO_STORY } from '../../../data/storyData';
import { ImpulseGame } from '../gym/ImpulseGame'; // Ensure this path is correct
import { Leaderboard } from '../game/Leaderboard';
import { MusicTherapy } from '../music/MusicTherapy';

interface GameCenterProps {
    onNavigate: (gameId: string) => void;
    onBack: () => void;
    hasDailyDiary: boolean;
    userLevel: number;
    onScoreUpdate: (points: number) => void;
}

export const GameCenter: React.FC<GameCenterProps> = ({ onNavigate, onBack, hasDailyDiary, userLevel, onScoreUpdate }) => {
    const [activeTab, setActiveTab] = useState<'games' | 'leaderboard'>('games');
    const [activeGameId, setActiveGameId] = useState<string | null>(null);

    const games = [
        {
            id: 'impulse_control', // Changed from 'runner' to match ImpulseGame for now, or keep 'runner' if ImpulseGame is separate?
            // User's ImpulseGame seemed to be "Impulse Protocol". 
            // In the previous view of ImpulseGame (Step 184), it didn't seem to have a specific ID export, but logic uses 'leaderboards/impulse_control/scores'.
            // Let's stick to the existing IDs if they map to routes, OR map them to components.
            // The previous GameCenter used 'runner', 'puzzle', 'defense', 'breathing'.
            // But ImpulseGame is the one with leaderboard. Let's add Impulse Control as a Featured or replace 'runner'.
            title: 'Protocol d\'Impuls',
            description: 'Entrena la teva capacitat d\'inhibició via Neural-Link.',
            icon: Zap,
            color: 'from-emerald-500 to-cyan-500',
            difficulty: 'Normal',
            xp: '50-150 XP',
            locked: false,
            component: ImpulseGame
        },
        {
            id: 'music_therapy',
            title: 'Neuro SoundLab',
            description: 'Experimenta amb freqüències sonores generades per IA. Redueix l\'ansietat creant música.',
            icon: Music,
            color: 'from-violet-500 to-fuchsia-500',
            difficulty: 'Relaxant',
            xp: 'Creativitat',
            locked: false,
            component: MusicTherapy
        },
        {
            id: 'runner',
            title: 'Neuro-Runner 2077',
            description: 'Flueix a través dels obstacles. Esquiva el cortisol.',
            icon: Wind,
            color: 'from-cyan-500 to-blue-500',
            difficulty: 'Difícil',
            xp: '100 XP',
            locked: false
        },
        {
            id: 'puzzle',
            title: 'Zen Garden',
            description: 'Restaura l\'harmonia. Un puzle relaxant.',
            icon: Sparkles,
            color: 'from-emerald-400 to-teal-500',
            difficulty: 'Relaxant',
            xp: '50 XP',
            locked: false
        }
    ];

    const handleGameClick = (game: any) => {
        if (game.locked) return;

        if (game.component) {
            setActiveGameId(game.id);
        } else {
            onNavigate(game.id);
        }
    };

    if (activeGameId) {
        if (activeGameId === 'impulse_control') {
            return <ImpulseGame onExit={() => setActiveGameId(null)} onScoreUpdate={onScoreUpdate} />;
        }
        if (activeGameId === 'music_therapy') {
            return <MusicTherapy onExit={() => setActiveGameId(null)} />;
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 animate-fadeIn pb-24">
            {/* Header */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                <Gamepad2 size={40} className="text-brand-400" />
                                NEURO-ARCADE
                            </h1>
                            <p className="text-slate-400 max-w-lg text-lg">
                                Entrenament cognitiu gamificat. Millora les teves habilitats.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onNavigate('remote-tuner')}
                                className="text-brand-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest border border-brand-900 px-3 py-1 rounded"
                            >
                                Admin / Tuner
                            </button>
                            <button
                                onClick={onBack}
                                className="text-slate-400 hover:text-white transition-colors font-bold text-sm"
                            >
                                Sortir
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setActiveTab('games')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'games' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                        >
                            <span className="flex items-center gap-2"><Gamepad2 size={18} /> Jocs</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                        >
                            <span className="flex items-center gap-2"><Trophy size={18} /> Rànquing Global</span>
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'games' ? (
                <div className="animate-fadeIn">
                    {/* Featured / Impulse Game Card */}
                    <div
                        onClick={() => setActiveGameId('impulse_control')}
                        className="relative h-80 rounded-3xl overflow-hidden cursor-pointer group mb-12 border border-slate-700 shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-between p-12">
                            <div className="max-w-xl z-10">
                                <span className="bg-emerald-500 text-black font-black px-3 py-1 rounded text-xs uppercase tracking-widest mb-4 inline-block">
                                    NOU PROTOCOL
                                </span>
                                <h2 className="text-5xl font-black text-white mb-4 group-hover:scale-105 transition-transform origin-left">
                                    PROTOCOL D'IMPULS
                                </h2>
                                <p className="text-emerald-100 text-lg mb-8 max-w-md">
                                    Entrena la teva inhibició de resposta. Posa a prova els teus reflexos i la teva capacitat de dir "NO".
                                </p>
                                <button className="bg-white text-emerald-900 font-bold px-8 py-3 rounded-full flex items-center gap-2 group-hover:bg-emerald-50 transition-colors">
                                    <Play fill="currentColor" /> INICIAR JOC
                                </button>
                            </div>
                            <div className="relative w-64 h-64 hidden md:block">
                                <Zap size={200} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Trophy className="text-yellow-400" /> Jocs Disponibles
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.filter(g => g.id !== 'impulse_control').map((game, idx) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleGameClick(game)}
                                className={`relative rounded-2xl p-6 border transition-all h-full flex flex-col ${game.locked
                                    ? 'bg-slate-800/50 border-slate-700 opacity-70 cursor-not-allowed'
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <game.icon className="text-white" size={24} />
                                </div>

                                <h4 className="text-xl font-bold text-white mb-2">{game.title}</h4>
                                <p className="text-slate-400 text-sm mb-4 flex-1">{game.description}</p>

                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mt-auto">
                                    <span className={game.locked ? 'text-slate-500' : 'text-slate-300'}>{game.difficulty}</span>
                                    <span className={game.locked ? 'text-slate-600' : 'text-brand-400'}>{game.xp}</span>
                                </div>

                                {game.locked && (
                                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl text-center p-4">
                                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold border border-slate-600 mb-2">
                                            Bloquejat 🔒
                                        </span>
                                        <p className="text-xs text-slate-500">Properament</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Story Codex Section (Preserved) */}
                    <div className="mt-16 border-t border-slate-700 pt-12">
                        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <span className="text-4xl">📜</span> Arxius NeuroGuard (Story Mode)
                        </h3>
                        <div className="space-y-4">
                            {NEURO_STORY.map((chapter) => (
                                <div key={chapter.id} className="p-6 rounded-2xl border bg-slate-800 border-brand-500/30 shadow-lg">
                                    <h4 className="text-xl font-bold text-white">{chapter.title}</h4>
                                    <p className="text-slate-300">{chapter.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <Leaderboard gameId="impulse_control" gameName="Protocol d'Impuls" />
                </div>
            )}
        </div>
    );
};
