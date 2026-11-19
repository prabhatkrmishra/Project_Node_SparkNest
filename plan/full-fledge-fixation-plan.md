# SparkNest — Full Fixation Plan

**Author:** local audit agent
**Date:** 2026-11-19
**Scope:** client (React/Vite), server (Express/pg), local seeded environment
**Evidence base:** 54 full-page screenshots (desktop 1440×900, mobile 390×844) of 26 routes ×2 viewports, plus targeted DOM/geometry probes in Chromium (headless) and curl checks of API + static assets.
**Severity model:** Blocker / High / Medium / Low (per `ui-quality-and-visual-validation`).

---

## 0. How to reproduce this audit

```bash
# prerequisites: docker running, node >=20.18, seeded DB (see below)
docker start sparknest-pg           # postgres:16-alpine, db/user sparknest/pkm774, port 5432
cd server && npm run db:migrate && npm run db:seed   # dummy data; login: alice@example.com / Password123!
cd server && node server.js          # API on :3100 (PORT 3000 is occupied on this machine by another app)
cd client && npm run dev             # Vite on :5143, client/.env sets VITE_API_URL=http://localhost:3100
node audit.mjs                       # playwright script, see appendix
```

Then view `/tmp/opencode/audit/shots/*.png` and `/tmp/opencode/audit/report.json`.
Each finding below cites its screenshot (`desktop-*.png` / `mobile-*.png`) and, where relevant, the DOM probe result.

**Audit environment caveats**

- Seed data uses avatar images as article preview images, so hero/preview imagery looks like cartoon faces — that is a seed artifact, not a rendering bug.
- Mail flows (`/send/message`, `/subscribe/newsletter`, password reset email) were exercised only to the point visible without SMTP credentials; `SERVICE_EMAIL_USER`/`SERVICE_EMAIL_PASS` are unset, so actual mail delivery is unverified.
- The dev DB was truncated and re-seeded during setup; local only.

---

## 1. Verified working (do not break)

| Area | Evidence |
|---|---|
| Boot: migrations V1–V5 auto-apply, featured articles computed, cron registered | `server.js` logs during audit |
| Login via web form (`alice@example.com`/`Password123!`) → redirect to `/profile/articles`; session cookie `sparknest.sid` set | `desktop/mobile-login-submit.png` |
| Authenticated profile pages (articles/collections/liked/details) render with edit/delete affordances | `desktop-profile-*.png`, `mobile-profile-*.png` |
| Article view: title, meta, body, tags, author box, prev/next, comment list + add comment form render | `desktop-article-view-1.png`, `-2`, `mobile-article-view-1/2.png` |
| Settings pages render (General/Profile/Password/Notifications/Delete) | `desktop-settings*.png`, `mobile-settings*.png` |
| Create-article editor (Quill) renders and takes input | `desktop-create.png`, `mobile-create.png` |
| Featured hero slider, swiper bullets, Read More links | `desktop-home.png` (hero), `cut-mobile-home-top.png` |
| `/api/article/previews`, `/api/articles/featured`, `/api/articles/saved/:id` return 200 with session | curl during audit |
| Avatar/image pipeline serves seeded files | curl: 200 for `/get/avatars/avatar-1.jpg`, `/article/images/...` |
| Signup/Login forms (mobile) render cleanly | `mobile-signup.png`, `mobile-login.png` |
| `/styles` living style guide renders | `desktop-styles.png`, `mobile-styles.png` |
| Contact page layout renders; 404 renders | `desktop-contact.png`, `desktop-404.png` |

Console/network errors during audit: only the 400s listed in F-1. No other `http>=400` or `pageerror` entries in `report.json`.

---

## 2. Findings (every verified defect)

### F-1 · BLOCKER — Public user profile `/user/:usertag` is completely broken

**Evidence:** `desktop-user-alice.png`, `mobile-user-alice.png` — heading renders as **“undefined undefined”**, no bio, no articles. Playwright report shows `http-400` on `GET /public/user/alice_carter` and `GET /article/profile/preview/alice_carter?...`.

**Root cause:** client treats the route param as a **username** (`UserProfile.tsx`: `GetUserPublic(usertag)`, `getProfileArticlePreviews(usertag)`), but the server contract is numeric id:

- `server/validators/user.validator.js` → `getUserPublicSchema.params.id = z.coerce.number().int().positive()`
- `server/routes/userRoutes.js` → `GET /public/user/:id`
- `server/models/userModel.js` → `SELECT fname, lname, username, region, bio, avatar FROM users WHERE id = $1`
- `server/controllers/articlePreviewController.js` → `profileParamSchema` also requires numeric `id`; `articlePreviewModel.fetchArticlePreview(id, …)` queries by numeric `user_id`.

