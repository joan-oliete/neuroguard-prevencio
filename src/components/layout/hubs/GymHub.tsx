import React from 'react';
import { Zap, BrainCircuit, Trophy, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GymHubProps {
    onNavigate: (view: string) => void;
}

export const GymHub: React.FC<GymHubProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center md:text-left space-y-2">
                <h2 className="text-3xl font-bold text-slate-800">{t('hubs.gym.title')}</h2>
                <p className="text-slate-500 max-w-2xl">
                    {t('hubs.gym.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SERIOUS TRAINING */}
                <button
                    onClick={() => onNavigate('gym')}
                    className="relative overflow-hidden group p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-left"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BrainCircuit size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                        <div className="bg-white/20 w-fit p-3 rounded-xl backdrop-blur-sm">
                            <Target size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">{t('hubs.gym.training.title')}</h3>
                            <p className="text-indigo-100 opacity-90 max-w-xs">
                                {t('hubs.gym.training.desc')}
                            </p>
                        </div>
                        <span className="text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                            {t('hubs.gym.training.cta')}
                        </span>
                    </div>
                </button>

                {/* ARCADE */}
                <button
                    onClick={() => onNavigate('game-center')}
                    className="relative overflow-hidden group p-8 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-left"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                        <div className="bg-white/20 w-fit p-3 rounded-xl backdrop-blur-sm">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">{t('hubs.gym.arcade.title')}</h3>
                            <p className="text-violet-100 opacity-90 max-w-xs">
                                {t('hubs.gym.arcade.desc')}
                            </p>
                        </div>
                        <span className="text-sm font-bold bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                            {t('hubs.gym.arcade.cta')}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};
