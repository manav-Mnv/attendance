// auth.js
// Handles authentication logic, routing, and access control.

const ALLOWED_DOMAIN = "@paruluniversity.ac.in";

/**
 * Initiates the Google OAuth flow for students.
 * Supabase will handle redirection to Google and back to the current page.
 */
async function studentGoogleLogin() {
    // 1. We specify the provider as 'google'
    // 2. We set the redirectTo URL to make sure we come back to the login page to handle the callback
    const { error } = await window.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/login.html'
        }
    });

    if (error) {
        alert("Login failed: " + error.message);
    }
}

/**
 * Standard email and password login for pre-registered teachers.
 */
async function teacherLogin(email, password) {
    if (!email || !password) return alert("Please enter email and password.");

    const { data, error } = await window.supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login failed: " + error.message);
        return;
    }

    // After login, we must verify they actually have the 'teacher' role in the db.
    verifyAndRouteUser(data.user);
}

/**
 * Handles teacher registration, including profile and initial batch creation.
 */
async function teacherRegister(email, password, name, className, classCode) {
    if (!email || !password || !name || !className || !classCode) {
        return alert("Please fill in all fields.");
    }

    // 1. Create the Auth User
    const { data, error } = await window.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name
            }
        }
    });

    if (error) {
        alert("Registration failed: " + error.message);
        return;
    }

    const user = data.user;
    if (!user) {
        alert("Registration feedback: Please check your email to confirm your account (if enabled in Supabase).");
        return;
    }

    // 2. Create the Profile
    const { error: profileError } = await window.supabase.from('profiles').insert({
        id: user.id,
        name: name,
        email: email,
        role: 'teacher'
    });

    if (profileError) {
        console.error("Profile creation error:", profileError);
        alert("Account created, but profile setup failed. Please contact support.");
        return;
    }

    // 3. Create the Initial Batch
    const { error: batchError } = await window.supabase.from('batches').insert({
        batch_code: classCode,
        name: className,
        teacher_id: user.id
    });

    if (batchError) {
        console.error("Batch creation error:", batchError);
        alert("Account created, but failed to create your first class. You can add it later from the dashboard.");
    }

    // 4. Route the user
    alert("Teacher account registered successfully!");
    verifyAndRouteUser(user);
}

/**
 * Handles the session callback and routes the user based on their role and domain constraints.
 * This should be called on the login page's load event.
 */
async function handleAuthCallback() {
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
        console.error("Session error:", error);
        return;
    }

    if (session && session.user) {
        await verifyAndRouteUser(session.user);
    }
}

/**
 * Core validation logic that runs after ANY successful provider login or session resume.
 * 1. Checks student domain constraints.
 * 2. Auto-creates student profiles.
 * 3. Enforces role-based redirection.
 */
async function verifyAndRouteUser(user) {
    const email = user.email;

    // First check if a profile already exists for this user
    const { data: profile, error: profileError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "No rows found". Any other error is a real issue.
        console.error("Error fetching profile:", profileError);
        return;
    }

    if (profile) {
        // --- EXISTING USER ---
        // Route them according to their role
        if (profile.role === 'student') {
            // Re-verify domain just in case
            if (!email.endsWith(ALLOWED_DOMAIN)) {
                alert(`Students must use their ${ALLOWED_DOMAIN} email.`);
                await signOut();
                return;
            }
            window.location.href = 'student.html';
        } else if (profile.role === 'teacher') {
            window.location.href = 'teacher.html';
        } else {
            // We are strictly not allowing 'admin' or other undefined roles into this system anymore.
            alert("Unauthorized role. Access denied.");
            await signOut();
        }
    } else {
        // --- NEW USER (Profile doesn't exist) ---
        // By design, only Students register themselves dynamically via Google OAuth.
        
        // Strict Domain Check
        if (!email.endsWith(ALLOWED_DOMAIN)) {
            alert(`Unauthorized domain. Only ${ALLOWED_DOMAIN} emails are allowed.`);
            await signOut(); // Log them out from Auth immediately
            return;
        }

        // Auto-create Student Profile
        const name = user.user_metadata?.full_name || email.split('@')[0]; // Extract name from Google metadata

        const { error: insertError } = await window.supabase.from('profiles').insert({
            id: user.id,
            name: name,
            email: email,
            role: 'student'
        });

        if (insertError) {
            console.error("Profile creation failed:", insertError);
            alert("Failed to initialize your profile. Please contact support.");
            await signOut();
            return;
        }

        // Profile successfully created! Proceed to student dashboard.
        window.location.href = 'student.html';
    }
}

/**
 * Secures a page. Call this on top of protected pages (e.g., student.html, teacher.html).
 * Checks if the valid session exists AND if the profile matches the required role.
 */
async function requireAuth(requiredRole) {
    const { data: { session } } = await window.supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }

    const { data: profile } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (!profile || profile.role !== requiredRole) {
        // Intruders are booted to login.
        alert("Unauthorized access. Make sure you are logged into the correct account type.");
        window.location.href = 'login.html';
        return null;
    }

    return profile;
}

/**
 * Safely logs the user out and returns to login.
 */
async function signOut() {
    await window.supabase.auth.signOut();
    window.location.href = 'login.html';
}
