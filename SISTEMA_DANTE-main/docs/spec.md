# Especificación del Sistema (spec.md)

## 1. Visión General
El Sistema Web para la Cafetería "Dante" busca digitalizar la gestión de inventarios y ventas, conectando de forma inteligente la salida de productos con el descuento automático de materia prima mediante recetas estandarizadas.

## 2. Definición del Problema
Actualmente, la cafetería sufre de:
- Pérdidas por falta de control de mermas y caducidades.
- Desconocimiento del stock real, forzando compras de emergencia.
- Desconexión total entre las ventas (Punto de Venta) y el consumo de insumos.

## 3. Objetivos del Sistema (MVP)
- **Automatizar Kardex:** Descontar insumos automáticamente al registrar una venta.
- **Controlar Pérdidas:** Establecer un flujo de reporte y aprobación de mermas de cocina.
- **Toma de Decisiones:** Proveer un dashboard en tiempo real con niveles críticos de stock y ventas diarias.

## 4. Usuarios y Roles
- **Administrador:** Control total. Gestiona catálogo, recetas, aprueba mermas y visualiza dashboard.
- **Cajero:** Opera el Punto de Venta (POS) y realiza ventas en efectivo.
- **Cocina:** Visualiza insumos y solicita mermas.

## 5. Alcance del MVP (Top 10 Requerimientos Funcionales)
Para esta primera fase, los usuarios se sembrarán directamente en base de datos.
1. **RF-001:** Autenticar usuario (Login JWT).
2. **RF-002:** Visualizar dashboard (KPIs principales).
3. **RF-003:** Gestionar Catálogo de Productos (CRUD de productos finales).
4. **RF-004:** Administrar Recetas (Asociar insumos y cantidades a un producto).
5. **RF-005:** Gestionar Almacén de Insumos (Crear insumos y definir stock mínimo).
6. **RF-006:** Registrar Entrada de Insumos (Reabastecimiento manual).
7. **RF-007:** Registrar Mermas (Solicitud desde cocina).
8. **RF-008:** Aprobar Mermas (Administrador aprueba para descontar stock).
9. **RF-009:** Registrar Venta de Productos (POS en efectivo con descuento automático).
10. **RF-010:** Emitir Comprobante (Generación de ticket PDF/impresión local).

## 6. Reglas de Negocio Clave
- **RN01:** Un producto no puede venderse si no tiene receta o si sus insumos tienen stock insuficiente.
- **RN02:** El stock solo se descuenta cuando la venta es confirmada o la merma aprobada.
- **RN03:** El historial de movimientos (Kardex) es inmutable.
