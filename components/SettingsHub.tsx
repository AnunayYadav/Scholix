import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserProfile, ModuleType } from '../types.ts';

import FeedbackModal from './FeedbackModal.tsx';
import ChatSupportModal from './ChatSupportModal.tsx';
import SocialModal from './SocialModal.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';

import ProfileSection from './ProfileSection.tsx';
import HelpSection from './HelpSection.tsx';
import AboutUs from './AboutUs.tsx';
import PrivacyPolicy from './PrivacyPolicy.tsx';
import SecurityHallOfFame from './SecurityHallOfFame.tsx';
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
  'security': `${prefix}/settings/security`,
  'about': `${prefix}/settings/about`,
  'help_center': `${prefix}/settings/help`,
  'theme': `${prefix}/settings/theme`,
  'settings': `${prefix}/settings/profile`
});

interface SettingItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  isToggle?: boolean;
  isExternal?: boolean;
  href?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SECTIONS = (userProfile: UserProfile | null): SettingSection[] => [
  {
    title: 'Account',
    items: [
      {
        id: 'university',
        label: 'Change University',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        )
      },
    ]
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'theme',
        label: 'Dark Mode',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ),
        isToggle: true
      },
      ...(userProfile ? [{
        id: 'merge_libraries',
        label: 'Merge Content Libraries',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M4 6h16a2 2 0 0 0 2-2V2H2v2a2 2 0 0 0 2 2z" />
          </svg>
        ),
        isToggle: true
      }] : [])
    ]
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        id: 'privacy',
        label: 'Privacy Policy',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )
      },
      {
        id: 'security',
        label: 'Security & Hall of Fame',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )
      },
    ]
  },
  {
    title: 'Support & Community',
    items: [
      {
        id: 'help_center',
        label: 'Help Center',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      },
      {
        id: 'chat_support',
        label: 'Chat Support',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 1 1-.9-3.8 8.5 8.5 0 0 1 .9 3.8z" />
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
          </svg>
        )
      },
      {
        id: 'download',
        label: 'Download Android App',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )
      },
      {
        id: 'about',
        label: 'About Scholix',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        )
      },
      {
        id: 'social',
        label: 'Social Handles',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        )
      },
      {
        id: 'feedback',
        label: 'Send Feedback',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      },
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
  const { shortBrandName, selectUniversity, uniSlug } = useUniversity();
  const [activeTab, setActiveTab] = useState<string | null>(initialTab || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [mergeLibraries, setMergeLibraries] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexus_merge_libraries') === 'true';
    }
    return false;
  });
  const prefix = uniSlug ? `/${uniSlug}` : '';

  useEffect(() => {
    setActiveTab(initialTab || null);
  }, [initialTab]);

  // On desktop, auto-select profile (or about) so right pane is immediately active and not blank
  useEffect(() => {
    if (!activeTab && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setActiveTab(userProfile ? 'profile' : 'about');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!authModalOpen && !userProfile && activeTab === 'profile') {
      setActiveTab(null);
    }
  }, [authModalOpen, userProfile, activeTab]);

  const tabToRoute = getTabToRoute(prefix);
  const sections = SECTIONS(userProfile);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase().trim();
    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.label.toLowerCase().includes(q))
      }))
      .filter(section => section.items.length > 0);
  }, [sections, searchQuery]);

  const handleItemClick = (item: SettingItem) => {
    if (item.isToggle) {
      if (item.id === 'theme') {
        toggleTheme();
      } else if (item.id === 'merge_libraries') {
        const nextVal = !mergeLibraries;
        setMergeLibraries(nextVal);
        localStorage.setItem('nexus_merge_libraries', String(nextVal));
        window.dispatchEvent(new Event('storage'));
      }
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
    } else if (item.isExternal && item.href) {
      window.open(item.href, '_blank');
    } else {
      const route = tabToRoute[item.id];
      if (route) {
        navigate(route);
      } else {
        setActiveTab(item.id);
      }
    }
  };

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
      case 'security':
        return <SecurityHallOfFame />;
      default:
        return null;
    }
  };

  const activeItemLabel = sections.flatMap(s => s.items).find(i => i.id === activeTab)?.label 
    || (activeTab === 'profile' ? 'Profile' : 'Settings');

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0c0c0e] overflow-hidden font-sans">
      {/* Settings Navigation Sidebar */}
      <div className={`
        flex-shrink-0 w-full md:w-[320px] lg:w-[350px] h-full border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] transition-all duration-300
        ${activeTab ? 'hidden md:block' : 'block'}
      `}>
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar px-3 py-4">
          {/* Header & Minimal Search */}
          <div className="px-1 pb-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Settings
            </h1>
          </div>

          {/* Minimal Search Input */}
          <div className="relative mb-3 px-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-[#141417] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-xs rounded-lg pl-7 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all border border-zinc-200/60 dark:border-zinc-800/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Compact Minimal Profile Row */}
          {!searchQuery && (
            <div
              onClick={() => {
                if (userProfile) {
                  const route = tabToRoute['profile'];
                  if (route) navigate(route);
                  else setActiveTab('profile');
                } else {
                  if (onOpenSignup) onOpenSignup();
                  setActiveTab('profile');
                }
              }}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors mb-2
                ${activeTab === 'profile'
                  ? 'bg-zinc-200/70 dark:bg-white/[0.08] text-zinc-900 dark:text-white'
                  : 'hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-700 dark:text-zinc-300'
                }
              `}
            >
              {userProfile ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center font-semibold text-xs shrink-0 overflow-hidden shadow-xs">
                    {userProfile.avatar_url && !userProfile.avatar_url.includes('dicebear') ? (
                      <img src={userProfile.avatar_url} alt={userProfile.username} className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-zinc-400 dark:text-zinc-500">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-zinc-900 dark:text-white truncate leading-tight">
                      {userProfile.username || 'Scholix Student'}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {userProfile.program || 'Student'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-orange-500 leading-tight">
                      Sign in
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      Sync profile & notes
                    </p>
                  </div>
                </>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          )}

          {/* Minimal Navigation List */}
          <nav className="flex-1 space-y-3 pb-10">
            {filteredSections.map((section) => (
              <div key={section.title} className="flex flex-col">
                <h2 className="px-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-wider">
                  {section.title}
                </h2>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`
                        w-full flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors text-left group
                        ${activeTab === item.id 
                          ? 'bg-zinc-200/70 dark:bg-white/[0.08] text-zinc-900 dark:text-white font-medium' 
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:text-zinc-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Clean Unboxed Line Icon */}
                        <div className={`shrink-0 transition-colors ${activeTab === item.id ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}>
                          {React.cloneElement(item.icon as React.ReactElement, {
                            className: "w-4 h-4 stroke-[1.8]",
                          })}
                        </div>
                        <span className="text-[13px] tracking-tight truncate">
                          {item.label}
                        </span>
                      </div>

                      {/* Right Accessory: Minimal Slim Toggle or Subtle Chevron */}
                      {item.isToggle ? (
                        <div
                          className={`w-7 h-4 rounded-full p-[2px] transition-colors duration-200 flex items-center shrink-0 ${
                            (item.id === 'theme' ? theme === 'dark' : mergeLibraries)
                              ? 'bg-orange-500'
                              : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 bg-white rounded-full shadow-xs transition-transform duration-200 ${
                              (item.id === 'theme' ? theme === 'dark' : mergeLibraries)
                                ? 'translate-x-3'
                                : 'translate-x-0'
                            }`}
                          />
                        </div>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Clean Log Out Row */}
            {userProfile && !searchQuery && (
              <div className="pt-2">
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-red-500 hover:bg-red-500/10 text-left text-[13px] font-medium transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            )}

            {/* Muted Footer */}
            <div className="pt-6 pb-2 px-2 opacity-40">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {shortBrandName} • 2026
              </p>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Detail Area */}
      <div className={`
        flex-1 h-full overflow-y-auto bg-white dark:bg-[#0c0c0e] relative
        ${!activeTab ? 'hidden md:block' : 'block'}
      `}>
        <div className="min-h-full flex flex-col w-full">
          {/* Mobile Header with Back Arrow */}
          {activeTab && (
            <div className="md:hidden sticky top-0 z-20 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-2.5 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setActiveTab(null);
                  if (window.location.pathname.includes('/settings/')) {
                    navigate('/settings');
                  }
                }}
                className="flex items-center gap-1 text-orange-500 font-medium text-[15px] active:opacity-60 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Settings</span>
              </button>
              <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white capitalize truncate text-center flex-1 pr-6">
                {activeItemLabel}
              </h2>
            </div>
          )}

          {/* Render Detail Content */}
          {activeTab ? (
            <div className="w-full flex-1 pb-20 md:pb-12 pt-4 md:pt-6 px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">
              {activeTab !== 'profile' && (
                <h2 className="hidden md:block text-xl font-bold text-zinc-900 dark:text-white mb-5 tracking-tight">
                  {activeItemLabel}
                </h2>
              )}
              {renderContent()}
            </div>
          ) : (
            /* Clean Minimal Desktop Placeholder */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center px-6 py-12 opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-zinc-400 mb-2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <p className="text-xs text-zinc-500">
                Select a section to configure
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
}

export default SettingsHub;
