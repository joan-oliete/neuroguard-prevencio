import React from 'react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Quest {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    isCompleted: boolean;
    icon?: React.ReactNode;
}

interface QuestBoardProps {
    quests: Quest[];
}

export const QuestBoard: React.FC<QuestBoardProps> = ({ quests }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Trophy className="text-amber-500" /> Missions Diàries
                    </h3>
                    <p className="text-sm text-slate-500">Completa-les per guanyar XP extra!</p>
                </div>
                <div className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    {quests.filter(q => q.isCompleted).length}/{quests.length}
                </div>
            </div>

            <div className="space-y-3">
                {quests.map((quest, index) => (
                    <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${quest.isCompleted
                                ? 'bg-emerald-50 border-emerald-100'
                                : 'bg-slate-50 border-slate-100 hover:border-brand-200 hover:shadow-md'
                            }`}
                    >
                        <div className={`p-2 rounded-full ${quest.isCompleted ? 'bg-emerald-200 text-emerald-700' : 'bg-white text-slate-400'}`}>
                            {quest.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </div>

                        <div className="flex-1">
                            <h4 className={`font-bold ${quest.isCompleted ? 'text-emerald-900 line-through opacity-70' : 'text-slate-700'}`}>
                                {quest.title}
                            </h4>
                            <p className="text-xs text-slate-500">{quest.description}</p>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${quest.isCompleted ? 'bg-white border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                                +{quest.xpReward} XP
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
