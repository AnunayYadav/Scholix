
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { showToast } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import MarketplaceHub from './MarketplaceHub.tsx';
import RoommateFinder from './RoommateFinder.tsx';
import NexusAd from './NexusAd.tsx';
import type { UserProfile } from '../types';
import CampusFacilities from './CampusFacilities.tsx';
import { ChevronLeft, Utensils } from 'lucide-react';

const IconMarket = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5 mr-2"}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const IconRoommate = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5 mr-2"}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconMess = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5 mr-2"}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
);

const IconMap = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5 mr-2"}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
);

const IconBreakfast = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}>
    <path d="M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" /><path d="m15 15 6 6" /><path d="M11 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

const IconLunch = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const IconSnacks = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

const IconDinner = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-6 h-6"}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><path d="M12 9v6" /><path d="M9 12h6" />
  </svg>
);

const IconAlert = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-4 h-4 mr-2"}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

const IconLink = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);

const IconCalendar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);

const IconPhone = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);

const IconGlobe = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);

const IconBus = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || "w-5 h-5"}><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M9 20h6" /><path d="M12 16v4" /><path d="M6 16v4" /><path d="M18 16v4" /><path d="M8 8h8" /></svg>
);


const MealSkeleton = () => (
  <div className="rounded-[32px] sm:rounded-[36px] bg-zinc-100/60 dark:bg-white/[0.03] p-6 sm:p-7 space-y-4 animate-pulse border-none">
    <div className="flex items-center justify-between pb-3 border-b border-zinc-200/40 dark:border-white/[0.03]">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-zinc-200/60 dark:bg-white/5" />
        <div className="h-4 w-24 bg-zinc-200/60 dark:bg-white/5 rounded-full" />
      </div>
      <div className="h-4 w-28 bg-zinc-200/60 dark:bg-white/5 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="h-3.5 w-3/4 bg-zinc-200/60 dark:bg-white/5 rounded-full" />
      <div className="h-3.5 w-1/2 bg-zinc-200/60 dark:bg-white/5 rounded-full" />
      <div className="h-3.5 w-2/3 bg-zinc-200/60 dark:bg-white/5 rounded-full" />
    </div>
  </div>
);

import { MESS_DATA, DAYS, type MealCategories } from '../data/messData';


