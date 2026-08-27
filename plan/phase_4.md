# Phase 4 — API, Auth & File Pipeline

> **Goal:** Harden auth flows, normalize the API contract, and fix the file/image pipeline. Make the backend predictable for the frontend rewrite in Phase 5.

**Duration:** 3–4 days | **Risk:** Medium | **Branch:** `feat/phase-4-api-auth-files` | **Depends on:** Phase 3

---

## 1. Objective

After Phase 3 the backend is secure but still inconsistent: auth responses differ, password-reset leaks timing, file storage is split between `server/uploads/` and `../../data/images/`, image dedup is fragile, and API pagination/errors are ad-hoc. This phase makes the API contract stable.

## 2. Prerequisites

- Phase 3 merged (env, helmet, pg store, validation, error handler)
- Flyway V1–V4 applied

## 3. Problems Fixed Here

| # | File | Issue |
|---|------|-------|
| 1 | `controllers/authController.js:160` | Google callback leaks `userData` in URL query (PII in logs/history) |
| 2 | `services/passwordService.js:43` | `getUserByEmail` returns boolean but used as row — timing leak on reset |
| 3 | `services/bcryptService.js` | No pepper, `saltRounds` from env but not validated per-hash |
| 4 | `services/imagesServices.js` | `saveImage` sync `writeFileSync`, `../../data` path fragile, no MIME check, no cleanup on failure |
| 5 | `controllers/articlesController.js` | `extractImages` → `saveImage` loop is sync, no transaction, partial failure leaves orphan files |
| 6 | `routes/userRoutes.js`, `articlesRoutes.js` | Multer `diskStorage` to `process.cwd()/uploads` — different from `data/images` |
| 7 | `controllers/mediaController.js` | `path.join(process.cwd(), "../../data")` breaks when cwd changes; no `If-None-Match` / caching |
| 8 | All controllers | Inconsistent response shape: sometimes `{message}`, sometimes `{error}`, sometimes plain text |

## 4. Steps

### 4.1 Normalize API Response Shape

**Create `server/utils/response.js`:**

```js
export const ok = (res, data, meta) => res.json({ success: true, data, ...(meta && { meta }) });
export const created = (res, data) => res.status(201).json({ success: true, data });
export const paginated = (res, articles, totalPages, totalCount) =>
  res.json({ success: true, data: articles, meta: { totalPages, totalCount } });
```

Update every controller to use it. Error shape already normalized in Phase 3 (`{message, details}`).

Add `server/middlewares/responseTime.js` optional.

### 4.2 Auth Hardening

#### 4.2.1 Login / Signup

- **Signup** `controllers/authController.js:17`:
  - Validate via Zod (Phase 3) — `fname/lname` optional, `email` email, `password` min 8 + complexity (optional).
  - Check `getUserDetailEmail` (row) not `getUserByEmail` (boolean) — fix timing: always `hashPassword` even if user exists? Or keep early return but ensure constant-time response. Simpler: return `400 User already exists` (current) but don't leak whether email exists via timing — add `await new Promise(r=>setTimeout(r, 300))` on early return? Document trade-off.
  - After `createUser`, `subscribeUser` should not throw if fails — log and continue.

- **Login** `controllers/authController.js:55`:
  - Ensure `req.body.savesession` is boolean (Zod).
  - Set `httpOnly`, `secure`, `sameSite` from env (already).
  - Return `user` without `password` field — currently returns `user.password`? Check `passport.deserializeUser` returns full row — strip `password` before `res.json`.

- **Logout** `controllers/authController.js:101`:
  - Add `req.session.destroy` + `res.clearCookie('sparknest.sid')`.

#### 4.2.2 Google OAuth

**Fix PII in URL** — `controllers/authController.js:160`:

Before:
```js
res.redirect(`${FRONTEND}/google/login?user=${encodeURIComponent(JSON.stringify(userData))}`)
```

After (secure):
```js
// Option A: set session and redirect without data
req.login(user, () => {
  req.session.cookie.maxAge = 30*24*60*60*1000;
  return res.redirect(`${FRONTEND}/google/success`); // frontend fetches /user/details/:email via session
});
// Option B: short-lived signed JWT in query (if frontend needs immediate data)
// Use jsonwebtoken with 5min expiry, frontend exchanges it for session
```

