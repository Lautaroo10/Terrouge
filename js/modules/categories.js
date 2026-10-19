// ============================================================
// TERROUGE — Módulo de Categorías
// ============================================================

async function loadCategories() {
    try {
        const { data, error } = await supabase.from('categorias').select('*').order('nombre');
        if (error) throw error;
        AppState.allCategories = data || [];
        renderCategories();
        updateCategorySelects();
    } catch (e) {
        console.error('Error al cargar categorías:', e);
        showToast('Error al cargar categorías', 'error');
    }
}

function renderCategories() {
    const el = document.getElementById('categoryList');
    if (!el) return;

    if (AppState.allCategories.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📁</div><p>No hay categorías todavía</p></div>';
        return;
    }

    el.innerHTML = AppState.allCategories.map(c => {
        const count = AppState.allProducts.filter(p => p.categoria_id === c.id).length;
        return `<div class="card category-item">
            <div>
                <div class="category-name">${c.nombre}</div>
                <div class="category-count">${count} producto${count !== 1 ? 's' : ''}</div>
            </div>
            <div class="product-actions">
                <button class="btn btn-icon btn-secondary" onclick="openCategoryModal('${c.id}')" title="Editar">✏️</button>
                <button class="btn btn-icon btn-danger" onclick="deleteCategory('${c.id}')" title="Borrar">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

function updateCategorySelects() {
    const options = '<option value="">Sin categoría</option>' +
        AppState.allCategories.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    const filterOptions = '<option value="">Todas</option>' +
        AppState.allCategories.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    const reportOptions = '<option value="">Todas las categorías</option>' +
        AppState.allCategories.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    const prodCat = document.getElementById('prodCategoria');
    const filterCat = document.getElementById('productCategoryFilter');
    const repCat = document.getElementById('reportCategory');

    if (prodCat) prodCat.innerHTML = options;
    if (filterCat) filterCat.innerHTML = filterOptions;
    if (repCat) repCat.innerHTML = reportOptions;
}

function openCategoryModal(id = null) {
    const cat = id ? AppState.allCategories.find(c => c.id === id) : null;
    document.getElementById('catModalTitle').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
    document.getElementById('catId').value = cat ? cat.id : '';
    document.getElementById('catNombre').value = cat ? cat.nombre : '';
    openModal('modalCategoria');
    document.getElementById('catNombre').focus();
}

async function saveCategory(e) {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const nombre = document.getElementById('catNombre').value.trim();
    if (!nombre) return;

    showSaving();
    try {
        if (id) {
            const { error } = await supabase.from('categorias').update({ nombre }).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('categorias').insert({ nombre, user_id: AppState.currentUser.id });
            if (error) throw error;
        }
        showSaved();
        showToast(id ? 'Categoría actualizada ✓' : 'Categoría creada ✓', 'success');
        closeModal();
        await loadCategories();
    } catch (e) {
        showSaveError();
        showToast('Error al guardar la categoría. Intentá de nuevo.', 'error');
    }
}

async function deleteCategory(id) {
    const cat = AppState.allCategories.find(c => c.id === id);
    if (!cat) return;
    const prods = AppState.allProducts.filter(p => p.categoria_id === id);
    let msg = `¿Estás segura de borrar la categoría "${cat.nombre}"?`;
    if (prods.length > 0) msg += ` Tiene ${prods.length} producto(s) que quedarían sin categoría.`;

    const ok = await showConfirm(msg, 'Sí, borrar');
    if (!ok) return;

    showSaving();
    try {
        const { error } = await supabase.from('categorias').delete().eq('id', id);
        if (error) throw error;
        showSaved();
        showToast('Categoría eliminada ✓', 'success');
        await loadCategories();
        if (window.loadProducts) await window.loadProducts();
    } catch (e) {
        showSaveError();
        showToast('Error al borrar la categoría', 'error');
    }
}

async function ensureDefaultCategories() {
    if (!AppState.currentUser) return;
    try {
        const { data } = await supabase.from('categorias').select('id').limit(1);
        if (!data || data.length === 0) {
            const defaults = [
                { nombre: 'Velas decorativas', user_id: AppState.currentUser.id },
                { nombre: 'Vírgenes artesanales', user_id: AppState.currentUser.id }
            ];
            await supabase.from('categorias').insert(defaults);
        }
    } catch (e) {
        console.error('Error al crear categorías por defecto:', e);
    }
}

// Exportar globalmente
window.loadCategories = loadCategories;
window.renderCategories = renderCategories;
window.updateCategorySelects = updateCategorySelects;
window.openCategoryModal = openCategoryModal;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;
window.ensureDefaultCategories = ensureDefaultCategories;
