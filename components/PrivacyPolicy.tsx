import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUniversity } from '../hooks/useUniversity.tsx';

const PrivacyPolicy: React.FC = () => {
    const { fullBrandName, shortBrandName, uniSlug } = useUniversity();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "Information We Collect",
            content: `We collect information you provide directly to us when you create an account, such as your name, email address, and profile picture. We also record your academic interactions, including quiz scores, subjects studied, time taken per question, XP earned, and leveling progress to personalize your experience.`
        },
        {
            title: "Automatic Data Collection",
            content: `Like most websites, we automatically collect certain technical information. This includes log file data (IP addresses, browser type, ISP, date/time stamps, referring/exit pages) which is used for trend analysis and site administration.`
        },
        {
            title: "Third-Party Services",
            content: `${shortBrandName} integrates several third-party services:
• Supabase: Managed database and authentication infrastructure.
• Vercel: Hosting provider with Web Analytics and Speed Insights.
• Google Gemini AI: Powers our 'Placement Prefect' and AI study tools. Queries may be processed by Google's LLM infrastructure.
• Google AdSense: Provides advertising services to keep the platform free.`
        },
        {
            title: "Google AdSense & Cookies",
            content: `Google uses cookies to serve ads based on your previous visits to ${shortBrandName} and other sites. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visits. You may opt-out of personalized advertising by visiting your Google Ad Settings.`
        },
        {
            title: "Data Retention & Security",
            content: `Your data is stored securely using Supabase's encrypted infrastructure. We retain your academic history only as long as your account remains active. We implement SSL encryption and multi-layered security protocols to prevent unauthorized access.`
        },
        {
            title: "GDPR & CCPA Rights",
            content: `Under various privacy laws, you have the right to:
1. Access the personal data we hold about you.
2. Request the correction of inaccurate information.
3. Request the absolute erasure of your account and data.
4. Opt-out of non-essential data collection.
To exercise these rights, please contact our support team.`
        },
        {
            title: "Children's Information",
            content: `${shortBrandName} does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child provided this information on our website, please contact us immediately for prompt removal.`
        },
        {
            title: "Academic Ethics",
            content: `${shortBrandName} is an independent student-led project. While we help students prepare for exams, we do not store university-sensitive 'official' data beyond what you manually enter. We encourage all users to follow the University's Academic Integrity rules.`
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pb-12"
        >
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 mb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Legal Compliance</span>
                    </div>
                </div>

                <div className="p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] space-y-6 transition-all">
                    <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                        At <span className="text-orange-600 font-bold">{shortBrandName}</span>, accessible from {uniSlug ? `${uniSlug}.` : ''}scholix.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by {shortBrandName} and how we use it.
                    </p>

                    <div className="grid grid-cols-1 gap-6">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-2">
                                <h3 className="text-[11px] font-black text-zinc-800 dark:text-white uppercase tracking-widest border-l-2 border-orange-500 pl-3">{section.title}</h3>
                                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line pl-3.5">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-zinc-200 dark:border-white/5 text-center">
                        <p className="text-[10px] text-zinc-400 font-medium italic">
                            By using our website, you hereby consent to our Privacy Policy and agree to its terms.<br/>
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;
