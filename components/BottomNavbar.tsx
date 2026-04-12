
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModuleType } from '../types';

interface BottomNavbarProps {
  currentModule: ModuleType;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentModule }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: '/',
      active: location.pathname === '/'
    },
    {
      id: 'academics',
      label: 'Academics',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      path: '/library',
      active: location.pathname.startsWith('/library') || location.pathname.startsWith('/quiz')
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      path: '/tools',
      active: location.pathname.startsWith('/tools')
    },
    {
      id: 'campus',
      label: 'Campus',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
      path: '/campus',
      active: location.pathname.startsWith('/campus')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      path: '/settings',
      active: location.pathname.startsWith('/settings')
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pt-2">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between h-20 px-2 relative overflow-hidden">
        {/* Active Pill Indicator */}
        <div 
          className="absolute h-14 bg-brand-primary/10 rounded-[28px] transition-all duration-500 ease-out pointer-events-none"
          style={{ 
            width: `calc(${100 / navItems.length}% - 12px)`,
            left: `calc(${(navItems.findIndex(i => i.active) || 0) * (100 / navItems.length)}% + 6px)`,
            opacity: navItems.some(i => i.active) ? 1 : 0
          }}
        />

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full transition-all active:scale-90 border-none bg-transparent group relative z-10 ${item.active ? 'text-brand-primary' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          >
            <div className={`relative transition-all duration-300 ${item.active ? 'scale-110' : 'group-hover:scale-105'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${item.active ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
