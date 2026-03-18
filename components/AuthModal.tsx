
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import NexusServer from '../services/nexusServer.ts';

interface AuthModalProps {
  onClose: () => void;
  compulsory?: boolean;
}

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-white/10' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Excellent', color: 'bg-emerald-400' };
};

const AuthModal: React.FC<AuthModalProps> = ({ onClose, compulsory = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading && !compulsory) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    firstFocusable?.focus();
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isLogin]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 250);
  };

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
        handleClose();
      } else {
        if (!email.trim()) throw new Error("Official email is required.");
        if (!regNo.trim()) throw new Error("Registration number is required.");
        if (username.length < 3) throw new Error("Username must be at least 3 characters.");
        if (usernameStatus === 'taken') throw new Error("This username is already claimed.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const result = await NexusServer.signUp(email, password, username, regNo);
        if (result.error) throw result.error;

        // Success
        handleClose();
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

  const passwordStrength = getPasswordStrength(password);

  return createPortal(
    <div
      className={`modal-overlay ${isClosing ? 'closing' : ''} md:p-0 md:items-stretch py-6`}
      style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading && !compulsory) handleClose(); }}
    >
      <div ref={modalRef} className={`nexus-modal w-full max-w-md md:max-w-none md:w-full md:h-full md:rounded-none md:m-0 mx-4 overflow-hidden flex flex-col md:flex-row shadow-2xl ${isClosing ? 'closing' : ''} bg-white dark:bg-[#0a0a0a]`}>
        {/* Left Side Branding - Desktop Only */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#2c1305] dark:bg-[#1a0a02] relative pl-16 pr-16 pt-12 pb-12 overflow-hidden border-r border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 relative z-10 transition-transform active:scale-95 cursor-default">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-orange-600"><path d="M12 2L2 22h20L12 2z"/></svg>
             </div>
             <span className="text-white text-xl font-black tracking-widest uppercase drop-shadow-sm">LPU Nexus</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative z-10 w-full mb-8 mt-12 animate-fade-in" style={{ animationDuration: '1s' }}>
            <svg viewBox="0 0 600 400" className="w-full h-auto max-w-lg opacity-90 drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M150 250h200v100H150z" fill="#ea580c"/>
              <path d="M150 250l100 50 100-50" fill="#f97316"/>
              <path d="M170 250v-80h160v80" fill="#fff"/>
              <path d="M190 190h120M190 210h120M190 230h80" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="420" cy="180" r="30" fill="#ea580c"/>
              <path d="M370 280c0-40 25-60 50-60s50 20 50 60H370z" fill="#f97316"/>
              <rect x="360" y="220" width="100" height="70" rx="10" fill="#1e293b"/>
              <circle cx="410" cy="255" r="8" fill="#fff"/>
              <path d="M100 350h400" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.2"/>
            </svg>
          </div>
          
          <div className="relative z-10 text-center w-full max-w-xl mx-auto">
             <p className="text-white drop-shadow-md text-3xl font-serif italic mb-6 leading-relaxed">"Education is not preparation for life; education is life itself."</p>
             <p className="text-white/70 font-black text-xs tracking-[0.2em] uppercase">— John Dewey</p>
          </div>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.15),transparent_50%)] pointer-events-none mix-blend-screen" />
        </div>

        {/* Right Side Form Container */}
        <div className="flex-1 flex flex-col justify-center relative w-full md:w-1/2 overflow-hidden h-full bg-white dark:bg-[#0a0a0a]">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full pointer-events-none group-focus-within:bg-orange-600/20 transition-colors" />
          <div className="w-full max-w-md mx-auto flex flex-col h-full md:h-auto md:max-h-[90vh] overflow-y-auto custom-scrollbar relative px-4 md:px-0">

        <div className="p-6 sm:p-8 md:p-10 text-center relative border-b border-slate-100 dark:border-white/5 md:border-none md:pb-6">
          {!compulsory && (
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-orange-500 transition-colors border-none bg-transparent active:scale-95">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/10 rounded-[20px] sm:rounded-[24px] flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-orange-600/20 shadow-[0_0_40px_rgba(234,88,12,0.1)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none mb-2">
            {isLogin ? 'Welcome Back' : 'Join Nexus'}
          </h3>
          <p className="text-slate-500 dark:text-white/40 text-[11px] sm:text-xs font-medium flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
            {isLogin ? 'Sign in to your account' : 'Apply for student access'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="p-5 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="11.99" y2="16" /></svg>
                  <span className="text-[11px] sm:text-xs font-medium">Error detected</span>
                </div>
                <p className="text-[11px] sm:text-xs font-bold opacity-90 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {isLogin ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Email or Username</label>
                    <div className="relative group">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      <input
                        type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                        placeholder="Enter your registered email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Password</label>
                    <div className="relative group">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input
                        type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Unique Username</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm group-focus-within:text-orange-600">@</span>
                      <input
                        type="text" required value={username} onChange={e => handleUsernameChange(e.target.value)}
                        disabled={loading}
                        className={`w-full bg-slate-50 dark:bg-[#0a0a0a] pl-9 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border transition-all dark:text-white disabled:opacity-50 ${usernameStatus === 'available' ? 'border-emerald-500/50 ring-4 ring-emerald-500/5' :
                          usernameStatus === 'taken' ? 'border-red-500/50 ring-4 ring-red-500/5' : 'border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5'
                          }`}
                        placeholder="choose_a_tag"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {usernameStatus === 'checking' && <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}
                        {usernameStatus === 'available' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>}
                        {usernameStatus === 'taken' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5 text-red-500"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Official Email</label>
                    <div className="relative group">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      <input
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                        placeholder="name@lpu.in"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Reg Number</label>
                    <div className="relative group">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M7 21v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="12" cy="11" r="3" /></svg>
                      <input
                        type="text" required value={regNo} onChange={e => setRegNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                        disabled={loading}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                        placeholder="1240...."
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Secure Password</label>
                    <div className="relative group">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input
                        type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <div className="mt-3 space-y-1.5 animate-fade-in">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`password-strength-bar flex-1 ${i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-white/5'}`}
                            />
                          ))}
                        </div>
                        <p className={`text-[11px] sm:text-xs font-medium ${passwordStrength.score <= 1 ? 'text-red-500' :
                          passwordStrength.score <= 2 ? 'text-orange-500' :
                            passwordStrength.score <= 3 ? 'text-yellow-500' : 'text-emerald-500'
                          }`}>
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8 pt-0 md:pt-0">
            <button
              type="submit" disabled={loading || (!isLogin && usernameStatus === 'taken')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] hover:scale-[1.01] text-white py-4 sm:py-5 rounded-[20px] sm:rounded-3xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 border-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null); setPassword(''); }}
              className="w-full text-[11px] sm:text-xs font-medium text-slate-400 hover:text-orange-500 transition-colors py-4 sm:py-6 bg-transparent border-none"
            >
              {isLogin ? "New here? Create an account" : "Have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default AuthModal;