const CampusNavigator: React.FC<{ userProfile: UserProfile | null }> = ({ userProfile }) => {
  const { universityInfo } = useUniversity();
  const navigate = useNavigate();
  const { uniKey, tab: urlTab } = useParams();

  // Combine university specific tabs with global campus features
  const availableTabs = React.useMemo(() => [
    ...(universityInfo?.features.campusTabs || ['mess', 'map']),
    'market',
    'roommate',
    'facilities'
  ], [universityInfo]);

  const [activeTab, setActiveTab] = useState<'mess' | 'map' | 'market' | 'roommate' | 'facilities' | ''>(() => {
    if (urlTab && availableTabs.includes(urlTab)) return urlTab as any;
    return '';
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reportModalRef = useRef<HTMLDivElement>(null);

  // Sync tab with available tabs when universityInfo changes
  useEffect(() => {
    if (activeTab !== '' && !availableTabs.includes(activeTab)) {
      setActiveTab('');
    }
  }, [universityInfo]);

  // Reference logic: Today (Feb 27, 2025) as Thursday, Week 2.
  const REF_SUNDAY = new Date('2025-02-23T00:00:00Z').getTime();
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  const now = Date.now();
  const actualToday = new Date(now).toLocaleDateString('en-US', { weekday: 'long' });

  const weeksPassed = Math.floor((now - REF_SUNDAY) / MS_PER_WEEK);
  const weekCycle = (weeksPassed % 2 === 0) ? 2 : 1;

  const [currentWeek, setCurrentWeek] = useState<1 | 2>(weekCycle as 1 | 2);
  const [selectedDay, setSelectedDay] = useState<string>(actualToday);

  const weekDaysWithDates = React.useMemo(() => {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Calculate Sunday of current week
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - currentDayIndex);
    currentSunday.setHours(0, 0, 0, 0);

    // If viewing the alternate cycle, show next week (+7 days)
    const weekOffset = currentWeek === weekCycle ? 0 : 1;
    const baseSunday = new Date(currentSunday);
    baseSunday.setDate(currentSunday.getDate() + weekOffset * 7);

    return DAYS.map((day, idx) => {
      const d = new Date(baseSunday);
      d.setDate(baseSunday.getDate() + idx);
      const isDateToday = d.toDateString() === today.toDateString();
      return {
        day,
        dateNumber: d.getDate(),
        isToday: isDateToday
      };
    });
  }, [currentWeek, weekCycle]);

  // Modal & Floating Button State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [reportForm, setReportForm] = useState({
    hostelName: '',
    issueDetails: '',
    imageProof: null as string | null
  });

  useEffect(() => {
    // Simulate initial data loading for skeleton UI
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Sync tab with URL parameter
  useEffect(() => {
    if (urlTab && availableTabs.includes(urlTab)) {
      setActiveTab(urlTab as any);
    }
  }, [urlTab, availableTabs]);

  const handleTabChange = (tab: 'mess' | 'map' | 'market' | 'roommate' | 'facilities' | '') => {
    setActiveTab(tab);
    const prefix = uniKey ? `/${uniKey}` : '';
    if (tab === '') {
      navigate(`${prefix}/campus`);
    } else {
      navigate(`${prefix}/campus/${tab}`);
    }
  };

  // Auto-scroll logic for mess report modal
  useEffect(() => {
    if (isReportModalOpen) {
      reportModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isReportModalOpen]);

  useEffect(() => {
    // Auto-scroll to today button
    if (activeTab === 'mess' && !isInitializing) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          const todayElement = scrollContainerRef.current.querySelector(`[data-day="${actualToday}"]`);
          if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [activeTab, actualToday, isInitializing]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setIsClosing(false);
    }, 250);
  };

  const currentMenuData = currentWeek === 1 ? MESS_DATA.week1 : MESS_DATA.week2;
  const selectedMeals = currentMenuData.find(m => m.day === selectedDay)?.meals;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportForm(prev => ({ ...prev, imageProof: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.hostelName || !reportForm.issueDetails) {
      showToast("Please fill in the hostel name and issue details.", "error");
      return;
    }
    showToast("Thank you! Your report has been submitted. We'll verify and update the data shortly.", "success");
    setReportForm({ hostelName: '', issueDetails: '', imageProof: null });
    handleClose();
  };

  const getMealTiming = (mealTitle: string, day: string) => {
    if (mealTitle === 'Breakfast') {
      return day === 'Sunday' ? '8:00 AM – 9:30 AM' : '7:30 AM – 9:30 AM';
    }
    if (mealTitle === 'Lunch') {
      return day === 'Sunday' ? '12:30 PM – 2:30 PM' : '11:30 AM – 2:30 PM';
    }
    if (mealTitle === 'Snacks') {
      return '5:00 PM – 6:30 PM';
    }
    if (mealTitle === 'Dinner') {
      return '7:30 PM – 9:30 PM';
    }
    return '';
  };

  const MealCard = ({ title, items, icon }: { title: string, items: MealCategories, icon: React.ReactNode, accentColor?: string }) => {
    const timing = getMealTiming(title, selectedDay);

    return (
      <div className="rounded-[32px] sm:rounded-[36px] bg-zinc-100/60 dark:bg-white/[0.03] p-6 sm:p-7 transition-all duration-300 hover:bg-zinc-100/80 dark:hover:bg-white/[0.045] flex flex-col group border-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-200/40 dark:border-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 dark:text-orange-400">
              {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
            </div>
            <div>
              <h4 className="text-sm sm:text-[15px] font-semibold text-zinc-900 dark:text-white tracking-tight">
                {title}
              </h4>
            </div>
          </div>
          {timing && (
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/40 dark:bg-white/[0.04] px-3 py-1 rounded-full border-none">
              {timing}
            </span>
          )}
        </div>

        {/* Dishes list */}
        <div className="space-y-2.5 flex-1">
          {Object.entries(items).map(([category, dishes]) => (
            <div key={category} className="group/item flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3.5 py-1">
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 sm:w-28 sm:shrink-0 capitalize">
                {category.toLowerCase()}
              </span>
              <span className="text-xs sm:text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug flex-1">
                {dishes}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 relative">
      {/* Persistent Header for Hub & Sections */}
      <header className="pt-2 flex items-center justify-between">
        <div className="animate-fade-in">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-0.5 ml-0.5">
            {userProfile ? `Welcome, ${userProfile.full_name?.split(' ')[0] || 'User'}` : 'Campus Life'}
          </p>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {{
              'mess': (
                <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
                  <span>Mess Menu</span>
                </h1>
              ),
              'map': (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight">{universityInfo?.shortName || ''} Campus <span className="text-brand-secondary">Map</span></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsWalkthroughActive(!isWalkthroughActive);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all border active:scale-95 ${isWalkthroughActive
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-zinc-100 dark:bg-white/5 border-zinc-200/60 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-brand-primary/30'
                      }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
                      {isWalkthroughActive ? (
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-tight whitespace-nowrap">
                      {isWalkthroughActive ? '3D Map' : 'Walkthrough'}
                    </span>
                  </button>
                </div>
              ),
              'market': <>Nexus <span className="text-blue-500">Market</span></>,
              'roommate': <>Roommate <span className="text-purple-500">Finder</span></>,
              'facilities': <>Campus <span className="text-brand-primary">Facilities</span></>,
              '': <>{universityInfo?.shortName || ''} Campus <span className="text-brand-primary">Hub</span></>
            }[activeTab] || <>{universityInfo?.shortName || ''} Campus <span className="text-brand-primary">Hub</span></>}
          </div>
        </div>

        {activeTab && (
          <button
            onClick={() => handleTabChange('')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100/70 dark:bg-white/[0.04] hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition-colors border-none cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Campus Hub</span>
          </button>
        )}
      </header>


      {/* Aesthetic Hub Cards */}
      {!activeTab && (
        <div className="space-y-12 pb-20">
          <div key="hub" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in">
            {(availableTabs as ('mess' | 'map' | 'market' | 'roommate' | 'facilities')[]).filter(id => id !== 'facilities').map((tabId) => {
              const isActive = activeTab === tabId;
              const config = {
                mess: {
                  label: 'Mess Menu',
                  desc: 'Food & Timing',
                  icon: <IconMess />,
                  bgColor: 'from-orange-500/15 via-orange-500/5 to-transparent',
                  accentColor: 'text-orange-500 dark:text-orange-400',
                  gradient: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.15), transparent 70%)'
                },
                map: {
                  label: '3D Map',
                  desc: 'Virtual Tour',
                  icon: <IconMap />,
                  bgColor: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
                  accentColor: 'text-emerald-500 dark:text-emerald-400',
                  gradient: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15), transparent 70%)'
                },
                market: {
                  label: 'Nexus Market',
                  desc: 'Buy & Sell',
                  icon: <IconMarket />,
                  bgColor: 'from-blue-500/15 via-blue-500/5 to-transparent',
                  accentColor: 'text-blue-500 dark:text-blue-400',
                  gradient: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15), transparent 70%)'
                },
                roommate: {
                  label: 'Roommate',
                  desc: 'Find Peers',
                  icon: <IconRoommate />,
                  bgColor: 'from-purple-500/15 via-purple-500/5 to-transparent',
                  accentColor: 'text-purple-500 dark:text-purple-400',
                  gradient: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15), transparent 70%)'
                },
                facilities: {
                  label: 'Facilities',
                  desc: 'Shops & Services',
                  icon: <IconGlobe />,
                  bgColor: 'from-orange-500/15 via-orange-500/5 to-transparent',
                  accentColor: 'text-orange-500 dark:text-orange-400',
                  gradient: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.15), transparent 70%)'
                }
              }[tabId];

              if (!config) return null;

              return (
                <button
                  key={tabId}
                  onClick={() => handleTabChange(tabId)}
                  className="relative flex flex-col items-start p-5 sm:p-6 rounded-[2.2rem] border-none shadow-none transition-all duration-500 text-left group overflow-hidden active:scale-95 bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer w-full"
                >
                  {/* Custom Radial Glow Overlay on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: config.gradient }} />

                  {/* Icon container */}
                  <div className={`relative p-3 sm:p-4 rounded-2xl mb-4 transition-all duration-500 bg-zinc-200/60 dark:bg-[#18181b] border-none shadow-none text-zinc-400 group-hover:${config.accentColor} shadow-sm group-hover:shadow-lg group-hover:scale-110`}>
                    {React.cloneElement(config.icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                  </div>

                  <div className="relative">
                    <span className="block text-[11px] sm:text-[12px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-500 font-sans">
                      {config.label}
                    </span>
                    <span className="block text-[10px] sm:text-[11px] font-medium mt-1 text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors duration-500">
                      {config.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>



          {/* Hub Section Ad */}
          <div className="pt-2">
            <NexusAd slot="2912081909" format="horizontal" hideLabel />
          </div>

          {/* Student Toolkit Section */}
          <div className="space-y-6 pt-4 pb-12">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-white tracking-tight">Student Toolkit</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-[#111113] px-3 py-1.5 rounded-full border-none shadow-none">Essentials</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { title: 'Freshers Kit', desc: 'Essential guide for newcomers', icon: '🎒', color: 'from-orange-500 to-amber-600', path: '/freshers' },
                { title: 'CGPA Predictor', desc: 'Calculate your target grades', icon: '📊', color: 'from-blue-500 to-indigo-600', path: '/tools?tab=cgpa' },
                { title: 'Attendance Aide', desc: 'Track and reach your goals', icon: '🕒', color: 'from-purple-500 to-pink-600', path: '/tools?tab=attendance' },
                { title: 'Facilities', desc: 'Shops & Services', icon: '🌐', color: 'from-emerald-500 to-teal-600', path: '/campus/facilities' },
              ].map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const prefix = uniKey ? `/${uniKey}` : '';
                    navigate(tool.path.startsWith('/') ? `${prefix}${tool.path}` : `${prefix}/${tool.path}`);
                  }}
                  className="group relative flex flex-col items-start p-6 rounded-[2.2rem] border-none shadow-none bg-zinc-100 dark:bg-[#111113] hover:bg-zinc-200/60 dark:hover:bg-[#161618] hover:-translate-y-1.5 hover:shadow-2xl active:scale-95 transition-all duration-500 text-left cursor-pointer w-full"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <span className="filter drop-shadow-md">{tool.icon}</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{tool.title}</h4>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-medium leading-relaxed mb-4">{tool.desc}</p>
                  <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                    Open Tool
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}


      {/* Sub-tab Content Area */}
      {activeTab && (
        <div key={activeTab} className="w-full">
          {activeTab === 'mess' && (
            <div className="space-y-6 animate-fade-in">
              {/* Controls: Week Selector & Day Selector */}
              <div className="space-y-4">
                {/* Week Segmented Control */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex p-1 rounded-full bg-zinc-100/80 dark:bg-white/[0.04] border-none">
                    <button
                      onClick={() => setCurrentWeek(1)}
                      className={`px-5 sm:px-6 py-1.5 rounded-full text-xs transition-all cursor-pointer border-none ${
                        currentWeek === 1
                          ? 'bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 shadow-sm font-semibold'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent font-medium'
                      }`}
                    >
                      Week 1
                    </button>
                    <button
                      onClick={() => setCurrentWeek(2)}
                      className={`px-5 sm:px-6 py-1.5 rounded-full text-xs transition-all cursor-pointer border-none ${
                        currentWeek === 2
                          ? 'bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 shadow-sm font-semibold'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-transparent font-medium'
                      }`}
                    >
                      Week 2
                    </button>
                  </div>
                </div>

                {/* Days of the Week: Centered & Reduced Width */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 max-w-lg sm:max-w-xl mx-auto w-full">
                  {weekDaysWithDates.map(({ day, dateNumber, isToday }) => {
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={day}
                        data-day={day}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          flex-1 max-w-[56px] sm:max-w-[66px] py-2.5 sm:py-3 rounded-2xl sm:rounded-[22px] transition-all duration-200 cursor-pointer border-none flex flex-col items-center justify-center active:scale-95
                          ${isSelected
                            ? 'bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 shadow-sm font-semibold'
                            : 'bg-zinc-100/80 dark:bg-white/[0.04] hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                          }
                        `}
                      >
                        <span className={`text-sm sm:text-base font-bold leading-tight ${isSelected ? 'text-zinc-950 dark:text-zinc-950' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {dateNumber}
                        </span>
                        <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {day.slice(0, 3)}
                        </span>
                        {isToday ? (
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 bg-orange-500 ${isSelected ? 'shadow-[0_0_6px_rgba(249,115,22,0.7)]' : ''}`} />
                        ) : (
                          <span className="w-1.5 h-1.5 mt-1 opacity-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isInitializing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MealSkeleton />
                  <MealSkeleton />
                  <MealSkeleton />
                  <MealSkeleton />
                </div>
              ) : selectedMeals ? (
                <div className="space-y-4 animate-fade-in pt-1">
                  <div className="flex items-center justify-between px-0.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">
                        {selectedDay} Menu
                      </h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">
                        Week {currentWeek} Cycle {selectedDay === actualToday && currentWeek === weekCycle ? '• Today' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                    <MealCard title="Breakfast" items={selectedMeals.breakfast} icon={<IconBreakfast />} />
                    <MealCard title="Lunch" items={selectedMeals.lunch} icon={<IconLunch />} />
                    <MealCard title="Snacks" items={selectedMeals.snacks} icon={<IconSnacks />} />
                    <MealCard title="Dinner" items={selectedMeals.dinner} icon={<IconDinner />} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500 text-xs font-medium">
                  Menu not available for this selection.
                </div>
              )}

              {/* Report Outdated Data */}
              <div className="pt-2 flex justify-center pb-12">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100/70 dark:bg-white/[0.035] hover:bg-zinc-200/60 dark:hover:bg-white/[0.06] border-none transition-colors cursor-pointer"
                >
                  <IconAlert className="w-3.5 h-3.5" />
                  <span>Report Outdated Menu</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="glass-panel p-1 rounded-[2.5rem] h-[600px] overflow-hidden shadow-2xl relative animate-fade-in border dark:border-white/5 bg-black">
                {isWalkthroughActive ? (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!4v1777702274105!6m8!1m7!1sPPeXkt5NPYNTeQijNbwYCg!2m2!1d31.2607325620669!2d75.70697036279117!3f237.79!4f0.4200000000000017!5f0.8741376114956905"
                    className="w-full h-full rounded-[2.2rem]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Campus Walkthrough"
                  />
                ) : universityInfo?.campusMapUrl ? (
                  <iframe src={universityInfo.campusMapUrl} className="w-full h-full rounded-[2.2rem]" frameBorder="0" allowFullScreen title="Map" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 uppercase tracking-widest">Map Protocol Pending...</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'market' && <MarketplaceHub userProfile={userProfile} />}
          {activeTab === 'roommate' && <RoommateFinder userProfile={userProfile} />}
          {activeTab === 'facilities' && <CampusFacilities />}
        </div>
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-10 right-6 md:right-10 z-[100] w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-none rounded-full flex items-center justify-center shadow-xl text-zinc-800 dark:text-white hover:scale-105 active:scale-95 transition-all animate-fade-in cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
      )}

      {isReportModalOpen && createPortal(
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <div ref={reportModalRef} className={`nexus-modal w-full max-w-md p-6 sm:p-7 rounded-[32px] sm:rounded-[36px] border border-zinc-200/80 dark:border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.4)] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl relative overflow-hidden flex flex-col ${isClosing ? 'closing' : ''}`}>
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-400 hover:text-zinc-800 dark:hover:text-white flex items-center justify-center border-none transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {/* Header */}
            <header className="mb-5 pr-8">
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Report <span className="text-orange-500">Issue</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                Help us keep the mess menu accurate.
              </p>
            </header>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              {/* Hostel Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 ml-0.5">
                  Hostel Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BH-1, GH-4, Sun Hostel"
                  value={reportForm.hostelName}
                  onChange={(e) => setReportForm(prev => ({ ...prev, hostelName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-100/80 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.06] focus:bg-white dark:focus:bg-[#18181b] border border-zinc-200/50 dark:border-white/[0.06] focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium text-xs sm:text-sm transition-all"
                  required
                />
              </div>

              {/* What's the issue */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 ml-0.5">
                  What's the issue?
                </label>
                <textarea
                  placeholder="e.g. Sunday breakfast items are swapped..."
                  value={reportForm.issueDetails}
                  onChange={(e) => setReportForm(prev => ({ ...prev, issueDetails: e.target.value }))}
                  className="w-full h-28 px-4 py-3 rounded-2xl bg-zinc-100/80 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.06] focus:bg-white dark:focus:bg-[#18181b] border border-zinc-200/50 dark:border-white/[0.06] focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/15 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium text-xs sm:text-sm transition-all resize-none"
                  required
                />
              </div>

              {/* Image Proof */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5 ml-0.5">
                  Image Proof <span className="text-zinc-400 dark:text-zinc-600 font-normal">(Optional)</span>
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full py-5 rounded-2xl border border-dashed transition-all flex flex-col items-center justify-center ${
                    reportForm.imageProof 
                      ? 'border-orange-500/50 bg-orange-500/5' 
                      : 'border-zinc-300/70 dark:border-white/[0.08] hover:border-orange-500/40 bg-zinc-100/50 dark:bg-white/[0.02] hover:bg-zinc-100/80 dark:hover:bg-white/[0.04]'
                  }`}>
                    {reportForm.imageProof ? (
                      <div className="flex flex-col items-center">
                        <img src={reportForm.imageProof} alt="Proof" className="h-14 w-14 object-cover rounded-xl mb-1.5 shadow-sm" />
                        <span className="text-xs font-medium text-orange-500">Image attached</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-zinc-200/50 dark:bg-white/[0.06] flex items-center justify-center text-zinc-400 group-hover:text-orange-500 mb-1.5 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">Upload photo of menu board</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200/60 dark:hover:bg-white/[0.08] transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-500/20 active:scale-95 transition-all border-none cursor-pointer text-center"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default CampusNavigator;
