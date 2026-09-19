import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, Shield, GraduationCap, LayoutGrid, PhoneCall, 
  Compass, Settings, LogOut, ChevronRight, Edit2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  onOpenAuth: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  setModule,
  isMobileMenuOpen,
  toggleMobileMenu,
  userProfile,
  onOpenAuth,
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { universityInfo, shortBrandName, uniSlug } = useUniversity();

  const getPathFromModule = (module: ModuleType, slug: string): string => {
    const prefix = slug && slug !== 'none' ? `/${slug}` : '';

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
      case ModuleType.DASHBOARD: return prefix || '/';
      case ModuleType.SHARE_CGPA: return `/share-cgpa`;
      case ModuleType.MARKETPLACE: return `${prefix}/campus/market`;
      case ModuleType.ROOMMATE: return `${prefix}/campus/roommate`;
      case ModuleType.EMERGENCY: return `${prefix}/emergency`;
      case ModuleType.DEGREE_GUIDE: return `${prefix}/degree-guide`;
      case ModuleType.TOOLS: return `${prefix}/tools`;
      case ModuleType.ADMIN_STATS: return `${prefix}/admin-stats`;
      case ModuleType.PRIVACY: return `${prefix}/settings/privacy`;
      case ModuleType.LOGIN: return `${prefix}/login`;
      case ModuleType.SIGNUP: return `${prefix}/signup`;
      case ModuleType.SETTINGS: return `${prefix}/settings`;
      default: return prefix || '/';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await NexusServer.signOut();
      window.location.reload();
    } catch (error) {
      showToast("Logout failed", "error");
    }
  };

  const primaryItems = [
    {
      id: ModuleType.DASHBOARD,
      label: 'Home',
      icon: <Home className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
    {
      id: ModuleType.LIBRARY,
      label: 'Content Library',
      icon: <BookOpen className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
    {
      id: ModuleType.QUIZ,
      label: 'Quizzes',
      icon: <Shield className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
    {
      id: ModuleType.CAMPUS,
      label: 'Campus Hub',
      icon: <GraduationCap className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
    {
      id: ModuleType.TOOLS,
      label: 'Tools',
      icon: <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
  ];

  const secondaryItems = [
    {
      id: ModuleType.EMERGENCY,
      label: 'Rescue Line',
      icon: <PhoneCall className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
    {
      id: ModuleType.DEGREE_GUIDE,
      label: 'Degree Guide',
      icon: <Compass className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
    {
      id: ModuleType.SETTINGS,
      label: 'Settings',
      icon: <Settings className="w-[18px] h-[18px]" strokeWidth={1.65} />,
    },
  ];

  const filterModule = (item: { id: ModuleType; label: string; icon: React.ReactNode }) => {
    if (!universityInfo) return true;
    if (item.id === ModuleType.DASHBOARD || item.id === ModuleType.SETTINGS) return true;
    if (item.id === ModuleType.TOOLS) {
      return (
        universityInfo.features.enabledModules.includes(ModuleType.ATTENDANCE) ||
        universityInfo.features.enabledModules.includes(ModuleType.CGPA) ||
        universityInfo.features.enabledModules.includes(ModuleType.PLACEMENT)
      );
    }
    return universityInfo.features.enabledModules.includes(item.id);
  };

  const filteredPrimary = primaryItems.filter(filterModule);
  const filteredSecondary = secondaryItems.filter(filterModule);

  const isSettingsActive = [
    ModuleType.SETTINGS,
    ModuleType.PROFILE,
    ModuleType.HELP,
    ModuleType.ABOUT,
    ModuleType.PRIVACY,
  ].includes(currentModule);

  const isExpanded = isHovered || isMobileMenuOpen;

  const renderNavItem = (item: { id: ModuleType; label: string; icon: React.ReactNode }) => {
    const isActive = currentModule === item.id || (item.id === ModuleType.SETTINGS && isSettingsActive && currentModule !== ModuleType.PROFILE);

    return (
      <Link
        key={item.id}
        to={getPathFromModule(item.id, uniSlug)}
        onClick={() => {
          setModule(item.id);
          if (window.innerWidth < 768) toggleMobileMenu();
        }}
        className={`w-full h-10 flex items-center rounded-2xl transition-colors duration-150 relative group cursor-pointer border-none no-underline ${
          isActive
            ? 'bg-zinc-100 dark:bg-[#1c1c20] text-zinc-900 dark:text-white font-medium'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-[#17171a]'
        }`}
      >
        {/* Icon container: exactly 40px wide, centered inside the 40px rail slot */}
        <div className={`w-10 h-10 shrink-0 flex items-center justify-center transition-colors duration-150 ${
          isActive 
            ? 'text-zinc-900 dark:text-white' 
            : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
        }`}>
          {item.icon}
        </div>

        {/* Text on right: reveals cleanly on expansion */}
        <span className={`text-[13.5px] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-200 ease-out ${
          isExpanded ? 'max-w-[145px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0 pointer-events-none'
        }`}>
          {item.label}
        </span>

        {/* Tooltip when collapsed */}
        <div className={`fixed left-[68px] px-2.5 py-1 bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-zinc-700/30 dark:border-zinc-800 text-white text-[11.5px] font-medium rounded-lg opacity-0 translate-x-1 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl ${
          !isExpanded ? 'group-hover:opacity-100 group-hover:translate-x-0' : 'hidden'
        }`}>
          {item.label}
        </div>
      </Link>
    );
  };

  return (
    <>

      {/* Main navigation rail - unified backdrop blur and surface */}
      <div 
        className={`hidden md:block fixed inset-y-0 left-0 z-[400] transition-opacity duration-200 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userProfile={userProfile}
      />

      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-md md:hidden transition-opacity duration-300"
          onClick={toggleMobileMenu}
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-[410] md:translate-x-0 transform transition-[width] duration-200 ease-out
          bg-white dark:bg-[#0c0c0e] border-r border-zinc-200/80 dark:border-zinc-800/80
          ${isMobileMenuOpen ? 'translate-x-0 w-56' : '-translate-x-full md:translate-x-0'}
          ${isExpanded ? 'w-56 shadow-2xl md:shadow-none' : 'md:w-[60px]'}
          flex flex-col h-full select-none overflow-hidden
        `}
      >
        {/* Brand Header */}
        <div 
          className="h-14 px-2.5 flex items-center cursor-pointer select-none flex-shrink-0"
          onClick={() => setModule(ModuleType.DASHBOARD)}
        >
          <div className="w-full h-10 flex items-center rounded-2xl">
            {/* Logo container: exactly 40px wide, identical to nav item icon slots */}
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <img
                src={universityInfo?.logo || "/Scholix_dark.webp"}
                alt="Scholix Logo"
                className="w-7 h-7 object-contain dark:brightness-110"
              />
            </div>
            {/* Brand Text on Right: reveals cleanly on expansion */}
            <div className={`overflow-hidden transition-all duration-200 ease-out flex items-center ${
              isExpanded ? 'max-w-[145px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0 pointer-events-none'
            }`}>
              <span className="text-[14.5px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight whitespace-nowrap">
                Scholix
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto no-scrollbar">
          <nav className="space-y-1">
            {filteredPrimary.map(renderNavItem)}

            {filteredSecondary.length > 0 && (
              <>
                <div className="my-2.5 mx-1">
                  <div className="h-px bg-zinc-200/70 dark:bg-zinc-800/80" />
                </div>
                {filteredSecondary.map(renderNavItem)}
              </>
            )}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-2.5 border-t border-zinc-200/70 dark:border-zinc-800/80 relative">
          <button
            ref={buttonRef}
            onClick={() => {
              if (!userProfile) {
                onOpenAuth();
                if (window.innerWidth < 768) toggleMobileMenu();
                return;
              }
              if (isExpanded) {
                setShowProfileMenu(!showProfileMenu);
              } else {
                setModule(ModuleType.PROFILE);
                if (window.innerWidth < 768) toggleMobileMenu();
              }
            }}
            className={`w-full h-10 flex items-center rounded-2xl transition-colors cursor-pointer border-none relative group ${
              currentModule === ModuleType.PROFILE || showProfileMenu
                ? 'bg-zinc-100 dark:bg-[#1c1c20]'
                : 'bg-transparent hover:bg-zinc-100/70 dark:hover:bg-[#17171a]'
            }`}
          >
            {/* Avatar container: exactly 40px wide, identical to icon slots */}
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-medium text-[10px]">
                    {userProfile?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* User Details on Right */}
            <div className={`flex-1 flex flex-col text-left min-w-0 overflow-hidden transition-all duration-200 ease-out ${
              isExpanded ? 'max-w-[110px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0 pointer-events-none'
            }`}>
              <span className="text-[12.5px] font-medium text-zinc-900 dark:text-zinc-200 truncate">
                {userProfile?.username || 'Guest User'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                Level {userProfile?.level || 1} • {userProfile?.level_title || 'Novice'}
              </span>
            </div>

            {/* Chevron */}
            <div className={`shrink-0 overflow-hidden transition-all duration-200 ease-out ${
              isExpanded ? 'max-w-[20px] opacity-100 ml-auto mr-1.5' : 'max-w-0 opacity-0 pointer-events-none'
            }`}>
              <ChevronRight size={14} className={`transition-transform duration-200 text-zinc-400 ${showProfileMenu ? 'rotate-90' : ''}`} />
            </div>

            {/* Floating tooltip when collapsed */}
            <div className={`fixed left-[68px] px-2.5 py-1 bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-md border border-zinc-700/30 dark:border-white/10 text-white text-[11.5px] font-medium rounded-lg opacity-0 translate-x-1 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl ${
              !isExpanded ? 'group-hover:opacity-100 group-hover:translate-x-0' : 'hidden'
            }`}>
              Profile
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isExpanded && showProfileMenu && (
            <div 
              ref={menuRef}
              className="absolute bottom-full left-2 right-2 mb-2 p-1.5 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/[0.08] rounded-2xl shadow-2xl animate-fade-in z-[60] space-y-0.5"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModule(ModuleType.PROFILE);
                  setShowProfileMenu(false);
                  if (window.innerWidth < 768) toggleMobileMenu();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 transition-colors border-none bg-transparent cursor-pointer"
              >
                <span className="text-[13px] font-medium">Edit Profile</span>
                <Edit2 size={14} className="text-zinc-400" />
              </button>

              {userProfile?.is_admin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModule(ModuleType.ADMIN_STATS);
                    setShowProfileMenu(false);
                    if (window.innerWidth < 768) toggleMobileMenu();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <span className="text-[13px] font-medium">Admin View</span>
                  <Shield size={14} className="text-amber-500" />
                </button>
              )}

              <div className="h-px bg-zinc-200/70 dark:bg-white/[0.06] my-1 mx-1" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors border-none bg-transparent cursor-pointer"
              >
                <span className="text-[13px] font-medium">Logout</span>
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
