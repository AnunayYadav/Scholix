
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

  useEffect(() => {
    if (ignoreAutoPopulateRef.current) {
      ignoreAutoPopulateRef.current = false;
      return;
    }
    const defaultSubjects = activeProgramSubjects[currentSemester] || [];
    if (defaultSubjects.length > 0) {
      setCourses(defaultSubjects.map(sub => ({
        id: Math.random().toString(36).substr(2, 9),
        name: sub.name,
        credits: sub.credits,
        grade: selectedUniversity === 'iitm_bs' ? 'U' : 'F',
        marks: 0
      })));
    } else {
      setCourses([]);
    }
  }, [currentSemester, activeProgramSubjects, selectedUniversity]);

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
    <div className="glass-panel p-8 rounded-[40px] space-y-6 shadow-sm border dark:border-white/5 bg-white dark:bg-[#0a0a0a]/40 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] sm:text-xs text-zinc-400">Course entries</h3>
          {courses.length > 0 && (
            <span className="text-[9px] sm:text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
              {courses.length} {courses.length === 1 ? 'subject' : 'subjects'}
            </span>
          )}
        </div>
        <button onClick={addCourse} className="text-[11px] sm:text-xs font-medium text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 px-6 py-2.5 rounded-xl border border-brand-primary/20 transition-all border-none">+ Add field</button>
      </div>
      
      {courses.length === 0 ? (
        <div className="py-16 text-center border-4 border-dashed border-zinc-100 dark:border-white/5 rounded-[40px] opacity-40 text-[11px] sm:text-xs">No courses added yet</div>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => {
            const query = (c.name || '').trim().toLowerCase();
            const filtered = query
              ? allProgramSubjects.filter(s => s.name.toLowerCase().includes(query))
              : (activeProgramSubjects[currentSemester] || []);
            return (
              <div key={c.id} className="flex flex-col md:flex-row items-center gap-4 bg-zinc-50 dark:bg-[#0a0a0a]/40 p-5 rounded-[32px] border border-zinc-100 dark:border-white/5 transition-all hover:border-brand-primary/20">
                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={c.name}
                    onFocus={() => setFocusedCourseId(c.id)}
                    onBlur={() => setTimeout(() => setFocusedCourseId(null), 150)}
                    onChange={(e) => updateCourse(c.id, { name: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl px-5 py-3 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/50"
                  />
                  <div className={`absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50 py-1.5 custom-scrollbar transition-all duration-100 ease-out origin-top ${
                    focusedCourseId === c.id && filtered.length > 0
                      ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                  }`}>
                    {filtered.map((sub, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          updateCourse(c.id, { name: sub.name, credits: sub.credits });
                          setFocusedCourseId(null);
                        }}
                        className="px-5 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-brand-primary/10 hover:text-brand-primary cursor-pointer font-semibold transition-colors text-left"
                      >
                        {sub.name} <span className="opacity-50 font-normal ml-1">({sub.credits} Credits)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="space-y-1">
                    <p className="text-[11px] sm:text-xs text-zinc-400 text-center">Credits</p>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={c.credits}
                      onChange={(e) => updateCourse(c.id, { credits: parseInt(e.target.value) || 0 })}
                      className="w-16 bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl px-3 py-3 text-xs text-center font-semibold dark:text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] sm:text-xs text-zinc-400 text-center">{inputMode === 'marks' ? 'Marks' : 'Grade'}</p>
                    {inputMode === 'marks' ? (
                      <input type="number" min="0" max="100" value={c.marks} onChange={(e) => updateCourse(c.id, { marks: parseInt(e.target.value) || 0 })} className="w-20 bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl px-3 py-3 text-xs text-center font-semibold dark:text-white outline-none" />
                    ) : (
                      <NexusDropdown
                        options={getGradeList(selectedUniversity)}
                        value={c.grade}
                        onChange={(val) => updateCourse(c.id, { grade: val })}
                        className="w-24"
                      />
                    )}
                  </div>
                  <button onClick={() => removeCourse(c.id)} className="p-3 text-brand-secondary opacity-20 hover:opacity-100 border-none bg-transparent mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-zinc-100 dark:border-white/5 pt-6 flex items-center justify-between">
        <div className="text-[11px] sm:text-xs text-zinc-400 font-semibold">
          {selectedUniversity === 'iitm_bs' ? 'Total Level Credits' : 'Total Semester Credits'}: <span className="text-zinc-800 dark:text-white font-bold">{currentStats.totalCredits}</span>
        </div>
        <button 
          onClick={() => setShowForecast(!showForecast)}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border-none ${
            showForecast 
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          {showForecast ? 'Hide Forecast' : 'Degree Forecast'}
        </button>
      </div>

      {showForecast && (
        <div className="search-dropdown-anim border border-brand-primary/20 bg-brand-primary/[0.02] p-6 sm:p-8 rounded-[32px] space-y-6 mt-4">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-[11px] sm:text-xs font-bold text-brand-primary uppercase tracking-wider">Degree target</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">Forecast individual semester performance required for target CGPA</p>
            </div>
            <div className="relative">
              <input 
                type="number" 
                step="0.1" 
                max="10" 
                value={targetCGPA} 
                onChange={(e) => setTargetCGPA(e.target.value)} 
                className="w-24 bg-white dark:bg-[#0a0a0a]/60 border border-brand-primary/30 rounded-xl px-3 py-2 text-sm text-center font-bold text-brand-primary outline-none focus:ring-4 focus:ring-brand-primary/10" 
                placeholder="9.0" 
              />
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center text-white text-[9px] font-black">!</span>
            </div>
          </header>

          {Number(targetCGPA) > 0 && roadmapData.summary ? (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roadmapData.roadmap.map((item) => (
                  <div key={item.sem} className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${item.isManual ? 'bg-brand-primary/10 border-brand-primary/30 shadow-lg' : 'bg-white dark:bg-[#0a0a0a] border-zinc-100 dark:border-white/5'}`}>
                    <p className="text-[10px] text-zinc-400 mb-2">
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
                      <button onClick={() => adjustSemTarget(item.sem, -0.1)} className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-600 dark:text-white hover:bg-brand-primary hover:text-white transition-all border-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M5 12h14" /></svg>
                      </button>
                      <span className={`text-base font-bold tracking-tight text-brand-primary`}>{item.sgpa.toFixed(1)}</span>
                      <button onClick={() => adjustSemTarget(item.sem, 0.1)} className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-600 dark:text-white hover:bg-brand-primary hover:text-white transition-all border-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>

                    {item.isManual ? (
                      <button onClick={() => resetManual(item.sem)} className="mt-2 text-[9px] text-brand-primary hover:underline border-none bg-transparent flex items-center gap-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2 h-2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        Locked • Reset
                      </button>
                    ) : (
                      <p className="mt-2 text-[9px] text-zinc-400">Auto balancing</p>
                    )}

                    {item.isManual && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-brand-primary rounded-bl-sm" />}
                  </div>
                ))}
              </div>

              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${roadmapData.summary.isImpossible ? 'bg-brand-secondary/10 border-brand-secondary/20' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0 font-black text-xs ${roadmapData.summary.isImpossible ? 'bg-brand-secondary' : 'bg-brand-primary'}`}>
                  {roadmapData.summary.isImpossible ? '!' : 'i'}
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {roadmapData.summary.isImpossible
                    ? "Target mathematically unreachable. Reduce manual locks or lower target CGPA."
                    : <>Auto-balancing: Remaining unlocked {selectedUniversity === 'iitm_bs' ? 'terms' : 'semesters'} now require an average of <strong className="text-brand-primary">{roadmapData.summary.avgNeeded.toFixed(2)} SGPA</strong> to maintain your <strong className="text-brand-primary">{targetCGPA}</strong> goal.</>
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-white/5 rounded-2xl opacity-40">
              <p className="text-[11px] sm:text-xs text-zinc-500">Enter target CGPA to run simulation</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const actionButtonsEl = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        className={`p-2 transition-all border-none bg-transparent flex items-center justify-center ${
          isHistoryOpen ? 'text-brand-primary' : 'text-zinc-400 hover:text-brand-primary'
        }`}
        title="Archived Reports"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
      </button>

      <button
        onClick={saveSnapshot}
        disabled={isSaving}
        className={`p-2 transition-all border-none bg-transparent flex items-center justify-center ${
          isSaving ? 'opacity-50' : 'text-zinc-400 hover:text-emerald-500'
        }`}
        title="Save to Vault"
      >
        {isSaving ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>}
      </button>

      <button onClick={() => {
        setIsNameModalOpen(true);
      }} className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-[10px] md:text-xs font-semibold shadow-lg shadow-brand-primary/20 active:scale-95 transition-all flex items-center gap-1.5 border-none">
        Generate Link
      </button>
    </div>
  );

  const performanceOverviewEl = (
    <div className="space-y-6">
      {/* Clean Individual Actions Row (Hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex justify-end px-1">
        {actionButtonsEl}
      </div>

      {/* Unified Score Card Box */}
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-none shadow-xl relative overflow-hidden group rounded-[40px] p-8 min-h-[150px]">
        {/* Glow Effects */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 blur-[30px] rounded-full pointer-events-none transition-transform group-hover:scale-125 duration-700" />
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 blur-[30px] rounded-full pointer-events-none transition-transform group-hover:scale-125 duration-700" />
        
        <div className="grid grid-cols-2 gap-4 relative z-10 divide-x divide-white/15">
          {/* SGPA Section */}
          <div className="text-center px-2">
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">TGPA</p>
            <p className="text-4xl font-extrabold text-white mt-3 leading-none tracking-tight">{currentStats.sgpa.toFixed(2)}</p>
            <div className="w-full mt-4 px-2">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${(currentStats.sgpa / 10) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* CGPA Section */}
          <div className="text-center px-2">
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Overall CGPA</p>
            <p className="text-4xl font-extrabold text-white mt-3 leading-none tracking-tight">{overallCGPA}</p>
            <div className="w-full mt-4 px-2">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${(parseFloat(overallCGPA) / 10) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="glass-panel p-8 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/20">
        <h4 className="text-[11px] sm:text-xs text-zinc-400 mb-4 uppercase tracking-wider font-bold">Grade distribution</h4>
        <div className="space-y-3">
          {Object.entries(currentStats.gradeCounts)
            .filter(([_, count]) => (count as number) > 0)
            .map(([grade, count]) => (
              <div key={grade} className="flex items-center justify-between text-xs">
                <span className="font-semibold dark:text-white">Grade {grade}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary" style={{ width: `${((count as number) / courses.length) * 100}%` }} />
                  </div>
                  <span className="font-bold text-brand-primary w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          {courses.length === 0 && (
            <p className="text-[10px] font-bold text-zinc-400 uppercase italic opacity-60">Awaiting grade input...</p>
          )}
        </div>
      </div>

      {/* Inline Vault History Panel */}
      {isHistoryOpen && (
        <div ref={historyPanelRef} className="glass-panel p-6 rounded-[32px] border border-brand-primary/20 bg-brand-primary/[0.03] animate-fade-in space-y-4">
          <h3 className="text-[11px] sm:text-xs font-semibold text-brand-primary uppercase tracking-wider">Saved reports</h3>
          {history.length === 0 ? <p className="text-[10px] font-bold text-zinc-400 uppercase italic opacity-60 text-center py-4">Vault empty.</p> : (
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} onClick={() => loadSnapshot(h)} className="p-4 bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-white/5 rounded-2xl cursor-pointer hover:border-brand-primary/50 transition-all flex items-center justify-between shadow-sm">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-semibold dark:text-white truncate">{h.label}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => deleteHistory(h.id, e)} className="p-1.5 text-brand-secondary opacity-25 hover:opacity-100 border-none bg-transparent flex-shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );



  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
      <div className="flex flex-row items-center justify-between gap-4 mb-8 border-b border-zinc-100 dark:border-white/5 pb-6 w-full">
        <div>
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tighter">
            CGPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Hub</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] sm:text-xs mt-1">Calculate and forecast your SGPA and CGPA</p>
        </div>

        {/* Program Selector Only */}
        <div className="flex flex-wrap items-center gap-3">
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
          />
        </div>
      </div>

      {/* Vault history moved inline into performanceOverviewEl */}

      {currentSemester > 1 && (
        <div className="glass-panel p-8 rounded-[40px] border border-brand-primary/20 bg-brand-primary/[0.02] shadow-sm mb-8 animate-fade-in">
          <h3 className="text-[11px] sm:text-xs font-medium text-brand-primary mb-6">
            {selectedUniversity === 'iitm_bs' ? `Academic history (Terms 1 – ${currentSemester - 1})` : `Academic history (Sems 1 – ${currentSemester - 1})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] sm:text-xs text-zinc-400 mb-2 ml-1">
                {selectedUniversity === 'iitm_bs' ? `CGPA till Term ${currentSemester - 1}` : `CGPA till Sem ${currentSemester - 1}`}
              </label>
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

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="flex-1 w-full lg:max-w-[550px] space-y-6">
          {/* Semester and Mode Dropdowns (Outside of header but on top) */}
          <div className="flex flex-row items-center justify-between gap-3 px-1 w-full">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <NexusDropdown
                options={currentCurriculum.terms.map(t => t.termName)}
                value={currentCurriculum.terms.find(t => t.termNumber === currentSemester)?.termName || `Semester ${currentSemester}`}
                onChange={(val) => {
                  const term = currentCurriculum.terms.find(t => t.termName === val);
                  if (term) {
                    setCurrentSemester(term.termNumber);
                    setManualAdjustments({});
                  }
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
            <div className="flex lg:hidden">
              {actionButtonsEl}
            </div>
          </div>
          {courseEntriesEl}
        </div>
        <div className="w-full lg:w-[290px] flex-shrink-0 space-y-6">
          {performanceOverviewEl}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button 
          onClick={() => setShowGradingStandards(!showGradingStandards)}
          className="text-xs font-semibold text-zinc-400 hover:text-brand-primary transition-all flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 hover:border-brand-primary/30 active:scale-95 duration-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`w-4 h-4 transition-transform duration-200 ${showGradingStandards ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
          {showGradingStandards ? 'Hide Grading Standards' : 'Show Grading Standards Reference'}
        </button>
      </div>

      {showGradingStandards && (
        <div className="search-dropdown-anim glass-panel p-8 rounded-[40px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]/60 shadow-sm overflow-hidden">
          <header className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] sm:text-xs font-semibold text-brand-primary">
              {selectedUniversity === 'iitm_bs' ? 'IIT Madras' : shortBrandName} grading standards
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-full">Standard Reference</span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getStandards(selectedUniversity).map((s) => (
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
              {selectedUniversity === 'iitm_bs' ? (
                <><strong className="text-brand-primary">Pro Tip:</strong> IIT Madras BS program uses absolute grading. S stands for Super (10 points), A is Excellent (9 points), and E is the minimum passing grade (4 points).</>
              ) : (
                <><strong className="text-brand-primary">Pro Tip:</strong> {shortBrandName} uses relative grading based on class performance. These mark ranges are "Safe Estimates" to ensure you hit your target grade regardless of class average shifts.</>
              )}
            </p>
          </div>
        </div>
      )}

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

            <div className="bg-zinc-50 dark:bg-[#0a0a0a]/50 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 mb-8 select-all break-all text-[11px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed shadow-inner max-h-32 overflow-y-auto custom-scrollbar">
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
      {isNameModalOpen && createPortal(
        <div
          className={`modal-overlay ${isClosingName ? 'closing' : ''}`}
          style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseName(); }}
        >
          <div className={`nexus-modal w-full max-w-sm p-10 ${isClosingName ? 'closing' : ''}`}>
            <button onClick={handleCloseName} className="absolute top-8 right-8 p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors border-none bg-transparent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="w-20 h-20 bg-brand-primary/10 rounded-[32px] flex items-center justify-center mb-8 border border-brand-primary/20 relative group/icon">
              <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 text-brand-primary relative z-10">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h3 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white leading-none">Verto Identity</h3>
            <p className="text-zinc-500 text-[11px] sm:text-xs mb-8">Enter your name to personalize the verified report.</p>

            <div className="space-y-4 mb-8">
              <input
                type="text"
                placeholder="Enter Verto's Name"
                value={vertoName}
                onChange={(e) => setVertoName(e.target.value)}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:ring-2 focus:ring-brand-primary"
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
              className="w-full py-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-[24px] font-bold text-sm shadow-xl shadow-brand-primary/20 active:scale-95 transition-all border-none"
            >
              Generate Protocol
            </button>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default CGPACalculator;
