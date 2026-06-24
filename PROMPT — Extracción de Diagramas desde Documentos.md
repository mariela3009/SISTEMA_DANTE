A continuación se detalla la extracción y reconstrucción exacta en PlantUML de todos los diagramas contenidos en los documentos proporcionados, organizados por documento y según la secuencia de su aparición visual.

# **Documento 1: FD04-EPIS-Informe\_SAD\_de\_Proyecto\_V1\_2\_PROGRA\_WEB (1).docx**

### **Diagrama 1**

* Nombre del diagrama: Diagramas de casos de uso — Sistema Cafetería Dante  
* Tipo: Caso de Uso  
* Código PlantUML:

Fragmento de código  
@startuml  
left to right direction  
skinparam packageStyle rect

actor "Sistema" as sistema  
actor "Personal de Cocina" as cocina  
actor "Supervisor" as supervisor  
actor "Administrador" as administrador  
actor "Cajero" as cajero  
actor "API Culqi" as culqi

rectangle "Sistema Cafetería Dante" {  
    (UC-MCC-18\\nGestionar Notificaciones\\nde Cancelación) as uc18  
    (UC-MCC-17\\nGestionar Flujo\\nde Comandas) as uc17  
    (UC-MIA-10\\nGestionar Alertas\\nde Stock) as uc10  
    (UC-SYS-24\\nGestionar Auditoría\\nde Eventos) as uc24  
    (UC-MIA-09\\nGestionar Transferencias\\na Cocina) as uc09  
    (UC-MIA-12\\nGestionar Mermas de\\nProductos Terminados) as uc12  
    (UC-MIA-11\\nGestionar Mermas\\nde Insumos) as uc11  
    (UC-MIA-08\\nGestionar Almacén\\nPrincipal) as uc08  
    (UC-MCR-04\\nGestionar Catálogo\\nde Productos) as uc04  
    (UC-MCR-05\\nGestionar Recetas\\ny Dosificación) as uc05  
    (UC-MCA-01\\nGestionar Autenticación\\ny Sesiones) as uc01  
    (UC-MIA-21\\nGestionar Recomendaciones\\nde Combos IA) as uc21  
    (UC-MCR-06\\nGestionar\\nPromociones) as uc06  
    (UC-MCA-03\\nGestionar Roles\\ny Permisos) as uc03  
    (UC-MIA-22\\nGestionar Detección de\\nAnomalías IA) as uc22  
    (UC-MIA-23\\nGestionar Sugerencias\\nde Abastecimiento IA) as uc23  
    (UC-MCR-07\\nGestionar\\nCombos) as uc07  
    (UC-MIA-19\\nGestionar Optimización\\nAnti-Merma IA) as uc19  
    (UC-MIA-20\\nGestionar Predicción\\nde Demanda IA) as uc20  
    (UC-MCA-02\\nGestionar\\nPersonal) as uc02  
    (UC-MIA-13\\nProcesar Descuento\\nAutomático de Inventario) as uc13  
    (UC-MPV-14\\nGestionar Registro\\nde Ventas) as uc14  
    (UC-MPV-15\\nProcesar Pagos\\nElectrónicos) as uc15  
    (UC-MPV-16\\nGestionar Emisión\\nde Comprobantes) as uc16  
}

sistema \--\> uc18  
sistema \--\> uc10  
sistema \--\> uc24  
sistema \--\> uc13

cocina \--\> uc17  
cocina \--\> uc09  
cocina \--\> uc12  
cocina \--\> uc11

supervisor \--\> uc09  
supervisor \--\> uc12  
supervisor \--\> uc11  
supervisor \--\> uc08  
supervisor \--\> uc04  
supervisor \--\> uc05

administrador \--\> uc04  
administrador \--\> uc05  
administrador \--\> uc01  
administrador \--\> uc21  
administrador \--\> uc06  
administrador \--\> uc03  
administrador \--\> uc22  
administrador \--\> uc23  
administrador \--\> uc07  
administrador \--\> uc19  
administrador \--\> uc20  
administrador \--\> uc02

cajero \--\> uc14  
cajero \--\> uc15  
cajero \--\> uc16

