import React from 'react';
import {
    Brain, Users, Compass, Trophy, Target, Shuffle, Heart, Wind, Search
} from 'lucide-react';
import { AnimatedCard } from '../../common/AnimatedCard';
import { SocialSimulation } from './SocialSimulation';
import { BreathingGame } from './BreathingGame';
import { NeuroDetective } from '../gym/NeuroDetective';

interface RoleplayMenuProps {
    score: number;
    onSelectMode: (mode: any, topic?: string) => void;
}

export const RoleplayMenu: React.FC<RoleplayMenuProps> = ({ score, onSelectMode }) => {
    const [showTopicSelector, setShowTopicSelector] = React.useState(false);
    const [activeGame, setActiveGame] = React.useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = React.useState<string | undefined>(undefined);

    const topics = [
        { id: 'gambling', label: 'Apostes Esportives', icon: '🎰' },
        { id: 'alcohol', label: 'Pressió Alcohol', icon: '🍺' },
        { id: 'cannabis', label: 'Consum Cànnabis', icon: '🍃' },
        { id: 'lootboxes', label: 'Loot Boxes / Gacha', icon: '🎁' },
        { id: 'custom', label: 'Tema Lliure', icon: '✨' },
    ];

    const handleSocialClick = () => {
        setShowTopicSelector(true);
    };

    const handleTopicSelect = (topic: string) => {
        setSelectedTopic(topic);
        setActiveGame('roleplay');
        setShowTopicSelector(false);
    };

    const handleExitGame = () => {
        setActiveGame(null);
        setSelectedTopic(undefined);
    };

    if (activeGame === 'roleplay') {
        return <SocialSimulation topic={selectedTopic} onExit={handleExitGame} onScoreUpdate={(pts) => console.log('Points:', pts)} />;
    }
    if (activeGame === 'breathing') {
        return <BreathingGame onExit={handleExitGame} onScoreUpdate={(pts) => console.log('Points:', pts)} />;
    }
    if (activeGame === 'detective') {
        return <NeuroDetective onExit={handleExitGame} onScoreUpdate={(pts) => console.log('Points:', pts)} />;
    }
    return (
        <div className="space-y-10 animate-fadeIn pb-24 max-w-5xl mx-auto">

            {/* Hero Section */}
            <div className="relative rounded-3xl bg-brand-600 text-white p-8 md:p-12 overflow-hidden shadow-xl shadow-brand-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">NeuroGym</h2>
                        <p className="text-brand-100 text-lg font-medium opacity-90 max-w-md">
                            Entrena el teu cervell. La repetició crea l'hàbit, l'hàbit crea la recuperació.
                        </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-yellow-400/20 rounded-full">
                            <Trophy className="w-8 h-8 text-yellow-300" fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-xs text-brand-100 uppercase font-bold tracking-wider">Nivell Actual</p>
                            <p className="text-3xl font-black text-white">{score} XP</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {/* Cognitive Section */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Brain size={16} /> Entrenament Cognitiu
                        </h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <MenuButton
                            onClick={() => onSelectMode('cognitive')}
                            icon={Brain}
                            color="brand"
                            title="Refutació de Pensaments"
                            desc="Detecta i desmunta trampes mentals automàtiques."
                        />
                        <MenuButton
                            onClick={() => onSelectMode('focus')}
                            icon={Target}
                            color="rose"
                            title="Focus Zen"
                            desc="Millora el control d'impulsos i la inhibició."
                        />
                    </div>
                </section>

                {/* Behavioral Section */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={16} /> Entrenament Conductual
                        </h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <MenuButton
                            onClick={handleSocialClick}
                            icon={Users}
                            color="blue"
                            title="Simulació Social"
                            desc="Practica l'assertivitat i posa'n límits amb IA."
                        />
                        <MenuButton
                            onClick={() => onSelectMode('association')}
                            icon={Shuffle}
                            color="amber"
                            title="Eines i Reptes"
                            desc="Uneix problemes amb solucions."
                        />
                    </div>
                </section>

                {/* Emotional & Values Section */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Heart size={16} /> Emocions i Valors
                        </h3>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <MenuButton
                            onClick={() => onSelectMode('values')}
                            icon={Compass}
                            color="emerald"
                            title="Brúixola de Valors"
                            desc="Tria el camí correcte."
                        />
                        <MenuButton
                            onClick={() => onSelectMode('emotional')}
                            icon={Heart}
                            color="pink"
                            title="El Viatge Emocional"
                            desc="Una història visual interactiva."
                        />
                        <MenuButton
                            onClick={() => setActiveGame('breathing')}
                            icon={Wind}
                            color="cyan"
                            title="Repte Respiració"
                            desc="Regulació física."
                        />
                        <MenuButton
                            onClick={() => setActiveGame('detective')}
                            icon={Search}
                            color="violet"
                            title="Neuro-Detective"
                            desc="Deducció d'estats mentals."
                        />
                    </div>
                </section>
            </div>


            {/* Topic Selector Modal */}
            {
                showTopicSelector && (
                    <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/50 relative">
                            <button
                                onClick={() => setShowTopicSelector(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                ✕
                            </button>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Tria un Escenari</h3>
                            <p className="text-slate-500 mb-6">Quin tipus de situació vols practicar avui?</p>

                            <div className="grid grid-cols-1 gap-3">
                                {topics.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTopicSelect(t.label)}
                                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-2xl transition-all group text-left hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <span className="text-2xl bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm">{t.icon}</span>
                                        <div>
                                            <span className="font-bold text-slate-700 group-hover:text-brand-700 block">{t.label}</span>
                                            <span className="text-xs text-slate-400 group-hover:text-brand-400">Iniciar simulació</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// Helper Component for consistency
const MenuButton = ({ onClick, icon: Icon, color, title, desc }: any) => {
    const colorClasses: any = {
        brand: "bg-brand-50 text-brand-600 border-brand-100 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600",
        purple: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
        red: "bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600",
        blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
        amber: "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
        pink: "bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600",
        cyan: "bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600",
        rose: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
    };

    const selectedColorClass = colorClasses[color] || colorClasses.brand;

    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left flex items-start sm:items-center gap-5 relative overflow-hidden"
        >
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all duration-300 border ${selectedColorClass.split('group-hover')[0]}`}>
                <Icon size={26} className="transition-transform group-hover:scale-110" />
            </div>

            <div className="relative z-10">
                <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-brand-700 transition-colors">{title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>

            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${selectedColorClass.split(' ')[0].replace('bg-', 'bg-')}`}></div>
        </button>
    );
};
