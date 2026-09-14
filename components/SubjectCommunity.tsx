import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Users, BookOpen, MessageSquare, HelpCircle, Calendar, Plus,
  Search, Shield, Check, Flame, Trophy, Map as MapIcon, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Sparkles, Send, Edit, FileText, Download, Upload, Award, Code, Database,
  Terminal, Globe, Book, Video, FlaskConical, ClipboardList, Scroll, Folder, MessageCircle, Pin,
  Languages, Bell, BellOff, MoreHorizontal, Cpu, Monitor, Sigma, ChevronDown, ChevronRight, Compass, Landmark,
  Link, Image, Smile, Bold, Italic, Strikethrough, List, ListOrdered, AlertTriangle, Quote, BarChart2,
  Share2, ArrowBigUp, ArrowBigDown, Pencil, Trash2, Info,
  UploadCloud, Archive, LayoutGrid
} from 'lucide-react';
import { Folder as FolderType, LibraryFile, UserProfile } from '../types';
import {
  CommunityPost, MaterialRequest, StudyPack, WikiSection, SubjectChatMsg, SubjectStats
} from '../types/communityTypes';
import CommunityService, { uploadCommunityImage } from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { askGeminiText } from '../services/geminiService';
import FileDetailPage from './FileDetailPage';
import PDFViewer from './PDFViewer.tsx';
import ModernPDFViewer from './pdf/ModernPDFViewer.tsx';
import { FileIcon, getDisplayFileNameWithExtension } from './FileIcon';
import { EmptyStateNoDocument } from './EmptyStateNoDocument';
import { showToast } from './Toast';
import { findSubjectMetadata, getProgramCurriculum } from '../data/curriculumData';
import { getSubjectCurriculum, getSubjectCurriculumEntry, SubjectCurriculumRecord } from '../data/subjectCatalog';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// CodeMirror 6 Imports
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, tooltips } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { html as langHtml } from "@codemirror/lang-html";
import { css as langCss } from "@codemirror/lang-css";
import { sql as langSql } from "@codemirror/lang-sql";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { abbreviationTracker } from "@emmetio/codemirror6-plugin";

interface SubjectCommunityProps {
  activeSubject: FolderType;
  activeSemester: FolderType | null;
  selectedProgram: string;
  userProfile: UserProfile | null;
  categories: FolderType[];
  allFiles: LibraryFile[];
  allFolders?: FolderType[];
  userProgressList?: { document_id: string; progress_percentage: number; last_read_page: number }[];
  onFileAccess: (file: LibraryFile) => void;
  onUploadClick: (categoryName?: string) => void;
  onBack: () => void;
  searchQuery?: string;
  onRefresh?: () => void;
  isAdmin?: boolean;
  onAddFolder?: () => void;
  onEditFolder?: (folder: FolderType, e: React.MouseEvent) => void;
  onDeleteFolder?: (folder: FolderType, e: React.MouseEvent) => void;
  onDropFiles?: (files: File[], categoryName?: string) => void;
  onVaultClick?: () => void;
  onAdminReviewClick?: () => void;
}

const getSubjectTheme = (nameOrCode: string, folderColor?: string, folderIcon?: string, sectionName?: string) => {
  const c = nameOrCode.toUpperCase().trim();
  const sec = (sectionName || '').toUpperCase().trim();
  
  const IconMap: { [key: string]: any } = {
    Code: <Code className="w-5 h-5 text-white" strokeWidth={3} />,
    Database: <Database className="w-5 h-5 text-white" strokeWidth={3} />,
    Compass: <Compass className="w-5 h-5 text-white" strokeWidth={3} />,
    Terminal: <Terminal className="w-5 h-5 text-white" strokeWidth={3} />,
    Globe: <Globe className="w-5 h-5 text-white" strokeWidth={3} />,
    Languages: <Languages className="w-5 h-5 text-white" strokeWidth={3} />,
    MessageSquare: <MessageSquare className="w-5 h-5 text-white" strokeWidth={3} />,
    Landmark: <Landmark className="w-5 h-5 text-white" strokeWidth={3} />,
    BookOpen: <BookOpen className="w-5 h-5 text-white" strokeWidth={3} />,
    FileText: <FileText className="w-5 h-5 text-white" strokeWidth={3} />,
    Cpu: <Cpu className="w-5 h-5 text-white" strokeWidth={3} />,
    Monitor: <Monitor className="w-5 h-5 text-white" strokeWidth={3} />,
    Sigma: <Sigma className="w-5 h-5 text-white" strokeWidth={3} />,
    Folder: <Folder className="w-5 h-5 text-white" strokeWidth={3} />,
    HelpCircle: <HelpCircle className="w-5 h-5 text-white" strokeWidth={3} />,
    Video: <Video className="w-5 h-5 text-white" strokeWidth={3} />
  };

  const customIcon = folderIcon && IconMap[folderIcon] ? IconMap[folderIcon] : null;

  // 1. Languages / Communication / Soft Skills / Language Electives -> PINK (#ec4899)
  if (
    sec.includes('LANG') ||
    c.includes('FRN') || 
    c.includes('GER') || 
    c.includes('JAP') || 
    c.includes('SPA') || 
    c.includes('FRENCH') || 
    c.includes('GERMAN') || 
    c.includes('JAPANESE') || 
    c.includes('SPANISH') || 
    c.includes('LANGUAGE') ||
    c.includes('COMMUNICATION') ||
    c.includes('PEL')
  ) {
    return {
      text: 'text-pink-500',
      bg: 'bg-pink-500',
      lightBg: 'bg-pink-500/10 dark:bg-pink-500/10',
      border: 'border-pink-500/20',
      gradient: 'from-pink-500 to-rose-500',
      icon: customIcon || <Languages className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ec4899'
    };
  }

  // 2. Core Electives / Elective Baskets -> PURPLE (#a855f7)
  if (sec.includes('ELECTIVE')) {
    return {
      text: 'text-purple-500',
      bg: 'bg-purple-500',
      lightBg: 'bg-purple-500/10 dark:bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-indigo-500',
      icon: customIcon || <Code className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#a855f7'
    };
  }

  // 3. Dedicated Project / Lab Basket -> AMBER / ORANGE (#ff7a00)
  if (sec.includes('PROJECT') || sec.includes('COMMUNITY') || sec.includes('LAB')) {
    return {
      text: 'text-amber-500',
      bg: 'bg-amber-500',
      lightBg: 'bg-amber-500/10 dark:bg-amber-500/10',
      border: 'border-amber-500/20',
      gradient: 'from-amber-500 to-orange-500',
      icon: customIcon || <Globe className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ff7a00'
    };
  }

  // 4. Core Courses, Other & Custom Courses -> CYAN / TEAL (#06b6d4)
  const isMath = c.includes('MTH') || c.includes('MATH') || c.includes('CALCULUS') || c.includes('STATISTICS');
  const isCode = c.includes('PROGRAMMING') || c.includes('PYTHON') || c.includes('INT') || c.includes('CSE');
  
  return {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500',
    lightBg: 'bg-cyan-500/10 dark:bg-cyan-500/10',
    border: 'border-cyan-500/20',
    gradient: 'from-cyan-500 to-blue-500',
    icon: customIcon || (isMath ? <Sigma className="w-5 h-5 text-white" strokeWidth={3} /> : isCode ? <Code className="w-5 h-5 text-white" strokeWidth={3} /> : <Monitor className="w-5 h-5 text-white" strokeWidth={3} />),
    rawColor: '#06b6d4'
  };
};

