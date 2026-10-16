import React, { useState, useEffect } from 'react';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { 
  ShieldCheck, 
  Award, 
  Mail, 
  Copy, 
  Check, 
  Lock, 
  Code2, 
  Heart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { showToast } from './Toast.tsx';

const SecurityHallOfFame: React.FC = () => {
  const { shortBrandName } = useUniversity();
  const [activeTab, setActiveTab] = useState<'hall_of_fame' | 'security_policy'>('hall_of_fame');
  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Real data only - no dummy data
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

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setHasCopiedEmail(true);
    showToast("Security email copied to clipboard", "success");
    setTimeout(() => setHasCopiedEmail(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in pb-16 text-left">
      {/* Dedicated Clean Premium Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-zinc-200/60 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Platform Integrity
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Security & <span className="text-brand-primary">Contributors</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
            Recognizing security researchers and developers who help build, harden, and protect {shortBrandName}.
          </p>
        </div>

        {/* Minimal Segment Toggle */}
        <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/[0.05] shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('hall_of_fame')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
              activeTab === 'hall_of_fame'
                ? 'bg-white dark:bg-[#1c1c20] text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-transparent'
            }`}
          >
            Hall of Fame
          </button>
          <button
            onClick={() => setActiveTab('security_policy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-none ${
              activeTab === 'security_policy'
                ? 'bg-white dark:bg-[#1c1c20] text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-transparent'
            }`}
          >
            Security Policy
          </button>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === 'hall_of_fame' ? (
        <div className="space-y-7">
          {/* Security Researchers Section - Clean, minimal without box inside box */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-primary" />
                <span>Security Researchers</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              Researchers acknowledged for responsible vulnerability disclosures:
            </p>

            {researchers.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/[0.03] text-zinc-400 dark:text-zinc-600 flex items-center justify-center mx-auto">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  No disclosures reported yet
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  If you responsibly disclose a security vulnerability in {shortBrandName}, your name and handle will be honored here. Learn how to report under the Security Policy tab.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100/60 dark:divide-white/[0.04]">
                {researchers.map((r, idx) => (
                  <div
                    key={idx}
                    className="py-3 px-1 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {r.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                            {r.name}
                          </h4>
                          {r.title && (
                            <span className="text-[10px] text-zinc-400">({r.title})</span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary">
                            {r.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {r.contribution}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {r.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Core Contributors - Clean list row without heavy boxes */}
          <section className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-brand-primary" />
              <span>Core Contributors</span>
            </h2>

            <div className="space-y-1">
              {contributors.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-100/60 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {c.role}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Minimal Community Thanks Note */}
          <div className="pt-4 border-t border-zinc-100 dark:border-white/[0.04] flex items-center gap-2 text-zinc-400">
            <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              Special thanks to our student community, beta testers, and peers who provide feedback and report issues to keep {shortBrandName} reliable for everyone.
            </p>
          </div>
        </div>
      ) : (
        /* Security Policy Tab - Clean typographic layout WITHOUT bulky boxes & outlines */
        <div className="space-y-7">
          {/* Program Overview */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Vulnerability Disclosure Program
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              At {shortBrandName}, student data privacy and platform integrity are top priorities. If you discover a potential vulnerability in our APIs or user interfaces, we encourage you to report it to us responsibly before public disclosure.
            </p>
          </div>

          {/* How to Report */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-white/[0.05]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-primary" />
              <span>How to Report</span>
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-normal">
              Direct your technical advisory to our security and engineering contact:
            </p>

            {/* Clean inline email pill without double box */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/[0.06]">
              <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-white">
                anunayarvind@gmail.com
              </span>
              <button
                onClick={() => handleCopyEmail('anunayarvind@gmail.com')}
                className="p-1 rounded text-zinc-400 hover:text-brand-primary transition-colors border-none bg-transparent cursor-pointer"
                title="Copy email"
              >
                {hasCopiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                Please include in your report:
              </span>
              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 list-disc pl-4 font-normal">
                <li>Summary of the vulnerability and affected endpoints or pages.</li>
                <li>Clear reproduction steps, HTTP request samples, or minimal proof-of-concept.</li>
                <li>Your name, handle, or preferred attribution for the Hall of Fame.</li>
              </ul>
            </div>
          </div>

          {/* Commitment & Scope - Clean, breathable 2-column layout WITHOUT heavy card boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-zinc-100 dark:border-white/[0.05]">
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Our Commitment (Safe Harbor)</span>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                If you report vulnerabilities in good faith and adhere to these guidelines, we will not pursue legal action, suspend your account, or refer the matter to campus disciplinary committees.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Out of Scope / Restrictions</span>
              </h4>
              <ul className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 list-disc pl-4 font-normal">
                <li>Denial of Service (DoS/DDoS) and stress testing.</li>
                <li>Accessing or tampering with another user's personal data.</li>
                <li>Social engineering, phishing, or physical attacks.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityHallOfFame;
