import React, { useState } from 'react';
import flashcardsData from '../../data/flashcards.json';
import { RefreshCcw, ChevronLeft, ChevronRight, Brain } from 'lucide-react';

const FlashcardGame: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcardsData.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcardsData.length) % flashcardsData.length);
    }, 150);
  };

  const currentCard = flashcardsData[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <Brain className="text-indigo-600" /> Flashcards de Neurociència
        </h3>
        <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
          {currentIndex + 1} / {flashcardsData.length}
        </span>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full h-64 sm:h-80 perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front (Question) */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-indigo-100 rounded-2xl shadow-md p-6 sm:p-10 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:shadow-lg transition-all">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-4 block">Pregunta</span>
            <p className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
              {currentCard.q}
            </p>
            <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2">
              <RefreshCcw size={16} /> Toca per girar
            </div>
          </div>

          {/* Back (Answer) */}
          <div className="absolute w-full h-full backface-hidden bg-indigo-600 border-2 border-indigo-600 rounded-2xl shadow-md p-6 sm:p-10 flex flex-col items-center justify-center text-center rotate-y-180 text-white">
            <span className="text-xs uppercase tracking-widest text-indigo-200 font-bold mb-4 block">Resposta</span>
            <p className="text-lg sm:text-2xl font-bold leading-tight drop-shadow-sm">
              {currentCard.a}
            </p>
            <div className="absolute bottom-6 text-indigo-200 text-sm flex items-center gap-2">
              <RefreshCcw size={16} /> Toca per girar
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center mt-8 gap-6">
        <button 
          onClick={handlePrev}
          className="p-3 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-sm text-slate-500 font-medium">
          Llisca o fes servir les fletxes
        </div>
        <button 
          onClick={handleNext}
          className="p-3 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Required CSS to put somewhere, but we'll use inline standard Tailwind mostly and some custom utilities via index.css */}
    </div>
  );
};

export default FlashcardGame;
