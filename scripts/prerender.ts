import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { BTECH_CSE_2025 } from '../data/curriculumData';
import { slugify } from '../utils/slugify';

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

async function prerender() {
  console.log("Starting static page pre-rendering (SPA SEO optimization)...");
  
  const distPath = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(templatePath)) {
    console.error("Error: dist/index.html not found! Run 'vite build' first.");
    process.exit(1);
  }
  
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  
  // List of generated static routes
  const routes: { path: string; title: string; description: string; contentHtml: string }[] = [];
  
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
      title: 'LPU Student Portal | Notes, Attendance & Tools - Scholix',
      description: 'Access the Lovely Professional University gateway. Track hostel mess menus, attendance, CGPA, class schedules, and download course notes.'
    },
    {
      path: '/lpu/library',
      title: 'LPU Content Library | Notes & PYQs - Scholix',
      description: 'Browse LPU courses and semesters. Download handwritten notes, lecture files, syllabus, and previous year exam papers (PYQs).'
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
        <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
          <header style="text-align: center; margin-bottom: 40px;">
            <img src="/Scholix_dark.webp" alt="Scholix Logo" style="height: 50px; margin-bottom: 20px;" />
            <h1 style="font-size: 2.2rem; color: #111; margin-top: 10px;">${r.title.split(' | ')[0]}</h1>
            <p style="color: #666; font-size: 1.1rem; line-height: 1.6; max-width: 600px; margin: 15px auto 0;">${r.description}</p>
          </header>
          <main style="border-top: 1px solid #eaeaea; padding-top: 30px; margin-top: 30px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <a href="${r.path}" style="display: inline-block; padding: 14px 28px; background: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 14px rgba(249,115,22,0.3); transition: transform 0.2s;">Enter Interactive Portal</a>
            </div>
            <section style="margin-top: 40px;">
              <h2 style="font-size: 1.4rem; color: #222; margin-bottom: 15px;">Platform Highlights</h2>
              <ul style="line-height: 1.8; color: #444; font-size: 0.95rem; padding-left: 20px;">
                <li><strong>Centralized Library:</strong> Hand-picked, peer-reviewed subject notes, assignments, and PYQs.</li>
                <li><strong>Smart Tools:</strong> Safe-bunk trackers, GPA estimators, and resume analyzers.</li>
                <li><strong>Community Forums:</strong> Active marketplace and roommate listings for university housing.</li>
              </ul>
            </section>
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
    const progSlug = slugify(prog);
    const routePath = `/${uniSlug}/library/${progSlug}`;
    
    routes.push({
      path: routePath,
      title: `${prog} Notes & Study Guides | ${uniName} - Scholix`,
      description: `Browse all course folders, assignments, syllabus details, and previous year papers for ${uniName} ${prog} curriculum.`,
      contentHtml: `
        <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
          <header style="margin-bottom: 40px;">
            <a href="/" style="text-decoration: none; color: #f97316; font-weight: 600;">← Back to Home</a>
            <h1 style="font-size: 2.2rem; color: #111; margin-top: 20px;">${prog} Academic Directory</h1>
            <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-top: 10px;">Access notes, curriculum structures, and previous year exam questions for ${uniName} ${prog}.</p>
          </header>
          <main>
            <div style="text-align: center; margin-bottom: 40px;">
              <a href="${routePath}" style="display: inline-block; padding: 14px 28px; background: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Open Program Library</a>
            </div>
            <h2 style="font-size: 1.4rem; color: #222; margin-bottom: 15px;">Available Terms / Semesters</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
              ${BTECH_CSE_2025.terms.map(t => {
                const termSlug = slugify(t.termName);
                return `
                  <a href="${routePath}/${termSlug}" style="display: block; padding: 15px; border: 1px solid #eaeaea; border-radius: 12px; text-decoration: none; color: #333; font-weight: 600; text-align: center;">
                    ${t.termName}
                  </a>
                `;
              }).join('\n')}
            </div>
          </main>
        </div>
      `
    });
  });

  // 3. Virtual BTech CSE Semesters & Subject Pages
  BTECH_CSE_2025.terms.forEach(term => {
    const termSlug = slugify(term.termName);
    const termPath = `/lpu/library/btech-cse/${termSlug}`;
    
    // Semester route
    routes.push({
      path: termPath,
      title: `BTech CSE ${term.termName} Handwritten Notes & Papers | LPU - Scholix`,
      description: `Download syllabus guides, study records, and PYQs for all subjects in LPU BTech CSE ${term.termName}.`,
      contentHtml: `
        <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
          <header style="margin-bottom: 40px;">
            <a href="/lpu/library/btech-cse" style="text-decoration: none; color: #f97316; font-weight: 600;">← BTech CSE Library</a>
            <h1 style="font-size: 2.2rem; color: #111; margin-top: 20px;">${term.termName} Course Resources</h1>
            <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-top: 10px;">Select a subject below to download study materials, lecture records, and previous semester question papers.</p>
          </header>
          <main>
            <h2 style="font-size: 1.4rem; color: #222; margin-bottom: 15px;">Course Subjects</h2>
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
              ${term.coreSubjects.map(sub => {
                const subjSlug = slugify(`${sub.code}: ${sub.title}`);
                return `
                  <a href="${termPath}/${subjSlug}" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border: 1px solid #eaeaea; border-radius: 12px; text-decoration: none; color: #333; font-weight: 600;">
                    <span>${sub.code}: ${sub.title}</span>
                    <span style="font-size: 0.85rem; color: #888; font-weight: normal;">${sub.credits} Credits</span>
                  </a>
                `;
              }).join('\n')}
            </div>
          </main>
        </div>
      `
    });
    
    // Subject route inside semester
    const addSubjectRoute = (sub: any) => {
      const subjectName = `${sub.code}: ${sub.title}`;
      const subjSlug = slugify(subjectName);
      const subjectPath = `${termPath}/${subjSlug}`;
      
      routes.push({
        path: subjectPath,
        title: `${sub.code} ${sub.title} Study Material | LPU ${term.termName} - Scholix`,
        description: `Handwritten notes, assignments, PYQs, and lecture material for LPU course ${sub.code} (${sub.title}).`,
        contentHtml: `
          <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
            <header style="margin-bottom: 40px;">
              <a href="${termPath}" style="text-decoration: none; color: #f97316; font-weight: 600;">← ${term.termName}</a>
              <h1 style="font-size: 2.2rem; color: #111; margin-top: 20px;">${sub.code}: ${sub.title}</h1>
              <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-top: 10px;">Course syllabus: Lectures ${sub.l}, Tutorials ${sub.t}, Practicals ${sub.p}. Total credits: ${sub.credits}.</p>
            </header>
            <main>
              <div style="text-align: center; margin-bottom: 40px;">
                <a href="${subjectPath}" style="display: inline-block; padding: 14px 28px; background: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Open Notes Library for ${sub.code}</a>
              </div>
              <h2 style="font-size: 1.4rem; color: #222; margin-bottom: 15px;">Study Resource Categories</h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <a href="${subjectPath}/notes" style="display: block; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; text-decoration: none; color: #333; text-align: center; font-weight: 600;">
                  <div style="font-size: 1.5rem; margin-bottom: 5px;">📝</div>
                  Notes & Slides
                </a>
                <a href="${subjectPath}/pyqs" style="display: block; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; text-decoration: none; color: #333; text-align: center; font-weight: 600;">
                  <div style="font-size: 1.5rem; margin-bottom: 5px;">📄</div>
                  PYQ Papers
                </a>
                <a href="${subjectPath}/syllabus" style="display: block; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; text-decoration: none; color: #333; text-align: center; font-weight: 600;">
                  <div style="font-size: 1.5rem; margin-bottom: 5px;">📜</div>
                  Syllabus
                </a>
              </div>
            </main>
          </div>
        `
      });
      
      // Category routes: notes, pyqs, syllabus
      const categories = ['notes', 'pyqs', 'syllabus'];
      categories.forEach(cat => {
        routes.push({
          path: `${subjectPath}/${cat}`,
          title: `${sub.code} ${sub.title} ${cat.toUpperCase()} | LPU - Scholix`,
          description: `Download the latest verified ${cat} study materials for LPU course ${sub.code}: ${sub.title}.`,
          contentHtml: `
            <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
              <header style="margin-bottom: 40px;">
                <a href="${subjectPath}" style="text-decoration: none; color: #f97316; font-weight: 600;">← Back to Subject</a>
                <h1 style="font-size: 2.2rem; color: #111; margin-top: 20px;">${sub.code} - ${cat.toUpperCase()}</h1>
                <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-top: 10px;">Verified academic ${cat} uploaded by student community for ${sub.title}.</p>
              </header>
              <main>
                <div style="text-align: center; margin-bottom: 40px;">
                  <a href="${subjectPath}/${cat}" style="display: inline-block; padding: 14px 28px; background: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Enter Portal to Access Documents</a>
                </div>
              </main>
            </div>
          `
        });
      });
    };

    term.coreSubjects.forEach(addSubjectRoute);
    term.electiveBaskets.forEach(basket => {
      basket.subjects.forEach(addSubjectRoute);
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
      const progSlug = slugify(f.program);
      
      if (f.type === 'semester') {
        const semSlug = slugify(f.name);
        const semPath = `/${uniSlug}/library/${progSlug}/${semSlug}`;
        routes.push({
          path: semPath,
          title: `${f.program} ${f.name} Notes & Papers | ${uniName} - Scholix`,
          description: `Access academic notes, question papers, and course guides for ${uniName} ${f.program} ${f.name}.`,
          contentHtml: `
            <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
              <header style="margin-bottom: 40px;">
                <a href="/${uniSlug}/library/${progSlug}" style="text-decoration: none; color: #f97316; font-weight: 600;">← Program Library</a>
                <h1 style="font-size: 2.2rem; color: #111; margin-top: 20px;">${f.name} Semester Folders</h1>
              </header>
              <main style="text-align: center; padding: 40px 0;">
                <a href="${semPath}" style="display: inline-block; padding: 14px 28px; background: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Open Semester Library</a>
              </main>
            </div>
          `
        });
      } else if (f.type === 'subject') {
        let parentSemSlug = '';
        if (f.parent_id) {
          const parent = folderMap.get(f.parent_id);
          if (parent) parentSemSlug = slugify(parent.name);
        }
        if (parentSemSlug) {
          const subjSlug = slugify(f.name);
          const subjPath = `/${uniSlug}/library/${progSlug}/${parentSemSlug}/${subjSlug}`;
          routes.push({
            path: subjPath,
            title: `${f.name} Study Resources | ${uniName} ${parentSemSlug} - Scholix`,
            description: `Handwritten lecture notes, midterm PYQs, and class assignments for ${f.name} at ${uniName}.`,
            contentHtml: `
              <div style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
                <header style="margin-bottom: 40px;">
                  <a href="/${uniSlug}/library/${progSlug}/${parentSemSlug}" style="text-decoration: none; color: #f97316; font-weight: 600;">← Semester</a>
                  <h1 style="font-size: 2.2rem; color: #111; margin-top: 20px;">${f.name}</h1>
                </header>
                <main style="text-align: center; padding: 40px 0;">
                  <a href="${subjPath}" style="display: inline-block; padding: 14px 28px; background: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">Access ${f.name} Documents</a>
                </main>
              </div>
            `
          });
        }
      }
    });
  }


  // 6. Write routes to dist/
  routes.forEach(route => {
    // Determine the directory and file path
    const routeDirPath = path.join(distPath, ...route.path.split('/').filter(Boolean));
    const outputFilePath = path.join(routeDirPath, 'index.html');
    
    // Create directory
    fs.mkdirSync(routeDirPath, { recursive: true });
    
    // Inject SEO headers & content template
    let fileHtml = templateHtml;
    
    // Inject Title
    if (fileHtml.includes('<title>')) {
      fileHtml = fileHtml.replace(/<title>[^<]*<\/title>/i, `<title>${route.title}</title>`);
    } else {
      fileHtml = fileHtml.replace('</head>', `<title>${route.title}</title></head>`);
    }
    
    // Inject Meta Description (or replace existing)
    const descMeta = `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}">`;
    if (fileHtml.includes('name="description"')) {
      fileHtml = fileHtml.replace(/<meta name="description"[^>]*>/i, descMeta);
    } else {
      fileHtml = fileHtml.replace('</head>', `${descMeta}</head>`);
    }
    
    // Inject OpenGraph Title & Description
    const ogTitleMeta = `<meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}">`;
    const ogDescMeta = `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}">`;
    fileHtml = fileHtml.replace('</head>', `${ogTitleMeta}${ogDescMeta}</head>`);
    
    // Inject Pre-rendered Content into root div
    if (fileHtml.includes('<div id="root"></div>')) {
      fileHtml = fileHtml.replace('<div id="root"></div>', `<div id="root">${route.contentHtml}</div>`);
    } else if (fileHtml.includes('<div id="root"')) {
      // Handles cases where there's attributes in root div
      fileHtml = fileHtml.replace(/(<div id="root"[^>]*>)(<\/div>)/i, `$1${route.contentHtml}$2`);
    }
    
    // Write index.html
    fs.writeFileSync(outputFilePath, fileHtml, 'utf8');
  });
  
  console.log(`Pre-rendering completed successfully! Generated static index.html pages for ${routes.length} paths.`);
}

prerender().catch(err => {
  console.error("Prerender script failed:", err);
  process.exit(1);
});
