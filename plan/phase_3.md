# Phase 3 — Backend Security & Architecture Hardening

> **Goal:** Fix every P0/P1 bug, add validation, secure sessions, and make the API predictable. No new features.

**Duration:** 4–5 days | **Risk:** Medium | **Branch:** `fix/phase-3-backend-hardening` | **Depends on:** Phase 2

---

## 1. Objective

The 2024 backend runs but is insecure and brittle. This phase makes it production-grade without changing business logic: env fails fast, CORS is correct, sessions persist, inputs are validated, errors are consistent, and SQL injection is gone.

## 2. Prerequisites

- Phase 2 merged (Pool + Flyway)
- `server/.env.example` exists (Phase 1)

## 3. Bugs & Debt Fixed Here

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **P0** | `models/userModel.js:93` | `SELECT ${col}` SQL injection | Allowlist + parameterized |
| 2 | **P0** | `server.js:34-42` | CORS `if(allowedOrigins) allow all` | Strict allowlist |
| 3 | **P0** | `server.js` | `express-session` MemoryStore | `connect-pg-simple` |
| 4 | **P0** | `middlewares/rateLimiter.js` | Defined but never `app.use()`'d | Wire globally + per-route |
| 5 | **P1** | `controllers/subscriptionController.js:117` | `req.param` typo | `req.params` |
| 6 | **P1** | `controllers/articlePreviewController.js:16` | `limit` reassigned on `const` | `let` + clamp |
| 7 | **P1** | `server.js:48-49` | `express.json 50mb` no limit rationale | Reduce + add `helmet` |
| 8 | **P1** | `config/config.js` | No validation, `SESSION_SECRET` can be undefined | Zod env schema |
| 9 | **P1** | All controllers | No input validation, inconsistent status codes | Zod schemas + AppError |
| 10 | **P1** | `middlewares/authMiddleware.js` | Helper not middleware, no `next()` | Real middleware |
| 11 | **P2** | `server.js` | No `helmet`, `compression`, `hpp` | Add |
| 12 | **P2** | `db/db.js` | No graceful shutdown | Add `SIGTERM` handler |

## 4. Steps

### 4.1 Env Validation (fail-fast)

**Create `server/config/env.js`:**

```js
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  SERVER_HOSTNAME: z.string().default('localhost'),
  SERVER_PORT: z.coerce.number().default(3000),
  PG_USER: z.string().min(1),
  PG_HOST: z.string().min(1),
  PG_DATABASE: z.string().min(1),
  PG_PASSWORD: z.string().min(1),
  PG_PORT: z.coerce.number().default(5432),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be >=32 chars'),
  SECURE_COOKIE: z.enum(['true','false']).default('false'),
  HTTP_ONLY: z.enum(['true','false']).default('true'),
  SAME_SITE: z.enum(['lax','strict','none']).default('lax'),
  FRONTEND_ADDRESS: z.string().url(),
  BACKEND_ADDRESS: z.string().url(),
  PASSWORD_SALTROUNDS: z.coerce.number().min(4).max(15).default(10),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  SERVICE_EMAIL_USER: z.string().email().optional(),
  SERVICE_EMAIL_PASS: z.string().optional(),
  NODE_ENV: z.enum(['development','production','test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid env:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
```

Update `server/config/config.js` to re-export from `env.js` (keep shape for backward compat, but source is `env`).

```bash
npm --workspace=server install zod
```

### 4.2 Security Middleware Stack

**Install:**

```bash
npm --workspace=server install helmet hpp compression express-mongo-sanitize
# rate-limit already installed
```

**Update `server/app.js` (order matters):**

```js
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import { applyRateLimit } from './middlewares/rateLimiter.js';

app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // images served cross-origin
  contentSecurityPolicy: false, // tune later, don't break Quill
}));
app.use(hpp());
app.use(compression());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // mobile/postman
    const allowed = env.FRONTEND_ADDRESS.split(',').map(s=>s.trim());
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' })); // was 50mb
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(applyRateLimit); // global 100/30min
```

