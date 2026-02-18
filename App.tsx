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

const DashboardHero: React.FC<{ navigate: (p: string) => void }> = React.memo(({ navigate }) => {
  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-black p-8 md:p-16 mb-0 shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] group/hero min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="relative z-10 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:items-center">
        <div className="flex flex-col space-y-4 md:space-y-12">
          {/* Header row: Title + Image on Mobile */}
          <div className="grid grid-cols-[1fr_210px] sm:grid-cols-[1fr_250px] lg:block gap-1 items-center">
            <h2 className="text-5xl sm:text-7xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] lg:leading-[0.9] drop-shadow-sm min-h-[3em] sm:min-h-[2.7em]">
              Your LPU <br />
              Journey, <br />
              <TypingText />
            </h2>

            {/* Mobile Only visual Suite */}
            <div className="lg:hidden relative h-64 flex items-center justify-center overflow-visible">
              <div className="relative w-full scale-125 origin-center translate-y-14">
                <img src="/lap.png" alt="Laptop" className="w-full h-auto drop-shadow-[0_0_50px_rgba(234,88,12,0.3)]" />
                <div className="absolute -top-20 -left-8 w-28 z-10">
                  <img src="/note.png" alt="Notes" className="w-full h-auto drop-shadow-[0_0_40px_rgba(234,88,12,0.4)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-8">
            <p className="text-slate-600 dark:text-slate-400 text-[13px] md:text-lg font-medium leading-relaxed max-w-lg">
              Master your academics with AI-powered quiz generation, precision CGPA tracking, and seamless
              schedule synchronization.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <button
                onClick={() => navigate('/library')}
                className="relative overflow-hidden px-10 py-5 lg:px-12 lg:py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.05] active:scale-95 transition-all rounded-[32px] lg:rounded-[100px] text-white font-black text-xs lg:text-[13px] uppercase tracking-[0.25em] flex items-center gap-4 shadow-[0_20px_60px_rgba(234,88,12,0.5)] border border-white/20 hover:border-white/40 group/btn cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span>Explore Library</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Only Visual Suite */}
        <div className="hidden lg:flex relative items-center justify-center h-[400px] xl:h-[500px] w-full">
          <div className="relative z-20 w-64 xl:w-96 drop-shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <img src="/lap.png" alt="LPU Nexus" className="w-full h-auto" />
          </div>
          {/* Desktop Note */}
          <div className="absolute top-8 -left-8 xl:top-12 xl:-left-12 w-24 xl:w-40 z-30 opacity-80">
            <img src="/note.png" alt="Notes" className="w-full h-auto" />
          </div>
          {/* Desktop Certificate */}
          <div className="absolute bottom-16 right-8 xl:right-12 w-32 xl:w-56 z-10 opacity-80">
            <img src="/certificate.png" alt="Certificate" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
});

const Dashboard: React.FC = React.memo(() => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <DashboardHero navigate={navigate} />
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-3xl bg-black/60">
      <div className="bg-white dark:bg-black rounded-[48px] w-full max-w-md shadow-3xl border border-slate-200 dark:border-white/10 p-10 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/10 blur-[64px] rounded-full pointer-events-none" />

        <div className="w-20 h-20 bg-orange-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-orange-600/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-orange-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="12" cy="11" r="3" /></svg>
        </div>

        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase leading-none">Identity Check</h3>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Establish your Registration Number to continue to Nexus.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Registration Number</label>
            <div className="relative group">
              <input
                type="text" required value={regNo}
                onChange={e => setRegNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                className="w-full bg-slate-50 dark:bg-black pl-6 pr-4 py-5 rounded-[24px] text-sm font-bold border border-slate-200 dark:border-white/10 focus:ring-4 focus:ring-orange-600/10 dark:text-white transition-all shadow-inner outline-none"
                placeholder="Candidate Registration (8 Digits)"
              />
            </div>
            {error && <p className="text-[10px] font-black text-red-500 uppercase mt-4 text-center">{error}</p>}
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
                      <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden py-3 z-50 animate-fade-in backdrop-blur-xl">
                        <div className="px-5 py-3 border-b border-white/5 mb-2">

                          <p className="text-[11px] font-bold text-white/40 truncate">{userProfile.email}</p>
                        </div>
                        <button
                          onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white hover:bg-white/5 border-none bg-transparent flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-600/20 transition-colors">
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
          {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
          {showRegPrompt && <RegistrationPrompt userProfile={userProfile} onComplete={(p) => setUserProfile(p)} />}
        </div>
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
