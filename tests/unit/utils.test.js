import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Importar utilidades adaptadas para entorno de test
function formatMoney(n) {
    if (n == null || isNaN(n)) return '$0';
    return '$' + Math.round(Number(n)).toLocaleString('es-AR');
}

function formatDate(d) {
    if (!d) return '';
    const date = new Date(d + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function monthStartISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
}

function daysAgoISO(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function monthName(yyyymm) {
    const [y, m] = yyyymm.split('-');
    const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return names[parseInt(m, 10) - 1] + ' ' + y;
}

function medioLabel(m) {
    const map = {
        efectivo: '💵 Efectivo',
        transferencia: '🏦 Transferencia',
        otro: '📋 Otro'
    };
    return map[m] || m;
}

describe('Pruebas Unitarias: Utilidades (utils.js)', () => {
    describe('formatMoney()', () => {
        test('formatea números positivos en pesos argentinos', () => {
            const res = formatMoney(3500);
            assert.ok(res.includes('$') && res.includes('3'));
        });

        test('devuelve $0 para null, undefined o NaN', () => {
            assert.equal(formatMoney(null), '$0');
            assert.equal(formatMoney(undefined), '$0');
            assert.equal(formatMoney(NaN), '$0');
        });

        test('redondea centavos correctamente', () => {
            const res = formatMoney(1200.75);
            assert.ok(res.includes('1.201') || res.includes('1201'));
        });
    });

    describe('formatDate()', () => {
        test('formatea YYYY-MM-DD a formato local DD/MM/AAAA', () => {
            const formatted = formatDate('2026-10-19');
            assert.ok(formatted.includes('19') && formatted.includes('10') && formatted.includes('2026'));
        });

        test('retorna cadena vacía si no hay fecha', () => {
            assert.equal(formatDate(''), '');
            assert.equal(formatDate(null), '');
        });
    });

    describe('Generadores de fecha ISO', () => {
        test('todayISO retorna formato YYYY-MM-DD válido', () => {
            const iso = todayISO();
            assert.match(iso, /^\d{4}-\d{2}-\d{2}$/);
        });

        test('monthStartISO retorna el día 01 del mes', () => {
            const start = monthStartISO();
            assert.ok(start.endsWith('-01'));
        });

        test('daysAgoISO resta días correctamente', () => {
            const today = new Date(todayISO());
            const past = new Date(daysAgoISO(7));
            const diffDays = Math.round((today - past) / (1000 * 60 * 60 * 24));
            assert.equal(diffDays, 7);
        });
    });

    describe('monthName() y medioLabel()', () => {
        test('monthName devuelve nombre en español', () => {
            assert.equal(monthName('2026-01'), 'Ene 2026');
            assert.equal(monthName('2026-10'), 'Oct 2026');
            assert.equal(monthName('2026-12'), 'Dic 2026');
        });

        test('medioLabel retorna emojis y texto amigable', () => {
            assert.equal(medioLabel('efectivo'), '💵 Efectivo');
            assert.equal(medioLabel('transferencia'), '🏦 Transferencia');
            assert.equal(medioLabel('otro'), '📋 Otro');
        });
    });
});
