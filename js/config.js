// ============================================================
// TERROUGE — Configuración de Supabase (Privada / Local)
// ============================================================
// ⚠️ Este archivo está en .gitignore para que NUNCA se suba a GitHub.
// ============================================================

// Credenciales activas de Supabase (ya configuradas y conectadas):
const RAW_URL = 'https://fckkcbhxplizizaraatr.supabase.co';
const SUPABASE_URL = RAW_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_KEY = 'sb_publishable_GEElrABZUi-4Au8OTzlJiQ_P7HEVZp5';

// Esta función comprueba que la URL y clave NO hayan quedado con los valores de plantilla ('TU_URL_AQUI').
// Con tus valores actuales de arriba, esta función devuelve TRUE (configuración completa).
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'TU_URL_AQUI' && 
           SUPABASE_KEY !== 'TU_CLAVE_AQUI' && 
           SUPABASE_URL.startsWith('http') && 
           SUPABASE_KEY.length > 20;
}

// Exportar globalmente
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_KEY = SUPABASE_KEY;
window.isSupabaseConfigured = isSupabaseConfigured;