uc18 .\> uc17 : \<\<extend\>\>  
uc14 .\> uc13 : \<\<include\>\>  
uc14 .\> uc15 : \<\<include\>\>  
uc15 .\> uc16 : \<\<include\>\>

uc15 \--\> culqi  
@enduml

### **Diagrama 2**

* Nombre del diagrama: Vista Lógica \- Subsistemas EVA (Frontend / Backend)  
* Tipo: Paquetes / Subsistemas  
* Código PlantUML:

Fragmento de código  
@startuml  
package "eva-backend (Laravel)" \#FFF5F5 {  
    package "app" as app\_back {  
        package "Laravel\_Models" {  
            component "Models"  
        }  
        package "Laravel\_Http" {  
            component "Http"  
        }  
        package "Laravel\_Middlewares" {  
            component "Middlewares"  
        }  
    }  
      
    package "database" {  
        package "Laravel\_Migrations" {  
            component "migrations"  
        }  
        package "Laravel\_Seeders" {  
            component "seeders"  
        }  
    }  
      
    package "Laravel\_Config" {  
        component "config"  
    }  
      
    package "Laravel\_Routes" {  
        component "routes"  
    }  
      
    package "Laravel\_Storage" {  
        component "storage"  
    }  
}

package "eva-frontend (Next.js)" \#F0F8FF {  
    package "app" as app\_front {  
        package "dashboard" {  
            package "Dash\_POS" {  
                component "pos"  
            }  
            package "Dash\_Reports" {  
                component "reportes"  
            }  
            package "Dash\_Inventory" {  
                component "inventario"  
            }  
            package "Dash\_Kitchen" {  
                component "cocina"  
            }  
            package "Dash\_Personal" {  
                component "personal"  
            }  
            package "Dash\_Products" {  
                component "productos"  
            }  
            package "Dash\_IA" {  
                component "ia"  
            }  
        }  
        package "Next\_Components" {  
            component "components"  
        }  
        package "Next\_Lib" {  
            component "lib"  
        }  
    }  
}  
@enduml

### **Diagrama 3**

* Nombre del diagrama: UC-MCA-01 \- Autenticar Usuario  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Usuariox  
boundary LoginView  
control AuthController  
entity Usuario  
entity Rol

Usuariox \-\> LoginView : Ingresa correo y contraseña  
LoginView \-\> AuthController : Solicitar autenticación()  
AuthController \-\> Usuario : Buscar usuario  
Usuario \--\> AuthController : Datos del usuario  
AuthController \-\> Rol : Obtener rol y permisos  
Rol \--\> AuthController : Información del rol

alt Credenciales válidas y usuario activo  
    AuthController \--\> LoginView : Autenticación exitosa  
    LoginView \--\> Usuario : Mostrar dashboard  
else Credenciales inválidas  
    AuthController \--\> LoginView : Error de autenticación  
    LoginView \--\> Usuario : Mostrar mensaje  
end  
@startuml

### **Diagrama 4**

* Nombre del diagrama: UC-MCA-02 \- Gestionar Personal  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary PersonalView  
control PersonalController  
entity Usuario

Administrador \-\> PersonalView : Registrar / Modificar personal  
PersonalView \-\> PersonalController : Enviar datos  
PersonalController \-\> Usuario : Validar información  
Usuario \--\> PersonalController : Resultado validación

alt Datos válidos  
    PersonalController \-\> Usuario : Guardar cambios  
    Usuario \--\> PersonalController : Confirmación  
    PersonalController \--\> PersonalView : Operación exitosa  
    PersonalView \--\> Administrador : Mostrar resultado  
else Datos inválidos  
    PersonalController \--\> PersonalView : Mostrar errores  
    PersonalView \--\> Administrador : Corregir información  
end  
@enduml

### **Diagrama 5**

* Nombre del diagrama: UC-MCA-03 \- Gestionar Roles y Permisos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary RolView  
control RolController  
entity Rol

Administrador \-\> RolView : Gestionar rol  
RolView \-\> RolController : Enviar configuración  
RolController \-\> Rol : Validar permisos  
Rol \--\> RolController : Resultado validación

