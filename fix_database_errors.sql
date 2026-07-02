-- SQL Script to fix missing database elements causing 400/401/403 console errors
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Ensure status column exists
-- 1. Fix for page_visits 401/403 Error
-- Create the page_visits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.page_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path TEXT UNIQUE NOT NULL,
    visit_count INTEGER DEFAULT 1,
    last_visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and add a policy to allow anyone to read/write for page tracking
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read/write on page_visits" ON public.page_visits;
CREATE POLICY "Allow anonymous read/write on page_visits" ON public.page_visits
FOR ALL USING (true) WITH CHECK (true);

-- 2. Fix for training_leads 400 Bad Request Error
-- Add missing student_id column to training_leads
ALTER TABLE public.training_leads ADD COLUMN IF NOT EXISTS student_id UUID;

-- Ensure status column exists
ALTER TABLE public.training_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
