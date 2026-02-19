
import React, { useState, useEffect, useRef } from 'react';
import { ModuleType, UserProfile } from '../types';
import NexusServer from '../services/nexusServer.ts';

interface SidebarProps {
  currentModule: ModuleType;
  setModule: (m: ModuleType) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  userProfile: UserProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  setModule,
  isMobileMenuOpen,
  toggleMobileMenu,
  userProfile,
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const feedbackModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showFeedbackModal) {
      feedbackModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showFeedbackModal]);

  const navItems = [
    {
      id: ModuleType.DASHBOARD,
      label: 'Dashboard',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    },
    {
      id: ModuleType.TIMETABLE,
      label: 'Timetable Hub',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    },
    {
      id: ModuleType.QUIZ,
      label: 'Quiz Taker',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
    },
    {
      id: ModuleType.ATTENDANCE,
      label: 'Attendance',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    },
    {
      id: ModuleType.CGPA,
      label: 'CGPA Calc',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="16" y1="14" x2="16" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>
    },
    {
      id: ModuleType.PLACEMENT,
      label: 'Placement Prefect',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    },
    {
      id: ModuleType.LIBRARY,
      label: 'Study Material',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 8h10M8 12h10" /></svg>
    },
    {
      id: ModuleType.CAMPUS,
      label: 'Campus Navigator',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
    },
    {
      id: ModuleType.FRESHERS,
      label: "Freshmen Kit",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /></svg>
    },
    {
      id: ModuleType.HELP,
      label: 'Help & FAQ',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
    },
    {
      id: ModuleType.ABOUT,
      label: 'About Us',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    },
  ];

  const submitFeedback = async () => {
    if (!feedbackText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await NexusServer.submitFeedback(feedbackText, userProfile?.id, userProfile?.email);
      setSubmitSuccess(true);
      setFeedbackText("");
      setTimeout(() => { setSubmitSuccess(false); setShowFeedbackModal(false); }, 2000);
    } catch (e: any) {
      alert(`Oops! Something went wrong: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="overlay md:hidden" onClick={toggleMobileMenu} />
      )}

      {showFeedbackModal && (
        <div className="modal-overlay">
          <div ref={feedbackModalRef} className="nexus-modal w-full max-w-lg p-10 relative">
            <button onClick={() => setShowFeedbackModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors border-none bg-transparent active:scale-90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            {submitSuccess ? (
              <div className="text-center py-12 space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-10 h-10"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Success!</h3>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Your feedback has been received.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-orange-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-orange-600/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-orange-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>

                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase leading-none">Feedback</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Found a bug or have a suggestion? Let us know.</p>

                <div className="relative group">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-40 p-6 rounded-[32px] bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 focus:ring-4 focus:ring-orange-600/10 text-slate-800 dark:text-slate-200 resize-none transition-all outline-none font-medium text-sm leading-relaxed shadow-inner"
                    placeholder="Tell us what's on your mind... we're all ears."
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-4 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white font-black text-xs uppercase tracking-widest border-none bg-transparent transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className="flex-[2] py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    )}
                    <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[9999] w-64 transform transition-transform duration-300 ease-in-out
        bg-white dark:bg-black border-r border-slate-200 dark:border-white/5
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static flex flex-col shadow-2xl md:shadow-none
      `}>
        <div className="p-8 border-b border-slate-200 dark:border-white/5">
          <h1 className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tighter cursor-pointer" onClick={() => setModule(ModuleType.DASHBOARD)}>
            LPU-Nexus
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-600 mt-1">Your Student Hub</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setModule(item.id);
                if (window.innerWidth < 768) toggleMobileMenu();
              }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-none text-left relative
                ${currentModule === item.id
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
          <button onClick={() => setShowFeedbackModal(true)} className="w-full text-[10px] flex items-center justify-center space-x-2 text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-slate-200 py-3 transition-all font-black uppercase tracking-[0.2em] border border-transparent hover:border-orange-500/20 hover:bg-orange-600/5 rounded-2xl bg-transparent active:scale-95 group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 transition-transform group-hover:rotate-12"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span>Feedback</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
