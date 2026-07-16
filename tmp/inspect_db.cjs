const { createClient } = require('@supabase/supabase-js');

const url = 'https://shmwnwftpbqyfrbrrrtv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXdud2Z0cGJxeWZyYnJycnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc2OTA2OSwiZXhwIjoyMDg1MzQ1MDY5fQ.xBCD58w_SFGD__CWLMyq_bC2gcAZDAtlF_TtiAW3dPA';

const supabase = createClient(url, key);

async function inspect() {
  try {
    const { data, error } = await supabase
      .from('community_hub')
      .select('title, content')
      .eq('title', 'vxcvxc')
      .limit(1);
    if (error) {
      console.error('Error fetching post:', error);
    } else {
      console.log('Post from database:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('Execution error:', err);
  }
}

inspect();
