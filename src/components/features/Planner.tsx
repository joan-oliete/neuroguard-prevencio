
import React, { useState, useEffect } from 'react';
import { RelapseManual, DiaryEntry } from '../../types';
import { updateDoc, doc, db, collection, query, orderBy, onSnapshot } from '../../services/firebase';
import { Calendar, Save, RefreshCw, ChevronLeft, ChevronRight, Layout, Maximize, BookOpen, PenTool, ArrowLeft } from 'lucide-react';

interface PlannerProps {
  manual: RelapseManual;
  manualId: string;
  userId: string;
  onNavigateToDiary: (activityLink: { date: string; area: string; text: string }) => void;
  onBack?: () => void;
}

const DAYS = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
const AREAS = [
  { id: 'Física', label: 'Física', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', ring: 'focus:ring-emerald-500', icon: '🏃' },
  { id: 'Emocional', label: 'Emocional', color: 'bg-purple-50 border-purple-200 text-purple-800', ring: 'focus:ring-purple-500', icon: '🧘' },
  { id: 'Social', label: 'Social', color: 'bg-blue-50 border-blue-200 text-blue-800', ring: 'focus:ring-blue-500', icon: '👥' },
  { id: 'De sentit', label: 'De sentit', color: 'bg-amber-50 border-amber-200 text-amber-800', ring: 'focus:ring-amber-500', icon: '⭐' }
];

const Planner: React.FC<PlannerProps> = ({ manual, manualId, userId, onNavigateToDiary, onBack }) => {
  const [localPlan, setLocalPlan] = useState<Record<string, string>>(manual.selfCarePlan || {});
  const [isSaving, setIsSaving] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Date & View State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('day');

  // Sync local state with manual prop when it changes (e.g. background updates)
  useEffect(() => {
    setLocalPlan(manual.selfCarePlan || {});
  }, [manual]);

  // Load Diary Entries to check for links
  useEffect(() => {
    const q = query(collection(db, `users/${userId}/diaryEntries`), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as DiaryEntry));
      setDiaryEntries(entries);
    });
    return unsub;
  }, [userId]);

  const getDayName = (date: Date) => {
    const jsDay = date.getDay();
    const mappedIndex = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[mappedIndex];
  };

  const getFormattedDate = (date: Date) => date.toISOString().split('T')[0];

  // Helper to get dates for the current week view
  const getWeekDates = (baseDate: Date) => {
    const currentDay = baseDate.getDay(); // 0 (Sun) to 6 (Sat)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate diff to Monday
    const mondayDate = new Date(baseDate);
    mondayDate.setDate(baseDate.getDate() + mondayOffset);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      return {
        dateObj: d,
        dateStr: getFormattedDate(d),
        dayName: DAYS[i]
      };
    });
  };

  const handleCellChange = (dateKey: string, area: string, value: string) => {
    setLocalPlan(prev => ({
      ...prev,
      [`${area}-${dateKey}`]: value
    }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    const manualRef = doc(db, `users/${userId}/manuals`, manualId);
    await updateDoc(manualRef, { selfCarePlan: localPlan });
    setTimeout(() => setIsSaving(false), 1000);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value));
    }
  };

  const currentDayName = getDayName(selectedDate);
  const currentDateStr = getFormattedDate(selectedDate);
  const weekDates = getWeekDates(selectedDate);

  const getLinkedEntry = (dateStr: string, areaId: string) => {
    return diaryEntries.find(e =>
      e.linkedActivity?.date === dateStr &&
      e.linkedActivity?.area === areaId
    );
  };

  const addToCalendar = (dateStr: string, area: string, text: string) => {
    if (!text) return;

    // Create ICS content
    const startDate = dateStr.replace(/-/g, '') + 'T090000';
    const endDate = dateStr.replace(/-/g, '') + 'T100000';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:NeuroGuard: ${area}`,
      `DESCRIPTION:${text}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `neuroguard-${dateStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-20">

      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft size={24} />
              </button>
            )}
            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
                <Calendar className="w-8 h-8" />
              </div>
              Planificador
            </h2>
          </div>
          <p className="text-slate-500 mt-2 text-base font-medium">
            Estructura el teu temps. El buit és l'enemic de la recuperació.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Maximize className="w-4 h-4" /> Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layout className="w-4 h-4" /> Setmana
            </button>
          </div>

          {/* Date Controls */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl flex-1 justify-between sm:justify-start">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input
              type="date"
              value={currentDateStr}
              onChange={handleDateInput}
              className="bg-transparent border-none text-slate-800 font-bold text-sm focus:ring-0 cursor-pointer text-center w-full"
            />
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed sm:w-auto w-full"
          >
            {isSaving ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
            {isSaving ? '...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* VIEW: DAY MODE */}
      {viewMode === 'day' && (
        <div className="animate-fadeIn">
          <div className="flex items-baseline gap-3 mb-6 px-2">
            <h3 className="text-2xl font-bold text-slate-800 capitalize">{currentDayName}</h3>
            <span className="text-brand-500 font-bold bg-brand-50 px-3 py-1 rounded-full text-sm">
              {selectedDate.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AREAS.map(area => {
              const key = `${area.id}-${currentDateStr}`; // Specific Date Key
              const linkedEntry = getLinkedEntry(currentDateStr, area.id);
              const activityText = localPlan[key] || '';

              return (
                <div key={area.id} className={`p-6 rounded-3xl border transition-all hover:shadow-md ${area.color.includes('emerald') ? 'bg-emerald-50/30 border-emerald-100' : area.color.includes('purple') ? 'bg-purple-50/30 border-purple-100' : area.color.includes('blue') ? 'bg-blue-50/30 border-blue-100' : 'bg-amber-50/30 border-amber-100'} bg-white relative group`}>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${area.color.replace('text-', 'bg-').split(' ')[0]} bg-white`}>
                        {area.icon}
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg text-slate-800`}>{area.label}</h4>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Àrea Vital</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCalendar(currentDateStr, area.label, activityText)}
                        disabled={!activityText}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Afegir al calendari del dispositiu"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      {activityText && (
                        <button
                          onClick={() => onNavigateToDiary({
                            date: currentDateStr,
                            area: area.id,
                            text: activityText
                          })}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${linkedEntry
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-white border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200'
                            }`}
                          title={linkedEntry ? "Veure reflexió" : "Escriure reflexió al diari"}
                        >
                          {linkedEntry ? <BookOpen className="w-3 h-3" /> : <PenTool className="w-3 h-3" />}
                          {linkedEntry ? 'Reflexió Feta' : 'Reflexionar'}
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={activityText}
                    onChange={(e) => handleCellChange(currentDateStr, area.id, e.target.value)}
                    placeholder={`Què faràs avui per cuidar la teva àrea ${area.label.toLowerCase()}?`}
                    className={`w-full h-32 p-4 rounded-xl border border-slate-200 bg-white focus:ring-4 outline-none resize-none transition-all text-slate-700 placeholder:text-slate-400/70 font-medium ${area.ring.replace('focus:ring-', 'focus:ring-').replace('500', '100')}`}
                  />

                  {linkedEntry && (
                    <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-800 italic flex gap-2">
                      <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" />
                      " {linkedEntry.text.substring(0, 80)}{linkedEntry.text.length > 80 ? '...' : ''} "
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK MODE (MODERN GRID) */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[1000px] grid grid-cols-[150px_repeat(7,1fr)] gap-4">
            {/* Header Row */}
            <div className="sticky left-0 z-10 pt-14">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Àrees</div>
            </div>
            {weekDates.map(d => (
              <div key={d.dateStr} className={`text-center p-4 rounded-2xl border ${d.dateStr === currentDateStr ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 border-brand-600 transform -translate-y-1' : 'bg-white border-slate-100 text-slate-500'}`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{d.dayName.substring(0, 3)}</div>
                <div className="text-2xl font-black">{new Date(d.dateObj).getDate()}</div>
              </div>
            ))}

            {/* Rows */}
            {AREAS.map(area => (
              <React.Fragment key={area.id}>
                <div className="sticky left-0 z-10 flex items-center justify-end pr-4">
                  <div className={`p-2 rounded-xl ${area.color} shadow-sm`}>
                    <span className="text-xl">{area.icon}</span>
                  </div>
                </div>
                {weekDates.map(d => {
                  const key = `${area.id}-${d.dateStr}`;
                  const isSelected = d.dateStr === currentDateStr;
                  return (
                    <div key={key} className={`relative group transition-all ${isSelected ? 'ring-2 ring-brand-100 rounded-xl bg-brand-50/20' : ''}`}>
                      <textarea
                        value={localPlan[key] || ''}
                        onChange={(e) => handleCellChange(d.dateStr, area.id, e.target.value)}
                        className="w-full h-28 p-3 text-xs md:text-sm bg-white border border-slate-100 rounded-xl resize-none transition-all outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 focus:shadow-md placeholder:text-slate-300"
                        placeholder="Planificar..."
                      />
                      {localPlan[key] && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-400 pointer-events-none" />}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
