
import React, { useState, useEffect } from 'react';
import NexusServer from '../services/nexusServer.ts';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (!isLogin && username.length >= 3) {
      const timer = setTimeout(async () => {
        setUsernameStatus('checking');
        try {
          const available = await NexusServer.checkUsernameAvailability(username);
          setUsernameStatus(available ? 'available' : 'taken');
        } catch (e) {
          setUsernameStatus('idle');
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus('idle');
    }
  }, [username, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!NexusServer.isConfigured()) {
      setError("Registry Offline: Database credentials (URL/KEY) are missing in the environment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        if (!identifier.trim()) throw new Error("Email or Username required.");
        if (!password.trim()) throw new Error("Password required.");

        const result = await NexusServer.signIn(identifier, password);
        if (result.error) throw result.error;

        // Success: Close modal
        onClose();
      } else {
        if (!email.trim()) throw new Error("Official email is required.");
        if (!regNo.trim()) throw new Error("Registration number is required.");
        if (username.length < 3) throw new Error("Username must be at least 3 characters.");
        if (usernameStatus === 'taken') throw new Error("This username is already claimed.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const result = await NexusServer.signUp(email, password, username, regNo);
        if (result.error) throw result.error;

        // Success
        onClose();
      }
    } catch (err: any) {
      console.error("Auth Failure:", err);
      setError(err.message || "Authentication protocol failed. Check your network or identity parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.length <= 15) setUsername(clean);
  };

  return (
    <div className="modal-overlay">
      <div className="nexus-modal w-full max-w-sm mx-4">

        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/10 blur-[64px] rounded-full pointer-events-none group-focus-within:bg-orange-600/20 transition-colors" />

        <div className="bg-slate-900 dark:bg-black p-8 text-white text-center relative rounded-t-[48px] border-b border-white/5">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors border-none bg-transparent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          <div className="w-14 h-14 bg-orange-600/10 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-orange-600/20 shadow-[0_0_30px_rgba(234,88,12,0.15)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-7 h-7 text-orange-600 shadow-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>

          <h3 className="text-2xl font-black tracking-tighter uppercase leading-none mb-2">Nexus Gateway</h3>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.8)]" />
            Protocol: {isLogin ? 'Login' : 'Signup'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase rounded-2xl text-center animate-fade-in flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="11.99" y2="16" /></svg>
                <span>Terminal Error</span>
              </div>
              <p className="font-bold opacity-80 normal-case leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar py-2">
            {isLogin ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Email or Username</label>
                  <div className="relative group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    <input
                      type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-100 dark:bg-black/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-orange-600/10 shadow-inner dark:text-white transition-all disabled:opacity-50"
                      placeholder="email@lpu.in or username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
                  <div className="relative group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <input
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-100 dark:bg-black/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-orange-600/10 shadow-inner dark:text-white transition-all disabled:opacity-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Choose Username</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm group-focus-within:text-orange-600">@</span>
                    <input
                      type="text" required value={username} onChange={e => handleUsernameChange(e.target.value)}
                      disabled={loading}
                      className={`w-full bg-slate-100 dark:bg-black/60 pl-9 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border transition-all dark:text-white shadow-inner disabled:opacity-50 ${usernameStatus === 'available' ? 'border-emerald-500/50' :
                        usernameStatus === 'taken' ? 'border-red-500/50' : 'border-transparent focus:ring-4 focus:ring-orange-600/10'
                        }`}
                      placeholder="verto_username"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}
                      {usernameStatus === 'available' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>}
                      {usernameStatus === 'taken' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5 text-red-500"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Official Email</label>
                  <div className="relative group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-100 dark:bg-black/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-orange-600/10 shadow-inner dark:text-white transition-all disabled:opacity-50"
                      placeholder="e.g. name@lpu.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Reg No</label>
                  <div className="relative group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="12" cy="11" r="3" /></svg>
                    <input
                      type="text" required value={regNo} onChange={e => setRegNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                      disabled={loading}
                      className="w-full bg-slate-100 dark:bg-black/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-orange-600/10 shadow-inner dark:text-white transition-all disabled:opacity-50"
                      placeholder="1240...."
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Password</label>
                  <div className="relative group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <input
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-100 dark:bg-black/60 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-4 focus:ring-orange-600/10 shadow-inner dark:text-white transition-all disabled:opacity-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit" disabled={loading || (!isLogin && usernameStatus === 'taken')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.02] text-white py-4 md:py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3 border-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (isLogin ? 'Establish Session' : 'Establish Identity')}
          </button>

          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-500 transition-colors py-4 bg-transparent border-none"
          >
            {isLogin ? "New Verto? Create Instance" : "Found Identity? Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
