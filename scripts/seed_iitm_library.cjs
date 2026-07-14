const { createClient } = require('@supabase/supabase-js');

const url = "https://shmwnwftpbqyfrbrrrtv.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXdud2Z0cGJxeWZyYnJycnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc2OTA2OSwiZXhwIjoyMDg1MzQ1MDY5fQ.xBCD58w_SFGD__CWLMyq_bC2gcAZDAtlF_TtiAW3dPA";

const supabase = createClient(url, serviceRoleKey);

const program = "BS Data Science";
const university = "iitmuni";

const curriculum = [
  {
    level: "Foundation Level (32 Credits)",
    color: "#0ea5e9", // Light Blue
    subjects: [
      { name: "BSMA1001: Mathematics for Data Science I", color: "#a855f7" },
      { name: "BSMA1002: Statistics for Data Science I", color: "#3b82f6" },
      { name: "BSCS1001: Computational Thinking", color: "#10b981" },
      { name: "BSHS1001: English I", color: "#f59e0b" },
      { name: "BSMA1003: Mathematics for Data Science II", color: "#a855f7" },
      { name: "BSMA1004: Statistics for Data Science II", color: "#3b82f6" },
      { name: "BSCS1002: Programming in Python", color: "#10b981" },
      { name: "BSHS1002: English II", color: "#f59e0b" }
    ]
  },
  {
    level: "Diploma Level - Programming (27 Credits)",
    color: "#a855f7", // Purple
    subjects: [
      { name: "BSCS2001: Database Management Systems", color: "#6366f1" },
      { name: "BSCS2002: Programming, Data Structures and Algorithms using Python", color: "#ec4899" },
      { name: "BSCS2003: Modern Application Development I", color: "#14b8a6" },
      { name: "BSCS2003P: Modern Application Development I - Project", color: "#f43f5e" },
      { name: "BSCS2005: Programming Concepts using Java", color: "#6366f1" },
      { name: "BSCS2006: Modern Application Development II", color: "#14b8a6" },
      { name: "BSCS2006P: Modern Application Development II - Project", color: "#f43f5e" },
      { name: "BSSE2001: System Commands", color: "#0ea5e9" }
    ]
  },
  {
    level: "Diploma Level - Data Science (27 Credits)",
    color: "#ff7a00", // Orange
    subjects: [
      { name: "BSCS2004: Machine Learning Foundations", color: "#f59e0b" },
      { name: "BSMS2001: Business Data Management", color: "#eab308" },
      { name: "BSCS2007: Machine Learning Techniques", color: "#ff7a00" },
      { name: "BSCS2008: Machine Learning Practice", color: "#ff7a00" },
      { name: "BSCS2008P: Machine Learning Practice - Project", color: "#f43f5e" },
      { name: "BSSE2002: Tools in Data Science", color: "#0ea5e9" },
      { name: "BSMS2001P: Business Data Management - Project (Option 1)", color: "#f43f5e" },
      { name: "BSMS2002: Business Analytics (Option 1)", color: "#eab308" },
      { name: "BSDA2001: Introduction to Deep Learning and Generative AI (Option 2)", color: "#8b5cf6" },
      { name: "BSDA2001P: Deep Learning and Generative AI - Project (Option 2)", color: "#f43f5e" }
    ]
  },
  {
    level: "BSc Degree Level (28 Credits)",
    color: "#22c55e", // Green
    subjects: [
      { name: "BSCS3001: Software Engineering", color: "#3b82f6" },
      { name: "BSCS3002: Software Testing", color: "#10b981" },
      { name: "BSGN3001: Strategies for Professional Growth", color: "#f59e0b" },
      { name: "BSBT4001: Algorithmic Thinking in Bioinformatics", color: "#a855f7" },
      { name: "BSBT4002: Big Data and Biological Networks", color: "#a855f7" },
      { name: "BSCS4001: Data Visualization Design", color: "#10b981" },
      { name: "BSEE4001: Speech Technology", color: "#6366f1" },
      { name: "BSMS4002: Design Thinking for Data-Driven App Development", color: "#eab308" },
      { name: "BSMS4001: Industry 4.0", color: "#eab308" },
      { name: "BSMS3002: Market Research", color: "#eab308" },
      { name: "BSCS3005: Programming in C", color: "#3b82f6" },
      { name: "BSMA2001: Mathematical Thinking", color: "#a855f7" },
      { name: "BSMS3033: Managerial Economics", color: "#eab308" },
      { name: "BSMS3034: Corporate Finance", color: "#eab308" },
      { name: "BSMA3001: Discrete Mathematics", color: "#a855f7" }
    ]
  },
  {
    level: "BS Degree Level (28 Credits)",
    color: "#f43f5e", // Rose
    subjects: [
      { name: "BSCS3003: AI: Search Methods for Problem Solving", color: "#3b82f6" },
      { name: "BSCS3004: Deep Learning", color: "#8b5cf6" },
      { name: "BSCS4003: Privacy & Security in Online Social Media", color: "#10b981" },
      { name: "BSDA5001: Introduction to Big Data", color: "#0ea5e9" },
      { name: "BSMS4003: Financial Forensics", color: "#eab308" },
      { name: "BSMA3012: Linear Statistical Models", color: "#a855f7" },
      { name: "BSCS4021: Advanced Algorithms", color: "#ec4899" },
      { name: "BSMA3014: Statistical Computing", color: "#a855f7" },
      { name: "BSCS3031: Computer Systems Design", color: "#6366f1" },
      { name: "BSMS4023: Game Theory and Strategy", color: "#eab308" },
      { name: "BSDA5013: Deep Learning Practice", color: "#8b5cf6" },
      { name: "BSCS4022: Operating Systems", color: "#0ea5e9" },
      { name: "BSDA4001: Data Science and AI Lab", color: "#f43f5e" },
      { name: "BSCS4010: App Dev Lab", color: "#f43f5e" },
      { name: "BSCS4024: Computer Networks", color: "#6366f1" },
      { name: "BSCS3021: Theory of Computation", color: "#10b981" },
      { name: "BSCS4032: Compiler Design", color: "#6366f1" }
    ]
  },
  {
    level: "PG Diploma Level (20 Credits)",
    color: "#eab308", // Yellow
    subjects: [
      { name: "BSDA5014: Machine Learning Operations (MLOps)", color: "#ff7a00" },
      { name: "BSDA5002: Mathematical Foundations of Generative AI", color: "#8b5cf6" },
      { name: "BSDA5003: Algorithms for Data Science", color: "#10b981" },
      { name: "BSDA5004: Large Language Models", color: "#8b5cf6" },
      { name: "BSDA5005: Introduction to Natural Language Processing (i-NLP)", color: "#8b5cf6" },
      { name: "BSDA5006: Deep Learning for Computer Vision", color: "#8b5cf6" },
      { name: "BSDA5007: Reinforcement Learning", color: "#8b5cf6" },
      { name: "BSDA6001: Responsible AI", color: "#22c55e" },
      { name: "BSDA6002: Statistical Learning Theory", color: "#a855f7" },
      { name: "BSDA6003: Deployability Aspects of AI", color: "#0ea5e9" },
      { name: "BSDA6004: Sequential Decision Making", color: "#10b981" },
      { name: "BSDA6005: Information Theory and Learning", color: "#6366f1" },
      { name: "BSEE5001: Speech Technology (PG)", color: "#6366f1" },
      { name: "BSDA6006: Research Project", color: "#f43f5e" }
    ]
  },
  {
    level: "MTech Level (20 Credits)",
    color: "#14b8a6", // Teal
    subjects: [
      { name: "BSDA6901: MTech Project", color: "#f43f5e" }
    ]
  }
];

