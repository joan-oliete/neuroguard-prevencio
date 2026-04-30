import React from 'react';
import { Shield, X } from 'lucide-react';

interface LegalTermsModalProps {
  onClose: () => void;
}

const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[200] overflow-y-auto flex justify-center items-start p-4 md:p-8">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl relative mt-10 mb-10 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Termes d'Ús i Política de Privacitat</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto prose prose-sm md:prose-base prose-slate max-w-none">
          <h3>Avís de Seguretat Important</h3>
          <p className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl font-medium">
            NeuroGuard és una eina de suport i no substitueix el tractament professional psicològic o psiquiàtric. Aquesta aplicació no és un dispositiu mèdic certificat ni serveix per a diagnosticar o curar cap malaltia. En cas d'emergència o crisi aguda, contacta immediatament amb el 112 o el teu professional de salut de referència.
          </p>

          <h3>1. Termes d'Ús</h3>
          <p>
            Aquests Termes d'Ús ("Termes") regulen l'ús de l'aplicació NeuroGuard. En accedir o utilitzar l'aplicació, l'usuari ("Vostè") accepta estar vinculat per aquests Termes. Si no hi està d'acord, si us plau, no utilitzi NeuroGuard.
          </p>
          <ul>
            <li><strong>Ús Permès:</strong> NeuroGuard està destinada a ús personal i educatiu per ajudar a la gestió del benestar emocional i l'autocontrol. No heu d'utilitzar l'aplicació per a finalitats il·legals.</li>
            <li><strong>Propietat Intel·lectual:</strong> Tot el contingut, disseny, codi i algorismes ("Contingut") de NeuroGuard estan protegits per drets de propietat intel·lectual i són propietat exclusiva de NeuroGuard o dels seus llicenciants. Resta estrictament prohibida la còpia, distribució, modificació o reproducció sense el consentiment previ exprés.</li>
            <li><strong>Limitació de Responsabilitat:</strong> L'ús de NeuroGuard és sota la vostra pròpia responsabilitat. Els creadors i desenvolupadors de l'aplicació no seran responsables per danys directes, indirectes, incidentals o conseqüents derivats de l'ús o la impossibilitat d'ús de l'aplicació o de qualsevol decisió basada en el seu contingut.</li>
            <li><strong>Actualitzacions:</strong> Ens reservem el dret de modificar, actualitzar o interrompre l'aplicació o qualsevol de les seves característiques sense avís previ.</li>
          </ul>

          <h3>2. Política de Privacitat</h3>
          <p>
            Ens comprometem a protegir la seva privacitat d'acord amb el Reglament General de Protecció de Dades (RGPD) i les lleis aplicables.
          </p>
          <ul>
            <li><strong>Dades que Recopilem:</strong> Podem recopilar informació que proporcioneu directament, com el correu electrònic, el nom (opcional), el pla de prevenció i les reflexions (Diari). També recopilem dades d'ús agregades.</li>
            <li><strong>Finalitat de les Dades:</strong> Utilitzem la vostra informació per: a) Proporcionar i personalitzar les funcionalitats de NeuroGuard (per exemple, la teràpia d'IA o les alertes); b) Oferir suport tècnic; c) Millorar l'aplicació.</li>
            <li><strong>Compartició de Dades:</strong> No venem, lloguem ni compartim les seves dades personals identificables amb tercers per a fins comercials. Només compartirem dades en cas d'obligació legal.</li>
            <li><strong>Seguretat:</strong> Emprem mesures tècniques i organitzatives raonables (xifratge i serveis de Google Firebase/Google Cloud) per protegir les dades contra accessos no autoritzats.</li>
            <li><strong>Els vostres Drets:</strong> Teniu dret a accedir, rectificar o eliminar la vostra informació en qualsevol moment, tal com permet l'aplicació desitjant eliminar el compte des de l'opció de suprimir l'usuari o contactant amb el suport de l'aplicació.</li>
          </ul>

          <h3>3. Acceptació i Modificació</h3>
          <p>
            Aquesta Política de Privacitat i els Termes d'Ús podran ser revisats periòdicament per reflectir canvis en les nostres pràctiques o per motius legals. Es recomana la seva revisió regular.
          </p>
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-100 p-6 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95"
          >
            He entès i accepto
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalTermsModal;
