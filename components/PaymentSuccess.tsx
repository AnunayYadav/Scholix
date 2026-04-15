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
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
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

        /* ====== PRINT STYLES ====== */
        @media print {
          /* Force colors in print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Hide everything first */
          body * {
            visibility: hidden;
          }

          /* Show only the receipt */
          #print-receipt, #print-receipt * {
            visibility: visible;
          }

          #print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .no-print {
            display: none !important;
          }

          .screen-logo { display: none !important; }
          .print-logo { display: block !important; }
          .print-header { display: flex !important; }
          .print-footer-section { display: flex !important; }
          .print-watermark { display: block !important; }
          .print-gradient-bar { 
            display: block !important;
            height: 6px !important;
            background: linear-gradient(90deg, #f97316, #ef4444, #8b5cf6) !important;
          }
          .print-bottom-bar {
            display: block !important;
            height: 4px !important;
            background: linear-gradient(90deg, #f97316, #ef4444, #8b5cf6) !important;
          }
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

      {/* ========== MAIN RECEIPT CONTAINER ========== */}
      <div id="print-receipt" className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-[32px] sm:rounded-[40px] border border-zinc-200 dark:border-white/[0.06] shadow-2xl dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)]">
        
        {/* Top Gradient Bar — visible on both screen and print */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 print-gradient-bar" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}></div>

        {/* Decorative blurs - screen only */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/8 blur-[120px] rounded-full no-print"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full no-print"></div>

        {/* Print Watermark */}
        <div className="print-watermark hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none" style={{ WebkitPrintColorAdjust: 'exact' } as any}>
          <img src="/Scholix_light.png" alt="" className="w-[500px]" />
        </div>

        <div className="relative z-10 p-6 sm:p-10">
          
          {/* ===== PRINT HEADER ===== */}
          <div className="print-header hidden items-center justify-between mb-8 pb-6" style={{ borderBottom: '2px solid #e4e4e7' }}>
            <div className="flex items-center gap-4">
              <img src="/Scholix_light.png" alt="Scholix" className="h-10" />
            </div>
            <div className="text-right">
              <div style={{ 
                display: 'inline-block', 
                padding: '6px 16px', 
                background: 'linear-gradient(135deg, #f97316, #ef4444)', 
                borderRadius: '8px',
                WebkitPrintColorAdjust: 'exact'
              } as any}>
                <span style={{ color: 'white', fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' } as any}>Transaction Receipt</span>
              </div>
              <p style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 700, marginTop: '6px', fontFamily: 'monospace' }}>{receiptNumber}</p>
            </div>
          </div>

          {/* ===== CONTENT ===== */}
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            
            {/* Screen: Scholix Logo */}
            <div className="screen-logo flex items-center gap-2.5 no-print">
              <img src="/Scholix_light.png" alt="Scholix" className="h-6 dark:hidden" />
              <img src="/Scholix_dark.png" alt="Scholix" className="h-6 hidden dark:block" />
            </div>

            {/* Success Icon */}
            <div className="relative scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 blur-3xl opacity-20 animate-pulse no-print"></div>
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 relative no-print"
                style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 check-animate"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              {/* Print version of the checkmark */}
              <div className="hidden" style={{ display: 'none' }}>
                {/* shown via print CSS */}
              </div>
            </div>

            {/* Print: Success badge inline */}
            <div className="hidden" style={{ WebkitPrintColorAdjust: 'exact' } as any}>
              {/* Print-only success is handled by keeping the icon visible */}
            </div>

            {/* Thank You */}
            <div className="space-y-2 fade-up-1">
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                Thank <span style={{ 
                  background: 'linear-gradient(90deg, #f97316, #ef4444)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } as any}>You!</span>
              </h2>
              <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.25em] text-[9px] sm:text-[10px]">Your generosity keeps Scholix growing</p>
            </div>

            {/* Amount Highlight */}
            <div className="fade-up-2 w-full max-w-xs mx-auto">
              <div 
                className="relative p-5 sm:p-6 rounded-[20px] border overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(239,68,68,0.06))',
                  borderColor: 'rgba(249,115,22,0.15)',
                  WebkitPrintColorAdjust: 'exact'
                } as any}
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 no-print" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(249,115,22,0.08) 50%)' }}></div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: '#f97316' }}>Amount Contributed</p>
                <p className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{details.amount}</p>
                <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">Indian Rupees</p>
              </div>
            </div>

            {/* Receipt Details Card */}
            <div className="w-full fade-up-3 rounded-[20px] border overflow-hidden" style={{ 
              background: 'rgba(250,250,250,0.8)', 
              borderColor: 'rgba(228,228,231,0.8)',
              WebkitPrintColorAdjust: 'exact'
            } as any}>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-3.5" style={{ 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))',
                borderBottom: '1px solid rgba(16,185,129,0.15)',
                WebkitPrintColorAdjust: 'exact'
              } as any}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #059669)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: '#059669' }}>Payment Verified</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ 
                  background: 'rgba(16,185,129,0.1)', 
                  border: '1px solid rgba(16,185,129,0.2)',
                  WebkitPrintColorAdjust: 'exact'
                } as any}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981', WebkitPrintColorAdjust: 'exact' } as any}></span>
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#059669' }}>Confirmed</span>
                </span>
              </div>

              {/* Details Grid */}
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 p-3 rounded-xl" style={{ background: 'rgba(244,244,245,0.5)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Payment ID</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm truncate font-mono">{details.paymentId}</p>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl" style={{ background: 'rgba(244,244,245,0.5)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Order ID</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm truncate font-mono">{details.orderId}</p>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl" style={{ background: 'rgba(244,244,245,0.5)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Contributor</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', WebkitPrintColorAdjust: 'exact' } as any}>
                        {(userProfile?.username || 'G')[0].toUpperCase()}
                      </div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{userProfile?.username || 'Community Supporter'}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl" style={{ background: 'rgba(244,244,245,0.5)', WebkitPrintColorAdjust: 'exact' } as any}>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Date & Time</p>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{new Date(details.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Receipt Reference */}
                <div className="flex items-center gap-3 mt-5 p-3 rounded-xl" style={{ 
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(239,68,68,0.03))', 
                  border: '1px solid rgba(249,115,22,0.1)',
                  WebkitPrintColorAdjust: 'exact' 
                } as any}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                    background: 'linear-gradient(135deg, #f97316, #ef4444)', 
                    WebkitPrintColorAdjust: 'exact' 
                  } as any}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" /><polyline points="14 2 14 8 20 8" /><path d="M4 15h9" /><path d="M9 11l4 4-4 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Receipt Reference</p>
                    <p className="font-black text-zinc-800 dark:text-zinc-200 text-base font-mono tracking-widest">{receiptNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== PRINT FOOTER ===== */}
            <div className="print-footer-section hidden w-full items-center justify-between pt-6 mt-2" style={{ borderTop: '2px solid #e4e4e7' }}>
              <div className="flex items-center gap-3">
                <img src="/Scholix_light.png" alt="Scholix" className="h-6" />
                <div style={{ width: '1px', height: '24px', background: '#e4e4e7' }}></div>
                <span style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 600 }}>scholix.app</span>
              </div>
              <div className="text-right" style={{ maxWidth: '280px' }}>
                <p style={{ fontSize: '9px', color: '#a1a1aa', fontStyle: 'italic', lineHeight: '1.4' }}>
                  This is a computer-generated receipt for your contribution to Scholix. No signature is required.
                </p>
              </div>
            </div>

            {/* ===== SCREEN FOOTER ===== */}
            <div className="w-full space-y-2 no-print fade-up-4">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium italic text-center">
                This is a computer-generated receipt for your contribution to Scholix. Thank you for being part of the community.
              </p>
            </div>

            {/* Action Buttons — screen only */}
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
                className="flex-1 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                Print Receipt
              </button>
            </div>

            {/* Powered by badge — screen only */}
            <div className="flex items-center gap-1.5 no-print opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Secured by Razorpay</span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Bar — print */}
        <div className="print-bottom-bar hidden" style={{ height: '4px', background: 'linear-gradient(90deg, #f97316, #ef4444, #8b5cf6)', WebkitPrintColorAdjust: 'exact' } as any}></div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
