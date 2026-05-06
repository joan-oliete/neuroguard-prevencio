
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { VirtualTherapistProvider } from './context/VirtualTherapistContext';
import { MapProvider } from './context/MapContext';
import { MainLayout } from './components/layout/MainLayout';
import { doc, onSnapshot, collection, db, updateDoc, addDoc, deleteDoc, serverTimestamp, storage, ref, uploadString, getDownloadURL } from './services/firebase';
import { DailyStat, CrisisPlan, Memory, RelapseManual } from './types/index';

// --- COMPONENTS ---
import Auth from './components/features/Auth';
import Dashboard from './components/features/Dashboard';
import Profile from './components/features/Profile';
import ManualLoader from './components/features/ManualLoader';
import CrisisComponent from './components/features/CrisisComponent';
import CorporateLearningHub from './components/features/CorporateLearningHub';
import { NotificationManager } from './components/features/NotificationManager';
import TheLoot from './components/features/TheLoot';
import Theory from './components/features/Theory';
import SafetyMap from './components/features/map/SafetyMap';
import Planner from './components/features/Planner';
import { TherapistSession } from './components/features/therapy/TherapistSession';
import Diary from './components/features/Diary';
import PreventionSection from './components/features/PreventionSection';
import SetupWizard from './components/features/SetupWizard';

// --- LOADING SPINNER ---
const LoadingSpinner = ({ fullScreen = false, text }: { fullScreen?: boolean; text?: string }) => (
  <div className={`flex flex-col items-center justify-center p-4 ${fullScreen ? 'fixed inset-0 bg-white z-50' : ''}`}>
    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    {text && <p className="text-slate-500 text-sm font-medium animate-pulse">{text}</p>}
  </div>
);

// --- PROTECTED ROUTE REMOVED ---

