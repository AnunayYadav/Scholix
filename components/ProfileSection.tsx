import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import VerifiedBadge from './VerifiedBadge.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP.ts';
import { showToast } from './Toast.tsx';

interface ProfileSectionProps {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  navigateToModule: (m: ModuleType) => void;
  onSignOut: () => void;
}

const Section = ({ title, children, footer }: { title?: string; children: React.ReactNode; footer?: string }) => (
  <div className="mb-6 last:mb-0">
    {title && (
      <h3 className="px-1 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
    )}
    <div className="bg-zinc-50/60 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl overflow-hidden px-4 py-1 shadow-xs transition-colors">
      <div className="divide-y divide-zinc-200/50 dark:divide-white/[0.04]">
        {children}
      </div>
    </div>
    {footer && (
      <p className="px-2 mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
        {footer}
      </p>
    )}
  </div>
);

const EditRow = ({
  label,
  icon,
  children,
  showChevron = false
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  showChevron?: boolean;
}) => (
  <div className="w-full flex items-center gap-3 py-3 px-0.5 bg-transparent group/row transition-colors">
    <div className="w-5 h-5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shrink-0">
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 stroke-[1.8]" })}
    </div>
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
      <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400 shrink-0 min-w-[120px]">
        {label}
      </p>
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
    {showChevron && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0">
        <path d="m9 18 6-6-6-6" />
      </svg>
    )}
  </div>
);

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userProfile,
  setUserProfile,
  onSignOut
}) => {
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
        body: JSON.stringify({ email: userProfile.email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send code");
      setForgotStep('otp');
      setResendTimer(60);
      showToast("Verification code sent to your email", "info");
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpValue || otpValue.length < 6) {
      setModalError("Please enter a valid 6-digit code");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setModalError("New password must be at least 6 characters");
      return;
    }
    setIsUpdating(true);
    setModalError(null);
    try {
      const resetResponse = await fetch('/api/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userProfile?.email,
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

      showToast("Profile updated successfully", "success");
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

  // Filter out any leftover dicebear cartoon avatar URLs so default dummy avatar is used
  const hasCustomUploadedAvatar = Boolean(
    userProfile.avatar_url && !userProfile.avatar_url.includes('dicebear.com')
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-2 pb-24 no-scrollbar relative">
      {/* Clean Minimal Profile Header */}
      <header className="flex flex-col items-center mb-8 relative">
        <div className="relative group">
          <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-xs relative">
            {hasCustomUploadedAvatar ? (
              <img
                src={userProfile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              /* Universal clean default dummy avatar user silhouette */
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-zinc-300 dark:text-zinc-600 mt-2">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo"
            className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>

        <div className="mt-3 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              {userProfile.username || 'Student'}
            </h2>
            <VerifiedBadge isAdmin={userProfile.is_admin} size="w-4 h-4" />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {userProfile.email}
          </p>
          <div className="pt-1 flex justify-center">
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">
              Student Identity
            </span>
          </div>
        </div>
      </header>

      {/* Academic Info Section */}
      <Section title="Academic Details">
        <EditRow
          label="Username"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></svg>}
        >
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 text-xs font-medium">@</span>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[13px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:text-orange-500 transition-colors"
              placeholder="username"
            />
          </div>
        </EditRow>
        <EditRow
          label="Program"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>}
        >
          <input
            type="text"
            value={form.program}
            onChange={(e) => setForm({ ...form, program: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[13px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:text-orange-500 transition-colors"
            placeholder="e.g. B.Tech CSE"
          />
        </EditRow>
        <EditRow
          label="Batch"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
        >
          <input
            type="text"
            value={form.batch}
            onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[13px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:text-orange-500 transition-colors"
            placeholder="2024-2028"
          />
        </EditRow>
        <EditRow
          label="Registration No."
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
        >
          <input
            type="text"
            value={form.registration_number}
            onChange={(e) => setForm({ ...form, registration_number: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
            className="w-full bg-transparent border-none outline-none text-right sm:text-left text-[13px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:text-orange-500 transition-colors"
            placeholder="12345678"
          />
        </EditRow>
      </Section>

      {/* Bio / About */}
      <Section title="About Me">
        <div className="py-2.5 px-0.5">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-transparent border-none outline-none text-[13px] font-normal text-zinc-800 dark:text-zinc-200 leading-relaxed min-h-[80px] resize-none placeholder:text-zinc-400 focus:ring-0"
            placeholder="Tell other students about your interests, goals, or bio..."
          />
        </div>
      </Section>

      {/* Privacy & Discovery */}
      <Section title="Privacy" footer="When public, other students can view your profile and study progress.">
        <div className="w-full flex items-center justify-between py-2.5 px-0.5 bg-transparent">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-zinc-400 dark:text-zinc-500">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              Public Profile
            </p>
          </div>
          <button
            onClick={() => setForm({ ...form, is_public: !form.is_public })}
            className={`relative w-8 h-4.5 rounded-full transition-colors duration-200 border-none outline-none p-[2px] flex items-center cursor-pointer ${form.is_public ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
            <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 shadow-xs ${form.is_public ? 'translate-x-3.5' : 'translate-x-0'}`} />
          </button>
        </div>
      </Section>

      {/* Security & Account */}
      <Section title="Security">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full flex items-center justify-between py-2.5 px-0.5 bg-transparent text-left border-none cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
              Change Password
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-between py-2.5 px-0.5 bg-transparent text-left border-none cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <p className="text-[13px] font-medium text-red-500">
              Delete Account
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-red-400 dark:text-red-600 opacity-40 group-hover:opacity-100 transition-opacity">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </Section>

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-6 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 border-none cursor-pointer"
        >
          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Save Changes"
          )}
        </button>
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
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl p-6 overflow-hidden"
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
                  className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                  Change Password
                </h3>
                <p className="text-zinc-500 text-xs mb-4">
                  Update your security password (min 6 characters).
                </p>

                {modalError && (
                  <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                    {modalError}
                  </div>
                )}

                {isForgotMode ? (
                  forgotStep === 'email' ? (
                    <div className="text-center space-y-4">
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                        We'll send a recovery code to <br />
                        <span className="text-orange-500 font-medium">{userProfile?.email}</span>
                      </p>
                      <button
                        onClick={handleSendRecoveryOTP}
                        disabled={isUpdating}
                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-medium text-xs transition-colors hover:bg-orange-600 disabled:opacity-50 border-none cursor-pointer"
                      >
                        {isUpdating ? "Sending..." : "Send Recovery Code"}
                      </button>
                      <button
                        onClick={() => {
                          setIsForgotMode(false);
                          setModalError(null);
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="6-digit code"
                        value={otpValue}
                        maxLength={6}
                        onChange={(e) => {
                          setOtpValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                          if (modalError) setModalError(null);
                        }}
                        className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-center tracking-widest text-base font-bold text-zinc-900 dark:text-white outline-none"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (modalError) setModalError(null);
                        }}
                        className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white outline-none"
                      />
                      <button
                        onClick={handleResetPassword}
                        disabled={isUpdating}
                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 transition-colors border-none cursor-pointer"
                      >
                        {isUpdating ? "Updating..." : "Confirm New Password"}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (modalError) setModalError(null);
                      }}
                      className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white outline-none"
                    />
                    <div className="flex justify-end -mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setModalError(null);
                        }}
                        className="text-[11px] text-zinc-400 hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (modalError) setModalError(null);
                      }}
                      className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white outline-none"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowPasswordModal(false)}
                        className="flex-1 py-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white border-none bg-transparent cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!currentPassword) {
                            setModalError("Please enter current password");
                            return;
                          }
                          if (!newPassword || newPassword.length < 6) {
                            setModalError("Password must be at least 6 characters");
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
                        className="flex-1 py-2 bg-orange-500 text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors border-none cursor-pointer"
                      >
                        {isUpdating ? "Updating..." : "Update"}
                      </button>
                    </div>
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
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-red-500/20 shadow-xl p-6 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-semibold text-red-500 mb-1">
                  Delete Account
                </h3>
                <p className="text-zinc-500 text-xs mb-4">
                  This action is permanent and will remove all your data.
                </p>

                {deleteStep === 2 && (
                  <div className="mb-4">
                    <p className="text-[11px] text-zinc-500 mb-1.5 text-center">
                      Type <span className="text-red-500 font-bold">'delete my account'</span> to confirm:
                    </p>
                    <input
                      type="text"
                      placeholder="delete my account"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="w-full p-2 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-center text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteStep(1);
                      setDeleteConfirmation('');
                    }}
                    className="flex-1 py-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white border-none bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (deleteStep === 1) {
                        setDeleteStep(2);
                        return;
                      }
                      if (deleteConfirmation.toLowerCase().trim() !== 'delete my account') {
                        setModalError("Confirmation phrase does not match");
                        return;
                      }
                      if (!userProfile) return;
                      setIsUpdating(true);
                      try {
                        await NexusServer.deleteAccount(userProfile.id);
                        showToast("Account deleted", "info");
                        onSignOut();
                      } catch (e: any) {
                        setModalError(e.message || "Failed to delete account");
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium transition-colors border-none cursor-pointer"
                  >
                    {deleteStep === 1 ? "Proceed" : "Confirm Delete"}
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
