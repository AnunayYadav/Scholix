import React, { useState, useEffect, useRef } from 'react';
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
import BuyMeACoffee from './components/BuyMeACoffee.tsx';
import PaymentSuccess from './components/PaymentSuccess.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import CookieBanner from './components/CookieBanner.tsx';

import { ModuleType, UserProfile, TimetableData } from './types.ts';

import NexusServer from './services/nexusServer.ts';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ToastContainer } from './components/Toast.tsx';
import NotificationBell from './components/NotificationBell.tsx';
import UniversalSearch from './components/UniversalSearch.tsx';

const getModuleFromPath = (path: string): ModuleType => {
  const p = path.toLowerCase();
  if (p === '/') return ModuleType.DASHBOARD;
  if (p.includes('/share-cgpa')) return ModuleType.SHARE_CGPA;
  if (p.includes('/attendance')) return ModuleType.ATTENDANCE;
  if (p.includes('/timetable')) return ModuleType.TIMETABLE;
  if (p.includes('/quiz')) return ModuleType.QUIZ;
  if (p.includes('/cgpa')) return ModuleType.CGPA;
  if (p.includes('/placement')) return ModuleType.PLACEMENT;
  if (p.includes('/library')) return ModuleType.LIBRARY;
  if (p.includes('/campus')) return ModuleType.CAMPUS;
  if (p.includes('/freshers')) return ModuleType.FRESHERS;
  if (p.includes('/help')) return ModuleType.HELP;
  if (p.includes('/about')) return ModuleType.ABOUT;
  if (p.includes('/profile')) return ModuleType.PROFILE;
  if (p.includes('/marketplace')) return ModuleType.MARKETPLACE;
  if (p.includes('/roommate')) return ModuleType.ROOMMATE;
  if (p.includes('/emergency')) return ModuleType.EMERGENCY;
  if (p.includes('/ai-tools')) return ModuleType.AI_TOOLS;
  if (p.includes('/admin-stats')) return ModuleType.ADMIN_STATS;
  if (p.includes('/privacy')) return ModuleType.PRIVACY;
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
    case ModuleType.PRIVACY: return '/privacy';
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Seamless Merger */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 dark:from-[#0a0a0a] via-slate-50/10 dark:via-black/10 to-transparent h-96 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-[#0a0a0a] via-slate-50/10 dark:via-black/10 to-transparent w-96 z-10 pointer-events-none" />
    </div>
  );
});

