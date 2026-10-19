import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Pruebas Unitarias: Lógica de Negocio y Stock', () => {
    test('Calcula alertas de stock bajo y sin stock correctamente', () => {
        const productos = [
            { id: 1, nombre: 'Vela Lavanda', stock_actual: 0, stock_minimo: 5 },
            { id: 2, nombre: 'Vela Vainilla', stock_actual: 3, stock_minimo: 5 },
            { id: 3, nombre: 'Virgen Luján', stock_actual: 10, stock_minimo: 2 }
        ];

        const outOfStock = productos.filter(p => p.stock_actual <= 0);
        const lowStock = productos.filter(p => p.stock_minimo > 0 && p.stock_actual <= p.stock_minimo && p.stock_actual > 0);

        assert.equal(outOfStock.length, 1);
        assert.equal(outOfStock[0].nombre, 'Vela Lavanda');

        assert.equal(lowStock.length, 1);
        assert.equal(lowStock[0].nombre, 'Vela Vainilla');
    });

    test('Calcula la ganancia estimada de ventas descontando costos', () => {
        const productos = [
            { id: 'p1', nombre: 'Vela Jazmín', costo_produccion: 1500 },
            { id: 'p2', nombre: 'Virgen Pintada', costo_produccion: 3000 }
        ];

        const ventas = [
            { producto_id: 'p1', cantidad: 2, precio_unitario: 3500, precio_total: 7000 },
            { producto_id: 'p2', cantidad: 1, precio_unitario: 8000, precio_total: 8000 }
        ];

        let gananciaTotal = 0;
        ventas.forEach(v => {
            const prod = productos.find(p => p.id === v.producto_id);
            if (prod && prod.costo_produccion > 0) {
                gananciaTotal += (v.precio_unitario - prod.costo_produccion) * v.cantidad;
            }
        });

        // Vela: (3500 - 1500) * 2 = 4000
        // Virgen: (8000 - 3000) * 1 = 5000
        // Total esperado: 9000
        assert.equal(gananciaTotal, 9000);
    });

    test('Simulación de incremento de producción y resta por venta', () => {
        let stockInicial = 5;

        // Tanda de producción: fabricó 10 velas más
        const produccion = 10;
        stockInicial += produccion;
        assert.equal(stockInicial, 15);

        // Venta: vendió 4 velas
        const venta = 4;
        stockInicial -= venta;
        assert.equal(stockInicial, 11);

        // Anulación de venta: se devuelven las 4 velas
        stockInicial += venta;
        assert.equal(stockInicial, 15);
    });
});