**Per-route stricter limits** — update `middlewares/rateLimiter.js`:

```js
export const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, message: 'Too many auth attempts' });
export const writeLimiter = rateLimit({ windowMs: 15*60*1000, max: 50 });
```

Apply `authLimiter` to `/login`, `/signup`, `/password/*`; `writeLimiter` to `/article/create|update`.

### 4.3 Session Store — `connect-pg-simple`

```bash
npm --workspace=server install connect-pg-simple
```

**Update `server/app.js` session:**

```js
import pgSession from 'connect-pg-simple';
import pool from './db/db.js';
const PgStore = pgSession(session);

app.use(session({
  store: new PgStore({
    pool,
    tableName: 'session', // auto-created
    createTableIfMissing: true,
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // was true — don't create empty sessions
  cookie: {
    secure: env.SECURE_COOKIE === 'true',
    httpOnly: env.HTTP_ONLY === 'true',
    sameSite: env.SAME_SITE,
    maxAge: 1000*60*60*24*7, // 7d default, login extends to 30d if savesession
  },
  name: 'sparknest.sid',
}));
```

Add Flyway migration `V4__session_table.sql` if you prefer Flyway to create `session` table (optional — `createTableIfMissing` handles it).

### 4.4 Central Error Handling

**Create `server/middlewares/errorMiddleware.js`:**

```js
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ message, ...(err.details && { details: err.details }) });
}

export function notFound(req,res,next) {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
}
```

**Wire in `app.js` after routes:**

```js
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
app.use(notFound);
app.use(errorHandler);
```

Refactor controllers to `throw new AppError(400, ...)` instead of `res.status(400).json` + `return`. Wrap with `asyncHandler`.

### 4.5 Input Validation (Zod)

**Create `server/validators/*.js`:**

- `auth.validator.js` — `signupSchema {fname, lname, email: email(), password: min(8)}`, `loginSchema`
- `article.validator.js` — `createArticleSchema {user_id: number, title: min(3).max(255), body: min(1), preview_title, preview_subtitle, categories: array({id:number})}`
- `user.validator.js` — `updateUserSchema`, `comment.validator.js`, etc.

**Middleware `validate(schema)`:**

```js
export const validate = (schema) => (req,res,next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) return next(new AppError(400, 'Validation failed', result.error.flatten()));
  // optionally assign parsed data
  next();
};
```

Apply to every `POST/PATCH` route. This also fixes `limit` bug — validate `page/limit` as `coerce.number().min(1).max(12)`.

### 4.6 Fix P0/P1 Bugs

1. **SQL injection `getUserDetail(id,col)`** — `server/models/userModel.js:91-96`:

   ```js
   const ALLOWED_COLS = new Set(['username','email','fname','lname','avatar','bio','region']);
   export async function getUserDetail(id, col) {
     if (!ALLOWED_COLS.has(col)) throw new AppError(400, `Invalid column: ${col}`);
     const query = `SELECT ${col} FROM users WHERE id = $1`; // now safe
     // ...
   }
   // Better: replace call sites with explicit `getUserUsername(id)` etc. and deprecate generic.
   ```

2. **`req.param` typo** — `controllers/subscriptionController.js:117`:

   ```js
   const { email } = req.params; // was req.param
   ```

3. **`limit` const reassignment** — `controllers/articlePreviewController.js:16,47,79`:

   ```js
   let { page = 1, limit = 12 } = req.query;
   page = Math.max(1, parseInt(page,10) || 1);
   limit = Math.min(12, Math.max(1, parseInt(limit,10) || 12));
   // Or use Zod validator and remove manual clamp
   ```

4. **CORS** — fixed in 4.2.

5. **Rate limiter wiring** — fixed in 4.2.

### 4.7 Auth Middleware Hardening

**Rewrite `server/middlewares/authMiddleware.js`:**

