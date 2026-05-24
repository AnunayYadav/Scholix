
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import NexusDropdown from './NexusDropdown.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  marks?: number;
}

const GRADE_POINTS: Record<string, number> = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
};

const LPU_BTECH_CREDITS: Record<number, number> = {
  1: 18, 2: 27, 3: 24, 4: 24, 5: 25, 6: 22, 7: 10, 8: 16
};

const LPU_STANDARDS = [
  { grade: 'O', points: 10, range: '90-100', label: 'Outstanding' },
  { grade: 'A+', points: 9, range: '80-89', label: 'Excellent' },
  { grade: 'A', points: 8, range: '70-79', label: 'Very Good' },
  { grade: 'B+', points: 7, range: '60-69', label: 'Good' },
  { grade: 'B', points: 6, range: '50-59', label: 'Above Avg' },
  { grade: 'C', points: 5, range: '45-49', label: 'Average' },
  { grade: 'P', points: 4, range: '40-44', label: 'Pass' },
  { grade: 'F', points: 0, range: '0-39', label: 'Fail' },
];

const GRADELIST = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'];

const getGradeFromMarks = (marks: number): string => {
  if (marks === 0) return 'F';
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 45) return 'C';
  if (marks >= 40) return 'P';
  return 'F';
};

interface CGPACalculatorProps {
  userProfile?: UserProfile | null;
  hideHeader?: boolean;
}

