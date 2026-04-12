
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';

import VerifiedBadge from './VerifiedBadge.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP.ts';
import { useStreak } from '../hooks/useStreak.ts';
import { useQuizDashboardStore, getLevelInfo } from '../stores/quizStore.ts';
import { getFrameConfig } from '../data/frameConfigs.ts';

interface ProfileSectionProps {

  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  navigateToModule: (m: ModuleType) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, setUserProfile, navigateToModule }) => {
  const { updateUserQuizProfile } = useQuizDashboardStore();
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
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [changeHistory, setChangeHistory] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = userProfile?.id || null;
  const { totalXP, level: levelInfo } = useXP(userId);
  const { currentStreak, longestStreak, streakCalendar } = useStreak(userId);
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
      fetchRecentAttempts();
    }
  }, [userProfile]);

  const fetchRecentAttempts = async () => {
    if (!userProfile) return;
    setIsLoadingAttempts(true);
    try {
      const attempts = await NexusServer.fetchUserQuizAttempts(userProfile.id);
      setRecentAttempts(attempts.slice(0, 3));
    } catch (e) {
      console.error('Failed to fetch recent attempts:', e);
    } finally {
      setIsLoadingAttempts(false);
    }
  };

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
    setMessage(null);
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

      setMessage({ text: "Profile updated.", type: 'success' });
      fetchHistory();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      console.error('Update Error:', e);
      let errorMsg = 'Failed to update profile.';

      if (e.message?.includes('unique_registration_number') || e.code === '23505') {
        errorMsg = 'This Registration Number is already in use by another student.';
      } else if (e.message) {
        errorMsg = e.message;
      }

      setMessage({ type: 'error', text: errorMsg });
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
      setMessage({ text: "Profile picture updated.", type: 'success' });
    } catch (err: any) {
      setMessage({ text: "Upload failed: " + err.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mb-8 border border-red-500/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-12 h-12 text-red-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight mb-2">Access Denied</h2>
        <p className="text-zinc-500 text-sm mb-10 max-w-xs">Authentication token missing or expired. Please sign in to manage your Nexus profile.</p>
        <button onClick={() => navigateToModule(ModuleType.DASHBOARD)} className="bg-zinc-900 dark:bg-white text-white dark:text-black px-12 py-5 rounded-[24px] font-bold text-xs tracking-wide active:scale-95 transition-all shadow-2xl border-none">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-32 px-4 relative">
      {/* Background Aesthetic Glows */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <header className="flex flex-col items-center text-center relative z-10">
        <div className="relative group">
          <div className="relative w-40 h-40 flex items-center justify-center transition-all duration-500 hover:scale-[1.02]">
            {/* Live Preview of Frame + Avatar */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              {userProfile?.avatar_frame && (
                <img 
                  src={`/Nexus-Journey/${userProfile.avatar_frame}`}
                  alt="Frame"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${frameConfig.scale}) translateY(${frameConfig.translateY || '0%'})` }}
                />
              )}
            </div>
            
            <div 
              className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5"
              style={{ padding: frameConfig.padding }}
            >
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-orange-600 text-5xl font-light">
                  {userProfile.username?.[0]?.toUpperCase() || userProfile.email[0].toUpperCase()}
                </span>
              )}
            </div>

            {/* Change Photo Overlay */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] rounded-full z-30 border-none cursor-pointer"
            >
              <div className="flex flex-col items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                <span className="text-[10px] text-white font-medium">Update Photo</span>
              </div>
            </button>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40 rounded-full backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>

        <div className="mt-8 space-y-2">
          <h2 className="text-3xl md:text-4xl font-semibold text-zinc-800 dark:text-white tracking-tight flex items-center justify-center gap-2">
            {userProfile.username || 'Anonymous User'}
            <VerifiedBadge isAdmin={userProfile.is_admin} size="w-6 h-6" />
          </h2>
          <p className="text-zinc-500 text-sm font-medium opacity-80">
            {userProfile.email}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-12 space-y-8">
          <div className="glass-panel p-8 md:p-10 rounded-[32px] border border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-100 dark:border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-white leading-tight">General Info</h3>
                <p className="text-xs text-zinc-500 font-medium">Manage your public presence</p>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-white/[0.03] p-2 pr-4 rounded-2xl border border-zinc-100 dark:border-white/5">
                <button
                  onClick={() => setForm({ ...form, is_public: !form.is_public })}
                  className={`relative w-10 h-5 rounded-full transition-all border-none outline-none ${form.is_public ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${form.is_public ? 'left-6' : 'left-1'}`} />
                </button>
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{form.is_public ? 'Public Profile' : 'Private Profile'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 ml-1 tracking-wider opacity-60">Username</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm transition-colors group-focus-within:text-orange-500">@</span>
                    <input
                      type="text" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full bg-zinc-50/50 dark:bg-white/[0.02] pl-10 pr-4 py-4 rounded-2xl text-sm font-medium border border-zinc-100 dark:border-white/5 focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/10 outline-none text-zinc-800 dark:text-white transition-all"
                      placeholder="username"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-400 font-medium ml-1">Changed {recentChanges.length}/2 times recently</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 ml-1 tracking-wider opacity-60">Program</label>
                  <input
                    type="text" value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    className="w-full bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-4 rounded-2xl text-sm font-medium border border-zinc-100 dark:border-white/5 focus:border-orange-500/30 outline-none text-zinc-800 dark:text-white transition-all"
                    placeholder="e.g. B.Tech Computer Science"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-2 ml-1 tracking-wider opacity-60">Reg. Number</label>
                    <input
                      type="text" value={form.registration_number}
                      onChange={(e) => setForm({ ...form, registration_number: e.target.value.replace(/[^0-9]/g, '').slice(0, 8) })}
                      className="w-full bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-4 rounded-2xl text-sm font-medium border border-zinc-100 dark:border-white/5 focus:border-orange-500/30 outline-none text-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-2 ml-1 tracking-wider opacity-60">Batch</label>
                    <input
                      type="text" value={form.batch}
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      className="w-full bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-4 rounded-2xl text-sm font-medium border border-zinc-100 dark:border-white/5 focus:border-orange-500/30 outline-none text-zinc-800 dark:text-white transition-all"
                      placeholder="2024-28"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-2 ml-1 tracking-wider opacity-60">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-4 rounded-2xl text-sm font-medium border border-zinc-100 dark:border-white/5 focus:border-orange-500/30 outline-none text-zinc-800 dark:text-white transition-all h-[116px] resize-none"
                    placeholder="Briefly describe yourself..."
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`mt-8 p-4 rounded-2xl text-xs font-medium text-center border animate-fade-in ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleUpdate} disabled={isUpdating}
              className="w-full mt-10 bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 border-none flex items-center justify-center gap-2"
            >
              {isUpdating && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {isUpdating ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>

          {/* ═══════════ Avatar Frame Selection ═══════════ */}
          <div className="glass-panel p-8 md:p-10 rounded-[32px] border border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-white leading-tight">Profile Frames</h3>
              <p className="text-xs text-zinc-500 font-medium">Select a frame to showcase your progress</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {/* None Option */}
              <div 
                onClick={() => {
                  if (!userProfile?.id) return;
                  NexusServer.updateProfile(userProfile.id, { avatar_frame: '' });
                  setUserProfile({ ...userProfile, avatar_frame: '' });
                  updateUserQuizProfile({ avatar_frame: '' });
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative group ${!userProfile?.avatar_frame ? 'border-orange-500 bg-orange-500/[0.03]' : 'border-zinc-100 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10'}`}
              >
                <div className="w-16 h-16 rounded-full border-2 border-dotted border-zinc-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300 dark:text-zinc-600">None</div>
                <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">Default</span>
              </div>

              {/* Unlocked Frames */}
              {(userProfile.unlocked_frames || []).map(frame => {
                const isActive = userProfile.avatar_frame === frame;
                const frameTitle = frame.replace('.png', '');
                
                return (
                  <div 
                    key={frame}
                    onClick={() => {
                      if (!userProfile?.id) return;
                      NexusServer.updateProfile(userProfile.id, { avatar_frame: frame });
                      setUserProfile({ ...userProfile, avatar_frame: frame });
                      updateUserQuizProfile({ avatar_frame: frame });
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative group ${isActive ? 'border-orange-500 bg-orange-500/[0.03]' : 'border-zinc-100 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10'}`}
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <img src={`/Nexus-Journey/${frame}`} alt={frameTitle} className="w-full h-full object-contain z-10" />
                      <div className="absolute inset-2 rounded-full bg-zinc-50 dark:bg-white/[0.02]" />
                    </div>
                    <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-orange-500' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>{frameTitle}</span>
                    {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm" />}
                  </div>
                );
              })}

              {/* Locked Hint */}
              {(!userProfile.unlocked_frames || userProfile.unlocked_frames.length === 0) && (
                <div className="col-span-full py-12 text-center bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl border border-zinc-100 dark:border-white/5">
                  <div className="mb-4 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-zinc-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <p className="text-xs font-semibold text-zinc-400">Locked Frames</p>
                    <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] mx-auto">Explore the learning journey to unlock unique profile frames</p>
                  </div>
                  <button 
                    onClick={() => navigateToModule(ModuleType.QUIZ)}
                    className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-xl transition-all active:scale-[0.98]"
                  >
                    Start Journey
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center pt-8">
        <button
          onClick={async () => { await NexusServer.signOut(); navigateToModule(ModuleType.DASHBOARD); }}
          className="group px-8 py-3 text-red-500/60 hover:text-red-500 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-red-500/10 hover:border-red-500/30 rounded-2xl bg-white/5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Log out
        </button>
        <p className="mt-8 text-[10px] font-medium text-zinc-300 dark:text-zinc-700 opacity-40 tracking-wider">Build 2.5a</p>
      </div>
    </div>
  );
};

export default ProfileSection;
