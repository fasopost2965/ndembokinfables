# Déploiement Ndembo CRM

## Prérequis serveur

- Ubuntu 22.04+ / Debian 12+
- Node.js 22 LTS
- PM2 (`npm i -g pm2`)
- Nginx
- (Optionnel) PostgreSQL 16+ pour la prod ; SQLite en dev

---

## 1. Cloner et configurer

```bash
git clone <repo-url> /var/www/ndembo-crm
cd /var/www/ndembo-crm
```

### Backend

```bash
cd crm-api
cp .env.example .env
# Éditer .env : DATABASE_URL, JWT_SECRET, CORS_ORIGINS
npm install --omit=dev
npx prisma db push          # SQLite
# OU : npx prisma migrate deploy   # PostgreSQL
node prisma/seed.js         # données initiales
```

### Frontend

```bash
cd ../crm-app
npm install --omit=dev
npm run build               # génère dist/
```

---

## 2. PM2 (backend)

```bash
cd /var/www/ndembo-crm
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save
pm2 startup                 # suivre l'instruction affichée
```

---

## 3. Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/ndembo-crm
sudo ln -s /etc/nginx/sites-available/ndembo-crm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Obtenir un certificat SSL Let's Encrypt :

```bash
sudo certbot --nginx -d ndembo-crm.example.com
```

---

## 4. Mises à jour

```bash
cd /var/www/ndembo-crm
git pull

# Backend
cd crm-api && npm install --omit=dev && npx prisma migrate deploy
pm2 restart ndembo-crm-api

# Frontend
cd ../crm-app && npm run build
```

---

## Variables d'environnement clés (`crm-api/.env`)

| Variable | Exemple | Note |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite dev ; PostgreSQL prod |
| `JWT_SECRET` | `<chaîne aléatoire 64 car.>` | **Obligatoire** — ne pas exposer |
| `JWT_EXPIRES_IN` | `7d` | Durée des tokens |
| `PORT` | `4000` | Port interne (derrière Nginx) |
| `CORS_ORIGINS` | `https://ndembo-crm.example.com` | Origines autorisées |

Générer un secret sûr : `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Compte admin par défaut (seed)

- Email : `admin@ndembo.com`
- Mot de passe : `admin1234`

**Changer le mot de passe immédiatement après le premier déploiement.**
