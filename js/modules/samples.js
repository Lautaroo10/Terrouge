// ============================================================
// TERROUGE — Módulo de Datos de Ejemplo
// ============================================================

async function loadSampleData() {
    showSaving();
    try {
        await ensureDefaultCategories();
        const { data: cats } = await supabase.from('categorias').select('*');
        const velaCat = cats.find(c => c.nombre.toLowerCase().includes('vela'));
        const virgenCat = cats.find(c => c.nombre.toLowerCase().includes('virgen'));

        const samples = [
            { nombre: 'Vela aromática lavanda', categoria_id: velaCat?.id, precio_venta: 3500, costo_produccion: 1200, stock_actual: 15, stock_minimo: 5, user_id: AppState.currentUser.id },
            { nombre: 'Vela decorativa floral', categoria_id: velaCat?.id, precio_venta: 4200, costo_produccion: 1500, stock_actual: 8, stock_minimo: 3, user_id: AppState.currentUser.id },
            { nombre: 'Virgen de Luján 20cm', categoria_id: virgenCat?.id, precio_venta: 8500, costo_produccion: 3000, stock_actual: 5, stock_minimo: 2, user_id: AppState.currentUser.id },
            { nombre: 'Virgen Milagrosa pintada', categoria_id: virgenCat?.id, precio_venta: 6800, costo_produccion: 2500, stock_actual: 12, stock_minimo: 3, user_id: AppState.currentUser.id }
        ];

        const { data: inserted, error } = await supabase.from('productos').insert(samples).select();
        if (error) throw error;

        localStorage.setItem('sampleProductIds', JSON.stringify(inserted.map(p => p.id)));
        showSaved();
        showToast('¡Productos de ejemplo cargados! ✓', 'success');
        if (window.loadProducts) await window.loadProducts();
        checkSampleDataBanner();
        if (window.loadDashboard) window.loadDashboard();
    } catch (e) {
        showSaveError();
        showToast('Error al cargar datos de ejemplo', 'error');
        console.error(e);
    }
}

async function clearSampleData() {
    const ok = await showConfirm('¿Querés borrar los productos de ejemplo? Esto no afecta los productos que creaste vos.', 'Sí, borrar');
    if (!ok) return;

    showSaving();
    try {
        const ids = JSON.parse(localStorage.getItem('sampleProductIds') || '[]');
        if (ids.length > 0) {
            for (const id of ids) {
                await supabase.from('productos').delete().eq('id', id);
            }
        }
        localStorage.removeItem('sampleProductIds');
        showSaved();
        showToast('Datos de ejemplo eliminados ✓', 'success');
        if (window.loadProducts) await window.loadProducts();
        checkSampleDataBanner();
        if (window.loadDashboard) window.loadDashboard();
    } catch (e) {
        showSaveError();
        showToast('Error al borrar datos de ejemplo', 'error');
    }
}

function checkSampleDataBanner() {
    const ids = JSON.parse(localStorage.getItem('sampleProductIds') || '[]');
    const banner = document.getElementById('sampleDataBanner');
    if (banner) {
        banner.style.display = ids.length > 0 ? 'block' : 'none';
    }
}

// Exportar globalmente
window.loadSampleData = loadSampleData;
window.clearSampleData = clearSampleData;
window.checkSampleDataBanner = checkSampleDataBanner;
