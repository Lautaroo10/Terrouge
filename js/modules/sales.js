// ============================================================
// TERROUGE — Módulo de Ventas
// ============================================================

async function loadSales() {
    try {
        const from = document.getElementById('ventasFilterFrom')?.value;
        const to = document.getElementById('ventasFilterTo')?.value;

        let query = supabase.from('ventas')
            .select('*, productos(nombre, categorias(nombre))')
            .order('fecha', { ascending: false })
            .order('created_at', { ascending: false });

        if (from) query = query.gte('fecha', from);
        if (to) query = query.lte('fecha', to);

        const { data, error } = await query.limit(100);
        if (error) throw error;
        AppState.allSales = data || [];
        renderSales();

        // Cargar productos actualizados si no están en memoria
        if (AppState.allProducts.length === 0) {
            const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
            AppState.allProducts = prods || [];
        }
    } catch (e) {
        console.error('Error al cargar ventas:', e);
        showToast('Error al cargar las ventas', 'error');
    }
}

function filterSales() {
    loadSales();
}

function renderSales() {
    const el = document.getElementById('salesList');
    const totalBar = document.getElementById('salesTotalBar');
    if (!el) return;

    const activeSales = AppState.allSales.filter(s => !s.anulada);

    if (AppState.allSales.length === 0) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><p>No hay ventas registradas</p></div>';
        if (totalBar) totalBar.style.display = 'none';
        return;
    }

    const total = activeSales.reduce((s, v) => s + Number(v.precio_total), 0);
    if (totalBar) {
        totalBar.style.display = 'flex';
        const totalValEl = document.getElementById('salesTotalValue');
        if (totalValEl) totalValEl.textContent = formatMoney(total);
    }

    el.innerHTML = AppState.allSales.map(v => {
        return `<div class="card sale-card ${v.anulada ? 'anulada' : ''}">
            <div class="sale-header">
                <div class="sale-product">${v.productos?.nombre || '?'}</div>
                <div class="sale-total">${formatMoney(v.precio_total)}</div>
            </div>
            <div class="sale-details">
                <span class="sale-detail">📅 ${formatDate(v.fecha)}</span>
                <span class="sale-detail">📦 ${v.cantidad} uds × ${formatMoney(v.precio_unitario)}</span>
                <span class="sale-detail">${medioLabel(v.medio_pago)}</span>
                ${v.cliente ? `<span class="sale-detail">👤 ${v.cliente}</span>` : ''}
            </div>
            ${!v.anulada ? `<div class="sale-actions">
                <button class="btn btn-sm btn-secondary" onclick="openEditSaleModal('${v.id}')">✏️ Editar</button>
                <button class="btn btn-sm btn-danger" onclick="annulSale('${v.id}')">✕ Anular</button>
            </div>` : `<div class="sale-actions"><button class="btn btn-sm btn-success" onclick="reactivateSale('${v.id}')">↩ Reactivar</button></div>`}
        </div>`;
    }).join('');
}

function openSaleModal() {
    document.getElementById('ventaModalTitle').textContent = 'Registrar venta';
    document.getElementById('ventaId').value = '';
    document.getElementById('ventaCantidad').value = 1;
    document.getElementById('ventaPrecio').value = '';
    document.getElementById('ventaFecha').value = todayISO();
    document.getElementById('ventaMedio').value = 'efectivo';
    document.getElementById('ventaCliente').value = '';
    document.getElementById('ventaTotal').textContent = '$0';
    document.getElementById('ventaStockHint').textContent = '';

    // Llenar select de productos
    const sel = document.getElementById('ventaProducto');
    sel.innerHTML = '<option value="">Elegí un producto</option>' +
        AppState.allProducts.map(p => `<option value="${p.id}" data-price="${p.precio_venta}" data-stock="${p.stock_actual}">${p.nombre} (stock: ${p.stock_actual})</option>`).join('');
    sel.value = '';

    openModal('modalVenta');
}

function openEditSaleModal(id) {
    const sale = AppState.allSales.find(s => s.id === id);
    if (!sale) return;

    document.getElementById('ventaModalTitle').textContent = 'Editar venta';
    document.getElementById('ventaId').value = sale.id;

    const sel = document.getElementById('ventaProducto');
    sel.innerHTML = '<option value="">Elegí un producto</option>' +
        AppState.allProducts.map(p => `<option value="${p.id}" data-price="${p.precio_venta}" data-stock="${p.stock_actual}">${p.nombre} (stock: ${p.stock_actual})</option>`).join('');
    sel.value = sale.producto_id;

    document.getElementById('ventaCantidad').value = sale.cantidad;
    document.getElementById('ventaPrecio').value = sale.precio_unitario;
    document.getElementById('ventaFecha').value = sale.fecha;
    document.getElementById('ventaMedio').value = sale.medio_pago;
    document.getElementById('ventaCliente').value = sale.cliente || '';
    updateSaleTotal();

    openModal('modalVenta');
}