const getCategoryMetadata = (category: FolderType | string | null | undefined, subjectColor?: string) => {
  const activeColor = subjectColor || (typeof category === 'object' && category?.color ? category.color : "#ff7a00");
  if (!category) {
    return {
      description: "Custom study resources & files",
      color: activeColor,
      lightColorBg: "bg-orange-500/10 text-orange-500 dark:text-orange-400",
      gradientBgClass: "from-orange-500/10 dark:from-orange-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-orange-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(255,122,0,0.06)] hover:-translate-y-0.5",
      iconColor: "text-orange-500 dark:text-orange-400",
      progressRingColor: "stroke-orange-500 dark:stroke-orange-400",
      icon: <Folder className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />
    };
  }

  const catName = typeof category === 'string' ? category : (category.name || '');
  const folderObj = typeof category === 'string' ? null : category;
  const n = (catName || '').toLowerCase().trim();

  // Resolve custom icon if set on folder
  let customIconComp: React.ReactElement | null = null;
  if (folderObj?.icon_name) {
    const IconMap: { [key: string]: React.ReactElement } = {
      Folder: <Folder className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Landmark: <Landmark className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Sigma: <Sigma className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Code: <Code className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Cpu: <Cpu className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Monitor: <Monitor className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Globe: <Globe className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Database: <Database className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Terminal: <Terminal className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      BookOpen: <BookOpen className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      HelpCircle: <HelpCircle className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />,
      Video: <Video className="w-5.5 h-5.5 text-current shrink-0" strokeWidth={2.5} />
    };
    if (IconMap[folderObj.icon_name]) {
      customIconComp = IconMap[folderObj.icon_name];
    }
  }

  const hex = subjectColor || (folderObj && folderObj.color ? folderObj.color : "#ff7a00");
  const hexMap: { [key: string]: any } = {
    '#ff7a00': {
      lightColorBg: "bg-orange-500/10 text-orange-500 dark:text-orange-400",
      gradientBgClass: "from-orange-500/10 dark:from-orange-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-orange-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(255,122,0,0.06)] hover:-translate-y-0.5",
      iconColor: "text-orange-500 dark:text-orange-400",
      progressRingColor: "stroke-orange-500 dark:stroke-orange-400"
    },
    '#22c55e': {
      lightColorBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
      gradientBgClass: "from-emerald-500/10 dark:from-emerald-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-emerald-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(34,197,94,0.06)] hover:-translate-y-0.5",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      progressRingColor: "stroke-emerald-500 dark:stroke-emerald-400"
    },
    '#0ea5e9': {
      lightColorBg: "bg-sky-500/10 text-sky-500 dark:text-sky-400",
      gradientBgClass: "from-sky-500/10 dark:from-sky-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-sky-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(14,165,233,0.06)] hover:-translate-y-0.5",
      iconColor: "text-sky-500 dark:text-sky-400",
      progressRingColor: "stroke-sky-500 dark:stroke-sky-400"
    },
    '#f43f5e': {
      lightColorBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400",
      gradientBgClass: "from-rose-500/10 dark:from-rose-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-rose-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(244,63,94,0.06)] hover:-translate-y-0.5",
      iconColor: "text-rose-500 dark:text-rose-400",
      progressRingColor: "stroke-rose-500 dark:stroke-rose-400"
    },
    '#a855f7': {
      lightColorBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      gradientBgClass: "from-purple-500/10 dark:from-purple-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-purple-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(168,85,247,0.06)] hover:-translate-y-0.5",
      iconColor: "text-purple-500 dark:text-purple-400",
      progressRingColor: "stroke-purple-500 dark:stroke-purple-400"
    },
    '#10b981': {
      lightColorBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
      gradientBgClass: "from-emerald-500/10 dark:from-emerald-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-emerald-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(16,185,129,0.06)] hover:-translate-y-0.5",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      progressRingColor: "stroke-emerald-500 dark:stroke-emerald-400"
    },
    '#06b6d4': {
      lightColorBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
      gradientBgClass: "from-cyan-500/10 dark:from-cyan-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-cyan-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(6,182,212,0.06)] hover:-translate-y-0.5",
      iconColor: "text-cyan-500 dark:text-cyan-400",
      progressRingColor: "stroke-cyan-500 dark:stroke-cyan-400"
    },
    '#ec4899': {
      lightColorBg: "bg-pink-500/10 text-pink-500 dark:text-pink-400",
      gradientBgClass: "from-pink-500/10 dark:from-pink-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-pink-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(236,72,153,0.06)] hover:-translate-y-0.5",
      iconColor: "text-pink-500 dark:text-pink-400",
      progressRingColor: "stroke-pink-500 dark:stroke-pink-400"
    },
    '#6366f1': {
      lightColorBg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
      gradientBgClass: "from-indigo-500/10 dark:from-indigo-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-indigo-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(99,102,241,0.06)] hover:-translate-y-0.5",
      iconColor: "text-indigo-500 dark:text-indigo-400",
      progressRingColor: "stroke-indigo-500 dark:stroke-indigo-400"
    }
  };
  const stylePreset = hexMap[hex] || hexMap['#ff7a00'];

  if (n.includes('note')) {
    return {
      description: "All handwritten & digital notes",
      color: hex,
      ...stylePreset,
      icon: customIconComp || (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    };
  }
  if (n.includes('pyq') || n.includes('question') || n.includes('paper')) {
    return {
      description: "Previous year question papers",
      color: hex,
      ...stylePreset,
      icon: customIconComp || (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      )
    };
  }
  if (n.includes('lecture') || n.includes('slide') || n.includes('video') || n.includes('recording')) {
    return {
      description: "Slides, videos & recordings",
      color: hex,
      ...stylePreset,
      icon: customIconComp || (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      )
    };
  }
  if (n.includes('syllabus') || n.includes('syllabi') || n.includes('roadmap') || n.includes('curriculum')) {
    return {
      description: "Syllabus, docs & misc",
      color: hex,
      ...stylePreset,
      icon: customIconComp || (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    };
  }
  const isLabCategory = n === 'lab' || n === 'labs' || n.startsWith('lab ') || n.endsWith(' lab') || n.includes('laboratory') || n.includes('manual') || n.includes('practical');
  if (isLabCategory) {
    return {
      description: "Lab manuals & practical files",
      color: hex,
      ...stylePreset,
      icon: customIconComp || (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12" />
          <path d="M9 3v8L4.3 19.3A2 2 0 0 0 6 22h12a2 2 0 0 0 1.7-2.7L15 11V3" />
        </svg>
      )
    };
  }
  return {
    description: "Reference books & materials",
    color: hex,
    ...stylePreset,
    icon: customIconComp || (
      <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" />
      </svg>
    )
  };
};

const SUBJECT_DESCRIPTIONS: Record<string, string> = {
  // Term 1 / 2 Core
  "cse111": `### Course Description
**Orientation to Computing-I** introduces students to the fundamental principles of computational thinking, logical problem solving, and baseline computer literacy.

### Key Learning Objectives
- Learn standard computer hardware, firmware, and Operating System abstractions.
- Understand basic command-line interfaces, directory structures, and file systems.
- Build foundations in logical decomposition and flowcharts.

### Core Topics Covered
- Basics of CPU, memory hierarchies, and peripheral operations.
- Operating system basics (kernel, shell, process scheduling).
- File systems, command-line nav (ls, cd, mkdir, cat).
- Introduction to Boolean Algebra and basic gate logic.`,

  "cse121": `### Course Description
**Orientation to Computing-II** builds upon the first course to introduce algorithmic problem solving, basic data structures, and the fundamentals of networking.

### Key Learning Objectives
- Write simple logical pseudocodes and trace computational branches.
- Differentiate between foundational linear structures (arrays and lists).
- Understand basic client-server networking models.

### Core Topics Covered
- Iterative processes, conditional logic, and recursion paradigms.
- Array allocation, indexing, and lookup operations.
- Basics of HTML/CSS structure and standard web requests.
- Introduction to version control concepts (git repository systems).`,

  "cse326": `### Course Description
**Internet Programming Laboratory** is a hands-on practical lab introducing students to HTML5, CSS3, JavaScript, DOM manipulation, responsive UI frameworks, and modern web application development.

### Key Learning Objectives
- Design and build semantic, responsive web layouts.
- Apply dynamic user interactions using native JavaScript DOM methods.
- Connect forms and components to mock APIs or client storage systems.

### Core Topics Covered
- HTML5 elements, structures, and semantic tags.
- CSS3 flexbox, grid systems, media queries, and animations.
- JavaScript ES6 syntax (promises, fetch API, variables, and arrays).
- Document Object Model (DOM) events, queries, and style mutations.
- Version control integrations and static application deployments.`,

  "int108": `### Course Description
**Python Programming** provides a comprehensive introduction to the Python language, data structures, scripting, and scientific libraries for computing.

### Key Learning Objectives
- Master syntax, expressions, condition checks, and loops in Python.
- Solve array-based operations using Python lists, tuples, sets, and dictionaries.
- Implement file operations, exception handling, and basic module packaging.

### Core Topics Covered
- Python compilers, interpreters, variables, and data structures.
- Control flow structures: if-statements, for-loops, while-loops.
- Native collections: Lists, Tuples, Dictionaries, Sets.
- Functions, modules, scopes, lambda expressions, and decorators.
- Basic file I/O operations, error checking, and exception handling.`,

  "mth165": `### Course Description
**Mathematics for Engineers** covers critical mathematical models in calculus, linear algebra, and coordinate systems crucial for engineering calculations.

### Key Learning Objectives
- Solve systems of linear equations using matrix reduction techniques.
- Apply differential and integral calculus to engineering problems.
- Determine limits, continuity, and derivatives of multivariate equations.

### Core Topics Covered
- Matrices, row operations, rank, determinants, and Eigenvalues.
- Infinite series, convergence tests, Taylor and Maclaurin expansions.
- Limits, continuity, and partial differentiation of functions.
- Multiple integration (double/triple integrals), volumes, and surface areas.`,

  "ece249": `### Course Description
**Basic Electrical and Electronics Engineering** introduces the physical laws, circuit analysis methods, and semiconductor components underpinning electronics.

### Key Learning Objectives
- Analyze DC and AC circuits using mesh, nodal, and Kirchhoff laws.
- Understand magnetic fields, transformers, and electrical machines.
- Differentiate operation of diodes, transistors, and logic gates.

### Core Topics Covered
- Kirchhoff's current/voltage laws, superposition, and Thevenin theorems.
- Single-phase AC circuits, impedance, phase diagrams, and power.
- Construction and operation of single-phase transformers.
- Semiconductor physics, PN-junction diodes, BJT, and operational amplifiers.`,

  "mec136": `### Course Description
**Engineering Drawing with AutoCAD** covers standard projections, isometric views, and CAD drafting principles.

### Key Learning Objectives
- Read and create standard multi-view projections (first/third angle).
- Draft engineering structures and parts using Autodesk AutoCAD tools.
- Produce auxiliary, sectional, and isometric drawings.

### Core Topics Covered
- Scales, standard sheet layouts, and line conventions.
- Orthographic projection of points, lines, planes, and solid shapes.
- Isometric views and sectional drawing configurations.
- AutoCAD navigation, drafting commands (draw, modify), and layout spacing.`,

  "che110": `### Course Description
**Environmental Studies** reviews the global ecosystems, natural resource challenges, pollution hazards, and biodiversity conservation strategies.

### Key Learning Objectives
- Analyze human footprint, carbon cycle, and climate adjustments.
- Understand renewable energies, water resources, and waste mitigation.
- Apply local environmental regulations to municipal structures.

### Core Topics Covered
- Structure of atmosphere, biosphere, lithosphere, and food chains.
- Air, water, soil, thermal, and noise pollution mitigation protocols.
- Waste management, resource depletion, and renewable transitions.`,

  "phy110": `### Course Description
**Engineering Physics** covers quantum mechanics, wave properties, electromagnetic waves, and laser optics systems.

### Key Learning Objectives
- Formulate quantum behaviors, wave-particle duality, and uncertainty.
- Apply Maxwell's equations to compute electromagnetic wave actions.
- Understand laser optics, optical fibers, and semiconductor crystal lattices.

### Core Topics Covered
- Wave optics: Interference, diffraction, and polarization.
- Quantum mechanics: Schrodinger equation, wavefunctions, and particle in a box.
- Electromagnetism: Ampere, Faraday, Gauss laws, and displacement currents.
- Semiconductor physics, energy bands, and optical fiber transmissions.`,

  "cse101": `### Course Description
**Computer Programming** introduces computational logic, variables, branching, arrays, pointers, functions, and file structure design using C/C++.

### Key Learning Objectives
- Master syntax, branches (if-else, switch), and loop iterations.
- Create modular components using parameters, scopes, and pointers.
- Construct array-based strings and perform standard file input/output.

### Core Topics Covered
- Compilers, CPU architectures, data representation, and code structures.
- Variables, operators, data types, and arithmetic expressions.
- Arrays, dynamic memory allocation, and basic pointers.
- User-defined functions, recursion models, and macro headers.
- File system reading/writing and custom struct/union allocations.`,

  "cse320": `### Course Description
**Software Engineering** reviews the system development lifecycle (SDLC), modeling conventions (UML), and modern agile management methods.

### Key Learning Objectives
- Apply Agile, Scrum, and Waterfall processes depending on specifications.
- Gather requirements, write specs, and model system diagrams.
- Understand software testing regimes, QA cycles, and release management.

### Core Topics Covered
- SDLC models: Waterfall, Spiral, Prototype, and Scrum patterns.
- Requirements gathering, feasibility checking, and SRS generation.
- Unified Modeling Language (UML) class, use-case, and sequence designs.
- Software testing strategies (black-box, white-box, unit, and system tests).
- Project metrics, costing, estimations, and risk management.`,

  "int306": `### Course Description
**Database Management Systems** focuses on relational schema architectures, SQL commands, data constraints, normalization guidelines, and transaction operations.

### Key Learning Objectives
- Construct Entity-Relationship (ER) schemas for system specifications.
- Normalize schemas to minimize redundancy and prevent transaction anomalies.
- Write complex queries, joins, aggregates, and triggers in SQL.

### Core Topics Covered
- Relational schema designs, keys, attributes, and entities.
- SQL syntax: DDL, DML, DQL (select, join, group, having).
- Normalization forms: 1NF, 2NF, 3NF, BCNF.
- Transaction ACID rules, concurrency anomalies, and locking models.
- Database indexing models (B-Trees, B+ Trees) and query optimizations.`,

  "mth166": `### Course Description
**Differential Equations and Vector Calculus** teaches differential solutions, Laplace transforms, vector integrations, and coordinate conversions.

### Key Learning Objectives
- Solve ordinary differential equations (first and higher order models).
- Apply Laplace transforms to solve system response equations.
- Integrate vector fields using Green's, Stokes', and Gauss theorems.

### Core Topics Covered
- Homogeneous and non-homogeneous ordinary differential equations.
- Laplace transforms, inverse transforms, and differential convolutions.
- Vector fields, gradient, curl, divergence, and line/surface integrals.
- Green's, Gauss divergence, and Stokes' integral theorems.`,

  "cse202": `### Course Description
**Object Oriented Programming** covers class structures, encapsulation, inheritance, polymorphism, templates, memory management, and file streams in C++/Java.

### Key Learning Objectives
- Design systems using encapsulation, access modifiers, and constructors.
- Implement reusable code structures via inheritance and interface classes.
- Apply compile-time/run-time polymorphism and custom templates.

### Core Topics Covered
- Classes, objects, memory layouts, static members, and constructors.
- Inheritance trees, virtual base classes, and abstraction layers.
- Virtual functions, overriding, overloading, and dynamic bindings.
- Exception handling, standard templates, and file I/O operations.`,

  "cse205": `### Course Description
**Data Structures and Algorithms** teaches complex structures, sorting/searching algorithms, algorithmic analyses, and computational heuristics.

### Key Learning Objectives
- Analyze execution bounds using Big-O, Theta, and Omega models.
- Build linear systems (lists, stacks, queues) and non-linear systems (trees, graphs).
- Apply sorting and search optimizations.

### Core Topics Covered
- Time complexity bounds, recursion limits, and arrays.
- Linked Lists (singly, doubly, circular) and operational interfaces.
- Stacks, Queues, Deques, and Priority Queue heaps.
- Binary Search Trees, AVL balance adjustments, and traversal routines.
- Graph representations (matrices/lists), BFS/DFS, and shortest paths.`,

  "cse306": `### Course Description
**Computer Networks** reviews physical transmissions, routing protocols, transport connections, and application services across OSI/TCP-IP stacks.

### Key Learning Objectives
- Differentiate between Routing algorithms (Link State, Distance Vector) and addressing systems (IPv4/IPv6).
- Configure TCP/UDP sockets, flow control, and sliding window buffers.
- Model standard application layers (HTTP, DNS, SMTP, DHCP).

### Core Topics Covered
- Network layered architectures (OSI vs TCP/IP frameworks).
- Physical/Link structures: Framing, Error checking, and MAC layers.
- Network routing, CIDR subnet allocation, and Internet Protocol.
- Transport reliability: TCP congestion control, handshakes, and UDP.
- Standard application protocols and socket connections.`,

  "cse423": `### Course Description
**Virtualization and Cloud Computing** introduces virtual machine architectures, hypervisors, cloud models (SaaS/PaaS/IaaS), and cluster scaling.

### Key Learning Objectives
- Configure hardware virtualization and configure system hypervisors.
- Deploy services using cloud deployment models (AWS, Azure, or GCP).
- Understand container networks, Kubernetes setups, and load balancing.

### Core Topics Covered
- CPU, memory, and I/O virtualization techniques.
- Type 1 and Type 2 hypervisors (KVM, ESXi, VirtualBox).
- Infrastructure (IaaS), Platform (PaaS), and Software (SaaS) models.
- Containerization (Docker engine) and container management.`,

  "mth401": `### Course Description
**Discrete Mathematics** reviews mathematical logic, set configurations, relations, recurrence functions, and graph theories crucial for software logic.

### Key Learning Objectives
- Deduce propositional arguments and formulate mathematical proofs.
- Compute recurrence relations and generating functions.
- Solve graph coloring, paths, and spanning tree calculations.

### Core Topics Covered
- Propositional logic, quantifiers, and inference rules.
- Set operations, functions, cardinality, and equivalence relations.
- Recurrence relations, mathematical induction, and combinatorics.
- Graph theories: Euler paths, Hamiltonian paths, trees, and coloring.`,

  "cse211": `### Course Description
**Computer Organization and Design** teaches hardware execution loops, CPU designs, memory systems, and assembly level instructions.

### Key Learning Objectives
- Trace MIPS/x86 instruction cycles and write basic assembly codes.
- Evaluate cache memory structures (associative, direct-mapped).
- Understand pipeline hazards and CPU execution controls.

### Core Topics Covered
- Instruction set architectures, registers, and memory addresses.
- Computer arithmetic: ALU designs, integer and floating point math.
- Processor control lines, datapaths, and multi-stage pipelining.
- Cache hierarchies, virtual memories, and bus transactions.`,

  "cse310": `### Course Description
**Programming in Java** teaches class structures, JVM behaviors, multi-threaded operations, collections, and event-driven interfaces.

### Key Learning Objectives
- Master JVM structures, garbage collection, and compilation phases.
- Build threaded applications with lock synchronization.
- Implement Collections framework (List, Map, Set, Stream APIs).

### Core Topics Covered
- Java syntax, bytecodes, class loaders, and object runtimes.
- Abstract classes, interfaces, dynamic mappings, and package imports.
- Exception structures, custom classes, and assertions.
- Multi-threading, task synchronization, and thread states.
- Java Collections, generics, lambdas, and File I/O classes.`,

  "cse316": `### Course Description
**Operating Systems** reviews process controls, thread designs, CPU schedulers, lock syncs, page tables, disk setups, and file allocations.

### Key Learning Objectives
- Solve process scheduling metrics (turnaround, wait bounds).
- Trace deadlock conditions, semaphore configurations, and mutexes.
- Model memory paging, page faults, and disk access schedules.

### Core Topics Covered
- System calls, shell execution loops, and boot sequences.
- Process states, context transitions, IPC, and thread models.
- CPU scheduling: FIFO, SJF, Priority, and Round Robin.
- Paging systems, TLB, page replacement (FIFO, LRU, Optimal).
- File directory trees, disk queues (SSTF, SCAN), and protections.`,

  "int428": `### Course Description
**Artificial Intelligence Essentials** introduces state-space heuristics, logic systems, machine learning pipelines, and neural networks.

### Key Learning Objectives
- Implement heuristics (A*, Minimax, Alpha-Beta pruning).
- Apply logic systems (first order logic, resolution steps).
- Train basic regression, classification, and clustering models.

### Core Topics Covered
- Uninformed and informed state searches (BFS, DFS, A*, Greedy).
- Adversarial game trees: Minimax and alpha-beta pruning.
- Knowledge representation, propositional logics, and inference rules.
- Supervised ML: linear regressions, SVM, Decision Trees, K-Means.`,

  "mth302": `### Course Description
**Probability and Statistics** covers distributions, hypothesis tests, regressions, and statistical inferences.

### Key Learning Objectives
- Differentiate and compute probability distribution factors.
- Perform parameter tests (z-test, t-test, chi-square).
- Calculate linear regression models and analyze dataset variances.

### Core Topics Covered
- Sample spaces, conditional probabilities, and Bayes' theorem.
- Discrete/Continuous distributions: Binomial, Poisson, Normal.
- Hypothesis checks, null theories, critical values, and p-values.
- Regression models, correlations, and analysis of variance (ANOVA).`
};

const getFallbackSubjectDescription = (name: string) => {
  const cleanName = name.trim();
  const n = cleanName.toLowerCase();
  
  // Try to match by subject code (e.g. "CSE101: Computer Programming" -> code "cse101")
  const subjectCodeMatch = cleanName.match(/^([A-Za-z]+\d{3})/);
  if (subjectCodeMatch) {
    const code = subjectCodeMatch[1].toLowerCase();
    if (SUBJECT_DESCRIPTIONS[code]) {
      return SUBJECT_DESCRIPTIONS[code];
    }
  }

  // Also try to match by title keyword if code is not present
  for (const [code, desc] of Object.entries(SUBJECT_DESCRIPTIONS)) {
    if (n.includes(code)) return desc;
  }

  // General fallback template
  if (n.includes('programming') || n.includes('coding') || n.includes('python') || n.includes('cpp') || n.includes('java') || n.includes('c#') || n.includes('javascript') || n.includes('c programming')) {
    return `### Course Description
Welcome to **${cleanName}**! This course introduces the fundamental concepts of computer programming and software development. You will learn how to design, write, test, and debug code to solve complex problems.

### Key Learning Objectives
- Master key programming paradigms (syntax, control flow, loops, functions, and recursion).
- Differentiate programming patterns depending on the curriculum.
- Develop strong algorithmic thinking and computational problem-solving skills.

### Core Topics Covered
- Introduction to compilers, interpreters, and IDE setups.
- Data types, variables, arithmetic operators, and expressions.
- Conditional statements (if-else, switch) and loop control structures.
- Arrays, strings, multi-dimensional structures, and memory addresses.
- Functions, scope, recursion, parameter passing, and library integrations.

### Study Tips
- **Code Daily**: Theoretical knowledge is useless without hands-on practice. Write programs for every concept learned.
- **Trace Code**: Practice dry-running code on paper to trace variable states and understand control flow.
- **Utilize Resources**: Check the Lectures and Notes folders for step-by-step guides and implementation files.`;
  }
  
  if (n.includes('data structure') || n.includes('algorithm') || n.includes('dsa')) {
    return `### Course Description
Welcome to **${cleanName}**! This course focuses on organizing, managing, and storing data efficiently to perform operations optimally. You will explore algorithms, analyze their complexity, and implement various structures to build high-performance software.

### Key Learning Objectives
- Analyze algorithmic complexity using Big-O, Big-Theta, and Big-Omega notations.
- Master linear structures (arrays, linked lists, stacks, queues) and non-linear structures (trees, graphs).
- Understand and implement sorting, searching, and traversal al gorithms.
- Apply dynamic programming, greedy algorithms, and divide-and-conquer strategies.

### Core Topics Covered
- Time and Space Complexity analysis.
- Singly, Doubly, and Circular Linked Lists.
- Stacks, Queues, Deques, and Priority Queues.
- Binary Trees, AVL Trees, Heaps, and Binary Search Trees (BST).
- Graph representations (Adjacency Matrix/List) and traversals (BFS/DFS).
- Hashing, collision resolution strategies, and lookup optimizations.

### Study Tips
- **Visualize**: Draw pointer mutations, tree rotations, and graph traversals on paper to build intuition.
- **Analyze Complexity**: Make it a habit to calculate the time and space complexity of every algorithm you write.
- **Code from Scratch**: Don't just read code; implement stacks, trees, and sorting algorithms from scratch.`;
  }

  if (n.includes('database') || n.includes('sql') || n.includes('dbms') || n.includes('rdbms')) {
    return `### Course Description
Welcome to **${cleanName}**! This course covers the design, implementation, and management of relational database management systems. You will learn data modeling, normalization, transactional safety, and query design using SQL.

### Key Learning Objectives
- Design relational schemas using Entity-Relationship (ER) modeling.
- Normalize schemas to minimize redundancy and prevent anomalies (1NF, 2NF, 3NF, BCNF).
- Write complex queries, joins, subqueries, and aggregates in Structured Query Language (SQL).
- Understand database internals, indexing, transaction safety (ACID), and concurrency control.

### Core Topics Covered
- Introduction to Database Architecture and DBMS models.
- ER Diagrams, Entities, Attributes, Relationships, and constraints.
- Relational Algebra and SQL queries (DDL, DML, DCL).
- Normalization rules and Functional Dependencies.
- Indexing structures (B-Trees, B+ Trees, Hashing).
- Transaction management, ACID properties, serializability, and locking protocols.

### Study Tips
- **Write SQL**: Practice building schemas, joining tables, and writing complex nested queries.
- **Map Scenarios**: Pick real-world systems (like e-commerce, banking) and design their ER diagrams and tables.`;
  }

  if (n.includes('math') || n.includes('algebra') || n.includes('calculus') || n.includes('probability') || n.includes('discrete') || n.includes('statistics')) {
    return `### Course Description
Welcome to **${cleanName}**! This course provides the foundational mathematical concepts, analytical models, and logical frameworks required for computer science, engineering, and data analysis.

### Key Learning Objectives
- Formulate mathematical proofs and apply logical reasoning.
- Perform calculations, solve systems of equations, and analyze functions.
- Apply statistics and probability theory to analyze datasets.
- Translate real-world systems into formal mathematical equations.

### Core Topics Covered
- Propositional logic, set theory, functions, and relations.
- Matrices, linear transformations, determinants, and eigenvectors.
- Limits, differentiation, integration, and multivariate calculus.
- Permutations, combinations, probability distributions, and hypothesis testing.
- Recurrence relations, generating functions, and graph theory (for discrete math).

### Study Tips
- **Solve Exercises**: Mathematics is learned by doing. Solve as many practice problems as possible.
- **Understand the Logic**: Don't memorize steps; understand the theorems and proofs behind the formulas.`;
  }

  if (n.includes('physics') || n.includes('chemistry') || n.includes('mechanics') || n.includes('electrical') || n.includes('electronics')) {
    return `### Course Description
Welcome to **${cleanName}**! This course covers the fundamental physical and scientific principles, chemical structures, electrical circuits, or semiconductor devices that form the basis of modern engineering.

### Key Learning Objectives
- Apply physical laws and chemical principles to analyze engineered systems.
- Solve scientific problems using mathematical equations and dimensions.
- Understand circuit diagrams, component characteristics, and semiconductor models.
- Perform measurements and interpret experimental data.

### Study Tips
- **Understand Units**: Keep track of dimensional units and constants during calculations.
- **Draw Diagrams**: Always sketch the physical layout, circuit diagram, or atomic structures before solving equations.`;
  }

  // General fallback
  return `### Course Description
Welcome to **${cleanName}**! This course provides a structured curriculum to build specialized expertise, professional skills, and core knowledge in the subject area.

### Key Learning Objectives
- Understand the core principles, terminologies, and methodologies of the subject.
- Develop critical thinking and practical skills to solve domain-specific problems.
- Collaborate on assignments, review resource materials, and prepare for examinations.

### Core Topics Covered
- Foundations, fundamental definitions, and introductory concepts.
- Primary modules, system architectures, and standard methodologies.
- Case studies, practical applications, and advanced domain topics.

### Study Tips
- **Stay Organized**: Review the Lecture Slides, handwritten Notes, and curriculum materials regularly.
- **Solve Papers**: Solve the Previous Year Questions (PYQs) to understand exam patterns and question formats.
- **Ask Questions**: Participate in the Discussions tab to clear doubts and collaborate with peers.`;
};

const cleanHtmlForEditor = (content: string): string => {
  if (!content) return '';
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Remove all CodeMirror containers
    tempDiv.querySelectorAll('.cm6-editor-container').forEach(c => c.remove());
    
    // Unwrap premium code block wrappers
    tempDiv.querySelectorAll('.premium-code-block').forEach(wrapper => {
      const pre = wrapper.querySelector('pre');
      if (pre) {
        pre.style.display = '';
        wrapper.replaceWith(pre);
      } else {
        wrapper.remove();
      }
    });

    // Make sure all pre tags are visible
    tempDiv.querySelectorAll('pre').forEach(pre => {
      pre.style.display = '';
    });
    
    return tempDiv.innerHTML;
  } catch (e) {
    console.error("cleanHtmlForEditor failed:", e);
    return content;
  }
};

const formatCleanFileName = (fileName: string) => {
  if (!fileName) return '';
  if (/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|png|jpg|jpeg|zip|rar|mp4|csv)$/i.test(fileName)) {
    return fileName.replace(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|png|jpg|jpeg|zip|rar|mp4|csv)$/i, '');
  }
  return fileName;
};

const getUnitLabel = (fileName: string, description?: string): string | null => {
  const text = `${fileName || ''} ${description || ''}`;

  // 1. Match Unit ranges e.g. "Unit 1 to Unit 6", "Unit 1 - Unit 6", "Unit 1 to 6", "Unit 1-6", "Unit 1 - 6", "U1 to U6", "U1-U6"
  const rangeMatch = text.match(/Unit\s*(\d+)\s*(?:to|-|through|until|~)\s*(?:Unit\s*)?(\d+)/i) ||
                     text.match(/\bU(\d+)\s*(?:to|-|through|~)\s*(?:U)?(\d+)\b/i);
  if (rangeMatch) {
    const start = rangeMatch[1];
    const end = rangeMatch[2];
    if (start === end) return `Unit ${start}`;
    return `Unit ${start}-${end}`;
  }

  // 2. Match Multiple units e.g. "Unit 1 & 2", "Unit 1 and 2", "Unit 1, 2"
  const multiMatch = text.match(/Unit\s*(\d+)\s*(?:&|and|,)\s*(?:Unit\s*)?(\d+)/i);
  if (multiMatch) {
    return `Unit ${multiMatch[1]} & ${multiMatch[2]}`;
  }

  // 3. Match Single unit e.g. "Unit 1", "Unit1", "U1"
  const singleMatch = text.match(/Unit\s*(\d+)/i) || text.match(/\bU(\d+)\b/i);
  if (singleMatch) {
    return `Unit ${singleMatch[1]}`;
  }

  return null;
};