So a username never validates (400), and even numeric ids work but bypass the username-keyed UX the client wants.

**Impact:** any inbound link to a public profile — a core social feature — is dead. `<img src={profile.avatar}>` also renders a broken image (external avatar URL never set because `profile = {}`).

**Fix (structural, pick one and apply consistently):**

1. Preferred: make the API username-addressed. Add `GET /public/user/:username` and `GET /article/profile/preview/:username` with `z.string().min(1).max(30)`; resolve `username → users.id` inside the model (`SELECT id FROM users WHERE username = $1`) and reuse the id-based queries; update OpenAPI spec, validators, and any tests.
2. Or (less aligned with client UX): change the client route to `/user/:id` everywhere (header author links, comment author links) — touches many call sites; not recommended.

Add a regression test: `GET /public/user/alice_carter → 200` with seeded DB (supertest), and an e2e check for `/user/alice_carter` rendering the name.

---

### F-2 · HIGH — Bootstrap CSS imported **after** the theme stylesheet; every themed `.row` is broken

**Evidence:** footer text clipped at left on **every desktop page** (`desktop-home.png` → “ategories”, “ite Links”; same in article/contact/about/styles). Measured: `.s-footer__subscribe.row` `margin-left/right = -7.5px`, `width:1000px`, `x=-7.5`; `.entry-wrap.row` gets `x=-7.5` as well. (`cut-home-footer.png`, probe `probe2-tmp.mjs`.)

**Root cause:** `index.html` loads `styles.css` via `<link rel="stylesheet" href="./src/assets/styles/styles.css">` in `<head>`, then `App.tsx` imports `bootstrap/dist/css/bootstrap.min.css` at the **end** of the bundle. Same specificity (`0,1,0`) means Bootstrap wins on conflicts. Bootstrap's `.row` sets `--bs-gutter-x:1.5rem; margin-inline: calc(var(--bs-gutter-x) * -0.5)` (−0.75rem = **−7.5px** at the theme's 62.5% html font-size) plus `display:flex; flex-wrap:wrap`, defeating the theme's `.row { width:92%; max-width:1200px; margin:0 auto }` (theme line ~593).

