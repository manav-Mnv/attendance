# SwiftAttend — Face Recognition Attendance System

> A real-time, AI-powered attendance kiosk for **Swift Coding Club** — built with `face-api.js` and Supabase. Works seamlessly across desktops, tablets, and phones.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎥 **Live Face Recognition** | Powered by `face-api.js` TinyFaceDetector — fast, client-side AI inference |
| 🔒 **Persistent Supabase Auth** | Admin panel protected by robust email/password auth that persists securely across page reloads |
| 📋 **Kiosk Mode** | Fullscreen attendance kiosk with animated scan overlay, audio pings, and visual confirmation |
| 🛡️ **Duplicate Prevention** | Stops duplicate enrollments by checking both Enrollment ID and Face Descriptor uniqueness. |
| 🪪 **3-Step Master Lookup** | Enrollment wizard searches a `students_master` database with auto-complete before advancing to face capture. |
| 📊 **Admin Dashboard** | Enroll students, manage members (with live Kiosk UI syncing), and view real-time logs with instant filtering and Excel exports. |
| 📱 **Premium UI & Responsive** | Modern frosted-glassmorphism UI layout optimized for any device size or orientation. |
| 🌙 **Timezone-Aware Reset** | Calculates exact local time midnights to flawlessly roll over the attendance cache without UTC bugs. |
| ⚡ **Rate-Limited Login** | 5-attempt lockout with 30-second cooldown to prevent brute-force login attempts |

---

## 📱 Device Compatibility

The UI features a premium glassmorphic aesthetic natively responsive to all screens:

- **Desktop / Laptop** — Full layout with side-by-side enroll grids and member cards.
- **Tablet (≤ 900px)** — Single-column admin layout, flexible tables.
- **Phablet / Phone (≤ 768px)** — Stacked header, scaled camera, touch-friendly 44px tap targets.
- **Small Phone (≤ 480px)** — Camera fills viewport width, condensed table views.
- **Landscape Phone** — Camera and status panel laid out horizontally.

---

## 🏗️ Architecture

```
index.html  (single-file self-contained web app)
├── CSS          — Glassmorphism dark theme, modern animations, UI variables
├── face-api.js  — TinyFaceDetector + FaceLandmark68Tiny + FaceRecognitionNet
├── Supabase JS  — Secure Auth, Real-time PostgreSQL
└── SheetJS      — Client-side Excel `.xlsx` builder
```

### Database Schema

Run this in your Supabase **SQL Editor** to bootstrap the system:

```sql
CREATE TABLE students_master (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  enrollment_no   TEXT UNIQUE NOT NULL,
  pu_mail         TEXT,
  phone           TEXT,
  collage         TEXT,
  department      TEXT,
  branch          TEXT
);

CREATE TABLE students (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  enrollment_no   TEXT UNIQUE NOT NULL,
  pu_mail         TEXT,
  phone           TEXT,
  collage         TEXT,
  department      TEXT,
  branch          TEXT,
  face_descriptor JSONB NOT NULL,        -- 128-float array
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  time_in     TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)               -- Strict: one record per day
);

-- RLS policies 
ALTER TABLE students_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON students_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON attendance FOR ALL USING (true) WITH CHECK (true);
```

---

## 🚀 Getting Started

### Prerequisites
- A [Supabase](https://supabase.com) project with the schema above applied via the **SQL Editor**. (Ensure you populate the `students_master` table!)
- A Supabase **Auth user** configured (Authentication → Users) for admin dashboard login.
- The `swift.jpg` logo file in the exact same folder as `index.html`.

### Running Locally
1. Run a local webserver (e.g. `npx serve .` or Live Server) and open `index.html` in Chrome/Edge.
2. If launching for the first time, a setup screen prompts you for your Supabase URL and Anon Key.
3. Once connected, click **⚙ Admin**, securely sign in, and you're ready to operate!

> **Note on Cameras:** Web browsers require the context to be "secure" to access webcams. The app must be served over `localhost` or standard `https://`. 

---

## 🔑 Admin Workflow

1. **Enroll Wizard** — Select a student securely from the master database auto-complete. Confirm their data. Capture a completely unique Face Descriptor. Enroll.
2. **Logs** — Open the Logs tab to view today's real-time attendance out of the box. Use the calendar picker to instantly fetch records for past days. Export to `.xlsx`.
3. **Members** — Safely delete active members—our robust UI synchronization natively wipes the student from the database AND flushes any lingering "recent scan" chips instantly from the live Kiosk.

---

## ⚡ Performance Details

- **Memory Management**: AI models load precisely once and are permanently retained in memory.
- **Micro-batching Scan**: Inference runs on recursive `setTimeout` logic rather than a brute-force `setInterval` to ensure hardware pipelines never queue nor choke.
- **Lightning Detection**: `TinyFaceDetectorOptions` uses an absolute minimised `inputSize: 160` ensuring ultra-low latency inference on budget devices.
- **Cache Hit Validation**: Daily duplicate verifications natively hit a memory hash map BEFORE running database logic, dropping heavy network round-trip bottlenecks.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5 + JavaScript (ES2020) |
| Styling | Vanilla Cascading Style Sheets |
| AI / Vision | [face-api.js](https://github.com/justadudewhohacks/face-api.js) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Bundler | None needed |

---

## ⚖️ License
MIT License — free to use and adapt for your own club or institution.
