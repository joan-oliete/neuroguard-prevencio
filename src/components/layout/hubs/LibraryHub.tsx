import React from 'react';
import { BookOpen, GraduationCap, Camera, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LibraryHubProps {
    onNavigate: (view: string) => void;
}

export const LibraryHub: React.FC<LibraryHubProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const resources = [
        { id: 'theory', label: t('hubs.library.tools.theory.label'), icon: BookOpen, color: 'text-teal-600', bg: 'bg-teal-50', desc: t('hubs.library.tools.theory.desc') },
        { id: 'learning', label: t('hubs.library.tools.learning.label'), icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: t('hubs.library.tools.learning.desc') },
        { id: 'loot', label: t('hubs.library.tools.loot.label'), icon: Camera, color: 'text-pink-600', bg: 'bg-pink-50', desc: t('hubs.library.tools.loot.desc') },
        { id: 'profile', label: t('hubs.library.tools.profile.label'), icon: User, color: 'text-slate-600', bg: 'bg-slate-50', desc: t('hubs.library.tools.profile.desc') },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">{t('hubs.library.title')}</h2>
                <p className="text-slate-500 max-w-2xl">
                    {t('hubs.library.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {resources.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left flex items-start gap-5"
                    >
                        <div className={`p-4 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                            <item.icon size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 group-hover:text-brand-700 transition-colors">
                                {item.label}
                            </h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
