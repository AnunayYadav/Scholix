const { createClient } = require('@supabase/supabase-js');

const url = 'https://shmwnwftpbqyfrbrrrtv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobXdud2Z0cGJxeWZyYnJycnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc2OTA2OSwiZXhwIjoyMDg1MzQ1MDY5fQ.xBCD58w_SFGD__CWLMyq_bC2gcAZDAtlF_TtiAW3dPA';

const supabase = createClient(url, key);

async function testInsert() {
  const dummyString = {
    id: 'test-temp-id-string',
    subject: 'TEST',
    unit: 1,
    topic: 'Test Topic',
    difficulty: 'medium',
    question_type: 'MCQ',
    type: 'mcq',
    question: 'Test Question?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 0,
    explanation: 'Test Explanation'
  };

  const dummyInt = {
    id: 'test-temp-id-int',
    subject: 'TEST',
    unit: 1,
    topic: 'Test Topic',
    difficulty: 2,
    question_type: 'MCQ',
    type: 'mcq',
    question: 'Test Question?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 0,
    explanation: 'Test Explanation'
  };

  console.log('Testing insert with string difficulty ("medium")...');
  const res1 = await supabase.from('questions').insert([dummyString]);
  if (res1.error) {
    console.log('Insert with string FAILED:', res1.error.message, 'Code:', res1.error.code);
  } else {
    console.log('Insert with string SUCCEEDED!');
    // clean it up
    await supabase.from('questions').delete().eq('id', 'test-temp-id-string');
  }

  console.log('\nTesting insert with integer difficulty (2)...');
  const res2 = await supabase.from('questions').insert([dummyInt]);
  if (res2.error) {
    console.log('Insert with integer FAILED:', res2.error.message, 'Code:', res2.error.code);
  } else {
    console.log('Insert with integer SUCCEEDED!');
    // clean it up
    await supabase.from('questions').delete().eq('id', 'test-temp-id-int');
  }
}

testInsert();
