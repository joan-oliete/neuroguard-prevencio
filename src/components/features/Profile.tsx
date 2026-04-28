import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile, RelapseManual } from '../../types';
import { updateDoc, doc, db, archiveManual, collection, query, orderBy, getDocs, deleteDoc, getDoc } from '../../services/firebase';
import { User, Download, Archive, Trash2, Calendar, Bell, Eye, Printer, Languages, Sparkles, Shield, Clock, LogOut, PauseCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslationAI } from '../../hooks/useTranslationAI';
import { NotificationService } from '../../services/notificationService';
import html2pdf from 'html2pdf.js';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
interface ProfileProps {
  user: UserProfile;
  onNavigate?: (view: string) => void;
  onShowCoolingOff?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onNavigate, onShowCoolingOff }) => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name || '',
    surname: user.surname || '',
    phone: user.phone || '',
    lastConsumptionDate: user.lastConsumptionDate || '',
    photoUrl: user.photoUrl || ''
  });
  const [manualHistory, setManualHistory] = useState<any[]>([]);
  const [therapySessions, setTherapySessions] = useState<any[]>([]);
  const [daysSober, setDaysSober] = useState(0);
  const [previewManual, setPreviewManual] = useState<any | null>(null);

  useEffect(() => {
    loadHistory();
    calculateDays();
  }, [user]);

  const loadHistory = async () => {
    const q = query(collection(db, `users/${user.id}/manuals`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const manuals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setManualHistory(manuals);

    const q2 = query(collection(db, `users/${user.id}/therapy_sessions`), orderBy("createdAt", "desc"));
    const snap2 = await getDocs(q2);
    setTherapySessions(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const calculateDays = () => {
    if (!formData.lastConsumptionDate) return;
    const last = new Date(formData.lastConsumptionDate);
    const now = new Date();
    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
    setDaysSober(diff > 0 ? diff : 0);
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        lastConsumptionDate: formData.lastConsumptionDate,
        photoUrl: formData.photoUrl
      });
      calculateDays();
      alert("Perfil actualitzat!");
    } catch (e) {
      console.error(e);
      alert("Error guardant perfil.");
    }
  };

  const handleArchive = async () => {
    if (confirm("Vols guardar l'estat actual i començar un manual nou?")) {
      await archiveManual(user.id);
      loadHistory();
      alert("Manual arxivat i reiniciat.");
    }
  };

  const handleDeleteManual = async (manualId: string) => {
    if (confirm("Segur que vols esborrar aquest manual històric?")) {
      await deleteDoc(doc(db, `users/${user.id}/manuals`, manualId));
      loadHistory();
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const status = await NotificationService.requestPermissions();
      if (status.granted) {
        const token = await NotificationService.register();
        if (token) {
          console.log('FCM/Push Token:', token);
          await updateDoc(doc(db, "users", user.id), { fcmToken: token });
          alert('Notificacions activades correctament.');
        } else {
          alert("No s'ha pogut obtenir el token.");
        }
      } else {
        alert('Permís denegat per a notificacions.');
      }
    } catch (error) {
      console.error("Error activating notifications:", error);
      alert("Error activant notificacions.");
    }
  };

  const handlePreviewManual = async (manual: any) => {
    let finalManual = { ...manual };
    if (!finalManual.crisisPlan) {
      try {
        const snap = await getDoc(doc(db, `users/${user.id}/crisisPlan/current`));
        if (snap.exists()) {
          finalManual.crisisPlan = snap.data();
        }
      } catch (e) {
        console.error("Error loading crisis plan", e);
      }
    }
    setPreviewManual(finalManual);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleExportPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('manual-preview-content');
      if (!element) return;
      
      const opt = {
        margin:       10,
        filename:     `manual_prevencio_${formData.name}_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (Capacitor.isNativePlatform()) {
        const pdfBase64 = await html2pdf().set(opt).from(element).outputPdf('datauristring');
        const base64Data = pdfBase64.split(',')[1];
        
        const savedFile = await Filesystem.writeFile({
          path: opt.filename,
          data: base64Data,
          directory: Directory.Cache
        });
        
        await Share.share({
          title: 'Manual de Prevenció',
          text: 'Aquí tens el meu manual de prevenció.',
          url: savedFile.uri,
          dialogTitle: 'Compartir o Guardar PDF'
        });
      } else {
        html2pdf().set(opt).from(element).save();
      }
    } catch (e) {
      console.error("Error generating PDF", e);
      alert("Error generant el PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col md:flex-row justify-between items-center gap-6 p-8">
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center shrink-0" onClick={() => document.getElementById('photoUpload')?.click()}>
            {formData.photoUrl ? (
               <img src={formData.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
               <User className="w-10 h-10 text-slate-400" />
            )}
            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex flex-col items-center justify-center transition-all">
               <span className="text-white text-xs font-bold">Canviar</span>
            </div>
          </div>
          <input type="file" id="photoUpload" className="hidden" accept="image/*" onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               const reader = new FileReader();
               reader.onloadend = () => {
                 setFormData({ ...formData, photoUrl: reader.result as string });
               };
               reader.readAsDataURL(file);
             }
          }} />
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">El Meu Perfil</h2>
            <p className="text-slate-500 font-medium">Gestiona les teves dades i el teu progrés.</p>
          </div>
        </div>
        <div className="bg-accent-50 border border-accent-200 px-8 py-4 rounded-2xl text-center shadow-sm">
          <p className="text-xs text-accent-600 font-bold uppercase tracking-widest mb-1">{t('profile.days_earned')}</p>
          <p className="text-4xl font-black text-accent-700">{daysSober}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Personal Data Form */}
        <div className="card">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
            <span className="p-2 bg-brand-50 rounded-lg text-brand-600"><User className="w-5 h-5" /></span> {t('profile.personal_data')}
          </h3>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('profile.name')}</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-700" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('profile.surname')}</label>
                <input type="text" value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-700" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('profile.phone')}</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-700" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('profile.last_consumption')}</label>
              <input type="date" value={formData.lastConsumptionDate || ''} onChange={e => setFormData({ ...formData, lastConsumptionDate: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-700" />
            </div>
            <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]">{t('profile.save_changes')}</button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800">
              <span className="p-2 bg-amber-50 rounded-lg text-amber-500"><Bell className="w-5 h-5" /></span> {t('profile.notifications')}
            </h3>
            <button onClick={requestNotificationPermission} className="w-full border-2 border-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2">
              {t('profile.allow_push')}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800">
              <span className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Sparkles className="w-5 h-5" /></span> Accions Ràpides
            </h3>
            <div className="space-y-3">
              {onNavigate && (
                <button onClick={() => onNavigate('crisis')} className="w-full flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="text-rose-600 w-5 h-5" />
                    <span className="font-bold text-rose-700">SOS Urge Surfing</span>
                  </div>
                </button>
              )}
              {onShowCoolingOff && (
                <button onClick={() => onShowCoolingOff()} className="w-full flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <PauseCircle className="text-emerald-600 w-5 h-5" />
                    <span className="font-bold text-emerald-700">Temps de refredament</span>
                  </div>
                </button>
              )}
              <button onClick={() => logout()} className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors mt-2">
                <LogOut className="w-5 h-5" /> Tancar Sessió
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800">
              <span className="p-2 bg-blue-50 rounded-lg text-blue-500"><Languages className="w-5 h-5" /></span> Idioma / Language
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => i18n.changeLanguage('ca')} className={`py-2 rounded-lg font-bold text-sm transition-all ${i18n.language === 'ca' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200'}`}>Català</button>
              <button onClick={() => i18n.changeLanguage('es')} className={`py-2 rounded-lg font-bold text-sm transition-all ${i18n.language === 'es' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200'}`}>Español</button>
              <button onClick={() => i18n.changeLanguage('en')} className={`py-2 rounded-lg font-bold text-sm transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200'}`}>English</button>
            </div>
          </div>

        </div>

        {/* Manual Actions & History */}
        <div className="space-y-6">
          <div className="card bg-brand-600 text-white border-0 shadow-xl shadow-brand-200">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-lg text-white"><Archive className="w-5 h-5" /></span> {t('profile.manual_management')}
            </h3>
            <p className="text-sm text-brand-100 mb-6 leading-relaxed opacity-90">{t('profile.archive_desc')}</p>
            <button onClick={handleArchive} className="w-full bg-white text-brand-700 py-3 rounded-xl font-bold hover:bg-brand-50 flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Archive className="w-4 h-4" /> {t('profile.archive_btn')}
            </button>
          </div>

          <div className="card">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
              <span className="p-2 bg-purple-50 rounded-lg text-purple-600"><Calendar className="w-5 h-5" /></span> {t('profile.history')}
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {manualHistory.length === 0 && <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">No hi ha manuals arxivats.</div>}
              {manualHistory.map((m) => (
                <div key={m.id} className={`p-4 rounded-xl border transition-colors flex justify-between items-center group ${m.id === user.activeManualId ? 'bg-accent-50 border-accent-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                  <div>
                    <p className="font-bold text-sm text-slate-700 flex items-center gap-2">
                      {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString() : 'Data desconeguda'}
                      {m.id === user.activeManualId && <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-[10px] rounded-full uppercase tracking-wider font-bold">Actiu</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePreviewManual(m)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Veure contingut"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {m.id !== user.activeManualId && (
                      <button
                        onClick={() => handleDeleteManual(m.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Esborrar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Therapy Sessions History */}
          <div className="card">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-800 border-b border-slate-100 pb-4">
              <span className="p-2 bg-brand-50 rounded-lg text-brand-600"><Sparkles className="w-5 h-5" /></span> Sessions de Teràpia AI
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {therapySessions.length === 0 && <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">No hi ha sessions enregistrades.</div>}
              {therapySessions.map((session) => (
                <div key={session.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-sm text-slate-700">
                      {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleDateString() : 'Data desconeguda'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {session.moodShift && (
                      <p className="text-sm"><strong className="text-slate-600">Canvi Emocional:</strong> {session.moodShift}</p>
                    )}
                    {session.actionableStep && (
                      <p className="text-sm"><strong className="text-brand-600">Acció:</strong> {session.actionableStep}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {previewManual && (
        <div className="fixed inset-0 bg-slate-900/95 z-[100] overflow-y-auto flex justify-center p-4">
          <div className="bg-white max-w-3xl w-full my-8 p-8 rounded-2xl shadow-2xl relative print:m-0 print:p-0 print:shadow-none print:w-full">
            <button 
              onClick={() => setPreviewManual(null)} 
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full print:hidden transition-colors"
            >
              Tancar
            </button>
            <div className="print:hidden text-center mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold mb-2 text-slate-800">Visualització del Manual</h2>
              <button 
                onClick={handleExportPDF} 
                disabled={isGeneratingPdf}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Printer size={18} /> {isGeneratingPdf ? 'Generant PDF...' : 'Imprimir / Guardar PDF'}
              </button>
            </div>
            
            <div id="manual-preview-content" className="prose prose-slate max-w-none p-6 bg-white">
              <h1 className="text-3xl text-brand-600 border-b-2 border-brand-500 pb-2 mb-6">Manual de Prevenció NeuroGuard</h1>
              
              <div className="text-slate-500 mb-8 pb-4 border-b">
                <p><strong>Usuari:</strong> {formData.name} {formData.surname}</p>
                <p><strong>Data:</strong> {previewManual.createdAt?.toDate ? previewManual.createdAt.toDate().toLocaleDateString() : 'Data desconeguda'}</p>
                <p><strong>ID:</strong> {previewManual.id}</p>
              </div>

              <h2 className="bg-slate-50 p-3 rounded-lg border-l-4 border-brand-500 mt-8 mb-4 font-bold text-xl text-slate-800">1. Motivacions (Punt de Partida)</h2>
              <ul className="list-disc pl-6 space-y-2">
                {(previewManual.motivations?.length ? previewManual.motivations : [{id:1, text: 'Sense motivacions registrades.'}]).map((m: any) => (
                  <li key={m.id}>{m.text}</li>
                ))}
              </ul>

              <h2 className="bg-slate-50 p-3 rounded-lg border-l-4 border-brand-500 mt-8 mb-4 font-bold text-xl text-slate-800">2. Els Meus Valors</h2>
              <div className="space-y-4">
                {(previewManual.values?.selected?.length ? previewManual.values.selected : []).map((v: string) => {
                  const details = previewManual.values?.details?.[v] || {};
                  return (
                    <div key={v} className="border border-slate-200 p-4 rounded-xl">
                      <h3 className="font-bold text-lg mb-2 text-indigo-700">{v}</h3>
                      <p className="italic text-slate-600 mb-2">"{details.definition || 'Sense definició'}"</p>
                      <p className="text-sm font-medium">Importància: {details.importance || 5}/10 | Alineació: {details.alignment || 5}/10</p>
                    </div>
                  );
                })}
                {!previewManual.values?.selected?.length && <p>No s'han seleccionat valors.</p>}
              </div>

              <h2 className="bg-slate-50 p-3 rounded-lg border-l-4 border-brand-500 mt-8 mb-4 font-bold text-xl text-slate-800">3. Patrons i Senyals d'Alerta</h2>
              <h3 className="font-bold text-lg mt-4 mb-2 text-red-600">Senyals d'Alerta</h3>
              <ul className="list-disc pl-6 space-y-2">
                {(previewManual.triggers?.length ? previewManual.triggers : []).map((t: any) => (
                  <li key={t.id}>
                    {t.external || t.internal || t.physical} 
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs ml-2 font-bold text-slate-500">
                      {t.external ? 'EXTERN' : t.internal ? 'INTERN' : 'FÍSIC'}
                    </span>
                  </li>
                ))}
                {!previewManual.triggers?.length && <li>Cap senyal registrat.</li>}
              </ul>

              <h3 className="font-bold text-lg mt-6 mb-2 text-amber-600">Pensaments Trampa</h3>
              <ul className="list-none space-y-4">
                {(previewManual.trapThoughts?.length ? previewManual.trapThoughts : []).map((t: any) => (
                  <li key={t.id} className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <strong className="block italic mb-2 text-amber-900">"{t.thought}"</strong>
                    <span className="text-emerald-700 font-medium">➔ Resposta: {t.reframe || '(Pendent)'}</span>
                  </li>
                ))}
                {!previewManual.trapThoughts?.length && <li>Cap pensament registrat.</li>}
              </ul>

              <h2 className="bg-slate-50 p-3 rounded-lg border-l-4 border-brand-500 mt-8 mb-4 font-bold text-xl text-slate-800">4. Xarxa de Suport</h2>
              <ul className="list-disc pl-6 space-y-2">
                {(previewManual.supportNetwork?.length ? previewManual.supportNetwork : []).map((s: any) => (
                  <li key={s.id}>
                    <strong>{s.name}</strong> <span className="bg-slate-100 px-2 py-0.5 rounded text-xs ml-2 text-slate-600">{s.role}</span>
                    <br/><span className="text-slate-500">Contacte: {s.contact}</span>
                  </li>
                ))}
                {!previewManual.supportNetwork?.length && <li>Sense xarxa definida.</li>}
              </ul>

              <h2 className="bg-slate-50 p-3 rounded-lg border-l-4 border-brand-500 mt-8 mb-4 font-bold text-xl text-slate-800">5. Pla de Crisi</h2>
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl space-y-3">
                <div><span className="font-bold text-red-800 block">SI NOTO (Senyal):</span> {previewManual.crisisPlan?.signal || '-'}</div>
                <div><span className="font-bold text-red-800 block">FARÉ (Acció):</span> {previewManual.crisisPlan?.action || '-'}</div>
                <div><span className="font-bold text-red-800 block">TRUCARÉ A (Contacte):</span> {previewManual.crisisPlan?.contact || '-'}</div>
                <div><span className="font-bold text-red-800 block">RECORDATORI (Valor):</span> {previewManual.crisisPlan?.reminder || '-'}</div>
              </div>

              <h2 className="bg-slate-50 p-3 rounded-lg border-l-4 border-brand-500 mt-8 mb-4 font-bold text-xl text-slate-800">6. Revisió Setmanal</h2>
              <div className="border border-slate-200 p-4 rounded-xl whitespace-pre-wrap">
                {previewManual.weeklyReview || 'Sense revisió registrada.'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default Profile;