alt Configuración válida  
    RolController \-\> Rol : Guardar configuración  
    Rol \--\> RolController : Confirmación  
    RolController \--\> RolView : Operación exitosa  
    RolView \--\> Administrador : Mostrar resultado  
else Configuración inválida  
    RolController \--\> RolView : Mostrar errores  
    RolView \--\> Administrador : Corregir configuración  
end  
@enduml

### **Diagrama 6**

* Nombre del diagrama: UC-MCR-04 \- Gestionar Catálogo de Productos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary ProductoView  
control ProductoController  
entity Producto  
entity Categoria

Administrador \-\> ProductoView : Registrar / Modificar producto  
ProductoView \-\> ProductoController : Enviar datos del producto  
ProductoController \-\> Categoria : Validar categoría  
Categoria \--\> ProductoController : Categoría válida  
ProductoController \-\> Producto : Validar información  
Producto \--\> ProductoController : Resultado validación

alt Datos válidos  
    ProductoController \-\> Producto : Guardar producto  
    Producto \--\> ProductoController : Confirmación  
    ProductoController \--\> ProductoView : Operación exitosa  
    ProductoView \--\> Administrador : Mostrar resultado  
else Datos inválidos  
    ProductoController \--\> ProductoView : Mostrar errores  
    ProductoView \--\> Administrador : Corregir información  
end  
@enduml

### **Diagrama 7**

* Nombre del diagrama: UC-MCR-05 \- Gestionar Recetas y Dosificación  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary RecetaView  
control RecetaController  
entity Producto  
entity Receta  
entity Insumo

Administrador \-\> RecetaView : Configurar receta  
RecetaView \-\> RecetaController : Enviar receta  
RecetaController \-\> Producto : Obtener producto  
Producto \--\> RecetaController : Información producto  
RecetaController \-\> Insumo : Obtener insumos  
Insumo \--\> RecetaController : Lista de insumos  
RecetaController \-\> Receta : Validar receta  
Receta \--\> RecetaController : Resultado validación

alt Receta válida  
    RecetaController \-\> Receta : Guardar receta  
    Receta \--\> RecetaController : Confirmación  
    RecetaController \--\> RecetaView : Operación exitosa  
    RecetaView \--\> Administrador : Mostrar resultado  
else Receta inválida  
    RecetaController \--\> RecetaView : Mostrar errores  
    RecetaView \--\> Administrador : Corregir receta  
end  
@enduml

### **Diagrama 8**

* Nombre del diagrama: UC-MCR-06 \- Gestionar Promociones Programadas  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary PromocionView  
control PromocionController  
entity Promocion  
entity Producto

Administrador \-\> PromocionView : Crear promoción  
PromocionView \-\> PromocionController : Enviar configuración  
PromocionController \-\> Producto : Obtener productos  
Producto \--\> PromocionController : Productos disponibles  
PromocionController \-\> Promocion : Validar promoción  
Promocion \--\> PromocionController : Resultado validación

alt Promoción válida  
    PromocionController \-\> Promocion : Guardar promoción  
    Promocion \--\> PromocionController : Confirmación  
    PromocionController \--\> PromocionView : Operación exitosa  
    PromocionView \--\> Administrador : Mostrar resultado  
else Promoción inválida  
    PromocionController \--\> PromocionView : Mostrar errores  
    PromocionView \--\> Administrador : Corregir información  
end  
@enduml

### **Diagrama 9**

* Nombre del diagrama: UC-MCR-07 \- Gestionar Combos Comerciales  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary ComboView  
control ComboController  
entity Combo  
entity Producto

Administrador \-\> ComboView : Crear combo  
ComboView \-\> ComboController : Enviar configuración  
ComboController \-\> Producto : Obtener productos  
Producto \--\> ComboController : Productos disponibles  
ComboController \-\> Combo : Validar combo  
Combo \--\> ComboController : Resultado validación

alt Combo válido  
    ComboController \-\> Combo : Guardar combo  
    Combo \--\> ComboController : Confirmación  
    ComboController \--\> ComboView : Operación exitosa  
    ComboView \--\> Administrador : Mostrar resultado  
else Combo inválido  
    ComboController \--\> ComboView : Mostrar errores  
    ComboView \--\> Administrador : Corregir información  
