-- ============================================================
-- Run this in your Supabase project:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. Candidate Trainings Table
CREATE TABLE IF NOT EXISTS public.job_campus_candidate_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    training_type TEXT NOT NULL, -- youtube, meet, other
    mode TEXT NOT NULL,          -- online, offline
    link TEXT,
    target_postings UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Candidate Vacancies Table
CREATE TABLE IF NOT EXISTS public.job_campus_candidate_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title TEXT NOT NULL,
    salary TEXT,
    experience TEXT,
    description TEXT,
    apply_link TEXT,
    posting_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_postings UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.job_campus_candidate_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_campus_candidate_vacancies ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — Trainings
DROP POLICY IF EXISTS "Public read access for candidate trainings" ON public.job_campus_candidate_trainings;
CREATE POLICY "Public read access for candidate trainings"
    ON public.job_campus_candidate_trainings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin full access for candidate trainings" ON public.job_campus_candidate_trainings;
CREATE POLICY "Admin full access for candidate trainings"
    ON public.job_campus_candidate_trainings FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- 5. RLS Policies — Vacancies
DROP POLICY IF EXISTS "Public read access for candidate vacancies" ON public.job_campus_candidate_vacancies;
CREATE POLICY "Public read access for candidate vacancies"
    ON public.job_campus_candidate_vacancies FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin full access for candidate vacancies" ON public.job_campus_candidate_vacancies;
CREATE POLICY "Admin full access for candidate vacancies"
    ON public.job_campus_candidate_vacancies FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));
