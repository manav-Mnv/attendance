# SwiftAttend — Facial Recognition Attendance System

**SwiftAttend** is a modern, real-time lab attendance system built on top of **face-api.js** and **Supabase**. It provides a sleek, terminal-inspired interface for enrolling students and marking attendance using advanced facial recognition.

## 🚀 Features

- **Real-time Facial Recognition**: Powered by `face-api.js` for fast and accurate face detection and landmarking.
- **Seamless Supabase Integration**: Automated project setup for storing student profiles and attendance logs.
- **Kiosk Mode**: An interactive, low-friction attendance kiosking interface with live status feedback.
- **Admin Panel**: Secure dashboard for student enrollment, attendance log management, and student list monitoring.
- **Responsive & Modern UI**: A premium, dark-mode design with smooth animations and micro-interactions.

## 🛠️ Project Setup

### 1. Supabase Initialization
- Create a new project on [Supabase.com](https://supabase.com).
- Open the **SQL Editor** and run the following script:
  ```sql
  CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    enrollment_no TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    face_descriptor JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time_in TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
  );

  ALTER TABLE students ENABLE ROW LEVEL SECURITY;
  ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "allow_all_students" ON students FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "allow_all_attendance" ON attendance FOR ALL USING (true) WITH CHECK (true);
  ```

### 2. Configuration
- Once the database is ready, open the local `index.html` file in your browser.
- Enter your **Supabase URL**, **Anon/Public Key**, and choose an **Admin Password**.
- The app will automatically connect and launch into Kiosk Mode.

## 💻 Tech Stack
- **Frontend**: Vanilla HTML/JavaScript, CSS (Modern Premium UI)
- **AI Models**: face-api.js
- **Database**: Supabase (PostgreSQL)
- **Icons & Typography**: Google Fonts (Orbitron, DM Sans, Share Tech Mono)

## ⚖️ License
MIT License. Feel free to use and adapt this for your own projects!
