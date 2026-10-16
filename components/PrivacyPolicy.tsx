import React, { useEffect } from 'react';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const { shortBrandName, uniSlug } = useUniversity();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "Information We Collect",
            content: `We collect information you provide directly to us when you create an account, such as your name, email address, and profile details. We also record your academic interactions, including quiz scores, subjects studied, time taken per question, and study metrics to personalize your experience.`
        },
        {
            title: "Automatic Data Collection",
            content: `Like standard web platforms, we automatically collect basic technical logs (IP addresses, browser type, date/time stamps, referring pages) used strictly for performance diagnostics, trend analysis, and platform security.`
        },
        {
            title: "Third-Party Services",
            content: `${shortBrandName} integrates verified cloud infrastructure:
• Supabase: Managed encrypted database and secure authentication.
• Vercel: High-performance hosting, edge networks, and web analytics.
• Google Gemini AI: Powers study assistants and notes analysis.
• Google AdSense: Provides relevant ads to keep the platform free for students.`
        },
        {
            title: "Google AdSense & Cookies",
            content: `Google uses cookies to serve ads based on your visits to ${shortBrandName} and other sites. You may easily opt-out of personalized advertising anytime by visiting Google Ad Settings.`
        },
        {
            title: "Data Retention & Security",
            content: `Your data is stored using Supabase's encrypted infrastructure with SSL protocols. We retain your academic metrics only as long as your account remains active, and we never sell student data to third parties.`
        },
        {
            title: "GDPR & Student Rights",
            content: `You maintain complete control over your data:
1. Access and view the academic data held on your profile.
2. Update or correct inaccurate information in Account Settings.
3. Request complete account and data erasure anytime.
4. Opt out of non-essential tracking.`
        },
        {
            title: "Academic Integrity",
            content: `${shortBrandName} is an independent, student-centric academic assistant. We strictly adhere to academic ethics and require students to follow their institution's examination and conduct guidelines.`
        }
    ];

    return (
        <div className="w-full space-y-6 animate-fade-in pb-16 text-left">
            {/* Dedicated Clean Premium Header */}
            <header className="pb-5 border-b border-zinc-200/60 dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 mb-1">
                    <Lock className="w-3.5 h-3.5 text-brand-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Legal & Compliance
                    </p>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                    Privacy & <span className="text-brand-primary">Data Policy</span>
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
                    How {shortBrandName} handles, encrypts, and respects your academic data.
                </p>
            </header>

            {/* Intro text */}
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                At <strong className="text-zinc-900 dark:text-white">{shortBrandName}</strong> (accessible at {uniSlug ? `${uniSlug}.` : ''}scholix.app), protecting student data privacy and ensuring transparency are foundational commitments. This policy explains what information is collected, how it is used, and how you retain complete control over your profile.
            </p>

            {/* Policy Sections - Clean typographic layout without boxed container fatigue */}
            <div className="space-y-6 pt-2 divide-y divide-zinc-100 dark:divide-white/[0.05]">
                {sections.map((section, idx) => (
                    <div key={idx} className={idx > 0 ? "pt-5 space-y-1.5" : "space-y-1.5"}>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block" />
                            <span>{section.title}</span>
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line font-normal pl-3">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-zinc-200/60 dark:border-white/[0.06] text-center">
                <p className="text-[11px] text-zinc-400 font-normal">
                    By using {shortBrandName}, you agree to the terms described in this Privacy Policy.
                    <br />
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
