
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { LibraryFile, UserProfile, Folder } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import PDFViewer from './PDFViewer.tsx';
import NexusOriginals from './NexusOriginals.tsx';
import NexusDropdown from './NexusDropdown.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import { slugify } from '../utils/slugify.ts';
import NexusAd from './NexusAd.tsx';

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
import { BTECH_CSE_2025, findSubjectMetadata } from '../data/curriculumData.ts';
import { SYLLABUS_DATA } from '../data/syllabusData.ts';

const matchFolderSlug = (folderName: string, paramSlug: string): boolean => {
  if (!folderName || !paramSlug) return false;
  const standardSlug = slugify(folderName);
  if (standardSlug === paramSlug) return true;
  
  // Extract subject code from the beginning (e.g. "ECE249: Basic ...")
  const codeMatch = folderName.match(/^([A-Za-z]+\d{3})/);
  if (codeMatch) {
    const codeSlug = slugify(codeMatch[1]);
    if (codeSlug === paramSlug) return true;
  }
  return false;
};

const matchSemesterName = (nameA: string, nameB: string): boolean => {
  if (!nameA || !nameB) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace('semester', 'term').replace('sem', 'term');
  return norm(nameA) === norm(nameB);
};

const FolderIcon = ({ type, size = "w-7 h-7" }: { type: 'semester' | 'subject' | 'category' | 'root', size?: string }) => {

  const colors = {
    root: 'text-zinc-400',
    semester: 'text-orange-500',
    subject: 'text-orange-500',
    category: 'text-orange-500'
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`${size} ${colors[type]} mb-2 transition-colors`}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
};

export const FileIcon = ({ fileName, size = "w-5 h-5", className = "" }: { fileName: string, size?: string, className?: string }) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let colorClass = 'text-zinc-400 dark:text-zinc-500';
  let label = '';

  if (ext === 'pdf') {
    colorClass = 'text-red-500';
    label = 'PDF';
  } else if (['doc', 'docx'].includes(ext)) {
    colorClass = 'text-blue-500';
    label = 'DOC';
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
    colorClass = 'text-emerald-500';
    label = 'XLS';
  } else if (['ppt', 'pptx'].includes(ext)) {
    colorClass = 'text-orange-500';
    label = 'PPT';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    colorClass = 'text-amber-500';
    label = 'ZIP';
  } else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    colorClass = 'text-purple-500';
    label = 'IMG';
  } else if (['txt', 'md'].includes(ext)) {
    colorClass = 'text-teal-500';
    label = 'TXT';
  }

  const mergedClassName = className.includes('text-')
    ? `${size} ${className}`
    : `${size} ${colorClass} ${className}`;

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={mergedClassName}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      {label && (
        <text
          x="12"
          y="15.5"
          fill="currentColor"
          fontSize="6"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="none"
        >
          {label}
        </text>
      )}
    </svg>
  );
};