The author already worked around one symptom (“Bootstrap's .row … pushed About/Contact content against the left edge. Re-center the templated row…” — styles.css ~6942) but only for `.entry-wrap` and `.content-primary`; the footer, and any other `.row` not re-normalized, remains shifted.

**Impact:** global ~15px layout drift on desktop; clipped footer headings; any Bootstrap class collision silently re-styles theme elements (`.d-flex`, `.form-control`, `.btn`, etc.).

**Fix:**

1. Load Bootstrap **before** the theme: move `import "bootstrap/dist/css/bootstrap.min.css"` into `index.html` as a `<link>` **before** `styles.css` (or into a CSS chain where theme is last). In dev, keep `styles.css` as the last `<link>`.
2. Audit all collisions after reorder: `.row`, `.column` (theme) vs `.col-*`/Bootstrap grid — verify no page regresses (About, Contact, Settings, Footer).
3. Better: aggressively narrow Bootstrap usage to react-bootstrap components; longer term consider dropping Bootstrap CSS entirely in favor of the theme + targeted utilities, and drop MUI where it only wraps simple form controls.
4. Remove the now-redundant workaround block for `.row.entry-wrap` only after verification.
5. Add a visual-regression check (Playwright screenshot of `/` footer region) so layer order can't silently flip again.

---

### F-3 · HIGH — Home article grid is invisible until a scroll event fires

**Evidence:** `desktop-home.png` shows ~1,400px of blank white space then a lone pagination control. DOM probe: 5 `.brick.entry` elements at `y≈1935–2610` with **`visibility:hidden; opacity:0`**. No console errors, no failed requests. `mobile-home.png` shows the same (giant blank area under the hero).

**Root cause:** theme reveal mechanism (`client/src/pages/Index.tsx` → `.s-pagewrap.ss-home` + `RenderPreviews` → `[data-animate-block]`/`[data-animate-el]` + `AnimateBricks.tsx` → scroll listener adds `ss-animated`). On home, bricks only become visible when `window.scroll` crosses `triggerTop = offsetTop − 0.9×viewportHeight`. Full-page screenshots never scroll → bricks stay hidden. Worse: the reveal is all-or-nothing per block and relies on hand-rolled offset math (`scrollY > triggerTop && scrollY <= blockSpace`) — deep links, scroll restoration, or a scroll listener attached after render can leave content permanently invisible.

**Impact:** first-time user on home sees an empty page; content “appears” only after scrolling past an arbitrary threshold; any automation/fullPage screenshot of `/` looks broken (and search-engine/preview tooling sees nothing either).

**Fix:**

1. Replace scroll-threshold logic with `IntersectionObserver` (rootMargin `0px 0px -10% 0px`), unobserve after reveal, and reveal immediately on mount for blocks already in the initial viewport.
2. Belt-and-braces: if IO is unavailable or JS fails, bricks must default to visible — i.e., invert the CSS (`.brick { opacity:1 }`, hide only via a `pre-reveal` class added by JS).
3. Remove the empty-grid/blank-space dependency on JS entirely for `prefers-reduced-motion`.
4. Keep `imagesLoaded` + Masonry only for column balancing; never gate visibility on it.
5. Regression test: Playwright assert `.brick` computed `opacity === "1"` on `/` after load without scrolling.

---

### F-4 · HIGH — Footer newsletter signup is impossible for anonymous visitors

**Evidence:** `POST /subscribe/newsletter` → `401 Not authenticated` (curl during audit); the footer form on **every page** silently does nothing for logged-out users, with no error shown.

**Root cause:** `server/routes/subscriptionRoutes.js` mounts `POST /subscribe/newsletter` behind `requireAuth` + `subscribeSchema`; `subscriptionController.subscribe` additionally requires `req.isAuthenticated()`. The footer component (`client/src/pages/components/Footer.tsx`) POSTs regardless of auth state and only handles `response.status === 200` (alerts "Subscribed newsletter !"); non-200 paths throw an unhandled rejection with no user feedback.

**Impact:** core growth loop (email capture) is dead for the exact audience it targets; silent failure + console noise; accessibility/UX failure (no message).

**Fix (structural, pick one):**

1. Make `POST /subscribe/newsletter` public with a minimal `{ email, type }` zod schema, rate-limit it (`writeLimiter`/`authLimiter`), store `newsletter=true`, and return explicit 200/409/400; OR
2. Keep it auth-only and change the footer to render the form only when logged in (and show a "Log in to subscribe" state otherwise).
3. Regardless: `Footer.tsx` must surface errors (inline message or `alert` with the server `message`), never an unhandled rejection; disable the submit while in-flight; basic email validation client-side.
4. Add e2e/integration test for anonymous subscribe (option 1) or footer gating (option 2).

---

### F-5 · HIGH — Settings → Notifications: Update button overlaps the checkbox label

**Evidence:** `desktop-settings-notifications.png` (crop `cut-notifications2.png`): text `…parkNest` is clipped by the black `Update` button sitting on the same line. Probe `probe3-tmp.mjs`: label x=381 w=234 (ends 615), button x=615 w=120 h=50, y-overlap 481–531 vs label 495–513 — both are `inline-block` siblings in the same `<form>`, so the button's inline `margin-top:100px` does **not** push it to a new line.

**Also in this file (`Notifications.tsx`):**
- `window.location.href == "/profile"` (comparison, not assignment) — the intended redirect for null user is a no-op. Same `==` pattern in `DeleteAccount.tsx`, `General.tsx`, `Password.tsx`.
- `<span className="label-text" htmlFor="newsletterSignup">` — invalid attribute on `<span>`; should be a real `<label htmlFor>` (the outer `<label>` already wraps the input, so just drop `htmlFor` and make the inner span a plain span or merge into the label).
- `useLayoutEffect` + `user.email` dependency reads `user` during render (`Cookies.get` in render body) — fragile; move cookie reads into state/effect.

**Fix:** `.profile-label-styles { display: block }` (or wrap the button in its own block container / add `<br/>`-free flex column with gap); replace all `window.location.href == "/profile"` with proper `navigate("/profile")` or `window.location.assign("/profile")`; semantic label markup; error handling parity with F-4 for the subscription PATCH.

---

### F-6 · MEDIUM — Mobile hero: unreadable text over light image; card overlaps image badly

**Evidence:** `mobile-home.png` (crop `cut-mobile-home-top.png`): white "SparkNest" logo sits on the light-green hero image (contrast fail); the white featured-article card is placed over the image area with `left:5%; right:10%; top:15%; bottom:10%` (≤1290px rule) overflowing the 390px viewport awkwardly; subtitle/title cramped; image panel only 66% wide at ≤600px leaving a dead strip; swiper pagination bullets drop to bottom with `color: var(--color-white)` which may sit on the white card.

**Root cause:** the hero is an absolutely-positioned two-panel desktop layout (`.hero__entry-image` + `.hero__entry-text-inner` with `position:absolute; left:52%` etc.) with only coarse media-query overrides; at 390px the card's fixed offsets don't shrink proportionally. The seeded images (light cartoons) make the contrast worst-case; real dark images will mitigate the logo but not the geometry.

**Fix:**
1. At ≤700px: convert hero to a stacked layout — image as a `background` on top (or `<img>` with `object-fit: cover`, height ~38vh), card below it in normal flow (no absolute positioning), `padding: var(--space)` wrapper, title `--text-multiplier: 0.44`, swiper bullets below the card; logo gets a solid/gradient strip behind it (or switch header to solid background ≤700px — see F-13 for mobile menu).
2. Add `text-wrap: balance` on `.hero__entry-title`; cap `max-height` clipping; verify `overflow:hidden` on `.hero` at small heights (100vh with absolute children clips content on short landscape phones — use `min-height` + `overflow:auto`).
3. Replace seeded-avatar-as-featured-image handling so a missing/invalid image falls back to a placeholder (see F-11).
4. Verify against 390/360/320px and landscape (height 380px) viewports.

---

### F-7 · MEDIUM — `/categories` renders ~313 duplicated brick groups; 14,000px page (37,000px on mobile)

**Evidence:** `desktop-categories.png` (1440×13696), `mobile-categories.png` (390×37356). Real-scale crop `cut-categories-top.png` shows: categories grouped by **every word** of every name (e.g. "Tech", "Technology", "Educational Technology" each appear; "Health Technology" under both Health and Technology), each group in a 4rem-padded `.brick` with `width:25%` floats and no JS masonry on this page (`shouldAnimate` never reached because the brick count never equals the group count due to timing/ref mismatch — see code below).

**Root cause (behavior/design):** `Categories.tsx` `groupCategories()` splits `category.name` on spaces and appends the category to **each** word's bucket. 305 categories → 313 groups (almost one per word, most singletons). The page also re-mounts `MasonryEffect`/`AnimateBricks`/`MoveToEffect` only when `brickElements.length === Object.keys(groupedCategories).length` (compares counts; race-prone) and logs `console.log(hasCategories)`.

**Impact:** unusable index (unbounded scroll, massive duplication, no hierarchy); also a11y (300+ landmark articles, no skip navigation); perf (300+ DOM bricks with floats; fullPage render ~13.7k px tall).

**Fix (structural redesign):**
1. Group by a **single canonical key**: first word only if it's a known root (Technology, Health, Science…), or better — return a curated top-level mapping from the server (e.g. `/fetch/categories/all` already returns the list; group client-side by the category's `parent`/L1 term if the schema supports it, else a static allowlist of roots and an "Other" bucket), or simply render an A–Z alphabetical index with anchor links (`a#technology`) — far more usable at this taxonomy size.
2. Replace `.brick`/float masonry here with a simple responsive CSS-columns (`.categories-grid { columns: 3 260px }`) or flex-wrap grid; drop the `data-animate-*`/Masonry JS for this page.
3. Remove `console.log`; make the brick-count check unnecessary (no masonry).
4. Add search/filter box ("Filter categories…") — 305 items need it.
5. Keep `.categories-ul/.categories-li` styles; remove unused `.brick` reuse.

