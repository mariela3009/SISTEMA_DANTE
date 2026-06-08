# Plan de Arquitectura y Tecnológico (plan.md)

## 1. Stack Tecnológico
- **Frontend:** Next.js (React), Tailwind CSS. Consumo de API mediante Fetch/Axios.
- **Backend:** Laravel 11.x (PHP 8.3+), Sanctum/JWT para autenticación.
- **Base de Datos:** MySQL 8.x.

## 2. Arquitectura del Sistema
El sistema seguirá un modelo Cliente-Servidor Desacoplado:
- **Capa de Presentación (SPA):** Next.js servirá las interfaces estáticas y dinámicas. Manejará el estado del carrito en el POS de manera local (Zustand o Context API) para máxima velocidad.
- **Capa de Negocio (API RESTful):** Laravel expondrá endpoints seguros. Manejará transacciones (DB::transaction) para asegurar que las ventas y el descuento del kardex ocurran de manera atómica.
- **Capa de Datos:** MySQL mantendrá la integridad referencial.

## 3. Entidades Principales (Modelo Relacional Básico)
- **User:** (id, name, email, password, role)
- **Product:** (id, name, price, category, image, is_active)
- **Ingredient:** (id, name, stock_actual, stock_minimo, unit)
- **Recipe_Item:** (product_id, ingredient_id, quantity)
- **Sale / Sale_Item:** (id, total, date, user_id) / (sale_id, product_id, quantity, subtotal)
- **Inventory_Movement:** (id, ingredient_id, type [in, out, merma], quantity, reason, status [approved, pending], user_id, date)

## 4. Módulos y Endpoints Clave
- **Auth:** `POST /api/login`
- **Dashboard:** `GET /api/dashboard/stats`
- **Products:** `GET, POST, PUT, DELETE /api/products`
- **Recipes:** `POST /api/products/{id}/recipe`
- **Inventory:** `GET, POST /api/ingredients`, `POST /api/inventory/movement`
- **POS/Sales:** `POST /api/sales`

## 5. Seguridad
- Autenticación con Token (Sanctum).
- CORS configurado estrictamente para el dominio de Next.js.
- Validación de roles mediante Middlewares en Laravel y Guardias de Rutas en Next.js.

## 6. Estrategia de Despliegue
- **Frontend:** Vercel (ideal para Next.js) o build estático subido al VPS.
- **Backend & DB:** VPS Linux (Ubuntu), Nginx/Apache, MySQL.
