// ============================================================
// TERROUGE — Módulo de Reportes & Exportación
// ============================================================

async function loadReport() {
    const from = document.getElementById('reportFrom')?.value || daysAgoISO(180);
    const to = document.getElementById('reportTo')?.value || todayISO();
    const catId = document.getElementById('reportCategory')?.value;

    try {
        let query = supabase.from('ventas')
            .select('*, productos(nombre, costo_produccion, categoria_id)')
            .eq('anulada', false)
            .gte('fecha', from)
            .lte('fecha', to)
            .order('fecha');

        const { data, error } = await query;
        if (error) throw error;

        let sales = data || [];
        if (catId) {
            sales = sales.filter(s => s.productos?.categoria_id === catId);
        }

        // Resumen
        const totalVentas = sales.reduce((s, v) => s + Number(v.precio_total), 0);
        const cantVentas = sales.length;
        const unidades = sales.reduce((s, v) => s + v.cantidad, 0);
        let ganancia = 0;
        sales.forEach(v => {
            if (v.productos?.costo_produccion > 0) {
                ganancia += (v.precio_unitario - v.productos.costo_produccion) * v.cantidad;
            }
        });

        const totalVentasEl = document.getElementById('reportTotalVentas');
        const cantVentasEl = document.getElementById('reportCantVentas');
        const unidadesEl = document.getElementById('reportUnidades');
        const gananciaEl = document.getElementById('reportGanancia');

        if (totalVentasEl) totalVentasEl.textContent = formatMoney(totalVentas);
        if (cantVentasEl) cantVentasEl.textContent = cantVentas;
        if (unidadesEl) unidadesEl.textContent = unidades;
        if (gananciaEl) gananciaEl.textContent = formatMoney(ganancia);

        // Agrupar por mes para el gráfico
        const months = {};
        sales.forEach(s => {
            const month = s.fecha.substring(0, 7);
            if (!months[month]) months[month] = 0;
            months[month] += Number(s.precio_total);
        });

        const sortedMonths = Object.keys(months).sort();
        const labels = sortedMonths.map(m => monthName(m));
        const values = sortedMonths.map(m => months[m]);

        renderChart(labels, values);
    } catch (e) {
        showToast('Error al cargar el reporte', 'error');
        console.error(e);
    }
}

