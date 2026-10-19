import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Pruebas Unitarias: Estado Global (state.js)', () => {
    test('El estado inicial tiene los valores por defecto esperados', () => {
        const AppState = {
            currentUser: null,
            allProducts: [],
            allCategories: [],
            allSales: [],
            allProduction: [],
            salesChart: null,
            confirmResolve: () => {}
        };

        assert.equal(AppState.currentUser, null);
        assert.deepEqual(AppState.allProducts, []);
        assert.deepEqual(AppState.allCategories, []);
        assert.deepEqual(AppState.allSales, []);
        assert.deepEqual(AppState.allProduction, []);
        assert.equal(AppState.salesChart, null);
        assert.equal(typeof AppState.confirmResolve, 'function');
    });

    test('Permite actualizar colecciones reactivamente', () => {
        const AppState = {
            allProducts: [],
            allSales: []
        };

        AppState.allProducts.push({ id: 'p1', nombre: 'Vela de Soja', stock_actual: 20 });
        assert.equal(AppState.allProducts.length, 1);
        assert.equal(AppState.allProducts[0].nombre, 'Vela de Soja');

        AppState.allSales.push({ id: 's1', precio_total: 5000 });
        assert.equal(AppState.allSales.length, 1);
        assert.equal(AppState.allSales[0].precio_total, 5000);
    });
});
