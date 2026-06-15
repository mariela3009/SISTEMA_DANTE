-- ============================================================
--  EVA - Cafetería Dante | Script de Datos de Prueba
--  Ejecutar sobre la base de datos: eva_db
-- ============================================================
USE `eva_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. CATEGORÍAS ADICIONALES
-- ============================================================
INSERT IGNORE INTO `categories` (`id`, `name`, `icon`, `created_at`, `updated_at`) VALUES
  (5, 'Tés e Infusiones', 'local_drink',  NOW(), NOW()),
  (6, 'Jugos Naturales',  'blender',      NOW(), NOW()),
  (7, 'Snacks Salados',   'lunch_dining', NOW(), NOW());

-- ============================================================
-- 2. INGREDIENTES / INSUMOS ADICIONALES
-- ============================================================
INSERT IGNORE INTO `ingredients`
  (`id`,`name`,`unit`,`stock_actual`,`stock_cocina`,`costo_promedio`,`stock_minimo`,`fecha_vencimiento`,`is_active`,`created_at`,`updated_at`)
VALUES
  (11, 'Chocolate amargo',       'gr',    800.000, 0.000,  0.0850, 150.000, NULL,         1, NOW(), NOW()),
  (12, 'Syrup de vainilla',      'ml',   1500.000, 0.000,  0.0400, 200.000, NULL,         1, NOW(), NOW()),
  (13, 'Syrup de caramelo',      'ml',   1200.000, 0.000,  0.0400, 200.000, NULL,         1, NOW(), NOW()),
  (14, 'Leche condensada',       'ml',    600.000, 0.000,  0.0600, 100.000, '2026-12-01', 1, NOW(), NOW()),
  (15, 'Canela en polvo',        'gr',    200.000, 0.000,  0.0300,  30.000, NULL,         1, NOW(), NOW()),
  (16, 'Té verde matcha',        'gr',    400.000, 0.000,  0.2500,  50.000, NULL,         1, NOW(), NOW()),
  (17, 'Té chai',                'gr',    300.000, 0.000,  0.1800,  50.000, NULL,         1, NOW(), NOW()),
  (18, 'Naranja',                'unidad', 40.000, 0.000,  0.5000,  10.000, '2026-06-20', 1, NOW(), NOW()),
  (19, 'Mango',                  'unidad', 25.000, 0.000,  0.8000,   8.000, '2026-06-18', 1, NOW(), NOW()),
  (20, 'Fresa',                  'gr',    800.000, 0.000,  0.0200, 150.000, '2026-06-15', 1, NOW(), NOW()),
  (21, 'Plátano',                'unidad', 30.000, 0.000,  0.3000,  10.000, '2026-06-16', 1, NOW(), NOW()),
  (22, 'Granola',                'gr',    600.000, 0.000,  0.0150, 100.000, NULL,         1, NOW(), NOW()),
  (23, 'Miel de abeja',          'ml',    500.000, 0.000,  0.0800,  80.000, NULL,         1, NOW(), NOW()),
  (24, 'Queso crema',            'gr',    400.000, 0.000,  0.0500,  80.000, '2026-06-25', 1, NOW(), NOW()),
  (25, 'Jamón serrano',          'gr',    300.000, 0.000,  0.0900,  60.000, '2026-06-20', 1, NOW(), NOW()),
  (26, 'Pan ciabatta',           'unidad', 15.000, 0.000,  1.2000,   5.000, '2026-06-12', 1, NOW(), NOW()),
  (27, 'Huevo',                  'unidad', 24.000, 0.000,  0.4500,   6.000, '2026-06-20', 1, NOW(), NOW()),
  (28, 'Mantequilla',            'gr',    300.000, 0.000,  0.0400,  50.000, '2026-07-01', 1, NOW(), NOW()),
  (29, 'Agua mineral',           'ml',   5000.000, 0.000,  0.0020, 500.000, '2027-01-01', 1, NOW(), NOW()),
  (30, 'Jengibre fresco',        'gr',    200.000, 0.000,  0.0300,  30.000, '2026-06-25', 1, NOW(), NOW());

-- ============================================================
-- 3. PRODUCTOS ADICIONALES
-- ============================================================
INSERT IGNORE INTO `products`
  (`id`,`name`,`price`,`image_url`,`category_id`,`is_active`,`created_at`,`updated_at`)
VALUES
  -- Café Caliente (cat 1)
  ( 8, 'Americano',              3.00, NULL, 1, 1, NOW(), NOW()),
  ( 9, 'Mocca Caliente',         5.50, NULL, 1, 1, NOW(), NOW()),
  (10, 'Latte Vainilla',         5.00, NULL, 1, 1, NOW(), NOW()),
  (11, 'Cortado',                3.20, NULL, 1, 1, NOW(), NOW()),
  (12, 'Café con Leche',         3.50, NULL, 1, 1, NOW(), NOW()),
  -- Bebidas Frías (cat 2)
  (13, 'Frappé de Chocolate',    6.00, NULL, 2, 1, NOW(), NOW()),
  (14, 'Smoothie de Mango',      5.80, NULL, 2, 1, NOW(), NOW()),
  (15, 'Limonada de Fresa',      4.50, NULL, 2, 1, NOW(), NOW()),
  (16, 'Matcha Latte Frío',      6.50, NULL, 2, 1, NOW(), NOW()),
  -- Pastelería (cat 3)
  (17, 'Muffin de Arándanos',    4.00, NULL, 3, 1, NOW(), NOW()),
  (18, 'Cheesecake',             6.50, NULL, 3, 1, NOW(), NOW()),
  (19, 'Brownie de Chocolate',   4.50, NULL, 3, 1, NOW(), NOW()),
  -- Especialidades (cat 4)
  (20, 'Granola Bowl',           7.50, NULL, 4, 1, NOW(), NOW()),
  (21, 'Sándwich Jamón Queso',   8.50, NULL, 4, 1, NOW(), NOW()),
  (22, 'Huevos Revueltos',       9.00, NULL, 4, 1, NOW(), NOW()),
  -- Tés e Infusiones (cat 5)
  (23, 'Té Matcha Caliente',     5.00, NULL, 5, 1, NOW(), NOW()),
  (24, 'Chai Latte',             5.00, NULL, 5, 1, NOW(), NOW()),
  (25, 'Té de Jengibre y Miel',  4.00, NULL, 5, 1, NOW(), NOW()),
  -- Jugos Naturales (cat 6)
  (26, 'Jugo de Naranja',        4.50, NULL, 6, 1, NOW(), NOW()),
  (27, 'Jugo de Mango',          5.00, NULL, 6, 1, NOW(), NOW()),
  -- Snacks Salados (cat 7)
  (28, 'Ciabatta con Queso Crema',6.00, NULL, 7, 1, NOW(), NOW());

-- ============================================================
-- 4. RECETAS DE LOS NUEVOS PRODUCTOS
-- ============================================================
INSERT IGNORE INTO `recipe_items`
  (`product_id`,`ingredient_id`,`quantity`,`created_at`,`updated_at`)
VALUES
  -- Americano (8)
  (8, 1, 20.000, NOW(), NOW()),
  (8, 29, 200.000, NOW(), NOW()),
  -- Mocca Caliente (9)
  (9, 1, 18.000, NOW(), NOW()),
  (9, 2, 150.000, NOW(), NOW()),
  (9, 11, 20.000, NOW(), NOW()),
  -- Latte Vainilla (10)
  (10, 1, 18.000, NOW(), NOW()),
  (10, 2, 180.000, NOW(), NOW()),
  (10, 12, 20.000, NOW(), NOW()),
  -- Cortado (11)
  (11, 1, 18.000, NOW(), NOW()),
  (11, 2, 60.000, NOW(), NOW()),
  -- Café con Leche (12)
  (12, 1, 15.000, NOW(), NOW()),
  (12, 2, 120.000, NOW(), NOW()),
  -- Frappé de Chocolate (13)
  (13, 1, 15.000, NOW(), NOW()),
  (13, 11, 25.000, NOW(), NOW()),
  (13, 2, 100.000, NOW(), NOW()),
  (13, 5, 200.000, NOW(), NOW()),
  (13, 8, 30.000, NOW(), NOW()),
  -- Smoothie de Mango (14)
  (14, 19, 2.000, NOW(), NOW()),
  (14, 21, 1.000, NOW(), NOW()),
  (14, 2, 100.000, NOW(), NOW()),
  (14, 5, 150.000, NOW(), NOW()),
  -- Limonada de Fresa (15)
  (15, 20, 80.000, NOW(), NOW()),
  (15, 4, 15.000, NOW(), NOW()),
  (15, 5, 200.000, NOW(), NOW()),
  (15, 29, 150.000, NOW(), NOW()),
  -- Matcha Latte Frío (16)
  (16, 16, 8.000, NOW(), NOW()),
  (16, 3, 200.000, NOW(), NOW()),
  (16, 5, 150.000, NOW(), NOW()),
  (16, 12, 15.000, NOW(), NOW()),
  -- Muffin de Arándanos (17) — sin insumo de arándano, usamos los disponibles
  (17, 28, 30.000, NOW(), NOW()),
  (17, 27, 1.000, NOW(), NOW()),
  -- Cheesecake (18)
  (18, 24, 80.000, NOW(), NOW()),
  (18, 28, 20.000, NOW(), NOW()),
  (18, 27, 1.000, NOW(), NOW()),
  -- Brownie de Chocolate (19)
  (19, 11, 40.000, NOW(), NOW()),
  (19, 28, 30.000, NOW(), NOW()),
  (19, 27, 2.000, NOW(), NOW()),
  -- Granola Bowl (20)
  (20, 22, 80.000, NOW(), NOW()),
  (20, 2, 120.000, NOW(), NOW()),
  (20, 23, 20.000, NOW(), NOW()),
  (20, 20, 50.000, NOW(), NOW()),
  -- Sándwich Jamón Queso (21)
  (21, 26, 1.000, NOW(), NOW()),
  (21, 25, 60.000, NOW(), NOW()),
  (21, 24, 40.000, NOW(), NOW()),
  -- Huevos Revueltos (22)
  (22, 27, 3.000, NOW(), NOW()),
  (22, 28, 20.000, NOW(), NOW()),
  (22, 6, 1.000, NOW(), NOW()),
  -- Té Matcha Caliente (23)
  (23, 16, 5.000, NOW(), NOW()),
  (23, 2, 150.000, NOW(), NOW()),
  (23, 23, 10.000, NOW(), NOW()),
  -- Chai Latte (24)
  (24, 17, 6.000, NOW(), NOW()),
  (24, 2, 180.000, NOW(), NOW()),
  (24, 15, 2.000, NOW(), NOW()),
  -- Té de Jengibre y Miel (25)
  (25, 30, 15.000, NOW(), NOW()),
  (25, 23, 15.000, NOW(), NOW()),
  (25, 29, 200.000, NOW(), NOW()),
  -- Jugo de Naranja (26)
  (26, 18, 3.000, NOW(), NOW()),
  -- Jugo de Mango (27)
  (27, 19, 2.000, NOW(), NOW()),
  (27, 29, 50.000, NOW(), NOW()),
  -- Ciabatta con Queso Crema (28)
  (28, 26, 1.000, NOW(), NOW()),
  (28, 24, 50.000, NOW(), NOW());

-- ============================================================
-- 5. CLIENTES
-- ============================================================
INSERT IGNORE INTO `clients`
  (`id`,`name`,`document_type`,`document_number`,`email`,`phone`,`created_at`,`updated_at`)
VALUES
  ( 1,'María García López',         'dni','45123890','maria.garcia@gmail.com',       '987654321', NOW(), NOW()),
  ( 2,'Carlos Mendoza Ríos',        'dni','38907654','carlos.mendoza@hotmail.com',   '976543210', NOW(), NOW()),
  ( 3,'Ana Torres Vargas',          'dni','51234789','ana.torres@gmail.com',         '965432109', NOW(), NOW()),
  ( 4,'Luis Ramírez Castro',        'dni','29876543','luis.ramirez@outlook.com',     '954321098', NOW(), NOW()),
  ( 5,'Sofía Paredes Nieto',        'dni','67890123','sofia.paredes@gmail.com',      '943210987', NOW(), NOW()),
  ( 6,'Diego Quispe Flores',        'dni','74512369','diego.quispe@yahoo.com',       '932109876', NOW(), NOW()),
  ( 7,'Valeria Chávez Huerta',      'dni','83901256','valeria.chavez@gmail.com',     '921098765', NOW(), NOW()),
  ( 8,'Ricardo Palacios Torres',    'dni','19234578','ricardo.palacios@gmail.com',   '910987654', NOW(), NOW()),
  ( 9,'Empresa Soluciones SAC',     'ruc','20601234567','contacto@soluciones.com',   '014567890', NOW(), NOW()),
  (10,'Consultora Perú EIRL',       'ruc','20712345678','admin@consultoraperu.com',  '012345678', NOW(), NOW()),
  (11,'Camila Rojas Delgado',       'dni','56789012','camila.rojas@gmail.com',       '987001122', NOW(), NOW()),
  (12,'Fernando Vega Salinas',      'dni','34567891','fernando.vega@hotmail.com',    '976112233', NOW(), NOW()),
  (13,'Gabriela Ortiz Mendoza',     'dni','22345679','gaby.ortiz@gmail.com',         '965223344', NOW(), NOW()),
  (14,'Andrés Lima Cabrera',        'dni','78901235','andres.lima@outlook.com',      '954334455', NOW(), NOW()),
  (15,'Patricia Sánchez Mora',      'dni','90123456','patri.sanchez@gmail.com',      '943445566', NOW(), NOW());

-- ============================================================
-- 6. PROMOCIONES
-- ============================================================
INSERT IGNORE INTO `promotions`
  (`id`,`name`,`discount_percentage`,`start_date`,`end_date`,`is_active`,`created_at`,`updated_at`)
VALUES
  (1, 'Happy Hour Mañanero',    15.00, '2026-06-01 07:00:00', '2026-08-31 10:00:00', 1, NOW(), NOW()),
  (2, 'Combo Tarde Relax',      10.00, '2026-06-01 14:00:00', '2026-08-31 17:00:00', 1, NOW(), NOW()),
  (3, 'Descuento Estudiantes',  20.00, '2026-06-01 00:00:00', '2026-07-31 23:59:59', 1, NOW(), NOW()),
  (4, 'Pack Fin de Semana',     12.00, '2026-06-07 00:00:00', '2026-08-31 23:59:59', 1, NOW(), NOW()),
  (5, 'Promo Cumpleaños',       25.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, NOW(), NOW()),
  (6, 'Especial Corporativo',    8.00, '2026-06-01 00:00:00', '2026-09-30 23:59:59', 1, NOW(), NOW()),
  (7, 'Black Friday Café',      30.00, '2026-11-27 00:00:00', '2026-11-30 23:59:59', 0, NOW(), NOW());

-- ============================================================
-- 7. PRODUCTOS EN PROMOCIONES
-- ============================================================
INSERT IGNORE INTO `promotion_product` (`promotion_id`,`product_id`,`created_at`,`updated_at`) VALUES
  -- Happy Hour Mañanero: cafés calientes
  (1,1,NOW(),NOW()), (1,2,NOW(),NOW()), (1,3,NOW(),NOW()), (1,8,NOW(),NOW()), (1,12,NOW(),NOW()),
  -- Combo Tarde Relax: bebidas frías + pastelería
  (2,4,NOW(),NOW()), (2,5,NOW(),NOW()), (2,13,NOW(),NOW()), (2,17,NOW(),NOW()), (2,19,NOW(),NOW()),
  -- Descuento Estudiantes: todo café + snacks
  (3,1,NOW(),NOW()), (3,2,NOW(),NOW()), (3,9,NOW(),NOW()), (3,10,NOW(),NOW()), (3,17,NOW(),NOW()), (3,19,NOW(),NOW()),
  -- Pack Fin de Semana: especialidades + jugos
  (4,20,NOW(),NOW()), (4,21,NOW(),NOW()), (4,22,NOW(),NOW()), (4,26,NOW(),NOW()), (4,27,NOW(),NOW()),
  -- Promo Cumpleaños: todo
  (5,18,NOW(),NOW()), (5,13,NOW(),NOW()), (5,16,NOW(),NOW()),
  -- Especial Corporativo: sándwiches + cafés
  (6,21,NOW(),NOW()), (6,8,NOW(),NOW()), (6,12,NOW(),NOW()), (6,28,NOW(),NOW()),
  -- Black Friday
  (7,1,NOW(),NOW()), (7,2,NOW(),NOW()), (7,3,NOW(),NOW()), (7,4,NOW(),NOW()), (7,5,NOW(),NOW());

-- ============================================================
-- 8. VENTAS + ITEMS DE VENTA
-- ============================================================

-- Venta 3 — Cajero, cliente María
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (3, 2, 1, 13.50, 2.43, 15.93, 'efectivo', 'boleta', 'completed', '2026-06-05 09:10:00', '2026-06-05 09:10:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (3,1,2,4.50,9.00,'delivered',0,'2026-06-05 09:10:00','2026-06-05 09:10:00'),
  (3,7,1,4.50,4.50,'delivered',0,'2026-06-05 09:10:00','2026-06-05 09:10:00');

-- Venta 4 — Admin, cliente Carlos
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (4, 1, 2, 28.00, 5.04, 33.04, 'paypal', 'factura', 'completed', '2026-06-05 10:30:00', '2026-06-05 10:30:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (4,21,2,8.50,17.00,'delivered',0,'2026-06-05 10:30:00','2026-06-05 10:30:00'),
  (4,22,1,9.00, 9.00,'delivered',0,'2026-06-05 10:30:00','2026-06-05 10:30:00'),
  (4, 8,1,3.00, 2.00,'delivered',0,'2026-06-05 10:30:00','2026-06-05 10:30:00'); -- precio ajustado en total

-- Venta 5 — Cajero, sin cliente
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (5, 2, NULL, 15.50, 2.79, 18.29, 'efectivo', 'ticket', 'completed', '2026-06-06 08:45:00', '2026-06-06 08:45:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (5, 3,1,4.50, 4.50,'delivered',0,'2026-06-06 08:45:00','2026-06-06 08:45:00'),
  (5,16,1,6.50, 6.50,'delivered',0,'2026-06-06 08:45:00','2026-06-06 08:45:00'),
  (5,25,1,4.00, 4.00,'delivered',0,'2026-06-06 08:45:00','2026-06-06 08:45:00'),
  (5,17,0,4.00, 0.50,'cancelled',1,'2026-06-06 08:45:00','2026-06-06 08:45:00');

-- Venta 6 — Admin, cliente empresa
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (6, 1, 9, 51.00, 9.18, 60.18, 'paypal', 'factura', 'completed', '2026-06-06 12:00:00', '2026-06-06 12:00:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (6,21,3,8.50,25.50,'delivered',0,'2026-06-06 12:00:00','2026-06-06 12:00:00'),
  (6, 8,3,3.00, 9.00,'delivered',0,'2026-06-06 12:00:00','2026-06-06 12:00:00'),
  (6,28,3,6.00,16.50,'delivered',0,'2026-06-06 12:00:00','2026-06-06 12:00:00');

-- Venta 7 — Cajero, cliente Ana
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (7, 2, 3, 20.00, 3.60, 23.60, 'efectivo', 'boleta', 'completed', '2026-06-07 09:00:00', '2026-06-07 09:00:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (7,13,2,6.00,12.00,'delivered',0,'2026-06-07 09:00:00','2026-06-07 09:00:00'),
  (7,18,1,6.50, 6.50,'delivered',0,'2026-06-07 09:00:00','2026-06-07 09:00:00'),
  (7,26,1,4.50, 1.50,'delivered',0,'2026-06-07 09:00:00','2026-06-07 09:00:00');

-- Venta 8 — Cajero, sin cliente
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (8, 2, NULL, 11.50, 2.07, 13.57, 'efectivo', 'ticket', 'completed', '2026-06-07 11:30:00', '2026-06-07 11:30:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (8,10,1,5.00,5.00,'delivered',0,'2026-06-07 11:30:00','2026-06-07 11:30:00'),
  (8,19,1,4.50,4.50,'delivered',0,'2026-06-07 11:30:00','2026-06-07 11:30:00'),
  (8,15,1,4.50,2.00,'delivered',0,'2026-06-07 11:30:00','2026-06-07 11:30:00');

-- Venta 9 — Admin, cliente Luis
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (9, 1, 4, 34.00, 6.12, 40.12, 'efectivo', 'boleta', 'completed', '2026-06-08 08:00:00', '2026-06-08 08:00:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (9,20,2,7.50,15.00,'delivered',0,'2026-06-08 08:00:00','2026-06-08 08:00:00'),
  (9,23,2,5.00,10.00,'delivered',0,'2026-06-08 08:00:00','2026-06-08 08:00:00'),
  (9, 5,1,5.50, 5.50,'delivered',0,'2026-06-08 08:00:00','2026-06-08 08:00:00'),
  (9,24,1,5.00, 3.50,'delivered',0,'2026-06-08 08:00:00','2026-06-08 08:00:00');

-- Venta 10 — Venta cancelada
INSERT IGNORE INTO `sales` (`id`,`user_id`,`client_id`,`subtotal`,`tax`,`total`,`payment_method`,`invoice_type`,`status`,`created_at`,`updated_at`)
VALUES (10, 2, NULL, 12.00, 2.16, 14.16, 'efectivo', 'ticket', 'cancelled', '2026-06-08 14:00:00', '2026-06-08 14:00:00');
INSERT IGNORE INTO `sale_items` (`sale_id`,`product_id`,`quantity`,`unit_price`,`subtotal`,`status`,`is_cancelled`,`created_at`,`updated_at`) VALUES
  (10,13,1,6.00,6.00,'cancelled',1,'2026-06-08 14:00:00','2026-06-08 14:00:00'),
  (10, 9,1,5.50,5.50,'cancelled',1,'2026-06-08 14:00:00','2026-06-08 14:00:00'),
  (10,15,0,4.50,0.50,'cancelled',1,'2026-06-08 14:00:00','2026-06-08 14:00:00');

-- ============================================================
-- 9. MOVIMIENTOS DE INVENTARIO (entradas + mermas)
-- ============================================================

-- ENTRADAS DE STOCK
INSERT IGNORE INTO `inventory_movements`
  (`ingredient_id`,`user_id`,`type`,`quantity`,`saldo_cantidad`,`cost_per_unit`,`reason`,`document_ref`,`status`,`approved_by`,`approved_at`,`created_at`,`updated_at`)
VALUES
  -- Entradas iniciales de nuevos insumos
  (11,1,'entrada',1000.000,1000.000,0.0850,'Compra inicial chocolate','GC-001','approved',1,'2026-06-01 08:00:00','2026-06-01 08:00:00','2026-06-01 08:00:00'),
  (12,1,'entrada',2000.000,2000.000,0.0400,'Compra syrup vainilla','GC-002','approved',1,'2026-06-01 08:05:00','2026-06-01 08:05:00','2026-06-01 08:05:00'),
  (13,1,'entrada',1500.000,1500.000,0.0400,'Compra syrup caramelo','GC-003','approved',1,'2026-06-01 08:10:00','2026-06-01 08:10:00','2026-06-01 08:10:00'),
  (16,1,'entrada', 500.000, 500.000,0.2500,'Compra matcha premium','GC-004','approved',1,'2026-06-01 08:15:00','2026-06-01 08:15:00','2026-06-01 08:15:00'),
  (17,1,'entrada', 400.000, 400.000,0.1800,'Compra té chai','GC-005','approved',1,'2026-06-01 08:20:00','2026-06-01 08:20:00','2026-06-01 08:20:00'),
  (20,1,'entrada',1000.000,1000.000,0.0200,'Compra fresas frescas','GC-006','approved',1,'2026-06-02 08:00:00','2026-06-02 08:00:00','2026-06-02 08:00:00'),
  (22,1,'entrada', 800.000, 800.000,0.0150,'Compra granola artesanal','GC-007','approved',1,'2026-06-02 08:10:00','2026-06-02 08:10:00','2026-06-02 08:10:00'),
  (24,1,'entrada', 500.000, 500.000,0.0500,'Compra queso crema','GC-008','approved',1,'2026-06-02 08:20:00','2026-06-02 08:20:00','2026-06-02 08:20:00'),
  (25,1,'entrada', 400.000, 400.000,0.0900,'Compra jamón serrano','GC-009','approved',1,'2026-06-02 08:30:00','2026-06-02 08:30:00','2026-06-02 08:30:00'),
  (27,1,'entrada',  36.000,  36.000,0.4500,'Compra huevos frescos','GC-010','approved',1,'2026-06-03 07:30:00','2026-06-03 07:30:00','2026-06-03 07:30:00'),
  -- Reposición de insumos básicos
  (1, 2,'entrada', 500.000,2500.000,0.0000,'Reposición café especialidad','GC-011','approved',1,'2026-06-04 07:00:00','2026-06-04 07:00:00','2026-06-04 07:00:00'),
  (2, 2,'entrada',3000.000,12000.000,0.0000,'Reposición leche entera','GC-012','approved',1,'2026-06-04 07:10:00','2026-06-04 07:10:00','2026-06-04 07:10:00'),
  (9, 1,'entrada',  20.000,  30.000,0.0000,'Compra croissants','GC-013','approved',1,'2026-06-05 06:30:00','2026-06-05 06:30:00','2026-06-05 06:30:00');

-- MERMAS (salida_merma)
INSERT IGNORE INTO `inventory_movements`
  (`ingredient_id`,`user_id`,`type`,`quantity`,`saldo_cantidad`,`cost_per_unit`,`reason`,`document_ref`,`status`,`approved_by`,`approved_at`,`created_at`,`updated_at`)
VALUES
  -- Mermas aprobadas
  (20,2,'salida_merma',200.000,800.000,0.0200,'Fresas en mal estado - vencidas','MRM-001','approved',1,'2026-06-03 16:00:00','2026-06-03 16:00:00','2026-06-03 16:00:00'),
  (19,2,'salida_merma',  3.000, 22.000,0.8000,'Mangos podridos','MRM-002','approved',1,'2026-06-04 16:00:00','2026-06-04 16:00:00','2026-06-04 16:00:00'),
  (9, 2,'salida_merma',  2.000, 28.000,0.0000,'Croissants aplastados en entrega','MRM-003','approved',1,'2026-06-05 07:30:00','2026-06-05 07:30:00','2026-06-05 07:30:00'),
  (27,2,'salida_merma',  3.000, 27.000,0.4500,'Huevos rotos','MRM-004','approved',1,'2026-06-05 08:00:00','2026-06-05 08:00:00','2026-06-05 08:00:00'),
  (24,2,'salida_merma', 60.000,400.000,0.0500,'Queso crema abierto vencido','MRM-005','approved',1,'2026-06-06 17:00:00','2026-06-06 17:00:00','2026-06-06 17:00:00'),
  (26,2,'salida_merma',  3.000, 12.000,1.2000,'Pan ciabatta duro no vendido','MRM-006','approved',1,'2026-06-07 18:30:00','2026-06-07 18:30:00','2026-06-07 18:30:00'),
  (18,2,'salida_merma',  5.000, 35.000,0.5000,'Naranjas con moho','MRM-007','approved',1,'2026-06-07 16:00:00','2026-06-07 16:00:00','2026-06-07 16:00:00'),
  (8, 2,'salida_merma', 60.000,940.000,0.0000,'Crema chantilly cortada','MRM-008','approved',1,'2026-06-08 09:00:00','2026-06-08 09:00:00','2026-06-08 09:00:00'),
  -- Mermas PENDIENTES de aprobación
  (11,2,'salida_merma', 50.000,750.000,0.0850,'Chocolate mal almacenado - derretido','MRM-009','pending',NULL,NULL,'2026-06-09 08:00:00','2026-06-09 08:00:00'),
  (2, 2,'salida_merma',300.000,11700.000,0.0000,'Leche abierta no utilizada','MRM-010','pending',NULL,NULL,'2026-06-09 09:00:00','2026-06-09 09:00:00'),
  (21,2,'salida_merma',  4.000, 26.000,0.3000,'Plátanos muy maduros','MRM-011','pending',NULL,NULL,'2026-06-09 10:00:00','2026-06-09 10:00:00');

-- PASE A COCINA
INSERT IGNORE INTO `inventory_movements`
  (`ingredient_id`,`user_id`,`type`,`quantity`,`saldo_cantidad`,`cost_per_unit`,`reason`,`document_ref`,`status`,`approved_by`,`approved_at`,`created_at`,`updated_at`)
VALUES
  (1, 2,'pase_cocina', 61.000,2439.000,0.0000,'Pase a cocina - servicio mañana',NULL,'approved',1,'2026-06-09 07:00:00','2026-06-09 07:00:00','2026-06-09 07:00:00'),
  (2, 2,'pase_cocina',400.000,11600.000,0.0000,'Pase a cocina - leche del día',NULL,'approved',1,'2026-06-09 07:05:00','2026-06-09 07:05:00','2026-06-09 07:05:00');

-- ============================================================
-- 10. AI RECOMMENDATIONS (datos de ejemplo)
-- ============================================================
INSERT IGNORE INTO `ai_recommendations` (`type`,`data`,`created_at`,`updated_at`) VALUES
  ('stock_alert',
   '{"ingredient_id":20,"name":"Fresa","stock_actual":800,"stock_minimo":150,"mensaje":"Stock bajo, considerar reposición antes del fin de semana"}',
   NOW(), NOW()),
  ('producto_estrella',
   '{"producto":"Cappuccino Clásico","ventas_semana":24,"ingreso_semana":108.00,"tendencia":"subida","recomendacion":"Aumentar producción en turno mañana"}',
   NOW(), NOW()),
  ('merma_critica',
   '{"ingrediente":"Fresas","merma_porcentaje":20,"costo_merma":4.00,"sugerencia":"Reducir pedido semanal o ajustar almacenamiento en frío"}',
   NOW(), NOW()),
  ('promocion_sugerida',
   '{"nombre":"Combo Tarde Premium","productos":["Frappé de Chocolate","Brownie de Chocolate"],"descuento_sugerido":10,"razon":"Alta rotación en horario 15:00-17:00"}',
   NOW(), NOW()),
  ('hora_pico',
   '{"hora_inicio":"08:00","hora_fin":"10:00","ventas_promedio":8,"ingreso_promedio":42.50,"recomendacion":"Asignar 2 cajeros en este horario"}',
   NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- RESUMEN FINAL
-- ============================================================
SELECT 'RESUMEN DE DATOS CARGADOS' as INFO;
SELECT 'Categorías'  as Tabla, COUNT(*) as Total FROM categories  UNION ALL
SELECT 'Ingredientes',         COUNT(*)          FROM ingredients  UNION ALL
SELECT 'Productos',            COUNT(*)          FROM products     UNION ALL
SELECT 'Recetas (items)',      COUNT(*)          FROM recipe_items UNION ALL
SELECT 'Clientes',             COUNT(*)          FROM clients      UNION ALL
SELECT 'Promociones',          COUNT(*)          FROM promotions   UNION ALL
SELECT 'Ventas',               COUNT(*)          FROM sales        UNION ALL
SELECT 'Items de Venta',       COUNT(*)          FROM sale_items   UNION ALL
SELECT 'Movimientos Inventario',COUNT(*)         FROM inventory_movements UNION ALL
SELECT 'Recomendaciones IA',   COUNT(*)          FROM ai_recommendations;
