// ============================================================
// TERROUGE — Módulo de Stock & Productos
// ============================================================

async function loadProducts() {
    try {
        const { data, error } = await supabase.from('productos')
            .select('*, categorias(nombre)')
            .order('nombre');
        if (error) throw error;
        AppState.allProducts = data || [];
        renderProducts();
    } catch (e) {
        console.error('Error al cargar productos:', e);
        showToast('Error al cargar productos', 'error');
    }
}

function renderProducts() {
    const searchInput = document.getElementById('productSearch');
    const catFilterInput = document.getElementById('productCategoryFilter');

    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const catFilter = catFilterInput ? catFilterInput.value : '';

    let filtered = AppState.allProducts;
    if (search) filtered = filtered.filter(p => p.nombre.toLowerCase().includes(search));
    if (catFilter) filtered = filtered.filter(p => p.categoria_id === catFilter);

    const el = document.getElementById('productList');
    if (!el) return;

    if (filtered.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><p>No hay productos. ¡Agregá el primero!</p></div>';
        return;
    }

    el.innerHTML = filtered.map(p => {
        let stockClass = '';
        if (p.stock_actual <= 0) stockClass = 'out';
        else if (p.stock_minimo > 0 && p.stock_actual <= p.stock_minimo) stockClass = 'low';

        const photoHtml = p.foto_url
            ? `<img src="${p.foto_url}" alt="${p.nombre}">`
            : '🕯️';

        return `<div class="card product-card">
            <div class="product-photo">${photoHtml}</div>
            <div class="product-info">
                <div class="product-name">${p.nombre}</div>
                <div class="product-category">${p.categorias?.nombre || 'Sin categoría'}</div>
                <div class="product-meta">
                    <span class="product-stock ${stockClass}">Stock: ${p.stock_actual}</span>
                    <span class="product-price">${formatMoney(p.precio_venta)}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-icon btn-secondary" onclick="openProductModal('${p.id}')" title="Editar">✏️</button>
                <button class="btn btn-icon btn-danger" onclick="deleteProduct('${p.id}')" title="Borrar">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

function openProductModal(id = null) {
    const prod = id ? AppState.allProducts.find(p => p.id === id) : null;
    document.getElementById('prodModalTitle').textContent = prod ? 'Editar producto' : 'Nuevo producto';
    document.getElementById('prodId').value = prod ? prod.id : '';
    document.getElementById('prodNombre').value = prod ? prod.nombre : '';
    if (window.updateCategorySelects) window.updateCategorySelects();
    document.getElementById('prodCategoria').value = prod ? (prod.categoria_id || '') : '';
    document.getElementById('prodPrecio').value = prod ? prod.precio_venta : '';
    document.getElementById('prodCosto').value = prod ? (prod.costo_produccion || '') : '';
    document.getElementById('prodStock').value = prod ? prod.stock_actual : 0;
    document.getElementById('prodStockMin').value = prod ? prod.stock_minimo : 0;
    document.getElementById('prodPhotoUrl').value = prod ? (prod.foto_url || '') : '';

    const preview = document.getElementById('prodPhotoPreview');
    if (prod && prod.foto_url) {
        preview.innerHTML = `<img src="${prod.foto_url}" alt="">`;
    } else {
        preview.innerHTML = '📷';
    }

    // Si está editando, deshabilitar campo de stock inicial
    const stockInput = document.getElementById('prodStock');
    if (prod) {
        stockInput.disabled = true;
        stockInput.title = 'El stock se actualiza automáticamente con producción y ventas';
    } else {
        stockInput.disabled = false;
        stockInput.title = '';
    }

    openModal('modalProducto');
    document.getElementById('prodNombre').focus();
}

async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const nombre = document.getElementById('prodNombre').value.trim();
    const categoria_id = document.getElementById('prodCategoria').value || null;
    const precio_venta = parseFloat(document.getElementById('prodPrecio').value) || 0;
    const costo_produccion = parseFloat(document.getElementById('prodCosto').value) || 0;
    const stock_actual = parseInt(document.getElementById('prodStock').value, 10) || 0;
    const stock_minimo = parseInt(document.getElementById('prodStockMin').value, 10) || 0;

    if (!nombre) return;
    if (precio_venta < 0 || costo_produccion < 0 || stock_actual < 0 || stock_minimo < 0) {
        showToast('Los valores numéricos no pueden ser negativos', 'warning');
        return;
    }

    // Foto opcional
    let foto_url = document.getElementById('prodPhotoUrl').value || null;
    const fileInput = document.getElementById('prodPhotoFile');
    if (fileInput.files.length > 0) {
        try {
            foto_url = await uploadPhoto(fileInput.files[0]);
        } catch (err) {
            showToast('Error al subir la foto, pero el producto se guardará sin ella', 'warning');
        }
    }

    showSaving();
    try {
        const productData = { nombre, categoria_id, precio_venta, costo_produccion, stock_minimo, foto_url };
        if (id) {
            const { error } = await supabase.from('productos').update(productData).eq('id', id);
            if (error) throw error;
        } else {
            productData.user_id = AppState.currentUser.id;
            productData.stock_actual = stock_actual;
            const { error } = await supabase.from('productos').insert(productData);
            if (error) throw error;
        }
        showSaved();
        showToast(id ? 'Producto actualizado ✓' : 'Producto creado ✓', 'success');
        closeModal();
        fileInput.value = '';
        await loadProducts();
    } catch (e) {
        showSaveError();
        showToast('Error al guardar el producto. Intentá de nuevo.', 'error');
    }
}

async function deleteProduct(id) {
    const prod = AppState.allProducts.find(p => p.id === id);
    if (!prod) return;
    const ok = await showConfirm(`¿Estás segura de borrar "${prod.nombre}"? Esta acción no se puede deshacer.`, 'Sí, borrar');
    if (!ok) return;

    showSaving();
    try {
        const { error } = await supabase.from('productos').delete().eq('id', id);
        if (error) {
            if (error.message?.includes('violates foreign key')) {
                showToast('No se puede borrar porque tiene ventas o producción registrada. Podés editarlo en su lugar.', 'warning', 5000);
                showSaveError();
                return;
            }
            throw error;
        }
        showSaved();
        showToast('Producto eliminado ✓', 'success');
        await loadProducts();
    } catch (e) {
        showSaveError();
        showToast('Error al borrar el producto', 'error');
    }
}

// Compresión de fotos en el navegador
async function compressImage(file, maxWidth = 400, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                if (w > maxWidth) {
                    h = (h * maxWidth) / w;
                    w = maxWidth;
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function uploadPhoto(file) {
    const blob = await compressImage(file);
    const fileName = `${AppState.currentUser.id}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('product-photos').upload(fileName, blob, { contentType: 'image/jpeg' });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('product-photos').getPublicUrl(fileName);
    return urlData.publicUrl;
}

function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('prodPhotoPreview');
            if (preview) preview.innerHTML = `<img src="${e.target.result}" alt="">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Exportar globalmente
window.loadProducts = loadProducts;
window.renderProducts = renderProducts;
window.openProductModal = openProductModal;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.compressImage = compressImage;
window.uploadPhoto = uploadPhoto;
window.previewPhoto = previewPhoto;
