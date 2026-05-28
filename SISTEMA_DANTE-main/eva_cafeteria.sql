-- =============================================================
-- EVA - Sistema de Gestión Cafetería Dante
-- Base de datos: eva_cafeteria
-- Motor: MySQL 8.x / MariaDB 10.4+
-- Generado para importar directamente en phpMyAdmin
-- =============================================================

CREATE DATABASE IF NOT EXISTS `eva_cafeteria`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `eva_cafeteria`;

-- ----------------------------
-- Tabla: users
-- ----------------------------
CREATE TABLE `users` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(255)    NOT NULL,
  `email`          VARCHAR(255)    NOT NULL UNIQUE,
  `password`       VARCHAR(255)    NOT NULL,
  `role`           ENUM('admin','cajero','cocina') NOT NULL DEFAULT 'cajero',
  `is_active`      TINYINT(1)      NOT NULL DEFAULT 1,
  `remember_token` VARCHAR(100)    NULL,
  `created_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: personal_access_tokens (Laravel Sanctum)
-- ----------------------------
CREATE TABLE `personal_access_tokens` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255)    NOT NULL,
  `tokenable_id`   BIGINT UNSIGNED NOT NULL,
  `name`           VARCHAR(255)    NOT NULL,
  `token`          VARCHAR(64)     NOT NULL UNIQUE,
  `abilities`      TEXT            NULL,
  `last_used_at`   TIMESTAMP       NULL,
  `expires_at`     TIMESTAMP       NULL,
  `created_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `tokenable` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: categories
-- ----------------------------
CREATE TABLE `categories` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255)    NOT NULL,
  `icon`       VARCHAR(100)    NULL,
  `created_at` TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: ingredients (insumos)
