import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import ContentLibrary from './components/ContentLibrary.tsx';
import CampusNavigator from './components/CampusNavigator.tsx';
import HelpSection from './components/HelpSection.tsx';
import FreshersKit from './components/FreshersKit.tsx';
import SettingsHub from './components/SettingsHub.tsx';
import ShareReport from './components/ShareReport.tsx';
import ToolsHub from './components/ToolsHub.tsx';
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
import BuyMeACoffee from './components/BuyMeACoffee.tsx';
import PaymentSuccess from './components/PaymentSuccess.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import CookieBanner from './components/CookieBanner.tsx';
import ScholixLanding from './components/ScholixLanding.tsx';
import AnnouncementBand from './components/AnnouncementBand.tsx';
import BottomNavbar from './components/BottomNavbar.tsx';
import { UniversityProvider, useUniversity, UniversityId, UNIVERSITIES } from './hooks/useUniversity.tsx';

import { ModuleType, UserProfile, TimetableData } from './types.ts';

import NexusServer from './services/nexusServer.ts';
import { useQuizDashboardStore, getLevelInfo } from './stores/quizStore.ts';
import { getFrameConfig } from './data/frameConfigs.ts';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ToastContainer } from './components/Toast.tsx';
import NotificationBell from './components/NotificationBell.tsx';
import UniversalSearch from './components/UniversalSearch.tsx';
import StudyHeartbeat from './components/StudyHeartbeat.tsx';

const getUniSlug = (id: UniversityId): string => {
  if (id === 'lpu') return 'lpu';
  if (id === 'iitm_bs') return 'iitm';
  return '';
};

const getModuleFromPath = (path: string): ModuleType => {
  const p = path.toLowerCase();
  const parts = p.split('/').filter(Boolean);
  if (parts.length === 0) return ModuleType.DASHBOARD;
  
  // Check if first segment is a uni slug
  const firstPart = parts[0];
  const isUniSlug = ['lpu', 'iitm', 'iitm_bs'].includes(firstPart);
  const normalizedPath = isUniSlug ? '/' + parts.slice(1).join('/') : p;

  if (normalizedPath === '/' || normalizedPath === '') return ModuleType.DASHBOARD;
  if (normalizedPath.includes('/share-cgpa')) return ModuleType.SHARE_CGPA;
  if (normalizedPath.includes('/attendance')) return ModuleType.TOOLS;
  if (normalizedPath.includes('/timetable')) return ModuleType.TIMETABLE;
  if (normalizedPath.includes('/quiz')) return ModuleType.QUIZ;
  if (normalizedPath.includes('/cgpa')) return ModuleType.TOOLS;
  if (normalizedPath.includes('/placement')) return ModuleType.TOOLS;
  if (normalizedPath.includes('/tools')) return ModuleType.TOOLS;
  if (normalizedPath.includes('/library')) return ModuleType.LIBRARY;
  if (normalizedPath.includes('/campus')) return ModuleType.CAMPUS;
  if (normalizedPath.includes('/freshers')) return ModuleType.FRESHERS;
  if (normalizedPath.includes('/help')) return ModuleType.HELP;
  if (normalizedPath.includes('/about')) return ModuleType.ABOUT;
  if (normalizedPath.includes('/profile')) return ModuleType.PROFILE;
  if (normalizedPath.includes('/marketplace')) return ModuleType.MARKETPLACE;
  if (normalizedPath.includes('/roommate')) return ModuleType.ROOMMATE;
  if (normalizedPath.includes('/emergency')) return ModuleType.EMERGENCY;
  if (normalizedPath.includes('/ai-tools')) return ModuleType.AI_TOOLS;
  if (normalizedPath.includes('/admin-stats')) return ModuleType.ADMIN_STATS;
  if (normalizedPath.includes('/privacy')) return ModuleType.PRIVACY;
  if (normalizedPath.includes('/login')) return ModuleType.LOGIN;
  if (normalizedPath.includes('/signup')) return ModuleType.SIGNUP;
  if (normalizedPath.includes('/settings')) return ModuleType.SETTINGS;
  return ModuleType.DASHBOARD;
};