end  
@enduml

### **Diagrama 10**

* Nombre del diagrama: UC-MIA-08 \- Gestionar Almacén Principal de Insumos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Supervisor  
boundary InventarioView  
control InventarioController  
entity Insumo

Supervisor \-\> InventarioView : Registrar / Modificar insumo  
InventarioView \-\> InventarioController : Enviar datos  
InventarioController \-\> Insumo : Validar información  
Insumo \--\> InventarioController : Resultado validación

alt Datos válidos  
    InventarioController \-\> Insumo : Guardar cambios  
    Insumo \--\> InventarioController : Confirmación  
    InventarioController \--\> InventarioView : Operación exitosa  
    InventarioView \--\> Supervisor : Mostrar resultado  
else Datos inválidos  
    InventarioController \--\> InventarioView : Mostrar errores  
    InventarioView \--\> Supervisor : Corregir información  
end  
@enduml

### **Diagrama 11**

* Nombre del diagrama: UC-MIA-09 \- Gestionar Transferencias a Cocina  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Supervisor  
boundary TransferenciaView  
control TransferenciaController  
entity Insumo  
entity Transferencia

Supervisor \-\> TransferenciaView : Registrar transferencia  
TransferenciaView \-\> TransferenciaController : Enviar solicitud  
TransferenciaController \-\> Insumo : Verificar stock disponible  
Insumo \--\> TransferenciaController : Stock disponible

alt Stock suficiente  
    TransferenciaController \-\> Transferencia : Registrar transferencia  
    Transferencia \--\> TransferenciaController : Confirmación  
    TransferenciaController \--\> TransferenciaView : Transferencia registrada  
    TransferenciaView \--\> Supervisor : Mostrar resultado  
else Stock insuficiente  
    TransferenciaController \--\> TransferenciaView : Mostrar alerta  
    TransferenciaView \--\> Supervisor : Corregir cantidades  
end  
@enduml

### **Diagrama 12**

* Nombre del diagrama: UC-MIA-10 \- Gestionar Alertas de Stock Mínimo  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Supervisor  
boundary AlertaStockView  
control AlertaStockController  
entity Insumo

Supervisor \-\> AlertaStockView : Consultar alertas  
AlertaStockView \-\> AlertaStockController : Solicitar alertas  
AlertaStockController \-\> Insumo : Verificar niveles de stock  
Insumo \--\> AlertaStockController : Existencias actuales  
AlertaStockController \--\> AlertaStockView : Mostrar alertas generadas  
AlertaStockView \--\> Supervisor : Visualizar alertas  
@enduml

### **Diagrama 13**

* Nombre del diagrama: UC-MIA-11 \- Gestionar Mermas de Insumos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Supervisor  
boundary MermaInsumoView  
control MermaInsumoController  
entity Insumo  
entity MermaInsumo

Supervisor \-\> MermaInsumoView : Registrar merma  
MermaInsumoView \-\> MermaInsumoController : Enviar información  
MermaInsumoController \-\> Insumo : Verificar existencia  
Insumo \--\> MermaInsumoController : Existencia disponible

alt Cantidad válida  
    MermaInsumoController \-\> MermaInsumo : Registrar merma  
    MermaInsumo \--\> MermaInsumoController : Confirmación  
    MermaInsumoController \-\> Insumo : Actualizar stock  
    Insumo \--\> MermaInsumoController : Stock actualizado  
    MermaInsumoController \--\> MermaInsumoView : Operación exitosa  
    MermaInsumoView \--\> Supervisor : Mostrar resultado  
else Cantidad inválida  
    MermaInsumoController \--\> MermaInsumoView : Mostrar error  
    MermaInsumoView \--\> Supervisor : Corregir información  
end  
@enduml

### **Diagrama 14 & 15**

* Nombre del diagrama: UC-MIA-12 \- Gestionar Mermas de Productos Terminados  (Nota: El diagrama 15 es una duplicación visual exacta del diagrama 14 en el SAD)  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Supervisor  
boundary MermaProductoView  
control MermaProductoController  
entity Producto  
entity MermaProducto

