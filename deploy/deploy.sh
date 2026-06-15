#!/bin/bash
# Auto-deploy script — déclenché par GitHub webhook ou manuellement
# Usage: bash deploy/deploy.sh

set -e

source "$HOME/.nvm/nvm.sh"

CRM_DIR="/home/u562454273/domains/ndembokin.com/public_html/crm"
LOG="$HOME/.pm2/logs/deploy.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Déploiement démarré ===" >> "$LOG"

cd "$CRM_DIR"

# 1. Pull dernière version
echo "[$(date)] git pull..." >> "$LOG"
git pull origin main >> "$LOG" 2>&1

# 2. Backend — dépendances + migrations
echo "[$(date)] npm install crm-api..." >> "$LOG"
cd crm-api
npm install --omit=dev >> "$LOG" 2>&1
npx prisma db push --skip-generate >> "$LOG" 2>&1
cd "$CRM_DIR"

# 3. Frontend — build
echo "[$(date)] npm build crm-app..." >> "$LOG"
cd crm-app
npm install --omit=dev >> "$LOG" 2>&1
npm run build >> "$LOG" 2>&1
cd "$CRM_DIR"

# 4. Déployer le build (copie les fichiers statiques à la racine)
echo "[$(date)] Déploiement fichiers statiques..." >> "$LOG"
cp -r crm-app/dist/index.html ./
cp -r crm-app/dist/assets ./
cp -r crm-app/dist/favicon.svg ./ 2>/dev/null || true
cp -r crm-app/dist/icons.svg ./ 2>/dev/null || true

# 5. Redémarrer l'API
echo "[$(date)] Redémarrage PM2..." >> "$LOG"
pm2 restart ndembo-crm-api >> "$LOG" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] === Déploiement terminé avec succès ===" >> "$LOG"
