import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, createInitialUser, auth } from '../../services/firebase';
import { ArrowRight, X, Sparkles, Brain, Shield, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import PrivacyPolicy from './legal/PrivacyPolicy';
import TermsOfService from './legal/TermsOfService';

// ... (existing imports)

// --- VISUAL ASSETS ---
const ASSETS = {
  hero: "/assets/landing-demo.webp",
  dashboard: "/assets/captura-panell-principal.png",
  neuroarcade: "/assets/captura-neuroarcade.png",

  therapy: [
    { src: "/assets/captura-assistent-terapeuta.png", key: "assistant" },
    { src: "/assets/captura-plannificador.png", key: "planner" },
    { src: "/assets/captura-pla-crisi.png", key: "crisis" },
    { src: "/assets/captura-perfil.png", key: "profile" },
    { src: "/assets/captura-marc-teoric.png", key: "library" },
  ],

  gym: [
    { src: "/assets/captura-gimnas-mental.png", key: "title" },
    { src: "/assets/captura-entrenament.png", key: "training" },
    { src: "/assets/captura-respira.png", key: "breathing" },
    { src: "/assets/captura-puzzle.png", key: "puzzles" },
    { src: "/assets/captura-memori.png", key: "memory" },
  ],

  games_videos: [
    { src: "/assets/video-pantalla-joc-1.mp4", key: "game1", type: 'video' },
    { src: "/assets/video-pantalla-joc-2.mp4", key: "game2", type: 'video' },
    { src: "/assets/video-pantalla-joc-3.mp4", key: "game3", type: 'video' },
  ]
};

// --- COMPONENTS ---

interface VideoProps {
  isOpen: boolean;
  src: string;
  type?: 'image' | 'video';
  onClose: () => void;
}

const VideoModal = ({ isOpen, src, type = 'image', onClose }: VideoProps) => {
  if (!isOpen || !src) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
        <X size={32} />
      </button>

      <div className="relative w-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black" onClick={(e) => e.stopPropagation()}>
        {type === 'video' ? (
          <video
            src={src}
            className="w-full h-full object-contain"
            controls
            autoPlay
            muted // Muted by default as requested
          />
        ) : (
          <img src={src} alt="Preview" className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
};

const Navbar = ({ view, setView, scrolled }: { view: string, setView: (v: 'landing' | 'login' | 'register') => void, scrolled: boolean }) => {
  const { t, i18n } = useTranslation();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled || view !== 'landing' ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm border-b border-slate-100' : 'bg-transparent py-6'
      }`}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/assets/NeuroGuard_Icona_Final.png"
            alt="NeuroGuard Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-md"
          />
          <span className={`text-xl font-serif font-bold tracking-tight transition-colors duration-500 ${(scrolled || view !== 'landing') ? 'text-slate-800' : 'text-white'
            }`}>
            NeuroGuard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${scrolled || view !== 'landing' ? 'text-slate-600' : 'text-white/80'}`}>
            <button onClick={() => i18n.changeLanguage('ca')} className={`hover:opacity-100 transition-opacity ${i18n.language === 'ca' ? 'opacity-100 underline' : 'opacity-60'}`}>CA</button>
            <button onClick={() => i18n.changeLanguage('es')} className={`hover:opacity-100 transition-opacity ${i18n.language === 'es' ? 'opacity-100 underline' : 'opacity-60'}`}>ES</button>
            <button onClick={() => i18n.changeLanguage('en')} className={`hover:opacity-100 transition-opacity ${i18n.language === 'en' ? 'opacity-100 underline' : 'opacity-60'}`}>EN</button>
          </div>

          {view === 'landing' ? (
            <button
              onClick={() => setView('login')}
              className={`text-xs md:text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform px-6 py-2.5 rounded-full border shadow-sm ${scrolled ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white/10 border-white/40 text-white hover:bg-white hover:text-teal-900'
                }`}
            >
              {t('landing.nav.login')}
            </button>
          ) : (
            <button
              onClick={() => setView('landing')}
              className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const ImageCarousel = ({ items, section }: { items: { src: string, key: string }[], section: string }) => {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000); // 5 seconds
    return () => clearInterval(timer);
  }, [items.length]);

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div className="relative group w-full max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200 bg-slate-50 aspect-video relative">
        <AnimatePresence mode='wait'>
          <motion.img
            key={index}
            src={items[index].src}
            alt={t(`landing.${section}.${items[index].key}`)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover object-top"
          />
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <p className="text-white text-xl font-bold tracking-wide text-center drop-shadow-md">
            {t(`landing.${section}.${items[index].key}`)}
          </p>
        </div>
      </div>

      <button onClick={prev} className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 p-3 bg-white text-teal-900 rounded-full shadow-lg hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100 duration-300">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 p-3 bg-white text-teal-900 rounded-full shadow-lg hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100 duration-300">
        <ChevronRight size={24} />
      </button>

      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-teal-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} />
        ))}
      </div>
    </div>
  );
};


