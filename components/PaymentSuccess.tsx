import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';

interface PaymentSuccessProps {
  userProfile: UserProfile | null;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ userProfile }) => {
  const { universityInfo, fullBrandName, shortBrandName } = useUniversity();
  const location = useLocation();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Get details from location state
    if (location.state) {
      setDetails(location.state);
    } else {
      // If no state, redirect back to home after 3 seconds
      const timer = setTimeout(() => navigate('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const receiptNumber = details?.paymentId ? `SCX-${details.paymentId.slice(-8).toUpperCase()}` : 'SCX-XXXXXXXX';

  if (!details) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-white/10 border-t-brand-primary animate-spin"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-zinc-900 dark:text-white font-bold text-sm">Verifying Transaction</p>
          <p className="text-zinc-400 dark:text-zinc-500 font-medium text-xs">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fade-in print:p-0 print:m-0 print:max-w-none">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-20vh) rotate(720deg); opacity: 0; }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .confetti-particle {
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: float-up 3s ease-out forwards;
          z-index: 100;
          pointer-events: none;
        }
        .check-animate {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: check-draw 0.6s ease-out 0.3s forwards;
        }
        .scale-in { animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .fade-up-1 { animation: fade-up 0.5s ease-out 0.4s both; }
        .fade-up-2 { animation: fade-up 0.5s ease-out 0.6s both; }
        .fade-up-3 { animation: fade-up 0.5s ease-out 0.8s both; }
        .fade-up-4 { animation: fade-up 0.5s ease-out 1.0s both; }

        @media print {
          body * { visibility: hidden; }
          #print-receipt, #print-receipt * { visibility: visible; }
          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      {/* Confetti Particles */}
      {showConfetti && (
        <div className="no-print">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 7],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                width: `${6 + Math.random() * 6}px`,
                height: `${6 + Math.random() * 6}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}

      {/* ========== SCREEN VIEW ========== */}
      <div id="print-receipt" className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-[32px] sm:rounded-[40px] border border-zinc-200 dark:border-white/[0.06] shadow-2xl dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)] print:shadow-none print:border print:border-zinc-300 print:rounded-none">
        
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 print:h-1 print:from-orange-600 print:via-red-600 print:to-purple-700"></div>

        {/* Decorative blurs - screen only */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/8 blur-[120px] rounded-full no-print"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full no-print"></div>

        <div className="relative z-10 p-6 sm:p-10 print:p-8">
          
          {/* ===== Print Header (hidden on screen) ===== */}
          <div className="hidden print-only" style={{ display: 'none' }}>
            {/* This is replaced by the CSS print-only rule */}
          </div>
          <div className="hidden print:flex print:items-center print:justify-between print:mb-8 print:pb-6 print:border-b-2 print:border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-xl tracking-tighter">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 leading-none">SCHOLIX</h1>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.25em] mt-0.5">AI-Powered Student Utility Hub</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Transaction Receipt</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{receiptNumber}</p>
            </div>
          </div>

          {/* ===== Screen Header ===== */}
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 print:space-y-6">
            
            {/* Scholix Logo + Badge */}
            <div className="flex items-center gap-2.5 no-print">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-sm tracking-tighter">S</span>
              </div>
              <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Scholix</span>
            </div>

            {/* Success Icon */}
            <div className="relative scale-in print:scale-75">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-emerald-500 blur-3xl opacity-20 animate-pulse no-print"></div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 relative print:shadow-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 check-animate"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>

            {/* Thank you message */}
            <div className="space-y-2 fade-up-1">
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                Thank <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 print:text-orange-600">You!</span>
              </h2>
              <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.25em] text-[9px] sm:text-[10px]">Your support keeps Scholix growing</p>
            </div>

            {/* Amount Highlight */}
            <div className="fade-up-2 w-full max-w-xs mx-auto">
              <div className="relative p-5 sm:p-6 rounded-[24px] bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-500/10 dark:border-orange-500/15 print:bg-orange-50 print:border-orange-200">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500/60 mb-1">Amount Contributed</p>
                <p className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter print:text-zinc-900">₹{details.amount}</p>
              </div>
            </div>

            {/* Receipt Details Card */}
            <div className="w-full fade-up-3 bg-zinc-50/80 dark:bg-white/[0.02] rounded-[24px] border border-zinc-200/80 dark:border-white/[0.04] overflow-hidden print:bg-white print:border-zinc-300 print:rounded-lg">
              
              {/* Status Bar */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border-b border-emerald-500/10 dark:border-emerald-500/10 print:bg-emerald-50 print:border-emerald-200">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 print:text-emerald-700">Payment Verified</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 print:bg-emerald-100 print:border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 print:bg-emerald-600"></span>
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider print:text-emerald-700">Confirmed</span>
                </span>
              </div>

              {/* Details Grid */}
              <div className="p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Payment ID</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm truncate font-mono print:text-zinc-900">{details.paymentId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Order ID</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm truncate font-mono print:text-zinc-900">{details.orderId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Contributor</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm print:text-zinc-900">{userProfile?.username || 'Community Supporter'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Date & Time</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm print:text-zinc-900">{new Date(details.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Receipt Reference */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-200/60 dark:border-white/[0.04] print:border-zinc-200">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center print:bg-zinc-100 print:border print:border-zinc-200">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-zinc-400">
                      <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" /><path d="M21 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" /><path d="M4 12h16" /><path d="M10 8v8" /><path d="M14 8v8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Receipt Reference</p>
                    <p className="font-black text-zinc-800 dark:text-zinc-200 text-sm font-mono tracking-wide print:text-zinc-900">{receiptNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block w-full pt-6 mt-4 border-t-2 border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-[10px]">S</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500">scholix.app</span>
                </div>
                <p className="text-[9px] text-zinc-400 italic max-w-xs text-right">
                  This is a computer-generated receipt for your contribution to Scholix. No signature required.
                </p>
              </div>
            </div>

            {/* Screen Footer */}
            <div className="w-full space-y-2 no-print fade-up-4">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium italic text-center">
                This is a computer-generated receipt for your contribution to Scholix. Thank you for being part of the community.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full no-print fade-up-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m15 18-6-6 6-6"/></svg>
                Home
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                Print Receipt
              </button>
            </div>

            {/* Powered by badge */}
            <div className="flex items-center gap-1.5 no-print opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Secured by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default PaymentSuccess;
