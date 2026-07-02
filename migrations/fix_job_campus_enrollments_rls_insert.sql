-- Allow candidates to insert their own enrollments
CREATE POLICY "Candidates can insert their own enrollments"
    ON public.job_campus_enrollments FOR INSERT
    WITH CHECK (candidate_id = auth.uid());
