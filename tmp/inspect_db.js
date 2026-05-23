import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Try loading env
let supabaseUrl = '';
let supabaseKey = '';

try {
  const content = fs.readFileSync('./.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'VITE_SUPABASE_URL' || key === 'SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_ANON_KEY' || key === 'SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
} catch (e) {
  console.error("Env read error:", e);
}

if (!supabaseUrl || !supabaseKey) {
  try {
    const content = fs.readFileSync('./.env', 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key === 'VITE_SUPABASE_URL' || key === 'SUPABASE_URL') supabaseUrl = val;
        if (key === 'VITE_SUPABASE_ANON_KEY' || key === 'SUPABASE_ANON_KEY') supabaseKey = val;
      }
    });
  } catch (e) {}
}

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('folders').select('*');
  if (error) {
    console.error(error);
    return;
  }
  console.log("Folders retrieved count:", data.length);
  // Show key rows
  data.forEach(f => {
    console.log(`ID: ${f.id} | Name: ${f.name} | Type: ${f.type} | Program: ${f.program} | Parent: ${f.parent_id}`);
  });
}
run();