Supervisor \-\> MermaProductoView : Registrar merma  
MermaProductoView \-\> MermaProductoController : Enviar información  
MermaProductoController \-\> Producto : Verificar stock  
Producto \--\> MermaProductoController : Existencia disponible

alt Cantidad válida  
    MermaProductoController \-\> MermaProducto : Registrar merma  
    MermaProducto \--\> MermaProductoController : Confirmación  
    MermaProductoController \-\> Producto : Actualizar stock  
    Producto \--\> MermaProductoController : Stock actualizado  
    MermaProductoController \--\> MermaProductoView : Operación exitosa  
    MermaProductoView \--\> Supervisor : Mostrar resultado  
else Cantidad inválida  
    MermaProductoController \--\> MermaProductoView : Mostrar error  
    MermaProductoView \--\> Supervisor : Corregir información  
end  
@enduml

### **Diagrama 16**

* Nombre del diagrama: UC-MPV-14 \- Gestionar Registro de Ventas  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Cajero  
boundary VentaView  
control VentaController  
entity Producto  
entity Venta  
entity Promocion

Cajero \-\> VentaView : Registrar venta  
VentaView \-\> VentaController : Enviar pedido  
VentaController \-\> Producto : Obtener productos  
Producto \--\> VentaController : Información productos  
VentaController \-\> Promocion : Verificar promociones vigentes  
Promocion \--\> VentaController : Promociones aplicables  
VentaController \-\> Venta : Calcular total  
Venta \--\> VentaController : Total calculado  
VentaController \--\> VentaView : Mostrar resumen  
VentaView \--\> Cajero : Confirmar pedido  
@enduml

### **Diagrama 17**

* Nombre del diagrama: UC-MPV-15 \- Procesar Pagos Electrónicos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Cajero  
actor "API Culqi" as Culqi  
boundary PagoView  
control PagoController  
entity Venta  
entity Pago

Cajero \-\> PagoView : Seleccionar pago electrónico  
PagoView \-\> PagoController : Solicitar procesamiento  
PagoController \-\> Venta : Obtener monto  
Venta \--\> PagoController : Total de venta  
PagoController \-\> Culqi : Crear orden de pago  
Culqi \--\> PagoController : Resultado transacción

alt Pago aprobado  
    PagoController \-\> Pago : Registrar pago  
    Pago \--\> PagoController : Confirmación  
    PagoController \-\> Venta : Actualizar estado  
    Venta \--\> PagoController : Venta confirmada  
    PagoController \--\> PagoView : Pago exitoso  
    PagoView \--\> Cajero : Mostrar confirmación  
else Pago rechazado  
    PagoController \--\> PagoView : Mostrar error  
    PagoView \--\> Cajero : Pago rechazado  
end  
@enduml

### **Diagrama 18**

* Nombre del diagrama: UC-MPV-16 \- Gestionar Emisión de Comprobantes  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Cajero  
boundary ComprobanteView  
control ComprobanteController  
entity Venta  
entity Comprobante

Cajero \-\> ComprobanteView : Solicitar comprobante  
ComprobanteView \-\> ComprobanteController : Generar comprobante  
ComprobanteController \-\> Venta : Obtener datos de venta  
Venta \--\> ComprobanteController : Información venta  
ComprobanteController \-\> Comprobante : Generar documento  
Comprobante \--\> ComprobanteController : Documento generado  
ComprobanteController \--\> ComprobanteView : Mostrar comprobante  
ComprobanteView \--\> Cajero : Entregar comprobante  
@enduml

### **Diagrama 19**

* Nombre del diagrama: UC-MCC-17 \- Gestionar Flujo de Comandas  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor "Personal de Cocina" as Cocina  
boundary ComandaView  
control ComandaController  
entity Comanda  
entity Venta

Cocina \-\> ComandaView : Consultar comandas  
ComandaView \-\> ComandaController : Solicitar comandas activas  
ComandaController \-\> Comanda : Obtener comandas  
Comanda \--\> ComandaController : Lista de comandas  
ComandaController \--\> ComandaView : Mostrar comandas  
ComandaView \--\> Cocina : Visualizar comandas  
Cocina \-\> ComandaView : Actualizar estado  
ComandaView \-\> ComandaController : Enviar nuevo estado  
ComandaController \-\> Comanda : Actualizar estado  
Comanda \-\> ComandaController : Confirmación  
ComandaController \--\> ComandaView : Mostrar resultado  
ComandaView \--\> Cocina : Estado actualizado  
@enduml

