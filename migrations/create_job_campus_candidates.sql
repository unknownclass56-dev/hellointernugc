-- Create job_campus_candidates table to keep candidates separate from internship_students
CREATE TABLE IF NOT EXISTS public.job_campus_candidates (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    contact_number TEXT,
    program TEXT,
    degree TEXT,
    college_name TEXT,
    academic_session TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_campus_candidates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Candidates can read own data"
    ON public.job_campus_candidates FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Candidates can insert own data"
    ON public.job_campus_candidates FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "Candidates can update own data"
    ON public.job_campus_candidates FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admin full access"
    ON public.job_campus_candidates FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
