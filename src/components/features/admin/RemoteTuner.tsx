import React from 'react';
import { useGameConfig } from '../../../context/GameConfigContext';
import { DEFAULT_PROMPTS } from '../../../data/musicPrompts';
import { Sliders, ArrowLeft, Save } from 'lucide-react';

export const RemoteTuner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { config, updateConfig } = useGameConfig();

    const handleWeightChange = (id: string, value: number) => {
        const currentWeights = config.promptDj?.weights || {};
        updateConfig({
            promptDj: {
                ...config.promptDj,
                weights: { ...currentWeights, [id]: value }
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Sliders size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Remote Tuner</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Therapist Control Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold transition-colors"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEFAULT_PROMPTS.map(prompt => {
                        const weight = config.promptDj?.weights?.[prompt.id] ?? 0;
                        return (
                            <div key={prompt.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-sm" style={{ color: prompt.color }}>
                                        {prompt.text}
                                    </h4>
                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                                        {(weight * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={weight}
                                    onChange={(e) => handleWeightChange(prompt.id, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 p-4 bg-indigo-50 text-indigo-800 rounded-xl text-sm border border-indigo-100">
                    <p><strong>Note:</strong> Changes are saved automatically to the cloud and will update the patient's active session in real-time.</p>
                </div>
            </div>
        </div>
    );
};