Implement Option A (simplest, no PII in URL/logs). Update `client/src/pages/components/GoogleLogin.jsx` to fetch `GET /user/details/:email` after redirect instead of parsing query.

Add `state` param to `googleAuth` for CSRF (passport handles).

#### 4.2.3 Password Reset

- **Fix `getUserByEmail` boolean misuse** — `services/passwordService.js:43`:
  ```js
  const user = await getUserDetailEmail(email); // row or null
  if (!user) return res.status(200).json({ message: "If account exists..." }); // don't leak
  ```
- **Token storage** — `models/passwordResetModel.js`:
  - Add `UNIQUE(email)` or delete old tokens before insert (currently allows multiple).
  - Add `created_at` column via `V5__password_resets_harden.sql`.
  - Hash token before storing (like password) — store `sha256(token)`, compare hash on verify. Prevents DB leak → token reuse.
- **Rate limit** — apply `authLimiter` to `/password/request/email` (Phase 3) + add per-email limit (e.g., 3/hour) via in-memory or DB.

**Migration `V5__password_resets_harden.sql`:**
```sql
ALTER TABLE password_resets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
DELETE FROM password_resets WHERE expires < NOW(); -- cleanup
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
```

### 4.3 File Storage Abstraction

**Problem:** `server/uploads/` (multer tmp) vs `../../data/images/` (final) vs `assets/images/avatars` (static). Paths use `process.cwd()` which changes between `nodemon` and `node`.

**Create `server/services/storageService.js`:**

```js
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const DATA_ROOT = process.env.DATA_ROOT
  ? path.resolve(process.env.DATA_ROOT)
  : path.resolve(process.cwd(), 'data'); // or path.join(projectRoot, 'data')

// For Docker: DATA_ROOT=/data
export const resolveDataPath = (...segments) => path.join(DATA_ROOT, ...segments);

export const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });
export const removeDir = async (dir) => fs.rm(dir, { recursive: true, force: true });
```

Update `server/config/env.js` to add `DATA_ROOT` (default `data` at repo root).

**Update `server/services/imagesServices.js`:**

1. Replace `path.join(process.cwd(), "../../data/images", ...)` with `resolveDataPath("images", ...)`.
2. Replace `fs.writeFileSync` / `fs.existsSync` with `fs/promises` async.
3. Add MIME allowlist:
   ```js
   const ALLOWED_TYPES = new Set(['jpeg','jpg','png','webp','gif']);
   if (!ALLOWED_TYPES.has(image.type.toLowerCase())) throw new AppError(400, 'Unsupported image type');
   ```
4. Add size check: `Buffer.from(image.data, 'base64').length > 5*1024*1024` → 400.
5. Make `saveImage` async, handle `ensureDir` before write.
6. Wrap `processAndSavePreviewImage` in try/catch that cleans up `basePath` on failure (no orphan folders).
7. Add `sharp` error handling — if `sharp` fails, delete tmp file and throw `AppError(400, 'Invalid image')`.

**Update `server/routes/userRoutes.js` & `articlesRoutes.js` Multer:**

```js
import { resolveDataPath } from '../services/storageService.js';
const storage = multer.diskStorage({
  destination: (req,file,cb) => cb(null, resolveDataPath('tmp', 'uploads')), // single tmp dir
  filename: (req,file,cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10*1024*1024 },
  fileFilter: (req,file,cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new AppError(400, 'Only images allowed'), false);
    cb(null, true);
  },
});
```

Ensure `data/tmp/uploads` is gitignored and cleaned on boot.

### 4.4 Media Serving Hardening

**Update `server/controllers/mediaController.js`:**

1. Replace `process.cwd()` paths with `resolveDataPath`.
2. Add path traversal guard:
   ```js
   const safeUid = String(uid).replace(/[^a-zA-Z0-9_-]/g, '');
   if (safeUid !== String(uid)) throw new AppError(400, 'Invalid uid');
   ```
3. Add caching headers:
   ```js
   res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
   res.setHeader('ETag', `"${stat.mtimeMs}-${stat.size}"`);
   ```
4. Handle `If-None-Match` → 304.
5. For `fetchAllProfileAvatar`, cache result 1h in memory.

