
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { extractTextFromPdf } from '../services/pdfUtils';
import NexusServer from '../services/nexusServer.ts';
import { analyzeResume } from '../services/geminiService';
import { ResumeAnalysisResult, UserProfile, AnnotatedFragment, SkillCategory, ImprovementSuggestion } from '../types';
import { showToast, showConfirm } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Tooltip as RechartsTooltip 
} from 'recharts';

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2 opacity-30 text-zinc-400">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const INDUSTRY_ROLES = [
  { 
    id: 'swe', 
    name: 'Software Engineer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/></svg>,
    jd: 'We are looking for a Software Engineer...' 
  },
  { 
    id: 'frontend', 
    name: 'Frontend Developer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M9 8h.01M12 8h.01"/></svg>,
    jd: 'Join us as a Frontend Developer...' 
  },
  { 
    id: 'backend', 
    name: 'Backend Developer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6" y1="6" y2="6"/><line x1="6" x2="6" y1="18" y2="18"/></svg>,
    jd: "We're seeking a Backend Developer..." 
  },
  { 
    id: 'ai', 
    name: 'AI/ML Engineer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M12 2v10l8-8M12 12V22M12 12H2M12 12h10"/></svg>,
    jd: 'As an AI/ML Engineer...' 
  },
  { 
    id: 'data', 
    name: 'Data Scientist', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M3 3v18h18M7 16l4-4 4 4 6-6"/></svg>,
    jd: 'We are looking for a Data Scientist...' 
  },
  { 
    id: 'pm', 
    name: 'Product Manager', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/></svg>,
    jd: 'Join our team as a Product Manager...' 
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

interface ScoreAuraProps {
  score: number;
  label?: string;
  size?: number;
}

const ScoreAura: React.FC<ScoreAuraProps> = ({ score, size = 180 }) => {
  const [animatedAngle, setAnimatedAngle] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedAngle((score / 100) * 180);
      
      let start = 0;
      const duration = 1500;
      const increment = score / (duration / 16);
      const counter = setInterval(() => {
        start += increment;
        if (start >= score) {
          setDisplayScore(score);
          clearInterval(counter);
        } else {
          setDisplayScore(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(counter);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getStatus = (s: number) => {
    if (s >= 90) return "AMAZING";
    if (s >= 75) return "GOOD";
    if (s >= 60) return "FAIR";
    if (s >= 40) return "AVERAGE";
    return "POOR";
  };

  const getStatusColor = (s: number) => {
    if (s >= 90) return "text-emerald-500";
    if (s >= 75) return "text-emerald-400";
    if (s >= 60) return "text-yellow-400";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 180">
        {/* Background Track */}
        <path 
           d="M 35 80 A 65 65 0 0 1 165 80" 
           fill="none" 
           stroke="currentColor" 
           strokeWidth="16" 
           className="text-zinc-100 dark:text-white/[0.03]"
        />

        {/* Actionable Segments - No Gaps, Butt Caps */}
        <g fill="none" strokeWidth="16" strokeLinecap="butt" className="transition-opacity duration-500">
          {/* Using slightly overlapping arcs to prevent 1px aliasing gaps */}
          <path d="M 35.05 80 A 65 65 0 0 1 54.14 34.14" stroke="#ef4444" style={{ opacity: score >= 1 ? 1 : 0.15 }} />
          <path d="M 54.04 34.04 A 65 65 0 0 1 100 15" stroke="#f97316" style={{ opacity: score >= 25 ? 1 : 0.15 }} />
          <path d="M 100 15 A 65 65 0 0 1 145.96 34.04" stroke="#eab308" style={{ opacity: score >= 50 ? 1 : 0.15 }} />
          <path d="M 145.86 34.14 A 65 65 0 0 1 164.95 80" stroke="#10b981" style={{ opacity: score >= 75 ? 1 : 0.15 }} />
        </g>

        <text x="32" y="98" textAnchor="middle" className="fill-zinc-400 text-[8px] font-bold font-mono opacity-50">0</text>
        <text x="168" y="98" textAnchor="middle" className="fill-zinc-400 text-[8px] font-bold font-mono opacity-50">100</text>

        {/* Needle - Restored and Refined */}
        <g transform={`rotate(${animatedAngle}, 100, 80)`} className="transition-transform duration-[1500ms] ease-out">
          <circle cx="100" cy="80" r="7" className="fill-zinc-900 dark:fill-zinc-100" />
          <path d="M 100 77 L 40 80 L 100 83 Z" fill="currentColor" className="text-zinc-600 dark:text-zinc-400" />
          <path d="M 100 79 L 45 80 L 100 81 Z" fill="white" className="opacity-40" />
          <circle cx="100" cy="80" r="3" className="fill-zinc-100 dark:fill-zinc-900" />
        </g>

        {/* Score Display */}
        <g transform="translate(100, 135)">
          <text x="0" y="0" textAnchor="middle" className="fill-zinc-900 dark:fill-white text-5xl font-black tracking-tighter filter drop-shadow-md">
            {displayScore}
          </text>
          <text x="0" y="24" textAnchor="middle" className={`font-black text-[10px] uppercase tracking-[0.3em] ${getStatusColor(score).replace('text-', 'fill-')}`}>
            {getStatus(score)}
          </text>
        </g>
      </svg>
    </div>
  );
};

/* Added custom animation for X-Ray Scanner */
const ScanlineStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes scanline {
      0% { transform: translateY(-100%); opacity: 0; }
      10% { opacity: 0.5; }
      90% { opacity: 0.5; }
      100% { transform: translateY(600px); opacity: 0; }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(249, 115, 22, 0.2);
    }
  `}} />
);

const MetricBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="space-y-1.5 flex-1 w-full">
    <div className="flex justify-between items-center px-0.5">
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-300">{score}%</span>
    </div>
    <div className="h-[3px] w-full bg-zinc-100 dark:bg-white/[0.03] rounded-full overflow-hidden shadow-inner">
      <div 
        className="h-full bg-gradient-to-r from-brand-primary/80 to-brand-secondary/80 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.3)]"
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const ComparisonCard: React.FC<{ suggestion: ImprovementSuggestion }> = ({ suggestion }) => (
  <div className="glass-panel p-5 md:p-6 rounded-[24px] border dark:border-white/5 bg-white dark:bg-[#0a0a0a] space-y-4 transition-all hover:border-brand-primary/20 duration-300">
    <div className="flex items-center justify-between">
      <span className="px-2.5 py-1 rounded-full bg-brand-primary/[0.03] text-[9px] font-medium uppercase tracking-wider text-brand-primary/80 border border-brand-primary/10">
        {suggestion.category || 'Improvement'}
      </span>
    </div>
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[9px] font-medium text-red-500/80 uppercase tracking-widest ml-1">Current Gap</label>
        <div className="p-4 rounded-xl bg-red-500/[0.02] border border-red-500/5 text-xs text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
          "{suggestion.original}"
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[9px] font-medium text-emerald-500/80 uppercase tracking-widest ml-1">AI Recommendation</label>
        <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/5 text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {suggestion.improved}
        </div>
      </div>
    </div>
    <div className="pt-4 border-t border-zinc-50 dark:border-white/5">
      <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
        <span className="font-semibold text-brand-primary uppercase text-[9px] tracking-widest mr-2">Rationale:</span>
        {suggestion.reason}
      </p>
    </div>
  </div>
);

interface FragmentProps {
  fragment: AnnotatedFragment;
  onHover: (fragment: AnnotatedFragment | null, element: HTMLElement | null) => void;
}

const FragmentHighlight: React.FC<FragmentProps> = ({ fragment, onHover }) => {
  if (fragment.type === 'neutral') return <span className="text-zinc-400/80 whitespace-pre-wrap">{fragment.text}</span>;

  const colorClass = fragment.type === 'good'
    ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20'
    : 'text-red-400 bg-red-500/5 border-red-500/20';

  return (
    <span
      className={`inline px-0.5 py-px rounded-sm border-b ring-1 ring-inset ring-transparent hover:ring-current hover:bg-white/5 transition-all duration-300 cursor-default whitespace-pre-wrap ${colorClass}`}
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

  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadReport = async () => {
    if (!reportRef.current || !result) return;
    
    setDownloadLoading(true);
    try {
      showToast("Generating formal diagnostic report...", "info");
      
      const isDark = document.documentElement.classList.contains('dark');
      const backgroundColor = isDark ? '#0a0a0a' : '#ffffff';
      const textColor = isDark ? '#fafafa' : '#18181b';
      const subTextColor = isDark ? '#a1a1aa' : '#71717a';
      const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
      const accentColor = '#f97316'; 
      
      const generateRadarSVG = (scores: Record<string, number>) => {
        const size = 240;
        const center = size / 2;
        const radius = size * 0.35;
        const keys = Object.keys(scores).length > 0 ? Object.keys(scores) : ['Keywords', 'Skills', 'Exp', 'Format', 'Impact'];
        const count = keys.length;
        const angleStep = (Math.PI * 2) / count;

        const getPoints = (dataSet: Record<string, number>, defaultVal: number) => {
          return keys.map((key, i) => {
            const val = dataSet[key] !== undefined ? dataSet[key] : defaultVal;
            const scale = val / 100;
            const x = center + radius * scale * Math.cos(i * angleStep - Math.PI / 2);
            const y = center + radius * scale * Math.sin(i * angleStep - Math.PI / 2);
            return `${x},${y}`;
          }).join(' ');
        };

        const grid = [0.5, 1].map(scale => {
          const points = keys.map((_, i) => {
            const x = center + radius * scale * Math.cos(i * angleStep - Math.PI / 2);
            const y = center + radius * scale * Math.sin(i * angleStep - Math.PI / 2);
            return `${x},${y}`;
          }).join(' ');
          return `<polygon points="${points}" fill="none" stroke="${borderColor}" stroke-width="0.5" />`;
        }).join('');

        return `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${grid}
            <polygon points="${getPoints({}, 95)}" fill="none" stroke="#10b981" stroke-width="1" stroke-dasharray="2,2" opacity="0.5" />
            <polygon points="${getPoints({}, 55)}" fill="none" stroke="#71717a" stroke-width="1" stroke-dasharray="2,2" opacity="0.5" />
            <polygon points="${getPoints(scores, 0)}" fill="${accentColor}11" stroke="${accentColor}" stroke-width="1.5" />
            ${keys.map((k, i) => {
              const x = center + (radius + 22) * Math.cos(i * angleStep - Math.PI / 2);
              const y = center + (radius + 22) * Math.sin(i * angleStep - Math.PI / 2);
              const anchor = x > center + 5 ? 'start' : x < center - 5 ? 'end' : 'middle';
              return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="7" font-weight="700" fill="${subTextColor}">${k.toUpperCase()}</text>`;
            }).join('')}
          </svg>
        `;
      };

      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.width = '700px';
      printContainer.style.backgroundColor = backgroundColor;
      printContainer.style.color = textColor;
      printContainer.style.fontFamily = 'Inter, sans-serif';
      printContainer.style.padding = '40px 40px 80px 40px';
      
      const radarSVG = generateRadarSVG(result.detailedScores || {});

      printContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 32px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${borderColor}; padding-bottom: 20px;">
            <img src="/Scholix_light.png" style="height: 32px; width: auto;" />
            <div style="text-align: right;">
              <p style="font-size: 10px; font-weight: 700; color: ${subTextColor}; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Placement Diagnostic Report • ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <!-- Score Card -->
          <div style="display: grid; grid-template-columns: 160px 1fr; gap: 32px; align-items: center; background: ${isDark ? '#111' : '#f9f9f9'}; padding: 24px; border-radius: 16px; border: 1px solid ${borderColor}; break-inside: avoid;">
             <div style="text-align: center; border-right: 1px solid ${borderColor};">
                <div style="font-size: 44px; font-weight: 900; color: ${accentColor}; line-height: 1;">${result.totalScore}%</div>
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: ${subTextColor}; margin-top: 8px;">Overall Score</div>
             </div>
             <div>
                <h3 style="font-size: 13px; font-weight: 800; margin: 0 0 8px 0;">EXECUTIVE SUMMARY</h3>
                <p style="font-size: 11px; line-height: 1.6; color: ${subTextColor}; margin: 0;">${result.summary || 'Summary not available.'}</p>
             </div>
          </div>

          <!-- Radar & Metrics -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; break-inside: avoid;">
            <div style="background: ${isDark ? '#111' : '#f9f9f9'}; padding: 20px; border-radius: 16px; border: 1px solid ${borderColor};">
               <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${subTextColor}; margin-bottom: 12px;">Competency Mapping</h3>
               <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                 ${radarSVG}
                 <div style="display: flex; gap: 12px; font-size: 7px; font-weight: 700;">
                   <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; background: #10b981; border-radius: 1px;"></div> IDEAL</div>
                   <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; background: #71717a; border-radius: 1px;"></div> AVERAGE</div>
                   <div style="display: flex; align-items: center; gap: 4px;"><div style="width: 6px; height: 6px; background: ${accentColor}; border-radius: 1px;"></div> YOU</div>
                 </div>
               </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
               <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${subTextColor}; margin-bottom: 8px;">Metric Breakdown</h3>
               ${Object.entries(result.detailedScores || {}).map(([key, score]) => `
                <div style="padding: 10px 14px; border: 1px solid ${borderColor}; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; background: ${isDark ? '#111' : '#fff'};">
                  <span style="font-size: 10px; font-weight: 700; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span style="font-size: 11px; font-weight: 800; color: ${accentColor};">${score}%</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Probability Simulation -->
          <div style="background: ${accentColor}; color: white; padding: 24px; border-radius: 16px; break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 0;">Market Shortlist Probability</h3>
              <div style="padding: 4px 10px; background: rgba(255,255,255,0.2); border-radius: 99px; font-size: 8px; font-weight: 900;">AI SIMULATION</div>
            </div>
            <div style="display: flex; align-items: center; gap: 32px;">
              <div>
                <div style="font-size: 9px; opacity: 0.8; margin-bottom: 2px;">CURRENT</div>
                <div style="font-size: 24px; font-weight: 900;">${result.simulation?.currentShortlistChance || 0}%</div>
              </div>
              <div style="font-size: 18px; opacity: 0.5;">→</div>
              <div>
                <div style="font-size: 9px; opacity: 0.8; margin-bottom: 2px;">TARGET</div>
                <div style="font-size: 24px; font-weight: 900;">${result.simulation?.projectedShortlistChance || 0}%</div>
              </div>
            </div>
            <p style="font-size: 10px; margin-top: 12px; line-height: 1.5; opacity: 0.9;">${result.simulation?.explanation || ''}</p>
          </div>

          <!-- Skills Assessment -->
          ${Object.keys(result.skillMatrix || {}).length > 0 ? `
          <div style="break-inside: avoid;">
            <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${subTextColor}; margin-bottom: 12px;">Skill Index</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              ${Object.entries(result.skillMatrix || {}).map(([cat, skills]) => `
                <div style="padding: 14px; border: 1px solid ${borderColor}; border-radius: 12px; background: ${isDark ? '#111' : '#f9f9f9'};">
                  <div style="font-size: 9px; font-weight: 800; color: ${accentColor}; margin-bottom: 8px;">${cat.toUpperCase()}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${((skills as string[]) || []).map(skill => `<span style="padding: 3px 6px; background: ${isDark ? '#222' : '#eee'}; border-radius: 4px; font-size: 9px; font-weight: 700;">${skill}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Action Plan -->
          ${(result.actionPlan?.tasks || []).length > 0 ? `
          <div style="break-inside: avoid;">
            <h3 style="font-size: 13px; font-weight: 800; margin-bottom: 16px;">ACTIONABLE FEEDBACK</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${result.actionPlan.tasks.map((t, i) => `
                <div style="padding: 16px; border: 1px solid ${borderColor}; border-radius: 14px; display: flex; gap: 16px; align-items: flex-start; background: ${isDark ? '#111' : '#fcfcfc'}; break-inside: avoid;">
                  <div style="width: 20px; height: 20px; background: ${accentColor}; color: white; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; flex-shrink: 0;">${i + 1}</div>
                  <div>
                    <div style="font-size: 11px; font-weight: 800; margin-bottom: 2px;">${t.task} <span style="font-size: 8px; color: ${accentColor}; margin-left: 8px; opacity: 0.8;">[${t.action}]</span></div>
                    <p style="font-size: 10px; color: ${subTextColor}; line-height: 1.4; margin: 0;">${t.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <!-- Improvement Bridge -->
          ${(result.improvements || []).length > 0 ? `
          <div style="break-inside: avoid;">
            <h3 style="font-size: 13px; font-weight: 800; margin-bottom: 16px;">CRITICAL OPTIMIZATIONS</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${result.improvements.map(imp => `
                <div style="border: 1px solid ${borderColor}; border-radius: 14px; overflow: hidden; background: ${isDark ? '#111' : '#fff'}; break-inside: avoid;">
                  <div style="padding: 8px 16px; background: ${isDark ? '#222' : '#f0f0f0'}; border-bottom: 1px solid ${borderColor}; font-size: 9px; font-weight: 800; color: ${subTextColor};">${imp.section.toUpperCase()}</div>
                  <div style="padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="font-size: 10px; color: #ef4444; font-style: italic;">"${imp.originalText}"</div>
                    <div style="font-size: 10px; color: #10b981; font-weight: 600;">"${imp.improvedText}"</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${borderColor}; text-align: center; break-inside: avoid;">
            <p style="font-size: 8px; color: ${subTextColor}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">© ${new Date().getFullYear()} SCHOLIX AI • SECURITY VERIFIED REPORT</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: backgroundColor,
        logging: false,
        onclone: (clonedDoc) => {
          const colorRegex = /(oklch|oklab|color)\((?:[^()]+|\([^()]*\))*\)/g;
          const fallbackColor = isDark ? '#27272a' : '#71717a';
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText) {
              if (htmlEl.style.cssText.includes('oklch') || htmlEl.style.cssText.includes('oklab')) {
                htmlEl.style.cssText = htmlEl.style.cssText.replace(colorRegex, fallbackColor);
              }
            }
          });
          const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(l => l.remove());
        }
      });

      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasHeight / canvasWidth;
      
      const imgWidth = pageWidth;
      const imgHeight = imgWidth * ratio;

      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      
      let remainingHeight = imgHeight - pageHeight;
      while (remainingHeight > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        remainingHeight -= pageHeight;
      }

      pdf.save(`Scholix_Report_${fileName.replace(/\.[^/.]+$/, "") || 'Report'}.pdf`);
      showToast("Formal report downloaded!", "success");
      
    } catch (err) {
      console.error("PDF generation failed", err);
      showToast("Failed to generate PDF. Check browser console.", "error");
    } finally {
      setDownloadLoading(false);
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
          <div className="w-20 h-20 border-[3px] border-brand-primary/10 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-[3px] border-brand-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-primary animate-pulse">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-zinc-800 dark:text-white">Analyzing Resume</h3>
          <p className="text-[10px] font-medium text-zinc-500 tracking-wider animate-pulse">Checking your content...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div ref={reportRef} className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20 px-4 md:px-0 relative">
        <ScanlineStyles />
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          {!hideHeader ? (
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-1">Resume Diagnostic</h2>
              <p className="text-zinc-500 font-medium tracking-wide text-[11px] flex items-center gap-2">
                Scanning <span className="text-zinc-400 font-mono italic">{fileName || 'Untitled'}</span>
              </p>
            </div>
          ) : <div />}
          <div className="flex flex-wrap gap-2 ml-auto md:ml-0 header-actions">
            <button 
              onClick={handleShareReport} 
              disabled={shareLoading}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[11px] tracking-wide transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {shareLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              )}
              Share
            </button>
            <button 
              onClick={handleSaveReport} 
              className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[11px] tracking-wide transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save History
            </button>
            <button 
              onClick={handleDownloadReport}
              disabled={downloadLoading}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[11px] tracking-wide transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {downloadLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              )}
              Download
            </button>
            <button 
              onClick={() => {
                setResult(null);
                setSearchParams({ tab: 'placement' }, { replace: true });
              }} 
              className="px-5 py-2 bg-brand-primary text-white rounded-xl font-semibold text-[11px] tracking-wide active:scale-95 transition-all border-none shadow-lg shadow-brand-primary/20"
            >
              Analyze New
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Score & Stats Dashboard */}
          <div className="glass-panel p-6 md:p-8 rounded-[28px] flex flex-col gap-8 bg-white dark:bg-[#0a0a0a] border dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-none">
            {/* Top row: Meter and Detailed Scores */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              <ScoreAura score={result.totalScore} size={220} />

              <div className="flex-1 w-full space-y-4 px-1">
                <MetricBar label="Keywords" score={result.detailedScores?.keywordMatch || 0} />
                <MetricBar label="Skills Alignment" score={result.detailedScores?.skillsAlignment || 0} />
                <MetricBar label="Experience" score={result.detailedScores?.experienceRelevance || 0} />
                <MetricBar label="Formatting" score={result.detailedScores?.formattingQuality || 0} />
                <MetricBar label="Overall Impact" score={result.detailedScores?.overallImpact || 0} />
              </div>
            </div>

            {/* Bottom row: Full-width Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-center group/stat transition-all hover:bg-red-500/15">
                <div className="mb-2 w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-red-500">{result.stats?.errors || 0} Critical Errors</span>
                  <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-wider">Requires fix</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-center group/stat transition-all hover:bg-orange-500/15">
                <div className="mb-2 w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-orange-500">{result.stats?.improvements || 0} Improvements</span>
                  <p className="text-[9px] text-orange-500/60 font-bold uppercase tracking-wider">Strategic edge</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center group/stat transition-all hover:bg-emerald-500/15">
                <div className="mb-2 w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-emerald-500">{result.stats?.passed || 0} Indicators</span>
                  <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-wider">Valid checks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Radar Graph */}
          <div className="glass-panel p-6 rounded-[28px] bg-white dark:bg-[#0a0a0a] border dark:border-white/5 flex flex-col h-full shadow-xl shadow-zinc-200/50 dark:shadow-none">
            <div className="flex items-start justify-between mb-2 px-2">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Competency Radar</h3>
                <p className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Industry Benchmarking</p>
              </div>
              
              {/* Legend Box matching user image style */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 space-y-1.5 min-w-[140px]">
                <p className="text-[9px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-1">Skill Radar Graph</p>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">Ideal Candidate Pool</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">Average Candidate Pool</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">You</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Qualification', you: result.radarData?.qualification || 0, fullMark: 100, avg: 65, ideal: 95 },
                  { subject: 'Retention', you: result.radarData?.retention || 0, fullMark: 100, avg: 55, ideal: 85 },
                  { subject: 'Domain Diversity', you: result.radarData?.domainDiversity || 0, fullMark: 100, avg: 60, ideal: 90 },
                  { subject: 'Professional', you: result.radarData?.roleAlignment || 0, fullMark: 100, avg: 70, ideal: 92 },
                  { subject: 'Experience', you: result.radarData?.experience || 0, fullMark: 100, avg: 50, ideal: 88 }
                ]}>
                  <PolarGrid stroke="rgba(113, 113, 122, 0.2)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} 
                  />
                  
                  {/* Ideal Candidate Pool - Blue */}
                  <Radar
                    name="Ideal Candidate Pool"
                    dataKey="ideal"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill="#3b82f6"
                    fillOpacity={0.25}
                    dot={{ r: 2, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                  
                  {/* Average Candidate Pool - Orange */}
                  <Radar
                    name="Average Candidate Pool"
                    dataKey="avg"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    fill="#f97316"
                    fillOpacity={0.25}
                    dot={{ r: 2, fill: '#f97316', strokeWidth: 0 }}
                  />
                  
                  {/* You - Green */}
                  <Radar
                    name="You"
                    dataKey="you"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="#10b981"
                    fillOpacity={0.4}
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  />
                  
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#18181b', color: '#fff', fontSize: '10px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Shortlist Simulation */}
        <section className="space-y-6 pt-5">
          <div className="px-1 flex items-end justify-between">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Hiring Probablity Simulation</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] opacity-75">Predictive AI shortlisting analysis</p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Growth Potential</span>
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-[32px] bg-white dark:bg-[#0a0a0a] border dark:border-white/5 shadow-xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/4 group-hover:bg-brand-primary/10 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/4" />
            
            <div className="relative flex flex-col gap-8">
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-4">
                {/* Current State Card */}
                <div className="flex-1 p-5 rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">As of Today</span>
                    <span className="text-xl font-black text-zinc-400">{result.simulation.currentShortlistChance}%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-zinc-500">Shortlist Chance</span>
                      <span className="text-[8px] font-medium text-zinc-400">Baseline</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-zinc-400 dark:bg-zinc-600 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${result.simulation.currentShortlistChance}%` }} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Bridge Element */}
                <div className="flex-none flex items-center justify-center py-2 md:py-0">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-brand-primary/20 shadow-lg shadow-brand-primary/10 z-10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-brand-primary"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                  {/* Subtle connecting line for desktop only */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent -z-0" />
                </div>

                {/* Projected State Card */}
                <div className="flex-1 p-5 rounded-2xl bg-brand-primary/[0.03] dark:bg-brand-primary/[0.05] border border-brand-primary/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Optimized Target</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-brand-secondary">
                      {result.simulation.projectedShortlistChance}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-brand-primary/80">Success Probability</span>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">+{(result.simulation.projectedShortlistChance - result.simulation.currentShortlistChance)}% Increase</span>
                    </div>
                    <div className="h-1.5 w-full bg-brand-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--brand-primary-rgb),0.4)]" 
                        style={{ width: `${result.simulation.projectedShortlistChance}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 w-full">
                 <div className="flex gap-4">
                    <div className="flex-none p-2 h-fit rounded-xl bg-zinc-200 dark:bg-white/5 text-brand-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Prediction Model Feedback</p>
                      <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                        "{result.simulation.explanation}"
                      </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Action Plan */}
        <section className="space-y-6 pt-5">
          <div className="px-1">
            <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Strategic Action Plan</h3>
            <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-[0.2em] opacity-75">Precision tasks to maximize your potential</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.actionPlan.tasks.map((task, idx) => {
              const types = {
                Build: { 
                  color: "text-blue-500", 
                  bg: "bg-blue-500/10", 
                  border: "border-blue-500/20",
                  badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  icon: (
                    <>
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                      <path d="M12 8v8M8 12h8" strokeWidth="1.5" />
                    </>
                  )
                },
                Practice: { 
                  color: "text-purple-500", 
                  bg: "bg-purple-500/10", 
                  border: "border-purple-500/20",
                  badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
                  icon: (
                    <>
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" strokeWidth="1.5" />
                      <polyline points="14 2 14 8 20 8" strokeWidth="1.5" />
                      <path d="M10 13l2 2 4-4" strokeWidth="1.5" />
                    </>
                  )
                },
                Add: { 
                  color: "text-emerald-500", 
                  bg: "bg-emerald-500/10", 
                  border: "border-emerald-500/20",
                  badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  icon: (
                    <>
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <line x1="12" y1="8" x2="12" y2="16" strokeWidth="1.5" />
                      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" />
                    </>
                  )
                },
                Refactor: { 
                  color: "text-orange-500", 
                  bg: "bg-orange-500/10", 
                  border: "border-orange-500/20",
                  badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                  icon: (
                    <>
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeWidth="1.5" />
                      <polyline points="21 3 21 8 16 8" strokeWidth="1.5" />
                    </>
                  )
                }
              };

              const config = types[task.action as keyof typeof types];

              return (
                <div key={idx} className="glass-panel p-4 md:p-5 rounded-[28px] border dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex items-start gap-4 hover:border-brand-primary/30 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-brand-primary/5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${config.bg} ${config.border} ${config.color} group-hover:scale-105 transition-transform duration-300 shadow-inner`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      {config.icon}
                    </svg>
                  </div>
                  <div className="space-y-1.5 flex-1 py-0.5">
                    <div className="flex items-center justify-between">
                       <span className={`px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-widest ${config.badge}`}>
                         {task.action}
                       </span>
                    </div>
                    <h4 className="text-[13px] font-black text-zinc-900 dark:text-white leading-tight group-hover:text-brand-primary transition-colors pr-2">{task.task}</h4>
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[95%]">{task.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Executive Summary */}
        <div className="p-6 rounded-[24px] bg-gradient-to-br from-brand-primary/[0.02] to-brand-secondary/[0.02] border border-brand-primary/10 flex items-start gap-5">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-brand-primary"><path d="M12 2v20M2 12h20" className="rotate-45" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-semibold text-brand-primary/70 tracking-widest uppercase">Recruiter Verdict</p>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                "{result.summary}"
              </p>
            </div>
        </div>

        {/* Deep Dive Section - What's Wrong vs What's Right */}
        <section className="space-y-6 pt-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Deep Dive Improvements</h3>
              <p className="text-[11px] font-medium text-zinc-400 mt-1 tracking-wide uppercase tracking-widest">Actionable suggestions to improve your ATS score</p>
            </div>
            <div className="flex gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Gaps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Optimized</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {result.improvementSuggestions?.map((suggestion, idx) => (
              <ComparisonCard key={idx} suggestion={suggestion} />
            ))}
            {(!result.improvementSuggestions?.length) && (
              <div className="p-12 text-center rounded-[40px] bg-zinc-50 dark:bg-white/[0.02] border-2 border-dashed border-zinc-200 dark:border-white/5">
                <p className="text-zinc-400 font-medium text-xs uppercase tracking-widest">No major improvements needed</p>
              </div>
            )}
          </div>
        </section>

        {/* Success Indicators - What You Did Right */}
        {result.passedChecks && result.passedChecks.length > 0 && (
          <section className="space-y-6 pt-10">
            <div className="px-2">
              <h3 className="text-xl md:text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">Success Indicators</h3>
              <p className="text-[11px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">Key strengths identified by our ATS engine</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {result.passedChecks.map((check, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-[24px] border dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-sm hover:border-emerald-500/20 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-500 shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                        <path d="m9 12 2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1">{check.category}</p>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{check.checkName}</h4>
                      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                        {check.insight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skill Diversity Matrix */}
        <section className="space-y-6 pt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Skill Diversity Matrix</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] opacity-75">Categorized mapping against industry trends</p>
            </div>
            
            {/* Legend for Skill Matrix */}
            <div className="flex flex-wrap gap-2.5 items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-inner">
              <div className="flex items-center gap-1.5 px-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-primary shadow-sm shadow-brand-primary/20" />
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Mandatory</span>
              </div>
              <div className="flex items-center gap-1.5 px-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/20" />
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Desired</span>
              </div>
              <div className="flex items-center gap-1.5 px-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-400 shadow-sm shadow-zinc-400/20" />
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Other</span>
              </div>
              <div className="h-3 w-[1px] bg-zinc-200 dark:bg-white/10 mx-0.5" />
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-1 h-1 text-white"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.05em]">Your Mastery</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.skillDiversity?.map((cat, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-[28px] border dark:border-white/5 space-y-4 flex flex-col h-full bg-white dark:bg-[#0a0a0a] shadow-sm hover:border-brand-primary/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h4 className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-[0.15em] mb-0.5">{cat.category}</h4>
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-white">Proficiency Map</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-[9px] font-black text-zinc-600 dark:text-zinc-400">
                    {cat.skills.filter(s => s.found).length}/{cat.skills.length}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-1 items-start content-start">
                  {cat.skills.map((skill, sIdx) => {
                    const isMandatory = skill.level === 'Mandatory';
                    const isDesired = skill.level === 'Desired';
                    const isFound = skill.found;
                    
                    let variantStyles = "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 text-zinc-500";
                    let accentColor = "bg-zinc-300 dark:bg-zinc-700";
                    
                    if (isMandatory) {
                      variantStyles = "bg-brand-primary/5 border-brand-primary/20 text-brand-primary";
                      accentColor = "bg-brand-primary";
                    } else if (isDesired) {
                      variantStyles = "bg-sky-500/5 border-sky-500/20 text-sky-500";
                      accentColor = "bg-sky-500";
                    }
                    
                    return (
                      <div 
                        key={sIdx}
                        className={`group/skill relative px-2.5 py-1.5 rounded-xl text-[9px] font-black transition-all border select-none flex items-center gap-2 ${variantStyles} ${isFound 
                          ? 'ring-1 ring-emerald-500/30 !border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : 'opacity-70 grayscale-[0.5]'}`}
                      >
                        {isFound ? (
                          <div className="flex-none p-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-1.5 h-1.5"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full flex-none shadow-sm ${accentColor} ${isMandatory ? 'animate-pulse' : ''}`} />
                        )}
                        <span className="truncate">{skill.name}</span>
                        
                        {/* Hover Tooltip for Level */}
                        {!isFound && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[8px] rounded opacity-0 group-hover/skill:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold uppercase tracking-widest border border-white/10">
                            Missing {skill.level} Skill
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Annotated Resume X-Ray */}
        <section className="space-y-6 pt-10">
          <div className="px-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Annotated Resume X-Ray</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] opacity-75">Full reconstruction with deep recruiter insights</p>
            </div>
            
            <div className="flex gap-4 mb-1 self-start md:self-auto bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-white/5">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-[2px] bg-emerald-500 rounded-full" />
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Optimized</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-[2px] bg-red-500 rounded-full" />
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Recruiter Flag</span>
               </div>
            </div>
          </div>
          
          <div className="relative group/xray">
            {/* High-Tech Container */}
            <div className="glass-panel p-4 md:p-10 rounded-[28px] md:rounded-[40px] bg-[#0c0c0c] border border-white/5 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              {/* Scanline Effect - Subtle and Premium */}
              <div className="absolute inset-x-0 h-[80px] bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent top-0 animate-[scanline_10s_linear_infinite] pointer-events-none z-10 opacity-30" />
              
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/10" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/10" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/10" />

              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-4 relative z-20">
                <div className="text-[12px] md:text-[13px] text-zinc-600 font-medium leading-relaxed whitespace-pre-wrap font-mono tracking-tight">
                  {result.annotatedContent.map((fragment, i) => (
                    <FragmentHighlight key={i} fragment={fragment} onHover={handleFragmentHover} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Tooltip implementation for hover insights - Moved outside overflow-hidden */}
            {hoveredFragment && hoveredFragment.type !== 'neutral' && (
              <div 
                className="absolute z-[9999] pointer-events-none transition-all duration-200"
                style={{ 
                  left: `${tooltipPos.x}px`, 
                  top: `${tooltipPos.y}px`,
                  transform: `translate(-50%, ${tooltipPos.flipped ? '0%' : '-100%'})`
                }}
              >
                <div className={`p-4 rounded-2xl shadow-2xl border flex flex-col gap-2.5 w-72 md:w-80 animate-in fade-in zoom-in duration-200 shadow-brand-primary/10 ${hoveredFragment.type === 'good' ? 'bg-[#0f1711] border-emerald-500/30' : 'bg-[#1a0f0f] border-red-500/30'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${hoveredFragment.type === 'good' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${hoveredFragment.type === 'good' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {hoveredFragment.type === 'good' ? 'Best Practice' : 'Critical Flag'}
                      </span>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-3 h-3 ${hoveredFragment.type === 'good' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {hoveredFragment.type === 'good' ? <path d="m5 12 5 5L20 7" /> : <path d="m21 21-18-18m18 0L3 21" />}
                    </svg>
                  </div>
                  
                  <p className="text-[11px] font-bold text-zinc-100 leading-tight">
                    {hoveredFragment.reason}
                  </p>
                  
                  {hoveredFragment.suggestion && (
                    <div className={`mt-1 p-3 rounded-xl border ${hoveredFragment.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                      <p className="text-[8px] font-black opacity-50 uppercase tracking-widest mb-1 shadow-sm">AI Recommendation</p>
                      <p className="text-[10px] font-medium text-zinc-300 leading-relaxed italic">
                        {hoveredFragment.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
            
            {/* Tech Status Bar */}
            <div className="mt-4 flex items-center justify-between px-2">
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Neural Link Active</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                   <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">ATS Engine v4.2</span>
                 </div>
               </div>
               <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Hover highlighted text for deep insights</p>
             </div>
         </section>

        {/* Category breakdown remains for deeper tabs if needed, but redesigned */}
        <div className="pt-10 space-y-8">
           <div className="flex items-center gap-4 px-4 overflow-x-auto no-scrollbar py-2">
            {CATEGORIES.map((cat) => {
              const catData = result.categories?.[cat.id] || { score: 0 };
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-full border whitespace-nowrap transition-all flex items-center gap-3 shrink-0 ${isActive ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-white dark:bg-white/5 border-zinc-100 dark:border-white/10 text-zinc-500 hover:border-brand-primary/30'}`}
                >
                  <span className={`text-xs font-black ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{catData.score}%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-[48px] shadow-2xl animate-fade-in border dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 space-y-6">
                <div className="p-6 rounded-[32px] bg-brand-primary/5 border border-brand-primary/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-2">Diagnostic Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-zinc-900 dark:text-white">{result.categories?.[activeCategory]?.score || 0}%</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Accuracy</span>
                  </div>
                </div>
                
                <div className="space-y-4 px-2">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-white">Analysis Overview</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {result.categories?.[activeCategory]?.details || "Evaluating specific metrics for this category..."}
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Key Assets
                  </h4>
                  <div className="space-y-3">
                    {(result.categories?.[activeCategory]?.strengths || []).map((s, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 text-xs font-medium text-emerald-700 dark:text-emerald-400 leading-tight">
                        {s}
                      </div>
                    ))}
                    {(!result.categories?.[activeCategory]?.strengths?.length) && <p className="text-[11px] text-zinc-400 px-2 italic">Standard baseline metadata.</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary px-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                    Critical fixes
                  </h4>
                  <div className="space-y-3">
                    {(result.categories?.[activeCategory]?.weaknesses || []).map((w, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-brand-primary/[0.03] border border-brand-primary/10 text-xs font-medium text-brand-primary leading-tight">
                        {w}
                      </div>
                    ))}
                    {(!result.categories?.[activeCategory]?.weaknesses?.length) && <p className="text-[11px] text-zinc-400 px-2 italic">No immediate refinements detected.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20 px-4 md:px-0">
      {!hideHeader && (
        <header className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-white tracking-tight leading-tight">Placement <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-primary to-brand-secondary">Prefect</span></h2>
          <p className="text-zinc-500 font-medium tracking-wide text-xs">Unlock your career potential with advanced AI resume intelligence</p>
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

      <div className="glass-panel p-8 rounded-[40px] shadow-2xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-semibold text-[10px] shrink-0 border border-brand-primary/20`}>
              1
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Your Resume</h3>
            </div>
            <div className="relative border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[32px] p-8 text-center hover:border-brand-primary/40 transition-all bg-zinc-50 dark:bg-white/[0.02] group cursor-pointer shadow-inner">
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
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-semibold text-[10px]">2</div>
                <label className="text-[10px] font-semibold text-zinc-400 tracking-wider block uppercase">Target Role</label>
              </div>
              <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl">
                <button onClick={() => setAnalysisMode('trend')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${analysisMode === 'trend' ? 'bg-brand-primary text-white shadow-lg' : 'text-zinc-500'}`}>Presets</button>
                <button onClick={() => setAnalysisMode('custom')} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${analysisMode === 'custom' ? 'bg-brand-primary text-white shadow-lg' : 'text-zinc-500'}`}>Paste JD</button>
              </div>
            </div>
            {analysisMode === 'trend' ? (
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRY_ROLES.map(role => (
                    <button key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${selectedRoleId === role.id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary scale-[1.02]' : 'bg-zinc-50 dark:bg-[#0a0a0a] border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-brand-primary/30'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${selectedRoleId === role.id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white dark:bg-white/5 border-zinc-100 dark:border-white/10'}`}>
                        {role.icon}
                      </div>
                      <p className="text-[10px] font-semibold tracking-tight leading-tight">{role.name}</p>
                    </button>
                  ))}
                </div>
            ) : (
              <textarea
                className="w-full h-[220px] bg-zinc-50 dark:bg-[#0a0a0a]/60 border border-zinc-100 dark:border-white/10 rounded-[24px] p-6 text-sm text-zinc-800 dark:text-white focus:ring-4 focus:ring-brand-primary/10 outline-none resize-none transition-all font-normal leading-relaxed placeholder:opacity-30 shadow-inner"
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
              <span className={`text-[10px] font-medium block ${deepAnalysis ? 'text-white' : 'text-zinc-400 group-hover:text-brand-primary'}`}>Detailed Review</span>
            </div>
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!resumeText || !jdText || loading}
            className={`flex-1 py-4 rounded-[24px] font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${!resumeText || !jdText || loading ? 'bg-zinc-100 dark:bg-zinc-800/10 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-white/5' : 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] border-none'}`}
          >
            Analyze Resume
          </button>
        </div>
      </div>

      {savedReports.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white tracking-tight">Past Reviews</h3>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{savedReports.length}/10 Stored</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedReports.map((report, idx) => (
              <button
                key={idx}
                onClick={() => setSearchParams({ tab: 'placement', id: idx.toString() })}
                className="group p-6 rounded-[24px] bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-white/5 text-left hover:border-brand-primary/30 transition-all flex items-center justify-between shadow-sm active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight truncate max-w-[150px]">{report.label}</p>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Score: {report.totalScore}%</p>
                </div>
                <div className="flex items-center gap-2">
                   <div onClick={(e) => handleDeleteReport(idx, e)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-brand-primary/10 hover:text-brand-primary border-none bg-transparent transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 bg-brand-primary/5 text-brand-primary`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
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