---

### F-8 · MEDIUM — `CREATE COMMENT` button is a bright-blue Bootstrap button (and react-bootstrap Toast)

**Evidence:** `desktop-article-view-2.png` (crop `cut-scan3.png`) — vivid blue `.btn-primary` pill, vs the theme's black `.btn--primary`. `Comments.tsx` imports `Button` from `react-bootstrap/Button` (variant default `primary`) and `Toast` from `react-bootstrap`.

**Impact:** visual inconsistency (two competing design systems on one screen); extra JS weight; Bootstrap `.btn` conflicts with theme `.btn*` (see F-2).

**Fix:**

1. Replace `react-bootstrap/Button` with the theme's `<input type="submit" className="btn btn--primary btn--large u-fullwidth" value="Create comment">` pattern used by `CreateComment.tsx`, or a styled `<button className="btn btn--primary">`.
2. Replace `react-bootstrap/Toast` with a plain success message (reuse `SuccessMessage` pattern) or remove (comment appears inline).
3. Drop `react-bootstrap` entirely (audit remaining usages: `Comments.tsx`, `CreateComment.tsx` Modal) and replace `Modal` with a lightweight in-theme modal or a route (`/session/new?redirect=...`).
4. Verify `.btn--primary` computes to black with white text after F-2 reorder.

