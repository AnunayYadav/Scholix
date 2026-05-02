
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
  <div className="glass-panel rounded-2xl overflow-hidden border dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-5 flex items-center space-x-4 animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10 shimmer" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-1/4 bg-zinc-200 dark:bg-white/10 rounded shimmer" />
      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-white/10 rounded shimmer" />
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
  const [activeFoodCategory, setActiveFoodCategory] = useState('all');

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
    const validTab = urlTab && availableTabs.includes(urlTab) ? (urlTab as any) : '';
    if (validTab !== activeTab) {
      setActiveTab(validTab);
    }
  }, [urlTab, availableTabs]);

  const handleTabChange = (tab: 'mess' | 'map' | 'market' | 'roommate' | 'facilities' | '') => {
    // Only navigate; the useEffect will sync the state
    const prefix = uniKey ? `/${uniKey}/campus` : '/campus';
    navigate(tab ? `${prefix}/${tab}` : prefix);
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

  // Monitor scroll on the main app container
  useEffect(() => {
    const mainArea = document.getElementById('main-content-area');

    const handleScroll = () => {
      if (mainArea) {
        setShowScrollTop(mainArea.scrollTop > 200);
      }
    };

    if (mainArea) {
      mainArea.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => mainArea.removeEventListener('scroll', handleScroll);
    }
  }, [activeTab]);

  const scrollToTop = () => {
    const mainArea = document.getElementById('main-content-area');
    if (mainArea) {
      mainArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      showToast("Please fill in the required fields.", "info");
      return;
    }
    console.log("Report submitted:", reportForm);
    showToast("Thank you! Your report has been submitted. We'll verify and update the data shortly.", "success");
    setReportForm({ hostelName: '', issueDetails: '', imageProof: null });
    handleClose();
  };

  const MealCard = ({ title, items, icon, accentColor }: { title: string, items: MealCategories, icon: React.ReactNode, accentColor: string }) => {
    return (
      <div className="glass-panel group relative overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 border border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 ${accentColor}`}>
              {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
            </div>
            <div>
              <h4 className="font-semibold uppercase tracking-[0.15em] text-xs leading-none text-zinc-900 dark:text-white/90">
                {title}
              </h4>
            </div>

          </div>
        </div>

        <div className="space-y-6 relative z-10 pl-1">
          {Object.entries(items).map(([category, dishes]) => {
            // Check if any part of the dish matches the selected nutrient category
            const isMatch = matchesCategory(dishes, activeFoodCategory);
            if (!isMatch && activeFoodCategory !== 'all') return null;

            return (
              <div key={category} className="group/item animate-fade-in">
                <span className="font-semibold text-[10px] uppercase tracking-widest block mb-1.5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {category}
                </span>

                <div className="flex items-start gap-2">
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-[15px] leading-snug transition-all group-hover/item:translate-x-1 duration-300">
                    {dishes}
                  </span>
                </div>
              </div>
            );
          })}
          {activeFoodCategory !== 'all' && Object.values(items).every(d => !matchesCategory(d, activeFoodCategory)) && (
            <div className="py-4 text-center">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest opacity-50">No matches found</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const FOOD_CATEGORIES = [
    { id: 'all', label: 'Featured', icon: '✨' },
    { id: 'protein', label: 'Protein Rich', icon: '💪' },
    { id: 'carbs', label: 'Carbs / Energy', icon: '⚡' },
    { id: 'salads', label: 'Salads & Greens', icon: '🥗' },
    { id: 'fats', label: 'Fats & Sweets', icon: '🍯' },
  ];

  const matchesCategory = (dish: string, category: string) => {
    if (category === 'all') return true;
    const keywords: Record<string, string[]> = {
      protein: ['paneer', 'soya', 'dal', 'sprouts', 'chana', 'rajma', 'matar', 'curd', 'raita', 'dahi', 'egg', 'pappu', 'sambhar', 'channa', 'parippu', 'gram', 'milk'],
      carbs: ['rice', 'roti', 'prantha', 'poha', 'upma', 'potato', 'aloo', 'bread', 'pasta', 'kulcha', 'poori', 'vermicelli', 'noodles', 'sandwich', 'biryani', 'pulao', 'macaroni', 'pongal', 'bhel', 'fries', 'bun', 'tikki'],
      salads: ['salad', 'cabbage', 'bhindi', 'carrot', 'beetroot', 'vegetable', 'veg', 'thoran', 'poriyal', 'fry', 'dum fry', 'kootu', 'ghia', 'arbi', 'baingan', 'tinda'],
      fats: ['butter', 'ghee', 'oil', 'jamun', 'halwa', 'burfi', 'laddu', 'kheer', 'ice cream', 'custard', 'pongal', 'curry', 'makhni'] 
    };
    const target = keywords[category];
    if (!target) return false;
    return target.some(k => dish.toLowerCase().includes(k.toLowerCase()));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 relative">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      {/* Persistent Header for Hub & Sections */}
      <header className="pt-2 flex items-center justify-between">
        <div className="animate-fade-in">
          <p className="text-[10px] font-semibold tracking-wider text-zinc-500 mb-1 ml-0.5">
            {userProfile ? `Welcome, ${userProfile.full_name?.split(' ')[0] || 'User'}` : 'Exploration Mode'}
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {{
            'mess': <>{universityInfo?.shortName || ''} Mess <span className="text-brand-primary">Menu</span></>,
            'map': (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">{universityInfo?.shortName || ''} Campus <span className="text-brand-secondary">Map</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWalkthroughActive(!isWalkthroughActive);
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all border active:scale-95 ${
                    isWalkthroughActive 
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
          </h1>
        </div>

        {activeTab && (
          <button 
            onClick={() => handleTabChange('')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 font-semibold text-[10px] tracking-tight hover:bg-brand-primary/10 hover:text-brand-primary transition-all border-none active:scale-95 group shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 transition-transform group-hover:-translate-x-0.5"><polyline points="15 18 9 12 15 6" /></svg>
            Campus Hub
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
                  bgColor: 'from-brand-primary/20 via-brand-primary/5 to-transparent',
                  accentColor: 'text-brand-primary',
                  gradient: 'radial-gradient(circle at center, var(--brand-glow), transparent 70%)'
                },
                map: {
                  label: '3D Map',
                  desc: 'Virtual Tour',
                  icon: <IconMap />,
                  bgColor: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
                  accentColor: 'text-emerald-500',
                  gradient: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15), transparent 70%)'
                },
                market: {
                  label: 'Nexus Market',
                  desc: 'Buy & Sell',
                  icon: <IconMarket />,
                  bgColor: 'from-blue-500/20 via-blue-500/5 to-transparent',
                  accentColor: 'text-blue-500',
                  gradient: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15), transparent 70%)'
                },
                roommate: {
                  label: 'Roommate',
                  desc: 'Find Peers',
                  icon: <IconRoommate />,
                  bgColor: 'from-purple-500/20 via-purple-500/5 to-transparent',
                  accentColor: 'text-purple-500',
                  gradient: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15), transparent 70%)'
                },
                facilities: {
                  label: 'Facilities',
                  desc: 'Shops & Services',
                  icon: <IconGlobe />,
                  bgColor: 'from-brand-primary/20 via-brand-primary/5 to-transparent',
                  accentColor: 'text-brand-primary',
                  gradient: 'radial-gradient(circle at center, var(--brand-glow), transparent 70%)'
                }
              }[tabId];

              if (!config) return null;

              return (
                <button
                  key={tabId}
                  onClick={() => handleTabChange(tabId)}
                  className={`relative flex flex-col items-start p-5 sm:p-6 rounded-[2.5rem] border transition-all duration-500 text-left group overflow-hidden active:scale-95 border-zinc-200/50 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-brand-primary/30 hover:shadow-2xl hover:-translate-y-1.5`}
                >
                  {/* Custom Glow Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ background: config.gradient }} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.01)_130%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_140%)] pointer-events-none" />

                  <div className={`relative p-3 sm:p-4 rounded-2xl mb-4 transition-all duration-500 bg-white dark:bg-zinc-800 lg:dark:bg-white/5 text-zinc-400 group-hover:${config.accentColor} shadow-sm group-hover:shadow-lg group-hover:scale-110`}>
                    {React.cloneElement(config.icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                  </div>
                  
                  <div className="relative">
                    <span className={`block text-[11px] sm:text-[12px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-500`}>
                      {config.label}
                    </span>
                    <span className={`block text-[10px] sm:text-[11px] font-medium mt-1 text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors duration-500`}>
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
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-lg">Essentials</span>
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
                  className="group relative flex flex-col items-start p-6 rounded-[2.5rem] border border-zinc-200/50 dark:border-white/5 bg-white dark:bg-zinc-900/40 transition-all hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/5 text-left border-none cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
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
              {/* Mess Menu Content */}
              <div className="flex justify-center space-x-3 mb-6">
                <button
                  onClick={() => setCurrentWeek(1)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${currentWeek === 1 ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20' : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-500'}`}
                >
                  Week 1
                </button>
                <button
                  onClick={() => setCurrentWeek(2)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${currentWeek === 2 ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20' : 'bg-transparent border-zinc-200 dark:border-white/10 text-zinc-500'}`}
                >
                  Week 2
                </button>

              </div>

              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-4 pt-2 -mx-4 px-4 space-x-3 no-scrollbar snap-x"
              >
                {DAYS.map((day) => {
                  const isSelected = selectedDay === day;
                  const isToday = (day === actualToday && currentWeek === weekCycle);

                  return (
                    <button
                      key={day}
                      data-day={day}
                      onClick={() => setSelectedDay(day)}
                      className={`
                        flex-none snap-center flex flex-col items-center justify-center w-20 h-24 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group/day
                        ${isSelected
                          ? 'bg-brand-primary border-brand-primary text-white shadow-2xl scale-[1.05] shadow-brand-primary/30'
                          : 'bg-white/80 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20'
                        }
                      `}
                    >
                      {/* Subtle inner glow for selected day */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                      )}
                      {isToday && (
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10">
                          <div className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-[0.15em] border transition-all duration-500 ${
                            isSelected 
                              ? 'bg-white text-brand-primary border-white shadow-sm' 
                              : 'bg-brand-primary text-white border-brand-primary shadow-lg animate-pulse-gentle'
                          }`}>
                            Today
                          </div>
                        </div>
                      )}
                      <div className={`flex flex-col items-center justify-center transition-all duration-500 ${isToday ? 'mt-4' : ''}`}>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1 transition-opacity ${isSelected ? 'opacity-90' : 'opacity-40'}`}>{day.slice(0, 3)}</span>
                        <span className="text-2xl font-bold tracking-tight">{day.slice(0,1)}</span>
                      </div>

                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                {FOOD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFoodCategory(cat.id)}
                    className={`
                      flex-none px-4 py-2.5 rounded-2xl border transition-all duration-300 flex items-center space-x-2
                      ${activeFoodCategory === cat.id 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg' 
                        : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20'
                      }
                    `}
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span className={`text-[11px] font-semibold tracking-tight capitalize ${activeFoodCategory === cat.id ? 'text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>

              {isInitializing ? (
                <div className="space-y-4">
                  <MealSkeleton />
                  <MealSkeleton />
                  <MealSkeleton />
                </div>
              ) : selectedMeals ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-white tracking-tight uppercase">{selectedDay} Menu</h3>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest">W{currentWeek} Cycle</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                    <MealCard title="Breakfast" items={selectedMeals.breakfast} icon={<IconBreakfast />} accentColor="text-brand-primary" />
                    <MealCard title="Lunch" items={selectedMeals.lunch} icon={<IconLunch />} accentColor="text-brand-primary" />
                    <MealCard title="Snacks" items={selectedMeals.snacks} icon={<IconSnacks />} accentColor="text-brand-primary" />
                    <MealCard title="Dinner" items={selectedMeals.dinner} icon={<IconDinner />} accentColor="text-brand-primary" />
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-zinc-500">
                  <p className="font-bold">Menu not available.</p>
                </div>
              )}

              <div className="pt-10 flex justify-center pb-20">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center px-6 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-brand-primary/10 hover:text-brand-primary border border-transparent dark:border-white/5 hover:border-brand-primary/30 rounded-2xl transition-all group"
                >
                  <IconAlert />
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest">Report Issue / Outdated Data</span>
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
          className="fixed bottom-10 right-6 md:right-10 z-[100] w-14 h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-2xl text-zinc-800 dark:text-white hover:scale-110 active:scale-95 transition-all animate-fade-in"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-6 h-6"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
      )}

      {isReportModalOpen && createPortal(
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <div ref={reportModalRef} className={`nexus-modal w-full max-w-md p-6 relative ${isClosing ? 'closing' : ''}`}>
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <header className="mb-6">
              <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-1 tracking-tight">Report Issue</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Help us keep the mess menu accurate.</p>
            </header>


            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Hostel Name</label>
                <input
                  type="text"
                  placeholder="e.g., BH-1, GH-4, Sun Hostel"
                  value={reportForm.hostelName}
                  onChange={(e) => setReportForm(prev => ({ ...prev, hostelName: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-[#0a0a0a] border border-transparent dark:border-white/5 focus:ring-2 focus:ring-orange-500 outline-none text-zinc-800 dark:text-zinc-200 transition-all font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">What's the issue?</label>
                <textarea
                  placeholder="e.g., Sunday breakfast items are swapped..."
                  value={reportForm.issueDetails}
                  onChange={(e) => setReportForm(prev => ({ ...prev, issueDetails: e.target.value }))}
                  className="w-full h-32 px-5 py-4 rounded-2xl bg-zinc-100 dark:bg-[#0a0a0a] border border-transparent dark:border-white/5 focus:ring-2 focus:ring-orange-500 outline-none text-zinc-800 dark:text-zinc-200 transition-all font-bold resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Image Proof (Optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full py-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-[#0a0a0a]/40 flex flex-col items-center justify-center transition-all ${reportForm.imageProof ? 'border-orange-500 bg-orange-500/5' : 'group-hover:border-orange-500/50'}`}>
                    {reportForm.imageProof ? (
                      <div className="flex flex-col items-center">
                        <img src={reportForm.imageProof} alt="Proof" className="h-16 w-16 object-cover rounded-lg mb-2 shadow-lg" />
                        <span className="text-[11px] sm:text-xs font-black text-orange-600 uppercase tracking-widest">Image Added</span>
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-zinc-400 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        <span className="text-[11px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest text-center px-4">Tap to upload photo of menu board</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-brand-primary hover:opacity-90 text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98] border-none"
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