function renderChart(labels, values) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (AppState.salesChart) AppState.salesChart.destroy();

    AppState.salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ventas ($)',
                data: values,
                backgroundColor: 'rgba(196, 154, 69, 0.6)',
                borderColor: 'rgba(196, 154, 69, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctxItem) => formatMoney(ctxItem.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => formatMoney(v),
                        font: { family: 'Nunito' }
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: { font: { family: 'Nunito' } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Descarga en formato Excel (.xlsx)
async function exportExcel() {
    showToast('Preparando el archivo Excel...', 'info');
    try {
        const { data: productos } = await supabase.from('productos')
            .select('*, categorias(nombre)').order('nombre');
        const { data: ventas } = await supabase.from('ventas')
            .select('*, productos(nombre)').order('fecha', { ascending: false });
        const { data: produccion } = await supabase.from('produccion')
            .select('*, productos(nombre)').order('fecha', { ascending: false });

        const wb = XLSX.utils.book_new();

        // Hoja 1: Productos
        const prodRows = (productos || []).map(p => ({
            'Nombre': p.nombre,
            'Categoría': p.categorias?.nombre || '',
            'Precio Venta': p.precio_venta,
            'Costo': p.costo_produccion || '',
            'Stock Actual': p.stock_actual,
            'Stock Mínimo': p.stock_minimo
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), 'Productos');

        // Hoja 2: Ventas
        const salesRows = (ventas || []).map(v => ({
            'Fecha': formatDate(v.fecha),
            'Producto': v.productos?.nombre || '',
            'Cantidad': v.cantidad,
            'Precio Unitario': v.precio_unitario,
            'Total': v.precio_total,
            'Medio de Pago': v.medio_pago,
            'Cliente': v.cliente || '',
            'Anulada': v.anulada ? 'Sí' : 'No'
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesRows), 'Ventas');

        // Hoja 3: Producción
        const prodHist = (produccion || []).map(p => ({
            'Fecha': formatDate(p.fecha),
            'Producto': p.productos?.nombre || '',
            'Cantidad': p.cantidad,
            'Notas': p.notas || ''
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodHist), 'Producción');

        const dateStr = todayISO();
        XLSX.writeFile(wb, `respaldo-terrouge-${dateStr}.xlsx`);

        localStorage.setItem('lastBackupDate', dateStr);
        showToast('¡Respaldo descargado! ✓', 'success');
        checkBackupReminder();
    } catch (e) {
        showToast('Error al crear el archivo Excel', 'error');
        console.error(e);
    }
}

// Descarga en formato CSV
async function exportCSV() {
    showToast('Preparando los archivos CSV...', 'info');
    try {
        const { data: productos } = await supabase.from('productos')
            .select('*, categorias(nombre)').order('nombre');
        const { data: ventas } = await supabase.from('ventas')
            .select('*, productos(nombre)').order('fecha', { ascending: false });
        const { data: produccion } = await supabase.from('produccion')
            .select('*, productos(nombre)').order('fecha', { ascending: false });

        const prodRows = (productos || []).map(p => ({
            'Nombre': p.nombre, 'Categoría': p.categorias?.nombre || '',
            'Precio Venta': p.precio_venta, 'Costo': p.costo_produccion || '',
            'Stock Actual': p.stock_actual, 'Stock Mínimo': p.stock_minimo
        }));
        const ws = XLSX.utils.json_to_sheet(prodRows);
        const csv = XLSX.utils.sheet_to_csv(ws);

        const salesRows = (ventas || []).map(v => ({
            'Fecha': formatDate(v.fecha), 'Producto': v.productos?.nombre || '',
            'Cantidad': v.cantidad, 'Precio Unitario': v.precio_unitario,
            'Total': v.precio_total, 'Medio': v.medio_pago,
            'Cliente': v.cliente || '', 'Anulada': v.anulada ? 'Sí' : 'No'
        }));
        const wsSales = XLSX.utils.json_to_sheet(salesRows);
        const csvSales = XLSX.utils.sheet_to_csv(wsSales);

        const prodHist = (produccion || []).map(p => ({
            'Fecha': formatDate(p.fecha), 'Producto': p.productos?.nombre || '',
            'Cantidad': p.cantidad, 'Notas': p.notas || ''
        }));
        const wsProd = XLSX.utils.json_to_sheet(prodHist);
        const csvProd = XLSX.utils.sheet_to_csv(wsProd);

        downloadCSVFile(csv, `productos-${todayISO()}.csv`);
        setTimeout(() => downloadCSVFile(csvSales, `ventas-${todayISO()}.csv`), 500);
        setTimeout(() => downloadCSVFile(csvProd, `produccion-${todayISO()}.csv`), 1000);

        localStorage.setItem('lastBackupDate', todayISO());
        showToast('¡Archivos CSV descargados! ✓', 'success');
    } catch (e) {
        showToast('Error al crear los archivos CSV', 'error');
    }
}

function downloadCSVFile(csv, filename) {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function checkBackupReminder() {
    const lastBackup = localStorage.getItem('lastBackupDate');
    const reminder = document.getElementById('backupReminder');
    if (!reminder) return;

    if (!lastBackup) {
        localStorage.setItem('lastBackupDate', todayISO());
        reminder.style.display = 'none';
        return;
    }

    const last = new Date(lastBackup);
    const now = new Date();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
        reminder.style.display = 'flex';
    } else {
        reminder.style.display = 'none';
    }
}

// Exportar globalmente
window.loadReport = loadReport;
window.renderChart = renderChart;
window.exportExcel = exportExcel;
window.exportCSV = exportCSV;
window.downloadCSVFile = downloadCSVFile;
window.checkBackupReminder = checkBackupReminder;
