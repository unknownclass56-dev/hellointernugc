-- Add current_session_id to profiles for tracking active devices
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_session_id UUID;
