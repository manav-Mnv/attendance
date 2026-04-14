-- ============================================
-- MARQUEE TRAINING — Final Production Schema
-- Run this completely in the Supabase SQL Editor
-- ============================================

-- 1. Create Batches first (without teacher FK to avoid circular dependency)
CREATE TABLE IF NOT EXISTS batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID, -- Foreign key added later
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  enrollment_number TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  batch_id UUID REFERENCES batches(id),
  email TEXT,
  department TEXT,
  face_descriptor FLOAT8[],
  enrolled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resolve Circular Dependency
ALTER TABLE batches
  ADD CONSTRAINT fk_batches_teacher
  FOREIGN KEY (teacher_id)
  REFERENCES profiles(id);

-- 4. Create Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  otp TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id),
  batch_id UUID REFERENCES batches(id),
  location_lat FLOAT8 NOT NULL,
  location_lng FLOAT8 NOT NULL,
  radius_meters INT DEFAULT 50,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  session_id UUID REFERENCES sessions(id),
  student_name TEXT,
  enrollment_number TEXT,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, session_id)
);

-- ============================================
-- Administrative Helpers
-- ============================================

-- Secure function to check if current user is an admin (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Secure function to check if current user is a teacher
CREATE OR REPLACE FUNCTION is_teacher() 
RETURNS BOOLEAN 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'
  );
$$;


-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES POLICIES ───
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  auth.uid() = id OR is_admin()
);

CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  auth.uid() = id OR is_admin()
);

CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (
  is_admin()
);

-- ─── BATCHES POLICIES ───
CREATE POLICY "batches_select" ON batches FOR SELECT USING (true);

CREATE POLICY "batches_insert" ON batches FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "batches_update" ON batches FOR UPDATE USING (is_admin());
CREATE POLICY "batches_delete" ON batches FOR DELETE USING (is_admin());

-- ─── SESSIONS POLICIES ───
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (
  is_teacher() OR is_admin()
);

CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (
  teacher_id = auth.uid() OR is_admin()
);

CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (
  teacher_id = auth.uid() OR is_admin()
);

-- ─── ATTENDANCE POLICIES ───
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "attendance_insert" ON attendance FOR INSERT WITH CHECK (
  auth.uid() = student_id OR is_teacher() OR is_admin()
);

CREATE POLICY "attendance_delete" ON attendance FOR DELETE USING (
  is_teacher() OR is_admin()
);
  