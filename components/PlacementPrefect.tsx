
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { extractTextFromPdf } from '../services/pdfUtils';
import NexusServer from '../services/nexusServer.ts';
import { analyzeResume } from '../services/geminiService';
import { ResumeAnalysisResult, UserProfile, AnnotatedFragment } from '../types';
import { showToast, showConfirm } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto mb-2 opacity-40">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const INDUSTRY_ROLES = [
  { 
    id: 'swe', 
    name: 'Software Engineer', 
    jd: 'We are looking for a Software Engineer to join our core engineering team. You will be responsible for designing, developing, and maintaining scalable software solutions. You should have strong fundamentals in data structures, algorithms, and system design. Experience with languages like Java, Python, or C++, and proficiency with version control systems (Git) is essential. You will participate in code reviews, write unit tests, and collaborate with cross-functional teams to deliver high-quality features.' 
  },
  { 
    id: 'frontend', 
    name: 'Frontend Developer', 
    jd: 'Join us as a Frontend Developer to create stunning and performant user interfaces. You will work closely with designers and product managers to translate complex requirements into fluid web experiences. Expertise in React.js, TypeScript, and modern CSS frameworks like Tailwind CSS is required. You should have a deep understanding of web performance optimization, state management (Zustand/Redux), and server-side rendering with Next.js. Familiarity with accessibility standards and cross-browser compatibility testing is a plus.' 
  },
  { 
    id: 'backend', 
    name: 'Backend Developer', 
    jd: "We're seeking a Backend Developer to build robust and scalable server-side systems. Your role involves designing microservices, managing SQL and NoSQL databases, and ensuring the security and performance of our APIs. Proficiency in Node.js and experience with cloud platforms (AWS/Azure/GCP) is crucial. You should be familiar with message brokers like Kafka/Redis and understand containerization using Docker/Kubernetes. A strong focus on API security and architectural best practices is expected." 
  },
  { 
    id: 'ai', 
    name: 'AI/ML Engineer', 
    jd: 'As an AI/ML Engineer, you will develop and productionize machine learning models. You\'ll work with large datasets to build RAG-based systems, fine-tune LLMs, and optimize data pipelines. Mastery of Python and deep learning frameworks (PyTorch/TensorFlow) is mandatory. You should have experience with vector databases (Pinecone/Milvus) and stay updated with the latest advancements in Generative AI. Knowledge of model deployment and monitoring in production environments is highly valued.' 
  },
  { 
    id: 'data', 
    name: 'Data Scientist', 
    jd: 'We are looking for a Data Scientist to extract actionable insights from complex data. You will build predictive models, perform statistical analysis, and create compelling data visualizations to drive business decisions. Proficiency in SQL and data science libraries like Scikit-learn, Pandas, and NumPy is required. You should have experience with business intelligence tools and be able to communicate technical findings to non-technical stakeholders effectively. A strong background in machine learning and experiment design is essential.' 
  },
  { 
    id: 'pm', 
    name: 'Product Manager', 
    jd: 'Join our team as a Product Manager to lead the product lifecycle from conception to launch. You\'ll define product strategy, create detailed roadmaps, and manage stakeholders across the organization. Success in this role requires experience with Agile/Scrum methodologies, writing user stories, and performing market analysis. You\'ll work closely with engineering and design teams to prioritize features that deliver maximum user value. Strong analytical skills and a data-driven approach to product growth are key.' 
  }
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
  hideHeader?: boolean;
  reportIdOverride?: string;
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
          className="text-zinc-100 dark:text-white/5"
        />
        <circle
          cx="150" cy="150" r="90"
          stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[2500ms] ease-out shadow-[0_0_12px_var(--brand-glow)]"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary)" />
            <stop offset="100%" stopColor="var(--brand-secondary)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white">{score}%</p>
      </div>
    </div>
  );
};

interface FragmentProps {
  fragment: AnnotatedFragment;
  onHover: (fragment: AnnotatedFragment | null, element: HTMLElement | null) => void;
}

