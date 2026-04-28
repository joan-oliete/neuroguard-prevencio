import React, { useState, useRef } from 'react';
import { Memory } from '../../types';
import { Camera as CameraIcon, Image as ImageIcon, Sparkles, Loader, X, Lock } from 'lucide-react';
import { generateMemoryImage } from '../../services/geminiService';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface RealLifeAlbumProps {
  memories: Memory[];
  onAddMemory: (note: string, imageUrl?: string) => void;
  canAdd: boolean;
}

const RealLifeAlbum: React.FC<RealLifeAlbumProps> = ({ memories, onAddMemory, canAdd }) => {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        width: 800,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      if (image.base64String) {
        setSelectedImage(`data:image/${image.format || 'jpeg'};base64,${image.base64String}`);
      }
    } catch (err: any) {
      console.error("Error with camera:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      let finalImage = selectedImage;
      
      // If no image provided, try to generate one
      if (!finalImage) {
        setIsGenerating(true);
        try {
          // Attempt to generate an image based on the mood/text
          const generated = await generateMemoryImage(newNote);
          if (generated) {
            finalImage = generated;
          }
        } catch (err) {
          console.error("Failed to generate AI image", err);
        } finally {
          setIsGenerating(false);
        }
      }

      onAddMemory(newNote, finalImage || undefined);
      setNewNote('');
      setSelectedImage(null);
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-2xl font-bold text-slate-800 font-sans flex items-center gap-2">
            <CameraIcon className="w-8 h-8 text-indigo-600"/> Àlbum de Vida Real
            </h3>
            <p className="text-slate-500 text-sm mt-1">Col·lecciona moments offline. Guanya vitalitat.</p>
        </div>
        
        {canAdd && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4"/> + Nova Memòria
          </button>
        )}
      </div>

      {!canAdd && !isAdding && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-4 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2">
             <Lock className="w-6 h-6 text-slate-400"/>
          </div>
          <p className="text-slate-500 font-medium">
            Carrega la bateria de vitalitat per desbloquejar l'accés.
          </p>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-fadeIn relative">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
              <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-3"/>
              <p className="text-indigo-800 font-bold text-lg">La IA està pintant el teu record...</p>
            </div>
          )}
          
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Què has viscut offline?</label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 outline-none min-h-[120px] text-lg mb-4 bg-white placeholder:text-slate-400"
            placeholder="Un passeig pel bosc, un cafè amb un amic, llegir un llibre..."
          />
          
          <div className="mb-6">
            {selectedImage ? (
              <div className="relative inline-block">
                <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover rounded-xl shadow-sm" />
                <button 
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={handleImageUpload}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <span className="font-medium">Pujar foto real</span>
                <span className="text-xs text-slate-400">(Opcional: Si no en tens, la IA en generarà una basada en el text!)</span>
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 transform active:scale-95">Guardar Record</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors">Cancel·lar</button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
        {memories.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300">
            <CameraIcon className="w-16 h-16 mb-4 opacity-50"/>
            <p className="text-lg font-medium">L'àlbum està buit.</p>
            <p className="text-sm">Viu moments reals per omplir-lo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((mem) => (
                <div key={mem.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1">
                {mem.imageUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden h-48 relative">
                        <img src={mem.imageUrl} alt="Memory" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                )}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase tracking-wider">{mem.date}</span>
                    <span className="text-[10px] text-slate-400 border border-slate-100 px-2 py-1 rounded-full bg-slate-50">XP +50</span>
                </div>
                <p className="text-slate-700 text-lg font-medium leading-relaxed">{mem.note}</p>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealLifeAlbum;
