import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Users, BookOpen, MessageSquare, HelpCircle, Calendar, Plus,
  Search, Shield, Check, Flame, Trophy, Map, ArrowRight, ArrowLeft,
  Sparkles, Send, Edit, FileText, Download, Award, Code, Database,
  Terminal, Globe, Book, Video, FlaskConical, ClipboardList, Scroll, Folder, MessageCircle, Pin,
  Languages, Bell, BellOff, MoreHorizontal, Cpu, Monitor, Sigma, ChevronDown, ChevronRight, Compass, Landmark
} from 'lucide-react';
import { Folder as FolderType, LibraryFile, UserProfile } from '../types';
import {
  CommunityPost, MaterialRequest, StudyPack, WikiSection, SubjectChatMsg, SubjectStats
} from '../types/communityTypes';
import CommunityService from '../services/communityService';
import NexusServer from '../services/nexusServer';
import { askGeminiText } from '../services/geminiService';
import FileDetailPage from './FileDetailPage';
import { FileIcon } from './FileIcon';
import { showToast } from './Toast';

interface SubjectCommunityProps {
  activeSubject: FolderType;
  activeSemester: FolderType | null;
  selectedProgram: string;
  userProfile: UserProfile | null;
  categories: FolderType[];
  allFiles: LibraryFile[];
  userProgressList?: { document_id: string; progress_percentage: number; last_read_page: number }[];
  onFileAccess: (file: LibraryFile) => void;
  onUploadClick: () => void;
  onBack: () => void;
  searchQuery?: string;
  onRefresh?: () => void;
}

const getSubjectTheme = (nameOrCode: string, folderColor?: string, folderIcon?: string) => {
  const c = nameOrCode.toUpperCase().trim();
  
  // Resolve raw color
  const rawColor = folderColor || '#ff7a00';
  
  // Resolve icon component
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

  const icon = folderIcon && IconMap[folderIcon] ? IconMap[folderIcon] : null;

  // If custom color and icon are present, return custom theme properties
  if (folderColor || icon) {
    return {
      text: `text-[${rawColor}]`,
      bg: `bg-[${rawColor}]`,
      lightBg: `${rawColor}10`,
      border: `border-[${rawColor}]/20`,
      gradient: `from-[${rawColor}] to-[${rawColor}]`,
      icon: icon || <Folder className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: rawColor
    };
  }

  // 1. Math / Calculus subjects
  if (c.includes('MTH') || c.includes('MATH') || c.includes('CALCULUS') || c.includes('STATISTICS')) {
    return {
      text: 'text-emerald-500',
      bg: 'bg-emerald-500',
      lightBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
      border: 'border-emerald-500/20',
      gradient: 'from-emerald-500 to-teal-500',
      icon: <Sigma className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#22c55e'
    };
  }

  // 2. Coding / Programming / Development / Web labs
  if (
    c.includes('PROGRAMMING') || 
    c.includes('PYTHON') || 
    c.includes('CSE101') || 
    c.includes('CSE326') || 
    c.includes('INT108') || 
    c.includes('JAVA') || 
    c.includes('CPP') || 
    c.includes('DEVELOPMENT') || 
    c.includes('WEB')
  ) {
    return {
      text: 'text-orange-500',
      bg: 'bg-orange-500',
      lightBg: 'bg-orange-500/10 dark:bg-orange-500/10',
      border: 'border-orange-500/20',
      gradient: 'from-orange-500 to-amber-500',
      icon: <Code className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ff7a00'
    };
  }

  // 3. Electrical / Electronics / Hardware subjects
  if (
    c.includes('ECE') || 
    c.includes('EEE') || 
    c.includes('ELECTRICAL') || 
    c.includes('ELECTRONICS') || 
    c.includes('HARDWARE') || 
    c.includes('DIGITAL ELECTRONICS')
  ) {
    return {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      lightBg: 'bg-blue-500/10 dark:bg-blue-500/10',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500 to-indigo-500',
      icon: <Cpu className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#0ea5e9'
    };
  }

  // 4. Other CSE Theory / Computing / Systems / Architecture
  if (
    c.includes('CSE') || 
    c.includes('COMPUTING') || 
    c.includes('ORIENTATION') || 
    c.includes('INT') || 
    c.includes('CAP') ||
    c.includes('OPERATING') ||
    c.includes('NETWORKS') ||
    c.includes('SECURITY')
  ) {
    return {
      text: 'text-teal-500',
      bg: 'bg-teal-500',
      lightBg: 'bg-teal-500/10 dark:bg-teal-500/10',
      border: 'border-teal-500/20',
      gradient: 'from-teal-500 to-emerald-500',
      icon: <Monitor className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#14b8a6'
    };
  }

  // 5. Database / DBMS subjects
  if (c.includes('DATABASE') || c.includes('DBMS') || c.includes('SQL')) {
    return {
      text: 'text-purple-500',
      bg: 'bg-purple-500',
      lightBg: 'bg-purple-500/10 dark:bg-purple-500/10',
      border: 'border-purple-500/20',
      gradient: 'from-purple-500 to-pink-500',
      icon: <Database className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#a855f7'
    };
  }

  // 6. Languages / Communication / Soft Skills
  if (
    c.includes('FRN') || 
    c.includes('GER') || 
    c.includes('JAP') || 
    c.includes('SPA') || 
    c.includes('FRENCH') || 
    c.includes('GERMAN') || 
    c.includes('JAPANESE') || 
    c.includes('SPANISH') || 
    c.includes('LANG') ||
    c.includes('COMMUNICATION') ||
    c.includes('COMM') ||
    c.includes('PEL')
  ) {
    return {
      text: 'text-pink-500',
      bg: 'bg-pink-500',
      lightBg: 'bg-pink-500/10 dark:bg-pink-500/10',
      border: 'border-pink-500/20',
      gradient: 'from-pink-500 to-rose-500',
      icon: <Languages className="w-5 h-5 text-white" strokeWidth={3} />,
      rawColor: '#ec4899'
    };
  }

  // 7. General Fallback
  return {
    text: 'text-indigo-500',
    bg: 'bg-indigo-500',
    lightBg: 'bg-indigo-500/10 dark:bg-indigo-500/10',
    border: 'border-indigo-500/20',
    gradient: 'from-indigo-500 to-purple-500',
    icon: <Globe className="w-5 h-5 text-white" strokeWidth={3} />,
    rawColor: '#6366f1'
  };
};

