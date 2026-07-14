import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Info, 
  Calendar, 
  DollarSign, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Search, 
  MapPin, 
  AlertTriangle,
  Mail,
  Phone
} from 'lucide-react';

interface CourseInfo {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string;
  corequisites?: string;
  isLab?: boolean;
  isProject?: boolean;
}

interface LevelInfo {
  name: string;
  credits: number;
  duration: string;
  engagement: string;
  cost: string;
  requirements: string[];
  exits: string[];
  courses: CourseInfo[];
}

interface ProgramDetails {
  title: string;
  totalCredits: number;
  duration: string;
  baseFee: string;
  description: string;
  levels: LevelInfo[];
}

interface DropdownOption {
  value: string;
  label: string;
}

const ThemeDropdown: React.FC<{
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative space-y-1.5 w-full">
      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider pl-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-50 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-white outline-none hover:border-brand-primary/50 transition-all text-left"
      >
        <span>{currentOption.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#0a0a0a] border border-zinc-200/50 dark:border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto no-scrollbar p-1 space-y-0.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-all border-none rounded-lg ${
                  value === opt.value
                    ? 'bg-brand-primary text-white'
                    : 'text-zinc-600 dark:text-zinc-400 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-brand-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DegreeGuide: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<'ds' | 'es'>('ds');
  const [expandedLevel, setExpandedLevel] = useState<number | null>(0);
  const [courseQuery, setCourseQuery] = useState('');
  const [category, setCategory] = useState('General');
  const [income, setIncome] = useState('> 5 LPA');

  const programsData: Record<'ds' | 'es', ProgramDetails> = {
    ds: {
      title: "BS in Data Science & Applications",
      totalCredits: 182,
      duration: "3 – 8 Years",
      baseFee: "₹3.86L – ₹4.50L (BS Degree)",
      description: "A flexible multi-stage program from IIT Madras covering Foundational Math, Python, Databases, Machine Learning, Deep Learning, and MLOps.",
      levels: [
        {
          name: "Foundation Level",
          credits: 32,
          duration: "1 – 3 Years",
          engagement: "10 hrs/course/week",
          cost: "₹48,000",
          requirements: ["Apply and clear the Qualifier Process, OR have qualified for JEE Advanced 2024/2025."],
          exits: ["Exit with a Foundational Certificate in Data Science from CODE, IIT Madras."],
          courses: [
            { code: "BSMA1001", name: "Mathematics for Data Science I", credits: 4 },
            { code: "BSMA1002", name: "Statistics for Data Science I", credits: 4 },
            { code: "BSCS1001", name: "Computational Thinking", credits: 4 },
            { code: "BSHS1001", name: "English I", credits: 4 },
            { code: "BSMA1003", name: "Mathematics for Data Science II", credits: 4, prerequisites: "BSMA1001" },
            { code: "BSMA1004", name: "Statistics for Data Science II", credits: 4, prerequisites: "BSMA1002, BSMA1001", corequisites: "BSMA1003" },
            { code: "BSCS1002", name: "Programming in Python", credits: 4, prerequisites: "BSCS1001" },
            { code: "BSHS1002", name: "English II", credits: 4, prerequisites: "BSHS1001" }
          ]
        },
        {
          name: "Diploma Level (Programming & Data Science)",
          credits: 54,
          duration: "1 – 2 Years",
          engagement: "15 hrs/course/week",
          cost: "₹1,62,000",
          requirements: ["Successfully clear all 8 Foundation Level courses (32 credits)."],
          exits: [
            "Exit with a Diploma in Programming (27 credits).",
            "Exit with a Diploma in Data Science (27 credits).",
            "Exit with both Diplomas (54 credits) and proceed to BSc."
          ],
          courses: [
            { code: "BSCS2001", name: "Database Management Systems", credits: 4 },
            { code: "BSCS2002", name: "Programming, Data Structures & Algorithms (Python)", credits: 4 },
            { code: "BSCS2003", name: "Modern Application Development I", credits: 4, corequisites: "BSCS2001" },
            { code: "BSCS2003P", name: "Modern Application Development I - Project", credits: 2, corequisites: "BSCS2003", isProject: true },
            { code: "BSCS2005", name: "Programming Concepts using Java", credits: 4 },
            { code: "BSCS2006", name: "Modern Application Development II", credits: 4, prerequisites: "BSCS2003" },
            { code: "BSCS2006P", name: "Modern Application Development II - Project", credits: 2, prerequisites: "BSCS2003P", corequisites: "BSCS2006", isProject: true },
            { code: "BSSE2001", name: "System Commands", credits: 3 },
            { code: "BSCS2004", name: "Machine Learning Foundations", credits: 4 },
            { code: "BSMS2001", name: "Business Data Management", credits: 4 },
            { code: "BSCS2007", name: "Machine Learning Techniques", credits: 4, corequisites: "BSCS2004" },
            { code: "BSCS2008", name: "Machine Learning Practice", credits: 4, prerequisites: "BSCS2004, BSCS2007" },
            { code: "BSCS2008P", name: "Machine Learning Practice - Project", credits: 2, corequisites: "BSCS2008", isProject: true },
            { code: "BSSE2002", name: "Tools in Data Science", credits: 3, corequisites: "BSCS2008" },
            { code: "BSMS2001P", name: "Business Data Management - Project (Option 1)", credits: 2, corequisites: "BSMS2001", isProject: true },
            { code: "BSMS2002", name: "Business Analytics (Option 1)", credits: 4, prerequisites: "BSMS2001" },
            { code: "BSDA2001", name: "Deep Learning & Generative AI (Option 2)", credits: 4, corequisites: "BSCS2008" },
            { code: "BSDA2001P", name: "Deep Learning & Generative AI - Project (Option 2)", credits: 2, prerequisites: "BSCS2007", corequisites: "BSCS2008, BSDA2001", isProject: true }
          ]
        },
        {
          name: "BSc Degree Level",
          credits: 28,
          duration: "1 – 2 Years",
          engagement: "15 hrs/course/week",
          cost: "₹1,00,000",
          requirements: ["Earn 86 credits (Foundation + both Diplomas) to register for BSc courses."],
          exits: ["Exit with a BSc Degree in Programming and Data Science from IIT Madras (114 credits total)."],
          courses: [
            { code: "BSCS3001", name: "Software Engineering (Core)", credits: 4 },
            { code: "BSCS3002", name: "Software Testing (Core)", credits: 4 },
            { code: "BSGN3001", name: "Strategies for Professional Growth (Mandatory)", credits: 4 },
            { code: "BSCS3005", name: "Programming in C", credits: 4 },
            { code: "BSMA2001", name: "Mathematical Thinking", credits: 4 },
            { code: "BSMS3002", name: "Market Research", credits: 4 },
            { code: "BSMS3033", name: "Managerial Economics", credits: 4 },
            { code: "BSMS3034", name: "Corporate Finance", credits: 4 },
            { code: "BSBT4001", name: "Algorithmic Thinking in Bioinformatics", credits: 4 },
            { code: "BSCS4001", name: "Data Visualization Design", credits: 4 }
          ]
        },
        {
          name: "BS Degree Level",
          credits: 28,
          duration: "1 – 2 Years",
          engagement: "15 hrs/course/week",
          cost: "₹1,20,000",
          requirements: ["Earn 114 credits and complete all BSc degree level requirements."],
          exits: ["Exit with a BS Degree in Data Science and Applications from IIT Madras (142 credits total)."],
          courses: [
            { code: "BSCS3003", name: "AI: Search Methods for Problem Solving (Core)", credits: 4 },
            { code: "BSCS3004", name: "Deep Learning (Core)", credits: 4 },
            { code: "BSDA5004", name: "Large Language Models", credits: 4 },
            { code: "BSDA5002", name: "Mathematical Foundations of Generative AI", credits: 4 },
            { code: "BSDA5003", name: "Algorithms for Data Science", credits: 4 },
            { code: "BSDA5014", name: "Machine Learning Operations (MLOps)", credits: 4 },
            { code: "BSDA5005", name: "Introduction to NLP", credits: 4 },
            { code: "BSDA5006", name: "Deep Learning for Computer Vision", credits: 4 },
            { code: "BSDA5007", name: "Reinforcement Learning", credits: 4 },
            { code: "BSDA4001", name: "Data Science and AI Lab", credits: 4, isLab: true },
            { code: "BSCS4010", name: "App Dev Lab", credits: 4, isLab: true },
            { code: "BSCS4024", name: "Computer Networks", credits: 4 },
            { code: "BSCS3021", name: "Theory of Computation", credits: 4 }
          ]
        },
        {
          name: "PG Diploma Level (AI & ML)",
          credits: 20,
          duration: "1 – 2 Years",
          engagement: "15 hrs/course/week",
          cost: "₹1,20,000",
          requirements: ["Must complete BS Degree and maintain a minimum CGPA of 8.0."],
          exits: ["Exit with a PG Diploma in Artificial Intelligence & Machine Learning from IIT Madras (162 credits total)."],
          courses: [
            { code: "BSDA5014", name: "MLOps (Core)", credits: 4 },
            { code: "BSDA5002", name: "Mathematical Foundations of Generative AI (Core)", credits: 4 },
            { code: "BSDA5003", name: "Algorithms for Data Science (Core)", credits: 4 },
            { code: "BSDA6001", name: "Responsible AI", credits: 4 },
            { code: "BSDA6002", name: "Statistical Learning Theory", credits: 4 },
            { code: "BSDA6003", name: "Deployability Aspects of AI", credits: 4 },
            { code: "BSDA6004", name: "Sequential Decision Making", credits: 4 },
            { code: "BSDA6005", name: "Information Theory and Learning", credits: 4 },
            { code: "BSDA6006", name: "Research Project", credits: 4, isProject: true }
          ]
        },
        {
          name: "MTech Level (AI & ML)",
          credits: 20,
          duration: "1 Year",
          engagement: "Full Time Project Work",
          cost: "₹2,00,000",
          requirements: ["Complete PG Diploma level (162 credits). Projects can be in a company or research lab."],
          exits: ["Awarded BS + MTech Degree in AI & ML from IIT Madras (182 credits total)."],
          courses: [
            { code: "BSDA6901", name: "MTech Project", credits: 20, isProject: true }
          ]
        }
      ]
    },
    es: {
      title: "BS in Electronic Systems",
      totalCredits: 142,
      duration: "4 – 8 Years",
      baseFee: "₹5,80,000 (Entire Program)",
      description: "An intensive systems-oriented program covering Digital Logic, Analog Electronics, Microprocessors, Signals & Systems, IoT, and Product Design.",
      levels: [
        {
          name: "Foundation Level",
          credits: 43,
          duration: "1 – 3 Years",
          engagement: "10 hrs/course/week",
          cost: "₹82,000",
          requirements: ["Clear the Qualifier Exam, OR direct entry for JEE Advanced qualified candidates."],
          exits: ["Exit with a Foundational Certificate in Electronic Systems from CODE, IIT Madras."],
          courses: [
            { code: "HS1101", name: "English I", credits: 4 },
            { code: "MA1101", name: "Math for Electronics I", credits: 4 },
            { code: "HS1102", name: "English II", credits: 4, prerequisites: "HS1101" },
            { code: "EE1101", name: "Electronic Systems Thinking and Circuits", credits: 4 },
            { code: "EE1901", name: "Electronic Systems Thinking & Circuits Lab", credits: 1, corequisites: "EE1101", isLab: true },
            { code: "CS1101", name: "Introduction to C Programming", credits: 4 },
            { code: "CS1901", name: "C Programming Laboratory", credits: 1, corequisites: "CS1101", isLab: true },
            { code: "CS1102", name: "Introduction to Linux and Programming", credits: 4 },
            { code: "CS1902", name: "Linux Systems Laboratory", credits: 1, corequisites: "CS1102", isLab: true },
            { code: "EE1102", name: "Digital Systems", credits: 4, prerequisites: "CS1101" },
            { code: "EE1103", name: "Electrical and Electronic Circuits", credits: 4, prerequisites: "EE1101 & MA1101" },
            { code: "EE1902", name: "Electronics Laboratory", credits: 3, prerequisites: "EE1901", corequisites: "EE1103 & EE1102", isLab: true },
            { code: "CS2101", name: "Embedded C Programming", credits: 4, prerequisites: "CS1101" },
            { code: "CS2901", name: "Embedded C Programming Laboratory", credits: 1, corequisites: "CS1901 & CS2101", isLab: true }
          ]
        },
        {
          name: "Diploma Level",
          credits: 43,
          duration: "1 – 3 Years",
          engagement: "10 hrs/course/week",
          cost: "₹1,62,000",
          requirements: ["Successfully clear all 14 Foundation Level courses (43 credits)."],
          exits: ["Exit with a Diploma in Electronic Systems from IIT Madras (86 credits total)."],
          courses: [
            { code: "EE2101", name: "Signals and Systems", credits: 4, prerequisites: "EE1103" },
            { code: "EE2102", name: "Analog Electronic Systems", credits: 4, prerequisites: "EE2101" },
            { code: "EE2901", name: "Analog Electronics Laboratory", credits: 3, isLab: true },
            { code: "CS1002", name: "Python Programming", credits: 4 },
            { code: "EE2103", name: "Digital System Design", credits: 4, prerequisites: "EE1102" },
            { code: "EE2902", name: "Digital System Design Laboratory", credits: 1, prerequisites: "EE1902", corequisites: "EE2103", isLab: true },
            { code: "EE3101", name: "Digital Signal Processing", credits: 4, prerequisites: "EE2101" },
            { code: "EE3103", name: "Sensors and Applications", credits: 4, prerequisites: "EE2102" },
            { code: "EE3901", name: "Sensors Laboratory", credits: 3, prerequisites: "EE2901", corequisites: "EE3103", isLab: true },
            { code: "EE4108", name: "Electronic Testing and Measurement", credits: 4 },
            { code: "EE4104", name: "Computer Organisation", credits: 4 },
            { code: "EE3999", name: "Electronics System Project", credits: 2, corequisites: "EE2901, EE3901", isProject: true },
            { code: "EE4999", name: "Signals and Systems Project", credits: 2, corequisites: "EE2101, EE3101", isProject: true }
          ]
        },
        {
          name: "BS Degree Level",
          credits: 56,
          duration: "1 – 3 Years",
          engagement: "10 hrs/course/week",
          cost: "₹3,36,000",
          requirements: ["Successfully clear the Diploma level (86 credits total)."],
          exits: ["Awarded BS Degree in Electronic Systems from IIT Madras (142 credits total)."],
          courses: [
            { code: "MA2101", name: "Math for Electronics II (Core)", credits: 4, prerequisites: "MA1101" },
            { code: "EE4101", name: "Embedded Linux and FPGAs (Core)", credits: 4 },
            { code: "EE4901", name: "Embedded Linux and FPGAs Lab (Core)", credits: 1, corequisites: "EE4101", isLab: true },
            { code: "EE3104", name: "Electromagnetic Fields & Transmission Lines (Core)", credits: 4 },
            { code: "EE4102", name: "Electronic Product Design (Core)", credits: 4 },
            { code: "GN3001", name: "Strategies for Professional Growth (Core)", credits: 4 },
            { code: "EE3102", name: "Control Engineering (Core)", credits: 4, prerequisites: "EE2101" },
            { code: "MA3101", name: "Probability and Statistics (Elective)", credits: 4 },
            { code: "EE4103", name: "Communication Systems (Elective)", credits: 4 },
            { code: "EE5101", name: "Internet of Things (Elective)", credits: 4 },
            { code: "EE3106", name: "Semiconductor Devices & VLSI Tech (Elective)", credits: 4 },
            { code: "EE3107", name: "Analog Circuits (Elective)", credits: 4 },
            { code: "EE5102", name: "Digital IC Design (Elective)", credits: 4 },
            { code: "EE5103", name: "Power Management for Electronic Systems (Elective)", credits: 4 },
            { code: "EE5104", name: "Biomedical Electronic Systems (Elective)", credits: 4 }
          ]
        }
      ]
    }
  };

  const currentProgram = programsData[activeTrack];

  // Waiver Calculation
  const waiverCalculation = useMemo(() => {
    if (activeTrack === 'ds') {
      let waiver = 0;
      let docs = 'None';
      if (category === 'SC / ST' || category === 'PwD') {
        waiver = income === '> 5 LPA' ? 50 : (income === '1 LPA to 5 LPA' ? 50 : 75);
        docs = category === 'SC / ST' ? 'SC/ST Certificate' : 'PwD Certificate';
        if (income === '1 LPA to 5 LPA' || income === '<= 1 LPA') {
          docs += ' + Family Income Certificate';
        }
      } else if (category === 'SC / ST + PwD') {
        waiver = 75;
        docs = 'SC/ST + PwD Certificates';
      } else if (category === 'OBC' || category === 'EWS') {
        if (income === '<= 1 LPA') {
          waiver = 75;
          docs = `${category} Certificate + Family Income Certificate (<= 1 LPA)`;
        } else if (income === '1 LPA to 5 LPA') {
          waiver = 50;
          docs = `${category} Certificate + Family Income Certificate (1-5 LPA)`;
        } else {
          waiver = 0;
          docs = 'Not eligible for waiver';
        }
      } else { // General
        if (income === '<= 1 LPA') {
          waiver = 75;
          docs = 'EWS Certificate + Family Income Certificate (<= 1 LPA)';
        } else if (income === '1 LPA to 5 LPA') {
          waiver = 50;
          docs = 'EWS Certificate + Family Income Certificate (1-5 LPA)';
        } else {
          waiver = 0;
          docs = 'Not eligible for waiver';
        }
      }
      return { waiver, docs };
    } else {
      let waiver = 0;
      let docs = 'None';
      if (category === 'SC / ST' || category === 'PwD') {
        if (income === '<= 1 LPA') {
          waiver = 75;
          docs = `${category} Certificate + Family Income Certificate (<= 1 LPA)`;
        } else {
          waiver = 50;
          docs = `${category} Certificate`;
        }
      } else if (category === 'SC / ST + PwD') {
        waiver = 75;
        docs = 'SC/ST and PwD Certificates';
      } else if (category === 'OBC' || category === 'EWS') {
        if (income === '<= 1 LPA') {
          waiver = 75;
          docs = `${category} Certificate + Family Income Certificate (<= 1 LPA)`;
        } else if (income === '1 LPA to 5 LPA') {
          waiver = 50;
          docs = `${category} Certificate + Family Income Certificate (1-5 LPA)`;
        } else {
          waiver = 0;
          docs = 'Not eligible for waiver';
        }
      } else {
        waiver = 0;
        docs = 'Not eligible for waiver';
      }
      return { waiver, docs };
    }
  }, [activeTrack, category, income]);

  const categoryOptions: DropdownOption[] = [
    { value: 'General', label: 'General' },
    { value: 'OBC', label: 'OBC-NCL' },
    { value: 'EWS', label: 'EWS' },
    { value: 'SC / ST', label: 'SC / ST' },
    { value: 'PwD', label: 'PwD' },
    { value: 'SC / ST + PwD', label: 'SC / ST + PwD' }
  ];

  const incomeOptions: DropdownOption[] = [
    { value: '<= 1 LPA', label: '≤ 1 LPA' },
    { value: '1 LPA to 5 LPA', label: '1 LPA to 5 LPA' },
    { value: '> 5 LPA', label: '> 5 LPA' }
  ];

  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-8 bg-transparent text-zinc-700 dark:text-zinc-200">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-white/5 pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-brand-primary font-bold">
            Curriculum Explorer
          </span>
          <h1 className="text-xl md:text-2xl font-semibold mt-1 text-zinc-900 dark:text-white tracking-tight">
            IIT Madras BS Degree Programs
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1">
            Overall structure, credits, category-based fee waivers, and course matrices.
          </p>
        </div>

        {/* Dynamic Track Toggle */}
        <div className="bg-zinc-100 dark:bg-white/5 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/50 dark:border-white/10">
          <button 
            onClick={() => { setActiveTrack('ds'); setExpandedLevel(0); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border-none ${
              activeTrack === 'ds' 
                ? 'bg-brand-primary text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white bg-transparent'
            }`}
          >
            Data Science & Apps
          </button>
          <button 
            onClick={() => { setActiveTrack('es'); setExpandedLevel(0); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border-none ${
              activeTrack === 'es' 
                ? 'bg-brand-primary text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white bg-transparent'
            }`}
          >
            Electronic Systems
          </button>
        </div>
      </header>

      {/* Mini Stats (Clean, minimal rows) */}
      <section className="max-w-6xl mx-auto mb-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 text-brand-primary">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Total Credits</p>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">{currentProgram.totalCredits} Credits</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 text-amber-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Completion Pace</p>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">{currentProgram.duration}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Estimated Cost</p>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mt-0.5 leading-snug">{currentProgram.baseFee}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 text-blue-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Exit Option</p>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">Flexible exit</h3>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Program Timeline & Level breakdowns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <BookOpen className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Level Progression</h2>
          </div>

          <div className="space-y-4">
            {currentProgram.levels.map((level, index) => {
              const isOpen = expandedLevel === index;
              return (
                <div 
                  key={index}
                  className={`border-b border-zinc-100 dark:border-white/5 pb-4 transition-all duration-300`}
                >
                  <button
                    onClick={() => setExpandedLevel(isOpen ? null : index)}
                    className="w-full flex items-center justify-between py-3 text-left border-none bg-transparent hover:opacity-80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isOpen ? 'bg-brand-primary text-white' : 'bg-zinc-100 dark:bg-white/5 text-zinc-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{level.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {level.credits} Credits • {level.duration} • {level.engagement}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-brand-primary" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-9 pt-2 space-y-5"
                      >
                        {/* Prerequisites & Exits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-white/[0.01] p-4 rounded-xl">
                          <div>
                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Prerequisites</p>
                            <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px]">
                              {level.requirements.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Exits</p>
                            <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px]">
                              {level.exits.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Search and Table */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Courses</span>
                            <div className="relative">
                              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                              <input 
                                type="text" 
                                value={courseQuery}
                                onChange={(e) => setCourseQuery(e.target.value)}
                                placeholder="Filter courses..." 
                                className="pl-7 pr-3 py-1.5 w-36 bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-lg text-[10px] font-medium outline-none focus:ring-1 focus:ring-brand-primary"
                              />
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-zinc-200 dark:border-white/10 text-[10px] text-zinc-400 uppercase font-medium">
                                  <th className="py-2 pr-4 font-semibold">Code</th>
                                  <th className="py-2 pr-4 font-semibold">Title</th>
                                  <th className="py-2 pr-4 font-semibold text-center">Credits</th>
                                  <th className="py-2 pr-4 font-semibold">Prerequisites</th>
                                </tr>
                              </thead>
                              <tbody>
                                {level.courses
                                  .filter(c => c.name.toLowerCase().includes(courseQuery.toLowerCase()) || c.code.toLowerCase().includes(courseQuery.toLowerCase()))
                                  .map((course, cIdx) => (
                                    <tr 
                                      key={cIdx} 
                                      className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-100/10 dark:hover:bg-white/[0.01] transition-colors"
                                    >
                                      <td className="py-2.5 pr-4 font-bold text-brand-primary">{course.code}</td>
                                      <td className="py-2.5 pr-4 font-medium text-zinc-700 dark:text-zinc-300">
                                        {course.name}
                                        {course.isLab && <span className="ml-1.5 px-1 py-0.2 bg-blue-500/10 text-blue-500 text-[8px] font-bold rounded">Lab</span>}
                                        {course.isProject && <span className="ml-1.5 px-1 py-0.2 bg-purple-500/10 text-purple-500 text-[8px] font-bold rounded">Project</span>}
                                      </td>
                                      <td className="py-2.5 pr-4 font-bold text-center">{course.credits}</td>
                                      <td className="py-2.5 pr-4 text-zinc-500 text-[11px]">{course.prerequisites || 'None'}</td>
                                    </tr>
                                  ))
                                }
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Simple Waiver & Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Minimal Waiver Calculator */}
          <div className="border border-zinc-200/50 dark:border-white/10 bg-white/40 dark:bg-white/[0.01] p-6 rounded-2xl space-y-5">
            <div>
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Fee Waiver Calculator</h3>
              <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                Determine your category-based fee waivers and requirements.
              </p>
            </div>

            <div className="space-y-4">
              <ThemeDropdown 
                label="Category"
                options={categoryOptions}
                value={category}
                onChange={setCategory}
              />

              <ThemeDropdown 
                label="Annual Income"
                options={incomeOptions}
                value={income}
                onChange={setIncome}
              />

              <div className="pt-2">
                <div className="p-4 bg-brand-primary/[0.02] border border-brand-primary/20 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Fee Waiver</span>
                  <span className="text-sm font-bold text-brand-primary">{waiverCalculation.waiver}% Support</span>
                </div>
                <div className="mt-2.5 pl-1">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Documents Required</span>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">{waiverCalculation.docs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Program Guidelines */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider pl-1">Guidelines</h3>
            <div className="space-y-3.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <div className="flex gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Term Schedule:</strong> Three terms per year (January, May, and September), each 12 weeks with 2 invigilated quizzes.
                </div>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">In-Person Exams:</strong> Invigilated quizzes and End Terms are conducted at centres across India and overseas.
                </div>
              </div>
              <div className="flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Lab Experiments:</strong> ES lab courses require physical visits to the IIT Madras campus for final evaluation.
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-t border-zinc-200/50 dark:border-white/10 pt-6 space-y-2.5 text-[10px] text-zinc-400">
            <h4 className="font-bold text-brand-primary uppercase tracking-wider">IIT Madras BS Office</h4>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>3rd Floor, ICSR Building, IIT Madras, Chennai - 600036</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{activeTrack === 'ds' ? 'support@study.iitm.ac.in' : 'support-es@study.iitm.ac.in'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{activeTrack === 'ds' ? '7850999966' : '+91-9711397993'}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DegreeGuide;
