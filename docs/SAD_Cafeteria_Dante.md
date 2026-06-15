# Documento de Arquitectura de Software (SAD) - Sistema EVA (Cafetería Dante)

**Versión:** 3.0 (Alineado a SRS Oficial)
**Fecha:** Mayo 2026

---

## 1. INTRODUCCIÓN

### 1.1. Propósito (Diagrama 4+1)
El propósito de este Documento de Arquitectura de Software (SAD) es proporcionar una visión arquitectónica global del sistema **EVA (Sistema Web para la Cafetería Dante)**. Se utilizará el modelo de vistas 4+1 de Kruchten para describir los aspectos fundamentales del diseño de software desde distintas perspectivas: lógica, desarrollo, procesos, física y la vista de casos de uso que unifica el modelo.

### 1.2. Alcance
Este documento aborda la arquitectura del sistema enfocado en la gestión de insumos, inventario y pasarela de pagos del Punto de Venta (POS). EVA es un sistema full-stack compuesto por un backend en Laravel (API REST) y un frontend en Next.js (React). Abarca 11 procesos críticos definidos en el flujo de negocio, sin contemplar la gestión de comandas o pantallas de cocina (KDS).

### 1.3. Definición, siglas y abreviaturas
* **API:** Interfaz de Programación de Aplicaciones.
* **EVA:** Nombre en clave del proyecto de gestión de la Cafetería Dante.
* **JWT / Sanctum:** Mecanismo de autenticación mediante tokens seguros.
* **POS:** Point of Sale (Punto de Venta).
* **QA:** Atributos de Calidad (Quality Attributes).

### 1.4. Organización del documento
El documento está organizado en cuatro secciones principales: (1) Introducción al sistema, (2) Objetivos y restricciones que guían el diseño, (3) Representación de las 5 vistas arquitectónicas mediante diagramas UML y (4) Evaluación de los atributos de calidad requeridos.

---

## 2. OBJETIVOS Y RESTRICCIONES ARQUITECTÓNICAS

### 2.1.1. Requerimientos Funcionales
El sistema se compone de 11 casos de uso fundamentales que actúan como los requerimientos funcionales principales:

**Módulo 1: Autenticación y Usuarios**
* **UC-001:** Autenticar Usuario.
* **UC-002:** Gestionar Personal y Roles.

**Módulo 2: Catálogos y Preparación**
* **UC-003:** Gestionar Catálogo de Productos.
* **UC-004:** Administrar Recetas de Productos.

**Módulo 3: Inventario y Kardex**
* **UC-005:** Gestionar Almacén de Insumos.
* **UC-006:** Registrar Entrada de Insumos.
* **UC-007:** Registrar Mermas Manualmente.

**Módulo 4: Punto de Venta (POS)**
* **UC-008:** Registrar Venta de Productos (Efectivo).
* **UC-009:** Procesar Pago con PayPal.
* **UC-010:** Emitir Comprobante de Venta.

**Módulo 5: Analítica y Reportes**
* **UC-011:** Consultar Dashboard e Informes.

### 2.1.2. Requerimientos No Funcionales – Atributos de Calidad
* **RNF-001 (Rendimiento):** El sistema POS debe procesar una venta y actualizar el inventario en tiempos mínimos, utilizando caché para los productos más solicitados.
* **RNF-002 (Usabilidad):** El sistema debe ser intuitivo y minimizar el impacto de los errores de los usuarios en el registro de inventario.
* **RNF-003 (Confiabilidad):** Transaccionalidad garantizada en base de datos. Movimientos inmutables en el Kardex.

### 2.2. Restricciones
* **Tecnológicas:** Obligatorio el uso de Laravel para Backend y Next.js para Frontend.
* **Infraestructura:** Despliegue en servidores estandarizados con bases de datos MySQL/MariaDB.

---

## 3. REPRESENTACIÓN DE LA ARQUITECTURA DEL SISTEMA

### 3.1. Vista de Caso de uso
Describe las funcionalidades centrales del sistema completo desde la perspectiva de sus actores oficiales.

#### 3.1.1. Diagramas de Casos de uso
```plantuml
@startuml
left to right direction
actor "Administrador\n(Supervisor)" as Admin
actor "Cajero" as Cajero
actor "Empleado" as Empleado
actor "Personal Cocina" as Cocina

package "Sistema EVA" {
  usecase "UC-001: Autenticar Usuario" as UC1
  usecase "UC-002: Gestionar Personal" as UC2
  usecase "UC-003: Gestionar Catálogo" as UC3
  usecase "UC-004: Administrar Recetas" as UC4
  usecase "UC-005: Gestionar Almacén" as UC5
  usecase "UC-006: Entrada de Insumos" as UC6
  usecase "UC-007: Registrar Mermas" as UC7
  usecase "UC-008: Venta (Efectivo)" as UC8
  usecase "UC-009: Pago (PayPal)" as UC9
  usecase "UC-010: Emitir Comprobante" as UC10
  usecase "UC-011: Consultar Dashboard" as UC11
  
  UC8 ..> UC10 : <<include>>
  UC9 ..> UC10 : <<include>>
}

Empleado --> UC1
Admin --> UC2
Admin --> UC3
Admin --> UC4
Admin --> UC5
Admin --> UC6
Admin --> UC7 : "Aprueba"
Admin --> UC11

Cocina --> UC7 : "Solicita"

Cajero --> UC8
Cajero --> UC9
Cajero --> UC10
@enduml
```

