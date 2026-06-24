#!/bin/bash
# ============================================================
# 🚀 DEPLOY APP — Sistema DANTE (Cafetería EVA)
# ============================================================
# Ejecutar como root: bash deploy-app.sh
# Se puede ejecutar múltiples veces para re-desplegar
# ============================================================

set -e

APP_DIR="/var/www/html/sistema-dante"

echo ""
echo "============================================"
echo "  🚀 DESPLEGANDO Sistema DANTE"
echo "============================================"
echo ""

# ─── Verificar que el proyecto existe ───
if [ ! -d "$APP_DIR/eva-backend" ]; then
    echo "❌ ERROR: No se encontró el proyecto en $APP_DIR"
    echo "   Primero sube el proyecto con:"
    echo "   scp -r ./SISTEMA_DANTE-RevisandoAndo/* root@161.132.68.76:/var/www/html/sistema-dante/"
    exit 1
fi

# ─── Verificar certificado SSL de Aiven ───
if [ ! -f "/etc/ssl/certs/aiven-ca.pem" ]; then
    echo "⚠️  ADVERTENCIA: No se encontró el certificado CA de Aiven"
    echo "   La conexión a la base de datos podría fallar."
    echo "   Descárgalo de tu panel de Aiven y súbelo a:"
    echo "   /etc/ssl/certs/aiven-ca.pem"
    echo ""
    read -p "   ¿Deseas continuar sin SSL? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# ═══════════════════════════════════════════
# BACKEND (Laravel)
# ═══════════════════════════════════════════
echo ""
echo "🔧 [1/4] Configurando Backend (Laravel)..."
cd $APP_DIR/eva-backend

# Instalar dependencias PHP
echo "   📦 Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader --no-interaction

# Permisos
echo "   🔑 Configurando permisos..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Storage link (para imágenes)
php artisan storage:link 2>/dev/null || true

# Cache de configuración
echo "   ⚡ Cacheando configuración..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "   ✅ Backend configurado"

# ═══════════════════════════════════════════
# FRONTEND (Next.js)
# ═══════════════════════════════════════════
echo ""
echo "🎨 [2/4] Configurando Frontend (Next.js)..."
cd $APP_DIR/eva-frontend

echo "   📦 Instalando dependencias de Node.js..."
npm ci

echo "   🏗️  Compilando para producción (esto puede tardar ~2-3 min)..."
npm run build

# Copiar archivos estáticos al directorio standalone
if [ -d ".next/standalone" ]; then
    cp -r public .next/standalone/ 2>/dev/null || true
    cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
    echo "   ✅ Frontend compilado (standalone)"
else
    echo "   ⚠️  standalone no generado, se usará 'npm start'"
fi

# ═══════════════════════════════════════════
# AI MODULE (Python)
# ═══════════════════════════════════════════
echo ""
echo "🤖 [3/4] Configurando módulo de IA..."
cd $APP_DIR/eva-ai

python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt --quiet
deactivate

echo "   ✅ Módulo IA configurado"

# ═══════════════════════════════════════════
# NGINX + PM2
# ═══════════════════════════════════════════
echo ""
echo "🌐 [4/4] Configurando Nginx y PM2..."

# Copiar configuración de Nginx
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/dante-cafeteria
ln -sf /etc/nginx/sites-available/dante-cafeteria /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
echo "   🔍 Verificando configuración Nginx..."
nginx -t

# Recargar Nginx
systemctl reload nginx
echo "   ✅ Nginx configurado y recargado"

# ─── PM2: Detener procesos anteriores si existen ───
pm2 delete eva-backend 2>/dev/null || true
pm2 delete eva-frontend 2>/dev/null || true

# ─── PM2: Iniciar Backend ───
echo "   ⚙️  Iniciando Backend con PM2..."
cd $APP_DIR/eva-backend
pm2 start "php artisan serve --host=127.0.0.1 --port=8000" --name "eva-backend" --cwd $APP_DIR/eva-backend

# ─── PM2: Iniciar Frontend ───
echo "   ⚙️  Iniciando Frontend con PM2..."
cd $APP_DIR/eva-frontend
if [ -d ".next/standalone" ]; then
    pm2 start ".next/standalone/server.js" --name "eva-frontend" --cwd $APP_DIR/eva-frontend
else
    pm2 start "npm start" --name "eva-frontend" --cwd $APP_DIR/eva-frontend
fi

# ─── PM2: Auto-inicio al reiniciar servidor ───
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ─── CRON: Módulo de IA cada 6 horas ───
echo "   ⏰ Configurando cron job para IA (cada 6 horas)..."
CRON_CMD="cd $APP_DIR/eva-ai && source venv/bin/activate && python sync_ai.py >> /var/log/eva-ai-sync.log 2>&1"
# Eliminar cron anterior si existe y agregar nuevo
(crontab -l 2>/dev/null | grep -v "sync_ai.py"; echo "0 */6 * * * $CRON_CMD") | crontab -

# ═══════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════
echo ""
echo "============================================"
echo "  ✅ ¡DESPLIEGUE COMPLETADO!"
echo "============================================"
echo ""
echo "  🌐 URL: http://dante-cafeteria-eva.online"
echo "  📡 IP:  http://161.132.68.76"
echo ""
echo "  📋 Estado de los servicios:"
pm2 status
echo ""
echo "  🔧 Comandos útiles:"
echo "  ┌──────────────────────────────────────────────┐"
echo "  │ pm2 status           → Ver estado servicios  │"
echo "  │ pm2 logs             → Ver logs en vivo       │"
echo "  │ pm2 logs eva-backend → Solo logs backend      │"
echo "  │ pm2 restart all      → Reiniciar todo         │"
echo "  │ nginx -t && systemctl reload nginx            │"
echo "  └──────────────────────────────────────────────┘"
echo ""
echo "  🔒 Para activar HTTPS (opcional, gratis):"
echo "  apt install -y certbot python3-certbot-nginx"
echo "  certbot --nginx -d dante-cafeteria-eva.online -d www.dante-cafeteria-eva.online"
echo ""
