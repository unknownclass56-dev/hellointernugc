-- SQL Script to split student profiles into two distinct tables: internship_students and training_students
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create internship_students table
CREATE TABLE IF NOT EXISTS public.internship_students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,
    gender TEXT,
    parent_name TEXT,
    university_name TEXT,
    college_name TEXT,
    degree TEXT,
    department TEXT,
    semester TEXT,
    academic_session TEXT,
    university_roll_number TEXT,
    program TEXT,
    face_registered BOOLEAN DEFAULT FALSE,
    face_data TEXT,
    raw_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create training_students table
CREATE TABLE IF NOT EXISTS public.training_students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,
    state TEXT,
    university_name TEXT,
    college_name TEXT,
    university_roll_number TEXT,
    department TEXT,
    raw_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security) on the new tables
ALTER TABLE public.internship_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_students ENABLE ROW LEVEL SECURITY;

-- Allow students to read and update their own data
CREATE POLICY "Allow individual read to internship_students" ON public.internship_students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual update to internship_students" ON public.internship_students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert by anyone to internship_students" ON public.internship_students FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow individual read to training_students" ON public.training_students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual update to training_students" ON public.training_students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert by anyone to training_students" ON public.training_students FOR INSERT WITH CHECK (true);

-- Allow admins full access
CREATE POLICY "Allow admin full access to internship_students" ON public.internship_students FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow admin full access to training_students" ON public.training_students FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Run data migration script to copy existing data from profiles to the correct new tables
DO $$
DECLARE
    p RECORD;
    is_training BOOLEAN;
BEGIN
    FOR p IN SELECT * FROM public.profiles LOOP
        -- Skip admins
        IF p.role = 'admin' THEN
            CONTINUE;
        END IF;

        -- Determine if this user is a training student (either role is training or they have training enrollments)
        SELECT EXISTS (
            SELECT 1 FROM public.training_enrollments WHERE student_id = p.id
        ) OR (p.role = 'training') INTO is_training;

        IF is_training THEN
            -- Migrate to training_students table
            INSERT INTO public.training_students (
                id, full_name, email, contact_number, state,
                university_name, college_name, university_roll_number, department,
                raw_password, created_at, updated_at
            ) VALUES (
                p.id, p.full_name, p.email, p.contact_number, p.state,
                p.university_name, p.college_name, p.university_roll_number, p.department,
                p.raw_password, p.created_at, p.updated_at
            ) ON CONFLICT (id) DO NOTHING;
        ELSE
            -- Migrate to internship_students table
            INSERT INTO public.internship_students (
                id, full_name, email, contact_number, gender, parent_name,
                university_name, college_name, degree, department, semester,
                academic_session, university_roll_number, program, face_registered,
                face_data, raw_password, created_at, updated_at
            ) VALUES (
                p.id, p.full_name, p.email, p.contact_number, p.gender, p.parent_name,
                p.university_name, p.college_name, p.degree, p.department, p.semester,
                p.academic_session, p.university_roll_number, p.program, p.face_registered,
                p.face_data, p.raw_password, p.created_at, p.updated_at
            ) ON CONFLICT (id) DO NOTHING;
        END IF;
    END LOOP;
END $$;
