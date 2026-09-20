import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import NexusServer from '../services/nexusServer.ts';
import { UserProfile } from '../types.ts';
import { extractAttendanceWithTesseract } from '../services/ocrService.ts';
import { toast } from './Toast.tsx';

interface Subject {
  id: string;
  name: string;
  present: number;
  total: number;
  dutyLeaves?: number;
  goal: number;
  archived?: boolean;
}

interface HistoryItem {
  id: string;
  type: 'present' | 'absent' | 'duty';
  prevPresent: number;
  prevTotal: number;
  prevDutyLeaves: number;
  timestamp: number;
}

const SubjectSkeleton = () => (
  <div className="p-5 rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] shadow-xs animate-pulse min-h-[160px] space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-1.5 flex-1">
        <div className="h-5 w-28 bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
        <div className="h-4 w-16 bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
      </div>
      <div className="h-8 w-16 bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
    </div>
    <div className="h-1.5 w-full bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
    <div className="grid grid-cols-3 gap-2">
      <div className="h-8.5 bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
      <div className="h-8.5 bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
      <div className="h-8.5 bg-zinc-200 dark:bg-white/5 rounded-full shimmer" />
    </div>
  </div>
);

interface Props {
  userProfile?: UserProfile | null;
  hideHeader?: boolean;
  onBack?: () => void;
}

