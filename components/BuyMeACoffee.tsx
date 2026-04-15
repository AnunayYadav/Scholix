import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';
import NexusServer from '../services/nexusServer.ts';

interface BuyMeACoffeeProps {
  userProfile?: UserProfile | null;
  className?: string;
}

const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({ userProfile, className }) => {
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

  return (
    <div className={`relative overflow-hidden p-8 sm:p-12 rounded-[24px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 shadow-sm ${className}`}>
      {/* Refined Background Gradients */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-5xl mx-auto">
        {/* Modern Header - Left side on laptop */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Support <span className="text-brand-primary">Scholix</span>
          </h3>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
            Join the community in supporting the growth and maintenance of Scholix. Your contributions help us keep the servers running and develop new AI features.
          </p>
        </div>

        {/* Action Card - Right side on laptop */}
        <div className="w-full md:w-[400px] shrink-0 space-y-6 bg-zinc-50/50 dark:bg-white/[0.02] p-6 sm:p-8 rounded-[32px] border border-zinc-200 dark:border-white/5 backdrop-blur-sm shadow-xl dark:shadow-2xl">
          <div className="grid grid-cols-2 gap-3">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                disabled={loading}
                onClick={() => { setAmount(amt); setCustomAmount(''); }}
                className={`relative py-3.5 rounded-xl text-sm font-semibold transition-all border ${amount === amt && !customAmount 
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30 ring-1 ring-brand-primary/20' 
                  : 'bg-white dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 shadow-sm'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium text-lg">₹</div>
            <input
              type="number"
              placeholder="Custom Amount"
              value={customAmount}
              onChange={(e) => {
                const val = e.target.value;
                setCustomAmount(val);
                if (val) setAmount(Number(val));
              }}
              className="w-full pl-9 pr-16 py-4 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all no-spinner"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold tracking-widest uppercase opacity-60">
              INR
            </div>
          </div>

          <button
            onClick={() => handlePayment(amount)}
            disabled={loading || amount < 1}
            className={`group w-full py-4 rounded-xl bg-brand-primary text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-brand-primary/10 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-primary/90 hover:shadow-brand-primary/20'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Checkout</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </>
            )}
          </button>

          {/* Secure Footer */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 group transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Protected by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyMeACoffee;
