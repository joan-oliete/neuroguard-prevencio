
import React, { useState, useEffect, useRef } from 'react';
import { CrisisPlan } from '../../types';
import { Bell, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BreathingExercise } from './crisis/BreathingExercise';
import { NotificationService } from '../../services/notificationService';

interface CrisisComponentProps {
  plan: CrisisPlan;
  onUpdate: (newPlan: CrisisPlan) => void;
  onAddXp?: (amount: number) => void;
  onNavigate: (view: string) => void;
}

const CrisisComponent: React.FC<CrisisComponentProps> = ({ plan, onUpdate, onAddXp, onNavigate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [tempPlan, setTempPlan] = useState(plan);
  const [isSaving, setIsSaving] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  // Local state for notification toggles
  const [notifications, setNotifications] = useState({
    signal: false,
    action: false,
    contact: false
  });

  const autosaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Autosave logic
  useEffect(() => {
    if (isEditing) {
      autosaveTimerRef.current = setInterval(() => {
        setIsSaving(true);
        onUpdate(tempPlan);
        setTimeout(() => setIsSaving(false), 1000); // Show "Saving..." for 1s
      }, 30000); // Autosave every 30 seconds
    } else {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current);
      }
    };
  }, [isEditing, tempPlan, onUpdate]);


  const handleSave = () => {
    onUpdate(tempPlan);
    setIsEditing(false);
  };

  const handleChange = (field: keyof CrisisPlan, value: string) => {
    setTempPlan({ ...tempPlan, [field]: value });
  };

  const requestNotificationPermission = async () => {
    const status = await NotificationService.requestPermissions();
    return status.granted;
  };

  const toggleNotification = async (field: 'signal' | 'action' | 'contact') => {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      setNotifications(prev => {
        const newState = !prev[field];
        // Note: Actual scheduling would go here using LocalNotifications plugin or backend logic
        // For now we just ack permissions
        return { ...prev, [field]: newState };
      });
    } else {
      alert("Has de permetre les notificacions per activar aquesta funció.");
    }
  };

  return (
    <div className="w-full">
      <div className="bg-rose-600 text-white p-4 rounded-2xl mb-6 text-center font-bold shadow-lg shadow-rose-200 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 animate-pulse">
        <span className="text-2xl md:text-3xl">🆘</span> <span className="text-sm md:text-base leading-tight">{t('crisis.emergency_banner', 'EMERGÈNCIA IMMEDIATA: TRUCA AL 112')}</span>
      </div>

      <div className="card border-l-8 border-brand-500 relative overflow-hidden">
        {/* Header Visual */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-brand-50 p-3 rounded-2xl text-brand-600">
              <span className="text-3xl">🛡️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('crisis.title')}</h2>
              <p className="text-slate-500 text-sm font-medium">{t('crisis.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSaving && <span className="text-xs text-brand-600 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1"><span className="w-2 h-2 bg-brand-500 rounded-full"></span> {t('crisis.saving')}</span>}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-slate-500 hover:text-brand-600 text-sm font-bold bg-slate-50 hover:bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-brand-200 transition-all shadow-sm"
            >
              {isEditing ? t('crisis.cancel_btn') : t('crisis.edit_btn')}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-6 animate-fadeIn relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('crisis.labels.signal')}</label>
                  <button onClick={() => toggleNotification('signal')} className={`p-1.5 rounded-md transition-colors ${notifications.signal ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-brand-500'}`} title="Activar recordatori">
                    <Bell size={16} fill={notifications.signal ? "currentColor" : "none"} />
                  </button>
                </div>
                <input
                  value={tempPlan.signal}
                  onChange={(e) => handleChange('signal', e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder={t('crisis.placeholders.signal')}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('crisis.labels.action')}</label>
                  <button onClick={() => toggleNotification('action')} className={`p-1.5 rounded-md transition-colors ${notifications.action ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-brand-500'}`} title="Activar recordatori">
                    <Bell size={16} fill={notifications.action ? "currentColor" : "none"} />
                  </button>
                </div>
                <input
                  id="crisis-action"
                  name="action"
                  type="text"
                  value={tempPlan.action}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder={t('crisis.placeholders.action')}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('crisis.labels.contact')}</label>
                  <button onClick={() => toggleNotification('contact')} className={`p-1.5 rounded-md transition-colors ${notifications.contact ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-brand-500'}`} title="Activar recordatori">
                    <Bell size={16} fill={notifications.contact ? "currentColor" : "none"} />
                  </button>
                </div>
                <input
                  id="crisis-contact"
                  name="contact"
                  type="text"
                  value={tempPlan.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder={t('crisis.placeholders.contact')}
                />
              </div>
              <div className="space-y-2">
                <div className="px-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('crisis.labels.reminder')}</label>
                </div>
                <input
                  id="crisis-reminder"
                  name="reminder"
                  type="text"
                  value={tempPlan.reminder}
                  onChange={(e) => handleChange('reminder', e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-700 font-medium"
                  placeholder={t('crisis.placeholders.reminder')}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-brand-200 active:scale-[0.98]"
              >
                {t('crisis.save_card')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {/* Targeta Visualització */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:border-brand-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold">{t('crisis.labels.signal').split(' ')[1].toUpperCase()}</span>
                {notifications.signal && <Bell size={14} className="text-brand-500" fill="currentColor" />}
              </div>
              <p className="text-xl font-bold text-slate-700">{plan.signal || "Encara no definit"}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 relative group hover:border-brand-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold">{t('crisis.labels.action').split(' ')[1].toUpperCase()}</span>
                  {notifications.action && <Bell size={14} className="text-brand-500" fill="currentColor" />}
                </div>
                <p className="text-xl font-bold text-slate-700">{plan.action || "Encara no definit"}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 relative group hover:border-brand-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold">{t('crisis.labels.contact').split(' ')[1].toUpperCase()}</span>
                  {notifications.contact && <Bell size={14} className="text-brand-500" fill="currentColor" />}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xl font-bold text-slate-700">
                    {plan.contact ? (
                      <div className="flex items-center gap-3">
                        <a href={`tel:${plan.contact}`} className="hover:text-brand-600 underline decoration-dotted underline-offset-4 decoration-brand-300 flex items-center gap-2 text-left bg-transparent border-0 p-0 m-0 cursor-pointer text-xl font-bold text-slate-700">
                          {plan.contact}
                        </a>
                        {/* WhatsApp helper */}
                        <a
                          href={`https://wa.me/${plan.contact.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-100 text-green-600 p-1.5 rounded-full hover:bg-green-200 transition-colors flex items-center justify-center shrink-0"
                          title="Obrir WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </a>
                      </div>
                    ) : (
                      "Encara no definit"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 rounded-2xl shadow-lg shadow-brand-200 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
              <span className="block text-xs opacity-80 uppercase tracking-widest font-bold mb-2 relative z-10">AIXÒ M'ACOSTA A</span>
              <p className="text-2xl font-black relative z-10">"{plan.reminder || "La meva recuperació"}"</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* Crisis Chat Card - Redirects to Therapist */}
        <div
          onClick={() => onNavigate('therapy')}
          className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group"
        >
          <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">{t('crisis.chat_btn.title')}</h3>
              <p className="text-teal-50 text-sm">{t('crisis.chat_btn.desc')}</p>
            </div>
          </div>
        </div>

        {/* Breathing Exercise Card */}
        <div
          className="bg-gradient-to-r from-sky-400 to-indigo-500 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group flex items-center justify-center"
          onClick={() => setShowBreathing(true)}
        >
          <div className="text-center">
            <h3 className="font-bold text-xl">🌬️ {t('breathing.title', 'Respiració 4-7-8')}</h3>
            <p className="text-sky-100 text-sm">{t('crisis.subtitle')}</p>
          </div>
        </div>
      </div>

      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} onAddXp={onAddXp} />}
    </div>
  );
};

export default CrisisComponent;
