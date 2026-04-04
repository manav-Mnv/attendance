# SwiftAttend — Face Recognition Attendance System

> A real-time, AI-powered attendance kiosk for **Swift Coding Club** — built with `face-api.js` and Supabase. Works on desktops, tablets, and phones.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎥 **Live Face Recognition** | Powered by `face-api.js` TinyFaceDetector — fast, client-side AI inference |
| 🔒 **Supabase Auth Login** | Admin panel protected by Supabase email/password authentication |
| 📋 **Kiosk Mode** | Fullscreen attendance kiosk with animated scan overlay and audio ping |
| 🛡️ **Duplicate Prevention** | One attendance record per student per day enforced at DB level (`UNIQUE`) |
| 📊 **Admin Dashboard** | Enroll students, view attendance logs, manage members — with Excel export |
| 📱 **Fully Responsive** | Optimised for phones, tablets, landscape mode, and touch screens |
| 🌙 **New-Day Auto-Reset** | Detects date change on page load, tab focus, and every 5 minutes |
| ⚡ **Rate-Limited Login** | 5-attempt lockout with 30-second cooldown to prevent brute-force |

---

## 📱 Device Compatibility

The UI is fully responsive across all screen sizes:

- **Desktop / Laptop** — Full layout with side-by-side enroll grid
- **Tablet (≤ 900px)** — Single-column admin layout
- **Phablet / Phone (≤ 768px)** — Stacked header, scaled camera, touch-friendly 44px tap targets
- **Small Phone (≤ 480px)** — Camera fills viewport width, condensed table
- **Landscape Phone** — Camera and status panel laid out horizontally
- **iOS / Android** — `font-size: 16px` on inputs prevents auto-zoom; `playsinline` on all video elements

---

## 🏗️ Architecture

```
index.html  (single-file app)
├── CSS          — Glassmorphism dark theme, responsive media queries
├── face-api.js  — TinyFaceDetector + FaceLandmark68Tiny + FaceRecognitionNet
├── Supabase JS  — Auth, real-time DB (PostgreSQL)
└── SheetJS      — Client-side Excel export
```

### Database Schema

```sql
CREATE TABLE students (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  enrollment_no   TEXT UNIQUE NOT NULL,
  email           TEXT,
  phone           TEXT,
  department      TEXT,
  face_descriptor JSONB NOT NULL,        -- 128-float array
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  time_in     TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)               -- one record per day
);

ALTER TABLE students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_students"   ON students   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_attendance" ON attendance  FOR ALL USING (true) WITH CHECK (true);
```

---

## 🚀 Getting Started

### Prerequisites
- A [Supabase](https://supabase.com) project with the schema above applied via the **SQL Editor**
- A Supabase **Auth user** (create one under Authentication → Users) for admin access
- The `swift.jpg` logo in the same folder as `index.html`

### Running Locally
1. Open `index.html` directly in any modern browser (Chrome / Edge recommended for best camera API support)
2. The kiosk launches automatically — the app connects to the configured Supabase project
3. Click **⚙ Admin** → sign in with your Supabase Auth email and password

> **No build step required.** Everything runs client-side.

---

## 🔑 Admin Workflow

1. **Enroll** — Open Admin → Enroll tab → start camera → capture face → fill in student details → Save
2. **Logs** — Filter by date and department, export to `.xlsx`
3. **Members** — View all enrolled students, delete individual records

---

## ⚡ Performance Notes

- AI model weights loaded once and cached in memory for the session
- Kiosk scan loop uses recursive `setTimeout(80ms)` instead of `setInterval` to prevent queue buildup
- `TinyFaceDetectorOptions` uses `inputSize: 160` (minimum valid size) for fastest inference
- Face descriptors stored as 128-float JSONB arrays; matched client-side using Euclidean distance (`threshold: 0.50`)

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5 + JavaScript (ES2020) |
| Styling | Vanilla CSS — glassmorphism, CSS variables, responsive media queries |
| AI / Vision | [face-api.js](https://github.com/justadudewhohacks/face-api.js) v0.22.2 |
| Database | [Supabase](https://supabase.com) (PostgreSQL + Auth + RLS) |
| Export | [SheetJS / xlsx](https://sheetjs.com) v0.20.1 |
| Typography | Google Fonts — Inter |

---

## ⚖️ License

MIT License — free to use and adapt for your own club or institution.
