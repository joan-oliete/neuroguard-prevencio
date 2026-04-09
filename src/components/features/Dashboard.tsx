import React, { useState } from 'react';
import { UserAvatar } from './gamification/UserAvatar';
import { QuestBoard } from './gamification/QuestBoard';
import { StreakFlame } from './gamification/StreakFlame';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, Tooltip, ResponsiveContainer
} from 'recharts';
import { UserProfile, DailyStat } from '../../types';
import { Map, Trophy, Zap, Activity, Brain, Shield, Lock, Camera, GraduationCap, User as UserIcon, Sparkles } from 'lucide-react';
import { generateMemoryImage } from '../../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  data: DailyStat[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, data, onNavigate }) => {
  const { t } = useTranslation();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [memoryImage, setMemoryImage] = useState<string | null>(null);
  const [generatingImg, setGeneratingImg] = useState(false);

  // Gamification Levels defined as Map Nodes
  const levels = [
    { id: 'start', label: t('dashboard.map.nodes.base'), x: 10, y: 80, unlocked: true, icon: Shield, target: 'profile' },
    { id: 'cognition', label: t('dashboard.map.nodes.gym'), x: 30, y: 60, unlocked: true, icon: Brain, target: 'gym' },
    { id: 'emotional', label: t('dashboard.map.nodes.emotions'), x: 50, y: 40, unlocked: user.level >= 3, icon: Activity, target: 'diary' },
    { id: 'social', label: t('dashboard.map.nodes.social'), x: 70, y: 70, unlocked: true, icon: Map, target: 'roleplay' },
    { id: 'mastery', label: t('dashboard.map.nodes.mastery'), x: 90, y: 20, unlocked: user.level >= 10, icon: Trophy, target: 'loot' },
  ];

  const handleGenMemory = async () => {
    setGeneratingImg(true);
    // Hardcoded memorable moment for demo, or prompts user
    const img = await generateMemoryImage("Una platja tranquil·la al capvespre amb colors liles i taronges, estil Ghibli");
    if (img) setMemoryImage(img);
    setGeneratingImg(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* 1. HERO HEADER (Avatar) */}
      <div className="overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-8 relative text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <UserAvatar user={user} size="lg" className="ring-4 ring-white/10 rounded-full shadow-2xl" />

          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">
                  {t('dashboard.welcome', { name: user.name || t('dashboard.hero.default_name') })}
                </h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="bg-brand-600/30 border border-brand-500/50 text-brand-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {t('dashboard.level', { level: user.level || 1 })}
                  </span>
                  <span>·</span>
                  <span>{t('dashboard.hero.next_milestone', { xp: (user.level || 1) * 100 })}</span>
                </div>
              </div>
              <div className="flex items-end gap-6">
                <div className="text-right">
                  <span className="text-3xl font-black text-brand-400 block leading-none">{user.currency || 0}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('dashboard.hero.coins')}</span>
                </div>
                <StreakFlame days={user.streak || 0} />
              </div>
            </div>

            {/* XP Bar */}
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-1000 ease-out relative"
                style={{ width: `${Math.min(((user.avatar?.currentXp || 0) / ((user.level || 1) * 100)) * 100, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Quick Access Grid (Within Hero for visibility) */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 mt-8">
              <button onClick={() => onNavigate('planner')} className="flex flex-col items-center gap-2 group">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 group-hover:bg-brand-500 group-hover:border-brand-400 transition-all">
                  <Activity className="text-brand-200 group-hover:text-white" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">{t('dashboard.quick_access.planner')}</span>
              </button>

              <button onClick={() => onNavigate('loot')} className="flex flex-col items-center gap-2 group">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 group-hover:bg-teal-500 group-hover:border-teal-400 transition-all">
                  <Camera className="text-teal-200 group-hover:text-white" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">{t('dashboard.quick_access.gallery')}</span>
              </button>

              <button onClick={() => onNavigate('learning')} className="flex flex-col items-center gap-2 group">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 group-hover:bg-blue-500 group-hover:border-blue-400 transition-all">
                  <GraduationCap className="text-blue-200 group-hover:text-white" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">{t('dashboard.quick_access.courses')}</span>
              </button>

              <button onClick={() => onNavigate('game-center')} className="flex flex-col items-center gap-2 group">
                <div className="bg-violet-500/20 p-3 rounded-xl border border-violet-500/50 group-hover:bg-violet-500 group-hover:border-violet-400 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-violet-500/20 animate-pulse"></div>
                  <Zap className="text-violet-300 group-hover:text-white relative z-10" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-300 group-hover:text-violet-200 transition-colors">{t('dashboard.quick_access.arcade')}</span>
              </button>
            </div>

            {/* Extended Grid Row 2 */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 mt-4">
              <button onClick={() => onNavigate('safety-map')} className="flex flex-col items-center gap-2 group col-span-1">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all">
                  <Map className="text-emerald-200 group-hover:text-white" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">{t('dashboard.quick_access.map')}</span>
              </button>

              <button onClick={() => onNavigate('therapy-session')} className="flex flex-col items-center gap-2 group col-span-1">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 group-hover:bg-brand-500 group-hover:border-brand-400 transition-all">
                  <Sparkles className="text-brand-200 group-hover:text-white" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">AI Chat</span>
              </button>

              <button onClick={() => onNavigate('profile')} className="flex flex-col items-center gap-2 group col-span-1">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all">
                  <UserIcon className="text-indigo-200 group-hover:text-white" size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white transition-colors">{t('nav.profile')}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. NEURO-MAP (Clean Interactive Journey) */}
      <div
        onClick={() => onNavigate('gym-hub')}
        className="relative h-72 rounded-3xl bg-white border border-slate-100 shadow-soft overflow-hidden group cursor-pointer hover:border-brand-200 transition-colors"
      >
        <div className="absolute inset-0 bg-slate-50/50"></div>
        {/* Subtle grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.4 }}></div>

        {/* Path Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={`M ${levels.map(l => `${l.x} ${l.y}`).join(' L ')}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <path
            d={`M ${levels.map(l => `${l.x} ${l.y}`).join(' L ')}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="opacity-20"
          />
        </svg>

        {/* Nodes */}
        {levels.map((level) => (
          <div
            key={level.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group/node"
            style={{ left: `${level.x}%`, top: `${level.y}%` }}
            onMouseEnter={() => setActiveNode(level.id)}
            onMouseLeave={() => setActiveNode(null)}
            onClick={() => level.unlocked && onNavigate(level.target)}
          >
            <div className={`w-14 h-14 rounded-2xl rotate-45 flex items-center justify-center shadow-md transition-all duration-300 cursor-pointer 
                    ${level.unlocked
                ? 'bg-white border-2 border-brand-100 text-brand-600 hover:border-brand-300 hover:scale-110 hover:shadow-lg hover:shadow-brand-100'
                : 'bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-default'
              }`}>
              <div className="-rotate-45">
                {level.unlocked ? <level.icon size={22} /> : <Lock size={18} />}
              </div>
            </div>

            {/* Label */}
            <div className={`absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white border border-slate-100 shadow-xl text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none z-20 ${activeNode === level.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              {level.label}
            </div>
          </div>
        ))}
      </div>

      {/* QUEST BOARD */}
      <QuestBoard
        quests={[
          { id: 'q1', title: t('dashboard.quests.q1.title'), description: t('dashboard.quests.q1.desc'), xpReward: 10, isCompleted: true },
          { id: 'q2', title: t('dashboard.quests.q2.title'), description: t('dashboard.quests.q2.desc'), xpReward: 50, isCompleted: false },
          { id: 'q3', title: t('dashboard.quests.q3.title'), description: t('dashboard.quests.q3.desc'), xpReward: 10, isCompleted: false }
        ]}
      />

      {/* BOSS BATTLE BANNER */}
      <div
        onClick={() => onNavigate('boss')}
        className="cursor-pointer group relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl shadow-purple-900/20 border border-purple-500/30 hover:border-purple-400 transition-all hover:scale-[1.01]"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-300">
              {t('dashboard.boss.title')}
            </h3>
            <p className="text-purple-200 font-medium mt-1">
              {t('dashboard.boss.desc')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full border border-white/20 group-hover:bg-white/20 transition-colors">
            <Zap className="text-yellow-400 w-8 h-8 animate-pulse" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* 3. GENERATED MEMORY CARD */}
      {
        memoryImage && (
          <div className="animate-scaleIn rounded-3xl overflow-hidden shadow-xl shadow-brand-500/10 border border-slate-100 bg-white group">
            <div className="relative h-64 overflow-hidden">
              <img src={memoryImage} alt="Visualització" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-bold text-lg mb-1">{t('dashboard.memory.title')}</h3>
                <p className="text-white/80 text-xs">{t('dashboard.memory.desc')}</p>
              </div>
            </div>
          </div>
        )
      }

      {/* 4. CHARTS (Clean) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 shadow-soft p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-700 font-bold">{t('dashboard.stats.title')}</h3>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('dashboard.stats.last_7_days')}</span>
          </div>

          <div className="w-full h-[250px]">
            {/* Recharts sometimes fails to get width in flex/grid if not explicit. We force a min-height. */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAnx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} labelStyle={{ color: '#64748b' }} />
                <Area type="monotone" dataKey="anxiety" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAnx)" activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