const TodaysSchedule: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  // Auto-scroll to current or next class
  useEffect(() => {
    if (dayData && dayData.slots.length > 0 && scrollContainerRef.current) {
      const sortedSlots = [...dayData.slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      // First class that hasn't ended yet
      const targetIndex = sortedSlots.findIndex(slot => currentMinutes < timeToMinutes(slot.endTime));

      if (targetIndex !== -1) {
        setTimeout(() => {
          const container = scrollContainerRef.current;
          if (container && container.children[targetIndex]) {
            container.children[targetIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        }, 500); // Give it a moment to render
      }
    }
  }, [dayData]);

  if (!dayData || dayData.slots.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 mb-4 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/timetable')}
            className="flex items-center gap-2 group/header border-none bg-transparent p-0 transition-opacity hover:opacity-80"
          >
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Today's Schedule</h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-slate-400 group-hover/header:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
        <button
          onClick={() => navigate('/timetable')}
          className="w-full p-10 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-4 bg-white/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all group/empty border-none active:scale-[0.99]"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/empty:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No schedule synced</p>
            <p className="text-xs text-slate-400/60 group-hover/empty:text-orange-500 transition-colors">Click here to add or sync your batch preset</p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => navigate('/timetable')}
          className="flex items-center gap-2 group/header border-none bg-transparent p-0 transition-opacity hover:opacity-80"
        >
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Today's Schedule</h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-slate-400 group-hover/header:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
        <div className="flex flex-col items-end">
          <span className="text-[11px] sm:text-xs font-medium text-orange-500">{today}</span>
          {timetable?.ownerName && (
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
              {timetable.ownerName}
            </span>
          )}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex gap-3 md:gap-6 overflow-x-auto pt-4 pb-12 px-5 -mx-6 no-scrollbar snap-x snap-mandatory">
        {dayData.slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)).map((slot) => {
          const start = timeToMinutes(slot.startTime);
          const end = timeToMinutes(slot.endTime);
          const isGoingOn = currentMinutes >= start && currentMinutes < end;
          const isUpcoming = currentMinutes < start;
          const isPassed = currentMinutes >= end;

          return (
            <button
              key={slot.id}
              onClick={() => navigate('/timetable')}
              className={`flex-shrink-0 w-[175px] md:w-[260px] snap-center group relative overflow-hidden rounded-[24px] md:rounded-[32px] border bg-transparent p-0 text-left transition-all duration-500 active:scale-95 cursor-pointer ${isGoingOn ? 'border-transparent scale-[1.03] shadow-2xl z-10' : 'border-white/10 shadow-lg hover:scale-[1.02] opacity-80 hover:opacity-100'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 transition-transform duration-700 ${isGoingOn ? 'scale-110' : 'group-hover:scale-110'}`} />
              <div className="relative p-4 md:p-6 space-y-3 md:space-y-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base md:text-2xl font-bold text-white tracking-tight leading-tight drop-shadow-md truncate">{slot.subject}</h4>
                    <p className="text-[9px] md:text-xs font-semibold text-white/70 mt-0.5 truncate uppercase tracking-wider">{slot.room} • {slot.type}</p>
                  </div>

                  <div className={`shrink-0 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[10px] font-bold tracking-tight backdrop-blur-md flex items-center gap-1 shadow-sm ${isGoingOn ? 'bg-white text-orange-600' : 'bg-black/20 text-white'}`}>
                    {isGoingOn && (
                      <span className="flex h-1 w-1 md:h-1.5 md:w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1 md:h-1.5 md:w-1.5 bg-current"></span>
                      </span>
                    )}
                    <span>{isGoingOn ? 'Live' : isUpcoming ? 'Upcoming' : 'Done'}</span>
                  </div>
                </div>

                <div className="pt-3 md:pt-6 border-t border-white/20 flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[9px] md:text-[10px] text-white/50 font-medium uppercase tracking-tighter">Schedule</p>
                    <p className="text-[10px] md:text-sm font-bold text-white whitespace-nowrap tabular-nums">{slot.startTime} – {slot.endTime}</p>
                  </div>
                  {isGoingOn && (
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" className="w-3.5 h-3.5 md:w-5 md:h-5"><path d="M12 2v20M2 12h20" /></svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DashboardHero: React.FC<{ userProfile: UserProfile | null }> = React.memo(({ userProfile }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const displayName = userProfile?.username || 'Verto';

  return (
    <div className="relative overflow-hidden bg-transparent pt-6 pb-6">
      <div className="max-w-6xl mx-auto px-6 text-left space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight ml-1">
          {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{displayName}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base font-medium ml-1">
          Welcome to LPU Nexus
        </p>
      </div>
    </div>
  );
});

const FeatureCard = React.memo(({ f, navigate }: { f: any, navigate: any }) => {
  const [transform, setTransform] = React.useState('');
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLButtonElement>(null);

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
      className={`group relative p-3 sm:p-6 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-[20px] sm:rounded-[32px] border border-slate-200 dark:border-white/10 text-left cursor-pointer overflow-hidden transition-all duration-500 ${isHovered ? 'shadow-[0_45px_120px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_45px_120px_-20px_rgba(0,0,0,0.8)] border-orange-500/40 z-10' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 transition-opacity duration-500 ${isHovered ? 'opacity-[0.03] dark:opacity-[0.07]' : 'opacity-0'}`} />

      {/* Wrapping content with translateZ for parallax effect inside the card */}
      <div style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0)', transition: 'transform 0.4s ease-out', pointerEvents: 'none' }} className="w-full h-full relative flex flex-col items-start justify-center">
        <div className={`relative w-8 h-8 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-[16px] bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white mb-2 sm:mb-6 shadow-2xl transition-all duration-500 ${isHovered ? 'shadow-orange-500/50 scale-[1.15] rotate-3' : 'shadow-orange-500/20'}`}>
          <div className={`absolute inset-0 rounded-[10px] sm:rounded-[16px] bg-inherit -z-10 transition-all duration-500 ${isHovered ? 'blur-2xl opacity-70' : 'blur-xl opacity-40'}`} />
          <div className="scale-65 sm:scale-90">
            {f.icon}
          </div>
        </div>

        <div className="relative space-y-0.5 sm:space-y-2 text-left w-full">
          <h4 className="text-[12px] sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none">{f.name}</h4>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400/80 leading-relaxed max-w-[95%] sm:max-w-[90%] line-clamp-2">{f.desc}</p>
        </div>

        <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-slate-300 dark:text-white/10 transition-all duration-500 ${isHovered ? 'text-orange-500 translate-x-1 -translate-y-1 scale-110' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3 h-3 sm:w-4 sm:h-4"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
        </div>
      </div>
    </button>
  );
});

const Dashboard: React.FC<{ userProfile: UserProfile | null }> = React.memo(({ userProfile }) => {
  const navigate = useNavigate();

  const features = [
    { id: 'library', name: 'Content Library', desc: 'Access 1000+ PYQs, notes and records.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 8h10M8 12h10" /></svg> },
    { id: 'quiz', name: 'Quiz Taker', desc: 'Generate custom tests from your subjects.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg> },
    { id: 'timetable', name: 'Timetable Hub', desc: 'Sync and manage your weekly schedule.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: 'cgpa', name: 'CGPA Calc', desc: 'Calculate and forecast your performance.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg> },
    { id: 'attendance', name: 'Attendance', desc: 'Track your attendance and safe-bunks.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
    { id: 'placement', name: 'Placement Prefect', desc: 'Analyze resumes and prep for jobs.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
    { id: 'campus', name: 'Campus Navigator', desc: 'Find blocks and rooms with ease.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg> },
    { id: 'freshers', name: 'Freshmen Kit', desc: 'Essential guide for newcomers.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /></svg> },
    { id: 'marketplace', name: 'LPU Market', desc: 'Buy/Sell used books and items.', icon: <svg viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6"><path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5m2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5" /></svg> },
    { id: 'roommate', name: 'Roommate Finder', desc: 'Find your perfect LPU flatmate.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: 'emergency', name: 'Rescue Line', desc: 'Emergency LPU official contacts.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> },
    { id: 'ai-tools', name: 'AI Directory', desc: 'Curated AI tools for students.', icon: <svg viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6"><path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z" /></svg> }
  ];

  return (
    <div className="w-full h-full pb-20 pt-0 animate-fade-in">
      <DashboardHero userProfile={userProfile} />
      <TodaysSchedule />
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 mb-4">Categories</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-16">
          {features.map((f) => (
            <FeatureCard key={f.id} f={f} navigate={navigate} />
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
  const [isClosingAuth, setIsClosingAuth] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isClosingProfile, setIsClosingProfile] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [isClosingMobileSearch, setIsClosingMobileSearch] = useState(false);
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

  const handleAuthClose = () => {
    setIsClosingAuth(true);
    setTimeout(() => {
      setShowAuthModal(false);
      setIsClosingAuth(false);
    }, 400); // AuthModal animation is 0.4s
  };

  const location = useLocation();
  const navigate = useNavigate();
  const currentModule = getModuleFromPath(location.pathname);

  useEffect(() => {
    NexusServer.trackPageView(location.pathname);
    NexusServer.saveRecord(userProfile?.id || null, 'feature_access', `Accessed ${currentModule}`, { path: location.pathname });
  }, [location.pathname, currentModule, userProfile?.id]);

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200">
      <Sidebar
        currentModule={currentModule}
        setModule={navigateToModule}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        userProfile={userProfile}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-[#0a0a0a]">
        <BackgroundEffects />

        <div id="app-navbar" className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 bg-white/90 dark:bg-[#0a0a0a] z-10 relative">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-700 dark:text-white mr-1 border-none active:scale-75 transition-all bg-transparent group"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="w-8 h-8 transition-transform group-hover:scale-110" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
              </svg>
            </button>
            <span className="hidden min-[400px]:inline-block md:hidden text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight cursor-pointer ml-1" onClick={() => navigate('/')}>LPU-Nexus</span>
          </div>

          <div className="flex-1 hidden md:flex ml-4">
            <div className="w-full max-w-[480px]">
              <UniversalSearch />
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <button 
              onClick={handleOpenMobileSearch}
              className="md:hidden p-2.5 rounded-full bg-slate-100 dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-white transition-all border border-transparent dark:border-white/5 shadow-sm active:scale-90"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
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
                  <button onClick={() => isProfileMenuOpen ? handleProfileClose() : setIsProfileMenuOpen(true)} className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 to-red-600 p-[1.5px] border-none shadow-[0_8px_20px_rgba(234,88,12,0.2)] hover:scale-105 active:scale-95 transition-all overflow-hidden cursor-pointer group text-left">
                    <div className="w-full h-full bg-white dark:bg-[#0a0a0a] rounded-full overflow-hidden flex items-center justify-center text-slate-900 dark:text-orange-600 font-bold text-sm">
                      {userProfile.avatar_url ? (
                        <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span>{userProfile.username?.[0] || userProfile.email[0]}</span>
                      )}
                    </div>
                  </button>
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40 bg-transparent" onClick={handleProfileClose} />
                      <div className={`absolute right-0 mt-3 w-56 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden py-3 z-50 animate-fade-in backdrop-blur-xl transition-all duration-300 ${isClosingProfile ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
                        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 mb-2 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600 font-bold text-[11px] sm:text-xs shrink-0 border border-orange-600/5 overflow-hidden">
                            {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" /> : (userProfile.username?.[0]?.toUpperCase() || 'V')}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-800 dark:text-white tracking-wider text-[11px] sm:text-xs truncate">{userProfile.username || 'Verto'}</p>
                              <VerifiedBadge isAdmin={userProfile.is_admin} size="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-widest truncate">{userProfile.email}</p>
                          </div>
                        </div>
                        {userProfile.is_admin && (
                          <button
                            onClick={() => { navigate('/admin-stats'); handleProfileClose(); }}
                            className="w-full text-left px-5 py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-600/5 border-none bg-transparent flex items-center gap-3 transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-orange-600/10 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 2v20M2 12h20" /></svg>
                            </div>
                            Admin Dashboard
                          </button>
                        )}
                        <button
                          onClick={() => { navigate('/profile'); handleProfileClose(); }}
                          className="w-full text-left px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-white/80 hover:text-orange-600 dark:hover:text-white hover:bg-orange-600/5 dark:hover:bg-white/5 border-none bg-transparent flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-orange-600/20 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          </div>
                          View Profile
                        </button>
                        <button
                          onClick={async () => { await NexusServer.signOut(); navigate('/'); handleProfileClose(); }}
                          className="w-full text-left px-5 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 border-none bg-transparent flex items-center gap-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-500/5 flex items-center justify-center text-red-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                          </div>
                          Log out
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
        <div id="main-content-area" className={`flex-1 overflow-y-auto relative scroll-smooth ${location.pathname === '/' ? 'p-0' : 'p-4 md:p-8'} bg-transparent`}>
          <div className={`relative ${location.pathname === '/' ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            <Routes>
              <Route path="/" element={<Dashboard userProfile={userProfile} />} />

              <Route path="/placement" element={<PlacementPrefect userProfile={userProfile} />} />
              <Route path="/placement/:reportId" element={<PlacementPrefect userProfile={userProfile} />} />
              <Route path="/timetable" element={<TimetableHub userProfile={userProfile} />} />
              <Route path="/quiz" element={<QuizTaker userProfile={userProfile} />} />
              <Route path="/quiz/:subjectName" element={<QuizTaker userProfile={userProfile} />} />
              <Route path="/quiz/:subjectName/:quizId" element={<QuizTaker userProfile={userProfile} />} />
              <Route path="/library" element={<ContentLibrary userProfile={userProfile} />} />
              <Route path="/library/:program" element={<ContentLibrary userProfile={userProfile} />} />
              <Route path="/library/:program/:semester" element={<ContentLibrary userProfile={userProfile} />} />
              <Route path="/library/:program/:semester/:subject" element={<ContentLibrary userProfile={userProfile} />} />
              <Route path="/library/:program/:semester/:subject/:category" element={<ContentLibrary userProfile={userProfile} />} />
              <Route path="/campus" element={<CampusNavigator />} />
              <Route path="/campus/:tab" element={<CampusNavigator />} />
              <Route path="/help" element={<HelpSection />} />
              <Route path="/freshers" element={<FreshersKit />} />
              <Route path="/cgpa" element={<CGPACalculator userProfile={userProfile} />} />
              <Route path="/attendance" element={<AttendanceTracker />} />
              <Route path="/share-cgpa" element={<ShareReport />} />
              <Route path="/about" element={<AboutUs userProfile={userProfile} />} />
              <Route path="/payment-success" element={<PaymentSuccess userProfile={userProfile} />} />
              <Route path="/payment-success/:paymentId" element={<PaymentSuccess userProfile={userProfile} />} />
              <Route path="/profile" element={<ProfileSection userProfile={userProfile} setUserProfile={setUserProfile} navigateToModule={(m) => navigate(getPathFromModule(m))} />} />
              <Route path="/marketplace" element={<MarketplaceHub userProfile={userProfile} />} />
              <Route path="/marketplace/:category" element={<MarketplaceHub userProfile={userProfile} />} />
              <Route path="/marketplace/item/:itemId" element={<MarketplaceHub userProfile={userProfile} />} />
              <Route path="/roommate" element={<RoommateFinder userProfile={userProfile} />} />
              <Route path="/emergency" element={<EmergencyContacts />} />
              <Route path="/ai-tools" element={<AIToolsDirectory />} />
              <Route path="/admin-stats" element={<AdminStats userProfile={userProfile} />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<Navigate to="/" replace />} />
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
            <div className={`relative w-full bg-white dark:bg-[#0a0a0a] rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.6)] p-6 overflow-hidden border-t border-slate-200 dark:border-white/10 flex flex-col h-[85vh] ${isClosingMobileSearch ? 'animate-sheet-out' : 'animate-sheet-in'}`}>
              {/* Handle bar */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-6 shrink-0" onClick={handleCloseMobileSearch} />
              
              <div className="flex items-start gap-3 mb-4 shrink-0">
                <button 
                  onClick={handleCloseMobileSearch}
                  className="mt-1 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-orange-600 transition-all border-none active:scale-90"
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
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <CookieBanner />
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
