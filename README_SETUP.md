# 🚀 EVA — Guía de Instalación y Configuración

Sistema de gestión para Cafetería Dante.  
Stack: **Laravel (PHP)** + **Next.js (TypeScript)** + **MySQL** + **Python (IA)**

---

## ✅ Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| PHP | 8.1+ |
| Composer | 2.x |
| Node.js | 18+ |
| MySQL | 8.0 (XAMPP incluye MySQL) |
| Python | 3.9+ |

> Si usas **XAMPP**, MySQL está en `C:\xampp\mysql\bin\mysql.exe`

---

## 📋 Pasos de instalación (solo la primera vez)

### 1. Iniciar MySQL (XAMPP)
Abre el panel de XAMPP y pon en marcha el servicio **MySQL**.

---

### 2. Importar la base de datos

En PowerShell el operador `<` no funciona. Usa `cmd` con `chcp 65001` para garantizar que los caracteres especiales (tildes, ñ) se importen correctamente:

```powershell
cmd /c "chcp 65001 && C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 eva_db < ""EVA_BDdef.sql"""
```

---

### 3. Cargar datos de prueba

```powershell
cmd /c "chcp 65001 && C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 eva_db < ""eva_datos_seed.sql"""
```

---

### 4. Backend — Laravel

```powershell
cd eva-backend

# Instalar dependencias PHP
composer install

# Copiar archivo de entorno (si no existe)
copy .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Correr migraciones (crea las tablas y usuarios)
php artisan migrate --seed
```

> ⚠️ Si `migrate --seed` da error porque las tablas ya existen, usa:
> ```powershell
> php artisan migrate:fresh --seed
> ```

---

### 5. Resetear contraseñas de usuarios (si es necesario)

Si los usuarios ya existen pero la contraseña no funciona, resetéalas con:

```powershell
php artisan tinker --execute="
App\Models\User::where('email','admin@cafeteriadante.com')->update(['password' => bcrypt('admin123')]);
App\Models\User::where('email','cajero@cafeteriadante.com')->update(['password' => bcrypt('cajero123')]);
App\Models\User::where('email','cocina@cafeteriadante.com')->update(['password' => bcrypt('cocina123')]);
echo 'Passwords actualizadas';
"
```

---

### 6. Frontend — Next.js

```powershell
cd eva-frontend

# Instalar dependencias JS
npm install
```

---

### 7. Servicio IA — Python

```powershell
cd eva-ai

# Instalar dependencias Python
pip install -r requirements.txt
```

---

## ▶️ Correr el proyecto (cada vez)

Abre **3 terminales separadas**:

### Terminal 1 — Backend (Laravel)
```powershell
cd eva-backend
php artisan serve
```
> Disponible en: http://127.0.0.1:8000

### Terminal 2 — Frontend (Next.js)
```powershell
cd eva-frontend
npm run dev
```
> Disponible en: http://localhost:3000

### Terminal 3 — IA (opcional)
```powershell
cd eva-ai
python sync_ai.py
```

---

## 🔐 Credenciales de acceso

| Rol | Email | Contraseña |
|---|---|---|
| 👑 Admin | admin@cafeteriadante.com | admin123 |
| 💰 Cajero | cajero@cafeteriadante.com | cajero123 |
| 🍳 Cocina | cocina@cafeteriadante.com | cocina123 |

---

## 🐛 Problemas comunes

### ❌ `mysql` no se reconoce en PowerShell
PowerShell no tiene MySQL en el PATH. Usa la ruta completa:
```powershell
C:\xampp\mysql\bin\mysql.exe -u root eva_db -e "SHOW TABLES;"
```

### ❌ El operador `<` no funciona en PowerShell
Reemplaza `mysql ... < archivo.sql` por:
```powershell
Get-Content "archivo.sql" | C:\xampp\mysql\bin\mysql.exe -u root
```

### ❌ `ModuleNotFoundError: No module named 'mysql'`
```powershell
pip install -r eva-ai/requirements.txt
```

### ❌ Error 401 en el dashboard
El backend no está corriendo o no has iniciado sesión. Verifica que `php artisan serve` esté activo y haz login en http://localhost:3000.

### ❌ Las credenciales son incorrectas
Ejecuta el paso 5 (resetear contraseñas) de esta guía.