function onSaleProductChange() {
    const sel = document.getElementById('ventaProducto');
    const opt = sel.options[sel.selectedIndex];
    if (opt && opt.value) {
        const price = opt.getAttribute('data-price');
        const stock = opt.getAttribute('data-stock');
        document.getElementById('ventaPrecio').value = price;
        document.getElementById('ventaStockHint').textContent = `Stock disponible: ${stock} unidades`;
        updateSaleTotal();
    } else {
        document.getElementById('ventaStockHint').textContent = '';
    }
}

function updateSaleTotal() {
    const cant = parseInt(document.getElementById('ventaCantidad').value, 10) || 0;
    const precio = parseFloat(document.getElementById('ventaPrecio').value) || 0;
    document.getElementById('ventaTotal').textContent = formatMoney(cant * precio);
}

async function saveSale(e) {
    e.preventDefault();
    const id = document.getElementById('ventaId').value;
    const producto_id = document.getElementById('ventaProducto').value;
    const cantidad = parseInt(document.getElementById('ventaCantidad').value, 10);
    const precio_unitario = parseFloat(document.getElementById('ventaPrecio').value);
    const fecha = document.getElementById('ventaFecha').value;
    const medio_pago = document.getElementById('ventaMedio').value;
    const cliente = document.getElementById('ventaCliente').value.trim();

    if (!producto_id || !cantidad || isNaN(precio_unitario) || !fecha) {
        showToast('Completá todos los campos obligatorios', 'warning');
        return;
    }
    if (cantidad <= 0 || precio_unitario < 0) {
        showToast('La cantidad debe ser mayor a 0 y el precio no puede ser negativo', 'warning');
        return;
    }

    // Advertencia de stock
    const prod = AppState.allProducts.find(p => p.id === producto_id);
    if (prod && !id) {
        if (cantidad > prod.stock_actual) {
            const ok = await showConfirm(
                `Solo hay ${prod.stock_actual} unidades de "${prod.nombre}" en stock. ¿Querés registrar la venta igual?`,
                'Sí, registrar'
            );
            if (!ok) return;
        }
    }

    const precio_total = cantidad * precio_unitario;

    showSaving();
    try {
        if (id) {
            const { error } = await supabase.from('ventas').update({
                producto_id, cantidad, precio_unitario, precio_total, fecha, medio_pago, cliente: cliente || null
            }).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('ventas').insert({
                user_id: AppState.currentUser.id, producto_id, cantidad, precio_unitario, precio_total, fecha, medio_pago, cliente: cliente || null
            });
            if (error) throw error;
        }
        showSaved();
        showToast(id ? 'Venta actualizada ✓' : '¡Venta registrada! ✓', 'success');
        closeModal();
        await loadSales();

        // Actualizar stock de productos en memoria
        const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
        AppState.allProducts = prods || [];
    } catch (e) {
        showSaveError();
        showToast('Error al guardar la venta. Intentá de nuevo.', 'error');
        console.error(e);
    }
}

async function annulSale(id) {
    const sale = AppState.allSales.find(s => s.id === id);
    if (!sale) return;
    const ok = await showConfirm(
        `¿Querés anular esta venta de ${sale.productos?.nombre}? El stock se va a devolver automáticamente.`,
        'Sí, anular'
    );
    if (!ok) return;

    showSaving();
    try {
        const { error } = await supabase.from('ventas').update({ anulada: true }).eq('id', id);
        if (error) throw error;
        showSaved();
        showToast('Venta anulada. El stock fue devuelto ✓', 'success');
        await loadSales();

        const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
        AppState.allProducts = prods || [];
    } catch (e) {
        showSaveError();
        showToast('Error al anular la venta', 'error');
    }
}

async function reactivateSale(id) {
    const ok = await showConfirm('¿Querés reactivar esta venta? Se va a descontar el stock nuevamente.', 'Sí, reactivar');
    if (!ok) return;

    showSaving();
    try {
        const { error } = await supabase.from('ventas').update({ anulada: false }).eq('id', id);
        if (error) throw error;
        showSaved();
        showToast('Venta reactivada ✓', 'success');
        await loadSales();

        const { data: prods } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre');
        AppState.allProducts = prods || [];
    } catch (e) {
        showSaveError();
        showToast('Error al reactivar la venta', 'error');
    }
}

// Exportar globalmente
window.loadSales = loadSales;
window.filterSales = filterSales;
window.renderSales = renderSales;
window.openSaleModal = openSaleModal;
window.openEditSaleModal = openEditSaleModal;
window.onSaleProductChange = onSaleProductChange;
window.updateSaleTotal = updateSaleTotal;
window.saveSale = saveSale;
window.annulSale = annulSale;
window.reactivateSale = reactivateSale;
