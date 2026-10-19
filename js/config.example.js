// ============================================================
// TERROUGE — Plantilla de Configuración de Supabase
// ============================================================
// Copiá este archivo como "config.js" y colocá tus credenciales.
// Este archivo sirve de ejemplo para que tu repositorio en GitHub
// nunca exponga tus URLs o claves reales.

const SUPABASE_URL = 'TU_URL_AQUI';
const SUPABASE_KEY = 'TU_CLAVE_AQUI';

function isSupabaseConfigured() {
    return SUPABASE_URL !== 'TU_URL_AQUI' && 
           SUPABASE_KEY !== 'TU_CLAVE_AQUI' && 
           SUPABASE_URL.startsWith('http') && 
           SUPABASE_KEY.length > 20;
}

window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
window.isSupabaseConfigured = isSupabaseConfigured;
