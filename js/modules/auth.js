// ============================================================
// TERROUGE — Módulo de Autenticación
// ============================================================

async function handleLogin(e) {
    e.preventDefault();

    if (!window.isSupabaseConfigured()) {
        const errorEl = document.getElementById('loginError');
        errorEl.innerHTML = '⚠️ <strong>Falta configurar Supabase:</strong> Ingresá tu URL y clave en <code>js/config.js</code>.';
        errorEl.style.display = 'block';
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const keep = document.getElementById('loginKeep').checked;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginSubmitBtn');

    errorEl.style.display = 'none';
    btn.textContent = 'Ingresando...';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (keep) {
            localStorage.setItem('keepSession', 'true');
        } else {
            localStorage.setItem('keepSession', 'false');
            sessionStorage.setItem('tempSession', 'true');
        }

        AppState.currentUser = data.user;
        await window.initApp();
    } catch (err) {
        let msg = 'No se pudo iniciar sesión. Verificá tu email y contraseña.';
        if (err.message?.includes('Invalid login')) msg = 'Email o contraseña incorrectos.';
        if (err.message?.includes('Email not confirmed')) msg = 'Tu email no está confirmado. Revisá tu bandeja de entrada.';
        if (err.message?.includes('fetch') || err.message?.includes('network')) msg = 'No hay conexión a internet o la URL de Supabase es inválida.';
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    } finally {
        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;
    }
}

async function handleForgotPassword() {
    if (!window.isSupabaseConfigured()) {
        showToast('Falta configurar Supabase en js/config.js', 'warning');
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    if (!email) {
        showToast('Primero escribí tu email arriba', 'warning');
        document.getElementById('loginEmail').focus();
        return;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        showToast('Te enviamos un email para restablecer tu contraseña. Revisá tu bandeja.', 'success', 5000);
    } catch (err) {
        showToast('No pudimos enviar el email. Verificá la dirección.', 'error');
    }
}

async function handleLogout() {
    const ok = await showConfirm('¿Querés cerrar la sesión?', 'Sí, cerrar sesión');
    if (!ok) return;

    try {
        await supabase.auth.signOut();
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
    }

    localStorage.removeItem('keepSession');
    sessionStorage.removeItem('tempSession');
    AppState.currentUser = null;

    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
}

async function checkSession() {
    if (!window.isSupabaseConfigured()) return null;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const keep = localStorage.getItem('keepSession');
            if (keep === 'false' && !sessionStorage.getItem('tempSession')) {
                await supabase.auth.signOut();
                return null;
            }
            sessionStorage.setItem('tempSession', 'true');
            return session.user;
        }
    } catch (err) {
        console.error('Error al verificar sesión:', err);
    }
    return null;
}

// Exportar globalmente
window.handleLogin = handleLogin;
window.handleForgotPassword = handleForgotPassword;
window.handleLogout = handleLogout;
window.checkSession = checkSession;
