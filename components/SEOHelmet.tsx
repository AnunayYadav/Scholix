
import React, { useEffect } from 'react';
import { useLocation, useParams, matchPath } from 'react-router-dom';
import { useUniversity } from '../hooks/useUniversity.tsx';
import { ModuleType } from '../types.ts';

interface SEOHelmetProps {
  currentModule: ModuleType;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({ currentModule }) => {
  const { universityInfo, fullBrandName, selectedUniversity } = useUniversity();
  const location = useLocation();

  useEffect(() => {
    const uniName = universityInfo?.name || 'Scholix';
    const uniShort = universityInfo?.shortName || '';
    
    let title = `${fullBrandName} | Free Notes, PYQs & Student Tools`;
    let description = `The ultimate companion for ${uniName} students. Download notes, PYQs, use CGPA calculator, attendance & bunk calculator, mess menu, AI quiz generator, and placement prep tools.`;
    let keywords = `scholix, lpu nexus, lpu notes, lpu library, lpu study material, lpu notes hub, student portal, attendance tracker, cgpa calculator, bunk calculator, lpu pyq, lpu previous year question paper`;

    if (selectedUniversity !== 'none') {
      keywords += `, ${uniName}, ${uniShort} notes, ${uniShort} pyqs, ${uniShort} attendance, ${uniShort} bunk calculator, ${uniShort} cgpa calculator, ${uniShort} mess menu, ${uniShort} verto, ${uniShort} student portal, ${uniShort} exam preparation`;
    }

    // Advanced Path Parsing for specific content
    const path = location.pathname;
    
    // Library Path Regex Matchers
    const libraryMatch = matchPath({ path: "/library/:program/:semester/:subject" }, path) || 
                       matchPath({ path: "/:uni/library/:program/:semester/:subject" }, path);
    const categoryMatch = matchPath({ path: "/library/:program/:semester/:subject/:category" }, path) || 
                        matchPath({ path: "/:uni/library/:program/:semester/:subject/:category" }, path);

    // Module specific overrides with deeper granularity
    switch (currentModule) {
      case ModuleType.LIBRARY:
        if (libraryMatch) {
          const { semester, subject } = libraryMatch.params;
          const cleanSubject = decodeURIComponent(subject || '').replace(/-/g, ' ');
          const cleanSemester = (semester || '').replace(/-/g, ' ');
          
          title = `${cleanSubject} Notes & PYQs | ${uniShort} ${cleanSemester} | Download Free - ${fullBrandName}`;
          description = `Download free ${cleanSubject} notes, handwritten PDFs, and previous year question papers (PYQs) for ${uniName} ${cleanSemester}. Best ${uniShort} study material for exam preparation.`;
          keywords += `, ${cleanSubject} notes, ${cleanSubject} pyq, ${cleanSubject} pdf, ${uniShort} ${cleanSubject}, ${cleanSubject} handwritten notes, ${cleanSubject} previous year paper, ${uniShort} ${cleanSemester} notes`;
        } else {
          title = `${uniShort ? uniShort + ' ' : ''}Notes & PYQs Library | Free Study Material - ${fullBrandName}`;
          description = `Download free ${uniName} notes, previous year question papers (PYQs), handwritten PDFs, and study material. Organized by program, semester & subject. ${uniShort} BTech CSE, BCA, MCA, MBA notes available.`;
          keywords += `, ${uniShort} syllabus, ${uniShort} exam papers, ${uniShort} academic records, ${uniShort} handwritten notes, ${uniShort} study material pdf, ${uniShort} btech cse notes, ${uniShort} bca notes, ${uniShort} e connect books, lpu library`;
        }
        break;
      case ModuleType.CAMPUS:
        const campusMatch = matchPath({ path: "/campus/:tab" }, path) || matchPath({ path: "/:uni/campus/:tab" }, path);
        const subTab = campusMatch?.params.tab || '';
        
        if (subTab === 'mess') {
          title = `${uniShort} Mess Menu Today | Weekly Hostel Food Schedule 2026 - ${fullBrandName}`;
          description = `Check today's ${uniName} mess menu and weekly hostel food schedule. Daily breakfast, lunch, dinner updates and diet chart for ${uniShort} hostels.`;
          keywords += `, ${uniShort} mess menu, ${uniShort} mess menu today, ${uniShort} hostel food, ${uniShort} hostel mess, mess diet plan, ${uniShort} food schedule, ${uniShort} mess weekly menu`;
        } else if (subTab === 'map') {
          title = `${uniShort} Campus Map | 3D Block Finder & Navigation - ${fullBrandName}`;
          description = `Navigate the ${uniName} campus with our interactive 3D map. Find blocks, lecture halls, hostels, and facilities instantly.`;
          keywords += `, ${uniShort} campus map, ${uniShort} block finder, ${uniShort} navigation, ${uniShort} campus navigation, ${uniShort} block location`;
        } else if (subTab === 'market') {
          title = `${uniShort} Student Marketplace | Buy & Sell Locally - ${fullBrandName}`;
          description = `Buy and sell cycles, gadgets, textbooks, and essentials with fellow ${uniName} students. Safe campus marketplace for Vertos.`;
          keywords += `, ${uniShort} student market, ${uniShort} second hand books, ${uniShort} buy sell, ${uniShort} campus deals, ${uniShort} olx`;
        } else if (subTab === 'roommate') {
          title = `${uniShort} Roommate Finder | Find Flatmates & PG Near Campus - ${fullBrandName}`;
          description = `Find compatible roommates and flatmates near ${uniName} campus. Browse student housing, PG accommodations, and hostel peer matching.`;
          keywords += `, ${uniShort} flatmate search, ${uniShort} PG finder, ${uniShort} hostel roommate, ${uniShort} accommodation, ${uniShort} room sharing`;
        } else {
          title = `${uniShort} Campus Hub | Mess Menu, Map, Market & More - ${fullBrandName}`;
          description = `Your complete ${uniName} campus companion. Access mess menus, 3D campus map, student marketplace, and roommate finder — all in one place.`;
          keywords += `, ${uniShort} campus life, ${uniShort} student life, ${uniShort} campus utilities, ${uniShort} verto tools`;
        }
        break;
      case ModuleType.PLACEMENT:
        title = `${uniShort} Placement Prep | AI Resume Analyzer & ATS Checker - ${fullBrandName}`;
        description = `Get placement ready for ${uniName} drives. AI-powered resume analysis with ATS score, interview prep, and candidate performance reports. Prepare for cocubes and campus placements.`;
        keywords += `, ${uniShort} placement, ${uniShort} placement 2026, ${uniShort} resume review, ats checker, ${uniShort} internship, cocubes in ${uniShort.toLowerCase()}, ${uniShort} campus placement, ai resume analyzer, ${uniShort} placement prep`;
        break;
      case ModuleType.QUIZ:
        const quizParamMatch = matchPath({ path: "/quiz/:subject" }, path) || matchPath({ path: "/:uni/quiz/:subject" }, path);
        if (quizParamMatch) {
          const subjectName = decodeURIComponent(quizParamMatch.params.subject || '').replace(/-/g, ' ');
          title = `${subjectName} MCQ Quiz | ${uniShort} Exam Practice - ${fullBrandName}`;
          description = `Practice ${subjectName} MCQs and test your knowledge with AI-generated quizzes. Ideal for ${uniName} MTE & ETE exam preparation.`;
          keywords += `, ${subjectName} mcqs, ${subjectName} quiz, ${uniShort} ${subjectName} exam, online test preparation, ${uniShort} mte preparation, ${uniShort} ete preparation`;
        } else {
          title = `${uniShort} AI Quiz Generator | MCQ Practice for Exams - ${fullBrandName}`;
          description = `Generate personalized MCQ quizzes for ${uniName} subjects. AI-powered exam preparation for MTE, ETE, and competitive exams. Track performance with XP.`;
          keywords += `, ${uniShort} online tests, ${uniShort} mcq practice, ${uniShort} exam preparation, ${uniShort} mte, ${uniShort} ete, ai quiz generator`;
        }
        break;
      case ModuleType.TOOLS:
        title = `${uniShort} CGPA Calculator & Attendance Tracker | Bunk Calculator - ${fullBrandName}`;
        description = `Calculate your ${uniName} CGPA & TGPA, convert CGPA to percentage, track attendance, and use the safe-bunk calculator. Know exactly how many classes you can skip.`;
        keywords += `, ${uniShort} cgpa calculator, ${uniShort} tgpa calculator, ${uniShort} cgpa to percentage, ${uniShort} attendance calculator, ${uniShort} bunk calculator, ${uniShort} safe bunk, ${uniShort} attendance tracker, how to calculate cgpa in ${uniShort.toLowerCase()}`;
        break;
      case ModuleType.ROOMMATE:
        title = `${uniShort} Roommate Finder | Flatmates & PG Near Campus - ${fullBrandName}`;
        description = `Find the perfect roommate or flatmate near ${uniName} campus. Browse student housing, PG listings, and hostel peer matches.`;
        keywords += `, ${uniShort} room finder, ${uniShort} flatmate search, ${uniShort} student housing, ${uniShort} PG near campus, ${uniShort} hostel`;
        break;
      case ModuleType.DASHBOARD:
        title = `${fullBrandName} | Your ${uniShort} Student Dashboard`;
        description = `Welcome to ${fullBrandName} — your personalized ${uniName} dashboard. Quick access to notes, PYQs, attendance, CGPA calculator, mess menu, and campus updates.`;
        keywords += `, ${uniShort} dashboard, ${uniShort} student portal, ${uniShort} verto, lpu nexus`;
        break;
    }

    // Update Document Head
    document.title = title;
    
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // OpenGraph Tags
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:type', 'website', 'property');
    updateMeta('og:url', window.location.href, 'property');
    updateMeta('og:site_name', fullBrandName, 'property');

    // Schema Org Json-LD
    let schemaBody = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": fullBrandName,
      "description": description,
      "url": window.location.origin,
      "applicationCategory": "EducationalApplication",
      "genre": "Education",
      "operatingSystem": "Web",
      "keywords": keywords,
      "author": {
        "@type": "Organization",
        "name": "Scholix Team"
      }
    };

    let script = document.getElementById('schema-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-ld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaBody);

  }, [currentModule, universityInfo, fullBrandName, selectedUniversity, location.pathname, location.search]);

  return null;
};

export default SEOHelmet;
