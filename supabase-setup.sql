-- ============================================================
-- TERROUGE - Sistema de Stock y Ventas
-- Script SQL para Supabase
-- ============================================================
-- Ejecutar este script completo en el SQL Editor de Supabase
-- (https://supabase.com/dashboard → tu proyecto → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. TABLAS
-- ============================================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    precio_venta NUMERIC(12,2) NOT NULL DEFAULT 0,
    costo_produccion NUMERIC(12,2) DEFAULT 0,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
    precio_total NUMERIC(12,2) NOT NULL,
    medio_pago TEXT NOT NULL DEFAULT 'efectivo' CHECK (medio_pago IN ('efectivo', 'transferencia', 'otro')),
    cliente TEXT,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    anulada BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de producción (registro de fabricación)
CREATE TABLE IF NOT EXISTS produccion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ÍNDICES para mejor rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_productos_user ON productos(user_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_ventas_user ON ventas(user_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_producto ON ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_produccion_user ON produccion(user_id);
CREATE INDEX IF NOT EXISTS idx_produccion_producto ON produccion(producto_id);
CREATE INDEX IF NOT EXISTS idx_categorias_user ON categorias(user_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Activar RLS en todas las tablas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;

-- Políticas para CATEGORÍAS
CREATE POLICY "Usuarios ven sus categorías"
    ON categorias FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus categorías"
    ON categorias FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios editan sus categorías"
    ON categorias FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios borran sus categorías"
    ON categorias FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para PRODUCTOS
CREATE POLICY "Usuarios ven sus productos"
    ON productos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus productos"
    ON productos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios editan sus productos"
    ON productos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios borran sus productos"
    ON productos FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para VENTAS
CREATE POLICY "Usuarios ven sus ventas"
    ON ventas FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus ventas"
    ON ventas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios editan sus ventas"
    ON ventas FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios borran sus ventas"
    ON ventas FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para PRODUCCIÓN
CREATE POLICY "Usuarios ven su producción"
    ON produccion FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su producción"
    ON produccion FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios editan su producción"
    ON produccion FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios borran su producción"
    ON produccion FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 4. PERMISOS (GRANTS) para la API de Supabase
-- ============================================================
-- Los roles 'anon' y 'authenticated' son los que usa la API
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categorias TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON productos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ventas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON produccion TO authenticated;

-- ============================================================
-- 5. FUNCIONES Y TRIGGERS
-- ============================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER set_updated_at_categorias
    BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_ventas
    BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------------
-- Función: Descontar stock al registrar una venta
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION descontar_stock_venta()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo descontar si la venta NO está anulada
    IF NEW.anulada = FALSE THEN
        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id = NEW.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_descontar_stock_venta
    AFTER INSERT ON ventas
    FOR EACH ROW EXECUTE FUNCTION descontar_stock_venta();

-- -------------------------------------------------------
-- Función: Ajustar stock al editar o anular una venta
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION ajustar_stock_venta_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se anula una venta que estaba activa → devolver stock
    IF OLD.anulada = FALSE AND NEW.anulada = TRUE THEN
        UPDATE productos
        SET stock_actual = stock_actual + OLD.cantidad
        WHERE id = OLD.producto_id;
    
    -- Si se reactiva una venta anulada → descontar stock
    ELSIF OLD.anulada = TRUE AND NEW.anulada = FALSE THEN
        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id = NEW.producto_id;
    
    -- Si se edita la cantidad de una venta activa → ajustar diferencia
    ELSIF OLD.anulada = FALSE AND NEW.anulada = FALSE THEN
        -- Si cambió el producto, devolver al viejo y descontar al nuevo
        IF OLD.producto_id != NEW.producto_id THEN
            UPDATE productos SET stock_actual = stock_actual + OLD.cantidad WHERE id = OLD.producto_id;
            UPDATE productos SET stock_actual = stock_actual - NEW.cantidad WHERE id = NEW.producto_id;
        ELSIF OLD.cantidad != NEW.cantidad THEN
            -- Mismo producto, diferente cantidad
            UPDATE productos
            SET stock_actual = stock_actual + OLD.cantidad - NEW.cantidad
            WHERE id = NEW.producto_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_ajustar_stock_venta
    AFTER UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION ajustar_stock_venta_update();

-- -------------------------------------------------------
-- Función: Sumar stock al registrar producción
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION sumar_stock_produccion()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sumar_stock_produccion
    AFTER INSERT ON produccion
    FOR EACH ROW EXECUTE FUNCTION sumar_stock_produccion();

-- -------------------------------------------------------
-- Función: Devolver stock si se elimina un registro de producción
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION revertir_stock_produccion()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual - OLD.cantidad
    WHERE id = OLD.producto_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_revertir_stock_produccion
    AFTER DELETE ON produccion
    FOR EACH ROW EXECUTE FUNCTION revertir_stock_produccion();

-- ============================================================
-- 6. STORAGE BUCKET para fotos de productos (opcional)
-- ============================================================
-- Crear un bucket público para fotos de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: usuarios autenticados pueden subir fotos
CREATE POLICY "Usuarios suben fotos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-photos');

-- Política: cualquiera puede ver las fotos (público)
CREATE POLICY "Fotos públicas"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'product-photos');

-- Política: usuarios autenticados pueden borrar sus fotos
CREATE POLICY "Usuarios borran fotos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-photos');

-- ============================================================
-- 7. CATEGORÍAS INICIALES
-- ============================================================
-- Nota: Estas se insertan cuando el usuario inicia sesión
-- por primera vez desde la app (ver código JS).
-- No podemos insertarlas aquí porque necesitamos el user_id.

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Después de ejecutar este script:
-- 1. Creá el usuario desde Authentication → Users → Invite user
-- 2. Desactivá el registro público en Authentication → Providers → Email → Desactivar "Enable Signup"
-- 3. Copiá la URL y clave anon desde Settings → API
