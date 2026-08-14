import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Users, BookOpen, MessageSquare, HelpCircle, Calendar, Plus,
  Search, Shield, Check, Flame, Trophy, Map as MapIcon, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Sparkles, Send, Edit, FileText, Download, Award, Code, Database,
  Terminal, Globe, Book, Video, FlaskConical, ClipboardList, Scroll, Folder, MessageCircle, Pin,
  Languages, Bell, BellOff, MoreHorizontal, Cpu, Monitor, Sigma, ChevronDown, ChevronRight, Compass, Landmark,
  Link, Image, Smile, Bold, Italic, Strikethrough, List, ListOrdered, AlertTriangle, Quote, BarChart2,
  Share2, ArrowBigUp, ArrowBigDown, Pencil, Trash2
} from 'lucide-react';
import { Folder as FolderType, LibraryFile, UserProfile } from '../types';
import {
  CommunityPost, MaterialRequest, StudyPack, WikiSection, SubjectChatMsg, SubjectStats
} from '../types/communityTypes';
import CommunityService, { uploadCommunityImage } from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { askGeminiText } from '../services/geminiService';
import FileDetailPage from './FileDetailPage';
import { FileIcon } from './FileIcon';
import { showToast } from './Toast';
import { findSubjectMetadata } from '../data/curriculumData';
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
}

