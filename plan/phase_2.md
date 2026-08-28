# Phase 2 — Database & Flyway Migrations

> **Goal:** Versioned, auto-applied DB schema. Fresh clone → `npm run db:migrate` → fully working DB. No manual `psql` or `\copy`.

**Duration:** 2–3 days | **Risk:** Medium (schema is foundation) | **Branch:** `chore/phase-2-flyway` | **Depends on:** Phase 1

---

## 1. Objective

Replace imperative `tables.sql` + manual `categories.csv` import with **Flyway Community** migrations that auto-run on server boot and in Docker. Introduce `pg.Pool` and remove single `Client` bottleneck.

## 2. Prerequisites

- Phase 1 merged (lint, tests, `app.js` split)
- Postgres 16 running locally (Docker or native)
- `tables.sql` and `categories.csv` read as source of truth

## 3. Why This Phase Second

Every later fix (auth, articles, images) touches DB. Without versioned migrations, schema drift is unrecoverable. Flyway gives: `V1__baseline` → reproducible, `migrate` on boot → zero manual steps, `validate` in CI → drift detection.

## 4. Current DB Problems (to fix)

| Issue | File | Impact |
|-------|------|--------|
| No migrations, manual `CREATE DATABASE` + `\copy` | `tables.sql:1-15` | Fresh env fails |
| Single `pg.Client` | `db/db.js:13` | Concurrency bottleneck, no pool |
| `CREATE DATABASE` in schema file | `tables.sql:1` | Flyway can't run it (needs DB to exist) |
| Categories seeded via `\copy` path `/home/ubuntu/...` | `tables.sql:15` | Not portable |
| No `IF NOT EXISTS`, no down migrations | `tables.sql` | Re-run fails |
| `featured_articles` has no unique constraint | `tables.sql:214` | `ON CONFLICT` in model won't work reliably |

## 5. Steps

### 5.1 Choose Flyway Distribution

**Use Flyway Community via Docker** — no Java/Maven on host.

```bash
# Option A: Docker (recommended, no install)
docker pull flyway/flyway:10.20

# Option B: npm wrapper (alternative)
npm --workspace=server install -D node-flyway  # or use flyway CLI via npx
```

We will use **Docker + npm script wrapper** so CI and local behave identically.

### 5.2 Directory Layout

```
server/
├── db/
│   ├── db.js                 # Pool + migrate hook
│   ├── migrate.js            # Node wrapper that execs Flyway Docker
│   └── migrations/
│       ├── V1__baseline.sql
│       ├── V2__seed_categories.sql
│       └── V3__harden_constraints.sql
├── flyway.conf               # at repo root or server/flyway.conf
└── package.json              # scripts: db:migrate, db:validate, db:clean
```

Create:

```bash
mkdir -p server/db/migrations
```

### 5.3 Create `flyway.conf` (repo root)

```properties
# flyway.conf — committed, no secrets
flyway.locations=filesystem:server/db/migrations
flyway.table=flyway_schema_history
flyway.baselineOnMigrate=true
flyway.validateOnMigrate=true
flyway.cleanDisabled=false

# placeholders — overridden by env
flyway.url=jdbc:postgresql://${PG_HOST}:${PG_PORT}/${PG_DATABASE}
flyway.user=${PG_USER}
flyway.password=${PG_PASSWORD}
```

Add `flyway.conf.local` to `.gitignore` for local overrides.

### 5.4 Normalize `V1__baseline.sql`

**Do NOT copy `tables.sql` verbatim.** Transform:

1. **Remove** `CREATE DATABASE`, `CREATE USER`, `GRANT`, `ALTER USER`, `pg_hba.conf` comments (lines 1-15). DB creation is outside Flyway (docker-compose or `createdb`).
2. **Add** `IF NOT EXISTS` where safe, keep `CASCADE` FKs.
3. **Fix** `featured_articles` — add unique constraint so `ON CONFLICT` works:
   ```sql
   CREATE TABLE featured_articles (
     id SERIAL PRIMARY KEY,
     article_id INT UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
4. **Keep** triggers `update_updated_at_column()` / `update_comment_timestamp()` and indexes.
5. **Order** tables by FK dependency: `users` → `subscription` → `categories` → `articles` → `articles_categories` → `articles_preview` → `article_images` → `comments` → `saved_articles` → `liked_articles` → `featured_articles` → `password_resets`.

Example header:

```sql
-- V1__baseline.sql — SparkNest baseline (from tables.sql 2024)
-- Flyway baseline, idempotent via IF NOT EXISTS where possible

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  fname VARCHAR(50),
  lname VARCHAR(50),
  username VARCHAR(30) UNIQUE,
  region VARCHAR(50),
  avatar TEXT,
  password VARCHAR(100) NOT NULL,
  bio VARCHAR(201),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ... rest normalized
