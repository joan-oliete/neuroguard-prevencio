import React, { useState, useEffect } from 'react';
import { DETECTIVE_CARDS, DetectiveCard, QUESTION_CATEGORIES } from '../../../data/detectiveData';
import { Search, RotateCcw, HelpCircle, CheckCircle, XCircle, Brain } from 'lucide-react';
import { useGenAI } from '../../../hooks/useGenAI';
import { Send, ToggleLeft, ToggleRight, Loader } from 'lucide-react';

interface NeuroDetectiveProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

export const NeuroDetective: React.FC<NeuroDetectiveProps> = ({ onExit, onScoreUpdate }) => {
    const [mysteryCard, setMysteryCard] = useState<DetectiveCard | null>(null);
    const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());
    const [message, setMessage] = useState<string>("Fes una pregunta per començar...");
    const [questionsAsked, setQuestionsAsked] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [victory, setVictory] = useState(false);
    const [smartMode, setSmartMode] = useState(false);
    const [userQuestion, setUserQuestion] = useState("");
    const { isAvailable, analyzeQuestion, loading: aiLoading } = useGenAI();

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const randomCard = DETECTIVE_CARDS[Math.floor(Math.random() * DETECTIVE_CARDS.length)];
        setMysteryCard(randomCard);
        setEliminatedIds(new Set());
        setMessage("He triat un estat mental. Quin és?");
        setQuestionsAsked(0);
        setGameOver(false);
        setVictory(false);
    };

    const handleAskQuestion = (category: string, value: string, text: string) => {
        if (!mysteryCard || gameOver) return;

        setQuestionsAsked(prev => prev + 1);

        // Check if mystery card matches the attribute
        const isMatch = mysteryCard.attributes[category as keyof typeof mysteryCard.attributes] === value;

        if (isMatch) {
            setMessage(`SÍ! ${text}`);
            // Eliminate cards that DO NOT match
            const newEliminated = new Set(eliminatedIds);
            DETECTIVE_CARDS.forEach(card => {
                if (card.attributes[category as keyof typeof mysteryCard.attributes] !== value) {
                    newEliminated.add(card.id);
                }
            });
            setEliminatedIds(newEliminated);
        } else {
            setMessage(`NO. No ${text.toLowerCase()}`);
            // Eliminate cards that DO match (since the mystery card doesn't)
            const newEliminated = new Set(eliminatedIds);
            DETECTIVE_CARDS.forEach(card => {
                if (card.attributes[category as keyof typeof mysteryCard.attributes] === value) {
                    newEliminated.add(card.id);
                }
            });
            setEliminatedIds(newEliminated);
        }
    };

    const handleGuess = (card: DetectiveCard) => {
        if (!mysteryCard || gameOver) return;

        if (card.id === mysteryCard.id) {
            setVictory(true);
            setGameOver(true);
            setMessage(`CORRECTE! Era ${card.name}.`);
            onScoreUpdate(50 - (questionsAsked * 5)); // Bonus for fewer questions
        } else {
            setMessage(`FALLAT! No era ${card.name}.`);
            // Eliminate only this card
            const newEliminated = new Set(eliminatedIds);
            newEliminated.add(card.id);
            setEliminatedIds(newEliminated);
            onScoreUpdate(-5);
        }
    };

    const handleSmartQuestion = async () => {
        if (!userQuestion.trim() || gameOver || aiLoading) return;

        const results = await analyzeQuestion(userQuestion, DETECTIVE_CARDS);
        setQuestionsAsked(prev => prev + 1);

        // Find match for Mystery Card
        const mysteryResult = results.find(r => r.id === mysteryCard?.id);
        const isMatch = mysteryResult?.match ?? false;

        if (isMatch) {
            setMessage(`SÍ! [IA] Confirma: ${userQuestion}`);
            // Eliminate non-matches using IA RESULTS
            const newEliminated = new Set(eliminatedIds);
            results.forEach(r => {
                if (!r.match) newEliminated.add(r.id);
            });
            setEliminatedIds(newEliminated);
        } else {
            setMessage(`NO. [IA] Nega: ${userQuestion}`);
            // Eliminate matches using IA RESULTS
            const newEliminated = new Set(eliminatedIds);
            results.forEach(r => {
                if (r.match) newEliminated.add(r.id);
            });
            setEliminatedIds(newEliminated);
        }
        setUserQuestion("");
    };

    return (
        <div className="flex flex-col min-h-[80vh] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200">
            {/* Header / HUD */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10 transition-colors duration-500" style={{ backgroundColor: smartMode ? '#4f46e5' : '#0f172a' }}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Search size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight flex items-center gap-2">
                            Neuro-Detective
                            {smartMode && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">IA PRO</span>}
                        </h2>
                        <p className="text-white/60 text-xs">Preguntes: {questionsAsked}</p>
                    </div>
                </div>

                {/* ... (Message Display) ... */}
                <div className="flex-1 text-center mx-4">
                    <span className="inline-block bg-black/20 px-6 py-2 rounded-full text-white font-mono text-sm border border-white/10 animate-pulse truncate max-w-md">
                        {message}
                    </span>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Toggle Smart Mode */}
                    {isAvailable && (
                        <button
                            onClick={() => setSmartMode(!smartMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all mr-2 ${smartMode ? 'bg-white text-brand-600' : 'bg-slate-800 text-slate-400'}`}
                        >
                            {smartMode ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {smartMode ? 'MODE IA ON' : 'MODE CLÀSSIC'}
                        </button>
                    )}

                    <button onClick={startNewGame} className="p-2 hover:bg-white/10 rounded-full" title="Reiniciar">
                        <RotateCcw size={20} />
                    </button>
                    <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full" title="Sortir">
                        <XCircle size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col md:flex-row">
                {/* GAME BOARD (Left) */}
                <div className="flex-1 p-6 bg-slate-100/50 relative">
                    {/* ... (Cards Grid - Same as before) ... */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {DETECTIVE_CARDS.map((card) => {
                            const isEliminated = eliminatedIds.has(card.id);
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => !isEliminated && handleGuess(card)}
                                    disabled={isEliminated || gameOver}
                                    className={`relative aspect-[3/4] rounded-2xl p-4 flex flex-col items-center justify-between transition-all duration-700 transform perspective-1000 ${isEliminated
                                        ? 'bg-slate-200 opacity-40 scale-90 grayscale shadow-inner cursor-not-allowed rotate-y-180'
                                        : 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-2 hover:ring-4 ring-brand-200 cursor-pointer'
                                        }`}
                                >
                                    {/* ... Card Content ... */}
                                    <div className={`w-full h-full flex flex-col items-center backface-hidden ${isEliminated ? 'hidden' : 'block'}`}>
                                        <div className={`w-full aspect-square rounded-xl ${card.imageColor} flex items-center justify-center mb-4 text-white shadow-md`}>
                                            <Icon size={48} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-1">{card.name}</h3>
                                        <p className="text-xs text-slate-500 text-center leading-tight">{card.description}</p>
                                        <span className="mt-auto text-[10px] uppercase font-bold text-slate-400 tracking-wider">CLICK TO GUESS</span>
                                    </div>
                                    {isEliminated && <div className="absolute inset-0 flex items-center justify-center"><XCircle size={48} className="text-slate-400" /></div>}
                                    {victory && mysteryCard?.id === card.id && <div className="absolute inset-0 ring-4 ring-green-500 rounded-2xl animate-pulse bg-green-500/10 z-10"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* CONTROL PANEL (Right) */}
                <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto flex flex-col gap-6 shadow-sidebar z-20">

                    {!smartMode ? (
                        /* CLASSIC CONTROLS */
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <HelpCircle size={18} className="text-brand-500" />
                                Preguntes Clàssiques
                            </h3>
                            <div className="space-y-6">
                                {QUESTION_CATEGORIES.map((cat) => (
                                    <div key={cat.key}>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{cat.label}</h4>
                                        <div className="flex flex-col gap-2">
                                            {cat.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAskQuestion(cat.key, opt.value, opt.label)}
                                                    disabled={gameOver}
                                                    className="text-left text-sm px-4 py-3 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-600 border border-slate-100 hover:border-brand-200 transition-colors flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {opt.label}
                                                    <Brain size={14} className="text-slate-300 group-hover:text-brand-400" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* SMART AI CONTROLS */
                        <div className="animate-fadeIn">
                            <h3 className="font-bold text-brand-600 mb-4 flex items-center gap-2">
                                <Brain size={18} className="text-brand-500" />
                                Pregunta a la IA
                            </h3>
                            <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 mb-4">
                                <p className="text-xs text-brand-700 leading-relaxed">
                                    Escriu qualsevol pregunta en llenguatge natural. La IA (Gemini Nano) analitzarà la teva pregunta i filtrarà les cartes.
                                </p>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={userQuestion}
                                    onChange={(e) => setUserQuestion(e.target.value)}
                                    placeholder="Ex: És una emoció que em fa sentir culpable?"
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none text-sm min-h-[100px] resize-none"
                                    disabled={aiLoading || gameOver}
                                />
                                <button
                                    onClick={handleSmartQuestion}
                                    disabled={!userQuestion.trim() || aiLoading || gameOver}
                                    className="mt-3 w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                                    Llançar Pregunta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Victory/Defeat Modal (Same as before) */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                            <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl transform animate-scaleIn">
                                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg ${victory ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {victory ? <CheckCircle size={48} /> : <XCircle size={48} />}
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">{victory ? 'Misteri Resolt!' : 'Has perdut...'}</h2>
                                <p className="text-slate-600 mb-8 text-lg">
                                    {victory
                                        ? `Has identificat correctament: ${mysteryCard?.name}`
                                        : `La resposta correcta era: ${mysteryCard?.name}`}
                                </p>
                                <button
                                    onClick={startNewGame}
                                    className="w-full py-4 bg-brand-600 rounded-xl text-white font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all"
                                >
                                    Jugar de nou
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
