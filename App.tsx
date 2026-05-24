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
import VerifiedBadge from './components/VerifiedBadge.tsx';
import ProfileSection from './components/ProfileSection.tsx';
import TimetableHub from './components/TimetableHub.tsx';
import QuizTaker from './components/QuizTaker.tsx';
import MarketplaceHub from './components/MarketplaceHub.tsx';
import RoommateFinder from './components/RoommateFinder.tsx';
import EmergencyContacts from './components/EmergencyContacts.tsx';
import AdminStats from './components/AdminStats.tsx';
import BuyMeACoffee from './components/BuyMeACoffee.tsx';
import PaymentSuccess from './components/PaymentSuccess.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import CookieBanner from './components/CookieBanner.tsx';
import ScholixLanding from './components/ScholixLanding.tsx';
import AnnouncementBand from './components/AnnouncementBand.tsx';
import AnnouncementModal from './components/AnnouncementModal.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Rocket, 
  Briefcase, 
  X,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  Utensils,
  PlayCircle,
  Sun,
  Moon,
  PenTool,
  Map,
  Calculator,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import BottomNavbar from './components/BottomNavbar.tsx';
import NexusAd from './components/NexusAd.tsx';
import { UniversityProvider, useUniversity, UniversityId, UNIVERSITIES } from './hooks/useUniversity.tsx';


