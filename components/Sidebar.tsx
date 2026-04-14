
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ModuleType, UserProfile } from '../types';
import NexusServer from '../services/nexusServer.ts';
import { showToast } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import FeedbackModal from './FeedbackModal.tsx';

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
  const [isHovered, setIsHovered] = useState(false);

  const { selectedUniversity, universityInfo, fullBrandName, studentTerm } = useUniversity();


  const allNavItems = [
    {
      id: ModuleType.DASHBOARD,
      label: 'Dashboard',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    },
    {
      id: ModuleType.QUIZ,
      label: 'Quiz Taker',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
    },
    {
      id: ModuleType.TOOLS,
      label: 'Tools Hub',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
    },
    {
      id: ModuleType.LIBRARY,
      label: 'Content Library',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 8h10M8 12h10" /></svg>
    },
    {
      id: ModuleType.CAMPUS,
      label: 'Campus Hub',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
    },
    {
      id: ModuleType.AI_TOOLS,
      label: 'AI Directory',
      icon: <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5"><path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z" /></svg>
    },
    {
      id: ModuleType.EMERGENCY,
      label: 'Rescue Line',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
    },
    {
      id: ModuleType.FRESHERS,
      label: "Freshmen Kit",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M9 6V4a3 3 0 0 1 6 0v2" /><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5" /></svg>
    },
    {
      id: ModuleType.SETTINGS,
      label: 'Settings',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    },
  ];

  const navItems = universityInfo 
    ? allNavItems.filter(item => {
        if (item.id === ModuleType.DASHBOARD || item.id === ModuleType.SETTINGS) return true;
        if (item.id === ModuleType.TOOLS) {
          return universityInfo.features.enabledModules.includes(ModuleType.ATTENDANCE) || 
                 universityInfo.features.enabledModules.includes(ModuleType.CGPA) || 
                 universityInfo.features.enabledModules.includes(ModuleType.PLACEMENT);
        }
        return universityInfo.features.enabledModules.includes(item.id);
      })
    : allNavItems;


  return (
    <>
      {isMobileMenuOpen && (
        <div className="overlay md:hidden" onClick={toggleMobileMenu} />
      )}

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        userProfile={userProfile} 
      />

      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[400] bg-[#0a0a0a]/20 dark:bg-[#0a0a0a]/40 md:hidden transition-opacity duration-500 animate-fade-in"
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={toggleMobileMenu}
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-[410] md:z-[40] md:sticky md:top-0 md:translate-x-0 transform flex-shrink-0 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          bg-white dark:bg-[#0a0a0a] border-r border-zinc-200 dark:border-white/5
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isHovered || isMobileMenuOpen ? 'w-64' : 'md:w-20'}
          flex flex-col shadow-2xl md:shadow-none h-full
        `}
      >

        <div className="h-24 flex items-center border-b border-zinc-200 dark:border-white/5 overflow-hidden flex-shrink-0 bg-white dark:bg-[#0a0a0a] z-[50] relative">
          <div className={`flex items-center w-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isHovered || isMobileMenuOpen ? 'pl-8' : 'pl-[22px]'}`}>
            <div className="relative w-9 h-9 flex-shrink-0">
              <img
                src={universityInfo?.logo || "/Scholix_light.png"}
                alt="Platform Logo"
                className={`w-full h-full rounded-lg transition-transform cursor-pointer object-contain ${universityInfo?.logo ? '' : 'dark:hidden'}`}
                onClick={() => setModule(ModuleType.DASHBOARD)}
              />
              {!universityInfo?.logo && (
                <img
                  src="/Scholix_dark.png"
                  alt="Platform Logo"
                  className="w-full h-full rounded-lg transition-transform cursor-pointer object-contain hidden dark:block"
                  onClick={() => setModule(ModuleType.DASHBOARD)}
                />
              )}
            </div>
            <div className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col overflow-hidden ${isHovered || isMobileMenuOpen ? 'max-w-[200px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                {fullBrandName}
              </h1>
              <p className="text-[9px] font-medium tracking-[0.2em] text-zinc-400 dark:text-zinc-600 whitespace-nowrap uppercase">
                {selectedUniversity === 'none' ? 'University Hub' : `${selectedUniversity} edition`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative group/nav">
          <nav className="h-full px-4 py-6 space-y-3 overflow-y-auto no-scrollbar overflow-x-hidden relative z-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setModule(item.id);
                  if (window.innerWidth < 768) toggleMobileMenu();
                }}
                className={`w-full h-12 flex items-center rounded-2xl border-none text-left relative group transition-all duration-300
                  ${currentModule === item.id
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-[0_8px_20px_-4px_var(--brand-glow)] scale-[1.02] z-10'
                    : 'text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }
                `}
              >
                <div className={`flex items-center w-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isHovered || isMobileMenuOpen ? 'pl-4' : 'pl-3'}`}>
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) whitespace-nowrap font-bold text-sm tracking-tight overflow-hidden ${isHovered || isMobileMenuOpen ? 'max-w-[200px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>
                    {item.label}
                  </span>
                </div>

                {!isHovered && (
                  <div className="absolute left-full ml-4 px-4 py-2 bg-zinc-950/90 dark:bg-white text-white dark:text-black text-[12px] font-bold tracking-tight rounded-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-2xl backdrop-blur-md">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>
          {/* Subtle scroll edge shadows */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent z-20 pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent z-20 pointer-events-none opacity-0 group-hover/nav:opacity-100 transition-opacity" />
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-white/5 flex-shrink-0 bg-white dark:bg-[#0a0a0a] z-[50] relative">
          <button onClick={() => setShowFeedbackModal(true)} className="w-full h-12 flex items-center rounded-2xl border border-transparent hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all bg-transparent active:scale-95 group relative">
            <div className={`flex items-center w-full transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isHovered || isMobileMenuOpen ? 'pl-4' : 'pl-3'}`}>
              <span className="flex-shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-brand-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 transition-transform group-hover:rotate-12"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </span>
              <span className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) text-sm font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-brand-primary whitespace-nowrap overflow-hidden ${isHovered || isMobileMenuOpen ? 'max-w-[200px] opacity-100 ml-4' : 'max-w-0 opacity-0 ml-0'}`}>
                Feedback
              </span>
            </div>
            {!isHovered && (
              <div className="absolute left-full ml-4 px-4 py-2 bg-zinc-950/90 dark:bg-white text-white dark:text-black text-[12px] font-bold tracking-tight rounded-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-2xl backdrop-blur-md">
                Feedback
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