const SkeletonCard = () => (
  <div className="group p-5 rounded-[30px] border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 relative overflow-hidden flex flex-col min-h-[140px]">
    <div className="w-10 h-10 skeleton-pulse rounded-xl mb-4" />
    <div className="h-4 w-3/4 skeleton-pulse rounded-md mb-2" />
    <div className="h-3 w-1/2 skeleton-pulse rounded-md" />
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
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ userProfile, initialView = 'browse', onAuthRequired }) => {
  const { shortBrandName, uniSlug, universityInfo } = useUniversity();
  const [allFiles, setAllFiles] = useState<LibraryFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<'browse' | 'my-uploads' | 'originals'>(initialView);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { program, semester, subject, category } = useParams();
  const navigate = useNavigate();
  const routePrefix = uniSlug ? `/${uniSlug}` : '';


  const [activeSemester, setActiveSemester] = useState<Folder | null>(null);
  const [activeSubject, setActiveSubject] = useState<Folder | null>(null);
  const [activeCategory, setActiveCategory] = useState<Folder | null>(null);

  const initialPrograms = ["BTech CSE", "BTech IT", "BCA", "MCA", "MBA", "BCom", "BA"];
  const [availablePrograms, setAvailablePrograms] = useState(initialPrograms);
  const [selectedProgram, setSelectedProgram] = useState(() => {
    if (program) {
      const found = initialPrograms.find(p => slugify(p) === program);
      if (found) return found;
      if (initialPrograms.includes(decodeURIComponent(program))) return decodeURIComponent(program);
    }
    if (userProfile?.program && initialPrograms.includes(userProfile.program)) return userProfile.program;
    return initialPrograms[0];
  });



  const [isAdminView, setIsAdminView] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);
  const [folderToManage, setFolderToManage] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isShining, setIsShining] = useState(false);

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

  useEffect(() => {
    if (showUploadModal || showEditModal) {
      setMetaForm(prev => ({ ...prev, program: selectedProgram }));
    }
  }, [showUploadModal, showEditModal, selectedProgram]);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null);

  const [viewerInfo, setViewerInfo] = useState<{ show: boolean, url: string, name: string }>({ show: false, url: '', name: '' });

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
    } catch (e: any) {
      console.error("Library load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isAdminView, viewMode, userProfile, searchQuery, selectedProgram]);

  useEffect(() => {
    fetchFromSource(true);
  }, [fetchFromSource]);

  // Helper function to dynamically merge curriculum with DB folders
  const getMergedFolders = useCallback((prog: string, activeSub: Folder | null) => {
    const isBtech = (prog || '').toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse';
    if (!isBtech) {
      return folders;
    }

    const virtualFolders: Folder[] = [];
    const curriculum = BTECH_CSE_2025;

    // 1. Add virtual semesters (Terms)
    curriculum.terms.forEach(term => {
      virtualFolders.push({
        id: `v-sem-${term.termNumber}`,
        name: term.termName,
        type: 'semester',
        parent_id: null,
        program: prog,
        display_order: term.termNumber
      });

      // 2. Add virtual subjects (Core and Electives flats under Term)
      let subjectIndex = 0;
      term.coreSubjects.forEach((subj) => {
        virtualFolders.push({
          id: `v-sub-${term.termNumber}-${subj.code.toLowerCase()}`,
          name: `${subj.code}: ${subj.title}`,
          type: 'subject',
          parent_id: `v-sem-${term.termNumber}`,
          program: prog,
          display_order: subjectIndex++
        });
      });

      term.electiveBaskets.forEach((basket) => {
        basket.subjects.forEach((subj) => {
          virtualFolders.push({
            id: `v-sub-${term.termNumber}-${subj.code.toLowerCase()}`,
            name: `${subj.code}: ${subj.title}`,
            type: 'subject',
            parent_id: `v-sem-${term.termNumber}`,
            program: prog,
            display_order: subjectIndex++
          });
        });
      });
    });

    // 3. No virtual categories at deep level (only custom folders from DB)

    // 4. Merge custom folders created in the database that don't duplicate virtual folders
    const customFolders = folders.filter(dbF => {
      if (dbF.type === 'semester') {
        return !virtualFolders.some(v => v.type === 'semester' && matchSemesterName(v.name, dbF.name));
      }
      if (dbF.type === 'subject') {
        const parentSem = folders.find(p => p.id === dbF.parent_id);
        if (parentSem) {
          const virtualParentSem = virtualFolders.find(v => v.type === 'semester' && matchSemesterName(v.name, parentSem.name));
          if (virtualParentSem) {
            return !virtualFolders.some(v => v.type === 'subject' && v.parent_id === virtualParentSem.id && (
              v.name.toLowerCase() === dbF.name.toLowerCase() ||
              v.name.split(':')[0].trim().toLowerCase() === dbF.name.split(':')[0].trim().toLowerCase()
            ));
          }
        }
      }

      return true;
    });

    const mappedCustomFolders = customFolders.flatMap(dbF => {
      if (dbF.parent_id) {
        const dbParent = folders.find(p => p.id === dbF.parent_id);
        if (dbParent) {
          const matchingVirtuals = virtualFolders.filter(v => v.type === dbParent.type && (
            (v.type === 'semester' && matchSemesterName(v.name, dbParent.name)) ||
            (v.type === 'subject' && (
              v.name.toLowerCase() === dbParent.name.toLowerCase() ||
              v.name.split(':')[0].trim().toLowerCase() === dbParent.name.split(':')[0].trim().toLowerCase()
            ))
          ));
          if (matchingVirtuals.length > 0) {
            return matchingVirtuals.map((matchingVirtual, idx) => ({
              ...dbF,
              id: idx === 0 ? dbF.id : `${dbF.id}-dup-${idx}`,
              parent_id: matchingVirtual.id
            }));
          }
        }
      }
      return [dbF];
    });

    return [...virtualFolders, ...mappedCustomFolders];
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
        const found = availablePrograms.find(p => slugify(p) === program);
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
        const sem = finalFolders.find(f => f.type === 'semester' && (slugify(f.name) === semester || matchSemesterName(f.name, semester.replace('-', ' '))) && f.program === matchedProgram);
        if (activeSemester?.id !== (sem?.id || null)) {
          setActiveSemester(sem || null);
        }
        
        if (subject && sem) {
          const subj = finalFolders.find(f => f.type === 'subject' && matchFolderSlug(f.name, subject) && f.parent_id === sem.id);
          if (activeSubject?.id !== (subj?.id || null)) {
            setActiveSubject(subj || null);
          }
          
          if (category && subj) {
            const cat = finalFolders.find(f => f.type === 'category' && slugify(f.name) === category && f.parent_id === subj.id);
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
      if (!activeSubject) return f.type === 'subject' && f.parent_id === activeSemester.id;
      if (!activeCategory) return f.type === 'category' && f.parent_id === activeSubject.id;
      return false;
    });

    return [...filtered].sort((a, b) => {
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [finalFolders, activeSemester, activeSubject, activeCategory, isAdminView]);

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
    let path = `${routePrefix}/library/${slugify(selectedProgram)}`;
    if (sem) {
      path += `/${slugify(sem.name)}`;
      if (subj) {
        path += `/${slugify(subj.name)}`;
        if (cat) {
          path += `/${slugify(cat.name)}`;
        }
      }
    }
    navigate(path);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !userProfile?.is_admin) return;
    setIsProcessing(true);
    try {
      let type: 'semester' | 'subject' | 'category' = 'semester';
      let parentId: string | null = null;
      if (activeSubject) { type = 'category'; parentId = activeSubject.id; }
      else if (activeSemester) { type = 'subject'; parentId = activeSemester.id; }
      await NexusServer.createFolder(newFolderName, type, parentId, selectedProgram, isShining);
      setNewFolderName('');
      setIsShining(false);
      handleCloseFolder();
      fetchFromSource(false);
    } catch (e: any) { showToast(e.message, 'error'); } finally { setIsProcessing(false); }
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
      await NexusServer.renameFolder(folderToManage, newFolderName.trim(), isShining, folders);
      setNewFolderName('');
      setIsShining(false);
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
    navigate(`${routePrefix}/library/${slugify(userProfile?.program || availablePrograms[0])}`);
  };

  const handleFileAccess = async (file: LibraryFile) => {
    if (!userProfile) {
      showToast("Please login to access documents.", "info");
      onAuthRequired?.();
      return;
    }

    try {
      NexusServer.saveRecord(userProfile?.id || null, 'file_access', `Opened ${file.name}`, { fileId: file.id, fileName: file.name, path: file.storage_path });
      const url = await NexusServer.getFileUrl(file.storage_path);
      if (file.storage_path.toLowerCase().endsWith('.pdf')) {
        setViewerInfo({ show: true, url, name: file.name });
      } else {
        if (url) window.open(url, '_blank');
      }
    } catch (err) {
      console.error("Access Error:", err);
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
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold text-zinc-800 dark:text-white tracking-tight leading-none mb-1 flex items-center">
                {viewMode === 'my-uploads' ? (
                  <>My Vault <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-1.5 mr-1.5">Hub</span></>
                ) : activeSubject ? (
                  <>{activeSubject.name.split(':')[0].trim()} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-1.5 mr-1.5">Notes</span></>
                ) : activeSemester ? (
                  <>{activeSemester.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-1.5 mr-1.5">Hub</span></>
                ) : (
                  <>Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 ml-1.5 mr-1.5">Library</span> Hub</>
                )}
                <div className="relative group ml-2 mb-1">
                  <button className="flex items-center justify-center text-zinc-300 dark:text-white/20 hover:text-orange-500 dark:hover:text-orange-500 bg-transparent border-none transition-colors">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                    </svg>
                  </button>
                  <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-64 p-3 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium whitespace-normal">
                      <span style={{ color: 'var(--brand-primary)' }} className="font-bold block mb-1 uppercase tracking-wider text-[9px]">Disclaimer</span>
                      Resources not explicitly marked as <strong className="text-zinc-800 dark:text-white font-bold">{shortBrandName}</strong> (e.g. {shortBrandName} Originals, {shortBrandName} Official) are crowdsourced (WhatsApp, Telegram, etc.) and not owned by us.
                    </p>
                  </div>
                </div>
              </div>
              {!isAdminView && !searchQuery && viewMode === 'browse' && (
                <nav className="mt-2 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-zinc-400">
                  <button onClick={() => navigateTo(null, null, null)} className="hover:text-orange-500 transition-colors border-none bg-transparent cursor-pointer">Root</button>
                  {activeSemester && <><span className="opacity-30">/</span><button onClick={() => navigateTo(activeSemester, null, null)} className={`border-none bg-transparent cursor-pointer ${!activeSubject ? 'text-orange-500' : 'hover:text-orange-500'}`}>{activeSemester.name}</button></>}
                  {activeSubject && <><span className="opacity-30">/</span><button onClick={() => navigateTo(activeSemester, activeSubject, null)} className={`border-none bg-transparent cursor-pointer ${!activeCategory ? 'text-orange-500' : 'hover:text-orange-500'}`}>{activeSubject.name}</button></>}
                  {activeCategory && <><span className="opacity-30">/</span><span className="text-orange-500">{activeCategory.name}</span></>}
                </nav>
              )}
            </div>
            <div className="flex gap-2">
              {userProfile?.is_admin && (
                <>
                  <button onClick={toggleAdminView} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none ${isAdminView ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-400'}`} title={isAdminView ? "Exit Review Hub" : "Enter Review Hub"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></button>
                  <button onClick={() => { setNewFolderName(''); setShowFolderModal(true); }} className="w-10 h-10 bg-zinc-100 dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center text-orange-500 hover:scale-110 active:scale-95 transition-all shadow-sm border-none" title="Create Folder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M12 5v14M5 12h14" /></svg></button>
                </>
              )}
              <button
                onClick={() => {
                  if (!userProfile) {
                    showToast(`Please login to access ${shortBrandName} Originals.`, "info");
                    onAuthRequired?.();
                    return;
                  }
                  setViewMode('originals'); 
                  navigateTo(null, null, null); 
                  setIsAdminView(false); 
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-400 hover:text-orange-500"
                title={`${shortBrandName} Originals`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </button>
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
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none ${viewMode === 'my-uploads' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-400 hover:text-orange-500'}`} 
                title={viewMode === 'my-uploads' ? "Exit Vault" : "My Vault"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
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
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold text-[11px] sm:text-xs shadow-lg shadow-orange-500/20 border-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  Contribute {pendingUploads.length > 0 && `(${pendingUploads.length})`}
                </button>
            </div>
          </header>

          <div className="flex gap-2 w-full flex-row items-center">
            <NexusDropdown
              options={availablePrograms}
              value={selectedProgram}
              onChange={(val) => {
                navigate(`${routePrefix}/library/${slugify(val)}`);
              }}
              className="flex-shrink-0"
              buttonClassName="!h-12 !py-0 !rounded-2xl !min-w-[110px] sm:!min-w-[180px] !px-3 sm:!px-5 text-[10px] sm:text-xs"
            />

            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                placeholder="Filter files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-11 pr-4 h-12 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl text-[11px] sm:text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
              />
            </div>
            <button onClick={() => fetchFromSource(true)} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-[#0a0a0a] rounded-xl text-zinc-400 hover:text-orange-500 transition-colors shadow-sm border-none" title="Refresh List"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg></button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="relative">
              <DndContext

                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex flex-col gap-6">
                  {/* Subject Details Header & Syllabus Accordion removed */}

                  {currentFolders.length > 0 && (
                    <SortableContext
                      items={currentFolders.map(f => f.id)}
                      strategy={rectSortingStrategy}
                      disabled={!userProfile?.is_admin}
                    >
                      {selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'btechcse' && activeSemester && !activeSubject ? (
                        <div className="space-y-8 col-span-full">
                          {(() => {
                            const groups: { name: string; items: Folder[] }[] = [];
                            const getGroupName = (f: Folder) => {
                              const meta = findSubjectMetadata(selectedProgram, f.name);
                              if (meta) {
                                if (meta.type === 'CR') return 'Core Courses';
                                const curriculum = BTECH_CSE_2025;
                                const term = curriculum.terms.find(t => t.termName.toLowerCase() === activeSemester.name.toLowerCase());
                                if (term) {
                                  const basket = term.electiveBaskets.find(b => b.subjects.some(s => s.code === meta.code));
                                  if (basket) return basket.name;
                                }
                              }
                              return 'Other / Custom Courses';
                            };

                            currentFolders.forEach(f => {
                              const groupName = getGroupName(f);
                              let group = groups.find(g => g.name === groupName);
                              if (!group) {
                                group = { name: groupName, items: [] };
                                groups.push(group);
                              }
                              group.items.push(f);
                            });

                            groups.sort((a, b) => {
                              if (a.name === 'Core Courses') return -1;
                              if (b.name === 'Core Courses') return 1;
                              if (a.name.includes('Core Elective')) {
                                if (b.name.includes('Core Elective')) return a.name.localeCompare(b.name);
                                return -1;
                              }
                              if (b.name.includes('Core Elective')) return 1;
                              return a.name.localeCompare(b.name);
                            });

                            return groups.map(group => (
                              <div key={group.name} className="space-y-4">
                                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-white/5 pb-2">
                                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{group.name}</div>
                                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 rounded-full text-[9px] font-bold text-zinc-500">{group.items.length} Course{group.items.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                                      onClick={() => {
                                        if (folder.type === 'semester') navigateTo(folder, null, null);
                                        else if (folder.type === 'subject') navigateTo(activeSemester, folder, null);
                                        else if (folder.type === 'category') navigateTo(activeSemester, activeSubject, folder);
                                      }}
                                      onRename={() => {
                                        setFolderToManage(folder);
                                        setNewFolderName(folder.name);
                                        setIsShining(folder.is_shining || false);
                                        setShowRenameModal(true);
                                      }}
                                      onDelete={(e) => handleDeleteFolder(folder, e)}
                                      isDraggingOver={draggingOverId === folder.id}
                                    />
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                              onClick={() => {
                                if (folder.type === 'semester') navigateTo(folder, null, null);
                                else if (folder.type === 'subject') navigateTo(activeSemester, folder, null);
                                else if (folder.type === 'category') navigateTo(activeSemester, activeSubject, folder);
                              }}
                              onRename={() => {
                                setFolderToManage(folder);
                                setNewFolderName(folder.name);
                                setIsShining(folder.is_shining || false);
                                setShowRenameModal(true);
                              }}
                              onDelete={(e) => handleDeleteFolder(folder, e)}
                              isDraggingOver={draggingOverId === folder.id}
                            />
                          ))}
                        </div>
                      )}
                    </SortableContext>
                  )}

                  {displayFiles.length > 0 ? (
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
        showDetailsModal && selectedFile && createPortal(
          <div className={`modal-overlay ${isClosingDetails ? 'closing' : ''}`}
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseDetails(); }}>
            <div ref={modalRef} className={`nexus-modal w-full max-w-lg ${isClosingDetails ? 'closing' : ''}`}>
              <header className="p-6 md:p-8 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-[#0a0a0a]/20 flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-zinc-200 dark:border-white/5">
                      <FileIcon fileName={selectedFile.storage_path} size="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">{selectedFile.name}</h3>
                </div>
                <button onClick={handleCloseDetails} className="p-2 text-white/30 hover:text-white transition-colors border-none bg-transparent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Semester', val: selectedFile.semester },
                    { label: 'Subject', val: selectedFile.subject },
                    { label: 'Category', val: selectedFile.type },
                    { label: 'File Size', val: selectedFile.size }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 mb-1">{item.label}</p>
                      <p className="text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-white">{item.val || 'N/A'}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] sm:text-xs font-medium text-zinc-400">Description</h4>
                  <p className="text-[11px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed italic bg-zinc-50 dark:bg-[#0a0a0a]/5 p-6 rounded-3xl border border-zinc-100 dark:border-white/5">
                    {selectedFile.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between p-6 bg-orange-500/5 border border-orange-500/20 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold text-[11px] sm:text-xs">
                      {selectedFile.uploader_username?.[0] || 'V'}
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs text-orange-500">Uploader</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] sm:text-xs font-medium">@{selectedFile.uploader_username}</p>
                        <VerifiedBadge isAdmin={selectedFile.uploader_is_admin} size="w-3.5 h-3.5" />
                      </div>

                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] sm:text-xs font-medium text-zinc-800 dark:text-white">{new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <footer className="p-6 md:p-8 bg-zinc-50 dark:bg-[#0a0a0a]/20 border-t border-zinc-100 dark:border-white/5 flex gap-4">
                <button onClick={handleCloseDetails} className="flex-1 py-3 text-[11px] sm:text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors">Discard</button>
                {selectedFile.status === 'approved' && (
                  <button onClick={() => { handleCloseDetails(); handleFileAccess(selectedFile); }} className="flex-[2] py-3 bg-orange-500 text-white rounded-xl font-semibold text-[11px] sm:text-xs shadow-xl active:scale-95 transition-all border-none">View Document ↗</button>
                )}
              </footer>
            </div>
          </div>,
          document.getElementById('modal-root') || document.body
        )
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
                
                <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-[#0a0a0a]/40 rounded-xl border border-transparent dark:border-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isShining ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-zinc-200 dark:bg-white/5 text-zinc-400'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Shining Effect</p>
                      <p className="text-[8px] text-zinc-400 font-medium">Adds a continuous shimmer anim</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShining(!isShining)}
                    className={`w-10 h-6 rounded-full relative transition-all duration-300 border-none px-0 ${isShining ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isShining ? 'left-5 shadow-sm' : 'left-1'}`} />
                  </button>
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

                <div className="flex items-center justify-between p-4 bg-zinc-100 dark:bg-[#0a0a0a]/40 rounded-xl border border-transparent dark:border-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isShining ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-zinc-200 dark:bg-white/5 text-zinc-400'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Shining Effect</p>
                      <p className="text-[8px] text-zinc-400 font-medium">Adds a continuous shimmer anim</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsShining(!isShining)}
                    className={`w-10 h-6 rounded-full relative transition-all duration-300 border-none px-0 ${isShining ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isShining ? 'left-5 shadow-sm' : 'left-1'}`} />
                  </button>
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
        viewerInfo.show && (
          <PDFViewer
            url={viewerInfo.url}
            fileName={viewerInfo.name}
            userProfile={userProfile}
            onClose={() => setViewerInfo({ show: false, url: '', name: '' })}
          />
        )
      }
      
    </div>
  );
};

const FolderCard: React.FC<{
  folder: Folder;
  selectedProgram: string;
  userProfile: UserProfile | null;
  fileCount: number;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onRename: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDraggingOver: boolean;
}> = ({ folder, selectedProgram, userProfile, fileCount, onDragOver, onDragLeave, onDrop, onClick, onRename, onDelete, isDraggingOver }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  const isAdmin = userProfile?.is_admin || false;
  const meta = folder.type === 'subject' ? findSubjectMetadata(selectedProgram, folder.name) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDragOver={(e) => { if (!isAdmin) return; e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { if (!isAdmin) return; e.preventDefault(); onDrop(e); }}
      onClick={onClick}
      className={`group p-5 rounded-[30px] border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-center min-h-[140px] ${folder.is_shining ? 'shimmer-wrapper shimmer-effect' : ''} ${isDraggingOver ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-xl z-10' : 'border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 hover:border-orange-500/50 hover:shadow-lg'} ${isDragging ? 'shadow-2xl border-orange-500' : ''}`}
    >
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 bg-zinc-100 dark:bg-[#0a0a0a] rounded-lg text-zinc-300 hover:text-orange-500 cursor-grab active:cursor-grabbing transition-colors shadow-sm"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRename(); }} className="p-1.5 bg-zinc-100 dark:bg-[#0a0a0a] rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-zinc-900 transition-colors shadow-sm border-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button onClick={onDelete} className="p-1.5 bg-zinc-100 dark:bg-[#0a0a0a] rounded-lg text-red-500 hover:bg-red dark:hover:bg-zinc-900 transition-colors shadow-sm border-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between w-full mb-3">
        <FolderIcon type={folder.type} size="w-10 h-10" />
        {meta && (
          <div className="flex flex-col items-end gap-1 z-10">
            <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/5 whitespace-nowrap">
              L:{meta.l} T:{meta.t} P:{meta.p}
            </span>
            <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/5 whitespace-nowrap">
              {meta.credits} Credits
            </span>
          </div>
        )}
      </div>

      <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-zinc-800 dark:text-white tracking-tight leading-tight mt-1 z-10">{folder.name}</div>
      <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1 z-10">
        {fileCount} File{fileCount !== 1 ? 's' : ''}
      </p>
      <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:scale-110 transition-transform"><FolderIcon type={folder.type} size="w-24 h-24" /></div>
    </div>
  );
};

const StaticFolderCard: React.FC<{
  folder: Folder;
  selectedProgram: string;
  fileCount: number;
}> = ({ folder, selectedProgram, fileCount }) => {
  const meta = folder.type === 'subject' ? findSubjectMetadata(selectedProgram, folder.name) : null;
  return (
    <div className={`p-5 rounded-[30px] border border-orange-500 bg-white dark:bg-[#0a0a0a] flex flex-col justify-center min-h-[140px] relative overflow-hidden ${folder.is_shining ? 'shimmer-wrapper shimmer-effect' : ''}`}>
      <div className="flex items-center justify-between w-full mb-3">
        <FolderIcon type={folder.type} size="w-10 h-10" />
        {meta && (
          <div className="flex flex-col items-end gap-1">
            <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/5 whitespace-nowrap">
              L:{meta.l} T:{meta.t} P:{meta.p}
            </span>
            <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-semibold bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-white/5 whitespace-nowrap">
              {meta.credits} Credits
            </span>
          </div>
        )}
      </div>

      <div className="text-[11px] sm:text-xs md:text-sm font-semibold text-zinc-800 dark:text-white tracking-tight leading-tight mt-1">{folder.name}</div>
      <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-1">
        {fileCount} File{fileCount !== 1 ? 's' : ''}
      </p>
      <div className="absolute -right-2 -bottom-2 opacity-5"><FolderIcon type={folder.type} size="w-24 h-24" /></div>
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onShowDetails}
      className={`group p-4 rounded-[30px] border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a] hover:border-orange-500 hover:shadow-xl transition-all relative overflow-hidden flex flex-col min-h-[140px] cursor-pointer ${isDragging ? 'shadow-2xl border-orange-500 ring-2 ring-orange-500/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 bg-zinc-100 dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center transition-colors">
          <FileIcon fileName={file.storage_path} size="w-5 h-5" className="group-hover:scale-110 transition-transform" />
        </div>
        {isAdmin && (
          <div
            {...attributes}
            {...listeners}
            className="p-2 -mr-2 text-zinc-300 hover:text-orange-500 cursor-grab active:cursor-grabbing transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
        )}
      </div>
      <div className="text-[11px] md:text-[13px] font-semibold text-zinc-800 dark:text-white tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">{file.name}</div>
      <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500">{file.size}</span>
        <div className="flex gap-1.5 peer">
          {isAdminMode ? (
            <div className="flex gap-1.5">
              {file.status !== 'approved' && (
                <button onClick={(e) => { e.stopPropagation(); onApprove?.(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-emerald-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all border-none" title="Approve">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Edit Metadata">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-blue-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white transition-all border-none" title="View Document">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              </button>
              {file.status === 'approved' ? (
                <button onClick={(e) => { e.stopPropagation(); onDemote?.(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Demote to Pending">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onReject?.(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all border-none" title="Reject & Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          ) : isAdmin ? (
            <div className="flex gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-orange-500 hover:text-white transition-all border-none" title="Edit Metadata"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all border-none" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="w-8 h-8 bg-zinc-100 dark:bg-[#0a0a0a] text-emerald-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-all border-none" title="Access File"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onAccess(); }} className="bg-zinc-100 dark:bg-[#0a0a0a] text-orange-500 px-4 py-1.5 rounded-xl font-medium text-[11px] sm:text-xs flex items-center gap-1.5 hover:bg-orange-500 hover:text-white transition-all shadow-md border-none">Access <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
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
  return (
    <div className="p-4 rounded-[30px] border border-orange-500 bg-white dark:bg-[#0a0a0a] flex flex-col min-h-[140px]">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 bg-zinc-100 dark:bg-[#0a0a0a] rounded-xl flex items-center justify-center">
          <FileIcon fileName={file.storage_path} size="w-5 h-5" />
        </div>
        {isAdmin && (
          <div className="p-2 -mr-2 text-orange-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
          </div>
        )}
      </div>
      <div className="text-[11px] md:text-[13px] font-semibold text-zinc-800 dark:text-white tracking-tight leading-tight line-clamp-2 mb-2">{file.name}</div>
      <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500">{file.size}</span>
      </div>
    </div>
  );
};

export default ContentLibrary;
