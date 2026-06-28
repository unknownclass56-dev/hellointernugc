-- SQL Script to update profiles_role_check constraint to include 'sales'
-- Run this in your Supabase SQL Editor

-- 1. Drop the old check constraints on the role column of profiles table
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

-- 2. Add the updated check constraint to allow 'admin', 'student', 'training', 'company', and 'sales' roles.
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'training', 'company', 'sales'));