// --- APP CONTENT ---
const AppContent = () => {
  const { user, userProfile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showCoolingOff, setShowCoolingOff] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Data State
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [crisisPlan, setCrisisPlan] = useState<CrisisPlan>({ signal: '', action: '', contact: '', value: '' });
  const [memories, setMemories] = useState<Memory[]>([]);
  const [manual, setManual] = useState<RelapseManual | null>(null);
  const [activeDiaryLink, setActiveDiaryLink] = useState<{ date: string; area: string; text: string } | undefined>();

  useEffect(() => {
    if (!user) return;

    // 1. Listen to Stats
    const statsUnsub = onSnapshot(collection(db, `users/${user.uid}/stats`), (snapshot) => {
      const data = snapshot.docs.map(d => d.data() as DailyStat);
      setStats(data.length ? data : [{ day: 'Avui', anxiety: 5 }]); // Default data if empty
    });

    // 2. Listen to Crisis Plan (safely)
    const planUnsub = onSnapshot(doc(db, `users/${user.uid}/crisisPlan/current`), (docSnap) => {
      if (docSnap.exists()) {
        setCrisisPlan(docSnap.data() as CrisisPlan);
      }
    });

    // 3. Listen to Memories
    const memoriesUnsub = onSnapshot(collection(db, `users/${user.uid}/memories`), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setMemories(data);
    });

    // 4. Listen to Manual (if profile loaded)
    let manualUnsub = () => { };
    if (userProfile?.activeManualId) {
      manualUnsub = onSnapshot(doc(db, `users/${user.uid}/manuals`, userProfile.activeManualId), (docSnap) => {
        if (docSnap.exists()) {
          setManual({ id: docSnap.id, ...docSnap.data() } as RelapseManual);
        }
      });
    }


    return () => {
      statsUnsub();
      planUnsub();
      memoriesUnsub();
      manualUnsub();
    };
  }, [user, userProfile]);

  const handleUpdatePlan = async (newPlan: CrisisPlan) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `users/${user.uid}/crisisPlan/current`), newPlan as any);
    } catch (e) {
      console.error("Error updating plan", e);
    }
  };

  const handleAddMemory = async (text: string, imageUrl?: string) => {
    if (!user) return;
    try {
      const data: any = {
        note: text,
        date: new Date().toLocaleDateString(),
        type: 'generated',
        createdAt: serverTimestamp()
      };
      
      if (imageUrl) {
        if (imageUrl.startsWith('data:image')) {
          // Upload to storage
          const storageRef = ref(storage, `users/${user.uid}/memories/${Date.now()}.jpg`);
          await uploadString(storageRef, imageUrl, 'data_url');
          data.imageUrl = await getDownloadURL(storageRef);
        } else {
          data.imageUrl = imageUrl;
        }
      }

      await addDoc(collection(db, `users/${user.uid}/memories`), data);
    } catch (error) {
      console.error("Error adding memory: ", error);
    }
  };

  const handleDeleteMemory = async (id: number | string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/memories`, id.toString()));
    } catch (error) {
      console.error("Error deleting memory: ", error);
    }
  };

  const renderContent = () => {
    if (!userProfile || !user) return <LoadingSpinner text="Carregant perfil..." />;

    if (!userProfile.hasCompletedTutorial) {
      return <SetupWizard userProfile={userProfile} onComplete={() => setCurrentView('dashboard')} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={userProfile} data={stats} onNavigate={setCurrentView} />;

      case 'clinic':
        return userProfile.activeManualId ? (
          <ManualLoader manualId={userProfile.activeManualId} userId={user.uid} onNavigate={setCurrentView} />
        ) : <div className="p-8 text-center">No active manual</div>;

      case 'library':
        return <CorporateLearningHub user={userProfile} />;

      case 'loot':
        return <TheLoot
          user={userProfile}
          memories={memories}
          onAddMemory={handleAddMemory}
          onDeleteMemory={handleDeleteMemory}
          onBack={() => setCurrentView('dashboard')}
        />;

      case 'profile':
        return <Profile 
           user={userProfile} 
           onNavigate={setCurrentView}
           onShowCoolingOff={() => setShowCoolingOff(true)}
        />;

      case 'support':
        return userProfile.activeManualId ? (
          <ManualLoader manualId={userProfile.activeManualId} userId={user.uid} onNavigate={setCurrentView} initialSection="support" />
        ) : <div className="p-8 text-center">No active manual</div>;

      case 'crisis':
        return <CrisisComponent
          plan={crisisPlan}
          onUpdate={handleUpdatePlan}
          onNavigate={setCurrentView}
        />;

      case 'prevention':
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
               <div className="flex items-center gap-4 mb-6">
                  <button onClick={() => setCurrentView('dashboard')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  </button>
                  <h2 className="text-2xl font-bold text-slate-800">Kit d'Emergència</h2>
               </div>
               <PreventionSection onNavigate={setCurrentView} />
            </div>
        );

      case 'theory': return <Theory onBack={() => setCurrentView('dashboard')} />;
      case 'safety-map': return <SafetyMap onBack={() => setCurrentView('dashboard')} />;

      // --- LIBRARY & TOOLS ---
      case 'planner':
        return <Planner
          manual={manual || {} as any}
          manualId={userProfile.activeManualId || 'default_manual'}
          userId={user.uid}
          onNavigateToDiary={(link) => {
            setActiveDiaryLink(link);
            setCurrentView('diary');
          }}
          onBack={() => setCurrentView('dashboard')}
        />;

      case 'diary':
        return <Diary 
           user={user as any} 
           linkedActivity={activeDiaryLink} 
           onClearLink={() => setActiveDiaryLink(undefined)} 
        />;

      default: return <Dashboard user={userProfile} data={stats} onNavigate={setCurrentView} />;
    }
  };

  if (currentView === 'therapy-session') {
    return <TherapistSession onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <MainLayout
      currentView={currentView}
      onViewChange={setCurrentView}
      showCoolingOff={showCoolingOff}
      setShowCoolingOff={setShowCoolingOff}
    >
      {renderContent()}
    </MainLayout>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen text="Carregant NeuroGuard..." />;

  return (
    <Router>
      <NotificationManager />
      <div className="bg-gray-100 min-h-screen text-slate-800 font-sans overflow-x-hidden">
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/*" element={
            !user ? <Auth /> : (
              <VirtualTherapistProvider>
                <MapProvider>
                  <AppContent />
                </MapProvider>
              </VirtualTherapistProvider>
            )
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;