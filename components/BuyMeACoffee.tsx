import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types.ts';

interface BuyMeACoffeeProps {
  userProfile?: UserProfile | null;
  className?: string;
}

const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({ userProfile, className }) => {
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
        name: "LPU-Nexus",
        description: "Support the creator",
        image: "https://lpu-nexus.vercel.app/logo.png", // Replace with actual logo URL
        order_id: orderData.id,
        handler: function (response: any) {
          // Success callback
          setIsProcessing(false);
          setLoading(false);
          
          // Redirect to success page with data
          navigate('/payment-success', { 
            state: { 
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: selectedAmount,
              date: new Date().toISOString()
            } 
          });
        },
        prefill: {
          name: userProfile?.username || "Verto",
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
    <div className={`relative overflow-hidden p-5 sm:p-10 md:p-14 rounded-[32px] sm:rounded-[48px] bg-white/5 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 ${className}`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 blur-[60px] rounded-full -ml-24 -mb-24"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-14">
        {/* Left Side: Info */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-orange-500"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Buy me a coffee</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">LPU-Nexus</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
            Maintaining servers and developing AI features costs money. If Nexus helped you, consider supporting its growth.
          </p>
        </div>

        {/* Right Side: Action */}
        <div className="w-full md:w-auto shrink-0 space-y-6 bg-white/10 dark:bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 rounded-[32px] border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 gap-2.5">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                disabled={loading}
                onClick={() => { setAmount(amt); setCustomAmount(''); }}
                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${amount === amt && !customAmount ? 'bg-orange-500 text-white border-orange-400 shadow-[0_8px_20px_rgba(249,115,22,0.3)]' : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-orange-500/50'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              placeholder="Custom Amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (e.target.value) setAmount(Number(e.target.value));
              }}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">INR</span>
          </div>

          <button
            onClick={() => handlePayment(amount)}
            disabled={loading || amount < 1}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-orange-500/40 hover:-translate-y-1'}`}
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 2v20M2 12h20" /></svg>
            )}
            {loading ? 'Processing...' : 'Support Creator'}
          </button>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-60">
            Securely processed via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyMeACoffee;
