# Phase 5 — Frontend Modernization

> **Goal:** Make the client type-safe, fast, and maintainable. No backend changes. Keep UI identical, but replace ad-hoc Axios calls with a proper data layer.

**Duration:** 5–7 days | **Risk:** Medium | **Branch:** `feat/phase-5-frontend` | **Depends on:** Phase 4

---

## 1. Objective

The 2024 client works but is JS-only, has `sharp` in client deps, hardcoded `WEB_URL`, no query caching, `react-helmet` (deprecated), and manual `useEffect` fetches. This phase migrates to TypeScript + TanStack Query + `VITE_API_URL` without redesigning the UI.

## 2. Prerequisites

- Phase 4 merged (stable API contract `{success, data, meta}`)
- `client/.env.example` with `VITE_API_URL` exists (Phase 1)

## 3. Problems Fixed Here

| # | File | Issue |
|---|------|-------|
| 1 | `client/package.json` | `sharp` in client (server-only), `react-helmet` deprecated, no TS |
| 2 | `client/src/api/API.js:6` | `WEB_URL` hardcoded `localhost:8080`, no env |
| 3 | `client/src/api/*.js` | Raw Axios, no caching, no retry, no types |
| 4 | `client/src/pages/*` | `useEffect` fetch waterfalls, no loading/error boundaries |
| 5 | `client/vite.config.js` | Vite 5.4, no proxy, no `base` env |
| 6 | `client/src/assets/styles/styles.css` | Global CSS, no CSS modules, Bootstrap via `node_modules` import |
| 7 | `client/src/pages/components/tools/auth.js` | Manual `localStorage` auth, no httpOnly awareness |

## 4. Steps

### 4.1 Toolchain Upgrade

```bash
# Node 20 already pinned (Phase 1)
npm --workspace=client install -D typescript @types/react @types/react-dom @types/node
npm --workspace=client install -D vite@^6.0.0 @vitejs/plugin-react@^4.3.0
npx tsc --init --jsx react-jsx --module ESNext --target ES2020 --strict --moduleResolution bundler
```

**Update `client/package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

**Remove wrong deps, add correct ones:**

```bash
npm --workspace=client uninstall sharp react-helmet
npm --workspace=client install react-helmet-async
npm --workspace=client install @tanstack/react-query @tanstack/react-query-devtools
npm --workspace=client install zustand  # lightweight, replaces ad-hoc auth.js
npm --workspace=client install zod      # share validators with server
```

Keep `bootstrap`, `quill`, `axios` (but wrap), `react-router-dom` (upgrade to 6.26 → 6.28, no breaking).

### 4.2 Env & Vite Config

**Create `client/.env` (gitignored) and use `client/.env.example`:**

```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=SparkNest
```

**Update `client/vite.config.js` → `vite.config.ts`:**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5143,
    proxy: {
      '/api': { target: process.env.VITE_API_URL || 'http://localhost:3000', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '') }
    }
  },
  base: '/',
  build: { sourcemap: true }
});
```

**Create `client/src/config/env.ts`:**

```ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  appName: import.meta.env.VITE_APP_NAME as string,
};
if (!env.apiUrl) throw new Error('VITE_API_URL missing');
```

Update `client/src/api/API.js` → `API.ts` to use `env.apiUrl`:

```ts
import axios from 'axios';
import { env } from '../config/env';
export const WEB_URL = env.apiUrl;
export const api = axios.create({ baseURL: WEB_URL, withCredentials: true });
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) window.location.href = '/session/new';
  return Promise.reject(err);
});
```

### 4.3 TypeScript Migration (incremental)

1. Rename `js` → `ts`/`tsx` file-by-file. Start with `api/`, `config/`, `tools/`.
2. Add `client/src/types/api.ts`:

   ```ts
   export type ArticlePreview = {
     preview_id: number; article_id: number; preview_by: string;
     preview_title: string; preview_subtitle: string;
     categories: string[]; preview_images: string[];
   };
   export type Paginated<T> = { data: T[]; meta: { totalPages: number; totalCount: number; page: number; limit: number } };
   ```

3. Enable `allowJs: true` in `tsconfig.json` so JS and TS coexist during migration. Migrate 2–3 pages per PR, not all at once.

### 4.4 Data Layer — TanStack Query

**Create `client/src/lib/queryClient.ts`:**

```ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000*60*5, retry: 1, refetchOnWindowFocus: false } }
});
```

**Wrap `App.jsx` → `App.tsx`:**

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

<QueryClientProvider client={queryClient}>
  <HelmetProvider>
    <Router>...</Router>
  </HelmetProvider>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Create hooks `client/src/hooks/useArticles.ts`:**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/API';

