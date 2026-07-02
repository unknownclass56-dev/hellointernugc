-- ============================================================
-- FIX: Referral Portal Login - "Database error querying schema"
-- Run this ENTIRE script in your Supabase SQL Editor
-- ============================================================

-- STEP 1: Fix profiles role constraint to include 'referral'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'student', 'training', 'company', 'sales', 'candidate', 'referral', 'counselor'));

-- STEP 2: Create referral_agents table (safe, won't fail if already exists)
CREATE TABLE IF NOT EXISTS public.referral_agents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    bank_account_number TEXT,
    ifsc TEXT,
    bank_name TEXT,
    aadhar_number TEXT,
    upi_id TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    program TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Enable Row Level Security on referral_agents
ALTER TABLE public.referral_agents ENABLE ROW LEVEL SECURITY;

-- STEP 4: Drop old policies if they exist (safe cleanup)
DROP POLICY IF EXISTS "Admins have full access to referral agents" ON public.referral_agents;
DROP POLICY IF EXISTS "Referrals can read own profile" ON public.referral_agents;
DROP POLICY IF EXISTS "Referrals can update own profile" ON public.referral_agents;

-- STEP 5: Create RLS policies
CREATE POLICY "Admins have full access to referral agents"
    ON public.referral_agents FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Referrals can read own profile"
    ON public.referral_agents FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Referrals can update own profile"
    ON public.referral_agents FOR UPDATE
    USING (id = auth.uid());

-- STEP 6: Add referral_code columns to existing tables (safe)
ALTER TABLE public.internship_students ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.training_enrollments ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.job_campus_enrollments ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- STEP 7: Add page_visits table (fixes 404 errors in admin dashboard)
CREATE TABLE IF NOT EXISTS public.page_visits (
    id BIGSERIAL PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    visit_count BIGINT DEFAULT 0,
    last_visited_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read page_visits" ON public.page_visits;
CREATE POLICY "Admins can read page_visits" ON public.page_visits FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- STEP 8: Add current_session_id to profiles (for single device login security)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_session_id TEXT;

-- STEP 9: Create the admin RPC function to create referral users
CREATE OR REPLACE FUNCTION admin_create_referral_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_phone TEXT,
    p_bank_account_number TEXT,
    p_ifsc TEXT,
    p_bank_name TEXT,
    p_aadhar_number TEXT,
    p_upi_id TEXT,
    p_referral_code TEXT,
    p_program TEXT
) RETURNS json AS $$
DECLARE
    new_user_id UUID;
    encrypted_pw TEXT;
    admin_id UUID;
    admin_role TEXT;
BEGIN
    admin_id := auth.uid();
    SELECT role INTO admin_role FROM public.profiles WHERE id = admin_id;
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can create referral users.';
    END IF;

    encrypted_pw := crypt(p_password, gen_salt('bf'));
    new_user_id := gen_random_uuid();

    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
        new_user_id, '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', p_email, encrypted_pw,
        NOW(), NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('full_name', p_name),
        false
    );

    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), new_user_id,
        json_build_object('sub', new_user_id::text, 'email', p_email),
        'email', new_user_id::text, NOW(), NOW(), NOW()
    );

    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES (new_user_id, p_name, p_email, 'referral', p_phone)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'referral', 
        full_name = EXCLUDED.full_name, 
        phone = EXCLUDED.phone;

    INSERT INTO public.referral_agents (
        id, name, email, phone, bank_account_number, ifsc, bank_name,
        aadhar_number, upi_id, referral_code, program
    ) VALUES (
        new_user_id, p_name, p_email, p_phone, p_bank_account_number,
        p_ifsc, p_bank_name, p_aadhar_number, p_upi_id, p_referral_code, p_program
    );

    RETURN json_build_object('success', true, 'user_id', new_user_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 10: Reload PostgREST schema cache (THIS FIXES the "querying schema" error)
NOTIFY pgrst, 'reload schema';
