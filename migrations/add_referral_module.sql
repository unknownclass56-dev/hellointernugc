-- Add 'referral' to profiles constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'training', 'company', 'sales', 'candidate', 'referral'));

-- Create Referral Agents Table
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
    program TEXT, -- e.g., 'training', 'internship', 'job_campus'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.referral_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to referral agents"
    ON public.referral_agents FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Referrals can read own profile"
    ON public.referral_agents FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Referrals can update own profile"
    ON public.referral_agents FOR UPDATE
    USING (id = auth.uid());

-- Add referral_code to existing tables
ALTER TABLE public.internship_students ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.training_enrollments ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.job_campus_enrollments ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Secure PostgreSQL Function to create an auth user bypassing RLS (for Admin only)
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
    -- Verify the caller is an admin
    admin_id := auth.uid();
    SELECT role INTO admin_role FROM public.profiles WHERE id = admin_id;
    IF admin_role != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can create referral users.';
    END IF;

    -- Encrypt password
    encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();

    -- Insert into auth.users (requires superuser or bypassrls, which this RPC runs as if security definer)
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        p_email,
        encrypted_pw,
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('full_name', p_name),
        false
    );

    -- Insert into identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_user_id,
        json_build_object('sub', new_user_id, 'email', p_email),
        'email',
        new_user_id::text,
        NOW(),
        NOW(),
        NOW()
    );

    -- Insert into public.profiles
    -- Handle UPSERT safely in case a trigger already created the profile
    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES (new_user_id, p_name, p_email, 'referral', p_phone)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'referral', 
        full_name = EXCLUDED.full_name, 
        phone = EXCLUDED.phone;

    -- Insert into public.referral_agents
    INSERT INTO public.referral_agents (
        id, name, email, phone, bank_account_number, ifsc, bank_name,
        aadhar_number, upi_id, referral_code, program
    ) VALUES (
        new_user_id, p_name, p_email, p_phone, p_bank_account_number, p_ifsc, p_bank_name,
        p_aadhar_number, p_upi_id, p_referral_code, p_program
    );

    RETURN json_build_object('success', true, 'user_id', new_user_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
