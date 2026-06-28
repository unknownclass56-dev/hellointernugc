-- SQL Script to completely fix the infinite recursion in the profiles table policies and enable sales access.
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Dynamically drop ALL existing policies on the profiles table to ensure no stray policies remain
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.profiles;';
    END LOOP;
END $$;

-- 2. Create clean, non-recursive policies for the profiles table
-- We check the user's ID or check their role from the JWT metadata directly.
-- This avoids querying the profiles table itself during policy evaluation.

-- POLICY 1: SELECT (Allow users to read their own profile, or admins/sales to read all)
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') IN ('admin', 'sales')
);

-- POLICY 2: INSERT (Allow users to insert their own profile during registration)
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = id 
  OR coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') = 'admin'
);

-- POLICY 3: UPDATE (Allow users to update their own profile, or admins/sales to update all)
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id 
  OR coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') IN ('admin', 'sales')
);

-- POLICY 4: DELETE (Only admins can delete profiles)
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE
USING (
  coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') = 'admin'
);

-- 3. Update other tables' admin policies to be recursion-free as well
DROP POLICY IF EXISTS "Allow admin full access to internship_students" ON public.internship_students;
CREATE POLICY "Allow admin full access to internship_students" ON public.internship_students
FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') IN ('admin', 'sales')
);

DROP POLICY IF EXISTS "Allow admin full access to training_students" ON public.training_students;
CREATE POLICY "Allow admin full access to training_students" ON public.training_students
FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') IN ('admin', 'sales')
);

-- 4. Enable RLS on sales_notes and add columns/policies
ALTER TABLE public.sales_notes ADD COLUMN IF NOT EXISTS followup_date DATE;
ALTER TABLE public.sales_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow sales reps to read own notes" ON public.sales_notes;
CREATE POLICY "Allow sales reps to read own notes" ON public.sales_notes
FOR SELECT USING (
  sales_rep_id = auth.uid() 
  OR coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') = 'admin'
);

DROP POLICY IF EXISTS "Allow sales reps to update own notes" ON public.sales_notes;
CREATE POLICY "Allow sales reps to update own notes" ON public.sales_notes
FOR UPDATE USING (
  sales_rep_id = auth.uid() 
  OR coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') = 'admin'
);

DROP POLICY IF EXISTS "Allow admin all on sales_notes" ON public.sales_notes;
CREATE POLICY "Allow admin all on sales_notes" ON public.sales_notes
FOR ALL USING (
  coalesce((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text, '') = 'admin'
);

DROP POLICY IF EXISTS "Allow anyone to insert sales_notes" ON public.sales_notes;
CREATE POLICY "Allow anyone to insert sales_notes" ON public.sales_notes
FOR INSERT WITH CHECK (
  true
);
