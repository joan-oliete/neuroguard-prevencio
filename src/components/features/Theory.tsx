import React, { useState } from 'react';
import {
  BookOpen, AlertTriangle, GitMerge, Smartphone,
  Shield, BarChart2, Info, Gavel, Menu, X, ArrowLeft
} from 'lucide-react';

import TheoryDetailModal from './theory/TheoryDetailModal';
import TheoryObservatory from './theory/TheoryObservatory';
import TheoryAddictions from './theory/TheoryAddictions';
import TheoryInteractive from './theory/TheoryInteractive';
import TheoryPrevention from './theory/TheoryPrevention';
import TheoryForense from './theory/TheoryForense';
import TheoryResources from './TheoryResources';

interface TheoryProps {
  onBack?: () => void;
}

const Theory: React.FC<TheoryProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('intro');
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  const SectionButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveSection(id); setSelectedDetail(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeSection === id
        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm translate-x-1'
        : 'text-slate-600 hover:bg-slate-50 hover:translate-x-1'
        }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn max-w-[1600px] mx-auto p-4 md:p-8 relative">

      {/* Sidebar Navigation */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
          {onBack && (
            <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold text-sm">
              <ArrowLeft size={16} /> Tornar al panell
            </button>
          )}
          <div className="mb-6 px-2 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> NeuroGuard Hub</h3>
            <p className="text-xs text-slate-500 mt-1">Recursos i dades</p>
          </div>
          <nav className="space-y-1">
            <SectionButton id="intro" label="Introducció" icon={Info} />
            <SectionButton id="observatori" label="L'Observatori" icon={BarChart2} />
            <SectionButton id="tipus" label="Tipus d'Addiccions" icon={Smartphone} />
            <SectionButton id="forense" label="Legal i Forense (CSAM)" icon={Gavel} />
            <SectionButton id="mecanismes" label="Model de Recaiguda" icon={GitMerge} />
            <SectionButton id="simptomes" label="Senyals d'Alerta" icon={AlertTriangle} />
            <SectionButton id="prevencio" label="Estratègies" icon={Shield} />
            <SectionButton id="recursos" label="Neurociència del Cos" icon={BookOpen} />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-[600px]">

        {/* MODAL DETALL */}
        <TheoryDetailModal selectedDetail={selectedDetail} onClose={() => setSelectedDetail(null)} />

        {/* Intro Section */}
        {activeSection === 'intro' && !selectedDetail && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
              <h1 className="text-4xl font-bold text-slate-800 mb-6 relative z-10">
                Un repte social <span className="text-indigo-600">creixent</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl relative z-10">
                Les addiccions socials o comportamentals, especialment les vinculades a les pantalles i al joc, representen un dels reptes més significatius per a la salut pública actual.
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-5 relative z-10">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <Info className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Missió de NeuroGuard</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Prevenir, detectar i investigar aquestes conductes per millorar la qualitat de vida de les persones afectades i les seves famílies. Aquesta eina transforma les dades en coneixement accionable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observatory Section (Charts) */}
        {activeSection === 'observatori' && !selectedDetail && (
          <TheoryObservatory />
        )}

        {/* Addiction Types */}
        {activeSection === 'tipus' && !selectedDetail && (
          <TheoryAddictions onSelect={(id) => { setSelectedDetail(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        )}

        {/* Legal & Forensic Section */}
        {activeSection === 'forense' && !selectedDetail && (
          <TheoryForense />
        )}

        {/* Theoretical Models (Marlatt Interactive) */}
        {activeSection === 'mecanismes' && !selectedDetail && (
          <TheoryInteractive />
        )}

        {/* Symptoms - Kept inline for simplicity as it was small or could be moved to TheoryAddictions or separate if needed. 
           Wait, there was a "Senyals d'Alerta" section. I should probably include it or create a component for it.
           It was simpler so maybe I can put it in TheoryAddictions or just keep it here if small.
           Actually, checking original file, it was ~25 lines. I'll make TheorySymptoms.tsx to be consistent.
        */}
        {activeSection === 'simptomes' && !selectedDetail && (
          <TheorySymptoms />
        )}

        {/* Strategies */}
        {activeSection === 'prevencio' && !selectedDetail && (
          <TheoryPrevention />
        )}

        {/* Resources (Neuroscience) */}
        {activeSection === 'recursos' && !selectedDetail && (
          <TheoryResources />
        )}

      </div>
    </div>
  );
};

// Internal component for Symptoms if not extracted, but I'll extract it to be clean.
import TheorySymptoms from './theory/TheorySymptoms';

export default Theory;
