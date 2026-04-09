import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, AlertTriangle, Shield, Play } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from '../../../services/firebase';
import targetImg from '../../../assets/images/neuro_target.png';
import trapImg from '../../../assets/images/neuro_trap.png';
import { useAuth } from '../../../context/AuthContext';

interface ImpulseGameProps {
    onExit: () => void;
    onScoreUpdate: (xp: number) => void;
}

type GameState = 'lobby' | 'playing' | 'gameover';
type StimulusType = 'target' | 'trap';

export const ImpulseGame: React.FC<ImpulseGameProps> = ({ onExit, onScoreUpdate }) => {
    const { user, userProfile } = useAuth();
    const [gameState, setGameState] = useState<GameState>('lobby');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [highScore, setHighScore] = useState(0);
    const [ruleInverted, setRuleInverted] = useState(false); // If true, RED is good, GREEN is bad!
    const [activeStimulus, setActiveStimulus] = useState<StimulusType | null>(null);
    const [feedback, setFeedback] = useState<'hit' | 'miss' | 'wrong' | null>(null);

    // Game Loop Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const stimulusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load local high score or global logic
    useEffect(() => {
        if (!user) return;
        const fetchHighScore = async () => {
            const q = query(
                collection(db, 'leaderboards/impulse_control/scores'),
                orderBy('score', 'desc'),
                limit(1)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                setHighScore(snap.docs[0].data().score);
            }
        };
        fetchHighScore();
    }, [user]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setRuleInverted(false);
        scheduleNextStimulus();
    };

    const scheduleNextStimulus = () => {
        if (lives <= 0) return;

        const delay = Math.random() * 1500 + 1000; // 1-2.5s delay
        timerRef.current = setTimeout(() => {
            showStimulus();
        }, delay);
    };

    const showStimulus = () => {
        setFeedback(null);
        // Randomly choose type
        const type = Math.random() > 0.5 ? 'target' : 'trap';
        setActiveStimulus(type);

        // Duration gets shorter as score increases (difficulty)
        const duration = Math.max(800 - score * 10, 400);

        stimulusTimeoutRef.current = setTimeout(() => {
            // If stimulus disappears and it was a TARGET (and normal rules), it's a MISS
            // If inverted rules, TARGET is BAD, so ignoring it is GOOD (no miss)
            if (activeStimulus === 'target' && !ruleInverted) {
                handleMiss();
            } else if (activeStimulus === 'trap' && ruleInverted) {
                handleMiss(); // Inverted: Trap is Good, so missing it is bad
            } else {
                // Correct non-action
                handleSuccessIgnore();
            }
            setActiveStimulus(null);

            // Random Rule Inversion Chance every X turns
            if (Math.random() > 0.8 && score > 5) {
                setRuleInverted(prev => !prev);
            }

            if (lives > 0) scheduleNextStimulus();
        }, duration);
    };

    const handleClick = () => {
        if (!activeStimulus) return;

        // Logic check
        const isTarget = activeStimulus === 'target';
        const isGood = (!ruleInverted && isTarget) || (ruleInverted && !isTarget); // Normal: Green=Good. Inverted: Red=Good.

        if (isGood) {
            // SUCCESS HIT
            const points = ruleInverted ? 20 : 10; // Bonus for inverted
            setScore(s => s + points);
            setFeedback('hit');
            clearTimeout(stimulusTimeoutRef.current!);
            setActiveStimulus(null);
            scheduleNextStimulus();
        } else {
            // WRONG HIT (Impulsivity!)
            handleCrash();
        }
    };

    const handleSuccessIgnore = () => {
        // Did not click a bad thing. Good job.
        // Invisible points? Or just keep going.
    };

    const handleMiss = () => {
        setFeedback('miss');
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) endGame();
            return newLives;
        });
    };

    const handleCrash = () => {
        setFeedback('wrong');
        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) endGame();
            return newLives;
        });
        clearTimeout(stimulusTimeoutRef.current!);
        setActiveStimulus(null);
        if (lives > 1) scheduleNextStimulus();
    };

    const endGame = async () => {
        setGameState('gameover');
        if (score > 0 && user) {
            onScoreUpdate(Math.ceil(score / 5)); // XP Logic
            // Save to Firestore
            try {
                await addDoc(collection(db, 'leaderboards/impulse_control/scores'), {
                    uid: user.uid,
                    name: userProfile?.name || 'Agent',
                    score: score,
                    createdAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Error saving score", e);
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
        };
    }, []);

    // Render Assets Logic
    // Default: Target = Green, Trap = Red
    // Inverted: Target(Visual Green) = Bad, Trap(Visual Red) = Good
    const renderStimulus = () => {
        if (!activeStimulus) return null;
        const isGreenVisual = activeStimulus === 'target';

        return (
            <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="cursor-pointer p-8 rounded-full bg-black/50 border border-white/10 hover:bg-white/10 transition-colors"
                onMouseDown={handleClick}
            >
                <img
                    src={isGreenVisual ? targetImg : trapImg}
                    alt="stimulus"
                    className={`w-48 h-48 object-contain drop-shadow-[0_0_30px_${isGreenVisual ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}]`}
                />
                <p className="text-center font-mono mt-4 text-xs tracking-widest uppercase">
                    {isGreenVisual ? 'SYSTEM_OK' : 'HAZARD_DETECTED'}
                </p>
            </motion.div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 text-emerald-400 font-mono relative overflow-hidden rounded-3xl border border-emerald-900/50">
            {/* Context Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-6 border-b border-emerald-900/50 bg-slate-900/80">
                <button onClick={onExit} className="flex items-center gap-2 hover:text-white transition-colors uppercase text-sm tracking-wider">
                    <ArrowLeft size={16} /> Abort Protocol
                </button>
                <div className="flex gap-6 text-xl font-bold">
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-400" size={20} />
                        <span>SCORE: {score.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                        {Array.from({ length: lives }).map((_, i) => <Shield key={i} size={20} fill="currentColor" />)}
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">

                {/* Rule Display */}
                {gameState === 'playing' && (
                    <motion.div
                        animate={{ backgroundColor: ruleInverted ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.1)' }}
                        className={`absolute top-24 px-6 py-2 rounded border ${ruleInverted ? 'border-red-500 text-red-400' : 'border-emerald-500 text-emerald-400'}`}
                    >
                        <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
                            {ruleInverted ? <AlertTriangle size={16} /> : <Shield size={16} />}
                            {ruleInverted ? 'PROTOCOL INVERTED: TARGET RED' : 'PROTOCOL NORMAL: TARGET GREEN'}
                        </span>
                    </motion.div>
                )}

                {gameState === 'lobby' && (
                    <div className="text-center max-w-md">
                        <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 glitch-text">
                            IMPULSE PROTOCOL
                        </h1>
                        <p className="text-slate-400 mb-8 leading-relaxed">
                            Entrena la teva **Inhibició Cognitiva**.
                            <br /><br />
                            1. <span className="text-emerald-400">VERD</span> = ACTUA
                            <br />
                            2. <span className="text-red-400">VERMELL</span> = STOP
                            <br />
                            3. Si el sistema s'inverteix... adapta't ràpidament.
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 px-12 rounded-sm uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        >
                            Initialize Sequence
                        </button>
                        <p className="mt-8 text-xs text-slate-600">HIGH SCORE: {highScore}</p>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <AnimatePresence mode='wait'>
                            {activeStimulus && renderStimulus()}
                        </AnimatePresence>

                        {/* Feedback Splashes */}
                        <AnimatePresence>
                            {feedback === 'gameover' && <div />}
                            {feedback === 'miss' && (
                                <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 2 }} className="absolute inset-0 border-4 border-red-500 rounded-3xl pointer-events-none" />
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="text-center">
                        <div className="text-6xl mb-4">💀</div>
                        <h2 className="text-4xl font-bold text-white mb-2">SYSTEM FAILURE</h2>
                        <p className="text-xl text-emerald-400 mb-8">FINAL SCORE: {score}</p>
                        <button
                            onClick={startGame}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded border border-slate-600"
                        >
                            RETRY
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