### 3.2. Vista Lógica
Representa la descomposición del sistema en capas lógicas de Frontend y Backend.

#### 3.2.1. Diagrama de Subsistemas (paquetes)
```plantuml
@startuml
package "Frontend (Next.js)" {
  [Módulo Usuarios UI]
  [Módulo Catálogo UI]
  [Módulo Inventario UI]
  [Módulo POS UI]
}

package "Backend API (Laravel)" {
  [Controlador Seguridad]
  [Controlador Productos/Recetas]
  [Controlador Insumos/Kardex]
  [Controlador POS/PayPal]
}

[Módulo Usuarios UI] --> [Controlador Seguridad] : HTTP
[Módulo Catálogo UI] --> [Controlador Productos/Recetas] : HTTP
[Módulo Inventario UI] --> [Controlador Insumos/Kardex] : HTTP
[Módulo POS UI] --> [Controlador POS/PayPal] : HTTP
@enduml
```

#### 3.2.2. Diagrama de Secuencia (vista de diseño)
*Escenario Principal del Negocio: UC-008: Registrar Venta de Productos (Efectivo)*
```plantuml
@startuml
skinparam shadowing false
skinparam defaultFontName "Segoe UI"
skinparam ArrowColor #4A5568

actor "Cajero" as Actor
boundary "Vista del POS\n(Next.js)" as Boundary
control "Controlador del POS\n(Laravel)" as Control
control "Procesador de Recetas\n(Servicio)" as Service
entity "Tabla: Venta" as EntVenta
entity "Tabla: Insumo" as EntInsumo
entity "Tabla: MovimientoKardex" as EntKardex

Actor -> Boundary: Selecciona productos del carrito, digita el efectivo y cobra
activate Boundary
Boundary -> Control: Envía los productos del pedido y la modalidad "Efectivo"
activate Control

Control -> EntVenta: Registra la transacción de venta con estado "Pagada"
activate EntVenta
EntVenta --> Control: Confirma registro (Venta Guardada)
deactivate EntVenta

Control -> Service: Solicita procesar el consumo de insumos de la venta
activate Service
Service -> EntInsumo: Descuenta la materia prima del stock actual según las recetas vendidas
activate EntInsumo
EntInsumo --> Service: Confirma stock descontado
deactivate EntInsumo
Service -> EntKardex: Inserta automáticamente las filas de tipo "Salida por Venta"
activate EntKardex
EntKardex --> Service: Confirma historial de Kardex generado
deactivate EntKardex
deactivate Service

Control --> Boundary: Confirma el éxito financiero y operativo de la venta
Boundary --> Actor: Despacha la impresión automática del ticket y limpia el POS
deactivate Control
deactivate Boundary
@enduml
```

#### 3.2.3. Diagrama de Colaboración (vista de diseño)
*Escenario: Registrar Entrada de Insumos.*
```plantuml
@startuml
skinparam style strictuml
object ":Administrador" as Admin
object ":Almacen_UI" as UI
object ":InventarioController" as Ctrl
object ":Insumo" as Insumo
object ":MovimientoKardex" as Kardex

Admin -> UI : 1: Ingresa stock y costo()
UI -> Ctrl : 2: postEntrada()
Ctrl -> Insumo : 3: incrementStock()
Ctrl -> Kardex : 4: insert(Entrada Compra)
Ctrl -> UI : 5: response(OK)
@enduml
```

#### 3.2.4. Diagrama de Objetos
*Instancia de objetos durante una Merma Provisional.*
```plantuml
@startuml
object "solicitud_merma : Merma" as Merma {
  id = 88
  estado = "Pendiente"
  motivo = "Insumo caducado"
}

object "ingrediente : Insumo" as Leche {
  id = 12
  nombre = "Leche Entera"
  stock_actual = 5.0
}

Merma --> Leche : "Referencia"
@enduml
```