const FragmentHighlight: React.FC<FragmentProps> = ({ fragment, onHover }) => {
  if (fragment.type === 'neutral') return <span className="text-zinc-400 dark:text-zinc-500 whitespace-pre-wrap">{fragment.text}</span>;

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

const PlacementPrefect: React.FC<PlacementPrefectProps> = ({ userProfile, hideHeader, reportIdOverride }) => {
  const { reportId: routeReportId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlId = searchParams.get('id');
  const reportId = reportIdOverride || routeReportId || urlId;
  const navigate = useNavigate();
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
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const { uniSlug } = useUniversity();
  const prefix = uniSlug && uniSlug !== 'none' ? `/${uniSlug}` : '';

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [hoveredFragment, setHoveredFragment] = useState<AnnotatedFragment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, flipped: false });
  const hoverTimer = useRef<number | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sid = searchParams.get('sid');
    if (sid) {
      setLoading(true);
      NexusServer.fetchRecordById(sid).then(record => {
        if (record && record.type === 'placement_analysis' && record.content) {
          setResult(record.content);
          setFileName(record.label || 'Shared Report');
          setCurrentRecordId(sid);
        } else {
          showToast("Shared report not found.", "error");
        }
      }).finally(() => setLoading(false));
      return;
    }

    const saved = localStorage.getItem('nexus_resume_reports');
    if (saved) {
      const reports = JSON.parse(saved);
      setSavedReports(reports);
      
      // If reportId in URL, load it
      if (reportId !== undefined) {
        const idx = parseInt(reportId);
        if (!isNaN(idx) && reports[idx]) {
          setResult(reports[idx]);
          setFileName(reports[idx].label || '');
          setCurrentRecordId(null); // Clear DB ID when loading from local history
        }
      }
    }
  }, [reportId, searchParams]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        setError(null);
        const text = await extractTextFromPdf(file);
        setResumeText(text);
        setFileName(file.name);
        showToast("Resume uploaded successfully.", "success");
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
      setJdText(role.jd);
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
      // Tracking & Persistence for Sharing
      try {
        const savedRecord = await NexusServer.saveRecord(
          userProfile?.id || null, 
          'placement_analysis', 
          `Resume Analysis: ${fileName || 'Untitled'}`, 
          data
        );
        if (savedRecord?.id) {
          setCurrentRecordId(savedRecord.id);
        }
      } catch (saveErr) {
        console.error("Failed to persist analysis for sharing", saveErr);
      }
      // Reset URL to base placement tool when new analysis is done to clear any old report ID
      // Soft URL reset to clear report ID without page refresh or context loss
      setSearchParams({ tab: 'placement' }, { replace: true });
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

  const handleShareReport = async () => {
    if (!result) return;
    
    setShareLoading(true);
    try {
      let recordId = currentRecordId;
      
      // If we don't have an ID (e.g. loaded from local history), save it now
      if (!recordId) {
        const savedRecord = await NexusServer.saveRecord(
          userProfile?.id || null,
          'placement_analysis',
          `Resume Analysis: ${fileName || 'Shared'}`,
          result
        );
        if (savedRecord?.id) {
          recordId = savedRecord.id;
          setCurrentRecordId(recordId);
        }
      }
      
      if (recordId) {
        const shareUrl = `${window.location.origin}${window.location.pathname}?tab=placement&sid=${recordId}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast("Share link copied to clipboard!", "success");
      } else {
        showToast("Could not generate share link.", "error");
      }
    } catch (err) {
      showToast("Sharing failed.", "error");
    } finally {
      setShareLoading(false);
    }
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
          <div className="w-24 h-24 border-8 border-brand-primary/10 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-8 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-brand-primary animate-pulse">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-medium text-zinc-800 dark:text-white">Analyzing Resume</h3>
          <p className="text-xs font-semibold text-zinc-500 tracking-widest animate-pulse">Checking your content...</p>
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
                <p className="text-[9px] font-medium text-brand-primary mb-1.5 flex items-center gap-2">Feedback</p>
                <p className="text-[11px] font-bold text-white leading-relaxed">{hoveredFragment.reason || "Good point."}</p>
              </div>
              {hoveredFragment.suggestion && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Resume Linked</span>
              </div>
              )}
            </div>
            <div className={`absolute left-1/2 -translate-x-1/2 border-[8px] border-transparent ${tooltipPos.flipped ? 'bottom-full border-b-black' : 'top-full border-t-black'}`} />
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {!hideHeader ? (
            <div>
              <h2 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight mb-1">Resume Feedback</h2>
              <p className="text-zinc-500 font-semibold tracking-widest text-[9px] flex items-center gap-2">
                File: {fileName}
              </p>
            </div>
          ) : <div />}
          <div className="flex flex-wrap gap-2 ml-auto md:ml-0">
            <button 
              onClick={handleShareReport} 
              disabled={shareLoading}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white rounded-xl font-bold text-[8px] tracking-widest transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {shareLoading ? (
                <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              )}
              Share Feedback
            </button>
            <button onClick={handleSaveReport} className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-white rounded-xl font-bold text-[8px] tracking-widest transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm">
              Save History
            </button>
            <button 
              onClick={() => {
                setResult(null);
                setSearchParams({ tab: 'placement' }, { replace: true });
              }} 
              className="px-4 py-2 bg-brand-primary text-white rounded-xl font-bold text-[8px] tracking-widest active:scale-95 transition-all border-none"
            >
              Try New Resume
            </button>
          </div>
        </header>

        <div className="glass-panel p-8 md:p-10 rounded-[56px] shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          <ScoreAura score={result.totalScore} label="Resume Score" />

          <div className="flex-1 space-y-6">

            <p className="text-sm md:text-base font-medium text-zinc-800 dark:text-white leading-relaxed opacity-90 italic">"{result.summary}"</p>
            <div className="h-px bg-zinc-100 dark:bg-white/5 w-full" />
            <div className="space-y-3">
              {result.flags.map((flag, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-3 ${flag.type === 'critical' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : flag.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                  <p className="text-[11px] font-medium leading-tight">{flag.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[56px] shadow-2xl space-y-6 animate-fade-in relative overflow-visible">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-white/5 pb-8">
            <div>
              <h3 className="text-2xl font-mediumer text-zinc-800 dark:text-white">Content Check</h3>
              <p className="text-[9px] font-bold text-brand-primary tracking-widest mt-1.5">Hover over sections for feedback</p>
            </div>
          </header>

          <div className="relative overflow-visible">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-6 md:p-8 bg-black rounded-[40px] border border-white/5 shadow-inner">
              <div className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap font-mono">
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
                className={`p-3.5 rounded-2xl border text-left transition-all h-full flex flex-col justify-between group ${isActive ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20 text-white scale-[1.02]' : 'bg-white dark:bg-[#0a0a0a] border-zinc-100 dark:border-white/10 text-zinc-500 hover:border-brand-primary/30'}`}
              >
                <p className={`text-lg font-semibold ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white group-hover:text-brand-primary'}`}>{catData.score}%</p>
                <p className={`text-[9px] font-medium leading-tight tracking-tight mt-1 ${isActive ? 'text-white/80' : 'text-zinc-400'}`}>{cat.label}</p>
              </button>
            );
          })}
        </div>

        {/* Detailed Category Breakdown Section */}
        <div className="glass-panel p-8 md:p-10 rounded-[56px] shadow-2xl animate-fade-in border dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 space-y-6">
              <div className="p-6 rounded-[32px] bg-brand-primary/5 border border-brand-primary/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary mb-2">Category Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-zinc-900 dark:text-white">{result.categories?.[activeCategory]?.score || 0}%</span>
                  <span className="text-xs font-bold text-zinc-400">match</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-white px-2">Key Findings</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">
                  {result.categories?.[activeCategory]?.details || "Evaluating specific metrics for this category..."}
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {(result.categories?.[activeCategory]?.strengths || []).map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      {s}
                    </div>
                  ))}
                  {(!result.categories?.[activeCategory]?.strengths?.length) && <p className="text-[11px] text-zinc-400 px-2 italic">Looking for positives...</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary px-2 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                   Gaps to Fix
                </h4>
                <div className="space-y-2">
                  {(result.categories?.[activeCategory]?.weaknesses || []).map((w, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-[11px] font-medium text-brand-primary">
                      {w}
                    </div>
                  ))}
                  {(!result.categories?.[activeCategory]?.weaknesses?.length) && <p className="text-[11px] text-zinc-400 px-2 italic">Standard quality maintained.</p>}
                </div>
              </div>
            </div>
          </div>

          {(result.categories?.[activeCategory]?.found?.length > 0 || result.categories?.[activeCategory]?.missing?.length > 0) && (
            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2">Keywords Found</p>
                <div className="flex flex-wrap gap-2">
                  {result.categories?.[activeCategory]?.found.map((k, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">{k}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2">Missing & High Impact</p>
                <div className="flex flex-wrap gap-2">
                  {result.categories?.[activeCategory]?.missing.map((k, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-brand-primary/10 text-[9px] font-bold text-brand-primary border border-brand-primary/20">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20 px-4 md:px-0">
      {!hideHeader && (
        <header className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-none">Placement <span className="text-transparent bg-clip-text bg-brand-gradient">Prefect</span></h2>
          <p className="text-zinc-500 font-semibold tracking-widest text-[10px]">Get AI Feedback to help your placement prep</p>
        </header>
      )}

      {error && (
        <div className="p-8 bg-brand-primary/10 border border-brand-primary/20 rounded-[40px] text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-brand-primary tracking-widest">Analysis Error</h4>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="px-6 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-bold text-[9px] tracking-widest transition-all border-none">Acknowledge</button>
        </div>
      )}

      <div className="glass-panel p-8 md:p-10 rounded-[64px] shadow-2xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-[10px] sm:text-xs shrink-0 border border-brand-primary/20`}>
              1
            </div>
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Your Resume</h3>
            </div>
            <div className="relative border-4 border-dashed border-zinc-100 dark:border-white/5 rounded-[40px] p-8 text-center hover:border-brand-primary/40 transition-all bg-zinc-50 dark:bg-white/[0.02] group cursor-pointer shadow-inner">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <IconFile />
              <p className="text-sm font-medium text-zinc-400 group-hover:text-brand-primary transition-colors">
                {fileName ? fileName : "Upload PDF Resume"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-[10px]">2</div>
                <label className="text-[9px] font-medium text-zinc-400 tracking-[0.2em] block">Target Role</label>
              </div>
              <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-[16px]">
                <button onClick={() => setAnalysisMode('trend')} className={`px-4 py-1.5 rounded-xl text-[9px] font-medium transition-all ${analysisMode === 'trend' ? 'bg-brand-primary text-white shadow-lg' : 'text-zinc-500'}`}>Presets</button>
                <button onClick={() => setAnalysisMode('custom')} className={`px-4 py-1.5 rounded-xl text-[9px] font-medium transition-all ${analysisMode === 'custom' ? 'bg-brand-primary text-white shadow-lg' : 'text-zinc-500'}`}>Paste JD</button>
              </div>
            </div>
            {analysisMode === 'trend' ? (
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRY_ROLES.map(role => (
                  <button key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-4 rounded-2xl border text-left transition-all ${selectedRoleId === role.id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary scale-[1.02]' : 'bg-zinc-50 dark:bg-[#0a0a0a] border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-brand-primary/30'}`}>
                    <p className="text-[10px] font-semibold tracking-tight leading-tight">{role.name}</p>
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full h-[220px] bg-zinc-50 dark:bg-[#0a0a0a]/60 border border-zinc-100 dark:border-white/10 rounded-[32px] p-8 text-sm text-zinc-800 dark:text-white focus:ring-4 focus:ring-brand-primary/10 outline-none resize-none transition-all font-normal leading-relaxed placeholder:opacity-30 shadow-inner"
                placeholder="Paste job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-100 dark:border-white/5">
          <button
            onClick={() => setDeepAnalysis(!deepAnalysis)}
            className={`flex items-center gap-4 px-6 py-3 rounded-[24px] border transition-all cursor-pointer group ${deepAnalysis ? 'bg-brand-primary border-brand-primary shadow-xl' : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 hover:border-brand-primary/50'}`}
          >
            <div className={`w-3 h-3 rounded-full transition-all ${deepAnalysis ? 'bg-white' : 'bg-zinc-400 group-hover:bg-brand-primary'}`} />
            <div className="text-left">
              <span className={`text-[9px] font-medium block ${deepAnalysis ? 'text-white' : 'text-zinc-400 group-hover:text-brand-primary'}`}>Detailed Review</span>
            </div>
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!resumeText || !jdText || loading}
            className={`flex-1 py-4 rounded-[24px] font-bold text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${!resumeText || !jdText || loading ? 'bg-zinc-100 dark:bg-zinc-800/10 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-white/5' : 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] border-none'}`}
          >
            Analyze Resume
          </button>
        </div>
      </div>

      {savedReports.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white tracking-tight">Past Reviews</h3>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{savedReports.length}/10 Stored</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedReports.map((report, idx) => (
              <button
                key={idx}
                onClick={() => setSearchParams({ tab: 'placement', id: idx.toString() })}
                className="group p-6 rounded-[32px] bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-white/5 text-left hover:border-brand-primary/30 transition-all flex items-center justify-between shadow-sm active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight truncate max-w-[150px]">{report.label}</p>
                  <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Score: {report.totalScore}%</p>
                </div>
                <div className="flex items-center gap-2">
                   <div onClick={(e) => handleDeleteReport(idx, e)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-brand-primary/10 hover:text-brand-primary border-none bg-transparent transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 bg-brand-primary/5 text-brand-primary`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementPrefect;
