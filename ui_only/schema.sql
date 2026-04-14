-- ============================================
-- MARQUEE TRAINING — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  enrollment_number TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  email TEXT,
  department TEXT,
  face_descriptor FLOAT8[],
  enrolled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches
CREATE TABLE IF NOT EXISTS batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (created by teacher, contains OTP)
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

-- Attendance (UNIQUE on student + session prevents duplicates)
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
-- Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Batches
CREATE POLICY "batches_select" ON batches FOR SELECT USING (true);
CREATE POLICY "batches_insert" ON batches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "batches_delete" ON batches FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sessions
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "sessions_delete" ON sessions FOR DELETE USING (teacher_id = auth.uid());

-- Attendance
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "attendance_insert" ON attendance FOR INSERT WITH CHECK (auth.uid() = student_id);