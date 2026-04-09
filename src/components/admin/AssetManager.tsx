import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Film, RefreshCw, X } from 'lucide-react';
import { uploadGameAsset, getGameAssets, deleteAsset, GameAsset } from '../../services/assetService';

export const AssetManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [path, setPath] = useState('gym/memory');
    const [assets, setAssets] = useState<GameAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const items = await getGameAssets(path);
            setAssets(items);
        } catch (error) {
            console.error("Error loading assets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssets();
    }, [path]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        try {
            await uploadGameAsset(file, path);
            await loadAssets(); // Refresh
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Error al pujar l'arxiu.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (assetPath: string) => {
        if (!confirm("Segur que vols esborrar aquest arxiu?")) return;
        try {
            await deleteAsset(assetPath);
            setAssets(prev => prev.filter(a => a.path !== assetPath));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-slate-800 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ImageIcon /> Gestor d'Actius Multimèdia
                        </h2>
                        <p className="text-slate-400 text-sm">Puja imatges i vídeos per als jocs.</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50">
                    <select
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="p-2 border rounded-lg bg-white font-medium text-slate-700 shadow-sm"
                    >
                        <option value="gym/memory">Memory Matrix (Imatges)</option>
                        <option value="gym/focus">Focus Flow (Fons)</option>
                        <option value="roleplay/scenarios">Roleplay (Escenaris)</option>
                    </select>

                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                            accept="image/*,video/*"
                        />
                        <label
                            htmlFor="file-upload"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white shadow-md cursor-pointer transition-all ${uploading ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700'}`}
                        >
                            {uploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                            {uploading ? 'Pujant...' : 'Pujar Arxiu'}
                        </label>
                    </div>

                    <button onClick={loadAssets} className="p-2 text-slate-400 hover:text-brand-600"><RefreshCw size={20} /></button>
                </div>

                {/* Gallery Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-slate-400">Carregant...</div>
                    ) : assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-300 rounded-xl m-4">
                            <ImageOff />
                            <p className="mt-2 font-medium">Aquesta carpeta està buida.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {assets.map(asset => (
                                <div key={asset.path} className="group relative bg-white rounded-xl shadow-sm overflow-hidden aspect-square border border-slate-200">
                                    {asset.type === 'image' ? (
                                        <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                            <Film className="text-white" size={32} />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <span className="text-white text-xs px-2 text-center truncate w-full">{asset.name}</span>
                                        <button
                                            onClick={() => handleDelete(asset.path)}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-transform hover:scale-110"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ImageOff = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M21 21l-3.5-3.5C21 16 21 16 21 16l-5-5-2-2m-2-2l-2-2"></path>
        <path d="M3 3l18 18"></path>
    </svg>
);
