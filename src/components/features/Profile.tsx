import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserProfile, RelapseManual } from '../../types';
import { updateDoc, doc, db, archiveManual, collection, query, orderBy, getDocs, deleteDoc, messaging, getToken } from '../../services/firebase';
import { User, Download, Archive, Trash2, Calendar, Bell, Eye, Printer, Languages } from 'lucide-react';
import { useTranslationAI } from '../../hooks/useTranslationAI';
import { AssetManager } from '../admin/AssetManager';
import { NotificationService } from '../../services/notificationService';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    surname: user.surname || '',
    phone: user.phone || '',
    lastConsumptionDate: user.lastConsumptionDate || ''
  });
  const [manualHistory, setManualHistory] = useState<any[]>([]);
  const [daysSober, setDaysSober] = useState(0);

  useEffect(() => {
    loadHistory();
    calculateDays();
  }, [user]);

  const loadHistory = async () => {
    const q = query(collection(db, `users/${user.id}/manuals`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const manuals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setManualHistory(manuals);
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
        lastConsumptionDate: formData.lastConsumptionDate
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

  const handlePreviewManual = (manual: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Si us plau, permet les finestres emergents per veure el manual.");

    const dateStr = manual.createdAt?.toDate ? manual.createdAt.toDate().toLocaleDateString() : 'Data desconeguda';

    const content = `
      <html>
        <head>
          <title>Manual NeuroGuard - ${dateStr}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
            h1 { color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #1e293b; margin-top: 30px; background: #f8fafc; padding: 10px; border-radius: 8px; border-left: 4px solid #ea580c; }
            h3 { color: #475569; margin-top: 20px; font-size: 1.1em; }
            p, li { line-height: 1.6; }
            ul { padding-left: 20px; }
            .meta { color: #64748b; font-size: 0.9em; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .card { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 10px; background: #fff; page-break-inside: avoid; }
            .tag { display: inline-block; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; color: #475569; margin-left: 8px; }
            .crisis-card { background-color: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; }
            .crisis-label { font-weight: bold; color: #991b1b; display: block; margin-top: 10px; }
            @media print {
              body { padding: 0; }
              h2 { background: none; border-bottom: 1px solid #ccc; border-left: none; padding-left: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Manual de Prevenció NeuroGuard</h1>
          <div class="meta">
            <p><strong>Usuari:</strong> ${formData.name} ${formData.surname}</p>
            <p><strong>Data del manual:</strong> ${dateStr}</p>
            <p><strong>ID:</strong> ${manual.id}</p>
          </div>

          <h2>1. Motivacions (Punt de Partida)</h2>
          <ul>
            ${(manual.motivations || []).map((m: any) => `<li>${m.text}</li>`).join('') || '<li>Sense motivacions registrades.</li>'}
          </ul>

          <h2>2. Els Meus Valors</h2>
          <div>
            ${(manual.values?.selected || []).map((v: string) => {
      const details = manual.values?.details?.[v] || {};
      return `<div class="card">
                <h3>${v}</h3>
                <p><em>"${details.definition || 'Sense definició'}"</em></p>
                <p><strong>Importància:</strong> ${details.importance || 5}/10 &nbsp;|&nbsp; <strong>Alineació:</strong> ${details.alignment || 5}/10</p>
              </div>`;
    }).join('') || '<p>No s\'han seleccionat valors.</p>'}
          </div>

          <h2>3. Patrons i Senyals d'Alerta</h2>
          <h3>Senyals d'Alerta</h3>
          <ul>
             ${(manual.triggers || []).map((t: any) => `<li>${t.external || t.internal || t.physical} <span class="tag">${t.external ? 'EXT' : t.internal ? 'INT' : 'FIS'}</span></li>`).join('') || '<li>Cap senyal registrat.</li>'}
          </ul>
          <h3>Pensaments Trampa</h3>
          <ul>
             ${(manual.trapThoughts || []).map((t: any) => `<li><strong>"${t.thought}"</strong><br/><span style="color:#059669">➔ Resposta: ${t.reframe || '(Pendent)'}</span></li>`).join('') || '<li>Cap pensament registrat.</li>'}
          </ul>

          <h2>4. Xarxa de Suport</h2>
          <ul>
             ${(manual.supportNetwork || []).map((s: any) => `<li><strong>${s.name}</strong> <span class="tag">${s.role}</span><br/>Contacte: ${s.contact}</li>`).join('') || '<li>Sense xarxa definida.</li>'}
          </ul>

          <h2>5. Pla de Crisi</h2>
          <div class="crisis-card">
            <span class="crisis-label">SI NOTO (Senyal):</span> ${manual.crisisPlan?.signal || '-'}
            <span class="crisis-label">FARÉ (Acció):</span> ${manual.crisisPlan?.action || '-'}
            <span class="crisis-label">TRUCARÉ A (Contacte):</span> ${manual.crisisPlan?.contact || '-'}
            <span class="crisis-label">RECORDATORI (Valor):</span> ${manual.crisisPlan?.reminder || '-'}
          </div>

          <h2>6. Revisió Setmanal</h2>
          <div class="card">
            <p style="white-space: pre-wrap;">${manual.weeklyReview || 'Sense revisió registrada.'}</p>
          </div>

          <div style="margin-top: 50px; text-align: center; font-size: 0.8em; color: #94a3b8;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; background: #ea580c; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Imprimir / Guardar PDF</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="card flex flex-col md:flex-row justify-between items-center gap-6 p-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">El Meu Perfil</h2>
          <p className="text-slate-500 font-medium">Gestiona les teves dades i el teu progrés.</p>
        </div>
        <div className="bg-accent-50 border border-accent-200 px-8 py-4 rounded-2xl text-center shadow-sm">
          <p className="text-xs text-accent-600 font-bold uppercase tracking-widest mb-1">{t('profile.days_earned')}</p>
          <p className="text-4xl font-black text-accent-700">{daysSober}</p>
        </div>
      </div>

      {/* Admin Quick Access */}
      <div className="flex justify-end">
        <button onClick={() => setShowAssetManager(true)} className="text-xs text-slate-400 hover:text-brand-600 underline">
          Admin: Gestor Multimèdia
        </button>
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
          <TranslationDemo />
        </div>
      </div>

      {showAssetManager && <AssetManager onClose={() => setShowAssetManager(false)} />}
    </div >
  );
};

const TranslationDemo = () => {
  const { translate, translatedText, loading } = useTranslationAI();
  const [text, setText] = useState("Hola, com estàs? Això és una prova de traducció.");

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-800">
        <span className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Languages className="w-5 h-5" /></span> Traductor IA
      </h3>
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl text-sm"
          rows={2}
        />
        <button
          onClick={() => translate(text, 'en')}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Traduint...' : 'Traduir a Anglès (Demo)'}
        </button>
        {translatedText && (
          <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl text-sm font-medium animate-fadeIn">
            {translatedText}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

{/* @ts-ignore */ }
const AdminModal = ({ show, onClose }) => show ? <div className="fixed inset-0 z-[100]"><AssetManager onClose={onClose} /></div> : null;
