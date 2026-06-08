# Documento Base para Análisis Arquitectónico (Preparación SAD)
**Sistema:** EVA (Sistema Integral de Gestión de Insumos y Ventas Automatizadas - Cafetería Dante)
**Rol:** Arquitecto de Software Senior / Analista de Sistemas

---

## 1. Resumen Ejecutivo
El sistema **EVA** es una solución web orientada a la gestión integral de una cafetería, abarcando el control de inventario (Kardex), gestión de productos, recetas, ventas (POS) y administración de clientes. Actualmente, el sistema presenta una arquitectura Cliente-Servidor separada (Frontend SPA/SSR y Backend API REST), construida sobre un stack moderno pero con un nivel de implementación parcial. Aunque la base de datos y las operaciones core (CRUDs, Ventas, Inventario) están en gran medida funcionales o en desarrollo activo, existen módulos incompletos y una integración de pagos con PayPal planteada a nivel de modelo de datos pero presumiblemente incompleta a nivel lógico.

## 2. Hallazgos Técnicos
- **Desacoplamiento total:** El frontend y el backend operan como proyectos independientes (`eva-frontend` y `eva-backend`).
- **Estado de Desarrollo:** Se evidencia la reciente integración de nuevos requerimientos funcionales (RF-004, RF-007, RF-012, RF-014, RF-018), lo que denota un sistema en fase de construcción o iteración.
- **Deuda Técnica/Inconsistencias detectadas:** El script SQL principal (`eva_cafeteria.sql`) no contiene la tabla `clients` ni las modificaciones a `sales` (como `client_id`, `invoice_type`), sin embargo, el documento de *Requerimientos Completados* indica que estas migraciones y controladores ya fueron creados.

## 3. Arquitectura Detectada
### 3.1. Arquitectura General
- **Patrón Arquitectónico Principal:** Arquitectura Orientada a Servicios (SOA) en su variante más simple (API RESTful) + Cliente-Servidor.
- **Capas Existentes:**
  - **Capa de Presentación (Frontend):** Next.js App Router (React).
  - **Capa de Aplicación/Controlador (Backend):** Laravel API Controllers.
  - **Capa de Negocio (Backend):** Laravel Services / Models (Active Record).
  - **Capa de Datos:** MySQL/MariaDB relacional.
- **Flujo General:** El cliente web (Next.js) se autentica vía Laravel Sanctum, recibe un token, y realiza peticiones HTTP/REST al backend (Laravel), que procesa la lógica, interactúa con la BD mediante Eloquent ORM, y retorna JSON.

## 4. Stack Tecnológico Detectado
### Frontend
- **Framework:** Next.js 16.2.6
- **Librería UI:** React 19.2.4
- **Estilos:** Tailwind CSS v4, PostCSS.
- **Lenguaje:** TypeScript / JavaScript (ES6+).
### Backend
- **Framework:** Laravel 8.0
- **Lenguaje:** PHP ^7.3
- **Seguridad/Autenticación:** Laravel Sanctum ^2.15, Fideloper Proxy, Bcrypt.
### Base de Datos
- **Motor:** MySQL 8.x / MariaDB 10.4+
- **ORM:** Eloquent (integrado en Laravel).
### Infraestructura/Dependencias Externas
- **Servicios Externos (Identificados):** Integración con PayPal (campos `payment_method` y `paypal_order_id` en tabla `sales`).

## 5. Componentes Detectados
### 5.1. Frontend
- **Estructura:** Uso del Next.js App Router (`app/`).
- **Rutas principales inferidas:** `/dashboard/clientes`, `/dashboard/pos`, `/dashboard/inventario`, `/dashboard/productos`, `/dashboard/personal`.
- **Componentes Globales:** `Sidebar.tsx`.
- **Gestión de estado:** Inferida mediante React Hooks (useState/useContext) o Server Components.

### 5.2. Backend
- **Controllers:** `UserController`, `ProductController`, `IngredientController`, `ClientController`, `SaleController`.
- **Models:** `User`, `Category`, `Ingredient`, `Product`, `RecipeItem`, `InventoryMovement`, `Sale`, `SaleItem`, `Client` (inferido por requerimientos).
- **Middlewares:** Autenticación de Sanctum (`auth:sanctum`), CORS (`fruitcake/laravel-cors`).

## 6. Modelo de Datos Detectado
El modelo relacional está robustamente diseñado utilizando claves foráneas y un esquema normalizado.
**Tablas Principales:**
- `users`: Gestión de accesos (PK: `id`).
- `clients` *(Parcial/Agregada)*: Datos de clientes para facturación (DNI, RUC).
- `categories` & `products`: Catálogo de ventas.
- `ingredients`: Insumos primarios (Kardex).
- `recipe_items`: Tabla pivote con cantidad (`product_id`, `ingredient_id`) para conformar recetas.
- `inventory_movements`: Kardex transaccional (`ingredient_id`, `user_id`, tipo de movimiento).
- `sales` & `sale_items`: Transacciones de punto de venta (POS) y detalle de factura.

**Reglas Implícitas / Lógica de Negocio Inferida:**
- Descuento automático de inventario: Al completarse una venta (`Sale`), el sistema iterará los `SaleItem`, buscará los `RecipeItem` correspondientes al producto, e insertará un registro de salida (`salida_venta`) en `inventory_movements` para cada ingrediente.
- **Soft-deletes (Bajas Lógicas):** Se utiliza activamente el campo `is_active` en lugar de borrar registros para mantener la integridad histórica (Ej. usuarios o insumos en recetas).

