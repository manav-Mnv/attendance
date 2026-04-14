# Marquee Training — Attendance System

## Files
```text
attendance/
├── index.html       ← Login / Register
├── student.html     ← Enroll face + Mark attendance
├── teacher.html     ← Create sessions, view records
├── styles.css       ← Shared design system
├── config.js        ← ⚠️ Add your Supabase credentials here
└── schema.sql       ← Run this in Supabase SQL Editor first
```

---

## Setup Steps

### 1. Create Supabase Project
- Go to https://supabase.com → New Project
- Copy your **Project URL** and **anon public key**

### 2. Run Schema
- Supabase Dashboard → SQL Editor → Paste contents of `schema.sql` → Run

### 3. Add Credentials
- Open `config.js`
- Replace:
  ```js
  const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
  const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
  ```

### 4. Run the Application
You can run this project locally without any build tools:
- **Using VS Code:** Install the **Live Server** extension, right-click `index.html`, and select "Open with Live Server".
- **Using Node.js:** Run `npx serve .` in your terminal.
- **Using Python:** Run `python -m http.server 8000` in your terminal.

> **Note:** Browsers block Camera and GPS access on insecure connections. To use those features, you must view the site through `http://localhost` (or a secure `https://` connection).

---

## How It Works

### Student Flow
1. Register with name, enrollment number, email
2. **First time only:** GPS check → Face capture → Descriptor saved to Supabase
3. **Every class:** Enter teacher's OTP → GPS check → Face verified → Attendance marked

### Teacher Flow
1. Register with role = Teacher
2. Click "Use My Current Location" to set classroom GPS
3. Enter subject, duration → Start Session → Share the 6-char code
4. Watch real-time attendance roll in
5. Export CSV anytime

---

## Security Layers

| Layer | Protection |
|---|---|
| Supabase Auth | Only registered users can access |
| Session OTP | Expires in N minutes, teacher-controlled |
| GPS Check | Must be within 60m of classroom |
| Face Recognition | Verifies the actual person |
| DB Unique Constraint | Blocks duplicate entries at database level |

---

## Deployment
Auto-deploy is connected to Vercel via the `Marquee_Attendance` branch.

## Notes
- Face data stored as 128-number descriptor array (not raw photo)
- OTP is 6 characters, alphanumeric, expires automatically
- GPS radius is configurable (default 60m)
- Works on any modern browser with camera + GPS support
