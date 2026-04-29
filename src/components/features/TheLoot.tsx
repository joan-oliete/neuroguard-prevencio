import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera as CameraIcon, Image as ImageIcon, Loader2, Save, Trash2, AlertCircle, ArrowLeft, Upload, X } from 'lucide-react';
import { AnimatedCard } from '../common/AnimatedCard';
import { storage, ref, getDownloadURL, uploadString } from '../../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory, UserProfile } from '../../types';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface TheLootProps {
    user: UserProfile;
    memories: Memory[];
    onAddMemory: (text: string, imageUrl: string) => void;
    onDeleteMemory: (id: string | number) => void;
    onBack?: () => void;
}

const TheLoot: React.FC<TheLootProps> = ({ user, memories, onAddMemory, onDeleteMemory, onBack }) => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const [pendingImage, setPendingImage] = useState<{ dataUrl: string; format: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleFileUpload = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos
            });

            if (image.dataUrl) {
                setPendingImage({ dataUrl: image.dataUrl, format: image.format || 'jpg' });
                setError(null);
            }
        } catch (err: any) {
            console.error("Error with camera/upload:", err);
            if (err.message && err.message.includes('User cancelled')) {
                return;
            }
            setError(`No s'ha pogut obtenir la imatge: ${err?.message || 'Error desconegut'}`);
        }
    };

    const handleSaveMemory = async () => {
        if (!pendingImage || !inputText.trim()) {
            setError("Si us plau, afegeix una imatge i un títol abans de guardar.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const storageRef = ref(storage, `users/${user.id}/memories/${Date.now()}_camera.${pendingImage.format}`);
            await uploadString(storageRef, pendingImage.dataUrl, 'data_url');
            const downloadUrl = await getDownloadURL(storageRef);
            
            onAddMemory(inputText.trim(), downloadUrl);
            setInputText('');
            setPendingImage(null);
        } catch (err: any) {
            console.error("Error saving memory:", err);
            setError(`No s'ha pogut guardar la imatge: ${err?.message || 'Error desconegut'}`);
        } finally {
            setSaving(false);
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
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Crear nou record</label>
                        
                        {!pendingImage ? (
                            <div className="flex justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer" onClick={handleFileUpload}>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={24} className="text-pink-600" />
                                    </div>
                                    <p className="font-bold text-slate-700">Toca per pujar una foto</p>
                                    <p className="text-sm text-slate-500 mt-1">Galeria del dispositiu</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                                    <img src={pendingImage.dataUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <button 
                                        onClick={() => setPendingImage(null)}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm"
                                        disabled={saving}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Escriu un títol bonic per a aquest record..."
                                        className="flex-1 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-slate-50 transition-all font-medium text-slate-700"
                                        disabled={saving}
                                    />
                                    <button
                                        onClick={handleSaveMemory}
                                        disabled={saving || !inputText.trim()}
                                        className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${saving || !inputText.trim()
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                            : 'bg-pink-600 hover:bg-pink-700 text-white shadow-pink-200'
                                        }`}
                                    >
                                        {saving ? <Loader2 className="animate-spin" /> : <Save />}
                                        {saving ? 'Guardant...' : 'Guardar Record'}
                                    </button>
                                </div>
                            </div>
                        )}
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
                                    {memory.date}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {memories.length === 0 && !saving && (
                    <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <ImageIcon className="w-10 h-10 opacity-30 text-pink-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">{t('loot.empty_gallery')}</p>
                        <p className="text-sm opacity-70">Puja fotos dels teus millors moments per recordar què et fa feliç.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TheLoot;
