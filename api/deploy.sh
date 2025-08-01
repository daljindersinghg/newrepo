#!/usr/bin/env bash
set -euo pipefail

# 1. Go to project directory
cd "$(dirname "$0")"

# 2. Pull latest from main
echo "🛠  Fetching latest code from origin/main…"
git fetch origin main
git reset --hard origin/main

# 3. Install dependencies
echo "📦 Installing npm packages…"
npm install

# 4. Build TypeScript
echo "🔨 Building project…"
npm run build

# 5. Restart (or start) PM2 process
APP_NAME="backend"
ENTRY="dist/server.js"

if pm2 list | grep -q "$APP_NAME"; then
  echo "🔄 Restarting \"$APP_NAME\"…"
  pm2 restart "$APP_NAME"
else
  echo "🚀 Starting \"$APP_NAME\"…"
  pm2 start "$ENTRY" --name "$APP_NAME"
fi

# 6. Save PM2 process list (so it survives reboot)
pm2 save

echo "✅ Deployment complete."
