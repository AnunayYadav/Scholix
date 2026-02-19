
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, ModuleType } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';

interface ProfileSectionProps {
  userProfile: UserProfile | null;
  setUserProfile: (p: UserProfile | null) => void;
  navigateToModule: (m: ModuleType) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, setUserProfile, navigateToModule }) => {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [userProfile]);

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
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm mb-10 max-w-xs">Authentication token missing or expired. Please sign in to manage your Nexus profile.</p>
        <button onClick={() => navigateToModule(ModuleType.DASHBOARD)} className="bg-slate-900 dark:bg-white text-white dark:text-black px-12 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-2xl border-none">Return to Dashboard</button>
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
          <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-orange-600 to-red-600 p-[3px] shadow-[0_32px_64px_rgba(234,88,12,0.3)] transition-all duration-700 group-hover:scale-105 group-hover:rotate-6 active:scale-95">
            <div className="w-full h-full bg-white dark:bg-[#0a0a0a] rounded-full p-[2px]">
              <div className="w-full h-full bg-slate-50 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center overflow-hidden relative">
                {userProfile.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <span className="text-orange-600 text-6xl font-black transition-all duration-500 group-hover:scale-110">
                    {userProfile.username?.[0]?.toUpperCase() || userProfile.email[0].toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-10 h-10"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-orange-600 w-12 h-12 rounded-[18px] border-4 border-white dark:border-[#0a0a0a] flex items-center justify-center shadow-2xl group-hover:bg-orange-500 group-hover:scale-110 transition-all z-30">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-6 h-6"><path d="M12 5v14M5 12h14" /></svg>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/5 border border-orange-600/10 mb-6 group/badge cursor-default hover:bg-orange-600/10 transition-colors">
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-600">Verification Active</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none mb-4 italic drop-shadow-2xl">
            {userProfile.username || 'Citizen Verto'}
          </h2>
          <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.5em] opacity-50 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            ID: {userProfile.email}
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="relative group/panel">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-[48px] blur-3xl opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700" />
          <div className="glass-panel p-10 rounded-[48px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0a]/80 shadow-[0_32px_128px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)] relative z-10 space-y-10 overflow-hidden backdrop-blur-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 mb-1 leading-none">Security Core</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Profile Visibility Control</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-2">{form.is_public ? 'Public' : 'Secure'}</span>
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
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Verto Alias</label>
                  <div className="relative group/input">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-600 font-black tracking-tighter text-lg transition-transform group-focus-within/input:scale-125">@</span>
                    <input
                      type="text" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-black/40 pl-11 pr-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
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
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Rate Limit {recentChanges.length}/2</p>
                    </div>
                    <p className="text-[7px] text-slate-300 dark:text-slate-600 font-bold">14-DAY ROTATION</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Academic Program</label>
                  <div className="relative group/input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-orange-600 transition-colors"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    <input
                      type="text" value={form.program} placeholder="e.g. B.Tech Computer Science"
                      onChange={(e) => setForm({ ...form, program: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-black/40 pl-14 pr-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Registry ID</label>
                    <input
                      type="text" value={form.registration_number} placeholder="1241...."
                      onChange={(e) => setForm({ ...form, registration_number: e.target.value.replace(/[^0-9]/g, '').slice(0, 8) })}
                      className="w-full bg-slate-50 dark:bg-black/40 px-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Batch Cycle</label>
                    <input
                      type="text" value={form.batch} placeholder="2024-28"
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-black/40 px-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest opacity-60">Bio Stream</label>
                  <div className="relative group/input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-5 top-5 w-4 h-4 text-slate-500 group-focus-within/input:text-orange-600 transition-colors"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <textarea
                      value={form.bio} placeholder="Tell us about yourself..."
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-black/40 pl-14 pr-5 py-5 rounded-[24px] text-sm font-bold border border-slate-200/50 dark:border-white/5 focus:border-orange-600/30 focus:ring-4 focus:ring-orange-600/10 outline-none text-slate-900 dark:text-white transition-all shadow-inner h-[116px] resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700 hover:border-orange-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-center border animate-fade-in ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                <div className="flex items-center justify-center gap-3">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${message.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                  {message.text}
                </div>
              </div>
            )}

            <button
              onClick={handleUpdate} disabled={isUpdating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.01] text-white py-6 rounded-[30px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(234,88,12,0.3)] active:scale-95 transition-all disabled:opacity-50 border-none group/btn relative overflow-hidden flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              {isUpdating && <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin" />}
              <span className="relative z-10">{isUpdating ? 'Synchronizing Profiles...' : 'Authorize Profile Sync'}</span>
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <button
            onClick={async () => { await NexusServer.signOut(); navigateToModule(ModuleType.DASHBOARD); }}
            className="group px-12 py-5 text-red-500/40 hover:text-red-500 font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 border border-red-500/10 hover:border-red-500/30 rounded-[32px] bg-white/5 backdrop-blur-sm active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 transition-transform group-hover:rotate-12"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Terminate Session
          </button>
          <p className="mt-8 text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] opacity-40">Build Version 2.5a • Secure Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
