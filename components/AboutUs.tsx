import React, { useState, useEffect, useRef } from 'react';
import NexusServer from '../services/nexusServer.ts';
import { UserProfile } from '../types.ts';
import { useUniversity } from '../hooks/useUniversity.tsx';

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
    <div className="space-y-1">
      <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${accentColor} opacity-80`}>{label}</p>
      <h4 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-none">
        {count.toLocaleString()}{(!label.includes('Global') && !isAdmin) ? '' : '+'}
      </h4>
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">{subLabel}</p>
    </div>
  );
};

import BuyMeACoffee from './BuyMeACoffee';

interface AboutUsProps {

  userProfile: UserProfile | null;
}

const AboutUs: React.FC<AboutUsProps> = ({ userProfile }) => {
  const { fullBrandName, shortBrandName, universityInfo } = useUniversity();
  const universityShortName = universityInfo?.shortName || 'University';

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
    <div className="w-full space-y-6 animate-fade-in pb-12">
      {/* Hero Header Removed (Managed by SettingsHub) */}
      <div className="flex flex-col items-center justify-center gap-4 mb-6 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em]">The New Era of Scholix</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] space-y-4 transition-all">
          <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-widest">The Mission</h3>
          <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            Scholix was born from a simple observation: campus life is complex. Between tracking attendance, calculating CGPA, and preparing for placements, students are often overwhelmed.
            <br /><br />
            Our mission is to consolidate these fragmented experiences into a single, high-performance platform powered by cutting-edge AI.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] space-y-4 transition-all">
          <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-widest">Key Innovation</h3>
          <p className="text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            By integrating <strong>Google's Gemini AI</strong>, we provide tools that don't just calculate numbers but offer strategic insights.
            From "Placement Prefect" to "Global Gateway", Scholix is designed to be your academic advantage.
          </p>
        </div>
      </section>

      {/* Credit & Heritage Section */}
      <section className="p-6 md:p-8 rounded-[32px] bg-zinc-50 dark:bg-[#111111] text-zinc-800 dark:text-white relative overflow-hidden transition-all duration-700 mt-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none" />
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/5 blur-[60px] rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Main Content (Left) */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-[10px] sm:text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] mb-3">Architect & Heritage</h3>
              <p className="text-2xl lg:text-3xl font-black tracking-tighter mb-2 leading-tight text-zinc-800 dark:text-white">
                Made with <span className="text-orange-500 underline decoration-white/10 underline-offset-4">Purpose</span>.<br />
                For the <span className="text-orange-500">Future</span>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Lead Developer</p>
                <p className="text-2xl font-black text-zinc-800 dark:text-white tracking-tight">Anunay Yadav</p>
              </div>

              <div className="flex gap-8 pt-2">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Batch</p>
                  <p className="text-lg font-black text-zinc-800 dark:text-white">2025-29</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Branch</p>
                  <p className="text-lg font-black text-zinc-800 dark:text-white">CSE</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
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
                  className="flex items-center justify-center w-9 h-9 bg-transparent hover:bg-orange-500/5 transition-all group rounded-xl"
                  title={link.label}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={link.label === 'WA Help' ? 'currentColor' : 'none'}
                    stroke={link.label === 'WA Help' ? 'none' : 'currentColor'}
                    strokeWidth={link.label === 'WA Help' ? '0' : '2'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[18px] h-[18px] text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500 group-hover:scale-110 transition-all"
                  >
                    {link.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div ref={metricsRef} className="md:w-64 flex flex-col justify-center space-y-6 md:pl-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
            {loading ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-200 dark:bg-white/5 rounded-full" />
                    <div className="h-8 w-24 bg-zinc-200 dark:bg-white/5 rounded-full" />
                    <div className="h-3 w-20 bg-zinc-200 dark:bg-white/5 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <StatCounter
                  target={stats?.registered || 0}
                  label="Scholix Students"
                  subLabel="Registered Website Users"
                  accentColor="text-orange-500"
                  isVisible={isSectionVisible}
                />
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

        <p className="text-[11px] sm:text-xs font-medium text-zinc-400 opacity-50">
          Scholix v1.3.0 • Independent Student Project
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
