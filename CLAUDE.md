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
