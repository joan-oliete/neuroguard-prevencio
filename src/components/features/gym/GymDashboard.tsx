import React, { useState } from 'react';
import { NeuroDetective } from './NeuroDetective';
import { MemoryMatrix } from './MemoryMatrix';
import { ImpulseGame } from './ImpulseGame';
import NeuroStrikeGame from './neuro-strike/NeuroStrikeGame';
import { NeuroFlightGame } from './neuro-flight/NeuroFlightGame';
import { Brain, Image as ImageIcon, Activity, ArrowLeft, Trophy, Zap, Sword, Wind, Search } from 'lucide-react';

interface GymDashboardProps {
    onBack: () => void;
    onUpdateStats: (xp: number) => void;
}

type GameType = 'dashboard' | 'detective' | 'memory' | 'flight' | 'impulse' | 'neuro-strike';

export const GymDashboard: React.FC<GymDashboardProps> = ({ onBack, onUpdateStats }) => {
    const [activeGame, setActiveGame] = useState<GameType>('dashboard');

    const handleScoreUpdate = (points: number) => {
        onUpdateStats(points);
    };

    if (activeGame === 'detective') {
        return <NeuroDetective onExit={() => setActiveGame('dashboard')} onScoreUpdate={handleScoreUpdate} />;
    }

    if (activeGame === 'memory') {
        return <MemoryMatrix onExit={() => setActiveGame('dashboard')} onScoreUpdate={handleScoreUpdate} />;
    }

    if (activeGame === 'flight') {
        return <NeuroFlightGame onExit={() => setActiveGame('dashboard')} />;
    }

    if (activeGame === 'impulse') {
        return <ImpulseGame onExit={() => setActiveGame('dashboard')} onScoreUpdate={handleScoreUpdate} />;
    }

    if (activeGame === 'neuro-strike') {
        return <NeuroStrikeGame onExit={() => setActiveGame('dashboard')} onScoreUpdate={handleScoreUpdate} />;
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Gimnàs Mental</h2>
                        <p className="text-slate-500">Entrena el teu cervell amb reptes diaris</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-brand-50 text-brand-700 rounded-lg font-bold text-sm flex items-center gap-2">
                    <Trophy size={16} />
                    <span>Nivell Pro disponible</span>
                </div>
            </div>

            {/* Game Selection Grid */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Card 0: Neuro-Strike */}
                <div
                    onClick={() => setActiveGame('neuro-strike')}
                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 col-span-1 md:col-span-2"
                >
                    <div className="absolute inset-0 bg-slate-900 group-hover:scale-105 transition-transform duration-700">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/30">
                                    <Sword size={28} />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-2 tracking-tighter italic">
                                    NEURO <span className="text-blue-500">STRIKE</span>
                                </h3>
                                <p className="text-blue-200/80 text-lg mb-4 max-w-md">
                                    Trenca el cicle visualitzant i eliminant els teus "triggers". Fes servir les mans per tallar els bucles addictius.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full animate-pulse">NOU</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-bold text-white/40 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Zap size={12} /> Ritme</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Activity size={12} /> Coordinació</span>
                            <span>•</span>
                            <span>Càmera Necessària</span>
                        </div>
                    </div>
                </div>

                {/* Card 1: Neuro-Detective */}
                <div
                    onClick={() => setActiveGame('detective')}
                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200"
                >
                    <div className="absolute inset-0 bg-slate-900 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 50%)' }}></div>

                    <div className="absolute top-4 right-4">
                        <Brain size={120} className="text-white/5 rotate-12" />
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-white group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <Brain size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Neuro Detective</h3>
                        <p className="text-white/60 text-xs mb-4">Utilitza la deducció lògica o la IA per endevinar l'estat mental.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                            <span>Lògica</span>
                            <span>•</span>
                            <span>Deducció</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Memory Matrix */}
                <div
                    onClick={() => setActiveGame('memory')}
                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200"
                >
                    <div className="absolute inset-0 bg-slate-900 group-hover:scale-110 transition-transform duration-700">
                        <img src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Memory" />
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-white group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <ImageIcon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Memory Matrix</h3>
                        <p className="text-white/60 text-xs mb-4">Recorda patrons visuals d'alta qualitat.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                            <span>Memòria Visual</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Neuro-Flight (REPLACES FOCUS FLOW) */}
                <div
                    onClick={() => setActiveGame('flight')}
                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200"
                >
                    <div className="absolute inset-0 bg-slate-900 group-hover:scale-110 transition-transform duration-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-blue-900 to-black opacity-80"></div>
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-white group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <Wind size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Neuro-Flight</h3>
                        <p className="text-white/60 text-xs mb-4">Navega per un paisatge fractal relaxant.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                            <span>Flow State</span>
                        </div>
                    </div>
                </div>

                {/* Card 4: Impulse Protocol */}
                <div
                    onClick={() => setActiveGame('impulse')}
                    className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200"
                >
                    <div className="absolute inset-0 bg-slate-900 group-hover:scale-110 transition-transform duration-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-black opacity-90"></div>
                    </div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-white group-hover:bg-purple-400 group-hover:text-black transition-colors">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Impulse Protocol</h3>
                        <p className="text-white/60 text-xs mb-4">Entrena la teva inhibició.</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                            <span>Autocontrol</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
