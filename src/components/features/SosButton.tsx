import React, { useState, useEffect } from 'react';
import { UserProfileType } from '../../types';

interface SosButtonProps {
  profileType: UserProfileType;
  inline?: boolean;
}

const SosButton: React.FC<SosButtonProps> = ({ profileType, inline = false }) => {
  const [active, setActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes standard
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (active && !success && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (active && timeLeft === 0 && !success) {
      setSuccess(true);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft, success]);

  // Breathing animation logic
  useEffect(() => {
    if (!active || success) return;
    const breathCycle = setInterval(() => {
      setBreathingPhase((current) => {
        if (current === 'inhale') return 'hold';
        if (current === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000); // Simple 4-4-4 cycle simulation
    return () => clearInterval(breathCycle);
  }, [active, success]);

  const resetTimer = () => {
    setActive(false);
    setSuccess(false);
    setTimeLeft(180);
  };

  const getStyles = () => {
    switch (profileType) {
      case 'adolescent':
        return 'bg-red-600 hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.7)] font-mono tracking-widest uppercase';
      case 'adult':
        return 'bg-rose-500 hover:bg-rose-600 font-sans shadow-md';
      case 'elderly':
        return 'bg-orange-500 hover:bg-orange-600 text-2xl font-bold py-4 px-8 rounded-2xl shadow-lg';
      default:
        return 'bg-blue-500';
    }
  };

  const getLabel = () => {
    if (profileType === 'adolescent') return 'PROTOCOL SOS';
    if (profileType === 'elderly') return 'NECESSITO AJUDA ARA';
    return 'SOS: Urge Surfing';
  };

  return (
    <>
      <button
        onClick={() => setActive(true)}
        className={`${inline ? 'w-full' : 'fixed bottom-6 right-6 z-50'} text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 ${getStyles()}`}
      >
        {getLabel()}
      </button>

      {active && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-6 animate-fadeIn">
          <div className="text-center max-w-md w-full">
            
            {success ? (
              <div className="animate-fadeIn">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold mb-4 text-green-400">
                  Felicitats!
                </h2>
                <p className="text-xl mb-8 text-gray-200">
                  Has superat l'onada de l'impuls. Has demostrat que tens el control.
                </p>
                <button
                  onClick={resetTimer}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-green-900/50"
                >
                  Tornar a la calma
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-8 animate-pulse">
                  No actuïs. Només observa.
                </h2>
                
                <div className={`w-64 h-64 mx-auto rounded-full flex items-center justify-center border-4 transition-all duration-[4000ms] mb-8
                  ${breathingPhase === 'inhale' ? 'scale-110 border-blue-400 bg-blue-900/30' : 
                    breathingPhase === 'hold' ? 'scale-110 border-blue-200 bg-blue-800/50' : 
                    'scale-90 border-blue-600 bg-blue-950/30'}`}>
                  <span className="text-2xl font-light">
                    {breathingPhase === 'inhale' ? 'Inspira...' : 
                     breathingPhase === 'hold' ? 'Aguanta...' : 'Expira...'}
                  </span>
                </div>

                <p className="text-xl mb-4 text-gray-300">
                  L'impuls és com una onada. Pujarà, trencarà i desapareixerà.
                </p>
                
                <div className="text-4xl font-mono mb-8">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>

                <button
                  onClick={() => setActive(false)}
                  className="text-gray-400 hover:text-white underline"
                >
                  Estic millor, tancar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SosButton;
