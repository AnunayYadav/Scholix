
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import NexusServer from '../services/nexusServer.ts';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'signup';
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

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [identifier, setIdentifier] = useState('');
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpValue, setOtpValue] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setStep('form');
    setError(null);
    setEmailError(false);
  }, [initialMode]);

  // Body scroll lock
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) handleClose();
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
    setEmailError(false);

    try {
      if (isLogin) {
        if (!identifier.trim()) throw new Error("Email or Username required.");
        if (!password.trim()) throw new Error("Password required.");


        if (identifier.includes('@') && !validateEmail(identifier.trim())) {
          setEmailError(true);
          throw new Error("Please enter a valid email address.");
        }

        const result = await NexusServer.signIn(identifier, password);
        if (result.error) throw result.error;

        // Success: Close modal
        handleClose();
      } else {
        // Multi-Step Registration with OTP
        if (step === 'form') {
          if (!email.trim()) throw new Error("Email is required.");
          if (!validateEmail(email.trim())) {
            setEmailError(true);
            throw new Error("Please enter a valid email address.");
          }
          if (!regNo.trim()) throw new Error("Registration number is required.");
          if (username.length < 3) throw new Error("Username must be at least 3 characters.");
          if (usernameStatus === 'taken') throw new Error("This username is already claimed.");
          if (password.length < 6) throw new Error("Password must be at least 6 characters.");

          // 1. Send OTP via Brevo API
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.toLowerCase().trim(), username })
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Failed to dispatch verification code.");

          // 2. Move to OTP step
          setStep('otp');
        } else {
          // Verify OTP and then Sign Up
          if (otpValue.length !== 6) throw new Error("6-digit verification code is required.");

          // 1. Verify OTP
          const verifyResponse = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otpValue })
          });

          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok) throw new Error(verifyData.error || "Verification failed. Check the code.");

          // 2. Proceed with signup in Supabase
          const result = await NexusServer.signUp(email, password, username, regNo);
          if (result.error) throw result.error;

          // Final Success
          handleClose();
        }
      }
    } catch (err: any) {
      console.error("Auth Failure:", err);
      setError(err.message || "Authentication protocol failed. Check your network or identity parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), username })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to resend verification code.");
      
      // Success visual feedback could be added here
      setError(null);
    } catch (err: any) {
      setError(err.message);
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
      className={`modal-overlay modal-overlay-fade ${isClosing ? 'closing' : ''}`}
      style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) handleClose(); }}
    >
      <div ref={modalRef} className={`nexus-modal w-full max-w-md mx-4 overflow-hidden ${isClosing ? 'closing' : ''}`}>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-600/10 blur-[80px] rounded-full pointer-events-none group-focus-within:bg-orange-600/20 transition-colors" />

        <div className="bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 md:p-10 text-center relative border-b border-slate-100 dark:border-white/5">
          <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-orange-500 transition-colors border-none bg-transparent active:scale-95">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/10 rounded-[20px] sm:rounded-[24px] flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-orange-600/20 shadow-[0_0_40px_rgba(234,88,12,0.1)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none mb-2">
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
                        type="text" required value={identifier} 
                        onChange={e => {
                          setIdentifier(e.target.value);
                          if (emailError) setEmailError(false);
                        }}
                        disabled={loading}
                        className={`w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border transition-all dark:text-white disabled:opacity-50 ${
                          emailError 
                            ? 'border-red-500/50 ring-4 ring-red-500/5' 
                            : 'border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5'
                        }`}
                        placeholder="Enter email or username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Password</label>
                    <div className="relative group">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input
                        type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-12 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-orange-500 transition-colors bg-transparent border-none"
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {step === 'form' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
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
                        <label className="block text-[11px] sm:text-xs font-medium text-slate-400 mb-2.5 ml-1">Email Address</label>
                        <div className="relative group">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                          <input
                            type="email" required value={email} 
                            onChange={e => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError(false);
                            }}
                            disabled={loading}
                            className={`w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-4 py-4.5 rounded-2xl text-[13px] font-bold outline-none border transition-all dark:text-white disabled:opacity-50 ${
                              emailError 
                                ? 'border-red-500/50 ring-4 ring-red-500/5' 
                                : 'border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5'
                            }`}
                            placeholder="Enter your email"
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
                            type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            className="w-full bg-slate-50 dark:bg-[#0a0a0a] pl-11 pr-12 py-4.5 rounded-2xl text-[13px] font-bold outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                            placeholder="Min. 6 characters"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-orange-500 transition-colors bg-transparent border-none"
                          >
                            {showPassword ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
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
                  ) : (
                    <div className="space-y-6 animate-fade-in py-4 text-center">
                      <div className="w-16 h-16 bg-orange-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-600/20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-orange-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold dark:text-white">Verify Your Identity</h4>
                        <p className="text-[11px] sm:text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                          Enter the 6-digit synchronization code sent to <span className="text-orange-500 font-bold">{email}</span>
                        </p>
                      </div>

                      <div className="relative group pt-4">
                        <input
                          type="text" required value={otpValue} 
                          onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          disabled={loading}
                          className="w-full bg-slate-50 dark:bg-[#0a0a0a] px-4 py-5 rounded-2xl text-[28px] font-black tracking-[12px] text-center outline-none border border-slate-200 dark:border-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-600/5 dark:text-white transition-all disabled:opacity-50"
                          placeholder="000000"
                        />
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        <button 
                          type="button" onClick={handleResendOTP} disabled={loading}
                          className="text-[11px] font-bold text-orange-500 hover:text-orange-600 transition-colors bg-transparent border-none"
                        >
                          Didn't receive the code? Resend
                        </button>
                        <button 
                          type="button" onClick={() => { setStep('form'); setError(null); }}
                          className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none"
                        >
                          Go back and edit details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8 pt-0 md:pt-0">
            <button
              type="submit" disabled={loading || (!isLogin && usernameStatus === 'taken')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-[0_20px_40px_-10px_rgba(234,88,12,0.4)] hover:scale-[1.01] text-white py-4 sm:py-5 rounded-[20px] sm:rounded-3xl font-bold text-sm tracking-tight active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 border-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (isLogin ? 'Sign In' : (step === 'form' ? 'Get Verification Code' : 'Verify & Join Nexus'))}
            </button>

            <button
              type="button"
              onClick={() => { 
                const newMode = !isLogin;
                setIsLogin(newMode); 
                setError(null); 
                setEmailError(false);
                setPassword(''); 
                navigate(newMode ? '/login' : '/signup', { replace: true });
              }}
              className="w-full text-[11px] sm:text-xs font-medium text-slate-400 hover:text-orange-500 transition-colors py-4 sm:py-6 bg-transparent border-none"
            >
              {isLogin ? "New here? Create an account" : "Have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default AuthModal;
