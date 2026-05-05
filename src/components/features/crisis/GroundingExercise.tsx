import React, { useState, useEffect } from 'react';
import { Leaf, Eye, Ear, Hand, Wind, Coffee, CheckCircle2, ChevronRight, PlayCircle, PauseCircle } from 'lucide-react';

const GroundingExercise: React.FC = () => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  
  const steps = [
    {
      id: 5,
      title: '5 Coses que pots veure',
      icon: <Eye className="w-8 h-8 text-blue-500" />,
      description: 'Observa el teu entorn. Busca 5 coses que normalment no hi prestes atenció. Pot ser una ombra, una textura, un objecte petit...',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 4,
      title: '4 Coses que pots sentir (tacte)',
      icon: <Hand className="w-8 h-8 text-green-500" />,
      description: 'Fixa\'t en 4 coses que puguis tocar ara mateix. La textura de la roba, la temperatura de l\'aire, la cadira on seus...',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 3,
      title: '3 Coses que pots escoltar',
      icon: <Ear className="w-8 h-8 text-yellow-500" />,
      description: 'Tanca els ulls si vols i escolta 3 sons. No et centris en la teva ment, sinó en el món exterior. El vent, un cotxe, els teus passos...',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      id: 2,
      title: '2 Coses que pots olorar',
      icon: <Wind className="w-8 h-8 text-purple-500" />,
      description: 'Quines 2 olors pots captar ara mateix? L\'aire lliure, el sabó, o potser res en particular? Està bé, només nota-ho.',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 1,
      title: '1 Cosa que pots assaborir',
      icon: <Coffee className="w-8 h-8 text-orange-500" />,
      description: 'Quin és el sabor a la teva boca en aquest moment? Pots beure un glop d\'aigua o simplement notar el sabor neutre.',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      if (!completed.includes(step)) {
        setCompleted([...completed, step]);
      }
      setStep(step + 1);
    } else {
      if (!completed.includes(step)) {
        setCompleted([...completed, step]);
      }
    }
  };

  const handleReset = () => {
    setStep(0);
    setCompleted([]);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          Tècnica d'Arrelament (Grounding) 5-4-3-2-1
        </h3>
        <span className="text-sm font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
          Pas {step + 1} de 5
        </span>
      </div>

      <div className="p-6">
        <p className="text-slate-600 mb-6 text-sm">
          Aquesta tècnica t'ajudarà a tornar al moment present i reduir l'ansietat connectant amb els teus sentits.
        </p>

        {completed.length === 5 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-slate-800 mb-2">Exercici Completat</h4>
            <p className="text-slate-600 mb-6">Has fet una bona feina connectant amb el present. Com et sents ara?</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Tornar a començar
            </button>
          </div>
        ) : (
          <div className={`p-6 rounded-xl border ${steps[step].color} transition-all duration-300 transform scale-100`}>
            <div className="flex justify-center mb-4">
              {steps[step].icon}
            </div>
            <h4 className="text-lg font-semibold text-center mb-2 text-slate-800">
              {steps[step].title}
            </h4>
            <p className="text-slate-700 text-center mb-8">
              {steps[step].description}
            </p>
            
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-300 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Ho tinc, següent pas <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex justify-center mt-6 gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx === step ? 'bg-emerald-500' : 
                completed.includes(idx) ? 'bg-emerald-200' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroundingExercise;
