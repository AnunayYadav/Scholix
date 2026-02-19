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
import ProfileSection from './components/ProfileSection.tsx';
import TimetableHub from './components/TimetableHub.tsx';
import QuizTaker from './components/QuizTaker.tsx';
import { ModuleType, UserProfile } from './types.ts';
import NexusServer from './services/nexusServer.ts';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
    <div className="relative overflow-hidden bg-transparent pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] drop-shadow-sm min-h-[2em]">
          Your LPU Journey, <br />
          <TypingText />
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
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
    { id: 'library', name: 'Content Library', desc: 'Access 1000+ PYQs, notes and records.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>, color: 'from-orange-500 to-red-600' },
    { id: 'quiz', name: 'AI Quiz Taker', desc: 'Generate custom tests from your subjects.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>, color: 'from-amber-500 to-orange-500' },
    { id: 'timetable', name: 'Timetable Hub', desc: 'Sync and manage your weekly schedule.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, color: 'from-orange-600 to-red-500' },
    { id: 'cgpa', name: 'CGPA Forge', desc: 'Calculate and forecast your performance.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 1 12 22" /><path d="M12 2v10h10" /></svg>, color: 'from-red-500 to-orange-500' },
    { id: 'attendance', name: 'Duty Guard', desc: 'Track your attendance and safe-bunks.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>, color: 'from-orange-400 to-orange-600' },
    { id: 'placement', name: 'Placement Prefect', desc: 'Analyze resumes and prep for jobs.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>, color: 'from-red-600 to-orange-600' },
    { id: 'campus', name: 'Campus Navigator', desc: 'Find blocks and rooms with ease.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>, color: 'from-orange-500 to-amber-500' },
    { id: 'freshers', name: 'Freshers Kit', desc: 'Essential guide for newcomers.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M20 7h-7L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg>, color: 'from-orange-700 to-red-600' }
  ];

  return (
    <div className="w-full h-full pb-20">
      <DashboardHero />
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => navigate(`/${f.id}`)}
            className="group relative p-8 bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 text-left transition-all hover:scale-[1.03] hover:shadow-2xl hover:border-orange-500/50 active:scale-95 border-none"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform`}>
              {f.icon}
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{f.name}</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            <div className="absolute top-8 right-8 text-slate-300 dark:text-white/10 group-hover:text-orange-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});


const RegistrationPrompt: React.FC<{ userProfile: UserProfile, onComplete: (profile: UserProfile) => void }> = React.memo(({ userProfile, onComplete }) => {
  const [regNo, setRegNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regNo.length < 8) {
      setError("Please enters a valid 8-digit Registration Number.");
      return;
    }
    setLoading(true);
    try {
      await NexusServer.updateProfile(userProfile.id, { registration_number: regNo });
      onComplete({ ...userProfile, registration_number: regNo });
    } catch (e: any) {
      if (e.message?.includes('unique_registration_number') || e.code === '23505') {
        setError("This Registration Number is already in use.");
      } else {
        setError(e.message || "Failed to register profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="nexus-modal w-full max-w-sm p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-600/10 blur-[32px] rounded-full pointer-events-none" />

        <div className="w-20 h-20 bg-orange-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-orange-600/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-orange-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="12" cy="11" r="3" /></svg>
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase leading-none">Identity Check</h3>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-6">Establish your Registration Number to continue to Nexus.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Registration Number</label>
            <div className="relative group/input">
              <input
                type="text" required value={regNo}
                onChange={e => setRegNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                className="w-full bg-slate-50 dark:bg-white/5 pl-6 pr-4 py-5 rounded-[24px] text-sm font-bold border border-slate-200 dark:border-white/10 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-800 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                placeholder="Candidate Registration (8 Digits)"
              />
            </div>
            {error && (
              <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{error}</p>
              </div>
            )}
          </div>

          <button
            type="submit" disabled={loading || regNo.length < 8}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50 border-none"
          >
            {loading ? 'Synchronizing...' : 'Authorize Signature'}
          </button>
        </form>
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
    NexusServer.recordVisit();
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    const unsubscribeAuth = NexusServer.onAuthStateChange(async (user) => {
      if (user) {
        const profile = await NexusServer.getProfile(user.id);
        const metadata = user.user_metadata || {};

        // Auto-sync: If DB profile is missing reg number but metadata has it, update DB
        if (profile && !profile.registration_number && metadata.registration_number) {
          NexusServer.updateProfile(user.id, { registration_number: metadata.registration_number })
            .catch(() => { });
        }

        // Deep merge: prioritize database profile, fallback to auth metadata
        const mergedProfile = profile ? {
          ...profile,
          registration_number: profile.registration_number || metadata.registration_number,
          username: profile.username || metadata.username
        } : {
          id: user.id,
          email: user.email!,
          is_admin: false,
          username: metadata.username,
          registration_number: metadata.registration_number
        };

        setUserProfile(mergedProfile as UserProfile);
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

  const showRegPrompt = userProfile && !userProfile.registration_number;

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
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 mb-2">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{userProfile.username}</p>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-white/40 truncate">{userProfile.email}</p>
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
          <div className={`relative z-0 ${location.pathname === '/' ? 'w-full' : 'max-w-7xl mx-auto'}`}>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showRegPrompt && <RegistrationPrompt userProfile={userProfile} onComplete={(p) => setUserProfile(p)} />}
      </main>
      <Analytics />
      <SpeedInsights />
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