---

### F-9 · MEDIUM — TanStack Query Devtools toggle is rendered in the browser (all pages)

**Evidence:** floating colorful circle, bottom-right, `z-index:100000`, classes `tsqd-open-btn-container` on **every page** including 404 (e.g. `cut-float-404.png`). It's the `@tanstack/react-query-devtools` open button (`initialIsOpen={false}` only collapses the panel).

**Impact:** shipped UI chrome that isn't the product; in production builds the devtools bundle is also shipped unless conditionally excluded; confusion for end users; covers content on small screens.

**Fix:**
1. Render devtools only in development: `{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}` and gate the import with a dev-only wrapper (or `React.lazy` behind `import.meta.env.DEV`).
2. Ensure production bundle excludes it (check `npm run build` output for the devtools chunk; add `manualChunks`/drop via conditional import).
3. Verify 404 and all pages render clean in prod build (`npm run preview`).

---

### F-10 · MEDIUM — `/profile/details` deep-link silently bounces; `navigate()` during render

**Evidence:** audit `finalUrl` shows `/profile/details → http://localhost:5143/profile/articles`. `Details.tsx` requires `Cookies.get("setProfile")` else `navigate("/session/new")` (then Login sees `sessionLogged` cookie and redirects to `/profile` → `/profile/articles`). Direct hit = unexplained redirect chain; the completion-flow flag lives in a JS-readable cookie shared with Settings/Profile.
`Profile.tsx` also calls `navigate()` in the render body (side-effect during render) twice (`!login` → `/session/new`, `user == null` → `logout()`).

**Impact:** a user completing their profile out-of-band (refresh after error) is thrown out of the flow; render-phase navigation triggers React warnings (the codebase even disables the console error for "Cannot update a component" instead of fixing the cause — see F-15).

