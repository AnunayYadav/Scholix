
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile } from '../types.ts';
import NexusServer from '../services/nexusServer.ts';
import NexusDropdown from './NexusDropdown.tsx';
import { showToast, showConfirm } from './Toast.tsx';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { BTECH_CSE_2025, CURRICULUM_REGISTRY } from '../data/curriculumData.ts';

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

const IITM_TERM_CREDITS: Record<number, number> = {
  1: 16, 2: 16, 3: 17, 4: 12, 5: 19, 6: 18, 7: 14, 8: 14, 9: 14, 10: 14, 11: 10, 12: 10, 13: 10, 14: 10
};

const getGradePoints = (uni: string): Record<string, number> => {
  if (uni === 'iitm_bs') {
    return { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 4, 'U': 0 };
  }
  return GRADE_POINTS;
};

const getGradeList = (uni: string): string[] => {
  if (uni === 'iitm_bs') {
    return ['S', 'A', 'B', 'C', 'D', 'E', 'U'];
  }
  return GRADELIST;
};

const getStandards = (uni: string) => {
  if (uni === 'iitm_bs') {
    return [
      { grade: 'S', points: 10, range: '90-100', label: 'Super' },
      { grade: 'A', points: 9, range: '80-89', label: 'Excellent' },
      { grade: 'B', points: 8, range: '70-79', label: 'Very Good' },
      { grade: 'C', points: 7, range: '60-69', label: 'Good' },
      { grade: 'D', points: 6, range: '50-59', label: 'Average' },
      { grade: 'E', points: 4, range: '40-49', label: 'Pass' },
      { grade: 'U', points: 0, range: '0-39', label: 'Fail' },
    ];
  }
  return LPU_STANDARDS;
};

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

const getGradeFromMarksForUni = (marks: number, uni: string): string => {
  if (uni === 'iitm_bs') {
    if (marks === 0) return 'U';
    if (marks >= 90) return 'S';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    if (marks >= 40) return 'E';
    return 'U';
  }
  return getGradeFromMarks(marks);
};

const serializePayload = (data: any): string => {
  const subjectsStr = data.subjects.map((s: any) => {
    const escapedName = encodeURIComponent(s.n);
    return `${escapedName}:${s.c}:${s.g}:${s.m}`;
  }).join(',');

  const parts = [
    'v1',
    encodeURIComponent(data.vName),
    encodeURIComponent(data.uni),
    data.sem,
    data.sgpa,
    data.cgpa,
    data.credits,
    data.ts,
    subjectsStr
  ];
  return parts.join('|');
};