const categories = ["SYLLABUS", "PYQS", "NOTES", "BOOKS", "OTHERS"];

async function seed() {
  console.log("Cleaning up existing folders for 'BS Data Science' to re-seed...");
  const { error: deleteErr } = await supabase
    .from('library_items')
    .delete()
    .eq('program', program);
    
  if (deleteErr) {
    console.error("Cleanup failed:", deleteErr);
    return;
  }
  
  console.log("Cleanup finished. Seeding library_items for BS Data Science (IITM)...");

  for (let sIdx = 0; sIdx < curriculum.length; sIdx++) {
    const sem = curriculum[sIdx];
    console.log(`Creating Level folder: ${sem.level}`);
    
    // Insert level folder (represented as type 'semester' in database schema)
    const { data: semData, error: semErr } = await supabase.from('library_items').insert([{
      name: sem.level,
      type: 'semester',
      parent_id: null,
      program: program,
      icon_name: 'Folder',
      color: sem.color, // Set specific level color
      display_order: sIdx + 1,
      university: university
    }]).select();

    if (semErr) {
      console.error(`Failed to create level ${sem.level}:`, semErr);
      continue;
    }
    
    const semId = semData[0].id;
    
    for (let subIdx = 0; subIdx < sem.subjects.length; subIdx++) {
      const sub = sem.subjects[subIdx];
      console.log(`  Creating subject: ${sub.name}`);
      
      // Insert subject folder
      const { data: subData, error: subErr } = await supabase.from('library_items').insert([{
        name: sub.name,
        type: 'subject',
        parent_id: semId,
        program: program,
        icon_name: 'Folder',
        color: sub.color,
        display_order: subIdx + 1,
        university: university
      }]).select();
      
      if (subErr) {
        console.error(`  Failed to create subject ${sub.name}:`, subErr);
        continue;
      }
      
      const subId = subData[0].id;
      
      // Insert categories
      const catInserts = categories.map((cat, catIdx) => ({
        name: cat,
        type: 'category',
        parent_id: subId,
        program: program,
        icon_name: cat === 'SYLLABUS' ? 'Calendar' : cat === 'PYQS' ? 'FileText' : cat === 'NOTES' ? 'BookOpen' : cat === 'BOOKS' ? 'Book' : 'MoreHorizontal',
        color: '#6b7280',
        display_order: catIdx + 1,
        university: university
      }));
      
      const { error: catErr } = await supabase.from('library_items').insert(catInserts);
      if (catErr) {
        console.error(`    Failed to create categories for ${sub.name}:`, catErr);
      }
    }
  }
  
  console.log("Seeding complete!");
}

seed().catch(console.error);
