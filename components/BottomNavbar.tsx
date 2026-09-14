import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, Compass, Settings } from 'lucide-react';
import { ModuleType } from '../types';
import { useUniversity } from '../hooks/useUniversity.tsx';

interface BottomNavbarProps {
  currentModule: ModuleType;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentModule }) => {
  const location = useLocation();
  const { selectedUniversity } = useUniversity();

  const getUniSlug = (id: string): string => {
    if (id === 'lpu') return 'lpu';
    if (id === 'iitm_bs') return 'iitm';
    return '';
  };

  const uniSlug = getUniSlug(selectedUniversity);
  const prefix = uniSlug ? `/${uniSlug}` : '';

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: prefix || '/',
      active: location.pathname === '/' || location.pathname === '/lpu' || location.pathname === '/iitm' || currentModule === ModuleType.DASHBOARD
    },
    {
      id: 'academics',
      label: 'Library',
      icon: BookOpen,
      path: `${prefix}/library`,
      active: location.pathname.includes('/library') || location.pathname.includes('/quiz') || currentModule === ModuleType.LIBRARY
    },
    {
      id: 'campus',
      label: 'Campus',
      icon: Compass,
      path: `${prefix}/campus`,
      active: location.pathname.includes('/campus') || location.pathname.includes('/market') || location.pathname.includes('/roommate') || currentModule === ModuleType.CAMPUS
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: `${prefix}/settings`,
      active: location.pathname.includes('/settings') || location.pathname.includes('/profile') || location.pathname.includes('/help') || location.pathname.includes('/about') || currentModule === ModuleType.SETTINGS
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full pointer-events-none">
      <nav 
        aria-label="Mobile Navigation"
        className="pointer-events-auto mx-auto w-full bg-white/80 dark:bg-[#0c0c0e]/85 backdrop-blur-2xl border-t border-zinc-200/60 dark:border-white/[0.06] pt-1.5 pb-[max(env(safe-area-inset-bottom),8px)] transition-all duration-200"
      >
        <div className="flex items-center justify-around px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.id}
                to={item.path}
                className="group flex-1 flex flex-col items-center justify-center py-1 select-none no-underline border-none bg-transparent outline-none cursor-pointer active:scale-90 transition-transform duration-150"
              >
                <div className={`relative flex items-center justify-center transition-colors duration-200 ${
                  isActive 
                    ? 'text-zinc-950 dark:text-white' 
                    : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                }`}>
                  <Icon 
                    className="w-[20px] h-[20px] transition-transform duration-200" 
                    strokeWidth={isActive ? 2.2 : 1.65} 
                  />
                </div>
                <span className={`text-[10px] tracking-tight mt-1 transition-colors duration-200 ${
                  isActive 
                    ? 'font-semibold text-zinc-950 dark:text-white' 
                    : 'font-medium text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavbar;
