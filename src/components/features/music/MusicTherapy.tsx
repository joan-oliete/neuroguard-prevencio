import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, AlertTriangle, Music, Sliders } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { Prompt } from './utils/types';
import { WeightKnob } from './WeightKnob';
import { useAuth } from '../../../context/AuthContext';
import { DEFAULT_PROMPTS } from '../../../data/musicPrompts';
import { useGameConfig } from '../../../context/GameConfigContext';

export const MusicTherapy: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [helper, setHelper] = useState<LiveMusicHelper | null>(null);
    const [prompts, setPrompts] = useState<Map<string, Prompt>>(new Map());
    const [playbackState, setPlaybackState] = useState<'stopped' | 'playing' | 'paused' | 'loading'>('stopped');
    const [error, setError] = useState<string | null>(null);

    const { config } = useGameConfig();
    const initRef = useRef(false);

    // Sync with Remote Config
    useEffect(() => {
        if (prompts.size === 0) return;

        let changed = false;
        const next = new Map(prompts);
        const remoteWeights = config.promptDj?.weights || {};

        // Only update if remote config is different from local state (and remote exists)
        // This allows therapist to override, but we need to be careful not to lock user out if we sync back.
        // For now, we only read One-Way from Config -> App (Therapist tunes App).

        Object.entries(remoteWeights).forEach(([id, weight]) => {
            const p = next.get(id);
            // We apply the weight if it exists in our prompts
            if (p && Math.abs(p.weight - weight) > 0.01) { // Epsilon check
                next.set(id, { ...p, weight });
                changed = true;
            }
        });

        if (changed) {
            setPrompts(next);
        }
    }, [config, prompts.size]); // Don't depend on 'prompts' content to avoid loop, just size check or similar. 
    // Actually, we need 'next.get(id)' so we need access to current prompts. 
    // safest is to use functional state update in effect? 
    // But config is external. 
    // Let's rely on config changes triggering this.

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            setError("API Key not found. Please set VITE_API_KEY.");
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });
            const musicHelper = new LiveMusicHelper(ai, 'lyria-realtime-exp');

            const initialMap = new Map<string, Prompt>();

            // Initialize from Constants
            DEFAULT_PROMPTS.forEach((p, i) => {
                initialMap.set(p.id, {
                    promptId: p.id,
                    text: p.text,
                    color: p.color,
                    weight: 0,
                    cc: i
                });
            });

            // Fallback: If no weights in config, activate random ones
            const remoteWeights = config.promptDj?.weights || {};
            const hasActiveWeights = Object.values(remoteWeights).some(w => w > 0);

            if (!hasActiveWeights) {
                const startOnIds = [...DEFAULT_PROMPTS].sort(() => Math.random() - 0.5).slice(0, 3).map(p => p.id);
                startOnIds.forEach(id => {
                    const p = initialMap.get(id);
                    if (p) {
                        initialMap.set(id, { ...p, weight: 1 });
                    }
                });
            } else {
                // Apply config weights logic handled by effect, but initialMap needs them too to avoid glitch
                Object.entries(remoteWeights).forEach(([id, weight]) => {
                    const p = initialMap.get(id);
                    if (p) initialMap.set(id, { ...p, weight });
                });
            }

            setPrompts(initialMap);
            setHelper(musicHelper);

            musicHelper.addEventListener('playback-state-changed', (e: any) => {
                setPlaybackState(e.detail);
            });

            musicHelper.addEventListener('error', (e: any) => {
                setError(e.detail);
                setPlaybackState('stopped');
            });

        } catch (e: any) {
            setError("Failed to initialize Music AI: " + e.message);
        }

        return () => {
            if (helper) helper.stop();
        };
    }, []);

    // Effect to update helper when prompts change
    useEffect(() => {
        if (!helper) return;
        helper.setWeightedPrompts(prompts);
    }, [prompts, helper]);

    const handleWeightChange = (id: string, newWeight: number) => {
        setPrompts(prev => {
            const next = new Map(prev);
            const p = next.get(id);
            if (p) {
                next.set(id, { ...p, weight: newWeight });
            }
            return next;
        });
        // Note: Not syncing back to config to avoid write-loops/spam. 
        // User changes are local temporary overrides until Therapist changes config again.
    };

    const handlePlayPause = () => {
        if (!helper) return;
        helper.playPause();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-24 font-mono relative overflow-hidden flex flex-col items-center justify-center">

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent">
                <div className="flex items-center gap-3">
                    <Music className="text-brand-400" />
                    <h1 className="text-xl font-bold tracking-wider">NEURO SOUNDLAB</h1>
                </div>
                <button onClick={onExit} className="text-slate-400 hover:text-white uppercase text-xs tracking-widest border border-slate-700 px-4 py-2 rounded">
                    Exit Lab
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md max-w-md text-center">
                    <AlertTriangle className="mx-auto mb-2" />
                    <p className="font-bold mb-1">System Error</p>
                    <p className="text-xs opacity-80">{error}</p>
                    {error.includes("404") && (
                        <p className="mt-2 text-[10px] bg-black/30 p-2 rounded">
                            Your API Key might not have access to 'lyria-realtime-exp'.<br />
                            Check Google AI Studio to check model availability.
                        </p>
                    )}
                </div>
            )}

            {/* Main Controller Grid */}
            <div className="grid grid-cols-4 gap-4 w-full max-w-2xl relative z-10 pt-20">
                {Array.from(prompts.values()).map(prompt => (
                    <motion.div
                        key={prompt.promptId}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-4 backdrop-blur-sm hover:bg-slate-800/50 transition-colors"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="relative">
                            <WeightKnob
                                weight={prompt.weight}
                                color={prompt.color}
                                onChange={(w) => handleWeightChange(prompt.promptId, w)}
                            />
                            {/* Visual Glow */}
                            <div
                                className="absolute inset-0 rounded-full opacity-20 pointer-events-none blur-xl transition-all duration-300"
                                style={{
                                    backgroundColor: prompt.weight > 0 ? prompt.color : 'transparent',
                                    transform: `scale(${0.8 + prompt.weight * 0.5})`
                                }}
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 truncate w-full">
                                {prompt.text}
                            </p>
                            <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-100"
                                    style={{
                                        width: `${prompt.weight * 100}%`,
                                        backgroundColor: prompt.color
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transport Controls */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 bg-slate-900/90 backdrop-blur border border-slate-700 px-8 py-4 rounded-full shadow-2xl">
                <button
                    onClick={handlePlayPause}
                    disabled={!!error || playbackState === 'loading'}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${playbackState === 'playing'
                        ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        } disabled:opacity-50 disabled:grayscale text-white`}
                >
                    {playbackState === 'loading' ? (
                        <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
                    ) : playbackState === 'playing' ? (
                        <Pause fill="currentColor" size={24} />
                    ) : (
                        <Play fill="currentColor" size={24} className="ml-1" />
                    )}
                </button>

                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Status</span>
                    <span className={`font-bold ${playbackState === 'playing' ? 'text-emerald-400' :
                        playbackState === 'loading' ? 'text-yellow-400' : 'text-slate-400'
                        }`}>
                        {playbackState.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
        </div>
    );
};
