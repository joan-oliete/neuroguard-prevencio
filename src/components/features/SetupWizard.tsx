import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Shield, User, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { doc, updateDoc, db } from '../../services/firebase';

interface SetupWizardProps {
  userProfile: UserProfile;
  onComplete: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ userProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    surname: userProfile.surname || '',
    phone: userProfile.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.id), {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone
      });
      setStep(3);
    } catch (e) {
      console.error(e);
      alert("Error guardant el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.id), {
        hasCompletedTutorial: true
      });
      onComplete();
    } catch (e) {
      console.error(e);
      alert("Error finalitzant la configuració");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col md:justify-center items-center p-4 md:p-8 overflow-y-auto">
      <div className="max-w-xl w-full bg-white md:rounded-3xl md:shadow-2xl md:border border-slate-100 p-6 md:p-10">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${step >= i ? 'bg-brand-500' : 'bg-slate-100'}`} />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="animate-fadeIn text-center space-y-6">
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Shield className="w-12 h-12 text-brand-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Benvingut a NeuroGuard</h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              La teva eina personalitzada per la prevenció de recaigudes i el creixement personal. Per començar a treure'n el màxim profit, configurarem els aspectes clau en menys d'un minut.
            </p>
            <div className="pt-6">
              <button onClick={handleNext} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                Començar <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">El teu Perfil</h2>
              <p className="text-slate-500 mt-2">Necessitem algunes dades bàsiques per personalitzar la teva experiència.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Nom</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium" placeholder="Escriu el teu nom" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Cognoms</label>
                <input type="text" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium" placeholder="Escriu els teus cognoms" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Telèfon (opcional)</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium" placeholder="Per casos d'emergència" />
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold transition-all">
                Enrere
              </button>
              <button onClick={handleSaveProfile} disabled={isSaving || !formData.name} className="flex-[2] bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2">
                {isSaving ? 'Guardant...' : 'Continuar'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Manual Introduction */}
        {step === 3 && (
          <div className="animate-fadeIn text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">El teu Manual de Prevenció</h2>
            <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-4">
              <p className="text-slate-600 font-medium leading-relaxed">
                El Manual és l'eina més important d'aquesta app. Et recomanem que dediquis uns minuts a omplir-lo des del <strong className="text-slate-800">Panell del Manual</strong>.
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Defineix els teus valors i motivacions.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Identifica els teus senyals d'alerta.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Crea un Pla de Crisi personalitzat.</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-6">
              <button onClick={handleFinish} disabled={isSaving} className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2">
                {isSaving ? 'Iniciant...' : 'Entrar a NeuroGuard'} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SetupWizard;
