
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { showToast } from './Toast.tsx';

const IconMess = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
);

const IconMap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
);

const IconBreakfast = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" /><path d="m15 15 6 6" /><path d="M11 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

const IconLunch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const IconSnacks = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

const IconDinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><path d="M12 9v6" /><path d="M9 12h6" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

const MealSkeleton = () => (
  <div className="glass-panel rounded-2xl overflow-hidden border dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-5 flex items-center space-x-4 animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 shimmer" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-1/4 bg-slate-200 dark:bg-white/10 rounded shimmer" />
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-white/10 rounded shimmer" />
    </div>
  </div>
);

import { MESS_DATA, DAYS, type MealCategories } from '../data/messData';


const CampusNavigator: React.FC = () => {
  const navigate = useNavigate();
  const { tab: urlTab } = useParams();
  const [activeTab, setActiveTab] = useState<'mess' | 'map'>((urlTab as 'mess' | 'map') || 'mess');
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reportModalRef = useRef<HTMLDivElement>(null);

  // Reference logic: Today (Feb 27, 2025) as Thursday, Week 2.
  const REF_SUNDAY = new Date('2025-02-23T00:00:00Z').getTime();
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  const now = Date.now();
  const actualToday = new Date(now).toLocaleDateString('en-US', { weekday: 'long' });

  const weeksPassed = Math.floor((now - REF_SUNDAY) / MS_PER_WEEK);
  const weekCycle = (weeksPassed % 2 === 0) ? 2 : 1;

  const [currentWeek, setCurrentWeek] = useState<1 | 2>(weekCycle as 1 | 2);
  const [selectedDay, setSelectedDay] = useState<string>(actualToday);

  // Modal & Floating Button State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  // Sync tab with URL
  useEffect(() => {
    if (urlTab && (urlTab === 'mess' || urlTab === 'map')) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: 'mess' | 'map') => {
    setActiveTab(tab);
    navigate(`/campus/${tab}`);
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

  const MealCard = ({ title, items, icon, colorClass }: { title: string, items: MealCategories, icon: React.ReactNode, colorClass: string }) => (
    <details className="group glass-panel rounded-2xl overflow-hidden transition-all duration-300 shadow-sm border dark:border-white/5" open>
      <summary className="flex items-center justify-between p-5 cursor-pointer select-none bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 dark:bg-opacity-20`}>
            {icon}
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-[11px] sm:text-xs">{title}</h4>
        </div>
        <span className="transform group-open:rotate-180 transition-transform text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </summary>
      <div className="px-8 py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in space-y-4">
        {Object.entries(items).map(([category, dishes]) => (
          <div key={category} className="border-b border-slate-100 dark:border-white/5 last:border-0 pb-3 last:pb-0">
            <span className="font-black text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 block mb-1">{category}</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold block">{dishes}</span>
          </div>
        ))}
      </div>
    </details>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <header className="mb-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tighter">Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Navigator</span></h2>
        <p className="text-slate-600 dark:text-slate-400">Survival guide: Boys Hostel Mess menu & Interactive Map.</p>
      </header>

      <div className="flex flex-wrap gap-2 bg-slate-200 dark:bg-white/5 p-1 rounded-2xl w-fit mb-8">
        <button
          onClick={() => handleTabChange('mess')}
          className={`px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center ${activeTab === 'mess' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <IconMess /> Mess Menu
        </button>
        <button
          onClick={() => handleTabChange('map')}
          className={`px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center ${activeTab === 'map' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
        >
          <IconMap /> 3D Map
        </button>
      </div>

      {activeTab === 'mess' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-center space-x-3 mb-6">
            <button
              onClick={() => setCurrentWeek(1)}
              className={`px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all border ${currentWeek === 1 ? 'bg-orange-600/10 border-orange-600 text-orange-600' : 'border-slate-300 dark:border-white/10 text-slate-500'}`}
            >
              Week 1
            </button>
            <button
              onClick={() => setCurrentWeek(2)}
              className={`px-5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all border ${currentWeek === 2 ? 'bg-orange-600/10 border-orange-600 text-orange-600' : 'border-slate-300 dark:border-white/10 text-slate-500'}`}
            >
              Week 2
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-4 pt-6 space-x-3 no-scrollbar snap-x px-1"
          >
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = (day === actualToday);

              return (
                <button
                  key={day}
                  data-day={day}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    flex-none snap-center flex flex-col items-center justify-center w-24 h-32 rounded-3xl border transition-all duration-300 relative
                    ${isSelected
                      ? 'bg-orange-600 border-orange-700 text-white shadow-2xl shadow-orange-600/30 transform scale-105'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-orange-500/50'
                    }
                  `}
                >
                  {isToday && (
                    <span className={`absolute -top-3 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-xl ${isSelected ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                      Today
                    </span>
                  )}
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest mb-2 opacity-80">{day.slice(0, 3)}</span>
                  <span className="text-3xl font-black tracking-tighter">{day.slice(0, 1)}</span>
                </button>
              );
            })}
          </div>

          {isInitializing ? (
            <div className="space-y-4">
              <MealSkeleton />
              <MealSkeleton />
              <MealSkeleton />
              <MealSkeleton />
            </div>
          ) : selectedMeals ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">{selectedDay} Menu</h3>
                <span className="text-[11px] sm:text-xs text-slate-500 font-black uppercase tracking-widest">W{currentWeek} Cycle</span>
              </div>

              <MealCard title="Breakfast" items={selectedMeals.breakfast} icon={<IconBreakfast />} colorClass="text-yellow-500" />
              <MealCard title="Lunch" items={selectedMeals.lunch} icon={<IconLunch />} colorClass="text-orange-600" />
              <MealCard title="Snacks" items={selectedMeals.snacks} icon={<IconSnacks />} colorClass="text-red-500" />
              <MealCard title="Dinner" items={selectedMeals.dinner} icon={<IconDinner />} colorClass="text-indigo-500" />
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="font-bold">Menu not available.</p>
            </div>
          )}

          <div className="pt-10 flex justify-center pb-20">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-600 border border-transparent dark:border-white/5 hover:border-orange-500/30 rounded-2xl transition-all group"
            >
              <IconAlert />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest">Report Issue / Outdated Data</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="glass-panel p-1 rounded-3xl h-[650px] overflow-hidden shadow-2xl relative animate-fade-in border dark:border-white/5 bg-black">
          <iframe
            src="https://iviewd.com/lpu2/"
            className="w-full h-full rounded-2xl transition-all duration-700"
            frameBorder="0"
            allowFullScreen
            title="LPU 3D Campus Map"
          />
        </div>
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-10 right-6 md:right-10 z-[100] w-14 h-14 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-2xl text-slate-800 dark:text-white hover:scale-110 active:scale-95 transition-all animate-fade-in"
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
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <header className="mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">Report Issue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Help us keep the mess menu accurate.</p>
            </header>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Hostel Name</label>
                <input
                  type="text"
                  placeholder="e.g., BH-1, GH-4, Sun Hostel"
                  value={reportForm.hostelName}
                  onChange={(e) => setReportForm(prev => ({ ...prev, hostelName: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 dark:bg-[#0a0a0a] border border-transparent dark:border-white/5 focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 dark:text-slate-200 transition-all font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">What's the issue?</label>
                <textarea
                  placeholder="e.g., Sunday breakfast items are swapped..."
                  value={reportForm.issueDetails}
                  onChange={(e) => setReportForm(prev => ({ ...prev, issueDetails: e.target.value }))}
                  className="w-full h-32 px-5 py-4 rounded-2xl bg-slate-100 dark:bg-[#0a0a0a] border border-transparent dark:border-white/5 focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 dark:text-slate-200 transition-all font-bold resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Image Proof (Optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full py-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/40 flex flex-col items-center justify-center transition-all ${reportForm.imageProof ? 'border-orange-500 bg-orange-500/5' : 'group-hover:border-orange-500/50'}`}>
                    {reportForm.imageProof ? (
                      <div className="flex flex-col items-center">
                        <img src={reportForm.imageProof} alt="Proof" className="h-16 w-16 object-cover rounded-lg mb-2 shadow-lg" />
                        <span className="text-[11px] sm:text-xs font-black text-orange-600 uppercase tracking-widest">Image Added</span>
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-slate-400 mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        <span className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-widest text-center px-4">Tap to upload photo of menu board</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] border-none"
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
