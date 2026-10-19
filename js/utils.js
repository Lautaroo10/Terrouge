// ============================================================
// TERROUGE — Utilidades & UI Helpers
// ============================================================

// Formateo de moneda argentina ($ 1.500)
function formatMoney(n) {
    if (n == null || isNaN(n)) return '$0';
    return '$' + Math.round(Number(n)).toLocaleString('es-AR');
}

// Formateo de fecha argentina (DD/MM/AAAA)
function formatDate(d) {
    if (!d) return '';
    const date = new Date(d + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Fecha de hoy en formato YYYY-MM-DD
function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Primer día del mes actual en formato YYYY-MM-DD
function monthStartISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
}

// Fecha de N días atrás en formato YYYY-MM-DD
function daysAgoISO(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Nombre abreviado del mes a partir de YYYY-MM
function monthName(yyyymm) {
    const [y, m] = yyyymm.split('-');
    const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return names[parseInt(m, 10) - 1] + ' ' + y;
}

// Etiqueta amigable con icono para medios de pago
function medioLabel(m) {
    const map = {
        efectivo: '💵 Efectivo',
        transferencia: '🏦 Transferencia',
        otro: '📋 Otro'
    };
    return map[m] || m;
}

// Notificación flotante (toast)
function showToast(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Indicador superior de guardado en la nube
function showSaving() {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = '⏳ Guardando...';
    el.className = 'saving';
    el.style.display = 'block';
}

function showSaved() {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = '✅ Guardado';
    el.className = 'saved';
    setTimeout(() => { el.style.display = 'none'; }, 2000);
}

function showSaveError() {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    el.textContent = '❌ Error';
    el.className = 'save-error';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// Apertura y cierre de modales
function openModal(modalId) {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    if (overlay && modal) {
        overlay.classList.add('open');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
}

// Cuadro de confirmación nativo e intuitivo
async function showConfirm(text, okText = 'Sí, dale') {
    return new Promise(resolve => {
        AppState.confirmResolve = resolve;
        const confirmTextEl = document.getElementById('confirmText');
        const confirmOkBtn = document.getElementById('confirmOkBtn');
        if (confirmTextEl) confirmTextEl.textContent = text;
        if (confirmOkBtn) confirmOkBtn.textContent = okText;
        openModal('modalConfirm');
    });
}

// Exportar globalmente
window.formatMoney = formatMoney;
window.formatDate = formatDate;
window.todayISO = todayISO;
window.monthStartISO = monthStartISO;
window.daysAgoISO = daysAgoISO;
window.monthName = monthName;
window.medioLabel = medioLabel;
window.showToast = showToast;
window.showSaving = showSaving;
window.showSaved = showSaved;
window.showSaveError = showSaveError;
window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirm = showConfirm;
