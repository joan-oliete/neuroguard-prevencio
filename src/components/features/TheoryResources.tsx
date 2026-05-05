import React, { useState } from 'react';
import { BookOpen, Download, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import FlashcardGame from './FlashcardGame';
import PresentationViewer from './PresentationViewer';

const TheoryResources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'infographic' | 'flashcards' | 'presentation'>('infographic');

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-indigo-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
            <Brain className="w-10 h-10 text-indigo-300" />
            Neurociència del Cos
          </h2>
          <p className="text-indigo-100 text-lg max-w-2xl mb-8">
            Comprèn com el teu cervell i el teu cos interactuen. Basat en els estudis de Nazareth Castellanos, descobreix com l'organisme sencer participa en la teva salut mental.
          </p>
          <div className="flex flex-wrap gap-4">
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('infographic')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'infographic' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Infografia Resum
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all ${
            activeTab === 'flashcards' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Targetes
        </button>
        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold transition-all ${
            activeTab === 'presentation' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Presentació Interactiva
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
        {activeTab === 'infographic' ? (
          <div className="animate-fadeIn">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-indigo-600" /> Idees Clau
            </h3>
            <div className="w-full rounded-2xl shadow-md border border-slate-200 overflow-hidden bg-white">
              <img 
                src="/assets/infografia_nazaret.jpg" 
                alt="Infografia Nazareth Castellanos" 
                className="w-full h-auto object-contain block"
              />
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">
              Aquesta infografia resumeix els punts clau de la neurociència integral del cos. Fes zoom per veure els detalls.
            </p>
          </div>
        ) : activeTab === 'flashcards' ? (
          <div className="animate-fadeIn">
             <FlashcardGame />
          </div>
        ) : (
          <div className="animate-fadeIn">
             <PresentationViewer />
          </div>
        )}
      </div>
    </div>
  );
};

export default TheoryResources;
