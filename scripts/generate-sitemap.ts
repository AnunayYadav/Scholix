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
  console.error("Error: Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Static list of programs
const LPU_PROGRAMS = ["BTech CSE", "BTech IT", "BCA", "MCA", "MBA", "BCom", "BA"];
const IITM_PROGRAMS = ["BS Data Science"]; // standard for IITM if any, or retrieved from database

// Helper to determine university slug from program
const getUniversitySlug = (program: string): string => {
  const norm = program.toLowerCase();
  if (norm.includes('data science') || norm.includes('iitm')) {
    return 'iitm';
  }
  return 'lpu';
};

async function generate() {
  console.log("Generating sitemap...");
  const currentDate = new Date().toISOString().split('T')[0];
  const urls: string[] = [];

  // 1. Static base routes
  const baseRoutes = [
    { loc: 'https://scholix.app/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://scholix.app/welcome', priority: '0.9', changefreq: 'monthly' },
    { loc: 'https://scholix.app/about-scholix', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://scholix.app/privacy-policy', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://scholix.app/terms', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://scholix.app/contact', priority: '0.6', changefreq: 'monthly' },
    
    // LPU entry points
    { loc: 'https://scholix.app/lpu', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/library', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/quiz', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/campus', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://scholix.app/lpu/campus/mess', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/campus/map', priority: '0.7', changefreq: 'monthly' },
    { loc: 'https://scholix.app/lpu/campus/market', priority: '0.7', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/placement', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://scholix.app/lpu/attendance', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://scholix.app/lpu/cgpa', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://scholix.app/lpu/timetable', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://scholix.app/lpu/freshers', priority: '0.7', changefreq: 'monthly' },
    { loc: 'https://scholix.app/lpu/ai-tools', priority: '0.7', changefreq: 'weekly' },
    { loc: 'https://scholix.app/lpu/marketplace', priority: '0.7', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/roommate', priority: '0.7', changefreq: 'daily' },
    { loc: 'https://scholix.app/lpu/emergency', priority: '0.6', changefreq: 'monthly' },

    // IITM entry points
    { loc: 'https://scholix.app/iitm', priority: '0.8', changefreq: 'daily' },
    { loc: 'https://scholix.app/iitm/library', priority: '0.7', changefreq: 'daily' },
    { loc: 'https://scholix.app/iitm/quiz', priority: '0.7', changefreq: 'daily' },
    { loc: 'https://scholix.app/iitm/timetable', priority: '0.7', changefreq: 'weekly' },
  ];

  baseRoutes.forEach(r => {
    urls.push(buildUrlNode(r.loc, currentDate, r.changefreq, r.priority));
  });

  // 2. Add Program Entry Library routes
  const allPrograms = Array.from(new Set([...LPU_PROGRAMS, ...IITM_PROGRAMS]));
  allPrograms.forEach(prog => {
    const uniSlug = getUniversitySlug(prog);
    urls.push(buildUrlNode(`https://scholix.app/${uniSlug}/library/${slugify(prog)}`, currentDate, 'daily', '0.8'));
  });

  // 3. Add Virtual Curriculum folders for BTech CSE
  const btechTermMap = new Map<string, string>(); // virtual term ID -> slug
  const btechSubjMap = new Map<string, { termSlug: string; nameSlug: string }>(); // virtual subj ID -> term & subj slug

  BTECH_CSE_2025.terms.forEach(term => {
    const termSlug = slugify(term.termName);
    btechTermMap.set(`v-sem-${term.termNumber}`, termSlug);
    
    // Add term URL
    urls.push(buildUrlNode(`https://scholix.app/lpu/library/btech-cse/${termSlug}`, currentDate, 'weekly', '0.7'));

    const addSubject = (subj: any) => {
      const subjectName = `${subj.code}: ${subj.title}`;
      const subjSlug = slugify(subjectName);
      btechSubjMap.set(`v-sub-${term.termNumber}-${subj.code.toLowerCase()}`, { termSlug, nameSlug: subjSlug });
      
      // Add subject URL
      urls.push(buildUrlNode(`https://scholix.app/lpu/library/btech-cse/${termSlug}/${subjSlug}`, currentDate, 'daily', '0.6'));
    };

    term.coreSubjects.forEach(addSubject);
    term.electiveBaskets.forEach(basket => {
      basket.subjects.forEach(addSubject);
    });
  });

  // 4. Load database folders
  const { data: dbFolders, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Failed to fetch folders from Supabase:", error);
  } else if (dbFolders) {
    console.log(`Fetched ${dbFolders.length} folders from Supabase.`);

    // Build parent-child relationships and map DB ids to names/slugs
    const folderMap = new Map<string, any>();
    dbFolders.forEach(f => {
      folderMap.set(f.id, f);
    });

    dbFolders.forEach(f => {
      const uniSlug = getUniversitySlug(f.program);
      const progSlug = slugify(f.program);

      if (f.type === 'semester') {
        const semSlug = slugify(f.name);
        urls.push(buildUrlNode(`https://scholix.app/${uniSlug}/library/${progSlug}/${semSlug}`, currentDate, 'weekly', '0.7'));
      } else if (f.type === 'subject') {
        let parentSemSlug = '';
        if (f.parent_id) {
          if (f.parent_id.startsWith('v-sem-')) {
            parentSemSlug = btechTermMap.get(f.parent_id) || '';
          } else {
            const parent = folderMap.get(f.parent_id);
            if (parent) parentSemSlug = slugify(parent.name);
          }
        }
        if (parentSemSlug) {
          const subjSlug = slugify(f.name);
          urls.push(buildUrlNode(`https://scholix.app/${uniSlug}/library/${progSlug}/${parentSemSlug}/${subjSlug}`, currentDate, 'daily', '0.6'));
        }
      } else if (f.type === 'category') {
        let parentSubjSlug = '';
        let grandparentSemSlug = '';

        if (f.parent_id) {
          if (f.parent_id.startsWith('v-sub-')) {
            const virtualSubj = btechSubjMap.get(f.parent_id);
            if (virtualSubj) {
              parentSubjSlug = virtualSubj.nameSlug;
              grandparentSemSlug = virtualSubj.termSlug;
            }
          } else {
            const parentSubj = folderMap.get(f.parent_id);
            if (parentSubj) {
              parentSubjSlug = slugify(parentSubj.name);
              if (parentSubj.parent_id) {
                if (parentSubj.parent_id.startsWith('v-sem-')) {
                  grandparentSemSlug = btechTermMap.get(parentSubj.parent_id) || '';
                } else {
                  const grandparentSem = folderMap.get(parentSubj.parent_id);
                  if (grandparentSem) grandparentSemSlug = slugify(grandparentSem.name);
                }
              }
            }
          }
        }

        if (parentSubjSlug && grandparentSemSlug) {
          const catSlug = slugify(f.name);
          urls.push(buildUrlNode(`https://scholix.app/${uniSlug}/library/${progSlug}/${grandparentSemSlug}/${parentSubjSlug}/${catSlug}`, currentDate, 'daily', '0.5'));
        }
      }
    });
  }

  // 5. Build sitemap.xml content
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const destPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(destPath, sitemapXml, 'utf8');
  console.log(`Sitemap successfully written to ${destPath}`);
}

function buildUrlNode(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

generate().catch(err => {
  console.error("Sitemap generation error:", err);
  process.exit(1);
});
