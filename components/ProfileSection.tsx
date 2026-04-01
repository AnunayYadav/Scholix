
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';

import VerifiedBadge from './VerifiedBadge.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useXP } from '../hooks/useXP.ts';
import { useStreak } from '../hooks/useStreak.ts';
import { getLevelInfo, useQuizDashboardStore } from '../stores/quizStore.ts';

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
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-xs">Authentication token missing or expired. Please sign in to manage your Nexus profile.</p>
        <button onClick={() => navigateToModule(ModuleType.DASHBOARD)} className="bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-5 rounded-[24px] font-bold text-xs tracking-wide active:scale-95 transition-all shadow-2xl border-none">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-32 px-4 relative">
      {/* Background Aesthetic Glows */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <header className="flex flex-col items-center text-center relative z-10">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group cursor-pointer"
        >
          <div className={`w-32 h-32 transition-all duration-700 group-hover:scale-105 active:scale-95 relative ${!userProfile?.avatar_frame ? 'rounded-full bg-gradient-to-tr from-orange-600 to-red-600 p-[2.5px] shadow-[0_20px_40px_rgba(234,88,12,0.2)]' : 'rounded-full'}`}>
            {userProfile?.avatar_frame && (
              <img 
                src={`/Nexus-Journey/${userProfile.avatar_frame}`}
                alt="Avatar Frame"
                className="absolute w-[180%] h-[180%] z-20 pointer-events-none object-contain max-w-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            )}
            <div className={`w-full h-full transition-all duration-500 ${userProfile.avatar_frame ? 'rounded-[35%] p-0' : 'rounded-full bg-white dark:bg-[#0a0a0a] p-[1.5px]'}`}>
              <div className={`w-full h-full bg-slate-50 dark:bg-[#0a0a0a] transition-all duration-500 ${userProfile.avatar_frame ? 'rounded-[35%]' : 'rounded-full'} flex items-center justify-center overflow-hidden relative`}>
                {userProfile.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <span className="text-orange-600 text-4xl font-black transition-all duration-500 group-hover:scale-110">
                    {userProfile.username?.[0]?.toUpperCase() || userProfile.email[0].toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-8 h-8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
    </div>

        <div className="mt-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white tracking-tight leading-none mb-3 drop-shadow-sm flex items-center justify-center gap-3">
            {userProfile.username || 'Citizen Verto'}
            <VerifiedBadge isAdmin={userProfile.is_admin} size="w-7 h-7 md:w-9 md:h-9" />
          </h2>

          <div className="flex flex-col items-center">
            <p className="text-slate-500 text-[9px] font-bold opacity-50 flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Nexus Protocol ID: <span className="text-slate-700 dark:text-slate-300">{userProfile.email}</span>
            </p>
            <p className="text-slate-400 text-[9px] font-bold opacity-40 mt-1">Since {new Date(userProfile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </header>


      <div className="w-full pt-8">
        <div className="relative group/panel">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-[48px] blur-3xl opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700" />
          <div className="glass-panel p-10 rounded-[48px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0a]/80 shadow-[0_32px_128px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)] relative z-10 space-y-10 overflow-hidden backdrop-blur-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div>
                  <h3 className="text-[11px] sm:text-xs font-semibold text-orange-600 mb-1 leading-none">Security Core</h3>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 opacity-60 leading-none">Profile Visibility Control</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs font-medium text-slate-400 mr-2">{form.is_public ? 'Public' : 'Secure'}</span>
                <button
                  onClick={() => setForm({ ...form, is_public: !form.is_public })}
                  className={`relative w-14 h-7 rounded-full transition-all border-none outline-none ${form.is_public ? 'bg-orange-600' : 'bg-slate-200 dark:bg-white/5 shadow-inner'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xl ${form.is_public ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Verto Alias</label>
                  <div className="relative group/input">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-600 font-bold tracking-tight text-lg transition-transform group-focus-within/input:scale-125">@</span>
                    <input
                      type="text" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                      placeholder="alias_verto"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between ml-1">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2].map(i => (
                          <div key={i} className={`w-3 h-1 rounded-full ${i <= recentChanges.length ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-600/20'}`} />
                        ))}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 font-bold tracking-wide">Rate Limit {recentChanges.length}/2</p>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 dark:text-slate-600 font-bold opacity-60">14-DAY ROTATION</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Academic Program</label>
                  <div className="relative group/input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-orange-600 transition-colors"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    <input
                      type="text" value={form.program} placeholder="e.g. B.Tech Computer Science"
                      onChange={(e) => setForm({ ...form, program: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-14 pr-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Registry ID</label>
                    <input
                      type="text" value={form.registration_number} placeholder="1241...."
                      onChange={(e) => setForm({ ...form, registration_number: e.target.value.replace(/[^0-9]/g, '').slice(0, 8) })}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0a] px-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Batch Cycle</label>
                    <input
                      type="text" value={form.batch} placeholder="2024-28"
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0a] px-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Bio Stream</label>
                  <div className="relative group/input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-5 top-5 w-4 h-4 text-slate-500 group-focus-within/input:text-orange-600 transition-colors"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <textarea
                      value={form.bio} placeholder="Tell us about yourself..."
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-14 pr-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner h-[116px] resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-5 rounded-[24px] text-[11px] sm:text-xs font-medium text-center border animate-fade-in ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                <div className="flex items-center justify-center gap-3">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${message.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                  {message.text}
                </div>
              </div>
            )}

            <button
              onClick={handleUpdate} disabled={isUpdating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.01] text-white py-6 rounded-[30px] font-bold text-sm tracking-tight shadow-[0_20px_50px_rgba(234,88,12,0.3)] active:scale-95 transition-all disabled:opacity-50 border-none group/btn relative overflow-hidden flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              {isUpdating && <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin" />}
              <span className="relative z-10">{isUpdating ? 'Synchronizing Profiles...' : 'Authorize Profile Sync'}</span>
            </button>
          </div>
        </div>

        {/* ═══════════ Avatar Frame Selector ═══════════ */}
        <div className="glass-panel p-10 rounded-[48px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0a]/80 shadow-xl relative z-10 overflow-hidden backdrop-blur-2xl">
          <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center text-2xl">
              🖼️
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">Avatar Frames</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60 leading-none">Customize your digital identity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* None Option */}
            <div 
              onClick={() => {
                if (!userProfile?.id) return;
                NexusServer.updateProfile(userProfile.id, { avatar_frame: '' });
                setUserProfile({ ...userProfile, avatar_frame: '' });
                updateUserQuizProfile({ avatar_frame: '' });
              }}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${!userProfile?.avatar_frame ? 'border-orange-600 bg-orange-600/5' : 'border-slate-100 dark:border-white/5 hover:border-orange-600/30'}`}
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">NONE</div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Default</span>
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
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden ${isActive ? 'border-orange-600 bg-orange-600/5' : 'border-slate-100 dark:border-white/5 hover:border-orange-600/30'}`}
                >
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <img src={`/Nexus-Journey/${frame}`} alt={frameTitle} className="absolute inset-0 w-full h-full object-contain z-10" />
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5" />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-slate-500'}`}>{frameTitle}</span>
                  {isActive && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.8)]" />}
                </div>
              );
            })}

            {/* Empty State / locked hint */}
            {(!userProfile.unlocked_frames || userProfile.unlocked_frames.length === 0) && (
              <div className="col-span-full py-8 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level up in Nexus Journey to unlock frames</p>
                <button 
                  onClick={() => navigateToModule(ModuleType.QUIZ)}
                  className="mt-4 px-6 py-2 bg-slate-900 dark:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all"
                >
                  Go to Quiz
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <button
            onClick={async () => { await NexusServer.signOut(); navigateToModule(ModuleType.DASHBOARD); }}
            className="group px-12 py-5 text-red-500/60 hover:text-red-500 font-bold text-sm transition-all flex items-center justify-center gap-3 border border-red-500/10 hover:border-red-500/30 rounded-[32px] bg-white/5 backdrop-blur-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 transition-transform group-hover:rotate-12"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Log out
          </button>
          <p className="mt-8 text-[11px] sm:text-xs font-bold text-slate-400 dark:text-slate-600 opacity-40">Build Version 2.5a • Secure Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