const SubjectCommunity: React.FC<SubjectCommunityProps> = ({
  activeSubject,
  activeSemester,
  selectedProgram,
  userProfile,
  categories,
  allFiles,
  allFolders,
  userProgressList,
  onFileAccess,
  onUploadClick,
  onBack,
  searchQuery,
  onRefresh,
  isAdmin,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  onDropFiles,
  onVaultClick,
  onAdminReviewClick
}) => {
  const subjectCodeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
  const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toUpperCase() : activeSubject.name.split(':')[0].trim();
  const subjectName = activeSubject.name.split(':')[1]?.trim() || activeSubject.name;

  const subjectMetadata = useMemo(() => {
    return findSubjectMetadata(selectedProgram, activeSubject.name);
  }, [selectedProgram, activeSubject.name]);

  // Curriculum Term (Current Year 2026 Batch vs Earlier Batches / Reappear)
  const [curriculumTerm, setCurriculumTerm] = useState<'current' | 'reappear'>('current');
  const [expandedCAIndices, setExpandedCAIndices] = useState<number[]>([0]);
  const toggleCAIndex = (idx: number) => {
    setExpandedCAIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const curriculumEntry = useMemo(() => {
    return getSubjectCurriculumEntry(activeSubject.name);
  }, [activeSubject.name]);

  const currentCurriculum = curriculumEntry?.current || null;
  const reappearCurriculum = curriculumEntry?.reappear || null;

  const hasReappearVersion = Boolean(
    reappearCurriculum &&
    currentCurriculum &&
    (
      reappearCurriculum.credits !== currentCurriculum.credits ||
      reappearCurriculum.l !== currentCurriculum.l ||
      reappearCurriculum.t !== currentCurriculum.t ||
      reappearCurriculum.p !== currentCurriculum.p ||
      JSON.stringify(reappearCurriculum.gradingScheme) !== JSON.stringify(currentCurriculum.gradingScheme) ||
      reappearCurriculum.syllabusPdf !== currentCurriculum.syllabusPdf
    )
  );

  const activeCurriculum = useMemo(() => {
    if (curriculumTerm === 'reappear' && reappearCurriculum) {
      return reappearCurriculum;
    }
    return currentCurriculum || reappearCurriculum || null;
  }, [curriculumTerm, currentCurriculum, reappearCurriculum]);

  const creditsText = activeCurriculum 
    ? `${activeCurriculum.credits} Credits` 
    : (subjectMetadata ? `${subjectMetadata.credits} Credits` : "4 Credits");

  const ltpText = activeCurriculum 
    ? `L-T-P: ${activeCurriculum.l}-${activeCurriculum.t}-${activeCurriculum.p}` 
    : (subjectMetadata ? `L-T-P: ${subjectMetadata.l}-${subjectMetadata.t}-${subjectMetadata.p}` : "L-T-P: 3-0-2");

  const sectionName = useMemo(() => {
    if (activeSubject.description) {
      try {
        const parsed = JSON.parse(activeSubject.description);
        if (parsed && parsed.section) return parsed.section as string;
      } catch (e) {
        if (!activeSubject.description.startsWith('{') && !activeSubject.description.startsWith('#') && activeSubject.description.length < 50 && !activeSubject.description.includes('\n')) {
          return activeSubject.description;
        }
      }
    }
    const meta = findSubjectMetadata(selectedProgram, activeSubject.name);
    if (meta) {
      if (meta.type === 'CR') return 'Core Courses';
      const curriculum = getProgramCurriculum(selectedProgram);
      const term = curriculum?.terms.find(t => t.termName.toLowerCase() === (activeSemester?.name || '').toLowerCase());
      if (term) {
        const basket = term.electiveBaskets.find(b => b.subjects.some(s => s.code === meta.code));
        if (basket) return basket.name;
      }
    }
    const catCurr = getSubjectCurriculum(activeSubject.name);
    if (catCurr) {
      const cat = catCurr.category?.toLowerCase() || '';
      if (cat === 'core') return 'Core Courses';
      if (catCurr.categoryDetail && catCurr.categoryDetail !== 'Core') {
        return catCurr.categoryDetail;
      }
      if (catCurr.category) {
        return `${catCurr.category} Courses`;
      }
    }
    return 'Other / Custom Courses';
  }, [activeSubject, selectedProgram, activeSemester]);

  const theme = useMemo(() => {
    return getSubjectTheme(activeSubject.name, activeSubject.color, activeSubject.icon_name, sectionName);
  }, [activeSubject.name, activeSubject.color, activeSubject.icon_name, sectionName]);

  const isIITM = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'bsdatascience';

  const displayCategories = useMemo(() => {
    const catMap = new globalThis.Map<string, FolderType>();

    // Add db categories passed via prop safely, deduplicating by normalized name
    (categories || []).forEach(cat => {
      if (cat && cat.name) {
        const normKey = cat.name.toLowerCase().trim();
        if (!catMap.has(normKey)) {
          catMap.set(normKey, cat);
        }
      }
    });

    // If no db categories exist for this subject, provide standard category folders
    if (catMap.size === 0) {
      const defaultNames = ["Notes", "PYQs", "Lectures", "Syllabus", "Lab Manuals", "Books"];
      defaultNames.forEach((name, idx) => {
        catMap.set(name.toLowerCase(), {
          id: `default-cat-${idx}`,
          name: name,
          type: 'category',
          parent_id: activeSubject.id,
          color: '#ff7a00'
        } as FolderType);
      });
    }

    return Array.from(catMap.values());
  }, [categories, activeSubject.id]);

  // Action bar toolbar states (matching Image 2)
  const [fileFilterType, setFileFilterType] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'files' | 'social' | 'discussions' | 'requests' | 'packs' | 'leaderboard' | 'people'>('files');
  const [activeCategoryFolder, setActiveCategoryFolder] = useState<FolderType | null>(null);
  const [socialFilter, setSocialFilter] = useState<'all' | 'discussions' | 'requests'>('all');
  const [joined, setJoined] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Full-screen window drag and drop listener with nested counter
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types?.includes('Files')) {
        dragCounter++;
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDraggingOver(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        onDropFiles?.(droppedFiles, activeCategoryFolder?.name);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [activeCategoryFolder, onDropFiles]);

  // Scoped subject data
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [overviewItems, setOverviewItems] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<CommunityPost[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);
  const [wikiSections, setWikiSections] = useState<WikiSection[]>([]);

  // Live leaderboard and members lists
  const [leaderboardList, setLeaderboardList] = useState<any[]>([]);
  const [moderatorsList, setModeratorsList] = useState<any[]>([]);
  const [liveMembersCount, setLiveMembersCount] = useState<number>(2430);

  // Admin edit overlay states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFileToEdit, setSelectedFileToEdit] = useState<LibraryFile | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCreatingNewSubjectInEdit, setIsCreatingNewSubjectInEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    program: '',
    semester: '',
    subject: '',
    type: 'Notes',
    display_order: 0
  });

  const editModalSemesters = useMemo(() => {
    const list: string[] = [];
    const prog = editForm.program || selectedProgram || 'BTech CSE';

    // 1. From Curriculum Data
    const curr = getProgramCurriculum(prog);
    if (curr && curr.terms) {
      curr.terms.forEach(t => {
        const name = `Semester ${t.termNumber}`;
        if (!list.includes(name)) list.push(name);
      });
    }

    // 2. From DB folders for this program
    if (allFolders && allFolders.length > 0) {
      const dbSems = allFolders.filter(f => f.type === 'semester' && (f.program === prog || !f.program));
      dbSems.forEach(s => {
        if (!list.includes(s.name)) list.push(s.name);
      });
    }

    // Fallback standard 8 semesters if empty
    if (list.length === 0) {
      for (let i = 1; i <= 8; i++) list.push(`Semester ${i}`);
    }

    return list;
  }, [editForm.program, selectedProgram, allFolders]);

  const editModalSubjects = useMemo(() => {
    const list: string[] = [];
    const prog = editForm.program || selectedProgram || 'BTech CSE';
    const semStr = editForm.semester || activeSemester?.name || 'Semester 1';

    // 1. From Curriculum Data for program & semester
    const curr = getProgramCurriculum(prog);
    if (curr && curr.terms) {
      const semNumStr = semStr.replace(/\D/g, '');
      const semNum = parseInt(semNumStr, 10);

      curr.terms.forEach((term, idx) => {
        const termNum = term.termNumber || (idx + 1);

        if (termNum === semNum || !semNum) {
          (term.coreSubjects || []).forEach(sub => {
            const formatted = `${sub.code}: ${sub.title}`;
            if (!list.includes(formatted)) list.push(formatted);
          });
          (term.electiveBaskets || []).forEach(b => {
            (b.subjects || []).forEach(sub => {
              const formatted = `${sub.code}: ${sub.title}`;
              if (!list.includes(formatted)) list.push(formatted);
            });
          });
        }
      });
    }

    // 2. From DB folders
    if (allFolders && allFolders.length > 0) {
      const semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === semStr.trim());
      if (semFolder) {
        const dbSubjs = allFolders.filter(f => f.type === 'subject' && f.parent_id === semFolder.id);
        dbSubjs.forEach(s => {
          if (!list.includes(s.name)) list.push(s.name);
        });
      }
    }

    // 3. Ensure current subject is in the list
    if (editForm.subject && !list.includes(editForm.subject)) {
      list.unshift(editForm.subject);
    }
    if (activeSubject && activeSubject.name && !list.includes(activeSubject.name)) {
      if (!list.includes(activeSubject.name)) list.unshift(activeSubject.name);
    }

    return list;
  }, [editForm.program, editForm.semester, editForm.subject, selectedProgram, activeSemester, activeSubject, allFolders]);

  const editModalCategories = useMemo(() => {
    const list: string[] = [];

    // 1. Check allFolders in DB for category folders under the selected subject
    if (allFolders && allFolders.length > 0) {
      const targetSubjName = (editForm.subject || activeSubject?.name || '').trim();
      const targetSemName = (editForm.semester || activeSemester?.name || '').trim();
      
      const semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === targetSemName);
      if (semFolder) {
        const subjFolder = allFolders.find(f => f.type === 'subject' && f.name.trim() === targetSubjName && f.parent_id === semFolder.id);
        if (subjFolder) {
          const dbCats = allFolders.filter(f => f.type === 'category' && f.parent_id === subjFolder.id);
          dbCats.forEach(c => {
            if (!list.includes(c.name)) list.push(c.name);
          });
        }
      }
    }

    // 2. Check active subject categories state
    if (list.length === 0 && categories && categories.length > 0) {
      categories.forEach(c => {
        if (!list.includes(c.name)) list.push(c.name);
      });
    }

    // Fallback standard category folders if no DB categories found for this subject
    if (list.length === 0) {
      return ["Notes", "Lectures", "PYQs", "Syllabus", "Lab", "Books"];
    }

    // Ensure current selected file category type is present
    if (editForm.type && !list.includes(editForm.type)) {
      list.push(editForm.type);
    }

    return list;
  }, [categories, allFolders, editForm.subject, editForm.semester, editForm.type, activeSubject, activeSemester]);

  // Interaction overlays
  const [selectedFileDetail, setSelectedFileDetail] = useState<LibraryFile | null>(null);
  const [activePdfFile, setActivePdfFile] = useState<LibraryFile | null>(null);

  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreatePack, setShowCreatePack] = useState(false);

  // Discussions comments & pin states
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [expandedPostCommentsId, setExpandedPostCommentsId] = useState<string | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [pinningPostId, setPinningPostId] = useState<string | null>(null);

  // Nesting replies state
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; username: string; postId: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  // Autocomplete state
  const [acState, setAcState] = useState<{
    active: boolean;
    type: 'people' | 'docs' | null;
    query: string;
    triggerIndex: number;
    inputType: 'comment' | 'reply' | 'post-create' | 'post-edit';
    itemId: string;
  }>({
    active: false,
    type: null,
    query: '',
    triggerIndex: -1,
    inputType: 'comment',
    itemId: ''
  });

  const [acSuggestions, setAcSuggestions] = useState<any[]>([]);
  const [acSelectedIndex, setAcSelectedIndex] = useState(0);

  // Post editing & options states
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);

  // Robust subject code extractor
  const getSubjectCode = (nameOrCode: string) => {
    const match = nameOrCode.match(/([A-Za-z]+[0-9]+)/);
    return match ? match[1].toUpperCase() : nameOrCode.split(':')[0].trim().toUpperCase().replace(/\s+/g, '');
  };

  // Filter subject specific files
  const subjectFiles = useMemo(() => {
    const activeSubCode = getSubjectCode(activeSubject.name);
    console.log("[SubjectCommunity] activeSubject.name:", activeSubject.name, "activeSubCode:", activeSubCode);
    console.log("[SubjectCommunity] allFiles count:", allFiles.length);
    if (allFiles.length > 0) {
      console.log("[SubjectCommunity] Sample file subject:", allFiles[0].subject, "sample file program:", allFiles[0].program);
    }
    const filtered = allFiles.filter(f => {
      const fileSubCode = getSubjectCode(f.subject);
      const isSubMatch = fileSubCode === activeSubCode;
      if (!isSubMatch) return false;
      if (searchQuery && searchQuery.trim() !== '') {
        return f.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      }
      return true;
    });
    console.log("[SubjectCommunity] Filtered subjectFiles count:", filtered.length);
    
    // Sort files by display_order ascending (1 to 6), with uploadDate descending as fallback
    return [...filtered].sort((a, b) => {
      const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return b.uploadDate - a.uploadDate;
    });
  }, [allFiles, activeSubject.name, searchQuery]);
  const recentFiles = useMemo(() => {
    return [...subjectFiles]
      .sort((a, b) => b.uploadDate - a.uploadDate)
      .slice(0, 5);
  }, [subjectFiles]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Keep track of CodeMirror 6 views by pre elements
  const cm6Views = useRef<Map<HTMLElement, EditorView>>(new globalThis.Map());

  // Automatically inject and synchronize CodeMirror 6 editors in active WYSIWYG pre blocks
  useEffect(() => {
    const syncCodeMirror6 = () => {
      // Find all pre elements inside active contenteditable editors
      const pres = document.querySelectorAll('.wysiwyg-editor pre');
      
      pres.forEach(preEl => {
        const pre = preEl as HTMLElement;
        const code = pre.querySelector('code');
        if (!code) return;

        // Check if there is a manual language
        let lang = 'auto';
        const classList = Array.from(code.classList) as string[];
        const langClass = classList.find(c => c.startsWith('language-')) as string | undefined;
        if (langClass) {
          lang = langClass.replace('language-', '');
        }

        // If auto language, make sure CodeMirror is destroyed and pre is visible
        if (lang === 'auto') {
          if (cm6Views.current.has(pre)) {
            const view = cm6Views.current.get(pre);
            view?.destroy();
            // Find and remove the cm6 container next to it
            const container = pre.nextSibling as HTMLElement;
            if (container && container.classList.contains('cm6-editor-container')) {
              container.remove();
            }
            pre.style.display = '';
            cm6Views.current.delete(pre);
          }
          return;
        }

        // If manual language, we want to mount CodeMirror 6 if not already mounted
        if (cm6Views.current.has(pre)) {
          const container = pre.nextSibling as HTMLElement;
          if (container && container.classList.contains('cm6-editor-container')) {
            const currentMountedLang = container.dataset.lang;
            if (currentMountedLang !== lang) {
              const view = cm6Views.current.get(pre);
              view?.destroy();
              container.remove();
              cm6Views.current.delete(pre);
            }
          }
        }

        if (!cm6Views.current.has(pre)) {
          // Hide the original pre element
          pre.style.display = 'none';

          // Create container for CodeMirror (contenteditable=false to prevent parent editing quirks)
          const container = document.createElement('div');
          container.contentEditable = 'false';
          container.className = 'cm6-editor-container my-3 rounded-lg';
          container.dataset.lang = lang;
          pre.parentNode?.insertBefore(container, pre.nextSibling);

          // Get appropriate language support extension
          const getLangSupport = (l: string) => {
            const low = l.toLowerCase();
            if (low === 'javascript' || low === 'typescript') return javascript();
            if (low === 'python') return python();
            if (low === 'cpp' || low === 'c') return cpp();
            if (low === 'java') return java();
            if (low === 'rust') return rust();
            if (low === 'go') return go();
            if (low === 'html') return langHtml();
            if (low === 'css') return langCss();
            if (low === 'sql') return langSql();
            return null;
          };

          const githubDarkHighlightStyle = HighlightStyle.define([
            { tag: t.keyword, color: "#ff7b72", fontWeight: "bold" },
            { tag: t.controlKeyword, color: "#ff7b72", fontWeight: "bold" },
            { tag: t.operator, color: "#ff7b72" },
            { tag: t.operatorKeyword, color: "#ff7b72" },
            { tag: t.string, color: "#a5d6ff" },
            { tag: t.character, color: "#a5d6ff" },
            { tag: t.comment, color: "#8b949e", fontStyle: "italic" },
            { tag: t.variableName, color: "#c9d1d9" },
            { tag: t.propertyName, color: "#d2a8ff" },
            { tag: t.definition(t.propertyName), color: "#d2a8ff" },
            { tag: t.function(t.variableName), color: "#d2a8ff" },
            { tag: t.className, color: "#f0883e" },
            { tag: t.typeName, color: "#ff7b72" },
            { tag: t.number, color: "#79c0ff" },
            { tag: t.bool, color: "#79c0ff" },
            { tag: t.null, color: "#79c0ff" },
            { tag: t.tagName, color: "#7ee787" },
            { tag: t.angleBracket, color: "#8b949e" },
            { tag: t.attributeName, color: "#a5d6ff" },
            { tag: t.attributeValue, color: "#a5d6ff" },
            { tag: t.className, color: "#d2a8ff" },
            { tag: t.squareBracket, color: "#c9d1d9" },
            { tag: t.standard(t.tagName), color: "#7ee787" }
          ]);

          const langSupport = getLangSupport(lang);
          const extensions: any[] = [
            history(),
            keymap.of([
              {
                key: "ArrowDown",
                run: (view) => {
                  const state = view.state;
                  if (state.selection.main.empty && state.selection.main.head === state.doc.length) {
                    const container = view.dom.closest('.cm6-editor-container');
                    if (container) {
                      let nextSibling = container.nextSibling as HTMLElement | null;
                      if (!nextSibling || nextSibling.tagName.toLowerCase() !== 'p') {
                        const p = document.createElement('p');
                        p.innerHTML = '&#8203;';
                        container.parentNode?.insertBefore(p, container.nextSibling);
                        nextSibling = p;
                      }
                      const sel = window.getSelection();
                      if (sel && nextSibling.firstChild) {
                        const range = document.createRange();
                        range.setStart(nextSibling.firstChild, 0);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        nextSibling.focus();
                        return true;
                      }
                    }
                  }
                  return false;
                }
              },
              {
                key: "ArrowUp",
                run: (view) => {
                  const state = view.state;
                  if (state.selection.main.empty && state.selection.main.head === 0) {
                    const container = view.dom.closest('.cm6-editor-container');
                    if (container) {
                      let prevSibling = container.previousSibling as HTMLElement | null;
                      if (prevSibling && prevSibling.tagName.toLowerCase() === 'pre') {
                        prevSibling = prevSibling.previousSibling as HTMLElement | null;
                      }
                      if (prevSibling && prevSibling.tagName.toLowerCase() === 'p') {
                        const sel = window.getSelection();
                        if (sel && prevSibling.firstChild) {
                          const range = document.createRange();
                          range.setStart(prevSibling.firstChild, prevSibling.firstChild.textContent?.length || 0);
                          range.collapse(true);
                          sel.removeAllRanges();
                          sel.addRange(range);
                          prevSibling.focus();
                          return true;
                        }
                      }
                    }
                  }
                  return false;
                }
              },
              ...defaultKeymap,
              ...historyKeymap,
              ...completionKeymap
            ]),
            autocompletion(),
            tooltips(),
            syntaxHighlighting(githubDarkHighlightStyle),
            abbreviationTracker(),
            EditorView.theme({
              "&": {
                background: "#1e1e1e !important",
                color: "#d4d4d4 !important",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace !important",
                fontSize: "13px !important",
                borderRadius: "8px !important",
                border: "none !important",
                outline: "none !important",
                padding: "1rem !important"
              },
              ".cm-content": {
                caretColor: "#d4d4d4 !important",
                padding: "0 !important"
              },
              ".cm-cursor": {
                borderLeftColor: "#d4d4d4 !important"
              },
              ".cm-scroller": {
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace !important",
                lineHeight: "1.5 !important",
                overflow: "visible !important"
              },
              ".cm-tooltip-autocomplete": {
                backgroundColor: "#121214 !important",
                border: "1px solid #27272a !important",
                borderRadius: "8px !important",
                padding: "4px !important",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5) !important",
                color: "#a1a1aa !important",
                zIndex: "99999 !important"
              },
              ".cm-tooltip-autocomplete ul li": {
                padding: "4px 8px !important",
                borderRadius: "4px !important",
                fontSize: "11px !important",
                cursor: "pointer !important"
              },
              ".cm-tooltip-autocomplete ul li[aria-selected]": {
                backgroundColor: "rgba(255, 255, 255, 0.05) !important",
                color: "#ffffff !important"
              },
              ".cm-snippetField": {
                backgroundColor: "rgba(255, 255, 255, 0.15) !important",
                outline: "none !important",
                display: "inline !important"
              },
              ".cm-snippetFieldPosition": {
                display: "inline-block !important",
                verticalAlign: "text-top !important",
                width: "0 !important",
                height: "1.15em !important",
                margin: "0 -0.7px -.7em !important",
                borderLeft: "1.4px dotted #888 !important"
              }
            }, { dark: true })
          ];

          if (langSupport) {
            extensions.push(langSupport);
          }

          const startState = EditorState.create({
            doc: code.textContent || '',
            extensions
          });

          const view = new EditorView({
            state: startState,
            parent: container,
            dispatch: (tr) => {
              view.update([tr]);
              if (tr.docChanged) {
                code.textContent = view.state.doc.toString();
                // Trigger input event on the parent contenteditable editor
                const editor = pre.closest('.wysiwyg-editor');
                if (editor) {
                  const event = new Event('input', { bubbles: true });
                  editor.dispatchEvent(event);
                }
              }
            }
          });

          cm6Views.current.set(pre, view);
          view.focus();
        }
      });

      // Cleanup destroyed pre elements
      cm6Views.current.forEach((view, pre) => {
        if (!document.body.contains(pre)) {
          view.destroy();
          cm6Views.current.delete(pre);
        }
      });
    };

    // Run sync on load and selection changes
    syncCodeMirror6();
    const interval = setInterval(syncCodeMirror6, 1000);

    return () => {
      clearInterval(interval);
      cm6Views.current.forEach((view) => {
        view.destroy();
      });
      cm6Views.current.clear();
      // Remove any container left
      document.querySelectorAll('.cm6-editor-container').forEach(c => c.remove());
    };
  }, [subjectFiles]);

  // Forms
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<'discussion' | 'request' | 'doubt' | 'poll' | 'question' | 'resource' | 'announcement'>('discussion');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [showEditCategoryDropdown, setShowEditCategoryDropdown] = useState(false);
  const [showSocialFilterDropdown, setShowSocialFilterDropdown] = useState(false);
  const [editPostCategory, setEditPostCategory] = useState<'discussion' | 'doubt' | 'poll' | 'question' | 'resource' | 'announcement'>('discussion');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const createEditorRef = useRef<HTMLDivElement>(null);
  const editEditorRef = useRef<HTMLDivElement>(null);
  const reqEditorRef = useRef<HTMLDivElement>(null);

  // WYSIWYG formatting helper
  const execFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Instantly notify selection change to update toolbar active states
    document.dispatchEvent(new Event('selectionchange'));
  }, []);

  const getEditorText = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    return ref.current?.innerText?.trim() || '';
  }, []);

  const getEditorHtml = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return '';
    const clone = ref.current.cloneNode(true) as HTMLDivElement;
    
    // Find all CodeMirror containers, restore the original pre elements, and remove the wrappers
    const containers = clone.querySelectorAll('.cm6-editor-container');
    containers.forEach((container) => {
      let pre = container.previousElementSibling as HTMLElement | null;
      if (!pre && container.previousSibling) {
        let sib = container.previousSibling;
        while (sib) {
          if (sib.nodeType === Node.ELEMENT_NODE && (sib as HTMLElement).tagName?.toLowerCase() === 'pre') {
            pre = sib as HTMLElement;
            break;
          }
          sib = sib.previousSibling;
        }
      }
      if (pre && pre.tagName?.toLowerCase() === 'pre') {
        pre.style.display = '';
      }
      container.parentNode?.removeChild(container);
    });

    // Strip any premium-code-block wrapper that might have gotten in
    clone.querySelectorAll('.premium-code-block').forEach(wrapper => {
      const pre = wrapper.querySelector('pre');
      if (pre) {
        pre.style.display = '';
        wrapper.replaceWith(pre);
      } else {
        wrapper.remove();
      }
    });

    // Make sure all pre elements in the clone are visible
    clone.querySelectorAll('pre').forEach((pre) => {
      pre.style.display = '';
    });
    
    return clone.innerHTML;
  }, []);

  // Track active formatting state (bold, italic, etc.)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [activePreNode, setActivePreNode] = useState<HTMLElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Custom wrapper/unwrapper for tags like code and blockquote
  const toggleTag = useCallback((tagName: string, defaultStyle = '', defaultClass = '') => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // Check if selection is already inside this tag
    let parentNode = sel.anchorNode;
    let tagNode: HTMLElement | null = null;
    while (parentNode && parentNode !== document.body) {
      if (parentNode.nodeType === Node.ELEMENT_NODE) {
        const el = parentNode as HTMLElement;
        if (el.tagName.toLowerCase() === tagName) {
          tagNode = el;
          break;
        }
      }
      parentNode = parentNode.parentNode;
    }

    if (tagNode) {
      if (range.collapsed) {
        // Exit the tag: Insert zero-width space after tagNode/pre block and move caret there
        const parent = tagNode.parentNode;
        if (parent && parent.nodeType === Node.ELEMENT_NODE) {
          const parentEl = parent as HTMLElement;
          const isPre = parentEl.tagName.toLowerCase() === 'pre';
          const targetNode = isPre ? parentEl : tagNode;
          const outerParent = targetNode.parentNode;
          
          if (outerParent) {
            // Create a paragraph element for clean line breaking
            const p = document.createElement('p');
            p.innerHTML = '&#8203;'; // zero-width space
            
            if (targetNode.nextSibling) {
              outerParent.insertBefore(p, targetNode.nextSibling);
            } else {
              outerParent.appendChild(p);
            }
            
            // Move cursor to this new paragraph
            range.setStart(p.firstChild!, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } else {
        // Unwrap the tag since they highlighted text and want to clear style
        const parent = tagNode.parentNode;
        if (parent) {
          const fragment = document.createDocumentFragment();
          while (tagNode.firstChild) {
            fragment.appendChild(tagNode.firstChild);
          }
          parent.replaceChild(fragment, tagNode);
        }
      }
    } else {
      // Wrap selection
      const el = document.createElement(tagName);
      if (defaultStyle) {
        el.style.cssText = defaultStyle;
      }
      if (defaultClass) {
        el.className = defaultClass;
      }
      
      if (range.collapsed) {
        // If selection is empty, insert zero-width space so the tag doesn't collapse
        el.innerHTML = '&#8203;';
        range.insertNode(el);
        // Put cursor inside the element, after the zero-width space
        range.setStart(el.firstChild!, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        try {
          range.surroundContents(el);
        } catch (e) {
          try {
            el.appendChild(range.extractContents());
            range.insertNode(el);
          } catch (err) {
            console.error("Failed to wrap selection:", err);
          }
        }
      }
    }
    // Dispatch selectionchange instantly to update formatting states in toolbar
    document.dispatchEvent(new Event('selectionchange'));
  }, []);



  // Poll formatting state on selection change
  useEffect(() => {
    const updateFormats = () => {
      const formats: Record<string, boolean> = {
        bold: false,
        italic: false,
        strikeThrough: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        code: false,
        quote: false,
      };
      let preEl: HTMLElement | null = null;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        // Verify if selection is inside one of our WYSIWYG editors
        let insideEditor = false;
        let temp = node;
        while (temp && temp !== document.body) {
          if (temp.nodeType === Node.ELEMENT_NODE) {
            const el = temp as HTMLElement;
            if (el.classList.contains('wysiwyg-editor') || el.hasAttribute('contenteditable')) {
              insideEditor = true;
              break;
            }
          }
          temp = temp.parentNode;
        }

        if (insideEditor) {
          try {
            formats.bold = document.queryCommandState('bold');
            formats.italic = document.queryCommandState('italic');
            formats.strikeThrough = document.queryCommandState('strikeThrough') || document.queryCommandState('strikethrough');
            formats.insertUnorderedList = document.queryCommandState('insertUnorderedList');
            formats.insertOrderedList = document.queryCommandState('insertOrderedList');
          } catch (e) {}

          while (node && node !== document.body) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const tagName = el.tagName.toLowerCase();
              
              if (el.classList.contains('cm6-editor-container') || el.classList.contains('cm-editor')) {
                formats.code = true;
                const container = el.closest('.cm6-editor-container') || el;
                const siblingPre = container.previousSibling as HTMLElement;
                if (siblingPre && siblingPre.tagName.toLowerCase() === 'pre') {
                  preEl = siblingPre;
                }
              }
              if (tagName === 'pre') {
                preEl = el;
              }
              if (tagName === 'code') {
                formats.code = true;
              }
              if (tagName === 'blockquote') {
                formats.quote = true;
              }
              if (tagName === 'strong' || tagName === 'b' || el.style.fontWeight === 'bold' || el.style.fontWeight === '700') {
                formats.bold = true;
              }
              if (tagName === 'em' || tagName === 'i' || el.style.fontStyle === 'italic') {
                formats.italic = true;
              }
              if (tagName === 'strike' || tagName === 's' || tagName === 'del' || el.style.textDecoration.includes('line-through')) {
                formats.strikeThrough = true;
              }
              if (tagName === 'ul') {
                formats.insertUnorderedList = true;
              }
              if (tagName === 'ol') {
                formats.insertOrderedList = true;
              }
            }
            node = node.parentNode;
          }
        }
      }
      setActiveFormats(formats);
      setActivePreNode(preEl);
    };

    document.addEventListener('selectionchange', updateFormats);
    // Initialize formats once
    updateFormats();
    return () => document.removeEventListener('selectionchange', updateFormats);
  }, []);

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File, editorRef: React.RefObject<HTMLDivElement | null>) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageUploading(true);
    try {
      const url = await uploadCommunityImage(file);
      // Focus the editor and insert image at cursor
      if (editorRef.current) {
        editorRef.current.focus();
        const img = document.createElement('img');
        img.src = url;
        img.alt = file.name;
        img.style.cssText = 'max-width:100%;border-radius:8px;margin:8px 0;display:block';
        // Insert at cursor or append
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.setStartAfter(img);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }
      }
      showToast('Image uploaded!', 'success');
    } catch (e: any) {
      console.error('Image upload failed:', e);
      showToast('Image upload failed: ' + (e?.message || 'Unknown error'), 'error');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }, [showToast]);

  // Track which editor triggered the image upload
  const activeEditorForImageRef = useRef<React.RefObject<HTMLDivElement | null>>(createEditorRef);

  // Automatically detect and wrap links inside html strings
  const autoLink = useCallback((html: string): string => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      
      const walkTextNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (urlRegex.test(text)) {
            const parent = node.parentNode;
            if (parent && parent.nodeName.toLowerCase() !== 'a' && parent.nodeName.toLowerCase() !== 'code') {
              const span = document.createElement('span');
              span.innerHTML = text.replace(urlRegex, (url) => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: ${theme.rawColor}; text-decoration: underline; font-weight: 600;">${url}</a>`;
              });
              parent.replaceChild(span, node);
            }
          }
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            walkTextNodes(node.childNodes[i]);
          }
        }
      };
      
      if (doc.body) {
        walkTextNodes(doc.body);
        return doc.body.innerHTML;
      }
    } catch (e) {
      console.error("AutoLink parsing failed:", e);
    }
    return html;
  }, [theme.rawColor]);

  // Helper to format tags (@people and @docs)
  const renderFormattedContent = useCallback((content: string): string => {
    if (!content) return '';
    
    // Create a temporary element to parse and manipulate HTML (fully safe inside client-side React)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // 1. Strip any saved CodeMirror editor containers from the DOM (legacy dirty database entries)
    tempDiv.querySelectorAll('.cm6-editor-container').forEach(c => c.remove());
    
    // 2. Wrap all pre blocks with our premium block design
    const preElements = tempDiv.querySelectorAll('pre');
    preElements.forEach((pre) => {
      // If it's inside an editor or already wrapped, skip it
      if (pre.closest('.wysiwyg-editor') || pre.closest('.premium-code-block')) return;
      
      const code = pre.querySelector('code');
      if (!code) return;
      
      // Auto-detect language
      let lang = 'auto';
      const classList = Array.from(code.classList) as string[];
      const langClass = classList.find(c => c.startsWith('language-')) as string | undefined;
      
      // Also check pre element classes for language
      const preClassList = Array.from(pre.classList) as string[];
      const preLangClass = preClassList.find(c => c.startsWith('language-')) as string | undefined;
      
      if (langClass) {
        lang = langClass.replace('language-', '');
      } else if (preLangClass) {
        lang = preLangClass.replace('language-', '');
      }
      
      const niceLangNames: Record<string, string> = {
        javascript: 'JavaScript',
        typescript: 'TypeScript',
        js: 'JavaScript',
        ts: 'TypeScript',
        python: 'Python',
        py: 'Python',
        html: 'HTML',
        css: 'CSS',
        cpp: 'C++',
        c: 'C',
        java: 'Java',
        csharp: 'C#',
        cs: 'C#',
        rust: 'Rust',
        go: 'Go',
        bash: 'Bash',
        shell: 'Shell',
        sql: 'SQL',
        json: 'JSON',
        xml: 'XML',
        yaml: 'YAML',
        markdown: 'Markdown',
        md: 'Markdown',
        php: 'PHP',
        ruby: 'Ruby',
      };
      
      const displayLang = niceLangNames[lang.toLowerCase()] || (lang.charAt(0).toUpperCase() + lang.slice(1));
      const cleanCodeText = (code.textContent || '').replace(/^[\r\n\u200b]+|[\r\n\u200b]+$/g, '');
      
      // Ensure the pre element style is visible
      pre.style.display = '';

      // Helper to HTML-escape code content so it displays as raw text rather than parsing as HTML tags
      const escapeHtml = (text: string): string => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };
      
      // Create premium block HTML wrapper
      const wrapperHTML = `<div class="premium-code-block relative rounded-xl overflow-hidden border border-zinc-800/50 dark:border-white/5 my-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono shadow-sm"><div class="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] text-[12px] font-semibold text-[#abb2bf] select-none"><div class="flex items-center"><svg style="width:14px;height:14px;stroke-width:2.5px;color:#abb2bf;margin-right:8px;display:inline-block;vertical-align:middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg><span>${displayLang}</span></div><button type="button" class="code-copy-btn text-[#abb2bf] hover:text-white bg-transparent hover:bg-white/5 p-1.5 rounded-md transition-all active:scale-95 cursor-pointer border-none" onclick="const text = this.parentElement.nextElementSibling.innerText; navigator.clipboard.writeText(text).then(() => { const oldHTML = this.innerHTML; this.innerHTML = '<svg style=\x27width:16px;height:16px;stroke-width:2px;color:#abb2bf;\x27 viewBox=\x270 0 24 24\x27 fill=\x27none\x27 stroke=\x27currentColor\x27 stroke-linecap=\x27round\x27 stroke-linejoin=\x27round\x27><polyline points=\x2720 6 9 17 4 12\x27></polyline></svg>'; setTimeout(() => { this.innerHTML = oldHTML; }, 2000); })"><svg style="width:16px;height:16px;stroke-width:2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div><pre style="margin: 0 !important; padding: 0.25rem 1rem 1.25rem 1rem !important; background: transparent !important; border: none !important; border-radius: 0 !important; box-shadow: none !important;" class="overflow-x-auto text-[13px] leading-relaxed m-0 no-scrollbar"><code class="language-${lang}">${escapeHtml(cleanCodeText)}</code></pre></div>`;
      
      const placeholder = document.createElement('div');
      placeholder.innerHTML = wrapperHTML;
      pre.replaceWith(placeholder.firstElementChild!);
    });
    
    // 3. Run link parsing and tagging on the text
    let formatted = tempDiv.innerHTML;
    formatted = autoLink(formatted);
    
    // Format doc tags: [@docName](doc:docId) -> <span class="tagged-doc" data-id="docId">📄 docName</span>
    const docRegex = /\[@([^\]]+)\]\(doc:([^\)]+)\)/g;
    formatted = formatted.replace(docRegex, (match, docName, docId) => {
      return `<span class="tagged-doc cursor-pointer font-bold underline transition-colors hover:opacity-80" data-id="${docId}" style="color: ${theme.rawColor}">📄 ${docName}</span>`;
    });

    // Format people tags: @username -> <span class="tagged-user font-bold" style="color: ${theme.rawColor}">@username</span>
    const userRegex = /@([a-zA-Z0-9_-]+)/g;
    formatted = formatted.replace(userRegex, (match, username) => {
      return `<span class="tagged-user font-bold" style="color: ${theme.rawColor}">@${username}</span>`;
    });

    return formatted;
  }, [autoLink, theme.rawColor]);

  // Click handler to open documents linked in posts/comments
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('tagged-doc')) {
      const docId = target.getAttribute('data-id');
      if (docId) {
        const file = subjectFiles.find(f => f.id === docId);
        if (file) {
          setSelectedFileDetail(file);
        } else {
          showToast("Document not found.", "info");
        }
      }
    }
  }, [subjectFiles, showToast]);

  // Autocomplete suggestion fetcher
  const fetchAutocompleteSuggestions = useCallback(async (query: string) => {
    const q = query.trim().toLowerCase();
    
    // 1. Fetch matching docs from subjectFiles
    const matchedDocs = subjectFiles.filter(f => 
      f.name.toLowerCase().includes(q)
    ).map(f => ({
      type: 'doc' as const,
      id: f.id,
      name: f.name
    }));

    // 2. Fetch matching users (profiles) from database, fallback to local users
    let matchedPeople: any[] = [];
    const client = NexusServer.getClient();
    if (client && q.length > 0) {
      try {
        const { data } = await client
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${q}%`)
          .limit(25);
        if (data && data.length > 0) {
          matchedPeople = data.map(p => ({
            type: 'people' as const,
            id: p.id,
            username: p.username,
            avatar_url: p.avatar_url
          }));
        }
      } catch (e) {}
    }

    if (matchedPeople.length === 0) {
      // Fallback search in local community users
      const localUsers = [
        userProfile,
        ...moderatorsList.map(m => ({ id: m.username, username: m.username, avatar_url: m.avatar_url })),
        ...leaderboardList.map(l => ({ id: l.username, username: l.username, avatar_url: l.avatar_url }))
      ].filter(Boolean) as any[];

      const seen = new Set();
      const uniqueUsers = localUsers.filter(u => {
        if (!u.username || seen.has(u.username)) return false;
        seen.add(u.username);
        return u.username.toLowerCase().includes(q);
      }).map(u => ({
        type: 'people' as const,
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url
      }));

      matchedPeople = uniqueUsers;
    }

    setAcSuggestions([...matchedPeople, ...matchedDocs]);
    setAcSelectedIndex(0);
  }, [subjectFiles, userProfile, moderatorsList, leaderboardList]);

  // Search input change handler to check for '@' autocomplete triggers
  // Code keyword suggestions fetcher
  const fetchKeywordSuggestions = useCallback((word: string, lang: string) => {
    const q = word.toLowerCase();
    const keywordMap: Record<string, string[]> = {
      javascript: ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'true', 'false', 'null', 'undefined', 'console.log', 'async', 'await', 'promise', 'then', 'catch'],
      typescript: ['const', 'let', 'var', 'function', 'class', 'import', 'export', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'true', 'false', 'null', 'undefined', 'console.log', 'async', 'await', 'promise', 'then', 'catch', 'interface', 'type', 'keyof', 'readonly'],
      python: ['def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None', 'try', 'except', 'finally', 'print', 'with', 'lambda'],
      cpp: ['int', 'float', 'double', 'char', 'void', 'class', 'struct', 'public', 'private', 'protected', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'std::cout', 'std::cin', 'include', 'define', 'using', 'namespace'],
      c: ['int', 'float', 'double', 'char', 'void', 'struct', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'printf', 'scanf', 'include', 'define'],
      java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import', 'package', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'int', 'double', 'float', 'boolean', 'char', 'String', 'System.out.println', 'new', 'this', 'super'],
      csharp: ['public', 'private', 'protected', 'class', 'interface', 'using', 'namespace', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'int', 'double', 'float', 'bool', 'char', 'string', 'Console.WriteLine', 'new', 'this', 'var'],
      rust: ['fn', 'let', 'mut', 'struct', 'enum', 'impl', 'use', 'mod', 'return', 'if', 'else', 'for', 'while', 'match', 'pub', 'crate', 'self', 'Self', 'println!', 'true', 'false'],
      go: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'break', 'continue', 'fmt.Println', 'fmt.Printf', 'nil', 'true', 'false'],
      html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'a', 'img', 'button', 'input', 'form', 'label', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'class', 'id', 'style', 'href', 'src', 'alt', 'type', 'placeholder', 'value'],
      css: ['color', 'background', 'background-color', 'font-size', 'font-family', 'font-weight', 'margin', 'padding', 'border', 'border-radius', 'display', 'flex', 'grid', 'position', 'absolute', 'relative', 'fixed', 'width', 'height', 'top', 'bottom', 'left', 'right', 'justify-content', 'align-items', 'box-shadow', 'transition', 'animation', 'transform'],
      sql: ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
      json: ['"name"', '"id"', '"type"', '"value"', '"status"', '"count"', '"description"', '"true"', '"false"', '"null"'],
      bash: ['echo', 'cd', 'ls', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'sudo', 'grep', 'awk', 'sed', 'cat', 'less', 'curl', 'wget', 'export', 'alias', 'git', 'npm', 'node', 'python3']
    };

    const list = keywordMap[lang.toLowerCase()] || [];
    const matched = list.filter(k => k.toLowerCase().startsWith(q)).map(k => ({
      type: 'code-keyword' as const,
      id: k,
      name: k
    }));

    setAcSuggestions(matched);
    setAcSelectedIndex(0);
  }, []);

  // Search input change handler to check for '@' autocomplete triggers
  const handleInputAutocomplete = useCallback((
    val: string,
    selectionStart: number,
    inputType: 'comment' | 'reply' | 'post-create' | 'post-edit',
    itemId: string
  ) => {
    // 1. Check if we are inside a contenteditable code block
    if (inputType === 'post-create' || inputType === 'post-edit') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const textNode = range.startContainer;
        
        let temp: Node | null = textNode;
        let codeNode: HTMLElement | null = null;
        while (temp && temp !== document.body) {
          if (temp.nodeType === Node.ELEMENT_NODE && (temp as HTMLElement).tagName.toLowerCase() === 'code') {
            codeNode = temp as HTMLElement;
            break;
          }
          temp = temp.parentNode;
        }

        if (codeNode) {
          // Inside a code block! Let's get the text before cursor in the current text node
          const textBeforeCursor = textNode.nodeValue ? textNode.nodeValue.slice(0, range.startOffset) : '';
          const words = textBeforeCursor.split(/[^a-zA-Z0-9_$#@!]+/);
          const lastWord = words[words.length - 1] || '';

          const cls = Array.from(codeNode.classList).find(c => c.startsWith('language-')) as string | undefined;
          const lang = cls ? cls.replace('language-', '').toLowerCase() : 'auto';

          // Trigger code keyword suggestions if manual language is selected, word is non-empty, and not a user tag
          if (lang !== 'auto' && lastWord.length >= 1 && !lastWord.startsWith('@')) {
            setAcState({
              active: true,
              type: 'code-keyword',
              query: lastWord,
              triggerIndex: textBeforeCursor.lastIndexOf(lastWord),
              inputType,
              itemId
            });
            fetchKeywordSuggestions(lastWord, lang);
            return;
          }
        }
      }
    }

    // 2. Regular user / document tagging trigger
    const textBeforeCursor = val.slice(0, selectionStart);
    const words = textBeforeCursor.split(/[\s,]+/);
    const lastWord = words[words.length - 1] || '';

    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1);
      setAcState({
        active: true,
        type: 'people',
        query,
        triggerIndex: textBeforeCursor.lastIndexOf('@'),
        inputType,
        itemId
      });
      fetchAutocompleteSuggestions(query);
    } else {
      setAcState(prev => ({ ...prev, active: false }));
    }
  }, [fetchAutocompleteSuggestions, fetchKeywordSuggestions]);

  // Insert caret text for contenteditable
  const insertTextAtCaret = useCallback((text: string) => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const triggerLength = acState.type === 'code-keyword' ? acState.query.length : acState.query.length + 1;
      try {
        const textNode = range.startContainer;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const offset = range.startOffset;
          if (offset >= triggerLength) {
            range.setStart(textNode, offset - triggerLength);
            range.deleteContents();
          }
        }
      } catch (e) {}

      const node = document.createTextNode(text);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [acState.query, acState.type]);

  // Handle suggestion selection
  const handleSelectAutocomplete = useCallback((suggestion: any) => {
    const isDoc = suggestion.type === 'doc';
    const isKeyword = suggestion.type === 'code-keyword';
    
    const inserted = isKeyword
      ? `${suggestion.name} `
      : isDoc 
        ? `[@${suggestion.name}](doc:${suggestion.id}) ` 
        : `@${suggestion.username} `;

    if (acState.inputType === 'comment') {
      const currentText = newCommentTexts[acState.itemId] || '';
      const beforeTrigger = currentText.slice(0, acState.triggerIndex);
      const afterTrigger = currentText.slice(acState.triggerIndex + acState.query.length + 1);
      setNewCommentTexts(prev => ({
        ...prev,
        [acState.itemId]: beforeTrigger + inserted + afterTrigger
      }));
    } else if (acState.inputType === 'reply') {
      const currentText = replyText;
      const beforeTrigger = currentText.slice(0, acState.triggerIndex);
      const afterTrigger = currentText.slice(acState.triggerIndex + acState.query.length + 1);
      setReplyText(beforeTrigger + inserted + afterTrigger);
    } else if (acState.inputType === 'post-create') {
      if (createEditorRef.current) {
        createEditorRef.current.focus();
        insertTextAtCaret(inserted);
        setPostContent(getEditorText(createEditorRef));
      }
    } else if (acState.inputType === 'post-edit') {
      if (editEditorRef.current) {
        editEditorRef.current.focus();
        insertTextAtCaret(inserted);
        setEditPostContent(getEditorText(editEditorRef));
      }
    }

    setAcState(prev => ({ ...prev, active: false }));
    setAcSelectedIndex(0);
  }, [acState, newCommentTexts, replyText, insertTextAtCaret]);

  // Unified Autocomplete dropdown rendering
  const renderAutocompleteDropdown = (inputId: string) => {
    if (!acState.active || acState.itemId !== inputId) return null;

    return (
      <div 
        className="absolute bottom-full left-0 mb-2 z-[9999] bg-white/95 dark:bg-[#121214]/95 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 w-64 h-[220px] flex flex-col backdrop-blur-md animate-toast-in select-none"
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
          {acSuggestions.length > 0 ? (
            acSuggestions.map((suggestion, idx) => {
              const isDoc = suggestion.type === 'doc';
              const isKeyword = suggestion.type === 'code-keyword';
              const key = suggestion.id + '-' + (isKeyword ? suggestion.name : isDoc ? suggestion.name : suggestion.username);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectAutocomplete(suggestion)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-left border-none bg-transparent cursor-pointer transition-colors ${
                    acSelectedIndex === idx 
                      ? 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white' 
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  {isDoc ? (
                    <FileText className="w-4 h-4 shrink-0 text-amber-500" />
                  ) : isKeyword ? (
                    <Cpu className="w-4 h-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                  ) : (
                    <img src={suggestion.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'} className="w-5 h-5 rounded-full shrink-0" />
                  )}
                  <span className="truncate flex-1">
                    {isKeyword ? suggestion.name : isDoc ? suggestion.name : `@${suggestion.username}`}
                  </span>
                  <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-400 ml-auto shrink-0 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                    {isKeyword ? 'Code' : isDoc ? 'Doc' : 'User'}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="text-[10px] text-zinc-450 p-3 text-center font-semibold h-full flex items-center justify-center">
              No matches for {acState.type === 'code-keyword' ? `"${acState.query}"` : `"@${acState.query}"`}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Keyboard navigation inside text inputs for autocomplete suggestion list
  const handleAutocompleteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!acState.active || acSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAcSelectedIndex(prev => (prev + 1) % acSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAcSelectedIndex(prev => (prev - 1 + acSuggestions.length) % acSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const selected = acSuggestions[acSelectedIndex];
      if (selected) {
        handleSelectAutocomplete(selected);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setAcState(prev => ({ ...prev, active: false }));
    }
  };

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (acState.active && acSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAcSelectedIndex(prev => (prev + 1) % acSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAcSelectedIndex(prev => (prev - 1 + acSuggestions.length) % acSuggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = acSuggestions[acSelectedIndex];
        if (selected) {
          handleSelectAutocomplete(selected);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setAcState(prev => ({ ...prev, active: false }));
        return;
      }
    }

    if (e.key === 'Enter') {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      // Find if we are inside a code or pre tag
      let node = sel.anchorNode;
      let codeNode: HTMLElement | null = null;
      let preNode: HTMLElement | null = null;
      while (node && node !== e.currentTarget) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName.toLowerCase() === 'code') {
            codeNode = el;
          }
          if (el.tagName.toLowerCase() === 'pre') {
            preNode = el;
          }
        }
        node = node.parentNode;
      }

      if (preNode || (codeNode && codeNode.parentNode && (codeNode.parentNode as HTMLElement).tagName.toLowerCase() === 'pre')) {
        // Inside a multiline code block (pre)
        e.preventDefault();
        
        const container = range.startContainer;
        if (container.nodeType === Node.TEXT_NODE) {
          const textNode = container as Text;
          const offset = range.startOffset;
          const val = textNode.nodeValue || '';
          
          // Check if cursor is at the end of the text node (or only has whitespace/zero-width space to the right)
          const remainingText = val.substring(offset).replace(/[\u200b\u200c\s]/g, '');
          const isAtEnd = remainingText === '';
          
          const insertStr = isAtEnd ? '\n\u200b' : '\n';
          textNode.nodeValue = val.substring(0, offset) + insertStr + val.substring(offset);
          
          // Place cursor right after the \n (which is offset + 1)
          range.setStart(textNode, offset + 1);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          // Fallback: insert a text node
          let isAtEnd = true;
          if (codeNode) {
            const rightRange = range.cloneRange();
            rightRange.selectNodeContents(codeNode);
            rightRange.setStart(range.endContainer, range.endOffset);
            isAtEnd = rightRange.toString().replace(/[\u200b\u200c\s]/g, '') === '';
          }
          
          const insertStr = isAtEnd ? '\n\u200b' : '\n';
          const textNode = document.createTextNode(insertStr);
          range.insertNode(textNode);
          
          if (isAtEnd) {
            range.setStart(textNode, 1);
          } else {
            range.setStartAfter(textNode);
          }
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        
        // Trigger input event to update React state
        const event = new Event('input', { bubbles: true });
        e.currentTarget.dispatchEvent(event);
      } else if (codeNode) {
        // Inside an inline code block
        e.preventDefault();
        
        // Exit the inline code block by inserting a paragraph outside of it
        const parent = codeNode.parentNode;
        if (parent) {
          // Create a paragraph element for clean line breaking
          const p = document.createElement('p');
          p.innerHTML = '&#8203;'; // zero-width space
          
          // Insert after codeNode
          if (codeNode.nextSibling) {
            parent.insertBefore(p, codeNode.nextSibling);
          } else {
            parent.appendChild(p);
          }
          
          // Move cursor to this new paragraph
          range.setStart(p.firstChild!, 1);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);

          // Trigger input event to update React state
          const event = new Event('input', { bubbles: true });
          e.currentTarget.dispatchEvent(event);
        }
      }
    }
  }, [acState, acSuggestions, acSelectedIndex, handleSelectAutocomplete]);

  // Reusable toolbar items builder — returns the standard formatting items array
  const buildToolbarItems = useCallback((editorRef: React.RefObject<HTMLDivElement | null>, opts?: { full?: boolean }) => {
    const full = opts?.full !== false; // default true
    const items: any[] = [];

    if (full) {
      items.push(
        { icon: Image, label: 'Image', cmd: 'image', action: () => {
          activeEditorForImageRef.current = editorRef;
          imageInputRef.current?.click();
        }},
        { type: 'divider' },
      );
    }

    items.push(
      { icon: Bold, label: 'Bold', cmd: 'bold', action: () => execFormat('bold') },
      { icon: Italic, label: 'Italic', cmd: 'italic', action: () => execFormat('italic') },
      { icon: Strikethrough, label: 'Strikethrough', cmd: 'strikeThrough', action: () => execFormat('strikeThrough') },
      { type: 'divider' },
      { icon: List, label: 'Bullet List', cmd: 'insertUnorderedList', action: () => execFormat('insertUnorderedList') },
      { icon: ListOrdered, label: 'Numbered List', cmd: 'insertOrderedList', action: () => execFormat('insertOrderedList') },
    );

    if (full) {
      items.push(
        { type: 'divider' },
        { icon: Code, label: 'Code', cmd: 'code', action: () => {
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const selectedText = range.toString();
            
            // Check if selection is already inside a pre or code tag, or inside CodeMirror 6
            let node = sel.anchorNode;
            let codeNode: HTMLElement | null = null;
            let preNode: HTMLElement | null = null;
            let insideCM = false;
            let cmContainer: HTMLElement | null = null;

            while (node && node !== editorRef.current) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.classList.contains('cm6-editor-container') || el.classList.contains('cm-editor')) {
                  insideCM = true;
                  cmContainer = el.closest('.cm6-editor-container') || el;
                  break;
                }
                if (el.tagName.toLowerCase() === 'code') {
                  codeNode = el;
                }
                if (el.tagName.toLowerCase() === 'pre') {
                  preNode = el;
                }
              }
              node = node.parentNode;
            }

            if (insideCM && cmContainer) {
              const siblingPre = cmContainer.previousSibling as HTMLElement;
              if (siblingPre && siblingPre.tagName.toLowerCase() === 'pre') {
                preNode = siblingPre;
                codeNode = siblingPre.querySelector('code');
              }
            }

            if (preNode || codeNode) {
              const targetNode = preNode || codeNode!;
              const parent = targetNode.parentNode;
              if (parent) {
                const contentSource = (preNode && codeNode) ? codeNode : targetNode;
                // Check if the code block is empty
                const textContent = (contentSource.textContent || '').replace(/[\u200b\u200c\s]/g, '');
                
                if (textContent === '') {
                  // If we are inside CodeMirror, destroy the view and remove the container
                  if (insideCM && cmContainer) {
                    if (preNode && cm6Views.current.has(preNode)) {
                      const view = cm6Views.current.get(preNode);
                      view?.destroy();
                      cm6Views.current.delete(preNode);
                    }
                    cmContainer.remove();
                  }

                  // If it is empty, toggle it off (unwrap/remove it)
                  const fragment = document.createDocumentFragment();
                  while (contentSource.firstChild) {
                    fragment.appendChild(contentSource.firstChild);
                  }
                  
                  if (fragment.childNodes.length === 0) {
                    fragment.appendChild(document.createTextNode('\u200b'));
                  }
                  
                  const firstChild = fragment.firstChild;
                  parent.replaceChild(fragment, targetNode);
                  
                  if (firstChild) {
                    range.selectNodeContents(firstChild);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                  }
                } else {
                  // If something is written, exit the code block and go to the next line
                  const p = document.createElement('p');
                  p.innerHTML = '&#8203;'; // zero-width space
                  
                  const anchorNode = insideCM && cmContainer ? cmContainer : targetNode;
                  if (anchorNode.nextSibling) {
                    parent.insertBefore(p, anchorNode.nextSibling);
                  } else {
                    parent.appendChild(p);
                  }
                  
                  // Move cursor to this new paragraph
                  range.setStart(p.firstChild!, 1);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                  
                  p.focus();
                }
                
                // Dispatch selection change to update toolbar
                document.dispatchEvent(new Event('selectionchange'));
                return;
              }
            }
            
            // Check if selection is multiline or if the selection is collapsed but inside an empty block
            let isBlockCode = selectedText.includes('\n') || selectedText.length > 60;
            
            if (range.collapsed) {
              let parentNode = range.startContainer.parentNode as HTMLElement | null;
              if (parentNode) {
                const text = parentNode.innerText || '';
                // If it's an empty line (or only contains zero-width space/placeholder helper), make it a block code
                if (text.trim() === '' || text === '\u200b') {
                  isBlockCode = true;
                }
              }
            }
            
            if (isBlockCode) {
              const pre = document.createElement('pre');
              const code = document.createElement('code');
              
              if (range.collapsed) {
                code.innerHTML = '&#8203;';
                pre.appendChild(code);
                range.insertNode(pre);
                range.setStart(code.firstChild!, 1);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              } else {
                code.appendChild(range.extractContents());
                pre.appendChild(code);
                range.insertNode(pre);
              }
              document.dispatchEvent(new Event('selectionchange'));
            } else {
              toggleTag('code', 'background:rgba(127,127,127,0.15);padding:1.5px 5.5px;border-radius:4.5px;font-family:monospace;font-size:12px', 'language-javascript');
            }
          }
        }},
        { icon: Quote, label: 'Quote', cmd: 'quote', action: () => {
          toggleTag('blockquote', 'border-left:3px solid rgba(127,127,127,0.4);padding-left:12px;margin:4px 0;color:inherit;opacity:0.8');
        }},
      );
    }

    return items;
  }, [execFormat, toggleTag]);

  // Render toolbar buttons with active state highlighting
  const renderToolbar = useCallback((items: any[], keyPrefix: string) => {
    return items.map((item: any, i: number) => {
      if (item.type === 'divider') {
        return <div key={`${keyPrefix}-${i}`} className="w-px h-5 bg-zinc-200 dark:bg-white/8 mx-1" />;
      }
      const Ic = item.icon;
      const isActive = item.cmd && activeFormats[item.cmd];
      return (
        <button
          key={`${keyPrefix}-${i}`}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={item.action}
          title={item.label}
          className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer transition-all ${
            isActive
              ? 'text-white bg-zinc-700 dark:bg-zinc-300 dark:text-zinc-900'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
          }`}
          style={isActive ? { backgroundColor: theme.rawColor, color: '#fff' } : undefined}
        >
          <Ic size={15} />
        </button>
      );
    });
  }, [activeFormats, theme.rawColor]);



  const isNodeInside = (child: Node | null, parent: Node | null) => {
    if (!child || !parent) return false;
    let node: Node | null = child;
    while (node) {
      if (node === parent) return true;
      node = node.parentNode;
    }
    return false;
  };

  const renderFloatingLanguageDropdown = (editorRef: React.RefObject<HTMLDivElement | null>) => {
    if (!activePreNode || !editorRef.current || !isNodeInside(activePreNode, editorRef.current)) return null;
    
    // Find the relative offsetTop
    let offsetTop = activePreNode.offsetTop;
    let temp = activePreNode.offsetParent as HTMLElement;
    
    // Walk up until we reach a relative/absolute container or the editorRef container
    while (temp && temp !== editorRef.current.parentNode && temp !== document.body) {
      if (window.getComputedStyle(temp).position !== 'static') {
        break;
      }
      offsetTop += temp.offsetTop;
      temp = temp.offsetParent as HTMLElement;
    }

    // Get current language
    const currentLang = (() => {
      const code = activePreNode.querySelector('code');
      if (code) {
        const cls = (Array.from(code.classList) as string[]).find(c => c.startsWith('language-')) as string | undefined;
        return cls ? cls.replace('language-', '') : 'auto';
      }
      return 'auto';
    })();

    const languages = [
      { value: 'auto', label: 'Auto Detect' },
      { value: 'python', label: 'Python' },
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'cpp', label: 'C++' },
      { value: 'c', label: 'C' },
      { value: 'java', label: 'Java' },
      { value: 'csharp', label: 'C#' },
      { value: 'rust', label: 'Rust' },
      { value: 'go', label: 'Go' },
      { value: 'html', label: 'HTML' },
      { value: 'css', label: 'CSS' },
      { value: 'sql', label: 'SQL' },
      { value: 'json', label: 'JSON' },
      { value: 'bash', label: 'Bash / Shell' }
    ];

    const currentLabel = languages.find(l => l.value === currentLang)?.label || 'Auto Detect';

    const handleSelectLang = (val: string) => {
      const code = activePreNode.querySelector('code');
      if (code) {
        // Remove existing language classes
        (Array.from(code.classList) as string[]).forEach(c => {
          if (c.startsWith('language-')) code.classList.remove(c);
        });
        if (val !== 'auto') {
          code.classList.add(`language-${val}`);
        }
        // Dispatch selection change to refresh state
        document.dispatchEvent(new Event('selectionchange'));
      }
      setShowLangDropdown(false);
    };

    return (
      <div
        style={{
          position: 'absolute',
          top: `${offsetTop + 8}px`,
          right: '16px',
          zIndex: 9999,
        }}
        className="relative animate-fade-in select-none"
      >
        {/* Trigger Button - Clean and Compact */}
        <button
          type="button"
          onClick={() => setShowLangDropdown(prev => !prev)}
          className="flex items-center gap-1 bg-zinc-900/90 dark:bg-[#121214]/90 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg px-2.5 py-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm cursor-pointer transition-all duration-150"
        >
          <span>{currentLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showLangDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Custom Theme Dropdown Menu */}
        {showLangDropdown && (
          <>
            {/* Click Outside Overlay to close dropdown */}
            <div 
              className="fixed inset-0 z-[99998]" 
              onClick={() => setShowLangDropdown(false)}
            />
            
            <div 
              className="absolute right-0 top-full mt-1.5 z-[99999] w-36 max-h-56 overflow-y-auto bg-white/95 dark:bg-[#121214]/95 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-2xl p-1 flex flex-col gap-0.5 backdrop-blur-md animate-toast-in scrollbar-thin"
            >
              {languages.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => handleSelectLang(lang.value)}
                  className={`w-full text-left py-1.5 px-2.5 text-[11px] font-semibold rounded-lg border-none cursor-pointer transition-colors ${
                    currentLang === lang.value
                      ? 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white'
                      : 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.02] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const [reqTitle, setReqTitle] = useState('');
  const [reqContent, setReqContent] = useState('');
  const [reqBounty, setReqBounty] = useState(50);

  // Subject Options & Editing
  const [showSubjectOptions, setShowSubjectOptions] = useState(false);
  const [showAboutSubjectModal, setShowAboutSubjectModal] = useState(false);
  const [aboutSubjectContent, setAboutSubjectContent] = useState<string>('');
  const [aboutSubjectLoading, setAboutSubjectLoading] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [editSubjectCode, setEditSubjectCode] = useState(subjectCode);
  const [editSubjectName, setEditSubjectName] = useState(subjectName);
  const [editSemesterId, setEditSemesterId] = useState(activeSemester?.id || '');
  const [editProgram, setEditProgram] = useState(selectedProgram);
  const [editColor, setEditColor] = useState(activeSubject.color || '#ff7a00');
  const [editIcon, setEditIcon] = useState(activeSubject.icon_name || 'Code');
  const [semestersList, setSemestersList] = useState<FolderType[]>([]);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [menuAnchorRect, setMenuAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!activeMenuFileId) return;
    const handleClose = () => {
      setActiveMenuFileId(null);
      setMenuAnchorRect(null);
    };
    
    // Delay adding the scroll listener to prevent focus/layout adjustments from closing it immediately
    const scrollTimer = setTimeout(() => {
      window.addEventListener('scroll', handleClose, true);
    }, 100);
    
    window.addEventListener('resize', handleClose);
    
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenuFileId]);

  useEffect(() => {
    setEditSubjectCode(subjectCode);
    setEditSubjectName(subjectName);
    setEditSemesterId(activeSemester?.id || '');
    setEditProgram(selectedProgram);
    setEditColor(activeSubject.color || '#ff7a00');
    setEditIcon(activeSubject.icon_name || 'Code');
  }, [activeSubject, activeSemester, selectedProgram, subjectCode, subjectName]);

  useEffect(() => {
    if (!showEditSubjectModal) return;
    const loadSemesters = async () => {
      try {
        const client = NexusServer.getClient();
        if (!client) return;
        const { data, error } = await client
          .from('library_items')
          .select('*')
          .eq('type', 'semester')
          .eq('program', editProgram)
          .order('display_order', { ascending: true });
        
        if (!error && data) {
          setSemestersList(data);
          const hasCurrentSem = data.some(s => s.id === editSemesterId);
          if (!hasCurrentSem && data.length > 0) {
            setEditSemesterId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load semesters for program", err);
      }
    };
    loadSemesters();
  }, [editProgram, showEditSubjectModal]);

  const [packTitle, setPackTitle] = useState('');
  const [packContent, setPackContent] = useState('');
  const [packFiles, setPackFiles] = useState<string[]>([]);
  const [packFileSearch, setPackFileSearch] = useState('');
  const packEditorRef = useRef<HTMLDivElement>(null);

  // Subject Scoped AI Chat
  const [subjectAiInput, setSubjectAiInput] = useState('');
  const [subjectAiHistory, setSubjectAiHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [subjectAiLoading, setSubjectAiLoading] = useState(false);





  const handleSaveSubjectDetails = async () => {
    if (!editSubjectCode.trim() || !editSubjectName.trim()) {
      showToast("Subject code and name are required", "error");
      return;
    }
    if (!editSemesterId) {
      showToast("Please select a semester", "error");
      return;
    }
    setIsSavingSubject(true);
    try {
      const selectedSemester = semestersList.find(s => s.id === editSemesterId) || activeSemester;
      const semName = selectedSemester ? selectedSemester.name : '';

      await NexusServer.updateSubjectDetails(
        activeSubject.id,
        activeSubject.name,
        editSubjectCode.trim().toUpperCase(),
        editSubjectName.trim(),
        editSemesterId,
        semName,
        editProgram,
        editColor,
        editIcon
      );

      showToast("Subject details updated successfully!", "success");
      setShowEditSubjectModal(false);
      
      if (editSemesterId !== activeSemester?.id || editProgram !== selectedProgram) {
        onBack();
      } else if (onRefresh) {
        onRefresh();
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Failed to update subject details", "error");
    } finally {
      setIsSavingSubject(false);
    }
  };



  // Robust file-type to category name matcher
  const isFileTypeMatchingCategory = (file: LibraryFile | string, cat: FolderType | string) => {
    let fileType = typeof file === 'string' ? file : file.type;
    let catName = typeof cat === 'string' ? cat : cat.name;

    if (typeof file === 'object' && typeof cat === 'object') {
      const rawParentId = (file as any).parent_id || file.folder_id;
      const fileParentId = rawParentId ? rawParentId.split('-dup-')[0] : null;
      const catId = cat.id ? cat.id.split('-dup-')[0] : null;

      // 1. Direct parent ID match in Supabase DB
      if (fileParentId && catId) {
        if (fileParentId === catId) {
          return true;
        }

        // 2. If file parent_id is set to a valid UUID of another category folder
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(fileParentId) && uuidRegex.test(catId)) {
          const searchList = (allFolders && allFolders.length > 0) ? allFolders : (categories || []);
          const parentCategory = searchList.find(item => item.id === fileParentId) || (allFiles as any[])?.find(item => item.id === fileParentId);

          if (parentCategory && parentCategory.name) {
            const isSameCategoryName = parentCategory.name.toLowerCase().trim() === cat.name.toLowerCase().trim();
            const parentSubject = searchList.find(item => item.id === parentCategory.parent_id);
            const isSameSubjectCode = parentSubject && activeSubject && (
              parentSubject.name.split(':')[0].trim().toLowerCase() === activeSubject.name.split(':')[0].trim().toLowerCase()
            );
            if (isSameCategoryName && (isSameSubjectCode || !parentSubject)) {
              return true;
            }
          }

          // File is explicitly linked in DB to a DIFFERENT category folder -> Return false!
          return false;
        }
      }
    }

    const ft = (fileType || '').toLowerCase().trim();
    const cn = (catName || '').toLowerCase().trim();

    if (!ft || ft === 'file') {
      return false;
    }

    // Match by file.type vs category name
    const cleanFt = ft.replace(/s$/, ''); // e.g. 'notes' -> 'note', 'lectures' -> 'lecture'
    const cleanCn = cn.replace(/s$/, '');

    if (cleanCn.includes('note') || cleanCn === 'note') {
      return cleanFt.includes('note');
    }
    if (cleanCn.includes('pyq') || cleanCn.includes('question') || cleanCn.includes('paper')) {
      return cleanFt.includes('pyq') || cleanFt.includes('question') || cleanFt.includes('paper');
    }
    if (cleanCn.includes('lecture') || cleanCn.includes('slide') || cleanCn.includes('video') || cleanCn.includes('recording')) {
      return cleanFt.includes('lecture') || cleanFt.includes('slide') || cleanFt.includes('video') || cleanFt.includes('recording');
    }
    if (cleanCn.includes('syllabus') || cleanCn.includes('syllabi') || cleanCn.includes('roadmap') || cleanCn.includes('curriculum')) {
      return cleanFt.includes('syllabus') || cleanFt.includes('curriculum');
    }

    const isLabCategory = cleanCn === 'lab' || cleanCn.startsWith('lab ') || cleanCn.endsWith(' lab') || cleanCn.includes('laboratory') || cleanCn.includes('manual') || cleanCn.includes('practical');
    if (isLabCategory) {
      return cleanFt.includes('lab') || cleanFt.includes('manual') || cleanFt.includes('practical');
    }

    if (cleanCn.includes('book') || cleanCn.includes('textbook')) {
      return cleanFt.includes('book') || cleanFt.includes('material');
    }

    return cleanFt === cleanCn || cleanFt.includes(cleanCn) || cleanCn.includes(cleanFt);
  };



  const continueStudyingFile = useMemo(() => {
    if (subjectFiles.length === 0) return null;
    const list = userProgressList || [];
    
    // Try to find a partially read file first
    const partials = list
      .filter(p => p.progress_percentage > 0 && p.progress_percentage < 100)
      .map(p => ({
        doc: subjectFiles.find(f => f.id === p.document_id),
        percent: p.progress_percentage
      }))
      .filter(item => !!item.doc);
      
    if (partials.length > 0) return partials[0] as { doc: LibraryFile; percent: number };
    
    // Try to find a fully read file
    const completed = list
      .filter(p => p.progress_percentage === 100)
      .map(p => ({
        doc: subjectFiles.find(f => f.id === p.document_id),
        percent: p.progress_percentage
      }))
      .filter(item => !!item.doc);
      
    if (completed.length > 0) return completed[0] as { doc: LibraryFile; percent: number };
    
    // Fallback to the first file in the subject (at 0% progress)
    return { doc: subjectFiles[0], percent: 0 };
  }, [userProgressList, subjectFiles]);



  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return `1 day ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileRatingDisplay = (file: any): string => {
    if (file.rating_votes) {
      const votes = Object.values(file.rating_votes as Record<string, number>);
      if (votes.length > 0) {
        return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
      }
    }
    try {
      const raw = localStorage.getItem('scholix_mock_documents_ratings');
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((r: any) => r.id === file.id);
        if (found && found.rating_votes) {
          const votes = Object.values(found.rating_votes as Record<string, number>);
          if (votes.length > 0) {
            return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
          }
        }
      }
    } catch (e) {}

    if (file.rating && typeof file.rating === 'number') {
      return file.rating.toFixed(1);
    }

    const str = file.name || file.id || '';
    const sum = str.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    return (4.5 + (sum % 5) * 0.1).toFixed(1);
  };

  const handleMoveFile = (fileId: string, direction: 'up' | 'down') => {
    if (!activeCategoryFolder) return;

    const currentFiles = subjectFiles
      .filter(f => isFileTypeMatchingCategory(f, activeCategoryFolder))
      .sort((a, b) => {
        const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });

    const currentIndex = currentFiles.findIndex(f => f.id === fileId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentFiles.length) return;

    // 1. INSTANT frontend optimistic update (0ms delay)
    const reordered = [...currentFiles];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Mutate display_order in memory immediately for instant re-render
    for (let i = 0; i < reordered.length; i++) {
      reordered[i].display_order = (i + 1) * 10;
    }

    // Force active category re-render
    setActiveCategoryFolder({ ...activeCategoryFolder });

    // 2. Non-blocking parallel background sync to Supabase DB
    const client = NexusServer.getClient();
    if (client) {
      Promise.all(
        reordered.map((file, idx) =>
          client
            .from('library_items')
            .update({ display_order: (idx + 1) * 10 })
            .eq('id', file.id)
        )
      ).catch(err => {
        console.error("Background file order sync failed:", err);
      });
    }
  };

  const loadCommunityData = async () => {
    try {
      const subjectId = subjectCode;
      const [st, feed, posts, reqs, packs, wikis, leader, mods, memb] = await Promise.all([
        CommunityService.fetchSubjectStats(subjectId),
        CommunityService.fetchOverviewFeed(subjectId),
        CommunityService.fetchSubjectDiscussions(subjectId),
        CommunityService.fetchSubjectRequests(subjectId),
        CommunityService.fetchSubjectStudyPacks(subjectId),
        CommunityService.fetchSubjectWiki(subjectId),
        NexusServer.fetchLeaderboard(subjectId),
        NexusServer.fetchModerators(),
        NexusServer.fetchMembersCount(selectedProgram)
      ]);
      setStats(st);
      setOverviewItems(feed);
      setDiscussions(posts);
      setRequests(reqs);
      setStudyPacks(packs);
      setWikiSections(wikis);
      setLeaderboardList(leader);
      setModeratorsList(mods);
      setLiveMembersCount(memb);

      if (userProfile) {
        const isMember = await CommunityService.isJoined(subjectId, userProfile.id);
        setJoined(isMember);
      }
    } catch (e) { }
  };

  const handleDeleteFile = async (file: LibraryFile) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this file?");
    if (!confirmed) return;
    
    try {
      await NexusServer.deleteFile(file.id, file.storage_path);
      showToast("File deleted successfully!", "success");
      onRefresh?.();
    } catch (e: any) {
      showToast("Error deleting file: " + e.message, "error");
      onRefresh?.();
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFileToEdit) return;
    setIsSavingEdit(true);
    try {
      const client = NexusServer.getClient();
      if (!client) throw new Error("Database connection offline.");

      const prog = (editForm.program || selectedProgram || 'BTech CSE').trim();
      const sem = (editForm.semester || activeSemester?.name || 'Semester 1').trim();
      const sub = (editForm.subject || activeSubject?.name || 'Subject').trim();
      const type = (editForm.type || 'Notes').trim();

      // Ensure Target Semester -> Target Subject -> Target Category folders exist in DB
      let semFolder = (allFolders || []).find(f => f.type === 'semester' && f.name.trim() === sem && (f.program === prog || !f.program));
      if (!semFolder) {
        await NexusServer.createFolder(sem, 'semester', null, prog);
        const fresh = await NexusServer.fetchFolders(prog);
        semFolder = fresh.find(f => f.type === 'semester' && f.name.trim() === sem);
      }

      let subjFolder = (allFolders || []).find(f => f.type === 'subject' && f.name.trim() === sub && f.parent_id === semFolder?.id);
      if (!subjFolder && semFolder) {
        await NexusServer.createFolder(sub, 'subject', semFolder.id, prog);
        const fresh = await NexusServer.fetchFolders(prog);
        subjFolder = fresh.find(f => f.type === 'subject' && f.name.trim() === sub && f.parent_id === semFolder.id);
      }

      let catFolder = (allFolders || []).find(f => f.type === 'category' && f.name.trim() === type && f.parent_id === subjFolder?.id);
      if (!catFolder && subjFolder) {
        await NexusServer.createFolder(type, 'category', subjFolder.id, prog);
        const fresh = await NexusServer.fetchFolders(prog);
        catFolder = fresh.find(f => f.type === 'category' && f.name.trim() === type && f.parent_id === subjFolder.id);
      }

      const updatePayload: any = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        program: prog,
        type: 'file',
        display_order: editForm.display_order,
        updated_at: new Date().toISOString()
      };

      if (catFolder) {
        updatePayload.parent_id = catFolder.id;
      }

      const { error } = await client
        .from('library_items')
        .update(updatePayload)
        .eq('id', selectedFileToEdit.id);

      if (error) throw error;

      showToast("File metadata & location updated successfully!", "success");
      setShowEditModal(false);
      onRefresh?.();
      loadCommunityData();
    } catch (e: any) {
      showToast("Error updating file: " + e.message, "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [activeSubject.id, userProfile]);
  // Trigger Highlight.js syntax highlighting on code segments
  useEffect(() => {
    const highlightCode = () => {
      const codeElements = document.querySelectorAll('.wysiwyg-content code, .comment-content code, pre code');
      codeElements.forEach((codeEl) => {
        const code = codeEl as HTMLElement;
        if (code.closest('.wysiwyg-editor') || code.closest('[contenteditable="true"]')) return;
        if (code.classList.contains('hljs')) return;
        
        // Auto-detect language or use language class if available
        let lang = 'auto';
        const classList = Array.from(code.classList) as string[];
        const langClass = classList.find(c => c.startsWith('language-')) as string | undefined;
        if (langClass) {
          lang = langClass.replace('language-', '');
        }

        if (lang !== 'auto' && !code.classList.contains(`language-${lang}`)) {
          code.classList.add(`language-${lang}`);
        }
        
        try {
          hljs.highlightElement(code);
        } catch (err) {
          console.error("Highlighting element failed:", err);
        }
      });
    };

    highlightCode();
    const interval = setInterval(highlightCode, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleDocClick = () => setActiveMenuFileId(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  useEffect(() => {
    setSelectedPost(null);
  }, [activeTab]);

  // Real-time Presence sync for active studying users count
  useEffect(() => {
    const client = NexusServer.getClient();
    if (!client) return;

    const userKey = userProfile?.id || `anon-${Math.random().toString(36).substring(2, 11)}`;
    const channel = client.channel(`subject-presence:${subjectCode}`, {
      config: {
        presence: {
          key: userKey,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            username: userProfile?.username || 'Anonymous Verto',
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [subjectCode, userProfile]);

  // Real-time Database sync for posts, requests, collections in community_hub table
  useEffect(() => {
    const client = NexusServer.getClient();
    if (!client) return;

    const channel = client
      .channel(`community_hub_realtime:${subjectCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_hub',
          filter: `subject_id=eq.${subjectCode}`
        },
        () => {
          loadCommunityData();
        }
      )
      .subscribe();

    return () => {
      if (channel && channel.state !== 'closed') {
        client.removeChannel(channel).catch(() => { /* ignore */ });
      }
    };
  }, [subjectCode]);

  // Toggle Join (Notifications)
  const handleJoinToggle = async () => {
    if (!userProfile) {
      showToast("Please login to manage notifications.", "info");
      return;
    }
    const subjectId = subjectCode;
    try {
      if (joined) {
        await CommunityService.leaveSubject(subjectId, userProfile.id);
        setJoined(false);
        showToast("Notifications turned off.", "info");
      } else {
        await CommunityService.joinSubject(subjectId, userProfile.id);
        setJoined(true);
        showToast("Notifications turned on!", "success");
      }
      loadCommunityData();
    } catch (e) { }
  };

  const handleOpenFile = (file: LibraryFile) => {
    if (onFileAccess) {
      onFileAccess(file);
    } else {
      setActivePdfFile(file);
    }
  };

  const handleDownloadFile = async (file: LibraryFile) => {
    try {
      showToast("Starting download...", "info");

      // Record download stats
      CommunityService.recordFileDownload(file.id).catch(console.error);
      if (userProfile) {
        NexusServer.saveRecord(userProfile.id, 'pdf_download', `Downloaded ${file.name}`, {
          fileId: file.id,
          fileName: file.name,
          path: file.storage_path
        }).catch(console.error);
      }

      const client = NexusServer.getClient();
      if (client) {
        try {
          const { data, error } = await client.storage.from('nexus-documents').download(file.storage_path);
          if (!error && data) {
            const blobUrl = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.name || 'document';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
            showToast("Download started!", "success");
            return;
          }
        } catch (storageErr) {
          console.warn("Direct storage download failed, trying proxy route...", storageErr);
        }
      }

      // Proxy fallback
      const sessionRes = await NexusServer.getSession();
      const token = sessionRes?.data?.session?.access_token;
      const url = NexusServer.getFileUrl(file.storage_path, token);
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("Download started!", "success");
      } else {
        throw new Error("Unable to resolve download URL");
      }
    } catch (err: any) {
      console.error("Direct download failed:", err);
      showToast("Failed to download file.", "error");
    }
  };

  // Upvote/Downvote reactions
  const handleReaction = async (itemId: string, type: 'post' | 'request', reaction: 'helpful' | 'quality' | 'important') => {
    if (!userProfile) {
      showToast("Please login to react.", "info");
      return;
    }

    const userId = userProfile.id;

    // Save previous state for rollback on error
    const prevDiscussions = [...discussions];
    const prevRequests = [...requests];

    const updateLocalReactions = (reactions: any) => {
      const container = {
        helpful: Array.isArray(reactions?.helpful) ? [...reactions.helpful] : [],
        quality: Array.isArray(reactions?.quality) ? [...reactions.quality] : [],
        important: Array.isArray(reactions?.important) ? [...reactions.important] : []
      };

      const hasReacted = container[reaction].includes(userId);
      if (hasReacted) {
        container[reaction] = container[reaction].filter((id: string) => id !== userId);
      } else {
        container[reaction] = [...container[reaction], userId];
        // Apply mutual exclusivity for post upvote/downvote
        if (reaction === 'helpful') {
          container.quality = container.quality.filter((id: string) => id !== userId);
        } else if (reaction === 'quality') {
          container.helpful = container.helpful.filter((id: string) => id !== userId);
        }
      }
      return container;
    };

    // Optimistic UI updates
    if (type === 'post') {
      setDiscussions(prev => prev.map(p => p.id === itemId ? { ...p, reactions: updateLocalReactions(p.reactions) } : p));
    } else if (type === 'request') {
      setRequests(prev => prev.map(r => r.id === itemId ? { ...r, reactions: updateLocalReactions(r.reactions) } : r));
    }

    try {
      await CommunityService.toggleReaction(itemId, type, reaction, userId);
    } catch (e) {
      // Rollback on error
      if (type === 'post') setDiscussions(prevDiscussions);
      else if (type === 'request') setRequests(prevRequests);
    }
  };

  // Submit Post or Material Request
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    const plainText = getEditorText(createEditorRef);
    if (!postTitle.trim() || !plainText) return;
    const editorContent = getEditorHtml(createEditorRef);

    try {
      if (postCategory === 'request') {
        await CommunityService.createMaterialRequest({
          subject_id: subjectCode,
          user_id: userProfile.id,
          user_username: userProfile.username || 'Anonymous',
          user_avatar: userProfile.avatar_url,
          type: 'request',
          title: postTitle.trim(),
          content: editorContent,
          bounty_xp: Number(reqBounty)
        });
        showToast("Request bounty created!", "success");
      } else {
        const cleanTags = postTags.split(',').map(t => t.trim()).filter(t => t.startsWith('#') ? t : `#${t}`);
        await CommunityService.createPost({
          subject_id: subjectCode,
          user_id: userProfile.id,
          user_username: userProfile.username || 'Anonymous',
          user_avatar: userProfile.avatar_url,
          type: 'post',
          category: postCategory,
          title: postTitle.trim(),
          content: editorContent,
          tags: cleanTags,
          verified_status: 'none'
        });
        showToast("Post created!", "success");
      }
      setPostTitle('');
      setPostContent('');
      setPostTags('');
      if (createEditorRef.current) createEditorRef.current.innerHTML = '';
      setShowCreatePost(false);
      loadCommunityData();
    } catch (e) {
      showToast("Failed to submit", "error");
    }
  };

  // Submit Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    const plainText = getEditorText(reqEditorRef);
    if (!reqTitle.trim() || !plainText) return;
    const editorContent = getEditorHtml(reqEditorRef);

    try {
      await CommunityService.createMaterialRequest({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'request',
        title: reqTitle.trim(),
        content: editorContent,
        bounty_xp: Number(reqBounty)
      });
      setReqTitle('');
      setReqContent('');
      if (reqEditorRef.current) reqEditorRef.current.innerHTML = '';
      setShowCreateRequest(false);
      loadCommunityData();
      showToast("Request bounty created!", "success");
    } catch (e) {
      showToast("Failed to create request", "error");
    }
  };

  // Submit Study Pack
  const handlePackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    const plainText = getEditorText(packEditorRef);
    if (!packTitle.trim() || !plainText) return;
    const editorContent = getEditorHtml(packEditorRef);

    try {
      await CommunityService.createStudyPack({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'collection',
        title: packTitle.trim(),
        content: editorContent,
        file_ids: packFiles
      });
      setPackTitle('');
      setPackContent('');
      setPackFiles([]);
      setPackFileSearch('');
      if (packEditorRef.current) packEditorRef.current.innerHTML = '';
      setShowCreatePack(false);
      loadCommunityData();
      showToast("Curated study pack created!", "success");
    } catch (e) {
      showToast("Failed to create study pack", "error");
    }
  };



  // Scoped AI Chat submit
  const handleSendSubjectAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectAiInput.trim() || subjectAiLoading) return;

    const userText = subjectAiInput.trim();
    setSubjectAiInput('');
    setSubjectAiHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setSubjectAiLoading(true);

    try {
      const filesContext = subjectFiles.map(f => `- ${f.name} (Taught by: ${f.faculty_name || "N/A"}, Type: ${f.type})`).join('\n');
      const wikiContext = wikiSections.map(w => `### Wiki ${w.category}\n${w.content}`).join('\n');
      const prompt = `You are the AI tutor for the course "${activeSubject.name}".
      Below is the context of files, syllabus, and wiki details available in the community:
      
      Files Catalog:
      ${filesContext}
      
      Wiki Roadmaps:
      ${wikiContext}
      
      Answer the student's question accurately based on this course context. Question: "${userText}"`;

      const response = await askGeminiText(prompt);
      setSubjectAiHistory(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (err) {
      setSubjectAiHistory(prev => [...prev, { sender: 'ai', text: "I ran into an issue loading that response. Please try again." }]);
    } finally {
      setSubjectAiLoading(false);
    }
  };

  // Helper to parse simple Markdown formatting from Gemini responses
  const parseInlineStyles = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-zinc-950 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const parseSimpleMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // 1. Headers (e.g. ### Header or ## Header)
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const parsedContent = parseInlineStyles(content);
        
        if (level === 1) return <h1 key={idx} className="text-lg font-black text-zinc-950 dark:text-white mt-4 mb-2 tracking-tight">{parsedContent}</h1>;
        if (level === 2) return <h2 key={idx} className="text-base font-black text-zinc-950 dark:text-white mt-4 mb-2 tracking-tight">{parsedContent}</h2>;
        return <h3 key={idx} className="text-xs font-bold text-zinc-900 dark:text-zinc-200 mt-3 mb-1.5 uppercase tracking-wider">{parsedContent}</h3>;
      }
      
      // 2. Bullet list items (e.g. - item or * item)
      const bulletMatch = line.match(/^[-*+]\s+(.*)$/);
      if (bulletMatch) {
        const content = bulletMatch[1];
        return (
          <div key={idx} className="flex items-start gap-2 ml-4 my-1 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="text-brand-primary font-bold mt-0.5">•</span>
            <span className="flex-1 leading-relaxed">{parseInlineStyles(content)}</span>
          </div>
        );
      }
      
      // 3. Numbered list items (e.g. 1. item)
      const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numberMatch) {
        const num = numberMatch[1];
        const content = numberMatch[2];
        return (
          <div key={idx} className="flex items-start gap-2 ml-4 my-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="text-brand-primary font-black mt-0.5">{num}.</span>
            <span className="flex-1 leading-relaxed">{parseInlineStyles(content)}</span>
          </div>
        );
      }
      
      // 4. Blank lines
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      
      // 5. Standard paragraph line
      return <p key={idx} className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed my-1.5">{parseInlineStyles(line)}</p>;
    });
  };

  // Fetch AI generated subject details
  const handleOpenAboutSubject = async () => {
    setShowAboutSubjectModal(true);
    if (aboutSubjectContent) return; // already loaded
    
    setAboutSubjectLoading(true);
    try {
      // 1. If subject has a description in Supabase, use it!
      if (activeSubject.description && activeSubject.description.trim()) {
        setAboutSubjectContent(activeSubject.description);
      } else {
        // 2. Otherwise, use our high-quality hardcoded subject-specific fallback
        const fallback = getFallbackSubjectDescription(activeSubject.name);
        setAboutSubjectContent(fallback);
      }
    } catch (err) {
      console.error("Failed to load about subject content:", err);
      setAboutSubjectContent(`### About ${activeSubject.name}\n\nThis subject covers topics related to **${activeSubject.name}**.\n\nPlease check the uploaded course files and roadmap resources for specific curriculum information.`);
    } finally {
      setAboutSubjectLoading(false);
    }
  };

  // Filtered files in selected category folder (sorted by display_order)
  const categoryFiles = useMemo(() => {
    if (!activeCategoryFolder) return [];
    return subjectFiles
      .filter(f => isFileTypeMatchingCategory(f, activeCategoryFolder))
      .sort((a, b) => {
        const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });
  }, [activeCategoryFolder, subjectFiles]);

  const filteredCategories = useMemo(() => {
    return displayCategories.filter(cat => {
      if (localSearchQuery.trim()) {
        const query = localSearchQuery.toLowerCase().trim();
        const nameMatches = cat.name.toLowerCase().includes(query);
        const filesInside = subjectFiles.filter(f => isFileTypeMatchingCategory(f, cat));
        const fileMatches = filesInside.some(f => f.name.toLowerCase().includes(query));
        if (!nameMatches && !fileMatches) return false;
      }
      if (fileFilterType !== 'all') {
        const filesInside = subjectFiles.filter(f => isFileTypeMatchingCategory(f, cat));
        const hasMatchingFiles = filesInside.some(f => {
          const ext = (f.storage_path ? f.storage_path.split('.').pop() : f.name.split('.').pop())?.toLowerCase() || '';
          if (fileFilterType === 'pdf') return ext === 'pdf';
          if (fileFilterType === 'docs') return ['doc', 'docx', 'txt', 'rtf'].includes(ext);
          if (fileFilterType === 'sheets') return ['xls', 'xlsx', 'csv'].includes(ext);
          if (fileFilterType === 'slides') return ['ppt', 'pptx'].includes(ext);
          return true;
        });
        if (!hasMatchingFiles) return false;
      }
      return true;
    });
  }, [displayCategories, localSearchQuery, fileFilterType, subjectFiles]);

  const filteredSubjectFiles = useMemo(() => {
    return subjectFiles.filter(f => {
      if (localSearchQuery.trim()) {
        const query = localSearchQuery.toLowerCase().trim();
        if (!f.name.toLowerCase().includes(query)) return false;
      }
      if (fileFilterType !== 'all') {
        const ext = (f.storage_path ? f.storage_path.split('.').pop() : f.name.split('.').pop())?.toLowerCase() || '';
        if (fileFilterType === 'pdf') return ext === 'pdf';
        if (fileFilterType === 'docs') return ['doc', 'docx', 'txt', 'rtf'].includes(ext);
        if (fileFilterType === 'sheets') return ['xls', 'xlsx', 'csv'].includes(ext);
        if (fileFilterType === 'slides') return ['ppt', 'pptx'].includes(ext);
        return true;
      }
      return true;
    });
  }, [subjectFiles, localSearchQuery, fileFilterType]);

  const filteredCategoryFiles = useMemo(() => {
    if (!activeCategoryFolder) return [];
    return categoryFiles.filter(f => {
      if (localSearchQuery.trim()) {
        const query = localSearchQuery.toLowerCase().trim();
        if (!f.name.toLowerCase().includes(query)) return false;
      }
      if (fileFilterType !== 'all') {
        const ext = (f.storage_path ? f.storage_path.split('.').pop() : f.name.split('.').pop())?.toLowerCase() || '';
        if (fileFilterType === 'pdf') return ext === 'pdf';
        if (fileFilterType === 'docs') return ['doc', 'docx', 'txt', 'rtf'].includes(ext);
        if (fileFilterType === 'sheets') return ['xls', 'xlsx', 'csv'].includes(ext);
        if (fileFilterType === 'slides') return ['ppt', 'pptx'].includes(ext);
        return true;
      }
      return true;
    });
  }, [categoryFiles, localSearchQuery, fileFilterType, activeCategoryFolder]);

  // Render helper for files tab detail view
  let mainContent = null;

  return (
    <div className="space-y-6">
      {mainContent ? mainContent : (
        <>
          {/* 1. Header (matching Image 1) */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
            {/* Breadcrumb matching Image 1: ← Library / Semester / Subject (/ Category) */}
            <div className="flex items-center gap-2 text-sm sm:text-base min-w-0">
              <button
                onClick={() => {
                  if (activeCategoryFolder) {
                    setActiveCategoryFolder(null);
                  } else {
                    onBack();
                  }
                }}
                className="p-1 -ml-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white bg-transparent border-none cursor-pointer transition-colors shrink-0"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onBack}
                className="font-bold text-zinc-900 dark:text-white bg-transparent border-none cursor-pointer hover:underline p-0 shrink-0"
              >
                Library
              </button>
              {activeSemester && (
                <>
                  <span className="text-zinc-400 font-light shrink-0">/</span>
                  <button
                    onClick={onBack}
                    className="text-zinc-500 dark:text-zinc-400 font-medium bg-transparent border-none cursor-pointer hover:underline p-0 shrink-0"
                  >
                    {activeSemester.name}
                  </button>
                </>
              )}
              <span className="text-zinc-400 font-light shrink-0">/</span>
              <button
                onClick={() => setActiveCategoryFolder(null)}
                className={`font-medium truncate bg-transparent border-none cursor-pointer p-0 ${!activeCategoryFolder ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:underline'}`}
              >
                {subjectName}
              </button>
              {activeCategoryFolder && (
                <>
                  <span className="text-zinc-400 font-light shrink-0">/</span>
                  <span className="text-zinc-900 dark:text-white font-medium truncate shrink-0">
                    {activeCategoryFolder.name}
                  </span>
                </>
              )}
            </div>

            {/* Right Side: Options & Compact Tabs */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Options Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSubjectOptions(!showSubjectOptions)}
                  title="Subject Options"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-white/5 outline-none text-zinc-500 dark:text-zinc-400 shadow-xs"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
                {showSubjectOptions && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSubjectOptions(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-xl p-1 shadow-lg z-30 text-xs">
                      <button
                        onClick={() => {
                          setShowSubjectOptions(false);
                          handleOpenAboutSubject();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                        About Subject
                      </button>
                      {(userProfile?.is_admin || isAdmin) && (
                        <button
                          onClick={() => {
                            setShowSubjectOptions(false);
                            setShowEditSubjectModal(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 text-zinc-400" />
                          Edit Subject Details
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Action Bar Strip (matching Image 2) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Left: Filter Dropdown (All files ▾) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="h-8 px-2.5 rounded-lg bg-zinc-100/70 dark:bg-white/[0.04] border border-zinc-200/50 dark:border-white/[0.03] text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <span>
                    {fileFilterType === 'all'
                      ? 'All files'
                      : fileFilterType === 'pdf'
                        ? 'PDFs'
                        : fileFilterType === 'docs'
                          ? 'Documents'
                          : fileFilterType === 'sheets'
                            ? 'Spreadsheets'
                            : 'Presentations'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {showFilterDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowFilterDropdown(false)} />
                    <div className="absolute left-0 mt-1 w-36 rounded-xl bg-white dark:bg-[#121214] border border-zinc-200/60 dark:border-white/[0.06] py-1 shadow-xl z-40 text-xs font-medium">
                      {[
                        { id: 'all', label: 'All files' },
                        { id: 'pdf', label: 'PDFs' },
                        { id: 'docs', label: 'Documents' },
                        { id: 'sheets', label: 'Spreadsheets' },
                        { id: 'slides', label: 'Presentations' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setFileFilterType(item.id);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left border-none bg-transparent cursor-pointer transition-colors flex items-center justify-between ${fileFilterType === item.id ? 'font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/10' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                        >
                          <span>{item.label}</span>
                          {fileFilterType === item.id && <span className="text-zinc-900 dark:text-white">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Center: Search Input (Search Document) */}
            <div className="flex-1 max-w-sm sm:max-w-md w-full md:mx-4 relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Document"
                value={localSearchQuery}
                onChange={e => setLocalSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-full border border-zinc-200/50 dark:border-white/[0.03] bg-zinc-100/50 dark:bg-white/[0.03] text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-300 dark:focus:border-white/10 focus:bg-white dark:focus:bg-white/[0.05] transition-all"
              />
            </div>

            {/* Right Side: Vault, Shield, +, Upload File, List/Grid toggler */}
            <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
              {/* Vault Button */}
              <button
                onClick={() => {
                  if (onVaultClick) {
                    onVaultClick();
                  } else if (!userProfile) {
                    showToast("Please login to access your personal vault.", "info");
                  }
                }}
                className="h-8 px-2.5 rounded-lg text-xs font-medium border bg-zinc-100/70 dark:bg-white/[0.04] border-zinc-200/50 dark:border-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Personal Vault"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Vault</span>
              </button>

              {/* Admin Shield Button */}
              {(userProfile?.is_admin || isAdmin) && (
                <button
                  onClick={() => {
                    if (onAdminReviewClick) {
                      onAdminReviewClick();
                    }
                  }}
                  className="h-8 w-8 rounded-lg text-xs font-medium border transition-all flex items-center justify-center cursor-pointer shrink-0 relative bg-zinc-100/70 dark:bg-white/[0.04] border-zinc-200/50 dark:border-white/[0.03] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:text-zinc-900 dark:hover:text-zinc-200"
                  title="Admin Review Hub"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {allFiles.filter(f => f.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                      {allFiles.filter(f => f.status === 'pending').length}
                    </span>
                  )}
                </button>
              )}

              {/* Compact + button (create folder) */}
              {(userProfile?.is_admin || isAdmin) && onAddFolder && (
                <button
                  onClick={onAddFolder}
                  className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0 active:scale-95"
                  title="Create Folder"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}

              {/* Upload File Button */}
              <button
                onClick={() => {
                  if (!userProfile) {
                    showToast("Please sign in to contribute materials.", "info");
                    return;
                  }
                  onUploadClick?.(activeCategoryFolder?.name);
                }}
                className="h-8 px-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer border-none shadow-xs active:scale-95 shrink-0"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>

              {/* List / Grid toggle */}
              <div className="flex items-center h-8 bg-zinc-100/60 dark:bg-white/[0.02] border border-zinc-200/50 dark:border-white/[0.03] rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`h-6.5 w-6.5 rounded flex items-center justify-center border-none cursor-pointer transition-colors ${layoutMode === 'list' ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-xs' : 'bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`h-6.5 w-6.5 rounded flex items-center justify-center border-none cursor-pointer transition-colors ${layoutMode === 'grid' ? 'bg-white dark:bg-white/10 text-zinc-900 dark:text-white' : 'bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Folders & Files Area (matching Image 3) */}
          <div className="space-y-4 pt-2">
              {!activeCategoryFolder ? (
                /* Root Subject View: Folder list (Image 3) + Files below */
                <>
                  {filteredCategories.length === 0 && filteredSubjectFiles.length === 0 ? (
                    <EmptyStateNoDocument
                      onUpload={() => onUploadClick?.()}
                    />
                  ) : layoutMode === 'list' ? (
                    /* Clean Vertical List with Container Card */
                    <div className="w-full divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-200/70 dark:border-white/5 rounded-xl bg-white dark:bg-[#111113] overflow-hidden">
                      {filteredCategories.map(cat => {
                        const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f, cat));
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setActiveCategoryFolder(cat)}
                            className="flex items-center justify-between py-2.5 px-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/folder select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Yellow Folder Icon */}
                              <svg className="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                              </svg>
                              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover/folder:text-zinc-950 dark:group-hover/folder:text-white transition-colors truncate">
                                {cat.name}
                              </span>
                            </div>

                            {/* Right side: File count and Admin edit/delete */}
                            <div className="flex items-center gap-3 shrink-0">
                              {(userProfile?.is_admin || isAdmin) && (onEditFolder || onDeleteFolder) && (
                                <div className="flex items-center gap-1 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                                  {onEditFolder && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onEditFolder(cat, e); }}
                                      title="Edit Folder"
                                      className="p-1 text-zinc-400 hover:text-amber-500 bg-transparent border-none cursor-pointer"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteFolder && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onDeleteFolder(cat, e); }}
                                      title="Delete Folder"
                                      className="p-1 text-zinc-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">
                                {filesInCat.length} {filesInCat.length === 1 ? 'file' : 'files'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Grid Mode */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredCategories.map(cat => {
                        const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f, cat));
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setActiveCategoryFolder(cat)}
                            className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-white/5 bg-white dark:bg-[#111113] hover:border-amber-400/40 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all cursor-pointer group flex flex-col gap-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <svg className="w-6 h-6 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                              </svg>
                              <span className="text-[10px] font-medium text-zinc-400">
                                {filesInCat.length}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                              {cat.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Files below folders (Recent / Subject files) */}
                  {filteredSubjectFiles.length > 0 && (
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          Recently Uploaded
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {filteredSubjectFiles.length} {filteredSubjectFiles.length === 1 ? 'file' : 'files'}
                        </span>
                      </div>

                      {layoutMode === 'list' ? (
                        <div className="w-full divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-200/70 dark:border-white/5 rounded-xl bg-white dark:bg-[#111113] overflow-hidden">
                          {filteredSubjectFiles.map(file => {
                            const relativeTime = getRelativeTime(file.uploadDate || Date.now());
                            const fileInfo = getDisplayFileNameWithExtension(file.name, file.storage_path, file.type);
                            return (
                              <div
                                key={file.id}
                                onClick={() => handleOpenFile(file)}
                                className="flex items-center justify-between py-2.5 px-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer group select-none"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                                  <FileIcon fileName={file.storage_path || file.name} fileType={file.type} />
                                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                                    {fileInfo.fullName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFileDetail(file);
                                    }}
                                    title="View ratings and reviews"
                                    className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 bg-transparent hover:bg-amber-400/10 px-1.5 py-0.5 rounded-md transition-all cursor-pointer border-none"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                    <span>{getFileRatingDisplay(file)}</span>
                                  </button>
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">{relativeTime}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                      setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {filteredSubjectFiles.map(file => {
                            const fileInfo = getDisplayFileNameWithExtension(file.name, file.storage_path, file.type);
                            return (
                              <div
                                key={file.id}
                                onClick={() => handleOpenFile(file)}
                                className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-white/5 bg-white dark:bg-[#111113] hover:border-zinc-300 dark:hover:border-white/10 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <FileIcon fileName={file.storage_path || file.name} fileType={file.type} />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                      setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate block group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                                    {fileInfo.fullName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFileDetail(file);
                                    }}
                                    title="View ratings and reviews"
                                    className="flex items-center gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 bg-transparent hover:bg-amber-400/10 px-1.5 py-0.5 rounded-md transition-all cursor-pointer border-none mt-1 w-fit"
                                  >
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                    <span>{getFileRatingDisplay(file)}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Category Drilldown View (Inside a Folder) */
                <>
                  {filteredCategoryFiles.length === 0 ? (
                    <EmptyStateNoDocument
                      onUpload={() => onUploadClick?.(activeCategoryFolder.name)}
                    />
                  ) : layoutMode === 'list' ? (
                    <div className="w-full divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-200/70 dark:border-white/5 rounded-xl bg-white dark:bg-[#111113] overflow-hidden">
                      {filteredCategoryFiles.map(file => {
                        const relativeTime = getRelativeTime(file.uploadDate || Date.now());
                        const fileInfo = getDisplayFileNameWithExtension(file.name, file.storage_path, file.type);
                        return (
                          <div
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="flex items-center justify-between py-2.5 px-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer group select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                              <FileIcon fileName={file.storage_path || file.name} fileType={file.type} />
                              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                                {fileInfo.fullName}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileDetail(file);
                                }}
                                title="View ratings and reviews"
                                className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 bg-transparent hover:bg-amber-400/10 px-1.5 py-0.5 rounded-md transition-all cursor-pointer border-none"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                <span>{getFileRatingDisplay(file)}</span>
                              </button>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">{relativeTime}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                  setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                }}
                                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredCategoryFiles.map(file => {
                        const fileInfo = getDisplayFileNameWithExtension(file.name, file.storage_path, file.type);
                        return (
                          <div
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-white/5 bg-white dark:bg-[#111113] hover:border-zinc-300 dark:hover:border-white/10 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <FileIcon fileName={file.storage_path || file.name} fileType={file.type} />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                  setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                }}
                                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate block group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                                {fileInfo.fullName}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileDetail(file);
                                }}
                                title="View ratings and reviews"
                                className="flex items-center gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 bg-transparent hover:bg-amber-400/10 px-1.5 py-0.5 rounded-md transition-all cursor-pointer border-none mt-1 w-fit"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                <span>{getFileRatingDisplay(file)}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
        </>
      )}

      {/* Hidden file input for WYSIWYG image uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, activeEditorForImageRef.current);
        }}
      />





      {/* Admin Edit File Metadata & Location Modal */}
      {showEditModal && selectedFileToEdit && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          />

          <div 
            className="relative w-full max-w-lg bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5 z-10 my-8 overflow-hidden flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold shrink-0">
                  <Pencil className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">Edit File Metadata & Location</h3>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">Move file to a different subject, semester, or folder</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all border-none bg-transparent cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs overflow-y-auto max-h-[60vh] custom-scrollbar pr-1">
              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">File Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold transition-all"
                  placeholder="Enter file name..."
                />
              </div>

              {/* Location Selectors: Program & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">Target Program</label>
                  <select
                    value={editForm.program}
                    onChange={(e) => {
                      const newProg = e.target.value;
                      const curr = getProgramCurriculum(newProg);
                      let nextSem = 'Semester 1';
                      if (curr && curr.terms && curr.terms.length > 0) {
                        nextSem = `Semester ${curr.terms[0].termNumber}`;
                      }
                      const nextSubjs: string[] = [];
                      if (curr && curr.terms) {
                        const termObj = curr.terms.find(t => t.termNumber === 1);
                        if (termObj && termObj.coreSubjects) {
                          termObj.coreSubjects.forEach(s => nextSubjs.push(`${s.code}: ${s.title}`));
                        }
                      }
                      setEditForm(prev => ({
                        ...prev,
                        program: newProg,
                        semester: nextSem,
                        subject: nextSubjs[0] || ''
                      }));
                      setIsCreatingNewSubjectInEdit(false);
                    }}
                    className="w-full px-3.5 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold transition-all cursor-pointer"
                  >
                    {["BTech CSE", "BTech IT", "BCA", "MCA", "MBA", "BCom", "BA", "BS Data Science"].map(prog => (
                      <option key={prog} value={prog} className="bg-white dark:bg-[#161618] text-zinc-900 dark:text-white">{prog}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">Semester</label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => {
                      const newSem = e.target.value;
                      const curr = getProgramCurriculum(editForm.program || selectedProgram);
                      const nextSubjs: string[] = [];
                      if (curr && curr.terms) {
                        const semNumStr = newSem.replace(/\D/g, '');
                        const semNum = parseInt(semNumStr, 10);
                        const termObj = curr.terms.find(t => t.termNumber === semNum);
                        if (termObj && termObj.coreSubjects) {
                          termObj.coreSubjects.forEach(s => nextSubjs.push(`${s.code}: ${s.title}`));
                        }
                      }
                      if (allFolders) {
                        const semFolder = allFolders.find(f => f.type === 'semester' && f.name.trim() === newSem.trim());
                        if (semFolder) {
                          const dbSubjs = allFolders.filter(f => f.type === 'subject' && f.parent_id === semFolder.id);
                          dbSubjs.forEach(s => {
                            if (!nextSubjs.includes(s.name)) nextSubjs.push(s.name);
                          });
                        }
                      }
                      setEditForm(prev => ({
                        ...prev,
                        semester: newSem,
                        subject: nextSubjs[0] || prev.subject
                      }));
                      setIsCreatingNewSubjectInEdit(false);
                    }}
                    className="w-full px-3.5 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold transition-all cursor-pointer"
                  >
                    {editModalSemesters.map(sem => (
                      <option key={sem} value={sem} className="bg-white dark:bg-[#161618] text-zinc-900 dark:text-white">{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Selectors: Subject & Folder Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">Target Subject</label>
                  {!isCreatingNewSubjectInEdit ? (
                    <select
                      value={editForm.subject}
                      onChange={(e) => {
                        if (e.target.value === '__NEW_SUBJECT__') {
                          setIsCreatingNewSubjectInEdit(true);
                          setEditForm({ ...editForm, subject: '' });
                        } else {
                          setEditForm({ ...editForm, subject: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold transition-all cursor-pointer truncate"
                    >
                      <option value="" disabled className="bg-white dark:bg-[#161618] text-zinc-400">Select Subject</option>
                      {editModalSubjects.map(subName => (
                        <option key={subName} value={subName} className="bg-white dark:bg-[#161618] text-zinc-900 dark:text-white truncate">
                          {subName}
                        </option>
                      ))}
                      <option value="__NEW_SUBJECT__" className="bg-white dark:bg-[#161618] font-bold text-orange-500">
                        + Add Custom Subject...
                      </option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editForm.subject}
                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        placeholder="New Subject Name..."
                        className="flex-1 px-3.5 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold text-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewSubjectInEdit(false);
                          setEditForm({ ...editForm, subject: editModalSubjects[0] || activeSubject?.name || '' });
                        }}
                        className="px-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border-none rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Back to dropdown"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">Folder Category</label>
                  <select 
                    value={editForm.type} 
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold transition-all cursor-pointer"
                  >
                    {editModalCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-[#161618] text-zinc-900 dark:text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">Short Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  placeholder="Tell us more about this file..."
                  className="w-full p-4 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-medium resize-none transition-all custom-scrollbar"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-300 ml-0.5 block">Display Order</label>
                <input 
                  type="number" 
                  value={editForm.display_order} 
                  onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-[#161618] border border-transparent focus:border-orange-500/50 rounded-2xl outline-none text-zinc-900 dark:text-white font-semibold transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200/70 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 rounded-2xl text-xs font-bold transition-all border-none cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !(editForm.name || '').trim() || !(editForm.subject || '').trim()}
                className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all border-none cursor-pointer flex items-center justify-center gap-2"
              >
                {isSavingEdit ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4. Edit Subject Details Modal */}
      {showEditSubjectModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowEditSubjectModal(false)}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          />

          {/* Modal Container */}
          <div 
            className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0c] border border-zinc-150 dark:border-white/5 rounded-[36px] p-6 sm:p-8 shadow-2xl space-y-6 z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-4 shrink-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Edit size={18} style={{ color: theme.rawColor }} /> Edit Subject Details
              </h3>
              <button 
                onClick={() => setShowEditSubjectModal(false)} 
                className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-xl cursor-pointer font-semibold transition-colors outline-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="space-y-5 overflow-y-auto pr-1 flex-1 no-scrollbar">
              {/* Code & Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Subject Code</label>
                  <input
                    type="text"
                    value={editSubjectCode}
                    onChange={(e) => setEditSubjectCode(e.target.value)}
                    placeholder="e.g. CSE101"
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500 transition-all"
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Subject Name</label>
                  <input
                    type="text"
                    value={editSubjectName}
                    onChange={(e) => setEditSubjectName(e.target.value)}
                    placeholder="e.g. Computer Programming"
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Program & Semester Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Program</label>
                  <select
                    value={editProgram}
                    onChange={(e) => setEditProgram(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                  >
                    {isIITM ? (
                      <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BS Data Science">BS Data Science</option>
                    ) : (
                      <>
                        <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BTech-CSE">BTech-CSE</option>
                        <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BTech-ECE">BTech-ECE</option>
                        <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BCA">BCA</option>
                        <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BSc">BSc</option>
                        <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BBA">BBA</option>
                        <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="BTech-MTech">BTech-MTech</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Semester</label>
                  <select
                    value={editSemesterId}
                    onChange={(e) => setEditSemesterId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-900 dark:text-white focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                  >
                    {semestersList.map((sem) => (
                      <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                    {semestersList.length === 0 && (
                      <option className="bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-200" value="">No semesters found</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Theme Color</label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {[
                    { hex: '#ff7a00', name: 'Orange' },
                    { hex: '#0ea5e9', name: 'Blue' },
                    { hex: '#22c55e', name: 'Green' },
                    { hex: '#a855f7', name: 'Purple' },
                    { hex: '#ec4899', name: 'Pink' },
                    { hex: '#14b8a6', name: 'Teal' },
                    { hex: '#f43f5e', name: 'Rose' },
                    { hex: '#eab308', name: 'Yellow' }
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setEditColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform relative ${
                        editColor === c.hex 
                          ? 'scale-110 border-zinc-900 dark:border-white' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={c.name}
                    >
                      {editColor === c.hex && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">✓</span>
                      )}
                    </button>
                  ))}
                  
                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] text-zinc-400 font-bold">Custom:</span>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      placeholder="#ff7a00"
                      className="w-20 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl px-2.5 py-1 text-[11px] font-semibold outline-none text-zinc-900 dark:text-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Logo / Icon Grid Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Logo / Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {[
                    { name: 'Code', icon: <Code className="w-4 h-4" /> },
                    { name: 'Database', icon: <Database className="w-4 h-4" /> },
                    { name: 'Compass', icon: <Compass className="w-4 h-4" /> },
                    { name: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
                    { name: 'Globe', icon: <Globe className="w-4 h-4" /> },
                    { name: 'Languages', icon: <Languages className="w-4 h-4" /> },
                    { name: 'MessageSquare', icon: <MessageSquare className="w-4 h-4" /> },
                    { name: 'Landmark', icon: <Landmark className="w-4 h-4" /> },
                    { name: 'BookOpen', icon: <BookOpen className="w-4 h-4" /> },
                    { name: 'FileText', icon: <FileText className="w-4 h-4" /> },
                    { name: 'Cpu', icon: <Cpu className="w-4 h-4" /> },
                    { name: 'Monitor', icon: <Monitor className="w-4 h-4" /> },
                    { name: 'Sigma', icon: <Sigma className="w-4 h-4" /> },
                    { name: 'Folder', icon: <Folder className="w-4 h-4" /> },
                    { name: 'HelpCircle', icon: <HelpCircle className="w-4 h-4" /> },
                    { name: 'Video', icon: <Video className="w-4 h-4" /> }
                  ].map((i) => {
                    const isSelected = editIcon === i.name;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setEditIcon(i.name)}
                        style={isSelected ? { backgroundColor: `${editColor}1c`, borderColor: editColor, color: editColor } : {}}
                        className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          isSelected
                            ? 'font-bold'
                            : 'border-zinc-150 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                        }`}
                        title={i.name}
                      >
                        {React.cloneElement(i.icon as React.ReactElement, { className: 'w-4 h-4 shrink-0' })}
                        <span className="text-[8px] truncate max-w-full tracking-tighter opacity-80">{i.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditSubjectModal(false)}
                className="px-5 py-3 text-zinc-500 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubjectDetails}
                disabled={isSavingSubject}
                style={{ backgroundColor: editColor }}
                className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingSubject ? 'Saving Changes...' : 'Save Subject Details'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 4.5 About Subject & Curriculum Modal */}
      {showAboutSubjectModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAboutSubjectModal(false)}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
          />

          {/* Modal Container */}
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d10] border border-zinc-200/80 dark:border-white/10 rounded-[32px] p-6 sm:p-7 shadow-2xl space-y-4 z-10 my-6 overflow-hidden max-h-[85vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-white/5 pb-3.5 shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs" style={{ backgroundColor: theme.rawColor }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                    {subjectName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5 flex-wrap">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{subjectCode}</span>
                    <span>•</span>
                    <span>{creditsText}</span>
                    <span>•</span>
                    <span>{ltpText}</span>
                    <span>•</span>
                    <span>{activeCurriculum?.category || 'Core'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {activeCurriculum?.syllabusPdf && (
                  <a
                    href={activeCurriculum.syllabusPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors no-underline shrink-0"
                    title="View Official Syllabus PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-500" />
                    <span>Syllabus</span>
                  </a>
                )}
                <button 
                  onClick={() => setShowAboutSubjectModal(false)} 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors outline-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Batch Switcher (Only shown if curriculum differs across batches) */}
            {reappearCurriculum && (
              <div className="inline-flex p-1 bg-zinc-100 dark:bg-white/5 rounded-xl self-start border border-zinc-200/60 dark:border-white/5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setCurriculumTerm('current')}
                  className={`px-3 py-1 rounded-lg transition-all border-none cursor-pointer font-semibold ${
                    curriculumTerm === 'current'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                >
                  2026 Batch
                </button>
                <button
                  type="button"
                  onClick={() => setCurriculumTerm('reappear')}
                  className={`px-3 py-1 rounded-lg transition-all border-none cursor-pointer font-semibold ${
                    curriculumTerm === 'reappear'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                >
                  Prev Year
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 text-left space-y-4">
              {/* Course Description */}
              {activeCurriculum?.courseDescription && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Course Overview</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-zinc-100 dark:border-white/5">
                    {activeCurriculum.courseDescription}
                  </p>
                </div>
              )}

              {/* Grading Scheme */}
              {activeCurriculum?.gradingScheme && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Grading Scheme</h4>
                  <div className="grid grid-cols-4 gap-2 bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-2xl border border-zinc-100 dark:border-white/5 text-center">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-medium">Attendance</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {activeCurriculum.gradingScheme.attendance === 'NA' ? 'N/A' : `${activeCurriculum.gradingScheme.attendance}%`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-medium">CA</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {activeCurriculum.gradingScheme.continuous_assessment === 'NA' ? 'N/A' : `${activeCurriculum.gradingScheme.continuous_assessment}%`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-medium">Mid Term</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {activeCurriculum.gradingScheme.mid_term_examination === 'NA' ? 'N/A' : `${activeCurriculum.gradingScheme.mid_term_examination}%`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-medium">End Term</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {activeCurriculum.gradingScheme.end_term === 'NA' ? 'N/A' : `${activeCurriculum.gradingScheme.end_term}%`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Continuous Assessment (CA) Components */}
              {activeCurriculum?.continuousAssessment && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Continuous Assessment (CA)
                    </h4>
                    {activeCurriculum.continuousAssessment.evaluationRule && (
                      <span className="text-[10px] text-zinc-400 italic">
                        {activeCurriculum.continuousAssessment.evaluationRule}
                      </span>
                    )}
                  </div>

                  {activeCurriculum.continuousAssessment.components && activeCurriculum.continuousAssessment.components.length > 0 && (
                    <div className="space-y-1.5">
                      {activeCurriculum.continuousAssessment.components.map((comp, idx) => {
                        const isOpen = expandedCAIndices.includes(idx);
                        const timingClean = comp.timing && comp.timing !== 'Wk' && comp.timing !== 'Wk NA' ? comp.timing : null;
                        const rubricText = comp.format ? comp.format.replace(/^Rubric\s*/i, '').trim() : null;

                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] overflow-hidden transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => toggleCAIndex(idx)}
                              className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-zinc-100/50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer border-none bg-transparent outline-none"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">
                                  {comp.name}
                                </span>
                                {timingClean && (
                                  <span className="text-[10px] text-zinc-400 font-medium">
                                    • {timingClean}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                  {comp.weightage}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                              </div>
                            </button>

                            {isOpen && (
                              <div className="px-3 pb-3 pt-1 space-y-2 border-t border-zinc-100 dark:border-white/5 text-xs">
                                {comp.syllabus && comp.syllabus !== 'NA' && (
                                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {comp.syllabus}
                                  </p>
                                )}

                                {rubricText && rubricText !== '' && (
                                  <div className="pt-1.5 border-t border-zinc-100/80 dark:border-white/[0.04]">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                                      Rubric
                                    </span>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                      {rubricText}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Exam Blueprint */}
              {activeCurriculum?.examPatterns && (activeCurriculum.examPatterns.midTerm || activeCurriculum.examPatterns.endTerm) && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Exam Blueprint</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCurriculum.examPatterns.midTerm && (
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>Mid Term</span>
                          <span className="font-bold">{activeCurriculum.examPatterns.midTerm.weightage}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {activeCurriculum.examPatterns.midTerm.description || activeCurriculum.examPatterns.midTerm.title}
                        </p>
                      </div>
                    )}
                    {activeCurriculum.examPatterns.endTerm && (
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>End Term</span>
                          <span className="font-bold">{activeCurriculum.examPatterns.endTerm.weightage}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {activeCurriculum.examPatterns.endTerm.description || activeCurriculum.examPatterns.endTerm.title}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Units Overview */}
              {activeCurriculum?.units && activeCurriculum.units.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Syllabus Outline ({activeCurriculum.units.length} Units)</h4>
                  <div className="space-y-1">
                    {activeCurriculum.units.map((unit, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 text-xs">
                        <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-white/10 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                          {unit.unitNumber || idx + 1}
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 truncate font-medium">{unit.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback to simple markdown if catalog has no entry */}
              {!activeCurriculum && (
                <div className="space-y-3.5 pr-2">
                  {aboutSubjectLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-zinc-200 dark:border-white/5 rounded-full absolute" />
                        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin absolute" style={{ borderTopColor: theme.rawColor, borderRightColor: theme.rawColor, borderBottomColor: theme.rawColor }} />
                      </div>
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider animate-pulse">
                        Generating Course Overview...
                      </div>
                    </div>
                  ) : (
                    parseSimpleMarkdown(aboutSubjectContent)
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAboutSubjectModal(false)}
                style={{ backgroundColor: theme.rawColor }}
                className="px-6 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. Portal Dropdown Menu for Files list */}
      {activeMenuFileId && menuAnchorRect && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => {
              setActiveMenuFileId(null);
              setMenuAnchorRect(null);
            }} 
          />
          <div 
            style={{
              position: 'fixed',
              top: `${menuAnchorRect.bottom + 4}px`,
              left: `${Math.max(16, Math.min(window.innerWidth - 144 - 16, menuAnchorRect.right - 144))}px`,
            }}
            className="w-36 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/10 py-1.5 shadow-xl z-[9999] text-left overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View Details */}
            <button
              onClick={() => {
                const file = allFiles.find(f => f.id === activeMenuFileId);
                setActiveMenuFileId(null);
                setMenuAnchorRect(null);
                if (file) setSelectedFileDetail(file);
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              Details
            </button>

            {/* Download */}
            <button
              onClick={() => {
                const file = allFiles.find(f => f.id === activeMenuFileId);
                setActiveMenuFileId(null);
                setMenuAnchorRect(null);
                if (file) handleDownloadFile(file);
              }}
              className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
            >
              <Download size={14} className="text-zinc-400" />
              Download
            </button>

            {/* Move Up & Move Down (Admin only) */}
            {userProfile?.is_admin && activeCategoryFolder && (() => {
              const activeCategoryFiles = subjectFiles
                .filter(f => isFileTypeMatchingCategory(f, activeCategoryFolder))
                .sort((a, b) => {
                  const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
                  const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;
                  if (orderA !== orderB) return orderA - orderB;
                  return a.name.localeCompare(b.name);
                });
              const fileIdx = activeCategoryFiles.findIndex(f => f.id === activeMenuFileId);
              const isFirstFile = fileIdx <= 0;
              const isLastFile = fileIdx >= activeCategoryFiles.length - 1;

              return (
                <>
                  <button
                    disabled={isFirstFile}
                    onClick={() => {
                      const fileId = activeMenuFileId;
                      setActiveMenuFileId(null);
                      setMenuAnchorRect(null);
                      if (fileId) handleMoveFile(fileId, 'up');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp size={14} className="text-zinc-400" />
                    Move Up
                  </button>
                  <button
                    disabled={isLastFile}
                    onClick={() => {
                      const fileId = activeMenuFileId;
                      setActiveMenuFileId(null);
                      setMenuAnchorRect(null);
                      if (fileId) handleMoveFile(fileId, 'down');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown size={14} className="text-zinc-400" />
                    Move Down
                  </button>
                </>
              );
            })()}

            {/* Edit (Admin only) */}
            {userProfile?.is_admin && (
              <button
                onClick={() => {
                  const file = allFiles.find(f => f.id === activeMenuFileId);
                  setActiveMenuFileId(null);
                  setMenuAnchorRect(null);
                  if (file) {
                    setSelectedFileToEdit(file);

                    let fileProg = file.program || selectedProgram || 'BTech CSE';
                    let fileSem = activeSemester?.name || 'Semester 1';
                    let fileSubj = activeSubject?.name || 'Subject';
                    let fileCat = 'Notes';

                    if (file.parent_id) {
                      const parentCatFolder = (allFolders || []).find(c => c.id === file.parent_id);
                      if (parentCatFolder) {
                        fileCat = parentCatFolder.name;
                        const parentSubjFolder = (allFolders || []).find(s => s.id === parentCatFolder.parent_id);
                        if (parentSubjFolder) {
                          fileSubj = parentSubjFolder.name;
                          const parentSemFolder = (allFolders || []).find(sm => sm.id === parentSubjFolder.parent_id);
                          if (parentSemFolder) {
                            fileSem = parentSemFolder.name;
                            if (parentSemFolder.program) fileProg = parentSemFolder.program;
                          }
                        }
                      }
                    }

                    setEditForm({
                      name: file.name,
                      description: file.description || '',
                      program: fileProg,
                      semester: fileSem,
                      subject: fileSubj,
                      type: fileCat,
                      display_order: file.display_order || 0
                    });
                    setIsCreatingNewSubjectInEdit(false);
                    setShowEditModal(true);
                  }
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                Edit Metadata
              </button>
            )}

            {/* Delete (Admin only) */}
            {userProfile?.is_admin && (
              <button
                onClick={() => {
                  const file = allFiles.find(f => f.id === activeMenuFileId);
                  setActiveMenuFileId(null);
                  setMenuAnchorRect(null);
                  if (file) handleDeleteFile(file);
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete File
              </button>
            )}
          </div>
        </>
        , document.body
      )}

      {/* 6. Full-screen Greyish Glassmorphism Drag & Drop Overlay */}
      {isDraggingOver && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-none select-none">
          <div className="bg-zinc-900/90 dark:bg-[#161618] border border-zinc-700/60 dark:border-white/10 rounded-[32px] p-8 max-w-md w-full flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 dark:bg-[#202024] text-zinc-100 flex items-center justify-center shadow-inner">
              <Upload className="w-8 h-8 text-zinc-200 dark:text-zinc-100 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white leading-tight">Drop files to upload</h3>
              <p className="text-xs text-zinc-400 font-medium">
                Uploading to <span className="font-bold text-white">{activeCategoryFolder?.name || 'Category'}</span> material
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 7. File Details Modal */}
      {selectedFileDetail && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xl overflow-y-auto animate-fade-in" 
          onClick={() => setSelectedFileDetail(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-50 dark:bg-[#0c0c0e] border border-zinc-200/80 dark:border-white/10 p-5 sm:p-7 shadow-2xl no-scrollbar" 
            onClick={(e) => e.stopPropagation()}
          >
            <FileDetailPage
              file={selectedFileDetail}
              userProfile={userProfile}
              onClose={() => setSelectedFileDetail(null)}
              onOpenViewer={(f) => {
                setSelectedFileDetail(null);
                handleOpenFile(f);
              }}
              themeColor={theme.rawColor}
            />
          </div>
        </div>,
        document.body
      )}

      {/* 8. In-App PDF / Image Viewer Modal */}
      {activePdfFile && (
        <ModernPDFViewer
          file={activePdfFile}
          fileName={activePdfFile.name}
          userProfile={userProfile as any}
          onClose={() => setActivePdfFile(null)}
        />
      )}
    </div>
  );
};

export default SubjectCommunity;