const getPathFromModule = (module: ModuleType, uniKey: UniversityId = 'none'): string => {
  const uniSlug = getUniSlug(uniKey);
  const prefix = uniSlug ? `/${uniSlug}` : '';

  switch (module) {
    case ModuleType.ATTENDANCE: return `${prefix}/attendance`;
    case ModuleType.TIMETABLE: return `${prefix}/timetable`;
    case ModuleType.QUIZ: return `${prefix}/quiz`;
    case ModuleType.CGPA: return `${prefix}/cgpa`;
    case ModuleType.PLACEMENT: return `${prefix}/placement`;
    case ModuleType.LIBRARY: return `${prefix}/library`;
    case ModuleType.CAMPUS: return `${prefix}/campus`;
    case ModuleType.FRESHERS: return `${prefix}/freshers`;
    case ModuleType.HELP: return `${prefix}/help`;
    case ModuleType.ABOUT: return `${prefix}/about`;
    case ModuleType.PROFILE: return `${prefix}/profile`;
    case ModuleType.DASHBOARD: return uniSlug ? `/${uniSlug}` : '/';
    case ModuleType.SHARE_CGPA: return `/share-cgpa`;
    case ModuleType.MARKETPLACE: return `${prefix}/marketplace`;
    case ModuleType.ROOMMATE: return `${prefix}/roommate`;
    case ModuleType.EMERGENCY: return `${prefix}/emergency`;
    case ModuleType.AI_TOOLS: return `${prefix}/ai-tools`;
    case ModuleType.TOOLS: return `${prefix}/tools`;
    case ModuleType.ADMIN_STATS: return `${prefix}/admin-stats`;
    case ModuleType.PRIVACY: return `${prefix}/privacy`;
    case ModuleType.LOGIN: return `${prefix}/login`;
    case ModuleType.SIGNUP: return `${prefix}/signup`;
    case ModuleType.SETTINGS: return `${prefix}/settings`;
    default: return uniSlug ? `/${uniSlug}` : '/';
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
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary inline-block min-h-[1.2em] relative transition-all duration-300 ease-out">
      {words[index].substring(0, subIndex)}
      <span className="inline-block w-[4px] h-[0.9em] ml-1 bg-gradient-to-b from-brand-primary to-brand-secondary animate-cursor-blink align-middle translate-y-[-2px] shadow-[0_0_15px_var(--brand-glow)] rounded-full transition-all duration-200"></span>
    </span>
  );
});

const BackgroundEffects: React.FC = React.memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-white dark:bg-[#030303]">
      {/* Seamless Merger */}
      <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#030303] via-white/10 dark:via-zinc-900/40 to-transparent h-96 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#030303] via-white/10 dark:via-zinc-900/40 to-transparent w-96 z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-secondary/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
});

