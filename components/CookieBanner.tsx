import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Delay showing it for a premium feel
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[9999]"
                >
                    <div className="glass-panel p-6 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/70 dark:bg-black/60 backdrop-blur-3xl overflow-hidden relative group">
                        {/* Detail accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                        
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-orange-600">
                                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                                        <path d="M8.5 8.5v.01" />
                                        <path d="M16 15.5v.01" />
                                        <path d="M12 12v.01" />
                                        <path d="M11 17v.01" />
                                        <path d="M7 13v.01" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Cookie Preference</h4>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                        We use cookies to improve your experience, analyze site performance, and serve personalized ads. By clicking "Accept All", you agree to our usage of these tools.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleAccept}
                                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                                >
                                    Accept All
                                </button>
                                <a 
                                    href="/privacy"
                                    className="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                                >
                                    Details
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
