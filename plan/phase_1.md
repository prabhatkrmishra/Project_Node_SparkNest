# Phase 1 — Foundation & Safety Net

> **Goal:** Repo hygiene, deterministic toolchain, and a safety net. Zero behavior change. Every later phase depends on this.

**Duration:** 2–3 days | **Risk:** Low | **Branch:** `chore/phase-1-foundation`

---

## 1. Objective

Make the repo reproducible, linted, and testable so refactors in Phase 2+ are safe. No feature or schema changes.

## 2. Prerequisites

- Node 20 LTS installed (`nvm` or `fnm`)
- Postgres 16 locally (or Docker) — not yet migrated, just for baseline test
- Read `plan/README.md`

## 3. Why This Phase First

Current repo has: no `engines`, no `.nvmrc`, `.gitignore` misses `node_modules/dist/data`, `sharp` in client deps, no lint in CI, no tests, `WEB_URL` hardcoded. Without pinning and a test harness, every later fix risks silent regression.

## 4. Steps

### 4.1 Pin Toolchain

1. Create `.nvmrc`:
   ```
   20.18.0
   ```
2. Update `client/package.json` and `server/package.json`:
   ```json
   "engines": { "node": ">=20 <21", "npm": ">=10" },
   "engineStrict": true
   ```
3. Add root `package.json` (workspaces, optional but recommended):
   ```json
   {
     "private": true,
     "workspaces": ["client", "server"],
     "scripts": {
       "dev:client": "npm --workspace=client run dev",
       "dev:server": "npm --workspace=server run dev",
       "lint": "npm run lint --workspaces",
       "format": "prettier --check .",
       "format:fix": "prettier --write ."
     }
   }
   ```
4. Add `.editorconfig`, `.gitattributes` (LF).

### 4.2 Fix `.gitignore`

Replace both `client/.gitignore` and `server/.gitignore` + root `.gitignore` with:

```
# deps
node_modules/
# build
dist/
build/
# env
.env
.env.local
.env.*.local
# data & uploads (never commit)
data/
server/uploads/*
!server/uploads/.placeholder
# OS
.DS_Store
Thumbs.db
# logs
npm-debug.log*
*.log
# flyway
flyway.conf.local
```

Keep `!commands.txt` / `!ngix.txt` if needed, but move secrets to `.env.example`.

### 4.3 Env Contract

1. Create `server/.env.example` (commit) and ensure `server/.env` is gitignored:
   ```
   SERVER_HOSTNAME=localhost
   SERVER_PORT=3000
   PG_USER=pkm774
   PG_HOST=localhost
   PG_DATABASE=sparknest
   PG_PASSWORD=pass
   PG_PORT=5432
   SESSION_SECRET=change_me_32_chars_min
   SECURE_COOKIE=false
   HTTP_ONLY=true
   SAME_SITE=lax
   SERVICE_EMAIL_USER=
   SERVICE_EMAIL_PASS=
   FRONTEND_ADDRESS=http://localhost:5143
   BACKEND_ADDRESS=http://localhost:3000
   PASSWORD_SALTROUNDS=10
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/home
   ```
2. Create `client/.env.example`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
3. Add `server/config/env.js` (Zod validation, fail-fast) — **implement in Phase 3**, but stub the file now.

### 4.4 Lint / Format / Hooks

1. Root `eslint.config.js` (flat config) + `prettier` + `eslint-config-prettier`:
   ```bash
   npm install -D prettier eslint @eslint/js globals
   npm --workspace=client install -D prettier
   npm --workspace=server install -D prettier
   ```
2. Add `lint` scripts:
   - `client/package.json`: `"lint": "eslint ."` (already), add `"format:check": "prettier --check ."`
   - `server/package.json`: add `"lint": "eslint . --ext .js"`, `"format:check": "prettier --check ."`
