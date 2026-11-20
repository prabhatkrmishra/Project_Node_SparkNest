#!/usr/bin/env bash
# Deploy a built checkout on the VPS. Intended to run from CI on the host.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/home/pkm/apps/sparknest}"
PUBLIC_ROOT="${PUBLIC_ROOT:-/var/www/sparknest}"
SERVICE_NAME="${SERVICE_NAME:-sparknest-api}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
SOURCE_DIR="${SOURCE_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ENV_FILE="$APP_ROOT/shared/.env"
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || die "missing $ENV_FILE; run scripts/bootstrap-vps.sh first"
[ -f "$SOURCE_DIR/client/dist/index.html" ] || die "client/dist missing; build the client first"
[ -d "$SOURCE_DIR/node_modules" ] || die "node_modules missing; run npm ci first"
sudo -n true 2>/dev/null || die "passwordless sudo is required"

NODE_BIN="${NODE_BIN:-$(command -v node || true)}"
APP_NODE_BIN="$APP_ROOT/shared/bin/node"

[ -n "$NODE_BIN" ] && [ -x "$NODE_BIN" ] || die "node is required; set NODE_BIN to a Node 20.18+ executable"
NODE_BIN="$(readlink -f "$NODE_BIN")"
NODE_VERSION="$("$NODE_BIN" -p "process.versions.node")"
NODE_MAJOR="${NODE_VERSION%%.*}"
[ "$NODE_MAJOR" -ge 20 ] || die "Node 20.18+ is required (found $NODE_VERSION)"

STAMP="$(date -u +%Y%m%d%H%M%S)-$(git -C "$SOURCE_DIR" rev-parse --short HEAD 2>/dev/null || echo local)"
RELEASE_DIR="$RELEASES_DIR/$STAMP"
mkdir -p "$RELEASE_DIR"

log "Using Node $NODE_VERSION"
log "Staging release $STAMP"
rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'client/dist' \
  --exclude 'data' \
  --exclude 'server/uploads' \
  --exclude '.env' \
  --exclude '.env.*' \
  "$SOURCE_DIR/" "$RELEASE_DIR/"

# Reuse the exact dependency tree that was tested and built in CI.
if cp -al "$SOURCE_DIR/node_modules" "$RELEASE_DIR/node_modules" 2>/dev/null; then
  log "Linked node_modules (hardlinks)"
else
  log "Hardlink copy unavailable; copying node_modules"
  cp -a "$SOURCE_DIR/node_modules" "$RELEASE_DIR/node_modules"
fi

# Keep the service independent of nvm and the Actions tool cache. Those
# directories are replaced when Node is upgraded or the runner is updated.
install -d -m 0755 "$(dirname "$APP_NODE_BIN")"
if [ ! -x "$APP_NODE_BIN" ] || ! cmp -s "$NODE_BIN" "$APP_NODE_BIN"; then
  log "Installing stable Node runtime at $APP_NODE_BIN"
  install -m 0755 "$NODE_BIN" "$APP_NODE_BIN.tmp"
  mv -f "$APP_NODE_BIN.tmp" "$APP_NODE_BIN"
fi

UNIT_TMP="$(mktemp)"
trap 'rm -f "$UNIT_TMP"' EXIT
sed -e "s#__APP_ROOT__#${APP_ROOT}#g" -e "s#__NODE_BIN__#${APP_NODE_BIN}#g" \
  "$SOURCE_DIR/deploy/systemd/sparknest-api.service" > "$UNIT_TMP"
if ! sudo cmp -s "$UNIT_TMP" /etc/systemd/system/sparknest-api.service; then
  log "Installing systemd unit"
  sudo install -m 0644 "$UNIT_TMP" /etc/systemd/system/sparknest-api.service
  sudo systemctl daemon-reload
fi

sudo systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null || sudo systemctl enable "$SERVICE_NAME" >/dev/null

log "Publishing frontend assets"
sudo install -d -m 0755 "$PUBLIC_ROOT"
sudo rsync -a --delete "$SOURCE_DIR/client/dist/" "$PUBLIC_ROOT/"

if ! sudo cmp -s "$SOURCE_DIR/deploy/nginx/sparknest.conf" /etc/nginx/sites-available/sparknest; then
  log "Installing nginx site"
  sudo install -m 0644 "$SOURCE_DIR/deploy/nginx/sparknest.conf" /etc/nginx/sites-available/sparknest
  sudo ln -sfn /etc/nginx/sites-available/sparknest /etc/nginx/sites-enabled/sparknest
  sudo nginx -t
  sudo systemctl reload nginx
fi

PREVIOUS=""
if [ -L "$CURRENT_LINK" ]; then
  PREVIOUS="$(readlink -f "$CURRENT_LINK")"
fi

rollback() {
  log "Deployment health check failed; rolling back"
  if [ -n "$PREVIOUS" ]; then
    # Static assets are served outside the release symlink. Restore the
    # previous build too so a failed API rollout cannot leave a mixed release.
    if [ -d "$PREVIOUS/client/dist" ]; then
      sudo rsync -a --delete "$PREVIOUS/client/dist/" "$PUBLIC_ROOT/"
    fi
    ln -sfn "$PREVIOUS" "$CURRENT_LINK"
    sudo systemctl restart "$SERVICE_NAME" || true
  fi
  exit 1
}

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
log "Restarting $SERVICE_NAME"
if ! sudo systemctl restart "$SERVICE_NAME"; then
  sudo systemctl status "$SERVICE_NAME" --no-pager -n 20 || true
  rollback
fi

for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 http://127.0.0.1:3100/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if ! curl -fsS --max-time 3 http://127.0.0.1:3100/health >/dev/null 2>&1; then
  sudo systemctl status "$SERVICE_NAME" --no-pager -n 20 || true
  rollback
fi
curl -fsS --max-time 3 http://127.0.0.1:8081/ >/dev/null 2>&1 || rollback

log "API and frontend health checks passed"

# Keep a bounded number of releases for rollback.
mapfile -t OLD_RELEASES < <(ls -1dt "$RELEASES_DIR"/* 2>/dev/null | tail -n "+$((KEEP_RELEASES + 1))" || true)
for old in "${OLD_RELEASES[@]:-}"; do
  [ -n "$old" ] && rm -rf "$old"
done

log "Deployed $STAMP"