const LandingPage = ({ setView, onOpenMedia }: { setView: (v: 'landing' | 'login' | 'register') => void, onOpenMedia: (src: string, type: 'video' | 'image') => void }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative w-full h-[95vh] min-h-[700px] overflow-hidden bg-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={ASSETS.hero}
            alt="App Demo Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center transform translate-y-[-5%]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex justify-center mb-8">
              <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-xl">
                {t('landing.hero.badge')}
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white tracking-tight mb-6 leading-none drop-shadow-2xl">
              {t('landing.hero.title_1')} <span className="text-teal-400 italic font-light">{t('landing.hero.title_2')}</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-2xl text-white/80 font-light leading-relaxed mb-12 drop-shadow-md">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setView('register')}
                className="group relative px-10 py-5 bg-teal-600 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-teal-500 transition-all duration-300 shadow-2xl hover:shadow-teal-500/30 w-full sm:w-auto overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center justify-center gap-3">
                  {t('landing.hero.cta')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => onOpenMedia(ASSETS.games_videos[0].src, 'video')}
                className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Play size={16} fill="currentColor" /> Demo Video
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        </motion.div>
      </section>


      {/* DASHBOARD PREVIEW */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700 aspect-[16/10]">
              <img src={ASSETS.dashboard} alt="Dashboard Interface" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <span className="text-teal-600 font-bold tracking-widest uppercase text-xs">{t('landing.dashboard_preview.badge')}</span>
            <h2 className="text-4xl md:text-6xl font-serif text-slate-800 leading-tight">
              {t('landing.dashboard_preview.title_1')} <br />
              <span className="text-teal-600">{t('landing.dashboard_preview.title_2')}</span>
            </h2>
            <p className="text-lg text-slate-600 font-light leading-relaxed max-w-md">
              {t('landing.dashboard_preview.desc')}
            </p>
            <ul className="space-y-4 pt-4">
              {[t('landing.dashboard_preview.list.check_ins'), t('landing.dashboard_preview.list.battery'), t('landing.dashboard_preview.list.crisis')].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs">✓</div>
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* THERAPEUTIC TOOLS CAROUSEL */}
      <section className="py-24 bg-white relative">
        <div className="text-center mb-16 px-6">
          <span className="text-teal-600 font-bold tracking-widest uppercase text-xs">Professional Tools</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-800 mt-2 mb-6">{t('landing.tools.title')}</h2>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">{t('landing.tools.subtitle')}</p>
        </div>

        <div className="px-6 md:px-12">
          <ImageCarousel items={ASSETS.therapy} section="tools" />
        </div>
      </section>


      {/* MENTAL GYM (GIMNAS MENTAL) CAROUSEL */}
      <section className="py-24 bg-slate-50 relative">
        <div className="text-center mb-16 px-6">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-bold tracking-widest uppercase text-xs mb-2">
            <Brain size={16} /> <span>Cognitive Training</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-800 mb-6">{t('landing.gym.title')}</h2>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">{t('landing.gym.subtitle')}</p>
        </div>

        <div className="px-6 md:px-12">
          <ImageCarousel items={ASSETS.gym} section="gym" />
        </div>
      </section>


      {/* GAMES / ARCADE SECTION */}
      <section className="py-32 bg-[#0F172A] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-20">
            <div className="space-y-8">
              <span className="text-blue-400 font-bold tracking-widest uppercase text-xs">{t('landing.arcade.badge')}</span>
              <h2 className="text-4xl md:text-6xl font-serif leading-tight">
                {t('landing.arcade.title')}
              </h2>
              <p className="text-lg text-slate-300 font-light leading-relaxed max-w-md">
                {t('landing.arcade.desc')}
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-500/40">
                  {t('landing.arcade.play')}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-800 transform rotate-[2deg] hover:rotate-0 transition-transform duration-700 aspect-video group cursor-pointer" onClick={() => onOpenMedia(ASSETS.neuroarcade, 'image')}>
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play fill="white" className="text-white ml-1" />
                  </div>
                </div>
                <img src={ASSETS.neuroarcade} alt="Neuro Arcade" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* GAME VIDEOS GRID */}
          <div className="grid md:grid-cols-3 gap-8">
            {ASSETS.games_videos.map((vid, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-800 border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-all" onClick={() => onOpenMedia(vid.src, 'video')}>
                {/* Placeholder for video thumbnail - using video tag paused at 0s could work or just black */}
                <video src={vid.src} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" muted playsInline />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/80 text-white flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/50">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                  <span className="text-white text-sm font-bold tracking-wide">{t(`landing.arcade.${vid.key}`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-32 bg-teal-600 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">Ready to reclaim your life?</h2>
          <p className="text-white/80 text-xl font-light mb-12">Join the community that understands your journey.</p>
          <button
            onClick={() => setView('register')}
            className="px-12 py-5 bg-white text-teal-900 rounded-full font-bold text-lg uppercase tracking-widest hover:bg-teal-50 shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            Create Free Account
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-xs uppercase tracking-widest border-t border-slate-800">
        <p>{t('landing.features.footer')}</p>
        <div className="flex justify-center gap-6 mt-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </>
  );
};

const AuthForm = ({ view, setView }: { view: 'login' | 'register', setView: (v: 'landing' | 'login' | 'register') => void }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'register' && !acceptedPrivacy) throw new Error("privacy-rejected");

      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createInitialUser(userCredential.user);
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Error";
      if (err.code === 'auth/wrong-password') msg = "Contrasenya incorrecta / Incorrect password";
      if (err.code === 'auth/user-not-found') msg = "Usuari no trobat / User not found";
      if (err.code === 'auth/email-already-in-use') msg = "Email en ús / Email already in use";
      if (err.message === 'privacy-rejected') msg = t('profile.alerts.privacy_required', 'Please accept Privacy Policy');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-6 flex flex-col items-center justify-center bg-[#F5F7FA]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-2">
            {view === 'login' ? t('landing.nav.login') : 'Benvingut/da'}
          </h2>
          <p className="text-slate-500 font-sans text-sm">
            {view === 'login' ? 'Entra a la teva zona segura.' : 'Crea el teu santuari personal.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-sans"
              placeholder="hello@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-sans"
              placeholder="••••••••"
            />
          </div>

          {view === 'register' && (
            <div className="flex items-start gap-3 mt-4 px-1">
              <input
                type="checkbox"
                id="privacy_check"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="privacy_check" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                Accepto la <button type="button" onClick={() => setShowPrivacy(true)} className="underline font-bold text-teal-700 hover:text-teal-800">Política de Privacitat</button> i els <button type="button" onClick={() => setShowTerms(true)} className="underline font-bold text-teal-700 hover:text-teal-800">Termes de Servei</button>.
              </label>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-white bg-rose-500 p-4 rounded-xl text-xs font-bold shadow-lg shadow-rose-200"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-sans font-bold uppercase tracking-widest py-4 rounded-xl mt-6 transition-all transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-teal-200"
          >
            {loading ? '...' : (view === 'login' ? 'Entrar' : 'Continuar')}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <button
            onClick={() => setView(view === 'login' ? 'register' : 'login')}
            className="text-teal-600 hover:text-teal-800 text-sm font-bold transition-colors"
          >
            {view === 'login' ? "No tens compte? Registra't" : "Ja tens compte? Inicia sessió"}
          </button>
        </div>

        {showPrivacy && (
          <div className="fixed inset-0 z-[100]">
            <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
          </div>
        )}

        {showTerms && (
          <div className="fixed inset-0 z-[100]">
            <TermsOfService onBack={() => setShowTerms(false)} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Auth: React.FC = () => {
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');
  const [scrolled, setScrolled] = useState(false);

  // Media State
  const [mediaOpen, setMediaOpen] = useState(false);
  const [currentMediaSrc, setCurrentMediaSrc] = useState('');
  const [currentMediaType, setCurrentMediaType] = useState<'image' | 'video'>('image');


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMedia = (src: string, type: 'image' | 'video') => {
    setCurrentMediaSrc(src);
    setCurrentMediaType(type);
    setMediaOpen(true);
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar view={view} setView={setView} scrolled={scrolled} />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div key="landing" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LandingPage setView={setView} onOpenMedia={openMedia} />
          </motion.div>
        ) : (
          <motion.div key="auth" exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AuthForm view={view} setView={setView} />
          </motion.div>
        )}
      </AnimatePresence>

      <VideoModal isOpen={mediaOpen} src={currentMediaSrc} type={currentMediaType} onClose={() => setMediaOpen(false)} />
    </div>
  );
};

export default Auth;
