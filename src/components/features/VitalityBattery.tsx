
import React from 'react';

interface VitalityBatteryProps {
  percentage: number;
  onRecharge: () => void;
  draining: boolean;
}

const VitalityBattery: React.FC<VitalityBatteryProps> = ({ percentage, onRecharge, draining }) => {
  // Determine color based on percentage (Teal for high, Coral for low)
  const getColor = () => {
    if (percentage > 60) return 'text-[#00897B] stroke-[#00897B]'; // Teal
    if (percentage > 30) return 'text-yellow-600 stroke-yellow-600';
    return 'text-[#FF7043] stroke-[#FF7043]'; // Coral
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-soft border border-slate-100 h-full">
      <div className='flex items-center gap-2 mb-6'>
        <h3 className="text-lg font-bold text-slate-700 font-sans">Bateria de Vitalitat</h3>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer Ring Background */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress Ring */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            className={`transition-all duration-1000 ease-out ${getColor()}`}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="flex flex-col items-center z-10">
          <span className={`text-5xl font-bold font-sans tracking-tighter ${getColor().replace('stroke', 'text').split(' ')[0]}`}>
            {Math.round(percentage)}%
          </span>
          <span className="text-slate-400 text-xs mt-1 uppercase tracking-wide font-medium">
            {draining ? 'Drenant...' : 'Estable'}
          </span>
        </div>

        {/* Pulse effect if draining */}
        {draining && (
          <div className="absolute inset-0 rounded-full border-4 border-rose-100 animate-ping opacity-20 pointer-events-none"></div>
        )}
      </div>

      <p className="text-center text-slate-500 mt-4 mb-6 text-sm leading-relaxed px-4">
        {percentage < 30
          ? "Nivells crítics. Desconnecta per recarregar."
          : "Sistema estable. Mantingues l'equilibri offline."}
      </p>

      <button
        onClick={onRecharge}
        className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 text-sm shadow-md shadow-accent-200 flex items-center justify-center gap-2"
        style={{ minHeight: '48px' }}
      >
        <span>⚡</span> Registrar Activitat Offline
      </button>
    </div>
  );
};

export default VitalityBattery;
