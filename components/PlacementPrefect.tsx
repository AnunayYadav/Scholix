
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { extractTextFromPdf } from '../services/pdfUtils';
import NexusServer from '../services/nexusServer.ts';
import { analyzeResume, generateJobDescription } from '../services/geminiService';
import { ResumeAnalysisResult, UserProfile, AnnotatedFragment, SkillCategory, ImprovementSuggestion } from '../types';
import { showToast, showConfirm } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { extractResumeWithTesseract } from '../services/ocrService.ts';

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
    jd: `Role: Software Engineer (Full Stack)
Summary: We are seeking a versatile Software Engineer to design and implement scalable web applications. You will work on both frontend and backend components, ensuring high performance and responsiveness.

Responsibilities:
- Build high-quality, scalable features for our core platform.
- Write clean, maintainable, and testable code following industry best practices.
- Collaborate with cross-functional teams to define, design, and ship new features.
- Optimize application for maximum speed and scalability.

Technical Requirements:
- Strong proficiency in Java, C++, Python, or Go.
- Solid understanding of Data Structures, Algorithms, and System Design.
- Experience with modern web frameworks (React, Node.js) and SQL/NoSQL databases.
- Familiarity with CI/CD pipelines and Cloud infrastructure (AWS/GCP).`
  },
  { 
    id: 'frontend', 
    name: 'Frontend Developer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M9 8h.01M12 8h.01"/></svg>,
    jd: `Role: Senior Frontend Developer
Summary: Join our UX-focused team to build stunning, high-performance user interfaces. You will be responsible for translating complex designs into high-quality code and optimizing web performance for a global user base.

Responsibilities:
- Develop interactive and responsive UI components using modern frontend frameworks.
- Ensure the technical feasibility of UI/UX designs and maintain design system consistency.
- Implement complex state management logic and frontend performance optimizations.
- Maintain high standards for web accessibility (WCAG) and cross-browser compatibility.

Technical Requirements:
- Expert knowledge of JavaScript/TypeScript, HTML5, and CSS3/SCSS.
- Extensive experience with React, Next.js, and Tailwind CSS.
- Proficiency in state management libraries like Redux, Zustand, or TanStack Query.
- Knowledge of build tools (Vite, Webpack) and automated testing (Jest, Cypress).`
  },
  { 
    id: 'backend', 
    name: 'Backend Developer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6" y1="6" y2="6"/><line x1="6" x2="6" y1="18" y2="18"/></svg>,
    jd: `Role: Backend Systems Engineer
Summary: We are looking for a Backend Engineer to build robust server-side logic and maintain our critical data systems. You will focus on performance, scalability, and the architectural integrity of our services.

Responsibilities:
- Design and implement scalable microservices, RESTful APIs, and GraphQL endpoints.
- Optimize database performance, indexing strategies, and query efficiency.
- Integrate with third-party services and manage enterprise-grade data security.
- Develop and maintain background processing systems and distributed caching layers.

Technical Requirements:
- Strong experience with Node.js, Go, or Python (Django/FastAPI).
- Deep understanding of API design, authentication (OAuth/JWT), and security protocols.
- Expertise in PostgreSQL, MongoDB, and Redis.
- Familiarity with Docker, Kubernetes, and serverless architectures.`
  },
  { 
    id: 'ai', 
    name: 'AI/ML Engineer', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M12 2v10l8-8M12 12V22M12 12H2M12 12h10"/></svg>,
    jd: `Role: Machine Learning Engineer
Summary: Drive our AI initiatives by designing, training, and deploying advanced machine learning models. You will work on the full ML lifecycle, from data engineering to model inference and optimization.

Responsibilities:
- Develop and implement production-ready ML models and deep learning algorithms.
- Build and maintain scalable data pipelines for model training and real-time evaluation.
- Optimize model performance for low-latency inference in production environments.
- Research and integrate state-of-the-art AI techniques and LLM fine-tuning.

Technical Requirements:
- Strong proficiency in Python and ML libraries (PyTorch, TensorFlow, Scikit-learn).
- Solid grasp of Statistics, Linear Algebra, and Calculus.
- Experience with NLP, Computer Vision, or Generative AI workflows.
- Familiarity with MLOps tools (MLflow, Kubeflow) and GPU acceleration techniques.`
  },
  { 
    id: 'data', 
    name: 'Data Scientist', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M3 3v18h18M7 16l4-4 4 4 6-6"/></svg>,
    jd: `Role: Senior Data Scientist
Summary: Help us turn complex datasets into actionable business insights. You will analyze large-scale data, build predictive models, and communicate findings to drive strategic decision-making.

Responsibilities:
- Perform exploratory data analysis (EDA) to identify critical trends and business opportunities.
- Build predictive models and statistical frameworks to solve complex business problems.
- Create compelling data visualizations and automated reports for executive stakeholders.
- Collaborate with engineering teams to integrate data models into production systems.

Technical Requirements:
- Advanced knowledge of Python/R and complex SQL query optimization.
- Proven experience with data visualization tools (Tableau, D3.js, or Plotly).
- Strong background in Statistics, Probability, and Hypothesis Testing.
- Familiarity with Big Data technologies (Spark, Snowflake, or Databricks).`
  },
  { 
    id: 'pm', 
    name: 'Product Manager', 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/></svg>,
    jd: `Role: Technical Product Manager
Summary: Bridge the gap between business goals, user experience, and engineering constraints. You will define product vision, prioritize roadmaps, and lead cross-functional teams to deliver high-impact features.

Responsibilities:
- Define product strategy, roadmaps, and key success metrics (KPIs).
- Conduct market research and user interviews to synthesize product requirements.
- Write detailed Product Requirement Documents (PRDs) and manage technical backlogs.
- Analyze product telemetry and user feedback to iterate on core functionality.

Technical Requirements:
- Strong analytical skills and data-driven approach to product management.
- Excellent communication and stakeholder management in an Agile environment.
- Fundamental understanding of software architecture and API integrations.
- Experience with Figma, Jira, and Product Analytics tools (Mixpanel/Amplitude).`
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

const getStatus = (s: number) => {
  if (s >= 90) return "AMAZING";
  if (s >= 75) return "GOOD";
  if (s >= 60) return "FAIR";
  if (s >= 40) return "AVERAGE";
  return "POOR";
};

const getStatusColor = (s: number) => {
  if (s >= 90) return "#10b981"; // emerald-500
  if (s >= 75) return "#10b981"; // emerald-500
  if (s >= 60) return "#f59e0b"; // amber-500
  if (s >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
};

interface ResumeScoreRingProps {
  score: number;
  size?: number;
}

const ResumeScoreRing: React.FC<ResumeScoreRingProps> = ({ score, size = 150 }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 1200;
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
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 56;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 140 140">
        {/* Background Circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-zinc-100 dark:text-zinc-800/80"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="transparent"
          stroke={getStatusColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tighter leading-none">
          {displayScore}
        </span>
        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1">
          /100
        </span>
      </div>
    </div>
  );
};

/* SVG Icons for breakdown metrics */
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconFormatting = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="7" y1="8" x2="17" y2="8" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="7" y1="16" x2="13" y2="16" />
  </svg>
);

const IconSkills = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="5" r="3" />
    <circle cx="5" cy="19" r="3" />
    <circle cx="19" cy="19" r="3" />
    <line x1="7.7" y1="16.9" x2="10.3" y2="7.1" />
    <line x1="16.3" y1="16.9" x2="13.7" y2="7.1" />
  </svg>
);

const IconImpact = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

const MetricBarWithIcon: React.FC<{ label: string; score: number; type: 'relevance' | 'keyword' | 'formatting' | 'skills' | 'impact' }> = ({ label, score, type }) => {
  const getTheme = () => {
    switch (type) {
      case 'relevance':
        return {
          icon: <IconTarget />,
          bg: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
          bar: 'bg-blue-500 dark:bg-blue-400'
        };
      case 'keyword':
        return {
          icon: <IconSearch />,
          bg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400',
          bar: 'bg-emerald-500 dark:bg-emerald-400'
        };
      case 'formatting':
        return {
          icon: <IconFormatting />,
          bg: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400',
          bar: 'bg-amber-500 dark:bg-amber-400'
        };
      case 'skills':
        return {
          icon: <IconSkills />,
          bg: 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400',
          bar: 'bg-violet-500 dark:bg-violet-400'
        };
      case 'impact':
        return {
          icon: <IconImpact />,
          bg: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400',
          bar: 'bg-rose-500 dark:bg-rose-400'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="flex items-center gap-4 w-full">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${theme.bg}`}>
        {theme.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">{label}</span>
          <span className="text-xs font-bold text-zinc-900 dark:text-white">{score}/100</span>
        </div>
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${theme.bar} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: number; type: 'errors' | 'improvements' | 'passed' }> = ({ label, value, type }) => {
  const getTheme = () => {
    switch (type) {
      case 'errors':
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          bg: 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/20',
          textColor: 'text-red-600 dark:text-red-400'
        };
      case 'improvements':
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
          ),
          bg: 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/20',
          textColor: 'text-amber-600 dark:text-amber-400'
        };
      case 'passed':
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
          bg: 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/20',
          textColor: 'text-emerald-600 dark:text-emerald-400'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${theme.bg}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">{theme.icon}</div>
        <span className={`text-xs font-bold ${theme.textColor}`}>{label}</span>
      </div>
      <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{value}</span>
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

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl shadow-xl space-y-1.5">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{payload[0].payload.subject}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-medium" style={{ color: entry.color }}>{entry.name} :</span>
              <span className="text-[11px] font-bold text-zinc-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const MetricBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex items-center gap-3 w-full">
    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 w-[120px] shrink-0">{label}</span>
    <div className="flex-1 h-[5px] bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-emerald-500/20"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 w-[45px] text-right shrink-0">{score}/100</span>
  </div>
);

const ComparisonCard: React.FC<{ suggestion: ImprovementSuggestion }> = ({ suggestion }) => (
  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm space-y-3">
    <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-[9px] font-semibold uppercase tracking-wider text-brand-primary">
      {suggestion.category || 'Improvement'}
    </span>
    <div className="space-y-2.5 pt-1">
      <div className="space-y-1">
        <label className="text-[9px] font-semibold text-red-500/80 uppercase tracking-wider">Current gap</label>
        <p className="px-3 py-2 rounded-xl bg-red-50/50 dark:bg-red-500/[0.04] border border-red-100/60 dark:border-red-500/10 text-[11px] text-zinc-500 dark:text-zinc-400 italic">
          "{suggestion.original}"
        </p>
      </div>
      <div className="space-y-1">
        <label className="text-[9px] font-semibold text-emerald-500/80 uppercase tracking-wider">AI recommendation</label>
        <p className="px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/[0.04] border border-emerald-100/60 dark:border-emerald-500/10 text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
          {suggestion.improved}
        </p>
      </div>
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-50 dark:border-white/5">
      <span className="font-semibold text-brand-primary text-[9px] uppercase tracking-wider mr-1.5">Rationale:</span>
      {suggestion.reason}
    </p>
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
  const [isUploading, setIsUploading] = useState(false);
  const { uniSlug } = useUniversity();
  const prefix = uniSlug && uniSlug !== 'none' ? `/${uniSlug}` : '';

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [hoveredFragment, setHoveredFragment] = useState<AnnotatedFragment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, flipped: false });
  const hoverTimer = useRef<number | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  // Loading Progress System
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const ANALYSIS_STEPS = [
    { label: 'Reading resume', desc: 'Parsing document content' },
    { label: 'Extracting skills', desc: 'Identifying competencies' },
    { label: 'Matching requirements', desc: 'Cross-referencing with JD' },
    { label: 'Scoring alignment', desc: 'Calculating ATS metrics' },
    { label: 'Generating report', desc: 'Building diagnostic insights' },
  ];

  useEffect(() => {
    let interval: number;
    if (loading) {
      setLoadingProgress(0);
      setLoadingStep(0);

      interval = window.setInterval(() => {
        setLoadingProgress(prev => {
          let increment: number;
          if (prev < 70) {
            increment = Math.random() * 2.5 + 1.2;
          } else if (prev < 90) {
            increment = Math.random() * 0.8 + 0.3;
          } else {
            // After 90%, crawl slowly — never stops, approaches 99.5
            increment = (99.5 - prev) * 0.02 + 0.01;
          }
          const next = Math.min(prev + increment, 99.5);
          const step = Math.min(Math.floor(next / 20), 4);
          setLoadingStep(step);
          return next;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
        setIsUploading(true);
        setError(null);
        setLoadingProgress(0);
        
        let text = '';
        if (file.type === 'application/pdf') {
          text = await extractTextFromPdf(file);
        } else if (file.type.startsWith('image/')) {
          setProcessingStatus('Performing OCR...');
          text = await extractResumeWithTesseract(file, (p) => {
            setLoadingProgress(p * 100);
          });
        } else {
          throw new Error("Unsupported file type. Please upload a PDF or an image.");
        }

        if (!text || text.trim().length < 50) {
           showToast("Limited text extracted. Scanned document detected?", "info");
        }

        setResumeText(text);
        setFileName(file.name);
        showToast("Resume uploaded successfully.", "success");
      } catch (err: any) {
        setError(err.message || "Could not read the file. Please ensure it is a valid document.");
        showToast(err.message || "Upload failed.", "error");
      } finally {
        setIsUploading(false);
        setProcessingStatus('');
        setLoadingProgress(0);
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
      setProcessingStatus('Connecting to AI Engine...');
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
      setProcessingStatus('');
    }
  };

  const handleGenerateAiJd = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingJd(true);
    try {
      const generatedJd = await generateJobDescription(aiPrompt);
      setJdText(generatedJd);
      setAnalysisMode('custom');
      setShowAiInput(false);
      setSelectedRoleId('ai_generated');
      showToast("Job description generated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to generate job description.", "error");
    } finally {
      setIsGeneratingJd(false);
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
      <div className="min-h-[65vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/10 mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-brand-primary">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight">Analyzing your resume</h3>
            <p className="text-xs text-zinc-400 font-medium">{processingStatus || 'This usually takes 15-30 seconds'}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-medium text-zinc-400">{ANALYSIS_STEPS[loadingStep]?.label}</span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{Math.round(loadingProgress)}%</span>
            </div>
          </div>

          {/* Step List */}
          <div className="space-y-1">
            {ANALYSIS_STEPS.map((step, i) => {
              const isDone = i < loadingStep;
              const isActive = i === loadingStep;
              return (
                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-brand-primary/[0.06] dark:bg-zinc-900' : ''
                }`}>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isDone 
                      ? 'bg-emerald-500 text-white' 
                      : isActive 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-zinc-100 dark:bg-white/5'
                  }`}>
                    {isDone ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M20 6 9 17 4 12"/></svg>
                    ) : isActive ? (
                      <div className="w-2 h-2 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold transition-colors duration-300 ${
                      isDone ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                    }`}>{step.label}</p>
                    {isActive && (
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[11px] tracking-wide transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[11px] tracking-wide transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save History
            </button>
            <button 
              onClick={handleDownloadReport}
              disabled={downloadLoading}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-[11px] tracking-wide transition-all hover:border-brand-primary flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
              className="px-5 py-2 bg-brand-primary text-white rounded-full font-semibold text-[11px] tracking-wide active:scale-95 transition-all border-none shadow-md shadow-brand-primary/20"
            >
              Analyze New
            </button>
          </div>
        </header>

        {/* Top Section Layout */}
        <div className="space-y-4">
          {/* Resume Score Card (Wide, Ring on Left, Text on Right) */}
          <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm flex flex-col sm:flex-row items-center gap-6 md:gap-10">
            <ResumeScoreRing score={result.totalScore} size={140} />
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-zinc-400 dark:text-zinc-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Resume Score</span>
                <button className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors bg-transparent border-none p-0 cursor-pointer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: getStatusColor(result.totalScore) }}>
                {getStatus(result.totalScore)}
              </h1>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                {result.totalScore >= 75 
                  ? 'Your resume is well-optimized! It meets the core requirements for the target role.' 
                  : result.totalScore >= 60 
                    ? 'Room for improvement detected. Optimizing the flagged sections will boost your shortlist probability.' 
                    : 'Significant refinements recommended. Focus on aligning your skills and impact statements.'}
              </p>
            </div>
          </div>

          {/* Bottom Grid: 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Score Breakdown (Left Column, col-span-3) */}
            <div className="lg:col-span-3 p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Score Breakdown</h3>
                <div className="space-y-3.5">
                  <MetricBarWithIcon 
                    label="Content Relevance" 
                    score={result.detailedScores?.keywordMatch || 0} 
                    type="relevance"
                  />
                  <MetricBarWithIcon 
                    label="Keyword Match" 
                    score={result.detailedScores?.skillsAlignment || 0} 
                    type="keyword"
                  />
                  <MetricBarWithIcon 
                    label="Formatting" 
                    score={result.detailedScores?.formattingQuality || 0} 
                    type="formatting"
                  />
                  <MetricBarWithIcon 
                    label="Skills Match" 
                    score={result.detailedScores?.experienceRelevance || 0} 
                    type="skills"
                  />
                  <MetricBarWithIcon 
                    label="Overall Impact" 
                    score={result.detailedScores?.overallImpact || 0} 
                    type="impact"
                  />
                </div>
              </div>
            </div>

            {/* Quick Summary & File Analyzed (Right Column, col-span-2) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Quick Summary */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between flex-1">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-3">Quick Summary</h3>
                <div className="space-y-2 flex-1 flex flex-col justify-center">
                  <SummaryRow 
                    label="Critical errors" 
                    value={result.stats?.errors || 0} 
                    type="errors"
                  />
                  <SummaryRow 
                    label="Improvements" 
                    value={result.stats?.improvements || 0} 
                    type="improvements"
                  />
                  <SummaryRow 
                    label="Passed checks" 
                    value={result.stats?.passed || 0} 
                    type="passed"
                  />
                </div>
              </div>

              {/* File Analyzed */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-center">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">File analyzed</span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm3.5-3.5H16.5v1.5h2V13h-2v2H15V9h3.5v1.5zm-6.5 0h1v3h-1v-3zm-4.5 0H7v1h.5v-1z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={fileName || 'N/A'}>
                      {fileName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competency Radar - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Competency Radar</h3>
              <div className="flex items-center gap-3 text-[9px] text-zinc-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Ideal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" /> Average</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> You</span>
              </div>
            </div>
            <div className="h-[260px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                  { subject: 'Qualification', you: result.radarData?.qualification || 0, fullMark: 100, avg: 65, ideal: 95 },
                  { subject: 'Retention', you: result.radarData?.retention || 0, fullMark: 100, avg: 55, ideal: 85 },
                  { subject: 'Domain', you: result.radarData?.domainDiversity || 0, fullMark: 100, avg: 60, ideal: 90 },
                  { subject: 'Professional', you: result.radarData?.roleAlignment || 0, fullMark: 100, avg: 70, ideal: 92 },
                  { subject: 'Experience', you: result.radarData?.experience || 0, fullMark: 100, avg: 50, ideal: 88 }
                ]}>
                  <PolarGrid stroke="rgba(113, 113, 122, 0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} />
                  <Radar name="Ideal" dataKey="ideal" stroke="#3b82f6" strokeWidth={1} fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="Average" dataKey="avg" stroke="#f97316" strokeWidth={1} fill="#f97316" fillOpacity={0.15} />
                  <Radar name="You" dataKey="you" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} dot={{ r: 2.5, fill: '#10b981', strokeWidth: 0 }} />
                  <RechartsTooltip content={<CustomRadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recruiter Verdict */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-brand-primary">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Recruiter verdict</h3>
            </div>
            <p className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic flex-1">
              "{result.summary}"
            </p>
            {result.simulation && (
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center gap-6">
                <div>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-0.5">Current chance</p>
                  <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">{result.simulation.currentShortlistChance}%</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                <div>
                  <p className="text-[9px] text-brand-primary uppercase tracking-wider mb-0.5">Optimized target</p>
                  <span className="text-lg font-semibold text-brand-primary">{result.simulation.projectedShortlistChance}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strategic Action Plan */}
        <section className="pt-5">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">Strategic Action Plan</h3>
          <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm divide-y divide-zinc-100/50 dark:divide-white/5">
            {result.actionPlan.tasks.map((task, idx) => {
              const colorMap: Record<string, string> = {
                Build: 'bg-blue-500', Practice: 'bg-purple-500', Add: 'bg-emerald-500', Refactor: 'bg-orange-500'
              };
              const badgeMap: Record<string, string> = {
                Build: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10', Practice: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10',
                Add: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', Refactor: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10'
              };
              return (
                <div key={idx} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colorMap[task.action] || 'bg-zinc-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase ${badgeMap[task.action] || 'text-zinc-500 bg-zinc-100'}`}>{task.action}</span>
                      <h4 className="text-[12px] font-semibold text-zinc-900 dark:text-white truncate">{task.task}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{task.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* Deep Dive Improvements */}
        <section className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Deep Dive Improvements</h3>
            <div className="flex gap-3 text-[9px] text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Gaps</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Optimized</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.improvementSuggestions?.map((suggestion, idx) => (
              <ComparisonCard key={idx} suggestion={suggestion} />
            ))}
            {(!result.improvementSuggestions?.length) && (
              <div className="p-12 text-center rounded-2xl bg-zinc-50/50 dark:bg-white/[0.02] border-2 border-dashed border-zinc-200/60 dark:border-white/[0.08]">
                <p className="text-zinc-400 font-medium text-xs uppercase tracking-widest">No major improvements needed</p>
              </div>
            )}
          </div>
        </section>

        {/* Success Indicators */}
        {result.passedChecks && result.passedChecks.length > 0 && (
          <section className="pt-5">
            <h3 className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Success Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.passedChecks.map((check, idx) => (
                <div key={idx} className="p-3 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm flex items-start gap-3 hover:border-emerald-300/50 dark:hover:border-emerald-500/20 transition-colors">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-emerald-500 uppercase tracking-wider mb-0.5">{check.category}</p>
                    <h4 className="text-[12px] font-semibold text-zinc-900 dark:text-white leading-tight">{check.checkName}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{check.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skill Diversity Matrix */}
        <section className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Skill Diversity Matrix</h3>
            <div className="flex gap-3 text-[9px] text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-primary inline-block" /> Mandatory</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Desired</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Matched</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.skillDiversity?.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm space-y-3 flex flex-col h-full hover:border-brand-primary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-semibold text-zinc-900 dark:text-white">{cat.category}</h4>
                  <span className="text-[10px] text-zinc-400">{cat.skills.filter(s => s.found).length}/{cat.skills.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1 items-start content-start">
                  {cat.skills.map((skill, sIdx) => {
                    const isMandatory = skill.level === 'Mandatory';
                    const isDesired = skill.level === 'Desired';
                    const isFound = skill.found;
                    
                    let dotColor = 'bg-zinc-300';
                    if (isMandatory) dotColor = 'bg-brand-primary';
                    else if (isDesired) dotColor = 'bg-sky-500';
                    
                    return (
                      <span 
                        key={sIdx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border transition-all ${
                          isFound 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/5' 
                            : 'bg-zinc-50/80 dark:bg-zinc-900 border-zinc-200/60 dark:border-white/[0.08] text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {isFound ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 text-emerald-500"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        )}
                        {skill.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Annotated Resume X-Ray */}
        <section className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Annotated Resume X-Ray</h3>
            <div className="flex gap-3 text-[9px] text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-emerald-500 rounded-full inline-block" /> Optimized</span>
              <span className="flex items-center gap-1"><span className="w-3 h-[2px] bg-red-500 rounded-full inline-block" /> Flagged</span>
            </div>
          </div>
          
          <div className="relative group/xray">
            <div className="p-5 md:p-8 rounded-2xl bg-zinc-950 border border-white/[0.08] shadow-lg relative">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-4 relative z-20">
                <div className="text-[12px] md:text-[13px] text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap font-mono tracking-tight">
                  {result.annotatedContent.map((fragment, i) => (
                    <FragmentHighlight key={i} fragment={fragment} onHover={handleFragmentHover} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500 mt-3 text-center">Hover highlighted text for insights</p>
          </div>
        </section>

        {/* Category Breakdown */}
        <div className="pt-5 space-y-4">
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => {
              const catData = result.categories?.[cat.id] || { score: 0 };
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all flex items-center gap-2 shrink-0 text-[11px] ${isActive ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-brand-primary/30'}`}
                >
                  <span className={`font-semibold ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{catData.score}%</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4 space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-primary/5 to-brand-primary/[0.02] border border-brand-primary/10">
                  <p className="text-[9px] text-brand-primary uppercase tracking-wider mb-1">Score</p>
                  <span className="text-3xl font-semibold text-zinc-900 dark:text-white">{result.categories?.[activeCategory]?.score || 0}%</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {result.categories?.[activeCategory]?.details || "Evaluating specific metrics for this category..."}
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Key assets
                  </h4>
                  <div className="space-y-2">
                    {(result.categories?.[activeCategory]?.strengths || []).map((s, i) => (
                      <p key={i} className="px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/[0.04] border border-emerald-100/60 dark:border-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-400">{s}</p>
                    ))}
                    {(!result.categories?.[activeCategory]?.strengths?.length) && <p className="text-[11px] text-zinc-400 italic">Standard baseline metadata.</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Critical fixes
                  </h4>
                  <div className="space-y-2">
                    {(result.categories?.[activeCategory]?.weaknesses || []).map((w, i) => (
                      <p key={i} className="px-3 py-2 rounded-xl bg-brand-primary/[0.03] dark:bg-brand-primary/[0.04] border border-brand-primary/10 text-[11px] text-brand-primary">{w}</p>
                    ))}
                    {(!result.categories?.[activeCategory]?.weaknesses?.length) && <p className="text-[11px] text-zinc-400 italic">No immediate refinements detected.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Hover Insights Tooltip */}
        {hoveredFragment && (
          <div 
            className={`absolute z-[100] w-[280px] p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-200 pointer-events-none ${
              tooltipPos.flipped ? 'animate-in fade-in slide-in-from-top-2' : 'animate-in fade-in slide-in-from-bottom-2'
            }`}
            style={{ 
              top: tooltipPos.y, 
              left: tooltipPos.x,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                  hoveredFragment.type === 'good' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {hoveredFragment.type === 'good' ? 'Strength' : 'Improvement'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-100 font-medium leading-relaxed">
                {hoveredFragment.insight}
              </p>
              {hoveredFragment.suggestion && (
                <div className="pt-2.5 border-t border-white/5">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Recommendation</p>
                  <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                    "{hoveredFragment.suggestion}"
                  </p>
                </div>
              )}
            </div>
            {/* Tooltip Arrow */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-l border-t border-white/10 rotate-45 ${
                tooltipPos.flipped ? '-top-1.5' : '-bottom-1.5'
              }`} 
            />
          </div>
        )}
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
        <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-500/15 rounded-2xl text-center space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="px-4 py-1.5 bg-red-100/80 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs hover:bg-red-200 transition-colors">Dismiss</button>
        </div>
      )}

      <div className="p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-semibold text-[10px] shrink-0 border border-brand-primary/20`}>
              1
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Your Resume</h3>
            </div>
            <div className="relative border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-brand-primary/40 transition-all bg-zinc-50 dark:bg-zinc-950 group cursor-pointer overflow-hidden min-h-[120px] flex flex-col items-center justify-center">
              {isUploading ? (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative w-10 h-10 mx-auto">
                    <div className="absolute inset-0 border-2 border-brand-primary/20 rounded-xl" />
                    <div className="absolute inset-0 border-2 border-brand-primary border-t-transparent rounded-xl animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Processing</p>
                    <p className="text-[9px] text-zinc-400 font-medium">{processingStatus || 'Reading document...'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <IconFile />
                  <p className="text-sm font-medium text-zinc-400 group-hover:text-brand-primary transition-colors">
                    {fileName ? fileName : "Upload PDF or Image Resume"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-semibold text-[10px]">2</div>
                <label className="text-[10px] font-semibold text-zinc-400 tracking-wider block uppercase">Target Role</label>
              </div>
              <div className="flex bg-zinc-100/80 dark:bg-zinc-900 p-1 rounded-full">
                <button onClick={() => setAnalysisMode('trend')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${analysisMode === 'trend' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-zinc-500'}`}>Presets</button>
                <button onClick={() => setAnalysisMode('custom')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${analysisMode === 'custom' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-zinc-500'}`}>Paste JD</button>
              </div>
            </div>
            {analysisMode === 'trend' ? (
              <div className="space-y-4">
                {showAiInput ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI Prompt</span>
                      <button onClick={() => setShowAiInput(false)} className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">Back to presets</button>
                    </div>
                    <div className="relative group">
                      <input
                        autoFocus
                        type="text"
                        placeholder="e.g. Software Engineer at Google"
                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 pr-12 text-sm text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiJd()}
                      />
                      <button 
                        onClick={handleGenerateAiJd}
                        disabled={isGeneratingJd || !aiPrompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105"
                      >
                        {isGeneratingJd ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">Describe the company and role for a tailored analysis.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                    {INDUSTRY_ROLES.map(role => (
                      <button key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${selectedRoleId === role.id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/10' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-brand-primary/30'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${selectedRoleId === role.id ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white dark:bg-white/5 border-zinc-100 dark:border-white/10'}`}>
                          {role.icon}
                        </div>
                        <p className="text-[10px] font-semibold tracking-tight leading-tight">{role.name}</p>
                      </button>
                    ))}
                      <button 
                        onClick={() => setShowAiInput(true)} 
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 border-brand-primary/20 text-brand-primary hover:border-brand-primary/40 group`}
                      >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-brand-primary/20 bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                          <path d="m5 3 1 1"/><path d="m19 3-1 1"/><path d="m5 21 1-1"/><path d="m19 21-1-1"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold tracking-tight leading-tight">Generate with AI</p>
                        <p className="text-[8px] opacity-60 font-medium">Any role or company</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                className="w-full h-[180px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-sm text-zinc-800 dark:text-white focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none transition-all font-normal leading-relaxed placeholder:opacity-40"
                placeholder="Paste job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-white/5">
          <button
            onClick={() => setDeepAnalysis(!deepAnalysis)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all cursor-pointer group text-[11px] ${deepAnalysis ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-brand-primary/40'}`}
          >
            <div className={`w-2 h-2 rounded-full transition-all ${deepAnalysis ? 'bg-white' : 'bg-zinc-400'}`} />
            Detailed Review
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!resumeText || !jdText || loading || isUploading}
            className={`flex-1 py-2.5 rounded-full font-medium text-xs transition-all flex items-center justify-center gap-2 ${!resumeText || !jdText || loading || isUploading ? 'bg-zinc-100/80 dark:bg-zinc-800/10 text-zinc-400 cursor-not-allowed border border-zinc-200/60 dark:border-white/[0.08]' : 'bg-brand-primary text-white hover:opacity-90 active:scale-[0.98] shadow-md shadow-brand-primary/20'}`}
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
                className="group p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] text-left hover:border-brand-primary/30 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight truncate max-w-[150px]">{report.label}</p>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Score: {report.totalScore}%</p>
                </div>
                <div className="flex items-center gap-2">
                   <div onClick={(e) => handleDeleteReport(idx, e)} className="p-2.5 rounded-xl text-zinc-400 hover:bg-brand-primary/10 hover:text-brand-primary border-none bg-transparent transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 bg-brand-primary/5 text-brand-primary`}>
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
