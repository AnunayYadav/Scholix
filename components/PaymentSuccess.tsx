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
    if (location.state) {
      setDetails(location.state);
    } else {
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
    <div className="ps-wrapper max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fade-in">
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
          position: fixed; width: 8px; height: 8px; border-radius: 2px;
          animation: float-up 3s ease-out forwards; z-index: 100; pointer-events: none;
        }
        .check-animate { stroke-dasharray: 24; stroke-dashoffset: 24; animation: check-draw 0.6s ease-out 0.3s forwards; }
        .scale-in { animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .fade-up-1 { animation: fade-up 0.5s ease-out 0.4s both; }
        .fade-up-2 { animation: fade-up 0.5s ease-out 0.6s both; }
        .fade-up-3 { animation: fade-up 0.5s ease-out 0.8s both; }
        .fade-up-4 { animation: fade-up 0.5s ease-out 1.0s both; }

        /* ====== PRINT ====== */
        @media print {
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            background: #fff !important;
            background-color: #fff !important;
          }
          body * { visibility: hidden; }
          .ps-wrapper, .ps-wrapper * { visibility: visible !important; }
          .ps-wrapper {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; padding: 0 !important; margin: 0 !important; max-width: none !important;
            background: #fff !important;
          }
          .ps-card {
            border-radius: 0 !important; box-shadow: none !important;
            border: none !important; background: #fff !important;
          }
          .no-print { display: none !important; }
          .print-show { display: flex !important; }

          /* Force all text to dark in print */
          .ps-card, .ps-card * { color: #18181b !important; }
          /* Then re-apply specific colors */
          .ps-text-orange { color: #f97316 !important; }
          .ps-text-green { color: #059669 !important; }
          .ps-text-muted { color: #71717a !important; }
          .ps-text-light { color: #a1a1aa !important; }
          .ps-text-white { color: #ffffff !important; }
        }
      `}</style>

      {/* Confetti */}
      {showConfetti && (
        <div className="no-print">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="confetti-particle" style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#f97316', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 7],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }} />
          ))}
        </div>
      )}

      {/* ====== MAIN CARD ====== */}
      <div className="ps-card relative overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        
        {/* Gradient Bar */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #f97316, #ef4444, #8b5cf6)', WebkitPrintColorAdjust: 'exact' } as any}></div>

        {/* Blurs — screen only */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/5 blur-[120px] rounded-full no-print"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full no-print"></div>

        <div className="relative z-10 p-6 sm:p-10">

          {/* PRINT HEADER */}
          <div className="print-show hidden items-center justify-between mb-8 pb-6 border-b-2 border-zinc-200">
            <img src="/Scholix_light.png" alt="Scholix" className="h-9" />
            <div className="text-right">
              <div className="inline-block px-4 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', WebkitPrintColorAdjust: 'exact' } as any}>
                <span className="ps-text-white text-[10px] font-black uppercase tracking-widest">Transaction Receipt</span>
              </div>
              <p className="ps-text-light text-[10px] font-bold font-mono mt-1.5">{receiptNumber}</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">

            {/* SCREEN LOGO */}
            <div className="no-print flex items-center">
              <img src="/Scholix_light.png" alt="Scholix" className="h-6 dark:hidden" />
              <img src="/Scholix_dark.png" alt="Scholix" className="h-6 hidden dark:block" />
            </div>

            {/* SUCCESS ICON — screen */}
            <div className="relative scale-in no-print">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 relative" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 check-animate"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>

            {/* SUCCESS ICON — print */}
            <div className="print-show hidden justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #059669)', WebkitPrintColorAdjust: 'exact' } as any}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>

            {/* THANK YOU */}
            <div className="space-y-2 fade-up-1">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none text-zinc-900 dark:text-white">
                Thank <span className="ps-text-orange" style={{ color: '#f97316' }}>You!</span>
              </h2>
              <p className="ps-text-light text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.25em] text-[9px] sm:text-[10px]">Your generosity keeps Scholix growing</p>
            </div>

            {/* AMOUNT */}
            <div className="fade-up-2 w-full max-w-xs mx-auto">
              <div className="relative p-5 sm:p-6 rounded-[20px] overflow-hidden bg-orange-50 dark:bg-orange-500/10 border-[1.5px] border-orange-200 dark:border-orange-500/20">
                <p className="ps-text-orange text-[9px] font-black uppercase tracking-[0.3em] mb-1 text-orange-500">Amount Contributed</p>
                <p className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">₹{details.amount}</p>
                <p className="ps-text-light text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">Indian Rupees</p>
              </div>
            </div>

            {/* DETAILS CARD */}
            <div className="w-full fade-up-3 rounded-[20px] overflow-hidden border-[1.5px] border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50">
              
              {/* Status */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-emerald-50 dark:bg-emerald-500/10 border-b-[1.5px] border-emerald-200 dark:border-emerald-500/20" style={{ WebkitPrintColorAdjust: 'exact' } as any}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #059669)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="ps-text-green text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">Payment Verified</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/25" style={{ WebkitPrintColorAdjust: 'exact' } as any}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ WebkitPrintColorAdjust: 'exact' } as any}></span>
                  <span className="ps-text-green text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Confirmed</span>
                </span>
              </div>

              {/* Grid */}
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50">
                    <p className="ps-text-light text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1.5">Payment ID</p>
                    <p className="truncate font-bold text-[13px] font-mono text-zinc-800 dark:text-zinc-200">{details.paymentId}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50">
                    <p className="ps-text-light text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1.5">Order ID</p>
                    <p className="truncate font-bold text-[13px] font-mono text-zinc-800 dark:text-zinc-200">{details.orderId}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50">
                    <p className="ps-text-light text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1.5">Contributor</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white', WebkitPrintColorAdjust: 'exact' } as any}>
                        {(userProfile?.username || 'G')[0].toUpperCase()}
                      </div>
                      <p className="font-bold text-[13px] text-zinc-800 dark:text-zinc-200">{userProfile?.username || 'Community Supporter'}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50">
                    <p className="ps-text-light text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1.5">Date & Time</p>
                    <p className="font-bold text-[13px] text-zinc-800 dark:text-zinc-200">{new Date(details.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Receipt Ref */}
                <div className="flex items-center gap-3 mt-4 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border-[1.5px] border-orange-200 dark:border-orange-500/15" style={{ WebkitPrintColorAdjust: 'exact' } as any}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" /><polyline points="14 2 14 8 20 8" /><path d="M4 15h9" /><path d="M9 11l4 4-4 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="ps-text-light text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Receipt Reference</p>
                    <p className="font-black text-[15px] font-mono tracking-widest text-zinc-900 dark:text-white">{receiptNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PRINT FOOTER */}
            <div className="print-show hidden w-full items-center justify-between pt-6 mt-2 border-t-2 border-zinc-200">
              <div className="flex items-center gap-3">
                <img src="/Scholix_light.png" alt="Scholix" className="h-5" />
                <div className="w-px h-5 bg-zinc-300"></div>
                <span className="ps-text-muted text-[10px] font-semibold">scholix.app</span>
              </div>
              <p className="ps-text-light text-[9px] italic text-right max-w-[260px] leading-relaxed">
                Computer-generated receipt for your contribution to Scholix. No signature required.
              </p>
            </div>

            {/* SCREEN FOOTER */}
            <div className="w-full no-print fade-up-4">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium italic text-center">
                This is a computer-generated receipt for your contribution to Scholix. Thank you for being part of the community.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 w-full no-print fade-up-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="m15 18-6-6 6-6"/></svg>
                Home
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                Print Receipt
              </button>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-1.5 no-print opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Secured by Razorpay</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #f97316, #ef4444, #8b5cf6)', WebkitPrintColorAdjust: 'exact' } as any}></div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