## 7. Seguridad
- **Autenticación:** Basada en Tokens (Laravel Sanctum).
- **Autorización (Roles):** Roles estáticos a nivel de base de datos (`admin`, `cajero`, `cocina`).
- **Cifrado:** Contraseñas cifradas mediante Bcrypt (Costo 12).

## 8. Procesos de Negocio Detectados
1. **Punto de Venta (POS):** Un cajero selecciona productos, asigna un cliente (DNI/RUC o Ticket rápido), genera la venta y se descuenta el stock de ingredientes según la receta.
2. **Gestión de Inventario (Kardex):** Registro de entradas (compras), salidas (mermas/ventas) y ajustes de insumos. Se disparan alertas de stock mínimo.
3. **Mantenimiento de Catálogo:** Administración de categorías, productos y vinculación de ingredientes a productos (Recetas).

## 9. Casos de Uso Detectables
| Nombre | Actor | Objetivo | Flujo Principal | Tablas |
|---|---|---|---|---|
| **Registrar Venta (POS)** | Cajero | Efectuar un cobro y emitir ticket/boleta/factura. | Seleccionar productos -> Buscar/Crear Cliente -> Elegir medio de pago -> Confirmar Venta. | sales, sale_items, products, clients |
| **Gestionar Insumos** | Admin / Cocina | Actualizar existencias o parámetros del Kardex. | Listar insumos -> Ver alertas -> Registrar ajuste/entrada/merma -> Guardar. | ingredients, inventory_movements |
| **Desactivar Entidad (Soft Delete)** | Admin | Dar de baja un usuario o producto sin perder historial. | Seleccionar entidad -> Clic en desactivar -> Marcar `is_active = 0`. | users, products, ingredients |

## 10. Diagramas Posibles a Generar Actualmente
Con la información recabada, se pueden construir con **alta fidelidad**:
- **Diagrama de Casos de Uso:** Funcionalidad del POS y Backoffice.
- **Diagrama Entidad-Relación (DER):** Completo (con la adición manual de `clients`).
- **Diagrama de Componentes / Paquetes:** Separación de UI, API, ORM y BD.
- **Diagrama de Despliegue:** Arquitectura de nodos (Servidor Web Frontend, Servidor API PHP, Servidor de Base de Datos).
- **Diagramas de Secuencia:** Específicamente para el flujo de Venta (Checkout) y el descuento de inventario.

## 11. Información Faltante / Limitaciones
- **Diagramas de Estado/Actividades:** Faltan definiciones precisas de cómo cambian de estado las ventas de PayPal o cómo se aprueban movimientos de inventario (`status = pending/approved` existe en la BD pero no se documentan flujos de aprobación).
- **Integraciones:** El flujo de la pasarela de pagos con PayPal (`paypal_order_id`) no está detallado. ¿Existe webhooks o es validación síncrona en el frontend?
- **Infraestructura Real:** Faltan los archivos de despliegue (`docker-compose.yml`, pipelines CI/CD, configuración de servidores Nginx/Apache) para el diagrama físico.

## 12. Inferencias Arquitectónicas
- **Intención Arquitectónica:** Se busca un sistema escalable y mantenible mediante separación de responsabilidades (Frontend desacoplado). Esto prepararía al sistema para una posible aplicación móvil a futuro, ya que el backend es estrictamente API REST. *(Nivel de confianza: Alto)*.
- **Gestión de Transacciones:** Las ventas y descuentos de inventario deben estar envueltas en transacciones de base de datos (`DB::transaction` en Laravel) debido a la naturaleza crítica del Kardex. *(Nivel de confianza: Alto)*.
- **Reportería / Analítica (Módulo Faltante):** Al tener tablas de Kardex y Ventas históricas bien estructuradas, la arquitectura está preparada para un futuro módulo de "Business Intelligence" o reportes gerenciales. *(Nivel de confianza: Medio)*.

## 13. Recomendaciones para el SAD (Preparación Final)
Para poblar el documento `sad_index.txt` proporcionado:

1. **Vista de Casos de Uso:** Proceder a documentar inmediatamente el **Flujo de Venta POS** (Actor: Cajero) y el **Flujo de Registro de Merma** (Actor: Cocina) como arquitectónicamente significativos.
2. **Vista Lógica:** Elaborar el Diagrama de Clases focalizándose en la triada `Product` - `RecipeItem` - `Ingredient` y `Sale` - `SaleItem`.
3. **Vista de Desarrollo/Implementación:** Reflejar la separación de paquetes `eva-frontend` (Next.js) y `eva-backend` (Laravel HTTP/Controllers/Models).
4. **Vista Física / Despliegue:** Asumir un escenario clásico de 3 nodos: Nodo Cliente (Navegador), Nodo Servidor de Aplicaciones (Next.js Node Server + Laravel PHP-FPM) y Nodo Base de Datos (MySQL).
5. **Modelo de Datos:** Usar el script SQL y las migraciones descritas para generar el esquema completo.
6. **Atributos de Calidad:**
   - *Mantenibilidad:* Justificada por el uso de frameworks estándar (Laravel/Next.js) y separación Backend/Frontend.
   - *Confiabilidad:* Justificada por el uso de Soft-Deletes, garantizando la inmutabilidad del historial financiero y de inventario.
