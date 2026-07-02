-- Create Candidate Trainings Table
CREATE TABLE IF NOT EXISTS public.job_campus_candidate_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    training_type TEXT NOT NULL, -- youtube, meet, other
    mode TEXT NOT NULL, -- online, offline
    link TEXT,
    target_postings UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Candidate Vacancies Table
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

-- Enable RLS
ALTER TABLE public.job_campus_candidate_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_campus_candidate_vacancies ENABLE ROW LEVEL SECURITY;

-- Policies for Trainings
CREATE POLICY "Public read access for candidate trainings"
    ON public.job_campus_candidate_trainings FOR SELECT
    USING (true);

CREATE POLICY "Admin full access for candidate trainings"
    ON public.job_campus_candidate_trainings FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policies for Vacancies
CREATE POLICY "Public read access for candidate vacancies"
    ON public.job_campus_candidate_vacancies FOR SELECT
    USING (true);

CREATE POLICY "Admin full access for candidate vacancies"
    ON public.job_campus_candidate_vacancies FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
