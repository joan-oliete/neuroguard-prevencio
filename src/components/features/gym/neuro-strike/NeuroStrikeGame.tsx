import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { GameStatus, NoteData } from './types';
import { DEMO_CHART, SONG_URL } from './constants';
import { useMediaPipe } from './hooks/useMediaPipe';
import GameScene from './components/GameScene';
import WebcamPreview from './components/WebcamPreview';
import { Play, RefreshCw, Hand, Sparkles, XCircle, Activity, Zap } from 'lucide-react';

interface NeuroStrikeGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

const NeuroStrikeGame: React.FC<NeuroStrikeGameProps> = ({ onExit, onScoreUpdate }) => {
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.LOADING);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [health, setHealth] = useState(100);

    const audioRef = useRef<HTMLAudioElement>(new Audio(SONG_URL));
    const videoRef = useRef<HTMLVideoElement>(null);

    const { isCameraReady, handPositionsRef, lastResultsRef, error: cameraError } = useMediaPipe(videoRef);

    // Preload Audio
    useEffect(() => {
        audioRef.current.preload = 'auto';
    }, []);

    const handleNoteHit = useCallback((note: NoteData, goodCut: boolean) => {
        let points = 100;
        if (goodCut) points += 50;

        if (navigator.vibrate) {
            navigator.vibrate(goodCut ? 40 : 20);
        }

        setCombo(c => {
            const newCombo = c + 1;
            if (newCombo > 30) setMultiplier(8);
            else if (newCombo > 20) setMultiplier(4);
            else if (newCombo > 10) setMultiplier(2);
            else setMultiplier(1);
            return newCombo;
        });

        const finalPoints = points * multiplier;
        setScore(s => s + finalPoints);
        onScoreUpdate(finalPoints); // Integrate with global score

        setHealth(h => Math.min(100, h + 2));
    }, [multiplier, onScoreUpdate]);

    const handleNoteMiss = useCallback((note: NoteData) => {
        setCombo(0);
        setMultiplier(1);
        setHealth(h => {
            const newHealth = h - 10;
            if (newHealth <= 0) {
                setTimeout(() => endGame(false), 0);
                return 0;
            }
            return newHealth;
        });
        onScoreUpdate(-50);
    }, [onScoreUpdate]);

    const startGame = async () => {
        if (!isCameraReady) return;

        setScore(0);
        setCombo(0);
        setMultiplier(1);
        setHealth(100);

        DEMO_CHART.forEach(n => { n.hit = false; n.missed = false; });

        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                setGameStatus(GameStatus.PLAYING);
            }
        } catch (e) {
            console.error("Audio play failed", e);
            alert("Please click START again (autoplay blocked).");
        }
    };

    const endGame = (victory: boolean) => {
        setGameStatus(victory ? GameStatus.VICTORY : GameStatus.GAME_OVER);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    useEffect(() => {
        if (gameStatus === GameStatus.LOADING && isCameraReady) {
            setGameStatus(GameStatus.IDLE);
        }
    }, [isCameraReady, gameStatus]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, []);

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl font-sans">
            {/* Hidden Video for Processing */}
            <video
                ref={videoRef}
                className="absolute opacity-0 pointer-events-none"
                playsInline
                muted
                autoPlay
                style={{ width: '640px', height: '480px' }}
            />

            {/* 3D Canvas */}
            <Canvas shadows dpr={[1, 2]}>
                <color attach="background" args={['#0f172a']} />
                {gameStatus !== GameStatus.LOADING && (
                    <GameScene
                        gameStatus={gameStatus}
                        audioRef={audioRef}
                        handPositionsRef={handPositionsRef}
                        chart={DEMO_CHART}
                        onNoteHit={handleNoteHit}
                        onNoteMiss={handleNoteMiss}
                        onSongEnd={() => endGame(true)}
                    />
                )}
            </Canvas>
            <Loader />

            {/* Webcam Mini-Map Preview */}
            <WebcamPreview
                videoRef={videoRef}
                resultsRef={lastResultsRef}
                isCameraReady={isCameraReady}
            />

            {/* Exit Button - Always visible */}
            <button
                onClick={onExit}
                className="absolute top-4 right-4 z-50 p-2 bg-slate-800/80 hover:bg-red-600/80 text-white rounded-full transition-colors"
                title="Exit Game"
            >
                <XCircle size={24} />
            </button>

            {/* UI Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">

                {/* HUD (Top) */}
                <div className="flex justify-center items-start text-white w-full mt-2">
                    {/* Health Bar */}
                    <div className="w-1/3 max-w-xs flex flex-col items-center">
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <div
                                className={`h-full transition-all duration-300 ease-out ${health > 50 ? 'bg-green-500' : health > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                style={{ width: `${health}%` }}
                            />
                        </div>
                        <p className="text-[10px] mt-1 opacity-70 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={10} /> Focus Stability
                        </p>
                    </div>
                </div>

                {/* Central Status */}
                <div className="absolute top-16 left-0 right-0 text-center pointer-events-none">
                    <h1 className="text-6xl font-black tracking-wider text-white drop-shadow-lg">
                        {score.toLocaleString()}
                    </h1>
                    <div className={`mt-2 transition-transform duration-100 ${combo > 0 ? 'scale-100' : 'scale-0 opacity-0'}`}>
                        <p className={`text-2xl font-bold flex items-center justify-center gap-2 ${combo > 10 ? 'text-blue-400' : 'text-slate-300'}`}>
                            <Zap className={combo > 10 ? 'fill-blue-400' : ''} size={24} />
                            {combo}x COMBO
                        </p>
                    </div>
                </div>

                {/* Menus (Centered) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">

                    {gameStatus === GameStatus.LOADING && (
                        <div className="bg-slate-900/90 p-10 rounded-3xl flex flex-col items-center border border-slate-700 backdrop-blur-md">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-6"></div>
                            <h2 className="text-xl text-white font-bold mb-2">Initializing Neuro-Link</h2>
                            <p className="text-blue-300 text-sm">{!isCameraReady ? "Calibrating Sensors..." : "Loading Assets..."}</p>
                            {cameraError && <p className="text-red-500 mt-4 max-w-xs text-center text-xs">{cameraError}</p>}
                        </div>
                    )}

                    {gameStatus === GameStatus.IDLE && (
                        <div className="bg-slate-900/90 p-12 rounded-3xl text-center border border-slate-700 backdrop-blur-xl max-w-lg shadow-2xl">
                            <div className="mb-6 flex justify-center">
                                <div className="p-4 bg-blue-500/10 rounded-full">
                                    <Sparkles className="w-12 h-12 text-blue-400" />
                                </div>
                            </div>
                            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
                                NEURO <span className="text-blue-500">STRIKE</span>
                            </h1>
                            <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs">Rhythm Therapy Module</p>

                            <div className="space-y-4 text-slate-300 mb-8 text-sm">
                                <p className="flex items-center justify-center gap-2">
                                    <Hand className="w-4 h-4 text-blue-400" />
                                    <span>Ensure your hands are visible.</span>
                                </p>
                                <p>Slash through the <span className="text-white font-bold">Addiction Triggers</span>.</p>
                                <div className="flex justify-center gap-4 text-xs mt-4">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> LEFT Hand</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> RIGHT Hand</span>
                                </div>
                            </div>

                            {!isCameraReady ? (
                                <div className="flex items-center justify-center text-red-400 gap-2 bg-red-900/20 p-4 rounded-xl text-sm animate-pulse">
                                    Waiting for Camera Stream...
                                </div>
                            ) : (
                                <button
                                    onClick={startGame}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xl font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
                                >
                                    <Play fill="currentColor" size={24} /> START SESSION
                                </button>
                            )}
                        </div>
                    )}

                    {(gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.VICTORY) && (
                        <div className="bg-slate-900/95 p-12 rounded-3xl text-center border border-slate-700 backdrop-blur-xl shadow-2xl">
                            <h2 className={`text-5xl font-bold mb-2 ${gameStatus === GameStatus.VICTORY ? 'text-green-400' : 'text-red-500'}`}>
                                {gameStatus === GameStatus.VICTORY ? "SESSION COMPLETE" : "SESSION FAILED"}
                            </h2>
                            <p className="text-slate-400 mb-8 text-lg">Focus Stability Score: <span className="text-white font-bold">{score.toLocaleString()}</span></p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setGameStatus(GameStatus.IDLE)}
                                    className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
                                >
                                    <RefreshCw size={20} /> Retry
                                </button>
                                <button
                                    onClick={onExit}
                                    className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-colors font-bold"
                                >
                                    Finish
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NeuroStrikeGame;
