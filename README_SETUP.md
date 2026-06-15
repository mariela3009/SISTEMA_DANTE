# 🚀 EVA — Guía de Instalación y Configuración para Nueva PC

Sistema de gestión para Cafetería Dante.  
Stack: **Laravel (PHP)** + **Next.js (TypeScript)** + **MySQL**

Esta guía está diseñada específicamente para trasladar y arrancar el sistema en una computadora nueva llevando los archivos en un USB o descargándolos directamente.

---

## ✅ 1. Requisitos Previos en la nueva PC

Debes asegurarte de tener instalados estos programas en la computadora nueva:
1. **XAMPP** (Asegúrate de instalar la versión que incluye **PHP 8.2** o superior).
2. **Composer** (El instalador te pedirá la ruta de PHP, que suele ser `C:\xampp\php\php.exe`).
3. **Node.js** (Instala la versión recomendada LTS, que suele ser la 18+ o 20+).
4. **HeidiSQL** (Opcional, pero recomendado para importar tu base de datos fácilmente, XAMPP también trae phpMyAdmin).

---

## 📁 2. Copia de Archivos y Credenciales

1. Copia toda la carpeta del proyecto `SISTEMA_DANTE` a la nueva PC.
2. Si el proyecto lo descargaste de GitHub en vez de usar un USB, notarás que faltan dos archivos importantes (las credenciales). Debes copiarlos manualmente desde tu USB a sus respectivas carpetas:
   - Copia tu archivo **`.env`** y pégalo dentro de la carpeta `eva-backend`.
   - Copia tu archivo **`.env.local`** y pégalo dentro de la carpeta `eva-frontend`.
   
*(Estos archivos contienen las contraseñas y las llaves secretas de Culqi y la IA Gemini, sin ellos el sistema no funcionará).*

---

## 💾 3. Restaurar la Base de Datos

1. Abre **XAMPP** y dale a "Start" a **MySQL** y **Apache**.
2. Abre **HeidiSQL** (o phpMyAdmin en `http://localhost/phpmyadmin`).
3. Crea una base de datos nueva y llámala exactamente: **`eva_db`**.
4. Importa el archivo `.sql` que exportaste de tu base de datos completa. En HeidiSQL esto se hace yendo a *Archivo > Cargar archivo SQL*, seleccionas tu archivo y luego presionas *Ejecutar* (el botón azul de "play" o F9).

---

## ⚙️ 4. Instalar Dependencias (Solo la primera vez)

Como los módulos y librerías son pesados, no se suelen llevar en el USB, por lo que debes instalarlos:

Abre una terminal (PowerShell o CMD) y ve a la carpeta del backend:
```powershell
cd ruta\a\tu\carpeta\SISTEMA_DANTE\eva-backend

# Instalar dependencias de PHP
composer install
```

Luego abre otra terminal y ve a la carpeta del frontend:
```powershell
cd ruta\a\tu\carpeta\SISTEMA_DANTE\eva-frontend

# Instalar dependencias de JavaScript
npm install
```

---

## ▶️ 5. Correr el Proyecto (Cada vez que lo uses)

Abre **XAMPP** y asegúrate de que **MySQL** esté en verde ("Start").

Abre **2 terminales separadas** (una para el servidor de fondo y otra para la interfaz).

### Terminal 1 — Backend (Laravel)
```powershell
cd ruta\a\tu\carpeta\SISTEMA_DANTE\eva-backend
php artisan serve
```
*(No cierres esta ventana)*

### Terminal 2 — Frontend (Next.js)
```powershell
cd ruta\a\tu\carpeta\SISTEMA_DANTE\eva-frontend
npm run dev
```
*(No cierres esta ventana)*

---

## 🌐 6. Acceder al Sistema

Una vez que ambos servidores estén corriendo, abre tu navegador (Chrome o Edge) e ingresa a:
👉 **http://localhost:3000**

### 🔐 Credenciales de acceso (Ejemplos por defecto si no cambiaste tu BD)
| Rol | Email | Contraseña |
|---|---|---|
| 👑 Admin | admin@cafeteriadante.com | admin123 |
| 💰 Cajero | cajero@cafeteriadante.com | cajero123 |
| 🍳 Cocina | cocina@cafeteriadante.com | cocina123 |
