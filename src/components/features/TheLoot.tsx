import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera as CameraIcon, Sparkles, Image as ImageIcon, Loader2, Save, Trash2, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { AnimatedCard } from '../common/AnimatedCard';
import { generateMemoryImage } from '../../services/geminiService';
import { storage, ref, uploadBytes, getDownloadURL, uploadString } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, UserProfile } from '../../types';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos // Force gallery
            });

            if (image.dataUrl) {
                setGenerating(true);
                setError(null);

                // Upload directly using uploadString for better mobile support
                const storageRef = ref(storage, `users/${user.id}/memories/${Date.now()}_camera.${image.format || 'jpg'}`);
                await uploadString(storageRef, image.dataUrl, 'data_url');
                const downloadUrl = await getDownloadURL(storageRef);
                
                onAddMemory(inputText.trim() || 'Record personal', downloadUrl);
                setInputText('');
            }
        } catch (err: any) {
            console.error("Error with camera/upload:", err);
            // User cancelled or other error
            if (err.message && err.message.includes('User cancelled')) {
                return;
            }
            setError(`No s'ha pogut pujar la imatge: ${err?.message || 'Error desconegut'}`);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-12 pb-20 animate-fadeIn max-w-6xl mx-auto">
            {/* Header simple */}
            <div className="flex items-center gap-4 mb-4">
               {onBack && (
                    <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20 shrink-0">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
               )}
               <div>
                  <h3 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                      <span className="p-2 bg-pink-100 rounded-xl text-pink-600"><CameraIcon size={28} /></span> Galeria de Records
                  </h3>
                  <p className="text-slate-500 mt-2">Afegeix les teves pròpies fotos o crea art amb IA per recordar què és el veritablement important.</p>
               </div>
            </div>

            <AnimatedCard className="bg-white mb-8 border border-slate-100 shadow-soft p-0 overflow-hidden rounded-3xl">
                <div className="p-6 md:p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Crear nou record (IA o Pujar Foto)</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Escriu un títol i puja una foto, o descriu-la i genera l'art amb l'IA..."
                                className="flex-1 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 transition-all font-medium text-slate-700"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                            <div className="flex gap-2 shrink-0 flex-wrap">
                                <button
                                    onClick={handleFileUpload}
                                    className="px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                                >
                                    <Upload size={20} className="text-slate-500" />
                                    Pujar Foto
                                </button>
                                
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !inputText.trim()}
                                    className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${generating || !inputText.trim()
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
                                        }`}
                                >
                                    {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                    {generating ? t('loot.generating') : 'Art IA'}
                                </button>
                            </div>
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
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="font-medium text-slate-800 line-clamp-2 italic text-lg">"{memory.note}"</p>
                                <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-wider flex items-center gap-2">
                                    {memory.date} {memory.imageUrl.startsWith('data:') ? '' : <><span className="w-1 h-1 bg-pink-500 rounded-full"></span> Generat per IA</>}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {memories.length === 0 && !generating && (
                    <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <ImageIcon className="w-10 h-10 opacity-30 text-pink-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">{t('loot.empty_gallery')}</p>
                        <p className="text-sm opacity-70">Puja fotos o genera art IA que et facin sentir fort.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheLoot;
