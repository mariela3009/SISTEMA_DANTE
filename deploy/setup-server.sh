#!/bin/bash
# ============================================================
# 🔧 SETUP SERVIDOR — Sistema DANTE (Cafetería EVA)
# ============================================================
# VPS: Debian 12 — Elastika
# Ejecutar como root: bash setup-server.sh
# Este script se ejecuta UNA SOLA VEZ en el servidor nuevo
# ============================================================

set -e  # Detener si hay errores

echo ""
echo "============================================"
echo "  🔧 SETUP SERVIDOR — Sistema DANTE"
echo "  VPS Debian 12 — Elastika"
echo "============================================"
echo ""

# ─── 1. Actualizar sistema ───
echo "📦 [1/7] Actualizando sistema operativo..."
apt update && apt upgrade -y

# ─── 2. Instalar Nginx ───
echo "🌐 [2/7] Instalando Nginx..."
apt install -y nginx curl git unzip wget software-properties-common cron

# ─── 3. Instalar PHP 8.2 ───
echo "🐘 [3/7] Instalando PHP 8.2 y extensiones..."
# En Debian 12, PHP 8.2 está disponible en los repos por defecto
apt install -y php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml \
    php8.2-bcmath php8.2-curl php8.2-zip php8.2-gd php8.2-tokenizer \
    php8.2-cli php8.2-common

# ─── 4. Instalar Composer ───
echo "🎼 [4/7] Instalando Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    echo "   ✅ Composer instalado"
else
    echo "   ⏭️  Composer ya está instalado"
fi

# ─── 5. Instalar Node.js 20 LTS ───
echo "🟢 [5/7] Instalando Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "   ✅ Node.js $(node -v) instalado"
else
    echo "   ⏭️  Node.js $(node -v) ya está instalado"
fi

# ─── 6. Instalar PM2 ───
echo "⚙️  [6/7] Instalando PM2 (gestor de procesos)..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "   ✅ PM2 instalado"
else
    echo "   ⏭️  PM2 ya está instalado"
fi

# ─── 7. Instalar Python3 y venv ───
echo "🐍 [7/7] Instalando Python3..."
apt install -y python3 python3-pip python3-venv

# ─── Crear directorio de la aplicación ───
echo ""
echo "📁 Creando directorio de la aplicación..."
mkdir -p /var/www/html/sistema-dante

# ─── Descargar certificado CA de Aiven ───
echo ""
echo "🔐 Preparando SSL para Aiven..."
echo "   ⚠️  IMPORTANTE: Necesitas descargar el certificado CA desde tu panel de Aiven."
echo "   📋 Pasos:"
echo "      1. Ve a https://console.aiven.io"
echo "      2. Selecciona tu servicio MySQL"
echo "      3. En 'Overview', busca 'CA Certificate' y descárgalo"
echo "      4. Súbelo al servidor como: /etc/ssl/certs/aiven-ca.pem"
echo "      Comando para subirlo desde tu PC:"
echo "      scp ca.pem root@161.132.68.76:/etc/ssl/certs/aiven-ca.pem"
echo ""

# ─── Resumen ───
echo "============================================"
echo "  ✅ SETUP COMPLETO"
echo "============================================"
echo ""
echo "  Versiones instaladas:"
echo "  • PHP:      $(php -v | head -1)"
echo "  • Composer: $(composer --version 2>/dev/null | head -1)"
echo "  • Node.js:  $(node -v)"
echo "  • NPM:      $(npm -v)"
echo "  • PM2:      $(pm2 -v)"
echo "  • Nginx:    $(nginx -v 2>&1)"
echo "  • Python:   $(python3 --version)"
echo ""
echo "  📌 SIGUIENTE PASO:"
echo "  1. Sube el proyecto a /var/www/sistema-dante/"
echo "  2. Sube el certificado CA de Aiven"
echo "  3. Ejecuta: bash /var/www/sistema-dante/deploy/deploy-app.sh"
echo ""