```js
export function requireAuth(req,res,next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return next(new AppError(401, 'Not authenticated'));
}

export function requireOwner(paramName = 'id') {
  return (req,res,next) => {
    const current = req.session?.passport?.user;
    const target = req.params[paramName] || req.body[paramName] || req.body.id || req.body.user_id;
    if (!current) return next(new AppError(401, 'Not authenticated'));
    if (String(current) !== String(target)) return next(new AppError(403, 'Not authorized'));
    next();
  };
}
```

Replace inline `if (!req.isAuthenticated())` checks in controllers with `requireAuth` middleware on routes.

### 4.8 Graceful Shutdown & Logging

**Add to `server/server.js`:**

```js
import pool from './db/db.js';
const server = app.listen(env.SERVER_PORT, env.SERVER_HOSTNAME, ...);

const shutdown = async () => {
  console.log('Shutting down...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

Optional: add `pino` + `pino-http` for structured logs (defer to Phase 6 if time).

### 4.9 Update `server/package.json` Scripts

```json
{ "scripts": { "dev": "nodemon server.js", "start": "node server.js" } }
```

Ensure `nodemon` watches `app.js` + `config/`.

## 5. Files Created / Modified

| File | Action |
|------|--------|
| `server/config/env.js` | Create (Zod) |
| `server/config/config.js` | Update to use `env` |
| `server/app.js` | Add helmet/hpp/compression/cors fix/session store/error handler |
| `server/server.js` | Add graceful shutdown |
| `server/middlewares/errorMiddleware.js` | Create |
| `server/middlewares/authMiddleware.js` | Rewrite |
| `server/middlewares/rateLimiter.js` | Add `authLimiter`, `writeLimiter` |
| `server/validators/*.js` | Create (5 files) |
| `server/models/userModel.js` | Fix SQLi |
| `server/controllers/subscriptionController.js` | Fix `req.param` |
| `server/controllers/articlePreviewController.js` | Fix `limit` const |
| `server/routes/*.js` | Add `validate` + `requireAuth` + limiters |
| `server/db/migrations/V4__session_table.sql` | Create (optional) |

## 6. Verification Gate

```bash
npm --workspace=server run lint
npm --workspace=server test

# Env fails fast
SESSION_SECRET=short npm --workspace=server run dev  # should exit with "Invalid env"

# CORS
curl -H "Origin: https://evil.com" http://localhost:3000/ -i  # should be blocked
curl -H "Origin: http://localhost:5143" http://localhost:3000/ -i  # should pass

# Rate limit
for i in {1..101}; do curl -s http://localhost:3000/article/previews | head; done  # 101st = 429

# SQLi attempt
curl "http://localhost:3000/user/details/1?col=password"  # should 400, not leak

# Session persists after restart
# login → restart server → GET /user/details/:email still 200 (pg store)

# Validation
curl -X POST http://localhost:3000/signup -H "Content-Type: application/json" -d '{"email":"bad","password":"123"}'  # 400 Validation failed
```

## 7. Rollback

- Revert Phase 3 commit. DB `session` table can stay (harmless).
- If `helmet` breaks images, set `crossOriginResourcePolicy: false` temporarily.

## 8. Exit Criteria

- [ ] `SESSION_SECRET` <32 chars → boot fails with clear error
- [ ] CORS allows only `FRONTEND_ADDRESS`, blocks others
- [ ] `MemoryStore` gone, sessions survive restart
- [ ] `GET /article/previews?limit=100` clamps to 12, no crash
- [ ] `req.param` typo fixed, unsubscribe works
- [ ] No `SELECT ${col}` without allowlist
- [ ] All `POST/PATCH` routes validated, errors are `{message, details}` consistently
- [ ] `npm test` green, no `MemoryStore` warning in logs

## 9. Out of Scope

- File storage abstraction (Phase 4)
- Frontend changes (Phase 5)
- Docker/CI (Phase 6)
