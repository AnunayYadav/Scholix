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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-0">
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
                  glass-panel p-6 md:p-8 rounded-[40px] border transition-all duration-500 group relative overflow-hidden flex flex-col
                  border-slate-200 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  bg-white/80 dark:bg-[#0a0a0a]/60 backdrop-blur-xl
                  ${isDeleting ? 'ring-4 ring-red-500/20 border-red-500 scale-[0.98]' : ''}
                `}
              >
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mt-2 mb-6">
                  <div className={`
                    relative px-6 py-3 rounded-3xl ${accentBg} transition-all duration-500 group-hover:scale-105 mb-4
                    border border-transparent group-hover:border-current/10
                  `}>
                    <span className={`${accentColor} text-3xl md:text-4xl font-black tracking-tighter`}>
                      {percentage.toFixed(1)}
                      <span className="text-sm md:text-base opacity-40 ml-1 font-bold">%</span>
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2 line-clamp-1 transition-colors">
                    {sub.name}
                  </h3>

                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500/80">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {sub.present}/{sub.total} Sessions
                    </span>
                    <span className="flex items-center gap-1.5 bg-orange-600/5 px-2.5 py-1 rounded-lg text-orange-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                      Goal: {sub.goal}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="px-1 mb-8">
                  <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative shadow-inner p-1">
                    {/* Goal Marker with Pulse */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white/20 dark:bg-white/10 z-20 backdrop-blur-md"
                      style={{ left: `${goal}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]" />
                    </div>

                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${!isBelowGoal
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                        }`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer -skew-x-12 translate-x-[-100%]" />
                    </div>
                  </div>
                </div>

                {/* Counter Buttons */}
                {!showArchived && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'present', e)}
                      className="group/btn relative overflow-hidden bg-white dark:bg-white text-black py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 border-none"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-emerald-600"><path d="M20 6L9 17l-5-5" /></svg>
                      <span>Present</span>
                    </button>
                    <button
                      onClick={(e) => updateAttendance(sub.id, 'absent', e)}
                      className="group/btn relative overflow-hidden bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all border border-slate-200/50 dark:border-white/10 flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 opacity-50"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      <span>Absent</span>
                    </button>
                  </div>
                )}

                {/* Footer Analysis */}
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div className={`
                    px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2
                    ${isBelowGoal ? 'bg-red-500/5 text-red-500' : 'bg-emerald-500/5 text-emerald-500'}
                  `}>
                    <div className={`w-2 h-2 rounded-full ${isBelowGoal ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
                    {isBelowGoal ? (
                      <span>Needs {needed >= 999 ? '∞' : needed} sessions</span>
                    ) : (
                      <span>Safe for {skippable >= 999 ? '∞' : skippable} skips</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {isDeleting ? (
                      <div className="flex items-center gap-1.5 animate-fade-in">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                          className="px-3 py-2 bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase text-slate-400 rounded-xl hover:text-white transition-colors border-none"
                        >
                          No
                        </button>
                        <button
                          onClick={executeDelete}
                          className="px-3 py-2 bg-red-600 text-[9px] font-black uppercase text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors border-none"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center bg-slate-100/50 dark:bg-white/5 rounded-2xl p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {hasHistory && (
                          <button
                            onClick={(e) => undoSubjectLastAction(sub.id, e)}
                            title="Undo Last Action"
                            className="p-2 text-slate-400 hover:text-orange-500 transition-all hover:scale-110 border-none bg-transparent"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 10h10a5 5 0 0 1 0 10H11" /><polyline points="8 5 3 10 8 15" /></svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEdit(sub, e)}
                          title="Edit Subject"
                          className="p-2 text-slate-400 hover:text-orange-500 transition-all hover:scale-110 border-none bg-transparent"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={(e) => toggleArchive(sub.id, e)}
                          title={sub.archived ? "Restore to Active" : "Move to Archive"}
                          className={`p-2 transition-all hover:scale-110 border-none bg-transparent ${sub.archived ? 'text-orange-500 hover:text-orange-600' : 'text-slate-400 hover:text-orange-500'}`}
                        >
                          {sub.archived ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 12h18" /><path d="m15 18 6-6-6-6" /><path d="M3 18v-6a9 9 0 0 1 18 0v6" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => confirmDelete(sub.id, e)}
                          title="Permanently Delete"
                          className="p-2 text-slate-400 hover:text-red-500 transition-all hover:scale-110 border-none bg-transparent"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
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
          <div ref={editModalRef} className="bg-white dark:bg-[#070707] rounded-[32px] md:rounded-[40px] w-full max-w-md shadow-[0_32px_128px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col">
            <div className="bg-black p-6 md:p-8 text-white relative rounded-t-[32px] md:rounded-t-[40px] flex-shrink-0">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 md:top-6 md:right-6 p-2 text-white/50 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
              <h3 className="text-lg md:text-xl font-black tracking-tighter uppercase leading-none mb-1">Modify Entry</h3>
              <p className="text-white/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Update subject details</p>
            </div>

            <div className="p-6 md:p-8 space-y-4 md:space-y-6">
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