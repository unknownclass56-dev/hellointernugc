-- Create a secure RPC function to allow admins to update profile roles
CREATE OR REPLACE FUNCTION admin_update_profile_role(p_user_id UUID, p_role TEXT)
RETURNS void AS $$
BEGIN
    -- Check if the calling user is an admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Not authorized. Only admins can update roles.';
    END IF;

    -- Update the profile role
    UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
