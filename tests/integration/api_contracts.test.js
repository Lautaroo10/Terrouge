import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const SUPABASE_URL = 'https://fckkcbhxplizizaraatr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GEElrABZUi-4Au8OTzlJiQ_P7HEVZp5';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
};

describe('Pruebas de Integración: API Supabase y Esquema', () => {
    test('La tabla "productos" responde HTTP 200', async () => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*&limit=1`, { headers });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data));
    });

    test('La tabla "categorias" responde HTTP 200', async () => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/categorias?select=*&limit=1`, { headers });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data));
    });

    test('La tabla "ventas" responde HTTP 200', async () => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/ventas?select=*&limit=1`, { headers });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data));
    });

    test('La tabla "produccion" responde HTTP 200', async () => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/produccion?select=*&limit=1`, { headers });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data));
    });
});
