# Actualización de Requerimientos Funcionales (SISTEMA DANTE)

Durante las últimas fases de desarrollo, hemos realizado modificaciones e implementaciones clave en el sistema que han alterado o completado el alcance de varios requerimientos originales. A continuación, detallo los cambios realizados y, finalmente, presento la tabla con los requerimientos corregidos y su estado de implementación.

## 🔄 Cambios y Mejoras Realizadas Recientemente

1. **Gestión de Costos y Valorización en Inventario (Kardex):**
   - *Impacto en RF-MIA-08 y nuevos requerimientos.*
   - **Cambio:** Originalmente, no existía evidencia explícita del manejo de costos. Ahora el sistema cuenta con un Kardex Contable real que calcula el **Costo Promedio Ponderado**. Cada movimiento de entrada o salida afecta el costo unitario y se visualiza el saldo total valorizado en la tabla.
2. **Optimización de UX en el Punto de Venta (POS):**
   - *Impacto en RF-MCR-04 y RF-MPV-14.*
   - **Cambio:** Se mejoró drásticamente la interfaz del POS. Se reemplazó el scroll horizontal por categorías colapsables dinámicas (`flex-wrap`) y se añadió un **buscador universal en tiempo real** para localizar productos al instante. También se rediseñó el carrito de compras para que sea súper compacto y elimine el scroll vertical.
3. **Flujo Estricto de Aprobación de Mermas:**
   - *Impacto en RF-MIA-11.*
   - **Cambio:** Se programó la lógica exacta de roles: El rol de Cocina o Caja solo puede registrar la merma en estado "Pendiente". Únicamente el Rol Administrador tiene el botón para "Aprobar", lo cual dispara el descuento real en el inventario.
4. **Emisión de Comprobantes y Clientes Rápido:**
   - *Impacto en RF-MPV-16.*
   - **Cambio:** Se integró un modal de creación rápida de clientes en el POS. Dependiendo del documento ingresado (DNI o RUC), el sistema preselecciona automáticamente el comprobante correspondiente (Boleta o Factura).
5. **Integración de Pagos:**
   - *Impacto en RF-MPV-15.*
   - **Cambio:** Se añadió la pasarela de pagos **Culqi** directamente en la interfaz del POS, operando junto a la opción de Efectivo.

---

## 📋 Cuadro de Requerimientos Funcionales Finales Corregidos

A continuación, la tabla definitiva de los requerimientos, indicando su descripción actualizada y si están **IMPLEMENTADOS** o **NO IMPLEMENTADOS** hasta el momento.