```

Validate:

```bash
# dry-run against local DB
docker run --rm --network host \
  -v "G:/WebDevP/Open_Projects/SparkNest:/flyway/project" \
  flyway/flyway:10.20 -url=jdbc:postgresql://localhost:5432/sparknest \
  -user=pkm774 -password=pass migrate -configFiles=/flyway/project/flyway.conf
```

### 5.5 `V2__seed_categories.sql`

Convert `categories.csv` (305 rows) to `INSERT`:

```sql
-- V2__seed_categories.sql — 305 categories from categories.csv
INSERT INTO categories (id, name) VALUES
  (1, 'Technology'),
  (2, 'Health'),
  -- ...
  (305, 'Universe')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence so next insert doesn't collide
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
```

Generate via script (commit the generator, not manual paste):

```bash
# server/db/scripts/csv-to-sql.js — reads categories.csv → V2
node server/db/scripts/csv-to-sql.js
```

### 5.6 `V3__harden_constraints.sql` (optional but recommended)

Fixes discovered in Phase 1 audit:

```sql
-- V3__harden_constraints.sql
-- 1. Ensure featured_articles.article_id unique (if V1 didn't)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='featured_articles_article_id_key') THEN
    ALTER TABLE featured_articles ADD CONSTRAINT featured_articles_article_id_key UNIQUE (article_id);
  END IF;
END $$;

-- 2. Add missing FK index if not exists (already in V1, but safe)
CREATE INDEX IF NOT EXISTS idx_featured_article_id ON featured_articles(article_id);

-- 3. Add check for newsletter boolean default
ALTER TABLE subscription ALTER COLUMN newsletter SET DEFAULT false;
```

### 5.7 Replace `pg.Client` with `pg.Pool`

**File: `server/db/db.js`**

Before (single Client):
```js
const db = new Client({ user, host, database, password, port });
export async function connectDB() { await db.connect(); }
export function getDBClient() { return db; }
```

After:
```js
import pkg from "pg";
const { Pool } = pkg;
import config from "../config/config.js";

const pool = new Pool({
  user: config.pg.user,
  host: config.pg.host,
  database: config.pg.database,
  password: config.pg.password,
  port: config.pg.port,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => console.error('PG Pool error', err));

export async function connectDB() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('Database pool connected');
  } finally {
    client.release();
  }
}

export function getDBClient() { return pool; } // pool.query works like client.query
export default pool;
```

**Why Pool:** Handles concurrency (articles + previews + categories parallel queries), auto-reconnect, no single-client bottleneck.

Update all models: `db.query` still works (Pool has same API). No model change needed except removing `BEGIN` on Pool — use `client = await pool.connect()` for transactions (see `articleCategoriesModel.js`).

Fix `articleCategoriesModel.js:17-27` transaction:

```js
const client = await db.connect();
try {
  await client.query('BEGIN');
  for (const cat of categories) await client.query(insertCategoryQuery, [articleId, cat.id]);
  await client.query('COMMIT');
} catch (e) { await client.query('ROLLBACK'); throw e; }
finally { client.release(); }
```

### 5.8 Auto-Migrate on Boot

**File: `server/db/migrate.js`** (Node wrapper):

```js
import { execSync } from 'child_process';
import config from '../config/config.js';

