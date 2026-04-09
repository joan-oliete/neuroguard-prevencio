import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Compass, Wind, Sun, Mountain } from 'lucide-react';

interface EmotionalGameProps {
    onExit: () => void;
    onScoreUpdate: (points: number) => void;
}

interface StoryNode {
    id: string;
    text: string;
    image: string;
    options: {
        text: string;
        nextId: string;
        icon?: React.ElementType;
    }[];
}

const STORY_NODES: Record<string, StoryNode> = {
    start: {
        id: 'start',
        text: "Et trobes al mig d'un bosc espès i fosc. Els arbres són alts i no deixen passar gaire llum. Sents una certa inquietud al pit, com si portessis una motxilla massa pesada.",
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80', // Dark Forest
        options: [
            { text: "Buscar una sortida ràpida", nextId: 'rush', icon: Compass },
            { text: "Seure i respirar", nextId: 'breathe', icon: Wind },
        ]
    },
    rush: {
        id: 'rush',
        text: "Corres sense direcció. Les branques t'esgarrapem i l'ansietat puja. De sobte, et trobes davant d'un riu cabalós que et barra el pas. L'aigua baixa amb força.",
        image: 'https://images.unsplash.com/photo-1455218873509-8097476ef67c?auto=format&fit=crop&w=1600&q=80', // Rushing River
        options: [
            { text: "Intentar creuar nedant", nextId: 'struggle', icon: Wind },
            { text: "Observar el corrent", nextId: 'observe', icon: Compass },
        ]
    },
    breathe: {
        id: 'breathe',
        text: "T'asseus a la molsa fresca. Tanques els ulls i escoltes el vent. A poc a poc, notes que el bosc no és tan hostil. Veus un raig de llum que es cola entre les fulles.",
        image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80', // Sunlight in Forest
        options: [
            { text: "Seguir el raig de llum", nextId: 'clearing', icon: Sun },
            { text: "Quedar-me una mica més", nextId: 'meditate', icon: Wind },
        ]
    },
    struggle: {
        id: 'struggle',
        text: "L'aigua és freda i forta. Et costa avançar. T'adones que lluitar contra el corrent et cansa. Potser no cal creuar ara mateix, sinó deixar que l'aigua passi.",
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80', // Turbulent Water
        options: [
            { text: "Sortir a la riba i descansar", nextId: 'breathe', icon: Mountain },
        ]
    },
    observe: {
        id: 'observe',
        text: "Mires l'aigua. Veus com flueix, sense resistència. Entens que els teus pensaments són com aquest riu: venen i se'n van. Et sents més lleuger.",
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', // Calm Water/Beach
        options: [
            { text: "Continuar el camí amb calma", nextId: 'clearing', icon: Sun },
        ]
    },
    clearing: {
        id: 'clearing',
        text: "Seguint la llum, arribes a una clariana. El sol t'escalfa la cara. Davant teu s'alça una muntanya majestuosa. Saps que pots pujar-hi, però al teu ritme.",
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80', // Mountain Peak
        options: [
            { text: "Començar l'ascens", nextId: 'peak', icon: Mountain },
            { text: "Descansar al prat", nextId: 'meditate', icon: Wind },
        ]
    },
    meditate: {
        id: 'meditate',
        text: "Et prens un moment per tu. No hi ha pressa. El món segueix girant, però tu estàs en pau aquí i ara. Sents com la teva respiració s'aprofundeix.",
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1600&q=80', // Starry Sky / Nature
        options: [
            { text: "Obrir els ulls i seguir", nextId: 'clearing', icon: Sun },
        ]
    },
    peak: {
        id: 'peak',
        text: "Pas a pas, arribes al cim. L'aire és pur. Des d'aquí dalt, el bosc fosc es veu petit. Has guanyat perspectiva. Ets més fort/a del que pensaves.",
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80', // Top of World
        options: [
            { text: "Finalitzar el viatge", nextId: 'end', icon: Sun },
        ]
    }
};

export const EmotionalGame: React.FC<EmotionalGameProps> = ({ onExit, onScoreUpdate }) => {
    const [currentNodeId, setCurrentNodeId] = useState<string>('start');
    const [history, setHistory] = useState<string[]>([]);

    const currentNode = STORY_NODES[currentNodeId] || STORY_NODES['start'];

    const handleChoice = (nextId: string) => {
        if (nextId === 'end') {
            onScoreUpdate(50);
            onExit();
            return;
        }
        setHistory([...history, currentNodeId]);
        setCurrentNodeId(nextId);
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory(history.slice(0, -1));
            setCurrentNodeId(prev);
        } else {
            onExit();
        }
    };

    return (
        <div className="h-[80vh] w-full relative rounded-3xl overflow-hidden shadow-2xl bg-black">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentNode.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-in-out transform scale-110"
                        style={{ backgroundImage: `url(${currentNode.image})` }}
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content Layer */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-8 md:p-12">
                {/* Headers */}
                <div className="flex justify-between items-start">
                    <button onClick={handleBack} className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all">
                        <ArrowLeft />
                    </button>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest border border-white/10">
                        Viatge Emocional
                    </div>
                </div>

                {/* Narrative Block */}
                <div className="max-w-2xl mx-auto w-full">
                    <motion.div
                        key={currentNode.text}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <p className="text-2xl md:text-4xl font-medium text-white leading-relaxed drop-shadow-md text-center">
                            "{currentNode.text}"
                        </p>
                    </motion.div>

                    {/* Choices */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {currentNode.options.map((option, idx) => {
                            const Icon = option.icon || Compass;
                            return (
                                <motion.button
                                    key={idx}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 + (idx * 0.1) }}
                                    onClick={() => handleChoice(option.nextId)}
                                    className="group bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-lg font-bold text-white group-hover:text-brand-100 transition-colors">{option.text}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
