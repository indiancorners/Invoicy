# Invoicy

Studio-grade invoicing for designers, studios, and freelancers — turn invoices from spreadsheets into branded, export-ready assets. Five typographic themes, high-fidelity PDF/PNG export, and shareable public links.

## Stack

- **Frontend:** React 19 + React Router v7 (SPA), TypeScript, Tailwind CSS v4, Vite 6
- **Server:** Express (single process; Vite middleware in dev, static `dist/` in prod) — run with `tsx`
- **Auth:** Clerk
- **Database:** Supabase (Postgres) — invoices stored as `content JSONB`, RLS scoped per user
- **Payments:** Lemon Squeezy ($20 one-time Pro) via signed webhook
- **Export:** `html2canvas` + `jsPDF` (A4, 2× scale)

## Quick start

**Prerequisites:** Node.js 18+

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # Express + Vite HMR on http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env` and populate:

| Variable | Purpose |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth — login/signup UI won't render without a real key |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only — used in `server.ts` for the payment webhook |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | HMAC signature verification for payment webhooks |
| `VITE_LEMON_SQUEEZY_CHECKOUT_URL` | Direct checkout link for the upgrade CTA |

> Clerk falls back to `pk_test_placeholder` when the key is missing, which Clerk rejects silently — set a real key or the auth UI stays blank.

## Database

Apply `supabase/schema.sql` to your Supabase project. It creates three tables:

- `profiles` — one row per Clerk user, holds `is_premium`
- `invoices` — full `InvoiceData` as `content JSONB`, keyed by Clerk `userId`
- `processed_webhooks` — idempotency ledger so duplicate Lemon Squeezy deliveries are ignored

## Scripts

```bash
npm run dev       # Dev server (Express + Vite HMR) on port 3000
npm run build     # Production build → dist/
npm start         # Serve the production build (node server.ts)
npm run preview   # Vite preview of the build
npm run lint      # TypeScript type-check (tsc --noEmit)
npm run clean     # rm -rf dist
```

No test suite is configured.

## Payments

Lemon Squeezy handles checkout. The server exposes `POST /api/webhooks/lemonsqueezy`, which:

- verifies the HMAC signature against the **raw** request body,
- de-duplicates via `processed_webhooks`,
- flips `profiles.is_premium = true` on `order_created` and back to `false` on `order_refunded`,

using the Clerk `user_id` passed in the checkout's `custom_data`.

## Deployment

The app needs a **Node-capable host** (Railway, Fly.io, Render) — the payment webhook requires a running server, so static-only hosting won't work. Build with `npm run build`, then run `npm start`. Set all environment variables above in your host's config, and register the webhook URL (`/api/webhooks/lemonsqueezy`) in the Lemon Squeezy dashboard.

## Architecture notes

- Invoice state lives in `App.tsx` and is passed down as props (no global store).
- Themes render via a `switch` in `InvoicePreview.tsx`; export logic is in `src/lib/utils.ts`.
- Premium gating logic lives in `src/hooks/useInvoicyPro.ts` (free tier: 1 invoice, minimalist theme only).
- Public share links are token-gated: `/preview/:id?t=<publicToken>` returns 404 on a missing/mismatched token.

See `CLAUDE.md` for deeper architectural detail.
