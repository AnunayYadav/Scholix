import React, { useState, useEffect, useRef } from 'react';
import NexusServer from '../services/nexusServer.ts';
import { UserProfile } from '../types.ts';

const StatCounter: React.FC<{ target: number; label: string; subLabel: string; accentColor: string; isVisible: boolean; isAdmin?: boolean }> = ({ target, label, subLabel, accentColor, isVisible, isAdmin }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible && target > 0) {
      const duration = 4000; // Updated to 4 seconds
      const startTime = performance.now();

      const updateCount = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function: easeOutExpo
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentCount = Math.floor(easeProgress * target);

        setCount(currentCount);
        countRef.current = currentCount;

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(updateCount);
        }
      };

      animationRef.current = requestAnimationFrame(updateCount);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, target]);

  return (
    <div className={`space-y-1 ${isAdmin ? 'animate-pulse scale-95 opacity-80' : ''}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${accentColor} opacity-80`}>{label}</p>
      <h4 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
        {count.toLocaleString()}{(!label.includes('Global') && !isAdmin) ? '' : '+'}
      </h4>
      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-2">{subLabel}</p>
    </div>
  );
};

interface AboutUsProps {
  userProfile: UserProfile | null;
}

const AboutUs: React.FC<AboutUsProps> = ({ userProfile }) => {
  const [stats, setStats] = useState<{ registered: number; visitors: number; totalViews: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await NexusServer.getSiteStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch impact stats");
        setStats({ registered: 0, visitors: 0, totalViews: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (metricsRef.current) {
      observer.observe(metricsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-24 px-4 md:px-0">
      {/* About Us - Hero Header */}
      <section className="text-center space-y-4 pt-8">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Us</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.4em]">The AI-Powered Student Community</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/5 space-y-4">
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-4">The Mission</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            LPU-Nexus was born from a simple observation: campus life is complex. Between tracking attendance, calculating CGPA, and preparing for placements, students are often overwhelmed.
            <br /><br />
            Our mission is to consolidate these fragmented experiences into a single, high-performance platform powered by cutting-edge AI.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[40px] border border-slate-200 dark:border-white/5 space-y-4">
          <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-4">Key Innovation</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            By integrating <strong>Google's Gemini AI</strong>, we provide tools that don't just calculate numbers but offer strategic insights.
            From "Placement Prefect" to "Global Gateway", Nexus is designed to be your academic advantage.
          </p>
        </div>
      </section>

      {/* Credit & Heritage Section */}
      <section className="p-10 md:p-16 rounded-[60px] bg-white/[0.03] dark:bg-black/20 backdrop-blur-3xl text-slate-800 dark:text-white shadow-[0_32px_128px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden transition-all duration-700 group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05)_0%,transparent_70%)] pointer-events-none" />
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -ml-32 -mb-32"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-6">Architect & Heritage</h3>
              <p className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight text-slate-800 dark:text-white">
                <span className="whitespace-nowrap">Made with <span className="text-orange-500 underline decoration-slate-200 dark:decoration-white/10 underline-offset-8">Purpose</span>.</span><br />
                <span className="whitespace-nowrap">For the <span className="text-orange-500">Future</span>.</span>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Lead Developer</p>
                <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Anunay Yadav</p>
              </div>

              <div className="flex gap-12 pt-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Batch</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">2025-29</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Branch</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">CSE</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6">
              {[
                { label: 'Email', icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>, url: 'https://mail.google.com/mail/?view=cm&fs=1&to=anunayarvind@gmail.com' },
                { label: 'Insta', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>, url: 'https://www.instagram.com/anunay07' },
                { label: 'LinkedIn', icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>, url: 'https://www.linkedin.com/in/anunayyadav/' },
                { label: 'GitHub', icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />, url: 'https://github.com/AnunayYadav' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-white/5 dark:bg-white/[0.05] border border-white/5 hover:border-orange-500/50 transition-all group px-4 py-2 rounded-xl backdrop-blur-md"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform">{link.icon}</svg>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Integrated Impact Metrics (Right) */}
          <div ref={metricsRef} className="lg:col-span-5 flex flex-col justify-center space-y-12 pl-0 lg:pl-12 border-t lg:border-t-0 lg:border-l border-white/10 pt-10 lg:pt-0">
            {loading ? (
              <div className="space-y-12 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="h-2 w-24 bg-slate-200 dark:bg-white/10 rounded shimmer" />
                    <div className="h-12 w-48 bg-slate-200 dark:bg-white/10 rounded shimmer" />
                    <div className="h-2 w-32 bg-slate-200 dark:bg-white/10 rounded shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <StatCounter
                  target={stats?.visitors || 0}
                  label="Unique Visitors"
                  subLabel="Session-based traffic"
                  accentColor="text-blue-400"
                  isVisible={isSectionVisible}
                />
                {userProfile?.is_admin && (
                  <StatCounter
                    target={stats?.totalViews || 0}
                    label="Admin Only: Views"
                    subLabel="Total raw hits / reloads"
                    accentColor="text-emerald-500"
                    isVisible={isSectionVisible}
                    isAdmin={true}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="text-center pt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-50">
          LPU-Nexus v1.3.0 • Independent Student Project
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
