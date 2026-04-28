
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Shield,
    Zap,
    BookOpen,
    User,
    LogOut,
    PauseCircle,
    Clock,
    Menu,
    X,
    Sparkles,
    MessageCircle,
    User as UserIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CoolingOffTimer from '../features/CoolingOffTimer';
import { TherapistChat } from '../features/TherapistChat';
import { OfflineIndicator } from '../features/OfflineIndicator';

interface MainLayoutProps {
    children: React.ReactNode;
    currentView: string;
    onViewChange: (view: string) => void;
    showCoolingOff: boolean;
    setShowCoolingOff: (show: boolean) => void;
}

interface NavItemProps {
    id: string;
    label: string;
    icon: any;
    currentView: string;
    isActive?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon: Icon, currentView, isActive, onClick }) => {
    const active = isActive || currentView === id;

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-brand-50 text-brand-700 font-bold shadow-sm shadow-brand-100'
                : 'text-text-secondary hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <Icon
                size={20}
                className={`transition-colors duration-200 ${active ? 'text-brand-600 fill-brand-100' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                strokeWidth={active ? 2.5 : 2}
            />
            <span className="tracking-tight">{label}</span>
            {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            )}
        </button>
    );
};

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    currentView,
    onViewChange,
    showCoolingOff,
    setShowCoolingOff
}) => {
    const { logout } = useAuth();
    const { t } = useTranslation();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const handleNavClick = (id: string) => {
        onViewChange(id);
    };

    // Navigation Groups
    const clinicViews = ['clinic', 'manual', 'crisis', 'diary', 'safety-map', 'therapy', 'therapy-session'];
    const gymViews = ['gym-hub', 'gym', 'game-center', 'game-runner', 'game-puzzle', 'remote-tuner', 'boss', 'roleplay'];
    const libraryViews = ['library', 'theory', 'learning', 'profile'];

    const isClinicActive = clinicViews.includes(currentView);
    const isGymActive = gymViews.includes(currentView);
    const isLibraryActive = libraryViews.includes(currentView);

    // Mobile Bottom Navigation Items (The 4 Pillars)
    const mobileNavItems = [
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { id: 'clinic', label: 'Clínica', icon: Shield },
        { id: 'library', label: 'Biblio', icon: BookOpen },
        { id: 'profile', label: 'Perfil', icon: User },
    ];

    return (
        <div className="min-h-screen bg-surface-main flex font-sans">

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-72 bg-surface-card border-r border-slate-200 flex-col fixed h-full z-30 shadow-soft">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-surface-card to-brand-50/30">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/NeuroGuard_Icona_Final.png"
                            alt="NeuroGuard"
                            className="w-10 h-10 rounded-xl shadow-sm object-cover"
                        />
                        <div>
                            <h1 className="font-bold text-text-primary text-lg tracking-tight">NeuroGuard</h1>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Prevenció & Salut</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 opacity-80">Principal</p>
                    <NavItem id="dashboard" label={t('nav.dashboard')} icon={LayoutDashboard} currentView={currentView} onClick={() => handleNavClick('dashboard')} />

                    <div className="my-4 border-t border-slate-100 mx-4"></div>

                    <p className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 opacity-80">Pius Principals</p>
                    <NavItem id="clinic" label="Clínica" icon={Shield} isActive={isClinicActive} currentView={currentView} onClick={() => handleNavClick('clinic')} />
                    <NavItem id="library" label="Biblioteca" icon={BookOpen} isActive={isLibraryActive} currentView={currentView} onClick={() => handleNavClick('library')} />

                    <div className="my-4 border-t border-slate-100 mx-4"></div>
                    <NavItem id="profile" label="El Meu Perfil" icon={User} isActive={currentView === 'profile'} currentView={currentView} onClick={() => handleNavClick('profile')} />
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-3 bg-surface-muted/30">
                    <button
                        onClick={() => handleNavClick('crisis')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-md shadow-rose-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-95"
                    >
                        <Shield size={20} /> <span className='tracking-tight'>SOS Urge Surfing</span>
                    </button>
                    <button
                        onClick={() => setShowCoolingOff(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-md shadow-emerald-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-95"
                    >
                        <PauseCircle size={20} /> <span className='tracking-tight'>{t('nav.cooling_off')}</span>
                    </button>
                    <button onClick={() => logout()} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-text-muted hover:bg-white hover:text-red-500 hover:shadow-sm transition-all text-sm font-medium">
                        <LogOut size={16} /> {t('nav.logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Simplified) */}
            <div className="md:hidden fixed top-0 w-full bg-surface-card/90 backdrop-blur-md border-b border-slate-200/60 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <img
                        src="/assets/NeuroGuard_Icona_Final.png"
                        alt="NeuroGuard"
                        className="w-8 h-8 rounded-lg shadow-sm object-cover"
                    />
                    <span className="font-bold text-text-primary tracking-tight">NeuroGuard</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleNavClick('crisis')}
                        className="p-2 bg-rose-50 text-rose-700 rounded-full hover:bg-rose-100 transition-colors"
                    >
                        <Shield size={20} />
                    </button>
                    <button
                        onClick={() => setShowCoolingOff(true)}
                        className="p-2 bg-accent-50 text-accent-700 rounded-full hover:bg-accent-100 transition-colors"
                    >
                        <Clock size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-40 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.03)] text-xs font-medium text-slate-400">
                {mobileNavItems.map((item) => {
                    let active = currentView === item.id;
                    if (item.id === 'clinic' && isClinicActive) active = true;
                    if (item.id === 'gym-hub' && isGymActive) active = true;
                    if (item.id === 'library' && isLibraryActive) active = true;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active ? 'text-brand-600 -translate-y-2' : 'hover:text-slate-600'}`}
                        >
                            <div className={`p-2 rounded-full transition-all ${active ? 'bg-brand-50 shadow-sm shadow-brand-100' : 'bg-transparent'}`}>
                                <item.icon size={22} className={active ? 'fill-current' : ''} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span className={`${active ? 'opacity-100 font-bold' : 'opacity-70'}`}>{item.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Main Content Wrapper */}
            <main className={`flex-1 min-h-screen transition-all duration-300 md:ml-72 pt-20 md:pt-8 px-4 md:px-8 pb-32 md:pb-24 max-w-[1600px] mx-auto`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 pt-6 border-t border-slate-200 text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity pb-8">
                    <p className="text-xs text-text-muted font-bold flex items-center justify-center gap-2">
                        <Shield size={12} /> Avís de Seguretat
                    </p>
                    <p className="text-[10px] text-text-muted max-w-2xl mx-auto leading-relaxed">
                        NeuroGuard és una eina de suport i no substitueix el tractament professional.
                        Aquesta aplicació no és un dispositiu mèdic certificat. En cas d'emergència o crisi aguda, contacta immediatament amb el 112 o el teu professional de referència.
                    </p>
                </div>
            </main>

            {/* Cooling Off Timer Overlay */}
            {showCoolingOff && (
                <CoolingOffTimer
                    onCancel={() => setShowCoolingOff(false)}
                    onComplete={() => {
                        setShowCoolingOff(false);
                    }}
                />
            )}

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsChatOpen(true)}
                className="fixed bottom-24 right-6 md:bottom-8 md:right-8 bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 hover:shadow-brand-500/40 transition-all z-40 animate-bounce-slow"
            >
                <MessageCircle size={28} />
            </button>

            {/* Global Chat Overlay */}
            <TherapistChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            <OfflineIndicator />
        </div>
    );
};
