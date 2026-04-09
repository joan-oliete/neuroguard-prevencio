

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Play, Sparkles } from 'lucide-react';
import { getRandomScenario } from '../../../data/staticRoleplayData';
import { RoleplayScenario } from '../../../types';

// Assets Imports
import bgBar from '../../../assets/game/bg_bar.png';
import bgPark from '../../../assets/game/bg_park.png';
import bgRoom from '../../../assets/game/bg_gamer_room.png';
import charFriend from '../../../assets/game/char_friend.png';
import charDealer from '../../../assets/game/char_dealer.png';

interface SocialSimulationProps {
    topic?: string;
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const SocialSimulation: React.FC<SocialSimulationProps> = ({ topic, onExit, onScoreUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
    const [feedback, setFeedback] = useState<{ text: string; score: number } | null>(null);
    const [visualState, setVisualState] = useState({ bg: bgBar, char: charFriend, emotion: 'neutral' });

    // Asset Map
    const backgrounds: any = { 'bg_bar': bgBar, 'bg_park': bgPark, 'bg_gamer_room': bgRoom };
    const characters: any = { 'char_friend': charFriend, 'char_dealer': charDealer };

    const startRoleplay = async () => {
        setLoading(true);
        setFeedback(null);
        setScenario(null);

        // Simulate "Level Loading"
        const promptTopic = topic || "Apostes Esportives";
        const data = getRandomScenario(promptTopic);

        // Preload assets logic
        const loadedBg = backgrounds[data.backgroundId || 'bg_bar'] || bgBar;
        const loadedChar = characters[data.characterId || 'char_friend'] || charFriend;

        // Artificial delay for dramatic effect
        setTimeout(() => {
            setScenario(data);
            setVisualState({ bg: loadedBg, char: loadedChar, emotion: data.emotion || 'neutral' });
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        startRoleplay();
    }, [topic]);

    const handleOptionSelect = (optionIndex: number) => {
        if (!scenario) return;
        const selected = scenario.options[optionIndex];
        setFeedback({ text: selected.feedback, score: selected.score_impact });
        onScoreUpdate(selected.score_impact);
    };

    return (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl max-w-4xl mx-auto border-4 border-slate-900 bg-black aspect-video flex flex-col">

            {/* --- GAME VIEWPORT --- */}
            <div className="relative flex-1 overflow-hidden group">
                {/* 1. Background Layer */}
                <div className="absolute inset-0 bg-slate-900">
                    <img
                        src={visualState.bg}
                        alt="Background"
                        className={`w-full h-full object-cover transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                </div>

                {/* 2. Character Layer */}
                {!loading && scenario && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[90%] w-auto z-10 transition-transform duration-700 animate-slideInEffect origin-bottom">
                        <img
                            src={visualState.char}
                            alt="Character"
                            className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                )}

                {/* Loading Screen Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-brand-400 font-mono text-sm tracking-[0.2em] animate-pulse">CARREGANT ESCENARI...</p>
                    </div>
                )}

                {/* 3. Feedback Overlay (Result) */}
                {feedback && (
                    <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fadeIn text-center">
                        <div className={`mb-6 p-4 rounded-full border-4 ${feedback.score > 0 ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-500'} shadow-[0_0_50px_currentColor]`}>
                            {feedback.score > 0 ? <CheckCircle size={64} strokeWidth={3} /> : <XCircle size={64} strokeWidth={3} />}
                        </div>

                        <h2 className={`text-4xl font-black italic uppercase mb-2 ${feedback.score > 0 ? 'text-green-400' : 'text-red-500'}`}>
                            {feedback.score > 0 ? 'Nivell Superat!' : 'Recaiguda...'}
                        </h2>

                        <div className="text-white text-xl font-medium max-w-lg mb-8 leading-relaxed">
                            "{feedback.text}"
                        </div>

                        <div className="flex gap-4">
                            <button onClick={onExit} className="px-6 py-3 rounded-xl font-bold border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                Sortir
                            </button>
                            <button onClick={startRoleplay} className="px-8 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-500 hover:scale-105 transition-all shadow-lg hover:shadow-brand-500/50 flex items-center gap-2">
                                <Play size={20} fill="currentColor" /> Següent Repte
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- UI LAYER (DIALOGUE BOX) --- */}
            {!loading && scenario && !feedback && (
                <div className="bg-slate-900 border-t-4 border-brand-900 p-6 z-20 h-[280px] flex flex-col relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

                    {/* NPC Name Tag */}
                    <div className="absolute -top-5 left-8 bg-brand-600 text-white font-bold px-6 py-2 rounded-t-xl border-t border-x border-white/20 shadow-lg text-sm tracking-widest uppercase">
                        {scenario.characterId === 'char_dealer' ? '???' : 'Amic'}
                    </div>

                    {/* NPC Text */}
                    <div className="mb-6">
                        <p className="text-white text-lg md:text-xl font-medium leading-relaxed font-sans drop-shadow-md">
                            <span className="text-brand-400 font-bold mr-2">Says:</span>
                            "{scenario.npc_dialogue}"
                        </p>
                    </div>

                    {/* Choice Grid */}
                    <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                        {scenario.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className="group w-full text-left p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-brand-900/50 hover:border-brand-500 transition-all duration-200 flex items-center gap-4 hover:translate-x-1"
                            >
                                <div className="w-8 h-8 rounded bg-slate-700 group-hover:bg-brand-500 flex items-center justify-center text-white font-bold text-sm shrink-0 transition-colors">
                                    {idx + 1}
                                </div>
                                <span className="text-slate-300 group-hover:text-white font-medium text-sm md:text-base">{opt.text}</span>
                            </button>
                        ))}
                    </div>

                    {/* Exit Button Absolute */}
                    <button
                        onClick={onExit}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        title="Sortir del joc"
                    >
                        <XCircle size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};
