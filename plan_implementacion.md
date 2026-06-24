# Plan de Documentación de Código y Guía de Exposición

Este plan tiene como objetivo documentar los archivos clave del sistema "EVA - Cafetería Dante" para que el código sea visualmente entendible y fácil de explicar en una sustentación o exposición. Además, incluye la división estructurada del sistema en 4 bloques de exposición equilibrados.

## 1. Propuesta de Cambios en el Código (Comentarios)

Dado que un sistema completo tiene cientos de archivos (incluyendo configuraciones base), documentar absolutamente todo generaría ruido. Propongo enfocar la documentación (comentarios antes de cada método) en el **Código Principal de Negocio**, que es el que realmente van a explicar.

### Archivos Backend (Laravel - Lógica y Base de Datos)
Se comentarán los métodos de los controladores más importantes:
- `App\Http\Controllers\Api\SaleController.php` (Lógica de Ventas, POS, Integración Culqi).
- `App\Http\Controllers\Api\KitchenController.php` (Lógica de Cocina, Despacho, Cambio de estados).
- `App\Http\Controllers\Api\ProductController.php` (Lógica de Productos e Insumos).
- `App\Http\Controllers\Api\AuthController.php` (Lógica de Login y Autenticación).

### Archivos Frontend (Next.js - Pantallas e Interfaz)
Se comentarán las funciones de los componentes visuales principales:
- `app/dashboard/pos/page.tsx` (Punto de Venta y métodos de cobro).
- `app/dashboard/cocina/page.tsx` (Monitor KDS de cocina).
- `app/dashboard/despacho/page.tsx` (Monitor de caja/despacho).
- `app/dashboard/inventario/page.tsx` (Gestión de Stock).

> [!IMPORTANT]  
> **Pregunta para el usuario:** ¿Estás de acuerdo con enfocar los comentarios en estos archivos principales que contienen la lógica "fuerte" del sistema, o necesitas que comente algún otro módulo específico (como clientes o reportes)?

---

## 2. Guía de Exposición (Dividido en 4 Integrantes)

He diseñado esta tabla para que los 4 integrantes tengan una carga de exposición uniforme. Cada integrante explicará una **Funcionalidad Fuerte** (el núcleo técnico) y una **Funcionalidad Leve** (módulos más sencillos o de apoyo).

| Integrante | Funcionalidad Fuerte (Compleja) | Funcionalidad Leve (Sencilla) | Archivos y Carpetas Clave para Mostrar |
| :--- | :--- | :--- | :--- |
| **Integrante 1** | **Punto de Venta (POS) e Integración de Pagos (Culqi/Yape)**<br/>Explicar cómo se agregan productos al carrito, cómo se calcula el IGV, y cómo el sistema se comunica de forma segura con la API de Culqi para procesar tarjetas. | **Gestión de Clientes**<br/>Explicar el CRUD (Crear, Leer, Actualizar, Borrar) básico de clientes para asignar nombres a las boletas. | **Frontend:** `app/dashboard/pos/page.tsx`<br/><br/>**Backend:** `app/Http/Controllers/Api/SaleController.php`<br/>(Método `createCulqiOrder` y `store`) |
| **Integrante 2** | **Flujo KDS (Cocina) y Despacho en Tiempo Real**<br/>Explicar cómo los pedidos viajan de la caja a la cocina. Mostrar cómo cambian los estados (Pendiente ➔ Preparando ➔ Listo ➔ Entregado) y cómo se cancelan productos. | **Métricas y Dashboard (Inicio)**<br/>Mostrar las tarjetas de resumen de ventas del día y pedidos totales en la pantalla principal. | **Frontend:** `app/dashboard/cocina/page.tsx` y `despacho/page.tsx`<br/><br/>**Backend:** `app/Http/Controllers/Api/KitchenController.php`<br/>(Método `index` y `updateStatus`) |
| **Integrante 3** | **Recetas y Deducción Automática de Inventario**<br/>Explicar el modelo relacional: cómo un "Producto" (ej. Capuchino) está compuesto de "Insumos" (Café, Leche). Explicar cómo al hacer una venta, el stock de los insumos se resta automáticamente. | **Categorías de Productos**<br/>Explicar la creación de categorías (Bebidas, Postres) y cómo estas filtran los productos en el POS. | **Frontend:** `app/dashboard/productos/page.tsx` y `inventario/page.tsx`<br/><br/>**Backend:** `app/Http/Controllers/Api/SaleController.php` (Parte donde se hace el `decrement` de stock) y `ProductController.php` |
| **Integrante 4** | **Autenticación, Seguridad y Roles de Usuario**<br/>Explicar cómo funciona el Login usando tokens de seguridad (Sanctum/JWT). Demostrar cómo un rol (Cajero vs Admin) restringe a qué pantallas del sistema se puede ingresar. | **Historial de Ventas (Reporte Base)**<br/>Explicar la tabla donde se listan todas las ventas realizadas, el método de pago usado y el ticket generado. | **Frontend:** `app/login/page.tsx` y `middleware.ts`<br/><br/>**Backend:** `app/Http/Controllers/Api/AuthController.php` (Método `login`) y Middleware de Roles. |

## Plan de Ejecución
1. Una vez apruebes este plan, procederé a abrir cada uno de los archivos listados en la sección 1.
2. Añadiré comentarios descriptivos (`//` o `/** */`) justo encima de cada función, método o `useEffect` clave, explicando en lenguaje natural qué hace ese bloque de código.
3. Te pediré que envíes los archivos al servidor (si lo deseas) para actualizar tu entorno de producción, aunque estos cambios son solo texto y no alteran la lógica del programa.