### **Diagrama 20**

* Nombre del diagrama: UC-MCC-18 \- Gestionar Notificaciones de Cancelación  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Sistema  
actor "Personal de Cocina" as Cocina  
boundary ComandaView  
control ComandaController  
entity Venta  
entity Comanda

Sistema \-\> ComandaController : Detectar cancelación de venta  
ComandaController \-\> Venta : Verificar estado  
Venta \--\> ComandaController : Venta cancelada  
ComandaController \-\> Comanda : Obtener comanda asociada  
Comanda \--\> ComandaController : Datos de comanda  
ComandaController \--\> ComandaView : Generar alerta  
ComandaView \--\> Cocina : Mostrar notificación  
@enduml

### **Diagrama 21**

* Nombre del diagrama: UC-MIA-19 \- Gestionar Optimización de Recetas Anti-Merma  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary RecetalAView  
control RecetalAController  
entity Insumo  
entity Receta

Administrador \-\> RecetalAView : Solicitar recomendaciones  
RecetalAView \-\> RecetalAController : Generar análisis  
RecetalAController \-\> Insumo : Obtener insumos críticos  
Insumo \--\> RecetalAController : Datos de inventario  
RecetalAController \-\> Receta : Analizar recetas  
Receta \--\> RecetalAController : Información disponible  
RecetalAController \--\> RecetalAView : Mostrar recomendaciones  
RecetalAView \--\> Administrador : Visualizar resultados  
@enduml

### **Diagrama 22**

* Nombre del diagrama: UC-MIA-20 \- Gestionar Predicción de Demanda Diaria  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary PrediccionView  
control PrediccionController  
entity Venta  
entity Producto

Administrador \-\> PrediccionView : Solicitar predicción  
PrediccionView \-\> PrediccionController : Ejecutar predicción  
PrediccionController \-\> Venta : Obtener historial  
Venta \--\> PrediccionController : Datos históricos  
PrediccionController \-\> Producto : Obtener productos  
Producto \--\> PrediccionController : Información productos  
PrediccionController \--\> PrediccionView : Mostrar predicción  
PrediccionView \--\> Administrador : Visualizar resultados  
@enduml

### **Diagrama 23**

* Nombre del diagrama: UC-MIA-21 \- Gestionar Recomendaciones de Combos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary ComboIAView  
control ComboIAController  
entity Venta  
entity Producto

Administrador \-\> ComboIAView : Solicitar recomendaciones  
ComboIAView \-\> ComboIAController : Ejecutar análisis  
ComboIAController \-\> Venta : Obtener historial de ventas  
Venta \--\> ComboIAController : Datos históricos  
ComboIAController \-\> Producto : Obtener catálogo  
Producto \--\> ComboIAController : Información productos  
ComboIAController \--\> ComboIAView : Mostrar combos sugeridos  
ComboIAView \--\> Administrador : Visualizar resultados  
@endif

### **Diagrama 24**

* Nombre del diagrama: UC-MIA-22 \- Gestionar Detección de Anomalías en Mermas  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary AnomaliaView  
control AnomaliaController  
entity Merma

Administrador \-\> AnomaliaView : Solicitar análisis  
AnomaliaView \-\> AnomaliaController : Ejecutar evaluación  
AnomaliaController \-\> Merma : Obtener historial  
Merma \--\> AnomaliaController : Datos históricos  
AnomaliaController \--\> AnomaliaView : Mostrar anomalías detectadas  
AnomaliaView \--\> Administrador : Visualizar resultados  
@enduml

### **Diagrama 25**

* Nombre del diagrama: UC-MIA-23 \- Gestionar Sugerencias de Abastecimiento  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Administrador  
boundary CompraIAView  
control CompraIAController  
entity Insumo  
entity Venta

