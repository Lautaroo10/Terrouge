# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

La artesana dueña de Terrouge, operando sola desde su teléfono celular o computadora en Argentina. Persona no técnica que necesita resolver la gestión diaria de su emprendimiento sin complicaciones.

## Product Purpose

Sistema de control de stock, ventas y producción diseñado para un emprendimiento artesanal. Permite llevar al día el inventario, registrar ventas con descuento automático de stock, asentar tandas de producción, ver estadísticas y descargar respaldos. Existe para que la artesana tenga visibilidad total de su negocio —cuánto produce, cuánto vende, cuál es su ganancia— con datos guardados en la nube.

## Positioning

Herramienta de gestión artesanal ultra-simple, pensada específicamente para una persona sin formación técnica que fabrica y vende desde su casa. El diferencial del emprendimiento es la calidad excepcional y la técnica artesanal en la elaboración de velas aromáticas de decoración y vírgenes / imaginería religiosa, usando materiales de muy alta calidad.

## Operating Context

- La usuaria carga datos desde el celular (mobile-first) mientras trabaja, y ocasionalmente desde la computadora.
- Registra ventas al momento de hacerlas, producción al terminar una tanda.
- Consulta el dashboard para ver el estado general del negocio.
- Descarga respaldos periódicos en Excel/CSV.
- Los datos persisten en Supabase (PostgreSQL en la nube) con autenticación por email/contraseña.

## Capabilities and Constraints

### Funcionalidades confirmadas
- Dashboard con métricas en vivo (stock total, ventas del día/mes, ganancia estimada, alertas de stock bajo, ranking de más vendidos).
- Catálogo de productos con foto, precio, costo, stock actual y stock mínimo de seguridad.
- Gestión de categorías (ej. "Velas decorativas", "Vírgenes artesanales").
- Registro de ventas con descuento automático de stock; anulación con reintegro.
- Registro de producción (tandas de fabricación que suman stock).
- Reportes con gráficos mensuales, filtros por fecha/categoría, exportación a Excel (.xlsx) y CSV.
- Recordatorio inteligente de respaldo si pasó más de un mes sin descargar.
- Autenticación con email/contraseña vía Supabase Auth; recuperación de contraseña por enlace.
- Datos aislados por usuario (Row Level Security en Supabase).

### Stack
- Frontend: HTML estático + Vanilla CSS + JavaScript vanilla (sin framework).
- Backend/datos: Supabase (auth, base de datos PostgreSQL, storage).
- Servidor local de desarrollo: Node.js HTTP estático (`server.js`).
- Librerías externas vía CDN: Chart.js, SheetJS (XLSX), Supabase JS v2.

### Restricciones técnicas
- Aplicación de una sola página (SPA) sin router: navegación por tabs con JS.
- Sin PWA/offline: requiere conexión a internet.
- Sin bundler ni build step.

## Brand Commitments

- **Nombre:** Terrouge — innegociable. Etimología implícita: terre (tierra) + rouge (rojo).
- **Logo real:** círculo borgoña profundo (~#9B3A3A) con tipografía serif blanca "TERROUgE" (la "g" minúscula con swash decorativo). Tono boutique/luxury, no rústico.
- **Estética:** lujo artesanal — crema, marfil, pan de oro, pátinas envejecidas, metálicos cálidos. El color protagonista de marca es **borgoña/rouge**, no marrón. Innegociable.
- **Idioma:** español rioplatense ("vos", "registrá", "verificá"). Todo el copy y la UI en argentino.
- **Tipografía actual en la app:** DM Sans (cuerpo) + DM Serif Display (marca/títulos). La tipografía del logo real es una serif con contraste alto de trazo, diferente a DM Serif Display.
- **Emoji como iconografía:** 🕯️ como ícono de marca en la app; emojis nativos para navegación y acciones.

## Evidence on Hand

- Codebase funcional completo con UI, lógica de negocio, esquema SQL de Supabase y tests unitarios.
- **Logo gráfico real:** círculo borgoña con wordmark serif "TERROUgE" en blanco. Corazón negro como elemento secundario.
- **Fotos de producto reales disponibles:**
  - Imaginería religiosa: natividades y Virgen de Fátima en acabado crema/marfil con detalles en pan de oro, pátina envejecida intencional, altísimo detalle escultórico. Exhibición en vitrina de vidrio (nivel showroom).
  - Velas aromáticas: contenedores premium (piedra/concreto con hoja dorada, vidrio de mercurio con borde de perlas). Fotografía lifestyle con botánicos, cítricos, joyas.
- Paleta real de los productos: crema, marfil, dorado, metálicos cálidos, borgoña.
- No hay testimonios, métricas de uso, ni material de marketing más allá de las fotos de producto.
- **Brecha identificada:** la paleta actual de la app (marrones: #3B3226, #C4A265) no refleja el borgoña del logo ni el nivel premium-boutique que transmiten los productos reales.

## Product Principles

1. **Simplicidad radical:** cada acción se resuelve en la menor cantidad de toques posible.
2. **Verdad en tiempo real:** los números del dashboard reflejan siempre el estado actual del inventario y las ventas.
3. **Seguridad sin fricción:** los datos viven en la nube con aislamiento por usuario, pero la experiencia se siente como una app local.
4. **Cercanía:** el tono y el lenguaje son los de una conversación entre amigas, no los de un software corporativo.
5. **Mobile-first sin sacrificar desktop:** funciona perfectamente al alcance del pulgar, y también se ve bien en pantalla grande.

## Accessibility & Inclusion

- Botones amplios y targets de toque generosos (mobile-first).
- No se han establecido requisitos formales de accesibilidad (WCAG) más allá de buenas prácticas generales.
