// ============================================================
// TERROUGE — Módulo de Producción
// ============================================================

async function loadProductionHistory() {
    try {
        const { data, error } = await supabase.from('produccion')
            .select('*, productos(nombre)')
            .order('fecha', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) throw error;
        AppState.allProduction = data || [];
        renderProduction();

        // Cargar productos para el formulario
        if (AppState.allProducts.length === 0) {
            const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
            AppState.allProducts = prods || [];
        }
    } catch (e) {
        console.error('Error al cargar producción:', e);
        showToast('Error al cargar la producción', 'error');
    }
}

function renderProduction() {
    const el = document.getElementById('productionList');
    if (!el) return;

    if (AppState.allProduction.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">✨</div><p>No hay producción registrada</p></div>';
        return;
    }

    el.innerHTML = AppState.allProduction.map(p => `
        <div class="card prod-card">
            <div class="prod-qty">+${p.cantidad}</div>
            <div class="prod-info">
                <div class="prod-name">${p.productos?.nombre || '?'}</div>
                <div class="prod-date">📅 ${formatDate(p.fecha)}</div>
                ${p.notas ? `<div class="prod-notes">${p.notas}</div>` : ''}
            </div>
            <button class="btn btn-icon btn-danger" onclick="deleteProduction('${p.id}')" title="Borrar">🗑️</button>
        </div>
    `).join('');
}

async function openProductionModal() {
    // 1. Asegurar categorías cargadas
    if (!AppState.allCategories || AppState.allCategories.length === 0) {
        try {
            const { data: cats } = await supabase.from('categorias').select('*').order('nombre');
            AppState.allCategories = cats || [];
        } catch (e) {
            console.error('Error al cargar categorías en modal producción:', e);
        }
    }

    // 2. Asegurar productos cargados con sus categorías
    if (!AppState.allProducts || AppState.allProducts.length === 0) {
        try {
            const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
            AppState.allProducts = prods || [];
        } catch (e) {
            console.error('Error al cargar productos en modal producción:', e);
        }
    }

    document.getElementById('prodProdCantidad').value = 1;
    document.getElementById('prodProdFecha').value = todayISO();
    document.getElementById('prodProdNotas').value = '';

    // 3. Cargar opciones en el selector de categorías
    const catSel = document.getElementById('prodProdCategoria');
    if (catSel) {
        catSel.innerHTML = '<option value="">Todas las categorías</option>' +
            (AppState.allCategories || []).map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        catSel.value = '';
    }

    // 4. Renderizar productos iniciales
    renderProductionProductOptions('');

    openModal('modalProduccion');
}

function onProductionCategoryChange() {
    const catId = document.getElementById('prodProdCategoria')?.value || '';
    renderProductionProductOptions(catId);
}

function renderProductionProductOptions(catId) {
    const sel = document.getElementById('prodProdProducto');
    const notice = document.getElementById('prodNoProductsNotice');
    if (!sel) return;

    let filtered = AppState.allProducts || [];
    if (catId) {
        filtered = filtered.filter(p => p.categoria_id === catId);
    }

    if (filtered.length === 0) {
        sel.innerHTML = '<option value="">No hay productos en esta categoría</option>';
        sel.value = '';
        if (notice) notice.style.display = 'block';
        return;
    }

    if (notice) notice.style.display = 'none';

    // Si muestra todas las categorías, agrupar por categoría usando optgroup
    if (!catId && AppState.allCategories && AppState.allCategories.length > 0) {
        let html = '<option value="">Elegí un producto</option>';

        // Agrupar por cada categoría
        AppState.allCategories.forEach(cat => {
            const prodsInCat = filtered.filter(p => p.categoria_id === cat.id);
            if (prodsInCat.length > 0) {
                html += `<optgroup label="📂 ${cat.nombre}">`;
                prodsInCat.forEach(p => {
                    html += `<option value="${p.id}">${p.nombre} (stock actual: ${p.stock_actual})</option>`;
                });
                html += `</optgroup>`;
            }
        });

        // Productos sin categoría asignada
        const withoutCat = filtered.filter(p => !p.categoria_id);
        if (withoutCat.length > 0) {
            html += `<optgroup label="📦 Sin categoría">`;
            withoutCat.forEach(p => {
                html += `<option value="${p.id}">${p.nombre} (stock actual: ${p.stock_actual})</option>`;
            });
            html += `</optgroup>`;
        }

        sel.innerHTML = html;
    } else {
        // Categoría específica seleccionada
        sel.innerHTML = '<option value="">Elegí un producto</option>' +
            filtered.map(p => `<option value="${p.id}">${p.nombre} (stock actual: ${p.stock_actual})</option>`).join('');
    }
    sel.value = '';
}

async function saveProduction(e) {
    e.preventDefault();
    const producto_id = document.getElementById('prodProdProducto').value;
    const cantidad = parseInt(document.getElementById('prodProdCantidad').value, 10);
    const fecha = document.getElementById('prodProdFecha').value;
    const notas = document.getElementById('prodProdNotas').value.trim();

    if (!producto_id || !cantidad || !fecha) {
        showToast('Completá todos los campos obligatorios', 'warning');
        return;
    }
    if (cantidad <= 0) {
        showToast('La cantidad debe ser mayor a 0', 'warning');
        return;
    }

    showSaving();
    try {
        const { error } = await supabase.from('produccion').insert({
            user_id: AppState.currentUser.id,
            producto_id,
            cantidad,
            fecha,
            notas: notas || null
        });
        if (error) throw error;
        showSaved();
        showToast(`¡Producción registrada! Se sumaron ${cantidad} unidades al stock ✓`, 'success');
        closeModal();
        await loadProductionHistory();

        // Actualizar stock de productos
        const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
        AppState.allProducts = prods || [];
    } catch (e) {
        showSaveError();
        showToast('Error al registrar la producción. Intentá de nuevo.', 'error');
        console.error(e);
    }
}

async function deleteProduction(id) {
    const prod = AppState.allProduction.find(p => p.id === id);
    if (!prod) return;
    const ok = await showConfirm(
        `¿Querés borrar este registro de producción de ${prod.productos?.nombre}? Se van a restar ${prod.cantidad} unidades del stock.`,
        'Sí, borrar'
    );
    if (!ok) return;

    showSaving();
    try {
        const { error } = await supabase.from('produccion').delete().eq('id', id);
        if (error) throw error;
        showSaved();
        showToast('Registro de producción eliminado ✓', 'success');
        await loadProductionHistory();

        const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
        AppState.allProducts = prods || [];
    } catch (e) {
        showSaveError();
        showToast('Error al borrar el registro', 'error');
    }
}

// Exportar globalmente
window.loadProductionHistory = loadProductionHistory;
window.renderProduction = renderProduction;
window.openProductionModal = openProductionModal;
window.onProductionCategoryChange = onProductionCategoryChange;
window.renderProductionProductOptions = renderProductionProductOptions;
window.saveProduction = saveProduction;
window.deleteProduction = deleteProduction;
