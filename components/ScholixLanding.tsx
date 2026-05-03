import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NexusServer from '../services/nexusServer.ts';
import { useUniversity, UNIVERSITIES, UniversityId } from '../hooks/useUniversity.tsx';
import { UserProfile } from '../types.ts';
import { toast } from './Toast.tsx';

interface ScholixLandingProps {
  userProfile: UserProfile | null;
}

const ScholixLanding: React.FC<ScholixLandingProps> = ({ userProfile }) => {
  const { selectUniversity } = useUniversity();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [selectedId, setSelectedId] = useState<UniversityId | null>(null);
  const [stats, setStats] = useState<{ registered: number; visitors: number; totalViews: number } | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await NexusServer.getSiteStats();
        setStats(data);
      } catch (e) {
        setStats({ registered: 0, visitors: 0, totalViews: 0 });
      }
    };
    fetchStats();
  }, []);

  const handleSelect = (id: UniversityId, comingSoon?: boolean, adminOnly?: boolean) => {
    if (isExiting) return;

    if (comingSoon) {
      toast.info('This gateway is currently under development and will be available soon.');
      return;
    }

    if (adminOnly && !userProfile?.is_admin) {
      toast.error('This gateway is currently restricted to administrators only.');
      return;
    }
    
    const uniSlug = id === 'iitm_bs' ? 'iitm' : id;
    
    setSelectedId(id);
    setIsExiting(true);
    
    // Match the 600ms performance-optimized transition
    setTimeout(() => {
      selectUniversity(id);
      navigate(`/${uniSlug}`);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center bg-[#fdfdfd] dark:bg-[#050505] overflow-x-hidden select-none">
      {/* Background with dynamic blur during exit - remains fixed */}
      <div className={`fixed inset-0 overflow-hidden pointer-events-none transition-all duration-1000 z-0 ${isExiting ? 'blur-[100px] scale-150 opacity-0' : 'blur-0 scale-100 opacity-100'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 dark:bg-brand-primary/5 blur-[120px] rounded-full animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/10 dark:bg-brand-secondary/5 blur-[120px] rounded-full animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.07]" 
             style={{ backgroundImage: 'radial-gradient(#4b5563 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Main Content Area - Scrollable */}
      <div className={`relative z-10 w-full max-w-5xl px-6 py-12 md:py-24 flex flex-col items-center text-center transition-all duration-700 ${isExiting ? 'opacity-0 scale-90 blur-xl pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>
        {/* Header */}
        <div className="space-y-6 animate-fade-in-up mb-12">
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <img src="/Scholix_light.png" alt="Scholix" className="h-16 md:h-20 w-auto object-contain dark:hidden relative z-10" />
              <img src="/Scholix_dark.png" alt="Scholix" className="h-16 md:h-20 w-auto object-contain hidden dark:block relative z-10" />
            </div>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed mt-4 md:mt-6 px-4">
              Transforming the university experience with <span className="text-zinc-900 dark:text-white font-bold">AI-driven</span> intelligence and a unified student ecosystem.
            </p>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="w-full max-w-3xl space-y-6 px-4 md:px-0">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent" />
            <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">Select Gateway</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full py-4">
            {UNIVERSITIES.map((uni) => {
              const isLocked = uni.adminOnly && !userProfile?.is_admin;
              const isDisabled = uni.comingSoon || (isLocked && !userProfile?.is_admin);

              return (
                <button
                  key={uni.id}
                  onMouseEnter={() => setHoveredId(uni.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelect(uni.id, uni.comingSoon, uni.adminOnly)}
                  className={`group relative p-6 md:p-8 rounded-[32px] border transition-all duration-700 text-left overflow-hidden backdrop-blur-2xl ${
                    uni.comingSoon 
                      ? 'border-zinc-200/50 dark:border-white/5 opacity-40 cursor-not-allowed bg-zinc-50/20 dark:bg-white/[0.01]' 
                      : isLocked
                        ? 'border-zinc-200/50 dark:border-white/5 opacity-60 bg-zinc-50/20 dark:bg-white/[0.01] hover:border-red-500/20'
                        : 'border-white dark:border-white/10 bg-white/40 dark:bg-white/[0.02] hover:border-brand-primary/20 active:scale-[0.98]'
                  }`}
                >
                  <div className="relative flex flex-col space-y-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-700 overflow-hidden ${
                      uni.comingSoon || isLocked ? 'bg-zinc-200/50 dark:bg-white/5 grayscale saturate-50' : 'bg-white dark:bg-[#111] shadow-sm p-2.5 md:p-3 border border-zinc-100 dark:border-white/5'
                    }`}>
                      <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-1">
                      <h3 className={`text-lg md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight transition-colors duration-500 ${!isDisabled && 'group-hover:text-brand-primary'}`}>
                        {uni.name}
                      </h3>
                      {uni.comingSoon ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-brand-primary"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                          <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Available Soon</span>
                        </div>
                      ) : isLocked ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Internal Access Only</span>
                        </div>
                      ) : null}
                    </div>
                    {!uni.comingSoon && !isLocked && (
                      <div className="pt-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white/10 flex items-center justify-center text-white transition-all duration-500 group-hover:translate-x-1 group-hover:bg-brand-primary">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Enter Platform</span>
                      </div>
                    )}
                    {isLocked && (
                      <div className="pt-2 flex items-center gap-2 opacity-40">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-white/10">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Restricted</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEO-Rich Content Section for AdSense Crawlers */}
        <div className="w-full max-w-4xl mt-24 px-4 text-left animate-fade-in">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">Platform Overview</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 dark:via-white/10 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.6fr] gap-12 mb-20 items-center">
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">The academic operating system.</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Scholix is an all-in-one student utility hub designed to eliminate the friction of university life. From AI-powered resume analysis to centralized study materials, we provide the tools you need to excel.
              </p>
            </div>
            <div className={`grid grid-cols-1 ${userProfile?.is_admin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
              {[
                { val: stats?.registered ? `${stats.registered}+` : "50+", label: "Total Users", color: "text-orange-500" },
                { val: stats?.visitors ? `${stats.visitors}+` : "100+", label: "Unique Visitors", color: "text-blue-400" },
                { val: stats?.totalViews ? `${stats.totalViews}+` : "1000+", label: "Raw Hits", color: "text-emerald-500", adminOnly: true },
              ].filter(s => !s.adminOnly || userProfile?.is_admin).map((stat, i) => (
                <div key={i} className="group p-4 py-10 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-white/[0.05] flex flex-col items-center justify-center text-center transition-all hover:bg-white dark:hover:bg-zinc-900/60 hover:border-brand-primary/30">
                  <span className={`block text-2xl font-bold ${stat.color} leading-none mb-3 tracking-tight`}>{stat.val}</span>
                  <span className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500/80 leading-tight max-w-[100px]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">What is Scholix?</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">A free, AI-powered student utility hub providing study materials, attendance tracking, and placement tools for university students.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">How do I access notes?</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Select your university gateway and log in to access the Content Library, where materials are organized by subject and semester.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Is it free?</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Yes, Scholix is completely free. We sustain the platform through community contributions and non-intrusive advertising.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Can I contribute?</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Absolutely. Students can upload their own notes and PYQs through the library interface to help their peers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 md:mt-32 mb-12 flex flex-col items-center w-full px-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/5 to-transparent mb-16" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full max-w-5xl text-center md:text-left mb-16">
            <div className="space-y-6 md:col-span-1">
              <div className="flex items-center justify-center md:justify-start">
                <img src="/Scholix_light.png" alt="Scholix" className="h-8 w-auto dark:hidden" />
                <img src="/Scholix_dark.png" alt="Scholix" className="h-8 w-auto hidden dark:block" />
              </div>
              <p className="text-[10px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                The high-performance student utility hub. Built for the next generation of academic excellence.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Resources</h4>
              <a 
                href="/privacy-policy"
                className="block w-full md:w-auto text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms"
                className="block w-full md:w-auto text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/about-scholix"
                className="block w-full md:w-auto text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-colors"
              >
                About Scholix
              </a>
              <a 
                href="/contact"
                className="block w-full md:w-auto text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-colors"
              >
                Contact Support
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Institutional</h4>
              <a 
                href="mailto:anunayarvind@gmail.com"
                className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-colors"
              >
                Partnerships
              </a>
              <a 
                href="mailto:anunayarvind@gmail.com"
                className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-brand-primary dark:hover:text-white transition-colors"
                title="Enquiry Email"
              >
                anunayarvind@gmail.com
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Status</h4>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Systems Operational</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-md">v3.0.4-stable</span>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">© 2026 Scholix Team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optimized Performance-First Transition Layer - Remains FIXED */}
      {isExiting && selectedId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#050505] overflow-hidden">
          <div className="absolute inset-0 bg-white/5 animate-fade-in duration-200" />
          <div 
            className="absolute w-[40vw] h-[40vw] border-2 rounded-full animate-portal" 
            style={{ 
              willChange: 'transform',
              borderColor: `${UNIVERSITIES.find(u => u.id === selectedId)?.theme.primary}33` // 20% opacity
            }} 
          />
          <div className="relative flex flex-col items-center z-50 animate-hyper-scale" style={{ willChange: 'transform, opacity' }}>
            <div className="relative">
              <div 
                className="absolute -inset-8 border-2 border-l-transparent border-b-transparent border-r-transparent rounded-full animate-spin [animation-duration:0.6s]" 
                style={{ borderTopColor: UNIVERSITIES.find(u => u.id === selectedId)?.theme.primary }}
              />
              <div className="p-6 bg-white/[0.03] rounded-full border border-white/10">
                {UNIVERSITIES.find(u => u.id === selectedId)?.logo && (
                  <img src={UNIVERSITIES.find(u => u.id === selectedId)?.logo} className="w-20 h-20 md:w-32 md:h-32 object-contain" alt="University Logo" />
                )}
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center space-y-2 px-6 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 animate-pulse">Initializing Portal</span>
              <h4 className="text-base md:text-lg font-black text-white tracking-widest uppercase">
                {UNIVERSITIES.find(u => u.id === selectedId)?.name}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholixLanding;
