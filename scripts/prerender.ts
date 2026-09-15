import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { BTECH_CSE_2025 } from '../data/curriculumData';
import { ALL_SUBJECTS_CATALOG } from '../data/subjectCatalog';
import { SYLLABUS_DATA } from '../data/syllabusData';
import { slugify, librarySlug } from '../utils/slugify';

// Resolve environment variables from .env.local if present, or fallback to process.env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  }
} catch (e) {
  console.warn("Could not read .env.local, using process.env.");
}

const getEnvVar = (name: string): string => {
  if (process.env[name]) {
    return process.env[name] || '';
  }
  const match = envContent.match(new RegExp(`^${name}=(?:"([^"]+)"|'([^']+)'|([^\\r\\n]+))`, 'm'));
  if (match) {
    return match[1] || match[2] || match[3] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found. Cannot prerender pages.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Programs
const LPU_PROGRAMS = ["BTech CSE", "BTech IT", "BCA", "MCA", "MBA", "BCom", "BA"];
const IITM_PROGRAMS = ["BS Data Science"];

const getUniversitySlug = (program: string): string => {
  const norm = program.toLowerCase();
  if (norm.includes('data science') || norm.includes('iitm')) {
    return 'iitm';
  }
  return 'lpu';
};

const getUniversityName = (slug: string): string => {
  if (slug === 'iitm') return 'IIT Madras';
  if (slug === 'lpu') return 'Lovely Professional University';
  return 'Scholix';
};

const getUniversityShort = (slug: string): string => {
  if (slug === 'iitm') return 'IITM';
  if (slug === 'lpu') return 'LPU';
  return 'Scholix';
};

interface SubjectDetails {
  code: string;
  title: string;
  fullTitle: string;
  description: string;
  credits: number;
  l: number;
  t: number;
  p: number;
  units: Array<{ unitNumber: number; title: string; content?: string }>;
  gradingScheme?: Record<string, string> | null;
  examPatterns?: any;
}

function getSubjectDetails(code: string, fallbackTitle: string): SubjectDetails {
  const codeKey = code.toLowerCase().trim();
  const catalogEntry = ALL_SUBJECTS_CATALOG[codeKey]?.current || ALL_SUBJECTS_CATALOG[codeKey]?.reappear;
  
  // Find in SYLLABUS_DATA
  let syllabusText = '';
  for (const [key, val] of Object.entries(SYLLABUS_DATA)) {
    if (key.toLowerCase().includes(codeKey)) {
      syllabusText = val;
      break;
    }
  }

  let units: Array<{ unitNumber: number; title: string; content?: string }> = [];
  if (syllabusText) {
    const rawUnits = syllabusText.split(/Unit\s+[IVXLCDM\d]+/i).map(u => u.trim()).filter(Boolean);
    units = rawUnits.map((uText, idx) => {
      const parts = uText.split(':');
      const title = parts[0]?.trim() || `Unit ${idx + 1}`;
      const content = parts.slice(1).join(':').trim();
      return {
        unitNumber: idx + 1,
        title: title,
        content: content
      };
    });
  } else if (catalogEntry?.units && catalogEntry.units.length > 0) {
    units = catalogEntry.units.map((u: any) => ({
      unitNumber: u.unitNumber,
      title: u.title,
      content: ''
    }));
  }

  return {
    code: catalogEntry?.code || code.toUpperCase(),
    title: catalogEntry?.name || fallbackTitle,
    fullTitle: catalogEntry?.fullTitle || `${code.toUpperCase()} — ${fallbackTitle}`,
    description: catalogEntry?.courseDescription || `Complete verified handwritten notes, PYQ question papers, syllabus guides, and lecture materials for ${code.toUpperCase()} (${fallbackTitle}).`,
    credits: catalogEntry?.credits || 0,
    l: catalogEntry?.l || 0,
    t: catalogEntry?.t || 0,
    p: catalogEntry?.p || 0,
    units,
    gradingScheme: catalogEntry?.gradingScheme,
    examPatterns: catalogEntry?.examPatterns
  };
}

interface RouteItem {
  path: string;
  title: string;
  description: string;
  contentHtml: string;
  schemaJson?: any;
}

async function prerender() {
  console.log("Starting static page pre-rendering (SPA SEO optimization)...");
  
  const distPath = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(templatePath)) {
    console.error("Error: dist/index.html not found! Run 'vite build' first.");
    process.exit(1);
  }
  
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  
  const routes: RouteItem[] = [];
  
  // 1. Static base routes
  const baseRoutes = [
    {
      path: '/welcome',
      title: 'Welcome to Scholix | Student Success Platform',
      description: 'Scholix is an AI-driven student success platform providing attendance trackers, notes, CGPA calculators, and campus life utilities.'
    },
    {
      path: '/about-scholix',
      title: 'About Scholix | Our Mission & Platform',
      description: 'Learn about Scholix, our mission to simplify and elevate the college student experience with AI-powered resume and study tools.'
    },
    {
      path: '/privacy-policy',
      title: 'Privacy Policy | Scholix',
      description: 'Read the privacy policy of Scholix. Learn how we handle and protect your personal information and academic data.'
    },
    {
      path: '/terms',
      title: 'Terms of Service | Scholix',
      description: 'Review the terms and conditions for using the Scholix platform, including user accounts, file uploads, and guidelines.'
    },
    {
      path: '/contact',
      title: 'Contact Us | Scholix Support',
      description: 'Get in touch with the Scholix team. Send feedback, report bugs, or ask questions about our platform and university portals.'
    },
    // LPU Entry
    {
      path: '/lpu',
      title: 'LPU Student Portal | Notes, Attendance, CGPA & Tools - Scholix',
      description: 'Access the Lovely Professional University gateway. Track hostel mess menus, attendance, CGPA, class schedules, and download course notes.'
    },
    {
      path: '/lpu/library',
      title: 'LPU Notes & PYQs Library | Free Study Material - Scholix',
      description: 'Download free LPU notes, previous year question papers (PYQs), handwritten PDFs, and syllabus. Organized by BTech CSE, BCA, MCA, MBA & semester.'
    },
    {
      path: '/lpu/quiz',
      title: 'LPU AI Quiz Taker | Exam Prep - Scholix',
      description: 'Take practice quizzes tailored to LPU syllabus. Test your knowledge on academic subjects with AI-generated feedback.'
    },
    {
      path: '/lpu/campus',
      title: 'LPU Campus Hub | Hostel Mess & Markets - Scholix',
      description: 'Explore the LPU campus ecosystem. Check hostel mess menus, browse student classifieds, roommate finder, and navigation maps.'
    },
    {
      path: '/lpu/campus/mess',
      title: 'LPU Hostel Mess Menu & Diet Chart | Scholix',
      description: 'Check today\'s breakfast, lunch, snacks, and dinner schedule for LPU hostel mess. Stay updated with weekly food menus.'
    },
    {
      path: '/lpu/campus/map',
      title: 'LPU Campus Map & Block Finder | Scholix',
      description: 'Navigate the LPU campus block by block. Search blocks, auditoriums, canteens, and lecture rooms with ease.'
    },
    {
      path: '/lpu/campus/market',
      title: 'LPU Classifieds Marketplace | Buy & Sell - Scholix',
      description: 'The student classifieds page for LPU. Buy and sell textbooks, mattresses, cycles, and electronics safely with college peers.'
    },
    {
      path: '/lpu/campus/roommate',
      title: 'LPU Roommate & PG Finder | Student Housing - Scholix',
      description: 'Find hostel roommates or nearby PG flatmates at LPU. Browse compatible profiles based on study habits and preferences.'
    },
    {
      path: '/lpu/placement',
      title: 'LPU Placement Prefect | Resume ATS Checker - Scholix',
      description: 'Get placement-ready at LPU. Run AI resume reviews, check ATS compatibility score, and view recent campus drive metrics.'
    },
    {
      path: '/lpu/attendance',
      title: 'LPU Attendance Tracker & Bunk Forecaster - Scholix',
      description: 'Track LPU course attendance. Calculate how many classes you can safe-bunk while maintaining the mandatory 75% limit.'
    },
    {
      path: '/lpu/cgpa',
      title: 'LPU CGPA Calculator & SGPA Planner - Scholix',
      description: 'Calculate and plan your LPU SGPA/CGPA. Estimate required target grades to hit your desired placement cut-offs.'
    },
    {
      path: '/lpu/timetable',
      title: 'LPU Weekly Timetable & Class Schedule - Scholix',
      description: 'Manage your daily LPU lecture schedule. View class timings, lecture halls, and receive attendance check alerts.'
    },
    {
      path: '/lpu/freshers',
      title: 'LPU Freshers Guide & Welcome Kit - Scholix',
      description: 'New to LPU? Access the ultimate freshers manual covering college terms, hostel essentials, local spots, and grading rules.'
    },
    {
      path: '/lpu/ai-tools',
      title: 'LPU AI Student Assistant & Study Tools - Scholix',
      description: 'Boost your productivity at LPU. Access AI study planners, document summerizers, and custom quiz engines.'
    },
    {
      path: '/lpu/emergency',
      title: 'LPU Rescue Line & Campus Emergency Contacts - Scholix',
      description: 'Instant access to LPU emergency numbers: security control room, hostel wardens, local police, and hospital hotlines.'
    },
    // IITM Entry
    {
      path: '/iitm',
      title: 'IITM BS Data Science Portal | Scholix',
      description: 'Access the IIT Madras BS Degree program portal. Browse term materials, timetable schedulers, and study quizzes.'
    },
    {
      path: '/iitm/library',
      title: 'IITM BS Library | Course Notes & Assignments - Scholix',
      description: 'Download IIT Madras BS Data Science study notes, weekly graded assignments solutions, and exam preparation materials.'
    },
    {
      path: '/iitm/quiz',
      title: 'IITM AI Quiz Prep | Data Science Tests - Scholix',
      description: 'Practice quizzes for IITM BS course units. Test your coding, math, and statistics knowledge before weekly deadlines.'
    },
    {
      path: '/iitm/timetable',
      title: 'IITM Study Planner & Calendar - Scholix',
      description: 'Track your IITM BS weekly live sessions, assignment due dates, and quiz deadlines in a single visual dashboard.'
    }
  ];
  
  baseRoutes.forEach(r => {
    routes.push({
      path: r.path,
      title: r.title,
      description: r.description,
      contentHtml: `
        <div style="padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto;">
          <header style="text-align: center; margin-bottom: 40px;">
            <a href="/" style="display: inline-block; margin-bottom: 20px;">
              <img src="/Scholix_dark.webp" alt="Scholix" style="height: 48px;" />
            </a>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 10px 0;">${r.title.split(' | ')[0]}</h1>
            <p style="color: #4b5563; font-size: 1.1rem; line-height: 1.6; max-width: 650px; margin: 15px auto 0;">${r.description}</p>
          </header>
          <main style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <a href="${r.path}" style="display: inline-block; padding: 14px 32px; background: #ea580c; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 14px rgba(234,88,12,0.35);">Open Scholix App →</a>
            </div>
          </main>
        </div>
      `
    });
  });

  // 2. Program Library Routes
  const allPrograms = Array.from(new Set([...LPU_PROGRAMS, ...IITM_PROGRAMS]));
  allPrograms.forEach(prog => {
    const uniSlug = getUniversitySlug(prog);
    const uniName = getUniversityName(uniSlug);
    const uniShort = getUniversityShort(uniSlug);
    const progSlug = librarySlug(prog, 'program');
    const routePath = `/${uniSlug}/library/${progSlug}`;
    
    routes.push({
      path: routePath,
      title: `${prog} ${uniShort} Notes & Study Guides | ${uniName} - Scholix`,
      description: `Browse course folders, assignments, syllabus details, and previous year papers for ${uniName} ${prog} curriculum.`,
      contentHtml: `
        <div style="padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto;">
          <header style="margin-bottom: 30px;">
            <nav style="font-size: 0.9rem; color: #6b7280; margin-bottom: 12px;">
              <a href="/" style="color: #ea580c; text-decoration: none;">Home</a> &gt; 
              <a href="/${uniSlug}" style="color: #ea580c; text-decoration: none;">${uniShort}</a> &gt; 
              <span>${prog}</span>
            </nav>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 10px 0;">${prog} Academic Directory</h1>
            <p style="color: #4b5563; font-size: 1.1rem; line-height: 1.6;">Access verified handwritten notes, curriculum structures, and previous year exam questions for ${uniName} ${prog}.</p>
          </header>
          <main>
            <div style="margin-bottom: 30px;">
              <a href="${routePath}" style="display: inline-block; padding: 12px 28px; background: #ea580c; color: white; text-decoration: none; border-radius: 10px; font-weight: 700;">Open Program Library →</a>
            </div>
            <h2 style="font-size: 1.4rem; color: #1f2937; margin-bottom: 16px;">Available Semesters</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;">
              ${BTECH_CSE_2025.terms.map(t => {
                const termSlug = librarySlug(t.termName, 'semester');
                return `
                  <a href="${routePath}/${termSlug}" style="display: block; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; color: #1f2937; font-weight: 600; text-align: center; background: #f9fafb;">
                    ${t.termName} Notes →
                  </a>
                `;
              }).join('\n')}
            </div>
          </main>
        </div>
      `
    });
  });

  // Helper to build a high-ranking subject page
  const createSubjectRoute = (
    sub: { code: string; title: string; credits?: number; l?: number; t?: number; p?: number },
    termName: string,
    termPath: string,
    uniSlug: string,
    progName: string
  ) => {
    const uniName = getUniversityName(uniSlug);
    const uniShort = getUniversityShort(uniSlug);
    const subjectName = `${sub.code}: ${sub.title}`;
    const subjSlug = librarySlug(subjectName, 'subject');
    const subjectPath = `${termPath}/${subjSlug}`;
    const details = getSubjectDetails(sub.code, sub.title);

    // High intent title formula
    const subjectTitle = `${details.code} ${uniShort} Notes, PYQs & Syllabus | ${details.title} - Scholix`;
    const subjectDescription = `Download free ${details.code} (${details.title}) ${uniShort} notes, handwritten PDFs, previous year question papers (PYQs), and unit-wise syllabus. Best verified study material for ${uniName}.`;

    const courseSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Course",
          "@id": `https://scholix.app${subjectPath}#course`,
          "name": `${details.code}: ${details.title}`,
          "courseCode": details.code,
          "description": details.description,
          "provider": {
            "@type": "CollegeOrUniversity",
            "name": uniName,
            "sameAs": "https://www.lpu.in"
          },
          "educationalCredentialAwarded": "Bachelor of Technology in Computer Science and Engineering",
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "blended"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://scholix.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": `${uniShort} Portal`,
              "item": `https://scholix.app/${uniSlug}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Library",
              "item": `https://scholix.app/${uniSlug}/library`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": termName,
              "item": `https://scholix.app${termPath}`
            },
            {
              "@type": "ListItem",
              "position": 5,
              "name": `${details.code} Notes`,
              "item": `https://scholix.app${subjectPath}`
            }
          ]
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `How to download ${details.code} (${details.title}) LPU notes?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `You can download complete handwritten notes, lecture slides, and unit-by-unit study summaries for ${details.code} on Scholix for free. All materials are verified by top LPU students.`
              }
            },
            {
              "@type": "Question",
              "name": `Are ${details.code} previous year question papers (PYQs) available?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `Yes, Scholix provides previous year Mid-Term (MTE) and End-Term (ETE) question papers for ${details.code} with answer keys and practice question banks.`
              }
            },
            {
              "@type": "Question",
              "name": `What is the syllabus of ${details.code} at Lovely Professional University?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": `The course syllabus is divided into units covering: ${details.units.length > 0 ? details.units.map(u => `Unit ${u.unitNumber}: ${u.title}`).join(', ') : 'all fundamental and applied computing domains as per LPU curriculum'}.`
              }
            }
          ]
        }
      ]
    };

    // Render rich, SEO-optimized, fully visible HTML
    const contentHtml = `
      <article style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937;">
        <!-- Breadcrumb Navigation -->
        <nav aria-label="Breadcrumb" style="font-size: 0.9rem; color: #6b7280; margin-bottom: 16px;">
          <a href="/" style="color: #ea580c; text-decoration: none;">Home</a> &gt; 
          <a href="/${uniSlug}" style="color: #ea580c; text-decoration: none;">${uniShort}</a> &gt; 
          <a href="${termPath}" style="color: #ea580c; text-decoration: none;">${termName}</a> &gt; 
          <span style="color: #374151; font-weight: 600;">${details.code}</span>
        </nav>

        <!-- Header -->
        <header style="margin-bottom: 32px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px;">
          <div style="display: inline-block; padding: 4px 12px; background: #ffedd5; color: #c2410c; border-radius: 9999px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">
            ${uniName} • ${progName} • ${termName}
          </div>
          <h1 style="font-size: 2.3rem; font-weight: 800; color: #111827; margin: 8px 0 12px; line-height: 1.25;">
            ${details.code}: ${details.title} Notes &amp; Study Material
          </h1>
          <p style="font-size: 1.1rem; color: #4b5563; line-height: 1.6; margin: 0;">
            ${details.description}
          </p>
        </header>

        <!-- Primary Action Callout -->
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1px solid #fed7aa; border-radius: 16px; padding: 24px; margin-bottom: 36px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
          <div>
            <h2 style="font-size: 1.2rem; font-weight: 700; color: #9a3412; margin: 0 0 6px;">Access All ${details.code} Study Resources Free</h2>
            <p style="margin: 0; color: #c2410c; font-size: 0.95rem;">Interactive PDF viewer, dark mode, full offline notes &amp; PYQs.</p>
          </div>
          <a href="${subjectPath}" style="display: inline-block; padding: 14px 30px; background: #ea580c; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 14px rgba(234,88,12,0.35);">
            Open in Scholix App →
          </a>
        </div>

        <!-- Quick Access Category Grid -->
        <section style="margin-bottom: 40px;">
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #111827; margin-bottom: 16px;">Available Study Materials</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            <a href="${subjectPath}/notes" style="display: block; padding: 20px; border: 1px solid #e5e7eb; border-radius: 14px; text-decoration: none; color: inherit; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 1.8rem; margin-bottom: 8px;">📝</div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 6px; color: #111827;">Handwritten Notes &amp; Slides</h3>
              <p style="margin: 0; font-size: 0.9rem; color: #6b7280; line-height: 1.5;">Unit-by-unit lecture summaries and handwritten notes from class toppers.</p>
            </a>
            <a href="${subjectPath}/pyqs" style="display: block; padding: 20px; border: 1px solid #e5e7eb; border-radius: 14px; text-decoration: none; color: inherit; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 1.8rem; margin-bottom: 8px;">📄</div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 6px; color: #111827;">Previous Year Papers (PYQs)</h3>
              <p style="margin: 0; font-size: 0.9rem; color: #6b7280; line-height: 1.5;">LPU Mid-Term (MTE) and End-Term (ETE) questions with solutions.</p>
            </a>
            <a href="${subjectPath}/syllabus" style="display: block; padding: 20px; border: 1px solid #e5e7eb; border-radius: 14px; text-decoration: none; color: inherit; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-size: 1.8rem; margin-bottom: 8px;">📜</div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 6px; color: #111827;">Official Syllabus &amp; CA Pattern</h3>
              <p style="margin: 0; font-size: 0.9rem; color: #6b7280; line-height: 1.5;">Course structure, credits, weightage, and continuous evaluation criteria.</p>
            </a>
          </div>
        </section>

        <!-- Course Meta / Overview Grid -->
        <section style="margin-bottom: 40px; background: #f9fafb; border-radius: 14px; border: 1px solid #e5e7eb; padding: 20px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; color: #111827; margin: 0 0 16px;">Course Overview &amp; Evaluation Scheme</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; font-size: 0.95rem;">
            <div>
              <span style="color: #6b7280; display: block; font-size: 0.85rem;">Course Code</span>
              <strong style="color: #111827; font-size: 1.1rem;">${details.code}</strong>
            </div>
            <div>
              <span style="color: #6b7280; display: block; font-size: 0.85rem;">Total Credits</span>
              <strong style="color: #111827; font-size: 1.1rem;">${details.credits || sub.credits || 2} Credits</strong>
            </div>
            <div>
              <span style="color: #6b7280; display: block; font-size: 0.85rem;">Class Structure</span>
              <strong style="color: #111827; font-size: 1.1rem;">L: ${details.l || sub.l || 2} | T: ${details.t || sub.t || 0} | P: ${details.p || sub.p || 0}</strong>
            </div>
            <div>
              <span style="color: #6b7280; display: block; font-size: 0.85rem;">Evaluation Pattern</span>
              <strong style="color: #111827; font-size: 1.1rem;">CA: ${details.gradingScheme?.continuous_assessment || '50'}% | ETE: ${details.gradingScheme?.end_term || '30'}%</strong>
            </div>
          </div>
        </section>

        <!-- Complete Unit-by-Unit Syllabus -->
        ${details.units.length > 0 ? `
        <section style="margin-bottom: 40px;">
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #111827; margin-bottom: 20px;">
            ${details.code} Unit-Wise Detailed Syllabus
          </h2>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${details.units.map(u => `
              <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: #ffffff;">
                <h3 style="font-size: 1.15rem; font-weight: 700; color: #ea580c; margin: 0 0 8px;">
                  Unit ${u.unitNumber}: ${u.title}
                </h3>
                ${u.content ? `
                  <p style="margin: 0; font-size: 0.95rem; color: #4b5563; line-height: 1.6;">
                    ${u.content}
                  </p>
                ` : `
                  <p style="margin: 0; font-size: 0.95rem; color: #6b7280; line-height: 1.6;">
                    Detailed lecture materials, unit questions, and revision summaries available inside the Scholix portal.
                  </p>
                `}
              </div>
            `).join('\n')}
          </div>
        </section>
        ` : ''}

        <!-- Frequently Asked Questions -->
        <section style="margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 32px;">
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #111827; margin-bottom: 20px;">
            Frequently Asked Questions (FAQs)
          </h2>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
              <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 6px;">How to download ${details.code} LPU notes for free?</h3>
              <p style="margin: 0; font-size: 0.95rem; color: #4b5563; line-height: 1.5;">Click the "Open in Scholix App" button above to view all verified handwritten notes, slides, and summary PDFs with zero signup required.</p>
            </div>
            <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
              <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 6px;">Where can I find ${details.code} previous year questions (PYQs)?</h3>
              <p style="margin: 0; font-size: 0.95rem; color: #4b5563; line-height: 1.5;">Scholix maintains an extensive archive of LPU Mid-Term (MTE) and End-Term (ETE) question papers with solution guides.</p>
            </div>
            <div style="padding: 18px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
              <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 6px;">What is the pass percentage &amp; grading for ${details.code}?</h3>
              <p style="margin: 0; font-size: 0.95rem; color: #4b5563; line-height: 1.5;">Passing criteria follow LPU academic regulations with combined evaluation across Continuous Assessments, Attendance, and End-Term Examination.</p>
            </div>
          </div>
        </section>
      </article>
    `;

    // Push main subject route
    routes.push({
      path: subjectPath,
      title: subjectTitle,
      description: subjectDescription,
      contentHtml: contentHtml,
      schemaJson: courseSchema
    });

    // Push category sub-routes
    const categories = [
      {
        slug: 'notes',
        label: 'Handwritten Notes & Slides',
        title: `${details.code} LPU Handwritten Notes & Slides PDF | ${details.title} - Scholix`,
        desc: `Download verified unit-wise handwritten notes, lecture slides, and summary PDFs for LPU course ${details.code}: ${details.title}.`
      },
      {
        slug: 'pyqs',
        label: 'Previous Year Question Papers (PYQs)',
        title: `${details.code} LPU PYQs & Previous Year Papers | ${details.title} - Scholix`,
        desc: `Download LPU ${details.code} (${details.title}) previous year question papers (MTE & ETE) with solutions and answer keys.`
      },
      {
        slug: 'syllabus',
        label: 'Syllabus & Exam Pattern',
        title: `${details.code} LPU Syllabus & Exam Pattern | ${details.title} - Scholix`,
        desc: `Complete official syllabus, grading criteria, and continuous assessment (CA) breakdown for LPU ${details.code} (${details.title}).`
      }
    ];

    categories.forEach(cat => {
      routes.push({
        path: `${subjectPath}/${cat.slug}`,
        title: cat.title,
        description: cat.desc,
        contentHtml: `
          <div style="padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto;">
            <header style="margin-bottom: 30px;">
              <nav style="font-size: 0.9rem; color: #6b7280; margin-bottom: 12px;">
                <a href="${subjectPath}" style="color: #ea580c; text-decoration: none;">← Back to ${details.code}</a>
              </nav>
              <h1 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 10px 0;">${details.code} - ${cat.label}</h1>
              <p style="color: #4b5563; font-size: 1.1rem; line-height: 1.6;">${cat.desc}</p>
            </header>
            <main>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${subjectPath}/${cat.slug}" style="display: inline-block; padding: 14px 32px; background: #ea580c; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Open ${details.code} ${cat.slug.toUpperCase()} in Scholix →</a>
              </div>
            </main>
          </div>
        `
      });
    });
  };

  // 3. Virtual BTech CSE Semesters & Subject Pages
  BTECH_CSE_2025.terms.forEach(term => {
    const termSlug = librarySlug(term.termName, 'semester');
    const termPath = `/lpu/library/btechcse/${termSlug}`;
    
    // Semester route
    routes.push({
      path: termPath,
      title: `BTech CSE ${term.termName} Notes, PYQs & Papers | LPU - Scholix`,
      description: `Download syllabus guides, lecture notes, and PYQs for all subjects in LPU BTech CSE ${term.termName}.`,
      contentHtml: `
        <div style="padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto;">
          <header style="margin-bottom: 30px;">
            <nav style="font-size: 0.9rem; color: #6b7280; margin-bottom: 12px;">
              <a href="/lpu/library/btechcse" style="color: #ea580c; text-decoration: none;">← BTech CSE Library</a>
            </nav>
            <h1 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 10px 0;">${term.termName} Course Resources</h1>
            <p style="color: #4b5563; font-size: 1.1rem; line-height: 1.6;">Select a course below to download study materials, lecture notes, and previous year question papers.</p>
          </header>
          <main>
            <h2 style="font-size: 1.4rem; color: #111827; margin-bottom: 16px;">Core &amp; Elective Courses</h2>
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
              ${term.coreSubjects.map(sub => {
                const subjSlug = librarySlug(`${sub.code}: ${sub.title}`, 'subject');
                return `
                  <a href="${termPath}/${subjSlug}" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; color: #111827; font-weight: 600; background: #ffffff;">
                    <span>${sub.code}: ${sub.title}</span>
                    <span style="font-size: 0.85rem; color: #6b7280; font-weight: 500;">${sub.credits} Credits →</span>
                  </a>
                `;
              }).join('\n')}
            </div>
          </main>
        </div>
      `
    });
    
    term.coreSubjects.forEach(sub => {
      createSubjectRoute(sub, term.termName, termPath, 'lpu', 'BTech CSE');
    });

    term.electiveBaskets.forEach(basket => {
      basket.subjects.forEach(sub => {
        createSubjectRoute(sub, term.termName, termPath, 'lpu', 'BTech CSE');
      });
    });
  });

  // 4. Load database folders (semesters, subjects, categories)
  const { data: dbFolders } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true });

  if (dbFolders) {
    console.log(`Prerendering metadata from ${dbFolders.length} database folders...`);
    const folderMap = new Map<string, any>();
    dbFolders.forEach(f => folderMap.set(f.id, f));

    dbFolders.forEach(f => {
      const uniSlug = getUniversitySlug(f.program);
      const uniName = getUniversityName(uniSlug);
      const progSlug = librarySlug(f.program, 'program');
      
      if (f.type === 'semester') {
        const semSlug = librarySlug(f.name, 'semester');
        const semPath = `/${uniSlug}/library/${progSlug}/${semSlug}`;
        routes.push({
          path: semPath,
          title: `${f.program} ${f.name} Notes & Papers | ${uniName} - Scholix`,
          description: `Access academic notes, question papers, and course guides for ${uniName} ${f.program} ${f.name}.`,
          contentHtml: `
            <div style="padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto;">
              <header style="margin-bottom: 30px;">
                <a href="/${uniSlug}/library/${progSlug}" style="text-decoration: none; color: #ea580c; font-weight: 600;">← Program Library</a>
                <h1 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin-top: 16px;">${f.name} Semester Folders</h1>
              </header>
              <main style="text-align: center; padding: 30px 0;">
                <a href="${semPath}" style="display: inline-block; padding: 14px 30px; background: #ea580c; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Open Semester Library →</a>
              </main>
            </div>
          `
        });
      } else if (f.type === 'subject') {
        let parentSemSlug = '';
        let parentSemName = '';
        if (f.parent_id) {
          const parent = folderMap.get(f.parent_id);
          if (parent) {
            parentSemSlug = librarySlug(parent.name, 'semester');
            parentSemName = parent.name;
          }
        }
        if (parentSemSlug) {
          const termPath = `/${uniSlug}/library/${progSlug}/${parentSemSlug}`;
          const codeMatch = f.name.match(/^([a-zA-Z]{2,4}\d{3})/i);
          const subCode = codeMatch ? codeMatch[1].toUpperCase() : f.name;
          const subTitle = f.name.replace(/^([a-zA-Z]{2,4}\d{3})[:\s-]*/i, '').trim() || f.name;

          createSubjectRoute(
            { code: subCode, title: subTitle },
            parentSemName || 'Semester',
            termPath,
            uniSlug,
            f.program
          );
        }
      }
    });
  }

  // 5. Write routes to dist/
  console.log(`Writing static index.html pages for ${routes.length} paths...`);
  
  routes.forEach(route => {
    const routeDirPath = path.join(distPath, ...route.path.split('/').filter(Boolean));
    const outputFilePath = path.join(routeDirPath, 'index.html');
    
    fs.mkdirSync(routeDirPath, { recursive: true });
    
    let fileHtml = templateHtml;
    
    // Inject Title
    if (fileHtml.includes('<title>')) {
      fileHtml = fileHtml.replace(/<title>[^<]*<\/title>/i, `<title>${route.title}</title>`);
    } else {
      fileHtml = fileHtml.replace('</head>', `<title>${route.title}</title></head>`);
    }
    
    // Inject Meta Description
    const descMeta = `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}">`;
    if (fileHtml.includes('name="description"')) {
      fileHtml = fileHtml.replace(/<meta\s+name="description"[^>]*>/i, descMeta);
    } else {
      fileHtml = fileHtml.replace('</head>', `${descMeta}</head>`);
    }
    
    // FIX 1: Exact Canonical Tag Replacement (Eliminate homepage canonical bug)
    const canonicalUrl = `https://scholix.app${route.path.endsWith('/') ? route.path.slice(0, -1) : route.path}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
    if (fileHtml.includes('rel="canonical"')) {
      fileHtml = fileHtml.replace(/<link\s+rel="canonical"[^>]*\/>/i, canonicalTag);
    } else {
      fileHtml = fileHtml.replace('</head>', `${canonicalTag}</head>`);
    }

    // FIX 2: OpenGraph URL and Tags
    const ogUrlTag = `<meta property="og:url" content="${canonicalUrl}" />`;
    if (fileHtml.includes('property="og:url"')) {
      fileHtml = fileHtml.replace(/<meta\s+property="og:url"[^>]*\/>/i, ogUrlTag);
    } else {
      fileHtml = fileHtml.replace('</head>', `${ogUrlTag}</head>`);
    }

    const ogTitleMeta = `<meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />`;
    const ogDescMeta = `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />`;
    fileHtml = fileHtml.replace('</head>', `${ogTitleMeta}\n${ogDescMeta}\n</head>`);

    // FIX 3: Structured Schema Injection (Course, BreadcrumbList, FAQPage)
    if (route.schemaJson) {
      const customSchemaScript = `<script type="application/ld+json">\n${JSON.stringify(route.schemaJson, null, 2)}\n</script>`;
      fileHtml = fileHtml.replace('</head>', `${customSchemaScript}\n</head>`);
    }
    
    // FIX 4: Visible, SEO-Friendly Pre-rendered Content (NO display:none, NO aria-hidden)
    const staticContainerHtml = `
      <div id="scholix-static-root" style="min-height: 100vh; background-color: #ffffff;">
        ${route.contentHtml}
      </div>
    `;

    if (fileHtml.includes('<div id="root"></div>')) {
      fileHtml = fileHtml.replace('<div id="root"></div>', `<div id="root">${staticContainerHtml}</div>`);
    } else if (fileHtml.includes('<div id="root"')) {
      fileHtml = fileHtml.replace(/(<div id="root"[^>]*>)(<\/div>)/i, `$1${staticContainerHtml}$2`);
    }
    
    fs.writeFileSync(outputFilePath, fileHtml, 'utf8');
  });
  
  console.log(`Pre-rendering completed successfully! Generated static index.html pages for ${routes.length} paths.`);
}

prerender().catch(err => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
