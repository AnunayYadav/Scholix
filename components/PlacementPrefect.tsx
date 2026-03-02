
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { extractTextFromPdf } from '../services/pdfUtils';
import { analyzeResume } from '../services/geminiService';
import { ResumeAnalysisResult, UserProfile, AnnotatedFragment } from '../types';
import { showToast, showConfirm } from './Toast.tsx';

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-2 opacity-40">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const INDUSTRY_ROLES = [
  { id: 'swe', name: 'Software Engineer', keywords: 'Algorithms, System Design, Java/Python/C++, Git, Problem Solving, Unit Testing' },
  { id: 'frontend', name: 'Frontend Developer', keywords: 'React.js, TypeScript, Tailwind CSS, Web Performance, State Management (Zustand/Redux), Next.js' },
  { id: 'backend', name: 'Backend Developer', keywords: 'Node.js, Microservices, SQL/NoSQL, API Security, Cloud Deployment, Redis/Kafka' },
  { id: 'ai', name: 'AI/ML Engineer', keywords: 'Python, PyTorch/TensorFlow, LLMs, RAG, Data Pipelines, Model Fine-tuning, Vector Databases' },
  { id: 'data', name: 'Data Scientist', keywords: 'Statistical Analysis, SQL, Data Visualization, Scikit-learn, Machine Learning, Business Intelligence' },
  { id: 'pm', name: 'Product Manager', keywords: 'Product Strategy, Agile/Scrum, User Stories, Roadmapping, Stakeholder Management, Market Analysis' }
];

const CATEGORIES = [
  { id: 'keywordAnalysis', label: 'Skills Check' },
  { id: 'jobFit', label: 'Job Matching' },
  { id: 'achievements', label: 'Impact & Results' },
  { id: 'formatting', label: 'ATS Friendly' },
  { id: 'language', label: 'Tone & Phrasing' },
  { id: 'branding', label: 'Personal Summary' }
] as const;

type CategoryID = typeof CATEGORIES[number]['id'];

interface PlacementPrefectProps {
  userProfile?: UserProfile | null;
}

const ScoreAura = ({ score, label }: { score: number; label: string }) => {
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center group">
      <div className={`absolute inset-0 bg-orange-600/10 blur-[60px] rounded-full transition-all duration-1000 ${score > 70 ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`} />

      <svg height="300" width="300" className="transform -rotate-90 relative z-10">
        <circle
          cx="150" cy="150" r="90"
          stroke="currentColor" strokeWidth="12" fill="transparent"
          className="text-slate-100 dark:text-white/5"
        />
        <circle
          cx="150" cy="150" r="90"
          stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[2500ms] ease-out drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">{label}</p>
        <p className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white">{score}%</p>
      </div>
    </div>
  );
};

interface FragmentProps {
  fragment: AnnotatedFragment;
  onHover: (fragment: AnnotatedFragment | null, element: HTMLElement | null) => void;
}

const FragmentHighlight: React.FC<FragmentProps> = ({ fragment, onHover }) => {
  if (fragment.type === 'neutral') return <span className="text-slate-400 dark:text-slate-500 whitespace-pre-wrap">{fragment.text}</span>;

  const colorClass = fragment.type === 'good'
    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20';

  return (
    <span
      className={`inline px-0.5 rounded-md border-b-2 cursor-pointer transition-colors duration-200 whitespace-pre-wrap ${colorClass}`}
      onMouseEnter={(e) => onHover(fragment, e.currentTarget)}
      onMouseLeave={() => onHover(null, null)}
    >
      {fragment.text}
    </span>
  );
};

interface SavedReport extends ResumeAnalysisResult {
  label?: string;
}

