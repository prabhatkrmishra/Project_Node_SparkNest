#!/usr/bin/env bash
# One-time VPS bootstrap for the native SparkNest deployment.
# Run on the VPS from the repository root, as the deployment user.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ROOT="${APP_ROOT:-/home/pkm/apps/sparknest}"
PUBLIC_ROOT="${PUBLIC_ROOT:-/var/www/sparknest}"
DOMAIN="${DOMAIN:-sparknest.pkmprojects.online}"
NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
DB_NAME="${DB_NAME:-sparknest}"
DB_USER="${DB_USER:-sparknest}"

if [ -z "$NODE_BIN" ] || [ ! -x "$NODE_BIN" ]; then
  echo "Node.js is required. Set NODE_BIN to a Node 20+ executable." >&2
  exit 1
fi

if ! sudo -n true 2>/dev/null; then
  echo "Passwordless sudo is required for nginx and service setup." >&2
  exit 1
fi

mkdir -p "$APP_ROOT"/{releases,shared,logs,data}
chmod 700 "$APP_ROOT/shared"
sudo install -d -m 0755 "$PUBLIC_ROOT" /etc/nginx/sites-available /etc/nginx/sites-enabled

if [ ! -f "$APP_ROOT/shared/.env" ]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  SESSION_SECRET="$(openssl rand -hex 32)"

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}'"
  else
    sudo -u postgres psql -c "ALTER ROLE ${DB_USER} PASSWORD '${DB_PASSWORD}'"
  fi

  if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
  fi

  umask 077
  cat > "$APP_ROOT/shared/.env" <<EOF
NODE_ENV=production
SERVER_HOSTNAME=127.0.0.1
SERVER_PORT=3100
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}
SESSION_SECRET=${SESSION_SECRET}
PASSWORD_SALTROUNDS=10
SECURE_COOKIE=true
HTTP_ONLY=true
SAME_SITE=lax
FRONTEND_ADDRESS=https://${DOMAIN}
BACKEND_ADDRESS=https://${DOMAIN}/api
DATA_ROOT=${APP_ROOT}/shared/data
LOG_LEVEL=info
EOF
  echo "Created $APP_ROOT/shared/.env and database role."
else
  echo "Keeping existing $APP_ROOT/shared/.env"
fi

sudo install -m 0644 "$REPO_ROOT/deploy/nginx/sparknest.conf" /etc/nginx/sites-available/sparknest
sudo ln -sfn /etc/nginx/sites-available/sparknest /etc/nginx/sites-enabled/sparknest

UNIT_TMP="$(mktemp)"
sed -e "s#__APP_ROOT__#${APP_ROOT}#g" -e "s#__NODE_BIN__#${NODE_BIN}#g" \
  "$REPO_ROOT/deploy/systemd/sparknest-api.service" > "$UNIT_TMP"
sudo install -m 0644 "$UNIT_TMP" /etc/systemd/system/sparknest-api.service
rm -f "$UNIT_TMP"

sudo nginx -t
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx
sudo systemctl daemon-reload
sudo systemctl enable sparknest-api.service

echo "Bootstrap complete. Next: run scripts/deploy.sh after building the client."
