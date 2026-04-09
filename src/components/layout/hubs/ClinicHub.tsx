import React from 'react';
import { BookOpen, Shield, PenTool, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClinicHubProps {
    onNavigate: (view: string) => void;
}

export const ClinicHub: React.FC<ClinicHubProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const tools = [
        { id: 'therapy-session', label: t('hubs.clinic.tools.therapist.label'), icon: Sparkles, color: 'text-brand-600', bg: 'bg-brand-50', desc: t('hubs.clinic.tools.therapist.desc') },
        { id: 'manual', label: t('hubs.clinic.tools.manual.label'), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', desc: t('hubs.clinic.tools.manual.desc') },
        { id: 'crisis', label: t('hubs.clinic.tools.crisis.label'), icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50', desc: t('hubs.clinic.tools.crisis.desc') },
        { id: 'diary', label: t('hubs.clinic.tools.diary.label'), icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50', desc: t('hubs.clinic.tools.diary.desc') },
        { id: 'safety-map', label: t('hubs.clinic.tools.map.label'), icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: t('hubs.clinic.tools.map.desc') },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">{t('hubs.clinic.title')}</h2>
                <p className="text-slate-500 max-w-2xl">
                    {t('hubs.clinic.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onNavigate(tool.id)}
                        className="group p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left flex items-start gap-4"
                    >
                        <div className={`p-4 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
                            <tool.icon size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-700 transition-colors">
                                {tool.label}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                {tool.desc}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
