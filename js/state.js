// ============================================================
// TERROUGE — Estado Global de la Aplicación
// ============================================================

const AppState = {
    currentUser: null,
    allProducts: [],
    allCategories: [],
    allSales: [],
    allProduction: [],
    salesChart: null,
    confirmResolve: () => {}
};

// Aliases para compatibilidad directa
window.AppState = AppState;
Object.defineProperty(window, 'currentUser', {
    get: () => AppState.currentUser,
    set: (v) => { AppState.currentUser = v; }
});
Object.defineProperty(window, 'allProducts', {
    get: () => AppState.allProducts,
    set: (v) => { AppState.allProducts = v; }
});
Object.defineProperty(window, 'allCategories', {
    get: () => AppState.allCategories,
    set: (v) => { AppState.allCategories = v; }
});
Object.defineProperty(window, 'allSales', {
    get: () => AppState.allSales,
    set: (v) => { AppState.allSales = v; }
});
Object.defineProperty(window, 'allProduction', {
    get: () => AppState.allProduction,
    set: (v) => { AppState.allProduction = v; }
});
Object.defineProperty(window, 'salesChart', {
    get: () => AppState.salesChart,
    set: (v) => { AppState.salesChart = v; }
});
Object.defineProperty(window, 'confirmResolve', {
    get: () => AppState.confirmResolve,
    set: (v) => { AppState.confirmResolve = v; }
});
