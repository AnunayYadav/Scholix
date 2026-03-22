const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Replace these or ensure they are in your environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.error("Please set SUPABASE_URL and SUPABASE_ANON_KEY first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const questions = JSON.parse(fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/Anunayy/AntiGravity/LPU-Nexus/tmp/all_questions.json', 'utf8'));

async function uploadInChunks(data, chunkSize = 500) {
  console.log(`Total questions to upload: ${data.length}`);
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    console.log(`Uploading chunk ${i / chunkSize + 1} (${chunk.length} items)...`);
    
    const { error } = await supabase.from('questions').upsert(chunk, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error uploading chunk ${i}:`, error.message);
    } else {
      console.log(`Chunk ${i / chunkSize + 1} uploaded successfully.`);
    }
  }
  
  console.log("Migration finished!");
}

uploadInChunks(questions);
