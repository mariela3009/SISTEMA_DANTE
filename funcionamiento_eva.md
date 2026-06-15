# Documentación del Sistema EVA - Cafetería Dante

El sistema **EVA** es una plataforma integral de gestión para la "Cafetería Dante", diseñada para administrar las operaciones diarias, desde el punto de venta hasta el control estricto de inventario y recetas.

## Arquitectura Técnica

- **Frontend:** Construido con **Next.js** (React) y estilizado con **Tailwind CSS**. Utiliza una interfaz moderna y fluida (SPA) con notificaciones interactivas (Toasts).
- **Backend:** Desarrollado en **Laravel** (PHP), que provee una API RESTful robusta.
- **Base de Datos:** **MySQL**, donde se almacena el inventario, ventas, usuarios y registros de auditoría.
- **Autenticación:** Sistema basado en tokens **JWT**, manejando control de acceso basado en Roles (RBAC).

---

## Roles y Permisos

El sistema se divide según el tipo de empleado, restringiendo qué pueden ver y modificar:

1. **Administrador (Admin):** Acceso total. Puede crear usuarios, aprobar mermas, crear promociones, ver auditorías y acceder a las métricas del negocio.
2. **Cajero:** Su función principal es registrar ventas en el Punto de Venta (POS), ver el historial de ventas y administrar clientes.
3. **Cocina:** Tiene acceso al KDS (Kitchen Display System) para ver los pedidos entrantes y cambiar su estado de preparación. También puede solicitar mermas de insumos.

---

## Módulos Principales

### 1. 📊 Dashboard
El panel de control principal. Muestra:
- Métricas rápidas: Ventas del día, ingresos totales, etc.
- **Alertas de Stock:** Detecta de manera automática qué insumos (ingredientes) están por debajo de su *stock mínimo* para solicitar reabastecimiento rápido.

### 2. 🏪 Punto de Venta (POS) y Ventas
- Interfaz táctil y rápida para tomar pedidos a los clientes.
- Agrega productos al carrito, calcula precios (aplicando promociones vigentes de forma automática) y procesa la venta.
- Se integra con la base de datos de **Clientes** para asociar ventas (boletas/facturas).
- Historial completo de ventas donde se puede ver el detalle de cada ticket.

### 3. 📦 Inventario e Insumos
Aquí se gestiona la materia prima (ej. Leche, Azúcar, Café en grano):
- **Creación de Insumos:** Nombre, unidad de medida (gr, ml, unidad), stock mínimo, stock actual y fecha de vencimiento.
- **Entradas:** Registro de compras de nueva mercadería para sumar al stock.
- **Paginación:** La lista de insumos maneja miles de registros cómodamente gracias a la carga por páginas y búsqueda en tiempo real.

### 4. 🍽️ Productos y Recetas
En lugar de vender simples ítems, EVA maneja un **sistema de recetas**:
- Cada producto del menú (ej. "Capuccino") tiene una "Receta" vinculada a uno o más insumos del inventario (ej. "150ml Leche", "15gr Café").
- **Descuento Automático:** Al vender un producto en el POS, el sistema automáticamente resta de manera exacta la cantidad de insumos usados del inventario general.

### 5. 🗑️ Mermas
Control de pérdidas de inventario por accidentes, caducidad o errores:
- El personal de cocina o caja puede **Solicitar una Merma** (ej. "Se derramó 1 litro de leche").
- La merma queda en estado *Pendiente* hasta que un Administrador la **Apruebe o Rechace**. Si se aprueba, se descuenta permanentemente del inventario.

### 6. 🏷️ Promociones
El Administrador puede crear descuentos programados:
- Se asigna un nombre (ej. "Promo Verano"), un % de descuento, fecha de inicio y fin.
- Se seleccionan qué productos participan.
- El sistema aplica automáticamente este descuento en el POS si la venta ocurre dentro de la fecha de vigencia.

### 7. 🤖 Sugerencias IA (Insumos por Vencer)
Un módulo inteligente de ayuda operativa:
- Analiza el inventario buscando qué insumos están próximos a caducar (en 3, 7 o 14 días).
- Para evitar desperdicio, el módulo cruza la base de datos y te **sugiere qué productos nuevos podrías crear** rápidamente para vender esos insumos.
- Permite crear el producto sugerido con un solo clic para agregarlo al menú del día.

### 8. 👥 Clientes y Personal
- **Clientes:** Registro de compradores, útil para fidelización o emisión de comprobantes. Evita duplicidad validando número de documento.
- **Personal:** Gestión de empleados, roles y contraseñas.
- **Auditoría (Logs):** Todo movimiento de inventario, cambio de precio de producto o venta queda registrado con la fecha, hora y el nombre del empleado que realizó la acción, evitando robos o manipulación de datos.

---

## Flujos Destacados del Sistema

> [!TIP]
> **El Ciclo de Venta y Cocina:**
> Cuando el Cajero registra un pedido en el POS, la orden aparece inmediatamente en la pantalla de la Cocina. Los cocineros marcan los productos como "En preparación" y luego "Listo". Mientras esto ocurre, el inventario ya se ha descontado de forma silenciosa e invisible en el backend basándose en la receta.

> [!NOTE]
> **Sistema de Validaciones y Recuperación:**
> El sistema no permite crear dos clientes, productos o insumos con el mismo nombre o documento (emite alertas visibles de tipo *Toast*). Además, cuenta con un sistema robusto de recuperación de contraseñas.
