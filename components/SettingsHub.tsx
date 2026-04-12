
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import VerifiedBadge from './VerifiedBadge.tsx';
import { getFrameConfig } from '../data/frameConfigs.ts';

interface SettingsHubProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  theme: string;
  toggleTheme: () => void;
}

const SettingsHub: React.FC<SettingsHubProps> = ({ userProfile, onSignOut, theme, toggleTheme }) => {
  const navigate = useNavigate();
  const frameConfig = getFrameConfig(userProfile?.avatar_frame || '');

  const SettingItem = ({ icon, label, sublabel, onClick, rightElement, color = "text-zinc-500" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 py-3 active:bg-zinc-100 dark:active:bg-white/5 transition-colors border-none bg-transparent group text-left px-1"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-current/10 shrink-0`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        {sublabel && <p className="text-xs text-zinc-400 truncate">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-600"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </button>
  );

  const Section = ({ title, children }: any) => (
    <div className="mb-8">
      {title && <h3 className="px-1 text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 ml-1">{title}</h3>}
      <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-3xl overflow-hidden px-3 py-1 shadow-sm">
        <div className="divide-y divide-zinc-100 dark:divide-white/5">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-32 animate-fade-in no-scrollbar">
      {/* User Card */}
      {userProfile ? (
        <div 
          onClick={() => navigate('/profile')}
          className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-[32px] p-6 mb-8 flex items-center gap-5 active:scale-95 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-20 h-20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          
          <div className="relative w-16 h-16 shrink-0">
             {/* Live Preview of Frame + Avatar */}
             <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center scale-110">
              {userProfile?.avatar_frame && (
                <img 
                  src={`/Nexus-Journey/${userProfile.avatar_frame}`}
                  alt="Frame"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${frameConfig.navbarScale}) translateY(${frameConfig.translateY || '0%'})` }}
                />
              )}
            </div>
            <div className="w-full h-full rounded-full overflow-hidden bg-brand-primary/20 flex items-center justify-center p-[2px]">
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-xl font-bold text-brand-primary">{userProfile.username?.[0] || userProfile.email[0]}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0 z-10">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-white truncate">{userProfile.username || 'Student'}</h2>
              <VerifiedBadge isAdmin={userProfile.is_admin} size="w-4 h-4" />
            </div>
            <p className="text-xs text-zinc-500 font-medium truncate">{userProfile.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold tracking-wider">
              VIEW PROFILE
            </div>
          </div>
          
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      ) : (
        <div 
          onClick={() => navigate('/login')}
          className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-[32px] p-6 mb-8 flex items-center gap-5 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-zinc-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-white">Sign In</h2>
            <p className="text-xs text-zinc-500 font-medium tracking-tight">Access your saved content and tools</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-zinc-400"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      )}

      {/* Settings Sections */}
      <Section title="Account">
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          label="Profile Information"
          sublabel="Edit username, bio, and academic info"
          onClick={() => navigate('/profile')}
          color="text-blue-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          label="Privacy Policy"
          onClick={() => navigate('/privacy')}
          color="text-emerald-500"
        />
      </Section>

      <Section title="Preferences">
        <div className="w-full flex items-center gap-4 py-3 active:bg-zinc-100 dark:active:bg-white/5 transition-colors border-none bg-transparent group text-left px-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-500 bg-orange-500/10 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200">Dark Mode</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`relative w-11 h-6 rounded-full transition-all border-none outline-none ${theme === 'dark' ? 'bg-brand-primary' : 'bg-zinc-300 dark:bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
          label="Notifications"
          onClick={() => {}}
          color="text-red-500"
        />
      </Section>

      <Section title="Support & About">
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Help Center"
          onClick={() => navigate('/help')}
          color="text-purple-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          label="About Us"
          onClick={() => navigate('/about')}
          color="text-indigo-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          label="Send Feedback"
          onClick={() => {}}
          color="text-pink-500"
        />
      </Section>

      {userProfile && (
        <button
          onClick={onSignOut}
          className="w-full bg-white dark:bg-zinc-900/40 border border-red-500/20 rounded-3xl py-4 flex items-center justify-center gap-3 text-red-500 font-bold active:bg-red-50 dark:active:bg-red-500/10 transition-colors shadow-sm mb-10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </button>
      )}

      <div className="text-center opacity-30">
        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Nexus Build 2.5a • Made with ❤️</p>
      </div>
    </div>
  );
};

export default SettingsHub;