export async function runMigrations() {
  if (process.env.NODE_ENV === 'test') return; // skip in tests, use test DB
  const url = `jdbc:postgresql://${config.pg.host}:${config.pg.port}/${config.pg.database}`;
  const cmd = [
    'docker run --rm --network host',
    `-v "${process.cwd()}:/flyway/project"`,
    'flyway/flyway:10.20',
    `-url=${url}`,
    `-user=${config.pg.user}`,
    `-password=${config.pg.password}`,
    '-configFiles=/flyway/project/flyway.conf',
    'migrate'
  ].join(' ');
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log('Flyway migrations applied');
  } catch (e) {
    console.error('Flyway failed', e.message);
    // Fallback: try node-pg-migrate or direct SQL if Docker not available
    throw e;
  }
}
```

**File: `server/server.js`** — call before `connectDB()`:

```js
import { runMigrations } from './db/migrate.js';
await runMigrations();
await connectDB();
```

For **Docker Compose**, prefer Flyway as init container (no Docker-in-Docker):

```yaml
# docker-compose.yml (added in Phase 6, but design now)
services:
  flyway:
    image: flyway/flyway:10.20
    volumes: [.:/flyway/project]
    command: -url=jdbc:postgresql://db:5432/sparknest -user=pkm774 -password=pass migrate
    depends_on: [db]
  server:
    depends_on: [flyway]
```

### 5.9 npm Scripts

`server/package.json`:

```json
{
  "scripts": {
    "db:migrate": "node db/migrate.js",
    "db:validate": "docker run --rm --network host -v \"%cd%:/flyway/project\" flyway/flyway:10.20 -configFiles=/flyway/project/flyway.conf validate",
    "db:clean": "docker run --rm --network host -v \"%cd%:/flyway/project\" flyway/flyway:10.20 -configFiles=/flyway/project/flyway.conf clean",
    "db:info": "docker run --rm --network host -v \"%cd%:/flyway/project\" flyway/flyway:10.20 -configFiles=/flyway/project/flyway.conf info"
  }
}
```

### 5.10 Baseline Existing DB

If dev DB already has tables from `tables.sql`:

```bash
# Mark V1 as already applied without running it
docker run ... flyway baseline -baselineVersion=1 -baselineDescription="legacy tables.sql"
# Then migrate V2, V3 normally
npm run db:migrate
```

Document in `server/db/README.md`.

## 6. Files Created / Modified

| File | Action |
|------|--------|
| `flyway.conf` | Create |
| `server/db/migrations/V1__baseline.sql` | Create (normalized tables.sql) |
| `server/db/migrations/V2__seed_categories.sql` | Create (from CSV) |
| `server/db/migrations/V3__harden_constraints.sql` | Create |
| `server/db/db.js` | Rewrite Client → Pool |
| `server/db/migrate.js` | Create |
| `server/db/scripts/csv-to-sql.js` | Create |
| `server/models/articleCategoriesModel.js` | Fix transaction to use Pool client |
| `server/server.js` | Add `runMigrations()` before `connectDB()` |
| `server/package.json` | Add db:* scripts |
| `server/db/README.md` | Create (how to baseline) |

## 7. Verification Gate

```bash
# 1. Fresh DB
dropdb sparknest --if-exists && createdb sparknest
# or docker: docker compose down -v && docker compose up -d db

# 2. Migrate
npm --workspace=server run db:migrate
# expect: "Successfully applied 3 migrations"

# 3. Validate
npm --workspace=server run db:validate  # no errors
npm --workspace=server run db:info      # V1, V2, V3 = Success

# 4. Boot
npm --workspace=server run dev
# expect: "Flyway migrations applied" → "Database pool connected" → "Server running..."

# 5. Data check
psql sparknest -c "SELECT count(*) FROM categories;"  # 305
psql sparknest -c "\d featured_articles"              # article_id UNIQUE

# 6. Tests still green
npm --workspace=server test
```

CI gate: `db:validate` step passes.

## 8. Rollback

- `npm run db:clean` (dev only) + restore `tables.sql` path.
- Or `git revert` Phase 2 commit and recreate DB via `psql -f tables.sql`.
- Pool → Client revert is single file (`db.js`).

## 9. Exit Criteria

- [ ] `V1`, `V2`, `V3` apply on empty DB with no manual steps
- [ ] `Pool` handles concurrent requests (no `Client has already been connected` errors)
- [ ] `categories` count = 305, sequence reset
- [ ] `featured_articles.article_id` unique
- [ ] `npm run db:migrate` idempotent (second run = "No migrations pending")
- [ ] Existing dev DB can be baselined without data loss

## 10. Out of Scope

- No app logic changes (controllers/models keep working)
- No session store change (Phase 3)
- No Docker Compose yet (Phase 6) — but design is forward-compatible
