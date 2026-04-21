
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModuleType } from '../types';
import { useUniversity } from '../hooks/useUniversity.tsx';

interface BottomNavbarProps {
  currentModule: ModuleType;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ currentModule }) => {
  const navigate = useNavigate();
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
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22v-8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v8z"
          />
        </svg>
      ),
      path: prefix || '/',
      active: location.pathname === '/' || location.pathname === '/lpu' || location.pathname === '/iitm'
    },
    {
      id: 'academics',
      label: 'Library',
      icon: (active: boolean) => (
        <svg viewBox="0 0 16 16" fill="currentColor" stroke="none" className="w-5 h-5">
          <path d="M5 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2h1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3a2 2 0 0 1-2-2h8a2 2 0 0 1 2 2v9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1H3a2 2 0 0 1 2-2" />
          <path d="M1 6v-.5a.5.5 0 0 1 1 0V6h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V9h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 2.5v.5H.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H2v-.5a.5.5 0 0 0-1 0" />
        </svg>
      ),
      path: `${prefix}/library`,
      active: location.pathname.includes('/library') || location.pathname.includes('/quiz')
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: (active: boolean) => (
        <svg viewBox="0 0 16 16" fill="currentColor" stroke="none" className="w-5 h-5">
          <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.27 3.27a.997.997 0 0 0 1.414 0l1.586-1.586a.997.997 0 0 0 0-1.414l-3.27-3.27a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.68-2.643A3.005 3.005 0 0 0 16 3q0-.405-.102-.777l-2.14 2.141L12 4l-.364-1.757L13.777.102a3 3 0 0 0-3.675 3.68L7.462 6.46 4.793 3.793a1 1 0 0 1-.293-.707v-.071a1 1 0 0 0-.419-.814zm9.646 10.646a.5.5 0 0 1 .708 0l2.914 2.915a.5.5 0 0 1-.707.707l-2.915-2.914a.5.5 0 0 1 0-.708M3 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z" />
        </svg>
      ),
      path: `${prefix}/tools`,
      active: location.pathname.includes('/tools') || location.pathname.includes('/cgpa') || location.pathname.includes('/attendance')
    },
    {
      id: 'campus',
      label: 'Campus',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5">
          {/* Panel 1 (Left) */}
          <path
            d="M1 6L8 2V18L1 22V6Z"
            fill={active ? "currentColor" : "none"}
            stroke={active ? "none" : "currentColor"}
            strokeWidth={active ? "0" : "2"}
            style={{ opacity: active ? 0.9 : 1 }}
          />
          {/* Panel 2 (Middle) */}
          <path
            d="M8 2L16 6V22L8 18V2Z"
            fill={active ? "currentColor" : "none"}
            stroke={active ? "none" : "currentColor"}
            strokeWidth={active ? "0" : "2"}
            style={{ opacity: active ? 1 : 1 }}
          />
          {/* Panel 3 (Right) */}
          <path
            d="M16 6L23 2V18L16 22V6Z"
            fill={active ? "currentColor" : "none"}
            stroke={active ? "none" : "currentColor"}
            strokeWidth={active ? "0" : "2"}
            style={{ opacity: active ? 0.9 : 1 }}
          />
        </svg>
      ),
      path: `${prefix}/campus`,
      active: location.pathname.includes('/campus') || location.pathname.includes('/marketplace') || location.pathname.includes('/roommate')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
          />
        </svg>
      ),
      path: `${prefix}/settings`,
      active: location.pathname.includes('/settings') || location.pathname.includes('/profile') || location.pathname.includes('/help') || location.pathname.includes('/about')
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] w-full">
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="bottom-nav-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary)" />
            <stop offset="100%" stopColor="var(--brand-secondary)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-3xl border-t border-zinc-200/50 dark:border-white/10 rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] flex items-center h-[80px] px-4 relative overflow-hidden pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex-1 flex flex-col items-center justify-center transition-all duration-300 border-none bg-transparent relative h-full group outline-none"
          >
            {/* Top Indicator Pill */}
            <div className={`absolute top-0 w-12 h-1.5 rounded-b-[6px] bg-brand-primary transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform ${item.active ? 'translate-y-0 opacity-100 scale-x-100' : '-translate-y-full opacity-0 scale-x-50'
              }`} />

            <div className={`flex flex-col items-center justify-center transition-all duration-300 ${item.active ? 'scale-105' : 'scale-100 active:scale-95'}`}>
              <div className={`${item.active ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.2)]' : 'text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400'}`}>
                {(() => {
                  const icon = item.icon(item.active);
                  if (!item.active) return icon;
                  
                  return React.cloneElement(icon as React.ReactElement, {
                    // Inject gradient to the SVG results
                    children: React.Children.map((icon as React.ReactElement).props.children, (child: any) => {
                      if (!React.isValidElement(child)) return child;
                      const props = child.props as any;
                      const isFillCurrent = props.fill === 'currentColor';
                      const isStrokeCurrent = props.stroke === 'currentColor';
                      
                      if (!isFillCurrent && !isStrokeCurrent) return child;
                      
                      return React.cloneElement(child as React.ReactElement, {
                        fill: isFillCurrent ? 'url(#bottom-nav-gradient)' : props.fill,
                        stroke: isStrokeCurrent ? 'url(#bottom-nav-gradient)' : props.stroke,
                      });
                    }),
                    fill: (icon as React.ReactElement).props.fill === 'currentColor' ? 'url(#bottom-nav-gradient)' : (icon as React.ReactElement).props.fill,
                    stroke: (icon as React.ReactElement).props.stroke === 'currentColor' ? 'url(#bottom-nav-gradient)' : (icon as React.ReactElement).props.stroke,
                  } as any);
                })()}
              </div>
              <span className={`text-[10px] font-bold mt-1.5 transition-all duration-300 ${item.active ? 'bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent' : 'text-zinc-400 dark:text-zinc-600'}`}>
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
