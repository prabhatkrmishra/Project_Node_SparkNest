# Phase 6 — Testing, Observability & DevOps

> **Goal:** Ship with confidence. Tests, logs, Docker, CI/CD, and prod deploy. No feature work.

**Duration:** 4–5 days | **Risk:** Low-Med | **Branch:** `chore/phase-6-devops` | **Depends on:** Phase 5

---

## 1. Objective

After Phase 5 the app is modern but still runs via `nodemon` + manual `psql`. This phase makes it **reproducible** (`docker compose up`), **tested** (unit + integration + e2e), **observable** (structured logs, health checks), and **deployable** (CI builds, pushes, deploys).

## 2. Prerequisites

- Phases 1–5 merged, Flyway V1–V5 applied, `Pool` + `pg` session store live
- Docker Desktop + `docker compose` v2
- GitHub repo (for Actions) or GitLab equivalent

## 3. Steps

### 3.1 Testing Pyramid

#### 3.1.1 Server — Vitest + Supertest (already stubbed in Phase 1)

**Install:**

```bash
npm --workspace=server install -D vitest supertest @faker-js/faker
```

**Structure:**

```
server/tests/
├── setup.js              # creates test DB, runs Flyway clean+migrate
├── helpers/auth.js       # login helper returns cookie
├── unit/
│   ├── bcrypt.test.js
│   ├── validators.test.js
│   └── images.test.js
└── integration/
    ├── auth.test.js      # signup → login → me → logout
    ├── articles.test.js  # create → fetch → update → delete (with owner checks)
    ├── comments.test.js
    └── media.test.js
```

**`server/tests/setup.js`:**

```js
import { execSync } from 'child_process';
beforeAll(async () => {
  process.env.PG_DATABASE = 'sparknest_test';
  execSync('docker run --rm --network host -v "%cd%:/flyway/project" flyway/flyway:10.20 -url=jdbc:postgresql://localhost:5432/sparknest_test -user=pkm774 -password=pass clean migrate', { stdio: 'inherit' });
  await import('../db/db.js').then(m => m.connectDB());
});
afterAll(async () => {
  const pool = (await import('../db/db.js')).default;
  await pool.end();
});
```

**`server/package.json`:**

```json
{ "scripts": { "test": "vitest run --coverage", "test:watch": "vitest" } }
```

Target: **>60% lines** on `services/` + `validators/` + `models/` (Phase 6), raise to 80% later.

#### 3.1.2 Client — Vitest + Testing Library + Playwright

```bash
npm --workspace=client install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm --workspace=client install -D playwright @playwright/test
npx playwright install --with-deps
```

- **Unit:** `src/hooks/useArticles.test.tsx` (mock `api`), `src/store/authStore.test.ts`
- **E2E (Playwright):** `e2e/home.spec.ts` (load → previews visible), `e2e/auth.spec.ts` (signup → login → create article), `e2e/article.spec.ts` (create with image → view → comment)

**`client/package.json`:**

```json
{ "scripts": { "test": "vitest run", "test:e2e": "playwright test" } }
```

### 3.2 Observability

#### 3.2.1 Structured Logging — Pino

```bash
npm --workspace=server install pino pino-http pino-pretty
```

**`server/config/logger.js`:**

```js
import pino from 'pino';
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});
```

**`server/app.js`:**

```js
import pinoHttp from 'pino-http';
import { logger } from './config/logger.js';
app.use(pinoHttp({ logger }));
// replace console.log with logger.info, console.error with logger.error
```

Add `req.log` to controllers for request-scoped logs.

#### 3.2.2 Health & Readiness

**`server/routes/healthRoutes.js`:**

```js
import { Router } from 'express';
import pool from '../db/db.js';
const r = Router();
r.get('/health', (req,res) => res.json({ status: 'ok', uptime: process.uptime() }));
r.get('/ready', async (req,res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ready' }); }
  catch { res.status(503).json({ status: 'not ready' }); }
});
export default r;
```