#### 3.2.5. Diagrama de Clases
*Modelo de Dominio y Entidades Principales.*
```plantuml
@startuml
class Usuario {
  +id: BIGINT
  +name: VARCHAR
  +email: VARCHAR
  +password: VARCHAR
  +role: ENUM(admin, cajero, cocina)
  +is_active: TINYINT
  +created_at: TIMESTAMP
}

class Categoria {
  +id: BIGINT
  +name: VARCHAR
  +icon: VARCHAR
}

class Producto {
  +id: BIGINT
  +category_id: BIGINT
  +name: VARCHAR
  +price: DECIMAL
  +image_url: VARCHAR
  +is_active: TINYINT
}

class RecetaItem {
  +id: BIGINT
  +product_id: BIGINT
  +ingredient_id: BIGINT
  +quantity: DECIMAL
}

class Insumo {
  +id: BIGINT
  +name: VARCHAR
  +unit: ENUM
  +stock_actual: DECIMAL
  +stock_minimo: DECIMAL
  +fecha_vencimiento: DATE
  +is_active: TINYINT
}

class MovimientoKardex {
  +id: BIGINT
  +ingredient_id: BIGINT
  +user_id: BIGINT
  +type: ENUM
  +quantity: DECIMAL
  +cost_per_unit: DECIMAL
  +reason: VARCHAR
  +status: ENUM
  +approved_by: BIGINT
}

class Venta {
  +id: BIGINT
  +user_id: BIGINT
  +subtotal: DECIMAL
  +tax: DECIMAL
  +total: DECIMAL
  +payment_method: ENUM
  +status: ENUM
  +paypal_order_id: VARCHAR
}

class VentaDetalle {
  +id: BIGINT
  +sale_id: BIGINT
  +product_id: BIGINT
  +quantity: INT
  +unit_price: DECIMAL
  +subtotal: DECIMAL
}

Categoria "1" -- "many" Producto
Producto "1" *-- "many" RecetaItem
RecetaItem "many" -- "1" Insumo
Insumo "1" *-- "many" MovimientoKardex
Usuario "1" -- "many" Venta
Usuario "1" -- "many" MovimientoKardex
Venta "1" *-- "many" VentaDetalle
VentaDetalle "many" -- "1" Producto
@enduml
```

#### 3.2.6. Diagrama de Base de datos (relacional o no relacional)
*Modelo Físico de Datos (MariaDB - eva_cafeteria).*
```plantuml
@startuml
entity "users" {
  * id : BIGINT <<PK>>
  --
  name : VARCHAR(255)
  email : VARCHAR(255) <<UNIQUE>>
  password : VARCHAR(255)
  role : ENUM
  is_active : TINYINT(1)
  remember_token : VARCHAR(100)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "personal_access_tokens" {
  * id : BIGINT <<PK>>
  --
  tokenable_type : VARCHAR(255)
  tokenable_id : BIGINT
  name : VARCHAR(255)
  token : VARCHAR(64) <<UNIQUE>>
  abilities : TEXT
  last_used_at : TIMESTAMP
  expires_at : TIMESTAMP
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "categories" {
  * id : BIGINT <<PK>>
  --
  name : VARCHAR(255)
  icon : VARCHAR(100)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "ingredients" {
  * id : BIGINT <<PK>>
  --
  name : VARCHAR(255)
  unit : ENUM
  stock_actual : DECIMAL(10,3)
  stock_minimo : DECIMAL(10,3)
  fecha_vencimiento : DATE
  is_active : TINYINT(1)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "products" {
  * id : BIGINT <<PK>>
  --
  category_id : BIGINT <<FK>>
  name : VARCHAR(255)
  price : DECIMAL(8,2)
  image_url : VARCHAR(500)
  is_active : TINYINT(1)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "recipe_items" {
  * id : BIGINT <<PK>>
  --
  product_id : BIGINT <<FK>>
  ingredient_id : BIGINT <<FK>>
  quantity : DECIMAL(10,3)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "inventory_movements" {
  * id : BIGINT <<PK>>
  --
  ingredient_id : BIGINT <<FK>>
  user_id : BIGINT <<FK>>
  type : ENUM
  quantity : DECIMAL(10,3)
  cost_per_unit : DECIMAL(10,2)
  reason : VARCHAR(500)
  document_ref : VARCHAR(255)
  status : ENUM
  approved_by : BIGINT <<FK>>
  approved_at : TIMESTAMP
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "sales" {
  * id : BIGINT <<PK>>
  --
  user_id : BIGINT <<FK>>
  subtotal : DECIMAL(10,2)
  tax : DECIMAL(10,2)
  total : DECIMAL(10,2)
  payment_method : ENUM
  status : ENUM
  paypal_order_id : VARCHAR(255)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

entity "sale_items" {
  * id : BIGINT <<PK>>
  --
  sale_id : BIGINT <<FK>>
  product_id : BIGINT <<FK>>
  quantity : INT
  unit_price : DECIMAL(8,2)
  subtotal : DECIMAL(10,2)
  created_at : TIMESTAMP
  updated_at : TIMESTAMP
}

categories ||--o{ products
products ||--o{ recipe_items
ingredients ||--o{ recipe_items
users ||--o{ inventory_movements
ingredients ||--o{ inventory_movements
users ||--o{ sales
sales ||--o{ sale_items
products ||--o{ sale_items
@enduml
```

