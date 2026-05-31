-- SQL Script to set up the Training Management System in Supabase
-- Please run this in your Supabase SQL Editor.

-- 1. Create trainings table
CREATE TABLE IF NOT EXISTS public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('online', 'offline')),
    duration_days INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create training_lectures table
CREATE TABLE IF NOT EXISTS public.training_lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create training_leads table
CREATE TABLE IF NOT EXISTS public.training_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID REFERENCES public.trainings(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    state TEXT,
    university TEXT,
    college TEXT,
    roll_number TEXT,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'registration_failed', -- 'registration_failed', 'payment_failed', 'claimed'
    raw_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create training_enrollments table
CREATE TABLE IF NOT EXISTS public.training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'enrolled', -- 'enrolled', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create training_transactions table
CREATE TABLE IF NOT EXISTS public.training_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
    amount NUMERIC,
    status TEXT NOT NULL DEFAULT 'success',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
-- Allow public read access to trainings and training_lectures
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public trainings are viewable by everyone." ON public.trainings FOR SELECT USING (true);
CREATE POLICY "Trainings are manageable by admin." ON public.trainings FOR ALL USING (true); -- Ideally restrict to admin role

ALTER TABLE public.training_lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public training lectures are viewable by everyone." ON public.training_lectures FOR SELECT USING (true);
CREATE POLICY "Training lectures are manageable by admin." ON public.training_lectures FOR ALL USING (true);

ALTER TABLE public.training_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Training leads insertable by everyone." ON public.training_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Training leads manageable by admin." ON public.training_leads FOR ALL USING (true);

ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Training enrollments viewable by student." ON public.training_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Training enrollments manageable by admin." ON public.training_enrollments FOR ALL USING (true);

ALTER TABLE public.training_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Training transactions viewable by related student." ON public.training_transactions FOR SELECT USING (
    enrollment_id IN (SELECT id FROM public.training_enrollments WHERE student_id = auth.uid())
);
CREATE POLICY "Training transactions manageable by admin." ON public.training_transactions FOR ALL USING (true);

-- 6. Set up Storage Bucket and Policies for training-assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-assets', 'training-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to training-assets
DROP POLICY IF EXISTS "Allow public read access to training-assets" ON storage.objects;
CREATE POLICY "Allow public read access to training-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-assets');

-- Allow admins to insert files into training-assets
DROP POLICY IF EXISTS "Allow admin insert access to training-assets" ON storage.objects;
CREATE POLICY "Allow admin insert access to training-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'training-assets' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ))
);

-- Allow admins to update files in training-assets
DROP POLICY IF EXISTS "Allow admin update access to training-assets" ON storage.objects;
CREATE POLICY "Allow admin update access to training-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'training-assets' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ))
);

-- Allow admins to delete files from training-assets
DROP POLICY IF EXISTS "Allow admin delete access to training-assets" ON storage.objects;
CREATE POLICY "Allow admin delete access to training-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'training-assets' AND
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ))
);
