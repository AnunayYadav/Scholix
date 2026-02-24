import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import PlacementPrefect from './components/PlacementPrefect.tsx';
import ContentLibrary from './components/ContentLibrary.tsx';
import CampusNavigator from './components/CampusNavigator.tsx';
import HelpSection from './components/HelpSection.tsx';
import FreshersKit from './components/FreshersKit.tsx';
import CGPACalculator from './components/CGPACalculator.tsx';
import AttendanceTracker from './components/AttendanceTracker.tsx';
import ShareReport from './components/ShareReport.tsx';
import AboutUs from './components/AboutUs.tsx';
import AuthModal from './components/AuthModal.tsx';
import VerifiedBadge from './components/VerifiedBadge.tsx';
import ProfileSection from './components/ProfileSection.tsx';
import TimetableHub from './components/TimetableHub.tsx';
import QuizTaker from './components/QuizTaker.tsx';
import MarketplaceHub from './components/MarketplaceHub.tsx';
import RoommateFinder from './components/RoommateFinder.tsx';
import EmergencyContacts from './components/EmergencyContacts.tsx';
import AIToolsDirectory from './components/AIToolsDirectory.tsx';
import AdminStats from './components/AdminStats.tsx';
import { ModuleType, UserProfile } from './types.ts';
import NexusServer from './services/nexusServer.ts';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ToastContainer } from './components/Toast.tsx';
import NotificationBell from './components/NotificationBell.tsx';

const getModuleFromPath = (path: string): ModuleType => {
  const p = path.toLowerCase();
  if (p.includes('/share-cgpa')) return ModuleType.SHARE_CGPA;
  if (p.endsWith('/attendance')) return ModuleType.ATTENDANCE;
  if (p.endsWith('/timetable')) return ModuleType.TIMETABLE;
  if (p.endsWith('/quiz')) return ModuleType.QUIZ;
  if (p.endsWith('/cgpa')) return ModuleType.CGPA;
  if (p.endsWith('/placement')) return ModuleType.PLACEMENT;
  if (p.endsWith('/library')) return ModuleType.LIBRARY;
  if (p.endsWith('/campus')) return ModuleType.CAMPUS;
  if (p.endsWith('/freshers')) return ModuleType.FRESHERS;
  if (p.endsWith('/help')) return ModuleType.HELP;
  if (p.endsWith('/about')) return ModuleType.ABOUT;
  if (p.endsWith('/profile')) return ModuleType.PROFILE;
  if (p.endsWith('/marketplace')) return ModuleType.MARKETPLACE;
  if (p.endsWith('/roommate')) return ModuleType.ROOMMATE;
  if (p.endsWith('/emergency')) return ModuleType.EMERGENCY;
  if (p.endsWith('/ai-tools')) return ModuleType.AI_TOOLS;
  if (p.endsWith('/admin-stats')) return ModuleType.ADMIN_STATS;
  return ModuleType.DASHBOARD;
};

const getPathFromModule = (module: ModuleType): string => {
  switch (module) {
    case ModuleType.ATTENDANCE: return '/attendance';
    case ModuleType.TIMETABLE: return '/timetable';
    case ModuleType.QUIZ: return '/quiz';
    case ModuleType.CGPA: return '/cgpa';
    case ModuleType.PLACEMENT: return '/placement';
    case ModuleType.LIBRARY: return '/library';
    case ModuleType.CAMPUS: return '/campus';
    case ModuleType.FRESHERS: return '/freshers';
    case ModuleType.HELP: return '/help';
    case ModuleType.ABOUT: return '/about';
    case ModuleType.PROFILE: return '/profile';
    case ModuleType.DASHBOARD: return '/';
    case ModuleType.SHARE_CGPA: return '/share-cgpa';
    case ModuleType.MARKETPLACE: return '/marketplace';
    case ModuleType.ROOMMATE: return '/roommate';
    case ModuleType.EMERGENCY: return '/emergency';
    case ModuleType.AI_TOOLS: return '/ai-tools';
    case ModuleType.ADMIN_STATS: return '/admin-stats';
    default: return '/';
  }
};

const TypingText: React.FC = React.memo(() => {
  const words = ["Simplified.", "Smarter.", "Seamless.", "Sorted.", "Secured."];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(1);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 1 && reverse) {
      const timeout = setTimeout(() => {
        setReverse(false);
        setIndex((prev) => (prev + 1) % words.length);
      }, 400);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : (Math.random() * 40 + 80));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 inline-block min-h-[1.2em] relative transition-all duration-300 ease-out">
      {words[index].substring(0, subIndex)}
      <span className="inline-block w-[4px] h-[0.9em] ml-1 bg-gradient-to-b from-orange-500 to-red-600 animate-cursor-blink align-middle translate-y-[-2px] shadow-[0_0_15px_rgba(234,88,12,0.6)] rounded-full transition-all duration-200"></span>
    </span>
  );
});

