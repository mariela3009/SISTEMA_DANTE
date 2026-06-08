CREATE DATABASE IF NOT EXISTS `eva_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `eva_db`;

-- ==========================================
-- 1. LIMPIEZA TOTAL EN ORDEN INVERSO (Hijos primero)
-- ==========================================
DROP TABLE IF EXISTS `promotion_product`;
DROP TABLE IF EXISTS `recipe_items`;
DROP TABLE IF EXISTS `sale_items`;
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `inventory_movements`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `ingredients`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `promotions`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `failed_jobs`;
DROP TABLE IF EXISTS `migrations`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `ai_recommendations`;

-- ==========================================
-- 2. TABLAS PADRE / INDEPENDIENTES (Nivel 1)
-- ==========================================

CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`, `name`, `icon`, `created_at`, `updated_at`) VALUES
	(1, 'Café Caliente', 'local_cafe', '2026-06-08 12:14:20', '2026-06-08 12:14:20'),
	(2, 'Bebidas Frías', 'water_drop', '2026-06-08 12:14:20', '2026-06-08 12:14:20'),
	(3, 'Pastelería', 'cake', '2026-06-08 12:14:20', '2026-06-08 12:14:20'),
	(4, 'Especialidades', 'stars', '2026-06-08 12:14:21', '2026-06-08 12:14:21');


CREATE TABLE `ingredients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `unit` enum('gr','kg','ml','l','unidad') NOT NULL DEFAULT 'unidad',
  `stock_actual` decimal(10,3) NOT NULL DEFAULT 0.000,
  `stock_cocina` decimal(10,3) NOT NULL DEFAULT 0.000,
  `costo_promedio` decimal(10,4) NOT NULL DEFAULT 0.0000,
  `stock_minimo` decimal(10,3) NOT NULL DEFAULT 0.000,
  `fecha_vencimiento` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ingredients` (`id`, `name`, `unit`, `stock_actual`, `stock_cocina`, `costo_promedio`, `stock_minimo`, `fecha_vencimiento`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Café de especialidad', 'gr', 2500.000, 0.000, 0.0000, 500.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(2, 'Leche entera', 'ml', 12000.000, 0.000, 0.0000, 2000.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(3, 'Leche de avena', 'ml', 3000.000, 0.000, 0.0000, 1000.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(4, 'Azúcar rubia', 'gr', 5000.000, 0.000, 0.0000, 500.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(5, 'Hielo en cubos', 'gr', 3000.000, 0.000, 0.0000, 500.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(6, 'Pan masa madre', 'unidad', 20.000, 0.000, 0.0000, 5.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(7, 'Palta Hass', 'unidad', 15.000, 0.000, 0.0000, 5.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(8, 'Crema chantilly', 'ml', 1000.000, 0.000, 0.0000, 200.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(9, 'Croissant', 'unidad', 30.000, 0.000, 0.0000, 10.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(10, 'Almendras laminadas', 'gr', 500.000, 0.000, 0.0000, 100.000, NULL, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21');


CREATE TABLE `clients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `document_type` enum('dni','ruc') NOT NULL,
  `document_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_document_number_unique` (`document_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cajero','cocina') NOT NULL DEFAULT 'cajero',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Admin Dante', 'admin@cafeteriadante.com', '$2y$10$r0E062xOV5lv/zQNq9jMrul6HQk302byzrtTL2gHHhgE6y.3/o.n6', 'admin', 1, NULL, '2026-06-08 12:14:20', '2026-06-08 12:14:20'),
	(2, 'Cajero Principal', 'cajero@cafeteriadante.com', '$2y$10$//CnC2mW.YaHSWtSnsXURuFXxc/kS2CrwwlzHQ9Xj44hKMgnjPjbC', 'cajero', 1, NULL, '2026-06-08 12:14:20', '2026-06-08 12:14:20'),
	(3, 'Cocina Team', 'cocina@cafeteriadante.com', '$2y$10$wwQ/a65kdrB3sJG0DC18bOBt7tFxyEIIb/7qrIyZMcN1DIxFjRoue', 'cocina', 1, NULL, '2026-06-08 12:14:20', '2026-06-08 12:14:20');


