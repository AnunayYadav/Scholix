import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Check, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import NexusServer from '../services/nexusServer.ts';

interface BuyMeACoffeeProps {
  userProfile?: UserProfile | null;
  className?: string;
  compact?: boolean;
}

const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({ userProfile, className, compact = false }) => {
  const { fullBrandName, shortBrandName, studentTerm } = useUniversity();
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script if needed, though usually fine to keep
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handlePayment = async (selectedAmount: number) => {
    if (loading || isProcessing) return;
    setLoading(true);
    setIsProcessing(true);

    try {
      // 1. Create order on the server
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedAmount }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to initiate payment');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,

        currency: orderData.currency,
        name: "Scholix",
        description: "Support Scholix Development",
        image: "/logo.png", // Dynamic logo from public directory
        order_id: orderData.id,
        handler: function (response: any) {
          // Success callback
          setIsProcessing(false);
          setLoading(false);
          
          const paymentId = response.razorpay_payment_id;
          const orderId = response.razorpay_order_id;
          const signature = response.razorpay_signature;
          const receiptReference = `SCX-${paymentId.slice(-8).toUpperCase()}`;
          const paymentDate = new Date().toISOString();

          // Save transaction to Supabase (fire-and-forget — don't block navigation)
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

          // Redirect to success page with data
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
          color: "#f97316", // orange-500
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
    <div className={`relative p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] transition-all max-w-[500px] mx-auto ${className}`}>
      <div className="relative z-10 flex flex-col gap-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-1">
            <Heart className="w-3 h-3 text-brand-primary fill-brand-primary" />
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Support Our Mission</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Support <span className="text-brand-primary">Scholix</span>
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Join the community in supporting Scholix. Your contributions help keep the servers running.
          </p>
        </div>

        <div className="w-full space-y-4 bg-white dark:bg-[#0a0a0a] p-5 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm">
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 px-1">Choose an amount</p>
            <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                disabled={loading}
                onClick={() => { setAmount(amt); setCustomAmount(''); }}
                className={`relative py-2.5 rounded-xl text-xs font-bold transition-all border ${amount === amt && !customAmount 
                  ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/30 ring-1 ring-brand-primary/10' 
                  : 'bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
              >
                ₹{amt}
                {amount === amt && !customAmount && (
                  <div className="absolute top-1 right-1">
                    <div className="bg-brand-primary rounded-full p-0.5">
                      <Check className="w-1.5 h-1.5 text-white stroke-[4]" />
                    </div>
                  </div>
                )}
              </button>
            ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm">₹</div>
            <input
              type="number"
              placeholder="Custom Amount"
              value={customAmount}
              onChange={(e) => {
                const val = e.target.value;
                setCustomAmount(val);
                if (val) setAmount(Number(val));
              }}
              className="w-full pl-8 pr-12 py-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-xs font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all no-spinner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-black tracking-widest uppercase opacity-60">
              INR
            </div>
          </div>

          <button
            onClick={() => handlePayment(amount)}
            disabled={loading || amount < 1}
            className={`w-full py-3 rounded-xl bg-brand-primary text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg shadow-brand-primary/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-primary/90'}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Secure Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100 dark:border-white/5"></div>
              </div>
              <div className="relative bg-white dark:bg-[#0a0a0a] px-2">
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                  Secure payments powered by
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100 dark:border-white/5"></div>
              </div>
              <div className="relative bg-white dark:bg-[#0a0a0a] px-3">
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">
                  Secure payments powered by
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-[#111111] border border-zinc-100 dark:border-white/10 shadow-sm">
                <img src="/Razorpay_logo.svg" alt="Razorpay" className="h-3 w-auto dark:brightness-150 dark:contrast-125" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/50 dark:bg-[#0d1a14] border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <p className="text-[8px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-wider">
                  100% Secured
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={`relative overflow-hidden p-8 sm:p-12 rounded-[32px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 shadow-sm ${className}`}>
      {/* Refined Background Gradients */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-5xl mx-auto">
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-2 transition-transform hover:scale-105 cursor-default">
            <Heart className="w-4 h-4 text-brand-primary fill-brand-primary" />
            <span className="text-xs font-bold text-brand-primary tracking-wide">Support Our Mission</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Support <span className="text-brand-primary">Scholix</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
            Join the community in supporting the growth and maintenance of Scholix. Your contributions help us keep the servers running and develop new AI features.
          </p>
        </div>

        <div className="w-full md:w-[400px] shrink-0 space-y-6 bg-zinc-50/50 dark:bg-white/[0.02] p-6 sm:p-8 rounded-[32px] border border-zinc-200 dark:border-white/5 backdrop-blur-sm shadow-xl dark:shadow-2xl">
          <div className="space-y-4">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 px-1">Choose an amount</p>
            <div className="grid grid-cols-2 gap-3">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                disabled={loading}
                onClick={() => { setAmount(amt); setCustomAmount(''); }}
                className={`relative py-4 rounded-xl text-base font-bold transition-all border ${amount === amt && !customAmount 
                  ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/40 ring-1 ring-brand-primary/20' 
                  : 'bg-white dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 shadow-sm'}`}
              >
                ₹{amt}
                {amount === amt && !customAmount && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-brand-primary rounded-full p-0.5 shadow-lg shadow-brand-primary/20">
                      <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                    </div>
                  </div>
                )}
              </button>
            ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-lg">₹</div>
            <input
              type="number"
              placeholder="Custom Amount"
              value={customAmount}
              onChange={(e) => {
                const val = e.target.value;
                setCustomAmount(val);
                if (val) setAmount(Number(val));
              }}
              className="w-full pl-10 pr-16 py-4.5 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-sm font-bold text-zinc-900 dark:text-zinc-100 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary transition-all no-spinner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold tracking-widest uppercase opacity-60">
              INR
            </div>
          </div>

          <button
            onClick={() => handlePayment(amount)}
            disabled={loading || amount < 1}
            className={`group w-full py-4.5 rounded-xl bg-brand-primary text-white font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-brand-primary/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-primary/90 hover:shadow-brand-primary/30'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Secure Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="space-y-5 pt-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-white/5"></div>
              </div>
              <div className="relative bg-zinc-50 dark:bg-[#0d0d0d] px-5">
                <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                  Secure payments powered by
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/10 shadow-sm transition-all hover:border-blue-500/30">
                <img src="/Razorpay_logo.svg" alt="Razorpay" className="h-4.5 w-auto dark:brightness-150 dark:contrast-125" />
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 dark:bg-[#0d1a14] border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-all hover:border-emerald-500/40">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                  100% Secured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyMeACoffee;