Wire in `app.js` before auth. Used by Docker `healthcheck` and K8s probes.

#### 3.2.3 Metrics (optional, low effort)

- Add `prom-client` + `GET /metrics` (Phase 6 stretch) or defer to Phase 7.
- At minimum, log `responseTime` via `pino-http`.

### 3.3 Docker & Compose

#### 3.3.1 `server/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm prune --production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
```

Multi-stage if you need `sharp` native build: `FROM node:20-alpine AS builder` with `python3 make g++`.

#### 3.3.2 `client/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**`client/nginx.conf`:**

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location /api/ { proxy_pass http://server:3000/; proxy_set_header Host $host; }
  location / { try_files $uri /index.html; }
  gzip on;
}
```

#### 3.3.3 `docker-compose.yml` (repo root)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${PG_USER:-pkm774}
      POSTGRES_PASSWORD: ${PG_PASSWORD:-pass}
      POSTGRES_DB: ${PG_DATABASE:-sparknest}
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U pkm774"], interval: 5s, retries: 5 }

  flyway:
    image: flyway/flyway:10.20
    volumes: [.:/flyway/project]
    command: -url=jdbc:postgresql://db:5432/${PG_DATABASE:-sparknest} -user=${PG_USER:-pkm774} -password=${PG_PASSWORD:-pass} -configFiles=/flyway/project/flyway.conf migrate
    depends_on: { db: { condition: service_healthy } }

  server:
    build: ./server
    environment:
      PG_HOST: db
      PG_USER: ${PG_USER:-pkm774}
      PG_PASSWORD: ${PG_PASSWORD:-pass}
      PG_DATABASE: ${PG_DATABASE:-sparknest}
      PG_PORT: 5432
      SESSION_SECRET: ${SESSION_SECRET}
      FRONTEND_ADDRESS: http://localhost:8080
      BACKEND_ADDRESS: http://localhost:3000
      DATA_ROOT: /data
    ports: ["3000:3000"]
    volumes: [appdata:/data]
    depends_on: { flyway: { condition: service_completed_successfully } }
    healthcheck: { test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"], interval: 10s, retries: 5 }

  client:
    build: ./client
    ports: ["8080:80"]
    depends_on: [server]

volumes:
  pgdata:
  appdata:
```

**`flyway.conf` update:** `flyway.url` now uses `db` host in compose, `localhost` locally — use env placeholder.

Add `.dockerignore` in both `client/` and `server/` (ignore `node_modules`, `data`, `.env`).

### 3.4 CI/CD — GitHub Actions

**`.github/workflows/ci.yml`:**

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_USER: pkm774, POSTGRES_PASSWORD: pass, POSTGRES_DB: sparknest_test }
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint --workspaces
      - run: npm --workspace=client run typecheck
      - run: npm --workspace=server run db:migrate  # uses localhost:5432
        env: { PG_HOST: localhost, PG_USER: pkm774, PG_PASSWORD: pass, PG_DATABASE: sparknest_test, PG_PORT: 5432 }
      - run: npm --workspace=server test -- --coverage
      - run: npm --workspace=client test
      - run: docker compose config  # validate compose
      - run: docker compose build