### 3.3. Vista de Implementación (vista de desarrollo)
#### 3.3.1. Diagrama de arquitectura software (paquetes)
```plantuml
@startuml
package "Frontend Layer" {
  [Next.js App]
}

package "Backend Layer" {
  [Controllers]
  [Services (Lógica)]
  [Eloquent ORM]
}

package "Data Layer" {
  [MySQL/MariaDB]
}

[Next.js App] ..> [Controllers] : API REST
[Controllers] ..> [Services (Lógica)]
[Services (Lógica)] ..> [Eloquent ORM]
[Eloquent ORM] ..> [MySQL/MariaDB]
@enduml
```

#### 3.3.2. Diagrama de arquitectura del sistema (Diagrama de componentes)
```plantuml
@startuml
node "Cliente" {
  component "Next.js UI"
}

node "Servidor" {
  component "Laravel API" {
    component "Sanctum Auth"
    component "Inventory Service"
    component "POS Controller"
  }
}

node "Base de Datos" {
  database "MySQL"
}

"Next.js UI" --> "Laravel API" : HTTPS/JSON
"Laravel API" --> "MySQL" : TCP/3306
@enduml
```

### 3.4. Vista de procesos
#### 3.4.1. Diagrama de Procesos del sistema (diagrama de actividad)
*Flujo del Inventario: Mermas vs Ventas.*
```plantuml
@startuml
start
split
   :Cocina solicita Merma;
   :Administrador revisa bandeja;
   if (¿Aprobar?) then (Sí)
      :Registrar "Salida por Merma";
      :Descontar Insumo;
   else (No)
      :Ignorar solicitud;
   endif
split again
   :Cajero registra Venta;
   :Procesar Pago (Efectivo/PayPal);
   :Registrar "Salida por Venta";
   :Descontar Insumo según Receta;
end split
stop
@enduml
```

### 3.5. Vista de Despliegue (vista física)
#### 3.5.1. Diagrama de despliegue
```plantuml
@startuml
node "PC / Dispositivo Local" <<Device>> {
  artifact "Navegador Web"
  artifact "Ticketera Térmica"
}

node "Servidor en la Nube" <<Server>> {
  node "Contenedor Frontend" {
    artifact "Next.js"
  }
  
  node "Contenedor Backend" {
    artifact "Laravel API"
  }
  
  node "Servidor de BD" {
    database "MariaDB"
  }
}

"Navegador Web" -- "Contenedor Frontend" : HTTPS
"Contenedor Frontend" -- "Contenedor Backend" : HTTP
"Contenedor Backend" -- "Servidor de BD" : TCP
@enduml
```

---

## 4. ATRIBUTOS DE CALIDAD DEL SOFTWARE

### Escenario de Funcionalidad
El sistema garantiza que todas las reglas de negocio críticas se cumplan en el backend. Por ejemplo, una venta o merma siempre registrará un asiento inmutable en el Kardex garantizando la trazabilidad exacta de por qué se disminuyó un stock.

### Escenario de Usabilidad
La interfaz ha sido diseñada para una fácil navegación y aprendizaje. Los módulos están estructurados limpiamente en Next.js, mostrando notificaciones inmediatas ante éxito o error (como "Usuario registrado correctamente" o credenciales inválidas).

### Escenario de Confiabilidad
Mecanismos estrictos implementados en Laravel controlan la transaccionalidad y seguridad. Las validaciones evitan, por ejemplo, que correos repetidos sean registrados, y el uso de Sanctum protege las rutas operativas contra accesos no autorizados.

### Escenario de Rendimiento
Diseñado con Controladores que procesan reglas lógicas mediante `Services` dedicados (ej. `Procesador de Recetas`), permitiendo una velocidad de cálculo de insumos óptima antes de cada cierre de venta, entregando tiempos de respuesta rápidos en el POS.

### Escenario de Mantenibilidad
Al ser un sistema rígidamente dividido entre la capa de presentación visual (Next.js) y la capa de control de datos (Laravel), futuras ampliaciones, como un nuevo proveedor de pago similar a PayPal, requieren solo actualizar el backend sin tocar el cliente visual.

### Otros Escenarios
**Performance:** El sistema minimiza la carga en el servidor haciendo que validaciones livianas de entrada ocurran primero en el cliente de React antes de llamar a Laravel, optimizando el ancho de banda y garantizando fluidez durante el registro de grandes volúmenes de ventas en efectivo.