export const useArticlePreviews = (page: number, limit = 12) =>
  useQuery({
    queryKey: ['previews', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/article/previews?page=${page}&limit=${limit}`);
      return data as Paginated<ArticlePreview>;
    }
  });

export const useCreateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.post('/article/create', formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['previews'] })
  });
};
```

Replace `useEffect` + `axios.get` in `Index.jsx`, `Category.jsx`, `Profile.jsx`, `RenderPreviews.jsx` with these hooks. Keep `ARTICLESAPI.js` as URL builders or deprecate.

### 4.5 Auth State — Zustand

**Create `client/src/store/authStore.ts`:**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: number; email: string; fname: string; lname: string; username: string; avatar: string };
type AuthState = { user: User | null; setUser: (u: User | null) => void; logout: () => void };

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  }),
  { name: 'sparknest-auth' }
));
```

Replace `tools/auth.js` + `IndexDBstorage.js` manual logic. Session is httpOnly cookie (Phase 3), so store only non-sensitive `user` for UI; auth check is `GET /user/details/:email` with `withCredentials`.

### 4.6 UI & DX Polish

1. **Error Boundaries** — `client/src/components/ErrorBoundary.tsx` + `pages/Error.jsx` update.
2. **Loading** — replace `PreLoader` ad-hoc with `Suspense` + `Skeleton` (MUI `Skeleton` already installed).
3. **Helmet** — `react-helmet` → `react-helmet-async` (already installed), update `Index.jsx` etc.
4. **Quill** — keep `quill 2.0`, but lazy-load: `const QuillEditor = lazy(() => import('./components/create/CreateArticle'))`.
5. **Bootstrap** — keep, but import via `import 'bootstrap/dist/css/bootstrap.min.css'` not `node_modules` path in `index.html`. Remove `<link rel="stylesheet" href="./node_modules/...">` from `index.html`.
6. **Images** — add `loading="lazy"` to `RenderPreviews` masonry images, use `srcset` from `thumbs`/`masonry` URLs.

### 4.7 Build & Lint

```bash
npm --workspace=client run typecheck  # 0 errors
npm --workspace=client run lint
npm --workspace=client run build      # check bundle size
```

Add `client/tsconfig.json` strict, `eslint` with `typescript-eslint`.

## 5. Files Created / Modified

| File | Action |
|------|--------|
| `client/tsconfig.json`, `vite.config.ts` | Create/update |
| `client/src/config/env.ts` | Create |
| `client/src/types/api.ts` | Create |
| `client/src/lib/queryClient.ts` | Create |
| `client/src/hooks/useArticles.ts`, `useAuth.ts`, `useComments.ts` | Create |
| `client/src/store/authStore.ts` | Create |
| `client/src/api/API.ts` | Rewrite (env + interceptors) |
| `client/src/App.tsx` | Wrap Query + HelmetProvider |
| `client/src/pages/*` | Migrate to TS + hooks (incremental) |
| `client/index.html` | Remove node_modules CSS link |
| `client/package.json` | Update deps/scripts |

## 6. Verification Gate

```bash
npm --workspace=client run typecheck  # 0 errors
npm --workspace=client run lint
npm --workspace=client run build      # succeeds, no sharp in bundle
npm --workspace=client run dev        # http://localhost:5143 loads, no console errors

# Manual
# 1. Home → previews load via TanStack Query (Network tab: /article/previews, cached on back nav)
# 2. Create article → mutation invalidates previews, new article appears without reload
# 3. Login → Zustand persists, refresh keeps user, 401 redirects to /session/new
# 4. Google login → no PII in URL (Phase 4), Helmet title correct
# 5. Lighthouse: Performance >80, no 404 for bootstrap.css
```

## 7. Rollback

- Revert Phase 5 commit. Backend unchanged, so old JS client still works against Phase 4 API.
- If TS breaks build, set `allowJs: true` and keep JS files — incremental.

## 8. Exit Criteria

- [ ] `sharp` not in `client/package.json`, `react-helmet` replaced
- [ ] `VITE_API_URL` used, no hardcoded `localhost:8080`
- [ ] `typecheck` + `lint` + `build` green
- [ ] All data fetching via TanStack Query (no raw `useEffect` Axios in pages)
- [ ] Auth via Zustand + httpOnly cookie, no `localStorage` password
- [ ] `index.html` no `node_modules` CSS link, Bootstrap imported in JS
- [ ] No visual regression (compare screenshots)

## 9. Out of Scope

- UI redesign (keep Bootstrap + existing styles)
- Backend changes
- E2E tests (Phase 6)
