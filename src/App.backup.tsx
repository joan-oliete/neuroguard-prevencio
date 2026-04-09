import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/features/Dashboard';
import Profile from './components/features/Profile';
import MainLayout from './components/layout/MainLayout';
import EmergencyContact from './components/features/EmergencyContact';
import ChatbotComponent from './components/features/ChatbotComponent';
import CrisisComponent from './components/features/CrisisComponent';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import InitialAssessment from './components/features/InitialAssessment';
import SocialSimulation from './components/features/SocialSimulation';
import TheLoot from './components/features/TheLoot';
import MapComponent from './components/features/MapComponent';
import NotificationManager from './components/common/NotificationManager';
import AdminDashboard from './components/features/AdminDashboard';
import GameCenter from './components/features/GameCenter';
import CognitiveGame from './components/features/CognitiveGame';
import BreathingExercise from './components/features/BreathingExercise';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const App = () => {
    const { user, loading, userProfile } = useAuth();
    const { t } = useTranslation();

    // LOGIC: Profile Loading Timeout
    const [isProfileDelayed, setIsProfileDelayed] = useState(false);
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (user && !userProfile) {
            timer = setTimeout(() => setIsProfileDelayed(true), 8000); // 8 seconds timeout
        }
        return () => clearTimeout(timer);
    }, [user, userProfile]);


    // Show loading spinner while Auth checking
    if (loading) {
        return <LoadingSpinner fullScreen text={t('common.loading')} />;
    }

    // Show spinner if User is Logged In but Profile is not ready yet
    if (user && !userProfile && !isProfileDelayed) {
        return <LoadingSpinner fullScreen text="Carregant el teu perfil..." />;
    }

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NotificationManager />
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
                    <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            {/* Show Assessment if New User & Profile Loaded */}
                            {userProfile?.needsInitialAssessment ? (
                                <InitialAssessment />
                            ) : (
                                <MainLayout />
                            )}
                        </ProtectedRoute>
                    }>
                        {/* ... Routes ... */}
                        <Route index element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="emergency" element={<EmergencyContact />} />
                        <Route path="chat" element={<ChatbotComponent />} />
                        <Route path="crisis" element={<CrisisComponent />} />
                        <Route path="social-simulation" element={<SocialSimulation />} />
                        <Route path="the-loot" element={<TheLoot />} />
                        <Route path="map" element={<MapComponent />} />
                        <Route path="admin" element={<AdminDashboard />} />
                        <Route path="game-center" element={<GameCenter />} />
                        <Route path="cognitive-game" element={<CognitiveGame />} />
                        <Route path="breathing-exercise" element={<BreathingExercise />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </Router>
    );
};

export default App;
