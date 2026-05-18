# Invoicy

**60-second professional invoices for freelancers.** Stop hacking Google Docs.

5 studio-grade themes · PDF/PNG export · Cloud sync · GST-ready · Built for solos.

---

## What is it

- **Create beautiful invoices in under a minute** — fill in client details, line items, and tax; get a print-perfect PDF.
- **5 design themes** (Minimalist, Corporate, Retro, Clean, Modern) so your invoice matches your brand, not a spreadsheet template.
- **Cloud-synced and shareable** — every invoice gets a public share link; full PDF download for Pro users.

---

## Getting Started

**Prerequisites:** Node.js 18+

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy the env file and populate it:
   ```bash
   cp .env.example .env
   ```
   See [Environment Variables](#environment-variables) below.

3. Start the dev server:
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000` with Vite HMR.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth — required for login/signup UI to render |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — server-side only, used in the Lemon Squeezy webhook |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC signature verification for payment webhooks |
| `VITE_LEMON_SQUEEZY_CHECKOUT_URL` | Direct checkout link for the Pro upgrade CTA |

Clerk defaults to `pk_test_placeholder` when the key is missing — auth UI won't render without a real key.

---

## Architecture

**Server:** Single Express process (`server.ts`) handles everything.
- Dev: mounts Vite as middleware (HMR included)
- Prod: serves `dist/` as static files
- `/api/webhooks/lemonsqueezy` — payment webhook (requires raw body before `express.json()`)
- `/api/health` — health check

**Frontend:** React 19 SPA with React Router v7.

```
/                      → LandingPage
/login, /sign-up       → Clerk auth
/about, /privacy, /terms → LegalPage
/preview/:id           → Public invoice share link

<AuthGuard> (Clerk-gated)
  <AppLayout>
    /app               → Dashboard
    /app/create        → InvoiceWizard (new)
    /app/edit/:id      → InvoiceWizard (edit existing)
    /app/settings      → Settings
```

**Data:** Supabase — `profiles` table (one row per Clerk user, holds `is_premium`) + `invoices` table (`content JSONB` column stores the full invoice object).

**Payments:** Lemon Squeezy. On `order_created` webhook, the server flips `profiles.is_premium = true` for the `user_id` in `custom_data`.

**Export:** `html2canvas` + `jsPDF` — clones the preview DOM off-screen at 794px A4 width, rasterizes at 2× scale, writes multi-page PDF.

---

## Themes

| Theme | Style | Free |
|-------|-------|------|
| Minimalist | Black/white, stark borders, Inter | ✅ |
| Corporate | Dark slate header, table layout | Pro |
| Retro | Cream + crimson, serif, dot pattern | Pro |
| Clean | Indigo accents, rounded cards | Pro |
| Modern | Ultra-minimal, horizontal rules | Pro |

New themes ship quarterly and are bundled into Pro forever — no theme packs.

---

## Commands

```bash
npm run dev       # Start dev server (Express + Vite HMR on port 3000)
npm run build     # Vite production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # TypeScript type-check only (tsc --noEmit)
npm run clean     # rm -rf dist
```

---

## Database Schema

See `supabase/schema.sql`. Two tables:

- **`profiles`** — `id` (Clerk userId), `email`, `is_premium` (boolean)
- **`invoices`** — `id`, `user_id` (Clerk userId), `content` (JSONB), `created_at`, `updated_at`

Run the schema SQL in your Supabase project's SQL editor to initialize.

---

## Deployment

The app is designed for a Node.js host (Railway, Fly.io, Render) that runs `tsx server.ts`. For Vercel serverless, see `vercel.json` + `api/` directory.

Set all production env vars in your host's dashboard before deploying.
