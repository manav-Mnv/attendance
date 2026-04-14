// supabase.js
// Holds the initialization logic for the Supabase Client.

const SUPABASE_URL = 'https://qvprcyfjexzlngqhbfcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cHJjeWZqZXh6bG5ncWhiZmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTM4MTYsImV4cCI6MjA5MTYyOTgxNn0.PeS1u62U_rPIZ18-0HU75eb_JRSHgysDvNBmYkMiqi4';

// Initialize the client. This requires the Supabase CDN script to be loaded first in the HTML.
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
