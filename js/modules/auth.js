// ============================================================
// TERROUGE — Módulo de Autenticación
// ============================================================

// Alternar visibilidad de campos de contraseña
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (btn) btn.textContent = '🙈';
    } else {
        input.type = 'password';
        if (btn) btn.textContent = '👁️';
    }
}

// Iniciar sesión con email y contraseña
let isLoggingIn = false;
async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (isLoggingIn) return;

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

    // Validación de campos vacíos o mal formados antes de enviar
    if (!email) {
        errorEl.innerHTML = '⚠️ <strong>Por favor ingresá tu correo electrónico.</strong>';
        errorEl.style.display = 'block';
        document.getElementById('loginEmail').focus();
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        errorEl.innerHTML = '⚠️ <strong>Formato inválido:</strong> El usuario debe ser un correo electrónico válido (ejemplo: <code>tu@email.com</code>).';
        errorEl.style.display = 'block';
        document.getElementById('loginEmail').focus();
        return;
    }

    if (!password) {
        errorEl.innerHTML = '⚠️ <strong>Por favor ingresá tu contraseña.</strong>';
        errorEl.style.display = 'block';
        document.getElementById('loginPassword').focus();
        return;
    }

    isLoggingIn = true;
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
        console.error('Error al iniciar sesión:', err);
        let msg = 'No se pudo iniciar sesión. Verificá tu email y contraseña.';
        const errStr = (err.message || '').toLowerCase();

        if (errStr.includes('invalid login') || errStr.includes('invalid credentials') || errStr.includes('grant')) {
            msg = '⚠️ <strong>Email o contraseña incorrectos.</strong> Verificá que no haya mayúsculas o espacios de más. Si no recordás tu contraseña, hacé clic abajo en "¿Olvidaste tu contraseña?".';
        } else if (errStr.includes('email not confirmed')) {
            msg = '⚠️ <strong>Email aún no confirmado:</strong> Por favor revisá tu bandeja de entrada o spam para confirmar tu cuenta en el enlace que te envió Supabase.';
        } else if (errStr.includes('user not found')) {
            msg = '⚠️ <strong>Usuario no encontrado:</strong> No encontramos ninguna cuenta registrada con este email.';
        } else if (errStr.includes('rate limit')) {
            msg = '⚠️ <strong>Demasiados intentos fallidos:</strong> Por seguridad, esperá unos minutos antes de reintentar.';
        } else if (errStr.includes('fetch') || errStr.includes('network')) {
            msg = '⚠️ <strong>Problema de conexión:</strong> No se pudo conectar con el servidor de Supabase. Verificá tu conexión a internet.';
        } else if (err.message) {
            msg = `⚠️ ${err.message}`;
        }

        errorEl.innerHTML = msg;
        errorEl.style.display = 'block';
    } finally {
        isLoggingIn = false;
        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;
    }
}

// Abrir modal para solicitar reseteo de contraseña
function openForgotPasswordModal() {
    if (!window.isSupabaseConfigured()) {
        showToast('Falta configurar Supabase en js/config.js', 'warning');
        return;
    }

    const loginEmail = document.getElementById('loginEmail')?.value.trim() || '';
    const forgotEmail = document.getElementById('forgotEmail');
    if (forgotEmail) forgotEmail.value = loginEmail;

    const msgEl = document.getElementById('forgotPasswordMsg');
    if (msgEl) {
        msgEl.style.display = 'none';
        msgEl.textContent = '';
    }

    openModal('modalForgotPassword');
    if (forgotEmail) forgotEmail.focus();
}

// Enviar email de recuperación
async function handleForgotPasswordSubmit(e) {
    if (e) e.preventDefault();

    if (!window.isSupabaseConfigured()) {
        showToast('Falta configurar Supabase en js/config.js', 'warning');
        return;
    }

    const email = document.getElementById('forgotEmail').value.trim();
    const msgEl = document.getElementById('forgotPasswordMsg');
    const btn = document.getElementById('forgotSubmitBtn');

    if (!email) {
        if (msgEl) {
            msgEl.textContent = 'Por favor escribí tu correo electrónico.';
            msgEl.style.background = 'var(--danger-bg)';
            msgEl.style.color = 'var(--danger)';
            msgEl.style.display = 'block';
        }
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando enlace...';
    if (msgEl) msgEl.style.display = 'none';

    try {
        // Redirigir a la URL actual limpia de la app
        const redirectUrl = window.location.origin + window.location.pathname;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });
        if (error) throw error;

        if (msgEl) {
            msgEl.textContent = '¡Listo! Te enviamos un email con el enlace para restablecer tu contraseña. Revisá tu bandeja de entrada o spam.';
            msgEl.style.background = 'var(--success-bg)';
            msgEl.style.color = 'var(--success)';
            msgEl.style.display = 'block';
        }
        showToast('Correo de recuperación enviado ✓', 'success', 5000);

        setTimeout(() => {
            closeModal();
            btn.disabled = false;
            btn.textContent = 'Enviar enlace';
        }, 4000);
    } catch (err) {
        console.error('Error al solicitar reseteo de contraseña:', err);
        let errorText = 'No pudimos enviar el correo. Verificá que la dirección sea correcta.';
        if (err.message?.includes('rate limit')) {
            errorText = 'Por seguridad, esperá unos minutos antes de solicitar otro enlace.';
        }
        if (msgEl) {
            msgEl.textContent = errorText;
            msgEl.style.background = 'var(--danger-bg)';
            msgEl.style.color = 'var(--danger)';
            msgEl.style.display = 'block';
        }
        btn.disabled = false;
        btn.textContent = 'Enviar enlace';
    }
}

