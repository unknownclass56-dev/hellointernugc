-- Corrected migration for Sales Dashboard features
-- This file creates the sales_notes table and indexes.
-- It references the Supabase auth.users table for the sales representative.

CREATE TABLE IF NOT EXISTS sales_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sales_rep_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  remark text,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_sales_notes_profile ON sales_notes(profile_id);
CREATE INDEX IF NOT EXISTS idx_sales_notes_sales_rep ON sales_notes(sales_rep_id);