const getSubjectTheme = (nameOrCode: string, folderColor?: string, folderIcon?: string) => {
  const c = nameOrCode.toUpperCase().trim();
  
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
  if (
    c.includes('ELECTIVE') || 
    c.includes('MEC') || 
    c.includes('ECE') || 
    c.includes('EEE') || 
    c.includes('ELECTRICAL') || 
    c.includes('ELECTRONICS') || 
    c.includes('EVS') || 
    c.includes('PHYSICS') ||
    c.includes('AUTOCAD') ||
    c.includes('ENVIRONMENTAL') ||
    c.includes('DRAWING')
  ) {
    return {
      text: 'text-purple-500',
      bg: 'bg-purple-500',
      lightBg: 'bg-purple-500/10 dark:bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-indigo-500',
      icon: customIcon || <Cpu className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#a855f7'
    };
  }

  // 3. Dedicated Project / Lab Basket -> AMBER / ORANGE (#ff7a00)
  if (c.includes('PROJECT') || c.includes('COMMUNITY DEVELOPMENT')) {
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

  // 4. Custom theme if specifically customized (and not a system default color)
  if (folderColor && folderColor !== '#ff7a00' && folderColor !== '#14b8a6' && folderColor !== '#ef4444' && folderColor !== '#22c55e' && folderColor !== '#06b6d4' && folderColor !== '#a855f7' && folderColor !== '#ec4899') {
    return {
      text: `text-[${folderColor}]`,
      bg: `bg-[${folderColor}]`,
      lightBg: `${folderColor}10`,
      border: `border-[${folderColor}]/20`,
      gradient: `from-[${folderColor}] to-[${folderColor}]`,
      icon: customIcon || <Folder className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: folderColor
    };
  }

  // 5. Core Courses & Default CSE / INT / MTH -> CYAN / TEAL (#06b6d4)
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
  onDeleteFolder
}) => {
  const subjectCodeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
  const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toUpperCase() : activeSubject.name.split(':')[0].trim();
  const subjectName = activeSubject.name.split(':')[1]?.trim() || activeSubject.name;

  const subjectMetadata = useMemo(() => {
    return findSubjectMetadata(selectedProgram, activeSubject.name);
  }, [selectedProgram, activeSubject.name]);

  const creditsText = subjectMetadata ? `${subjectMetadata.credits} Credits` : "4 Credits";
  const ltpText = subjectMetadata ? `L-T-P: ${subjectMetadata.l}-${subjectMetadata.t}-${subjectMetadata.p}` : "L-T-P: 3-0-2";

  const theme = useMemo(() => getSubjectTheme(activeSubject.name, activeSubject.color, activeSubject.icon_name), [activeSubject.name, activeSubject.color, activeSubject.icon_name]);

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

    return Array.from(catMap.values());
  }, [categories]);

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'files' | 'social' | 'discussions' | 'requests' | 'packs' | 'leaderboard' | 'people'>('files');
  const [socialFilter, setSocialFilter] = useState<'all' | 'discussions' | 'requests'>('all');
  const [joined, setJoined] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: '',
    display_order: 0
  });

  // Interaction overlays
  const [selectedFileDetail, setSelectedFileDetail] = useState<LibraryFile | null>(null);
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



  // Selected Section inside Files tab (null means listing categories, Folder means viewing files inside that category)
  const [activeCategoryFolder, setActiveCategoryFolder] = useState<FolderType | null>(null);

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
      if (fileParentId && catId && fileParentId === catId) {
        return true;
      }

      // 2. If file parent_id is set to a valid UUID of another category folder
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (fileParentId && uuidRegex.test(fileParentId) && catId && uuidRegex.test(catId) && fileParentId !== catId) {
        // Support common subjects shared across semesters (e.g. MEC136 in Sem 1 vs Sem 2)
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

        // Secondary fallback matching by file name keywords
        const fn = (typeof file === 'object' ? (file.name || '') : '').toLowerCase().trim();
        const cn = (catName || '').toLowerCase().trim();
        if (cn.includes('note') && (fn.includes('shortcut') || fn.includes('note') || fn.includes('chapter'))) return true;
        if ((cn.includes('pyq') || cn.includes('question') || cn.includes('paper')) && (fn.includes('pyq') || fn.includes('question'))) return true;
        if ((cn.includes('lecture') || cn.includes('slide')) && (fn.includes('unit') || fn.includes('projection') || fn.includes('instrument') || fn.includes('scale') || fn.includes('letter') || fn.includes('line') || fn.includes('point') || fn.includes('dimension'))) return true;
        if (cn.includes('syllabus') && (fn.includes('syllabus') || fn === 'mec136')) return true;

        return false;
      }
    }

    const ft = (fileType || '').toLowerCase().trim();
    const cn = (catName || '').toLowerCase().trim();

    if (!ft || ft === 'file') {
      return false;
    }
    
    if (cn.includes('note')) {
      return ft.includes('note');
    }
    if (cn.includes('pyq') || cn.includes('question') || cn.includes('paper')) {
      return ft.includes('pyq') || ft.includes('question') || ft.includes('paper');
    }
    if (cn.includes('lecture') || cn.includes('slide') || cn.includes('video') || cn.includes('recording')) {
      return ft.includes('lecture') || ft.includes('slide') || ft.includes('video') || ft.includes('recording');
    }
    if (cn.includes('syllabus') || cn.includes('syllabi') || cn.includes('roadmap') || cn.includes('curriculum')) {
      return ft.includes('syllabus') || ft.includes('curriculum');
    }
    
    const isLabCategory = cn === 'lab' || cn === 'labs' || cn.startsWith('lab ') || cn.endsWith(' lab') || cn.includes('laboratory') || cn.includes('manual') || cn.includes('practical');
    if (isLabCategory) {
      return ft.includes('lab') || ft.includes('manual') || ft.includes('practical');
    }
    
    if (cn.includes('book') || cn.includes('textbook')) {
      return ft.includes('book') || ft.includes('material');
    }
    return ft === cn || ft.includes(cn) || cn.includes(ft);
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
      window.location.reload();
    } catch (e: any) {
      showToast("Error deleting file: " + e.message, "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFileToEdit) return;
    try {
      const client = NexusServer.getClient();
      if (!client) return;

      const catFolder = categories.find(c => c.name.toLowerCase().trim() === editForm.type.toLowerCase().trim());

      const updatePayload: any = {
        name: editForm.name,
        description: editForm.description,
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
      showToast("File updated successfully!", "success");
      setShowEditModal(false);
      window.location.reload();
    } catch (e: any) {
      showToast("Error updating file: " + e.message, "error");
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
    onFileAccess(file);
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

  // Render helper for files tab detail view or category folder view
  let mainContent = null;
  if (activeTab === 'files' && selectedFileDetail) {
    mainContent = (
      <div className="space-y-6 animate-fade-in">
        <FileDetailPage
          file={selectedFileDetail}
          userProfile={userProfile}
          onClose={() => setSelectedFileDetail(null)}
          onRefresh={loadCommunityData}
          themeColor={theme.rawColor}
        />
      </div>
    );
  }

  // 2. Files Tab Category Folder opened view (replaces subject banner and tabs with category details)
  else if (activeTab === 'files' && activeCategoryFolder) {
    const catMeta = getCategoryMetadata(activeCategoryFolder, theme.rawColor);
    const catFilesCount = categoryFiles.length;
    
    mainContent = (
      <div className="space-y-6 animate-fade-in">
        {/* Back Link to Subject */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setActiveCategoryFolder(null)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} /> Back to {subjectName}
          </button>
        </div>

        {/* Category Header Banner (Clean & Boxless) */}
        <div className="relative overflow-visible p-0 flex flex-row items-center justify-between gap-3 sm:gap-6 py-1">
          {/* Category Logo & Info */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-md"
              style={{ backgroundColor: `${theme.rawColor}15` }}
            >
              {React.cloneElement(catMeta.icon as React.ReactElement, { className: `w-5.5 h-5.5 sm:w-6 sm:h-6`, style: { color: theme.rawColor } })}
            </div>
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black text-white capitalize" style={{ backgroundColor: theme.rawColor }}>
                  {activeCategoryFolder.name}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                  {catFilesCount} {catFilesCount === 1 ? 'Resource' : 'Resources'}
                </span>
              </div>
              <h2 className="text-sm xs:text-base md:text-lg lg:text-xl font-black text-zinc-900 dark:text-white leading-tight truncate capitalize">
                {activeCategoryFolder.name} Material
              </h2>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-1 shrink-0">
            {userProfile?.is_admin && (
              <button
                onClick={() => onUploadClick?.(activeCategoryFolder?.name)}
                style={{ backgroundColor: theme.rawColor }}
                className="px-3.5 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all border-none cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Upload File
              </button>
            )}
          </div>
        </div>

        {/* Files List View */}
        <div className="space-y-4 pt-2">
          {categoryFiles.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50/50 dark:bg-white/[0.005] border border-dashed border-zinc-250 dark:border-white/5 rounded-3xl space-y-4">
              <div className="space-y-1">
                <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-400">No resources uploaded in this section yet.</p>
              </div>
              {userProfile?.is_admin && (
                <button
                  onClick={() => onUploadClick?.(activeCategoryFolder?.name)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all border-none cursor-pointer inline-flex items-center gap-1.5"
                  style={{ backgroundColor: theme.rawColor }}
                >
                  <Plus size={14} /> Upload File
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block w-full overflow-hidden border-none rounded-3xl bg-white dark:bg-[#111113] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
                        <th className="py-3 pl-4 pr-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider min-w-[220px]">
                          Name
                        </th>
                        <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-20">
                          Unit
                        </th>
                        <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden md:table-cell w-28">
                          Added By
                        </th>
                        <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:table-cell w-28">
                          Updated On
                        </th>
                        <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right hidden sm:table-cell w-24">
                          Downloads
                        </th>
                        <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-24">
                          Rating
                        </th>
                        <th className="py-3 pr-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                      {categoryFiles.map((file) => {
                        const realNameWithExt = file.name;
                        const ext = file.storage_path ? file.storage_path.split('.').pop()?.toLowerCase() || '' : '';
                        const cleanName = formatCleanFileName(realNameWithExt);

                        const ratingVal = (() => {
                          if (file.rating_votes) {
                            const votes = Object.values(file.rating_votes as Record<string, number>);
                            if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                          }
                          return null;
                        })();
                        
                        const downloadCountVal = file.downloads || 0;

                        const timeAgoVal = (() => {
                          const timestamp = file.uploadDate || (file.created_at ? Date.parse(file.created_at) : Date.now());
                          return getRelativeTime(timestamp);
                        })();

                        const avatarSeed = file.uploader_username || file.uploader_id || file.name;
                        const uploaderName = file.uploader_username || file.faculty_name || "Faculty";

                        return (
                          <tr 
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 pl-4 pr-3 min-w-[220px]">
                              <div className="flex items-center gap-3">
                                <div className="relative w-8 h-9 shrink-0 flex items-center justify-center">
                                  {(() => {
                                    let fillCol = "text-zinc-500";
                                    let label = "FILE";
                                    let foldBg = "#cbd5e1";
                                    
                                    if (ext === 'pdf') { fillCol = "text-red-500"; label = "PDF"; foldBg = "#fca5a5"; }
                                    else if (ext === 'docx' || ext === 'doc') { fillCol = "text-blue-500"; label = "DOC"; foldBg = "#93c5fd"; }
                                    else if (ext === 'pptx' || ext === 'ppt') { fillCol = "text-orange-500"; label = "PPT"; foldBg = "#fed7aa"; }
                                    else if (ext === 'xlsx' || ext === 'xls') { fillCol = "text-emerald-500"; label = "XLS"; foldBg = "#a7f3d0"; }
                                    
                                    return (
                                      <svg viewBox="0 0 24 28" fill="none" className={`w-7.5 h-8.5 ${fillCol}`}>
                                        <path d="M2 0h14l6 6v21a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z" fill="currentColor" />
                                        <path d="M16 0v6h6" fill={foldBg} opacity="0.9" />
                                        <text x="11" y="21" fill="white" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{label}</text>
                                      </svg>
                                    );
                                  })()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                                    {cleanName}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 uppercase">
                                    {ext || 'pdf'} • {file.size || '2.4 MB'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-center">
                              {(() => {
                                const match = file.name.match(/Unit\s*(\d+)/i) || (file.description && file.description.match(/Unit\s*(\d+)/i));
                                if (match) {
                                  return (
                                    <span className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded-lg text-[9px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                      Unit {match[1]}
                                    </span>
                                  );
                                }
                                return <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>;
                              })()}
                            </td>

                            <td className="py-3.5 px-3 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 shrink-0">
                                  <img 
                                    src={file.uploader_avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
                                    alt="avatar" 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-350 truncate max-w-[100px]">
                                  {uploaderName}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3 hidden sm:table-cell text-zinc-400 dark:text-zinc-500 text-[11px] font-semibold">
                              {timeAgoVal}
                            </td>

                            <td className="py-3.5 px-3 text-right hidden sm:table-cell text-zinc-500 dark:text-zinc-400 text-[11px] font-bold">
                              {downloadCountVal}
                            </td>

                            <td className="py-3.5 px-3 text-right text-zinc-800 dark:text-zinc-200 text-[11px] font-black">
                              {ratingVal ? (
                                <span className="inline-flex items-center gap-1">
                                  {ratingVal} <Star size={11} className="text-amber-500" fill="currentColor" />
                                </span>
                              ) : (
                                <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>
                              )}
                            </td>

                            <td className="py-3.5 pr-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                  setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                }}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-transparent border-none cursor-pointer transition-all hover:scale-105 active:scale-95"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {categoryFiles.map((file) => {
                  const realNameWithExt = file.name;
                  const ext = file.storage_path ? file.storage_path.split('.').pop()?.toLowerCase() || '' : '';
                  const cleanName = formatCleanFileName(realNameWithExt);

                  const ratingVal = (() => {
                    if (file.rating_votes) {
                      const votes = Object.values(file.rating_votes as Record<string, number>);
                      if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                    }
                    return null;
                  })();
                  
                  const timeAgoVal = (() => {
                    const timestamp = file.uploadDate || (file.created_at ? Date.parse(file.created_at) : Date.now());
                    return getRelativeTime(timestamp);
                  })();

                  const avatarSeed = file.uploader_username || file.uploader_id || file.name;
                  const uploaderName = file.uploader_username || file.faculty_name || "Faculty";
                  const unitText = getUnitLabel(file.name, file.description);

                  return (
                    <div 
                      key={file.id}
                      onClick={() => handleOpenFile(file)}
                      className="p-4 bg-white dark:bg-[#111113] border-none rounded-2xl flex flex-col gap-3 relative transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-8 h-9 shrink-0 flex items-center justify-center">
                            {(() => {
                              let fillCol = "text-zinc-500";
                              let label = "FILE";
                              let foldBg = "#cbd5e1";
                              
                              if (ext === 'pdf') { fillCol = "text-red-500"; label = "PDF"; foldBg = "#fca5a5"; }
                              else if (ext === 'docx' || ext === 'doc') { fillCol = "text-blue-500"; label = "DOC"; foldBg = "#93c5fd"; }
                              else if (ext === 'pptx' || ext === 'ppt') { fillCol = "text-orange-500"; label = "PPT"; foldBg = "#fed7aa"; }
                              else if (ext === 'xlsx' || ext === 'xls') { fillCol = "text-emerald-500"; label = "XLS"; foldBg = "#a7f3d0"; }
                              
                              return (
                                <svg viewBox="0 0 24 28" fill="none" className={`w-7.5 h-8.5 ${fillCol}`}>
                                  <path d="M2 0h14l6 6v21a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z" fill="currentColor" />
                                  <path d="M16 0v6h6" fill={foldBg} opacity="0.9" />
                                  <text x="11" y="21" fill="white" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{label}</text>
                                </svg>
                              );
                            })()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">
                              {cleanName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                                {ext || 'pdf'} • {file.size || '2.4 MB'}
                              </span>
                              {unitText && (
                                <span className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded text-[8px] font-bold text-zinc-500 dark:text-zinc-400">
                                  {unitText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                            setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                          }}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors bg-transparent border-none cursor-pointer shrink-0"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-2.5 mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 shrink-0">
                            <img 
                              src={file.uploader_avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
                              alt="avatar" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="truncate max-w-[100px] text-zinc-700 dark:text-zinc-350">{uploaderName}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {ratingVal && (
                            <span className="inline-flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200">
                              {ratingVal} <Star size={9} className="text-amber-500" fill="currentColor" />
                            </span>
                          )}
                          <span>{timeAgoVal}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mainContent ? mainContent : (
        <>
          {/* Header block (unified tinted section on mobile, box on desktop) */}
      <div 
        className="mx-[-32px] sm:mx-0 px-8 sm:px-0 pt-0 pb-3 sm:py-0 bg-gradient-to-b sm:bg-none relative overflow-hidden sm:overflow-visible"
        style={isMobile ? {
          background: `linear-gradient(to bottom, ${theme.rawColor}1c, transparent)`,
          marginTop: 'calc(env(safe-area-inset-top, 0px) * -1 - 36px)',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 36px + 16px)'
        } : undefined}
      >
        {/* Back button */}
        <div className="mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} /> Back to Semesters
          </button>
        </div>

        {/* Subject Header Banner (Clean & Boxless) */}
        <div className="relative overflow-visible p-0 flex flex-row items-start justify-between gap-3 sm:gap-6 py-1">
          {/* Course Logo & Info */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0 text-white mt-0.5" style={{ backgroundColor: theme.rawColor }}>
              {React.cloneElement(theme.icon as React.ReactElement, { className: 'w-5.5 h-5.5 sm:w-6 sm:h-6 text-white' })}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-zinc-900 dark:text-white leading-tight break-words">
                {subjectName}
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black text-white shrink-0" style={{ backgroundColor: theme.rawColor }}>
                  {subjectCode}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none text-[8px] sm:text-[10px] shrink-0">•</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap shrink-0">
                  {creditsText}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none text-[8px] sm:text-[10px] shrink-0">•</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap shrink-0">
                  {ltpText}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none text-[8px] sm:text-[10px] shrink-0">•</span>
                <span className="inline-flex items-center gap-1.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wide whitespace-nowrap shrink-0" style={{ color: theme.rawColor }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.rawColor }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.rawColor }}></span>
                  </span>
                  {onlineCount} studying now
                </span>
              </div>
            </div>
          </div>

          {/* Options Controls */}
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <div className="relative">
              <button
                onClick={() => setShowSubjectOptions(!showSubjectOptions)}
                title="Options"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none bg-transparent sm:hover:bg-zinc-100 sm:dark:hover:bg-white/5 outline-none text-zinc-500 dark:text-zinc-400 active:scale-95 shrink-0"
              >
                <MoreHorizontal className="w-5 h-5" strokeWidth={2.5} />
              </button>
              {showSubjectOptions && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSubjectOptions(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/10 rounded-2xl p-1.5 shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowSubjectOptions(false);
                        handleOpenAboutSubject();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-zinc-500" />
                      About Subject
                    </button>
                    {userProfile?.is_admin && (
                      <button
                        onClick={() => {
                          setShowSubjectOptions(false);
                          setShowEditSubjectModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer transition-colors"
                      >
                        <Edit className="w-4 h-4 text-zinc-500" />
                        Edit Subject Details
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Deck Header */}
      <div className="flex border-b border-zinc-150 dark:border-white/5 overflow-x-auto no-scrollbar scroll-smooth mb-6">
        {[
          { id: 'files', label: 'Files', icon: <Folder className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'social', label: 'Social', icon: <MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'packs', label: 'Study Packs', icon: <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'people', label: 'People', icon: <Users className="w-3.5 h-3.5 text-zinc-500" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'social' && (activeTab === 'discussions' || activeTab === 'requests'));
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setActiveCategoryFolder(null); }}
              style={isActive ? { borderColor: theme.rawColor, color: theme.rawColor } : {}}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 bg-transparent cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${isActive
                  ? 'font-bold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
            >
              {tab.icon}
              {tab.id === 'files' ? `Files (${subjectFiles.length})` : tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}

      {/* 1. FILES TAB (Default) */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {selectedFileDetail ? (
            <FileDetailPage
              file={selectedFileDetail}
              userProfile={userProfile}
              onClose={() => setSelectedFileDetail(null)}
              onRefresh={loadCommunityData}
              themeColor={theme.rawColor}
            />
          ) : !activeCategoryFolder ? (
            <div className="space-y-6 animate-fade-in">
              {/* Continue Studying Card (Thin & Clean) */}
              {userProfile && continueStudyingFile && (
                <div className="p-2.5 sm:p-3 bg-white dark:bg-[#111113] border-none rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xs font-bold shrink-0" style={{ color: theme.rawColor }}>
                      {continueStudyingFile.percent === 0 ? "Start Studying" : continueStudyingFile.percent === 100 ? "Completed" : "Continue Studying"}
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{continueStudyingFile.doc.name}</span>
                    <div className="hidden sm:block w-24 bg-zinc-100 dark:bg-zinc-800/80 h-1 rounded-full overflow-hidden shrink-0 ml-1">
                      <div className="h-full rounded-full" style={{ width: `${continueStudyingFile.percent}%`, backgroundColor: theme.rawColor }} />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onFileAccess(continueStudyingFile.doc);
                    }}
                    style={{ backgroundColor: theme.rawColor }}
                    className="px-3 py-1.5 text-white rounded-xl text-xs font-bold border-none flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
                  >
                    <span>{continueStudyingFile.percent === 0 ? "Start" : continueStudyingFile.percent === 100 ? "Review (100%)" : `Resume (${continueStudyingFile.percent}%)`}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Study Sections</div>
                  {(userProfile?.is_admin || isAdmin) && onAddFolder && (
                    <button
                      onClick={onAddFolder}
                      style={{ color: theme.rawColor }}
                      className="border-none bg-transparent hover:opacity-80 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold p-0 active:scale-95 shrink-0"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} style={{ color: theme.rawColor }} />
                      <span>Create</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayCategories.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white dark:bg-[#111113] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-3">
                      <Folder className="w-8 h-8 text-zinc-400 opacity-60" />
                      <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">No study sections found for this subject.</div>
                      {(userProfile?.is_admin || isAdmin) && onAddFolder && (
                        <button
                          onClick={onAddFolder}
                          style={{ backgroundColor: theme.rawColor }}
                          className="px-3.5 py-1.5 text-white rounded-xl text-xs font-bold border-none flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>Create Study Section</span>
                        </button>
                      )}
                    </div>
                  ) : displayCategories
                    .filter(cat => {
                      if (!searchQuery || searchQuery.trim() === '') return true;
                      const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f, cat));
                      const nameMatches = cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
                      return filesInCat.length > 0 || nameMatches;
                    })
                    .map((cat) => {
                      const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f, cat));
                      const meta = getCategoryMetadata(cat, theme.rawColor);
                      
                      const progressList = userProgressList || [];
                      const totalPercent = filesInCat.reduce((sum, file) => {
                        const prog = progressList.find(p => p.document_id === file.id);
                        return sum + (prog ? prog.progress_percentage : 0);
                      }, 0);
                      const averagePercent = filesInCat.length > 0 ? Math.round(totalPercent / filesInCat.length) : 0;

                      return (
                        <div
                          key={cat.id}
                          onClick={() => setActiveCategoryFolder(cat)}
                          className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-none bg-white dark:bg-[#111113] hover:bg-zinc-50 dark:hover:bg-[#161618] hover:shadow-md transition-all duration-200 active:scale-[0.99] relative overflow-hidden cursor-pointer"
                        >
                          {(userProfile?.is_admin || isAdmin) && (onEditFolder || onDeleteFolder) && (
                            <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {onEditFolder && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onEditFolder(cat, e); }}
                                  title="Edit / Rename Folder"
                                  className="p-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-orange-500 hover:bg-orange-50 transition-colors shadow-sm border border-zinc-100 dark:border-white/5"
                                >
                                  <Pencil className="w-2.5 h-2.5" strokeWidth={3} />
                                </button>
                              )}
                              {onDeleteFolder && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onDeleteFolder(cat, e); }}
                                  title="Delete Folder"
                                  className="p-1 bg-white dark:bg-[#0a0a0a] rounded-lg text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-zinc-100 dark:border-white/5"
                                >
                                  <Trash2 className="w-3 h-3" strokeWidth={3} />
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-1 sm:pr-2">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white animate-fade-in" style={{ backgroundColor: meta.color }}>
                              {React.isValidElement(meta.icon) ? React.cloneElement(meta.icon as React.ReactElement, { className: 'w-5 h-5 text-white' }) : meta.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white leading-snug break-words">{cat.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-1.5 min-[375px]:gap-x-2 gap-y-0.5 mt-1 text-[9px] min-[375px]:text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                <span className="flex items-center gap-1 font-semibold whitespace-nowrap shrink-0" style={{ color: meta.color }}>
                                  <FileText className="w-3.5 h-3.5" />
                                  {filesInCat.length} Resources
                                </span>
                                {averagePercent > 0 && (
                                  <>
                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold select-none shrink-0">•</span>
                                    <span className="whitespace-nowrap shrink-0 font-semibold text-zinc-500 dark:text-zinc-400">{averagePercent}% Completed</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform shrink-0" style={{ color: meta.color }} />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Recently Added Section */}
              <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">Recently Added</h3>
                  {subjectFiles.length > 5 && (
                    <button 
                      onClick={() => {
                        // Fallback: view all by activating the first category folder
                        if (categories.length > 0) setActiveCategoryFolder(categories[0]);
                      }}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      View all
                    </button>
                  )}
                </div>

                {recentFiles.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl text-xs text-zinc-400">
                    No resources uploaded yet. Be the first to add study material!
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto no-scrollbar border-none rounded-2xl bg-white dark:bg-[#111113]">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-white/5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-white/[0.005]">
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Added by</th>
                            <th className="py-3 px-4">Added on</th>
                            <th className="py-3 px-4 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                          {recentFiles.map((file) => {
                            const relativeTime = getRelativeTime(file.uploadDate);
                            return (
                              <tr 
                                key={file.id} 
                                onClick={() => handleOpenFile(file)}
                                className="group hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer text-xs sm:text-sm"
                              >
                                {/* Name */}
                                <td className="py-3.5 px-4 font-bold text-zinc-800 dark:text-zinc-200 min-w-[220px]">
                                  <div className="flex items-center gap-2.5">
                                    <FileIcon fileName={file.name} size="w-5 h-5" className="shrink-0" />
                                    <span className="truncate group-hover:text-orange-500 transition-colors max-w-[280px]">
                                      {file.name}
                                    </span>
                                  </div>
                                </td>
                                {/* Type */}
                                <td className="py-3.5 px-4 font-semibold text-zinc-400 dark:text-zinc-500 uppercase">
                                  {file.type}
                                </td>
                                {/* Added By */}
                                <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-350 font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-[10px]">
                                      {(file.uploader_username || 'A')[0].toUpperCase()}
                                    </div>
                                    <span className="truncate max-w-[120px]">
                                      {file.uploader_username || "Anonymous Verto"}
                                    </span>
                                  </div>
                                </td>
                                {/* Added On */}
                                <td className="py-3.5 px-4 text-zinc-400 dark:text-zinc-500 font-medium">
                                  {relativeTime}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                      setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                    }}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors bg-transparent border-none cursor-pointer"
                                  >
                                    <MoreHorizontal className="w-4.5 h-4.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {recentFiles.map((file) => {
                        const relativeTime = getRelativeTime(file.uploadDate);
                        const ratingVal = (() => {
                          if (file.rating_votes) {
                            const votes = Object.values(file.rating_votes as Record<string, number>);
                            if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                          }
                          return null;
                        })();
                        return (
                          <div 
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="p-4 bg-white dark:bg-[#111113] border-none rounded-2xl flex flex-col gap-3 relative transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <FileIcon fileName={file.name} size="w-8 h-8" className="shrink-0" />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">
                                    {file.name}
                                  </h4>
                                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-0.5">
                                    {file.type}
                                  </p>
                                </div>
                              </div>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                  setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                }}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors bg-transparent border-none cursor-pointer shrink-0"
                              >
                                <MoreHorizontal className="w-4.5 h-4.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-2.5 mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5.5 h-5.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-[9px]">
                                  {(file.uploader_username || 'A')[0].toUpperCase()}
                                </div>
                                <span className="truncate max-w-[100px] text-zinc-600 dark:text-zinc-350">{file.uploader_username || "Anonymous Verto"}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                {ratingVal && (
                                  <span className="inline-flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200">
                                    {ratingVal} <Star size={9} className="text-amber-500" fill="currentColor" />
                                  </span>
                                )}
                                <span>{relativeTime}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Category drilldown (File List View grouped by Unit)
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveCategoryFolder(null)}
                    className="p-1 bg-transparent border-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="text-xs font-bold text-zinc-800 dark:text-white capitalize">
                    {activeCategoryFolder.name}
                  </div>
                </div>
                {userProfile?.is_admin && (
                  <button
                    onClick={() => onUploadClick?.(activeCategoryFolder?.name)}
                    style={{ backgroundColor: theme.rawColor }}
                    className="px-3.5 py-1.5 text-white rounded-xl text-xs font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Upload File
                  </button>
                )}
              </div>

              {(() => {
                const categoryFiles = subjectFiles.filter(f => isFileTypeMatchingCategory(f, activeCategoryFolder));
                if (categoryFiles.length === 0) {
                  return (
                    <div className="text-center py-10 bg-zinc-50/50 dark:bg-white/[0.005] border border-dashed border-zinc-250 dark:border-white/5 rounded-3xl space-y-4">
                      <div className="space-y-1">
                        <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                        <p className="text-xs text-zinc-400">No resources uploaded in this section yet.</p>
                      </div>
                      {userProfile?.is_admin && (
                        <button
                          onClick={() => onUploadClick?.(activeCategoryFolder?.name)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all border-none cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Upload File
                        </button>
                      )}
                    </div>
                  );
                }                return (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block w-full overflow-hidden border border-zinc-150 dark:border-white/5 rounded-3xl bg-white dark:bg-[#111113] shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.01]">
                              <th className="py-3 pl-4 pr-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider min-w-[220px]">
                                Name
                              </th>
                              <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center w-20">
                                Unit
                              </th>
                              <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden md:table-cell w-28">
                                Added By
                              </th>
                              <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:table-cell w-28">
                                Updated On
                              </th>
                              <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right hidden sm:table-cell w-24">
                                Downloads
                              </th>
                              <th className="py-3 px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-24">
                                Rating
                              </th>
                              <th className="py-3 pr-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-right w-12"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {categoryFiles.map((file) => {
                              // Extract real name from storage path (e.g. community/6yc9oo_UNIT 1 (O).pdf -> UNIT 1 (O).pdf)
                              const realNameWithExt = file.name;
                              const ext = file.storage_path ? file.storage_path.split('.').pop()?.toLowerCase() || '' : '';
                              const cleanName = formatCleanFileName(realNameWithExt);

                              const ratingVal = (() => {
                                if (file.rating_votes) {
                                  const votes = Object.values(file.rating_votes as Record<string, number>);
                                  if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                                }
                                return null;
                              })();
                              
                              const downloadCountVal = file.downloads || 0;

                              const timeAgoVal = (() => {
                                const timestamp = file.uploadDate || (file.created_at ? Date.parse(file.created_at) : Date.now());
                                return getRelativeTime(timestamp);
                              })();

                              const avatarSeed = file.uploader_username || file.uploader_id || file.name;
                              const uploaderName = file.uploader_username || file.faculty_name || "Faculty";

                              return (
                                <tr 
                                  key={file.id}
                                  onClick={() => handleOpenFile(file)}
                                  className="hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer group"
                                >
                                  {/* Name column */}
                                  <td className="py-3.5 pl-4 pr-3 min-w-[220px]">
                                    <div className="flex items-center gap-3">
                                      {/* Mockup Vector File Icon */}
                                      <div className="relative w-8 h-9 shrink-0 flex items-center justify-center">
                                        {(() => {
                                          let fillCol = "text-zinc-500";
                                          let label = "FILE";
                                          let foldBg = "#cbd5e1";
                                          
                                          if (ext === 'pdf') { fillCol = "text-red-500"; label = "PDF"; foldBg = "#fca5a5"; }
                                          else if (ext === 'docx' || ext === 'doc') { fillCol = "text-blue-500"; label = "DOC"; foldBg = "#93c5fd"; }
                                          else if (ext === 'pptx' || ext === 'ppt') { fillCol = "text-orange-500"; label = "PPT"; foldBg = "#fed7aa"; }
                                          else if (ext === 'xlsx' || ext === 'xls') { fillCol = "text-emerald-500"; label = "XLS"; foldBg = "#a7f3d0"; }
                                          
                                          return (
                                            <svg viewBox="0 0 24 28" fill="none" className={`w-7.5 h-8.5 ${fillCol}`}>
                                              <path d="M2 0h14l6 6v21a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z" fill="currentColor" />
                                              <path d="M16 0v6h6" fill={foldBg} opacity="0.9" />
                                              <text x="11" y="21" fill="white" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{label}</text>
                                            </svg>
                                          );
                                        })()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                                          {cleanName}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 uppercase">
                                          {ext || 'pdf'} • {file.size || '2.4 MB'}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Unit column */}
                                  <td className="py-3.5 px-3 text-center">
                                    {(() => {
                                      const unitText = getUnitLabel(file.name, file.description);
                                      if (unitText) {
                                        return (
                                          <span className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded-lg text-[9px] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                            {unitText}
                                          </span>
                                        );
                                      }
                                      return <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>;
                                    })()}
                                  </td>

                                  {/* Added By column */}
                                  <td className="py-3.5 px-3 hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 shrink-0">
                                        <img 
                                          src={file.uploader_avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
                                          alt="avatar" 
                                          className="w-full h-full object-cover" 
                                        />
                                      </div>
                                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-350 truncate max-w-[100px]">
                                        {uploaderName}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Updated On column */}
                                  <td className="py-3.5 px-3 hidden sm:table-cell text-zinc-400 dark:text-zinc-500 text-[11px] font-semibold">
                                    {timeAgoVal}
                                  </td>

                                  {/* Downloads column */}
                                  <td className="py-3.5 px-3 text-right hidden sm:table-cell text-zinc-500 dark:text-zinc-400 text-[11px] font-bold">
                                    {downloadCountVal}
                                  </td>

                                  {/* Rating column */}
                                  <td className="py-3.5 px-3 text-right text-zinc-800 dark:text-zinc-200 text-[11px] font-black">
                                    {ratingVal ? (
                                      <span className="inline-flex items-center gap-1">
                                        {ratingVal} <Star size={11} className="text-amber-500" fill="currentColor" />
                                      </span>
                                    ) : (
                                      <span className="text-zinc-300 dark:text-zinc-700 font-bold">-</span>
                                    )}
                                  </td>

                                  {/* Options Actions */}
                                  <td className="py-3.5 pr-4 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                        setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                      }}
                                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-transparent border-none cursor-pointer transition-all hover:scale-105 active:scale-95"
                                      title="Actions"
                                    >
                                      <MoreHorizontal size={18} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {categoryFiles.map((file) => {
                        const realNameWithExt = file.name;
                        const ext = file.storage_path ? file.storage_path.split('.').pop()?.toLowerCase() || '' : '';
                        const cleanName = formatCleanFileName(realNameWithExt);

                        const ratingVal = (() => {
                          if (file.rating_votes) {
                            const votes = Object.values(file.rating_votes as Record<string, number>);
                            if (votes.length > 0) return (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
                          }
                          return null;
                        })();
                        
                        const timeAgoVal = (() => {
                          const timestamp = file.uploadDate || (file.created_at ? Date.parse(file.created_at) : Date.now());
                          return getRelativeTime(timestamp);
                        })();

                        const avatarSeed = file.uploader_username || file.uploader_id || file.name;
                        const uploaderName = file.uploader_username || file.faculty_name || "Faculty";
                        const unitText = getUnitLabel(file.name, file.description);

                        return (
                          <div 
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="p-4 bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-2xl flex flex-col gap-3 relative hover:border-zinc-200 dark:hover:border-white/10 transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-8 h-9 shrink-0 flex items-center justify-center">
                                  {(() => {
                                    let fillCol = "text-zinc-500";
                                    let label = "FILE";
                                    let foldBg = "#cbd5e1";
                                    
                                    if (ext === 'pdf') { fillCol = "text-red-500"; label = "PDF"; foldBg = "#fca5a5"; }
                                    else if (ext === 'docx' || ext === 'doc') { fillCol = "text-blue-500"; label = "DOC"; foldBg = "#93c5fd"; }
                                    else if (ext === 'pptx' || ext === 'ppt') { fillCol = "text-orange-500"; label = "PPT"; foldBg = "#fed7aa"; }
                                    else if (ext === 'xlsx' || ext === 'xls') { fillCol = "text-emerald-500"; label = "XLS"; foldBg = "#a7f3d0"; }
                                    
                                    return (
                                      <svg viewBox="0 0 24 28" fill="none" className={`w-7.5 h-8.5 ${fillCol}`}>
                                        <path d="M2 0h14l6 6v21a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z" fill="currentColor" />
                                        <path d="M16 0v6h6" fill={foldBg} opacity="0.9" />
                                        <text x="11" y="21" fill="white" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{label}</text>
                                      </svg>
                                    );
                                  })()}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">
                                    {cleanName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
                                      {ext || 'pdf'} • {file.size || '2.4 MB'}
                                    </span>
                                    {unitText && (
                                       <span className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded text-[8px] font-bold text-zinc-500 dark:text-zinc-400">
                                         {unitText}
                                       </span>
                                     )}
                                  </div>
                                </div>
                              </div>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuAnchorRect(activeMenuFileId === file.id ? null : rect);
                                  setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id);
                                }}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors bg-transparent border-none cursor-pointer shrink-0"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-2.5 mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 shrink-0">
                                  <img 
                                    src={file.uploader_avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
                                    alt="avatar" 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <span className="truncate max-w-[100px] text-zinc-700 dark:text-zinc-350">{uploaderName}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                {ratingVal && (
                                  <span className="inline-flex items-center gap-0.5 text-zinc-800 dark:text-zinc-200">
                                    {ratingVal} <Star size={9} className="text-amber-500" fill="currentColor" />
                                  </span>
                                )}
                                <span>{timeAgoVal}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}





      {/* 3. SOCIAL TAB (Unified Discussions & Material Requests) */}
      {(activeTab === 'social' || activeTab === 'discussions' || activeTab === 'requests') && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Bar: Always Single Row with Avatar + Trigger/Header + Filter Dropdown */}
          <div className="flex items-center justify-between gap-3">
            {/* Standalone Avatar on Left */}
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-zinc-200 dark:ring-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0">
                {userProfile?.username?.slice(0, 1).toUpperCase() || 'U'}
              </div>
            )}

            {/* Clean Borderless Input Pill (when closed) */}
            {!showCreatePost ? (
              <div
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-zinc-100 dark:bg-[#141416] hover:bg-zinc-200/70 dark:hover:bg-[#1a1a1d] rounded-2xl px-5 py-2.5 cursor-pointer flex items-center transition-all duration-300 border-none outline-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 transition-colors">
                  Create Post
                </span>
              </div>
            ) : (
              <div className="flex-1 flex items-center px-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  New Post in <span style={{ color: theme.rawColor }}>{subjectCode}</span>
                </span>
              </div>
            )}

            {/* Custom Sleek Filter Dropdown on Right */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowSocialFilterDropdown(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/[0.04] rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer border-none outline-none group whitespace-nowrap"
              >
                <span>
                  {socialFilter === 'all' && `All Activity (${discussions.length + requests.length})`}
                  {socialFilter === 'discussions' && `Discussions (${discussions.length})`}
                  {socialFilter === 'requests' && `Material Requests (${requests.length})`}
                </span>
                <ChevronDown size={13} className={`transition-transform duration-200 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 ${showSocialFilterDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSocialFilterDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSocialFilterDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#141416] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in backdrop-blur-md">
                    {[
                      { id: 'all', label: 'All Activity', count: discussions.length + requests.length },
                      { id: 'discussions', label: 'Discussions', count: discussions.length },
                      { id: 'requests', label: 'Material Requests', count: requests.length },
                    ].map((option) => {
                      const isSelected = socialFilter === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSocialFilter(option.id as any);
                            setShowSocialFilterDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left border-none cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-100 dark:bg-white/10 font-bold'
                              : 'hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                          }`}
                          style={isSelected ? { color: theme.rawColor } : {}}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.rawColor }} />
                            )}
                            <span>{option.label}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                            {option.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Smooth Borderless Expanded Editor Form */}
          {showCreatePost && (
            <div className="bg-zinc-100 dark:bg-[#141416] rounded-3xl p-5 border-none shadow-sm flex flex-col space-y-4 animate-fade-in origin-top">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: theme.rawColor }}>
                    {subjectCode.slice(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{subjectCode}</span>
                </div>
                <div className="flex items-center gap-2 relative">
                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">Category:</span>
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(prev => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-200/60 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border-none rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer transition-all outline-none"
                  >
                    <span>
                      {postCategory === 'discussion' && 'Discussion'}
                      {postCategory === 'request' && '🏆 Material Request'}
                      {postCategory === 'doubt' && 'Doubt / Question'}
                      {postCategory === 'poll' && 'Poll'}
                      {postCategory === 'question' && 'Exam Prep'}
                      {postCategory === 'resource' && 'Resource'}
                      {postCategory === 'announcement' && 'Announcement'}
                    </span>
                    <ChevronDown size={13} className={`transition-transform duration-200 text-zinc-400 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCategoryDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#141416] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in backdrop-blur-md">
                        {[
                          { id: 'discussion', label: 'Discussion' },
                          { id: 'request', label: 'Material Request', isBounty: true },
                          { id: 'doubt', label: 'Doubt / Question' },
                          { id: 'poll', label: 'Poll' },
                          { id: 'question', label: 'Exam Prep' },
                          { id: 'resource', label: 'Resource' },
                          ...(userProfile?.is_admin ? [{ id: 'announcement', label: 'Announcement' }] : [])
                        ].map((cat) => {
                          const isSelected = postCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setPostCategory(cat.id as any);
                                setShowCategoryDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left border-none cursor-pointer ${
                                isSelected
                                  ? 'bg-zinc-100 dark:bg-white/10 font-bold'
                                  : 'hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                              }`}
                              style={isSelected ? { color: theme.rawColor } : {}}
                            >
                              <span className="flex items-center gap-2">
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: theme.rawColor }} />
                                )}
                                <span>{cat.label}</span>
                              </span>
                              {cat.isBounty && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                                  XP Bounty
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder={postCategory === 'request' ? "Material Request Title (e.g. Need Unit 3 Lecture Notes)*" : "Title of your post..."}
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm sm:text-base font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
                />

                {postCategory === 'request' && (
                  <div className="py-2 px-1 my-1 flex items-center gap-2.5 animate-fade-in border-t border-zinc-200/50 dark:border-white/5 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 shrink-0">
                      <Trophy size={13} />
                      <span>Bounty:</span>
                    </div>

                    {/* Quick XP Preset Chips */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {[25, 50, 100, 200, 500].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setReqBounty(val)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                            reqBounty === val
                              ? 'bg-amber-500/20 text-amber-400 border-amber-400/40 shadow-sm scale-105'
                              : 'bg-zinc-200/60 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-300/60 dark:hover:bg-white/10'
                          }`}
                        >
                          +{val} XP
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-zinc-200/50 dark:border-white/5" />

                <div className="relative pt-2 pb-2">
                  <div
                    ref={createEditorRef}
                    contentEditable
                    data-placeholder={postCategory === 'request' ? "Describe what you need in detail — unit, topic, type of material...*" : "Share detailed context, code, images, equations or ask a doubt...*"}
                    onInput={() => setPostContent(getEditorText(createEditorRef))}
                    onKeyDown={handleEditorKeyDown}
                    className="w-full min-h-[160px] bg-transparent border-none outline-none text-[13px] font-normal text-zinc-800 dark:text-zinc-200 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-400 dark:empty:before:text-zinc-600 empty:before:pointer-events-none wysiwyg-editor"
                    style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                    suppressContentEditableWarning
                  />
                  {renderFloatingLanguageDropdown(createEditorRef)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200/50 dark:border-white/5">
                  <div className="flex items-center gap-0.5 flex-wrap">
                    {renderToolbar(buildToolbarItems(createEditorRef, { full: true }), 'cp')}
                    {imageUploading && <span className="text-[10px] text-zinc-400 ml-2 animate-pulse">Uploading...</span>}
                  </div>

                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setShowCreatePost(false)}
                      className="px-5 py-2 rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/5 bg-transparent border border-zinc-300 dark:border-zinc-700/50 cursor-pointer transition-all outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!postTitle.trim() || !postContent.trim()}
                      style={{
                        backgroundColor: (!postTitle.trim() || !postContent.trim()) ? undefined : theme.rawColor,
                        opacity: (!postTitle.trim() || !postContent.trim()) ? 0.4 : 1
                      }}
                      className={`px-6 py-2 rounded-full text-xs font-bold border-none cursor-pointer transition-all outline-none ${
                        (!postTitle.trim() || !postContent.trim())
                          ? 'bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                          : 'text-white hover:opacity-90 active:scale-95'
                      }`}
                    >
                      {postCategory === 'request' ? 'Post Bounty Request' : 'Publish Post'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

              {/* Feed List */}
              <div className="space-y-3">
                {(() => {
                  const feedItems: Array<{ type: 'discussion' | 'request'; date: number; data: any }> = [];
                  if (socialFilter === 'all' || socialFilter === 'discussions') {
                    discussions.forEach(p => feedItems.push({ type: 'discussion', date: new Date(p.created_at).getTime(), data: p }));
                  }
                  if (socialFilter === 'all' || socialFilter === 'requests') {
                    requests.forEach(r => feedItems.push({ type: 'request', date: new Date(r.created_at).getTime(), data: r }));
                  }
                  feedItems.sort((a, b) => b.date - a.date);

                  if (feedItems.length === 0) {
                    return (
                      <div className="p-8 text-center bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-2xl text-xs text-zinc-400">
                        No activity found in Social tab yet. Be the first to start a post or request material!
                      </div>
                    );
                  }

                  return feedItems.map(item => {
                    if (item.type === 'discussion') {
                      const p = item.data;
                      const helpfulCount = p.reactions?.helpful?.length || 0;
                      const downvoteCount = p.reactions?.quality?.length || 0;
                      const netScore = helpfulCount - downvoteCount;
                      const isHelpful = userProfile ? p.reactions?.helpful?.includes(userProfile.id) : false;
                      const isDownvoted = userProfile ? p.reactions?.quality?.includes(userProfile.id) : false;
                      const commentsCount = p.comments?.length || 0;
                      const timeAgo = (() => {
                        const diff = Date.now() - new Date(p.created_at).getTime();
                        const mins = Math.floor(diff / 60000);
                        if (mins < 60) return `${mins}m ago`;
                        const hrs = Math.floor(mins / 60);
                        if (hrs < 24) return `${hrs}h ago`;
                        const days = Math.floor(hrs / 24);
                        if (days < 30) return `${days}d ago`;
                        return new Date(p.created_at).toLocaleDateString();
                      })();

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPost(p)}
                          className="bg-white dark:bg-[#111113] border border-zinc-200/60 dark:border-white/[0.06] rounded-2xl overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-white/10 cursor-pointer shadow-sm"
                        >
                          <div className="px-4 pt-3.5 pb-1">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2 text-[11px] min-w-0">
                                <img src={p.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-7 h-7 rounded-full flex-shrink-0" />
                                <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{p.user_username}</span>
                                <span className="text-zinc-400 dark:text-zinc-500 font-medium flex-shrink-0">• {timeAgo}</span>
                                {p.is_pinned && (
                                  <span className="flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full text-[9px] flex-shrink-0" style={{ color: theme.rawColor, backgroundColor: `${theme.rawColor}12` }}>
                                    <Pin size={9} /> Pinned
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-[15px] sm:text-base font-extrabold text-zinc-900 dark:text-white leading-snug mb-1.5">
                              {p.title}
                            </h3>

                            {/* Category flair pill */}
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                style={{ 
                                  backgroundColor: p.category === 'announcement' ? '#ff444412' : `${theme.rawColor}12`, 
                                  color: p.category === 'announcement' ? '#ff4444' : theme.rawColor 
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.category === 'announcement' ? '#ff4444' : theme.rawColor }} />
                                {p.category === 'discussion' && 'Discussion'}
                                {p.category === 'doubt' && 'Doubt'}
                                {p.category === 'poll' && 'Poll'}
                                {p.category === 'question' && 'Exam Prep'}
                                {p.category === 'resource' && 'Resource'}
                                {p.category === 'announcement' && '📢 Announcement'}
                              </span>
                            </div>

                            {/* Body text */}
                            <div 
                              className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal mb-3 wysiwyg-content post-collapsed-content" 
                              style={{ lineHeight: '1.7' }}
                              dangerouslySetInnerHTML={{ __html: renderFormattedContent(p.content) }}
                            />
                          </div>

                          {/* Bottom action bar */}
                          <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-0.5">
                            <div className="flex items-center bg-zinc-100 dark:bg-white/[0.06] rounded-full">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReaction(p.id, 'post', 'helpful'); }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all ${
                                  isHelpful
                                    ? 'text-white'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent hover:bg-zinc-200 dark:hover:bg-white/10'
                                }`}
                                style={isHelpful ? { color: theme.rawColor } : undefined}
                              >
                                <ArrowBigUp size={20} fill={isHelpful ? theme.rawColor : 'none'} />
                              </button>
                              <span className={`text-xs font-bold min-w-[20px] text-center ${
                                isHelpful || isDownvoted ? '' : 'text-zinc-600 dark:text-zinc-300'
                              }`} style={isHelpful ? { color: theme.rawColor } : isDownvoted ? { color: '#3b82f6' } : undefined}>
                                {netScore}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReaction(p.id, 'post', 'quality'); }}
                                className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border-none cursor-pointer transition-all ${
                                  isDownvoted
                                    ? 'text-white'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-transparent hover:bg-zinc-200 dark:hover:bg-white/10'
                                }`}
                                style={isDownvoted ? { color: '#3b82f6' } : undefined}
                              >
                                <ArrowBigDown size={20} fill={isDownvoted ? '#3b82f6' : 'none'} />
                              </button>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedPost(p); }}
                              className="flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06] bg-transparent border-none cursor-pointer transition-all"
                            >
                              <MessageSquare size={16} /> {commentsCount}
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      const r = item.data;
                      return (
                        <div key={r.id} className="p-4 sm:p-5 bg-white dark:bg-[#111113] border border-zinc-200/60 dark:border-white/[0.06] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <img src={r.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-6 h-6 rounded-full" />
                              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{r.user_username} requested • {new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white leading-tight flex items-center gap-2">
                              <span>{r.title}</span>
                              <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Trophy size={9} /> Material Request</span>
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="px-3 py-1.5 border rounded-xl text-xs font-semibold" style={{ backgroundColor: `${theme.rawColor}15`, borderColor: `${theme.rawColor}30`, color: theme.rawColor }}>
                              +{r.bounty_xp} XP Bounty
                            </div>

                            {r.status === 'open' ? (
                              <button
                                onClick={() => {
                                  if (!userProfile) {
                                    showToast("Please login to solve requests", "info");
                                    return;
                                  }
                                  onUploadClick();
                                  showToast("Upload the file to this subject folder first to solve!", "info");
                                }}
                                style={{ backgroundColor: theme.rawColor }}
                                className="px-4 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                              >
                                Solve Request
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold">Solved</span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </div>
        </div>
      )}

      {/* 5. STUDY PACKS TAB */}
      {activeTab === 'packs' && (
        <div className="space-y-5 animate-fade-in">
          {showCreatePack ? (
            // ────────────────────────────────────────────────────────
            // INLINE CREATE STUDY PACK VIEW
            // ────────────────────────────────────────────────────────
            <div className="space-y-4">
              {/* Back button */}
              <button 
                type="button"
                onClick={() => setShowCreatePack(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 bg-transparent border border-zinc-200 dark:border-white/10 cursor-pointer transition-all self-start"
              >
                <ArrowLeft size={14} /> Back to Study Packs
              </button>

              <div className="bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/[0.06] rounded-3xl p-6 shadow-sm flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: theme.rawColor }}>
                      {subjectCode.slice(0, 2)}
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{subjectCode}</span>
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full flex items-center gap-1"><BookOpen size={9} /> Study Pack</span>
                  </div>
                </div>

                <form onSubmit={handlePackSubmit} className="flex flex-col pt-4">
                  {/* Title */}
                  <div className="pb-2">
                    <input
                      type="text"
                      value={packTitle}
                      onChange={(e) => setPackTitle(e.target.value)}
                      placeholder="Study Pack Title*"
                      className="w-full bg-transparent border-none outline-none text-lg sm:text-xl font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:ring-0"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="border-t border-zinc-100 dark:border-white/5" />

                  {/* WYSIWYG Description */}
                  <div className="relative pt-4 pb-3">
                    <div
                      ref={packEditorRef}
                      contentEditable
                      data-placeholder="Describe this study pack — what topics it covers, why it's useful...*"
                      onInput={() => setPackContent(getEditorText(packEditorRef))}
                      onKeyDown={handleEditorKeyDown}
                      className="w-full min-h-[120px] bg-transparent border-none outline-none text-[13px] font-normal text-zinc-800 dark:text-zinc-200 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-300 dark:empty:before:text-zinc-600 empty:before:pointer-events-none wysiwyg-editor"
                      style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                      suppressContentEditableWarning
                    />
                    {renderFloatingLanguageDropdown(packEditorRef)}
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="pb-3">
                    <div className="flex items-center gap-0.5 flex-wrap">
                      {renderToolbar(buildToolbarItems(packEditorRef, { full: false }), 'pk')}
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-white/5" />

                  {/* File Picker — YouTube playlist style */}
                  <div className="pt-4 pb-2">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Folder size={11} /> Add files to pack ({packFiles.length} selected)
                      </span>
                    </div>

                    {/* Search bar */}
                    <div className="relative mb-3">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={packFileSearch}
                        onChange={(e) => setPackFileSearch(e.target.value)}
                        placeholder="Search files..."
                        className="w-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/8 rounded-xl pl-8 pr-3 py-2 text-[11px] font-medium outline-none text-zinc-800 dark:text-white placeholder:text-zinc-400"
                      />
                    </div>

                    {/* Selected files pills */}
                    {packFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {packFiles.map(fid => {
                          const f = subjectFiles.find(sf => sf.id === fid);
                          return f ? (
                            <span key={fid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ backgroundColor: `${theme.rawColor}12`, color: theme.rawColor }}>
                              <FileText size={10} />
                              <span className="max-w-[120px] truncate">{f.name}</span>
                              <button
                                type="button"
                                onClick={() => setPackFiles(prev => prev.filter(id => id !== fid))}
                                className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 bg-transparent border-none cursor-pointer text-current text-[9px] font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* File list */}
                    <div className="max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200 dark:border-white/8 bg-zinc-50/50 dark:bg-white/[0.02]">
                      {subjectFiles
                        .filter(f => !packFileSearch || f.name.toLowerCase().includes(packFileSearch.toLowerCase()))
                        .map((f) => {
                          const isSelected = packFiles.includes(f.id);
                          const typeIcon = f.type === 'pdf' ? FileText : f.type === 'video' ? Video : f.type === 'code' ? Code : FileText;
                          const TypeIc = typeIcon;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                setPackFiles(prev =>
                                  prev.includes(f.id)
                                    ? prev.filter(id => id !== f.id)
                                    : [...prev, f.id]
                                );
                              }}
                              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-all border-none cursor-pointer border-b border-zinc-100 dark:border-white/5 last:border-b-0 ${
                                isSelected
                                  ? 'bg-white dark:bg-white/[0.04]'
                                  : 'bg-transparent hover:bg-zinc-100/50 dark:hover:bg-white/[0.03]'
                              }`}
                            >
                              {/* Checkbox */}
                              <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected
                                  ? 'border-transparent'
                                  : 'border-zinc-300 dark:border-zinc-600'
                              }`} style={isSelected ? { backgroundColor: theme.rawColor } : undefined}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>

                              <TypeIc size={14} className="text-zinc-400 flex-shrink-0" />

                              <div className="flex-1 min-w-0">
                                <div className={`text-[11px] font-semibold truncate ${
                                  isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
                                }`}>{f.name}</div>
                                <div className="text-[9px] text-zinc-400 flex items-center gap-2">
                                  <span>{f.type.toUpperCase()}</span>
                                  {f.faculty_name && <><span>·</span><span>{f.faculty_name}</span></>}
                                  <span>·</span>
                                  <span>{f.size}</span>
                                </div>
                              </div>

                              {isSelected && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}>Added</span>
                              )}
                            </button>
                          );
                        })}

                      {subjectFiles.filter(f => !packFileSearch || f.name.toLowerCase().includes(packFileSearch.toLowerCase())).length === 0 && (
                        <div className="px-4 py-6 text-center text-xs text-zinc-400">
                          {packFileSearch ? 'No files match your search' : 'No files available in this subject'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2.5 pt-3.5 border-t border-zinc-100 dark:border-white/5">
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {packFiles.length} file{packFiles.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowCreatePack(false)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 bg-transparent border border-zinc-200 dark:border-white/10 cursor-pointer transition-all outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!packTitle.trim() || !packContent.trim()}
                        style={{
                          backgroundColor: (!packTitle.trim() || !packContent.trim()) ? undefined : theme.rawColor,
                          opacity: (!packTitle.trim() || !packContent.trim()) ? 0.4 : 1
                        }}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold border-none cursor-pointer transition-all outline-none ${
                          (!packTitle.trim() || !packContent.trim())
                            ? 'bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                            : 'text-white hover:opacity-90 active:scale-95'
                        }`}
                      >
                        Create Study Pack
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            // ────────────────────────────────────────────────────────
            // REGULAR STUDY PACKS LIST
            // ────────────────────────────────────────────────────────
            <>
              {/* Reddit-style create pack prompt */}
              <div
                onClick={() => setShowCreatePack(true)}
                className="flex items-center gap-3 p-3 bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/8 rounded-2xl cursor-pointer hover:border-zinc-300 dark:hover:border-white/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.rawColor}15` }}>
                  <BookOpen size={16} style={{ color: theme.rawColor }} />
                </div>
                <div className="flex-1 py-2 px-3 rounded-full bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/8 group-hover:border-zinc-300 dark:group-hover:border-white/15 transition-colors">
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Create a curated study pack...</span>
                </div>
                <div className="px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1" style={{ backgroundColor: `${theme.rawColor}12`, color: theme.rawColor }}>
                  <Folder size={11} /> {subjectFiles.length} files
                </div>
              </div>

              {/* List of Study Packs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studyPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="p-5 bg-white dark:bg-[#121214] border-none rounded-3xl space-y-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                        {pack.title}
                      </div>
                      <div 
                        className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed wysiwyg-content"
                        dangerouslySetInnerHTML={{ __html: renderFormattedContent(pack.content) }}
                      />
                      <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-3">
                        <span>Created by {pack.user_username}</span>
                        <span>•</span>
                        <span>{pack.follower_ids?.length || 0} Followers</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-zinc-100 dark:border-white/5">
                      <button
                        onClick={() => {
                          if (subjectFiles.length > 0) {
                            setSelectedFileDetail(subjectFiles[0]);
                          } else {
                            showToast("Study Pack details loading...", "info");
                          }
                        }}
                        style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 transition-all"
                      >
                        Open Study Pack
                      </button>
                      <button
                        onClick={async () => {
                          if (!userProfile) return;
                          await CommunityService.toggleFollowStudyPack(pack.id, userProfile.id);
                          loadCommunityData();
                        }}
                        className="px-4.5 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-xs font-bold text-zinc-500 border-none cursor-pointer"
                      >
                        Follow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}



      {/* 9. PEOPLE TAB (Faculty, Top Contributors & Moderators) */}
      {(activeTab === 'people' || activeTab === 'leaderboard') && (
        <div className="space-y-6 animate-fade-in">
          {/* Faculty section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Faculty</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const faculties = Array.from(new Set(subjectFiles.map(f => f.faculty_name).filter(Boolean))) as string[];
                if (faculties.length === 0) {
                  return (
                    <div className="col-span-full p-6 bg-zinc-50 dark:bg-white/[0.005] border border-zinc-150 dark:border-white/5 rounded-2xl text-[11px] sm:text-xs text-zinc-400 font-medium text-center">
                      No designated faculty uploaded resources for this subject yet.
                    </div>
                  );
                }
                return faculties.map((f, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-[#0c0c0e] border border-zinc-150 dark:border-white/5 rounded-2xl flex items-center gap-3.5 shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(f || 'Faculty')}`} className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800" />
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{f}</h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-bold">Subject Instructor</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Top Contributors & Moderators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Top Contributors</h3>
              <div className="divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0e]">
                {leaderboardList.length > 0 ? (
                  leaderboardList.map((c, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-zinc-100 dark:bg-white/5 rounded text-zinc-500">{idx + 1}</span>
                        {c.username || 'Anonymous Verto'}
                      </div>
                      <span className="text-xs font-bold" style={{ color: theme.rawColor }}>
                        +{c.total_xp} XP
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-450 dark:text-zinc-500 text-xs">No contributors yet.</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Moderators</h3>
              <div className="divide-y divide-zinc-100 dark:divide-white/5 border border-zinc-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c0e]">
                {moderatorsList.length > 0 ? (
                  moderatorsList.map((m, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" style={{ color: theme.rawColor }} />
                        {m.username || 'Campus Admin'}
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ color: theme.rawColor, backgroundColor: `${theme.rawColor}15` }}>Admin</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-450 dark:text-zinc-500 text-xs">No moderators assigned yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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





      {/* Admin Edit Modal */}
      {showEditModal && selectedFileToEdit && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1000, backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }} onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-150 dark:border-white/5 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-wider">Edit File Metadata</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400">File Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500 dark:text-zinc-400">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400">Category Type</label>
                  <select 
                    value={editForm.type} 
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                  >
                    <option value="Notes">Notes</option>
                    <option value="PYQs">PYQs</option>
                    <option value="Lectures">Lectures</option>
                    <option value="Syllabus">Syllabus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-500 dark:text-zinc-400">Display Order</label>
                  <input 
                    type="number" 
                    value={editForm.display_order} 
                    onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3.5 pt-2">
              <button 
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 border border-zinc-150 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all border-none"
              >
                Save Changes
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

      {/* 4.5 About Subject Modal */}
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
            className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0c] border border-zinc-150 dark:border-white/10 rounded-[36px] p-6 sm:p-8 shadow-2xl space-y-5 z-10 my-8 overflow-hidden max-h-[85vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-4 shrink-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={18} style={{ color: theme.rawColor }} /> About {activeSubject.name}
              </h3>
              <button 
                onClick={() => setShowAboutSubjectModal(false)} 
                className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-xl cursor-pointer font-semibold transition-colors outline-none"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 text-left space-y-4">
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
                <div className="space-y-3.5 pr-2">
                  {parseSimpleMarkdown(aboutSubjectContent)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAboutSubjectModal(false)}
                style={{ backgroundColor: theme.rawColor }}
                className="px-6 py-2.5 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
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
                    const parentCatFolder = categories.find(c => c.id === file.parent_id);
                    setEditForm({
                      name: file.name,
                      description: file.description || '',
                      type: parentCatFolder?.name || 'Notes',
                      display_order: file.display_order || 0
                    });
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
    </div>
  );
};

export default SubjectCommunity;
