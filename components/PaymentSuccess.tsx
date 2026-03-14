import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types.ts';

interface PaymentSuccessProps {
  userProfile: UserProfile | null;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ userProfile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);

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
    // Save to database once details are available
    if (details && !details.saved) {
      const saveToDb = async () => {
        try {
          await fetch('/api/save-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...details,
              userId: userProfile?.id,
              userEmail: userProfile?.email,
              userUsername: userProfile?.username
            }),
          });
          // Mark as saved to prevent duplicate calls in dev React StrictMode
          setDetails((prev: any) => ({ ...prev, saved: true }));
        } catch (error) {
          console.error('Failed to sync transaction with database:', error);
        }
      };
      saveToDb();
    }
  }, [details, userProfile]);

  if (!details) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Transaction...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 animate-fade-in print:p-0 print:m-0 print:max-w-none">
      <style>{`
        @media print {
          /* Hide everything except the receipt card */
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
          /* Remove background colors/shadows for better printing if needed, 
             but we want to keep the premium look if the printer supports it */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="print-area" className="relative overflow-hidden bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[48px] border border-slate-200 dark:border-white/10 p-8 sm:p-12 shadow-[0_32px_128px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_128px_rgba(0,0,0,0.5)] print:shadow-none print:border-slate-300 print:rounded-none">
        {/* Background Decor - Hidden in print for clarity */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50 print:hidden"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full print:hidden"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full print:hidden"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          {/* Header for print */}
          <div className="hidden print:flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl">N</div>
            <div className="text-left">
              <h1 className="text-xl font-black tracking-tighter text-slate-900">LPU-NEXUS</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Official Transaction Receipt</p>
            </div>
          </div>

          {/* Success Icon */}
          <div className="relative print:scale-75">
            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse print:hidden"></div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 relative print:shadow-none">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-12 h-12"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Thank <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 print:text-orange-600">You!</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs">Your support keeps Nexus growing</p>
          </div>

          {/* Receipt Card */}
          <div className="w-full bg-slate-50 dark:bg-black/20 rounded-[32px] border border-slate-200 dark:border-white/5 p-6 sm:p-8 space-y-6 print:bg-white print:border-slate-300">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-4 print:border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Status</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5 print:text-emerald-700 print:border-emerald-700 print:bg-emerald-50 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 print:bg-emerald-700"></span>
                Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment ID</p>
                <p className="font-bold text-slate-800 dark:text-white truncate text-sm print:text-slate-900">{details.paymentId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</p>
                <p className="font-bold text-slate-800 dark:text-white truncate text-sm print:text-slate-900">{details.orderId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight print:text-slate-900">₹{details.amount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verto Name</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm print:text-slate-900">{userProfile?.username || 'Guest Verto'}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Date</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm print:text-slate-900">{new Date(details.date).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/5 print:border-slate-200">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic print:text-slate-600">
                This is a computer-generated receipt for your contribution to LPU-Nexus. 
                Thank you for being part of the community.
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full no-print print:hidden">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm"
            >
              Return Home
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default PaymentSuccess;
