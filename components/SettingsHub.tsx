import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { UserProfile, ModuleType } from '../types.ts';

import FeedbackModal from './FeedbackModal.tsx';
import ChatSupportModal from './ChatSupportModal.tsx';
import SocialModal from './SocialModal.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';

import ProfileSection from './ProfileSection.tsx';
import HelpSection from './HelpSection.tsx';
import AboutUs from './AboutUs.tsx';
import PrivacyPolicy from './PrivacyPolicy.tsx';
import DownloadAPKModal from './DownloadAPKModal.tsx';



interface SettingsHubProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  theme: string;
  toggleTheme: () => void;
  navigateToModule?: (module: ModuleType) => void;
  setUserProfile: (p: UserProfile | null) => void;
  initialTab?: string;
  onOpenSignup?: () => void;
  authModalOpen?: boolean;
}

const getTabToRoute = (prefix: string): Record<string, string> => ({
  'profile': `${prefix}/settings/profile`,
  'privacy': `${prefix}/settings/privacy`,
  'about': `${prefix}/settings/about`,
  'help_center': `${prefix}/settings/help`,
  'theme': `${prefix}/settings/theme`,
  'settings': `${prefix}/settings/profile`
});

const SECTIONS = (userProfile: UserProfile | null) => [
  {
    title: 'Your account',
    items: [
      { 
        id: 'profile', 
        label: userProfile ? 'Edit profile' : 'Log in', 
        color: 'text-brand-primary dark:text-brand-primary', 
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> 
      },
      { id: 'university', label: 'Change University', color: 'text-emerald-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> },
    ]
  },
  {
    title: 'How you use Scholix',
    items: [
      { id: 'theme', label: 'Dark mode', color: 'text-indigo-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>, isToggle: true },
    ]
  },
  {
    title: 'Who can see your content',
    items: [
      { id: 'privacy', label: 'Privacy Policy', color: 'text-rose-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
    ]
  },
  {
    title: 'More info and support',
    items: [
      { id: 'help_center', label: 'Help Center', color: 'text-amber-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
      { id: 'chat_support', label: 'Chat Support', color: 'text-sky-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 1 1-.9-3.8 8.5 8.5 0 0 1 .9 3.8z" /><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" /></svg> },
      { id: 'download', label: 'Download Android App', color: 'text-purple-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> },
      { id: 'about', label: 'About Us', color: 'text-fuchsia-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg> },
      { id: 'social', label: 'Social Handles', color: 'text-pink-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
      { id: 'feedback', label: 'Send Feedback', color: 'text-teal-500', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    ]
  }
];

export function SettingsHub({ 
  userProfile, 
  onSignOut, 
  theme, 
  toggleTheme, 
  navigateToModule, 
  setUserProfile, 
  initialTab, 
  onOpenSignup, 
  authModalOpen 
}: SettingsHubProps) {
  const navigate = useNavigate();
  const { fullBrandName, shortBrandName, selectUniversity, uniSlug } = useUniversity();
  const [activeTab, setActiveTab] = useState<string | null>(initialTab || null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const prefix = uniSlug ? `/${uniSlug}` : '';

  useEffect(() => {
    setActiveTab(initialTab || null);
  }, [initialTab]);

  useEffect(() => {
    if (!authModalOpen && !userProfile && activeTab === 'profile') {
      setActiveTab(null);
    }
  }, [authModalOpen, userProfile, activeTab]);

  const tabToRoute = getTabToRoute(prefix);
  const sections = SECTIONS(userProfile);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        if (!userProfile) return null;
        return (
          <ProfileSection
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            navigateToModule={navigateToModule || (() => { })}
            onSignOut={onSignOut}
          />
        );
      case 'help_center':
        return <HelpSection />;
      case 'about':
        return <AboutUs userProfile={userProfile} />;
      case 'privacy':
        return <PrivacyPolicy />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-dark-950 overflow-hidden lg:pl-16">
      {/* Settings Navigation Sidebar */}
      <div className={`
        flex-shrink-0 w-full md:w-[320px] lg:w-[350px] h-full border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-dark-950 transition-all duration-300
        ${activeTab ? 'hidden md:block' : 'block'}
      `}>
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="settings-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-primary)" />
              <stop offset="100%" stopColor="var(--brand-secondary)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="py-2 px-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="pt-6 pb-4 px-5 lg:px-6">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">Settings</h1>
          </div>

          <nav className="flex-1 space-y-4 pb-20 mt-1">
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col">
                <h2 className="px-5 lg:px-6 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-[0.15em]">
                  {section.title}
                </h2>
                <div className="flex flex-col px-2.5 space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.isToggle) {
                          toggleTheme();
                        } else if (item.id === 'download') {
                          setShowDownloadModal(true);
                        } else if (item.id === 'profile' && !userProfile) {
                          if (onOpenSignup) onOpenSignup();
                          setActiveTab('profile');
                        } else if (item.id === 'university') {
                          selectUniversity('none');
                          navigate('/welcome');
                        } else if (item.id === 'chat_support') {
                          setShowChatModal(true);
                        } else if (item.id === 'social') {
                          setShowSocialModal(true);
                        } else if (item.id === 'feedback') {
                          setShowFeedbackModal(true);
                        } else if ((item as any).isExternal) {
                          window.open((item as any).href, '_blank');
                        } else {
                          const route = tabToRoute[item.id];
                          if (route) {
                            navigate(route);
                          } else {
                            setActiveTab(item.id);
                          }
                        }
                      }}
                      className={`
                        w-full flex items-center justify-between py-2.5 px-3 lg:px-4 transition-all duration-300 text-left rounded-xl
                        ${activeTab === item.id 
                          ? 'bg-zinc-100 dark:bg-white/5 shadow-sm' 
                          : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 transition-all duration-300 ${activeTab === item.id ? 'scale-110 active-icon-glow' : ''} ${item.color || 'text-zinc-500 dark:text-zinc-400'}`}>
                          {React.cloneElement(item.icon as React.ReactElement, {
                            className: `w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-all duration-300`,
                            stroke: activeTab === item.id ? 'url(#settings-icon-gradient)' : 'currentColor',
                            strokeWidth: 1.5,
                          })}
                        </div>
                        <p className={`text-sm tracking-wide transition-all duration-300 ${activeTab === item.id ? 'font-semibold bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent' : 'font-medium text-zinc-600 dark:text-zinc-400'}`}>
                          {item.label}
                        </p>
                      </div>

                      {item.isToggle ? (
                        <div
                          className={`w-[32px] h-4.5 rounded-full relative transition-all duration-300 flex items-center px-[2px] ${theme === 'dark' ? 'bg-brand-primary' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                        >
                          <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                        </div>
                      ) : (
                        <div className="w-4 h-4" /> 
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-2 px-2.5">
              <button
                onClick={onSignOut}
                className="w-full flex items-center py-2.5 px-3 lg:px-4 rounded-xl bg-transparent hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors text-left text-red-500"
              >
                <div className="flex items-center gap-3">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]">
                     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                     <polyline points="16 17 21 12 16 7" />
                     <line x1="21" y1="12" x2="9" y2="12" />
                   </svg>
                   <p className="text-sm font-medium tracking-wide">Log out</p>
                </div>
              </button>
            </div>
            
            <div className="pt-10 px-5 opacity-40">
              <p className="text-[11px] uppercase font-bold text-zinc-500 tracking-widest">{shortBrandName} for Web</p>
              <p className="text-[10px] text-zinc-500 mt-1">© 2026 Scholix</p>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`
        flex-1 h-full overflow-y-auto bg-white dark:bg-dark-950 relative
        ${!activeTab ? 'hidden md:block' : 'block'}
      `}>
        <div className={`min-h-full flex flex-col w-full px-0 sm:px-4 md:px-8 lg:px-12`}>
          {/* Mobile Header / Back Button */}
          {activeTab && (
            <div className="md:hidden sticky top-0 z-20 bg-white dark:bg-dark-950 border-b border-zinc-200 dark:border-white/10 px-4 py-3 flex items-center shrink-0">
              <button
                onClick={() => {
                   setActiveTab(null);
                   if (window.location.pathname.includes('/settings/')) {
                     navigate('/settings');
                   }
                }}
                className="p-1 -ml-1 mr-2 text-zinc-800 dark:text-white group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[26px] h-[26px] group-active:scale-95 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <h1 className="text-[17px] font-semibold text-zinc-900 dark:text-white capitalize flex-1 text-center truncate pr-8">
                 {sections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Settings'}
              </h1>
            </div>
          )}

          {/* Render content */}
          {activeTab ? (
            <div className="w-full h-full pb-20 md:pb-0 pt-4 md:pt-10 max-w-3xl mx-auto"> 
               <h2 className="hidden md:block text-xl font-semibold text-zinc-900 dark:text-white mb-6 text-center">
                 {sections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Settings'}
               </h2>
               {renderContent()}
            </div>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center opacity-60 px-6">
              <div className="w-24 h-24 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-6">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-zinc-400 dark:text-zinc-600">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                 </svg>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Settings</h2>
              <p className="text-[14px] text-zinc-500 max-w-sm">
                Select a tab from the sidebar to view or edit your account information and preferences.
              </p>
            </div>
          )}
        </div>
      </div>



      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userProfile={userProfile}
      />

      <ChatSupportModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
      />

      <SocialModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />

      <DownloadAPKModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};

export default SettingsHub;
