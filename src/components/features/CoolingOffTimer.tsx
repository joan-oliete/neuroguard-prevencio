import React, { useState, useEffect } from 'react';

interface CoolingOffTimerProps {
  onCancel: () => void;
  onComplete?: () => void;
  initialDuration?: number; // in seconds
}

const REFLECTION_QUESTIONS = [
  "Estàs actuant per necessitat o per ansietat?",
  "Com et sentiràs 10 minuts després de fer-ho?",
  "Aquesta acció estava planejada ahir?",
  "Què passaria si esperes fins demà?",
  "Estàs intentant omplir un buit emocional?",
  "Respira... Inspira calma, expira desig.",
  "Això t'acosta o t'allunya dels teus valors?",
  "Quin consell li donaries al teu millor amic ara mateix?"
];

const CoolingOffTimer: React.FC<CoolingOffTimerProps> = ({
  onCancel,
  onComplete,
  initialDuration = 1200 // 20 minutes default
}) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');

  // Timer logic
  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onComplete]);

  // Question rotation logic
  useEffect(() => {
    const rotater: ReturnType<typeof setInterval> = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % REFLECTION_QUESTIONS.length);
    }, 10000); // Change question every 10 seconds
    return () => clearInterval(rotater);
  }, []);

  // Breathing animation logic (6 seconds cycle)
  useEffect(() => {
    const breather: ReturnType<typeof setInterval> = setInterval(() => {
      setBreathPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 3000);
    return () => clearInterval(breather);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((initialDuration - timeLeft) / initialDuration) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white/95 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 relative overflow-hidden text-center border border-white/50 ring-1 ring-brand-100">

        {/* Soft Background Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight relative z-10">Pausa de Reflexió</h2>
        <p className="text-slate-500 mb-10 relative z-10 font-medium">L'impuls passarà. Dóna't un moment.</p>

        {/* Breathing Circle / Timer Container */}
        <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center z-10">
          {/* Breathing Animation Ring */}
          <div
            className={`absolute inset-0 rounded-full bg-brand-100/30 transition-transform duration-[3000ms] ease-in-out ${breathPhase === 'inhale' ? 'scale-125 opacity-100' : 'scale-100 opacity-50'
              }`}
          />
          <div
            className={`absolute inset-0 rounded-full border-2 border-brand-200 bg-brand-50/50 transition-transform duration-[3000ms] ease-in-out ${breathPhase === 'inhale' ? 'scale-110' : 'scale-95'
              }`}
          />

          {/* Progress Ring (SVG) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm">
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="#6366f1" // Indigo-500
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time Text */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl text-brand-700 font-light tracking-wider">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-brand-400 uppercase tracking-widest mt-2 font-bold">
              Refredant
            </span>
          </div>
        </div>

        {/* Reflection Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm min-h-[100px] flex items-center justify-center border border-slate-100 relative z-10">
          <p key={questionIndex} className="text-lg text-slate-700 italic font-medium animate-fadeIn transition-opacity leading-relaxed">
            "{REFLECTION_QUESTIONS[questionIndex]}"
          </p>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          {timeLeft === 0 ? (
            <button
              onClick={onCancel}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand-200 transform hover:-translate-y-0.5"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-rose-500 font-medium underline text-sm transition-colors py-2"
            >
              No necessito actuar ara, cancel·lar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoolingOffTimer;