```

**`.github/workflows/deploy.yml` (on `main` push):**

- Build + push to GHCR/Docker Hub
- SSH to `sparknest.run.place` (or AWS) → `docker compose pull && docker compose up -d`
- Or use `flyway migrate` as separate step before `server` deploy

Add `dependabot.yml` for npm + Docker updates.

### 3.5 Production Hardening Checklist

- [ ] `SESSION_SECRET` 32+ chars, rotated, not in repo
- [ ] `SECURE_COOKIE=true`, `SAME_SITE=none` if cross-site, `trust proxy 1` set
- [ ] `helmet` + `hpp` + `compression` live (Phase 3)
- [ ] `CORS` allowlist is prod `FRONTEND_ADDRESS` only
- [ ] `rateLimiter` global + `authLimiter` on auth routes
- [ ] `DATA_ROOT` on persistent volume, not container FS
- [ ] `pg` Pool `max 20`, `idleTimeout` tuned
- [ ] Backups: `pg_dump` cron daily to S3 (or `docker exec db pg_dump`), test restore
- [ ] Logs shipped (CloudWatch / Loki) — `pino` JSON in prod
- [ ] `npm audit` clean, `dependabot` enabled

### 3.6 Docs & API Contract

- Add `server/docs/openapi.yaml` (or generate via `swagger-jsdoc` from JSDoc) — at least `GET /health`, `POST /signup`, `POST /login`, `GET /article/previews`.
- Serve via `swagger-ui-express` at `GET /docs` (dev only or behind auth).
- Update `README.md` with:

  ```md
  ## Dev
  docker compose up --build
  # or
  npm --workspace=server run db:migrate && npm --workspace=server run dev
  npm --workspace=client run dev

  ## Test
  npm test --workspaces
  npm --workspace=client run test:e2e
  ```

## 4. Files Created / Modified

| File | Action |
|------|--------|
| `server/tests/**` | Create (unit + integration) |
| `client/e2e/**`, `playwright.config.ts` | Create |
| `server/config/logger.js` | Create |
| `server/routes/healthRoutes.js` | Create |
| `server/Dockerfile`, `client/Dockerfile`, `client/nginx.conf` | Create |
| `docker-compose.yml`, `.dockerignore` | Create |
| `.github/workflows/ci.yml`, `deploy.yml` | Create |
| `.github/dependabot.yml` | Create |
| `server/docs/openapi.yaml` | Create |
| `README.md`, `AGENTS.md` | Update |

## 5. Verification Gate

```bash
# 1. Fresh clone → compose up
docker compose down -v
docker compose up --build -d
docker compose logs flyway  # "Successfully applied 5 migrations"
curl http://localhost:3000/health  # {"status":"ok"}
curl http://localhost:3000/ready   # {"status":"ready"}
curl http://localhost:8080/        # client loads, previews visible

# 2. Tests in CI
npm --workspaces test              # all green
npm --workspace=client run test:e2e # Playwright green

# 3. Logs
docker compose logs server | grep '"level":30'  # pino JSON in prod

# 4. Backup
docker exec sparknest-db-1 pg_dump -U pkm774 sparknest | head  # dump works

# 5. Deploy (staging)
git push origin main  # CI green → deploy workflow runs → health check passes
```

## 6. Rollback

- `docker compose down` + `git revert` Phase 6 commit → back to `nodemon` dev.
- DB `flyway_schema_history` stays — no data loss.
- If `pino` breaks, set `LOG_LEVEL=silent` and restart.

## 7. Exit Criteria

- [ ] `docker compose up` from zero → fully working app (DB migrated, seeded, healthy)
- [ ] `npm test` (server + client) + `playwright` green locally and in CI
- [ ] `GET /health` + `GET /ready` return 200, used by compose healthcheck
- [ ] Structured logs (pino) in prod, pretty in dev
- [ ] CI `lint` + `typecheck` + `test` + `build` green on PR
- [ ] `dependabot` enabled, `npm audit` clean
- [ ] `README.md` documents `docker compose` + `npm` workflows
- [ ] Backup/restore tested once

## 8. Out of Scope / Next (Phase 7+)

- S3 for `data/images` (replace `DATA_ROOT` with `s3Service`, presigned URLs)
- CDN (CloudFront) for `thumbs`/`masonry`
- Search (Postgres `tsvector` or Meilisearch) for articles
- Real-time comments (WebSocket)
- Rate limit by user (Redis) vs IP
- K8s / Terraform (if leaving single VM)
- Full OpenAPI coverage + SDK generation
