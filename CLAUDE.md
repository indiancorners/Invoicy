# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Express + Vite HMR on port 3000)
npm run build     # Vite production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # TypeScript type-check only (tsc --noEmit, no ESLint configured)
npm run clean     # rm -rf dist
```

No test suite is configured.

## Environment Variables

Copy `.env.example` to `.env` and populate:

| Variable | Purpose |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth — required for login/signup UI to render |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — used server-side only in `server.ts` for the Lemon Squeezy webhook |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC signature verification for payment webhooks |
| `VITE_LEMON_SQUEEZY_CHECKOUT_URL` | Direct checkout link for upgrade CTA |

Clerk defaults to `pk_test_placeholder` when the key is missing — Clerk rejects that silently, so the auth UI won't render.

## Architecture

### Server (`server.ts`)

A single Express process handles everything:
- In dev: mounts Vite as middleware (HMR included)
- In prod: serves `dist/` as static files
- Exposes `/api/webhooks/lemonsqueezy` — **must receive raw body** before `express.json()` middleware runs (signature verification requires the untransformed bytes)
- Exposes `/api/health`

Run with `tsx server.ts` (not `ts-node`).

### Frontend

React 19 SPA with React Router v7. Route structure:

```
/                      → LandingPage
/login/*               → Clerk <SignIn>
/sign-up/*             → Clerk <SignUp>
/about|/privacy|/terms → LegalPage
/preview/:id           → PreviewPage (public share link)

<AuthGuard> (Clerk-gated)
  <AppLayout>
    /app               → Dashboard
    /app/create        → InvoiceWizard (new)
    /app/edit/:id      → InvoiceWizard (loaded from Supabase)
    /app/settings      → Settings
```

`AuthGuard` uses Clerk's `useAuth()`. On auth fail it redirects to `/login`. Invoice state (`invoices[]`) lives in `App.tsx` and is passed down as props — there's no global state manager.

### Data Layer

**Supabase** stores two tables (see `supabase/schema.sql`):
- `profiles` — one row per Clerk user ID, holds `is_premium` boolean
- `invoices` — entire `InvoiceData` object stored as `content JSONB`, keyed by Clerk `userId`

**Note:** The actual schema uses a single `content JSONB` column, not the column-per-field layout described in `INVOICY_PRD.md`. `invoiceService.ts` is the source of truth.

**Lemon Squeezy** handles payments. On `order_created` webhook, the server flips `profiles.is_premium = true` for the `user_id` passed in `custom_data`.

### Premium Gating

Premium status is read from Supabase `profiles.is_premium`. Free tier: 1 theme (minimalist), limited exports. Pro tier: all themes, unlimited exports. Logic lives in a `useInvoicyPro` hook (referenced in PRD — verify current implementation location).

### Themes & Export

`InvoicePreview.tsx` renders the live preview using a `switch` on `data.theme`. Five themes: `minimalist`, `corporate`, `retro`, `clean`, `modern`.

PDF/PNG export in `src/lib/utils.ts` (`exportToPDF`, `exportToPNG`): clones the preview DOM node off-screen at 794px width, rasterizes with `html2canvas` at 2× scale, then writes to jsPDF A4. The clone locks `fontSize: 16px` to prevent Tailwind rem scaling issues.

### Tailwind Custom Colors

Defined in the CSS/config — use these names in class names:
- `abyssal` — deep dark background
- `flame` — primary orange accent
- `palladian` — secondary bright
- `oatmeal` — muted text
- `truffle` — dark text variant

### Key Utilities

- `cn()` in `src/lib/utils.ts` — `clsx` + `tailwind-merge`
- `DEFAULT_INVOICE()` in `src/types.ts` — generates a new invoice pre-filled from `localStorage` key `invoicy_business_profile`
- Logo upload in `InvoiceForm.tsx` — base64-encoded via `FileReader`, stored inline in `InvoiceData.sender.logo`

## Gotchas & Hard-Won Learnings

Read this before touching export, auth, or deployment — these cost real time to discover.

### Export / OKLCH (the big one)
- `html2canvas` (v1.4.x) supports **only** `rgb/rgba/hsl/hsla`. It throws `Attempting to parse an unsupported color function "oklch"` on anything else. Verified in its source: `node_modules/html2canvas/dist/html2canvas.esm.js` (~line 1720); it reads colors via `getComputedStyle` on elements **and** `:before`/`:after`.
- Tailwind v4 emits its **default palette** (`--color-slate-900`, `red`, `blue`, `gray`, `indigo`, …) as `oklch()`, and opacity modifiers as `color-mix(in oklab, …)`. The invoice themes use those, so the built CSS has ~27 oklch values. (The app's own colors — abyssal/flame/etc. — are already hex in `@theme`, `src/index.css`.)
- **Do NOT fix this at runtime.** Sanitizing in html2canvas `onclone`, walking `getComputedStyle`, the canvas `fillStyle` toRgb trick, `:root` var overrides — all were tried and all failed (onclone fires before the cloned iframe's styles apply, so getComputedStyle returns initial values; there are always leak paths). **Fix at the source: make the built CSS contain zero oklch** (PostCSS oklab→rgb transform, or hex-override the palette in `@theme`, or swap to an oklch-aware capture lib like snapdom/modern-screenshot).
- **Verify the fix for real:** `npm run build && grep -c oklch dist/assets/*.css` must be `0`, then manually export all five themes.

### Deployment (Vercel)
- The live URL `invoicy-nine.vercel.app` is served by the project named **`invoicy`** (not `invoicy-nine` — that's a separate stray project). Use `vercel link --project invoicy`, then `vercel --prod`.
- `VITE_*` vars are **baked at build time**; changing them requires a fresh (uncached) redeploy. Merging to `main` did not reliably auto-deploy.
- `VITE_SUPABASE_URL` must be the **bare** project URL (`https://<ref>.supabase.co`). Do **not** append `/rest/v1` — supabase-js adds it, and a doubled path yields `PGRST125: Invalid path`.
- `vercel env pull` shows `""` for "Encrypted" vars (can't decrypt) — it is **not** proof a var is empty.
- **Verify a deploy by downloading the bundle to a file and grepping the file** (`curl … -o /tmp/b.js; grep marker /tmp/b.js`). Piping a large minified bundle through a shell variable truncates and gives false negatives.

### Auth (Clerk ↔ Supabase)
- The Supabase client (`src/lib/supabaseClient.ts`) passes the Clerk session token via the `accessToken` callback; Supabase **Third-Party Auth** must register the exact Clerk issuer (decode it from the publishable key, e.g. `https://<sub>.clerk.accounts.dev`). Wrong/missing issuer → `PGRST301: No suitable key`. Token must carry `role: authenticated`.
- IDs are **TEXT** (Clerk ids like `user_…`, not UUIDs). RLS policies key off `auth.jwt()->>'sub'`. The public `/preview` page reads via the `get_public_invoice(id, token)` SECURITY DEFINER RPC because anonymous visitors have no Clerk token.
- Two webhook handlers exist: `server.ts` (local dev) and `api/webhooks/lemonsqueezy.ts` (**the one that runs on Vercel**) — keep them in parity.

### Working principle
When a dependency throws on input, **read its source early** and **eliminate the bad input at its source** rather than iterating runtime patches. Prefer fixes that are cheap to verify. If two attempts at one approach fail, change strategy.