| Código | Estado | Nombre del Requerimiento | Descripción Actualizada |
| :--- | :---: | :--- | :--- |
| **RF-MCA-01** | ✅ Implementado | Gestionar Autenticación y Sesiones | El sistema controla el acceso mediante validación de credenciales, gestionando inicio/cierre de sesión con JWT. |
| **RF-MCA-02** | ✅ Implementado | Gestionar Personal | Permite administrar datos del personal de la cafetería, asignación de roles y control de cuentas de acceso. |
| **RF-MCA-03** | ✅ Implementado | Gestionar Roles y Permisos | Implementa RBAC (Rol-Based Access Control) con 3 perfiles: Administrador (acceso total), Cajero (POS, ventas) y Cocina (KDS, creación de mermas pendientes). |
| **RF-MCR-04** | ✅ Implementado | Gestionar Catálogo de Productos Comerciales | Administra los productos del menú. Incluye buscador en tiempo real en el POS y filtrado ágil por categorías (flex-wrap) para acelerar las ventas. Vinculado al módulo IA. |
| **RF-MCR-05** | ✅ Implementado | Gestionar Recetas y dosificar productos | Administra recetas vinculadas a productos con unidades exactas (gr, ml). Al vender en POS, se descuenta automáticamente del Kardex basándose en esta receta. |
| **RF-MCR-06** | ✅ Implementado | Gestionar Promociones Programadas | El Administrador crea promociones (descuento %, fechas). El POS aplica el descuento automáticamente si está vigente, mostrando el precio tachado. |
| **RF-MCR-07** | ❌ NO Implementado | Gestionar Combos Comerciales | Administrar agrupaciones comerciales de productos vendidas como una sola oferta con precios especiales. |
| **RF-MIA-08** | ✅ Implementado | Gestionar Inventario Principal (Kardex Valorizado) | Administra insumos (stock actual, mínimo, vencimiento). **[Actualizado]** Incluye un Kardex Contable que registra entradas/salidas calculando el *Costo Promedio Ponderado* y la valorización total del inventario. |
| **RF-MIA-09** | ❌ NO Implementado | Gestionar Transferencias a Cocina | Administrar el traslado de insumos desde el almacén principal hacia áreas operativas de cocina (trazabilidad de sub-almacenes). |
| **RF-MIA-10** | ✅ Implementado | Gestionar Alertas de Stock Mínimo | El Dashboard alerta visualmente qué insumos están por debajo del stock mínimo configurado. |
| **RF-MIA-11** | ✅ Implementado | Gestionar Mermas de Insumos | Cocina/Caja registran solicitudes de merma (Pendiente). El Administrador las aprueba/rechaza, lo cual afecta el inventario Kardex. |
| **RF-MIA-12** | ❌ NO Implementado | Gestionar Mermas de Productos Terminados | Registrar y controlar pérdidas de productos ya elaborados (no insumos) por caducidad o accidentes. |
| **RF-MIA-13** | ✅ Implementado | Procesar Descuento Automatizado de Inventario | Al vender en POS, descuenta automáticamente los insumos en background según la receta del producto, generando registros de salida en el Kardex. |
| **RF-MPV-14** | ✅ Implementado | Gestionar Registro de Ventas | Registra cada venta (ticket/boleta/factura). Mantiene un historial completo. La UI del POS cuenta con un diseño compacto optimizado para rapidez. |
| **RF-MPV-15** | ✅ Implementado | Procesar Pagos Electrónicos | **[Actualizado]** Gestiona pagos mediante la integración nativa de la pasarela **Culqi** en el POS, además de cobros en efectivo. |
| **RF-MPV-16** | ✅ Implementado | Gestionar Emisión de Comprobantes | **[Actualizado]** Modal rápido de registro de clientes en el POS. Si el cliente tiene DNI, preselecciona Boleta; si tiene RUC, preselecciona Factura. |
| **RF-MCC-17** | ✅ Implementado | Gestionar Flujo de Comandas | KDS (Kitchen Display System) para Cocina. Las ventas del POS aparecen en tiempo real para cambiar su estado ("En preparación" → "Listo"). |
| **RF-MCC-18** | ❌ NO Implementado | Notificaciones de Cancelación | Generar alertas a cocina cuando una orden es cancelada desde caja durante su preparación. |
| **RF-MIA-19** | ✅ Implementado | Optimización de Recetas Anti-Merma (IA) | Analiza inventario próximo a vencer y usa IA para sugerir nuevas recetas, permitiendo agregarlas al menú con un solo clic. |
| **RF-MIA-20** | ❌ NO Implementado | Predicción de Demanda mediante IA | Analizar histórico para estimar demanda futura de productos mediante modelos predictivos. |
| **RF-MIA-21** | ❌ NO Implementado | Recomendaciones de Combos mediante IA | Identificar patrones de compra y sugerir combinaciones comerciales automáticas. |
| **RF-MIA-22** | ❌ NO Implementado | Detección de Anomalías en Mermas (IA) | Analizar registros históricos para detectar comportamientos atípicos o robos en mermas. |
| **RF-MIA-23** | ❌ NO Implementado | Sugerencias de Abastecimiento (IA) | Generar recomendaciones de compra a proveedores basadas en consumo y proyecciones. |
| **RF-SYS-24** | ✅ Implementado | Auditoría de Eventos y Modificaciones | Registra automáticamente en un Log (Auditoría) movimientos, cambios de precio y ventas, visible solo por el Administrador. |
