-- Run this SQL in your Supabase SQL Editor
-- Table: training_session_completions
-- Tracks which sessions a student has completed (for session locking/unlocking)

CREATE TABLE IF NOT EXISTS training_session_completions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id    uuid NOT NULL,  -- references training_lectures.id
  training_id   uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, session_id)
);

-- Enable Row Level Security
ALTER TABLE training_session_completions ENABLE ROW LEVEL SECURITY;

-- Students can read their own completions
CREATE POLICY "Students read own session completions"
  ON training_session_completions
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own completions
CREATE POLICY "Students insert own session completions"
  ON training_session_completions
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can upsert their own completions
CREATE POLICY "Students upsert own session completions"
  ON training_session_completions
  FOR UPDATE
  USING (auth.uid() = student_id);

-- Admins can read all completions
CREATE POLICY "Admins read all session completions"
  ON training_session_completions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