**Fix:**
1. Replace cookie-flag gating with real auth state from the session (`/user/details/:email` or a `GET /auth/me` endpoint returning `{ id, email, username, region, ... }`); render a loading state until resolved.
2. Move all `navigate()` calls in `Profile.tsx`/`Settings.tsx`/`Details.tsx` into `useEffect`.
3. `/profile/details` should be reachable by any authenticated user (it's just the edit-profile form); keep a `?firstRun=1` hint instead of a cookie gate, or simply always allow it.
4. Remove the `console.error` monkey-patch (it masks real "Cannot update …" bugs) once render-phase navigation is gone.

---

### F-11 · MEDIUM — Article page: dead vertical space, unlabeled save/like actions, seed-driven imagery

**Evidence:** `desktop-article-view-1.png` / `-2`, `mobile-article-view-1/2`:
- ~700–900px of empty space between body end and the Tags row (`.tags-save-like` / `.content-primary`). Likely reserved blocks (share row? recommended articles?) rendering empty.
- Save/Like icons (`.save_and_like` / `Main.tsx`) render as two small outline icons with no count, no label, no state text (active vs inactive indistinguishable at a glance — `Like.tsx`, `Save.tsx`).
- Author name renders as `Bob.Nguyen` (fname.lname joined with `.` — see `entry__author-name` render).
- Comments render fine, but comment avatars hot-link to `/get/comments/default_avatar.jpg` (works via seed) and `date-fns` format renders `11/19/2026` (locale-naive).

**Fix:**
1. Inspect `.content-primary`/`.tags-save-like` reserved space in styles.css (search `min-height` / `padding-bottom` on `.entry__content` and `.ql-editor`); collapse unused blocks; ensure the empty-state (no related articles) isn't reserving height.
2. Save/Like: render `Icon + count + text` ("Save"/"Saved", "Like 3"/"Liked 3"), `aria-pressed` for toggle state, min 44px targets, counts from `GET /articles/checksaved|checkliked`.
3. Author name: `fname + " " + lname` with proper spacing; same in `UserProfile`.
4. Image fallbacks: add a local `/images/sample-image.jpg` (exists in `client/public/images/`) as `onError` fallback for preview/body/avatar images everywhere (`<img onError>`), and in `ArticleImages` handling.
5. Date formatting: `format(date, "MMMM d, yyyy")` with locale-consistent output ("January 12, 2026" is already used on the view page — keep; fix comment timestamps to match).

---

### F-12 · MEDIUM — Settings → General: raw “User ID” exposed in an editable-looking field

**Evidence:** `desktop-settings.png`, `mobile-settings.png` — “User ID: 1” shown in a text input inside the General form.

**Impact:** internal primary keys leaked to UI for no reason; looks editable (it is `disabled`? verify — either way it invites confusion); inconsistent with the rest of the form styling.

**Fix:** remove the User ID field (or render `username`/`member since`); if an id is truly needed for support, show it in Settings → “About/Diagnostics” as static text, never an input; ensure all remaining General inputs are clearly labeled and the disabled state is visually distinct.

---

### F-13 · LOW — 404 page renders without site chrome

**Evidence:** `desktop-404.png`, `mobile-404.png` — bare centered text, no Header/Footer, only the devtools bubble. Users hitting a dead end lose navigation.

**Fix:** wrap the NotFound in the standard layout (Header + Footer), add `<meta name="robots" content="noindex">`, keep the serif “404” but add a link back home (“Browse articles”), consistent with `.s-content--page` typography.

---

### F-14 · LOW — External hot-linked assets (icons8 CDN, Google Fonts without fallback strategy)

**Evidence:** `UserProfile.tsx`, `Profile.tsx` use `https://img.icons8.com/ios-filled/...` images (user/marker icons); `index.html` preconnects to Google Fonts; styles reference fonts with `swap` (good) but no local fallback for icons.

**Impact:** third-party availability/tracking/performance; offline dev shows broken images; CSP (`helmet` CSP disabled) cannot tighten later.

**Fix:** replace icons8 images with inline SVG or local assets in `/public/images/icons/` (e.g. `user-circle.svg`, `map-pin.svg`); consider self-hosting Inter/Castoro/JetBrains Mono via `@fontsource/*` (aligns with an offline-capable, CSP-friendly build) or document the deliberate Google Fonts choice.

---

### F-15 · LOW — Hygiene: `@ts-nocheck` everywhere, console noise, dead code, `==` bugs

**Evidence:** 40 `console.*` in client, 116 in server; `// @ts-nocheck` on nearly all components; `==` vs `===` inconsistent; unused files (`test.js`, `ImageResize` compiled artifacts? `client/test.js`); `Profile.tsx` monkey-patches `console.error` to hide React warnings (see F-10); `@tanstack/react-query-devtools` in prod dependency graph; no UI tests beyond `App.test.tsx` smoke; CI workflow directory empty (`.github/workflows/`).

**Fix (as part of Phase 4 below):** remove `@ts-nocheck` incrementally (start with api/types), replace `==` with `===` in touched files, gate dev-only code, delete dead files, add `npm run lint` gate; keep console noise to `warn/error` in prod via `pino` (server) and a tiny `logger` wrapper (client); restore `console.warn` and fail on new `@ts-nocheck` (eslint rule) — one PR at a time, no big-bang.

---

## 3. Structural (non-symptom) changes required

These are the architectural root fixes; individual F-* symptoms largely disappear once these land.

### 3.1 CSS layering & design-system strategy
- One source of truth for order: `bootstrap (or none) → katex → quill → highlight.js → styles.css` (theme last).
- Decide Bootstrap fate: (a) remove entirely (preferred; react-bootstrap only used in Comments + Modals), or (b) keep and re-audit every collision. Never both global Bootstrap and the theme owning `.row/.btn/.d-flex`.
- Replace ad-hoc inline styles (`style={{ paddingTop: "130px" }}`, `profile-button-styles`, `u-quartorwidth`) with theme utility classes or CSS variables colocated in `styles.css`.
- Add a short `styles.css` header comment documenting import order + why layer order matters.

### 3.2 Component consolidation
- One Button system (`.btn`), one Modal path (route-based or single in-theme modal), one Toast/Alert (SuccessMessage/ErrorMessage), remove react-bootstrap + MUI where redundant.
- One responsive layout grid (theme `.row/.column`), delete Bootstrap grid usage.
- One animation reveal path (IntersectionObserver, `Reveal` wrapper) replacing `AnimateBricks`/`ScrollDown`/`MoveToEffect` hand-rolled math.

### 3.3 Auth/session UX truth
- Client currently gates pages on `Cookies.get("sessionLogged")` (a JS-readable flag) while the server holds the real session. Introduce `useAuth()` hook + `GET /auth/me` (returns public user or 401) as the single source; keep the cookie flag only as an optimistic hint, validated by `/auth/me`.
- Render-phase `navigate()` banned; loading states while auth resolves.

### 3.4 API/client contract hygiene
- Public profile endpoints username-addressed (F-1); OpenAPI spec updated; zod schemas shared language (client may reuse zod for parsing responses where practical).
- All public GETs (`/public/user/:username`, previews, featured, categories) stay unauthenticated; all private routes behind `requireAuth` consistently (check `articlesRoutes` DELETE `/article/delete` currently has **no** auth middleware! — see 3.5).

### 3.5 Security defaults (found while auditing)
- `DELETE /article/delete` (`articlesRoutes.js`) and several other routes declared “Private” in comments have **no** `requireAuth`; some controllers self-check the session, others rely solely on validation → enforce `requireAuth` at the router layer for every route a normal user can't use anonymously (articles CUD, comments CUD, saved/liked, profile mutations, admin-ish category writes if any).
- `helmet` CSP disabled globally (`contentSecurityPolicy: false`) — enable a nonce/hash CSP after fonts/icons are self-hosted (F-14) and Quill/KaTeX inline styles are audited; at minimum set `frame-ancestors`.
- Rate limiters exist but verify `applyRateLimit` covers `/send/message`, `/subscribe/newsletter`, password endpoints (some paths use `writeLimiter`/`authLimiter` already — good; keep, and make `/subscribe/newsletter` public-but-limited per F-4).
- `SESSION_SECRET` default in env.js is a placeholder — fine for dev; document that prod must set it (docker-compose.prod should fail fast; it does via zod min(32) only when unset→default… actually env.js provides `default` for SESSION_SECRET, which defeats fail-fast in prod — make the default test-only: only apply when `NODE_ENV=test`).

### 3.6 Data/seed quality (for realistic previews)
- Seed copies avatar files as preview images (`m-600.jpg` etc. are avatar copies) — pathologically small/square thumbnails. Extend `db/scripts/seed.js` to copy `client/public/images/sample-image.jpg` (or generate a few test JPEGs with sharp) as previews/featured so layout, masonry heights, and hero crops can be evaluated honestly.
- Seed should also fill `bio`, `region`, varied avatar choices per user (it does), and ≥2 comments per article with varied authors (it does).

---

## 4. Fix phases & verification gates

Order matters: Phase 1 unblocks everything; each phase is mergeable and has a gate.

### Phase 1 — Critical rendering & auth correctness (P0) · ~1–2 days
Tasks: F-1 (username API + tests), F-2 (CSS layer order + full-page re-screenshot sweep), F-3 (IO reveal), F-4 (public newsletter endpoint + footer error surface), F-5 (settings notifications + `window.location.href ==` ×4), F-9 (devtools gating), F-10 (auth hook + render-navigate removal).
**Gate:** `/user/alice_carter` renders name+articles (Playwright assert); footer headings unclipped at 1440/1280/1024; home grid visible without scroll; anonymous newsletter subscribe returns 200/400/409 with UI feedback; settings/notifications no overlap; **all 54 audit screenshots re-taken, 0 console errors, 0 http≥400** (except route-only-401 paths that are expected).

### Phase 2 — Responsive & visual system (P1) · ~2–3 days
Tasks: F-6 (mobile hero), F-13 (404 chrome), mobile sweep at 320/360/390/768/1024/1440 for header/nav/menu (check `.s-header__menu-toggle` behaviour ≤900px — not verified in this audit, test it), footer grid, settings menu, gallery/`.brick` columns; F-8 (react-bootstrap removal); F-11 (save/like counts + aria-pressed; dead-space removal); F-12 (User ID removal); F-7 (categories redesign).
**Gate:** Playwright matrix at all breakpoints passes (no horizontal overflow `scrollWidth <= clientWidth`, no overlapping interactive elements measured via bounding-box checks); Lighthouse “layout shift” clean on `/`; visual-diff vs baseline ≤ agreed thresholds for untouched pages.

### Phase 3 — Asset & CSP hardening (P1) · ~1 day
Tasks: F-14 (icons8→local SVG, self-host or document fonts), helmet CSP enable with report-only first, `SESSION_SECRET` fail-fast outside test, `requireAuth` on articles/comments/saved/liked mutations, OpenAPI spec refresh (`server/docs/openapi.yaml`), seed preview images via sharp.
**Gate:** `npm run build && npm run preview` clean; zero third-party requests except declared fonts; CSP report-only shows no violations in full audit crawl.

### Phase 4 — Hygiene, tests, CI (P2) · ~2–3 days
Tasks: F-15 (ts-nocheck removal cohort-by-cohort, `===` migration, console cleanup), auth/session tests (login/logout/me), component tests for RenderPreviews/Footer/Settings Notifications, API contract tests (username routes), `.github/workflows/ci.yml` (install, lint, typecheck, unit+integration, build, audit screenshots artifact upload), dependabot already present — wire auto-merge for patch.
**Gate:** CI green on PR; `npm test` covers the previously-broken contracts; `npm run typecheck` and `npm run lint` clean with `@ts-nocheck` count = 0.

### Phase 5 — Design polish & a11y (P3) · ongoing
Tasks: contrast audit (mobile hero logo, `.entry__meta` gray-15 on white, pagination bullets), focus-visible rings, `prefers-reduced-motion` for brick/hero/swiper, keyboard order (skip link first), semantic headings on `/categories`, `lang` + `dir`, alt texts, 44px targets on pagination/save/like.
**Gate:** axe-core scan (Playwright) zero serious violations on top-visited routes; manual keyboard pass of login → create → publish flow.

### Not now (explicitly deferred)
- Redesigning the visual language (colors/spacing), migrating off the "Canvas" theme wholesale, PWA/offline, i18n, real analytics.

---

## 5. Risks & rollback

- **CSS reorder (F-2)** may regress pages tuned against Bootstrap-last (About/Contact likely fine; Settings dropdowns use Bootstrap JS — verify collapse/dropdown behavior). Rollback = revert single commit; gate screenshots on PR.
- **Username API change (F-1)** touches public route contract — keep old numeric route working (301/alias) for one release.
- **Public subscribe (F-4)** opens an abuse vector — mitigate with rate limit + email verification token before storing (reuse password-reset token machinery); if verification is out of scope for the phase, ship option 2 (gated footer) instead.
- **Masonry removal (F-7)** is visual-only; rollback = restore previous component.
- **Seed truncation** already happened locally; re-run `db:seed` any time to reset.

---

## 6. Appendix — evidence inventory

**Screenshots** (`/tmp/opencode/audit/shots/`): 26 routes × {desktop, mobile} + crops. Key ones per finding are cited inline. Full list: home, categories, category, category-technology, about, contact, login, signup, forgot-password, styles, article-view-1/2, user-alice, 404, profile(+articles/collections/liked/details), settings(+profile/password/notifications/delete), create, login-submit.

**Machine probes** (Node/Playwright, chromium headless-shell 1248):
- Home: `.brick` visibility/opacity/position census → F-3.
- Footer: `.s-footer__subscribe.row` margin `-7.5px`, width 1000px, page `scrollWidth` 1440 → F-2.
- Categories: 313 bricks, `htmlFont=10px` (62.5% trick as designed — not a bug), `liFont≈10px` (design), page height 13,696px (mobile 37,356px) → F-7.
- Notifications: label ends x=615, button x=615 → F-5.
- Article: no horizontal overflow (only a decorative `<svg>` ellipse extends 9px past 1440 — cosmetic); body copy actually within bounds.
- `/user/alice_carter`: 2×`http-400` in report.json → F-1.
- 404: element at (1410,870) = `tsqd-open-btn-container` → F-9.

**API checks:** login 200 (cookie `sparknest.sid` HttpOnly, SameSite=Lax); `/article/previews` 200; `/articles/featured` 200; `/articles/saved/1` 200 (authed); `/subscribe/newsletter` 401 anon; `/send/message` 500 without SMTP creds; `/public/user/alice_carter` 400 → F-1/F-4.

**Local infra set up for this audit:** docker container `sparknest-pg` (postgres:16-alpine, port 5432); `server/.env` and `client/.env` created (gitignored; throwaway `SESSION_SECRET`); **API moved to port 3100** because port 3000 is occupied on this machine by another application (`next-server`, PID 26288 — do not touch); `client/.env` points `VITE_API_URL=http://localhost:3100`; Vite restarted with it. Also `server/db/migrate.js` was patched locally to add `-workingDirectory=/flyway/project` because Flyway in Docker previously mounted the repo at `/flyway/project` but resolved `flyway.locations=filesystem:server/db/migrations` relative to `/flyway` — `npm run db:migrate` silently applied **0 migrations** and reported success. This fix should be kept (or the flyway.conf path made absolute for the container).

**Not verified / not covered:** real-SMTP mail flows; Google OAuth (no client id/secret configured); image-upload pipeline with >10MB files; concurrent-load behavior; `/styles` contrast ratios (visual only); screen-reader pass; print styles; dark-mode (theme has `data-theme="dark"` hooks but no toggle found — investigate separately).
