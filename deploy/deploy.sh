#!/usr/bin/env bash
# Build lalu upload hasilnya ke server Nginx.
# Pakai: DEPLOY_HOST=user@ip-server ./deploy/deploy.sh
set -euo pipefail

: "${DEPLOY_HOST:?Isi DEPLOY_HOST, mis. DEPLOY_HOST=root@1.2.3.4}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/juragan62}"

cd "$(dirname "$0")/.."
npm ci
npm test
npm run build

# Upload ke folder rilis baru, lalu tukar symlink-nya (tanpa downtime).
RELEASE="$(date +%Y%m%d%H%M%S)"
ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_PATH/releases/$RELEASE'"
rsync -az --delete dist/ "$DEPLOY_HOST:$DEPLOY_PATH/releases/$RELEASE/"
ssh "$DEPLOY_HOST" "ln -sfn '$DEPLOY_PATH/releases/$RELEASE' '$DEPLOY_PATH/dist' && ls -1dt '$DEPLOY_PATH'/releases/* | tail -n +6 | xargs -r rm -rf"

echo "✅ Rilis $RELEASE aktif di https://juragan62.aikita.id"
