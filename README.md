# 🕯️ Terrouge — Sistema de Control de Stock y Ventas

Aplicación web diseñada específicamente para emprendimientos artesanales (velas aromáticas, imaginería religiosa, decoración), optimizada para su uso en celulares y computadoras con interfaz en español rioplatense y respaldo de datos en tiempo real mediante **Supabase**.

---

## 📁 Arquitectura del Proyecto

El sistema cuenta con una arquitectura modular y organizada por responsabilidades:

```text
Terrouge/
├── index.html                   # Punto de entrada HTML limpio y semántico
├── supabase-setup.sql           # Script SQL para tablas, RLS, triggers y bucket
├── README.md                    # Documentación del proyecto
│
├── css/                         # Arquitectura modular de estilos
│   ├── variables.css            # Paleta de colores, tokens de espaciado y radios
│   ├── base.css                 # Reset, tipografía Nunito, scrollbar y animaciones
│   ├── components.css           # Botones, tarjetas, inputs, modales, toasts y banners
│   ├── layout.css               # Header fijo, bottom nav móvil y responsive de escritorio
│   ├── views.css                # Estilos específicos de cada pantalla
│   └── main.css                 # Importador central de hojas de estilo
│
└── js/                          # Arquitectura modular JavaScript
    ├── config.js                # Credenciales y validación de Supabase (URL y anon key)
    ├── state.js                 # Estado global centralizado (reactividad de datos)
    ├── supabase.js              # Inicialización y cliente resiliente de Supabase
    ├── utils.js                 # Formateo de pesos argentinos ($), fechas y helpers de UI
    ├── app.js                   # Bootstrap, ciclo de vida e inicio de la aplicación
    │
    └── modules/                 # Módulos por dominio de negocio
        ├── auth.js              # Login, logout, recordar sesión y recuperación de clave
        ├── navigation.js        # Enrutamiento entre pantallas y control de pestañas
        ├── dashboard.js         # Métricas en vivo, alertas de stock y ranking de ventas
        ├── stock.js             # Catálogo de productos, fotos, compresión y stock mínimo
        ├── categories.js        # Gestión de categorías de productos
        ├── sales.js             # Registro de ventas, medios de pago y anulación
        ├── production.js        # Registro de producción y suma automática de stock
        ├── reports.js           # Gráfico mensual y exportación a Excel (.xlsx) y CSV
        └── samples.js           # Carga y borrado de productos de ejemplo iniciales
```

---

## 🚀 Guía de Configuración Inicial

### 1. Configurar la base de datos en Supabase
1. Ingresá a [supabase.com](https://supabase.com/) e iniciá sesión.
2. Creá un nuevo proyecto (por ejemplo `Terrouge`).
3. En el menú lateral izquierdo, andá a **SQL Editor**.
4. Hacé clic en **New query**, copiá todo el contenido del archivo [`supabase-setup.sql`](./supabase-setup.sql) y hacé clic en **Run**.
   - Esto creará automáticamente las tablas (`categorias`, `productos`, `ventas`, `produccion`), políticas de seguridad RLS por usuario, triggers de stock y el bucket `product-photos`.

### 2. Configurar las credenciales en la App
1. En el panel de Supabase, andá a **Project Settings** (icono de engranaje) ➔ **Data API** (o **API**).
2. Copiá:
   - **Project URL**
   - **Project API Keys** ➔ **`anon` `public`** *(Nunca uses `service_role`)*
3. Abrí el archivo [`js/config.js`](./js/config.js) y reemplazá los valores:
   ```javascript
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_KEY = 'tu-clave-anonima-publica';
   ```

### 3. Crear el usuario para tu mamá
1. En Supabase, andá a **Authentication** ➔ **Users**.
2. Hacé clic en **Add user** ➔ **Create user**.
3. Ingresá el correo electrónico y la contraseña con la que ella va a ingresar.
4. Marcá la casilla **Auto Confirm User?** para que pueda ingresar directamente sin esperar email de verificación.

---

## 📱 Uso y Despliegue
Podés abrir [`index.html`](./index.html) directamente en cualquier navegador o publicarlo de forma gratuita en servicios como **GitHub Pages**, **Vercel** o **Netlify**.
