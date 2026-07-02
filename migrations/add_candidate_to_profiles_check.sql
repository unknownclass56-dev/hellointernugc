-- SQL Script to update profiles_role_check constraint to include 'candidate'

-- Step 1: Drop the existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Re-add the constraint with 'candidate' included
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'training', 'company', 'sales', 'candidate'));
