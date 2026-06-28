-- SQL Script to fix the check constraint on profiles role column
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. First, we will drop the old check constraint if it exists.
-- This DO block dynamically finds and drops any check constraints on the 'role' column of the 'profiles' table.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'profiles' 
          AND ccu.column_name = 'role' 
          AND tc.constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
    END LOOP;
END $$;

-- 2. Add the updated check constraint to allow 'admin', 'student', and 'training' roles.
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'training'));

-- 3. Update any existing training students' profiles to have the proper 'training' role in the DB.
-- Any student with training enrollments will get their role updated to 'training'.
UPDATE public.profiles
SET role = 'training'
WHERE id IN (SELECT DISTINCT student_id FROM public.training_enrollments);
