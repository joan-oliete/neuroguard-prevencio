import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Sparkles, Image as ImageIcon, Loader2, Save, Trash2, AlertCircle, Trophy, Star, Lock, Crown, Zap, ArrowLeft } from 'lucide-react';
import { AnimatedCard } from '../common/AnimatedCard';
import { generateMemoryImage } from '../../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, UserProfile } from '../../types';

interface TheLootProps {
    user: UserProfile;
    memories: Memory[];
    onAddMemory: (text: string, imageUrl: string) => void;
    onDeleteMemory: (id: number) => void;
    onBack?: () => void;
}

const TheLoot: React.FC<TheLootProps> = ({ user, memories, onAddMemory, onDeleteMemory, onBack }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!inputText.trim()) return;

        setGenerating(true);
        setError(null);

        try {
            const imageUrl = await generateMemoryImage(inputText);

            if (imageUrl) {
                onAddMemory(inputText, imageUrl);
                setInputText('');
            } else {
                setError('No s\'ha pogut generar la imatge. Revisa la clau API o intenta-ho de nou.');
            }
        } catch (e) {
            setError('Error de connexió amb el servei d\'IA.');
        } finally {
            setGenerating(false);
        }
    };

    // Unlockable Trophies logic
    const trophies = [
        { id: 1, level: 1, title: 'Primer Pas', icon: Star, desc: 'Comença el viatge', unlocked: true },
        { id: 2, level: 3, title: 'Gym Mental', icon: Zap, desc: 'Entrenament cognitiu desbloquejat', unlocked: user.level >= 2 },
        { id: 3, level: 5, title: 'Mestratge', icon: Crown, desc: 'Control total de la situació', unlocked: user.level >= 5 },
        { id: 4, level: 10, title: 'Llegenda', icon: Trophy, desc: 'Expert en prevenció', unlocked: user.level >= 10 },
    ];

    return (
        <div className="space-y-12 pb-20 animate-fadeIn max-w-6xl mx-auto">

            {/* 1. HERO TROPHY CASE */}
            <div className="relative rounded-3xl bg-brand-600 text-white p-8 md:p-12 overflow-hidden shadow-xl shadow-brand-200">
                {onBack && (
                    <button onClick={onBack} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm z-20">
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                )}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-6 shadow-sm ring-1 ring-white/30">
                        <Trophy size={48} className="text-yellow-300" />
                    </div>
                    <h2 className="text-5xl font-black tracking-tight mb-2">
                        {t('dashboard.level', { level: user.level })}
                    </h2>
                    <p className="text-brand-100 text-lg mb-8 font-medium uppercase tracking-widest">{t('loot.trophies_title')}</p>

                    <div className="flex justify-center gap-4">
                        <div className="bg-brand-700/50 backdrop-blur px-6 py-3 rounded-xl border border-brand-500/50 flex items-center gap-3">
                            <Star className="text-yellow-300" fill="currentColor" size={20} />
                            <span className="text-2xl font-bold">{user.currency} <span className="text-sm font-normal text-brand-200">XP</span></span>
                        </div>
                        <div className="bg-brand-700/50 backdrop-blur px-6 py-3 rounded-xl border border-brand-500/50 flex items-center gap-3">
                            <Zap className="text-cyan-300" fill="currentColor" size={20} />
                            <span className="text-2xl font-bold">{user.streak} <span className="text-sm font-normal text-brand-200">Dies</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. UNLOCKABLES GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {trophies.map((t) => (
                    <div key={t.id} className={`group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center
                        ${t.unlocked
                            ? 'bg-white border-brand-100 shadow-sm hover:shadow-md hover:-translate-y-1'
                            : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                        }`}>

                        <div className={`p-4 rounded-xl mb-4 transition-transform duration-500 group-hover:scale-110 ${t.unlocked ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-400'}`}>
                            {t.unlocked ? <t.icon size={28} /> : <Lock size={28} />}
                        </div>
                        <h3 className={`font-bold text-lg mb-1 ${t.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>{t.title}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-tight">{t.desc}</p>
                    </div>
                ))}
            </div>

            {/* 3. NEURAL ART GALLERY (Original Memories) */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="p-2 bg-pink-50 rounded-lg text-pink-500"><Camera size={24} /></span> {t('loot.gallery_title')}
                    </h3>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <AnimatedCard className="bg-white mb-8 border border-slate-100 shadow-soft p-0 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('loot.create_title')}</label>
                            <div className="flex gap-4 flex-col md:flex-row">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={t('loot.prompt_placeholder')}
                                    className="flex-1 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 transition-all font-medium text-slate-700"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !inputText.trim()}
                                    className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${generating || !inputText.trim()
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
                                        }`}
                                >
                                    {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                    {generating ? t('loot.generating') : t('loot.generate_btn')}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl text-sm font-medium animate-fadeIn">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                    </div>
                </AnimatedCard>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {memories.map((memory) => (
                            <motion.div
                                key={memory.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 group relative hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                    <img
                                        src={memory.imageUrl}
                                        alt={memory.note}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6">
                                        <button
                                            onClick={() => onDeleteMemory(memory.id)}
                                            className="text-white hover:text-red-400 transition-colors p-3 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        <div className="flex gap-2">
                                            <button className="text-white hover:text-pink-400 transition-colors p-3 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20">
                                                <Save size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <p className="font-medium text-slate-800 line-clamp-2 italic text-lg">"{memory.note}"</p>
                                    <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-wider flex items-center gap-2">
                                        {memory.date} <span className="w-1 h-1 bg-pink-500 rounded-full"></span> Generat per IA
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {memories.length === 0 && !generating && (
                        <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <ImageIcon className="w-10 h-10 opacity-30 text-indigo-400" />
                            </div>
                            <p className="text-lg font-medium text-slate-600">{t('loot.empty_gallery')}</p>
                            <p className="text-sm opacity-70">Genera la teva primera obra d'art emocional.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default TheLoot;
