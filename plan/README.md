# SparkNest — Upgrade Plan (2024 → 2026)

> PERN + Passport + Quill → modern, secure, maintainable. Flyway-managed DB, hardened backend, modern frontend, CI/CD.

## Current Snapshot (verified 2026-08-28)

- **Client:** Vite 5 + React 18.3 + React Router 6 + Axios + Bootstrap 5.3 + Quill 2 + MUI 6. `sharp` incorrectly in client deps. `WEB_URL` hardcoded to `localhost:8080`.
- **Server:** Express 5 + `pg` single `Client` (no Pool) + `express-session` MemoryStore + Passport Local + Google OAuth2 + Nodemailer (gmail) + Multer + Sharp + `node-cron`. No validation, no helmet, CORS always-allow bug, `rateLimiter` never wired, `getUserDetail(id,col)` SQL-injects via `${col}`, `req.param` typo, `limit` reassigned on `const`, `uploads/` vs `../../data/images` split.
- **DB:** `tables.sql` imperative DDL (no migrations). 12 tables + triggers + indexes. 305 categories in `categories.csv` via manual `\copy`.
- **Ops:** No Docker, no CI, no tests, `MemoryStore` sessions, single `Client` bottleneck.

## Phase Map

| Phase | Title | Goal | Risk | Effort |
|-------|-------|------|------|--------|
| **1** | Foundation & Safety Net | Repo hygiene, tooling, baseline tests, no behavior change | Low | 2–3 days |
| **2** | Database & Flyway Migrations | Versioned migrations, auto-create on boot, seed, Pool | Medium | 2–3 days |
| **3** | Backend Security & Architecture Hardening | Fix all P0 bugs, validation, error handling, session store | Medium | 4–5 days |
| **4** | API, Auth & File Pipeline | Auth hardening, file abstraction, image pipeline fix | Medium | 3–4 days |
| **5** | Frontend Modernization | TS, TanStack Query, dep cleanup, Vite 6, UX | Medium | 5–7 days |
| **6** | Testing, Observability & DevOps | Tests, logging, Docker, CI/CD, deploy | Low-Med | 4–5 days |

**Order is strict** — each phase is a mergeable PR. No phase skips its verification gate.

## How to Use

1. Work phase-by-phase, one PR per phase.
2. Each `phase_N.md` has: Objective → Prerequisites → Steps (commands + files) → Verification → Rollback.
3. Do not start Phase N+1 until Phase N verification passes on `main`.

## Global Conventions (apply from Phase 1)

- Node `20 LTS` (`.nvmrc` + `engines`), `npm` workspaces or keep `client/`+`server/` but pin versions.
- ESM throughout (`"type":"module"` already).
- Env via `dotenv` + `zod` validation at boot (fail fast).
- Conventional commits, `main` protected, PR required.

## Flyway at a Glance

- Tool: **Flyway Community** via Docker (`flyway/flyway:10`) + `npm run db:migrate` wrapper. No Java/Maven needed.
- Location: `server/db/migrations/V*.sql` (also `flyway.conf` at repo root).
- Auto-run: `server/db/db.js` runs `flyway migrate` on boot in dev, and `docker-compose` runs `flyway` service before `server` in prod.
- Baseline: `V1__baseline.sql` = current `tables.sql` normalized (idempotent, no `CREATE DATABASE`).

## Success Criteria (end of Phase 6)

- `npm run db:migrate` creates fresh DB from zero; `npm run dev` boots with no manual SQL.
- `npm test` + `npm run lint` + `npm run typecheck` green in CI.
- No `MemoryStore`, no single `Client`, no CORS allow-all, no SQL injection, no `sharp` in client.
- Docker `compose up` gives full stack locally.