const AttendanceTracker: React.FC<Props> = ({ userProfile, hideHeader, onBack }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_attendance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubjects(parsed.map((s: any) => ({
          ...s,
          dutyLeaves: s.dutyLeaves || 0,
          goal: s.goal || 75,
          archived: !!s.archived
        })));
      } catch (e) {
        setSubjects([]);
      }
    }
    const timer = setTimeout(() => setIsInitializing(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setEditingSubject(null);
      setIsClosing(false);
    }, 250);
  };

  const [wipingAll, setWipingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newSub, setNewSub] = useState({
    name: '',
    present: '0',
    total: '0',
    dutyLeaves: '0',
    goal: '75'
  });

  const editModalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for modals to center them
  useEffect(() => {
    if (isEditModalOpen) {
      editModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('nexus_attendance', JSON.stringify(subjects));
    }
  }, [subjects, isInitializing]);
  const addSubject = () => {
    if (!newSub.name.trim()) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    const present = parseInt(newSub.present) || 0;
    const total = parseInt(newSub.total) || 0;
    const dutyLeaves = parseInt(newSub.dutyLeaves) || 0;
    const goal = parseInt(newSub.goal) || 75;

    setSubjects(prev => {
      const existingIndex = prev.findIndex(s => s.name.toLowerCase() === newSub.name.toLowerCase());
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          present: Math.min(present, total),
          total: total,
          dutyLeaves: dutyLeaves,
          goal: goal,
          archived: false
        };
        return updated;
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name: newSub.name,
        present: Math.min(present, total),
        total: total,
        dutyLeaves: dutyLeaves,
        goal: goal,
        archived: false
      }];
    });

    // Tracking
    if (userProfile?.id) {
      NexusServer.saveRecord(userProfile.id, 'attendance_update', `Updated/Added subject: ${newSub.name}`, { name: newSub.name, present, total });
    }

    setNewSub({ name: '', present: '0', total: '0', dutyLeaves: '0', goal: '75' });
  };

  const [ocrProgress, setOcrProgress] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processAllFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsAiProcessing(true);
    let totalExtracted = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setProcessingIndex(i);
        const file = selectedFiles[i];

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        const extracted = await extractAttendanceWithTesseract(base64, (progress) => {
          setOcrProgress(Math.round(progress * 100));
        });

        if (extracted && Array.isArray(extracted)) {
          totalExtracted += extracted.length;
          const newSubjects = extracted.map(item => ({
            id: Math.random().toString(36).substr(2, 9),
            name: item.name,
            present: item.present,
            total: item.total,
            dutyLeaves: item.dutyLeaves || 0,
            goal: 75,
            archived: false
          }));

          setSubjects(prev => {
            const updated = [...prev];
            newSubjects.forEach(newSub => {
              const existingIndex = updated.findIndex(s => s.name.toLowerCase() === newSub.name.toLowerCase());
              if (existingIndex !== -1) {
                // Update existing record with latest OCR data
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  present: newSub.present,
                  total: newSub.total,
                  dutyLeaves: newSub.dutyLeaves || updated[existingIndex].dutyLeaves,
                  archived: false // Bring back to active if it was archived
                };
              } else {
                // Add as new subject
                updated.push(newSub);
              }
            });
            return updated;
          });
        }
      }

      if (totalExtracted > 0) {
        toast.success(`Successfully processed ${selectedFiles.length} images!`);
        setIsUploadModalOpen(false);
        setSelectedFiles([]);
      } else {
        toast.info("No new subjects found in the screenshots.");
      }
    } catch (err: any) {
      console.error("Batch OCR Error:", err);
      toast.error(err.message || "Failed to process one or more images.");
    } finally {
      setIsAiProcessing(false);
      setOcrProgress(0);
      setProcessingIndex(-1);
    }
  };

  const handleEdit = (sub: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject({ ...sub });
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingSubject) return;
    setSubjects(prev => prev.map(s => s.id === editingSubject.id ? editingSubject : s));
    setIsEditModalOpen(false);
    setEditingSubject(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const executeDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) {
      setSubjects(prev => prev.filter(s => s.id !== deletingId));
      setHistory(prev => prev.filter(h => h.id !== deletingId));
      setDeletingId(null);
    }
  };

  const toggleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, archived: !s.archived } : s));
  };

  const executeClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubjects([]);
    setHistory([]);
    setWipingAll(false);
  };

  const updateAttendance = (id: string, type: 'present' | 'absent' | 'duty', e: React.MouseEvent) => {
    e.stopPropagation();
    setSubjects(prevSubjects => {
      const subject = prevSubjects.find(s => s.id === id);
      if (subject) {
        setHistory(prev => [{
          id,
          type,
          prevPresent: subject.present,
          prevTotal: subject.total,
          prevDutyLeaves: subject.dutyLeaves || 0,
          timestamp: Date.now()
        }, ...prev].slice(0, 50));
      }

      return prevSubjects.map(s => {
        if (s.id === id) {
          if (type === 'duty') {
            return {
              ...s,
              dutyLeaves: (s.dutyLeaves || 0) + 1
            };
          }
          return {
            ...s,
            present: type === 'present' ? s.present + 1 : s.present,
            total: s.total + 1
          };
        }
        return s;
      });
    });

    // Tracking
    if (userProfile?.id) {
      const sub = subjects.find(s => s.id === id);
      NexusServer.saveRecord(userProfile.id, 'attendance_update', `Marked ${type} for ${sub?.name || 'subject'}`, { subjectId: id, type });
    }
  };

  const undoSubjectLastAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const actionIndex = history.findIndex(h => h.id === id);
    if (actionIndex === -1) return;

    const action = history[actionIndex];

    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          present: action.prevPresent,
          total: action.prevTotal,
          dutyLeaves: action.prevDutyLeaves
        };
      }
      return s;
    }));

    setHistory(prev => prev.filter((_, idx) => idx !== actionIndex));
  };

  const calculateStats = (s: Subject) => {
    const goal = s.goal || 75;
    const effectivePresent = Math.min(s.present + (s.dutyLeaves || 0), s.total);
    const percentage = s.total === 0 ? 0 : (effectivePresent / s.total) * 100;

    let needed = 0;
    if (percentage < goal && goal < 100) {
      needed = Math.ceil(((goal / 100) * s.total - effectivePresent) / (1 - (goal / 100)));
    } else if (percentage < goal && goal === 100) {
      needed = 999;
    }

    let skippable = 0;
    if (percentage >= goal && goal > 0) {
      skippable = Math.floor((100 * effectivePresent - goal * s.total) / goal);
    } else if (percentage >= goal && goal === 0) {
      skippable = 999;
    }

    return { percentage, needed, skippable, goal, effectivePresent };
  };

  const filteredSubjects = subjects.filter(s => showArchived ? s.archived : !s.archived);

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-24 px-2 md:px-0">
      <header className="flex flex-row items-center justify-between gap-4 pb-2 w-full text-left">
        {!hideHeader && (
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200/60 dark:hover:bg-white/10 border border-zinc-200/30 dark:border-white/[0.03] transition-all cursor-pointer shrink-0 active:scale-95"
                title="Back to Hub"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                Attendance <span className="text-orange-500">Tracker</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                Log and monitor your daily course attendance
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {subjects.length > 0 && (
            <div className="relative">
              {wipingAll ? (
                <div className="flex items-center bg-red-500/10 border border-red-500/20 rounded-full overflow-hidden animate-fade-in h-9 p-0.5">
                  <button
                    onClick={() => setWipingAll(false)}
                    className="px-3.5 h-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeClearAll}
                    className="px-3.5 h-full bg-red-500 text-white font-semibold text-xs transition-colors border-none cursor-pointer rounded-full shadow-xs active:scale-95"
                  >
                    Clear All?
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setWipingAll(true); }}
                  className="h-9 px-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
                  title="Clear all subjects"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`h-9 px-4 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs ${
              showArchived
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border-zinc-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08]'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>{showArchived ? 'Active' : 'Archived'}</span>
          </button>
        </div>
      </header>

      {/* Input Card */}
      <div className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 items-end">
          <div className="col-span-2 md:col-span-4">
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">
              Subject Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CSE408"
              value={newSub.name}
              onChange={(e) => {
                setNewSub({ ...newSub, name: e.target.value });
                if (showValidation) setShowValidation(false);
              }}
              className={`w-full h-9 bg-zinc-100/70 dark:bg-white/[0.04] border rounded-full px-4 text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all ${
                showValidation && !newSub.name.trim()
                  ? 'border-red-500/50'
                  : 'border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30'
              }`}
            />
          </div>

          <div className="col-span-2 md:col-span-3">
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">
              Present / Total
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="P"
                value={newSub.present}
                onChange={(e) => setNewSub({ ...newSub, present: e.target.value })}
                className="w-full h-9 bg-zinc-100/70 dark:bg-white/[0.04] border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 rounded-full px-3 text-center text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
              />
              <span className="text-zinc-400 text-xs font-bold">/</span>
              <input
                type="number"
                placeholder="T"
                value={newSub.total}
                onChange={(e) => setNewSub({ ...newSub, total: e.target.value })}
                className="w-full h-9 bg-zinc-100/70 dark:bg-white/[0.04] border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 rounded-full px-3 text-center text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-1">
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1 truncate">
              DL
            </label>
            <input
              type="number"
              placeholder="0"
              value={newSub.dutyLeaves}
              onChange={(e) => setNewSub({ ...newSub, dutyLeaves: e.target.value })}
              className="w-full h-9 bg-zinc-100/70 dark:bg-white/[0.04] border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 rounded-full px-2 text-center text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
            />
          </div>

          <div className="col-span-1 md:col-span-1">
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1 truncate">
              Goal
            </label>
            <input
              type="number"
              placeholder="75"
              value={newSub.goal}
              onChange={(e) => setNewSub({ ...newSub, goal: e.target.value })}
              className="w-full h-9 bg-zinc-100/70 dark:bg-white/[0.04] border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 rounded-full px-2 text-center text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
            />
          </div>

          <div className="col-span-2 md:col-span-3 flex items-center gap-2">
            <button
              onClick={addSubject}
              className="flex-1 h-9 px-5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              Track
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border border-zinc-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08] rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              title="Upload Timetable / Attendance Sheet"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>

      {isInitializing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SubjectSkeleton />
          <SubjectSkeleton />
          <SubjectSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-0">
          {filteredSubjects.map((sub) => {
            const { percentage, needed, skippable, goal } = calculateStats(sub);
            const isBelowGoal = percentage < goal;
            const accentColor = isBelowGoal ? 'text-orange-500' : 'text-emerald-500';
            const accentBg = isBelowGoal ? 'bg-orange-500/10' : 'bg-emerald-500/10';
            const accentBorder = isBelowGoal ? 'border-orange-500/20' : 'border-emerald-500/20';
            const hasHistory = history.some(h => h.id === sub.id);
            const isDeleting = deletingId === sub.id;

            return (
              <div
                key={sub.id}
                className={`
                  p-5 rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] shadow-xs flex flex-col justify-between transition-all hover:border-zinc-300 dark:hover:border-white/10
                  ${isDeleting ? 'ring-2 ring-red-500/50 scale-[0.99]' : ''}
                `}
              >
                {/* Top Section: Name and Percentage */}
                <div className="flex justify-between items-start mb-3 min-w-0">
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200/40 dark:border-white/[0.06] px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        {sub.present}{sub.dutyLeaves ? `+${sub.dutyLeaves}` : ''} / {sub.total}
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full ${accentBg} border ${accentBorder} shrink-0`}>
                    <span className={`${accentColor} text-xs sm:text-sm font-bold tracking-tight tabular-nums`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 text-[10px] font-medium text-zinc-400">
                    <span>Progress</span>
                    <span>Goal: {sub.goal}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-white/[0.06] rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        !isBelowGoal ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {!showArchived && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'present', e)}
                      className="h-8.5 px-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-emerald-500"><path d="M20 6L9 17l-5-5" /></svg>
                      <span>Present</span>
                    </button>
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'duty', e)}
                      className="h-8.5 px-3 rounded-full bg-orange-500/10 hover:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>+DL</span>
                    </button>
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'absent', e)}
                      className="h-8.5 px-3 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200/70 dark:hover:bg-white/[0.1] border border-zinc-200/60 dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 font-semibold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>Absent</span>
                    </button>
                  </div>
                )}

                {/* Footer Analysis */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-white/[0.04]">
                  <div className={`
                    px-3 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 border
                    ${isBelowGoal ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBelowGoal ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                    {isBelowGoal ? (
                      <span>{needed >= 999 ? '∞' : needed} more needed</span>
                    ) : (
                      <span>{skippable >= 999 ? '∞' : skippable} safe skips</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isDeleting ? (
                      <div className="flex items-center gap-1.5 animate-fade-in">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                          className="h-6 px-2.5 bg-zinc-100 dark:bg-white/5 text-[10px] font-medium text-zinc-400 rounded-full hover:text-white transition-colors cursor-pointer active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={executeDelete}
                          className="h-6 px-2.5 bg-red-500 text-[10px] font-semibold text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {hasHistory && (
                          <button
                            onClick={(e) => undoSubjectLastAction(sub.id, e)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                            title="Undo"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M3 10h10a5 5 0 0 1 0 10H11" /><polyline points="8 5 3 10 8 15" /></svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEdit(sub, e)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={(e) => confirmDelete(sub.id, e)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer active:scale-95"
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isInitializing && filteredSubjects.length === 0 && (
        <div className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] py-16 px-4 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            {showArchived ? 'Archive is empty' : 'No subjects added yet'}
          </p>
          <p className="text-[11px] text-zinc-400 font-medium">
            {showArchived ? 'Archived subjects will appear here.' : 'Add a subject above or upload a screenshot to track your attendance.'}
          </p>
        </div>
      )}

      {isEditModalOpen && editingSubject && createPortal(
        <div
          className={`modal-overlay ${isClosing ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div ref={editModalRef} className={`bg-white dark:bg-[#151518] rounded-3xl w-full max-w-sm shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-zinc-200/50 dark:border-white/[0.08] relative overflow-hidden flex flex-col animate-slide-up ${isClosing ? 'closing' : ''}`}>
            <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-white/[0.06] relative flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Modify Entry</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-0.5">Update subject details</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer border-none"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Subject Name</label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full h-10 bg-zinc-100/70 dark:bg-white/[0.04] px-4 rounded-full text-xs font-semibold outline-none border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Present</label>
                  <input
                    type="number"
                    value={editingSubject.present}
                    onChange={(e) => setEditingSubject({ ...editingSubject, present: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 bg-zinc-100/70 dark:bg-white/[0.04] px-3 rounded-full text-xs font-semibold outline-none border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 text-zinc-900 dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Total</label>
                  <input
                    type="number"
                    value={editingSubject.total}
                    onChange={(e) => setEditingSubject({ ...editingSubject, total: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 bg-zinc-100/70 dark:bg-white/[0.04] px-3 rounded-full text-xs font-semibold outline-none border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 text-zinc-900 dark:text-white text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Duty Leaves</label>
                  <input
                    type="number"
                    value={editingSubject.dutyLeaves || 0}
                    onChange={(e) => setEditingSubject({ ...editingSubject, dutyLeaves: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 bg-zinc-100/70 dark:bg-white/[0.04] px-3 rounded-full text-xs font-semibold outline-none border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 text-zinc-900 dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Target (%)</label>
                  <input
                    type="number"
                    value={editingSubject.goal}
                    onChange={(e) => setEditingSubject({ ...editingSubject, goal: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 bg-zinc-100/70 dark:bg-white/[0.04] px-3 rounded-full text-xs font-semibold outline-none border border-zinc-200/40 dark:border-white/[0.06] focus:border-zinc-400 dark:focus:border-white/30 text-zinc-900 dark:text-white text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-10 rounded-full text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="flex-[2] h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold text-xs shadow-xs active:scale-95 transition-all border-none cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
      {isUploadModalOpen && createPortal(
        <div
          className={`modal-overlay ${isAiProcessing ? '' : (isClosing ? 'closing' : '')}`}
          style={{ backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !isAiProcessing) setIsUploadModalOpen(false); }}
        >
          <div className={`bg-white dark:bg-[#151518] rounded-3xl w-full max-w-lg shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-zinc-200/50 dark:border-white/[0.08] relative overflow-hidden flex flex-col animate-slide-up ${isClosing ? 'closing' : ''}`}>
            <div className="p-6 border-b border-zinc-100 dark:border-white/[0.06] relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Smart Batch Upload</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mt-0.5">Extract attendance from screenshots instantly</p>
                </div>
              </div>
              {!isAiProcessing && (
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer border-none"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
                className={`
                  relative border border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center gap-3
                  ${dragActive ? 'border-orange-500 bg-orange-500/5 scale-[0.99]' : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]'}
                  ${isAiProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  accept="image/*"
                  className="hidden"
                />

                <div className="w-12 h-12 bg-zinc-100 dark:bg-white/[0.06] rounded-full flex items-center justify-center text-zinc-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>

                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-zinc-800 dark:text-white">Drag & drop screenshots</p>
                  <p className="text-[11px] text-zinc-400 font-medium">LPU portal attendance reports work best</p>
                </div>

                {!isAiProcessing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 px-5 h-8.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-xs active:scale-95 transition-all border-none cursor-pointer"
                  >
                    Browse Files
                  </button>
                )}
              </div>

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                      Queue ({selectedFiles.length})
                    </p>
                    {selectedFiles.length > 0 && !isAiProcessing && (
                      <button onClick={() => setSelectedFiles([])} className="text-[11px] font-semibold text-red-500 hover:underline bg-transparent border-none p-0 cursor-pointer">Clear Queue</button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-200/60 dark:border-white/10 shadow-xs">
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                        {!isAiProcessing && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="absolute top-1 right-1 bg-black/70 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </button>
                        )}
                        {processingIndex === idx && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {processingIndex > idx && (
                          <div className="absolute inset-0 bg-emerald-500/60 flex items-center justify-center backdrop-blur-[2px]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-5 h-5 text-white"><path d="M20 6L9 17l-5-5" /></svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress and Submit */}
              {isAiProcessing ? (
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <p className="font-semibold text-zinc-800 dark:text-white">Scanning {processingIndex + 1} of {selectedFiles.length}</p>
                    <p className="font-bold text-orange-500">{ocrProgress}%</p>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  disabled={selectedFiles.length === 0}
                  onClick={processAllFiles}
                  className={`
                    w-full h-11 rounded-full font-bold text-xs tracking-wide transition-all shadow-xs active:scale-95 border-none flex items-center justify-center gap-2 cursor-pointer
                    ${selectedFiles.length > 0 ? 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 cursor-not-allowed'}
                  `}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  <span>Process All Screenshots</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default AttendanceTracker;