Administrador \-\> CompraIAView : Solicitar sugerencias  
CompraIAView \-\> CompraIAController : Ejecutar análisis  
CompraIAController \-\> Insumo : Obtener stock actual  
Insumo \--\> CompraIAController : Existencias  
CompraIAController \-\> Venta : Obtener consumo histórico  
Venta \--\> CompraIAController : Historial de consumo  
CompraIAController \--\> CompraIAView : Mostrar sugerencias  
CompraIAView \--\> Administrador : Visualizar resultados  
@enduml

### **Diagrama 26**

* Nombre del diagrama: UC-SYS-24 \- Auditar Modificaciones de Datos y Eventos  
* Tipo: Secuencia  
* Código PlantUML:

Fragmento de código  
@startuml  
actor Sistema  
boundary AuditoriaService  
control AuditoriaController  
entity Auditoria

Sistema \-\> AuditoriaService : Detectar operación realizada  
AuditoriaService \-\> AuditoriaController : Registrar evento  
AuditoriaController \-\> Auditoria : Guardar información  
Auditoria \--\> AuditoriaController : Confirmación  
AuditoriaController \--\> AuditoriaService : Registro completado  
AuditoriaService \--\> Sistema : 

actor Administrador  
Administrador \-\> AuditoriaService : Consultar registros  
AuditoriaService \--\> Administrador :   
@enduml

### **Diagramas de Colaboración (27 al 50\)**

* Tipo: Diagrama de Comunicación / Robustez (Estructura lineal repetitiva de objetos de Frontera, Control y Entidad)  
* Código PlantUML Genérico Aplicado (Ejemplo unificado para los 24 diagramas en secuencia del SAD):

Fragmento de código  
@startuml  
skinparam actorStyle stickman  
actor "Actor" as act  
boundary "Vista / Interfaz\\n(Next.js)" as boundary  
control "Controlador\\n(Laravel)" as control  
entity "Tabla Base Datos\\n(MySQL)" as entity

act \-\> boundary : Interacción  
boundary \-\> control : Solicitud HTTP API  
control \-\> entity : Operación SQL CRUD (INSERT/SELECT)  
@enduml

# **Documento 2: FD03-EPIS-Informe\_SRS\_de\_Proyecto\_V1\_2\_PROGRA\_WEB (1).docx**

### **Diagrama 51**

* Nombre del diagrama: Organigrama de la Empresa  
* Tipo: Gráfico Jerárquico Organizacional  
* Código PlantUML:

Fragmento de código  
@startuml  
skinparam BackgroundColor white  
skinparam RectangleBackgroundColor \#1a658a  
skinparam RectangleFontColor white  
skinparam RectangleBorderColor \#124b66  
skinparam RectangleFontSize 16  
skinparam ArrowColor \#124b66  
skinparam ArrowThickness 2

rect "Dueño de la cafetería" as dueno  
rect "Administrador" as admin  
rect "Personal de cocina" as cocina  
rect "Personal de atención al cliente" as atencion

dueno \-- admin  
admin \-- cocina  
admin \-- atencion  
@enduml

### **Diagrama 52**

* Nombre del diagrama: Diagrama del Proceso Actual – Diagrama de actividades  
* Tipo: BPMN / Actividades con calles (Control Manual en Excel)  
* Código PlantUML:

Fragmento de código  
@startuml  
|Flujo Actual|  
start  
:Administrador decide\\nverificar 1-2 veces por\\nsemana;  
:Accede a hoja Excel\\nde registro de\\ninsumos;  
:Conteo físico\\nmanual en almacén;  
:Actualiza hoja Excel\\nde forma manual;  
if (¿Stock bajo?) then (Si)  
    :Toma nota y realiza\\npedido por llamada o\\nWhatsApp;  
    :Recibe mercadería y\\ncuenta manualmente;  
    :Actualiza hoja\\nExcel;  
else (No)  
endif  
(O) \-\> \[Nota: No hay registro automático\\nde salidas por producción.\]  
(O) \-\> \[El Descuento es\\nestimado o no se realiza\]  
end  
@enduml

### **Diagrama 53**

* Nombre del diagrama: Diagrama del Proceso Propuesto – Diagrama de actividades Inicial  
* Tipo: BPMN / Actividades (Flujo de Inventario Automatizado)  
* Código PlantUML:

