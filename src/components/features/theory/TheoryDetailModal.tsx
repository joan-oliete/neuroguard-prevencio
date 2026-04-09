import React from 'react';
import { X, Brain, AlertTriangle, Repeat } from 'lucide-react';
import { ADDICTION_DETAILS } from '../../../data/theoryData';

interface TheoryDetailModalProps {
    selectedDetail: string | null;
    onClose: () => void;
}

import { generateEducationalVideo } from '../../../services/geminiService';

const TheoryDetailModal: React.FC<TheoryDetailModalProps> = ({ selectedDetail, onClose }) => {
    const [generating, setGenerating] = React.useState(false);
    const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

    if (!selectedDetail || !ADDICTION_DETAILS[selectedDetail]) return null;

    const detail = ADDICTION_DETAILS[selectedDetail];

    const handleGenerateVideo = async () => {
        setGenerating(true);
        try {
            // Attempt to generate real video
            const url = await generateEducationalVideo(detail.title, detail.description);
            if (url) {
                setVideoUrl(url);
            } else {
                // Determine mock behavior - simulation
                // In a real app we might show an error, but for this demo request we show a placeholder success
                setTimeout(() => {
                    alert("Simulació: Vídeo generat correctament amb Veo (Model Mock).");
                    setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4"); // Placeholder
                }, 2000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md p-4 md:p-8 overflow-y-auto flex items-center justify-center animate-fadeIn">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/40 transition-colors z-30 text-slate-800"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className={`p-10 text-white bg-gradient-to-r ${detail.gradient}`}>
                    <div className="text-6xl mb-6 filter drop-shadow-lg">{detail.icon}</div>
                    <h2 className="text-4xl font-bold mb-4">{detail.title}</h2>
                    <p className="text-lg opacity-90 leading-relaxed max-w-2xl">{detail.description}</p>

                    {/* Video Generation Button */}
                    <div className="mt-6 flex flex-col gap-3">
                        {!videoUrl ? (
                            <button
                                onClick={handleGenerateVideo}
                                disabled={generating}
                                className="w-fit bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all border border-white/40 shadow-lg disabled:opacity-50 disabled:cursor-wait"
                            >
                                <Brain size={18} className={generating ? "animate-pulse" : ""} />
                                {generating ? "Generant amb Veo..." : "Generar Video-Resum (Veo)"}
                            </button>
                        ) : (
                            <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 animate-scaleIn">
                                <p className="text-sm font-bold mb-2 flex items-center gap-2"><Brain size={14} /> Resultat Veo (Simulat)</p>
                                <video controls src={videoUrl} className="w-full rounded-lg shadow-lg max-h-64"></video>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    <section>
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <Brain className="w-8 h-8 text-purple-600" /> Mecanismes Psicològics
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {detail.mechanisms.map((m: any, i: number) => (
                                <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                    <h4 className="font-bold text-slate-800 mb-3 text-lg">{m.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
                            <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" /> Riscos
                            </h3>
                            <ul className="space-y-3">
                                {detail.risks.map((r: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-red-800 font-medium">
                                        <span className="mt-1.5 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
                            <h3 className="text-xl font-bold text-amber-800 mb-6 flex items-center gap-2">
                                <Repeat className="w-6 h-6" /> Pensaments Trampa
                            </h3>
                            <ul className="space-y-4">
                                {detail.traps.map((t: string, i: number) => (
                                    <li key={i} className="bg-white p-4 rounded-xl text-amber-900 italic border border-amber-200 shadow-sm text-center">
                                        "{t}"
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheoryDetailModal;
