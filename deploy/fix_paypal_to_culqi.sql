-- ============================================
-- FIX: Migrar de PayPal a Culqi en tabla sales
-- Ejecutar en la base de datos Aiven (eva_db)
-- ============================================

-- 1. Cambiar el enum de payment_method: 'paypal' → 'culqi'
ALTER TABLE sales MODIFY COLUMN payment_method ENUM('efectivo', 'culqi') NOT NULL DEFAULT 'efectivo';

-- 2. Renombrar la columna paypal_order_id → culqi_order_id
ALTER TABLE sales CHANGE COLUMN paypal_order_id culqi_order_id VARCHAR(255) NULL DEFAULT NULL;

-- 3. Actualizar registros existentes que tengan 'paypal' (si los hay)
-- (Este paso ya no es necesario porque el ALTER del enum convierte automáticamente,
--  pero por seguridad actualizamos cualquier dato viejo)
UPDATE sales SET payment_method = 'culqi' WHERE payment_method = 'paypal';
