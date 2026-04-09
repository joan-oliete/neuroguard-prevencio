import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Trophy, CloudLightning, Umbrella, Phone, Trees, BookOpen, AlertCircle, Heart, Zap } from 'lucide-react';
import { ASSOCIATION_PAIRS } from '../../../data/roleplayData';

interface AssociationGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

// Map text keywords to icons for visual cues
const ICON_MAP: Record<string, React.ElementType> = {
    "Estrès Laboral": CloudLightning,
    "Pausa de 5 minuts": Umbrella,
    "Avorriment": AlertCircle,
    "Llegir un llibre": BookOpen,
    "Discussió": Zap,
    "Trucar a un amic": Phone,
    "Solitud": Heart,
    "Anar al parc": Trees
};

export const AssociationGame: React.FC<AssociationGameProps> = ({ onExit, onScoreUpdate }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [matches, setMatches] = useState(0);

    useEffect(() => {
        // Initialize matching cards
        let c: any[] = [];
        ASSOCIATION_PAIRS.forEach((p, idx) => {
            c.push({ id: idx * 2, text: p.trigger, type: 'trigger', matchId: idx, matched: false, selected: false });
            c.push({ id: idx * 2 + 1, text: p.coping, type: 'coping', matchId: idx, matched: false, selected: false });
        });
        c.sort(() => Math.random() - 0.5);
        setCards(c);
        setMatches(0);
    }, []);

    const handleCardClick = (id: number) => {
        const clickedCard = cards.find(c => c.id === id);
        if (clickedCard?.matched || clickedCard?.selected) return;

        // Prevent selecting more than 2
        const currentSelected = cards.filter(c => c.selected && !c.matched);
        if (currentSelected.length >= 2) return;

        const newCards = cards.map(c => c.id === id ? { ...c, selected: true } : c);
        setCards(newCards);

        const updatedSelected = newCards.filter(c => c.selected && !c.matched);

        if (updatedSelected.length === 2) {
            if (updatedSelected[0].matchId === updatedSelected[1].matchId) {
                // Match found
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.matchId === updatedSelected[0].matchId ? { ...c, matched: true, selected: false } : c
                    ));
                    setMatches(m => m + 1);
                    onScoreUpdate(20);
                }, 500);
            } else {
                // No match
                setTimeout(() => {
                    setCards(prev => prev.map(c => c.matched ? c : { ...c, selected: false }));
                }, 1000);
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                        <Shuffle size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Eines i Reptes</h3>
                        <p className="text-slate-500 text-xs">Connecta el problema amb la seva solució</p>
                    </div>
                </div>
                <button onClick={onExit} className="text-slate-400 hover:text-slate-600 font-bold text-sm">SORTIR</button>
            </div>

            {matches === ASSOCIATION_PAIRS.length ? (
                <div className="bg-white border-4 border-yellow-100 rounded-3xl p-12 text-center shadow-xl animate-scaleIn max-w-lg mx-auto">
                    <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Connexió Total!</h2>
                    <p className="text-slate-500 mb-8">Has demostrat que tens les eines per a cada situació.</p>
                    <button onClick={onExit} className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Tornar al Menú
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {cards.map(card => {
                            const Icon = ICON_MAP[card.text] || Shuffle;
                            return (
                                <motion.button
                                    key={card.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => handleCardClick(card.id)}
                                    disabled={card.matched}
                                    className={`aspect-[4/3] p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${card.matched
                                            ? 'bg-green-50 border-green-200 text-green-700 opacity-50 grayscale-[0.5]'
                                            : card.selected
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xl scale-105 z-10'
                                                : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${card.matched ? 'bg-green-200' : card.selected ? 'bg-blue-200' : 'bg-slate-100'
                                        }`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="font-bold text-sm leading-tight">{card.text}</span>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
