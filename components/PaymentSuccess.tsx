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
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 animate-fade-in print-receipt-wrapper">
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

        /* ====== PRINT STYLES ====== */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Force white background everywhere */
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
          }

          /* Hide everything first */
          body * {
            visibility: hidden;
          }

          /* Show only the receipt */
          .print-receipt-wrapper,
          .print-receipt-wrapper *,
          #print-receipt,
          #print-receipt * {
            visibility: visible !important;
          }

          .print-receipt-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            background: #ffffff !important;
          }

          #print-receipt {
            position: relative !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }

          /* Force all dark-mode backgrounds to white */
          .dark #print-receipt,
          .dark .print-receipt-wrapper,
          [data-theme="dark"] #print-receipt {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #18181b !important;
          }

          .no-print { display: none !important; }
          .print-show { display: flex !important; }
          .print-show-block { display: block !important; }
        }
      `}</style>

      {/* Confetti */}
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

      {/* ========== RECEIPT CONTAINER ========== */}
      <div id="print-receipt" className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] rounded-[32px] sm:rounded-[40px] border border-zinc-200 dark:border-white/[0.06] shadow-2xl dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)]">
        
        {/* Top Gradient Bar */}
        <div style={{ 
          height: '6px', 
          background: 'linear-gradient(90deg, #f97316, #ef4444, #8b5cf6)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        } as any}></div>

        {/* Decorative blurs - screen only */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/8 blur-[120px] rounded-full no-print"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-full no-print"></div>

        <div className="relative z-10 p-6 sm:p-10">
          
          {/* ===== PRINT HEADER (hidden on screen) ===== */}
          <div className="print-show hidden" style={{ 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '32px', 
            paddingBottom: '24px',
            borderBottom: '2px solid #e4e4e7',
          }}>
            <img src="/Scholix_light.png" alt="Scholix" style={{ height: '36px' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '6px 16px', 
                background: 'linear-gradient(135deg, #f97316, #ef4444)', 
                borderRadius: '8px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              } as any}>
                <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Transaction Receipt</span>
              </div>
              <p style={{ fontSize: '10px', color: '#71717a', fontWeight: 700, marginTop: '6px', fontFamily: 'monospace' }}>{receiptNumber}</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            
            {/* Screen Logo */}
            <div className="no-print flex items-center gap-2.5">
              <img src="/Scholix_light.png" alt="Scholix" className="h-6 dark:hidden" />
              <img src="/Scholix_dark.png" alt="Scholix" className="h-6 hidden dark:block" />
            </div>

            {/* Success Icon — screen only */}
            <div className="relative scale-in no-print">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 relative" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 check-animate"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>

            {/* Print Success Icon */}
            <div className="print-show hidden" style={{ justifyContent: 'center' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #34d399, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
              } as any}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            </div>

            {/* Thank You */}
            <div className="space-y-2 fade-up-1">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-none" style={{ color: '#18181b' }}>
                <span className="dark:text-white" style={{ printColorAdjust: 'exact' } as any}>Thank </span>
                <span style={{ color: '#f97316', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>You!</span>
              </h2>
              <p style={{ color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.25em', fontSize: '10px' }}>Your generosity keeps Scholix growing</p>
            </div>

            {/* Amount Card */}
            <div className="fade-up-2 w-full max-w-xs mx-auto">
              <div className="relative p-5 sm:p-6 rounded-[20px] overflow-hidden" style={{ 
                background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.05))',
                border: '1.5px solid rgba(249,115,22,0.2)',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
              } as any}>
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.3em', color: '#f97316', marginBottom: '4px', WebkitPrintColorAdjust: 'exact' } as any}>Amount Contributed</p>
                <p className="text-4xl sm:text-5xl font-black tracking-tighter" style={{ color: '#18181b' }}>
                  <span className="dark:text-white">₹{details.amount}</span>
                </p>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#a1a1aa', marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Indian Rupees</p>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="w-full fade-up-3 rounded-[20px] overflow-hidden" style={{ 
              border: '1.5px solid #e4e4e7',
              WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
            } as any}>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-3.5" style={{ 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))',
                borderBottom: '1.5px solid rgba(16,185,129,0.2)',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
              } as any}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34d399, #059669)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: '#059669' }}>Payment Verified</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ 
                  background: 'rgba(16,185,129,0.1)', 
                  border: '1px solid rgba(16,185,129,0.25)',
                  WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
                } as any}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}></span>
                  <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#059669' }}>Confirmed</span>
                </span>
              </div>

              {/* Grid */}
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment ID */}
                  <div className="p-3.5 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f4f4f5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                    <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#a1a1aa', marginBottom: '6px' }}>Payment ID</p>
                    <p className="truncate" style={{ fontWeight: 700, color: '#27272a', fontSize: '13px', fontFamily: 'ui-monospace, monospace' }}>{details.paymentId}</p>
                  </div>
                  {/* Order ID */}
                  <div className="p-3.5 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f4f4f5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                    <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#a1a1aa', marginBottom: '6px' }}>Order ID</p>
                    <p className="truncate" style={{ fontWeight: 700, color: '#27272a', fontSize: '13px', fontFamily: 'ui-monospace, monospace' }}>{details.orderId}</p>
                  </div>
                  {/* Contributor */}
                  <div className="p-3.5 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f4f4f5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                    <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#a1a1aa', marginBottom: '6px' }}>Contributor</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ 
                        background: 'linear-gradient(135deg, #f97316, #ef4444)', 
                        color: 'white', fontSize: '10px', fontWeight: 900,
                        WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
                      } as any}>
                        {(userProfile?.username || 'G')[0].toUpperCase()}
                      </div>
                      <p style={{ fontWeight: 700, color: '#27272a', fontSize: '13px' }}>{userProfile?.username || 'Community Supporter'}</p>
                    </div>
                  </div>
                  {/* Date */}
                  <div className="p-3.5 rounded-xl" style={{ background: '#fafafa', border: '1px solid #f4f4f5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
                    <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#a1a1aa', marginBottom: '6px' }}>Date & Time</p>
                    <p style={{ fontWeight: 700, color: '#27272a', fontSize: '13px' }}>{new Date(details.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {/* Receipt Reference */}
                <div className="flex items-center gap-3 mt-4 p-3.5 rounded-xl" style={{ 
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(239,68,68,0.04))', 
                  border: '1.5px solid rgba(249,115,22,0.15)',
                  WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
                } as any}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ 
                    background: 'linear-gradient(135deg, #f97316, #ef4444)', 
                    WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
                  } as any}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" /><polyline points="14 2 14 8 20 8" /><path d="M4 15h9" /><path d="M9 11l4 4-4 4" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#a1a1aa' }}>Receipt Reference</p>
                    <p style={{ fontWeight: 900, color: '#27272a', fontSize: '15px', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em' }}>{receiptNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== PRINT FOOTER ===== */}
            <div className="print-show hidden w-full" style={{ 
              alignItems: 'center', justifyContent: 'space-between', 
              paddingTop: '24px', marginTop: '8px',
              borderTop: '2px solid #e4e4e7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/Scholix_light.png" alt="Scholix" style={{ height: '20px' }} />
                <div style={{ width: '1px', height: '20px', background: '#d4d4d8' }}></div>
                <span style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 600 }}>scholix.app</span>
              </div>
              <p style={{ fontSize: '9px', color: '#a1a1aa', fontStyle: 'italic', maxWidth: '260px', textAlign: 'right' as const, lineHeight: '1.4' }}>
                Computer-generated receipt for your contribution to Scholix. No signature required.
              </p>
            </div>

            {/* ===== SCREEN FOOTER ===== */}
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
                className="flex-1 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                Print Receipt
              </button>
            </div>

            {/* Secured badge */}
            <div className="flex items-center gap-1.5 no-print opacity-40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Secured by Razorpay</span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Bar */}
        <div style={{ 
          height: '4px', 
          background: 'linear-gradient(90deg, #f97316, #ef4444, #8b5cf6)',
          WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
        } as any}></div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
