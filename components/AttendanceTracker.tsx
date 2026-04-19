import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import NexusServer from '../services/nexusServer.ts';
import { UserProfile } from '../types.ts';

import { showToast } from './Toast.tsx';

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
  <div className="glass-panel p-5 md:p-8 rounded-[32px] md:rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 animate-pulse min-h-[160px]">
    <div className="flex flex-col items-center mb-6">
      <div className="h-10 w-24 bg-zinc-200 dark:bg-white/5 rounded-[22px] mb-3 shimmer" />
      <div className="h-6 w-32 bg-zinc-200 dark:bg-white/5 rounded shimmer" />
    </div>
    <div className="h-3 w-full bg-zinc-200 dark:bg-white/5 rounded-full mb-8 shimmer" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-12 bg-zinc-200 dark:bg-white/5 rounded-[22px] shimmer" />
      <div className="h-12 bg-zinc-200 dark:bg-white/5 rounded-[22px] shimmer" />
    </div>
  </div>
);

interface Props {
  userProfile?: UserProfile | null;
  hideHeader?: boolean;
}

const AttendanceTracker: React.FC<Props> = ({ userProfile, hideHeader }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

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

  const handleCloseSync = () => {
    setIsClosingSync(true);
    setTimeout(() => {
      setIsSyncModalOpen(false);
      setIsClosingSync(false);
    }, 250);
  };

  const handleUMSInit = async () => {
    if (!umsUsername) {
      showToast("Please enter your Registration Number.", "info");
      return;
    }

    setIsSyncing(true);
    setSyncStatus("Initializing UMS Connection...");

    try {
      const response = await fetch('/api/ums/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init' })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Initialization failed");

      setCaptchaImage(result.captchaImage);
      setSyncHiddenFields(result.hiddenFields);
      setSyncCookies(result.cookies);
      setCaptchaInputName(result.captchaInputName);
      setSyncStep(1);
    } catch (err: any) {
      showToast(err.message || "Failed to reach UMS portal.", "error");
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const handleUMSSync = async () => {
    if (!umsPassword || !captchaCode) {
      showToast("Please enter Password & Captcha.", "info");
      return;
    }

    setIsSyncing(true);
    setSyncStep(2);
    setSyncStatus('Authenticating & Syncing...');

    try {
      const response = await fetch('/api/ums/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync',
          username: umsUsername, 
          password: umsPassword,
          captchaCode,
          hiddenFields: syncHiddenFields,
          cookies: syncCookies,
          captchaInputName
        })
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.error === 'Invalid Captcha') {
          showToast("Incorrect Captcha. Try again.", "error");
          setCaptchaCode('');
          handleUMSInit();
          return;
        }
        throw new Error(result.error || 'Sync failed');
      }

      const { attendance } = result.data;
      
      setSubjects(attendance);
      localStorage.setItem('nexus_attendance', JSON.stringify(attendance));

      handleCloseSync();
      setUmsPassword('');
      setCaptchaCode('');
      setSyncStep(0);
      showToast('Attendance synced successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to sync with UMS.', 'error');
      setSyncStep(0);
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
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

  // UMS Sync State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isClosingSync, setIsClosingSync] = useState(false);
  const [umsUsername, setUmsUsername] = useState('');
  const [umsPassword, setUmsPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // UMS Sync Multi-step states
  const [syncStep, setSyncStep] = useState<0 | 1 | 2>(0);
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [syncHiddenFields, setSyncHiddenFields] = useState<any>(null);
  const [syncCookies, setSyncCookies] = useState<string | null>(null);
  const [captchaInputName, setCaptchaInputName] = useState<string>('');

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

    setSubjects(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 11),
      name: newSub.name,
      present: Math.min(present, total),
      total: total,
      dutyLeaves: dutyLeaves,
      goal: goal,
      archived: false
    }]);

    // Tracking
    if (userProfile?.id) {
      NexusServer.saveRecord(userProfile.id, 'attendance_update', `Added subject: ${newSub.name}`, { name: newSub.name, present, total });
    }

    setNewSub({ name: '', present: '0', total: '0', dutyLeaves: '0', goal: '75' });
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
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-24 px-4 md:px-0">
      <header className={`flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 ${hideHeader ? 'mb-4' : ''}`}>
        {!hideHeader ? (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Tracker</span></h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm font-medium tracking-tight">Keep track of your classes and attendance.</p>
          </div>
        ) : <div />}

        <div className="flex flex-wrap items-center gap-2 ml-auto md:ml-0">
          {subjects.length > 0 && (
            <div className="relative">
              {wipingAll ? (
                <div className="flex items-center bg-brand-secondary rounded-xl overflow-hidden shadow-lg animate-fade-in">
                  <button
                    onClick={() => setWipingAll(false)}
                    className="px-2 md:px-3 py-1.5 md:py-2 text-[10px] font-bold text-white/70 hover:text-white"
                  >
                    No
                  </button>
                  <button
                    onClick={executeClearAll}
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-brand-secondary font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50"
                  >
                    Wipe?
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setWipingAll(true); }}
                  className="flex items-center space-x-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-zinc-100 dark:bg-[#0a0a0a] rounded-xl text-[10px] md:text-xs font-bold text-brand-secondary hover:bg-brand-secondary hover:text-white transition-all shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 md:w-3.5 h-3 md:h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl text-[10px] md:text-xs font-black text-white transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 md:w-3.5 h-3 md:h-3.5"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
            <span>Sync with UMS</span>
          </button>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-sm ${showArchived ? 'bg-brand-primary text-white' : 'bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-600 dark:text-zinc-400'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 md:w-3.5 h-3 md:h-3.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            <span>{showArchived ? 'Active' : 'Archived'}</span>
          </button>
        </div>
      </header>

      <div className="glass-panel p-4 md:p-8 rounded-[24px] md:rounded-[40px] bg-white dark:bg-[#0a0a0a]/50 border border-zinc-200 dark:border-white/5 shadow-xl relative z-0">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-5 items-end">
          <div className="col-span-2 md:col-span-3">
            <label className="block text-[10px] md:text-xs font-medium text-zinc-400 mb-1 ml-1">
              Subject Name <span className="text-brand-secondary">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CSE408"
              value={newSub.name}
              onChange={(e) => {
                setNewSub({ ...newSub, name: e.target.value });
                if (showValidation) setShowValidation(false);
              }}
              className={`w-full bg-zinc-100 dark:bg-[#0a0a0a] border rounded-xl md:rounded-2xl px-4 py-2.5 md:py-4 text-zinc-800 dark:text-white outline-none transition-all font-bold text-xs md:text-sm shadow-inner ${showValidation && !newSub.name.trim()
                ? 'border-brand-secondary ring-2 ring-brand-secondary/20'
                : 'border-transparent focus:ring-2 focus:ring-brand-primary'
                }`}
            />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className="block text-[10px] md:text-xs font-medium text-zinc-400 mb-1 ml-1">Present / Total</label>
            <div className="flex items-center space-x-2">
              <input
                type="number" placeholder="P" value={newSub.present}
                onChange={(e) => setNewSub({ ...newSub, present: e.target.value })}
                className="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-transparent rounded-xl md:rounded-2xl px-2 py-2.5 md:py-4 text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary transition-all text-xs md:text-sm text-center font-bold shadow-inner"
              />
              <span className="text-zinc-400 font-black">/</span>
              <input
                type="number" placeholder="T" value={newSub.total}
                onChange={(e) => setNewSub({ ...newSub, total: e.target.value })}
                className="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-transparent rounded-xl md:rounded-2xl px-2 py-2.5 md:py-4 text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary transition-all text-xs md:text-sm text-center font-bold shadow-inner"
              />
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] md:text-xs font-medium text-zinc-400 mb-1 ml-1">Initial DL</label>
            <input
              type="number" placeholder="0" value={newSub.dutyLeaves}
              onChange={(e) => setNewSub({ ...newSub, dutyLeaves: e.target.value })}
              className="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-transparent rounded-xl md:rounded-2xl px-4 py-2.5 md:py-4 text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary transition-all text-xs md:text-sm text-center font-bold shadow-inner"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] md:text-xs font-medium text-zinc-400 mb-1 ml-1">Goal %</label>
            <input
              type="number" placeholder="75" value={newSub.goal}
              onChange={(e) => setNewSub({ ...newSub, goal: e.target.value })}
              className="w-full bg-zinc-100 dark:bg-[#0a0a0a] border border-transparent rounded-xl md:rounded-2xl px-4 py-2.5 md:py-4 text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-primary transition-all text-xs md:text-sm text-center font-bold shadow-inner"
            />
          </div>
          <div className="col-span-2 md:col-span-2">
            <button
              onClick={addSubject}
              className="w-full bg-brand-primary hover:opacity-90 text-white py-3 md:py-[1.15rem] rounded-xl md:rounded-2xl font-bold text-xs md:text-[13px] tracking-tight transition-all shadow-xl shadow-brand-primary/20 active:scale-95 flex items-center justify-center whitespace-nowrap"
            >
              Track Subject
            </button>
          </div>
        </div>
      </div>

      {isInitializing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <SubjectSkeleton />
          <SubjectSkeleton />
          <SubjectSkeleton />
          <SubjectSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 relative z-0">
          {filteredSubjects.map((sub) => {
            const { percentage, needed, skippable, goal } = calculateStats(sub);
            const isBelowGoal = percentage < goal;
            const accentColor = isBelowGoal ? 'text-brand-secondary' : 'text-emerald-500';
            const accentBg = isBelowGoal ? 'bg-brand-secondary/10' : 'bg-emerald-500/10';
            const hasHistory = history.some(h => h.id === sub.id);
            const isDeleting = deletingId === sub.id;

            return (
              <div
                key={sub.id}
                className={`
                  glass-panel p-3 sm:p-4 md:p-5 rounded-[20px] md:rounded-[28px] border transition-all duration-500 group relative overflow-hidden flex flex-col
                  border-zinc-200 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  bg-white/80 dark:bg-[#0a0a0a]/60 backdrop-blur-xl
                  ${isDeleting ? 'ring-4 ring-brand-secondary/20 border-brand-secondary scale-[0.98]' : ''}
                `}
              >
                {/* Top Section: Name and Percentage */}
                <div className="flex justify-between items-start mb-2.5">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base md:text-xl font-semibold text-zinc-800 dark:text-white tracking-tight truncate max-w-[70px] sm:max-w-none">
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-medium text-zinc-500">
                        {sub.present}{sub.dutyLeaves ? `+${sub.dutyLeaves}` : ''}/{sub.total} S
                      </span>
                    </div>
                  </div>

                  <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl ${accentBg} border border-transparent group-hover:border-current/10 transition-all`}>
                    <span className={`${accentColor} text-sm sm:text-base md:text-xl font-semibold tracking-tight`}>
                      {percentage.toFixed(1)}
                      <span className="text-[10px] sm:text-xs opacity-60 ml-0.5 font-medium">%</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <p className="text-[11px] sm:text-xs font-semibold text-zinc-400">Progress</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-brand-primary">Goal: {sub.goal}%</p>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                    {/* Goal Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-brand-primary/30 z-20 backdrop-blur-md"
                      style={{ left: `${goal}%` }}
                    />

                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${!isBelowGoal
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-brand-gradient opacity-80'
                        }`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer -skew-x-12 translate-x-[-100%]" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!showArchived && (
                  <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'present', e)}
                      className="group/btn h-8 bg-white dark:bg-white text-black rounded-full font-semibold text-[11px] sm:text-xs hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-1.5 border-none px-2 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5 text-emerald-600"><path d="M20 6L9 17l-5-5" /></svg>
                      Present
                    </button>
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'duty', e)}
                      className="group/btn h-8 bg-brand-primary/10 text-brand-primary rounded-full font-semibold text-[11px] sm:text-xs hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-1.5 border border-brand-primary/20 px-2 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      DL
                    </button>
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'absent', e)}
                      className="group/btn h-8 bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-full font-semibold text-[11px] sm:text-xs hover:bg-zinc-100 dark:hover:bg-white/10 hover:scale-[1.05] active:scale-[0.95] transition-all border border-zinc-200/50 dark:border-white/10 flex items-center justify-center gap-1.5 px-2 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5 opacity-50"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      Absent
                    </button>
                  </div>
                )}

                {/* Footer Analysis */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                  <div className={`
                    px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-2
                    ${isBelowGoal ? 'bg-brand-secondary/5 text-brand-secondary' : 'bg-emerald-500/5 text-emerald-500'}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBelowGoal ? 'bg-brand-secondary' : 'bg-emerald-500'} animate-pulse`} />
                    {isBelowGoal ? (
                      <span>Needs {needed >= 999 ? '∞' : needed} more</span>
                    ) : (
                      <span>Safe for {skippable >= 999 ? '∞' : skippable} skips</span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5">
                    {isDeleting ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                          className="px-2 py-1.5 bg-zinc-100 dark:bg-white/5 text-[11px] sm:text-xs font-medium text-zinc-400 rounded-lg hover:text-white transition-colors border-none"
                        >
                          No
                        </button>
                        <button
                          onClick={executeDelete}
                          className="px-2 py-1.5 bg-brand-secondary text-[11px] sm:text-xs font-medium text-white rounded-lg shadow-md hover:opacity-90 transition-colors border-none"
                        >
                          Del
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center bg-zinc-50 dark:bg-white/5 rounded-xl p-0.5">
                        {hasHistory && (
                          <button
                            onClick={(e) => undoSubjectLastAction(sub.id, e)}
                            className="p-1.5 text-zinc-400 hover:text-brand-primary transition-all border-none bg-transparent"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 10h10a5 5 0 0 1 0 10H11" /><polyline points="8 5 3 10 8 15" /></svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEdit(sub, e)}
                          className="p-1.5 text-zinc-400 hover:text-brand-primary transition-all border-none bg-transparent"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={(e) => confirmDelete(sub.id, e)}
                          className="p-1.5 text-zinc-400 hover:text-brand-secondary transition-all border-none bg-transparent"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
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
        <div className="text-center py-20 md:py-24 bg-zinc-50 dark:bg-white/5 rounded-[32px] md:rounded-[48px] border-4 border-dashed border-zinc-200 dark:border-white/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-zinc-200 dark:text-zinc-800"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          <p className="font-black text-zinc-400 uppercase tracking-[0.3em] text-[11px] sm:text-xs">
            {showArchived ? 'Archive is empty' : 'No subjects added yet.'}
          </p>
        </div>
      )}

      {isEditModalOpen && editingSubject && createPortal(
        <div
          className={`modal-overlay ${isClosing ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div ref={editModalRef} className={`bg-white dark:bg-[#0a0a0a] rounded-[32px] md:rounded-[40px] w-full max-w-sm shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-zinc-200 dark:border-white/10 relative overflow-hidden flex flex-col animate-slide-up ${isClosing ? 'closing' : ''}`}>
            <div className="bg-black p-6 md:p-7 text-white relative rounded-t-[32px] md:rounded-t-[40px] flex-shrink-0">
              <button onClick={handleClose} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-white/50 hover:text-white transition-colors border-none bg-transparent">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <h3 className="text-lg md:text-xl font-bold tracking-tight uppercase leading-none mb-1">Modify Entry</h3>
              <p className="text-white/60 text-[11px] sm:text-xs font-medium">Update subject details</p>
            </div>

            <div className="p-6 md:p-7 space-y-4 md:space-y-5">
              <div>
                <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-2 ml-1">Subject Name</label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-[#0a0a0a] p-3.5 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-brand-primary shadow-inner dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-2 ml-1">Present</label>
                  <input
                    type="number"
                    value={editingSubject.present}
                    onChange={(e) => setEditingSubject({ ...editingSubject, present: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-100 dark:bg-[#0a0a0a] p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-brand-primary shadow-inner dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-2 ml-1">Total</label>
                  <input
                    type="number"
                    value={editingSubject.total}
                    onChange={(e) => setEditingSubject({ ...editingSubject, total: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-100 dark:bg-[#0a0a0a] p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-brand-primary shadow-inner dark:text-white text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-2 ml-1">Duty Leaves</label>
                  <input
                    type="number"
                    value={editingSubject.dutyLeaves || 0}
                    onChange={(e) => setEditingSubject({ ...editingSubject, dutyLeaves: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-100 dark:bg-[#0a0a0a] p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-brand-primary shadow-inner dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] sm:text-xs font-medium text-zinc-400 mb-2 ml-1">Target (%)</label>
                  <input
                    type="number"
                    value={editingSubject.goal}
                    onChange={(e) => setEditingSubject({ ...editingSubject, goal: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-100 dark:bg-[#0a0a0a] p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-brand-primary shadow-inner dark:text-white text-center"
                  />
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 md:py-4 text-[11px] sm:text-xs font-medium text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="flex-[2] bg-brand-primary text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all border-none"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {isSyncModalOpen && createPortal(
        <div 
          className={`modal-overlay modal-overlay-fade ${isClosingSync ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
          onClick={(e) => { if(e.target === e.currentTarget && !isSyncing) handleCloseSync(); }}
        >
          <div className={`nexus-modal w-full max-w-sm overflow-hidden ${isClosingSync ? 'closing' : ''}`}>
            <div className="p-8 text-center bg-gradient-to-b from-orange-600/10 to-transparent border-b border-zinc-100 dark:border-white/5 relative">
              <button 
                onClick={handleCloseSync}
                className="absolute top-6 right-6 text-zinc-400 hover:text-orange-600 transition-colors border-none bg-transparent"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <div className="w-14 h-14 bg-orange-600 rounded-[22px] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-600/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase">UMS Sync</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Direct Data Import</p>
            </div>

            <div className="p-8 space-y-6">
              {isSyncing ? (
                <div className="py-12 text-center space-y-6">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 animate-pulse">{syncStatus}</p>
                </div>
              ) : (
                <>
              <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-[10px] text-orange-600 font-medium mb-2 leading-relaxed">
                ⚡ <b>Secure Sync:</b> We fetch data directly from UMS. Your credentials are never stored.
              </div>

              {syncStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Registration No.</label>
                    <input
                      type="text"
                      value={umsUsername}
                      onChange={e => setUmsUsername(e.target.value)}
                      placeholder="e.g. 12200000"
                      className="w-full bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleUMSInit} 
                    disabled={isSyncing}
                    className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all border-none"
                  >
                    {isSyncing ? "Connecting..." : "Continue"}
                  </button>
                </div>
              )}

              {syncStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">UMS Password</label>
                    <input
                      type="password"
                      value={umsPassword}
                      onChange={e => setUmsPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 text-center block">Solve Captcha</label>
                    {captchaImage && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-zinc-100">
                          <img src={captchaImage} alt="Captcha" className="h-12 w-auto object-contain" />
                        </div>
                        <input
                          type="text"
                          value={captchaCode}
                          onChange={e => setCaptchaCode(e.target.value)}
                          placeholder="Type the 4 codes above"
                          className="w-full bg-white dark:bg-[#0c0c0c] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-zinc-800 dark:text-white text-center outline-none focus:ring-2 focus:ring-orange-600 transition-all font-black"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSyncStep(0)} 
                      className="flex-1 py-4 text-zinc-500 font-bold text-[10px] uppercase border none bg-transparent"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleUMSSync} 
                      disabled={isSyncing}
                      className="flex-[2] py-4 bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all border-none"
                    >
                      {isSyncing ? "Syncing..." : "Verify & Sync"}
                    </button>
                  </div>
                </div>
              )}

              {syncStep === 2 && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
            </>
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
