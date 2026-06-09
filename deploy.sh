#!/bin/bash
#
# AI Freedom Studios — Duane
# One-command Hostinger VPS deployment script
#
# Usage: ./deploy.sh
#
# This script will:
#   1. Install Node.js 20 (if missing)
#   2. Install nginx (if missing)
#   3. Build the app (npm install && npm run build)
#   4. Deploy the built files to /opt/aifreedomstudios
#   5. Configure nginx
#   6. Provision an SSL certificate with certbot
#
set -e

APP_NAME="aifreedomstudios"
APP_DIR="/opt/${APP_NAME}"
DOMAIN="aifreedomstudios.com"
WWW_DOMAIN="www.aifreedomstudios.com"
EMAIL="admin@aifreedomstudios.com"

echo "=========================================="
echo "  AI Freedom Studios — VPS Deployment"
echo "=========================================="

# --- Require root ---------------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root (use sudo)." >&2
  exit 1
fi

# --- 1. Install Node.js 20 (if missing) -----------------------------------
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 20 ]; then
  echo "==> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "==> Node.js $(node -v) already installed."
fi

# --- 2. Install nginx (if missing) ----------------------------------------
if ! command -v nginx >/dev/null 2>&1; then
  echo "==> Installing nginx..."
  apt-get update
  apt-get install -y nginx
else
  echo "==> nginx already installed."
fi

# --- 3. Build the app -----------------------------------------------------
echo "==> Installing dependencies..."
npm install

echo "==> Building production bundle..."
npm run build

# --- 4. Deploy built files ------------------------------------------------
echo "==> Deploying to ${APP_DIR}..."
mkdir -p "${APP_DIR}"
rm -rf "${APP_DIR}/dist"
cp -r dist "${APP_DIR}/dist"

# --- 5. Configure nginx ---------------------------------------------------
echo "==> Configuring nginx..."
cp nginx.conf "/etc/nginx/sites-available/${APP_NAME}.conf"
ln -sf "/etc/nginx/sites-available/${APP_NAME}.conf" "/etc/nginx/sites-enabled/${APP_NAME}.conf"

# Remove the default site if present
rm -f /etc/nginx/sites-enabled/default

echo "==> Testing nginx configuration..."
nginx -t

echo "==> Reloading nginx..."
systemctl reload nginx

# --- 6. SSL with certbot --------------------------------------------------
if ! command -v certbot >/dev/null 2>&1; then
  echo "==> Installing certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

echo "==> Requesting SSL certificate via certbot..."
certbot --nginx \
  -d "${DOMAIN}" \
  -d "${WWW_DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --redirect \
  -m "${EMAIL}" || echo "WARNING: certbot step failed — verify DNS points to this server, then re-run: certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}"

# --- Done -----------------------------------------------------------------
echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  Visit: https://${DOMAIN}"
echo "=========================================="
