import React, { useState, useEffect, useRef } from 'react';

interface Subject {
  id: string;
  name: string;
  present: number;
  total: number;
  goal: number;
  archived?: boolean;
}

interface HistoryItem {
  id: string;
  type: 'present' | 'absent';
  prevPresent: number;
  prevTotal: number;
  timestamp: number;
}

const SubjectSkeleton = () => (
  <div className="glass-panel p-5 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-200 dark:border-white/5 bg-white dark:bg-black/40 animate-pulse min-h-[160px]">
    <div className="flex flex-col items-center mb-6">
      <div className="h-10 w-24 bg-slate-200 dark:bg-white/5 rounded-[22px] mb-3 shimmer" />
      <div className="h-6 w-32 bg-slate-200 dark:bg-white/5 rounded shimmer" />
    </div>
    <div className="h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full mb-8 shimmer" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-12 bg-slate-200 dark:bg-white/5 rounded-[22px] shimmer" />
      <div className="h-12 bg-slate-200 dark:bg-white/5 rounded-[22px] shimmer" />
    </div>
  </div>
);

const AttendanceTracker: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_attendance');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubjects(parsed.map((s: any) => ({
          ...s,
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
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [wipingAll, setWipingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newSub, setNewSub] = useState({
    name: '',
    present: '0',
    total: '0',
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
    const goal = parseInt(newSub.goal) || 75;

    setSubjects(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name: newSub.name,
      present: Math.min(present, total),
      total: total,
      goal: goal,
      archived: false
    }]);

    setNewSub({ name: '', present: '0', total: '0', goal: '75' });
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

  const updateAttendance = (id: string, type: 'present' | 'absent', e: React.MouseEvent) => {
    e.stopPropagation();
    setSubjects(prevSubjects => {
      const subject = prevSubjects.find(s => s.id === id);
      if (subject) {
        setHistory(prev => [{
          id,
          type,
          prevPresent: subject.present,
          prevTotal: subject.total,
          timestamp: Date.now()
        }, ...prev].slice(0, 50));
      }

      return prevSubjects.map(s => {
        if (s.id === id) {
          return {
            ...s,
            present: type === 'present' ? s.present + 1 : s.present,
            total: s.total + 1
          };
        }
        return s;
      });
    });
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
          total: action.prevTotal
        };
      }
      return s;
    }));

    setHistory(prev => prev.filter((_, idx) => idx !== actionIndex));
  };

  const calculateStats = (s: Subject) => {
    const goal = s.goal || 75;
    const percentage = s.total === 0 ? 0 : (s.present / s.total) * 100;

    let needed = 0;
    if (percentage < goal && goal < 100) {
      needed = Math.ceil(((goal / 100) * s.total - s.present) / (1 - (goal / 100)));
    } else if (percentage < goal && goal === 100) {
      needed = 999;
    }

    let skippable = 0;
    if (percentage >= goal && goal > 0) {
      skippable = Math.floor((100 * s.present - goal * s.total) / goal);
    } else if (percentage >= goal && goal === 0) {
      skippable = 999;
    }

    return { percentage, needed, skippable, goal };
  };

  const filteredSubjects = subjects.filter(s => showArchived ? s.archived : !s.archived);

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-24 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Tracker</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium tracking-tight">Keep track of your classes and attendance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {subjects.length > 0 && (
            <div className="relative">
              {wipingAll ? (
                <div className="flex items-center bg-red-600 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                  <button
                    onClick={() => setWipingAll(false)}
                    className="px-3 md:px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                  >
                    No
                  </button>
                  <button
                    onClick={executeClearAll}
                    className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-red-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-red-50"
                  >
                    Wipe All Data?
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setWipingAll(true); }}
                  className="flex items-center space-x-2 px-4 md:px-6 py-2.5 md:py-3 bg-slate-100 dark:bg-black rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 md:w-4 h-3.5 md:h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-2 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${showArchived ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-black text-slate-600 dark:text-slate-400'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 md:w-4 h-3.5 md:h-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            <span>{showArchived ? 'Active Subjects' : 'Archived'}</span>
          </button>
        </div>
      </header>

      <div className="glass-panel p-5 md:p-8 rounded-[32px] md:rounded-[40px] bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 shadow-2xl relative z-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-end">
          <div className="md:col-span-4">
            <label className="block text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CSE408"
              value={newSub.name}
              onChange={(e) => {
                setNewSub({ ...newSub, name: e.target.value });
                if (showValidation) setShowValidation(false);
              }}
              className={`w-full bg-slate-100 dark:bg-black border rounded-2xl px-5 py-3.5 md:py-4 text-slate-800 dark:text-white outline-none transition-all font-bold text-sm shadow-inner ${showValidation && !newSub.name.trim()
                ? 'border-red-500 ring-2 ring-red-500/20'
                : 'border-transparent focus:ring-2 focus:ring-orange-600'
                }`}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Present / Total</label>
            <div className="flex items-center space-x-2">
              <input
                type="number" placeholder="P" value={newSub.present}
                onChange={(e) => setNewSub({ ...newSub, present: e.target.value })}
                className="w-full bg-slate-100 dark:bg-black border border-transparent rounded-2xl px-3 py-3.5 md:py-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all text-sm text-center font-bold shadow-inner"
              />
              <span className="text-slate-400 font-black">/</span>
              <input
                type="number" placeholder="T" value={newSub.total}
                onChange={(e) => setNewSub({ ...newSub, total: e.target.value })}
                className="w-full bg-slate-100 dark:bg-black border border-transparent rounded-2xl px-3 py-3.5 md:py-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all text-sm text-center font-bold shadow-inner"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[9px] md:text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Goal %</label>
            <input
              type="number" placeholder="75" value={newSub.goal}
              onChange={(e) => setNewSub({ ...newSub, goal: e.target.value })}
              className="w-full bg-slate-100 dark:bg-black border border-transparent rounded-2xl px-5 py-3.5 md:py-4 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-600 transition-all text-sm text-center font-bold shadow-inner"
            />
          </div>
          <div className="md:col-span-3">
            <button
              onClick={addSubject}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 md:py-[1.15rem] rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center whitespace-nowrap"
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
            const accentColor = isBelowGoal ? 'text-red-500' : 'text-emerald-500';
            const accentBg = isBelowGoal ? 'bg-red-500/10' : 'bg-emerald-500/10';
            const hasHistory = history.some(h => h.id === sub.id);
            const isDeleting = deletingId === sub.id;

            return (
              <div
                key={sub.id}
                className={`
                  glass-panel p-3 sm:p-5 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all duration-500 group relative overflow-hidden flex flex-col
                  border-slate-200 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  bg-white/80 dark:bg-[#0a0a0a]/60 backdrop-blur-xl
                  ${isDeleting ? 'ring-4 ring-red-500/20 border-red-500 scale-[0.98]' : ''}
                `}
              >
                {/* Top Section: Name and Percentage */}
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none truncate max-w-[70px] sm:max-w-none">
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[6px] md:text-[7px] font-black uppercase text-slate-500">
                        {sub.present}/{sub.total} S
                      </span>
                    </div>
                  </div>

                  <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl ${accentBg} border border-transparent group-hover:border-current/10 transition-all`}>
                    <span className={`${accentColor} text-base sm:text-lg md:text-xl font-black tracking-tighter`}>
                      {percentage.toFixed(1)}
                      <span className="text-[8px] sm:text-[9px] opacity-40 ml-0.5 font-bold">%</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">PROGRESS</p>
                    <p className="text-[7px] font-black text-orange-600 uppercase tracking-widest">GOAL: {sub.goal}%</p>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                    {/* Goal Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-orange-500/30 z-20 backdrop-blur-md"
                      style={{ left: `${goal}%` }}
                    />

                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${!isBelowGoal
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-red-600 to-rose-500'
                        }`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer -skew-x-12 translate-x-[-100%]" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!showArchived && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'present', e)}
                      className="group/btn h-10 bg-white dark:bg-white text-black rounded-xl font-black text-[8px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5 border-none"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-emerald-600"><path d="M20 6L9 17l-5-5" /></svg>
                      PRESENT
                    </button>
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'absent', e)}
                      className="group/btn h-10 bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all border border-slate-200/50 dark:border-white/10 flex items-center justify-center gap-1.5"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 opacity-50"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      ABSENT
                    </button>
                  </div>
                )}

                {/* Footer Analysis */}
                <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-100 dark:border-white/5">
                  <div className={`
                    px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2
                    ${isBelowGoal ? 'bg-red-500/5 text-red-500' : 'bg-emerald-500/5 text-emerald-500'}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isBelowGoal ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
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
                          className="px-2 py-1.5 bg-slate-100 dark:bg-white/5 text-[8px] font-black uppercase text-slate-400 rounded-lg hover:text-white transition-colors border-none"
                        >
                          No
                        </button>
                        <button
                          onClick={executeDelete}
                          className="px-2 py-1.5 bg-red-600 text-[8px] font-black uppercase text-white rounded-lg shadow-md hover:bg-red-700 transition-colors border-none"
                        >
                          Del
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl p-0.5">
                        {hasHistory && (
                          <button
                            onClick={(e) => undoSubjectLastAction(sub.id, e)}
                            className="p-1.5 text-slate-400 hover:text-orange-500 transition-all border-none bg-transparent"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 10h10a5 5 0 0 1 0 10H11" /><polyline points="8 5 3 10 8 15" /></svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEdit(sub, e)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 transition-all border-none bg-transparent"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={(e) => confirmDelete(sub.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-all border-none bg-transparent"
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
        <div className="text-center py-20 md:py-24 bg-slate-50 dark:bg-white/5 rounded-[32px] md:rounded-[48px] border-4 border-dashed border-slate-200 dark:border-white/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-slate-200 dark:text-slate-800"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] md:text-xs">
            {showArchived ? 'Archive is empty' : 'No subjects added yet.'}
          </p>
        </div>
      )}

      {isEditModalOpen && editingSubject && (
        <div className="modal-overlay">
          <div ref={editModalRef} className="bg-white dark:bg-[#070707] rounded-[32px] md:rounded-[40px] w-full max-w-sm shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col animate-slide-up">
            <div className="bg-black p-6 md:p-7 text-white relative rounded-t-[32px] md:rounded-t-[40px] flex-shrink-0">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-white/50 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <h3 className="text-lg md:text-xl font-black tracking-tighter uppercase leading-none mb-1">Modify Entry</h3>
              <p className="text-white/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Update subject details</p>
            </div>

            <div className="p-6 md:p-7 space-y-4 md:space-y-5">
              <div>
                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Subject Name</label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-black p-3.5 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-orange-500 shadow-inner dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Present</label>
                  <input
                    type="number"
                    value={editingSubject.present}
                    onChange={(e) => setEditingSubject({ ...editingSubject, present: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-100 dark:bg-black p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-orange-500 shadow-inner dark:text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Total</label>
                  <input
                    type="number"
                    value={editingSubject.total}
                    onChange={(e) => setEditingSubject({ ...editingSubject, total: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-100 dark:bg-black p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-orange-500 shadow-inner dark:text-white text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 ml-1">Target (%)</label>
                <input
                  type="number"
                  value={editingSubject.goal}
                  onChange={(e) => setEditingSubject({ ...editingSubject, goal: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-100 dark:bg-black p-3.5 md:p-4 rounded-xl md:rounded-2xl text-sm font-bold outline-none border border-transparent focus:ring-2 focus:ring-orange-500 shadow-inner dark:text-white text-center"
                />
              </div>

              <div className="flex gap-3 md:gap-4 pt-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-[2] bg-orange-600 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;