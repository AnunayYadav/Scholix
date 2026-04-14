import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import VerifiedBadge from './VerifiedBadge.tsx';
import { getFrameConfig } from '../data/frameConfigs.ts';
import FeedbackModal from './FeedbackModal.tsx';

interface SettingsHubProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  theme: string;
  toggleTheme: () => void;
  navigateToModule?: (module: ModuleType) => void;
}

const SettingsHub: React.FC<SettingsHubProps> = ({ userProfile, onSignOut, theme, toggleTheme, navigateToModule }) => {
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const frameConfig = getFrameConfig(userProfile?.avatar_frame || '');


  const SettingItem = ({ icon, label, sublabel, onClick, rightElement, color = "text-zinc-500" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 py-3.5 active:bg-zinc-100 dark:active:bg-white/5 md:hover:bg-zinc-50 md:dark:hover:bg-white/[0.02] transition-all border-none bg-transparent group text-left px-3 rounded-2xl"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-current/10 shrink-0 transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-brand-primary transition-colors">{label}</p>
        {sublabel && <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        {rightElement}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-brand-primary"><path d="m9 18 6-6-6-6"/></svg>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:hidden"><path d="m9 18 6-6-6-6"/></svg>
      </div>
    </button>
  );

  const Section = ({ title, children }: any) => (
    <div className="mb-8">
      {title && <h3 className="px-1 text-[13px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 ml-1">{title}</h3>}
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
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/profile')}
          className="relative group p-1 mb-10"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-[36px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[32px] overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex items-center gap-6 p-6 md:p-8">
              <div className="relative w-20 h-20 shrink-0">
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-full blur-md opacity-30 animate-pulse" />
                
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
                <div className="relative w-full h-full rounded-full overflow-hidden bg-brand-primary/10 flex items-center justify-center p-[2px] z-10 border-2 border-white dark:border-zinc-800 shadow-xl">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl font-bold text-brand-primary">{userProfile.username?.[0] || userProfile.email[0]}</span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                    {userProfile.username || 'Student'}
                  </h2>
                  <VerifiedBadge isAdmin={userProfile.is_admin} size="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-semibold tracking-tight truncate border-b border-zinc-100 dark:border-white/5 pb-2 mb-3 inline-block">
                  {userProfile.email}
                </p>
                
                <div className="flex items-center">
                  <div className="px-4 py-1.5 rounded-full bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-brand-primary/30 flex items-center gap-2">
                    Profile Dashboard
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div 
          onClick={() => navigate('/login')}
          className="bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-white/10 rounded-[32px] p-8 mb-10 flex flex-col items-center text-center gap-4 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 scale-110">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Join Scholix</h2>
            <p className="text-xs text-zinc-500 font-medium px-4">Sign in to sync your academic data and access premium university tools.</p>
          </div>
          <div className="px-8 py-2.5 rounded-2xl bg-brand-primary text-white text-[11px] font-bold tracking-[0.2em] uppercase shadow-xl shadow-brand-primary/20 mt-2">
            SIGN IN NOW
          </div>
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
          onClick={() => navigateToModule ? navigateToModule(ModuleType.PRIVACY) : navigate('/privacy')}
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
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Help Center"
          sublabel="FAQs, Support & Student Community"
          onClick={() => navigateToModule ? navigateToModule(ModuleType.HELP) : navigate('/help')}
          color="text-purple-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          label="About Us"
          sublabel="Meet the minds behind Scholix"
          onClick={() => navigateToModule ? navigateToModule(ModuleType.ABOUT) : navigate('/about')}
          color="text-indigo-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          label="Send Feedback"
          sublabel="Help us improve your experience"
          onClick={() => setShowFeedbackModal(true)}
          color="text-pink-500"
        />
      </Section>

      {userProfile && (
        <button
          onClick={onSignOut}
          className="w-full bg-white dark:bg-zinc-900/40 border border-red-500/20 rounded-3xl py-4 flex items-center justify-center gap-3 text-red-500 font-semibold active:bg-red-50 dark:active:bg-red-500/10 transition-colors shadow-sm mb-10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </button>
      )}

      <div className="text-center opacity-30">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">Scholix Build 3.0.0 • Made with ❤️</p>
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        userProfile={userProfile} 
      />
    </div>
  );
};

export default SettingsHub;
