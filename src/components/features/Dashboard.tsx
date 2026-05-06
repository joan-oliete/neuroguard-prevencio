import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, Tooltip, ResponsiveContainer
} from 'recharts';
import { UserProfile, DailyStat } from '../../types';
import { Map, Shield, Calendar, Image as ImageIcon, Sparkles, HeartPulse, Brain, Sunrise, Footprints, BookOpen, Info } from 'lucide-react';
import { InfoModal } from '../common/InfoModal';
import { remoteConfig } from '../../services/firebase';
import { getString, fetchAndActivate } from 'firebase/remote-config';

interface DashboardProps {
  user: UserProfile;
  data: DailyStat[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, data, onNavigate }) => {
  const { t } = useTranslation();
  const [greeting, setGreeting] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Benvingut/da a NeuroGuard');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bon dia');
    else if (hour < 20) setGreeting('Bona tarda');
    else setGreeting('Bona nit');

    // Test funcional de Remote Config
    const loadRemoteConfig = async () => {
      try {
        // Redueix l'interval per al desenvolupament
        remoteConfig.settings.minimumFetchIntervalMillis = 0; 
        await fetchAndActivate(remoteConfig);
        const msg = getString(remoteConfig, 'welcome_message');
        if (msg) {
          setWelcomeMessage(msg);
        }
      } catch (e) {
        console.warn("Error loading remote config:", e);
      }
    };
    loadRemoteConfig();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* 1. HERO HEADER (Zen & Clean) */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl p-8 md:p-12 relative text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center ring-1 ring-white/20 shadow-xl shrink-0 overflow-hidden">
               {user.photoUrl ? (
                   <img src={user.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                   <Sunrise size={40} className="text-brand-300" />
               )}
            </div>
            <div>
              <p className="text-brand-200 text-sm font-medium tracking-wider uppercase mb-1">{greeting}</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-white drop-shadow-md flex items-center gap-3">
                {user.name ? `${user.name}` : welcomeMessage}
                <button onClick={() => setShowHelpModal(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm" title="Informació">
                  <Info size={24} className="text-white" />
                </button>
              </h2>
              <p className="text-brand-100 text-sm md:text-base max-w-md font-medium mb-1">
                {welcomeMessage}
              </p>
              <p className="text-brand-100 text-sm md:text-base max-w-md">
                Aquest és el teu espai segur. Tria una eina per continuar cuidant el teu benestar avui.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY / SOS SECTION */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-rose-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🆘</span> Accés Ràpid d'Emergència
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <a 
            href="tel:112"
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-red-200 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 text-lg"
          >
            <Shield size={24} /> TRUCA AL 112 (Emergències)
          </a>
          
          <button 
            onClick={() => onNavigate('crisis')}
            className="flex-1 bg-white hover:bg-rose-50 border-2 border-rose-200 text-rose-700 font-bold py-4 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 text-lg"
          >
            <HeartPulse size={24} /> Obre el Pla de Crisis
          </button>
        </div>
      </div>

      {/* 2. THERAPEUTIC TOOLS GRID */}
      <div>
         <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <HeartPulse className="text-rose-500" /> Les meves Eines
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Marc Teòric */}
            <button onClick={() => onNavigate('theory')} className="group flex flex-col text-left bg-gradient-to-br from-amber-50 to-white rounded-3xl p-6 border border-amber-100 shadow-sm hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="text-amber-600" size={28} />
               </div>
               <h4 className="text-lg font-bold text-amber-900 mb-2">Marc Teòric</h4>
               <p className="text-slate-600 text-sm leading-relaxed">Conceptes essencials i aprenentatge previ que et prepararan abans d'omplir el teu Manual de Prevenció.</p>
            </button>

            {/* Clinical Manual */}
            <button onClick={() => onNavigate('clinic')} className="group flex flex-col text-left bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-brand-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="text-brand-600" size={28} />
               </div>
               <h4 className="text-lg font-bold text-slate-800 mb-2">Manual de Prevenció</h4>
               <p className="text-slate-500 text-sm leading-relaxed">El teu lloc de treball principal. Revisa els teus valors, patrons i kit d'emergència.</p>
            </button>

            {/* AI Therapy Chat */}
            <button onClick={() => onNavigate('therapy-session')} className="group flex flex-col text-left bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 border border-indigo-100 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-200/50 animate-pulse"></div>
                  <Sparkles className="text-indigo-600 relative z-10" size={28} />
               </div>
               <h4 className="text-lg font-bold text-indigo-900 mb-2">Terapeuta d'IA</h4>
               <p className="text-slate-600 text-sm leading-relaxed">Parla amb el teu assistent personal per rebre orientació o planificar activitats.</p>
            </button>

            {/* Diary */}
            <button onClick={() => onNavigate('diary')} className="group flex flex-col text-left bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-orange-600" size={28} />
               </div>
               <h4 className="text-lg font-bold text-slate-800 mb-2">El meu Diari</h4>
               <p className="text-slate-500 text-sm leading-relaxed">Accedeix als resums del teu terapeuta o escriu petites reflexions sobre el que sents.</p>
            </button>

            {/* Planner */}
            <button onClick={() => onNavigate('planner')} className="group flex flex-col text-left bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-teal-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="text-teal-600" size={28} />
               </div>
               <h4 className="text-lg font-bold text-slate-800 mb-2">Agenda Activa</h4>
               <p className="text-slate-500 text-sm leading-relaxed">Organitza les teves rutes segures i activitats de benestar programades.</p>
            </button>

            {/* Safety Map */}
            <button onClick={() => onNavigate('safety-map')} className="group flex flex-col text-left bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Map className="text-emerald-600" size={28} />
               </div>
               <h4 className="text-lg font-bold text-slate-800 mb-2">Mapa de Seguretat</h4>
               <p className="text-slate-500 text-sm leading-relaxed">Visualitza i afegeix zones segures o punts de risc per a la teva navegació diària.</p>
            </button>

            {/* Gallery / Loot */}
            <button onClick={() => onNavigate('loot')} className="group flex flex-col text-left bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 hover:-translate-y-1 transition-all duration-300">
               <div className="bg-pink-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="text-pink-600" size={28} />
               </div>
               <h4 className="text-lg font-bold text-slate-800 mb-2">Galeria de Records</h4>
               <p className="text-slate-500 text-sm leading-relaxed">Revisa imatges i records generats que et serveixen d'ancoratge positiu.</p>
            </button>
         </div>
      </div>

      <InfoModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Benvingut/da a NeuroGuard"
      >
        <div className="space-y-4 text-slate-600">
          <p>
            Aquesta és la teva pantalla d'inici, dissenyada per proporcionar-te un accés ràpid a totes les eines de la plataforma.
          </p>
          <div className="bg-indigo-50 rounded-xl p-4">
            <h4 className="font-bold text-indigo-900 mb-2">Començar</h4>
            <p className="text-sm text-indigo-800">
              Pots començar revisant el teu <strong>Manual de Prevenció</strong> o parlant amb el <strong>Terapeuta d'IA</strong> per posar en ordre els teus pensaments.
            </p>
          </div>
          <div className="bg-rose-50 rounded-xl p-4">
            <h4 className="font-bold text-rose-900 mb-2">Emergències</h4>
            <p className="text-sm text-rose-800">
              En cas de necessitat, tens el botó d'<strong>Accés Ràpid d'Emergència</strong> sempre visible a la part superior.
            </p>
          </div>
        </div>
      </InfoModal>

    </div >
  );
};

export default Dashboard;
