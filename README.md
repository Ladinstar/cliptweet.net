# Twitter Video Downloader

Site React + Node.js pour télécharger des vidéos Twitter/X à partir d'un lien.

## Architecture

| Couche     | Stack                                      | Rôle                                                  |
| ---------- | ------------------------------------------ | ----------------------------------------------------- |
| **client** | React 18 + TypeScript + Vite + TailwindCSS | SPA + dashboard admin, i18n FR/EN, thème clair/sombre |
| **server** | Express (ESM) + MongoDB + yt-dlp           | API REST `/api`, résolution de la vidéo, stats        |
| **mongo**  | MongoDB 7                                  | Téléchargements + journal d'erreurs                   |
| **web**    | Nginx                                      | Sert le build + **reverse-proxy `/api` → `api`**      |

En prod, le navigateur ne parle qu'à Nginx : les fichiers statiques et `/api` sont servis
sur la même origine (pas de souci de CORS, pas d'URL d'API codée en dur).

## Prérequis

- [Task](https://taskfile.dev/) (`task`) — task runner
- Node.js 18+ et Docker (avec Compose v2)
- En local hors Docker : `yt-dlp` a besoin de **python3** et **ffmpeg** (le `Dockerfile` les installe déjà)

## Démarrage rapide (Docker)

```bash
# 1. Copier et adapter les secrets du serveur
cp server/.env.example server/.env   # puis éditer ADMIN_PASSWORD / JWT_SECRET

# 2. Lancer toute la stack
task up         # docker compose up --build -d
```

Puis visiter **http://localhost:8080**.

> Génère un vrai secret JWT avec `openssl rand -hex 32`.

## Développement (hors Docker)

```bash
task install    # installe les deps (racine + client + server)
task dev        # lance client (Vite) + server (nodemon) en parallèle
```

Le front est sur http://localhost:5173 et proxifie `/api` vers http://localhost:4000
(voir `client/vite.config.ts`). Le server lit `server/.env`.

## Commandes (Taskfile)

```bash
task              # liste toutes les commandes
task fix          # ⭐ formate (Prettier) puis auto-fix le lint (ESLint --fix)
task format       # formate tout le repo avec Prettier
task lint         # lint le client
task lint:fix     # lint + auto-fix le client
task test         # tests serveur (node:test) + client (Vitest)
task e2e          # tests end-to-end client (Playwright) — `npx playwright install` une fois
task postman      # tests API (newman) contre la stack qui tourne
task postman:core # tests API sans réseau externe (health, auth, validation)
task build        # build de production du client
task quality      # format:check + lint + test + build
task up / down    # démarre / arrête la stack Docker
task logs         # suit les logs
task rebuild      # rebuild from scratch
task clean        # down + suppression des volumes (⚠️ efface MongoDB)
```

## Formatage & lint

- **Prettier** (config racine `.prettierrc.json`) formate tout le repo : client, server, JSON/YAML/MD.
- **ESLint** vérifie la qualité du code client. `eslint-config-prettier` désactive les règles
  de style qui entreraient en conflit avec Prettier — les deux outils sont complémentaires.

## Sécurité

- **Auth admin par vrai JWT** (signé avec `JWT_SECRET`, expiration configurable), mots de passe
  hachés via bcrypt. Le middleware `requireAdmin` vérifie le token sur les routes protégées.
- **Anti-SSRF** : seuls les liens `twitter.com` / `x.com` sont acceptés au téléchargement, et le
  proxy média (`/api/media`) n'accepte que les hôtes CDN whitelistés (`video.twimg.com`, …).
- **Rate limiting** sur `/api/download` et `/api/admin/login`.
- **Helmet** pour les en-têtes HTTP, **CORS** restreignable via `CORS_ORIGINS`.
- File d'attente (`p-queue`) bornant le nombre de process `yt-dlp` concurrents.
- Secrets dans `server/.env` (git-ignoré), jamais dans `docker-compose.yml`.

## Endpoints

| Méthode | Route              | Auth   | Description                                  |
| ------- | ------------------ | ------ | -------------------------------------------- |
| GET     | `/api/health`      | —      | Liveness + ping MongoDB                      |
| POST    | `/api/download`    | —      | Résout l'URL de la vidéo d'un tweet          |
| GET     | `/api/media`       | —      | Proxy de streaming d'un média CDN whitelisté |
| POST    | `/api/admin/login` | —      | Login admin → JWT                            |
| GET     | `/api/admin/stats` | Bearer | Statistiques (téléchargements, erreurs)      |

## Notes

- Le bouton « Télécharger » passe par `/api/media` : le fichier est servi par notre serveur
  (nom propre, pas de lien CDN expirant ni de blocage CORS).
- Le format **MP3** nécessite `ffmpeg` (présent dans l'image Docker).
- `AdBanner` est un placeholder : remplace-le par un vrai code d'annonce (AdSense, etc.).
- `yt-dlp` casse régulièrement quand X change son HTML : pense à le mettre à jour (`yt-dlp -U`)
  et à rebuild l'image `api`.