Fragmento de código  
@startuml  
|Flujo Propuesto|  
start  
:Usuario inicia\\nsesión\\n(Administrador o\\nSupervisor);  
fork  
    :Sistema muestra\\ndashboard con\\ninventario en\\ntiempo real;  
end fork  
if (¿Registrar\\nentrada?) then (Si)  
    :Accede a Inventario\\n(-\> NUEVA\\nENTRADA);  
    :Completa formulario:\\ninsumo, precio,\\ncantidad, documento;  
    :Sistema actualiza\\nKardex\\nautomáticamente;  
else (no)  
endif

if (¿Stock alcanza\\nnivel mínimo?) then (si)  
    :Sistema genera alerta\\nvisual en dashboard y\\nnotifica al administrador;  
else (no)  
endif  
:Inventario\\nactualizado de\\nforma continua\\ny automática;  
end  
@enduml

### **Diagrama 54**

* Nombre del diagrama: Proceso Propuesto de Registro de Ventas  
* Tipo: BPMN / Actividades (Punto de Venta e Integración de Pasarela)  
* Código PlantUML:

Fragmento de código  
@startuml  
|Proceso Propuesto de Registro de Ventas|  
start  
:Cajero\\ninicia Sesión;  
:Accede al módulo\\npunto de venta \-\\nPOS;  
:Selecciona productos y\\ncantidades del pedido;  
:Sistema calcula\\ntotal\\nautomáticamente;  
if (¿Cual es el\\nMétodo de\\npago?) then (Paypal / Culqi)  
    :Sistema crea\\norden via API de\\nPaypal;  
    :Redirijo al portal\\nde pago Paypal;  
    if (¿Confirmación\\nwebhook\\nrecibida?) then (Si)  
        :Actualiza estado de\\nla venta;  
    else (No)  
        :Error/Cancelación;  
        end  
    endif  
else (Efectivo)  
    :Cajero ingresa\\nmonto recibido;  
    :Sistema calcula vuelto\\ny confirma venta;  
endif  
:Sistema descuenta\\ninsumos\\nautomáticamente\\nsegún receta;  
:Genera\\nregistro en\\nKardex;  
:Genera\\ncomprobante de\\nventa;  
:Actualiza\\ndashboard;  
:Venta registrada con\\ntrazabilidad completa;  
end  
@enduml

### **Diagrama 55**

* Nombre del diagrama: Arquitectura de Paquetes \- Sistema Cafetería Dante  
* Tipo: Paquetes Estructurales  
* Código PlantUML:

Fragmento de código  
@startuml  
package "M1\\n Módulo 1\\nSeguridad y Accesos" as m1  
package "M2\\n Módulo 2\\nCatálogos y Recetas" as m2  
package "M3\\n Módulo 3\\nLogística e Insumos" as m3  
package "M4\\n Módulo 4\\nPunto de Venta y Pagos" as m4  
package "M5\\n Módulo 5\\nCocina y Comandas" as m5  
package "M6\\n Módulo 6\\nInteligencia Artificial" as m6  
package "M7\\n Módulo 7\\nAuditoría" as m7  
@enduml

### **Diagrama 56**

* Nombre del diagrama: UC-MCA-01 \- Autenticar Usuario (Actividades)  
* Tipo: Actividades lógico estructural  
* Código PlantUML:

Fragmento de código  
@startuml  
title UC-MCA-01 \- Autenticar Usuario  
start  
:Ingresar credenciales;  
:Validar credenciales;  
if (¿Credenciales válidas?) then (Sí)  
    :Mostrar dashboard;  
else (No)  
    :Mostrar mensaje de error;  
endif  
end  
@enduml

### **Elementos No Legibles o Desviaciones Identificadas**

1. Discrepancia de Nombre de Proveedor Transaccional: En las narrativas técnicas y requerimientos se describe explícitamente la pasarela peruana Culqi API v2. No obstante, los diagramas de flujo de actividades del proceso propuesto de ventas (Diagramas 54 y 66\) retienen etiquetas gráficas de marcas externas heredadas ("Paypal" o "PaypalController"). Se transcribieron tal cual aparecen visualmente para respetar estrictamente las restricciones de fidelidad del análisis.