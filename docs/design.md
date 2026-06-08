# Diseño e Interfaces (design.md)

## Análisis UI Existente
El código entregado (Login, Dashboard, Inventario, Productos) sigue un sistema de diseño definido:
- **Colores:** Paleta cálida (Espresso, Terracota, Latte, Sand, Cream, Mist).
- **Tipografía:** Playfair Display (Encabezados elegantes), DM Sans (Cuerpo y labels modernos).
- **Componentes:** Sidebar persistente (mobile-hidden/drawer), Topbar minimalista, tarjetas tipo Bento Grid, modales y drawers laterales.
- **Framework:** Tailwind CSS con directivas de colores personalizadas.

## Propuesta Diseño POS (Punto de Venta)
Puesto que no se entregó la pantalla del POS, se diseñará siguiendo esta estructura:
- **Layout General:** Sin sidebar lateral para maximizar espacio.
- **Lado Izquierdo (Catálogo - 65% width):** Grid de productos con imágenes y precios. Filtros rápidos (Categorías: Cafés, Bebidas, Pastelería) en la parte superior.
- **Lado Derecho (Carrito - 35% width):** Panel lateral fijado (drawer style) color Sand o Mist.
    - Lista de ítems con botones `+` y `-`.
    - Resumen numérico: Subtotal, Impuestos (IGV), Total.
    - Gran botón primario color Terracota: "Cobrar (Efectivo)".

## Experiencia de Usuario (UX) en Mermas
- **Cocina:** Vista limpia y orientada a móviles (botones grandes, lectura clara) para reportar insumos rotos/caducados.
- **Administrador:** En su módulo de Inventario, una pestaña de "Notificaciones/Pendientes" donde con un solo clic pueda "Aprobar" o "Rechazar" el descuento solicitado.

## Relación con el HTML Entregado
Los HTML entregados son estáticos y utilizan un script personalizado de Tailwind Config inyectado en el `<head>`. Durante el desarrollo con Next.js, esta configuración se migrará al archivo `tailwind.config.js` estandarizando las variables de diseño.