3. Husky + lint-staged:
   ```bash
   npm install -D husky lint-staged
   npx husky init
   ```
   `.husky/pre-commit`: `npx lint-staged`
   `lint-staged` in root `package.json`:
   ```json
   { "*.{js,jsx}": ["eslint --fix", "prettier --write"] }
   ```

### 4.5 Dependency Hygiene (no behavior change)

1. **Remove `sharp` from `client/package.json`** (server-only):
   ```bash
   npm --workspace=client uninstall sharp
   ```
2. Audit:
   ```bash
   npm audit --workspaces
   npm outdated --workspaces
   ```
   Record in `plan/audit-2026-08-28.md` (do not auto-fix majors yet).
3. Pin `vite` 5.4.x, `react` 18.3.x — upgrades in Phase 5.

### 4.6 Baseline Test Harness (safety net)

1. Server — add `vitest` + `supertest`:
   ```bash
   npm --workspace=server install -D vitest supertest
   ```
   `server/vitest.config.js`:
   ```js
   import { defineConfig } from 'vitest/config';
   export default defineConfig({ test: { environment: 'node', include: ['tests/**/*.test.js'] } });
   ```
   Add `server/tests/health.test.js`:
   ```js
   import { describe, it, expect } from 'vitest';
   import request from 'supertest';
   // import app without listening — refactor server.js to export app (see 4.7)
   ```
2. Client — add `vitest` + `jsdom` + `testing-library`:
   ```bash
   npm --workspace=client install -D vitest jsdom @testing-library/react @testing-library/jest-dom
   ```
   One smoke test: `src/App.test.jsx` renders router.

### 4.7 Minimal Server Refactor (export app)

Split `server/server.js` → `server/app.js` (creates `app`, no `listen`) + `server/server.js` (imports `app`, calls `listen`). This enables `supertest` without port binding. No logic change.

```js
// app.js — move all middleware + routes, export default app
// server.js — import app, connectDB(), app.listen(...)
```

### 4.8 Docs

- Add `AGENTS.md` (commands: `npm run dev`, `npm run lint`, `npm test`)
- Update `README.md` dev setup section to reference `.env.example` and `nvm use`.

## 5. Files Created / Modified

| File | Action |
|------|--------|
| `.nvmrc`, `.editorconfig`, `.gitattributes` | Create |
| `package.json` (root) | Create (workspaces) |
| `.gitignore` (root + client + server) | Rewrite |
| `server/.env.example`, `client/.env.example` | Create |
| `eslint.config.js`, `.prettierrc`, `.prettierignore` | Create/update |
| `.husky/` + `lint-staged` | Create |
| `client/package.json` (remove sharp) | Edit |
| `server/app.js`, `server/server.js` | Split |
| `server/vitest.config.js`, `server/tests/health.test.js` | Create |
| `client/vitest.config.js`, `src/App.test.jsx` | Create |
| `AGENTS.md` | Create |

## 6. Verification Gate (must pass before Phase 2)

```bash
nvm use
npm install
npm run lint --workspaces        # 0 errors
npm run format --workspaces      # no diff
npm --workspace=server test      # health test green
npm --workspace=client test      # smoke green
npm --workspace=server run dev   # boots, GET / returns 200
npm --workspace=client run dev   # Vite on 5143
```

CI (if added): `lint` + `test` jobs green.

## 7. Rollback

- `git revert` the single Phase 1 commit. No DB changes, so safe.
- If `app.js` split breaks boot, restore `server.js` from `main`.

## 8. Exit Criteria

- [ ] `node -v` matches `.nvmrc` on fresh clone
- [ ] `npm install` deterministic, no `sharp` in client
- [ ] `npm run lint` + `npm test` pass locally
- [ ] `GET http://localhost:3000/` returns `{message:"Welcome..."}`
- [ ] No secrets committed (`.env` ignored, `.env.example` present)

## 9. Out of Scope (deferred)

- Flyway, Pool, session store, CORS fix, validation — all Phase 2/3.
- No Vite/React upgrades yet.
