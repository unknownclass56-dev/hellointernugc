-- Migration for Job Campus feature

CREATE TABLE IF NOT EXISTS public.job_campus_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    salary TEXT,
    training_fee NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_campus_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posting_id UUID REFERENCES public.job_campus_postings(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(posting_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS public.job_campus_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES public.job_campus_enrollments(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_campus_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_campus_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_campus_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for job_campus_postings
CREATE POLICY "Public read access to job postings"
    ON public.job_campus_postings FOR SELECT
    USING (true);

CREATE POLICY "Admin full access to job postings"
    ON public.job_campus_postings FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policies for job_campus_enrollments
CREATE POLICY "Candidates can read their own enrollments"
    ON public.job_campus_enrollments FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY "Admin full access to job enrollments"
    ON public.job_campus_enrollments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policies for job_campus_transactions
CREATE POLICY "Candidates can read their own transactions"
    ON public.job_campus_transactions FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.job_campus_enrollments WHERE id = enrollment_id AND candidate_id = auth.uid()));

CREATE POLICY "Admin full access to job transactions"
    ON public.job_campus_transactions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
