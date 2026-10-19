// ============================================================
// TERROUGE — Módulo Dashboard / Inicio
// ============================================================

async function loadDashboard() {
    try {
        // 1. Obtener productos
        const { data: products, error: prodErr } = await supabase.from('productos').select('*');
        if (prodErr) throw prodErr;
        AppState.allProducts = products || [];

        // 2. Stock total
        const totalStock = AppState.allProducts.reduce((s, p) => s + (p.stock_actual || 0), 0);
        const statTotalStockEl = document.getElementById('statTotalStock');
        if (statTotalStockEl) statTotalStockEl.textContent = totalStock.toLocaleString('es-AR');

        // 3. Ventas de hoy
        const { data: salesToday, error: stErr } = await supabase.from('ventas')
            .select('precio_total')
            .eq('anulada', false)
            .eq('fecha', todayISO());
        if (stErr) throw stErr;
        const ventasHoyTotal = (salesToday || []).reduce((s, v) => s + Number(v.precio_total), 0);
        const statVentasHoyEl = document.getElementById('statVentasHoy');
        if (statVentasHoyEl) statVentasHoyEl.textContent = formatMoney(ventasHoyTotal);

        // 4. Ventas del mes
        const { data: salesMonth, error: smErr } = await supabase.from('ventas')
            .select('precio_total, cantidad, producto_id')
            .eq('anulada', false)
            .gte('fecha', monthStartISO());
        if (smErr) throw smErr;
        const ventasMesTotal = (salesMonth || []).reduce((s, v) => s + Number(v.precio_total), 0);
        const statVentasMesEl = document.getElementById('statVentasMes');
        if (statVentasMesEl) statVentasMesEl.textContent = formatMoney(ventasMesTotal);

        // 5. Ganancia estimada del mes
        let ganancia = 0;
        if (salesMonth) {
            salesMonth.forEach(v => {
                const prod = AppState.allProducts.find(p => p.id === v.producto_id);
                if (prod && prod.costo_produccion > 0) {
                    ganancia += (Number(v.precio_total) / v.cantidad - prod.costo_produccion) * v.cantidad;
                }
            });
        }
        const statGananciaEl = document.getElementById('statGanancia');
        if (statGananciaEl) statGananciaEl.textContent = formatMoney(ganancia);

        // 6. Alertas de stock bajo / agotado
        const lowStock = AppState.allProducts.filter(p => p.stock_minimo > 0 && p.stock_actual <= p.stock_minimo && p.stock_actual > 0);
        const outOfStock = AppState.allProducts.filter(p => p.stock_actual <= 0);
        let alertsHtml = '';

        if (outOfStock.length > 0) {
            alertsHtml += `<div class="alert-banner alert-danger">
                <span class="alert-icon">🚨</span>
                <div><strong>Sin stock:</strong> ${outOfStock.map(p => p.nombre).join(', ')}</div>
            </div>`;
        }
        if (lowStock.length > 0) {
            alertsHtml += `<div class="alert-banner alert-warning">
                <span class="alert-icon">⚠️</span>
                <div><strong>Stock bajo:</strong> ${lowStock.map(p => `${p.nombre} (${p.stock_actual} uds)`).join(', ')}</div>
            </div>`;
        }
        const lowStockAlertsEl = document.getElementById('lowStockAlerts');
        if (lowStockAlertsEl) lowStockAlertsEl.innerHTML = alertsHtml;

        // 7. Productos más vendidos (últimos 30 días)
        const { data: recentSales, error: rsErr } = await supabase.from('ventas')
            .select('producto_id, cantidad, productos(nombre)')
            .eq('anulada', false)
            .gte('fecha', daysAgoISO(30));
        if (rsErr) throw rsErr;

        const topMap = {};
        (recentSales || []).forEach(v => {
            if (!topMap[v.producto_id]) {
                topMap[v.producto_id] = { nombre: v.productos?.nombre || '?', total: 0 };
            }
            topMap[v.producto_id].total += v.cantidad;
        });

        const topSellers = Object.values(topMap).sort((a, b) => b.total - a.total).slice(0, 5);
        const topSellersListEl = document.getElementById('topSellersList');

        if (topSellersListEl) {
            if (topSellers.length > 0) {
                topSellersListEl.innerHTML = topSellers.map((t, i) =>
                    `<div class="top-seller-item">
                        <div class="top-seller-rank">${i + 1}</div>
                        <div class="top-seller-name">${t.nombre}</div>
                        <div class="top-seller-qty">${t.total} uds</div>
                    </div>`
                ).join('');
            } else {
                topSellersListEl.innerHTML = '<div class="empty-state"><p>Todavía no hay ventas registradas</p></div>';
            }
        }

    } catch (e) {
        console.error('Error al cargar panel de inicio:', e);
        showToast('Error al cargar el panel. ¿Hay internet?', 'error');
    }
}

// Exportar globalmente
window.loadDashboard = loadDashboard;
