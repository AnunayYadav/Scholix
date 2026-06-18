import React, { useMemo } from 'react';
import { useUniversity, UNIVERSITIES } from '../hooks/useUniversity.tsx';

const ShareReport: React.FC = () => {
  const { universityInfo, shortBrandName } = useUniversity();
  const data = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (!d) return null;
    try {
      return JSON.parse(atob(d));
    } catch (e) {
      return null;
    }
  }, []);

  const brandName = useMemo(() => {
    if (data && data.uni) {
      const found = UNIVERSITIES.find(u => u.id === data.uni);
      if (found) return found.shortName;
    }
    return universityInfo?.shortName || shortBrandName;
  }, [data, universityInfo, shortBrandName]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-red-500"><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="8" /><line x1="11" y1="8" x2="11" y2="12" /><line x1="11" y1="16" x2="11.01" y2="16" /></svg>
        </div>
        <h3 className="text-2xl font-black text-zinc-800 dark:text-white uppercase tracking-tighter">Credential Link Expired</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">The academic protocol you requested could not be synthesized.</p>
        <button
          onClick={() => window.location.href = '/cgpa'}
          className="mt-8 bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-600/20"
        >
          Create New Protocol
        </button>
      </div>
    );
  }

  const academicStanding = useMemo(() => {
    const sgpa = parseFloat(data.sgpa);
    if (sgpa >= 9.5) return { label: `${brandName} Elite Scholar`, color: "text-orange-500", bg: "bg-orange-500/10" };
    if (sgpa >= 9.0) return { label: "Exceptional Performer", color: "text-amber-500", bg: "bg-amber-500/10" };
    if (sgpa >= 8.5) return { label: "High Achiever", color: "text-orange-600", bg: "bg-orange-600/10" };
    if (sgpa >= 7.5) return { label: "Verified Academic", color: "text-zinc-600", bg: "bg-zinc-500/10" };
    return { label: "Academic Explorer", color: "text-zinc-500", bg: "bg-zinc-500/10" };
  }, [data.sgpa, brandName]);

  const timestamp = new Date(data.ts).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-xl mx-auto animate-fade-in py-8 px-4 md:py-12">
      <div className="relative glass-panel rounded-[40px] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.3)] border border-zinc-200 dark:border-white/10 p-1 bg-white dark:bg-[#0a0a0a]">

        {/* Aesthetic Decals */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 blur-[80px] pointer-events-none rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/5 blur-[80px] pointer-events-none rounded-full -ml-24 -mb-24" />

        <div className="relative z-10 p-6 md:p-10 space-y-8">

          {/* Official Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <span className="text-[8px] font-medium text-orange-600 dark:text-orange-500">{brandName.toUpperCase()} PROTOCOL</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">VERIFIED INSIGHT</h1>
              {data.vName && (
                <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight mt-0.5">
                  SCHOLAR: <span className="text-orange-600 dark:text-orange-500 font-extrabold">{data.vName}</span>
                </p>
              )}
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">NS-{Math.floor(data.ts / 100000)}</p>
            </div>

            {/* Verified Badge */}
            <div className="relative">
              <div className="relative bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </header>

          {/* Main Score Display */}
          <div className="text-center py-2 relative">
            <p className="text-zinc-400 text-[8px] font-medium mb-2">Semester {data.sem} standing</p>
            <div className="relative inline-block">
              <p className="text-8xl md:text-9xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-700 leading-none">
                {data.sgpa}
              </p>
              <div className="absolute -top-2 -right-8 px-3 py-1 bg-orange-600 text-white rounded-xl font-black text-[7px] uppercase tracking-widest shadow-lg rotate-12">
                SGPA
              </div>
            </div>
            <div className="block mt-4">
              <div className={`inline-flex items-center space-x-2 px-6 py-2 rounded-full ${academicStanding.bg} ${academicStanding.color} font-black text-[9px] uppercase tracking-widest border border-current opacity-90`}>
                {academicStanding.label}
              </div>
            </div>
          </div>

          {/* Detailed Subject Ledger */}
          {data.subjects && data.subjects.length > 0 && (
            <section className="space-y-4">
              <h4 className="text-[8px] font-medium text-zinc-400 text-center flex items-center justify-center gap-4">
                <span className="h-px bg-zinc-100 dark:bg-white/5 flex-1" />
                LEDGER
                <span className="h-px bg-zinc-100 dark:bg-white/5 flex-1" />
              </h4>
              <div className="grid grid-cols-1 gap-2 pr-1">
                {data.subjects.map((sub: any, idx: number) => (
                  <div key={idx} className="p-3.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-zinc-100/50 dark:hover:bg-white/[0.04]">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-800 dark:text-white uppercase tracking-tight truncate">{sub.n}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{sub.c} Credits</span>
                        {sub.m !== undefined && sub.m > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{sub.m} Marks</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-10 h-10 rounded-[14px] bg-orange-600/5 dark:bg-orange-500/10 border border-orange-600/20 dark:border-orange-500/20 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[7px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Grade</span>
                        <span className="font-extrabold text-orange-600 dark:text-orange-500 text-xs leading-none">{sub.g}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer Summary */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y border-zinc-100 dark:border-white/5">
            <div className="text-center border-r border-zinc-100 dark:border-white/5 pr-4">
              <p className="text-[7px] font-medium text-zinc-400 mb-1">CUMULATIVE</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{data.cgpa}</p>
            </div>
            <div className="text-center pl-4">
              <p className="text-[7px] font-medium text-zinc-400 mb-1">TOTAL CREDITS</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{data.credits}</p>
            </div>
          </div>

          <footer className="text-center space-y-6 pt-2">
            <div className="space-y-1.5">
              <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">SYNTHESIZED {timestamp}</p>
              <p className="text-[6px] font-medium text-zinc-300 dark:text-zinc-700 uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                MATH-VALIDATED BY {brandName.toUpperCase()} PROTOCOL.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-95 shadow-xl flex items-center justify-center gap-2"
              >
                Join the Hub
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Impressive Recruitment Hook */}
      <div className="mt-8 text-center">
        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-4 opacity-50">{brandName.toUpperCase()} ACADEMIC SUITE</p>
        <div className="grid grid-cols-3 gap-2 opacity-40">
          <div className="text-center"><p className="text-xs font-black dark:text-white">AI</p><p className="text-[6px] font-bold uppercase tracking-widest">Powered</p></div>
          <div className="text-center border-x border-zinc-200 dark:border-white/10 px-1"><p className="text-xs font-black dark:text-white">100%</p><p className="text-[6px] font-bold uppercase tracking-widest">Free</p></div>
          <div className="text-center"><p className="text-xs font-black dark:text-white">VERTO</p><p className="text-[6px] font-bold uppercase tracking-widest">Built</p></div>
        </div>
      </div>
    </div>
  );
};

export default ShareReport;
