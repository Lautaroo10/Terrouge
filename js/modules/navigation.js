// ============================================================
// TERROUGE — Módulo de Navegación & Tabs
// ============================================================

function navigateTo(page) {
    const pages = {
        dashboard: 'pageDashboard',
        stock: 'pageStock',
        ventas: 'pageVentas',
        produccion: 'pageProduccion',
        reportes: 'pageReportes'
    };

    const targetPageId = pages[page];
    if (!targetPageId) return;

    // Cambiar vista activa
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetEl = document.getElementById(targetPageId);
    if (targetEl) targetEl.classList.add('active');

    // Cambiar botón activo en la barra de navegación
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Cargar datos según la pestaña seleccionada
    if (page === 'dashboard' && window.loadDashboard) window.loadDashboard();
    if (page === 'stock') {
        if (window.loadProducts) window.loadProducts();
        if (window.loadCategories) window.loadCategories();
    }
    if (page === 'ventas' && window.loadSales) window.loadSales();
    if (page === 'produccion' && window.loadProductionHistory) window.loadProductionHistory();
    if (page === 'reportes' && window.loadReport) window.loadReport();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchStockTab(tab) {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));

    const prodContainer = document.getElementById('stockProductos');
    const catContainer = document.getElementById('stockCategorias');

    if (tab === 'productos') {
        if (btns[0]) btns[0].classList.add('active');
        if (prodContainer) prodContainer.style.display = 'block';
        if (catContainer) catContainer.style.display = 'none';
    } else {
        if (btns[1]) btns[1].classList.add('active');
        if (prodContainer) prodContainer.style.display = 'none';
        if (catContainer) catContainer.style.display = 'block';
    }
}

// Exportar globalmente
window.navigateTo = navigateTo;
window.switchStockTab = switchStockTab;
