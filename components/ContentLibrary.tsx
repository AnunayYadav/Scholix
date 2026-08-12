
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { LibraryFile, UserProfile, Folder } from '../types.ts';
import NexusServer, { isIITMProgram } from '../services/nexusServer.ts';
import PDFViewer from './PDFViewer.tsx';
import NexusOriginals from './NexusOriginals.tsx';
import NexusDropdown from './NexusDropdown.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import { slugify, librarySlug, matchLibrarySlug } from '../utils/slugify.ts';
import NexusAd from './NexusAd.tsx';
import SubjectCommunity from './SubjectCommunity.tsx';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  TouchSensor,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import VerifiedBadge from './VerifiedBadge.tsx';
import { Code, Database, Compass, Terminal, Globe, Languages, MessageSquare, Landmark, BookOpen, FileText, Cpu, Monitor, Sigma, Folder as FolderIconLucide, HelpCircle, Video, MoreHorizontal, Star, ArrowLeft, Plus, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { getProgramCurriculum, findSubjectMetadata } from '../data/curriculumData.ts';
import { SYLLABUS_DATA } from '../data/syllabusData.ts';

const matchFolderSlug = (folderName: string, paramSlug: string): boolean => {
  return matchLibrarySlug(folderName, paramSlug, 'subject');
};

const matchSemesterName = (nameA: string, nameB: string): boolean => {
  if (!nameA || !nameB) return false;
  // Normalize both to compare: strip to just letters+digits, unify semester/term/sem
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace('semester', 'term').replace('sem', 'term');
  return norm(nameA) === norm(nameB);
};

import { FileIcon } from './FileIcon.tsx';

const FolderIcon = ({ type, name = '', size = "w-7 h-7", iconName, color }: { type: 'semester' | 'subject' | 'category' | 'root', name?: string, size?: string, iconName?: string, color?: string }) => {
  const IconMap: { [key: string]: any } = {
    Code, Database, Compass, Terminal, Globe, Languages, MessageSquare, Landmark,
    BookOpen, FileText, Cpu, Monitor, Sigma, Folder: FolderIconLucide, HelpCircle, Video
  };

  const className = `${size} transition-colors`;
  const iconColor = color || '#ff7a00';

  if (iconName && IconMap[iconName]) {
    const IconComponent = IconMap[iconName];
    return <IconComponent className={className} style={{ color: iconColor }} strokeWidth={3} />;
  }

  const lowerName = name.toLowerCase().trim();

  if (lowerName === 'lectures') {
    return <Video className={className} style={{ color: iconColor }} strokeWidth={3} />;
  }

  if (lowerName === 'notes') {
    return <BookOpen className={className} style={{ color: iconColor }} strokeWidth={3} />;
  }

  if (lowerName === 'pyqs') {
    return <HelpCircle className={className} style={{ color: iconColor }} strokeWidth={3} />;
  }

  if (lowerName === 'syllabus') {
    return <FileText className={className} style={{ color: iconColor }} strokeWidth={3} />;
  }

  if (type === 'semester') {
    return <Landmark className={className} style={{ color: iconColor }} strokeWidth={3} />;
  }

  return <FolderIconLucide className={className} style={{ color: iconColor }} strokeWidth={3} />;
};

interface FileStyleConfig {
  iconBg: string;
  iconText: string;
  badgeBg: string;
  badgeText: string;
  hoverBorder: string;
  hoverText: string;
  label: string;
  glowColor: string;
  actionText: string;
  actionHoverBg: string;
}

const getFileStyle = (fileName: string): FileStyleConfig => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const configs: Record<string, FileStyleConfig> = {
    pdf: {
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/10',
      iconText: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      badgeText: 'text-rose-600 dark:text-rose-300',
      hoverBorder: 'hover:border-rose-500/40 dark:hover:border-rose-500/30',
      hoverText: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
      label: 'PDF',
      glowColor: 'rgba(244, 63, 94, 0.15)',
      actionText: 'text-rose-500 dark:text-rose-400',
      actionHoverBg: 'hover:bg-rose-500 dark:hover:bg-rose-500'
    },
    ppt: {
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/10',
      iconText: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      badgeText: 'text-amber-600 dark:text-amber-300',
      hoverBorder: 'hover:border-amber-500/40 dark:hover:border-amber-500/30',
      hoverText: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
      label: 'PPT',
      glowColor: 'rgba(245, 158, 11, 0.15)',
      actionText: 'text-amber-500 dark:text-amber-400',
      actionHoverBg: 'hover:bg-amber-500 dark:hover:bg-amber-500'
    },
    pptx: {
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/10',
      iconText: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      badgeText: 'text-amber-600 dark:text-amber-300',
      hoverBorder: 'hover:border-amber-500/40 dark:hover:border-amber-500/30',
      hoverText: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
      label: 'PPTX',
      glowColor: 'rgba(245, 158, 11, 0.15)',
      actionText: 'text-amber-500 dark:text-amber-400',
      actionHoverBg: 'hover:bg-amber-500 dark:hover:bg-amber-500'
    },
    doc: {
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/10',
      iconText: 'text-blue-500 dark:text-blue-400',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      badgeText: 'text-blue-600 dark:text-blue-300',
      hoverBorder: 'hover:border-blue-500/40 dark:hover:border-blue-500/30',
      hoverText: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
      label: 'DOC',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      actionText: 'text-blue-500 dark:text-blue-400',
      actionHoverBg: 'hover:bg-blue-500 dark:hover:bg-blue-500'
    },
    docx: {
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/10',
      iconText: 'text-blue-500 dark:text-blue-400',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      badgeText: 'text-blue-600 dark:text-blue-300',
      hoverBorder: 'hover:border-blue-500/40 dark:hover:border-blue-500/30',
      hoverText: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
      label: 'DOCX',
      glowColor: 'rgba(59, 130, 246, 0.15)',
      actionText: 'text-blue-500 dark:text-blue-400',
      actionHoverBg: 'hover:bg-blue-500 dark:hover:bg-blue-500'
    },
    xls: {
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      iconText: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeText: 'text-emerald-600 dark:text-emerald-300',
      hoverBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
      hoverText: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
      label: 'XLS',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      actionText: 'text-emerald-500 dark:text-emerald-400',
      actionHoverBg: 'hover:bg-emerald-500 dark:hover:bg-emerald-500'
    },
    xlsx: {
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      iconText: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeText: 'text-emerald-600 dark:text-emerald-300',
      hoverBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
      hoverText: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
      label: 'XLSX',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      actionText: 'text-emerald-500 dark:text-emerald-400',
      actionHoverBg: 'hover:bg-emerald-500 dark:hover:bg-emerald-500'
    },
    csv: {
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      iconText: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeText: 'text-emerald-600 dark:text-emerald-300',
      hoverBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
      hoverText: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
      label: 'CSV',
      glowColor: 'rgba(16, 185, 129, 0.15)',
      actionText: 'text-emerald-500 dark:text-emerald-400',
      actionHoverBg: 'hover:bg-emerald-500 dark:hover:bg-emerald-500'
    }
  };

  const defaultConfig: FileStyleConfig = {
    iconBg: 'bg-zinc-500/10 dark:bg-zinc-500/10',
    iconText: 'text-zinc-500 dark:text-zinc-400',
    badgeBg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    badgeText: 'text-zinc-600 dark:text-zinc-300',
    hoverBorder: 'hover:border-zinc-500/40 dark:hover:border-zinc-500/30',
    hoverText: 'group-hover:text-zinc-500 dark:group-hover:text-zinc-400',
    label: ext.toUpperCase() || 'FILE',
    glowColor: 'rgba(113, 113, 122, 0.15)',
    actionText: 'text-zinc-500 dark:text-zinc-400',
    actionHoverBg: 'hover:bg-zinc-500 dark:hover:bg-zinc-500'
  };

  return configs[ext] || defaultConfig;
};


const SkeletonFolderCard = () => (
  <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] relative overflow-hidden">
    <div className="flex items-center gap-3.5 min-w-0 w-full">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 skeleton-pulse" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded-md skeleton-pulse" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div className="h-3 w-12 rounded-md skeleton-pulse shrink-0" />
          <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
          <div className="h-3 w-16 rounded-md skeleton-pulse shrink-0" />
          <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
          <div className="h-3 w-16 rounded-md skeleton-pulse shrink-0" />
        </div>
      </div>
    </div>
    <div className="w-4 h-4 rounded skeleton-pulse shrink-0 ml-4" />
  </div>
);

const SkeletonFileCard = () => (
  <div className="p-4 rounded-[24px] border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0c0c0e] relative overflow-hidden flex flex-col min-h-[148px]">
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-xl skeleton-pulse" />
      <div className="w-10 h-4 rounded-md skeleton-pulse" />
    </div>
    <div className="space-y-1.5 mb-2 flex-1">
      <div className="h-4 w-5/6 rounded-md skeleton-pulse" />
      <div className="h-4 w-2/3 rounded-md skeleton-pulse" />
    </div>
    <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
      <div className="h-3 w-12 rounded skeleton-pulse" />
      <div className="h-7 w-20 rounded-xl skeleton-pulse" />
    </div>
  </div>
);

