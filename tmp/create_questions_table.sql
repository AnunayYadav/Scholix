-- 1. Create the questions table with individual fields
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    unit INTEGER NOT NULL,
    topic TEXT,
    difficulty TEXT,
    question_type TEXT NOT NULL, -- MCQ, PYQ, Case Study
    type TEXT NOT NULL, -- mcq, subjective, coding
    question TEXT NOT NULL,
    options JSONB, -- For MCQ options (array of strings)
    correct_answer TEXT,
    explanation TEXT,
    starter_code TEXT, -- For coding questions
    test_cases JSONB, -- For coding test cases
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_subject_unit ON public.questions(subject, unit);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);

-- 3. Security policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view questions" ON public.questions 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage questions" ON public.questions;
CREATE POLICY "Authenticated users can manage questions" ON public.questions 
FOR ALL WITH CHECK (auth.uid() IS NOT NULL);
