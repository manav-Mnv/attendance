// ============================================
// MARQUEE TRAINING — config.js
// ⚠️ Replace with YOUR Supabase credentials
// ============================================

const SUPABASE_URL = 'https://qvprcyfjexzlngqhbfcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cHJjeWZqZXh6bG5ncWhiZmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTM4MTYsImV4cCI6MjA5MTYyOTgxNn0.PeS1u62U_rPIZ18-0HU75eb_JRSHgysDvNBmYkMiqi4';

// face-api.js model path (CDN hosted)
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model';

// GPS tolerance in meters (how close student must be to classroom)
const GPS_RADIUS_METERS = 60;

// ============================================
// Supabase client (loaded via CDN in HTML)
// ============================================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Shared Utilities
// ============================================

// Haversine distance between two GPS points (returns meters)
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get current GPS position
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  });
}

// Get current logged-in user + profile
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return profile;
}

// Redirect if not logged in
async function requireAuth(role = null) {
  const user = await getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  if (role && user.role !== role) { window.location.href = 'index.html'; return null; }
  return user;
}

// Toast notification
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast toast-${type} show`;
  setTimeout(() => el.classList.remove('show'), 3500);
}