-- ----------------------------
CREATE TABLE `ingredients` (
  `id`               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(255)     NOT NULL,
  `unit`             ENUM('gr','kg','ml','l','unidad') NOT NULL DEFAULT 'unidad',
  `stock_actual`     DECIMAL(10,3)    NOT NULL DEFAULT 0.000,
  `costo_promedio`   DECIMAL(10,4)    NOT NULL DEFAULT 0.0000,
  `stock_minimo`     DECIMAL(10,3)    NOT NULL DEFAULT 0.000,
  `fecha_vencimiento` DATE            NULL,
  `is_active`        TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at`       TIMESTAMP        NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP        NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: products
-- ----------------------------
CREATE TABLE `products` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255)    NOT NULL,
  `price`       DECIMAL(8,2)    NOT NULL,
  `image_url`   VARCHAR(500)    NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `is_active`   TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: recipe_items (recetas)
-- ----------------------------
CREATE TABLE `recipe_items` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id`    BIGINT UNSIGNED NOT NULL,
  `ingredient_id` BIGINT UNSIGNED NOT NULL,
  `quantity`      DECIMAL(10,3)   NOT NULL,
  `created_at`    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_recipe_product_ingredient` (`product_id`, `ingredient_id`),
  CONSTRAINT `fk_recipe_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recipe_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: inventory_movements (Kardex)
-- ----------------------------
CREATE TABLE `inventory_movements` (
  `id`            BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `ingredient_id` BIGINT UNSIGNED   NOT NULL,
  `user_id`       BIGINT UNSIGNED   NOT NULL,
  `type`          ENUM('entrada','salida_venta','salida_merma','ajuste') NOT NULL,
  `quantity`      DECIMAL(10,3)     NOT NULL,
  `saldo_cantidad` DECIMAL(10,3)    NOT NULL DEFAULT 0.000,
  `cost_per_unit` DECIMAL(10,2)     NULL,
  `reason`        VARCHAR(500)      NULL,
  `document_ref`  VARCHAR(255)      NULL,
  `status`        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  `approved_by`   BIGINT UNSIGNED   NULL,
  `approved_at`   TIMESTAMP         NULL,
  `created_at`    TIMESTAMP         NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP         NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_movement_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_movement_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_movement_approver`
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: sales (ventas)
-- ----------------------------
CREATE TABLE `sales` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL,
  `subtotal`       DECIMAL(10,2)   NOT NULL,
  `tax`            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `total`          DECIMAL(10,2)   NOT NULL,
  `payment_method` ENUM('efectivo','paypal') NOT NULL DEFAULT 'efectivo',
  `status`         ENUM('completed','cancelled') NOT NULL DEFAULT 'completed',
  `paypal_order_id` VARCHAR(255)   NULL,
  `created_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sale_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: sale_items (detalle de venta)
-- ----------------------------
CREATE TABLE `sale_items` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id`    BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `quantity`   INT             NOT NULL,
  `unit_price` DECIMAL(8,2)    NOT NULL,
  `subtotal`   DECIMAL(10,2)   NOT NULL,
  `created_at` TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_saleitem_sale`
    FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saleitem_product`
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Tabla: migrations (requerida por Laravel)
-- ----------------------------
CREATE TABLE `migrations` (
  `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `migration` VARCHAR(255)    NOT NULL,
  `batch`     INT             NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================
-- DATOS INICIALES (SEED)
-- =============================================================

-- ─── USUARIOS ─────────────────────────────────────────────────
-- Contraseñas hasheadas con bcrypt (costo 12) para:
--   admin123  →  admin@cafeteriadante.com
--   cajero123 →  cajero@cafeteriadante.com
--   cocina123 →  cocina@cafeteriadante.com

INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`) VALUES
('Admin Dante',     'admin@cafeteriadante.com',  '$2y$12$YeGdIhk6GwHVqMn1V8UWz.TkqDlr4p0yghkfKjGhFrVPIfgXx.VSe', 'admin',  1),
('Cajero Principal','cajero@cafeteriadante.com', '$2y$12$HaG5BJR0JLmk4bUzFNjnWuX1iM7/3saSIBHBPRXLDAM3TJvEBb6Vu', 'cajero', 1),
('Cocina Team',     'cocina@cafeteriadante.com', '$2y$12$SxKPT3HZEi/lEXlMM0Ly/.RHYZ.fNkAhVJMsFe2PwF6TyMkjRRhLO', 'cocina', 1);

-- ─── CATEGORÍAS ───────────────────────────────────────────────
INSERT INTO `categories` (`name`, `icon`) VALUES
('Café Caliente',  'local_cafe'),
('Bebidas Frías',  'water_drop'),
('Pastelería',     'cake'),
('Especialidades', 'stars'),
('Bolsas de Café', 'shopping_bag');

-- ─── INSUMOS ──────────────────────────────────────────────────
INSERT INTO `ingredients` (`name`, `unit`, `stock_actual`, `stock_minimo`, `fecha_vencimiento`) VALUES
('Café de especialidad',  'gr',     2500.000,  500.000, NULL),
('Leche entera',          'ml',    12000.000, 2000.000, '2026-06-15'),
('Leche de avena',        'ml',     3000.000, 1000.000, '2026-06-10'),
('Azúcar rubia',          'gr',     5000.000,  500.000, NULL),
('Hielo en cubos',        'gr',     3000.000,  500.000, NULL),
('Pan masa madre',        'unidad',   20.000,    5.000, '2026-05-25'),
('Palta Hass',            'unidad',   15.000,    5.000, '2026-05-26'),
('Crema chantilly',       'ml',     1000.000,  200.000, '2026-06-01'),
('Croissant',             'unidad',   30.000,   10.000, '2026-05-24'),
('Almendras laminadas',   'gr',      500.000,  100.000, NULL),
('Jarabe de vainilla',    'ml',      800.000,  200.000, '2026-07-01'),
('Vasos Kraft 12oz',      'unidad',  850.000,  100.000, NULL),
('Azúcar mascabado',      'gr',    12000.000,  500.000, NULL),
('Sirope vainilla s/azúcar', 'ml',  500.000,  100.000, '2026-08-01'),
('Té matcha culinario',   'gr',      200.000,   50.000, NULL);

-- ─── PRODUCTOS ────────────────────────────────────────────────
INSERT INTO `products` (`name`, `price`, `category_id`, `is_active`, `image_url`) VALUES
-- Café Caliente (category_id = 1)
('Cappuccino Clásico',  4.50, 1, 1, NULL),
('Espresso Doble',      3.50, 1, 1, NULL),
('Flat White',          4.50, 1, 1, NULL),
('Café Mocha',          5.50, 1, 1, NULL),
('Americano',           3.00, 1, 1, NULL),
-- Bebidas Frías (category_id = 2)
('Latte Helado',        5.20, 2, 1, NULL),
('Cold Brew Origin',    5.50, 2, 1, NULL),
-- Pastelería (category_id = 3)
('Croissant Almendras', 7.00, 3, 1, NULL),
-- Especialidades (category_id = 4)
('Tostada de Aguacate', 8.00, 4, 1, NULL);

-- ─── RECETAS ──────────────────────────────────────────────────
-- Cappuccino Clásico (product_id = 1)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(1, 1, 18.000),   -- 18gr Café de especialidad
(1, 2, 150.000);  -- 150ml Leche entera

-- Espresso Doble (product_id = 2)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(2, 1, 20.000);   -- 20gr Café de especialidad

-- Flat White (product_id = 3)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(3, 1, 18.000),   -- 18gr Café de especialidad
(3, 2, 120.000);  -- 120ml Leche entera

-- Café Mocha (product_id = 4)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(4, 1, 18.000),   -- 18gr Café
(4, 2, 150.000),  -- 150ml Leche entera
(4, 11, 20.000);  -- 20ml Jarabe de vainilla

-- Americano (product_id = 5)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(5, 1, 18.000);   -- 18gr Café

-- Latte Helado (product_id = 6)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(6, 1, 18.000),   -- 18gr Café
(6, 3, 200.000),  -- 200ml Leche de avena
(6, 5, 150.000);  -- 150gr Hielo

-- Cold Brew Origin (product_id = 7)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(7, 1, 25.000),   -- 25gr Café
(7, 5, 200.000);  -- 200gr Hielo

-- Croissant Almendras (product_id = 8)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(8, 9, 1.000),    -- 1 Croissant
(8, 10, 15.000),  -- 15gr Almendras
(8, 8, 30.000);   -- 30ml Crema chantilly

-- Tostada de Aguacate (product_id = 9)
INSERT INTO `recipe_items` (`product_id`, `ingredient_id`, `quantity`) VALUES
(9, 6, 1.000),    -- 1 Pan masa madre
(9, 7, 1.000);    -- 1 Palta Hass

-- ─── REGISTRO DE MIGRACIONES (para que Laravel no re-migre) ───
INSERT INTO `migrations` (`migration`, `batch`) VALUES
('2014_10_12_000000_create_users_table',              1),
('2024_01_01_000001_create_categories_table',          1),
('2024_01_01_000002_create_ingredients_table',         1),
('2024_01_01_000003_create_products_table',            1),
('2024_01_01_000004_create_recipe_items_table',        1),
('2024_01_01_000005_create_inventory_movements_table', 1),
('2024_01_01_000006_create_sales_table',               1);
