
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { VirtualTherapistProvider } from './context/VirtualTherapistContext';
import { MapProvider } from './context/MapContext';
import { MainLayout } from './components/layout/MainLayout';
import { doc, onSnapshot, collection, db, updateDoc, addDoc, serverTimestamp } from './services/firebase';
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

// --- LOADING SPINNER ---
const LoadingSpinner = ({ fullScreen = false, text }: { fullScreen?: boolean; text?: string }) => (
  <div className={`flex flex-col items-center justify-center p-4 ${fullScreen ? 'fixed inset-0 bg-white z-50' : ''}`}>
    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    {text && <p className="text-slate-500 text-sm font-medium animate-pulse">{text}</p>}
  </div>
);

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// --- APP CONTENT ---
const AppContent = () => {
  const { user, userProfile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showCoolingOff, setShowCoolingOff] = useState(false);

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

  const handleAddMemory = async (text: string, imageUrl: string) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/memories`), {
      note: text,
      imageUrl,
      date: new Date().toLocaleDateString(),
      type: 'generated',
      createdAt: serverTimestamp()
    });
  };

  const handleDeleteMemory = async (id: number) => {
    console.log("Delete memory logic todo for ID:", id);
  };

  const renderContent = () => {
    if (!userProfile || !user) return <LoadingSpinner text="Carregant perfil..." />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={userProfile} data={stats} onNavigate={setCurrentView} />;

      case 'clinic':
        return userProfile.activeManualId ? (
          <ManualLoader manualId={userProfile.activeManualId} userId={user.uid} />
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
        return <Profile user={userProfile} />;

      case 'crisis':
        return <CrisisComponent
          plan={crisisPlan}
          onUpdate={handleUpdatePlan}
          onNavigate={setCurrentView}
        />;

      case 'theory': return <Theory />;
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

      case 'therapy-session':
        return <TherapistSession onBack={() => setCurrentView('dashboard')} />;

      default: return <Dashboard user={userProfile} data={stats} onNavigate={setCurrentView} />;
    }
  };

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
      <div className="bg-gray-100 min-h-screen text-slate-800 font-sans">
        <Routes>
          <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" replace />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <VirtualTherapistProvider>
                <MapProvider>
                  <AppContent />
                </MapProvider>
              </VirtualTherapistProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;