// ============================================================
// TERROUGE — Aplicación Principal & Bootstrap
// ============================================================

async function initApp() {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('app');

    if (loginScreen) loginScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';

    // 1. Asegurar categorías por defecto
    if (window.ensureDefaultCategories) {
        await window.ensureDefaultCategories();
    }

    // 2. Cargar panel de inicio
    if (window.loadDashboard) {
        await window.loadDashboard();
    }

    // 3. Revisar recordatorio de copia de respaldo
    if (window.checkBackupReminder) {
        window.checkBackupReminder();
    }

    // 4. Revisar si hay datos de ejemplo cargados
    if (window.checkSampleDataBanner) {
        window.checkSampleDataBanner();
    }
}

async function init() {
    // 1. Revisar configuración de Supabase
    const isConfigured = typeof window.isSupabaseConfigured === 'function' && window.isSupabaseConfigured();
    if (!isConfigured) {
        const configAlert = document.getElementById('loginConfigAlert');
        if (configAlert) {
            configAlert.style.display = 'block';
        }
    }

    // 2. Vincular listeners de formularios principales
    const loginForm = document.getElementById('loginForm');
    const forgotBtn = document.getElementById('forgotBtn');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) loginForm.addEventListener('submit', window.handleLogin);
    if (forgotBtn) forgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openForgotPasswordModal();
    });
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', window.handleForgotPasswordSubmit);
    if (resetPasswordForm) resetPasswordForm.addEventListener('submit', window.handleResetPasswordSubmit);
    if (logoutBtn) logoutBtn.addEventListener('click', window.handleLogout);

    // 2.1. Escuchar eventos de recuperación de contraseña de Supabase
    if (window.setupAuthListeners) {
        window.setupAuthListeners();
    }

    // 3. Listeners de búsqueda y filtrado de stock
    const productSearch = document.getElementById('productSearch');
    const productCategoryFilter = document.getElementById('productCategoryFilter');
    if (productSearch) productSearch.addEventListener('input', window.renderProducts);
    if (productCategoryFilter) productCategoryFilter.addEventListener('change', window.renderProducts);

    // 4. Fechas por defecto en filtros
    const vFrom = document.getElementById('ventasFilterFrom');
    const vTo = document.getElementById('ventasFilterTo');
    const rFrom = document.getElementById('reportFrom');
    const rTo = document.getElementById('reportTo');

    if (vFrom) vFrom.value = window.monthStartISO();
    if (vTo) vTo.value = window.todayISO();
    if (rFrom) rFrom.value = window.daysAgoISO(180);
    if (rTo) rTo.value = window.todayISO();

    // 5. Listener de respaldo
    const backupReminderLink = document.getElementById('backupReminderLink');
    const backupReminderClose = document.getElementById('backupReminderClose');

    if (backupReminderLink) {
        backupReminderLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.navigateTo('reportes');
        });
    }

    if (backupReminderClose) {
        backupReminderClose.addEventListener('click', () => {
            const reminder = document.getElementById('backupReminder');
            if (reminder) reminder.style.display = 'none';
        });
    }

    // 6. Verificar sesión activa
    try {
        const user = await window.checkSession();
        if (user) {
            AppState.currentUser = user;
            await initApp();
        }
    } catch (e) {
        console.error('Error al verificar sesión existente:', e);
    }

    // 7. Ofrecer datos de ejemplo en primer uso si está vacío
    setTimeout(async () => {
        if (AppState.currentUser && AppState.allProducts.length === 0) {
            const sampleIds = localStorage.getItem('sampleProductIds');
            if (!sampleIds) {
                const ok = await window.showConfirm(
                    '¡Bienvenida! ¿Querés cargar unos productos de ejemplo para probar la app? Después los podés borrar con un solo clic.',
                    'Sí, cargar ejemplos'
                );
                if (ok && window.loadSampleData) {
                    await window.loadSampleData();
                }
            }
        }
    }, 1500);
}

// Exportar globalmente
window.initApp = initApp;
window.init = init;

// Iniciar aplicación al cargar el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
