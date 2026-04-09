import React, { useState, useEffect } from 'react';
import { useDiary } from '../../hooks/useDiary';
import { Calendar, Smile, Meh, Frown, Sparkles, Brain, Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { getGenerativeModel } from 'firebase/vertexai';
import { vertexAI } from '../../services/firebase';

interface DiaryProps {
    user: User;
    linkedActivity?: { date: string; area: string; text?: string };
    onClearLink: () => void;
    onAddXp?: (amount: number) => void;
}

const Diary: React.FC<DiaryProps> = ({ user, linkedActivity, onClearLink, onAddXp }) => {
    const { t, i18n } = useTranslation();
    const { diaryEntries, addDiaryEntry } = useDiary(user);
    const [newDiaryText, setNewDiaryText] = useState('');
    const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    useEffect(() => {
        if (linkedActivity) {
            setNewDiaryText(`${t('diary.check_in_prompt')} ${linkedActivity.area}: "${linkedActivity.text || ''}"\n\n`);
        }
    }, [linkedActivity, t]);

    const handleAnalyze = async () => {
        if (!newDiaryText.trim()) return;
        setAnalyzing(true);
        try {
            const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });
            const prompt = `Actua com un terapeuta expert de NeuroGuard (context: addiccions i salut mental). Llegeix aquesta entrada de diari i dona'n un feedback breu (max 2 frases), validant l'emoció i suggerint una fortalesa. Idioma de resposta: ${i18n.language === 'en' ? 'English' : i18n.language === 'es' ? 'Español' : 'Català'}. Entrada: "${newDiaryText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiAnalysis(response.text());
        } catch (error) {
            console.error("AI Error", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!newDiaryText.trim()) return;

        const fullText = aiAnalysis
            ? `${newDiaryText}\n\n[NeuroGuard AI]: ${aiAnalysis}`
            : newDiaryText;

        const activityToSave = linkedActivity ? { date: linkedActivity.date, area: linkedActivity.area } : undefined;
        // In a real app we would save 'mood' to the database too, but for now we append it or just track valid entry
        const success = await addDiaryEntry(fullText, activityToSave);

        if (success) {
            setNewDiaryText('');
            setAiAnalysis(null);
            setSelectedMood(null);
            if (linkedActivity) onClearLink();
            if (onAddXp) onAddXp(50);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800 font-sans">{t('diary.title')}</h2>
                <span className="text-sm text-slate-500 italic">{new Date().toLocaleDateString()}</span>
            </div>

            {linkedActivity && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm mb-2 flex justify-between items-center">
                    <span>Vinculat a l'activitat de {linkedActivity.area} ({new Date(linkedActivity.date).toLocaleDateString()})</span>
                    <button onClick={() => { setNewDiaryText(''); onClearLink(); }} className="text-blue-500 hover:text-blue-700">✕</button>
                </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-brand-100">

                {/* Mood Selector */}
                <div className="mb-4 flex items-center gap-3 text-slate-500 text-sm font-medium">
                    <span>{t('diary.mood_label')}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedMood('happy')} className={`p-2 rounded-full transition-all ${selectedMood === 'happy' ? 'bg-green-100 text-green-600 scale-110' : 'hover:bg-slate-50'}`}><Smile size={24} /></button>
                        <button onClick={() => setSelectedMood('neutral')} className={`p-2 rounded-full transition-all ${selectedMood === 'neutral' ? 'bg-blue-100 text-blue-600 scale-110' : 'hover:bg-slate-50'}`}><Meh size={24} /></button>
                        <button onClick={() => setSelectedMood('sad')} className={`p-2 rounded-full transition-all ${selectedMood === 'sad' ? 'bg-orange-100 text-orange-600 scale-110' : 'hover:bg-slate-50'}`}><Frown size={24} /></button>
                    </div>
                </div>

                <textarea
                    value={newDiaryText}
                    onChange={e => setNewDiaryText(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-0 min-h-[150px] mb-4 resize-none text-lg placeholder:text-slate-400"
                    placeholder={t('diary.placeholder')}
                />

                {/* AI Analysis Result */}
                {aiAnalysis && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex gap-3 animate-fadeIn">
                        <Brain className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">{t('diary.analysis_label')}</p>
                            <p className="text-indigo-900 text-sm leading-relaxed">{aiAnalysis}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <button
                        onClick={handleAnalyze}
                        disabled={!newDiaryText.trim() || analyzing}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {analyzing ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {t('diary.analyze_btn')}
                    </button>

                    <button onClick={handleSave} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-md shadow-brand-200 transform active:scale-95 flex items-center gap-2">
                        {t('diary.save_btn')}
                    </button>
                </div>
            </div>

            <div className="space-y-4 mt-8">
                <h3 className="text-xl font-bold text-slate-700 mb-4">{t('diary.history_title')}</h3>
                {diaryEntries.length === 0 && <p className="text-slate-400 italic">{t('diary.empty')}</p>}
                {diaryEntries.map(entry => (
                    <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleString() : 'Just ara'}
                            </p>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                        {entry.linkedActivity && (
                            <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Activitat: {entry.linkedActivity.area}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Diary;