### 4.5 Article Create/Update Transaction

**Update `server/controllers/articlesController.js`:**

- Wrap `newArticle` + `inserImagestPath` + `newPreviewArticle` + `insertArticleCategories` in a single DB transaction (use `pool.connect()` + `BEGIN/COMMIT`). On failure, `ROLLBACK` + `removeImages` cleanup.
- For `updateArticle`, wrap `patchArticle` + `updatePreviewArticle` + `drop/insert categories` + `processAndSavePreviewImage` in transaction. If `processAndSavePreviewImage` fails, rollback DB and don't leave half-updated article.
- Validate `categories` is array of `{id:number, name:string}` via Zod before `JSON.parse`.

### 4.6 Pagination & Query Consistency

- All preview endpoints: `page`/`limit` via Zod `coerce.number().min(1).max(12)` (Phase 3 validator).
- Return `meta: { page, limit, totalPages, totalCount }` consistently.
- Add `sort` param (`newest` default, `popular` for featured) — prepare for Phase 5.

### 4.7 Update `server/package.json` & Env

Add to `server/.env.example`:
```
DATA_ROOT=./data
```

Add script:
```json
{ "scripts": { "clean:tmp": "node -e \"import('fs/promises').then(fs=>fs.rm('data/tmp',{recursive:true,force:true}))\"" } }
```

## 5. Files Created / Modified

| File | Action |
|------|--------|
| `server/utils/response.js` | Create |
| `server/services/storageService.js` | Create |
| `server/services/imagesServices.js` | Rewrite paths, async, MIME, cleanup |
| `server/controllers/authController.js` | Fix Google redirect, strip password, destroy session |
| `server/services/passwordService.js` | Fix boolean misuse, hash token |
| `server/models/passwordResetModel.js` | Hash token, unique email |
| `server/controllers/articlesController.js` | Add transaction, Zod categories |
| `server/controllers/mediaController.js` | Fix paths, traversal guard, caching |
| `server/routes/userRoutes.js`, `articlesRoutes.js` | Fix multer dest, fileFilter |
| `server/db/migrations/V5__password_resets_harden.sql` | Create |
| `server/config/env.js` | Add `DATA_ROOT` |
| `client/src/pages/components/GoogleLogin.jsx` | Update to fetch via session |

## 6. Verification Gate

```bash
npm --workspace=server run lint
npm --workspace=server test

# Auth
# 1. Google login → redirect to /google/success, no user JSON in URL, session works
# 2. Password reset: request for non-existent email returns 200 generic, no timing leak
# 3. Password reset token hashed in DB: psql -c "SELECT token FROM password_resets" → not plain uuid

# Files
# 1. Create article with 3 base64 images → 3 files in data/images/:uid/, no duplicates (hash dedup)
# 2. Create article with invalid MIME (e.g., svg) → 400
# 3. Create article then kill server mid-transaction → no orphan DB row or folder
# 4. GET /article/images/:uid/:articleid/:image → 200 with Cache-Control, second request with If-None-Match → 304
# 5. Path traversal: GET /article/images/../../etc/passwd → 400

# API shape
curl http://localhost:3000/article/previews?page=1&limit=12 | jq .success  # true
curl http://localhost:3000/article/previews?limit=100 | jq .meta.limit    # 12 (clamped)
```

## 7. Rollback

- Revert Phase 4 commit. `V5` migration can stay (additive).
- If `DATA_ROOT` breaks, set `DATA_ROOT=./data` and restart.

## 8. Exit Criteria

- [ ] No PII in Google redirect URL
- [ ] Password reset tokens hashed, per-email rate limited
- [ ] `saveImage` async, MIME-checked, size-limited, no `writeFileSync`
- [ ] Single `DATA_ROOT`, no `../../data` relative paths
- [ ] Article create/update atomic (DB + files)
- [ ] Media serving has `Cache-Control` + `ETag` + traversal guard
- [ ] All API responses `{success, data, meta}` consistent
- [ ] `npm test` green

## 9. Out of Scope

- Frontend fetch changes beyond `GoogleLogin.jsx` (Phase 5)
- S3 migration (Phase 6, optional)
- No new features (e.g., image CDN)
