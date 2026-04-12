# 🚀 Scholix

**Scholix** is a comprehensive, AI-powered student utility platform designed to empower students across multiple universities. Originally built as LPU-Nexus, it has evolved into a multi-tenant ecosystem starting with Lovely Professional University.

---

## ⚙️ Database Setup (Supabase)

Run these scripts in your **Supabase SQL Editor** to enable all features:

### 1. Core & Library Tables
(Follow previous README sections for profiles, folders, and documents...)

### 2. Question Bank Registry (For Quiz Taker Optimization)
```sql
CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_name TEXT NOT NULL,
    unit_number INTEGER NOT NULL,
    questions JSONB NOT NULL, -- Array of QuizQuestion objects
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(subject_name, unit_number)
);

ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view question banks" ON public.question_banks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can contribute to banks" ON public.question_banks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. User History & Records
(Follow previous README sections...)