CREATE TABLE `promotions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `discount_percentage` decimal(5,2) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `ai_recommendations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `data` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_recommendations_type_index` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `table_name` varchar(255) NOT NULL,
  `record_id` bigint(20) unsigned NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_values`, `new_values`, `created_at`) VALUES
	(1, NULL, 'created', 'ingredients', 1, NULL, '{"id": 1, "name": "Café de especialidad", "unit": "gr", "stock_actual": 2500, "stock_minimo": 500, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(2, NULL, 'created', 'ingredients', 2, NULL, '{"id": 2, "name": "Leche entera", "unit": "ml", "stock_actual": 12000, "stock_minimo": 2000, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(3, NULL, 'created', 'ingredients', 3, NULL, '{"id": 3, "name": "Leche de avena", "unit": "ml", "stock_actual": 3000, "stock_minimo": 1000, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(4, NULL, 'created', 'ingredients', 4, NULL, '{"id": 4, "name": "Azúcar rubia", "unit": "gr", "stock_actual": 5000, "stock_minimo": 500, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(5, NULL, 'created', 'ingredients', 5, NULL, '{"id": 5, "name": "Hielo en cubos", "unit": "gr", "stock_actual": 3000, "stock_minimo": 500, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(6, NULL, 'created', 'ingredients', 6, NULL, '{"id": 6, "name": "Pan masa madre", "unit": "unidad", "stock_actual": 20, "stock_minimo": 5, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(7, NULL, 'created', 'ingredients', 7, NULL, '{"id": 7, "name": "Palta Hass", "unit": "unidad", "stock_actual": 15, "stock_minimo": 5, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(8, NULL, 'created', 'ingredients', 8, NULL, '{"id": 8, "name": "Crema chantilly", "unit": "ml", "stock_actual": 1000, "stock_minimo": 200, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(9, NULL, 'created', 'ingredients', 9, NULL, '{"id": 9, "name": "Croissant", "unit": "unidad", "stock_actual": 30, "stock_minimo": 10, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(10, NULL, 'created', 'ingredients', 10, NULL, '{"id": 10, "name": "Almendras laminadas", "unit": "gr", "stock_actual": 500, "stock_minimo": 100, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(11, NULL, 'created', 'products', 1, NULL, '{"id": 1, "name": "Cappuccino Clásico", "price": 4.5, "is_active": true, "category_id": 1, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(12, NULL, 'created', 'products', 2, NULL, '{"id": 2, "name": "Espresso Doble", "price": 3.5, "is_active": true, "category_id": 1, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(13, NULL, 'created', 'products', 3, NULL, '{"id": 3, "name": "Flat White", "price": 4.5, "is_active": true, "category_id": 1, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(14, NULL, 'created', 'products', 4, NULL, '{"id": 4, "name": "Latte Helado", "price": 5.2, "is_active": true, "category_id": 2, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(15, NULL, 'created', 'products', 5, NULL, '{"id": 5, "name": "Cold Brew Origin", "price": 5.5, "is_active": true, "category_id": 2, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(16, NULL, 'created', 'products', 6, NULL, '{"id": 6, "name": "Tostada de Aguacate", "price": 8, "is_active": true, "category_id": 4, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21'),
	(17, NULL, 'created', 'products', 7, NULL, '{"id": 7, "name": "Croissant Almendras", "price": 7, "is_active": true, "category_id": 3, "created_at": "2026-06-08 07:14:21", "updated_at": "2026-06-08 07:14:21"}', '2026-06-08 12:14:21');


CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2014_10_12_000000_create_users_table', 1),
	(2, '2014_10_12_100000_create_password_resets_table', 1),
	(3, '2019_08_19_000000_create_failed_jobs_table', 1),
	(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(5, '2024_01_01_000001_create_categories_table', 1),
	(6, '2024_01_01_000002_create_ingredients_table', 1),
	(7, '2024_01_01_000003_create_products_table', 1),
	(8, '2024_01_01_000004_create_recipe_items_table', 1),
	(9, '2024_01_01_000005_create_inventory_movements_table', 1),
	(10, '2024_01_01_000006_create_sales_table', 1),
	(11, '2026_05_25_022119_add_kardex_fields_to_tables', 1),
	(12, '2026_05_28_204243_add_kitchen_fields_to_tables', 1),
	(13, '2026_05_28_204243_create_promotions_table', 1),
	(14, '2026_05_28_204244_create_promotion_product_table', 1),
	(15, '2026_05_28_210000_create_clients_table', 1),
	(16, '2026_05_29_000000_add_is_cancelled_to_sale_items', 1),
	(17, '2026_05_30_000000_create_ai_recommendations_table', 1),
	(18, '2026_05_31_000000_create_audit_logs_table', 1);


CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 3. TABLAS CON LLAVES FORÁNEAS (Nivel 2)
-- ==========================================

CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_foreign` (`category_id`),
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`id`, `name`, `price`, `image_url`, `category_id`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Cappuccino Clásico', 4.50, NULL, 1, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(2, 'Espresso Doble', 3.50, NULL, 1, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(3, 'Flat White', 4.50, NULL, 1, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(4, 'Latte Helado', 5.20, NULL, 2, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(5, 'Cold Brew Origin', 5.50, NULL, 2, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(6, 'Tostada de Aguacate', 8.00, NULL, 4, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(7, 'Croissant Almendras', 7.00, NULL, 3, 1, '2026-06-08 12:14:21', '2026-06-08 12:14:21');


CREATE TABLE `sales` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('efectivo','paypal') NOT NULL DEFAULT 'efectivo',
  `invoice_type` enum('ticket','boleta','factura') NOT NULL DEFAULT 'ticket',
  `status` enum('completed','cancelled') NOT NULL DEFAULT 'completed',
  `paypal_order_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_user_id_foreign` (`user_id`),
  KEY `sales_client_id_foreign` (`client_id`),
  CONSTRAINT `sales_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `inventory_movements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ingredient_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `type` enum('entrada','salida_venta','salida_merma','ajuste','pase_cocina') NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `saldo_cantidad` decimal(10,3) NOT NULL,
  `cost_per_unit` decimal(10,2) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `document_ref` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_movements_ingredient_id_foreign` (`ingredient_id`),
  KEY `inventory_movements_user_id_foreign` (`user_id`),
  KEY `inventory_movements_approved_by_foreign` (`approved_by`),
  CONSTRAINT `inventory_movements_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_movements_ingredient_id_foreign` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`),
  CONSTRAINT `inventory_movements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 4. TABLAS DEPENDIENTES COMPUESTAS (Nivel 3)
-- ==========================================

CREATE TABLE `recipe_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `ingredient_id` bigint(20) unsigned NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `recipe_items_product_id_ingredient_id_unique` (`product_id`,`ingredient_id`),
  KEY `recipe_items_ingredient_id_foreign` (`ingredient_id`),
  CONSTRAINT `recipe_items_ingredient_id_foreign` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`),
  CONSTRAINT `recipe_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `recipe_items` (`id`, `product_id`, `ingredient_id`, `quantity`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 18.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(2, 1, 2, 150.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(3, 2, 1, 20.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(4, 3, 1, 18.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(5, 3, 2, 120.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(6, 4, 1, 18.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(7, 4, 3, 200.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(8, 4, 5, 150.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(9, 5, 1, 25.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(10, 5, 5, 200.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(11, 6, 6, 1.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(12, 6, 7, 1.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(13, 7, 9, 1.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(14, 7, 10, 15.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21'),
	(15, 7, 8, 30.000, '2026-06-08 12:14:21', '2026-06-08 12:14:21');


CREATE TABLE `sale_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `sale_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(8,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `status` enum('pending','preparing','ready','delivered') NOT NULL DEFAULT 'pending',
  `is_cancelled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_items_sale_id_foreign` (`sale_id`),
  KEY `sale_items_product_id_foreign` (`product_id`),
  CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `promotion_product` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `promotion_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `promotion_product_promotion_id_foreign` (`promotion_id`),
  KEY `promotion_product_product_id_foreign` (`product_id`),
  CONSTRAINT `promotion_product_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `promotion_product_promotion_id_foreign` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;