const SUBJECT_NICKNAMES: Record<string, string> = {
  // IITM Foundation & Diploma & Degree
  "BSMA1001": "Maths 1",
  "BSMA1002": "Stats 1",
  "BSCS1001": "CT",
  "BSHS1001": "English 1",
  "BSMA1003": "Maths 2",
  "BSMA1004": "Stats 2",
  "BSCS1002": "Python",
  "BSHS1002": "English 2",
  "BSCS2001": "DBMS",
  "BSCS2002": "PDSA",
  "BSCS2003": "MAD 1",
  "BSCS2003P": "MAD 1 Proj",
  "BSCS2005": "Java",
  "BSCS2006": "MAD 2",
  "BSCS2006P": "MAD 2 Proj",
  "BSSE2001": "System Commands",
  "BSCS2004": "MLF",
  "BSMS2001": "BDM",
  "BSCS2007": "MLT",
  "BSSE2002": "TDS",
  "BSCS2008": "MLP",
  "BSCS2008P": "MLP Proj",
  "BSMS2001P": "BDM Proj",
  "BSMS2002": "Business Analytics",
  "BSDA2001": "DL & GenAI",
  "BSDA2001P": "DL & GenAI Proj",
  "BSCS3001": "SE",
  "BSCS3002": "Software Testing",
  "BSGN3001": "SPG",
  "BSBT4001": "Bioinformatics",
  "BSBT4002": "Big Data & Bio",
  "BSCS4001": "Data Viz",
  "BSEE4001": "Speech Tech",
  "BSMS4002": "Design Thinking",
  "BSMS4001": "Industry 4.0",
  "BSMS3002": "Market Research",
  "BSCS4003": "Privacy & Security",
  "BSDA5001": "Intro to Big Data",
  "BSMS4003": "Financial Forensics",
  "BSMA3012": "LSM",
  "BSCS4021": "Adv Algorithms",
  "BSMA3014": "Stat Computing",
  "BSCS3031": "System Design",
  "BSCS3005": "C Programming",
  "BSMA2001": "Math Thinking",
  "BSMS3033": "Managerial Econ",
  "BSMS4023": "Game Theory",
  "BSMS3034": "Corp Finance",
  "BSDA5013": "DL Practice",
  "BSCS4022": "OS",
  "BSDA4001": "DS & AI Lab",
  "BSCS4010": "App Dev Lab",
  "BSCS4024": "Networks",
  "BSCS3021": "TOC",
  "BSCS4032": "Compiler Design",
  "BSMA3001": "Discrete Maths",
  "BSCS3003": "AI Search",
  "BSCS3004": "Deep Learning",
  "BSDA5004": "LLMs",
  "BSDA5002": "Math for GenAI",
  "BSDA5003": "Algorithms for DS",
  "BSDA5014": "MLOps",
  "BSDA5005": "NLP",
  "BSDA5006": "CV",
  "BSDA5007": "RL",
  "BSDA6001": "Responsible AI",
  "BSDA6002": "Stat Learning",
  "BSDA6003": "Deployability of AI",
  "BSDA6004": "Seq Decision Making",
  "BSDA6005": "Info Theory",
  "BSEE5001": "Speech Tech (PG)",
  "BSDA6006": "Research Proj",
  "BSDA6901": "MTech Proj",

  // BTech CSE (LPU or standard)
  "CSE111": "OC 1",
  "CSE326": "IP Lab",
  "INT108": "Python",
  "MTH165": "Maths 1",
  "ECE249": "BEEE",
  "MEC136": "Engineering Drawing",
  "CHE110": "EVS",
  "PHY110": "Physics",
  "ECE279": "BEEE Lab",
  "CSE101": "CP",
  "CSE121": "OC 2",
  "CSE320": "SE",
  "INT306": "DBMS",
  "MTH166": "Maths 2",
  "CSE202": "OOP",
  "CSE205": "DSA",
  "CSE306": "Networks",
  "CSE307": "Internetworking Lab",
  "CSE423": "Cloud Computing",
  "GEN231": "Community Dev Proj",
  "INT335": "Design Thinking",
  "MTH401": "Discrete Maths",
  "FRN601": "French 1",
  "GER601": "German 1",
  "JAP601": "Japanese 1",
  "PEL121": "Comm Skills 1",
  "PEL125": "Comm Skills 1 (Int)",
  "PEL130": "Comm Skills 1 (Adv)",
  "SPA601": "Spanish 1",
  "FRN602": "French 2",
  "GER602": "German 2",
  "JAP602": "Japanese 2",
  "PEL132": "Comm Skills 2",
  "PEL134": "Comm Skills 2 (Int)",
  "PEL136": "Comm Skills 2 (Adv)",
  "SPA602": "Spanish 2",
  "CSE211": "COD",
  "CSE310": "Java",
  "CSE316": "OS",
  "CSE325": "OS Lab",
  "INT428": "AI Essentials",
  "MTH302": "Prob & Stats",
  "PEA305": "Analytical Skills 1",
  "PEA307": "Analytical Skills 1 (Adv)",
  "INT330": "Cloud Solutions",
  "INT242": "Cyber Security",
  "INT217": "Data Management",
  "INT219": "Front End Dev",
  "ECE217": "Intro to IoT",
  "CSE273": "ML Foundations",
  "CSE374": "Adv SE",
  "CSE332": "Ethics & Law",
  "CSE408": "DAA",
  "INT362": "Cloud Arch 1",
  "INT249": "System Admin",
  "INT232": "R Prog",
  "INT222": "Adv Web Dev",
  "ECE341": "Programming IoT",
  "CSE274": "Applied ML",
  "CSE375": "Software Testing",
  "INT363": "Cloud Microservices",
  "INT250": "Digital Evidence",
  "INT374": "Power BI",
  "INT252": "ReactJS",
  "ECE128": "IoT Protocols",
  "CSE471": "DL & CV",
  "CSE376": "Automated Testing",
  "PEA306": "Analytical Skills 2",
  "PEA308": "Analytical Skills 2 (Adv)",
  "CSE329": "Competitive Coding"
};

const simplifySubjectTitle = (code: string, originalTitle: string): string => {
  const normalizedCode = code.trim().toUpperCase();
  return SUBJECT_NICKNAMES[normalizedCode] || originalTitle;
};


interface CGPACalculatorProps {
  userProfile?: UserProfile | null;
  hideHeader?: boolean;
  onBack?: () => void;
}

