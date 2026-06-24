# Plan de Despliegue - Sistema Dante (EVA)

Tras analizar el proyecto, he evaluado su estado actual y diseñado un plan para desplegarlo de forma gratuita.

## 1. Análisis de Preparación (¿Está listo para desplegarse?)

**Actualmente, el proyecto NO está listo para ser desplegado directamente a producción.** Necesita algunas configuraciones clave:

### Problemas encontrados:
*   **Frontend (`eva-frontend`)**:
    *   Las variables de entorno en `.env.local` apuntan a `http://127.0.0.1:8000`. Esto en producción fallará, debe apuntar a la URL del backend desplegado.
*   **Backend (`eva-backend`)**:
    *   El archivo `.env` está configurado para entorno local (`APP_ENV=local`, `APP_DEBUG=true`). Esto expone información sensible en caso de errores.
    *   La base de datos apunta a `127.0.0.1` con el usuario `root` y sin contraseña.
    *   La configuración de CORS (`config/cors.php`) permite `localhost` pero necesitará permitir la URL final de producción del frontend.
*   **Base de Datos**:
    *   Como mencionaste, la base de datos no está alojada en ningún servidor.
*   **Módulo AI (`eva-ai`)**:
    *   Es un script de Python independiente (`sync_ai.py`). Necesitará su propio entorno de ejecución o integrarse de alguna forma para que se ejecute periódicamente o como servicio.

---

## 2. Recomendación de Stack Gratuito

Para desplegar este sistema sin costo, te recomiendo la siguiente arquitectura:

| Componente | Tecnología | Proveedor Recomendado (Capa Gratuita) | Alternativa |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js | **Vercel** (Ideal para Next.js, fácil y muy rápido) | Netlify, Render |
| **Backend** | Laravel (PHP) | **Render** (Web Service gratuito) | Railway, Fly.io |
| **Base de Datos**| MySQL | **Aiven** (Ofrece un plan gratuito de MySQL) o **TiDB Serverless** | Railway (Trial) |
| **Módulo AI** | Python | **Render** (Background worker) o **PythonAnywhere** (Cron jobs) | Railway |

> [!TIP]
> **Sobre la Base de Datos:** Los proveedores de MySQL gratuitos son limitados hoy en día. Si Laravel está usando migraciones estándar, sería **muy fácil cambiar a PostgreSQL**, para lo cual existen excelentes opciones gratuitas como **Supabase** o **Neon**.

---

## 3. Plan de Acción (Pasos para desplegar)

Para desplegar el proyecto, seguiremos estos pasos:

### Paso 1: Preparar y Desplegar la Base de Datos
1. Crear una cuenta en **Aiven** (para MySQL) o **Supabase** (si cambiamos a PostgreSQL).
2. Crear una nueva base de datos.
3. Obtener las credenciales (Host, Puerto, Usuario, Contraseña, Nombre de BD).
4. Ejecutar el script SQL (`EVA_BDdef.sql`) en la base de datos remota utilizando una herramienta como DBeaver, MySQL Workbench, o desde la consola del proveedor.

### Paso 2: Preparar y Desplegar el Backend (Laravel en Render)
1. Modificar el código:
   * Asegurarnos de que las dependencias en `composer.json` estén correctas.
   * Crear un archivo `render.yaml` o script de inicio para que Render sepa cómo ejecutar Laravel (instalar dependencias, generar key, ejecutar migraciones/caché).
2. Subir el repositorio a GitHub.
3. Conectar Render con GitHub y crear un nuevo "Web Service".
4. Configurar las **Variables de Entorno** en Render:
   * `APP_ENV=production`
   * `APP_DEBUG=false`
   * `APP_KEY=...` (La key actual o generar una nueva)
   * `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (Credenciales del Paso 1)
   * `FRONTEND_URL` (La asignaremos en el Paso 3)
   * Credenciales de Gemini, Culqi, etc.

### Paso 3: Preparar y Desplegar el Frontend (Next.js en Vercel)
1. Modificar el código:
   * Asegurarnos de que no haya errores de TypeScript o ESLint que bloqueen el build (`npm run build`).
2. Conectar Vercel con el repositorio de GitHub.
3. Vercel detectará automáticamente que es un proyecto Next.js.
4. Configurar las **Variables de Entorno** en Vercel:
   * `NEXT_PUBLIC_API_URL` = La URL pública que Render nos dio para el Backend (Ej: `https://eva-backend-xxx.onrender.com`).
   * `NEXT_PUBLIC_CULQI_PUBLIC_KEY` = Tu llave de Culqi.
5. Vercel nos dará una URL (Ej: `https://eva-frontend.vercel.app`).
6. **Volver al Backend (Render)** y actualizar la variable `FRONTEND_URL` con la URL de Vercel para solucionar los problemas de CORS.

### Paso 4: Desplegar el Módulo AI (`eva-ai`)
1. Crear un "Background Worker" en Render o usar PythonAnywhere.
2. Configurar las variables de entorno para que el script se conecte a la base de datos remota (Paso 1).

## Open Questions

Para poder ayudarte a ejecutar este plan, necesito que me confirmes lo siguiente:

1. **Base de Datos:** ¿Prefieres mantener MySQL (usando un servicio como Aiven/TiDB) o estás abierto a cambiar la configuración a PostgreSQL (usando Supabase/Neon que suelen ser más generosos)?
2. **Cuentas:** ¿Tienes ya cuenta en GitHub, Vercel y Render, o procederás a crearlas?
3. **Repositorio:** ¿El código ya está en un repositorio de GitHub (es necesario para la mayoría de estos servicios gratuitos)?

Por favor revisa el plan. Si estás de acuerdo, podemos empezar a preparar el código inmediatamente (ej. configurando los archivos necesarios para Render).
