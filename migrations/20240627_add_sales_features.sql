-- New table to store sales remarks and status per student (profile)
CREATE TABLE sales_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sales_rep_id uuid REFERENCES users(id),
  remark text,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX idx_sales_notes_profile ON sales_notes(profile_id);
CREATE INDEX idx_sales_notes_sales_rep ON sales_notes(sales_rep_id);
