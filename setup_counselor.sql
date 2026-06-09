-- Run this in your Supabase SQL Editor

-- 1. Counselor Settings
CREATE TABLE IF NOT EXISTS counselor_settings (
  id text PRIMARY KEY,
  fee numeric NOT NULL DEFAULT 200
);

INSERT INTO counselor_settings (id, fee) VALUES ('global', 200) ON CONFLICT DO NOTHING;

-- 2. Counselor Institutes
CREATE TABLE IF NOT EXISTS counselor_institutes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Counselor Applications
CREATE TABLE IF NOT EXISTS counselor_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  
  -- 10th
  marks_10th text NOT NULL,
  board_10th text NOT NULL,
  
  -- 12th
  marks_12th text NOT NULL,
  board_12th text NOT NULL,
  stream_12th text NOT NULL,
  
  -- Graduation
  grad_marks text,
  grad_university text,
  grad_college text,
  grad_course text,
  
  -- Post Graduation
  pg_course text,
  pg_university text,
  pg_college text,
  pg_year_of_passing text,
  
  -- Institute Preference & Extra
  preferred_institute text,
  expected_college text,
  remark text,
  
  -- Payment
  fee_paid numeric,
  payment_reference text,
  status text DEFAULT 'pending',
  
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Page Visits Tracking
CREATE TABLE IF NOT EXISTS page_visits (
  path text PRIMARY KEY,
  visit_count integer DEFAULT 1,
  last_visited timestamp with time zone DEFAULT now()
);


-- Allow public inserts for applications, and reads for everything
ALTER TABLE counselor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read counselor_settings" ON counselor_settings FOR SELECT USING (true);
CREATE POLICY "Public read counselor_institutes" ON counselor_institutes FOR SELECT USING (true);

-- Public can insert application
CREATE POLICY "Public insert counselor_applications" ON counselor_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own counselor_applications" ON counselor_applications FOR SELECT USING (true);

-- Public can upsert page visits (since we increment)
-- In a real prod environment, we would use an RPC function to securely increment without allowing arbitrary values.
-- For simplicity, we allow all for tracking.
CREATE POLICY "Public all page_visits" ON page_visits FOR ALL USING (true);

-- Admin policies
CREATE POLICY "Admin all counselor_settings" ON counselor_settings FOR ALL USING (true);
CREATE POLICY "Admin all counselor_institutes" ON counselor_institutes FOR ALL USING (true);
CREATE POLICY "Admin all counselor_applications" ON counselor_applications FOR ALL USING (true);
