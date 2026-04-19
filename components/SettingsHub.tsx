import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import VerifiedBadge from './VerifiedBadge.tsx';
import { getFrameConfig } from '../data/frameConfigs.ts';
import FeedbackModal from './FeedbackModal.tsx';
import ChatSupportModal from './ChatSupportModal.tsx';
import SocialModal from './SocialModal.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast } from './Toast.tsx';

interface SettingsHubProps {
  userProfile: UserProfile | null;
  onSignOut: () => void;
  theme: string;
  toggleTheme: () => void;
  navigateToModule?: (module: ModuleType) => void;
}

const SettingsHub: React.FC<SettingsHubProps> = ({ userProfile, onSignOut, theme, toggleTheme, navigateToModule }) => {
  const navigate = useNavigate();
  const { fullBrandName, selectUniversity } = useUniversity();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Resend Timer Logic
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendRecoveryOTP = async () => {
    if (!userProfile?.email) return;
    setIsUpdating(true);
    setModalError(null);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userProfile.email.toLowerCase().trim(), 
          type: 'password_reset', 
          university: userProfile?.university || 'LPU' 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to dispatch recovery code.");
      setForgotStep('otp');
      setResendTimer(60);
      showToast("Recovery code sent to your email", "success");
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    setModalError(null);
    if (otpValue.length !== 6) {
      setModalError("Enter 6-digit recovery code");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setModalError("New password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const resetResponse = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userProfile?.email.toLowerCase().trim(), 
          otp: otpValue, 
          newPassword: newPassword 
        })
      });

      const resetData = await resetResponse.json();
      if (!resetResponse.ok) throw new Error(resetData.error || "Reset failed.");
      
      setShowPasswordModal(false);
      setNewPassword('');
      setOtpValue('');
      setIsForgotMode(false);
      showToast("Password reset successfully!", "success");
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };


  
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
          onClick={() => navigateToModule?.(ModuleType.PROFILE)}

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
          onClick={() => navigateToModule?.(ModuleType.LOGIN)}

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
          onClick={() => navigateToModule?.(ModuleType.PROFILE)}

          color="text-blue-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
          label="Change University"
          sublabel={`Current: ${fullBrandName}`}
          onClick={() => {
            selectUniversity('none');
            navigate('/welcome');
          }}
          color="text-amber-500"
        />
        {userProfile && (
          <>
            <SettingItem 
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              label="Change Password"
              sublabel="Update your security credentials"
              onClick={() => setShowPasswordModal(true)}
              color="text-zinc-500"
            />
            <SettingItem 
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>}
              label="Delete Account"
              sublabel="Permanently remove your account"
              onClick={() => setShowDeleteModal(true)}
              color="text-red-500"
            />
          </>
        )}
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
      </Section>

      <Section title="Assistance & Privacy">
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Help Center"
          sublabel="FAQs, Support & Student Community"
          onClick={() => navigateToModule?.(ModuleType.HELP)}
          color="text-purple-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 1 1-.9-3.8 8.5 8.5 0 0 1 .9 3.8z"/><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>}
          label="Chat Support"
          sublabel="Instant automated assistance"
          onClick={() => setShowChatModal(true)}
          color="text-cyan-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          label="Privacy Policy"
          sublabel="Our commitment to your data security"
          onClick={() => navigateToModule?.(ModuleType.PRIVACY)}
          color="text-emerald-500"
        />
      </Section>

      <Section title="Scholix Hub">
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
          label="Download Android App"
          sublabel="Get the Scholix APK"
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/Scholix.apk';
            link.download = 'Scholix.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          color="text-green-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          label="About Us"
          sublabel="Meet the minds behind Scholix"
          onClick={() => navigateToModule?.(ModuleType.ABOUT)}
          color="text-indigo-500"
        />
        <SettingItem 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>}
          label="Social Handles"
          sublabel="Follow us on WhatsApp & Instagram"
          onClick={() => setShowSocialModal(true)}
          color="text-brand-primary"
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

      <ChatSupportModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        onOpenFeedback={() => setShowFeedbackModal(true)}
      />

      <SocialModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />

      {/* Change Password Modal */}
      {createPortal(
        <AnimatePresence>
          {showPasswordModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!isUpdating) {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setIsForgotMode(false);
                    setForgotStep('email');
                    setOtpValue('');
                    setModalError(null);
                  }
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-xl" 
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0a] rounded-[32px] border border-zinc-200 dark:border-white/10 shadow-2xl p-8 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setIsForgotMode(false);
                    setForgotStep('email');
                    setOtpValue('');
                    setModalError(null);
                  }} 
                  className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent active:scale-90 cursor-pointer outline-none"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-brand-primary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight leading-none">Security Settings</h3>
                <p className="text-zinc-500 text-[12px] font-medium mb-5">Update your credentials. At least 6 characters.</p>

                {modalError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-red-500 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-[11px] font-bold text-red-500 leading-tight">{modalError}</p>
                  </motion.div>
                )}
                
                {isForgotMode ? (
                  forgotStep === 'email' ? (
                    <div className="text-center animate-fade-in">
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-6 font-medium leading-relaxed">
                        We'll send a 6-digit recovery code to your registered email <br/>
                        <span className="text-brand-primary font-bold">{userProfile?.email}</span>
                      </p>
                      <button 
                        onClick={handleSendRecoveryOTP}
                        disabled={isUpdating}
                        className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-[13px] shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isUpdating ? "Sending Code..." : "Send Recovery Code"}
                      </button>
                      <button 
                        onClick={() => {
                          setIsForgotMode(false);
                          setModalError(null);
                        }}
                        className="mt-4 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors bg-transparent border-none"
                      >
                        Back to password login
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="text-center mb-6">
                        <p className="text-xs text-zinc-400 font-medium">
                          Enter the code sent to your email and your new password.
                        </p>
                      </div>
                      <div className="relative group">
                        <input 
                          type="text"
                          placeholder="000000"
                          value={otpValue}
                          maxLength={6}
                          onChange={(e) => {
                            setOtpValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                            if (modalError) setModalError(null);
                          }}
                          disabled={isUpdating}
                          className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center tracking-[12px] text-lg font-black text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div className="relative group">
                        <input 
                          type="password"
                          placeholder="New secure password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (modalError) setModalError(null);
                          }}
                          disabled={isUpdating}
                          className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-4 focus:ring-brand-primary/5 text-zinc-800 dark:text-zinc-200 transition-all outline-none font-medium text-sm shadow-inner"
                        />
                      </div>
                      <div className="flex flex-col gap-3 pt-2">
                        <button 
                          onClick={handleSendRecoveryOTP}
                          disabled={isUpdating || resendTimer > 0}
                          className="text-[11px] font-bold text-brand-primary hover:text-brand-primary/80 transition-colors bg-transparent border-none disabled:opacity-50"
                        >
                          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive the code? Resend"}
                        </button>
                        <button 
                          onClick={() => {
                            setForgotStep('email');
                            setModalError(null);
                          }}
                          className="text-[11px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors bg-transparent border-none"
                        >
                          Change recovery email
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="password"
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (modalError) setModalError(null);
                          }}
                          disabled={isUpdating}
                          className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-4 focus:ring-brand-primary/5 text-zinc-800 dark:text-zinc-200 transition-all outline-none font-medium text-sm shadow-inner"
                        />
                      </div>
                      <div className="flex justify-end -mt-1 mb-1">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsForgotMode(true);
                            setModalError(null);
                          }}
                          className="text-[10px] font-bold text-zinc-400 hover:text-brand-primary transition-colors bg-transparent border-none p-0 cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative group">
                        <input 
                          type="password"
                          placeholder="New secure password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (modalError) setModalError(null);
                          }}
                          disabled={isUpdating}
                          className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-4 focus:ring-brand-primary/5 text-zinc-800 dark:text-zinc-200 transition-all outline-none font-medium text-sm shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button 
                        onClick={() => {
                          setShowPasswordModal(false);
                          setCurrentPassword('');
                          setNewPassword('');
                        }}
                        disabled={isUpdating}
                        className="flex-1 py-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white font-bold text-[13px] border-none bg-transparent transition-colors cursor-pointer outline-none"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={async () => {
                          if (!currentPassword) {
                            setModalError("Please enter current password");
                            return;
                          }
                          if (!newPassword || newPassword.length < 6) {
                            setModalError("New password must be at least 6 characters");
                            return;
                          }
                          setIsUpdating(true);
                          setModalError(null);
                          try {
                            await NexusServer.updatePassword(newPassword, currentPassword);
                            setShowPasswordModal(false);
                            setNewPassword('');
                            setCurrentPassword('');
                            showToast("Password updated successfully!", "success");
                          } catch (e: any) {
                            setModalError(e.message || "Failed to update password");
                          } finally {
                            setIsUpdating(false);
                          }
                        }}
                        disabled={isUpdating}
                        className="flex-[1.5] py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-[13px] shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUpdating ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {isForgotMode && forgotStep === 'otp' && (
                  <div className="mt-6">
                    <button 
                      onClick={handleResetPassword}
                      disabled={isUpdating}
                      className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-[13px] shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Confirm New Password"
                      )}
                    </button>

                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.getElementById('modal-root') || document.body
      )}

      {/* Delete Account Modal */}
      {createPortal(
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!isUpdating) {
                    setShowDeleteModal(false);
                    setDeleteStep(1);
                    setDeleteConfirmation('');
                  }
                }}
                className="absolute inset-0 bg-black/40 backdrop-blur-xl" 
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-[#0a0a0a] rounded-[32px] border border-red-500/10 shadow-2xl p-8 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteStep(1);
                    setDeleteConfirmation('');
                  }} 
                  className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent active:scale-90 cursor-pointer outline-none"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-red-500"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight leading-none">Delete Account?</h3>
                <p className="text-zinc-500 text-[12px] font-medium mb-5">This action is permanent and cannot be reversed.</p>

                {modalError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-red-500 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-[11px] font-bold text-red-500 leading-tight">{modalError}</p>
                  </motion.div>
                )}

                <div className="bg-red-500/5 rounded-2xl p-5 mb-6 border border-red-500/10">
                  <p className="text-[12px] text-red-600 dark:text-red-400 font-medium leading-relaxed">
                    {deleteStep === 1 
                      ? "By confirming, your profile, study history, and saved data will be wiped from our servers immediately."
                      : "Final confirmation required. This action cannot be undone."}
                  </p>
                </div>

                {deleteStep === 2 && (
                  <div className="mb-6 animate-fade-in">
                    <p className="text-[10px] text-zinc-500 mb-2 font-bold text-center">Type <span className="text-red-500">'delete my account'</span> to confirm</p>
                    <input 
                      type="text"
                      placeholder="Match the phrase"
                      value={deleteConfirmation}
                      onChange={(e) => {
                        setDeleteConfirmation(e.target.value);
                        if (modalError) setModalError(null);
                      }}
                      disabled={isUpdating}
                      className="w-full p-3.5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 focus:border-red-500 text-zinc-800 dark:text-zinc-200 transition-all outline-none font-medium text-sm shadow-inner text-center"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                      setDeleteConfirmation('');
                      setModalError(null);
                    }}
                    disabled={isUpdating}
                    className="flex-1 py-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white font-bold text-[13px] border-none bg-transparent transition-colors cursor-pointer outline-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (deleteStep === 1) {
                        setDeleteStep(2);
                        setModalError(null);
                        return;
                      }

                      if (deleteConfirmation.toLowerCase().trim() !== 'delete my account') {
                        setModalError("Phrase doesn't match");
                        return;
                      }

                      if (!userProfile) return;
                      setIsUpdating(true);
                      setModalError(null);
                      try {
                        await NexusServer.deleteAccount(userProfile.id);
                        showToast("Account deleted. Farewell!", "info");
                        onSignOut();
                      } catch (e: any) {
                        setModalError(e.message || "Deletion failed");
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating || (deleteStep === 2 && deleteConfirmation.toLowerCase().trim() !== 'delete my account')}
                    className="flex-[2] py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-[13px] shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 border-none disabled:opacity-50 cursor-pointer outline-none"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                    <span>{isUpdating ? (deleteStep === 1 ? "Preparing..." : "Deleting...") : (deleteStep === 1 ? "Delete Forever" : "Confirm Deletion")}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default SettingsHub;