const getCategoryMetadata = (catName: string) => {
  const n = catName.toLowerCase().trim();
  if (n.includes('note')) {
    return {
      description: "All handwritten & digital notes",
      color: "#3b82f6",
      lightColorBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
      gradientBgClass: "from-blue-500/10 dark:from-blue-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-blue-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(59,130,246,0.06)] hover:-translate-y-0.5",
      iconColor: "text-blue-500 dark:text-blue-400",
      progressRingColor: "stroke-blue-500 dark:stroke-blue-400",
      icon: (
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
      color: "#a855f7",
      lightColorBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      gradientBgClass: "from-purple-500/10 dark:from-purple-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-purple-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(168,85,247,0.06)] hover:-translate-y-0.5",
      iconColor: "text-purple-500 dark:text-purple-400",
      progressRingColor: "stroke-purple-500 dark:stroke-purple-400",
      icon: (
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
      color: "#ef4444",
      lightColorBg: "bg-red-500/10 text-red-500 dark:text-red-400",
      gradientBgClass: "from-red-500/10 dark:from-red-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-red-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(239,68,68,0.06)] hover:-translate-y-0.5",
      iconColor: "text-red-500 dark:text-red-400",
      progressRingColor: "stroke-red-500 dark:stroke-red-400",
      icon: (
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
      color: "#4b5563",
      lightColorBg: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
      gradientBgClass: "from-zinc-500/10 dark:from-zinc-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-zinc-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(107,114,128,0.06)] hover:-translate-y-0.5",
      iconColor: "text-zinc-550 dark:text-zinc-400",
      progressRingColor: "stroke-zinc-500 dark:stroke-zinc-400",
      icon: (
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
      color: "#f97316",
      lightColorBg: "bg-orange-500/10 text-orange-500 dark:text-orange-400",
      gradientBgClass: "from-orange-500/10 dark:from-orange-500/15 to-transparent",
      borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-orange-500/20",
      glowShadowClass: "hover:shadow-[0_12px_30px_rgba(249,115,22,0.06)] hover:-translate-y-0.5",
      iconColor: "text-orange-500 dark:text-orange-400",
      progressRingColor: "stroke-orange-500 dark:stroke-orange-400",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 text-current shrink-0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12" />
          <path d="M9 3v8L4.3 19.3A2 2 0 0 0 6 22h12a2 2 0 0 0 1.7-2.7L15 11V3" />
        </svg>
      )
    };
  }
  return {
    description: "Reference books & materials",
    color: "#22c55e",
    lightColorBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    gradientBgClass: "from-emerald-500/10 dark:from-emerald-500/15 to-transparent",
    borderClass: "border-zinc-150 dark:border-white/[0.04] hover:border-emerald-500/20",
    glowShadowClass: "hover:shadow-[0_12px_30px_rgba(34,197,94,0.06)] hover:-translate-y-0.5",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    progressRingColor: "stroke-emerald-500 dark:stroke-emerald-400",
    icon: (
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

const SubjectCommunity: React.FC<SubjectCommunityProps> = ({
  activeSubject,
  activeSemester,
  selectedProgram,
  userProfile,
  categories,
  allFiles,
  userProgressList,
  onFileAccess,
  onUploadClick,
  onBack,
  searchQuery,
  onRefresh
}) => {
  const subjectCodeMatch = activeSubject.name.match(/^([A-Za-z]+\d{3})/);
  const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toUpperCase() : activeSubject.name.split(':')[0].trim();
  const subjectName = activeSubject.name.split(':')[1]?.trim() || activeSubject.name;

  const theme = useMemo(() => getSubjectTheme(activeSubject.name, activeSubject.color, activeSubject.icon_name), [activeSubject.name, activeSubject.color, activeSubject.icon_name]);

  const isIITM = selectedProgram.toLowerCase().replace(/[^a-z0-9]/g, '') === 'bsdatascience';

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'files' | 'discussions' | 'requests' | 'packs' | 'leaderboard' | 'people'>('files');
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
  const [expandedPostCommentsId, setExpandedPostCommentsId] = useState<string | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [pinningPostId, setPinningPostId] = useState<string | null>(null);

  // Post editing & options states
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);

  // Forms
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<'discussion' | 'doubt' | 'poll' | 'question' | 'resource'>('discussion');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

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

  // Robust subject code extractor
  const getSubjectCode = (nameOrCode: string) => {
    const match = nameOrCode.match(/([A-Za-z]+[0-9]+)/);
    return match ? match[1].toUpperCase() : nameOrCode.split(':')[0].trim().toUpperCase().replace(/\s+/g, '');
  };

  // Robust file-type to category name matcher
  const isFileTypeMatchingCategory = (fileType: string, catName: string) => {
    const ft = fileType.toLowerCase().trim();
    const cn = catName.toLowerCase().trim();
    
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
      return ft.includes('lab') || ft.includes('manual') || ft.includes('practical') || ft.includes('file');
    }
    
    if (cn.includes('book') || cn.includes('textbook')) {
      return ft.includes('book') || ft.includes('material');
    }
    return ft === cn || ft.includes(cn) || cn.includes(ft);
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

  const recentFiles = useMemo(() => {
    return [...subjectFiles]
      .sort((a, b) => b.uploadDate - a.uploadDate)
      .slice(0, 5);
  }, [subjectFiles]);

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
      const { error } = await client
        .from('library_items')
        .update({
          name: editForm.name,
          description: editForm.description,
          type: editForm.type,
          display_order: editForm.display_order,
          updated_at: new Date().toISOString()
        })
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

  useEffect(() => {
    const handleDocClick = () => setActiveMenuFileId(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

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
    try {
      await CommunityService.toggleReaction(itemId, type, reaction, userProfile.id);
      loadCommunityData();
    } catch (e) { }
  };

  // Submit Post
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!postTitle.trim() || !postContent.trim()) return;

    try {
      const cleanTags = postTags.split(',').map(t => t.trim()).filter(t => t.startsWith('#') ? t : `#${t}`);
      await CommunityService.createPost({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'post',
        category: postCategory,
        title: postTitle.trim(),
        content: postContent.trim(),
        tags: cleanTags,
        verified_status: 'none'
      });
      setPostTitle('');
      setPostContent('');
      setPostTags('');
      setShowCreatePost(false);
      loadCommunityData();
      showToast("Post created!", "success");
    } catch (e) {
      showToast("Failed to create post", "error");
    }
  };

  // Submit Request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!reqTitle.trim() || !reqContent.trim()) return;

    try {
      await CommunityService.createMaterialRequest({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'request',
        title: reqTitle.trim(),
        content: reqContent.trim(),
        bounty_xp: Number(reqBounty)
      });
      setReqTitle('');
      setReqContent('');
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
    if (!packTitle.trim() || !packContent.trim()) return;

    try {
      await CommunityService.createStudyPack({
        subject_id: subjectCode,
        user_id: userProfile.id,
        user_username: userProfile.username || 'Anonymous',
        user_avatar: userProfile.avatar_url,
        type: 'collection',
        title: packTitle.trim(),
        content: packContent.trim(),
        file_ids: []
      });
      setPackTitle('');
      setPackContent('');
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

  // Filtered files in selected category folder
  const categoryFiles = useMemo(() => {
    if (!activeCategoryFolder) return [];
    return subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, activeCategoryFolder.name));
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
    const catMeta = getCategoryMetadata(activeCategoryFolder.name);
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

        {/* Category Header Banner Box */}
        <div className="relative overflow-visible bg-transparent sm:bg-gradient-to-br sm:from-zinc-50 sm:to-zinc-100/50 sm:dark:from-white/[0.01] sm:dark:to-transparent border-0 sm:border border-zinc-150 dark:border-white/5 rounded-none sm:rounded-3xl p-0 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-6 shadow-none sm:shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full pointer-events-none hidden sm:block" style={{ backgroundColor: theme.rawColor }} />

          {/* Category Logo & Info */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div 
              className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-white/20 dark:border-white/10 overflow-hidden backdrop-blur-md ${catMeta.lightColorBg}`}
            >
              {React.cloneElement(catMeta.icon as React.ReactElement, { className: `w-5 h-5 sm:w-6.5 sm:h-6.5 ${catMeta.iconColor}` })}
            </div>
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black text-white capitalize" style={{ backgroundColor: theme.rawColor }}>
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
                onClick={onUploadClick}
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
                  onClick={onUploadClick}
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
                        const realNameWithExt = file.name;
                        const ext = file.storage_path ? file.storage_path.split('.').pop()?.toLowerCase() || '' : '';
                        const cleanName = realNameWithExt.replace(/\.[^/.]+$/, "");

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
                                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
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
                  const cleanName = realNameWithExt.replace(/\.[^/.]+$/, "");

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
                  const unitMatch = file.name.match(/Unit\s*(\d+)/i) || (file.description && file.description.match(/Unit\s*(\d+)/i));

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
                              {unitMatch && (
                                <span className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded text-[8px] font-bold text-zinc-500 dark:text-zinc-400">
                                  Unit {unitMatch[1]}
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
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
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
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 bg-transparent border-none cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} /> Back to Semesters
          </button>
        </div>

        {/* Subject Header Banner Box */}
        <div className="relative overflow-visible bg-transparent sm:bg-gradient-to-br sm:from-zinc-50 sm:to-zinc-100/50 sm:dark:from-white/[0.01] sm:dark:to-transparent border-0 sm:border border-zinc-150 dark:border-white/5 rounded-none sm:rounded-3xl p-0 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-6 shadow-none sm:shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full pointer-events-none hidden sm:block" style={{ backgroundColor: theme.rawColor }} />

          {/* Course Logo & Info */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm shrink-0 text-white" style={{ backgroundColor: theme.rawColor }}>
              {React.cloneElement(theme.icon as React.ReactElement, { className: 'w-5 h-5 sm:w-6.5 sm:h-6.5 text-white' })}
            </div>
            <div className="min-w-0 space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black text-white" style={{ backgroundColor: theme.rawColor }}>
                  {subjectCode}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                  {onlineCount} studying now
                </span>
              </div>
              <h2 className="text-sm xs:text-base md:text-lg lg:text-xl font-black text-zinc-900 dark:text-white leading-tight truncate">
                {subjectName}
              </h2>
            </div>
          </div>

          {/* Notifications & Options Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleJoinToggle}
              title={joined ? "Notifications are ON" : "Notifications are OFF"}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none bg-transparent sm:hover:bg-zinc-100 sm:dark:hover:bg-white/5 outline-none text-zinc-500 dark:text-zinc-400 active:scale-95 shrink-0"
            >
              {joined ? (
                <Bell className="w-5 h-5" strokeWidth={2.5} style={{ color: theme.rawColor }} />
              ) : (
                <BellOff className="w-5 h-5" strokeWidth={2.5} />
              )}
            </button>
            
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
          { id: 'discussions', label: 'Discussions', icon: <MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'requests', label: 'Requests', icon: <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'packs', label: 'Study Packs', icon: <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5 text-zinc-500" /> },
          { id: 'people', label: 'People', icon: <Users className="w-3.5 h-3.5 text-zinc-500" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setActiveCategoryFolder(null); }}
            style={activeTab === tab.id ? { borderColor: theme.rawColor, color: theme.rawColor } : {}}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 bg-transparent cursor-pointer shrink-0 transition-all flex items-center gap-1.5 ${activeTab === tab.id
                ? 'font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
          >
            {tab.icon}
            {tab.id === 'files' && stats ? `Files (${stats.filesCount})` :
              tab.id === 'requests' && stats ? `Requests (${stats.requestsCount})` : tab.label}
          </button>
        ))}
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
              {/* Continue Studying Card */}
              {userProfile && continueStudyingFile && (
                <div className="p-4 bg-zinc-100/50 dark:bg-[#161619]/90 border border-zinc-200 dark:border-white/5 rounded-2xl flex flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.rawColor }}>
                      {continueStudyingFile.percent === 0 ? "Start Studying" : continueStudyingFile.percent === 100 ? "Completed Studying" : "Continue Studying"}
                    </div>
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{continueStudyingFile.doc.name}</div>
                    <div className="w-24 xs:w-48 bg-zinc-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full rounded-full" style={{ width: `${continueStudyingFile.percent}%`, backgroundColor: theme.rawColor }} />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onFileAccess(continueStudyingFile.doc);
                    }}
                    style={{ backgroundColor: theme.rawColor }}
                    className="px-3 py-1.5 xs:px-4 xs:py-2 text-white rounded-xl text-xs font-bold border-none flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shrink-0"
                  >
                    {continueStudyingFile.percent === 0 ? "Start" : continueStudyingFile.percent === 100 ? "Review (100%)" : `Resume (${continueStudyingFile.percent}%)`} <ArrowRight size={12} />
                  </button>
                </div>
              )}

              <div className="space-y-4 animate-fade-in">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" /> Study Sections</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categories
                    .filter(cat => {
                      if (!searchQuery || searchQuery.trim() === '') return true;
                      const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, cat.name));
                      const nameMatches = cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
                      return filesInCat.length > 0 || nameMatches;
                    })
                    .map((cat) => {
                      const filesInCat = subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, cat.name));
                      const meta = getCategoryMetadata(cat.name);
                      
                      const progressList = userProgressList || [];
                      const totalPercent = filesInCat.reduce((sum, file) => {
                        const prog = progressList.find(p => p.document_id === file.id);
                        return sum + (prog ? prog.progress_percentage : 0);
                      }, 0);
                      const averagePercent = filesInCat.length > 0 ? Math.round(totalPercent / filesInCat.length) : 0;
                      
                      const strokeDasharray = 2 * Math.PI * 16;
                      const strokeDashoffset = strokeDasharray - (averagePercent / 100) * strokeDasharray;

                      const latestFile = filesInCat.length > 0 
                        ? [...filesInCat].sort((a, b) => {
                            const aTime = a.uploadDate || (a.created_at ? Date.parse(a.created_at) : 0);
                            const bTime = b.uploadDate || (b.created_at ? Date.parse(b.created_at) : 0);
                            return bTime - aTime;
                          })[0]
                        : null;
                      const latestFileRelativeTime = latestFile
                        ? getRelativeTime(latestFile.uploadDate || (latestFile.created_at ? Date.parse(latestFile.created_at) : Date.now()))
                        : '';

                      return (
                        <div
                          key={cat.id}
                          onClick={() => setActiveCategoryFolder(cat)}
                          className={`group relative overflow-hidden rounded-[24px] flex flex-col justify-between cursor-pointer transition-all duration-300 border ${meta.borderClass} bg-white dark:bg-[#0a0a0b] ${meta.glowShadowClass}`}
                        >
                          {/* Colored Background Gradient Overlay */}
                          <div className={`absolute inset-0 opacity-[0.8] dark:opacity-[0.9] group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${meta.gradientBgClass} z-0 pointer-events-none`} />

                          {/* Top Left Radial Glossy Highlight */}
                          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 dark:bg-white/[0.02] blur-[40px] rounded-full pointer-events-none z-0" />

                          {/* Giant faint background icon on bottom right */}
                          <div className={`absolute -bottom-4 -right-4 ${meta.iconColor} opacity-[0.03] dark:opacity-[0.06] transform transition-all duration-700 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1 pointer-events-none z-0`}>
                            {React.cloneElement(meta.icon, { className: "w-24 h-24 text-current" })}
                          </div>

                          {/* Inner card padding content */}
                          <div className="p-4 flex items-start gap-3.5 flex-1 min-w-0 relative z-10">
                            {/* Left Column: Glassmorphic colored icon container */}
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/20 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden backdrop-blur-md ${meta.lightColorBg}`}>
                              {React.cloneElement(meta.icon, { className: `w-5.5 h-5.5 ${meta.iconColor}` })}
                            </div>

                            {/* Right Column: Title, description, resources count and progress ring */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                              <div className="flex items-start justify-between gap-2 w-full">
                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white capitalize truncate tracking-wide group-hover:text-brand-primary transition-colors duration-300">
                                    {cat.name}
                                  </h4>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold line-clamp-1 mt-0.5">
                                    {meta.description}
                                  </p>
                                </div>

                                {/* circular progress ring */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <div className="relative w-9 h-9 flex items-center justify-center">
                                    <svg className="w-9 h-9 -rotate-90">
                                      <circle cx="18" cy="18" r="14" className="stroke-zinc-100 dark:stroke-white/5" strokeWidth="2.5" fill="transparent" />
                                      <circle 
                                        cx="18" 
                                        cy="18" 
                                        r="14" 
                                        className={meta.progressRingColor} 
                                        strokeWidth="2.5" 
                                        fill="transparent" 
                                        strokeDasharray={2 * Math.PI * 14} 
                                        strokeDashoffset={2 * Math.PI * 14 - (averagePercent / 100) * (2 * Math.PI * 14)} 
                                        strokeLinecap="round" 
                                      />
                                    </svg>
                                    <span className="absolute text-[9px] font-black text-zinc-800 dark:text-zinc-200">{averagePercent}%</span>
                                  </div>
                                  
                                  {/* Right Chevron arrow */}
                                  <ChevronRight size={14} className="text-zinc-400 dark:text-zinc-650 group-hover:text-brand-primary transition-colors shrink-0" />
                                </div>
                              </div>

                              {/* Resources count with file prefix */}
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-2">
                                <FileText className="w-3.5 h-3.5 opacity-80" />
                                <span>{filesInCat.length} Resources</span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom strip: Latest file uploaded info */}
                          <div className="w-full bg-zinc-50/40 dark:bg-black/20 px-4 py-2 border-t border-zinc-100 dark:border-white/[0.04] flex items-center justify-between gap-2 text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold hover:bg-zinc-100/50 dark:hover:bg-black/30 transition-all shrink-0 relative z-10">
                            <span className="truncate max-w-[85%]">
                              {latestFile ? (
                                <>
                                  Latest: <span className="font-bold text-zinc-800 dark:text-zinc-200">{latestFile.name}</span> uploaded {latestFileRelativeTime}
                                </>
                              ) : (
                                "No resources uploaded yet"
                              )}
                            </span>
                          </div>
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
                    <div className="hidden sm:block overflow-x-auto no-scrollbar border border-zinc-150 dark:border-white/5 rounded-2xl bg-white dark:bg-[#111113]">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-white/5 text-[10px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-white/[0.005]">
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Added By</th>
                            <th className="py-3 px-4">Added On</th>
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
                            className="p-4 bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-2xl flex flex-col gap-3 relative hover:border-zinc-200 dark:hover:border-white/10 transition-all cursor-pointer"
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
                    onClick={onUploadClick}
                    style={{ backgroundColor: theme.rawColor }}
                    className="px-3.5 py-1.5 text-white rounded-xl text-xs font-bold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Upload File
                  </button>
                )}
              </div>

              {(() => {
                const categoryFiles = subjectFiles.filter(f => isFileTypeMatchingCategory(f.type, activeCategoryFolder.name));
                if (categoryFiles.length === 0) {
                  return (
                    <div className="text-center py-10 bg-zinc-50/50 dark:bg-white/[0.005] border border-dashed border-zinc-250 dark:border-white/5 rounded-3xl space-y-4">
                      <div className="space-y-1">
                        <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                        <p className="text-xs text-zinc-400">No resources uploaded in this section yet.</p>
                      </div>
                      {userProfile?.is_admin && (
                        <button
                          onClick={onUploadClick}
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
                              const cleanName = realNameWithExt.replace(/\.[^/.]+$/, ""); // Strip extension for clean text

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

                                  {/* Added By column */}
                                  <td className="py-3.5 px-3 hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5.5 h-5.5 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 shrink-0">
                                        <img 
                                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
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
                        const cleanName = realNameWithExt.replace(/\.[^/.]+$/, "");

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
                        const unitMatch = file.name.match(/Unit\s*(\d+)/i) || (file.description && file.description.match(/Unit\s*(\d+)/i));

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
                                    {unitMatch && (
                                      <span className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-white/5 rounded text-[8px] font-bold text-zinc-500 dark:text-zinc-400">
                                        Unit {unitMatch[1]}
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
                                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`} 
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



      {/* 3. DISCUSSIONS TAB */}
      {activeTab === 'discussions' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Discussions</h3>
            <button
              onClick={() => setShowCreatePost(true)}
              style={{ backgroundColor: theme.rawColor }}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Create Post
            </button>
          </div>



          {/* List of discussions */}
          <div className="space-y-4">
            {discussions.map((p) => {
              const reactionsCount = (p.reactions.helpful?.length || 0) + (p.reactions.quality?.length || 0) + (p.reactions.important?.length || 0);
              return (
                <div
                  key={p.id}
                  className="p-5 bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-3xl space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between relative">
                    <div className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <img src={p.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-6 h-6 rounded-full" />
                      {p.user_username} • <span className="text-zinc-400 font-normal">{new Date(p.created_at).toLocaleDateString()}</span>
                      {p.is_pinned && (
                        <span className="flex items-center gap-0.5 text-orange-500 font-bold bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 rounded-lg text-[8px]">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}>
                        {p.category}
                      </span>

                      {/* Three-dot dropdown menu */}
                      {(userProfile?.is_admin || userProfile?.id === p.user_id) && (
                        <div className="relative flex items-center">
                          <button
                            onClick={() => setActivePostMenuId(activePostMenuId === p.id ? null : p.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 bg-transparent border-none cursor-pointer transition-colors rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activePostMenuId === p.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActivePostMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/5 rounded-xl shadow-lg py-1 z-20 text-[10px] font-bold">
                                {userProfile?.is_admin && (
                                  <button
                                    onClick={async () => {
                                      setActivePostMenuId(null);
                                      setPinningPostId(p.id);
                                      const nextPinStatus = !p.is_pinned;
                                      const ok = await CommunityService.updatePostPinStatus(p.id, nextPinStatus);
                                      if (ok) {
                                        setDiscussions(prev => {
                                          const updated = prev.map(post => post.id === p.id ? { ...post, is_pinned: nextPinStatus } : post);
                                          return [...updated].sort((a, b) => {
                                            const pinA = a.is_pinned ? 1 : 0;
                                            const pinB = b.is_pinned ? 1 : 0;
                                            if (pinA !== pinB) return pinB - pinA;
                                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                          });
                                        });
                                        showToast(nextPinStatus ? "Post pinned!" : "Post unpinned!", "success");
                                      } else {
                                        showToast("Failed to update pin status", "error");
                                      }
                                      setPinningPostId(null);
                                    }}
                                    disabled={pinningPostId === p.id}
                                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 border-none bg-transparent cursor-pointer font-bold"
                                  >
                                    {p.is_pinned ? "Unpin Post" : "Pin Post"}
                                  </button>
                                )}

                                {userProfile?.id === p.user_id && (
                                  <button
                                    onClick={() => {
                                      setActivePostMenuId(null);
                                      setEditingPost(p);
                                      setEditPostTitle(p.title);
                                      setEditPostContent(p.content);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 border-none bg-transparent cursor-pointer font-bold"
                                  >
                                    Edit Post
                                  </button>
                                )}

                                <button
                                  onClick={async () => {
                                    if (confirm("Are you sure you want to delete this post?")) {
                                      setActivePostMenuId(null);
                                      const ok = await CommunityService.deletePost(p.id);
                                      if (ok) {
                                        setDiscussions(prev => prev.filter(post => post.id !== p.id));
                                        showToast("Post deleted successfully", "success");
                                      } else {
                                        showToast("Failed to delete post", "error");
                                      }
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 text-red-500 border-none bg-transparent cursor-pointer font-bold"
                                >
                                  Delete Post
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                    {p.title}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {p.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.2 bg-zinc-50 dark:bg-white/5 border border-zinc-150/50 dark:border-white/5 rounded text-[8px] font-semibold text-zinc-400">{t}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-zinc-100 dark:border-white/5 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReaction(p.id, 'post', 'helpful')}
                        className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-150/50 dark:border-white/5 hover:border-blue-500/20 text-[10px] rounded-lg font-bold text-zinc-500 flex items-center gap-1 cursor-pointer"
                      >
                        👍 Helpful ({p.reactions.helpful?.length || 0})
                      </button>
                    </div>
                    <button
                      onClick={() => setExpandedPostCommentsId(expandedPostCommentsId === p.id ? null : p.id)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition-all p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5"
                    >
                      <MessageSquare size={12} /> {p.comments?.length || 0} Comments
                    </button>
                  </div>

                  {/* Expanded Comments Box */}
                  {expandedPostCommentsId === p.id && (
                    <div className="space-y-3.5 mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 pl-2 sm:pl-4">
                      {p.comments && p.comments.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                          {p.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start text-xs animate-fade-in">
                              <img src={comment.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-white/[0.015] p-2.5 rounded-2xl border border-zinc-150 dark:border-white/5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{comment.username}</span>
                                  <span className="text-[9px] text-zinc-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-zinc-400 italic">No comments yet. Start the conversation!</div>
                      )}

                      {/* Add Comment Input Form */}
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!userProfile) {
                            showToast("Please login to post a comment.", "info");
                            return;
                          }
                          const text = newCommentTexts[p.id] || '';
                          if (!text.trim()) return;

                          setSubmittingCommentId(p.id);
                          try {
                            const added = await CommunityService.addCommentToItem(p.id, 'post', {
                              user_id: userProfile.id,
                              username: userProfile.username,
                              avatar_url: userProfile.avatar_url || '',
                              content: text.trim()
                            });

                            // Update state locally
                            setDiscussions(prev => prev.map(post => {
                              if (post.id === p.id) {
                                return { ...post, comments: [...(post.comments || []), added] };
                              }
                              return post;
                            }));

                            setNewCommentTexts(prev => ({ ...prev, [p.id]: '' }));
                            showToast("Comment posted!", "success");
                          } catch (err) {
                            showToast("Failed to post comment", "error");
                          } finally {
                            setSubmittingCommentId(null);
                          }
                        }}
                        className="flex gap-2.5 items-center mt-3"
                      >
                        <img src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-5 h-5 rounded-full shrink-0" />
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newCommentTexts[p.id] || ''}
                          onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="flex-1 min-w-0 bg-zinc-50 dark:bg-[#121214] border border-zinc-150 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
                          disabled={submittingCommentId === p.id}
                        />
                        <button
                          type="submit"
                          style={{ backgroundColor: theme.rawColor }}
                          className="px-3.5 py-1.5 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 transition-all shrink-0 flex items-center justify-center min-w-[50px]"
                          disabled={submittingCommentId === p.id}
                        >
                          {submittingCommentId === p.id ? "..." : "Reply"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Open Study Material Bounties</h3>
            <button
              onClick={() => setShowCreateRequest(true)}
              style={{ backgroundColor: theme.rawColor }}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Request Material
            </button>
          </div>



          {/* Requests list */}
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="p-5 bg-white dark:bg-[#111113] border border-zinc-150 dark:border-white/5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={r.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} className="w-6 h-6 rounded-full" />
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{r.user_username} asked {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                    {r.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {r.content}
                  </p>
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
                        // Fire file uploader
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
            ))}
          </div>
        </div>
      )}

      {/* 5. STUDY PACKS TAB */}
      {activeTab === 'packs' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Curated Student Study Packs</h3>
            <button
              onClick={() => setShowCreatePack(true)}
              style={{ backgroundColor: theme.rawColor }}
              className="px-3.5 py-2 text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Create Study Pack
            </button>
          </div>

          {/* List of Study Packs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studyPacks.map((pack) => (
              <div
                key={pack.id}
                className="p-5 bg-white dark:bg-[#121214] border border-zinc-150 dark:border-white/5 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="text-xs font-black text-zinc-950 dark:text-white leading-tight">
                    {pack.title}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {pack.content}
                  </p>
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
        </div>
      )}



      {/* 7. LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="max-w-xl mx-auto bg-gradient-to-br from-white to-zinc-50/50 dark:from-[#121214] dark:to-[#0c0c0e] border border-zinc-150 dark:border-white/5 rounded-3xl p-5 md:p-6 space-y-6 shadow-sm animate-fade-in">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Subject Leaders (All-Time)
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">Top contributors by study XP earned in {subjectCode}</p>
          </div>

          <div className="space-y-3.5 pt-3">
            {leaderboardList.length > 0 ? (
              leaderboardList.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4 bg-zinc-50/30 dark:bg-white/[0.02] border border-zinc-150/40 dark:border-white/5 p-3.5 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] transition-all duration-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: `${theme.rawColor}15`, color: theme.rawColor }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">{s.username || 'Anonymous Verto'}</div>
                      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {s.level_title || 'Scholar'} • Lv.{s.level || 1}
                        {s.files_count !== undefined && (
                          <span className="ml-1.5 opacity-80">
                            • {s.files_count} {s.files_count === 1 ? 'file' : 'files'} • {s.posts_count} {s.posts_count === 1 ? 'post' : 'posts'} • {s.requests_count} {s.requests_count === 1 ? 'request' : 'requests'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-bold" style={{ color: theme.rawColor }}>
                    +{s.total_xp} XP
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-450 dark:text-zinc-500 text-xs">No contributors on the leaderboard yet.</div>
            )}
          </div>
        </div>
      )}



      {/* 9. PEOPLE TAB */}
      {activeTab === 'people' && (
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
                  leaderboardList.slice(0, 3).map((c, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-zinc-100 dark:bg-white/5 rounded text-zinc-500">{idx + 1}</span>
                        {c.username || 'Anonymous Verto'}
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ color: theme.rawColor, backgroundColor: `${theme.rawColor}15` }}>{c.level_title || 'Scholar'}</span>
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

      {createPortal(
        <AnimatePresence>
          {showCreatePost && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreatePost(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Plus size={18} style={{ color: theme.rawColor }} /> Create New Post
                  </h3>
                  <button onClick={() => setShowCreatePost(false)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Title</label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Enter post title..."
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Category</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span>
                            {postCategory === 'discussion' && 'General Discussion'}
                            {postCategory === 'doubt' && 'Doubt / Question'}
                            {postCategory === 'poll' && 'Poll'}
                            {postCategory === 'question' && 'Midterm/Exam Prep'}
                            {postCategory === 'resource' && 'Reference resource'}
                          </span>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showCategoryDropdown && (
                          <>
                            {/* Overlay to close the dropdown when clicking outside */}
                            <div className="fixed inset-0 z-30" onClick={() => setShowCategoryDropdown(false)} />
                            <div className="absolute left-0 right-0 z-40 mt-1.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                              {[
                                { value: 'discussion', label: 'General Discussion' },
                                { value: 'doubt', label: 'Doubt / Question' },
                                { value: 'poll', label: 'Poll' },
                                { value: 'question', label: 'Midterm/Exam Prep' },
                                { value: 'resource', label: 'Reference resource' }
                              ].map((opt) => {
                                const isSelected = postCategory === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setPostCategory(opt.value as any);
                                      setShowCategoryDropdown(false);
                                    }}
                                    style={isSelected ? {
                                      backgroundColor: `${theme.rawColor}12`,
                                      color: theme.rawColor
                                    } : undefined}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all border-none bg-transparent cursor-pointer flex items-center justify-between ${
                                      isSelected
                                        ? ''
                                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
                                    }`}
                                  >
                                    <span>{opt.label}</span>
                                    {isSelected && (
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.rawColor }} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      placeholder="e.g. pointers, malloc, unit5"
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Content Body (supports Markdown)</label>
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Explain details of the doubt or question..."
                      rows={5}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreatePost(false)}
                      className="px-5 py-3 text-zinc-450 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Submit Post
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Edit Post Modal */}
      {createPortal(
        <AnimatePresence>
          {editingPost && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setEditingPost(null)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    Edit Post
                  </h3>
                  <button onClick={() => setEditingPost(null)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editingPost) return;
                    const ok = await CommunityService.editPost(editingPost.id, editPostTitle, editPostContent);
                    if (ok) {
                      setDiscussions(prev => prev.map(post => {
                        if (post.id === editingPost.id) {
                          return { ...post, title: editPostTitle, content: editPostContent, updated_at: new Date().toISOString() };
                        }
                        return post;
                      }));
                      showToast("Post edited successfully", "success");
                      setEditingPost(null);
                    } else {
                      showToast("Failed to edit post", "error");
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Title</label>
                    <input
                      type="text"
                      value={editPostTitle}
                      onChange={(e) => setEditPostTitle(e.target.value)}
                      placeholder="Enter post title..."
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Content Body</label>
                    <textarea
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      placeholder="Explain details of the doubt or question..."
                      rows={5}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="px-5 py-3 text-zinc-450 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 2. Create Request Modal */}
      {createPortal(
        <AnimatePresence>
          {showCreateRequest && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreateRequest(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle size={18} style={{ color: theme.rawColor }} /> Request Study Material
                  </h3>
                  <button onClick={() => setShowCreateRequest(false)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Document Title Needed</label>
                      <input
                        type="text"
                        value={reqTitle}
                        onChange={(e) => setReqTitle(e.target.value)}
                        placeholder="e.g. Unit 3 lab manual code solved"
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">XP Reward Bounty</label>
                      <input
                        type="number"
                        value={reqBounty}
                        onChange={(e) => setReqBounty(Number(e.target.value))}
                        placeholder="e.g. 50"
                        className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Description</label>
                    <textarea
                      value={reqContent}
                      onChange={(e) => setReqContent(e.target.value)}
                      placeholder="Specify details or requirements..."
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreateRequest(false)}
                      className="px-5 py-3 text-zinc-450 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Post Bounty Request
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 3. Create Study Pack Modal */}
      {createPortal(
        <AnimatePresence>
          {showCreatePack && (
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowCreatePack(false)}
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/55 backdrop-blur-md"
                style={{ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[40px] p-8 shadow-2xl space-y-5 overflow-hidden z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={18} style={{ color: theme.rawColor }} /> Create Curated Study Pack
                  </h3>
                  <button onClick={() => setShowCreatePack(false)} className="text-zinc-400 hover:text-zinc-655 dark:hover:text-white bg-transparent border-none text-lg cursor-pointer font-semibold transition-colors">×</button>
                </div>

                <form onSubmit={handlePackSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Study Pack Title</label>
                    <input
                      type="text"
                      value={packTitle}
                      onChange={(e) => setPackTitle(e.target.value)}
                      placeholder="e.g. CSE101 Midterm Complete Preparation Bundle"
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Study Pack Description</label>
                    <textarea
                      value={packContent}
                      onChange={(e) => setPackContent(e.target.value)}
                      placeholder="Summarize what files are included and what chapters this pack covers..."
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-white/10 rounded-3xl p-4 text-xs font-semibold outline-none text-zinc-955 dark:text-white transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowCreatePack(false)}
                      className="px-5 py-3 text-zinc-455 hover:text-zinc-800 dark:hover:text-white font-bold text-xs border-none bg-transparent transition-colors cursor-pointer outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: theme.rawColor }}
                      className="px-6 py-3 text-white rounded-2xl text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                    >
                      Create Study Pack
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

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

            {/* Edit (Admin only) */}
            {userProfile?.is_admin && (
              <button
                onClick={() => {
                  const file = allFiles.find(f => f.id === activeMenuFileId);
                  setActiveMenuFileId(null);
                  setMenuAnchorRect(null);
                  if (file) {
                    setSelectedFileToEdit(file);
                    setEditForm({
                      name: file.name,
                      description: file.description || '',
                      type: file.type || '',
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
