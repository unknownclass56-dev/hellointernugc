-- Create a secure RPC function to allow admins to upsert profile roles
CREATE OR REPLACE FUNCTION admin_update_profile_role(p_user_id UUID, p_role TEXT)
RETURNS void AS $$
DECLARE
    v_email TEXT;
    v_name TEXT;
BEGIN
    -- Check if the calling user is an admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Not authorized. Only admins can update roles.';
    END IF;

    -- Get email and name from auth.users just in case we need to insert
    SELECT email, raw_user_meta_data->>'full_name' INTO v_email, v_name 
    FROM auth.users WHERE id = p_user_id;

    -- Upsert the profile role
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (p_user_id, v_email, v_name, p_role)
    ON CONFLICT (id) DO UPDATE SET role = p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
