import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import NexusServer from '../services/nexusServer.ts';

interface BuyMeACoffeeProps {
  userProfile?: UserProfile | null;
  className?: string;
  compact?: boolean;
}

const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({ userProfile, className = '', compact = false }) => {
  const { studentTerm } = useUniversity();
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (selectedAmount: number) => {
    if (loading || isProcessing) return;
    setLoading(true);
    setIsProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        setLoading(false);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to initiate payment');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Scholix",
        description: "Support Scholix Development",
        image: "/logo.png",
        order_id: orderData.id,
        handler: function (response: any) {
          setIsProcessing(false);
          setLoading(false);
          
          const paymentId = response.razorpay_payment_id;
          const orderId = response.razorpay_order_id;
          const signature = response.razorpay_signature;
          const receiptReference = `SCX-${paymentId.slice(-8).toUpperCase()}`;
          const paymentDate = new Date().toISOString();

          NexusServer.saveTransaction({
            paymentId,
            orderId,
            signature,
            amount: selectedAmount,
            receiptReference,
            userId: userProfile?.id || null,
            userEmail: userProfile?.email || null,
            userUsername: userProfile?.username || null,
          }).catch(err => console.error('Background transaction save failed:', err));

          navigate('/payment-success', { 
            state: { 
              paymentId,
              orderId,
              signature,
              amount: selectedAmount,
              date: paymentDate,
              receiptReference,
            } 
          });
        },
        prefill: {
          name: userProfile?.username || studentTerm,
          email: userProfile?.email || "",
          contact: ""
        },
        theme: {
          color: "#09090b",
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment Error:', error);
      alert(error.message);
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const presetAmounts = [50, 100, 200, 500];

  return compact ? (
    <div className={`p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-zinc-200/80 dark:border-white/[0.06] max-w-[440px] mx-auto ${className}`}>
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            Community Support
          </div>
          <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Support Scholix
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
            Help fund server maintenance and free tools for students.
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((amt) => {
              const isSelected = amount === amt && !customAmount;
              return (
                <button
                  key={amt}
                  type="button"
                  disabled={loading}
                  onClick={() => { setAmount(amt); setCustomAmount(''); }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-brand-primary text-white border-transparent'
                      : 'bg-zinc-50 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 border-zinc-200/70 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-brand-primary/30'
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">₹</span>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                const val = e.target.value;
                setCustomAmount(val);
                if (val) setAmount(Number(val));
              }}
              className="w-full pl-7 pr-11 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06] text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-primary/60 dark:focus:border-brand-primary/50 transition-colors no-spinner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">
              INR
            </span>
          </div>

          <button
            type="button"
            onClick={() => handlePayment(amount)}
            disabled={loading || amount < 1}
            className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={13} strokeWidth={2} />
                <span>Pay ₹{amount}</span>
                <ArrowRight size={13} className="ml-0.5 opacity-80" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck size={13} className="text-brand-primary/70" />
            <span>Payments secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={`p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c0c0e] border border-zinc-200/80 dark:border-white/[0.06] ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 max-w-5xl mx-auto">
        {/* Left Side: Editorial Apple Typography */}
        <div className="flex-1 space-y-2.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            Community Support
          </div>

          <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            Support Scholix
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal max-w-md mx-auto md:mx-0">
            Scholix is completely free and built for students. Your contribution directly covers hosting costs, database upkeep, and the development of new features.
          </p>

          <div className="hidden sm:flex items-center gap-4 pt-1 text-[12px] text-zinc-400 dark:text-zinc-500 justify-center md:justify-start">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-brand-primary/80" />
              100% Encrypted & Safe
            </span>
            <span>•</span>
            <span>No recurring subscription</span>
          </div>
        </div>

        {/* Right Side: Flat Minimal Apple Payment Box */}
        <div className="w-full md:w-[360px] shrink-0 p-5 sm:p-6 rounded-2xl bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200/70 dark:border-white/[0.05] space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Select amount</span>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">INR</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amt) => {
                const isSelected = amount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={loading}
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-brand-primary text-white border-transparent'
                        : 'bg-white dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:border-brand-primary/30'
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">₹</span>
            <input
              type="number"
              placeholder="Or enter custom amount"
              value={customAmount}
              onChange={(e) => {
                const val = e.target.value;
                setCustomAmount(val);
                if (val) setAmount(Number(val));
              }}
              className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.06] text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-primary/60 dark:focus:border-brand-primary/50 transition-colors no-spinner"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">
              INR
            </span>
          </div>

          <button
            type="button"
            onClick={() => handlePayment(amount)}
            disabled={loading || amount < 1}
            className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={14} strokeWidth={2} />
                <span>Contribute ₹{amount}</span>
                <ArrowRight size={14} className="ml-0.5 opacity-80" />
              </>
            )}
          </button>

          <div className="pt-0.5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck size={13} className="text-brand-primary/70" />
            <span>Payments secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyMeACoffee;