// Abrir modal para definir nueva contraseña (cuando se regresa del link del mail)
function openResetPasswordModal() {
    const newPass = document.getElementById('newPassword');
    const confirmPass = document.getElementById('confirmNewPassword');
    const msgEl = document.getElementById('resetPasswordMsg');

    if (newPass) newPass.value = '';
    if (confirmPass) confirmPass.value = '';
    if (msgEl) {
        msgEl.style.display = 'none';
        msgEl.textContent = '';
    }

    openModal('modalResetPassword');
    if (newPass) newPass.focus();
}

// Guardar nueva contraseña
async function handleResetPasswordSubmit(e) {
    if (e) e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const msgEl = document.getElementById('resetPasswordMsg');
    const btn = document.getElementById('resetSubmitBtn');

    if (!newPassword || newPassword.length < 6) {
        if (msgEl) {
            msgEl.textContent = 'La contraseña debe contener al menos 6 caracteres.';
            msgEl.style.background = 'var(--danger-bg)';
            msgEl.style.color = 'var(--danger)';
            msgEl.style.display = 'block';
        }
        return;
    }

    if (newPassword !== confirmNewPassword) {
        if (msgEl) {
            msgEl.textContent = 'Las contraseñas no coinciden. Verificalas.';
            msgEl.style.background = 'var(--danger-bg)';
            msgEl.style.color = 'var(--danger)';
            msgEl.style.display = 'block';
        }
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando nueva clave...';
    if (msgEl) msgEl.style.display = 'none';

    try {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        if (msgEl) {
            msgEl.textContent = '¡Contraseña actualizada con éxito! Ingresando al sistema...';
            msgEl.style.background = 'var(--success-bg)';
            msgEl.style.color = 'var(--success)';
            msgEl.style.display = 'block';
        }

        showToast('¡Contraseña restablecida con éxito! ✓', 'success', 4000);

        // Limpiar URL de fragmentos de token
        if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
        }

        setTimeout(async () => {
            closeModal();
            btn.disabled = false;
            btn.textContent = 'Guardar clave';

            if (data?.user) {
                AppState.currentUser = data.user;
                await window.initApp();
            } else {
                document.getElementById('loginPassword').value = newPassword;
            }
        }, 1500);
    } catch (err) {
        console.error('Error al actualizar contraseña:', err);
        if (msgEl) {
            msgEl.textContent = 'Error al actualizar la contraseña: ' + (err.message || 'Intentá de nuevo');
            msgEl.style.background = 'var(--danger-bg)';
            msgEl.style.color = 'var(--danger)';
            msgEl.style.display = 'block';
        }
        btn.disabled = false;
        btn.textContent = 'Guardar clave';
    }
}

// Configurar observadores de estado de autenticación (detectar link de recuperación)
function setupAuthListeners() {
    if (!window.isSupabaseConfigured() || !window.supabase) return;

    try {
        // 1. Escuchar evento PASSWORD_RECOVERY desde Supabase
        window.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                openResetPasswordModal();
            }
        });
    } catch (err) {
        console.warn('No se pudo inicializar onAuthStateChange:', err);
    }

    // 2. Verificar si la URL contiene parámetros de recuperación
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setTimeout(() => {
            openResetPasswordModal();
        }, 400);
    }
}

// Cerrar sesión
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

// Verificar sesión existente
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
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLogin = handleLogin;
window.openForgotPasswordModal = openForgotPasswordModal;
window.handleForgotPassword = openForgotPasswordModal; // retrocompatibilidad
window.handleForgotPasswordSubmit = handleForgotPasswordSubmit;
window.openResetPasswordModal = openResetPasswordModal;
window.handleResetPasswordSubmit = handleResetPasswordSubmit;
window.setupAuthListeners = setupAuthListeners;
window.handleLogout = handleLogout;
window.checkSession = checkSession;