const CGPACalculator: React.FC<CGPACalculatorProps> = ({ userProfile, hideHeader }) => {
  const { universityInfo, shortBrandName, selectedUniversity, uniSlug } = useUniversity();
  const [inputMode, setInputMode] = useState<'marks' | 'grades'>('marks');
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [prevCGPA, setPrevCGPA] = useState<number | string>('');
  const [prevTotalCredits, setPrevTotalCredits] = useState<number | string>('');
  const [targetCGPA, setTargetCGPA] = useState<number | string>('');
  const [manualAdjustments, setManualAdjustments] = useState<Record<number, number>>({});
  const [courses, setCourses] = useState<Course[]>([]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClosingShare, setIsClosingShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleCloseShare = () => {
    setIsClosingShare(true);
    setTimeout(() => {
      setIsShareModalOpen(false);
      setIsClosingShare(false);
    }, 250);
  };
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const historyPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, [userProfile]);

  const loadHistory = async () => {
    try {
      const records = await NexusServer.fetchRecords(userProfile?.id || null, 'cgpa_snapshot');
      setHistory(records);
    } catch (e) { console.error(e); }
  };

  const saveSnapshot = async () => {
    setIsSaving(true);
    const content = {
      courses, prevCGPA, prevTotalCredits, targetCGPA, manualAdjustments, currentSemester, inputMode
    };
    try {
      await NexusServer.saveRecord(userProfile?.id || null, 'cgpa_snapshot', `Saved: Sem ${currentSemester}`, content);
      await loadHistory();
      showToast("Report successfully archived in your vault.", "success");
    } catch (e) {
      showToast("Registry error: Failed to save snapshot.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const loadSnapshot = (record: any) => {
    const c = record.content;
    setCourses(c.courses || []);
    setPrevCGPA(c.prevCGPA || '');
    setPrevTotalCredits(c.prevTotalCredits || '');
    setTargetCGPA(c.targetCGPA || '');
    setManualAdjustments(c.manualAdjustments || {});
    setCurrentSemester(c.currentSemester || 1);
    setInputMode(c.inputMode || 'marks');
    setIsHistoryOpen(false);
  };

  const deleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm("Delete this archive permanently?");
    if (confirmed) {
      await NexusServer.deleteRecord(id, 'cgpa_snapshot', userProfile?.id || null);
      loadHistory();
    }
  };

  const addCourse = () => {
    setCourses([...courses, { id: Math.random().toString(36).substr(2, 9), name: '', credits: 2, grade: 'F', marks: 0 }]);
  };

  const removeCourse = (id: string) => { setCourses(courses.filter(c => c.id !== id)); };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        if (field === 'marks') updated.grade = getGradeFromMarks(Number(value));
        return updated;
      }
      return c;
    }));
  };

  const currentStats = useMemo(() => {
    let totalPoints = 0, totalCredits = 0;
    const gradeCounts: Record<string, number> = {};
    GRADELIST.forEach(g => gradeCounts[g] = 0);
    courses.forEach(c => {
      totalPoints += (GRADE_POINTS[c.grade] || 0) * (Number(c.credits) || 0);
      totalCredits += Number(c.credits) || 0;
      gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
    });
    const result = { sgpa: totalCredits === 0 ? 0 : totalPoints / totalCredits, totalPoints, totalCredits, gradeCounts };
    return result;
  }, [courses]);

  // Track CGPA Calculation with debounce
  useEffect(() => {
    if (currentStats.totalCredits > 0) {
      const timeout = setTimeout(() => {
        NexusServer.saveRecord(userProfile?.id || null, 'cgpa_calc', 'Calculated SGPA/CGPA', { 
          sgpa: currentStats.sgpa, 
          credits: currentStats.totalCredits,
          semester: currentSemester
        });
      }, 2000); // 2s debounce
      return () => clearTimeout(timeout);
    }
  }, [currentStats.sgpa, currentStats.totalCredits, userProfile?.id, currentSemester]);

  const archivedCredits = useMemo(() => {
    if (prevTotalCredits !== '' && !isNaN(Number(prevTotalCredits))) return Number(prevTotalCredits);
    let sum = 0;
    for (let i = 1; i < currentSemester; i++) {
      sum += LPU_BTECH_CREDITS[i] || 20;
    }
    return sum;
  }, [prevTotalCredits, currentSemester]);

  const overallCGPA = useMemo(() => {
    const pCGPA = Number(prevCGPA) || 0;
    const combinedPoints = (pCGPA * archivedCredits) + currentStats.totalPoints;
    const combinedCredits = archivedCredits + currentStats.totalCredits;
    return combinedCredits === 0 ? 0 : (combinedPoints / combinedCredits);
  }, [prevCGPA, archivedCredits, currentStats]).toFixed(2);

  const roadmapData = useMemo(() => {
    const tCGPA = Number(targetCGPA);
    if (!tCGPA || tCGPA <= 0) return { roadmap: [], summary: null };

    const totalSems = 8;
    const archivedPoints = (Number(prevCGPA) || 0) * archivedCredits;

    const planSemIndices = [];
    for (let i = currentSemester; i <= totalSems; i++) planSemIndices.push(i);

    if (planSemIndices.length === 0) return { roadmap: [], summary: null };

    const futureCredits = planSemIndices.reduce((sum, sem) => sum + (LPU_BTECH_CREDITS[sem] || 20), 0);
    const totalCreditsForDegree = archivedCredits + futureCredits;
    const totalPointsNeeded = tCGPA * totalCreditsForDegree;
    const pointsNeededFromFuture = totalPointsNeeded - archivedPoints;

    let manualPoints = 0;
    let manualCredits = 0;
    Object.entries(manualAdjustments).forEach(([sem, val]) => {
      const sNum = parseInt(sem);
      if (planSemIndices.includes(sNum)) {
        const semCredits = LPU_BTECH_CREDITS[sNum] || 20;
        manualPoints += (Number(val) * semCredits);
        manualCredits += semCredits;
      }
    });

    const unpinnedCredits = futureCredits - manualCredits;
    const pointsNeededFromUnpinned = pointsNeededFromFuture - manualPoints;
    const autoSGPA = unpinnedCredits > 0 ? Math.max(0, Math.min(10, pointsNeededFromUnpinned / unpinnedCredits)) : 0;

    const roadmap = planSemIndices.map(semNum => {
      const isManual = manualAdjustments[semNum] !== undefined;
      return {
        sem: semNum,
        isManual,
        sgpa: isManual ? manualAdjustments[semNum] : autoSGPA
      };
    });

    return {
      roadmap,
      summary: {
        totalPointsNeeded,
        remainingPoints: pointsNeededFromUnpinned,
        avgNeeded: autoSGPA,
        isImpossible: autoSGPA > 10 || (pointsNeededFromUnpinned > 0 && autoSGPA <= 0)
      }
    };
  }, [targetCGPA, prevCGPA, archivedCredits, currentSemester, manualAdjustments]);

  const adjustSemTarget = (sem: number, delta: number) => {
    setManualAdjustments(prev => {
      const currentVal = prev[sem] !== undefined ? prev[sem] : (roadmapData.summary?.avgNeeded || 0);
      const nextVal = Math.max(0, Math.min(10, currentVal + delta));
      return { ...prev, [sem]: Number(nextVal.toFixed(1)) };
    });
  };

  const resetManual = (sem: number) => {
    setManualAdjustments(prev => {
      const next = { ...prev };
      delete next[sem];
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      {!hideHeader && (
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-2 tracking-tighter">
            SGPA & CGPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Hub</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium text-[11px] sm:text-xs">Precision SGPA & CGPA forecasting based on {shortBrandName} standards.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Left: Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <NexusDropdown
            options={['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']}
            value={`Semester ${currentSemester}`}
            onChange={(val) => {
              const sem = parseInt(val.split(' ')[1]);
              setCurrentSemester(sem);
              setManualAdjustments({});
            }}
          />
          <NexusDropdown
            options={['By Marks', 'By Grades']}
            value={inputMode === 'marks' ? 'By Marks' : 'By Grades'}
            onChange={(val) => {
              setInputMode(val === 'By Marks' ? 'marks' : 'grades');
            }}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2 rounded-xl transition-all border-none bg-transparent flex items-center justify-center ${isHistoryOpen ? 'text-brand-primary' : 'text-zinc-400 hover:text-brand-primary'}`}
            title="Archived Reports"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
          </button>

          <button
            onClick={saveSnapshot}
            disabled={isSaving}
            className={`p-2 rounded-xl transition-all border-none bg-transparent flex items-center justify-center ${isSaving ? 'opacity-50' : 'text-zinc-400 hover:text-emerald-500'}`}
            title="Save to Vault"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>}
          </button>

          <button onClick={() => {
            const data = { 
              sgpa: currentStats.sgpa.toFixed(2), 
              cgpa: overallCGPA, 
              sem: currentSemester, 
              credits: currentStats.totalCredits, 
              subjects: courses.filter(c => c.name).map(c => ({ n: c.name, c: c.credits, g: c.grade })), 
              ts: Date.now(),
              uni: selectedUniversity
            };
            const encoded = btoa(JSON.stringify(data));
            const currentBaseUrl = window.location.origin;
            const linkPrefix = uniSlug ? `/${uniSlug}` : '';
            setShareUrl(`${currentBaseUrl}${linkPrefix}/share-cgpa?d=${encoded}`);
            setIsShareModalOpen(true);
          }} className="ml-1 px-4 py-2 bg-brand-primary text-white rounded-xl text-[10px] md:text-xs font-semibold shadow-lg shadow-brand-primary/20 active:scale-95 transition-all flex items-center gap-1.5 border-none">
            Generate Link
          </button>
        </div>
      </div>

      {isHistoryOpen && (
        <div ref={historyPanelRef} className="glass-panel p-6 rounded-[32px] border border-brand-primary/20 bg-brand-primary/[0.03] animate-fade-in mb-8">
          <h3 className="text-[11px] sm:text-xs font-medium text-brand-primary mb-6">Saved reports</h3>
          {history.length === 0 ? <p className="text-[11px] sm:text-xs text-zinc-400 font-bold py-8 text-center uppercase tracking-widest opacity-40">Vault empty.</p> : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map(h => (
                <div key={h.id} onClick={() => loadSnapshot(h)} className="p-5 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-white/5 rounded-3xl cursor-pointer hover:border-brand-primary/50 transition-all flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-medium dark:text-white">{h.label}</p>
                    <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase mt-1">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => deleteHistory(h.id, e)} className="p-2 text-brand-secondary opacity-20 hover:opacity-100 border-none bg-transparent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentSemester > 1 && (
        <div className="glass-panel p-8 rounded-[40px] border border-brand-primary/20 bg-brand-primary/[0.02] shadow-sm mb-8 animate-fade-in">
          <h3 className="text-[11px] sm:text-xs font-medium text-brand-primary mb-6">Academic history (Sems 1 – {currentSemester - 1})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] sm:text-xs text-zinc-400 mb-2 ml-1">CGPA till Sem {currentSemester - 1}</label>
              <input
                type="number" step="0.01" max="10"
                value={prevCGPA}
                onChange={(e) => setPrevCGPA(e.target.value)}
                placeholder="e.g. 8.45"
                className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs text-zinc-400 mb-2 ml-1">Total credits earned</label>
              <input
                type="number"
                value={prevTotalCredits}
                onChange={(e) => setPrevTotalCredits(e.target.value)}
                placeholder={`Default: ${archivedCredits}`}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-[40px] space-y-6 shadow-sm border dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] sm:text-xs text-zinc-400">Course entries</h3>
              <button onClick={addCourse} className="text-[11px] sm:text-xs font-medium text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 px-6 py-2.5 rounded-xl border border-brand-primary/20 transition-all border-none">+ Add field</button>
            </div>
            {courses.length === 0 ? <div className="py-16 text-center border-4 border-dashed border-zinc-100 dark:border-white/5 rounded-[40px] opacity-40 text-[11px] sm:text-xs">No courses added yet</div> : (
              <div className="space-y-4">{courses.map((c) => (
                <div key={c.id} className="flex flex-col md:flex-row items-center gap-4 bg-zinc-50 dark:bg-[#0a0a0a]/40 p-5 rounded-[32px] border border-zinc-100 dark:border-white/5 transition-all hover:border-brand-primary/20">
                  <div className="flex-1 w-full">
                    <input type="text" placeholder="Course Name" value={c.name} onChange={(e) => updateCourse(c.id, 'name', e.target.value)} className="w-full bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/50" />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="space-y-1">
                      <p className="text-[11px] sm:text-xs text-zinc-400 text-center">Credits</p>
                      <input type="number" min="0" max="20" value={c.credits} onChange={(e) => updateCourse(c.id, 'credits', parseInt(e.target.value) || 0)} className="w-16 bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl px-3 py-3 text-xs text-center font-semibold dark:text-white outline-none" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] sm:text-xs text-zinc-400 text-center">{inputMode === 'marks' ? 'Marks' : 'Grade'}</p>
                      {inputMode === 'marks' ? (
                        <input type="number" min="0" max="100" value={c.marks} onChange={(e) => updateCourse(c.id, 'marks', parseInt(e.target.value) || 0)} className="w-20 bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl px-3 py-3 text-xs text-center font-semibold dark:text-white outline-none" />
                      ) : (
                        <NexusDropdown
                          options={GRADELIST}
                          value={c.grade}
                          onChange={(val) => updateCourse(c.id, 'grade', val)}
                          className="w-24"
                        />
                      )}
                    </div>
                    <button onClick={() => removeCourse(c.id)} className="p-3 text-brand-secondary opacity-20 hover:opacity-100 border-none bg-transparent mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>

          <div className="glass-panel p-10 rounded-[56px] space-y-10 shadow-2xl border border-brand-primary/20 bg-brand-primary/[0.03]">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-[11px] sm:text-xs font-medium text-brand-primary">Degree target</h3>
                <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Forecast individual semester performance</p>
              </div>
              <div className="relative">
                <input type="number" step="0.1" max="10" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} className="w-28 bg-white dark:bg-[#0a0a0a]/60 border border-brand-primary/30 rounded-2xl px-4 py-3 text-base text-center font-bold text-brand-primary outline-none focus:ring-4 focus:ring-brand-primary/10" placeholder="9.0" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center text-white text-[11px] sm:text-xs font-black">!</span>
              </div>
            </header>

            {Number(targetCGPA) > 0 && roadmapData.summary ? (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roadmapData.roadmap.map((item) => (
                    <div key={item.sem} className={`p-4 sm:p-5 rounded-[32px] border transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${item.isManual ? 'bg-brand-primary/10 border-brand-primary/30 shadow-lg' : 'bg-white dark:bg-[#0a0a0a] border-zinc-100 dark:border-white/5'}`}>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mb-3">Sem {item.sem} • {LPU_BTECH_CREDITS[item.sem] || 20} Cr</p>

                      <div className="flex items-center gap-1 sm:gap-3 relative z-10">
                        <button onClick={() => adjustSemTarget(item.sem, -0.1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-600 dark:text-white hover:bg-brand-primary hover:text-white transition-all border-none">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 sm:w-3.5 sm:h-3.5"><path d="M5 12h14" /></svg>
                        </button>
                        <span className={`text-xl sm:text-2xl font-bold tracking-tight ${item.isManual ? 'text-brand-primary' : 'text-brand-primary'}`}>{item.sgpa.toFixed(1)}</span>
                        <button onClick={() => adjustSemTarget(item.sem, 0.1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-600 dark:text-white hover:bg-brand-primary hover:text-white transition-all border-none">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 sm:w-3.5 sm:h-3.5"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>

                      {item.isManual ? (
                        <button onClick={() => resetManual(item.sem)} className="mt-3 text-[11px] sm:text-xs text-brand-primary hover:underline border-none bg-transparent flex items-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2 h-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          Locked • Reset
                        </button>
                      ) : (
                        <p className="mt-3 text-[11px] sm:text-xs text-zinc-400">Auto balancing</p>
                      )}

                      {item.isManual && <div className="absolute top-0 right-0 w-2 h-2 bg-brand-primary rounded-bl-lg" />}
                    </div>
                  ))}
                </div>

                <div className={`p-6 rounded-[32px] border flex items-center gap-4 ${roadmapData.summary.isImpossible ? 'bg-brand-secondary/10 border-brand-secondary/20' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                  <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center flex-shrink-0 font-black text-xs ${roadmapData.summary.isImpossible ? 'bg-brand-secondary' : 'bg-brand-primary'}`}>
                    {roadmapData.summary.isImpossible ? '!' : 'i'}
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {roadmapData.summary.isImpossible
                      ? "Target mathematically unreachable. Reduce manual locks or lower target CGPA."
                      : <>Auto-balancing: Remaining unlocked semesters now require an average of <strong className="text-brand-primary">{roadmapData.summary.avgNeeded.toFixed(2)} SGPA</strong> to maintain your <strong className="text-brand-primary">{targetCGPA}</strong> goal.</>
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center border-4 border-dashed border-zinc-100 dark:border-white/5 rounded-[48px] opacity-40">
                <p className="text-[11px] sm:text-xs text-zinc-500">Enter target CGPA to run simulation</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-10 rounded-[56px] text-center shadow-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white relative overflow-hidden group border-none">
            <h3 className="text-[11px] sm:text-xs font-medium opacity-80 mb-4 relative z-10">Current SGPA</h3>
            <p className="text-6xl font-bold tracking-tight mb-6 relative z-10">{currentStats.sgpa.toFixed(2)}</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${(currentStats.sgpa / 10) * 100}%` }} />
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full group-hover:scale-125 transition-transform" />
          </div>

          <div className="glass-panel p-10 rounded-[56px] text-center shadow-2xl bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 relative overflow-hidden group">
            <h3 className="text-[11px] sm:text-xs font-medium opacity-80 mb-4 relative z-10 text-zinc-500 dark:text-white/60">Overall CGPA</h3>
            <p className="text-6xl font-bold tracking-tight mb-6 relative z-10">{overallCGPA}</p>
            <div className="h-2 bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${(parseFloat(overallCGPA) / 10) * 100}%` }} />
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-primary/5 blur-[60px] rounded-full group-hover:scale-125 transition-transform" />
          </div>

          <div className="glass-panel p-8 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/20">
            <h3 className="text-[11px] sm:text-xs text-zinc-400 mb-6 border-b border-zinc-100 dark:border-white/5 pb-4">Grade pulse</h3>
            <div className="space-y-4">
              {/* Fix: Explicitly cast count to number as Object.entries value might be inferred as unknown */}
              {Object.entries(currentStats.gradeCounts).filter(([_, count]) => (count as number) > 0).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <span className="text-sm font-semibold dark:text-white">Grade {grade}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                      {/* Fix: Explicitly cast count to number for arithmetic operations */}
                      <div className="h-full bg-brand-primary" style={{ width: `${((count as number) / courses.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-brand-primary">{count}</span>
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase italic">Awaiting grade input...</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/60 shadow-sm overflow-hidden">
        <header className="flex items-center justify-between mb-8">
          <h3 className="text-[11px] sm:text-xs font-semibold text-brand-primary">{shortBrandName} grading standards</h3>
          <span className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-full">Standard Reference</span>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LPU_STANDARDS.map((s) => (
            <div key={s.grade} className="p-4 rounded-[28px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 flex flex-col items-center text-center group hover:border-brand-primary/30 transition-all">
              <span className="text-xl font-bold text-zinc-900 dark:text-white mb-1 group-hover:scale-110 transition-transform">{s.grade}</span>
              <p className="text-xs text-brand-primary mb-2">{s.points} Points</p>
              <p className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-0.5">{s.range} Marks</p>
              <p className="text-[11px] sm:text-xs text-zinc-400 opacity-40">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
          <p className="text-[11px] sm:text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong className="text-brand-primary">Pro Tip:</strong> {shortBrandName} uses relative grading based on class performance. These mark ranges are "Safe Estimates" to ensure you hit your target grade regardless of class average shifts.
          </p>
        </div>
      </div>

      {isShareModalOpen && createPortal(
        <div
          className={`modal-overlay ${isClosingShare ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseShare(); }}
        >
          <div className={`nexus-modal w-full max-w-sm p-10 ${isClosingShare ? 'closing' : ''}`}>
            <button onClick={handleCloseShare} className="absolute top-8 right-8 p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="w-20 h-20 bg-brand-primary/10 rounded-[32px] flex items-center justify-center mb-8 border border-brand-primary/20 relative group/icon">
              <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-brand-primary relative z-10"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            </div>

            <h3 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white leading-none">Share Report</h3>
            <p className="text-zinc-500 text-[11px] sm:text-xs mb-8">Encrypted link generated for your academic snapshot.</p>

            <div className="bg-zinc-50 dark:bg-[#0a0a0a]/50 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 mb-8 select-all break-all text-[11px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed shadow-inner">
              {shareUrl}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                const btn = document.activeElement as HTMLButtonElement;
                const originalText = btn.innerText;
                btn.innerText = "COPIED!";
                setTimeout(() => { if (btn) btn.innerText = originalText; }, 2000);
              }}
              className="w-full py-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-[24px] font-bold text-sm shadow-xl shadow-brand-primary/20 active:scale-95 transition-all border-none"
            >
              Copy Link
            </button>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default CGPACalculator;