const BackgroundEffects: React.FC = React.memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-black">
      {/* Seamless Merger */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 dark:from-black via-slate-50/10 dark:via-black/10 to-transparent h-96 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-black via-slate-50/10 dark:via-black/10 to-transparent w-96 z-10 pointer-events-none" />

      {/* Soft Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] contrast-150" />
    </div>
  );
});

const DashboardHero: React.FC = React.memo(() => {
  return (
    <div className="relative overflow-hidden bg-transparent pt-16 pb-10 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] drop-shadow-sm min-h-[2em]">
          Your LPU Journey, <br />
          <TypingText />
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          Master your academics with AI-powered quiz generation, precision CGPA tracking, and seamless
          schedule synchronization.
        </p>
      </div>
    </div>
  );
});

const Dashboard: React.FC = React.memo(() => {
  const navigate = useNavigate();

  const features = [
    { id: 'library', name: 'Content Library', desc: 'Access 1000+ PYQs, notes and records.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    { id: 'quiz', name: 'AI Quiz Taker', desc: 'Generate custom tests from your subjects.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg> },
    { id: 'timetable', name: 'Timetable Hub', desc: 'Sync and manage your weekly schedule.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: 'cgpa', name: 'CGPA Forge', desc: 'Calculate and forecast your performance.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 1 12 22" /><path d="M12 2v10h10" /></svg> },
    { id: 'attendance', name: 'Duty Guard', desc: 'Track your attendance and safe-bunks.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg> },
    { id: 'placement', name: 'Placement Prefect', desc: 'Analyze resumes and prep for jobs.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> },
    { id: 'campus', name: 'Campus Navigator', desc: 'Find blocks and rooms with ease.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg> },
    { id: 'freshers', name: 'Freshers Kit', desc: 'Essential guide for newcomers.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M20 7h-7L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg> },
    { id: 'marketplace', name: 'LPU Market', desc: 'Buy/Sell used books and items.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
    { id: 'roommate', name: 'Roommate Finder', desc: 'Find your perfect LPU flatmate.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: 'emergency', name: 'Rescue Line', desc: 'Emergency LPU official contacts.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> },
    { id: 'ai-tools', name: 'AI Directory', desc: 'Curated AI tools for students.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 2a10 10 0 1 0 10 10H12V2Z" /><path d="M12 12L2.1 12.1" /><path d="M12 12v9.9" /><path d="M12 12l7-7" /><path d="M12 12l7 7" /></svg> }
  ];

  return (
    <div className="w-full h-full pb-20">
      <DashboardHero />
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => navigate(`/${f.id}`)}
            className="group relative p-6 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-slate-200 dark:border-white/10 text-left transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] hover:border-orange-500/40 active:scale-95 cursor-pointer overflow-hidden"
          >
            {/* Ambient Background Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.07] transition-opacity duration-500`} />

            <div className={`relative w-12 h-12 rounded-[16px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white mb-6 shadow-2xl shadow-orange-500/20 group-hover:scale-110 transition-all duration-500 group-hover:rotate-3`}>
              <div className="absolute inset-0 rounded-[16px] blur-xl opacity-40 bg-inherit -z-10 group-hover:blur-2xl transition-all" />
              <div className="scale-90">
                {f.icon}
              </div>
            </div>

            <div className="relative space-y-2">
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{f.name}</h4>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400/80 leading-relaxed max-w-[90%]">{f.desc}</p>
            </div>

            <div className="absolute top-8 right-8 text-slate-300 dark:text-white/10 group-hover:text-orange-500 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-4 h-4"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});




const AppContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const currentModule = getModuleFromPath(location.pathname);

  useEffect(() => {
    NexusServer.trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    NexusServer.recordVisit();
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    const unsubscribeAuth = NexusServer.onAuthStateChange(async (user) => {
      if (user) {
        try {
          // ensureProfile guarantees a record exists in 'profiles' table
          const profile = await NexusServer.ensureProfile(user);
          setUserProfile(profile);
        } catch (err) {
          console.error("Profile synchronization error:", err);
          // Fallback to local profile if DB insert fails
          const metadata = user.user_metadata || {};
          setUserProfile({
            id: user.id,
            email: user.email!,
            is_admin: false,
            username: metadata.username || user.email?.split('@')[0],
            registration_number: metadata.registration_number
          } as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  const navigateToModule = React.useCallback((module: ModuleType) => {
    const path = getPathFromModule(module);
    navigate(path);
  }, [navigate]);



  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-200">
      <Sidebar
        currentModule={currentModule}
        setModule={navigateToModule}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        userProfile={userProfile}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-black">
        <BackgroundEffects />

        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 bg-white/90 dark:bg-black z-10">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-400 mr-4 border-none bg-transparent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <span className="md:hidden font-bold text-orange-500 cursor-pointer" onClick={() => navigate('/')}>LPU-Nexus</span>
          </div>
          <div className="flex items-center space-x-3 ml-auto">
            <NotificationBell userProfile={userProfile} />
            <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-90">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
            <div className="relative">
              {userProfile ? (
                <>
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 to-red-600 p-[1.5px] border-none shadow-[0_8px_20px_rgba(234,88,12,0.2)] hover:scale-105 active:scale-95 transition-all overflow-hidden cursor-pointer group">
                    <div className="w-full h-full bg-white dark:bg-[#0a0a0a] rounded-full overflow-hidden flex items-center justify-center text-slate-900 dark:text-orange-600 font-black text-sm">
                      {userProfile.avatar_url ? (
                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span>{userProfile.username?.[0]?.toUpperCase() || userProfile.email[0].toUpperCase()}</span>
                      )}
                    </div>
                  </button>
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileMenuOpen(false)} />
                      <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden py-3 z-50 animate-fade-in backdrop-blur-xl">
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 mb-2 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600 font-black text-[10px] shrink-0 border border-orange-600/5 overflow-hidden">
                            {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" /> : (userProfile.username?.[0]?.toUpperCase() || 'V')}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px] truncate">{userProfile.username || 'Verto'}</p>
                              <VerifiedBadge isAdmin={userProfile.is_admin} size="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{userProfile.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/70 hover:text-orange-600 dark:hover:text-white hover:bg-orange-600/5 dark:hover:bg-white/5 border-none bg-transparent flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-orange-600/20 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </div>
                          View Terminal
                        </button>
                        {userProfile.is_admin && (
                          <button
                            onClick={() => { navigate('/admin-stats'); setIsProfileMenuOpen(false); }}
                            className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-white/70 hover:text-orange-600 dark:hover:text-white hover:bg-orange-600/5 dark:hover:bg-white/5 border-none bg-transparent flex items-center gap-3 transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-orange-600/20 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                            </div>
                            System Intelligence
                          </button>
                        )}
                        <button
                          onClick={async () => { await NexusServer.signOut(); navigate('/'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 border-none bg-transparent flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                          </div>
                          De-authenticate
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="w-10 h-10 rounded-full border-none bg-slate-100 dark:bg-[#0a0a0a] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-95">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div id="main-content-area" className={`flex-1 overflow-y-auto relative scroll-smooth ${location.pathname === '/' ? 'p-0' : 'p-4 md:p-8'} bg-transparent content-visibility-auto`}>
          <div className={`relative ${location.pathname === '/' ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/placement" element={<PlacementPrefect userProfile={userProfile} />} />
              <Route path="/timetable" element={<TimetableHub userProfile={userProfile} />} />
              <Route path="/quiz" element={<QuizTaker userProfile={userProfile} />} />
              <Route path="/library" element={<ContentLibrary userProfile={userProfile} />} />
              <Route path="/campus" element={<CampusNavigator />} />
              <Route path="/help" element={<HelpSection />} />
              <Route path="/freshers" element={<FreshersKit />} />
              <Route path="/cgpa" element={<CGPACalculator userProfile={userProfile} />} />
              <Route path="/attendance" element={<AttendanceTracker />} />
              <Route path="/share-cgpa" element={<ShareReport />} />
              <Route path="/about" element={<AboutUs userProfile={userProfile} />} />
              <Route path="/profile" element={<ProfileSection userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={(m) => navigate(getPathFromModule(m))} />} />
              <Route path="/marketplace" element={<MarketplaceHub userProfile={userProfile} />} />
              <Route path="/roommate" element={<RoommateFinder userProfile={userProfile} />} />
              <Route path="/emergency" element={<EmergencyContacts />} />
              <Route path="/ai-tools" element={<AIToolsDirectory />} />
              <Route path="/admin-stats" element={<AdminStats userProfile={userProfile} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </main>
      <Analytics />
      <SpeedInsights />
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