import SEOHelmet from './components/SEOHelmet.tsx';
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
import { useOnlineStatus } from './hooks/useOnlineStatus.ts';
import OfflineOverlay from './components/OfflineOverlay.tsx';

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
  if (normalizedPath.includes('/market')) return ModuleType.MARKETPLACE;
  if (normalizedPath.includes('/roommate')) return ModuleType.ROOMMATE;
  if (normalizedPath.includes('/emergency')) return ModuleType.EMERGENCY;

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
    case ModuleType.HELP: return `${prefix}/settings/help`;
    case ModuleType.ABOUT: return `${prefix}/settings/about`;
    case ModuleType.PROFILE: return `${prefix}/settings/profile`;
    case ModuleType.DASHBOARD: return uniSlug ? `/${uniSlug}` : '/';
    case ModuleType.SHARE_CGPA: return `/share-cgpa`;
    case ModuleType.MARKETPLACE: return `${prefix}/campus/market`;
    case ModuleType.ROOMMATE: return `${prefix}/campus/roommate`;
    case ModuleType.EMERGENCY: return `${prefix}/emergency`;

    case ModuleType.TOOLS: return `${prefix}/tools`;
    case ModuleType.ADMIN_STATS: return `${prefix}/admin-stats`;
    case ModuleType.PRIVACY: return `${prefix}/settings/privacy`;
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
    if (!time) return 0;
    const parts = time.split(' ');
    if (parts.length < 1) return 0;
    const [timeStr, modifier] = parts;
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return (hours * 60) + (minutes || 0);
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const sortedSlots = dayData?.slots ? [...dayData.slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)) : [];
  const activeSlot = sortedSlots.find(slot => {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  return (
    <div className="w-full lg:h-full animate-fade-in">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-zinc-100/80 dark:border-white/5 p-5 lg:p-6 shadow-sm transition-all duration-500 overflow-hidden lg:h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Calendar size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                Today's <span className="text-brand-primary">Schedule</span>
              </h4>
              <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase opacity-70 mt-0.5">{today}</p>
            </div>
          </div>
          
          {activeSlot && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              <span className="text-[9px] font-black text-brand-primary uppercase tracking-tighter">Live</span>
            </div>
          )}
        </div>

        {!dayData || sortedSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-2 md:space-y-4 py-6 md:py-12 bg-zinc-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-zinc-100 dark:border-white/10">
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-dashed border-zinc-100 dark:border-white/10 flex items-center justify-center">
              <Calendar className="text-zinc-300 dark:text-zinc-700 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400">No classes scheduled for today</p>
          </div>
        ) : (
          <>
            {/* Desktop View: Timeline Design */}
            <div className="hidden md:block relative flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="relative pl-8">
                {/* Timeline Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-dashed border-l border-dashed border-zinc-200 dark:border-white/10" />
                
                <div className="space-y-5">
                  {sortedSlots.map((slot) => {
                    const start = timeToMinutes(slot.startTime);
                    const end = timeToMinutes(slot.endTime);
                    const isGoingOn = currentMinutes >= start && currentMinutes < end;
                    const isDone = currentMinutes >= end;

                    return (
                      <div key={slot.id} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-white dark:bg-[#0a0a0a] transition-all duration-500 z-10 flex items-center justify-center
                          ${isGoingOn ? 'border-brand-primary scale-125 shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.4)]' : isDone ? 'border-zinc-300 dark:border-white/20' : 'border-zinc-200 dark:border-white/10'}
                        `}>
                          {isGoingOn && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />}
                        </div>

                        <button
                          onClick={() => navigate('/timetable')}
                          className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 text-left
                            ${isGoingOn 
                              ? 'bg-brand-primary/[0.03] border-brand-primary/20 shadow-lg shadow-brand-primary/5 ring-1 ring-brand-primary/5' 
                              : 'bg-white dark:bg-white/[0.02] border-zinc-100 dark:border-white/[0.03] hover:border-zinc-200 dark:hover:border-white/10 hover:shadow-md'
                            }
                          `}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-tighter shrink-0 transition-all duration-500
                            ${isGoingOn ? 'bg-brand-primary text-white scale-105' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'}
                          `}>
                            {slot.type?.substring(0, 3)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className={`text-[13px] font-bold truncate transition-colors ${isGoingOn ? 'text-brand-primary' : 'text-zinc-900 dark:text-white'}`}>
                              {slot.subject}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                                {slot.startTime.split(' ')[0]} - {slot.endTime.split(' ')[0]}
                              </span>
                              {slot.room && slot.room !== 'N/A' && (
                                <span className="text-[9px] font-black text-brand-primary/80 px-1.5 py-0.5 bg-brand-primary/5 rounded-md">
                                  {slot.room}
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight size={14} className={`text-zinc-300 dark:text-zinc-700 transition-transform ${isGoingOn ? 'translate-x-0.5 text-brand-primary' : 'group-hover:translate-x-0.5'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile View: Circular Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 pt-2 -mx-2 px-2 snap-x scrollbar-hide no-scrollbar">
                {sortedSlots.map((slot) => {
                  const start = timeToMinutes(slot.startTime);
                  const end = timeToMinutes(slot.endTime);
                  const isGoingOn = currentMinutes >= start && currentMinutes < end;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => navigate('/timetable')}
                      className="flex flex-col items-center gap-3 snap-center shrink-0 w-[100px]"
                    >
                      <div className={`relative w-[80px] h-[80px] rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500
                        ${isGoingOn 
                          ? 'border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/20 scale-105' 
                          : 'border-zinc-100 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02]'
                        }
                      `}>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isGoingOn ? 'text-brand-primary' : 'text-zinc-500'}`}>
                          {slot.type}
                        </span>
                        <span className={`text-[13px] font-black tracking-tight text-center px-2 line-clamp-1 ${isGoingOn ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {slot.subject.split(' ')[0]}
                        </span>
                        
                        {isGoingOn && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary rounded-full border-2 border-white dark:border-[#0a0a0a] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className={`text-[9px] font-bold whitespace-nowrap ${isGoingOn ? 'text-brand-primary' : 'text-zinc-500'}`}>
                          {slot.startTime.split(' ')[0]} - {slot.endTime.split(' ')[0]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PlacementRedirect: React.FC = () => {
  const { reportId } = useParams();
  return <Navigate to={`/tools?tab=placement&id=${reportId}`} replace />;
};

const DashboardHeader: React.FC<{ userProfile: UserProfile | null }> = React.memo(({ userProfile }) => {
  const [greeting, setGreeting] = useState('');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const displayName = userProfile?.username || 'Verto';

  return (
    <div className="w-full pt-6 md:pt-10 pb-6 md:pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Main Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Greeting + Actions */}
            <div className="flex items-center justify-between w-full lg:w-auto gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {greeting}, <span className="text-brand-primary">{displayName}</span> <span className="text-2xl md:text-3xl animate-bounce-subtle shrink-0">👋</span>
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-bold opacity-70 mt-1">
                  Let's make today productive!
                </p>
              </div>

              {/* Actions: Mobile only */}
              <div className="flex lg:hidden items-center gap-2 shrink-0">
                <NotificationBell userProfile={userProfile} />
                <button 
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#0a0a0a] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-all border border-transparent dark:border-white/5 active:scale-90 shadow-sm"
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-xl mx-12">
              <UniversalSearch />
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <NotificationBell userProfile={userProfile} />
              <button 
                onClick={toggleTheme}
                className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-[#0a0a0a] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-all border border-transparent dark:border-white/5 active:scale-90 shadow-sm"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
              </button>
            </div>

            {/* Mobile Search: Added more horizontal padding */}
            <div className="lg:hidden w-full px-6 sm:px-8">
              <UniversalSearch />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});


const FeatureCard = React.memo(({ f, navigate }: { f: any, navigate: any }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate()}
      className={`group relative p-4 bg-white dark:bg-[#0a0a0b] rounded-[24px] border border-zinc-100 dark:border-white/[0.04] text-left cursor-pointer transition-all duration-300 overflow-hidden ${
        isHovered 
          ? 'shadow-2xl shadow-zinc-200/40 dark:shadow-2xl dark:shadow-black/80 border-zinc-200/50 dark:border-white/10 -translate-y-1' 
          : 'shadow-sm'
      }`}
    >
      {/* Background Gradient - Simplified to remove 'rectangles' */}
      <div 
        className={`absolute inset-0 opacity-[0.7] dark:opacity-[0.85] group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${f.gradient || 'from-brand-primary/10 to-transparent'}`} 
      />

      {/* Top Left Whitish Glow - Radial for maximum smoothness */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 dark:bg-white/[0.03] blur-[40px] rounded-full pointer-events-none z-0" />
      
      {/* Action Arrow Button */}
      <div className={`absolute top-4 right-4 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 z-20 ${isHovered ? 'bg-white dark:bg-zinc-200 text-zinc-900 scale-110 shadow-lg shadow-black/20' : 'bg-white/5 text-white/30'}`}>
        <ArrowRight size={12} strokeWidth={3} className={`transition-transform duration-500 ${isHovered ? 'translate-x-0.5' : ''}`} />
      </div>

      {/* Large Outline Background Icon */}
      <div className={`absolute -bottom-2 -right-2 ${f.iconColor} opacity-[0.05] dark:opacity-[0.08] transform transition-all duration-700 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-[0.1]`}>
        {React.cloneElement(f.icon as React.ReactElement, { size: 72, strokeWidth: 1 })}
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        {/* Icon Container */}
        <div className={`relative w-11 h-11 rounded-2xl ${f.lightColor || 'bg-brand-primary/15'} flex items-center justify-center shrink-0 transition-all duration-500 ${isHovered ? 'scale-110' : ''} border border-white/20 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden backdrop-blur-md`}>
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <div className={`${f.iconColor || 'text-brand-primary'} transition-transform duration-500 z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]`}>
            {React.cloneElement(f.icon as React.ReactElement, { size: 22, strokeWidth: 2.2 })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-0.5">
          <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white transition-colors duration-300 leading-tight tracking-tight">
            {f.name}
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight font-medium opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            {f.desc}
          </p>
        </div>
      </div>
    </button>
  );
});

const StaticRedirect: React.FC<{ to: string }> = ({ to }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return (
    <div className="flex items-center justify-center h-full bg-white dark:bg-[#0a0a0a]">
      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

const Dashboard: React.FC<{ userProfile: UserProfile | null }> = React.memo(({ userProfile }) => {
  const navigate = useNavigate();
  const { selectedUniversity } = useUniversity();
    const allFeatures = [
      { id: ModuleType.ATTENDANCE, name: 'Attendance Tracker', desc: 'Track your daily attendance.', icon: <CheckCircle2 />, category: 'Tools', lightColor: 'bg-emerald-500/20', iconColor: 'text-emerald-500', gradient: 'from-emerald-500/20 to-transparent' },
      { id: ModuleType.CAMPUS, name: 'Campus Map', desc: 'Find buildings and facilities.', icon: <Map />, category: 'Campus', lightColor: 'bg-blue-500/20', iconColor: 'text-blue-500', gradient: 'from-blue-500/20 to-transparent', customPath: '/campus/map' },
      { id: ModuleType.CGPA, name: 'CGPA Calculator', desc: 'Plan your grades and GPA.', icon: <Calculator />, category: 'Tools', lightColor: 'bg-purple-500/20', iconColor: 'text-purple-500', gradient: 'from-purple-500/20 to-transparent' },
      { id: ModuleType.PLACEMENT, name: 'Resume Checker', desc: 'AI feedback on your resume.', icon: <Briefcase />, category: 'Tools', lightColor: 'bg-rose-500/20', iconColor: 'text-rose-500', gradient: 'from-rose-500/20 to-transparent' },
      { id: 'mess', name: 'Mess Menu', desc: "Today's meal planning.", icon: <Utensils />, category: 'Campus', lightColor: 'bg-orange-500/20', iconColor: 'text-orange-500', gradient: 'from-orange-500/20 to-transparent', customPath: '/campus/mess' },
      { id: ModuleType.LIBRARY, name: 'Content Library', desc: 'Study materials and resources.', icon: <Rocket />, category: 'Study', lightColor: 'bg-indigo-500/20', iconColor: 'text-indigo-500', gradient: 'from-indigo-500/20 to-transparent' },
      { id: ModuleType.QUIZ, name: 'Quiz Taker', desc: 'Practice with AI generated quizzes.', icon: <PenTool />, category: 'Study', lightColor: 'bg-cyan-500/20', iconColor: 'text-cyan-500', gradient: 'from-cyan-500/20 to-transparent' },

      { id: ModuleType.ROOMMATE, name: 'Roommate Finder', desc: 'Find your perfect roomie.', icon: <User />, category: 'Social', lightColor: 'bg-amber-500/20', iconColor: 'text-amber-500', gradient: 'from-amber-500/20 to-transparent' },
      { id: ModuleType.MARKETPLACE, name: 'Marketplace', desc: 'Buy and sell student gear.', icon: <ShoppingBag />, category: 'Social', lightColor: 'bg-violet-500/20', iconColor: 'text-violet-500', gradient: 'from-violet-500/20 to-transparent' },
    ];

  return (
    <div className="w-full min-h-screen pb-32 animate-fade-in relative z-0 bg-[#fbfcfd] dark:bg-[#030303]">
      <DashboardHeader userProfile={userProfile} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">
          
          {/* Left Side: Tools */}
          <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Your <span className="text-brand-primary">Tools</span></h3>
                <p className="text-[10px] md:text-xs text-zinc-500 font-medium">Quickly access essential features</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {allFeatures.map((f) => (
                <FeatureCard key={f.id} f={f} navigate={() => navigate(f.customPath || getPathFromModule(f.id as any, selectedUniversity))} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2 relative lg:min-h-0">
            <div className="lg:absolute lg:inset-0 lg:h-full overflow-y-auto no-scrollbar">
              <TodaysSchedule />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12 md:gap-16 mt-12 md:mt-16">

          {/* Bottom Banner */}
          <div className="w-full">
            <div className="p-4 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl border border-brand-primary/10 relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-brand-primary tracking-tight uppercase">Pro tip</h4>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Sync your timetable once and it will automatically show up here every morning. No manual entry needed.
                  </p>
                </div>
                <button onClick={() => navigate('/timetable')} className="w-fit px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-[10px] font-bold flex items-center gap-2 transition-all shadow-sm">
                  Sync now <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Buy Me A Coffee Section */}
          <div className="w-full">
            <BuyMeACoffee />
          </div>
        </div>
      </div>
    </div>
  );
});






// --- Premium Auth Components ---

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: 'bg-zinc-200 dark:bg-white/10' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Excellent', color: 'bg-emerald-400' };
};

const AuthInput: React.FC<{
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  autoComplete?: string;
  status?: 'idle' | 'checking' | 'available' | 'taken';
}> = ({ icon, label, placeholder, type = 'text', value, onChange, error, autoComplete, status }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-widest ml-1">{label}</label>
        {status && status !== 'idle' && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            {status === 'checking' && (
              <>
                <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span className="text-zinc-400 dark:text-zinc-500">Checking...</span>
              </>
            )}
            {status === 'available' && (
              <>
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span className="text-emerald-500">Available</span>
              </>
            )}
            {status === 'taken' && (
              <>
                <X size={13} className="text-red-500" />
                <span className="text-red-500">Taken</span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-accent transition-colors">
          {icon}
        </div>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full bg-zinc-100 dark:bg-zinc-900/50 border ${
            error || status === 'taken' ? 'border-red-500/50 focus:border-red-500/50' : 
            status === 'available' ? 'border-emerald-500/50 focus:border-emerald-500/50' : 
            'border-black/5 dark:border-white/10'
          } rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const StepCard: React.FC<{ step: number; title: string; active: boolean }> = ({ step, title, active }) => (
  <motion.div
    whileHover={{ x: 4 }}
    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
      active 
        ? 'bg-accent/10 border-accent/20 shadow-[0_0_20px_rgba(255,122,24,0.1)]' 
        : 'bg-black/20 border-white/5 opacity-50'
    }`}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
      active ? 'bg-accent text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
    }`}>
      {step}
    </div>
    <span className={`text-sm font-bold tracking-tight ${active ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
      {title}
    </span>
    {active && (
      <div className="ml-auto">
        <CheckCircle2 size={16} className="text-accent" />
      </div>
    )}
  </motion.div>
);

const PremiumAuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup' | 'verify_email';
  userProfile?: UserProfile;
}> = ({ isOpen, onClose, initialMode, userProfile }) => {
  const { selectedUniversity } = useUniversity();
  const [mode, setMode] = useState<'login' | 'signup' | 'verify_email' | 'forgot_password'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'otp' | 'reset' | 'verified'>('form');
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const [identifier, setIdentifier] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [regNoStatus, setRegNoStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    regNo: '',
    password: ''
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setStep('form');
      setOtpValue('');
      setFormData({
        username: userProfile?.username || '',
        email: userProfile?.email || '',
        regNo: userProfile?.registration_number || '',
        password: ''
      });
      setIdentifier('');
      setEmailError(false);
      setUsernameStatus('idle');
      setRegNoStatus('idle');
    }
  }, [isOpen, initialMode, userProfile]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'verify_email') return;
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, loading, mode, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    firstFocusable?.focus();
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen, mode, step]);

  // Debounced username check
  useEffect(() => {
    if (mode === 'signup' && formData.username.length >= 3) {
      const timer = setTimeout(async () => {
        setUsernameStatus('checking');
        try {
          const avail = await NexusServer.checkUsernameAvailability(formData.username);
          setUsernameStatus(avail ? 'available' : 'taken');
        } catch (e) {
          setUsernameStatus('idle');
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus('idle');
    }
  }, [formData.username, mode]);

  // Debounced regNo check
  useEffect(() => {
    const cleanReg = formData.regNo.replace(/[^0-9]/g, '');
    if (mode === 'signup' && cleanReg.length === 8) {
      const timer = setTimeout(async () => {
        setRegNoStatus('checking');
        try {
          const avail = await NexusServer.checkRegistrationAvailability(cleanReg);
          setRegNoStatus(avail ? 'available' : 'taken');
        } catch (e) {
          setRegNoStatus('idle');
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setRegNoStatus('idle');
    }
  }, [formData.regNo, mode]);

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length <= 15) {
      setFormData(prev => ({ ...prev, username: clean }));
    }
  };

  const handleRegNoChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length <= 8) {
      setFormData(prev => ({ ...prev, regNo: clean }));
    }
  };

  const handleToggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
    setStep('form');
  };

  const handleResendOTP = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const emailToUse = formData.email;
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailToUse.toLowerCase().trim(), 
          username: formData.username || userProfile?.username || '', 
          type: mode === 'forgot_password' ? 'password_reset' 
                : mode === 'verify_email' ? (emailToUse.toLowerCase().trim() !== userProfile?.email.toLowerCase().trim() ? 'email_update' : 'verification')
                : 'signup',
          university: selectedUniversity 
        })
      });

      let data: any = {};
      const text = await response.text();
      if (text) {
        try { data = JSON.parse(text); } catch (e) { console.error("JSON parse error:", e); }
      }

      if (!response.ok) throw new Error(data.error || "Failed to resend code.");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setEmailError(false);

    try {
      if (mode === 'login') {
        if (!identifier.trim()) throw new Error("Email or Username required.");
        if (!formData.password.trim()) throw new Error("Password required.");

        if (identifier.includes('@') && !validateEmail(identifier.trim())) {
          setEmailError(true);
          throw new Error("Please enter a valid email address.");
        }
        
        const result = await NexusServer.signIn(identifier.trim(), formData.password);
        if (result.error) throw result.error;
        onClose();
      } else if (mode === 'signup') {
        if (step === 'form') {
          if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
            setEmailError(true);
            throw new Error("Valid email required.");
          }
          if (formData.regNo.replace(/[^0-9]/g, '').length !== 8) throw new Error("Registration number must be 8 digits.");
          if (formData.username.length < 3) throw new Error("Username too short.");
          if (usernameStatus === 'taken') throw new Error("This username is already claimed.");
          if (regNoStatus === 'taken') throw new Error("This registration number is already linked to another account.");
          if (formData.password.length < 6) throw new Error("Password must be at least 6 characters.");

          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: formData.email.toLowerCase().trim(), 
              username: formData.username, 
              type: 'signup', 
              university: selectedUniversity 
            })
          });

          let data: any = {};
          const text = await response.text();
          if (text) {
            try { data = JSON.parse(text); } catch (e) { console.error("JSON parse error:", e); }
          }

          if (!response.ok) throw new Error(data.error || "Failed to send code.");
          setStep('otp');
          setResendTimer(60);
        } else {
          if (otpValue.length !== 6) throw new Error("6-digit code required.");
          
          const verifyRes = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: formData.email.toLowerCase().trim(), 
              otp: otpValue, 
              type: 'signup',
              username: formData.username,
              registration_number: formData.regNo,
              university: selectedUniversity
            })
          });

          let verifyData: any = {};
          const verifyText = await verifyRes.text();
          if (verifyText) {
            try { verifyData = JSON.parse(verifyText); } catch (e) { console.error("JSON parse error:", e); }
          }

          if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed.");

          localStorage.setItem('just_signed_up', Date.now().toString());
          const result = await NexusServer.signUp(formData.email, formData.password, formData.username, formData.regNo, selectedUniversity);
          if (result.error) {
            localStorage.removeItem('just_signed_up');
            throw result.error;
          }
          onClose();
        }
      } else if (mode === 'forgot_password') {
        if (step === 'form') {
          if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
            setEmailError(true);
            throw new Error("Valid email required.");
          }
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email.toLowerCase().trim(), type: 'password_reset', university: selectedUniversity })
          });
          
          let data: any = {};
          const text = await response.text();
          if (text) {
            try { data = JSON.parse(text); } catch (e) { console.error("JSON parse error:", e); }
          }

          if (!response.ok) throw new Error(data.error || "Failed to send code.");
          setStep('otp');
          setResendTimer(60);
        } else if (step === 'otp') {
          if (otpValue.length !== 6) throw new Error("6-digit code required.");
          if (formData.password.length < 6) throw new Error("New password must be at least 6 characters.");
          
          const resetRes = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: formData.email.toLowerCase().trim(), 
              otp: otpValue, 
              newPassword: formData.password 
            })
          });

          let resetData: any = {};
          const resetText = await resetRes.text();
          if (resetText) {
            try { resetData = JSON.parse(resetText); } catch (e) { console.error("JSON parse error:", e); }
          }

          if (!resetRes.ok) throw new Error(resetData.error || "Reset failed. Please try again.");
          
          setFormData(prev => ({ ...prev, password: '' }));
          setOtpValue('');
          setMode('login');
          setStep('form');
          setError(null);
        }
      } else if (mode === 'verify_email' && userProfile) {
        if (step === 'form') {
          if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
            setEmailError(true);
            throw new Error("Please enter a valid email address.");
          }

          const isEmailChanged = formData.email.toLowerCase().trim() !== userProfile.email.toLowerCase().trim();
          
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: formData.email.toLowerCase().trim(), 
              username: userProfile.username, 
              type: isEmailChanged ? 'email_update' : 'verification',
              university: selectedUniversity
            })
          });

          let data: any = {};
          const text = await response.text();
          if (text) {
            try { data = JSON.parse(text); } catch (e) { console.error("JSON parse error:", e); }
          }

          if (!response.ok) throw new Error(data.error || "Failed to send verification code.");
          setStep('otp');
          setResendTimer(60);
        } else if (step === 'otp') {
          if (otpValue.length !== 6) throw new Error("6-digit verification code is required.");

          const isEmailChanged = formData.email.toLowerCase().trim() !== userProfile.email.toLowerCase().trim();

          const verifyResponse = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: formData.email.toLowerCase().trim(), 
              otp: otpValue, 
              type: isEmailChanged ? 'email_update' : 'verification',
              oldEmail: isEmailChanged ? userProfile.email : undefined,
              userId: userProfile.id
            })
          });

          let verifyData: any = {};
          const verifyText = await verifyResponse.text();
          if (verifyText) {
            try { verifyData = JSON.parse(verifyText); } catch (e) { console.error("JSON parse error:", e); }
          }

          if (!verifyResponse.ok) throw new Error(verifyData.error || "Verification failed. Check the code.");

          setStep('verified');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || 
    (mode === 'signup' && (usernameStatus === 'taken' || usernameStatus === 'checking' || regNoStatus === 'taken' || regNoStatus === 'checking'));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={mode === 'verify_email' ? undefined : onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" 
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ 
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="relative w-full max-w-[1100px] h-full sm:h-auto max-h-[100%] sm:max-h-[720px] bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/10 rounded-2xl sm:rounded-[32px] overflow-hidden flex flex-col sm:flex-row shadow-3xl text-zinc-900 dark:text-white"
          >
            {mode !== 'verify_email' && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            )}

            {/* LEFT SECTION - Brand Experience */}
            <div className="hidden lg:flex w-[45%] relative flex-col p-12 overflow-hidden border-r border-black/5 dark:border-white/5 bg-zinc-950">
              {/* Video Background */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-105"
              >
                <source src="/authvideo.mp4" type="video/mp4" />
              </video>
              
              {/* Glass Overlays */}
              <div className="absolute inset-0 bg-zinc-950/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/20" />
              
              {/* Brand Logo */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="Scholix Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-none tracking-tight">Scholix</h2>
                  <span className="text-[10px] font-bold text-accent tracking-[0.1em] opacity-80">Student Utility Hub</span>
                </div>
              </div>

              {/* Hero Content */}
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h1 className="text-4xl font-bold text-white leading-[1.1] tracking-tight">
                    Welcome to the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2">Future of Learning</span>
                  </h1>
                  <p className="text-sm text-zinc-300 font-medium leading-relaxed max-w-[85%]">
                    Your gateway to academic excellence and placement readiness starts here.
                  </p>
                </motion.div>
              </div>

              {/* Footer Info */}
              <div className="relative z-10 mt-auto">
                <div className="flex items-center gap-4 text-white/40">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-medium">Joined by 10k+ students</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 sm:p-12 lg:p-16 relative overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950">
              <motion.div
                key={mode + '_' + step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[400px] mx-auto space-y-6 sm:space-y-8 my-auto relative z-10"
              >
                {step === 'verified' ? (
                  <div className="text-center space-y-6 py-8">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-emerald-500 animate-bounce" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Email Verified!</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                      Your identity has been successfully synchronized. Preparing your dashboard...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Get Started' : mode === 'forgot_password' ? 'Reset Password' : 'Verify Email'}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold">
                        {mode === 'login' ? 'Glad to see you again!' 
                          : mode === 'signup' ? (step === 'otp' ? 'Enter verification code' : 'Create your student account') 
                          : mode === 'forgot_password' ? (step === 'otp' ? 'Verify identity & reset' : 'Account Recovery') 
                          : (step === 'otp' ? 'Enter the verification code' : 'Confirm or update your email address')}
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[11px] font-bold"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {step === 'form' ? (
                        <>
                          {mode === 'signup' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-4"
                            >
                              <AuthInput 
                                label="Username" 
                                icon={<User size={18} />} 
                                placeholder="alex_smith" 
                                value={formData.username}
                                onChange={handleUsernameChange}
                                status={usernameStatus}
                                autoComplete="username"
                              />
                              <AuthInput 
                                label="Reg No" 
                                icon={<CheckCircle2 size={18} />} 
                                placeholder="1220...." 
                                value={formData.regNo}
                                onChange={handleRegNoChange}
                                status={regNoStatus}
                                autoComplete="off"
                              />
                            </motion.div>
                          )}

                          {mode === 'login' ? (
                            <AuthInput 
                              label="Email or Username" 
                              icon={<Mail size={18} />} 
                              placeholder="name@university.edu or username" 
                              value={identifier}
                              onChange={setIdentifier}
                              autoComplete="username"
                            />
                          ) : (
                            <AuthInput 
                              label="Email Address" 
                              icon={<Mail size={18} />} 
                              placeholder="name@university.edu" 
                              value={formData.email}
                              onChange={(val) => {
                                setFormData({...formData, email: val});
                                setEmailError(val.trim() !== '' && !validateEmail(val.trim()));
                              }}
                              error={emailError}
                              autoComplete="email"
                            />
                          )}
                          
                          {mode !== 'forgot_password' && mode !== 'verify_email' && (
                            <div className="space-y-1">
                              <AuthInput 
                                label="Password"
                                type="password" 
                                icon={<Lock size={18} />} 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={(val) => setFormData({...formData, password: val})}
                                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                              />
                              
                              {mode === 'signup' && formData.password && (
                                <div className="space-y-1.5 pt-1 px-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password Strength</span>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                      getPasswordStrength(formData.password).score <= 2 ? 'text-red-500' :
                                      getPasswordStrength(formData.password).score <= 3 ? 'text-yellow-500' : 'text-emerald-500'
                                    }`}>
                                      {getPasswordStrength(formData.password).label}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                          level <= getPasswordStrength(formData.password).score
                                            ? getPasswordStrength(formData.password).color
                                            : 'bg-zinc-200 dark:bg-zinc-800'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {mode === 'login' && (
                                <div className="flex justify-end pt-1">
                                  <button 
                                    type="button"
                                    onClick={() => { setMode('forgot_password'); setStep('form'); setError(null); }}
                                    className="text-[10px] font-bold text-accent hover:text-accent-2 tracking-wider transition-colors uppercase border-none bg-transparent outline-none cursor-pointer"
                                  >
                                    Forgot Password?
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : step === 'otp' ? (
                        <div className="space-y-4">
                          <AuthInput 
                            label="Verification Code" 
                            icon={<Rocket size={18} />} 
                            placeholder="6-digit code" 
                            value={otpValue}
                            onChange={(val) => setOtpValue(val.replace(/[^0-9]/g, '').slice(0, 6))}
                            autoComplete="one-time-code"
                          />
                          
                          {mode === 'forgot_password' && (
                            <div className="space-y-1">
                              <AuthInput 
                                label="New Password"
                                type="password" 
                                icon={<Lock size={18} />} 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={(val) => setFormData({...formData, password: val})}
                                autoComplete="new-password"
                              />
                              {formData.password && (
                                <div className="space-y-1.5 pt-1 px-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password Strength</span>
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                                      getPasswordStrength(formData.password).score <= 2 ? 'text-red-500' :
                                      getPasswordStrength(formData.password).score <= 3 ? 'text-yellow-500' : 'text-emerald-500'
                                    }`}>
                                      {getPasswordStrength(formData.password).label}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-5 gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                      <div
                                        key={level}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                          level <= getPasswordStrength(formData.password).score
                                            ? getPasswordStrength(formData.password).color
                                            : 'bg-zinc-200 dark:bg-zinc-800'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center px-1 pt-2">
                            <button 
                              type="button"
                              onClick={handleResendOTP}
                              disabled={resendTimer > 0 || loading}
                              className="text-[10px] font-bold text-accent uppercase tracking-widest disabled:opacity-50 hover:text-accent-2 transition-colors border-none bg-transparent outline-none cursor-pointer"
                            >
                              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => { setStep('form'); setError(null); }}
                              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-colors border-none bg-transparent outline-none cursor-pointer"
                            >
                              Edit Details
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-6 pt-2">
                      <motion.button
                        whileHover={!isSubmitDisabled ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
                        onClick={() => handleSubmit()}
                        disabled={isSubmitDisabled}
                        className="w-full bg-gradient-to-r from-accent to-accent-2 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,122,24,0.15)] hover:shadow-[0_20px_40px_rgba(255,122,24,0.3)] transition-all group disabled:opacity-70 disabled:cursor-not-allowed border-none outline-none text-center cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span className="tracking-wider text-sm">
                              {mode === 'login' ? 'Sign In' 
                                : mode === 'signup' ? (step === 'otp' ? 'Verify & Join' : 'Create Account') 
                                : mode === 'forgot_password' ? (step === 'otp' ? 'Update Password' : 'Send Recovery Code')
                                : (step === 'otp' ? 'Verify Code' : 'Send Verification Code')}
                            </span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </motion.button>

                      {mode !== 'verify_email' && (
                        <p className="text-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                          {mode === 'login' ? "Don't have an account?" : "Already a member?"} {' '}
                          <button 
                            type="button"
                            onClick={handleToggleMode}
                            className="text-accent hover:text-accent-2 transition-colors underline underline-offset-4 border-none bg-transparent outline-none cursor-pointer"
                          >
                            {mode === 'login' ? 'Join Scholix' : 'Sign In'}
                          </button>
                        </p>
                      )}

                      {mode === 'verify_email' && userProfile && step === 'form' && (
                        <p className="text-center">
                          <button 
                            type="button"
                            onClick={async () => {
                              await NexusServer.signOut();
                              onClose();
                              window.location.reload();
                            }}
                            className="text-zinc-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors border-none bg-transparent outline-none cursor-pointer"
                          >
                            Sign Out
                          </button>
                        </p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

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
  const lastHandledUserRef = useRef<string | null>(null);
  const isOnline = useOnlineStatus();

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
    // Prevent closing if identity verification is mandatory
    const isUnverified = userProfile && (userProfile.is_verified === 'no' || !userProfile.is_verified);
    if (authMode === 'verify_email' && isUnverified && location.pathname !== '/welcome') {
      return;
    }

    setShowAuthModal(false);
    
    if (location.pathname === '/login' || location.pathname === '/signup') {
      const lastModulePath = localStorage.getItem('last_active_path') || '/';
      navigate(lastModulePath !== location.pathname ? lastModulePath : '/', { replace: true });
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { fullBrandName, studentTerm, shortBrandName, selectedUniversity, selectUniversity, universityInfo } = useUniversity();
  const currentModule = getModuleFromPath(location.pathname);

  useEffect(() => {
    NexusServer.trackPageView(location.pathname);
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem('last_active_path', location.pathname);
    }
  }, [location.pathname]);

  // Auth modal path sync
  useEffect(() => {
    // If not ready, we skip the automated check to avoid flickers,
    // but if we are on an auth path explicitly, we should probably allow it 
    // after a short delay if auth is STILL not ready.
    if (!authIsReady) return;

    const path = location.pathname;
    
    // Check if path ends with /login or /signup (handling both /login and /lpu/login)
    const isLogin = path === '/login' || path.endsWith('/login');
    const isSignup = path === '/signup' || path.endsWith('/signup');

    if (userProfile && (isLogin || isSignup)) {
      // If already logged in, close modal and redirect to dashboard
      setShowAuthModal(false);
      navigate(getPathFromModule(ModuleType.DASHBOARD), { replace: true });
    }
  }, [location.pathname, userProfile, authIsReady, navigate]);

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const uniMap: Record<string, UniversityId> = {
      'lpu': 'lpu',
      'iitm': 'iitm_bs',
      'iitm_bs': 'iitm_bs',
      'scholix': 'none'
    };

    const globalPages = ['welcome', 'privacy', 'about', 'help', 'share-cgpa', 'payment-success'];
    const isGlobal = pathParts.length > 0 && globalPages.includes(pathParts[0]);

    if (pathParts.length > 0) {
      const firstPart = pathParts[0].toLowerCase();
      if (uniMap[firstPart]) {
        const targetUniId = uniMap[firstPart];
        const targetUni = UNIVERSITIES.find(u => u.id === targetUniId);
        
        if (targetUni?.adminOnly) {
          if (!authIsReady) return; // Wait for session load before matching this route
          if (!userProfile || !userProfile.is_admin) {
            if (selectedUniversity !== 'none') selectUniversity('none');
            navigate('/welcome', { replace: true });
            return;
          }
        }

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
    } else if (selectedUniversity === 'none' && !isGlobal && !['/welcome', '/login', '/signup'].includes(location.pathname)) {
      navigate('/welcome', { replace: true });
    }
  }, [selectedUniversity, location.pathname, navigate, selectUniversity, authIsReady, userProfile]);

  useEffect(() => {
    const path = location.pathname;
    const isAuthPath = path.endsWith('/login') || path.endsWith('/signup');

    if (userProfile && isAuthPath) {
      const lastPath = localStorage.getItem('last_active_path') || '/';
      const target = !lastPath.endsWith('/login') && !lastPath.endsWith('/signup') ? lastPath : '/';
      navigate(target, { replace: true });
    }
    
    // Mandatory verification check
    if (!authIsReady) return;

    const justSignedUp = localStorage.getItem('just_signed_up');
    let isWithinGracePeriod = false;
    if (justSignedUp) {
      const signupTime = parseInt(justSignedUp);
      if (Date.now() - signupTime < 30000) { // 30 second grace period
        isWithinGracePeriod = true;
      } else {
        localStorage.removeItem('just_signed_up');
      }
    }

    const isUnverified = userProfile && (userProfile.is_verified === 'no' || !userProfile.is_verified);

    if (isUnverified && !showAuthModal && location.pathname !== '/welcome' && !isWithinGracePeriod) {
      setAuthMode('verify_email');
      setShowAuthModal(true);
    }
  }, [userProfile, location.pathname, navigate, showAuthModal, authIsReady]);


  // Combined Session & Auth State Handling
  useEffect(() => {
    NexusServer.recordVisit();
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Subscribe to auth changes
    if (!NexusServer.isConfigured()) {
      console.warn("NexusServer is not configured. Setting auth as ready (unauthenticated mode).");
      setAuthIsReady(true);
      return;
    }

    const unsubscribe = NexusServer.onAuthStateChange(async (user) => {
      if (user) {
        // Skip redundant profile sync if we already handled this user ID
        if (lastHandledUserRef.current === user.id && userProfile) {
          setAuthIsReady(true);
          return;
        }
        
        lastHandledUserRef.current = user.id;
        try {
          const profile = await NexusServer.ensureProfile(user);
          setUserProfile(profile);
        } catch (e) {
          console.error("Profile sync failure:", e);
          // If profile sync fails, we still allow the app to be 'ready' with user=null 
          lastHandledUserRef.current = null;
        }
      } else {
        lastHandledUserRef.current = null;
        setUserProfile(null);
      }
      setAuthIsReady(true);
    });

    // Fallback timer: if auth takes more than 5 seconds, mark as ready to prevent infinite loading
    const timeout = setTimeout(() => {
      setAuthIsReady(true);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
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
        <AnnouncementModal />
        <Analytics />
        <SpeedInsights />
      </>
    );
  }


  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200 fixed inset-0">
      <SEOHelmet currentModule={currentModule} />
      <AnnouncementBand />
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        <Sidebar
          currentModule={currentModule}
          setModule={navigateToModule}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          userProfile={userProfile}
          onOpenAuth={openAuth}
        />
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-white dark:bg-[#0a0a0a] md:pl-[72px]">
          <BackgroundEffects />

        {false && (
          <header className="sticky top-0 h-16 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-white/5 flex items-center px-4 md:px-8 z-[100] transition-all duration-300">
            <div className="flex items-center gap-1 md:gap-4 flex-1 md:flex-none">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-zinc-700 dark:text-zinc-400 mr-1 border-none active:scale-75 transition-all bg-zinc-100/50 dark:bg-white/5 group"
                aria-label="Toggle menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 transition-transform group-hover:scale-110">
                  <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="15" y2="6" /><line x1="3" y1="18" x2="18"/>
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

              {/* Desktop Profile Menu */}
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
                            onClick={() => { navigate(getPathFromModule(ModuleType.SETTINGS)); handleProfileClose(); }}
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
        )}
        <div id="main-content-area" className={`flex-1 ${['/settings', '/profile', '/privacy-policy', '/about-scholix', '/terms', '/contact', '/help'].some(p => location.pathname.includes(p)) ? 'overflow-hidden' : 'overflow-y-auto'} relative scroll-smooth ${['/', '/lpu', '/iitm'].includes(location.pathname) || ['/settings', '/profile', '/privacy-policy', '/about-scholix', '/terms', '/contact', '/help'].some(p => location.pathname.includes(p)) ? 'mobile-safe-pt-0 px-0 pb-0 md:p-0' : 'mobile-safe-pt-4 px-4 pb-4 md:p-8'} bg-transparent no-scrollbar`}>
          <div className={`relative ${['/settings', '/profile', '/privacy-policy', '/about-scholix', '/terms', '/contact', '/help'].some(p => location.pathname.includes(p)) ? 'h-full' : ''} ${['/', '/lpu', '/iitm'].includes(location.pathname) || ['/settings', '/profile', '/privacy-policy', '/about-scholix', '/terms', '/contact', '/help'].some(p => location.pathname.includes(p)) ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            <Routes>
              <Route path="/welcome" element={<ScholixLanding userProfile={userProfile} />} />
              <Route path="/payment-success" element={<PaymentSuccess userProfile={userProfile} />} />
              <Route path="/privacy-policy" element={<StaticRedirect to="/privacy-policy.html" />} />
              <Route path="/terms" element={<StaticRedirect to="/terms.html" />} />
              <Route path="/about-scholix" element={<StaticRedirect to="/about-scholix.html" />} />
              <Route path="/contact" element={<StaticRedirect to="/contact.html" />} />
              {/* Internal routes (for app users) */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<AboutUs userProfile={userProfile} />} />
              <Route path="/:uniKey/*" element={<FeatureRoutes userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={navigateToModule} theme={theme} toggleTheme={toggleTheme} onOpenSignup={openSignup} onOpenAuth={openAuth} authModalOpen={showAuthModal} />} />
              <Route path="/*" element={<FeatureRoutes userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={navigateToModule} theme={theme} toggleTheme={toggleTheme} onOpenSignup={openSignup} onOpenAuth={openAuth} authModalOpen={showAuthModal} />} />
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
                    placeholder="Search Scholix..." 
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
    <PremiumAuthModal 
      isOpen={showAuthModal} 
      onClose={handleAuthClose} 
      initialMode={authMode === 'verify_email' ? 'verify_email' : authMode} 
      userProfile={userProfile || undefined} 
    />
      <CookieBanner />
      {userProfile && <StudyHeartbeat userId={userProfile.id} />}
      <Analytics />
      <SpeedInsights />
      <ToastContainer />
      <AnnouncementModal />
      <OfflineOverlay isOffline={!isOnline} />
    </div>
  );
};

const FeatureRoutes: React.FC<{ 
  userProfile: UserProfile | null, 
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  navigateToModule: (module: ModuleType) => void,
  theme: string, 
  toggleTheme: () => void,
  onOpenSignup: () => void,
  onOpenAuth: () => void,
  authModalOpen: boolean
}> = ({ userProfile, setUserProfile, navigateToModule, theme, toggleTheme, onOpenSignup, onOpenAuth, authModalOpen }) => {
  const { selectedUniversity } = useUniversity();
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Dashboard userProfile={userProfile} />} />
      <Route path="/library" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      <Route path="/library/:program" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      <Route path="/library/:program/:semester" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      <Route path="/library/:program/:semester/:subject" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      <Route path="/library/:program/:semester/:subject/:category" element={<FeatureGuard module={ModuleType.LIBRARY}><ContentLibrary userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      
      <Route path="/campus" element={<FeatureGuard module={ModuleType.CAMPUS}><CampusNavigator userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/campus/:tab" element={<FeatureGuard module={ModuleType.CAMPUS}><CampusNavigator userProfile={userProfile} /></FeatureGuard>} />
      
      <Route path="/freshers" element={<FeatureGuard module={ModuleType.FRESHERS}><FreshersKit /></FeatureGuard>} />
      <Route path="/tools" element={<ToolsHub userProfile={userProfile} />} />
      <Route path="/share-cgpa" element={<ShareReport />} />
      <Route path="/placement" element={<FeatureGuard module={ModuleType.PLACEMENT}><Navigate to="/tools?tab=placement" replace /></FeatureGuard>} />
      <Route path="/placement/:reportId" element={<PlacementRedirect />} />
      <Route path="/attendance" element={<FeatureGuard module={ModuleType.ATTENDANCE}><Navigate to="/tools?tab=attendance" replace /></FeatureGuard>} />
      <Route path="/cgpa" element={<FeatureGuard module={ModuleType.CGPA}><Navigate to="/tools?tab=cgpa" replace /></FeatureGuard>} />
      

      <Route path="/timetable" element={<FeatureGuard module={ModuleType.TIMETABLE}><TimetableHub userProfile={userProfile} /></FeatureGuard>} />
      
      <Route path="/quiz" element={<FeatureGuard module={ModuleType.QUIZ}><QuizTaker userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      <Route path="/quiz/:subjectName" element={<FeatureGuard module={ModuleType.QUIZ}><QuizTaker userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      <Route path="/quiz/:subjectName/:quizId" element={<FeatureGuard module={ModuleType.QUIZ}><QuizTaker userProfile={userProfile} onAuthRequired={onOpenAuth} /></FeatureGuard>} />
      
      <Route path="/market" element={<Navigate to="/campus/market" replace />} />
      <Route path="/market/:category" element={<Navigate to="/campus/market" replace />} />
      <Route path="/market/item/:itemId" element={<Navigate to="/campus/market" replace />} />

      
      <Route path="/roommate" element={<FeatureGuard module={ModuleType.ROOMMATE}><RoommateFinder userProfile={userProfile} /></FeatureGuard>} />
      <Route path="/emergency" element={<FeatureGuard module={ModuleType.EMERGENCY}><EmergencyContacts /></FeatureGuard>} />

      <Route path="/admin-stats" element={<AdminStats userProfile={userProfile} />} />
      <Route path="/payment-success" element={<PaymentSuccess userProfile={userProfile} />} />
      <Route path="/settings" element={<SettingsHub userProfile={userProfile} setUserProfile={setUserProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} onOpenSignup={onOpenSignup} authModalOpen={authModalOpen} />} />
      <Route path="/settings/profile" element={<SettingsHub userProfile={userProfile} setUserProfile={setUserProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} initialTab="profile" onOpenSignup={onOpenSignup} authModalOpen={authModalOpen} />} />
      <Route path="/settings/privacy" element={<SettingsHub userProfile={userProfile} setUserProfile={setUserProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} initialTab="privacy" onOpenSignup={onOpenSignup} authModalOpen={authModalOpen} />} />
      <Route path="/settings/about" element={<SettingsHub userProfile={userProfile} setUserProfile={setUserProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} initialTab="about" onOpenSignup={onOpenSignup} authModalOpen={authModalOpen} />} />
      <Route path="/settings/help" element={<SettingsHub userProfile={userProfile} setUserProfile={setUserProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} initialTab="help_center" onOpenSignup={onOpenSignup} authModalOpen={authModalOpen} />} />
      <Route path="/settings/theme" element={<SettingsHub userProfile={userProfile} setUserProfile={setUserProfile} onSignOut={async () => { await NexusServer.signOut(); navigate('/'); }} theme={theme} toggleTheme={toggleTheme} navigateToModule={navigateToModule} initialTab="theme" onOpenSignup={onOpenSignup} authModalOpen={authModalOpen} />} />
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