const SubjectDetailHeader: React.FC<{
  meta: any;
  syllabusText: string | null;
}> = ({ meta, syllabusText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeUnit, setActiveUnit] = useState<number | null>(null);

  const units = useMemo(() => {
    if (!syllabusText) return [];
    
    const items: { title: string; content: string[] }[] = [];
    const lines = syllabusText.split('\n');
    let currentUnit: { title: string; content: string[] } | null = null;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('Unit ')) {
        if (currentUnit) {
          items.push(currentUnit);
        }
        currentUnit = { title: trimmed, content: [] };
      } else if (trimmed) {
        if (currentUnit) {
          currentUnit.content.push(trimmed);
        } else {
          currentUnit = { title: "Course Introduction", content: [trimmed] };
        }
      }
    });
    if (currentUnit) {
      items.push(currentUnit);
    }
    return items;
  }, [syllabusText]);

  return (
    <div className="bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-2xl p-5 space-y-5 col-span-full shadow-sm">
      {/* Subject Information Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: 'var(--brand-primary)' }}>
              {meta.code}
            </span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/5">
              {meta.credits} Credits
            </span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/5">
              {meta.type}
            </span>
          </div>
          <div className="text-base md:text-lg font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight leading-tight">
            {meta.title}
          </div>
        </div>

        {/* LTP Badges Row */}
        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">L-T-P:</span>
          {[
            { label: 'L', val: meta.l, bg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
            { label: 'T', val: meta.t, bg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' },
            { label: 'P', val: meta.p, bg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' }
          ].map((ltp, idx) => (
            <span key={idx} className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${ltp.bg}`}>
              {ltp.val} {ltp.label}
            </span>
          ))}
        </div>
      </div>

      {/* Collapsible Syllabus Accordion */}
      {units.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-white/5 pt-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between font-semibold text-[11px] sm:text-xs text-zinc-500 hover:text-orange-500 transition-all border-none bg-transparent p-0 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" style={{ color: 'var(--brand-primary)' }}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Course Syllabus Overview
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isOpen && (
            <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {units.map((unit, uIdx) => (
                <div key={uIdx} className="border-b border-zinc-100 dark:border-white/5 last:border-0 py-2">
                  <button
                    onClick={() => setActiveUnit(activeUnit === uIdx ? null : uIdx)}
                    className="w-full text-left font-medium text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300 hover:text-orange-500 transition-colors border-none bg-transparent flex justify-between items-center py-1 cursor-pointer"
                  >
                    <span>{unit.title}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`w-3.5 h-3.5 transition-transform duration-200 text-zinc-400 ${activeUnit === uIdx ? 'rotate-180 text-orange-500' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {activeUnit === uIdx && (
                    <div className="mt-2 pl-3 border-l-2 border-orange-500/20 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-1.5 pb-2">
                      {unit.content.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


interface ContentLibraryProps {
  userProfile: UserProfile | null;
  initialView?: 'browse' | 'my-uploads';
  onAuthRequired?: () => void;
  authIsReady?: boolean;
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ userProfile, initialView = 'browse', onAuthRequired, authIsReady = true }) => {
  const { shortBrandName, uniSlug, universityInfo } = useUniversity();
  const params = useParams();
  const wildcard = params['*'] || '';
  let program: string | undefined;
  let semester: string | undefined;
  let subject: string | undefined;
  let category: string | undefined;

  if (wildcard) {
    const parts = wildcard.split('/');
    program = parts[0] || undefined;
    semester = parts[1] || undefined;
    subject = parts[2] || undefined;
    category = parts[3] || undefined;
  }

  const [allFiles, setAllFiles] = useState<LibraryFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [userProgressList, setUserProgressList] = useState<{ document_id: string; progress_percentage: number; last_read_page: number }[]>([]);
  const [viewMode, setViewMode] = useState<'browse' | 'my-uploads' | 'originals'>(initialView);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const routePrefix = uniSlug ? `/${uniSlug}` : '';


  const [activeSemester, setActiveSemester] = useState<Folder | null>(null);
  const [activeSubject, setActiveSubject] = useState<Folder | null>(null);
  const [activeCategory, setActiveCategory] = useState<Folder | null>(null);

  const initialPrograms = ["BTech CSE", "BTech IT", "BCA", "MCA", "MBA", "BCom", "BA", "BS Data Science"];
  const [availablePrograms, setAvailablePrograms] = useState(initialPrograms);
  const [selectedProgram, setSelectedProgram] = useState(() => {
    if (program) {
      const found = initialPrograms.find(p => matchLibrarySlug(p, program, 'program'));
      if (found) return found;
      if (initialPrograms.includes(decodeURIComponent(program))) return decodeURIComponent(program);
    }
    const saved = typeof window !== 'undefined' ? localStorage.getItem('selected_library_program') : null;
    if (saved && initialPrograms.includes(saved)) {
      return saved;
    }
    if (userProfile?.program && initialPrograms.includes(userProfile.program)) return userProfile.program;
    return initialPrograms[0];
  });

  // Save selected program to localStorage
  useEffect(() => {
    if (selectedProgram) {
      localStorage.setItem('selected_library_program', selectedProgram);
    }
  }, [selectedProgram]);

  // Redirect to saved program if visiting the root library view without explicit override
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isChange = searchParams.get('change') === 'true';
    if (viewMode === 'browse' && !program && !isChange) {
      const savedProgram = localStorage.getItem('selected_library_program');
      if (savedProgram && availablePrograms.includes(savedProgram)) {
        navigate(`${routePrefix}/library/${librarySlug(savedProgram, 'program')}`, { replace: true });
      }
    }
  }, [program, viewMode, routePrefix, navigate, availablePrograms]);

  const [isAdminView, setIsAdminView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [folderToManage, setFolderToManage] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderIcon, setFolderIcon] = useState('Folder');
  const [folderColor, setFolderColor] = useState('#ff7a00');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<{
    file: File;
    name: string;
    description: string;
    semester: string;
    subject: string;
    type: string;
    program: string;
  }[]>([]);
  const [activeUploadIndex, setActiveUploadIndex] = useState(0);

  const [isClosingDetails, setIsClosingDetails] = useState(false);
  const [isClosingFolder, setIsClosingFolder] = useState(false);
  const [isClosingRename, setIsClosingRename] = useState(false);
  const [isClosingUpload, setIsClosingUpload] = useState(false);
  const [isClosingEdit, setIsClosingEdit] = useState(false);

  const handleCloseDetails = () => {
    setIsClosingDetails(true);
    setTimeout(() => {
      setShowDetailsModal(false);
      setIsClosingDetails(false);
    }, 250);
  };

  const handleCloseFolder = () => {
    setIsClosingFolder(true);
    setTimeout(() => {
      setShowFolderModal(false);
      setIsClosingFolder(false);
    }, 250);
  };

  const handleCloseRename = () => {
    setIsClosingRename(true);
    setTimeout(() => {
      setShowRenameModal(false);
      setIsClosingRename(false);
    }, 250);
  };

  const handleCloseUpload = () => {
    setIsClosingUpload(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setPendingUploads([]);
      setIsCreatingNew({ program: false, semester: false, subject: false, type: false });
      setIsClosingUpload(false);
    }, 250);
  };

  const handleCloseEdit = () => {
    setIsClosingEdit(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsClosingEdit(false);
    }, 250);
  };
  const [metaForm, setMetaForm] = useState({ name: '', description: '', semester: '', subject: '', type: '', program: selectedProgram });

  // Section Management State & Handlers
  const [targetSectionName, setTargetSectionName] = useState<string | null>(null);
  const [sectionOrders, setSectionOrders] = useState<Record<string, number>>({});
  const [extraSections, setExtraSections] = useState<string[]>([]);
  const [activeSectionMenu, setActiveSectionMenu] = useState<string | null>(null);

  const getFolderNameSection = useCallback((f: Folder) => {
    if (f.description) {
      try {
        const parsed = JSON.parse(f.description);
        if (parsed && parsed.section) return parsed.section as string;
      } catch (e) {
        if (!f.description.startsWith('{')) return f.description;
      }
    }
    const meta = findSubjectMetadata(selectedProgram, f.name);
    if (meta) {
      if (meta.type === 'CR') return 'Core Courses';
      const curriculum = getProgramCurriculum(selectedProgram);
      const term = curriculum?.terms.find(t => t.termName.toLowerCase() === (activeSemester?.name || '').toLowerCase());
      if (term) {
        const basket = term.electiveBaskets.find(b => b.subjects.some(s => s.code === meta.code));
        if (basket) return basket.name;
      }
    }
    return 'Other / Custom Courses';
  }, [selectedProgram, activeSemester]);

  const handleAddSubjectToSection = (sectionName: string) => {
    setTargetSectionName(sectionName);
    setNewFolderName('');
    setFolderIcon('Folder');
    setFolderColor('#ff7a00');
    setShowFolderModal(true);
  };

  const handleCreateNewSection = () => {
    const secName = window.prompt("Enter new Section Name (e.g. Project & Lab Elective Basket):");
    if (!secName || !secName.trim()) return;
    const cleanSecName = secName.trim();
    handleAddSubjectToSection(cleanSecName);
  };

  const handleRenameSection = async (oldName: string, groupItems: Folder[]) => {
    const newSecName = window.prompt(`Rename Section "${oldName}" to:`, oldName);
    if (!newSecName || !newSecName.trim() || newSecName.trim() === oldName) return;
    const cleanNewName = newSecName.trim();

    setIsProcessing(true);
    try {
      const updates = groupItems.map(f => ({
        folder: f,
        sectionName: cleanNewName,
        sectionOrder: sectionOrders[oldName]
      }));
      await NexusServer.batchUpdateSubjectSections(updates);

      setSectionOrders(prev => {
        const next = { ...prev };
        if (next[oldName] !== undefined) {
          next[cleanNewName] = next[oldName];
          delete next[oldName];
        }
        return next;
      });

      setExtraSections(prev => prev.map(s => s === oldName ? cleanNewName : s));

      showToast(`Section renamed to "${cleanNewName}"`, "success");
      fetchFromSource(false);
    } catch (e: any) {
      showToast("Error renaming section: " + e.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveSection = async (sectionName: string, direction: 'up' | 'down', sortedGroups: { name: string; items: Folder[] }[]) => {
    const currentIndex = sortedGroups.findIndex(g => g.name === sectionName);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedGroups.length) return;

    // Swap adjacent groups
    const newGroups = [...sortedGroups];
    const temp = newGroups[currentIndex];
    newGroups[currentIndex] = newGroups[targetIndex];
    newGroups[targetIndex] = temp;

    // Assign explicit sequential orders to ALL groups
    const newOrders: Record<string, number> = {};
    const updates: { folder: Folder; sectionName: string; sectionOrder: number }[] = [];

    newGroups.forEach((g, idx) => {
      newOrders[g.name] = idx;
      g.items.forEach(f => {
        updates.push({ folder: f, sectionName: g.name, sectionOrder: idx });
      });
    });

    setSectionOrders(newOrders);

    try {
      if (updates.length > 0) {
        await NexusServer.batchUpdateSubjectSections(updates);
      }
      showToast("Section order saved to Supabase!", "success");
      fetchFromSource(false);
    } catch (e: any) {
      showToast("Error saving section order: " + e.message, "error");
    }
  };

  // Restore saved section orders and custom sections from Supabase library_items on load
  useEffect(() => {
    if (!folders || folders.length === 0) return;
    const loadedOrders: Record<string, number> = {};
    const loadedExtra: string[] = [];

    folders.forEach(f => {
      if (f.description) {
        try {
          const parsed = JSON.parse(f.description);
          if (parsed && parsed.section) {
            if (parsed.section_order !== undefined) {
              loadedOrders[parsed.section] = parsed.section_order;
            }
            if (!loadedExtra.includes(parsed.section)) {
              loadedExtra.push(parsed.section);
            }
          }
        } catch (e) {}
      }
    });

    if (Object.keys(loadedOrders).length > 0) {
      setSectionOrders(prev => ({ ...loadedOrders, ...prev }));
    }
    if (loadedExtra.length > 0) {
      setExtraSections(prev => Array.from(new Set([...prev, ...loadedExtra])));
    }
  }, [folders]);

  useEffect(() => {
    if (showUploadModal || showEditModal) {
      setMetaForm(prev => ({ ...prev, program: selectedProgram }));
    }
  }, [showUploadModal, showEditModal, selectedProgram]);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null);

  const [activePdfFile, setActivePdfFile] = useState<LibraryFile | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isAnyModalOpen = showFolderModal || showRenameModal || showDetailsModal || showEditModal || showUploadModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFolderModal, showRenameModal, showDetailsModal, showEditModal, showUploadModal]);

  const handleFilesSelected = useCallback((files: FileList | File[], forceProgram?: string, forceSemester?: string, forceSubject?: string, forceType?: string) => {
    const newUploads = Array.from(files).map(f => ({
      file: f,
      name: f.name.replace(/\.[^/.]+$/, ""),
      description: '',
      semester: forceSemester || activeSemester?.name || '',
      subject: forceSubject || activeSubject?.name || '',
      type: forceType || activeCategory?.name || '',
      program: forceProgram || selectedProgram
    }));

    setPendingUploads(prev => [...prev, ...newUploads]);
    if (pendingUploads.length === 0) {
      setActiveUploadIndex(0);
      const first = newUploads[0];
      setMetaForm({
        name: first.name,
        description: first.description,
        semester: first.semester,
        subject: first.subject,
        type: first.type,
        program: first.program
      });
    }
    setShowUploadModal(true);
  }, [activeSemester, activeSubject, activeCategory, selectedProgram, availablePrograms, pendingUploads.length]);

  // Sync current metaForm back to pendingUploads
  useEffect(() => {
    if (showUploadModal && pendingUploads.length > 0) {
      setPendingUploads(prev => {
        const next = [...prev];
        if (next[activeUploadIndex]) {
          next[activeUploadIndex] = { ...next[activeUploadIndex], ...metaForm };
        }
        return next;
      });
    }
  }, [metaForm, showUploadModal, activeUploadIndex]);

  const switchActiveUpload = (index: number) => {
    const target = pendingUploads[index];
    if (target) {
      setActiveUploadIndex(index);
      setMetaForm({
        name: target.name,
        description: target.description,
        semester: target.semester,
        subject: target.subject,
        type: target.type,
        program: target.program
      });
    }
  };

  useEffect(() => {
    if (initialView) setViewMode(initialView);
  }, [initialView]);

  const fetchFromSource = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setIsLoading(true);
    try {
      const [folderList, filesFromDb] = await Promise.all([
        NexusServer.fetchFolders(selectedProgram),
        isAdminView
          ? NexusServer.fetchPendingFiles(selectedProgram, searchQuery)
          : (viewMode === 'my-uploads' && userProfile)
            ? NexusServer.fetchUserFiles(userProfile.id)
            : NexusServer.fetchFiles(selectedProgram, searchQuery)
      ]);

      setFolders(folderList);
      setAllFiles(filesFromDb);
      console.log("[ContentLibrary] fetchFromSource successfully loaded:", {
        selectedProgram,
        foldersCount: folderList.length,
        filesCount: filesFromDb.length,
        sampleFiles: filesFromDb.slice(0, 3)
      });
    } catch (e: any) {
      console.error("Library load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isAdminView, viewMode, userProfile, searchQuery, selectedProgram]);

  useEffect(() => {
    fetchFromSource(true);
  }, [fetchFromSource]);

  useEffect(() => {
    const handleDocClick = () => setActiveMenuFileId(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!userProfile) return;
    try {
      const progressData = await NexusServer.fetchUserDocumentProgress();
      setUserProgressList(progressData);
    } catch (e) {
      console.error("Failed to fetch user document progress:", e);
    }
  }, [userProfile]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Dynamically update document title & description meta tag on folder/route changes
  useEffect(() => {
    let title = "Content Library Hub | Scholix";
    let description = "Access university study materials, notes, and previous year papers (PYQs) on Scholix.";

    if (activePdfFile) {
      title = `${activePdfFile.name} | Scholix`;
      description = `View and download ${activePdfFile.name} on Scholix.`;
    } else if (activeSubject) {
      const categorySuffix = activeCategory ? ` ${activeCategory.name}` : " Notes & PYQs";
      title = `${activeSubject.name}${categorySuffix} | ${selectedProgram} | Scholix`;
      description = `Download study materials, handwritten notes, and previous year papers (PYQs) for ${activeSubject.name} (${selectedProgram}) on Scholix.`;
    } else if (activeSemester) {
      title = `${activeSemester.name} Library | ${selectedProgram} | Scholix`;
      description = `Browse subjects, syllabus, notes, and PYQs for ${selectedProgram} ${activeSemester.name} at Scholix.`;
    } else {
      title = `Library Hub | ${selectedProgram} | Scholix`;
      description = `Access university notes, previous year question papers (PYQs), and study resources for ${selectedProgram} on Scholix.`;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [activeSemester, activeSubject, activeCategory, selectedProgram, activePdfFile]);

  // Derived folders list reading directly from Supabase DB
  const getMergedFolders = useCallback((prog: string, activeSub: Folder | null) => {
    return folders;
  }, [folders]);

  // Derived folders list merging virtualized BTech CSE curriculum schema
  const finalFolders = useMemo(() => {
    return getMergedFolders(selectedProgram, activeSubject);
  }, [getMergedFolders, selectedProgram, activeSubject]);

  // Derived folders list for modal context
  const modalFolders = useMemo(() => {
    const baseFolders = getMergedFolders(metaForm.program, null);
    const subFolder = baseFolders.find(f => f.name === metaForm.subject && f.type === 'subject');
    if (subFolder) {
      return getMergedFolders(metaForm.program, subFolder);
    }
    return baseFolders;
  }, [getMergedFolders, metaForm.program, metaForm.subject]);


  const modalSemesters = useMemo(() => {
    return modalFolders.filter(f => f.type === 'semester').map(f => f.name);
  }, [modalFolders]);

  const modalSubjects = useMemo(() => {
    const sem = modalFolders.find(f => f.name === metaForm.semester && f.type === 'semester');
    return sem ? modalFolders.filter(f => f.type === 'subject' && f.parent_id === sem.id).map(f => f.name) : [];
  }, [modalFolders, metaForm.semester]);

  const modalCategories = useMemo(() => {
    const sub = modalFolders.find(f => f.name === metaForm.subject && f.type === 'subject');
    return sub ? Array.from(new Set(modalFolders.filter(f => f.type === 'category' && f.parent_id === sub.id).map(f => f.name))) : [];
  }, [modalFolders, metaForm.subject]);


  // Sync state with URL params
  useEffect(() => {

    if (finalFolders.length > 0) {
      let matchedProgram = selectedProgram;
      if (program) {
        const found = availablePrograms.find(p => matchLibrarySlug(p, program, 'program'));
        if (found) matchedProgram = found;
        else matchedProgram = decodeURIComponent(program);
      }

      if (matchedProgram !== selectedProgram) {
        setSelectedProgram(matchedProgram);
      }

      if (semester || subject || category) {
        if (viewMode !== 'browse') {
          setViewMode('browse');
        }
      }

      if (semester) {
        const sem = finalFolders.find(f => f.type === 'semester' && matchLibrarySlug(f.name, semester, 'semester') && f.program === matchedProgram);
        if (activeSemester?.id !== (sem?.id || null)) {
          setActiveSemester(sem || null);
        }
        
        if (subject && sem) {
          const subj = finalFolders.find(f => f.type === 'subject' && matchFolderSlug(f.name, subject) && f.parent_id === sem.id);
          if (activeSubject?.id !== (subj?.id || null)) {
            setActiveSubject(subj || null);
          }
          
          if (category && subj) {
            const cat = finalFolders.find(f => f.type === 'category' && matchLibrarySlug(f.name, category, 'category') && f.parent_id === subj.id);
            if (activeCategory?.id !== (cat?.id || null)) {
              setActiveCategory(cat || null);
            }
          } else {
            if (activeCategory !== null) {
              setActiveCategory(null);
            }
          }
        } else {
          if (activeSubject !== null) {
            setActiveSubject(null);
          }
          if (activeCategory !== null) {
            setActiveCategory(null);
          }
        }
      } else {
        if (activeSemester !== null) {
          setActiveSemester(null);
        }
        if (activeSubject !== null) {
          setActiveSubject(null);
        }
        if (activeCategory !== null) {
          setActiveCategory(null);
        }
      }
    }
  }, [program, semester, subject, category, finalFolders, availablePrograms, selectedProgram, viewMode]);



  const displayFiles = useMemo(() => {
    let data = [...allFiles];

    if (isAdminView || viewMode === 'my-uploads' || searchQuery.trim() !== '') {
      // Global flattened views
    } else if (viewMode === 'browse') {
      if (activeCategory) {
        const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
        if (isBtech && activeSubject) {
          const codeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
          const code = codeMatch ? codeMatch[1].toUpperCase() : activeSubject.name.toUpperCase().trim();
          data = data.filter(f =>
            f.subject.toUpperCase().includes(code) &&
            f.type?.toLowerCase() === activeCategory.name.toLowerCase()
          );
        } else {
          data = data.filter(f =>
            f.semester === activeSemester?.name &&
            f.subject === activeSubject?.name &&
            f.type?.toLowerCase() === activeCategory.name.toLowerCase()
          );
        }
      } else if (activeSubject) {
        const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
        if (isBtech) {
          const codeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
          const code = codeMatch ? codeMatch[1].toUpperCase() : activeSubject.name.toUpperCase().trim();
          data = data.filter(f =>
            f.subject.toUpperCase().includes(code) &&
            (!f.type || f.type.trim() === '' || f.type.toLowerCase() === 'general')
          );
        } else {
          data = data.filter(f =>
            f.semester === activeSemester?.name &&
            f.subject === activeSubject.name &&
            (!f.type || f.type.trim() === '' || f.type.toLowerCase() === 'general')
          );
        }
      } else {
        data = [];
      }
    }

    data.sort((a, b) => {
      // Primary sort: display_order
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;

      // Secondary sort: user selected criteria
      if (sortBy === 'newest') return b.uploadDate - a.uploadDate;
      if (sortBy === 'oldest') return a.uploadDate - b.uploadDate;
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      return 0;
    });
    return data;
  }, [allFiles, searchQuery, isAdminView, viewMode, activeSemester, activeSubject, activeCategory, sortBy]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    if (!userProfile?.is_admin) return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !userProfile?.is_admin) return;

    const oldIndexFiles = allFiles.findIndex(f => f.id === active.id);
    const newIndexFiles = allFiles.findIndex(f => f.id === over.id);

    if (oldIndexFiles !== -1 && newIndexFiles !== -1) {
      const movedFiles = arrayMove(allFiles, oldIndexFiles, newIndexFiles);

      // Update the objects themselves so the sort useMemo doesn't fight the change
      const updatedFiles = movedFiles.map((f: LibraryFile, index: number) => ({
        ...f,
        display_order: index
      }));

      // Update local state for immediate feedback
      setAllFiles(updatedFiles);

      // Persist to DB
      try {
        const fileOrders = updatedFiles.map((f, index) => ({ id: f.id, order: index }));
        await NexusServer.reorderFiles(fileOrders);
      } catch (e: any) {
        showToast("Failed to save order: " + e.message, "error");
        fetchFromSource(false); // Revert on failure
      }
      return;
    }

    // Handle Folder Reordering
    const activeBaseId = active.id.split('-dup-')[0];
    const overBaseId = over.id.split('-dup-')[0];
    const oldIndexFolders = folders.findIndex(f => f.id === activeBaseId);
    const newIndexFolders = folders.findIndex(f => f.id === overBaseId);

    if (oldIndexFolders !== -1 && newIndexFolders !== -1) {
      const movedFolders = arrayMove(folders, oldIndexFolders, newIndexFolders);

      // Update the objects themselves
      const updatedFolders = movedFolders.map((f: Folder, index: number) => ({
        ...f,
        display_order: index
      }));

      // Update local state
      setFolders(updatedFolders);

      // Persist to DB
      try {
        const folderOrders = updatedFolders.map((f, index) => ({ id: f.id, order: index }));
        await NexusServer.reorderFolders(folderOrders);
      } catch (e: any) {
        showToast("Failed to save folder order: " + e.message, "error");
        fetchFromSource(false);
      }
    }
  };

  const currentFolders = useMemo(() => {
    if (isAdminView || viewMode === 'my-uploads') return [];
    
    const filtered = finalFolders.filter(f => {
      if (!activeSemester) return f.type === 'semester';
      if (!activeSubject) {
        // We are listing subjects
        const isSubject = f.type === 'subject' && f.parent_id === activeSemester.id;
        if (!isSubject) return false;
        
        // If there's a search query, check if the subject matches
        if (searchQuery && searchQuery.trim() !== '') {
          const q = searchQuery.trim().toLowerCase();
          const nameMatches = f.name.toLowerCase().includes(q);
          
          // Count matching files
          const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
          let matchingFilesCount = 0;
          if (isBtech) {
            const codeMatch = f.name.match(/^([A-Za-z]+\d{3})/);
            const code = codeMatch ? codeMatch[1].toUpperCase() : f.name.toUpperCase().trim();
            matchingFilesCount = allFiles.filter(file => file.subject?.toUpperCase().includes(code) && file.name.toLowerCase().includes(q)).length;
          } else {
            matchingFilesCount = allFiles.filter(file => file.semester?.toLowerCase() === activeSemester.name.toLowerCase() && file.subject?.toLowerCase() === f.name.toLowerCase() && file.name.toLowerCase().includes(q)).length;
          }
          
          // Count matching category folders
          const matchingCategoriesCount = finalFolders.filter(c => c.type === 'category' && c.parent_id === f.id && c.name.toLowerCase().includes(q)).length;
          
          return nameMatches || matchingFilesCount > 0 || matchingCategoriesCount > 0;
        }
        
        return true;
      }
      if (!activeCategory) return f.type === 'category' && f.parent_id === activeSubject.id;
      return false;
    });

    return [...filtered].sort((a, b) => {
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [finalFolders, activeSemester, activeSubject, activeCategory, isAdminView, selectedProgram, allFiles, searchQuery]);

  const getSubjectSearchMatchText = (folder: Folder) => {
    if (!searchQuery || searchQuery.trim() === '' || folder.type !== 'subject') return null;
    const q = searchQuery.trim().toLowerCase();
    
    // Count matching files
    const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
    let matchingFilesCount = 0;
    if (isBtech) {
      const codeMatch = folder.name.match(/^([A-Za-z]+\d{3})/);
      const code = codeMatch ? codeMatch[1].toUpperCase() : folder.name.toUpperCase().trim();
      matchingFilesCount = allFiles.filter(file => file.subject?.toUpperCase().includes(code) && file.name.toLowerCase().includes(q)).length;
    } else {
      const parentSem = finalFolders.find(f => f.id === folder.parent_id);
      if (parentSem) {
        matchingFilesCount = allFiles.filter(file => file.semester?.toLowerCase() === parentSem.name.toLowerCase() && file.subject?.toLowerCase() === folder.name.toLowerCase() && file.name.toLowerCase().includes(q)).length;
      }
    }
    
    // Count matching category folders
    const matchingCategoriesCount = finalFolders.filter(c => c.type === 'category' && c.parent_id === folder.id && c.name.toLowerCase().includes(q)).length;
    
    if (matchingFilesCount > 0 && matchingCategoriesCount > 0) {
      return `${matchingFilesCount} file${matchingFilesCount > 1 ? 's' : ''}, ${matchingCategoriesCount} category${matchingCategoriesCount > 1 ? 'ies' : ''} matched`;
    } else if (matchingFilesCount > 0) {
      return `${matchingFilesCount} file${matchingFilesCount > 1 ? 's' : ''} matched`;
    } else if (matchingCategoriesCount > 0) {
      return `${matchingCategoriesCount} category${matchingCategoriesCount > 1 ? 'ies' : ''} matched`;
    } else if (folder.name.toLowerCase().includes(q)) {
      return 'Subject matches by name';
    }
    return null;
  };

  const dropdownLists = useMemo(() => {
    const sems = Array.from(new Set(folders.filter(f => f.type === 'semester').map(f => f.name)));
    const subjs = Array.from(new Set(folders.filter(f => f.type === 'subject').map(f => f.name)));
    const cats = Array.from(new Set(folders.filter(f => f.type === 'category').map(f => f.name)));
    return { sems, subjs, cats };
  }, [folders]);

  const folderFileCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    finalFolders.forEach(folder => {
      let count = 0;
      if (folder.type === 'semester') {
        count = allFiles.filter(f => f.semester?.toLowerCase() === folder.name.toLowerCase()).length;
      } else if (folder.type === 'subject') {
        const parentSem = finalFolders.find(f => f.id === folder.parent_id);
        if (parentSem) {
          const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
          if (isBtech) {
            const codeMatch = folder.name.match(/^([A-Za-z]+\d{3})/);
            const code = codeMatch ? codeMatch[1].toUpperCase() : folder.name.toUpperCase().trim();
            count = allFiles.filter(f => f.subject?.toUpperCase().includes(code)).length;
          } else {
            count = allFiles.filter(f => f.semester?.toLowerCase() === parentSem.name.toLowerCase() && f.subject?.toLowerCase() === folder.name.toLowerCase()).length;
          }
        }
      } else if (folder.type === 'category') {
        const parentSub = finalFolders.find(f => f.id === folder.parent_id);
        if (parentSub) {
          const parentSem = finalFolders.find(f => f.id === parentSub.parent_id);
          if (parentSem) {
            const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
            if (isBtech) {
              const codeMatch = parentSub.name.match(/^([A-Za-z]+\d{3})/);
              const code = codeMatch ? codeMatch[1].toUpperCase() : parentSub.name.toUpperCase().trim();
              count = allFiles.filter(f => f.subject?.toUpperCase().includes(code) && f.type?.toLowerCase() === folder.name.toLowerCase()).length;
            } else {
              count = allFiles.filter(f => f.semester?.toLowerCase() === parentSem.name.toLowerCase() && f.subject?.toLowerCase() === parentSub.name.toLowerCase() && f.type?.toLowerCase() === folder.name.toLowerCase()).length;
            }
          }
        }
      }
      counts[folder.id] = count;
    });
    return counts;
  }, [finalFolders, allFiles, selectedProgram]);

  const [isCreatingNew, setIsCreatingNew] = useState({ program: false, semester: false, subject: false, type: false });

  const navigateTo = (sem: Folder | null, subj: Folder | null, cat: Folder | null) => {
    let path = `${routePrefix}/library/${librarySlug(selectedProgram, 'program')}`;
    if (sem) {
      path += `/${librarySlug(sem.name, 'semester')}`;
      if (subj) {
        path += `/${librarySlug(subj.name, 'subject')}`;
        if (cat) {
          path += `/${librarySlug(cat.name, 'category')}`;
        }
      }
    }
    navigate(path);
  };

  const getFolderToPath = (f: Folder) => {
    let path = `${routePrefix}/library/${librarySlug(selectedProgram, 'program')}`;
    if (f.type === 'semester') {
      path += `/${librarySlug(f.name, 'semester')}`;
    } else if (f.type === 'subject') {
      path += `/${librarySlug(activeSemester?.name || '', 'semester')}/${librarySlug(f.name, 'subject')}`;
    } else if (f.type === 'category') {
      path += `/${librarySlug(activeSemester?.name || '', 'semester')}/${librarySlug(activeSubject?.name || '', 'subject')}/${librarySlug(f.name, 'category')}`;
    }
    return path;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !userProfile?.is_admin) return;
    setIsProcessing(true);
    try {
      let type: 'semester' | 'subject' | 'category' = 'semester';
      let parentId: string | null = null;

      // Dynamic materialization of virtual parent folders in the database
      if (activeSubject) {
        type = 'category';
        // 1. Ensure activeSemester (grandparent) exists in the database
        let semDbFolder = folders.find(f => f.type === 'semester' && f.name.toLowerCase() === activeSemester?.name.toLowerCase() && f.program === selectedProgram);
        if (!semDbFolder && activeSemester) {
          await NexusServer.createFolder(activeSemester.name, 'semester', null, selectedProgram);
          const freshFolders = await NexusServer.fetchFolders(selectedProgram);
          setFolders(freshFolders);
          semDbFolder = freshFolders.find(f => f.type === 'semester' && f.name.toLowerCase() === activeSemester.name.toLowerCase() && f.program === selectedProgram);
        }

        // 2. Ensure activeSubject (parent) exists in the database under that semester
        if (semDbFolder) {
          let subjDbFolder = folders.find(f => f.type === 'subject' && f.name.toLowerCase() === activeSubject.name.toLowerCase() && f.parent_id === semDbFolder.id && f.program === selectedProgram);
          if (!subjDbFolder) {
            await NexusServer.createFolder(activeSubject.name, 'subject', semDbFolder.id, selectedProgram);
            const freshFolders = await NexusServer.fetchFolders(selectedProgram);
            setFolders(freshFolders);
            subjDbFolder = freshFolders.find(f => f.type === 'subject' && f.name.toLowerCase() === activeSubject.name.toLowerCase() && f.parent_id === semDbFolder.id && f.program === selectedProgram);
          }
          if (subjDbFolder) {
            parentId = subjDbFolder.id;
          }
        }
      } else if (activeSemester) {
        type = 'subject';
        // Ensure activeSemester (parent) exists in the database
        let semDbFolder = folders.find(f => f.type === 'semester' && f.name.toLowerCase() === activeSemester.name.toLowerCase() && f.program === selectedProgram);
        if (!semDbFolder) {
          await NexusServer.createFolder(activeSemester.name, 'semester', null, selectedProgram);
          const freshFolders = await NexusServer.fetchFolders(selectedProgram);
          setFolders(freshFolders);
          semDbFolder = freshFolders.find(f => f.type === 'semester' && f.name.toLowerCase() === activeSemester.name.toLowerCase() && f.program === selectedProgram);
        }
        if (semDbFolder) {
          parentId = semDbFolder.id;
        }
      }

      await NexusServer.createFolder(newFolderName.trim(), type, parentId, selectedProgram, folderIcon, folderColor, uniSlug === 'iitm' ? 'iitmuni' : 'lpu');
      if (targetSectionName) {
        const freshFolders = await NexusServer.fetchFolders(selectedProgram);
        const createdSub = freshFolders.find(f => f.type === 'subject' && f.name.toLowerCase() === newFolderName.trim().toLowerCase() && f.parent_id === parentId);
        if (createdSub) {
          await NexusServer.updateSubjectSection(createdSub.id, targetSectionName);
        }
        setTargetSectionName(null);
      }
      setNewFolderName('');
      setFolderIcon('Folder');
      setFolderColor('#ff7a00');
      handleCloseFolder();
      fetchFromSource(false);
    } catch (e: any) {
      showToast(e.message || 'Error creating folder', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (pendingUploads.length === 0 || !userProfile) return;
    setIsProcessing(true);
    try {
      // Use the latest state of pendingUploads
      for (const upload of pendingUploads) {
        await NexusServer.uploadFile(
          upload.file,
          upload.name.trim(),
          upload.description.trim(),
          upload.subject.trim(),
          upload.semester.trim(),
          upload.type.trim(),
          userProfile.id,
          userProfile.is_admin,
          upload.program.trim()
        );

        if (!availablePrograms.includes(upload.program)) {
          setAvailablePrograms(prev => [...prev, upload.program]);
        }
      }

      handleCloseUpload();
      setPendingUploads([]);
      fetchFromSource(false);
      showToast("Contribution successful!", "success");
    } catch (e: any) {
      showToast(`Upload failed: ${e.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmission = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      await NexusServer.requestUpdate(selectedFile.id, metaForm, userProfile?.is_admin || false);
      handleCloseEdit();
      setSelectedFile(null);
      fetchFromSource(false);
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
  };

  const handleRenameFolder = async () => {
    if (!folderToManage || !newFolderName.trim() || !userProfile?.is_admin) return;
    setIsProcessing(true);
    try {
      await NexusServer.renameFolder(folderToManage, newFolderName.trim(), folderIcon, folderColor, folders);
      setNewFolderName('');
      setFolderIcon('Folder');
      setFolderColor('#ff7a00');
      setFolderToManage(null);
      handleCloseRename();
      fetchFromSource(false);
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
  };

  const handleDeleteFolder = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile?.is_admin) return;
    const confirmed = await showConfirm(`Permanently delete node "${folder.name}"?`);
    if (!confirmed) return;
    setIsProcessing(true);
    try {
      await NexusServer.deleteFolder(folder.id);
      fetchFromSource(false);
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
  };

  const toggleAdminView = () => {
    const nextAdminState = !isAdminView;
    setIsAdminView(nextAdminState);
    if (nextAdminState) {
      setSelectedProgram(userProfile?.program || availablePrograms[0]);
    } else {
      setSelectedProgram(userProfile?.program || availablePrograms[0]);
    }
    setViewMode('browse');
    setSearchQuery('');
    navigate(`${routePrefix}/library/${librarySlug(userProfile?.program || availablePrograms[0], 'program')}`);
  };

  const handleShareFile = async (file: LibraryFile) => {
    let folderPath = `${routePrefix}/library/${librarySlug(file.program, 'program')}/${librarySlug(file.semester, 'semester')}/${librarySlug(file.subject, 'subject')}`;
    if (file.type && file.type.trim()) {
      folderPath += `/${librarySlug(file.type, 'category')}`;
    }
    const shareUrl = `${window.location.origin}${folderPath}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: `Check out this document on Scholix: ${file.name}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl)
            .then(() => showToast("Share link copied to clipboard!", "success"))
            .catch(() => showToast("Failed to copy link.", "error"));
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => showToast("Share link copied to clipboard!", "success"))
        .catch(() => showToast("Failed to copy link.", "error"));
    }
  };

  const handleFileAccess = (file: LibraryFile) => {
    if (!userProfile) {
      showToast("Please login to view this file.", "info");
      onAuthRequired?.();
      return;
    }

    if (file.storage_path.toLowerCase().endsWith('.pdf')) {
      // 1. Open the viewer instantly
      setActivePdfFile(file);
    } else {
      (async () => {
        // Try direct download first via Supabase client
        try {
          const client = NexusServer.getClient();
          if (client) {
            const { data, error } = await client.storage.from('nexus-documents').download(file.storage_path);
            if (!error && data) {
              const blobUrl = URL.createObjectURL(data);
              window.open(blobUrl, '_blank');
              showToast("Opening file...", "success");
              return;
            }
          }
        } catch (e) {
          console.warn("Direct download failed, trying proxy route...", e);
        }

        // Fallback to proxy route
        try {
          const sessionRes = await NexusServer.getSession();
          const token = sessionRes?.data?.session?.access_token;
          const url = NexusServer.getFileUrl(file.storage_path, token);
          if (url) window.open(url, '_blank');
        } catch (err) {
          console.error("Access Error:", err);
        }
      })();
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
      {viewMode === 'originals' ? (
        <NexusOriginals
          userProfile={userProfile}
          activeSubject={activeSubject?.name || 'Search Subject'}
          activeSemester={activeSemester?.name || 'All'}
          activeProgram={selectedProgram}
          onBack={() => setViewMode('browse')}
        />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {!(activeSubject && !activeCategory && viewMode === 'browse' && !searchQuery) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left Side: Breadcrumb */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 font-medium min-w-0 flex-wrap">
                  {program ? (
                    <>
                      <Link to={`${routePrefix}/library?change=true`} className="hover:text-orange-500 transition-colors border-none bg-transparent cursor-pointer font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">Programs</Link>
                      <span className="opacity-40 text-[9px] mx-0.5 shrink-0">&gt;</span>
                      <Link to={`${routePrefix}/library/${librarySlug(selectedProgram, 'program')}`} className={`hover:text-orange-500 transition-colors border-none bg-transparent cursor-pointer font-semibold shrink-0 ${!activeSemester ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'}`}>{selectedProgram}</Link>
                    </>
                  ) : (
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 shrink-0">Programs</span>
                  )}
                  {activeSemester && (
                    <>
                      <span className="opacity-40 text-[9px] mx-0.5 shrink-0">&gt;</span>
                      <Link to={`${routePrefix}/library/${librarySlug(selectedProgram, 'program')}/${librarySlug(activeSemester.name, 'semester')}`} className={`border-none bg-transparent cursor-pointer hover:text-orange-500 transition-colors font-semibold ${!activeSubject ? 'text-zinc-800 dark:text-zinc-200' : ''}`}>{activeSemester.name}</Link>
                    </>
                  )}
                  {activeSubject && (
                    <>
                      <span className="opacity-40 text-[9px] mx-0.5 shrink-0">&gt;</span>
                      <Link to={`${routePrefix}/library/${librarySlug(selectedProgram, 'program')}/${librarySlug(activeSemester.name, 'semester')}/${librarySlug(activeSubject.name, 'subject')}`} className={`border-none bg-transparent cursor-pointer hover:text-orange-500 transition-colors font-semibold truncate ${!activeCategory ? 'text-zinc-800 dark:text-zinc-200' : ''}`}>{activeSubject.name.split(':')[0].trim()}</Link>
                    </>
                  )}
                  {activeCategory && (
                    <>
                      <span className="opacity-40 text-[9px] mx-0.5 shrink-0">&gt;</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate">{activeCategory.name}</span>
                    </>
                  )}
                </nav>
              </div>

              {/* Center: Search box */}
              <div className="relative flex-1 max-w-md w-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input
                  type="text"
                  placeholder="Search subjects, resources, PYQs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full pl-10 pr-4 h-10 bg-zinc-100 dark:bg-[#141416] hover:bg-zinc-200/70 dark:hover:bg-[#1a1a1d] rounded-full text-[11px] sm:text-xs font-semibold outline-none border-none transition-colors text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {userProfile?.is_admin && (
                  <button onClick={toggleAdminView} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-none shrink-0 cursor-pointer ${isAdminView ? 'bg-orange-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-[#141416] text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-[#1a1a1d]'}`} title="Review Hub">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </button>
                )}

                <button 
                  onClick={() => { 
                    if (!userProfile) {
                      showToast("Please login to access your personal vault.", "info");
                      onAuthRequired?.();
                      return;
                    }
                    setViewMode(viewMode === 'my-uploads' ? 'browse' : 'my-uploads'); 
                    navigateTo(null, null, null); 
                    setIsAdminView(false); 
                  }} 
                  className={`px-4 h-10 rounded-full flex items-center justify-center gap-1.5 transition-all text-xs font-bold border-none cursor-pointer flex-1 sm:flex-initial ${viewMode === 'my-uploads' ? 'bg-orange-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-[#141416] text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-[#1a1a1d]'}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Vault
                </button>

                <button 
                  onClick={() => { 
                    if (!userProfile) { 
                      showToast("Please sign in to contribute materials.", "info"); 
                      onAuthRequired?.();
                      return; 
                    } 
                    fileInputRef.current?.click(); 
                  }} 
                  className="px-5 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-xs shadow-md border-none transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Upload {pendingUploads.length > 0 && `(${pendingUploads.length})`}
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            (!activeSubject && viewMode === 'browse') ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonFolderCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonFileCard key={i} />
                ))}
              </div>
            )
          ) : !program && viewMode === 'browse' ? (
            // Screen 1: Program Selection Screen (Root)
            <div className="space-y-8 animate-fade-in">
              {/* IIT Madras Section */}
              {availablePrograms.some(isIITMProgram) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-2 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4.5 rounded-full bg-red-750" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">Indian Institute of Technology Madras</span>
                    </div>
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-full text-[9px] font-bold text-red-750 dark:text-red-400">IITM Portal</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {availablePrograms.filter(isIITMProgram).map((prog) => {
                      const color = '#800000'; // Maroon
                      const pSubjects = folders.filter(f => f.type === 'subject' && f.program === prog).length;
                      const pResources = allFiles.filter(f => f.program === prog).length;
                      let subtitle = "4 Years Program (BS Degree)";
                      
                      return (
                        <Link
                          key={prog}
                          to={`${routePrefix}/library/${librarySlug(prog, 'program')}`}
                          className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] hover:shadow-md transition-all duration-200 active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: color }}>
                              <Landmark className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">{prog}</h4>
                              <div className="flex flex-wrap items-center gap-x-1.5 min-[375px]:gap-x-2 gap-y-0.5 mt-1 text-[9px] min-[375px]:text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                <span className="whitespace-nowrap shrink-0">{subtitle}</span>
                                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                                <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                  <BookOpen className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
                                  {pSubjects} Subjects
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                                <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                  <FileText className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
                                  {pResources} Resources
                                </span>
                              </div>
                            </div>
                          </div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ color: color }}><path d="M9 18l6-6-6-6" /></svg>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LPU Section */}
              {availablePrograms.some(p => !isIITMProgram(p)) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4.5 rounded-full bg-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">Lovely Professional University</span>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-full text-[9px] font-bold text-orange-500">LPU Portals</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {availablePrograms.filter(p => !isIITMProgram(p)).map((prog, idx) => {
                      const progColors = ['#ff7a00', '#a855f7', '#0ea5e9', '#22c55e', '#f43f5e', '#eab308', '#14b8a6', '#6366f1'];
                      const color = progColors[idx % progColors.length];
                      
                      const pSubjects = folders.filter(f => f.type === 'subject' && f.program === prog).length;
                      const pResources = allFiles.filter(f => f.program === prog).length;
                      
                      let subtitle = "3 Years Program";
                      if (prog.includes("BTech")) subtitle = "4 Years Program";
                      else if (prog.includes("MCA") || prog.includes("MBA")) subtitle = "2 Years Program";
                      
                      return (
                        <Link
                          key={prog}
                          to={`${routePrefix}/library/${librarySlug(prog, 'program')}`}
                          className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] hover:shadow-md transition-all duration-200 active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: color }}>
                              <Landmark className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">{prog}</h4>
                              <div className="flex flex-wrap items-center gap-x-1.5 min-[375px]:gap-x-2 gap-y-0.5 mt-1 text-[9px] min-[375px]:text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                <span className="whitespace-nowrap shrink-0">{subtitle}</span>
                                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                                <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                  <BookOpen className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
                                  {pSubjects} Subjects
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                                <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                  <FileText className="w-3.5 h-3.5 text-zinc-450 dark:text-zinc-500" />
                                  {pResources} Resources
                                </span>
                              </div>
                            </div>
                          </div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ color: color }}><path d="M9 18l6-6-6-6" /></svg>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : activeSubject && !activeCategory && viewMode === 'browse' && searchQuery.trim() === '' ? (
            <SubjectCommunity
              activeSubject={activeSubject}
              activeSemester={activeSemester}
              selectedProgram={selectedProgram}
              userProfile={userProfile as any}
              categories={finalFolders.filter(f => f.type === 'category' && f.parent_id === activeSubject.id)}
              allFiles={allFiles}
              userProgressList={userProgressList}
              onFileAccess={handleFileAccess}
              onUploadClick={() => fileInputRef.current?.click()}
              onBack={() => {
                navigate(`${routePrefix}/library/${librarySlug(selectedProgram, 'program')}/${librarySlug(activeSemester?.name || '', 'semester')}`);
              }}
              searchQuery={searchQuery}
              onRefresh={() => fetchFromSource(false)}
              isAdmin={userProfile?.is_admin}
              onAddFolder={() => {
                setNewFolderName('');
                setFolderIcon('Folder');
                setFolderColor('#ff7a00');
                setShowFolderModal(true);
              }}
              onEditFolder={(catFolder, e) => {
                e.stopPropagation();
                setFolderToManage(catFolder);
                setNewFolderName(catFolder.name);
                setFolderIcon(catFolder.icon_name || 'Folder');
                setFolderColor(catFolder.color || '#ff7a00');
                setShowRenameModal(true);
              }}
              onDeleteFolder={(catFolder, e) => {
                handleDeleteFolder(catFolder, e);
              }}
            />
          ) : activeSubject && searchQuery.trim() !== '' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    navigate(`${routePrefix}/library/${librarySlug(selectedProgram, 'program')}/${activeSemester ? librarySlug(activeSemester.name, 'semester') : ''}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50/50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Search Results
                </button>
                <div className="text-xs font-bold text-zinc-455 dark:text-zinc-500">
                  Showing matches in <span className="text-zinc-850 dark:text-zinc-200 font-extrabold">{activeSubject.name.split(':')[1]?.trim() || activeSubject.name}</span>
                </div>
              </div>

              {(() => {
                const isBtech = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
                let subjFiles = [];
                if (isBtech) {
                  const codeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
                  const code = codeMatch ? codeMatch[1].toUpperCase() : activeSubject.name.toUpperCase().trim();
                  subjFiles = allFiles.filter(f => f.subject.toUpperCase().includes(code));
                } else {
                  subjFiles = allFiles.filter(f => f.semester === activeSemester?.name && f.subject === activeSubject.name);
                }
                const matchedFiles = subjFiles.filter(f => f.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

                if (matchedFiles.length === 0) {
                  return (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl text-xs text-zinc-400">
                      No matching files found inside this subject.
                    </div>
                  );
                }

                return (
                  <div className="w-full overflow-hidden border border-zinc-150 dark:border-white/5 rounded-3xl bg-white dark:bg-[#0c0c0e] shadow-sm animate-fade-in">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
                            <th className="py-3 pl-4 pr-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider min-w-[200px]">Name</th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider w-36">Subject</th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-24">Category</th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:table-cell w-28">Updated On</th>
                            <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-24">Rating</th>
                            <th className="py-3 pr-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-36">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                          {matchedFiles.map((file) => {
                            const cleanName = file.name;
                            const timestamp = file.uploadDate || (file.created_at ? Date.parse(file.created_at) : Date.now());
                            const formattedDate = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            
                            const ratingVal = (() => {
                              if (file.rating_votes) {
                                const votes = Object.values(file.rating_votes as Record<string, number>);
                                if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                              }
                              return null;
                            })();

                            return (
                              <tr key={file.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.006] transition-colors group/row">
                                <td className="py-3 pl-4 pr-3 min-w-[200px]">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      onClick={() => handleFileAccess(file)}
                                      className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center cursor-pointer shrink-0 transition-transform hover:scale-105"
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-orange-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <button 
                                        onClick={() => handleFileAccess(file)}
                                        className="text-xs font-bold text-zinc-800 dark:text-zinc-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors truncate max-w-[180px] sm:max-w-[240px] text-left block bg-transparent border-none cursor-pointer p-0"
                                      >
                                        {cleanName}
                                      </button>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">{file.size || '0.00 MB'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 w-36">
                                  <div className="min-w-0">
                                    <div className="text-xs font-extrabold text-zinc-650 dark:text-zinc-300 truncate max-w-[120px]" title={file.subject}>
                                      {file.subject.split(':')[0].trim()}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center w-24">
                                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold text-zinc-500 bg-zinc-100 dark:bg-white/[0.04] dark:text-zinc-400 uppercase tracking-wide">
                                    {file.type || 'Notes'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 hidden sm:table-cell w-28">
                                  <span className="text-xs font-bold text-zinc-455 dark:text-zinc-555">{formattedDate}</span>
                                </td>
                                <td className="py-3 px-3 text-center w-24">
                                  {ratingVal ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-zinc-800 dark:text-zinc-200">
                                      {ratingVal} <Star size={11} className="text-amber-500" fill="currentColor" />
                                    </span>
                                  ) : (
                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>
                                  )}
                                </td>
                                <td className="py-3 pr-4 text-right w-36 relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                    }}
                                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-455 dark:text-zinc-350 hover:text-zinc-800 dark:hover:text-white bg-transparent border-none cursor-pointer transition-all hover:scale-105 active:scale-95"
                                    title="Actions"
                                  >
                                    <MoreHorizontal size={18} />
                                  </button>

                                  {activeMenuFileId === file.id && (
                                    <div 
                                      className="absolute right-4 mt-1 w-36 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/10 py-1.5 shadow-xl z-50 text-left overflow-hidden animate-fade-in"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={() => {
                                          setActiveMenuFileId(null);
                                          setSelectedFile(file);
                                          setShowDetailsModal(true);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-655 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        Details
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="relative">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex flex-col gap-6">

                  {currentFolders.length > 0 && (
                    <SortableContext
                      items={currentFolders.map(f => f.id)}
                      strategy={rectSortingStrategy}
                      disabled={!userProfile?.is_admin}
                    >
                      {activeSemester && !activeSubject ? (
                        <div className="space-y-8 col-span-full">
                          {(() => {
                            const groups: { name: string; items: Folder[] }[] = [];

                            currentFolders.forEach(f => {
                              const groupName = getFolderNameSection(f);
                              let group = groups.find(g => g.name === groupName);
                              if (!group) {
                                group = { name: groupName, items: [] };
                                groups.push(group);
                              }
                              group.items.push(f);
                            });

                            const visibleGroups = groups.filter(g => g.items.length > 0);

                            visibleGroups.sort((a, b) => {
                              const orderA = sectionOrders[a.name];
                              const orderB = sectionOrders[b.name];
                              if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
                              if (orderA !== undefined) return -1;
                              if (orderB !== undefined) return 1;

                              if (a.name === 'Core Courses') return -1;
                              if (b.name === 'Core Courses') return 1;
                              if (a.name.includes('Core Elective')) {
                                if (b.name.includes('Core Elective')) return a.name.localeCompare(b.name);
                                return -1;
                              }
                              if (b.name.includes('Core Elective')) return 1;
                              return a.name.localeCompare(b.name);
                            });

                            return (
                              <>
                                {visibleGroups.map((group, groupIdx) => (
                                  <div key={group.name} className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-white/5 pb-2.5 mb-2 mt-4">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-1 h-3.5 rounded-full bg-orange-500 shrink-0" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                                          {group.name}
                                        </span>

                                        {/* Section Three-Dots Menu Button */}
                                        {userProfile?.is_admin && (
                                          <div className="relative shrink-0 ml-1">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveSectionMenu(activeSectionMenu === group.name ? null : group.name);
                                              }}
                                              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-transparent border-none cursor-pointer transition-colors flex items-center justify-center"
                                              title="Section Options"
                                            >
                                              <MoreHorizontal className="w-4 h-4" />
                                            </button>

                                            {/* Section Options Dropdown */}
                                            {activeSectionMenu === group.name && (
                                              <>
                                                <div 
                                                  className="fixed inset-0 z-40" 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveSectionMenu(null);
                                                  }} 
                                                />
                                                <div 
                                                  className="absolute left-0 mt-1 w-44 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/10 py-1.5 shadow-xl z-50 text-left overflow-hidden animate-fade-in"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  {/* Add Course */}
                                                  <button
                                                    onClick={() => {
                                                      setActiveSectionMenu(null);
                                                      handleAddSubjectToSection(group.name);
                                                    }}
                                                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-orange-500 hover:bg-orange-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                                  >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Course
                                                  </button>

                                                  {/* Move Up */}
                                                  <button
                                                    disabled={groupIdx === 0}
                                                    onClick={() => {
                                                      setActiveSectionMenu(null);
                                                      handleMoveSection(group.name, 'up', groups);
                                                    }}
                                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors border-none bg-transparent flex items-center gap-2 ${
                                                      groupIdx === 0 
                                                        ? 'opacity-30 cursor-not-allowed text-zinc-400' 
                                                        : 'text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer'
                                                    }`}
                                                  >
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                    Move Up
                                                  </button>

                                                  {/* Move Down */}
                                                  <button
                                                    disabled={groupIdx === groups.length - 1}
                                                    onClick={() => {
                                                      setActiveSectionMenu(null);
                                                      handleMoveSection(group.name, 'down', groups);
                                                    }}
                                                    className={`w-full px-3.5 py-2 text-left text-xs font-bold transition-colors border-none bg-transparent flex items-center gap-2 ${
                                                      groupIdx === groups.length - 1 
                                                        ? 'opacity-30 cursor-not-allowed text-zinc-400' 
                                                        : 'text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer'
                                                    }`}
                                                  >
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                    Move Down
                                                  </button>

                                                  {/* Rename Section */}
                                                  <button
                                                    onClick={() => {
                                                      setActiveSectionMenu(null);
                                                      handleRenameSection(group.name, group.items);
                                                    }}
                                                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2 border-t border-zinc-100 dark:border-white/5"
                                                  >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    Rename Section
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-full text-[9px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
                                        {group.items.length} Course{group.items.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>

                                    {group.items.length === 0 ? (
                                      <div className="p-6 text-center bg-zinc-50/50 dark:bg-white/[0.005] border border-dashed border-zinc-200 dark:border-white/5 rounded-2xl text-xs text-zinc-400">
                                        No courses in this section yet. Click <span className="font-bold text-orange-500">+</span> above to add a course!
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {group.items.map(folder => (
                                          <FolderCard
                                            key={folder.id}
                                            folder={folder}
                                            selectedProgram={selectedProgram}
                                            userProfile={userProfile}
                                            fileCount={folderFileCounts[folder.id] || 0}
                                            onDragOver={() => setDraggingOverId(folder.id)}
                                            onDragLeave={() => setDraggingOverId(null)}
                                            onDrop={(e) => {
                                              setDraggingOverId(null);
                                              const droppedFiles = e.dataTransfer.files;
                                              if (droppedFiles && droppedFiles.length > 0) {
                                                handleFilesSelected(droppedFiles, folder.program, folder.type === 'semester' ? folder.name : activeSemester?.name, folder.type === 'subject' ? folder.name : activeSubject?.name, folder.type === 'category' ? folder.name : '');
                                              }
                                            }}
                                            toPath={getFolderToPath(folder)}
                                            onRename={() => {
                                              setFolderToManage(folder);
                                              setNewFolderName(folder.name);
                                              setFolderIcon(folder.icon_name || 'Folder');
                                              setFolderColor(folder.color || '#ff7a00');
                                              setShowRenameModal(true);
                                            }}
                                            isDraggingOver={draggingOverId === folder.id}
                                            subjectsCount={finalFolders.filter(f => f.type === 'subject' && f.parent_id === folder.id).length}
                                            searchMatchText={getSubjectSearchMatchText(folder)}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* Admin Only: Bottom Create Section Button */}
                                {userProfile?.is_admin && (
                                  <div className="flex justify-center pt-6">
                                    <button
                                      onClick={handleCreateNewSection}
                                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
                                    >
                                      <Plus className="w-4 h-4" /> Create Section
                                    </button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentFolders.map(folder => (
                            <FolderCard
                              key={folder.id}
                              folder={folder}
                              selectedProgram={selectedProgram}
                              userProfile={userProfile}
                              fileCount={folderFileCounts[folder.id] || 0}
                              onDragOver={() => setDraggingOverId(folder.id)}
                              onDragLeave={() => setDraggingOverId(null)}
                              onDrop={(e) => {
                                setDraggingOverId(null);
                                const droppedFiles = e.dataTransfer.files;
                                if (droppedFiles && droppedFiles.length > 0) {
                                  handleFilesSelected(droppedFiles, folder.program, folder.type === 'semester' ? folder.name : activeSemester?.name, folder.type === 'subject' ? folder.name : activeSubject?.name, folder.type === 'category' ? folder.name : '');
                                }
                              }}
                              toPath={getFolderToPath(folder)}
                              onRename={() => {
                                setFolderToManage(folder);
                                setNewFolderName(folder.name);
                                setFolderIcon(folder.icon_name || 'Folder');
                                setFolderColor(folder.color || '#ff7a00');
                                setShowRenameModal(true);
                              }}
                              onDelete={(e) => handleDeleteFolder(folder, e)}
                              isDraggingOver={draggingOverId === folder.id}
                              subjectsCount={finalFolders.filter(f => f.type === 'subject' && f.parent_id === folder.id).length}
                              searchMatchText={getSubjectSearchMatchText(folder)}
                            />
                          ))}
                        </div>
                      )}
                    </SortableContext>
                  )}

                  {displayFiles.length > 0 && searchQuery.trim() === '' ? (
                    (isAdminView || viewMode === 'my-uploads') ? (
                      <div className="w-full overflow-hidden border border-zinc-150 dark:border-white/5 rounded-3xl bg-white dark:bg-[#0c0c0e] shadow-sm animate-fade-in">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
                                <th className="py-3 pl-4 pr-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider min-w-[200px]">Name</th>
                                {isAdminView && (
                                  <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden md:table-cell w-32">Uploader</th>
                                )}
                                <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider w-36">Subject</th>
                                {viewMode === 'my-uploads' ? (
                                  <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-28">Status</th>
                                ) : (
                                  <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-24">Category</th>
                                )}
                                <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:table-cell w-28">Updated On</th>
                                <th className="py-3 pr-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-36">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                              {displayFiles.map((file) => {
                                const realNameWithExt = file.name;
                                const cleanName = realNameWithExt.replace(/\.[^/.]+$/, "");
                                const fileStyle = getFileStyle(file.storage_path || file.name);

                                const statusConfig = {
                                  pending: { label: 'Queued', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                  approved: { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                  rejected: { label: 'Redacted', color: 'text-red-500', bg: 'bg-red-500/10' }
                                };
                                const status = statusConfig[file.status] || statusConfig.pending;

                                const formattedDate = file.created_at
                                  ? new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : 'N/A';

                                const uploaderName = file.uploader_username || "Anonymous Verto";
                                const avatarSeed = file.uploader_id || file.name;

                                return (
                                  <tr key={file.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.006] transition-colors group/row">
                                    <td className="py-3 pl-4 pr-3 min-w-[200px]">
                                      <div className="flex items-center gap-3">
                                        <div 
                                          onClick={() => handleFileAccess(file)}
                                          className={`w-8 h-8 rounded-xl ${fileStyle.iconBg} flex items-center justify-center cursor-pointer shrink-0 transition-transform hover:scale-105`}
                                        >
                                          <FileIcon fileName={file.storage_path} size="w-4 h-4" className={fileStyle.iconText} />
                                        </div>
                                        <div className="min-w-0">
                                          <button 
                                            onClick={() => handleFileAccess(file)}
                                            className="text-xs font-bold text-zinc-800 dark:text-zinc-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors truncate max-w-[180px] sm:max-w-[240px] text-left block bg-transparent border-none cursor-pointer p-0"
                                          >
                                            {cleanName}
                                          </button>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">{file.size || '0.00 MB'}</span>
                                            <span className="text-[10px] text-zinc-300 dark:text-zinc-700">•</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${fileStyle.badgeBg} ${fileStyle.badgeText}`}>
                                              {fileStyle.label}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {isAdminView && (
                                      <td className="py-3 px-3 hidden md:table-cell w-32">
                                        <div className="flex items-center gap-2">
                                          <img 
                                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`}
                                            alt={uploaderName}
                                            className="w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-800 shrink-0"
                                          />
                                          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[90px]">{uploaderName}</span>
                                        </div>
                                      </td>
                                    )}

                                    <td className="py-3 px-3 w-36">
                                      <div className="min-w-0">
                                        <div className="text-xs font-extrabold text-zinc-650 dark:text-zinc-300 truncate max-w-[120px]" title={file.subject}>
                                          {file.subject.split(':')[0].trim()}
                                        </div>
                                        <div className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 truncate max-w-[120px]">
                                          {file.program || 'BTech CSE'} • {file.semester}
                                        </div>
                                      </div>
                                    </td>

                                    {viewMode === 'my-uploads' ? (
                                      <td className="py-3 px-3 text-center w-28">
                                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black tracking-wider uppercase inline-block ${status.bg} ${status.color}`}>
                                          {status.label}
                                        </span>
                                      </td>
                                    ) : (
                                      <td className="py-3 px-3 text-center w-24">
                                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold text-zinc-500 bg-zinc-100 dark:bg-white/[0.04] dark:text-zinc-400 uppercase tracking-wide">
                                          {file.type || 'Notes'}
                                        </span>
                                      </td>
                                    )}

                                    <td className="py-3 px-3 hidden sm:table-cell w-28">
                                      <span className="text-xs font-bold text-zinc-450 dark:text-zinc-550">{formattedDate}</span>
                                    </td>

                                    <td className="py-3 pr-4 text-right w-36 relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                        }}
                                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-455 dark:text-zinc-350 hover:text-zinc-800 dark:hover:text-white bg-transparent border-none cursor-pointer transition-all hover:scale-105 active:scale-95"
                                        title="Actions"
                                      >
                                        <MoreHorizontal size={18} />
                                      </button>

                                      {activeMenuFileId === file.id && (
                                        <>
                                          <div 
                                            className="absolute right-4 mt-1 w-36 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/10 py-1.5 shadow-xl z-50 text-left overflow-hidden animate-fade-in"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {/* Details */}
                                            <button
                                              onClick={() => {
                                                setActiveMenuFileId(null);
                                                setSelectedFile(file);
                                                setShowDetailsModal(true);
                                              }}
                                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-655 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                            >
                                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                              Details
                                            </button>

                                            {/* Edit */}
                                            <button
                                              onClick={() => {
                                                setActiveMenuFileId(null);
                                                setSelectedFile(file);
                                                setMetaForm({ name: file.name, description: file.description || '', semester: file.semester, subject: file.subject, type: file.type, program: file.program || selectedProgram });
                                                setShowEditModal(true);
                                              }}
                                              className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-655 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                            >
                                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                              Edit Metadata
                                            </button>

                                            {/* Delete / Reject / Approve */}
                                            {viewMode === 'my-uploads' ? (
                                              <button
                                                onClick={async () => {
                                                  setActiveMenuFileId(null);
                                                  const confirmed = await showConfirm("Permanently delete this file?");
                                                  if (confirmed) {
                                                    setIsProcessing(true);
                                                    NexusServer.deleteFile(file.id, file.storage_path)
                                                      .then(() => fetchFromSource(false))
                                                      .finally(() => setIsProcessing(false));
                                                  }
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                              >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                Delete File
                                              </button>
                                            ) : (
                                              <>
                                                <button
                                                  onClick={async () => {
                                                    setActiveMenuFileId(null);
                                                    const confirmed = await showConfirm("Reject and remove this file?");
                                                    if (confirmed) {
                                                      setIsProcessing(true);
                                                      NexusServer.rejectFile(file.id)
                                                        .then(() => fetchFromSource(false))
                                                        .finally(() => setIsProcessing(false));
                                                    }
                                                  }}
                                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                                >
                                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                  Reject File
                                                </button>

                                                <button
                                                  onClick={async () => {
                                                    setActiveMenuFileId(null);
                                                    setIsProcessing(true);
                                                    try {
                                                      const allFolders = await NexusServer.fetchFolders('All');
                                                      let semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === file.semester.trim() && f.program === file.program);
                                                      if (!semFolder) {
                                                        await NexusServer.createFolder(file.semester.trim(), 'semester', null, file.program);
                                                        const fresh = await NexusServer.fetchFolders('All');
                                                        semFolder = fresh.find(f => f.type === 'semester' && f.name.trim() === file.semester.trim() && (f.program === file.program || f.program === 'All'));
                                                      }
                                                      let subjFolder = allFolders.find(f => f.type === 'subject' && f.name.trim() === file.subject.trim() && f.parent_id === semFolder?.id && f.program === file.program);
                                                      if (!subjFolder && semFolder) {
                                                        await NexusServer.createFolder(file.subject.trim(), 'subject', semFolder.id, file.program);
                                                        const fresh = await NexusServer.fetchFolders('All');
                                                        subjFolder = fresh.find(f => f.type === 'subject' && f.name.trim() === file.subject.trim() && f.parent_id === semFolder.id && (f.program === file.program || f.program === 'All'));
                                                      }
                                                      if (file.type && file.type.trim()) {
                                                        let catFolder = allFolders.find(f => f.type === 'category' && f.name.trim() === file.type.trim() && f.parent_id === subjFolder?.id && f.program === file.program);
                                                        if (!catFolder && subjFolder) {
                                                          await NexusServer.createFolder(file.type.trim(), 'category', subjFolder.id, file.program);
                                                        }
                                                      }
                                                      await NexusServer.approveFile(file.id);
                                                      fetchFromSource(false);
                                                    } catch (e: any) {
                                                      showToast("Approval error: " + e.message, 'error');
                                                    } finally {
                                                      setIsProcessing(false);
                                                    }
                                                  }}
                                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
                                                >
                                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                  Approve File
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <SortableContext
                        items={displayFiles.map(f => f.id)}
                        strategy={rectSortingStrategy}
                        disabled={!userProfile?.is_admin}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                          {displayFiles.map(file => (
                            <FileCard
                              key={file.id}
                              file={file}
                              userProfile={userProfile}
                              isAdminMode={isAdminView}
                              isPersonal={viewMode === 'my-uploads'}
                              onApprove={async () => {
                                setIsProcessing(true);
                                try {
                                  const allFolders = await NexusServer.fetchFolders('All');
                                  let semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === file.semester.trim() && f.program === file.program);
                                  if (!semFolder) {
                                    await NexusServer.createFolder(file.semester.trim(), 'semester', null, file.program);
                                    const fresh = await NexusServer.fetchFolders('All');
                                    semFolder = fresh.find(f => f.type === 'semester' && f.name.trim() === file.semester.trim() && (f.program === file.program || f.program === 'All'));
                                  }
                                  let subjFolder = allFolders.find(f => f.type === 'subject' && f.name.trim() === file.subject.trim() && f.parent_id === semFolder?.id && f.program === file.program);
                                  if (!subjFolder && semFolder) {
                                    await NexusServer.createFolder(file.subject.trim(), 'subject', semFolder.id, file.program);
                                    const fresh = await NexusServer.fetchFolders('All');
                                    subjFolder = fresh.find(f => f.type === 'subject' && f.name.trim() === file.subject.trim() && f.parent_id === semFolder.id && (f.program === file.program || f.program === 'All'));
                                  }
                                  if (file.type && file.type.trim()) {
                                    let catFolder = allFolders.find(f => f.type === 'category' && f.name.trim() === file.type.trim() && f.parent_id === subjFolder?.id && f.program === file.program);
                                    if (!catFolder && subjFolder) {
                                      await NexusServer.createFolder(file.type.trim(), 'category', subjFolder.id, file.program);
                                    }
                                  }
                                  await NexusServer.approveFile(file.id);
                                  fetchFromSource(false);
                                } catch (e: any) {
                                  showToast("Approval error: " + e.message, 'error');
                                } finally {
                                  setIsProcessing(false);
                                }
                              }}
                              onReject={async () => { const confirmed = await showConfirm("Reject and remove this file?"); if (confirmed) { setIsProcessing(true); NexusServer.rejectFile(file.id).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
                              onDemote={async () => { const confirmed = await showConfirm("Send this file back to pending review?"); if (confirmed) { setIsProcessing(true); NexusServer.demoteFile(file.id).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
                              onEdit={() => { setSelectedFile(file); setMetaForm({ name: file.name, description: file.description || '', semester: file.semester, subject: file.subject, type: file.type, program: file.program || selectedProgram }); setShowEditModal(true); }}
                              onDelete={async () => { const confirmed = await showConfirm("Permanently delete this file?"); if (confirmed) { setIsProcessing(true); NexusServer.deleteFile(file.id, file.storage_path).then(() => fetchFromSource(false)).finally(() => setIsProcessing(false)); } }}
                              onAccess={() => handleFileAccess(file)}
                              onShowDetails={() => { setSelectedFile(file); setShowDetailsModal(true); }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )
                  ) : currentFolders.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center text-zinc-400 text-[11px] sm:text-xs opacity-40">No files found.</div>
                  )}
                </div>
                {createPortal(
                  <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: {
                        active: {
                          opacity: '0.4',
                        },
                      },
                    }),
                  }}>
                    {activeId ? (
                      <div className="scale-105 shadow-2xl opacity-90 cursor-grabbing overflow-hidden rounded-[30px] border border-orange-500/50 bg-white dark:bg-[#0a0a0a] w-[200px] md:w-[220px]">
                        {displayFiles.find(f => f.id === activeId) ? (
                          <StaticFileCard
                            file={displayFiles.find(f => f.id === activeId)!}
                            userProfile={userProfile}
                            isAdminMode={isAdminView}
                          />
                        ) : finalFolders.find(f => f.id === activeId) ? (
                          <StaticFolderCard
                            folder={finalFolders.find(f => f.id === activeId)!}
                            selectedProgram={selectedProgram}
                            fileCount={folderFileCounts[activeId] || 0}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>

              {/* Library Banner Ad - Moved below folders */}
              <NexusAd slot="2912081909" format="fluid" className="mt-12 mb-8" hideLabel />
            </div>
          )}
        </div>
      )}

      {
        showDetailsModal && selectedFile && (() => {
          const fileStyle = getFileStyle(selectedFile.storage_path || selectedFile.name);
          return createPortal(
            <div className={`modal-overlay ${isClosingDetails ? 'closing' : ''}`}
              style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetails(); }}>
              <div ref={modalRef} className={`nexus-modal w-full max-w-md bg-white dark:bg-[#0c0c0e] border border-zinc-100 dark:border-white/5 rounded-[28px] shadow-2xl relative overflow-hidden flex flex-col ${isClosingDetails ? 'closing' : ''}`}>
                {/* Aurora glow */}
                <div 
                  className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none z-0"
                  style={{ backgroundColor: fileStyle.glowColor }}
                />
                {/* Giant background faint logo */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.04] dark:opacity-[0.02] pointer-events-none z-0">
                  <FileIcon fileName={selectedFile.storage_path} size="w-36 h-36" className={fileStyle.iconText} />
                </div>

                <header className="p-6 md:p-8 border-b border-zinc-100 dark:border-white/5 bg-transparent flex flex-col gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${fileStyle.iconBg} rounded-xl flex items-center justify-center`}>
                      <FileIcon fileName={selectedFile.storage_path} size="w-5 h-5" className={fileStyle.iconText} />
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase rounded-md ${fileStyle.badgeBg} ${fileStyle.badgeText}`}>
                      {fileStyle.label}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug pr-8">{selectedFile.name}</h3>
                  <button onClick={handleCloseDetails} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 dark:text-white/30 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer z-20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar relative z-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Semester', val: selectedFile.semester },
                      { label: 'Subject', val: selectedFile.subject },
                      { label: 'Category', val: selectedFile.type },
                      { label: 'File Size', val: selectedFile.size }
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/5">
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-0.5">{item.label}</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.val || 'N/A'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Description</h4>
                    <p className="text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed italic bg-zinc-50/50 dark:bg-white/5 p-4 rounded-2xl border border-zinc-100 dark:border-white/5">
                      {selectedFile.description || "No description provided."}
                    </p>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 rounded-2xl border"
                    style={{ 
                      backgroundColor: fileStyle.glowColor.replace('0.15', '0.04'),
                      borderColor: fileStyle.glowColor.replace('0.15', '0.15') 
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs text-white"
                        style={{ backgroundColor: fileStyle.glowColor.replace('0.15', '0.85') }}
                      >
                        {selectedFile.uploader_username?.[0] || 'V'}
                      </div>
                      <div>
                        <p className={`text-[10px] font-semibold ${fileStyle.iconText}`}>Uploader</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200">@{selectedFile.uploader_username}</p>
                          <VerifiedBadge isAdmin={selectedFile.uploader_is_admin} size="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] sm:text-xs font-medium text-zinc-400 dark:text-zinc-500">{new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <footer className="p-6 bg-transparent border-t border-zinc-100 dark:border-white/5 flex gap-3 relative z-10">
                  <button onClick={handleCloseDetails} className="flex-1 py-2.5 text-[11px] sm:text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors border-none bg-transparent cursor-pointer font-medium">Discard</button>
                  {selectedFile.status === 'approved' && (
                    <>
                      <button 
                        onClick={() => handleShareFile(selectedFile)} 
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-[11px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border ${fileStyle.iconText}`}
                        style={{
                          backgroundColor: fileStyle.glowColor.replace('0.15', '0.05'),
                          borderColor: fileStyle.glowColor.replace('0.15', '0.2')
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                        Share
                      </button>
                      <button 
                        onClick={() => { handleCloseDetails(); handleFileAccess(selectedFile); }} 
                        className="flex-[2] py-2.5 text-white rounded-xl font-semibold text-[11px] sm:text-xs shadow-md active:scale-95 transition-all border-none cursor-pointer"
                        style={{
                          backgroundColor: fileStyle.glowColor.replace('0.15', '0.85')
                        }}
                      >
                        View Document ↗
                      </button>
                    </>
                  )}
                </footer>
              </div>
            </div>,
            document.getElementById('modal-root') || document.body
          );
        })()
      }

      {
        showFolderModal && userProfile?.is_admin && createPortal(
          <div className={`modal-overlay ${isClosingFolder ? 'closing' : ''}`}
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseFolder(); }}>
            <div ref={modalRef} className={`nexus-modal w-full max-w-sm ${isClosingFolder ? 'closing' : ''}`}>
              <div className="bg-zinc-50 dark:bg-[#0a0a0a]/20 p-6 flex justify-between items-center border-b border-zinc-100 dark:border-white/5"><h3 className="text-[11px] sm:text-xs font-semibold">New Folder</h3><button onClick={handleCloseFolder} className="opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent dark:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M18 6L6 18M6 6l12 12" /></svg></button></div>
              <div className="p-6 space-y-4">
                <input autoFocus placeholder="Name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#0a0a0a]/60 p-4 rounded-xl font-bold border dark:border-white/10 text-[11px] sm:text-xs dark:text-white outline-none focus:ring-2 focus:ring-orange-500" />
                
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choose Icon Logo</p>
                  <div className="grid grid-cols-6 gap-2 bg-zinc-100 dark:bg-[#0a0a0a]/40 p-3 rounded-xl border border-transparent dark:border-white/5">
                    {['Folder', 'Landmark', 'Sigma', 'Code', 'Cpu', 'Monitor', 'Globe', 'Database', 'Terminal', 'BookOpen', 'HelpCircle', 'Video', 'Languages', 'MessageSquare', 'Compass', 'FileText', 'Star'].map(ico => {
                      const IconMap: { [key: string]: any } = { Folder: FolderIconLucide, Landmark, Sigma, Code, Cpu, Monitor, Globe, Database, Terminal, BookOpen, HelpCircle, Video, Languages, MessageSquare, Compass, FileText, Star };
                      const IconComponent = IconMap[ico] || FolderIconLucide;
                      const isSel = folderIcon === ico;
                      return (
                        <button
                          key={ico}
                          type="button"
                          onClick={() => setFolderIcon(ico)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isSel ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-200 dark:bg-white/5 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-white/10 border-transparent'}`}
                          title={ico}
                        >
                          <IconComponent className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choose Brand Color</p>
                  <div className="flex gap-2.5 bg-zinc-100 dark:bg-[#0a0a0a]/40 p-3 rounded-xl border border-transparent dark:border-white/5">
                    {['#ff7a00', '#22c55e', '#0ea5e9', '#f43f5e', '#a855f7', '#10b981', '#6366f1'].map(hex => {
                      const isSel = folderColor === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setFolderColor(hex)}
                          className={`w-6 h-6 rounded-full border-2 transition-all active:scale-90 ${isSel ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                <button onClick={handleCreateFolder} disabled={isProcessing} className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-[11px] sm:text-xs shadow-lg active:scale-95 disabled:opacity-50 transition-all border-none">{isProcessing ? 'Saving...' : 'Create Folder'}</button>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root') || document.body
        )
      }

      {
        showRenameModal && userProfile?.is_admin && createPortal(
          <div className={`modal-overlay ${isClosingRename ? 'closing' : ''}`}
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseRename(); }}>
            <div ref={modalRef} className={`nexus-modal w-full max-w-sm ${isClosingRename ? 'closing' : ''}`}>
              <div className="bg-zinc-50 dark:bg-[#0a0a0a]/20 p-6 flex justify-between items-center border-b border-zinc-100 dark:border-white/5">
                <h3 className="text-[11px] sm:text-xs font-semibold">Rename Folder</h3>
                <button onClick={handleCloseRename} className="opacity-50 hover:opacity-100 transition-opacity border-none bg-transparent dark:text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input autoFocus placeholder="New Name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full bg-zinc-100 dark:bg-[#0a0a0a]/60 p-4 rounded-xl font-bold border dark:border-white/10 text-[11px] sm:text-xs dark:text-white outline-none focus:ring-2 focus:ring-orange-500" />

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choose Icon Logo</p>
                  <div className="grid grid-cols-6 gap-2 bg-zinc-100 dark:bg-[#0a0a0a]/40 p-3 rounded-xl border border-transparent dark:border-white/5">
                    {['Folder', 'Landmark', 'Sigma', 'Code', 'Cpu', 'Monitor', 'Globe', 'Database', 'Terminal', 'BookOpen', 'HelpCircle', 'Video', 'Languages', 'MessageSquare', 'Compass', 'FileText', 'Star'].map(ico => {
                      const IconMap: { [key: string]: any } = { Folder: FolderIconLucide, Landmark, Sigma, Code, Cpu, Monitor, Globe, Database, Terminal, BookOpen, HelpCircle, Video, Languages, MessageSquare, Compass, FileText, Star };
                      const IconComponent = IconMap[ico] || FolderIconLucide;
                      const isSel = folderIcon === ico;
                      return (
                        <button
                          key={ico}
                          type="button"
                          onClick={() => setFolderIcon(ico)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${isSel ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-200 dark:bg-white/5 text-zinc-400 hover:bg-zinc-300 dark:hover:bg-white/10 border-transparent'}`}
                          title={ico}
                        >
                          <IconComponent className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Choose Brand Color</p>
                  <div className="flex gap-2.5 bg-zinc-100 dark:bg-[#0a0a0a]/40 p-3 rounded-xl border border-transparent dark:border-white/5">
                    {['#ff7a00', '#22c55e', '#0ea5e9', '#f43f5e', '#a855f7', '#10b981', '#6366f1'].map(hex => {
                      const isSel = folderColor === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setFolderColor(hex)}
                          className={`w-6 h-6 rounded-full border-2 transition-all active:scale-90 ${isSel ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                <button onClick={handleRenameFolder} disabled={isProcessing} className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-[11px] sm:text-xs shadow-lg active:scale-95 disabled:opacity-50 transition-all border-none">{isProcessing ? 'Updating...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root') || document.body
        )
      }

      {
        (showUploadModal || showEditModal) && createPortal(
          <div className={`modal-overlay ${(showUploadModal ? isClosingUpload : isClosingEdit) ? 'closing' : ''}`}
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) { if (showUploadModal) handleCloseUpload(); else handleCloseEdit(); } }}>
            <div ref={modalRef} className={`nexus-modal w-full ${showUploadModal ? 'max-w-4xl' : 'max-w-sm'} overflow-hidden ${(showUploadModal ? isClosingUpload : isClosingEdit) ? 'closing' : ''}`}>
              <header className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-[#0a0a0a]/20 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold leading-none">{showUploadModal ? 'Contribute to Library' : 'Edit Metadata'}</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-2">
                    {showUploadModal ? `Batch Processing: ${pendingUploads.length} File${pendingUploads.length > 1 ? 's' : ''}` : 'Refine file parameters'}
                  </p>
                </div>
                <button onClick={() => { if (showUploadModal) handleCloseUpload(); else handleCloseEdit(); }} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border-none bg-transparent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </header>


              <div className={`flex flex-col md:flex-row flex-1 min-h-0 md:h-[60vh]`}>
                {showUploadModal && (
                  <div className="w-full md:w-64 border-r border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-[#0a0a0a]/10 overflow-y-auto no-scrollbar border-b md:border-b-0">
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-zinc-400 px-2 mb-3">Pending files</p>
                      {pendingUploads.map((up, idx) => (
                        <button
                          key={idx}
                          onClick={() => switchActiveUpload(idx)}                          className={`w-full text-left p-4 rounded-2xl transition-all border-none relative group ${activeUploadIndex === idx ? 'text-white shadow-lg shadow-orange-500/20' : 'hover:bg-orange-500/5 text-zinc-500 dark:text-zinc-400 hover:text-orange-500'}`}
                          style={activeUploadIndex === idx ? { backgroundColor: 'var(--brand-primary)' } : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeUploadIndex === idx ? 'bg-white/20' : 'bg-zinc-100 dark:bg-[#0a0a0a]'}`}>
                              <FileIcon fileName={up.file.name} size="w-4 h-4" className={activeUploadIndex === idx ? 'text-white' : ''} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-xs font-medium truncate">{up.name || up.file.name}</p>
                              <p className={`text-[8px] font-bold opacity-60 truncate ${activeUploadIndex === idx ? 'text-white' : 'text-zinc-400'}`}>{(up.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            {activeUploadIndex === idx && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                            )}
                          </div>
                          {pendingUploads.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextUploads = pendingUploads.filter((_, i) => i !== idx);
                                if (nextUploads.length === 0) {
                                  setShowUploadModal(false);
                                  setPendingUploads([]);
                                } else {
                                  setPendingUploads(nextUploads);
                                  // Determine next index and immediately update metaForm from the NEW array
                                  const nextIdx = activeUploadIndex === idx ? (idx === 0 ? 0 : idx - 1) : (activeUploadIndex > idx ? activeUploadIndex - 1 : activeUploadIndex);
                                  const target = nextUploads[nextIdx];
                                  if (target) {
                                    setActiveUploadIndex(nextIdx);
                                    setMetaForm({
                                      name: target.name,
                                      description: target.description,
                                      semester: target.semester,
                                      subject: target.subject,
                                      type: target.type,
                                      program: target.program
                                    });
                                  }
                                }
                              }}
                              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all border-none bg-transparent"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-white dark:bg-[#0a0a0a]/20">
                  <div className={`grid grid-cols-1 gap-5 ${showUploadModal ? 'md:grid-cols-2 md:gap-6' : ''}`}>
                    <div className="space-y-2 relative z-[95]">
                      <label className="text-[11px] sm:text-xs text-zinc-500 ml-1">Target Program</label>
                      {!isCreatingNew.program ? (
                        <NexusDropdown
                          options={availablePrograms}
                          value={metaForm.program}
                          onChange={(val) => {
                            setMetaForm({ ...metaForm, program: val, semester: '', subject: '', type: '' });
                          }}
                          placeholder="Select Program"
                          className="w-full"
                          renderCustomMenu={(close) => (
                            <>
                              {availablePrograms.map(opt => (
                                <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, program: opt, semester: '', subject: '', type: '' }); close(); }} className={`w-full text-left px-4 py-3 border-none rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${metaForm.program === opt ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-orange-500'}`} style={metaForm.program === opt ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-glow)' } : undefined}>
                                  {opt}
                                  {metaForm.program === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                                </button>
                              ))}
                              <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, program: true }); setMetaForm({ ...metaForm, program: '' }); close(); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-zinc-100 dark:border-white/5 pt-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                                Add New Program
                              </button>
                            </>
                          )}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <input autoFocus placeholder="New Program..." value={metaForm.program} onChange={e => setMetaForm({ ...metaForm, program: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                          <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, program: false }); setMetaForm({ ...metaForm, program: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 relative z-[90]">
                      <label className="text-[11px] sm:text-xs text-zinc-500 ml-1">Document Title</label>
                      <input value={metaForm.name} onChange={e => setMetaForm({ ...metaForm, name: e.target.value })} className="w-full bg-zinc-100 dark:bg-[#0a0a0a]/40 p-4 rounded-2xl font-medium border border-transparent dark:border-white/5 text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 text-[11px] sm:text-xs transition-all" />
                    </div>

                    <div className="space-y-2 relative z-[80]">
                      <label className="text-xs text-zinc-500 ml-1">Semester</label>
                      {!isCreatingNew.semester ? (
                        <NexusDropdown
                          options={modalSemesters}
                          value={metaForm.semester}
                          onChange={(val) => setMetaForm({ ...metaForm, semester: val, subject: '', type: '' })}
                          placeholder="Select Semester"
                          className="w-full"
                          renderCustomMenu={(close) => (
                            <>
                              {modalSemesters.map(opt => (
                                <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, semester: opt, subject: '', type: '' }); close(); }} className={`w-full text-left px-4 py-3 border-none rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${metaForm.semester === opt ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-orange-500'}`} style={metaForm.semester === opt ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-glow)' } : undefined}>
                                  {opt}
                                  {metaForm.semester === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                                </button>
                              ))}
                              <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, semester: true }); setMetaForm({ ...metaForm, semester: '' }); close(); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-zinc-100 dark:border-white/5 pt-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                                Create New Folder
                              </button>
                            </>
                          )}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <input autoFocus placeholder="New Sem..." value={metaForm.semester} onChange={e => setMetaForm({ ...metaForm, semester: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                          <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, semester: false }); setMetaForm({ ...metaForm, semester: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 relative z-[75]">
                      <label className="text-xs text-zinc-500 ml-1">Subject</label>
                      {!isCreatingNew.subject ? (
                        <NexusDropdown
                          options={modalSubjects}
                          value={metaForm.subject}
                          onChange={(val) => setMetaForm({ ...metaForm, subject: val, type: '' })}
                          placeholder="Select Subject"
                          className="w-full"
                          renderCustomMenu={(close) => (
                            <>
                              {modalSubjects.map(opt => (
                                <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, subject: opt, type: '' }); close(); }} className={`w-full text-left px-4 py-3 border-none rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${metaForm.subject === opt ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-orange-500'}`} style={metaForm.subject === opt ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-glow)' } : undefined}>
                                  {opt}
                                  {metaForm.subject === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                                </button>
                              ))}
                              <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, subject: true }); setMetaForm({ ...metaForm, subject: '' }); close(); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-zinc-100 dark:border-white/5 pt-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                                Create New Folder
                              </button>
                            </>
                          )}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <input autoFocus placeholder="New Subject..." value={metaForm.subject} onChange={e => setMetaForm({ ...metaForm, subject: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                          <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, subject: false }); setMetaForm({ ...metaForm, subject: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 relative z-[70]">
                      <label className="text-xs text-zinc-500 ml-1">Category / Type</label>
                      {!isCreatingNew.type ? (
                        <NexusDropdown
                          options={modalCategories}
                          value={metaForm.type}
                          onChange={(val) => setMetaForm({ ...metaForm, type: val })}
                          placeholder="Select Category"
                          className="w-full"
                          renderCustomMenu={(close) => (
                            <>
                              {modalCategories.map(opt => (
                                <button key={opt} type="button" onClick={() => { setMetaForm({ ...metaForm, type: opt }); close(); }} className={`w-full text-left px-4 py-3 border-none rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${metaForm.type === opt ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-orange-500'}`} style={metaForm.type === opt ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 15px -3px var(--brand-glow)' } : undefined}>
                                  {opt}
                                  {metaForm.type === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-3.5 h-3.5"><path d="M20 6 9 17 4 12" /></svg>}
                                </button>
                              ))}
                              <button type="button" onClick={() => { setIsCreatingNew({ ...isCreatingNew, type: true }); setMetaForm({ ...metaForm, type: '' }); close(); }} className="w-full text-left px-4 py-3 rounded-xl text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-all border-none flex items-center gap-2 mt-2 border-t border-zinc-100 dark:border-white/5 pt-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M12 5v14M5 12h14" /></svg>
                                Create New Folder
                              </button>
                            </>
                          )}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <input autoFocus placeholder="New Category..." value={metaForm.type} onChange={e => setMetaForm({ ...metaForm, type: e.target.value })} className="flex-1 bg-white/5 p-4 rounded-2xl font-bold border border-orange-500/50 text-white outline-none focus:ring-2 focus:ring-orange-500 text-[10px]" />
                          <button onClick={() => { setIsCreatingNew({ ...isCreatingNew, type: false }); setMetaForm({ ...metaForm, type: '' }); }} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white transition-colors border-none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        </div>
                      )}
                    </div>

                    <div className={`space-y-2 relative z-[50] ${showUploadModal ? 'md:col-span-2' : ''}`}>
                      <label className="text-[11px] sm:text-xs text-zinc-500 ml-1">Short Description</label>
                      <textarea rows={2} value={metaForm.description} onChange={e => setMetaForm({ ...metaForm, description: e.target.value })} className="w-full bg-zinc-100 dark:bg-[#0a0a0a]/40 p-4 rounded-3xl font-medium border border-transparent dark:border-white/5 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-orange-500 resize-none italic text-[11px] sm:text-xs transition-all" placeholder="Tell us more about this file..." />
                    </div>
                  </div>
                </div>
              </div>

              <footer className="p-6 md:p-8 bg-zinc-50 dark:bg-[#0a0a0a]/20 border-t border-zinc-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                {showUploadModal && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-4 bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-400 hover:text-orange-500 rounded-2xl font-medium text-[11px] sm:text-xs transition-all border-none"
                  >
                    Add More
                  </button>
                )}
                <button
                  onClick={showUploadModal ? handleUpload : handleEditSubmission}
                  disabled={isProcessing || !metaForm.name || !metaForm.semester || !metaForm.subject || (showUploadModal && pendingUploads.some(u => !u.name || !u.semester || !u.subject))}
                  className="flex-1 bg-orange-500 text-white py-4 rounded-[24px] font-semibold text-[11px] sm:text-xs shadow-[0_20px_50px_rgba(234,88,12,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all border-none"
                >
                  {isProcessing ? 'Processing Batch...' : showUploadModal ? `Upload ${pendingUploads.length} Item${pendingUploads.length > 1 ? 's' : ''}` : 'Update Record'}
                </button>
              </footer>
            </div>
          </div>,
          document.getElementById('modal-root') || document.body
        )
      }

      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={e => { const files = e.target.files; if (files && files.length > 0) handleFilesSelected(files); }} />

      {
        activePdfFile && (
          <PDFViewer
            file={activePdfFile}
            fileName={activePdfFile.name}
            userProfile={userProfile}
            onClose={() => {
              setActivePdfFile(null);
              fetchProgress();
            }}
            onAuthRequired={onAuthRequired}
          />
        )
      }
      
    </div>
  );
};

const getSubjectTheme = (nameOrCode: string) => {
  const c = nameOrCode.toUpperCase().trim();
  
  // 1. Math / Calculus subjects
  if (c.includes('MTH') || c.includes('MATH') || c.includes('CALCULUS') || c.includes('STATISTICS')) {
    return {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-500',
      icon: <Sigma className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#22c55e'
    };
  }

  // 2. Coding / Programming / Development / Web labs
  if (
    c.includes('PROGRAMMING') || 
    c.includes('PYTHON') || 
    c.includes('CSE101') || 
    c.includes('CSE326') || 
    c.includes('INT108') || 
    c.includes('JAVA') || 
    c.includes('CPP') || 
    c.includes('DEVELOPMENT') || 
    c.includes('WEB')
  ) {
    return {
      text: 'text-orange-500',
      bg: 'bg-orange-500',
      lightBg: 'bg-orange-500/10 dark:bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500 to-amber-500',
      icon: <Code className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ff7a00'
    };
  }

  // 3. Electrical / Electronics / Hardware subjects
  if (
    c.includes('ECE') || 
    c.includes('EEE') || 
    c.includes('ELECTRICAL') || 
    c.includes('ELECTRONICS') || 
    c.includes('HARDWARE') || 
    c.includes('DIGITAL ELECTRONICS')
  ) {
    return {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-500/10 dark:bg-blue-500/10',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500 to-indigo-500',
      icon: <Cpu className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#0ea5e9'
    };
  }

  // 4. Other CSE Theory / Computing / Systems / Architecture
  if (
    c.includes('CSE') || 
    c.includes('COMPUTING') || 
    c.includes('ORIENTATION') || 
    c.includes('INT') || 
    c.includes('CAP') ||
    c.includes('OPERATING') ||
    c.includes('NETWORKS') ||
    c.includes('SECURITY')
  ) {
    return {
      text: 'text-teal-500',
      bg: 'bg-teal-500',
      lightBg: 'bg-teal-500/10 dark:bg-teal-500/10',
      border: 'border-teal-500/20',
      gradient: 'from-teal-500 to-emerald-500',
      icon: <Monitor className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#14b8a6'
    };
  }

  // 5. Database / DBMS subjects
  if (c.includes('DATABASE') || c.includes('DBMS') || c.includes('SQL')) {
    return {
      text: 'text-purple-500',
      bg: 'bg-purple-500',
      lightBg: 'bg-purple-500/10 dark:bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-pink-500',
      icon: <Database className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#a855f7'
    };
  }

  // 6. Languages / Communication / Soft Skills
  if (
    c.includes('FRN') || 
    c.includes('GER') || 
    c.includes('JAP') || 
    c.includes('SPA') || 
    c.includes('FRENCH') || 
    c.includes('GERMAN') || 
    c.includes('JAPANESE') || 
    c.includes('SPANISH') || 
    c.includes('LANG') ||
    c.includes('COMMUNICATION') ||
    c.includes('COMM') ||
    c.includes('PEL')
  ) {
    return {
      text: 'text-pink-500',
      bg: 'bg-pink-500',
      lightBg: 'bg-pink-500/10 dark:bg-pink-500/10',
      border: 'border-pink-500/20',
      gradient: 'from-pink-500 to-rose-500',
      icon: <Languages className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ec4899'
    };
  }

  // 7. General Fallback
  return {
    text: 'text-indigo-500',
    bg: 'bg-indigo-500',
    lightBg: 'bg-indigo-500/10 dark:bg-indigo-500/10',
    border: 'border-indigo-500/20',
    gradient: 'from-indigo-500 to-purple-500',
    icon: <Globe className="w-5 h-5 text-white" strokeWidth={3} />,
    rawColor: '#6366f1'
  };
};

const FolderCard: React.FC<{
  folder: Folder;
  selectedProgram: string;
  userProfile: UserProfile | null;
  fileCount: number;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  toPath: string;
  onRename: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDraggingOver: boolean;
  subjectsCount?: number;
  searchMatchText?: string | null;
}> = ({ folder, selectedProgram, userProfile, fileCount, onDragOver, onDragLeave, onDrop, toPath, onRename, onDelete, isDraggingOver, subjectsCount, searchMatchText }) => {
  const isAdmin = userProfile?.is_admin || false;
  const isVirtual = folder.id.startsWith('v-');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id, disabled: !isAdmin || isVirtual });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  const meta = folder.type === 'subject' ? findSubjectMetadata(selectedProgram, folder.name) : null;

  // Semester color palette matching the reference design
  const semesterColors = ['#ff7a00', '#a855f7', '#0ea5e9', '#22c55e', '#f43f5e', '#eab308', '#14b8a6', '#6366f1'];

  if (folder.type === 'semester') {
    const semNum = folder.name.match(/\d+/)?.[0] || '1';
    const semIdx = Math.max(0, (parseInt(semNum) - 1)) % semesterColors.length;
    const semColor = (folder.color && folder.color !== '#ff7a00') ? folder.color : semesterColors[semIdx];
    
    return (
      <Link
        to={toPath}
        ref={setNodeRef as any}
        style={style as any}
        onDragOver={(e) => { if (!isAdmin || isVirtual) return; e.preventDefault(); onDragOver(e); }}
        onDragLeave={onDragLeave}
        onDrop={(e) => { if (!isAdmin || isVirtual) return; e.preventDefault(); onDrop(e); }}
        onClick={(e) => { if (isDragging) e.preventDefault(); }}
        className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-none bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] hover:shadow-md transition-all duration-200 active:scale-[0.99] relative overflow-hidden"
      >
        {isAdmin && !isVirtual && (
          <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(); }} className="p-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-orange-500 hover:bg-orange-50 transition-colors shadow-sm border border-zinc-100 dark:border-white/5" title="Edit Semester">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e); }} className="p-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-zinc-100 dark:border-white/5" title="Delete Semester">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: semColor }}>
            <FolderIcon type="semester" name={folder.name} size="w-5 h-5 text-white" iconName={folder.icon_name} color="#ffffff" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">{folder.name}</h4>
            <div className="flex flex-wrap items-center gap-x-1.5 min-[375px]:gap-x-2 gap-y-0.5 mt-1 text-[9px] min-[375px]:text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
                {subjectsCount || 0} Subjects
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
              <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                <FileText className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
                {fileCount} Resources
              </span>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ color: semColor }}><path d="M9 18l6-6-6-6" /></svg>
      </Link>
    );
  }

  if (folder.type === 'subject') {
    const subjectCodeMatch = folder.name.match(/^([A-Za-z]+\d{3})/);
    const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toUpperCase() : folder.name.split(':')[0].trim();
    let subjectName = folder.name.split(':')[1]?.trim();
    if (!subjectName || subjectName.toLowerCase() === subjectCode.toLowerCase()) {
      const meta = findSubjectMetadata(selectedProgram, folder.name);
      subjectName = meta?.title || folder.name;
    }
    const defaultTheme = getSubjectTheme(folder.name);
    const rawTheme = {
      rawColor: (folder.color && folder.color !== '#ff7a00') ? folder.color : defaultTheme.rawColor,
      icon: (folder.icon_name && folder.icon_name !== 'Folder') ? (
        <FolderIcon type="subject" name={folder.name} size="w-5 h-5" iconName={folder.icon_name} color="#ffffff" />
      ) : (
        defaultTheme.icon
      )
    };
    const metadata = findSubjectMetadata(selectedProgram, folder.name);
    const creditsText = metadata ? `${metadata.credits} Credits` : "4 Credits";
    const ltpText = metadata ? `L-T-P: ${metadata.l}-${metadata.t}-${metadata.p}` : "L-T-P: 3-0-2";

    return (
      <Link
        to={toPath}
        ref={setNodeRef as any}
        style={style}
        onDragOver={(e) => { if (!isAdmin || isVirtual) return; e.preventDefault(); onDragOver(e); }}
        onDragLeave={onDragLeave}
        onDrop={(e) => { if (!isAdmin || isVirtual) return; e.preventDefault(); onDrop(e); }}
        onClick={(e) => { if (isDragging) e.preventDefault(); }}
        className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-none bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] hover:shadow-md transition-all duration-200 active:scale-[0.99] relative overflow-hidden"
      >
        {isAdmin && !isVirtual && (
          <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(); }} className="p-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-orange-500 hover:bg-orange-50 transition-colors shadow-sm border border-zinc-100 dark:border-white/5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(e); }} className="p-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-zinc-100 dark:border-white/5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white animate-fade-in" style={{ backgroundColor: rawTheme.rawColor }}>
            {React.isValidElement(rawTheme.icon) ? React.cloneElement(rawTheme.icon as React.ReactElement, { className: 'w-5 h-5 text-white' }) : rawTheme.icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white leading-snug truncate pr-6">{subjectName}</h4>
            <div className="flex flex-wrap items-center gap-x-1.5 min-[375px]:gap-x-2 gap-y-0.5 mt-1 text-[9px] min-[375px]:text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <span className="font-semibold whitespace-nowrap shrink-0" style={{ color: rawTheme.rawColor }}>{subjectCode}</span>
              <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
              {searchMatchText ? (
                <span className="flex items-center gap-1 font-bold text-orange-500 bg-orange-500/5 dark:bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/10 whitespace-nowrap shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-orange-500 shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  {searchMatchText}
                </span>
              ) : (
                <>
                  <span className="whitespace-nowrap shrink-0">{creditsText}</span>
                  <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                  <span className="whitespace-nowrap shrink-0">{ltpText}</span>
                  <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                  <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                    <FileText className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
                    {fileCount} Resources
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ color: rawTheme.rawColor }}><path d="M9 18l6-6-6-6" /></svg>
      </Link>
    );
  }

  return (
    <Link
      to={toPath}
      ref={setNodeRef as any}
      style={style as any}
      onDragOver={(e) => { if (!isAdmin || isVirtual) return; e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { if (!isAdmin || isVirtual) return; e.preventDefault(); onDrop(e); }}
      onClick={(e) => { if (isDragging) e.preventDefault(); }}
      className="group flex items-center justify-between p-4 rounded-2xl border border-zinc-150 dark:border-white/5 bg-white dark:bg-[#121214] hover:bg-zinc-50/50 dark:hover:bg-[#18181c] hover:shadow-md hover:border-zinc-200 dark:hover:border-white/10 transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <FolderIcon type={folder.type} name={folder.name} size="w-8 h-8" iconName={folder.icon_name} color={folder.color} />
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100">{folder.name}</h4>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">{fileCount} resources</p>
        </div>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-all"><path d="M9 18l6-6-6-6" /></svg>
    </Link>
  );
};

const StaticFolderCard: React.FC<{
  folder: Folder;
  selectedProgram: string;
  fileCount: number;
}> = ({ folder, selectedProgram, fileCount }) => {
  const defaultTheme = getSubjectTheme(folder.name);
  const rawTheme = {
    rawColor: (folder.color && folder.color !== '#ff7a00') ? folder.color : defaultTheme.rawColor,
    icon: (folder.icon_name && folder.icon_name !== 'Folder') ? (
      <FolderIcon type="subject" name={folder.name} size="w-5 h-5" iconName={folder.icon_name} color="#ffffff" />
    ) : (
      defaultTheme.icon
    )
  };
  const subjectCodeMatch = folder.name.match(/^([A-Za-z]+\d{3})/);
  const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toUpperCase() : folder.name.split(':')[0].trim();
  const metadata = findSubjectMetadata(selectedProgram, folder.name);
  let subjectName = folder.name.split(':')[1]?.trim();
  if (!subjectName || subjectName.toLowerCase() === subjectCode.toLowerCase()) {
    subjectName = metadata?.title || folder.name;
  }
  const creditsText = metadata ? `${metadata.credits} Credits` : "4 Credits";
  const ltpText = metadata ? `L-T-P: ${metadata.l}-${metadata.t}-${metadata.p}` : "L-T-P: 3-0-2";

  return (
    <div className="p-3 sm:p-3.5 rounded-2xl border-none bg-white dark:bg-[#111113] flex items-center justify-between min-h-[70px] relative overflow-hidden">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: rawTheme.rawColor }}>
          {React.isValidElement(rawTheme.icon) ? React.cloneElement(rawTheme.icon as React.ReactElement, { className: 'w-5 h-5 text-white' }) : rawTheme.icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white truncate pr-6">{subjectName}</h4>
          <div className="flex flex-wrap items-center gap-x-1.5 min-[375px]:gap-x-2 gap-y-0.5 mt-1 text-[9px] min-[375px]:text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <span className="font-semibold whitespace-nowrap shrink-0" style={{ color: rawTheme.rawColor }}>{subjectCode}</span>
            <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
            <span className="whitespace-nowrap shrink-0">{creditsText}</span>
            <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
            <span className="whitespace-nowrap shrink-0">{ltpText}</span>
            <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
            <span className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
              <FileText className="w-3.5 h-3.5 text-zinc-455 dark:text-zinc-500" />
              {fileCount} Resources
            </span>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" style={{ color: rawTheme.rawColor }}><path d="M9 18l6-6-6-6" /></svg>
    </div>
  );
};

const FileCard: React.FC<{

  file: LibraryFile;
  userProfile: UserProfile | null;
  isAdminMode: boolean;
  isPersonal?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDemote?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAccess: () => void;
  onShowDetails: () => void;
}> = ({ file, userProfile, isAdminMode, isPersonal, onApprove, onReject, onDemote, onEdit, onDelete, onAccess, onShowDetails }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  const isAdmin = userProfile?.is_admin || false;
  const statusConfig = {
    pending: { label: 'Queued', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    approved: { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Redacted', color: 'text-red-500', bg: 'bg-red-500/10' }
  };
  const status = statusConfig[file.status] || statusConfig.pending;

  const fileStyle = getFileStyle(file.storage_path || file.name);

  return (
    <div
      ref={setNodeRef as any}
      style={style as any}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[draggable]')) {
          return;
        }

        // Open file details modal
        onShowDetails();
      }}
      className={`group p-4 rounded-[24px] border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0c0c0e] ${fileStyle.hoverBorder} hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col min-h-[148px] cursor-pointer no-underline text-current ${isDragging ? 'shadow-2xl border-orange-500 ring-2 ring-orange-500/20' : ''}`}
    >
      {/* Aurora glow on hover */}
      <div 
        className="absolute -right-12 -top-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: fileStyle.glowColor }}
      />

      {/* Giant faint background logo */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.05] dark:opacity-[0.03] pointer-events-none z-0">
        <FileIcon fileName={file.storage_path} size="w-28 h-28" className={fileStyle.iconText} />
      </div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={`w-9 h-9 ${fileStyle.iconBg} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
          <FileIcon fileName={file.storage_path} size="w-5 h-5" className={fileStyle.iconText} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase rounded-md ${fileStyle.badgeBg} ${fileStyle.badgeText} transition-colors`}>
            {fileStyle.label}
          </span>
          {isAdmin && (
            <div
              {...attributes}
              {...listeners}
              className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-orange-500 cursor-grab active:cursor-grabbing transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Drag to reorder"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
          )}
        </div>
      </div>

      <div className={`text-[12px] md:text-[14px] font-medium text-zinc-700 dark:text-zinc-200 tracking-tight leading-snug line-clamp-2 mb-2 ${fileStyle.hoverText} transition-colors duration-300 relative z-10`}>
        {file.name}
      </div>

      <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center justify-between relative z-10">
        <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-normal">{file.size}</span>
        <div className="flex gap-1.5 peer">
          {isAdminMode ? (
            <div className="flex gap-1.5">
              {file.status !== 'approved' && (
                <button onClick={(e) => { e.stopPropagation(); onApprove?.(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all" title="Approve">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-orange-500 border border-transparent hover:border-orange-500/20 rounded-lg flex items-center justify-center hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all" title="Edit Metadata">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-blue-500 border border-transparent hover:border-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-all" title="View Document">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
              {file.status === 'approved' ? (
                <button onClick={(e) => { e.stopPropagation(); onDemote?.(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-orange-500 border border-transparent hover:border-orange-500/20 rounded-lg flex items-center justify-center hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all" title="Demote to Pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onReject?.(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-red-500 border border-transparent hover:border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all" title="Reject & Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <div className="flex gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-orange-500 border border-transparent hover:border-orange-500/20 rounded-lg flex items-center justify-center hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all" title="Edit Metadata"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-red-500 border border-transparent hover:border-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="w-8 h-8 bg-transparent dark:bg-transparent text-emerald-500 border border-transparent hover:border-emerald-500/20 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all" title="Access File"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className={`bg-transparent dark:bg-transparent ${fileStyle.actionText} border border-transparent hover:border-current px-4 py-1.5 rounded-xl font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 ${fileStyle.actionHoverBg} hover:text-white dark:hover:text-white transition-all`}>Access <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
          )}
        </div>
      </div>
    </div>
  );
};

// Static version of FileCard for the Drag Overlay to avoid hook issues
const StaticFileCard: React.FC<{
  file: LibraryFile;
  userProfile: UserProfile | null;
  isAdminMode: boolean;
}> = ({ file, userProfile, isAdminMode }) => {
  const isAdmin = userProfile?.is_admin || false;
  const fileStyle = getFileStyle(file.storage_path || file.name);
  return (
    <div className="p-4 rounded-[24px] border border-orange-500 bg-white dark:bg-[#0c0c0e] flex flex-col min-h-[148px] relative overflow-hidden">
      {/* Giant faint background logo */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.05] dark:opacity-[0.03] pointer-events-none z-0">
        <FileIcon fileName={file.storage_path} size="w-28 h-28" className={fileStyle.iconText} />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 ${fileStyle.iconBg} rounded-xl flex items-center justify-center`}>
          <FileIcon fileName={file.storage_path} size="w-5 h-5" className={fileStyle.iconText} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase rounded-md ${fileStyle.badgeBg} ${fileStyle.badgeText}`}>
            {fileStyle.label}
          </span>
          {isAdmin && (
            <div className="p-1 text-orange-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
            </div>
          )}
        </div>
      </div>
      <div className="text-[12px] md:text-[14px] font-medium text-zinc-700 dark:text-zinc-200 tracking-tight leading-snug line-clamp-2 mb-2">{file.name}</div>
      <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-normal">{file.size}</span>
      </div>
    </div>
  );
};

export default ContentLibrary;