const FeatureGuard: React.FC<{ module: ModuleType, children: React.ReactNode }> = ({ module, children }) => {
  const { universityInfo } = useUniversity();
  
  // Essential modules that are always allowed
  const essentialModules = [
    ModuleType.DASHBOARD, 
    ModuleType.PROFILE, 
    ModuleType.ADMIN_STATS, 
    ModuleType.PRIVACY, 
    ModuleType.LOGIN, 
    ModuleType.SIGNUP
  ];

  if (essentialModules.includes(module)) return <>{children}</>;
  
  // If no university is selected (Scholix default), all modules are allowed
  if (!universityInfo) return <>{children}</>;

  // Check if module is explicitly enabled for this university
  if (!universityInfo.features.enabledModules.includes(module)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const TodaysSchedule: React.FC = () => {
  const { universityInfo } = useUniversity();
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (universityInfo && !universityInfo.features.enabledModules.includes(ModuleType.TIMETABLE)) {
    return null;
  }

  useEffect(() => {
    const savedMe = localStorage.getItem('nexus_timetable_me');
    if (savedMe) {
      try { setTimetable(JSON.parse(savedMe)); } catch (e) { }
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayData = timetable?.schedule?.find(s => s.day === today);

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  if (!dayData || dayData.slots.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1">
            <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Featured Timetable</h3>
            <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-white/5 ml-4" />
          </div>
          <button onClick={() => navigate('/timetable')} className="text-[10px] font-bold text-brand-primary border-none bg-transparent ml-4">SYNC</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {[1,2,3].map(i => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center space-y-2 opacity-30">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-300 dark:border-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5" />
              </div>
              <div className="w-12 h-2 bg-zinc-200 dark:bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 mb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center flex-1">
          <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Featured Timetable</h3>
          <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-white/5 ml-4" />
        </div>
        <button 
          onClick={() => navigate('/timetable')}
          className="text-[10px] font-bold text-brand-primary border-none bg-transparent hover:opacity-80 transition-opacity ml-4"
        >
          VIEW ALL
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex gap-5 overflow-x-auto pb-4 px-1 -mx-6 no-scrollbar snap-x snap-mandatory">
        <div className="flex-shrink-0 w-1 sm:hidden" /> {/* Spacer */}
        {dayData.slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)).map((slot) => {
          const start = timeToMinutes(slot.startTime);
          const end = timeToMinutes(slot.endTime);
          const isGoingOn = currentMinutes >= start && currentMinutes < end;
          const isUpcoming = currentMinutes < start;
          
          return (
            <button
              key={slot.id}
              onClick={() => navigate('/timetable')}
              className="flex-shrink-0 flex flex-col items-center space-y-3 group border-none bg-transparent active:scale-90 transition-transform"
            >
              <div className={`relative p-[3px] rounded-full transition-all duration-500 ${isGoingOn ? 'bg-gradient-to-tr from-brand-primary via-brand-secondary to-brand-primary animate-pulse' : 'bg-zinc-200 dark:bg-white/10 group-hover:bg-brand-primary/50'}`}>
                 <div className="absolute -inset-1 bg-brand-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white dark:bg-[#121212] p-[2px] relative z-10 overflow-hidden shadow-xl">
                    <div className={`w-full h-full rounded-full flex flex-col items-center justify-center text-center px-1 overflow-hidden ${isGoingOn ? 'bg-brand-gradient text-white' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'}`}>
                      <span className="text-[7px] sm:text-[9px] font-black uppercase leading-none opacity-60 mb-1">{slot.type}</span>
                      <span className="text-[10px] sm:text-xs font-bold leading-tight truncate w-full px-1">{slot.subject}</span>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col items-center text-center max-w-[70px] sm:max-w-[80px]">
                <span className={`text-[10px] sm:text-xs font-bold leading-none mb-0.5 truncate w-full ${isGoingOn ? 'text-brand-primary' : 'text-zinc-600 dark:text-zinc-400'}`}>
                  {slot.room}
                </span>
                <span className="text-[8px] sm:text-[9px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
                  {slot.startTime}
                </span>
              </div>
            </button>
          );
        })}
        <div className="flex-shrink-0 w-1 sm:hidden" /> {/* Spacer */}
      </div>
    </div>
  );
};

const PlacementRedirect: React.FC = () => {
  const { reportId } = useParams();
  return <Navigate to={`/tools?tab=placement&id=${reportId}`} replace />;
};

const DashboardHero: React.FC<{ userProfile: UserProfile | null }> = React.memo(({ userProfile }) => {
  const [greeting, setGreeting] = useState('');
  const { studentTerm, fullBrandName } = useUniversity();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const displayName = userProfile?.username || studentTerm;

  return (
    <div className="relative overflow-hidden bg-transparent pt-6 pb-6">
      <div className="max-w-6xl mx-auto px-6 text-left space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight ml-1">
          {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">{displayName}</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-base font-medium ml-1">
          Welcome to {fullBrandName}
        </p>
      </div>
    </div>
  );
});

const FeatureCard = React.memo(({ f, navigate }: { f: any, navigate: any }) => {
  const [transform, setTransform] = React.useState('');
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLButtonElement>(null);

  const { universityInfo } = useUniversity();

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation (-10 to 10 degrees max) for smoothness
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    // Lift card using translateY and scale
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)');
  };

  return (
    <button
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/${f.id}`)}
      style={{
        transform: transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.3s ease, border 0.3s ease' : 'transform 0.5s ease-out, box-shadow 0.5s ease, border 0.5s ease',
        transformStyle: 'preserve-3d'
      }}
      className={`group relative p-3 sm:p-6 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-[20px] sm:rounded-[32px] border border-zinc-200 dark:border-white/10 text-left cursor-pointer overflow-hidden transition-all duration-500 ${isHovered ? 'shadow-[0_45px_120px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_45px_120px_-20px_rgba(0,0,0,0.8)] border-brand-primary/40 z-10' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary transition-opacity duration-500 ${isHovered ? 'opacity-[0.03] dark:opacity-[0.07]' : 'opacity-0'}`} />

      {/* Wrapping content with translateZ for parallax effect inside the card */}
      <div style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0)', transition: 'transform 0.4s ease-out', pointerEvents: 'none' }} className="w-full h-full relative flex flex-col items-start justify-center">
        <div className={`relative w-8 h-8 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[16px] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white mb-2 sm:mb-6 shadow-2xl transition-all duration-500 ${isHovered ? 'shadow-brand-primary/50 scale-[1.15] rotate-3' : 'shadow-brand-primary/20'}`}>
          <div className={`absolute inset-0 rounded-[10px] sm:rounded-[16px] bg-inherit -z-10 transition-all duration-500 ${isHovered ? 'blur-2xl opacity-70' : 'blur-xl opacity-40'}`} />
          <div className="scale-65 sm:scale-90">
            {f.icon}
          </div>
        </div>

        <div className="relative space-y-0.5 sm:space-y-2 text-left w-full">
          <h4 className="text-[12px] sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-tight sm:leading-none">{f.name}</h4>
          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400/80 leading-relaxed max-w-[95%] sm:max-w-[90%] line-clamp-2">{f.desc}</p>
        </div>

        <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-zinc-300 dark:text-white/10 transition-all duration-500 ${isHovered ? 'text-brand-primary translate-x-1 -translate-y-1 scale-110' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3 sm:w-4 sm:h-4"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
        </div>
      </div>
    </button>
  );
});

const Dashboard: React.FC<{ userProfile: UserProfile | null }> = React.memo(({ userProfile }) => {
  const navigate = useNavigate();
  const { shortBrandName, universityInfo } = useUniversity();
  const [activeTab, setActiveTab] = useState('All');

  const allFeatures = [
    { id: ModuleType.LIBRARY, name: 'Content Library', desc: 'Access 1000+ PYQs, notes and records.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 8h10M8 12h10" /></svg>, path: '/library', category: 'Study' },
    { id: ModuleType.QUIZ, name: 'Quiz Taker', desc: 'Generate custom tests from your subjects.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>, path: '/quiz', category: 'Study' },
    { id: ModuleType.TIMETABLE, name: 'Timetable Hub', desc: 'Sync and manage your weekly schedule.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, path: '/timetable', category: 'Study' },
    { id: ModuleType.CGPA, name: 'CGPA Calc', desc: 'Calculate and forecast your performance.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>, path: '/tools?tab=cgpa', category: 'Tools' },
    { id: ModuleType.ATTENDANCE, name: 'Attendance', desc: 'Track your attendance and safe-bunks.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, path: '/tools?tab=attendance', category: 'Tools' },
    { id: ModuleType.PLACEMENT, name: 'Placement Prefect', desc: 'Analyze resumes and prep for jobs.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>, path: '/tools?tab=placement', category: 'Tools' },
    { id: ModuleType.CAMPUS, name: 'Campus Hub', desc: 'Find blocks and rooms with ease.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>, path: '/campus', category: 'Campus' },
    { id: ModuleType.FRESHERS, name: 'Freshmen Kit', desc: 'Essential guide for newcomers.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /></svg>, path: '/freshers', category: 'Campus' },

    { id: ModuleType.ROOMMATE, name: 'Roommate Finder', desc: `Find your perfect ${shortBrandName} flatmate.`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, path: '/roommate', category: 'Social' },
    { id: ModuleType.EMERGENCY, name: 'Rescue Line', desc: `Emergency ${shortBrandName} official contacts.`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, path: '/emergency', category: 'Campus' },
    { id: ModuleType.AI_TOOLS, name: 'AI Directory', desc: 'Curated AI tools for students.', icon: <svg viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6"><path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z" /></svg>, path: '/ai-tools', category: 'Tools' }
  ];

  const categories = ['All', 'Study', 'Placement', 'Events', 'Tools'];

  const filteredFeatures = allFeatures.filter(f => {
    const isEnabled = !universityInfo || universityInfo.features.enabledModules.includes(f.id);
    const matchesCategory = activeTab === 'All' || f.category === activeTab;
    return isEnabled && matchesCategory;
  });

  return (
    <div className="w-full h-full pb-32 pt-0 animate-fade-in relative z-0">
      <DashboardHero userProfile={userProfile} />
      <TodaysSchedule />
      
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Categories</h3>
          <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-white/5 ml-4" />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-6 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`
                flex-shrink-0 px-6 py-2.5 rounded-xl text-[12px] font-semibold tracking-tight transition-all duration-300 border 
                ${activeTab === cat 
                  ? 'bg-brand-primary text-white border-transparent shadow-[0_8px_20px_-4px_var(--brand-glow)] scale-105' 
                  : 'bg-white dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/5 hover:border-brand-primary/30 hover:text-brand-primary dark:hover:text-white'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-16">
          {filteredFeatures.map((f) => (
            <FeatureCard key={f.id} f={f} navigate={(path: string) => navigate(f.path || getPathFromModule(f.id))} />
          ))}
        </div>

        <BuyMeACoffee userProfile={userProfile} />
      </div>
    </div>
  );
});





const AppContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify_email'>('login');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isClosingProfile, setIsClosingProfile] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [isClosingMobileSearch, setIsClosingMobileSearch] = useState(false);
  const [authIsReady, setAuthIsReady] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const handleOpenMobileSearch = () => {
    setIsClosingMobileSearch(false);
    setIsMobileSearchActive(true);
  };

  const handleCloseMobileSearch = () => {
    setIsClosingMobileSearch(true);
    setTimeout(() => {
      setIsMobileSearchActive(false);
      setIsClosingMobileSearch(false);
    }, 250);
  };

  const handleProfileClose = () => {
    setIsClosingProfile(true);
    setTimeout(() => {
      setIsProfileMenuOpen(false);
      setIsClosingProfile(false);
    }, 250);
  };

  const openAuth = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    if (location.pathname === '/login' || location.pathname === '/signup') {
      const lastModulePath = localStorage.getItem('last_active_path') || '/';
      navigate(lastModulePath !== location.pathname ? lastModulePath : '/', { replace: true });
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { fullBrandName, studentTerm, shortBrandName, selectedUniversity, selectUniversity } = useUniversity();
  const currentModule = getModuleFromPath(location.pathname);

  useEffect(() => {
    NexusServer.trackPageView(location.pathname);
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem('last_active_path', location.pathname);
    }
  }, [location.pathname]);

  // Auth modal path sync
  useEffect(() => {
    const path = location.pathname;
    const isAuthPath = path.endsWith('/login') || path.endsWith('/signup');
    
    if (path.endsWith('/login')) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else if (path.endsWith('/signup')) {
      setAuthMode('signup');
      setShowAuthModal(true);
    } else if (userProfile && userProfile?.is_verified !== 'no' && !isAuthPath && path !== '/welcome') {
      setShowAuthModal(false);
    }
  }, [location.pathname, userProfile]);

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const uniMap: Record<string, UniversityId> = {
      'lpu': 'lpu',
      'iitm': 'iitm_bs',
      'iitm_bs': 'iitm_bs',
      'scholix': 'none'
    };

    const globalPages = ['welcome', 'privacy', 'about', 'help', 'share-cgpa'];
    const isGlobal = pathParts.length > 0 && globalPages.includes(pathParts[0]);

    if (pathParts.length > 0) {
      const firstPart = pathParts[0].toLowerCase();
      if (uniMap[firstPart]) {
        const targetUniId = uniMap[firstPart];
        if (selectedUniversity !== targetUniId) {
          selectUniversity(targetUniId);
        }
        return; 
      }
    }

    if (selectedUniversity !== 'none' && !isGlobal && location.pathname !== '/welcome') {
      const slug = getUniSlug(selectedUniversity);
      if (slug) {
        const currentPathParts = location.pathname.split('/').filter(Boolean);
        if (currentPathParts[0] !== slug) {
          navigate(`/${slug}${location.pathname === '/' ? '' : location.pathname}${location.search}`, { replace: true });
        }
      }
    } else if (selectedUniversity === 'none' && !isGlobal && !['/', '/welcome', '/login', '/signup'].includes(location.pathname)) {
      navigate('/welcome', { replace: true });
    }
  }, [selectedUniversity, location.pathname, navigate, selectUniversity]);

  useEffect(() => {
    if (userProfile && (location.pathname === '/login' || location.pathname === '/signup')) {
      const lastPath = localStorage.getItem('last_active_path') || '/';
      const target = lastPath !== location.pathname ? lastPath : '/';
      navigate(target, { replace: true });
    }
    
    // Mandatory verification check
    if (userProfile && (userProfile.is_verified === 'no' || !userProfile.is_verified) && !showAuthModal && location.pathname !== '/welcome') {
      setAuthMode('verify_email');
      setShowAuthModal(true);
    }
  }, [userProfile, location.pathname, navigate, showAuthModal]);

  useEffect(() => {
    NexusServer.recordVisit();
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Initial check to see if we have a session
    NexusServer.getSession().then(({ data: { session } }) => {
      if (!session) setAuthIsReady(true);
    });

    const unsubscribe = NexusServer.onAuthStateChange(async (user) => {
      if (user) {
        const profile = await NexusServer.getProfile(user.id);
        setUserProfile(prev => {
          if (JSON.stringify(prev) === JSON.stringify(profile)) return prev;
          return profile;
        });
      } else {
        setUserProfile(null);
      }
      setAuthIsReady(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  const navigateToModule = React.useCallback((module: ModuleType) => {
    const path = getPathFromModule(module, selectedUniversity);
    navigate(path);
  }, [navigate, selectedUniversity]);

  const isWelcomePage = location.pathname === '/welcome';

  if (isWelcomePage) {
    return (
      <>
        <AnnouncementBand />
        <ScholixLanding userProfile={userProfile} />
        <ToastContainer />
        <Analytics />
        <SpeedInsights />
      </>
    );
  }


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200">
      <AnnouncementBand />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentModule={currentModule}
          setModule={navigateToModule}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          userProfile={userProfile}
        />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-[#0a0a0a]">
          <BackgroundEffects />

        <header className="sticky top-0 h-16 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 flex items-center px-4 md:px-8 z-[100] transition-all duration-300">
          <div className="flex items-center gap-1 md:gap-4 flex-1 md:flex-none">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-zinc-700 dark:text-zinc-400 mr-1 border-none active:scale-75 transition-all bg-zinc-100/50 dark:bg-white/5 group"
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 transition-transform group-hover:scale-110">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="15" y2="6" /><line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex-1 md:hidden flex justify-center">
              <img 
                src={theme === 'dark' ? '/Scholix_dark.png' : '/Scholix_light.png'} 
                alt="Scholix" 
                className="h-7 sm:h-8 md:h-9 object-contain cursor-pointer active:scale-95 transition-transform"
                onClick={() => navigate('/')}
              />
            </div>
          </div>

          <div className="flex-1 hidden md:flex ml-0 justify-start">
            <div className="w-full max-w-[480px]">
              <UniversalSearch />
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button 
              onClick={handleOpenMobileSearch}
              className="md:hidden p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-all border-none active:scale-90"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
            <NotificationBell userProfile={userProfile} />
            <div className="hidden md:flex">
                <button onClick={toggleTheme} className="p-2.5 rounded-full bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-90">
                  {theme === 'dark' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                  )}
                </button>
            </div>

            {/* Desktop Profile Menu - Hidden on mobile as settings are in Bottom Navbar */}
            <div className="hidden md:block relative ml-2">
              {!authIsReady ? (
                <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-white/5 animate-pulse" />
              ) : userProfile ? (
                <>
                  <button 
                    onClick={() => isProfileMenuOpen ? handleProfileClose() : setIsProfileMenuOpen(true)} 
                    className={`w-11 h-11 transition-all relative group text-left border-none cursor-pointer flex items-center justify-center rounded-full ${!userProfile.avatar_frame ? 'bg-gradient-to-tr from-brand-primary to-brand-secondary p-[1.5px] shadow-[0_8px_20px_var(--brand-glow)] hover:scale-105 active:scale-95' : ''}`}
                  >
                    {(() => {
                      const frameConfig = getFrameConfig(userProfile.avatar_frame);
                      return (
                        <div className="relative w-10 h-10 flex items-center justify-center">
                          {userProfile.avatar_frame && (
                            <img
                              src={`/Nexus-Journey/${userProfile.avatar_frame}`}
                              alt="Avatar Frame"
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                              style={{ transform: `scale(${frameConfig.navbarScale}) translateY(${frameConfig.translateY || '0%'})` }}
                            />
                          )}
                          <div 
                            className={`w-full h-full rounded-full overflow-hidden bg-nexus-darker flex items-center justify-center`}
                            style={{ padding: frameConfig.padding }}
                          >
                            {userProfile.avatar_url ? (
                              <img
                                src={userProfile.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-zinc-900 dark:text-brand-primary font-bold text-xs">
                                {userProfile.username?.[0] || userProfile.email[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </button>
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={handleProfileClose} />
                      <div className={`absolute right-0 mt-3 w-56 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden py-3 z-50 animate-fade-in backdrop-blur-xl transition-all duration-300 ${isClosingProfile ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/5 mb-2 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[11px] sm:text-xs shrink-0 border border-brand-primary/5 overflow-hidden">
                            {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" /> : (userProfile.username?.[0]?.toUpperCase() || studentTerm[0])}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-zinc-800 dark:text-white tracking-wider text-[11px] sm:text-xs truncate">{userProfile.username || studentTerm}</p>
                              <VerifiedBadge isAdmin={userProfile.is_admin} size="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[11px] sm:text-xs font-bold text-zinc-400 tracking-widest truncate">{userProfile.email}</p>
                          </div>
                        </div>
                        {userProfile.is_admin && (
                          <button
                            onClick={() => { navigate('/admin-stats'); handleProfileClose(); }}
                            className="w-full text-left px-5 py-2.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/5 border-none bg-transparent flex items-center gap-3 transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 2v20M2 12h20" /></svg>
                            </div>
                            Admin Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => { navigate('/settings'); handleProfileClose(); }}
                          className="w-full text-left px-5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-white/80 hover:text-brand-primary dark:hover:text-white hover:bg-brand-primary/5 dark:hover:bg-white/5 border-none bg-transparent flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                          </div>
                          Settings
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button onClick={openAuth} className="w-10 h-10 rounded-full border-none bg-zinc-100 dark:bg-[#0a0a0a] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-95">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </button>
              )}
            </div>
          </div>
        </header>
        <div id="main-content-area" className={`flex-1 overflow-y-auto relative scroll-smooth ${location.pathname === '/' || location.pathname === '/lpu' || location.pathname === '/iitm' ? 'p-0' : 'p-4 md:p-8'} bg-transparent no-scrollbar`}>
          <div className={`relative ${location.pathname === '/' || location.pathname === '/lpu' || location.pathname === '/iitm' ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            <Routes>
              <Route path="/welcome" element={<ScholixLanding userProfile={userProfile} />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<AboutUs userProfile={userProfile} />} />
              <Route path="/help" element={<HelpSection />} />
              <Route path="/:uniKey/*" element={<FeatureRoutes userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={navigateToModule} theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/*" element={<FeatureRoutes userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={navigateToModule} theme={theme} toggleTheme={toggleTheme} />} />
            </Routes>
          </div>
        </div>
        {/* Premium Mobile Search Bottom Sheet */}
        {isMobileSearchActive && (
          <div className="md:hidden fixed inset-0 z-[200] flex items-end justify-center pointer-events-auto">
            {/* Backdrop */}
            <div 
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${isClosingMobileSearch ? 'animate-overlay-out' : 'animate-overlay-in'}`}
              onClick={handleCloseMobileSearch} 
            />
            
            {/* Bottom Sheet Container */}
            <div className={`relative w-full bg-white dark:bg-[#0a0a0a] rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.6)] p-6 overflow-hidden border-t border-zinc-200 dark:border-white/10 flex flex-col h-[85vh] ${isClosingMobileSearch ? 'animate-sheet-out' : 'animate-sheet-in'}`}>
              {/* Handle bar */}
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full mx-auto mb-6 shrink-0" onClick={handleCloseMobileSearch} />
              
              <div className="flex items-start gap-3 mb-4 shrink-0">
                <button 
                  onClick={handleCloseMobileSearch}
                  className="mt-1 p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-brand-primary transition-all border-none active:scale-90"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div className="flex-1 min-w-0">
                  <UniversalSearch 
                    autoFocus={true} 
                    placeholder="Search Nexus..." 
                    resultsPortalRef={searchResultsRef}
                  />
                </div>
              </div>

              {/* Scrollable Results Area */}
              <div 
                ref={searchResultsRef}
                className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2 pb-10"
              />
            </div>
          </div>
        )}
      </main>
    </div>
    <BottomNavbar currentModule={currentModule} />
    {showAuthModal && <AuthModal onClose={handleAuthClose} initialMode={authMode} userProfile={userProfile || undefined} />}
      <CookieBanner />
      {userProfile && <StudyHeartbeat userId={userProfile.id} />}
      <Analytics />
      <SpeedInsights />
      <ToastContainer />
    </div>
  );
};

const FeatureRoutes: React.FC<{ 
  userProfile: UserProfile | null, 
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  navigateToModule: (module: ModuleType) => void,
  theme: string, 
  toggleTheme: () => void 
}> = ({ userProfile, setUserProfile, navigateToModule, theme, toggleTheme }) => {
  const { selectedUniversity } = useUniversity();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Dashboard userProfile={userProfile} />} />
      <Route path="/library" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      <Route path="/library/:program" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      <Route path="/library/:program/:semester" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      <Route path="/library/:program/:semester/:subject" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      <Route path="/library/:program/:semester/:subject/:category" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      
      <Route path="/campus" element={<FeatureGuard module={ModuleType.CAMPUS}><CampusNavigator userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/campus/:tab" element={<FeatureGuard module={ModuleType.CAMPUS}><CampusNavigator userProfile={userProfile} /></FeatureGuard>} />
      
      <Route path="/about" element={<FeatureGuard module={ModuleType.ABOUT}><AboutUs userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/help" element={<FeatureGuard module={ModuleType.HELP}><HelpSection /></FeatureGuard>} />
      <Route path="/freshers" element={<FeatureGuard module={ModuleType.FRESHERS}><FreshersKit /></FeatureGuard>} />
      <Route path="/tools" element={<ToolsHub userProfile={userProfile} />} />
      <Route path="/share-cgpa" element={<ShareReport />} />
      <Route path="/placement" element={<FeatureGuard module={ModuleType.PLACEMENT}><Navigate to="/tools?tab=placement" replace /></FeatureGuard>} />
      <Route path="/placement/:reportId" element={<PlacementRedirect />} />
      <Route path="/attendance" element={<FeatureGuard module={ModuleType.ATTENDANCE}><Navigate to="/tools?tab=attendance" replace /></FeatureGuard>} />
      <Route path="/cgpa" element={<FeatureGuard module={ModuleType.CGPA}><Navigate to="/tools?tab=cgpa" replace /></FeatureGuard>} />
      
      <Route path="/profile" element={<FeatureGuard module={ModuleType.PROFILE}><ProfileSection userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={navigateToModule} /></FeatureGuard>} />
      <Route path="/timetable" element={<FeatureGuard module={ModuleType.TIMETABLE}><TimetableHub userProfile={userProfile} /></FeatureGuard>} />
      
      <Route path="/quiz" element={<FeatureGuard module={ModuleType.QUIZ}><QuizTaker userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      <Route path="/quiz/:subjectName" element={<FeatureGuard module={ModuleType.QUIZ}><QuizTaker userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      <Route path="/quiz/:subjectName/:quizId" element={<FeatureGuard module={ModuleType.QUIZ}><QuizTaker userProfile={userProfile} onAuthRequired={() => navigate('/login')} /></FeatureGuard>} />
      
      <Route path="/marketplace" element={<FeatureGuard module={ModuleType.MARKETPLACE}><MarketplaceHub userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/marketplace/:category" element={<FeatureGuard module={ModuleType.MARKETPLACE}><MarketplaceHub userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/marketplace/item/:itemId" element={<FeatureGuard module={ModuleType.MARKETPLACE}><MarketplaceHub userProfile={userProfile} /></FeatureGuard>} />
      
      <Route path="/roommate" element={<FeatureGuard module={ModuleType.ROOMMATE}><RoommateFinder userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/emergency" element={<FeatureGuard module={ModuleType.EMERGENCY}><EmergencyContacts /></FeatureGuard>} />
      <Route path="/ai-tools" element={<FeatureGuard module={ModuleType.AI_TOOLS}><AIToolsDirectory /></FeatureGuard>} />
      <Route path="/admin-stats" element={<AdminStats userProfile={userProfile} />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/settings" element={<SettingsHub userProfile={userProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} />} />
      <Route path="/login" element={<Dashboard userProfile={userProfile} />} />
      <Route path="/signup" element={<Dashboard userProfile={userProfile} />} />
      <Route path="*" element={<Dashboard userProfile={userProfile} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <UniversityProvider>
      <Router>
        <AppContent />
      </Router>
    </UniversityProvider>
  );
};

export default App;
