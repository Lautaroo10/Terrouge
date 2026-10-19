// ============================================================
// TERROUGE — Inicialización del Cliente Supabase
// ============================================================

let supabaseClient = null;

try {
    if (window.isSupabaseConfigured && window.isSupabaseConfigured()) {
        supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    } else {
        // Inicialización dummy/placeholder para evitar ReferenceError antes de configurar
        supabaseClient = window.supabase.createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
    }
} catch (err) {
    console.warn('Supabase no pudo inicializarse con las claves actuales:', err);
}

// Exportar globalmente
window.supabaseClient = supabaseClient;
window.supabase = supabaseClient;