const PlacementPrefect: React.FC<PlacementPrefectProps> = ({ userProfile }) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [jdText, setJdText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'custom' | 'trend'>('trend');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<CategoryID>('keywordAnalysis');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [hoveredFragment, setHoveredFragment] = useState<AnnotatedFragment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, flipped: false });
  const hoverTimer = useRef<number | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_resume_reports');
    if (saved) setSavedReports(JSON.parse(saved));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        setError(null);
        const text = await extractTextFromPdf(file);
        setResumeText(text);
        setFileName(file.name);
      } catch (err) {
        setError("Could not read the PDF file. Please ensure it is a valid document.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = INDUSTRY_ROLES.find(r => r.id === roleId);
    if (role) {
      setJdText(`Role: ${role.name}. Skills: ${role.keywords}`);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jdText) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeResume(resumeText, jdText, deepAnalysis);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (!result) return;
    const reportToSave: SavedReport = {
      ...result,
      label: fileName || `Resume Review ${new Date().toLocaleDateString()}`
    };
    const updated = [reportToSave, ...savedReports].slice(0, 10);
    setSavedReports(updated);
    localStorage.setItem('nexus_resume_reports', JSON.stringify(updated));
    showToast("Review saved to your history.", "success");
  };

  const handleDeleteReport = async (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm("Delete this review?");
    if (!confirmed) return;
    const updated = savedReports.filter((_, i) => i !== idx);
    setSavedReports(updated);
    localStorage.setItem('nexus_resume_reports', JSON.stringify(updated));
  };

  const handleFragmentHover = (fragment: AnnotatedFragment | null, element: HTMLElement | null) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);

    if (fragment && element && reportRef.current) {
      const rect = element.getBoundingClientRect();
      const parentRect = reportRef.current.getBoundingClientRect();
      const relativeTop = rect.top - parentRect.top;
      const relativeLeft = rect.left - parentRect.left + (rect.width / 2);
      const shouldFlip = rect.top < 250;

      setTooltipPos({
        x: relativeLeft,
        y: shouldFlip ? (relativeTop + rect.height + 12) : (relativeTop - 12),
        flipped: shouldFlip
      });
      setHoveredFragment(fragment);
    } else {
      hoverTimer.current = window.setTimeout(() => {
        setHoveredFragment(null);
      }, 80);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-10 animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-orange-500/10 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-8 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-orange-600 animate-pulse">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">Analyzing Resume</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Checking your content...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div ref={reportRef} className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20 px-4 md:px-0 relative">

        {hoveredFragment && (
          <div
            className={`absolute z-[1000] p-5 bg-black border border-white/20 rounded-2xl shadow-2xl pointer-events-none transform -translate-x-1/2 w-[300px] ${tooltipPos.flipped ? '' : '-translate-y-full'}`}
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1.5 flex items-center gap-2">Feedback</p>
                <p className="text-[11px] font-bold text-white leading-relaxed">{hoveredFragment.reason || "Good point."}</p>
              </div>
              {hoveredFragment.suggestion && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1">Tip</p>
                  <p className="text-[10px] font-medium text-slate-300 leading-relaxed italic">"{hoveredFragment.suggestion}"</p>
                </div>
              )}
            </div>
            <div className={`absolute left-1/2 -translate-x-1/2 border-[8px] border-transparent ${tooltipPos.flipped ? 'bottom-full border-b-black' : 'top-full border-t-black'}`} />
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase mb-1">Resume Feedback</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2">

              File: {fileName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSaveReport} className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:border-orange-500 flex items-center gap-2 shadow-sm">
              Save Review
            </button>
            <button onClick={() => setResult(null)} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all border-none">Try New Resume</button>
          </div>
        </header>

        <div className="glass-panel p-8 md:p-10 rounded-[56px] shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <ScoreAura score={result.totalScore} label="Resume Score" />

          <div className="flex-1 space-y-6">

            <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-relaxed italic opacity-90">"{result.summary}"</p>
            <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
            <div className="space-y-3">
              {result.flags.map((flag, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-3 ${flag.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' : flag.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                  <p className="text-[11px] font-black uppercase leading-tight">{flag.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[56px] shadow-2xl space-y-6 animate-fade-in relative overflow-visible">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-white/5 pb-8">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Content Check</h3>
              <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.4em] mt-1.5">Hover over sections for feedback</p>
            </div>
          </header>

          <div className="relative overflow-visible">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-6 md:p-8 bg-black rounded-[40px] border border-white/5 shadow-inner">
              <div className="text-sm md:text-base text-slate-300 font-medium leading-relaxed whitespace-pre-wrap font-mono">
                {result.annotatedContent.map((fragment, i) => (
                  <FragmentHighlight key={i} fragment={fragment} onHover={handleFragmentHover} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const catData = result.categories?.[cat.id] || { score: 0 };
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-4 rounded-[32px] border text-left transition-all h-full flex flex-col justify-between group ${isActive ? 'bg-orange-600 border-orange-500 shadow-xl shadow-orange-600/20 text-white scale-[1.02]' : 'bg-white dark:bg-[#0a0a0a] border-slate-100 dark:border-white/10 text-slate-500 hover:border-orange-500/30'}`}
              >
                <p className={`text-xl font-black ${isActive ? 'text-white' : 'text-slate-900 dark:text-white group-hover:text-orange-600'}`}>{catData.score}%</p>
                <p className={`text-[8px] font-black uppercase tracking-tight leading-tight ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{cat.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20 px-4 md:px-0">
      <header className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none">Placement <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Prefect</span></h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Get AI Feedback to help your placement prep</p>
      </header>

      {error && (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-[40px] text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase text-red-500 tracking-widest">Analysis Error</h4>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border-none">Acknowledge</button>
        </div>
      )}

      <div className="glass-panel p-8 md:p-10 rounded-[64px] shadow-2xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600 font-black text-[10px]">1</div>
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] block">Your Resume</label>
            </div>
            <div className="relative border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] p-8 text-center hover:border-orange-500/40 transition-all bg-slate-50 dark:bg-white/[0.02] group cursor-pointer shadow-inner">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <IconFile />
              <p className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-600 transition-colors">
                {fileName ? fileName : "Upload PDF Resume"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600 font-black text-[10px]">2</div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] block">Target Role</label>
              </div>
              <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-[16px]">
                <button onClick={() => setAnalysisMode('trend')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${analysisMode === 'trend' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500'}`}>Presets</button>
                <button onClick={() => setAnalysisMode('custom')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${analysisMode === 'custom' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500'}`}>Paste JD</button>
              </div>
            </div>
            {analysisMode === 'trend' ? (
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRY_ROLES.map(role => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-4 rounded-2xl border text-left transition-all ${selectedRoleId === role.id ? 'bg-orange-600/10 border-orange-600 text-orange-500 scale-[1.02]' : 'bg-slate-50 dark:bg-[#0a0a0a] border-slate-100 dark:border-white/5 text-slate-500 hover:border-orange-500/30'}`}>
                    <p className="text-[10px] font-bold tracking-tight leading-tight">{role.name}</p>
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full h-[184px] bg-slate-50 dark:bg-[#0a0a0a]/60 border border-slate-100 dark:border-white/10 rounded-[32px] p-6 text-xs text-slate-800 dark:text-white focus:ring-4 focus:ring-orange-600/10 outline-none resize-none transition-all font-bold placeholder:opacity-30 shadow-inner"
                placeholder="Paste job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setDeepAnalysis(!deepAnalysis)}
            className={`flex items-center gap-4 px-6 py-3 rounded-[24px] border transition-all cursor-pointer group ${deepAnalysis ? 'bg-red-600 border-red-500 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-red-500/50'}`}
          >
            <div className={`w-3 h-3 rounded-full transition-all ${deepAnalysis ? 'bg-white' : 'bg-slate-400 group-hover:bg-red-500'}`} />
            <div className="text-left">
              <span className={`text-[9px] font-black uppercase tracking-widest block ${deepAnalysis ? 'text-white' : 'text-slate-400 group-hover:text-red-500'}`}>Detailed Review</span>
            </div>
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!resumeText || !jdText || loading}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 border-none disabled:opacity-50"
          >
            Analyze Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementPrefect;
