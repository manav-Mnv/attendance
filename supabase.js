// supabase.js
// Holds the initialization logic for the Supabase Client.

const SUPABASE_URL = 'https://qvprcyfjexzlngqhbfcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cHJjeWZqZXh6bG5ncWhiZmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTM4MTYsImV4cCI6MjA5MTYyOTgxNn0.PeS1u62U_rPIZ18-0HU75eb_JRSHgysDvNBmYkMiqi4';

// Initialize the client. This requires the Supabase CDN script to be loaded first in the HTML.
// Initialize the Supabase client.
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Robust wrapper for Supabase calls to handle rate limits (429) and network bursts.
 * Implements exponential backoff with jitter.
 */
async function safeCall(fn, maxRetries = 3) {
    let lastError = null;
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const result = await fn();
            // PostgREST errors are often returned inside the result object
            if (result && result.error) {
                const status = result.error.status || result.error.code;
                // Retry on rate limit (429) or server errors (5xx)
                if (status === 429 || (typeof status === 'number' && status >= 500)) {
                    throw result.error;
                }
                return result; // Other errors (400, 401, etc.) shouldn't be retried
            }
            return result;
        } catch (err) {
            lastError = err;
            const status = err.status || err.code;
            
            if (i < maxRetries && (status === 429 || (typeof status === 'number' && status >= 500) || err.message?.includes('fetch'))) {
                // Exponential backoff: 1.5s, 3s, 6s... with random jitter
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                console.warn(`[SafeCall] Re-trying due to server load (${status}). Attempt ${i + 1}/${maxRetries}. Delay: ${Math.round(delay)}ms`);
                await new Promise(res => setTimeout(res, delay));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

window.safeCall = safeCall;
