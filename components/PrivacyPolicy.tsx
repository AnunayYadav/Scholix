import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "Information We Collect",
            content: "We collect information you provide directly to us when you create an account, such as your name, email address, and profile picture. We also record your academic interactions, including quiz scores, subjects studied, time taken per question, XP earned, and leveling progress to personalize your experience. If you use the Marketplace or Roommate search, we store your listing details, preferences, and contact information you choose to provide."
        },
        {
            title: "Automatic Data Collection",
            content: "Like most websites, we automatically collect certain technical information. This includes log file data (IP addresses, browser type, ISP, date/time stamps, referring/exit pages) which is used for trend analysis and site administration."
        },
        {
            title: "Marketplace & Roommate Interactions",
            content: "When using our community features, your public profile (username, avatar, batch) may be visible to other users. In the Marketplace, your specified contact method (email/phone/whatsapp) is shared with potential buyers. In Roommate Search, your lifestyle preferences and budget are stored to help match you with suitable partners."
        },
        {
            title: "Third-Party Services",
            content: "LPU-Nexus integrates several third-party services:\n• Supabase: Managed database and authentication infrastructure.\n• Vercel: Hosting provider with Web Analytics and Speed Insights.\n• Google Gemini AI: Powers our 'Placement Prefect' and AI study tools. Queries may be processed by Google's LLM infrastructure.\n• Google AdSense: Provides advertising services to keep the platform free."
        },
        {
            title: "Google AdSense & Cookies",
            content: "Google uses cookies to serve ads based on your previous visits to LPU-Nexus and other sites. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visits. You may opt-out of personalized advertising by visiting your Google Ad Settings."
        },
        {
            title: "Data Retention & Security",
            content: "Your data is stored securely using Supabase's encrypted infrastructure. We retain your academic history only as long as your account remains active. We implement SSL encryption and multi-layered security protocols to prevent unauthorized access."
        },
        {
            title: "GDPR & CCPA Rights",
            content: "Under various privacy laws, you have the right to:\n1. Access the personal data we hold about you.\n2. Request the correction of inaccurate information.\n3. Request the absolute erasure of your account and data.\n4. Opt-out of non-essential data collection.\nTo exercise these rights, please contact our support team."
        },
        {
            title: "Children's Information",
            content: "LPU-Nexus does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child provided this information on our website, please contact us immediately for prompt removal."
        },
        {
            title: "Academic Ethics",
            content: "LPU-Nexus is an independent student-led project. While we help students prepare for exams, we do not store university-sensitive 'official' data beyond what you manually enter. We encourage all users to follow the University's Academic Integrity rules."
        }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-6 py-12 md:py-24"
        >
            <div className="space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Legal Compliance</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tight">Privacy Policy</h1>
                    <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="glass-panel p-8 md:p-12 rounded-[48px] space-y-10 border-slate-200 dark:border-white/10">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        At <span className="text-orange-600 font-bold">LPU-Nexus</span>, accessible from lpu-nexus.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by LPU-Nexus and how we use it.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-3">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm opacity-80">{section.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-slate-100 dark:border-white/5">
                        <div className="bg-slate-50 dark:bg-white/[0.02] p-8 rounded-3xl border border-slate-200 dark:border-white/10 text-center">
                            <h4 className="text-slate-800 dark:text-white font-black mb-2">Consent & Agreement</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
                            <div className="flex justify-center gap-4">
                                <a href="mailto:anunayarvind@gmail.com" className="px-6 py-3 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all">Support Contact</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;
