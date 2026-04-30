
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import VerifiedBadge from './VerifiedBadge.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP.ts';
import { useStreak } from '../hooks/useStreak.ts';
import { useQuizDashboardStore } from '../stores/quizStore.ts';
import { getFrameConfig } from '../data/frameConfigs.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast } from './Toast.tsx';

interface ProfileSectionProps {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  navigateToModule: (m: ModuleType) => void;
  onSignOut: () => void;
}

const Section = ({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: string }) => (
  <div className="mb-8 last:mb-0">
    {title && <h3 className="px-1 text-[13px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 ml-2">{title}</h3>}
    <div className="bg-white/60 dark:bg-zinc-950/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/5 rounded-[32px] overflow-hidden px-4 py-1 shadow-sm transition-all duration-300">
      <div className="divide-y divide-zinc-100/80 dark:divide-white/5">
        {children}
      </div>
    </div>
    {footer && <p className="px-6 mt-3 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">{footer}</p>}
  </div>
);

const EditRow = ({ label, icon, children, color = "text-zinc-500", showChevron = false }: { label: string; icon: React.ReactNode; children: React.ReactNode; color?: string; showChevron?: boolean }) => (
  <div className="w-full flex items-center gap-4 py-4 px-1 bg-transparent group/row transition-all duration-200">
    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${color} bg-current/10 shrink-0 shadow-sm transition-transform group-hover/row:scale-105 duration-300`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </div>
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
      <p className="text-[14px] font-bold text-zinc-700 dark:text-zinc-200">{label}</p>
      <div className="flex-1 sm:max-w-[60%] lg:max-w-[70%] relative">
        {children}
      </div>
    </div>
    {showChevron && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700"><path d="m9 18 6-6-6-6"/></svg>
    )}
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, setUserProfile, navigateToModule, onSignOut }) => {
  const { updateUserQuizProfile } = useQuizDashboardStore();
  const { brandColor } = useUniversity();
  
  const [form, setForm] = useState({
    username: userProfile?.username || '',
    program: userProfile?.program || '',
    batch: userProfile?.batch || '',
    registration_number: userProfile?.registration_number || '',
    bio: userProfile?.bio || '',
    is_public: userProfile?.is_public || false
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Security Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [changeHistory, setChangeHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

const userId = userProfile?.id || null;
  const { totalXP, level: levelInfo } = useXP(userId);
  const frameConfig = getFrameConfig(userProfile?.avatar_frame || '');

  useEffect(() => {
    if (userProfile) {
      setForm({
        username: userProfile.username || '',
        program: userProfile.program || '',
        batch: userProfile.batch || '',
        registration_number: userProfile.registration_number || '',
        bio: userProfile.bio || '',
        is_public: userProfile.is_public || false
      });
      fetchHistory();
    }
  }, [userProfile?.id]);

  const fetchHistory = async () => {
    if (!userProfile) return;
    try {
      const records = await NexusServer.fetchRecords(userProfile.id, 'username_change');
      setChangeHistory(records);
    } catch (e) {
      console.error('Failed to fetch username history:', e);
    }
  };

  const recentChanges = useMemo(() => {
    const now = Date.now();
    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
    return changeHistory.filter(h => (now - new Date(h.created_at).getTime()) < TWO_WEEKS);
  }, [changeHistory]);

  const handleUpdate = async () => {
    if (!userProfile) return;
    setIsUpdating(true);
    try {
      if (form.username !== userProfile.username && recentChanges.length >= 2) {
        throw new Error("Username change limit reached (2/14 days).");
      }

      await NexusServer.updateProfile(userProfile.id, {
        username: form.username.trim().toLowerCase(),
        program: form.program.trim(),
        batch: form.batch.trim(),
        registration_number: form.registration_number.trim(),
        bio: form.bio.trim(),
        is_public: form.is_public
      });

      if (form.username !== userProfile.username) {
        await NexusServer.saveRecord(userProfile.id, 'username_change', `Changed to ${form.username}`, { username: form.username });
      }

      showToast("Profile settings updated successfully", "success");
      fetchHistory();
    } catch (e: any) {
      console.error('Update Error:', e);
      let errorMsg = 'Failed to update profile.';
      if (e.message?.includes('unique_registration_number') || e.code === '23505') {
        errorMsg = 'Registration Number already in use.';
      } else if (e.message) {
        errorMsg = e.message;
      }
      showToast(errorMsg, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    setIsUploading(true);
    try {
      const url = await NexusServer.uploadAvatar(userProfile.id, file);
      setUserProfile({ ...userProfile, avatar_url: url });
      showToast("Profile image updated", "success");
    } catch (err: any) {
      showToast("Upload failed: " + err.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8 pb-32 no-scrollbar relative">

      {/* Header Profile Card */}
      <header className="flex flex-col items-center mb-8 relative">
        <div className="relative group">
          <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 transition-transform duration-500 group-hover:scale-[1.02]">
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-primary/30 to-brand-secondary/30 rounded-full blur-2xl opacity-40 group-hover:opacity-60 animate-pulse transition-opacity" />
            
            {/* Frame Layer */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              {userProfile?.avatar_frame && (
                <img 
                  src={`/Nexus-Journey/${userProfile.avatar_frame}`}
                  alt="Frame"
                  className="w-full h-full object-contain"
                  style={{ 
                    transform: `scale(${frameConfig.scale || 1.4}) translateY(${frameConfig.translateY || '0%'})`,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                  }}
                />
              )}
            </div>

            {/* Avatar Image Layer */}
            <div 
              className={`relative w-full h-full rounded-full flex items-center justify-center z-10 transition-all duration-300 ${!userProfile?.avatar_frame ? 'bg-white dark:bg-zinc-800 border-[3px] border-white dark:border-zinc-800 shadow-2xl' : 'bg-white dark:bg-zinc-900 shadow-xl'}`}
              style={{ padding: userProfile?.avatar_frame ? frameConfig.padding : '2px' }}
            >
              <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-all ${userProfile?.avatar_frame ? 'ring-2 ring-white/10' : 'bg-zinc-100 dark:bg-zinc-900'}`}>
                {userProfile.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-4xl font-black text-brand-primary opacity-40">{userProfile.username?.[0]?.toUpperCase() || userProfile.email[0].toUpperCase()}</span>
                )}
              </div>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-11 h-11 bg-white dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all z-30 active:scale-90 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5.5 h-5.5 text-zinc-600 dark:text-zinc-300"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 rounded-full backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{userProfile.username || 'Student'}</h2>
            <VerifiedBadge isAdmin={userProfile.is_admin} size="w-6 h-6" />
          </div>
          <p className="text-[13px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">{userProfile.email}</p>
          <div className="pt-2 flex justify-center">
            <div className="px-5 py-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-black text-zinc-500 dark:text-zinc-400 tracking-[0.2em] uppercase shadow-sm">
              Student Identity
            </div>
          </div>
        </div>
      </header>

      {/* Settings Sections */}
      <Section title="Academic Info">
        <EditRow 
          label="Username" 
          color="text-blue-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>}
        >
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-medium">@</span>
            <input 
              type="text" 
              value={form.username} 
              onChange={(e) => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
              className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[14px] font-bold text-zinc-900 dark:text-brand-primary placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:text-brand-primary transition-colors"
              placeholder="username"
            />
          </div>
        </EditRow>
        <EditRow 
          label="Course / Program" 
          color="text-indigo-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
        >
          <input 
            type="text" 
            value={form.program} 
            onChange={(e) => setForm({...form, program: e.target.value})}
            className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[14px] font-bold text-zinc-900 dark:text-brand-primary placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors focus:text-brand-primary"
            placeholder="e.g. B.Tech Computer Science"
          />
        </EditRow>
        <EditRow 
          label="Batch" 
          color="text-amber-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        >
          <input 
            type="text" 
            value={form.batch} 
            onChange={(e) => setForm({...form, batch: e.target.value})}
            className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[14px] font-bold text-zinc-900 dark:text-brand-primary placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors focus:text-brand-primary"
            placeholder="2024-2028"
          />
        </EditRow>
        <EditRow 
          label="Registration No." 
          color="text-emerald-500"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
        >
          <input 
            type="text" 
            value={form.registration_number} 
            onChange={(e) => setForm({...form, registration_number: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})}
            className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[14px] font-bold text-zinc-900 dark:text-brand-primary placeholder:text-zinc-300 dark:placeholder:text-zinc-700 transition-colors focus:text-brand-primary"
            placeholder="12345678"
          />
        </EditRow>
      </Section>

      <Section title="About Me">
        <div className="py-2 px-1">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed min-h-[120px] resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:ring-0"
            placeholder="Tell us about yourself, your goals, or your interests..."
          />
        </div>
      </Section>

      <Section title="Privacy & Discovery" footer="When public, other students can find your profile and see your achievements.">
        <div className="w-full flex items-center justify-between py-3.5 px-1 bg-transparent group">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-500 bg-purple-500/10 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <p className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-200">Public Profile</p>
          </div>
          <button 
            onClick={() => setForm({ ...form, is_public: !form.is_public })}
            className={`relative w-12 h-6.5 rounded-full transition-all duration-300 border-none outline-none overflow-hidden ${form.is_public ? 'bg-brand-primary shadow-lg shadow-brand-primary/30' : 'bg-zinc-300 dark:bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 shadow-sm ${form.is_public ? 'left-6.5' : 'left-1'}`} />
          </button>
        </div>
      </Section>

      <Section title="Unlocked Frames">
        <div className="py-6 px-1">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
            {/* None Option */}
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                NexusServer.updateProfile(userProfile.id, { avatar_frame: '' });
                setUserProfile({ ...userProfile, avatar_frame: '' });
                updateUserQuizProfile({ avatar_frame: '' });
              }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${!userProfile?.avatar_frame ? 'border-brand-primary bg-brand-primary/5' : 'border-zinc-100 dark:border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className="w-10 h-10 rounded-full border-2 border-dotted border-zinc-200 dark:border-white/10 flex items-center justify-center text-[8px] font-bold text-zinc-300">None</div>
            </motion.div>

            {/* Unlocked */}
            {(userProfile.unlocked_frames || []).map(frame => {
              const isActive = userProfile.avatar_frame === frame;
              return (
                <motion.div 
                   key={frame}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    NexusServer.updateProfile(userProfile.id, { avatar_frame: frame });
                    setUserProfile({ ...userProfile, avatar_frame: frame });
                    updateUserQuizProfile({ avatar_frame: frame });
                  }}
                  className={`aspect-square rounded-[24px] flex items-center justify-center cursor-pointer transition-all border-2 ${isActive ? 'border-brand-primary bg-brand-primary/5' : 'border-zinc-100 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 opacity-70 hover:opacity-100'}`}
                >
                  <img src={`/Nexus-Journey/${frame}`} alt="Frame" className="w-16 h-16 object-contain" />
                </motion.div>
              );
            })}
          </div>
          
          {(!userProfile.unlocked_frames || userProfile.unlocked_frames.length === 0) && (
            <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-dashed border-zinc-200 dark:border-white/10 text-center">
              <p className="text-[11px] font-medium text-zinc-400">No frames unlocked yet. Complete quizzes to earn them!</p>
              <button 
                onClick={() => navigateToModule(ModuleType.QUIZ)}
                className="mt-2 text-[10px] font-bold text-brand-primary uppercase tracking-wider"
              >
                Go to Scholix Learning
              </button>
            </div>
          )}
        </div>
      </Section>

      <Section title="Security & Account" footer="Manage your password and account status.">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center gap-4 py-4 px-1 bg-transparent group/row transition-all duration-200 text-left border-none"
        >
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-zinc-500 bg-zinc-500/10 shrink-0 shadow-sm transition-transform group-hover/row:scale-105 duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[14px] font-bold text-zinc-700 dark:text-zinc-200">Change Password</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">Update your security credentials</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center gap-4 py-4 px-1 bg-transparent group/row transition-all duration-200 text-left border-none"
        >
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-red-500 bg-red-500/10 shrink-0 shadow-sm transition-transform group-hover/row:scale-105 duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[14px] font-bold text-red-500">Delete Account</p>
            <p className="text-[11px] text-red-500/60 font-medium">Permanently remove your account</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-red-200 dark:text-red-900"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </Section>

      <div className="mt-12 space-y-4">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-brand-primary text-white py-4 rounded-[24px] font-bold text-[15px] shadow-xl shadow-brand-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-none"
        >
          {isUpdating ? (
            <div className="w-5 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Update Profile Settings"
          )}
        </button>

      </div>

      <div className="mt-12 text-center opacity-30">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">Scholix Profile Build 3.0.0</p>
      </div>

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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-brand-primary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight leading-none">Security Settings</h3>
                <p className="text-zinc-500 text-[12px] font-medium mb-5">Update your credentials. At least 6 characters.</p>

                {modalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-red-500 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p className="text-[11px] font-bold text-red-500 leading-tight">{modalError}</p>
                  </motion.div>
                )}

                {isForgotMode ? (
                  forgotStep === 'email' ? (
                    <div className="text-center animate-fade-in">
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-6 font-medium leading-relaxed">
                        We'll send a 6-digit recovery code to your registered email <br />
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-red-500"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight leading-none">Delete Account?</h3>
                <p className="text-zinc-500 text-[12px] font-medium mb-5">This action is permanent and cannot be reversed.</p>

                {modalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-red-500 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
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

export default ProfileSection;
