// ============================================================
// TERROUGE — Configuración de Supabase
// ============================================================
// Acá van tus credenciales del proyecto de Supabase.
// Los encontrás en: https://supabase.com/dashboard → Tu proyecto → Settings (engranaje) → Data API / API
// - "Project URL" es SUPABASE_URL
// - "anon public" (bajo Project API keys) es SUPABASE_KEY
//
// ⚠️ IMPORTANTE: NUNCA uses la clave "service_role" acá, esa es secreta.
// ============================================================

const SUPABASE_URL = 'TU_URL_AQUI';
const SUPABASE_KEY = 'TU_CLAVE_AQUI';

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
