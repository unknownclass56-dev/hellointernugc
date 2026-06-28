-- Migration to add sales_rep_id to training_transactions and columns to sales_notes
ALTER TABLE public.training_transactions 
ADD COLUMN IF NOT EXISTS sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.sales_notes 
ADD COLUMN IF NOT EXISTS enrolled_course TEXT,
ADD COLUMN IF NOT EXISTS referral_course TEXT,
ADD COLUMN IF NOT EXISTS enrolled_type TEXT; -- 'training' or 'internship'
