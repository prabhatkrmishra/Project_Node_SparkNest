# Database — Flyway Migrations

## Quick Start (fresh DB)

```bash
# 1. Create DB (once)
createdb sparknest
# or: docker compose up -d db

# 2. Migrate
npm --workspace=server run db:migrate
# or: docker compose up flyway

# 3. Verify
npm --workspace=server run db:info   # V1..V5 = Success
psql sparknest -c "SELECT count(*) FROM categories;"  # 305
```

## Baseline Existing DB (legacy tables.sql)

If your DB already has tables from `tables.sql`:

```bash
docker run --rm --network host -v "%cd%:/flyway/project" flyway/flyway:10.20 \
  -url=jdbc:postgresql://localhost:5432/sparknest -user=pkm774 -password=pass \
  baseline -baselineVersion=1 -baselineDescription="legacy tables.sql"

npm --workspace=server run db:migrate  # applies V2..V5
```

## Migrations

| Version | File | Description |
|---------|------|-------------|
| V1 | V1__baseline.sql | Normalized tables.sql (IF NOT EXISTS, featured_articles UNIQUE) |
| V2 | V2__seed_categories.sql | 305 categories from categories.csv |
| V3 | V3__harden_constraints.sql | newsletter default, indexes |
| V5 | V5__password_resets_harden.sql | created_at, cleanup, indexes |

Generate V2 from CSV:

```bash
npm --workspace=server run db:generate-categories
```

## Scripts

```bash
npm --workspace=server run db:migrate   # migrate (Docker Flyway or direct SQL fallback)
npm --workspace=server run db:validate  # validate (requires Docker)
npm --workspace=server run db:info      # info
npm --workspace=server run db:clean     # clean (dev only, requires Docker)
```

## Notes

- `flyway.conf` at repo root, `flyway.conf.local` is gitignored for local overrides.
- `server/db/migrate.js` tries Docker Flyway first, falls back to direct SQL via Pool.
- `DATA_ROOT` and `PG_*` come from `server/.env` (see `.env.example`).
