import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniversity } from '../hooks/useUniversity.tsx';

const ShieldSwordCrownIcon: React.FC = () => (
  <svg 
    viewBox="0 0 100 100" 
    className="w-20 h-20 text-orange-500 filter drop-shadow-[0_0_20px_rgba(249,115,22,0.45)] transition-transform duration-500 hover:scale-105" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Crossed Swords (Background) */}
    <path d="M22 78 L78 22 M27 73 L31 77 M73 27 L77 31" stroke="currentColor" strokeWidth="3.5" />
    <path d="M78 78 L22 22 M73 73 L69 77 M27 27 L31 31" stroke="currentColor" strokeWidth="3.5" />
    {/* Sword Hilts */}
    <circle cx="20" cy="80" r="2.5" fill="currentColor" />
    <circle cx="80" cy="80" r="2.5" fill="currentColor" />

    {/* Shield (Foreground) */}
    <path 
      d="M32 32 C32 32, 50 22, 50 22 C50 22, 68 32, 68 32 C68 52, 63 72, 50 82 C37 72, 32 52, 32 32 Z" 
      fill="url(#shieldGrad)" 
      stroke="currentColor" 
      strokeWidth="3.5" 
    />
    
    {/* Shield inner border */}
    <path 
      d="M37 36 C37 36, 50 28, 50 28 C50 28, 63 36, 63 36 C63 50, 59 66, 50 74 C41 66, 37 50, 37 36 Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeOpacity="0.4"
    />

    {/* Crown (Sitting on Top of Shield) */}
    <path 
      d="M36 17 L41 24 L50 19 L59 24 L64 17 L60 28 L40 28 Z" 
      fill="currentColor" 
      stroke="currentColor" 
      strokeWidth="1.5" 
    />
    {/* Crown Jewels */}
    <circle cx="36" cy="17" r="1.2" fill="currentColor" />
    <circle cx="50" cy="19" r="1.2" fill="currentColor" />
    <circle cx="64" cy="17" r="1.2" fill="currentColor" />

    {/* Gradients */}
    <defs>
      <linearGradient id="shieldGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.25)" />
        <stop offset="100%" stopColor="rgba(249, 115, 22, 0.02)" />
      </linearGradient>
    </defs>
  </svg>
);

const SecurityHallOfFame: React.FC = () => {
  const { shortBrandName } = useUniversity();
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'security_policy'>('hall_of_fame');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Clear researchers list for production (will be populated dynamically upon responsible disclosures)
  const researchers: {
    name: string;
    title?: string;
    avatar?: string;
    github?: string;
    website?: string;
    x_twitter?: string;
    linkedin?: string;
    contribution: string;
    date: string;
    badge: string;
    badgeColor: string;
  }[] = [];

  const contributors = [
    { name: "Anunay Yadav", role: "Creator & Solo Developer", label: "Core" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-12"
    >
      <div className="space-y-6">
        {/* Header Section with Custom Shield Logo */}
        <div className="flex flex-col items-center justify-center gap-4 text-center mt-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <ShieldSwordCrownIcon />
          </motion.div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Shield & Honor</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Security & Contributors
          </h1>
          <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Honoring the security researchers, developers, and beta testers who contributed their skills to harden and build Scholix.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-b border-zinc-200 dark:border-white/5 pb-2">
          <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('hall_of_fame')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'hall_of_fame'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              🏆 Hall of Fame
            </button>
            <button
              onClick={() => setActiveTab('security_policy')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === 'security_policy'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              🛡️ Security Policy
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] border border-zinc-100 dark:border-white/[0.02] transition-all">
          <AnimatePresence mode="wait">
            {activeTab === 'hall_of_fame' ? (
              <motion.div
                key="hof"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Security Researchers */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    Security Researchers
                  </h3>
                  <p className="text-xs text-zinc-500 pl-3.5">
                    We extend our gratitude to the following researchers for their responsible disclosures:
                  </p>
                  
                  {/* Premium Cards instead of squeezing table columns */}
                  <div className="grid grid-cols-1 gap-4 pl-3.5 pt-2">
                    {researchers.length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-white/5 bg-white/20 dark:bg-zinc-900/10 text-center space-y-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-650"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No disclosures reported yet</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 max-w-sm mx-auto">
                          If you responsibly disclose a security vulnerability in Scholix, you will be recognized here. Learn how to report under the "Security Policy" tab.
                        </p>
                      </div>
                    ) : (
                      researchers.map((r, idx) => (
                        <div 
                          key={idx} 
                          className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-white/[0.04] hover:border-orange-500/20 dark:hover:border-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {r.avatar ? (
                                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-white/10" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                                  {r.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm font-black text-zinc-950 dark:text-white tracking-tight">
                                    {r.name}
                                  </h4>
                                  {r.title && (
                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                                      ({r.title})
                                    </span>
                                  )}
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${r.badgeColor}`}>
                                    {r.badge}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                  {r.contribution}
                                </p>
                                
                                <div className="flex gap-2.5 pt-1.5">
                                  {r.github && (
                                    <a href={r.github} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                    </a>
                                  )}
                                  {r.website && (
                                    <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                    </a>
                                  )}
                                  {r.x_twitter && (
                                    <a href={r.x_twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                  )}
                                  {r.linkedin && (
                                    <a href={r.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-left md:text-right flex-shrink-0">
                              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                                Disclosed: {r.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Contributors */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    Top Contributors
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-3.5">
                    {contributors.map((c, idx) => (
                      <div 
                        key={idx} 
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/[0.03] hover:border-orange-500/10 flex flex-col justify-between hover:shadow-md transition-all duration-300"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black text-zinc-950 dark:text-white tracking-tight">{c.name}</h4>
                            <span className="text-[8px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded border border-orange-500/20">
                              {c.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal font-medium">{c.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Thanks */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    Special Thanks
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium pl-3.5">
                    We extend our gratitude to our university student community, and everyone who reported bugs, tested features, and supported the development of {shortBrandName}.
                  </p>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="policy"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed"
              >
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    Vulnerability Disclosure Program
                  </h3>
                  <p className="pl-3.5 font-medium">
                    At {shortBrandName}, user privacy and platform security are our top priorities. If you discover a vulnerability, we ask that you report it to us responsibly so we can fix it before it is disclosed publicly.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    How to Report
                  </h3>
                  <p className="pl-3.5 font-medium">
                    Please send security advisories directly to our development team via email at: 
                    <a href="mailto:anunayarvind@gmail.com" className="text-orange-600 font-bold ml-1 hover:underline">
                      anunayarvind@gmail.com
                    </a>
                  </p>
                  <p className="pl-3.5 font-bold text-zinc-850 dark:text-zinc-200 mt-2">
                    Please include:
                  </p>
                  <ul className="list-disc pl-8 space-y-1 font-medium">
                    <li>Detailed description of the vulnerability.</li>
                    <li>Step-by-step instructions or proof of concept to reproduce the issue.</li>
                    <li>Your name or alias if you wish to be credited in our Hall of Fame.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    Our Commitment
                  </h3>
                  <p className="pl-3.5 font-medium">
                    We pledge to work with you in good faith to resolve reports quickly. If you follow these guidelines, we will not pursue legal actions, suspend your account, or involve law enforcement against you.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">
                    Responsible Disclosure Rules
                  </h3>
                  <ul className="list-disc pl-8 space-y-1 font-medium">
                    <li>Do not perform load testing, denial of service (DoS), or spamming.</li>
                    <li>Do not access or modify data belonging to other users.</li>
                    <li>Do not use automated scanners that create high traffic spikes.</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityHallOfFame;
