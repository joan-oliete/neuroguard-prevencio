import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, Lock, Music } from 'lucide-react';
import zenGardenImg from '../../../assets/images/zen_garden.png';
import zenForestImg from '../../../assets/images/zen_forest.png';

interface ZenPuzzleProps {
    onBack: () => void;
    onComplete: (score: number) => void;
}

const LEVELS = [
    { id: 1, title: 'Jardí de la Calma', img: zenGardenImg, grid: 3, xp: 50 },
    { id: 2, title: 'Bosc Encantat', img: zenForestImg, grid: 4, xp: 100 }
];

export const ZenPuzzle: React.FC<ZenPuzzleProps> = ({ onBack, onComplete }) => {
    const [activeLevel, setActiveLevel] = useState<number | null>(null);
    const [tiles, setTiles] = useState<number[]>([]);
    const [selectedTile, setSelectedTile] = useState<number | null>(null);
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    const initializePuzzle = (levelId: number) => {
        const level = LEVELS.find(l => l.id === levelId);
        if (!level) return;

        setActiveLevel(levelId);
        setIsSolved(false);
        setMoves(0);

        // Create shuffled array [0, 1, 2, ... n-1]
        const totalTiles = level.grid * level.grid;
        const newTiles = Array.from({ length: totalTiles }, (_, i) => i);

        // Shuffle (Fisher-Yates) ensuring it's not already solved
        let shuffled;
        do {
            shuffled = [...newTiles];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
        } while (shuffled.every((val, index) => val === index));

        setTiles(shuffled);
    };

    const handleTileClick = (index: number) => {
        if (isSolved) return;

        if (selectedTile === null) {
            setSelectedTile(index);
        } else {
            // Swap
            const newTiles = [...tiles];
            [newTiles[selectedTile], newTiles[index]] = [newTiles[index], newTiles[selectedTile]];
            setTiles(newTiles);
            setSelectedTile(null);
            setMoves(m => m + 1);

            // Check win
            if (newTiles.every((val, idx) => val === idx)) {
                setIsSolved(true);
                // Trigger win effect
                setTimeout(() => {
                    // Auto complete after 2 seconds
                }, 2000);
            }
        }
    };

    const handleFinish = () => {
        const level = LEVELS.find(l => l.id === activeLevel);
        if (level) {
            onComplete(level.xp);
        }
    };

    if (!activeLevel) {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
                <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft /> Tornar
                    </button>
                    <h1 className="text-3xl font-serif text-emerald-100">Galeria Zen</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                    {LEVELS.map(level => (
                        <div
                            key={level.id}
                            onClick={() => initializePuzzle(level.id)}
                            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-transform hover:scale-[1.02]"
                        >
                            <img src={level.img} alt={level.title} className="w-full h-full object-cover transition-all duration-700 group-hover:blur-sm" />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center">
                                <h3 className="text-3xl font-bold text-white mb-2">{level.title}</h3>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <span className="bg-white/20 px-3 py-1 rounded-full">{level.grid}x{level.grid}</span>
                                    <span className="text-emerald-300">{level.xp} XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const currentLevelConfig = LEVELS.find(l => l.id === activeLevel)!;

    return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <img src={currentLevelConfig.img} className="w-full h-full object-cover blur-3xl scale-110" alt="bg" />
            </div>

            <div className="z-10 w-full max-w-2xl flex justify-between items-center mb-6 text-stone-200">
                <button onClick={() => setActiveLevel(null)} className="flex items-center gap-2 hover:text-white transition-colors">
                    <ArrowLeft /> Galeria
                </button>
                <div className="flex items-center gap-4">
                    <span className="font-serif text-xl">{currentLevelConfig.title}</span>
                    <button onClick={() => initializePuzzle(activeLevel)} className="p-2 hover:bg-white/10 rounded-full">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Puzzle Grid */}
            <div
                className="relative z-10 bg-black/50 p-2 rounded-xl shadow-2xl backdrop-blur-sm"
                style={{
                    width: 'min(90vw, 500px)',
                    height: 'min(90vw, 500px)',
                }}
            >
                <div
                    className="grid w-full h-full gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${currentLevelConfig.grid}, 1fr)`,
                        gridTemplateRows: `repeat(${currentLevelConfig.grid}, 1fr)`
                    }}
                >
                    {tiles.map((tileIndex, positionIndex) => {
                        // Calculate position of the original part of images
                        // tileIndex 0 is top-left (0,0)
                        const x = (tileIndex % currentLevelConfig.grid) * 100;
                        const y = Math.floor(tileIndex / currentLevelConfig.grid) * 100;
                        const size = 100 * currentLevelConfig.grid;

                        const isSelected = selectedTile === positionIndex;
                        const isCorrect = tileIndex === positionIndex;

                        return (
                            <motion.div
                                key={positionIndex}
                                layout
                                onClick={() => handleTileClick(positionIndex)}
                                className={`relative cursor-pointer overflow-hidden rounded-sm transition-all
                                    ${isSelected ? 'ring-4 ring-emerald-400 z-20 scale-105' : ''}
                                    ${isSolved ? 'ring-0' : ''}
                                    ${!isSolved && !isSelected ? 'hover:brightness-110' : ''}
                                `}
                                initial={false}
                            >
                                <div
                                    className="w-full h-full absolute inset-0"
                                    style={{
                                        backgroundImage: `url(${currentLevelConfig.img})`,
                                        backgroundSize: `${size}%`,
                                        backgroundPosition: `${x}% ${y}%`
                                    }}
                                />
                                {activeLevel === 1 && !isSolved && ( // Hint numbers active only on easy level
                                    <div className="absolute bottom-1 right-1 text-[10px] text-white/50">{tileIndex + 1}</div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Victory Overlay */}
                <AnimatePresence>
                    {isSolved && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center p-8 bg-white text-stone-900 rounded-2xl shadow-2xl"
                            >
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                                <h2 className="text-2xl font-bold font-serif mb-2">Harmonia Restaurada</h2>
                                <p className="text-stone-500 mb-6">Has trobat la pau en {moves} moviments.</p>
                                <button
                                    onClick={handleFinish}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
                                >
                                    Continuar (+{currentLevelConfig.xp} XP)
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 text-stone-400 text-sm italic font-serif z-10">
                {isSolved ? "Respira profundament..." : "Selecciona dues peces per intercanviar-les."}
            </div>
        </div>
    );
};
