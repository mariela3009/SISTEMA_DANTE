# Backlog y Tareas de Desarrollo (tasks.md)

## Fase 1: Infraestructura y Setup (Sprint 1)
- [ ] Configurar repositorio y proyecto Laravel (Backend).
- [ ] Configurar repositorio y proyecto Next.js (Frontend).
- [ ] Diseñar modelo relacional en migraciones de Laravel.
- [ ] Crear seeders (Usuarios por defecto, categorías, insumos base).

## Fase 2: Autenticación y Layout (Sprint 1)
- [ ] Backend: Endpoint de Login con Sanctum.
- [ ] Frontend: Migrar HTML de Login a Next.js y conectar con API.
- [ ] Frontend: Construir Layout base (Sidebar, Topbar) protegiendo rutas.

## Fase 3: Gestión de Catálogo y Recetas (Sprint 2)
- [ ] Backend: CRUD de Insumos y Productos.
- [ ] Backend: Endpoints para asociar recetas a productos.
- [ ] Frontend: Integrar UI `code6.html` (Gestión de Productos).
- [ ] Frontend: Crear UI de listado y creación de Insumos.
- [ ] Frontend: Lógica para modal de crear/editar receta.

## Fase 4: Movimientos de Inventario (Sprint 2)
- [ ] Backend: Endpoints para registrar Entradas.
- [ ] Backend: Endpoints para reportar Mermas y Aprobar Mermas.
- [ ] Frontend: Pantalla para registro de Entradas de stock.
- [ ] Frontend: Pantalla para solicitud de Mermas (Cocina).
- [ ] Frontend: Panel de aprobación de Mermas (Administrador).

## Fase 5: Punto de Venta - POS (Sprint 3)
- [ ] Diseño: Maquetar la pantalla del POS (Carrito, Catálogo).
- [ ] Frontend: Implementar manejo de estado global para el carrito de compras.
- [ ] Backend: Endpoint transaccional para procesar venta y descontar stock automáticamente.
- [ ] Frontend: Conectar botón "Cobrar Efectivo" con API.
- [ ] Backend: Generar ticket PDF (Comprobante).

## Fase 6: Dashboard y Cierre (Sprint 3)
- [ ] Backend: Endpoints de analítica (Ventas hoy, alertas de stock).
- [ ] Frontend: Integrar UI `code3.html` (Dashboard).
- [ ] QA: Pruebas integrales de ventas vs Kardex.
