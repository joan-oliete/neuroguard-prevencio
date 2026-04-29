import React, { useState, useEffect } from 'react';
import { Shield, BrainCircuit, Heart, CloudLightning, PhoneCall, CheckCircle, Wind, Zap, Smile } from 'lucide-react';

interface PreventionProps {
  onNavigate?: (view: string) => void;
}

const PreventionSection: React.FC<PreventionProps> = ({ onNavigate }) => {
  const [haltCheck, setHaltCheck] = useState<string[]>([]);
  const [dailyChecks, setDailyChecks] = useState<number[]>([]);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState('Inspira');

  // Breathing Logic
  useEffect(() => {
    let interval: any;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathCount((prev) => (prev + 1) % 16);
      }, 1000);
    } else {
      setBreathCount(0);
      setBreathPhase('Inspira');
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  useEffect(() => {
    if (!breathingActive) return;
    if (breathCount < 4) setBreathPhase('Inspira (4s)');
    else if (breathCount < 8) setBreathPhase('Aguanta (4s)');
    else if (breathCount < 12) setBreathPhase('Expira (4s)');
    else setBreathPhase('Descansa (4s)');
  }, [breathCount, breathingActive]);

  const toggleHalt = (item: string) => {
    if (haltCheck.includes(item)) {
      setHaltCheck(haltCheck.filter(i => i !== item));
    } else {
      setHaltCheck([...haltCheck, item]);
    }
  };

  const toggleDaily = (index: number) => {
    if (dailyChecks.includes(index)) {
      setDailyChecks(dailyChecks.filter(i => i !== index));
    } else {
      setDailyChecks([...dailyChecks, index]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <h3 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-4 mb-6">Eines Pràctiques de Prevenció</h3>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Mindfulness: Box Breathing */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Wind className="w-5 h-5 text-sky-500"/> Respiració Quadrada
              </h4>
              <button 
                onClick={() => setBreathingActive(!breathingActive)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${breathingActive ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}
              >
                {breathingActive ? 'Aturar' : 'Iniciar'}
              </button>
           </div>
           
           <div className="flex flex-col items-center justify-center py-6">
              <div className={`w-32 h-32 border-4 rounded-full flex items-center justify-center transition-all duration-1000 ${breathingActive ? 'border-sky-400 scale-110' : 'border-slate-200'}`}>
                 <span className="text-xl font-bold text-slate-700">{breathingActive ? breathPhase.split(' ')[0] : 'Relax'}</span>
              </div>
              {breathingActive && <p className="text-sm text-sky-600 mt-4 font-medium">{breathPhase}</p>}
              {!breathingActive && <p className="text-xs text-slate-400 mt-4 text-center">Tècnica per reduir l'ansietat en 1 minut.</p>}
           </div>
        </div>

        {/* Quick Coping Strategies */}
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
           <h4 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5"/> Afrontament Ràpid (SOS)
          </h4>
          <div className="space-y-2">
             <div className="bg-white/60 p-3 rounded-xl text-sm text-amber-800 border border-amber-200">
               <strong>5-4-3-2-1:</strong> Nomena 5 coses que veus, 4 que toques, 3 que sents, 2 que flaires, 1 que tastes.
             </div>
             <div className="bg-white/60 p-3 rounded-xl text-sm text-amber-800 border border-amber-200">
               <strong>Canvi de Temperatura:</strong> Renta't la cara amb aigua molt freda o agafa un glaçó. "Reinicia" el sistema nerviós.
             </div>
             <div className="bg-white/60 p-3 rounded-xl text-sm text-amber-800 border border-amber-200">
               <strong>Moviment Intens:</strong> Fes 20 salts (jumping jacks) o corre al lloc 1 minut per cremar l'adrenalina.
             </div>
          </div>
        </div>

        {/* HALT Strategy */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600"/> Llista de Control HALT
          </h4>
          <p className="text-sm text-slate-500 mb-4">Abans d'actuar per impuls, pregunta't si sents alguna d'aquestes coses:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'hungry', label: 'Hungry (Famolenc)', icon: '🍎' },
              { id: 'angry', label: 'Angry (Enfadat)', icon: '😠' },
              { id: 'lonely', label: 'Lonely (Sol)', icon: '😔' },
              { id: 'tired', label: 'Tired (Cansat)', icon: '😴' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => toggleHalt(item.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  haltCheck.includes(item.id) 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl mr-2">{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </div>
          {haltCheck.length > 0 && (
            <div className="mt-4 p-3 bg-indigo-100 rounded-xl text-xs text-indigo-800 font-medium">
              💡 Solució suggerida: {haltCheck.includes('hungry') ? 'Menja alguna cosa saludable.' : haltCheck.includes('tired') ? 'Descansa 20 minuts.' : haltCheck.includes('lonely') ? 'Truca a un amic.' : 'Fes 10 respiracions profundes.'}
            </div>
          )}
        </div>

        {/* Urge Surfing Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5"/> Urge Surfing
          </h4>
          <p className="text-sm opacity-90 mb-4 leading-relaxed">
            L'impuls és com una onada. Creix, arriba al pic i després trenca. No has de lluitar contra l'onada, només mantenir l'equilibri fins que passi.
          </p>
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
            <p className="font-bold text-2xl mb-1">~20 Minuts</p>
            <p className="text-xs uppercase tracking-wider opacity-80">Durada mitjana d'un impuls</p>
          </div>
        </div>

        {/* Connection Reminder */}
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
           <h4 className="font-bold text-lg text-rose-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5"/> Connexió Humana
          </h4>
          <p className="text-sm text-rose-700 mb-4">L'addicció prospera en l'aïllament. Trenca el silenci.</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-white border border-rose-200 text-rose-600 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
              <PhoneCall className="w-4 h-4"/> Trucar Suport
            </button>
            <button onClick={() => onNavigate && onNavigate('crisis')} className="flex-1 bg-white border border-rose-200 text-rose-600 py-2 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
              <CloudLightning className="w-4 h-4"/> Pla de Crisi
            </button>
          </div>
        </div>

        {/* Self-Compassion Reminder */}
        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 shadow-sm">
           <h4 className="font-bold text-lg text-purple-900 mb-2 flex items-center gap-2">
            <Smile className="w-5 h-5"/> Autocompassió
          </h4>
          <p className="text-sm text-purple-800 italic leading-relaxed">
            "Sigues amable amb tu mateix/a. Una caiguda no esborra el teu progrés, és part de l'aprenentatge. Parla't com li parlaries a un amic que està patint."
          </p>
        </div>

        {/* Daily Check */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2">
           <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500"/> Recordatori Diari
          </h4>
          <ul className="grid md:grid-cols-2 gap-3">
            {["He pres la medicació? (si cal)", "He menjat bé avui?", "He sortit de casa?", "M'he felicitat per un petit èxit?", "He connectat amb algú?", "He dedicat temps al meu hobby?"].map((item, i) => (
              <li 
                key={i} 
                onClick={() => toggleDaily(i)}
                className={`flex items-center gap-3 text-sm cursor-pointer p-3 rounded-xl transition-all border ${dailyChecks.includes(i) ? 'bg-green-50 text-green-800 border-green-200' : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'}`}
              >
                <CheckCircle className={`w-5 h-5 transition-colors ${dailyChecks.includes(i) ? 'text-green-600 fill-green-100' : 'text-slate-300'}`}/>
                <span className={dailyChecks.includes(i) ? 'line-through opacity-70' : ''}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PreventionSection;
