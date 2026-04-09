import React, { useState } from 'react';
import { RelapseManual, Trigger, TrapThought, SupportPerson, MotivationItem } from '../../types';
import { updateDoc, doc, db, arrayUnion, arrayRemove } from '../../services/firebase';
import { Compass, AlertTriangle, Shield, TrendingUp, Book, Trash2, Plus, LifeBuoy, ChevronDown, ChevronUp } from 'lucide-react';
import PreventionSection from './PreventionSection';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface ManualDashboardProps {
  manual: RelapseManual;
  manualId: string;
  userId: string;
  isReadOnly?: boolean;
  onBack?: () => void;
}

const ALL_VALUES = ['Honestedat', 'Connexió', 'Respecte', 'Creativitat', 'Aprenentatge', 'Salut', 'Seguretat', 'Aventura', 'Compassió', 'Llibertat', 'Família', 'Amistat', 'Creixement', 'Pau interior', 'Diversió'];

// --- SUB-COMPONENTS ---

const MotivationsSection = ({ manual, manualRef }: { manual: RelapseManual, manualRef: any }) => {
  const [input, setInput] = useState('');

  const addMotivation = async (text: string) => {
    if (!text.trim()) return;
    const newItem: MotivationItem = { id: Date.now(), text };
    await updateDoc(manualRef, { motivations: arrayUnion(newItem) });
  };

  const removeMotivation = async (item: MotivationItem) => {
    await updateDoc(manualRef, { motivations: arrayRemove(item) });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <h3 className="text-xl font-bold text-slate-800">El meu punt de partida: Motivacions</h3>
      <p className="text-slate-500">Per què vull canviar? Quina vida vull viure?</p>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 border p-3 rounded-xl" placeholder="Escriu una motivació..." />
        <button onClick={() => { addMotivation(input); setInput(''); }} className="bg-indigo-600 text-white px-6 rounded-xl font-bold">Afegir</button>
      </div>
      <div className="space-y-2">
        {manual.motivations?.map(m => (
          <div key={m.id} className="bg-white p-3 border rounded-xl flex justify-between items-center shadow-sm">
            <span>{m.text}</span>
            <button onClick={() => removeMotivation(m)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ValuesSection = ({ manual, manualRef }: { manual: RelapseManual, manualRef: any }) => {
  const [expandedValue, setExpandedValue] = useState<string | null>(null);

  const toggleValue = async (val: string) => {
    let current = [...(manual.values?.selected || [])];

    if (current.includes(val)) {
      // Remove value
      current = current.filter(v => v !== val);
      await updateDoc(manualRef, { 'values.selected': current });
      if (expandedValue === val) setExpandedValue(null);
    } else {
      // Add value
      if (current.length >= 7) return alert("Pots seleccionar un màxim de 7 valors.");
      current.push(val);

      const updates: any = { 'values.selected': current };

      // Initialize details if not present (Check deeply if exists)
      const existingDetails = manual.values?.details?.[val];
      if (!existingDetails) {
        updates[`values.details.${val}`] = {
          definition: 'Aquest valor és important per a mi perquè...',
          importance: 5,
          alignment: 5
        };
      }

      await updateDoc(manualRef, updates);
      setExpandedValue(val); // Auto-expand new value
    }
  };

  const updateValueDetail = async (val: string, field: string, value: any) => {
    await updateDoc(manualRef, { [`values.details.${val}.${field}`]: value });
  };

  // Prepare data for Radar Chart
  const chartData = manual.values?.selected?.map(val => ({
    subject: val,
    A: manual.values.details?.[val]?.importance || 0,
    B: manual.values.details?.[val]?.alignment || 0,
    fullMark: 10,
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-slate-800">Els meus Valors (La Brúixola)</h3>

      {/* Visual Chart */}
      {chartData.length > 2 && (
        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Importància" dataKey="A" stroke="#ea580c" fill="#ea580c" fillOpacity={0.3} />
              <Radar name="Alineació" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_VALUES.map(v => (
          <button
            key={v}
            onClick={() => toggleValue(v)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${manual.values?.selected?.includes(v)
              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {manual.values?.selected?.length === 0 && (
          <p className="text-slate-400 text-center italic py-8">Selecciona els valors que guien la teva vida per començar.</p>
        )}

        {manual.values?.selected?.map(v => {
          const detail = manual.values.details?.[v] || { definition: '', importance: 5, alignment: 5 };
          const isExpanded = expandedValue === v;

          return (
            <div key={v} className={`bg-white border rounded-xl shadow-sm transition-all overflow-hidden ${isExpanded ? 'ring-2 ring-indigo-100 shadow-md' : ''}`}>
              <div
                onClick={() => setExpandedValue(isExpanded ? null : v)}
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-700 text-lg">{v}</span>
                  {!isExpanded && (
                    <div className="flex gap-2 text-xs text-slate-400 animate-fadeIn">
                      <span title="Importància">Imp: {detail.importance}</span>
                      <span title="Alineació">Ali: {detail.alignment}</span>
                    </div>
                  )}
                </div>
                <button className="text-slate-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-500 mb-1 mt-3 uppercase">Definició Personal</label>
                  <textarea
                    placeholder="Què significa per a tu?"
                    className="w-full border border-slate-200 p-3 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-indigo-200 outline-none shadow-inner bg-white/80"
                    rows={3}
                    value={detail.definition}
                    onChange={(e) => updateValueDetail(v, 'definition', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-lg border border-slate-200 shadow-inner">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-slate-500">Importància</label>
                        <span className="text-xs font-bold text-indigo-600">{detail.importance}/10</span>
                      </div>
                      <input
                        type="range" min="0" max="10"
                        className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        value={detail.importance}
                        onChange={e => updateValueDetail(v, 'importance', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-slate-500">Alineació Actual</label>
                        <span className="text-xs font-bold text-indigo-600">{detail.alignment}/10</span>
                      </div>
                      <input
                        type="range" min="0" max="10"
                        className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        value={detail.alignment}
                        onChange={e => updateValueDetail(v, 'alignment', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PatternsSection = ({ manual, manualRef }: { manual: RelapseManual, manualRef: any }) => {
  const [triggerInput, setTriggerInput] = useState('');
  const [triggerType, setTriggerType] = useState('external');
  const [trapInput, setTrapInput] = useState('');

  const addTrigger = async (desc: string, type: string) => {
    const t: Trigger = { id: Date.now(), external: type === 'external' ? desc : '', internal: type === 'internal' ? desc : '', physical: type === 'physical' ? desc : '' };
    await updateDoc(manualRef, { triggers: arrayUnion(t) });
  };

  const addTrap = async (text: string) => {
    const t: TrapThought = { id: Date.now(), thought: text, reframe: '' };
    await updateDoc(manualRef, { trapThoughts: arrayUnion(t) });
  };

  const updateTrapReframe = async (trap: TrapThought, reframe: string) => {
    const newTraps = manual.trapThoughts.map(t => t.id === trap.id ? { ...t, reframe } : t);
    await updateDoc(manualRef, { trapThoughts: newTraps });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Triggers */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500" /> Senyals d'Alerta</h3>
        <div className="flex gap-2 mb-4">
          <select value={triggerType} onChange={e => setTriggerType(e.target.value)} className="border p-3 rounded-xl bg-white text-sm">
            <option value="external">Extern</option>
            <option value="internal">Intern</option>
            <option value="physical">Físic</option>
          </select>
          <input value={triggerInput} onChange={e => setTriggerInput(e.target.value)} className="flex-1 border p-3 rounded-xl" placeholder="Descripció..." />
          <button onClick={() => { addTrigger(triggerInput, triggerType); setTriggerInput(''); }} className="bg-red-500 text-white px-4 rounded-xl font-bold">+</button>
        </div>
        <div className="grid gap-2">
          {manual.triggers?.map(t => (
            <div key={t.id} className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm flex justify-between items-center shadow-sm">
              <span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded mr-2 ${t.external ? 'bg-blue-100 text-blue-700' : t.internal ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                  {t.external ? 'EXTERN' : t.internal ? 'INTERN' : 'FÍSIC'}
                </span>
                {t.external || t.internal || t.physical}
              </span>
              <button onClick={() => updateDoc(manualRef, { triggers: arrayRemove(t) })} className="text-red-300 hover:text-red-600 bg-white rounded-full p-1"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Trap Thoughts */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="text-amber-500" /> Pensaments Trampa</h3>
        <div className="flex gap-2 mb-4">
          <input value={trapInput} onChange={e => setTrapInput(e.target.value)} className="flex-1 border p-3 rounded-xl" placeholder="Pensament: 'Per un no passa res...'" />
          <button onClick={() => { addTrap(trapInput); setTrapInput(''); }} className="bg-amber-500 text-white px-4 rounded-xl font-bold">+</button>
        </div>
        <div className="space-y-4">
          {manual.trapThoughts?.map(t => (
            <div key={t.id} className="p-4 bg-amber-50 border border-amber-100 rounded-xl shadow-sm">
              <div className="flex justify-between mb-2">
                <p className="font-bold text-amber-900 italic">"{t.thought}"</p>
                <button onClick={() => updateDoc(manualRef, { trapThoughts: arrayRemove(t) })} className="text-amber-400 hover:text-amber-700"><Trash2 size={16} /></button>
              </div>
              <textarea
                placeholder="Resposta racional/alternativa..."
                className="w-full p-2 rounded border border-amber-200 text-sm focus:ring-2 focus:ring-amber-200 outline-none"
                value={t.reframe}
                onChange={(e) => updateTrapReframe(t, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SupportSection = ({ manual, manualRef }: { manual: RelapseManual, manualRef: any }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('');

  const addSupport = async () => {
    if (!name) return;
    const p: SupportPerson = { id: Date.now(), name, contact, role };
    await updateDoc(manualRef, { supportNetwork: arrayUnion(p) });
    setName(''); setContact(''); setRole('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Support Network */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield className="text-green-600" /> Xarxa de Suport</h3>
        <div className="grid md:grid-cols-3 gap-2 mb-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" className="border p-2 rounded-lg" />
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contacte" className="border p-2 rounded-lg" />
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="Rol (ex: escolta)" className="border p-2 rounded-lg" />
        </div>
        <button onClick={addSupport} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold mb-4 shadow-md hover:bg-green-700 transition-colors">Afegir Persona</button>

        <div className="grid md:grid-cols-2 gap-4">
          {manual.supportNetwork?.map(p => (
            <div key={p.id} className="p-4 border border-green-200 bg-green-50 rounded-xl relative shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">{p.name.charAt(0)}</div>
                <h4 className="font-bold text-green-900">{p.name}</h4>
              </div>
              <p className="text-sm text-green-700 mb-2 pl-10">{p.contact}</p>
              <span className="text-xs bg-white px-2 py-1 rounded border border-green-100 ml-10 inline-block text-green-600 font-medium">{p.role}</span>
              <button onClick={() => updateDoc(manualRef, { supportNetwork: arrayRemove(p) })} className="absolute top-2 right-2 text-green-400 hover:text-green-700"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ManualDashboard: React.FC<ManualDashboardProps> = ({ manual, manualId, userId }) => {
  const [activeSection, setActiveSection] = useState('motivations');
  const manualRef = doc(db, `users/${userId}/manuals`, manualId);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="md:w-72 bg-slate-50/50 border-r border-slate-100 flex flex-row md:flex-col overflow-x-auto md:overflow-visible flex-shrink-0 p-4 gap-2">

        <div className="hidden md:block px-4 py-4 mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual de Recuperació</h3>
        </div>

        <button onClick={() => setActiveSection('motivations')} className={`p-4 rounded-xl text-left font-bold text-sm transition-all flex items-center gap-3 ${activeSection === 'motivations' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}>
          <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs ${activeSection === 'motivations' ? 'bg-white/20' : 'bg-slate-200'}`}>1</span>
          Punt de Partida
        </button>

        <button onClick={() => setActiveSection('values')} className={`p-4 rounded-xl text-left font-bold text-sm transition-all flex items-center gap-3 ${activeSection === 'values' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}>
          <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs ${activeSection === 'values' ? 'bg-white/20' : 'bg-slate-200'}`}>2</span>
          Brúixola de Valors
        </button>

        <button onClick={() => setActiveSection('patterns')} className={`p-4 rounded-xl text-left font-bold text-sm transition-all flex items-center gap-3 ${activeSection === 'patterns' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}>
          <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs ${activeSection === 'patterns' ? 'bg-white/20' : 'bg-slate-200'}`}>3</span>
          Patrons & Trampes
        </button>

        <button onClick={() => setActiveSection('support')} className={`p-4 rounded-xl text-left font-bold text-sm transition-all flex items-center gap-3 ${activeSection === 'support' ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}>
          <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs ${activeSection === 'support' ? 'bg-white/20' : 'bg-slate-200'}`}>4</span>
          Xarxa de Suport
        </button>

        <button onClick={() => setActiveSection('prevention')} className={`p-4 rounded-xl text-left font-bold text-sm transition-all flex items-center gap-3 ${activeSection === 'prevention' ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}>
          <LifeBuoy size={18} className={activeSection === 'prevention' ? 'animate-pulse' : ''} />
          Kit d'Emergència
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white/50">
        {activeSection === 'motivations' && <MotivationsSection manual={manual} manualRef={manualRef} />}
        {activeSection === 'values' && <ValuesSection manual={manual} manualRef={manualRef} />}
        {activeSection === 'patterns' && <PatternsSection manual={manual} manualRef={manualRef} />}
        {activeSection === 'support' && <SupportSection manual={manual} manualRef={manualRef} />}
        {activeSection === 'prevention' && <PreventionSection />}
      </div>
    </div>
  );
};

export default ManualDashboard;
