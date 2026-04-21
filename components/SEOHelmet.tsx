
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
    
    let title = `${fullBrandName} | Student Success Platform`;
    let description = `The ultimate companion for ${uniName} students. Access notes, PYQs, attendance tracker, and placement reports.`;
    let keywords = `scholix, university notes, student portal, attendance tracker, cgpa calculator`;

    if (selectedUniversity !== 'none') {
      keywords += `, ${uniName}, ${uniShort} notes, ${uniShort} pyqs, ${uniShort} attendance`;
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
          
          title = `${cleanSubject} Notes & PYQs | ${uniShort} ${cleanSemester} | ${fullBrandName}`;
          description = `Get the latest ${cleanSubject} materials for ${uniName} ${cleanSemester}. Access handwritten notes, previous year question papers, and study guides.`;
          keywords += `, ${cleanSubject} notes, ${cleanSubject} pyq, ${uniShort} ${cleanSubject}`;
        } else {
          title = `${uniShort ? uniShort + ' ' : ''}Content Library | Notes & PYQs - ${fullBrandName}`;
          description = `Download ${uniName} previous year question papers, handwritten notes, and academic records. Best source for ${uniShort} study material.`;
          keywords += `, ${uniShort} syllabus, ${uniShort} exam papers, ${uniShort} academic records`;
        }
        break;
      case ModuleType.CAMPUS:
        const campusMatch = matchPath({ path: "/campus/:tab" }, path) || matchPath({ path: "/:uni/campus/:tab" }, path);
        const subTab = campusMatch?.params.tab || '';
        
        if (subTab === 'mess') {
          title = `${uniShort} Mess Menu & Diet Chart | weekly schedule - ${fullBrandName}`;
          description = `Check the latest weekly mess menu and food schedule for ${uniName} hostels. Daily food updates and diet plans for students.`;
          keywords += `, ${uniShort} mess menu, hostel food, mess diet plan`;
        } else if (subTab === 'map') {
          title = `${uniShort} 3D Campus Map & Virtual Tour | ${fullBrandName}`;
          description = `Examine the ${uniName} 3D campus map. Find blocks, lecture halls, and facilities with ease through our navigator.`;
          keywords += `, campus map, ${uniShort} navigation, block finder, room guide`;
        } else if (subTab === 'market') {
          title = `Scholix Market | Buy & Sell locally at ${uniShort} - ${fullBrandName}`;
          description = `The student marketplace for ${uniName}. Buy and sell cycles, gadgets, and textbooks from fellow students safely.`;
          keywords += `, student market, second hand books, buy sell cycle, campus deals`;
        } else if (subTab === 'roommate') {
          title = `Roommate Finder | ${uniShort} Peer Search - ${fullBrandName}`;
          description = `Find compatible roommates and flatmates near ${uniName}. Connect with peers for student housing.`;
          keywords += `, flatmate search, PG finder, hostel roommate, peer match`;
        } else {
          title = `${uniShort} Campus Hub & Exploration | ${fullBrandName}`;
          description = `Explore the ${uniName} campus ecosystem. Access mess menus, maps, student markets, and roommate finders in one place.`;
          keywords += `, campus ecosystem, student life, ${uniShort} utilities`;
        }
        break;
      case ModuleType.PLACEMENT:
        title = `Placement Prefect | Resume Analyzer & Prep - ${fullBrandName}`;
        description = `Optimize your resume with ATS-level checking and get placement ready for ${uniName} drives. Check candidate performance results.`;
        keywords += `, resume review, ats checker, internship prep, placement feedback`;
        break;
      case ModuleType.QUIZ:
        const quizParamMatch = matchPath({ path: "/quiz/:subject" }, path) || matchPath({ path: "/:uni/quiz/:subject" }, path);
        if (quizParamMatch) {
          const subjectName = decodeURIComponent(quizParamMatch.params.subject || '').replace(/-/g, ' ');
          title = `${subjectName} Practice Quiz | AI Test Prep - ${fullBrandName}`;
          description = `Test your knowledge on ${subjectName} with AI-powered quizzes for ${uniName} exams.`;
          keywords += `, ${subjectName} mcqs, online test preparation`;
        } else {
          title = `Quiz Taker | AI Powered Test Prep - ${fullBrandName}`;
          description = `Generate personalized quizzes for ${uniName} subjects and improve your grades.`;
          keywords += `, online tests, mcq prep, exam preparation`;
        }
        break;
      case ModuleType.TOOLS:
        title = `${uniShort} Student Tools | Attendance & CGPA - ${fullBrandName}`;
        description = `Track your attendance, calculate CGPA, and forecast your academic performance at ${uniName}. Safe-bunk calculator included.`;
        keywords += `, attendance manager, safe bunk calculator, cgpa forecaster`;
        break;
      case ModuleType.ROOMMATE:
        title = `Roommate Finder | ${uniShort} Hostel Support - ${fullBrandName}`;
        description = `Find the perfect roommate or flatmate near ${uniName} campus. Browse student housing listings.`;
        keywords += `, room finder, flatmate search, student housing`;
        break;
      case ModuleType.AI_TOOLS:
        title = `AI Tools Directory | Student Productivity - ${fullBrandName}`;
        description = `Curated list of AI tools to help ${uniName} students with research, writing, and coding. Best AI for college students.`;
        keywords += `, best ai tools, study ai, productivity tools`;
        break;
      case ModuleType.DASHBOARD:
        description = `Welcome to the ${uniName} Hub. Access your personalized dashboard for attendance, notes, and campus updates.`;
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
