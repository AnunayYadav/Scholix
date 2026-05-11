
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

  const { selectedUniversity, universityInfo, fullBrandName, shortBrandName, studentTerm } = useUniversity();


  const allNavItems = [
    {
      id: ModuleType.DASHBOARD,
      label: 'Home',
      icon: <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    },
    {
      id: ModuleType.LIBRARY,
      label: 'Content Library',
      icon: <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    },
    {
      id: ModuleType.QUIZ,
      label: 'Quizzes',
      icon: <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
    },
    {
      id: ModuleType.CAMPUS,
      label: 'Campus Hub',
      icon: <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
    },
    {
      id: ModuleType.TOOLS,
      label: 'Tools',
      icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    },
    {
      id: ModuleType.EMERGENCY,
      label: 'Rescue Line',
      icon: <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    },
    {
      id: ModuleType.SETTINGS,
      label: 'Settings',
      icon: <svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    },
  ];

  const navItems = universityInfo 
    ? allNavItems.filter(item => {
        if (
          item.id === ModuleType.DASHBOARD || 
          item.id === ModuleType.EMERGENCY ||
          item.id === ModuleType.SETTINGS
        ) return true;
        
        if (item.id === ModuleType.TOOLS) {
          return universityInfo.features.enabledModules.includes(ModuleType.ATTENDANCE) || 
                 universityInfo.features.enabledModules.includes(ModuleType.CGPA) || 
                 universityInfo.features.enabledModules.includes(ModuleType.PLACEMENT);
        }
        return universityInfo.features.enabledModules.includes(item.id);
      })
    : allNavItems;

  const isSettingsActive = [
    ModuleType.SETTINGS,
    ModuleType.PROFILE,
    ModuleType.HELP,
    ModuleType.ABOUT,
    ModuleType.PRIVACY,
  ].includes(currentModule);


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
          fixed inset-y-0 left-0 z-[410] md:translate-x-0 transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) will-change-[width]
          bg-white dark:bg-[#0a0a0a] border-r border-zinc-200 dark:border-white/10
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isHovered || isMobileMenuOpen ? 'w-64' : 'md:w-[72px]'}
          flex flex-col h-full
        `}
      >
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="sidebar-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-primary)" />
              <stop offset="100%" stopColor="var(--brand-secondary)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="h-20 flex items-center overflow-hidden flex-shrink-0 z-[50] relative">
          <div className="flex items-center w-full h-full">
            <div className="w-[72px] flex-shrink-0 flex items-center justify-center">
              <div className="relative w-8 h-8">
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
            </div>
            <div className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col overflow-hidden ${isHovered || isMobileMenuOpen ? 'max-w-[200px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}>
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-tighter whitespace-nowrap">
                {shortBrandName}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative group/nav">
          <nav className="h-full px-3 py-4 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden relative z-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setModule(item.id);
                  if (window.innerWidth < 768) toggleMobileMenu();
                }}
                className={`w-full h-12 flex items-center rounded-xl border-none text-left relative group transition-all duration-200
                  ${(currentModule === item.id || (item.id === ModuleType.SETTINGS && isSettingsActive && currentModule !== ModuleType.PROFILE))
                    ? 'text-zinc-950 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-zinc-200'
                  }
                `}
              >
                <div className="flex items-center w-full h-full text-zinc-900/90 dark:text-zinc-100/90">
                  <div className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex-shrink-0 flex items-center justify-center ${isHovered || isMobileMenuOpen ? 'w-12' : 'w-12'}`}>
                    <span className={`flex-shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${(currentModule === item.id || (item.id === ModuleType.SETTINGS && isSettingsActive && currentModule !== ModuleType.PROFILE)) ? 'scale-110 active-icon-glow' : ''}`}>
                      {React.cloneElement(item.icon as React.ReactElement, { 
                        className: `w-5 h-5 sm:w-[22px] sm:h-[22px] transition-all duration-300 ${(currentModule === item.id || (item.id === ModuleType.SETTINGS && isSettingsActive && currentModule !== ModuleType.PROFILE)) ? '' : 'text-zinc-500 dark:text-zinc-400'}`,
                        children: React.Children.map((item.icon as React.ReactElement).props.children, (child: any, idx: number) => {
                          if (!React.isValidElement(child)) return child;
                          const isActive = currentModule === item.id || (item.id === ModuleType.SETTINGS && isSettingsActive && currentModule !== ModuleType.PROFILE);
                          return React.cloneElement(child as React.ReactElement, {
                            fill: (idx === 0 && isActive) ? 'url(#sidebar-icon-gradient)' : 'none',
                            fillOpacity: (idx === 0 && isActive) ? 0.2 : 0,
                            stroke: isActive ? 'url(#sidebar-icon-gradient)' : 'currentColor',
                            strokeWidth: 1.5, // Thinner strokes
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                          });
                        })
                      })}
                    </span>
                  </div>
                  <span className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) whitespace-nowrap text-sm tracking-wide overflow-hidden ${isHovered || isMobileMenuOpen ? 'max-w-[200px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'} ${(currentModule === item.id || (item.id === ModuleType.SETTINGS && isSettingsActive && currentModule !== ModuleType.PROFILE)) ? 'font-semibold bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>

                {!isHovered && !isMobileMenuOpen && (
                  <div className="fixed left-20 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[11px] font-semibold tracking-wide rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>


        <div className="p-3 bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-white/10 z-[50] relative">
          <button
            onClick={() => {
              setModule(ModuleType.PROFILE);
              if (window.innerWidth < 768) toggleMobileMenu();
            }}
            className={`w-full h-14 flex items-center rounded-2xl border-none text-left relative group transition-all duration-300
              ${currentModule === ModuleType.PROFILE
                ? 'bg-zinc-50 dark:bg-white/[0.03]'
                : 'hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
              }
            `}
          >
            <div className="flex items-center w-full h-full">
              <div className="w-12 flex-shrink-0 flex items-center justify-center">
                <div className="relative">
                  <div className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-300 ${currentModule === ModuleType.PROFILE ? 'border-brand-primary scale-105' : 'border-zinc-200 dark:border-white/10 group-hover:border-brand-primary/50'}`}>
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center text-brand-primary font-bold text-sm">
                        {userProfile?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {userProfile?.is_verified === 'yes' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-[#0a0a0a] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    </div>
                  )}
                </div>
              </div>
              <div className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col overflow-hidden ${isHovered || isMobileMenuOpen ? 'max-w-[200px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'}`}>
                <span className={`text-sm font-semibold tracking-tight truncate ${currentModule === ModuleType.PROFILE ? 'text-zinc-950 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                  {userProfile?.username || 'Guest User'}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-500 font-medium truncate">
                  Level {userProfile?.level || 1} • {userProfile?.level_title || 'Novice'}
                </span>
              </div>
              
              {(isHovered || isMobileMenuOpen) && (
                <div className="ml-auto mr-2">
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 transition-all duration-300 ${currentModule === ModuleType.PROFILE ? 'text-brand-primary' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                    <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            {!isHovered && !isMobileMenuOpen && (
              <div className="fixed left-20 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[11px] font-semibold tracking-wide rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                Profile
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