const CGPACalculator: React.FC<CGPACalculatorProps> = ({ userProfile, hideHeader, onBack }) => {
  const { universityInfo, shortBrandName, selectedUniversity, uniSlug } = useUniversity();
  const [inputMode, setInputMode] = useState<'marks' | 'grades'>('marks');
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [prevCGPA, setPrevCGPA] = useState<number | string>('');
  const [prevTotalCredits, setPrevTotalCredits] = useState<number | string>('');
  const [targetCGPA, setTargetCGPA] = useState<number | string>('');
  const [manualAdjustments, setManualAdjustments] = useState<Record<number, number>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [focusedCourseId, setFocusedCourseId] = useState<string | null>(null);
  const ignoreAutoPopulateRef = useRef(false);

  const defaultProgram = selectedUniversity === 'iitm_bs' ? 'bs-data-science' : 'btech-cse';
  const [selectedProgram, setSelectedProgram] = useState<string>(defaultProgram);

  const currentCurriculum = useMemo(() => {
    return CURRICULUM_REGISTRY[selectedProgram] || BTECH_CSE_2025;
  }, [selectedProgram]);

  const activeProgramSubjects = useMemo(() => {
    const result: Record<number, Array<{ name: string; credits: number }>> = {};

    currentCurriculum.terms.forEach(term => {
      const list: Array<{ name: string; credits: number }> = [];

      // Core subjects
      term.coreSubjects.forEach(s => {
        list.push({
          name: `${s.code}: ${simplifySubjectTitle(s.code, s.title)}`,
          credits: s.credits
        });
      });

      // Elective subjects from baskets
      term.electiveBaskets.forEach(basket => {
        basket.subjects.forEach(s => {
          if (!list.some(item => item.name.startsWith(s.code))) {
            list.push({
              name: `${s.code}: ${simplifySubjectTitle(s.code, s.title)}`,
              credits: s.credits
            });
          }
        });
      });

      result[term.termNumber] = list;
    });

    return result;
  }, [currentCurriculum]);

  useEffect(() => {
    setSelectedProgram(defaultProgram);
    setCurrentSemester(1);
    setManualAdjustments({});
    setCourses([]);
  }, [defaultProgram]);

  // Flattened list for autocomplete lookup
  const allProgramSubjects = useMemo(() => {
    return Object.values(activeProgramSubjects).flat();
  }, [activeProgramSubjects]);

  const findPredefinedSubject = useCallback((name: string) => {
    const cleanName = name.trim().toLowerCase();
    return allProgramSubjects.find(s => s.name.toLowerCase() === cleanName);
  }, [allProgramSubjects]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showGradingStandards, setShowGradingStandards] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClosingShare, setIsClosingShare] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isClosingName, setIsClosingName] = useState(false);
  const [vertoName, setVertoName] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const handleCloseShare = () => {
    setIsClosingShare(true);
    setTimeout(() => {
      setIsShareModalOpen(false);
      setIsClosingShare(false);
    }, 250);
  };

  const handleCloseName = () => {
    setIsClosingName(true);
    setTimeout(() => {
      setIsNameModalOpen(false);
      setIsClosingName(false);
    }, 250);
  };

  const handleGenerateLink = () => {
    const data = {
      sgpa: currentStats.sgpa.toFixed(2),
      cgpa: overallCGPA,
      sem: currentSemester,
      credits: currentStats.totalCredits,
      subjects: courses.map((c, idx) => ({
        n: c.name.trim() || `Subject ${idx + 1}`,
        c: c.credits,
        g: c.grade,
        m: c.marks || 0
      })),
      ts: Date.now(),
      uni: selectedUniversity,
      vName: vertoName.trim() || 'Verto Student'
    };
    const serialized = serializePayload(data);
    const encoded = btoa(encodeURIComponent(serialized));
    const currentBaseUrl = window.location.origin;
    const linkPrefix = uniSlug ? `/${uniSlug}` : '';
    setShareUrl(`${currentBaseUrl}${linkPrefix}/share-cgpa?d=${encoded}`);

    setIsClosingName(true);
    setTimeout(() => {
      setIsNameModalOpen(false);
      setIsClosingName(false);
      setIsShareModalOpen(true);
    }, 250);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const historyPanelRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    ignoreAutoPopulateRef.current = true;
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
    const defaultGrade = selectedUniversity === 'iitm_bs' ? 'U' : 'F';
    setCourses([...courses, { id: Math.random().toString(36).substr(2, 9), name: '', credits: 2, grade: defaultGrade, marks: 0 }]);
  };

  const removeCourse = (id: string) => { setCourses(courses.filter(c => c.id !== id)); };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (updates.name !== undefined) {
          const match = findPredefinedSubject(updates.name);
          if (match) {
            updated.credits = match.credits;
          }
        }
        if (updates.marks !== undefined) updated.grade = getGradeFromMarksForUni(Number(updates.marks), selectedUniversity);
        return updated;
      }
      return c;
    }));
  };

  const currentStats = useMemo(() => {
    let totalPoints = 0, totalCredits = 0;
    const gradePoints = getGradePoints(selectedUniversity);
    const gradeList = getGradeList(selectedUniversity);
    const gradeCounts: Record<string, number> = {};
    gradeList.forEach(g => gradeCounts[g] = 0);
    courses.forEach(c => {
      totalPoints += (gradePoints[c.grade] || 0) * (Number(c.credits) || 0);
      totalCredits += Number(c.credits) || 0;
      gradeCounts[c.grade] = (gradeCounts[c.grade] || 0) + 1;
    });
    const result = { sgpa: totalCredits === 0 ? 0 : totalPoints / totalCredits, totalPoints, totalCredits, gradeCounts };
    return result;
  }, [courses, selectedUniversity]);

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
    const isIITM = selectedUniversity === 'iitm_bs';
    const creditsMap = isIITM ? IITM_TERM_CREDITS : LPU_BTECH_CREDITS;
    for (let i = 1; i < currentSemester; i++) {
      sum += creditsMap[i] || 20;
    }
    return sum;
  }, [prevTotalCredits, currentSemester, selectedUniversity]);

  const overallCGPA = useMemo(() => {
    const pCGPA = Number(prevCGPA) || 0;
    const combinedPoints = (pCGPA * archivedCredits) + currentStats.totalPoints;
    const combinedCredits = archivedCredits + currentStats.totalCredits;
    return combinedCredits === 0 ? 0 : (combinedPoints / combinedCredits);
  }, [prevCGPA, archivedCredits, currentStats]).toFixed(2);

  const roadmapData = useMemo(() => {
    const tCGPA = Number(targetCGPA);
    if (!tCGPA || tCGPA <= 0) return { roadmap: [], summary: null };

    const totalSems = currentCurriculum.terms.length;
    const archivedPoints = (Number(prevCGPA) || 0) * archivedCredits;

    const planSemIndices = [];
    for (let i = currentSemester; i <= totalSems; i++) planSemIndices.push(i);

    if (planSemIndices.length === 0) return { roadmap: [], summary: null };

    const isIITM = selectedUniversity === 'iitm_bs';
    const creditsMap = isIITM ? IITM_TERM_CREDITS : LPU_BTECH_CREDITS;

    const futureCredits = planSemIndices.reduce((sum, sem) => sum + (creditsMap[sem] || 20), 0);
    const totalCreditsForDegree = archivedCredits + futureCredits;
    const totalPointsNeeded = tCGPA * totalCreditsForDegree;
    const pointsNeededFromFuture = totalPointsNeeded - archivedPoints;

    let manualPoints = 0;
    let manualCredits = 0;
    Object.entries(manualAdjustments).forEach(([sem, val]) => {
      const sNum = parseInt(sem);
      if (planSemIndices.includes(sNum)) {
        const semCredits = creditsMap[sNum] || 20;
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
  }, [targetCGPA, prevCGPA, archivedCredits, currentSemester, manualAdjustments, currentCurriculum, selectedUniversity]);

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

  const courseEntriesEl = (
    <div className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] shadow-xs p-5 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
            Course Entries
          </h3>
          {courses.length > 0 && (
            <span className="text-[11px] font-medium bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md">
              {courses.length} {courses.length === 1 ? 'subject' : 'subjects'}
            </span>
          )}
        </div>
        <button
          onClick={addCourse}
          className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-500/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Subject
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="py-12 text-center px-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-3">
            No subjects added yet. Add a subject or load the default curriculum.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={addCourse}
              className="text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Subject
            </button>
            <button
              onClick={() => {
                const defaultSubjects = activeProgramSubjects[currentSemester] || [];
                setCourses(defaultSubjects.map(sub => ({
                  id: Math.random().toString(36).substr(2, 9),
                  name: sub.name,
                  credits: sub.credits,
                  grade: selectedUniversity === 'iitm_bs' ? 'U' : 'F',
                  marks: 0
                })));
              }}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200/80 dark:hover:bg-white/[0.1] px-4 py-2 rounded-full transition-all cursor-pointer border border-zinc-200/60 dark:border-white/[0.08] active:scale-95 shadow-xs"
            >
              Load Default Subjects
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-1 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            <div className="col-span-7">Course / Subject</div>
            <div className="col-span-2 text-center">Credits</div>
            <div className="col-span-2 text-center">{inputMode === 'marks' ? 'Marks' : 'Grade'}</div>
            <div className="col-span-1 text-right"></div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {courses.map((c) => {
              const query = (c.name || '').trim().toLowerCase();
              const filtered = query
                ? allProgramSubjects.filter(s => s.name.toLowerCase().includes(query))
                : (activeProgramSubjects[currentSemester] || []);
              return (
                <div
                  key={c.id}
                  className="flex flex-col sm:grid sm:grid-cols-12 gap-3 items-center"
                >
                  {/* Course Name with Autocomplete */}
                  <div className="col-span-7 w-full relative">
                    <input
                      type="text"
                      placeholder="Course name or code..."
                      value={c.name}
                      onFocus={() => setFocusedCourseId(c.id)}
                      onBlur={() => setTimeout(() => setFocusedCourseId(null), 150)}
                      onChange={(e) => updateCourse(c.id, { name: e.target.value })}
                      className="w-full bg-zinc-100/70 dark:bg-white/[0.04] border border-transparent focus:border-zinc-300 dark:focus:border-white/20 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all"
                    />
                    <div
                      className={`absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 py-1.5 custom-scrollbar transition-all duration-150 ease-out origin-top ${
                        focusedCourseId === c.id && filtered.length > 0
                          ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      {filtered.map((sub, idx) => (
                        <div
                          key={idx}
                          onMouseDown={() => {
                            updateCourse(c.id, { name: sub.name, credits: sub.credits });
                            setFocusedCourseId(null);
                          }}
                          className="px-3.5 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-orange-500/10 hover:text-orange-500 cursor-pointer font-medium transition-colors text-left flex items-center justify-between"
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className="text-[10px] text-zinc-400 shrink-0 ml-2 font-normal">
                            {sub.credits} Cr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="col-span-2 w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2">
                    <span className="text-[11px] font-medium text-zinc-400 sm:hidden">Credits:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={c.credits}
                      onChange={(e) => updateCourse(c.id, { credits: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-zinc-100/70 dark:bg-white/[0.04] border border-transparent focus:border-zinc-300 dark:focus:border-white/20 rounded-xl px-2 py-2 text-xs text-center font-semibold text-zinc-900 dark:text-white outline-none transition-all"
                    />
                  </div>

                  {/* Marks / Grade */}
                  <div className="col-span-2 w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2">
                    <span className="text-[11px] font-medium text-zinc-400 sm:hidden">{inputMode === 'marks' ? 'Marks:' : 'Grade:'}</span>
                    {inputMode === 'marks' ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={c.marks}
                        onChange={(e) => updateCourse(c.id, { marks: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-zinc-100/70 dark:bg-white/[0.04] border border-transparent focus:border-zinc-300 dark:focus:border-white/20 rounded-xl px-2 py-2 text-xs text-center font-semibold text-zinc-900 dark:text-white outline-none transition-all"
                      />
                    ) : (
                      <NexusDropdown
                        options={getGradeList(selectedUniversity)}
                        value={c.grade}
                        onChange={(val) => updateCourse(c.id, { grade: val })}
                        className="w-20"
                        buttonClassName="min-w-0 w-20 bg-zinc-100/70 dark:bg-white/[0.04] border border-transparent hover:border-zinc-300 dark:hover:border-white/20 rounded-xl px-2.5 py-2 text-center text-xs"
                      />
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 w-full sm:w-auto flex justify-end">
                    <button
                      onClick={() => removeCourse(c.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer active:scale-95"
                      title="Remove course"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Bar */}
      <div className="pt-2 flex items-center justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {selectedUniversity === 'iitm_bs' ? 'Level Credits' : 'Semester Credits'}:{' '}
          <span className="font-semibold text-zinc-900 dark:text-white tabular-nums">{currentStats.totalCredits}</span>
        </div>
        <button
          onClick={() => setShowForecast(!showForecast)}
          className={`h-8 px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs ${
            showForecast
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
              : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-white/10 border border-zinc-200/60 dark:border-white/[0.08]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          {showForecast ? 'Hide Forecast' : 'Degree Forecast'}
        </button>
      </div>

      {showForecast && (
        <div className="border-t border-zinc-100 dark:border-white/[0.06] pt-5 space-y-4">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Degree Target</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Forecast individual semester performance required for target CGPA</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Target CGPA:</span>
              <input
                type="number"
                step="0.1"
                max="10"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(e.target.value)}
                className="w-20 h-8 bg-white dark:bg-[#18181c] border border-zinc-200/80 dark:border-white/[0.08] rounded-full px-2.5 text-xs text-center font-bold text-orange-600 dark:text-orange-400 outline-none"
                placeholder="9.0"
              />
            </div>
          </header>

          {Number(targetCGPA) > 0 && roadmapData.summary ? (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {roadmapData.roadmap.map((item) => (
                  <div
                    key={item.sem}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center text-center relative ${
                      item.isManual
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-zinc-200/60 dark:border-white/[0.06] bg-white dark:bg-[#18181b]'
                    }`}
                  >
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
                      {(() => {
                        const isIITM = selectedUniversity === 'iitm_bs';
                        const termName = currentCurriculum.terms.find(t => t.termNumber === item.sem)?.termName || `Term ${item.sem}`;
                        const shortTermName = termName.includes('(') ? termName.split(' ')[0] + ' ' + termName.split(' ')[1] : termName;
                        const label = isIITM ? shortTermName : `Sem ${item.sem}`;
                        const credits = isIITM ? (IITM_TERM_CREDITS[item.sem] || 16) : (LPU_BTECH_CREDITS[item.sem] || 20);
                        return `${label} • ${credits} Cr`;
                      })()}
                    </p>

                    <div className="flex items-center gap-1.5 relative z-10">
                      <button
                        onClick={() => adjustSemTarget(item.sem, -0.1)}
                        className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-white hover:bg-orange-500 hover:text-white transition-colors cursor-pointer active:scale-95"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5"><path d="M5 12h14" /></svg>
                      </button>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white tabular-nums px-1">
                        {item.sgpa.toFixed(1)}
                      </span>
                      <button
                        onClick={() => adjustSemTarget(item.sem, 0.1)}
                        className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-white hover:bg-orange-500 hover:text-white transition-colors cursor-pointer active:scale-95"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>

                    {item.isManual ? (
                      <button onClick={() => resetManual(item.sem)} className="mt-1.5 text-[10px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer font-medium">
                        Reset Lock
                      </button>
                    ) : (
                      <p className="mt-1.5 text-[10px] text-zinc-400 font-medium">Auto</p>
                    )}
                  </div>
                ))}
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                roadmapData.summary.isImpossible
                  ? 'border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400'
                  : 'border-orange-500/20 bg-orange-500/5 text-zinc-700 dark:text-zinc-300'
              }`}>
                <p className="text-xs leading-relaxed font-medium">
                  {roadmapData.summary.isImpossible
                    ? "Target mathematically unreachable. Lower target CGPA or adjust manual limits."
                    : <>Auto-balancing: Remaining unlocked {selectedUniversity === 'iitm_bs' ? 'terms' : 'semesters'} require an average of <strong className="font-semibold text-orange-600 dark:text-orange-400 tabular-nums">{roadmapData.summary.avgNeeded.toFixed(2)} SGPA</strong> to reach <strong className="font-semibold">{targetCGPA}</strong>.</>
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-zinc-400">
              Enter target CGPA above to calculate required future SGPA.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const actionButtonsEl = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className={`h-9 w-9 rounded-full border transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs ${
          isHistoryOpen
            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
            : 'bg-zinc-100 dark:bg-[#18181b] border-zinc-200/40 dark:border-white/[0.04] text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.06]'
        }`}
        title="Archived Reports"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
        </svg>
      </button>

      <button
        onClick={saveSnapshot}
        disabled={isSaving}
        className="h-9 w-9 rounded-full border border-zinc-200/40 dark:border-white/[0.04] bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200/70 dark:hover:bg-white/[0.06] text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
        title="Save Snapshot"
      >
        {isSaving ? (
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        )}
      </button>

      <button
        onClick={() => setIsNameModalOpen(true)}
        className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-full text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share Link</span>
      </button>
    </div>
  );

  const performanceOverviewEl = (
    <div className="space-y-4">
      {/* Desktop Action Row */}
      <div className="hidden lg:flex justify-end">
        {actionButtonsEl}
      </div>

      {/* Apple-Style Metrics Card */}
      <div className="rounded-2xl border border-zinc-200/40 dark:border-white/[0.04] bg-white dark:bg-[#151518] p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-white/[0.06]">
          {/* TGPA / SGPA Column */}
          <div className="flex flex-col items-center justify-center text-center pr-3 sm:pr-6">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-tight">
              {selectedUniversity === 'iitm_bs' ? 'Term SGPA' : 'Semester SGPA'}
            </span>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
              {currentStats.sgpa > 0 ? currentStats.sgpa.toFixed(2) : '0.00'}
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-[130px] sm:max-w-[140px] mt-3">
              <div className="h-1.5 bg-zinc-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, (currentStats.sgpa / 10) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Overall CGPA Column */}
          <div className="flex flex-col items-center justify-center text-center pl-3 sm:pl-6">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 tracking-tight">
              Overall CGPA
            </span>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums">
              {parseFloat(overallCGPA) > 0 ? overallCGPA : '0.00'}
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-[130px] sm:max-w-[140px] mt-3">
              <div className="h-1.5 bg-zinc-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, (parseFloat(overallCGPA) / 10) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] p-5 shadow-xs space-y-3">
        <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Grade Distribution</h4>
        <div className="space-y-2.5">
          {Object.entries(currentStats.gradeCounts)
            .filter(([_, count]) => (count as number) > 0)
            .sort(([gA], [gB]) => (getGradePoints(selectedUniversity)[gB] ?? 0) - (getGradePoints(selectedUniversity)[gA] ?? 0))
            .map(([grade, count]) => {
              const points = getGradePoints(selectedUniversity)[grade] ?? 0;
              const fillPercent = Math.max(8, (points / 10) * 100);
              return (
                <div key={grade} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Grade {grade}</span>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-24 bg-zinc-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-white tabular-nums w-4 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          {courses.length === 0 && (
            <p className="text-[11px] text-zinc-400 italic py-2 text-center">No grades entered yet</p>
          )}
        </div>
      </div>

      {/* Inline Vault History Panel */}
      {isHistoryOpen && (
        <div ref={historyPanelRef} className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] p-4 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Saved Reports</h3>
            <span className="text-[10px] text-zinc-400 font-medium">{history.length} saved</span>
          </div>
          {history.length === 0 ? (
            <p className="text-[11px] text-zinc-400 text-center py-3">No saved reports in vault.</p>
          ) : (
            <div className="space-y-2">
              {history.map(h => (
                <div
                  key={h.id}
                  onClick={() => loadSnapshot(h)}
                  className="p-3 bg-zinc-50/70 dark:bg-white/[0.02] border-none rounded-xl cursor-pointer hover:bg-zinc-100/60 dark:hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-orange-500 transition-colors">
                      {h.label}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteHistory(h.id, e)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 pb-2 w-full">
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
              CGPA <span className="text-orange-500">Hub</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
              Calculate and forecast your semester SGPA and cumulative CGPA
            </p>
          </div>
        </div>

        {/* Program Selector */}
        <div className="flex items-center shrink-0">
          <NexusDropdown
            options={Object.keys(CURRICULUM_REGISTRY)
              .filter(k => selectedUniversity === 'iitm_bs' ? k === 'bs-data-science' : k !== 'bs-data-science')
              .map(k => CURRICULUM_REGISTRY[k].programName)}
            value={CURRICULUM_REGISTRY[selectedProgram]?.programName || (selectedUniversity === 'iitm_bs' ? 'BS Data Science' : 'BTech CSE')}
            onChange={(val) => {
              const key = Object.keys(CURRICULUM_REGISTRY).find(k => CURRICULUM_REGISTRY[k].programName === val) || (selectedUniversity === 'iitm_bs' ? 'bs-data-science' : 'btech-cse');
              setSelectedProgram(key);
              setCurrentSemester(1);
              setManualAdjustments({});
              setCourses([]);
            }}
            align="right"
            className="w-auto shrink-0"
            buttonClassName="h-9 px-4 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-200/30 dark:border-white/[0.04] text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Academic History (If beyond sem 1) */}
      {currentSemester > 1 && (
        <div className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] p-5 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              {selectedUniversity === 'iitm_bs' ? `Academic History (Terms 1 – ${currentSemester - 1})` : `Academic History (Semesters 1 – ${currentSemester - 1})`}
            </h3>
            <span className="text-[11px] text-zinc-400 font-medium">Prior Performance</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">
                {selectedUniversity === 'iitm_bs' ? `CGPA till Term ${currentSemester - 1}` : `CGPA till Sem ${currentSemester - 1}`}
              </label>
              <input
                type="number"
                step="0.01"
                max="10"
                value={prevCGPA}
                onChange={(e) => setPrevCGPA(e.target.value)}
                placeholder="e.g. 8.45"
                className="w-full bg-zinc-100/70 dark:bg-white/[0.04] border border-transparent focus:border-zinc-300 dark:focus:border-white/20 rounded-full px-4 h-9 text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Total Credits Earned</label>
              <input
                type="number"
                value={prevTotalCredits}
                onChange={(e) => setPrevTotalCredits(e.target.value)}
                placeholder={`Default: ${archivedCredits}`}
                className="w-full bg-zinc-100/70 dark:bg-white/[0.04] border border-transparent focus:border-zinc-300 dark:focus:border-white/20 rounded-full px-4 h-9 text-xs font-semibold text-zinc-900 dark:text-white outline-none transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Controls & Courses */}
        <div className="flex-1 w-full space-y-4">
          {/* Controls Bar: Semester Selector + Mode Segmented Control */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <NexusDropdown
                options={currentCurriculum.terms.map(t => t.termName)}
                value={currentCurriculum.terms.find(t => t.termNumber === currentSemester)?.termName || `Semester ${currentSemester}`}
                onChange={(val) => {
                  const term = currentCurriculum.terms.find(t => t.termName === val);
                  if (term) {
                    setCurrentSemester(term.termNumber);
                    setManualAdjustments({});
                    setCourses([]);
                  }
                }}
                className="w-auto shrink-0"
                buttonClassName="h-9 px-4 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-200/30 dark:border-white/[0.04] text-zinc-900 dark:text-white"
              />

              {/* iOS Segmented Pill for Marks / Grades */}
              <div className="h-9 inline-flex p-0.5 rounded-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-200/30 dark:border-white/[0.03] shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setInputMode('marks')}
                  className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    inputMode === 'marks'
                      ? 'bg-white dark:bg-[#27272a] text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  By Marks
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('grades')}
                  className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    inputMode === 'grades'
                      ? 'bg-white dark:bg-[#27272a] text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  By Grades
                </button>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden">
              {actionButtonsEl}
            </div>
          </div>

          {courseEntriesEl}
        </div>

        {/* Right Column: Score Metrics & Distribution */}
        <div className="w-full lg:w-[320px] flex-shrink-0 space-y-4">
          {performanceOverviewEl}
        </div>
      </div>

      {/* Grading Standards Reference Toggle */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowGradingStandards(!showGradingStandards)}
          className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center gap-1.5 h-9 px-4 rounded-full bg-zinc-100 dark:bg-[#18181b] border border-zinc-200/40 dark:border-white/[0.04] cursor-pointer shadow-xs active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3.5 h-3.5 transition-transform duration-200 ${showGradingStandards ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
          {showGradingStandards ? 'Hide Grading Standards' : 'Grading Standards Reference'}
        </button>
      </div>

      {showGradingStandards && (
        <div className="rounded-2xl border border-zinc-200/30 dark:border-white/[0.03] bg-white dark:bg-[#151518] p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
              {selectedUniversity === 'iitm_bs' ? 'IIT Madras' : shortBrandName} Grading Standards
            </h3>
            <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full">Official Scale</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
            {getStandards(selectedUniversity).map((s) => (
              <div key={s.grade} className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04] text-center hover:border-zinc-200 dark:hover:border-white/10 transition-colors">
                <span className="text-lg font-bold text-zinc-900 dark:text-white block">{s.grade}</span>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-0.5">{s.points} Pts</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{s.range}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.04]">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {selectedUniversity === 'iitm_bs' ? (
                <><strong className="text-zinc-900 dark:text-white">Notice:</strong> IIT Madras BS uses absolute grading. S stands for Super (10 pts), A is Excellent (9 pts), and E is the passing threshold (4 pts).</>
              ) : (
                <><strong className="text-zinc-900 dark:text-white">Notice:</strong> {shortBrandName} uses relative grading. These mark ranges represent safe estimates to target specific letter grades.</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && createPortal(
        <div
          className={`modal-overlay ${isClosingShare ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseShare(); }}
        >
          <div className={`nexus-modal w-full max-w-sm p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#18181c] shadow-2xl ${isClosingShare ? 'closing' : ''}`}>
            <button onClick={handleCloseShare} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 text-orange-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white">Share Report</h3>
            <p className="text-zinc-500 text-xs mb-5">Encrypted link generated for your academic snapshot.</p>

            <div className="bg-zinc-50 dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 rounded-2xl p-3.5 mb-5 select-all break-all text-[11px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed max-h-28 overflow-y-auto custom-scrollbar">
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
              className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-semibold text-xs shadow-xs active:scale-[0.98] transition-all border-none cursor-pointer"
            >
              Copy Link
            </button>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {/* Name / Verto Identity Modal */}
      {isNameModalOpen && createPortal(
        <div
          className={`modal-overlay ${isClosingName ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseName(); }}
        >
          <div className={`nexus-modal w-full max-w-sm p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#18181c] shadow-2xl ${isClosingName ? 'closing' : ''}`}>
            <button onClick={handleCloseName} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none flex items-center justify-center cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4 text-orange-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white">Report Author</h3>
            <p className="text-zinc-500 text-xs mb-4">Enter your name to personalize the verified report.</p>

            <div className="space-y-4 mb-5">
              <input
                type="text"
                placeholder="Enter your name..."
                value={vertoName}
                onChange={(e) => setVertoName(e.target.value)}
                className="w-full h-10 bg-zinc-100/70 dark:bg-[#121215] border border-zinc-200/80 dark:border-white/10 rounded-full px-4 text-xs font-semibold dark:text-white outline-none focus:border-orange-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerateLink();
                  }
                }}
              />
            </div>

            <button
              onClick={handleGenerateLink}
              className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-semibold text-xs shadow-xs active:scale-[0.98] transition-all border-none cursor-pointer"
            >
              Generate Share Link
            </button>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default CGPACalculator;
