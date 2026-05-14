# Invoicy — Product Requirements Document

**Version:** 2.0  
**Updated:** May 2026  
**Status:** Pre-launch (bugs to fix before public release)

---

## 1. Product Overview

**Invoicy** is a studio-grade invoicing tool for design agencies, modern studios, and freelancers. It generates beautifully formatted, A4-ready invoices with premium typography and a high-fidelity PDF/PNG export engine — built as an antidote to spreadsheet-style billing tools.

**Core value:** Move from invoice-as-spreadsheet to invoice-as-branded-asset.

**Business model:** Freemium. Free tier is permanently limited (1 invoice, 1 theme). Pro is a one-time $20 lifetime payment via Lemon Squeezy.

**GitHub:** https://github.com/indiancorners/Invoicy

---

## 2. Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | React 19 + Vite 6 | SPA, no SSR |
| Language | TypeScript ~5.8 | Strict mode |
| Styling | Tailwind CSS v4 | Via `@tailwindcss/vite` plugin — no postcss config file |
| Auth | Clerk v5+ (`@clerk/clerk-react`) | SignIn/SignUp with Clerk-hosted UI |
| Database | Supabase (PostgreSQL) | Invoices stored as JSONB blob; RLS enabled |
| Server | Express 4 + tsx | Single process: API routes + Vite middleware in dev, static in prod |
| Animations | motion/react v12 (Framer Motion) | Used in wizard steps, dashboard cards, modals |
| Export | html2canvas + jsPDF | Client-side PDF (A4) and PNG generation |
| Payments | Lemon Squeezy | $20 lifetime checkout + HMAC webhook |
| Icons | lucide-react | |
| Toasts | sonner | |

---

## 3. Custom Design Tokens (Tailwind Colors)

| Token | Role |
|---|---|
| `abyssal` | Deep dark — sidebar, backgrounds |
| `flame` | Primary orange accent — CTAs, active states |
| `palladian` | Secondary light — main content background |
| `oatmeal` | Muted — borders, dividers |
| `truffle` | Dark text / danger states |

---

## 4. Architecture

### Server (`server.ts`)

Single Express process handles everything:
- **Dev:** Vite middleware mounted (HMR on)
- **Prod:** Serves `dist/` as static files with SPA fallback
- **API routes:**
  - `POST /api/webhooks/lemonsqueezy` — HMAC-verified, updates `profiles.is_premium`
  - `GET /api/health`

**Critical:** The webhook route must be registered BEFORE `express.json()` because HMAC verification requires the raw byte buffer, not a parsed body.

Run with: `npm run dev` (`tsx server.ts`), NOT `ts-node`.

### Routing (React Router v7)

```
/                      → LandingPage (public)
/login/*               → Clerk <SignIn>
/sign-up/*             → Clerk <SignUp>
/about | /privacy | /terms → LegalPage
/preview/:id           → PreviewPage (public share, Pro feature)

<AuthGuard>            → Clerk useAuth() gate, redirects to /login
  <AppLayout>          → Collapsible sidebar (desktop) + bottom nav (mobile)
    /app               → Dashboard
    /app/create        → InvoiceWizard (new invoice)
    /app/edit/:id      → InvoiceWizard (loaded from Supabase)
    /app/settings      → Settings
```

### State Management

No global state manager. `invoices[]` array lives in `App.tsx` and is prop-drilled. `useInvoicyPro` hook is called locally wherever premium gating is needed.

---

## 5. Database Schema (Supabase)

**`profiles`**
```sql
id         UUID PRIMARY KEY  -- Clerk user ID
email      TEXT NOT NULL
is_premium BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
```

**`invoices`**
```sql
id         UUID PRIMARY KEY  -- InvoiceData.id
user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE
content    JSONB NOT NULL    -- Full InvoiceData object
created_at TIMESTAMPTZ
```

RLS is enabled on both tables. All policies scope to `auth.uid()`.

**Note:** The `invoices` table stores the full `InvoiceData` as a single JSONB blob (`content`). There are no separate columns per invoice field.

**Auto-creation:** On first sign-in, `useInvoicyPro` inserts a `profiles` row if none exists (`PGRST116` error handling).

---

## 6. Invoice Data Model (`src/types.ts`)

```typescript
InvoiceData {
  id, number, date, dueDate
  status: 'draft' | 'sent' | 'paid'
  lastModified: number
  sender: { name, email, phone, address, gst?, logo? }
  receiver: { name, email, phone, address, gst? }
  items: InvoiceItem[]  // { id, description, quantity, price }
  taxRate, currency, notes
  theme: 'minimalist' | 'corporate' | 'retro' | 'clean' | 'modern'
  signature?
}
```

`DEFAULT_INVOICE()` pre-fills sender fields from `localStorage` key `invoicy_business_profile`.

---

## 7. Invoice Themes

5 themes rendered in `InvoicePreview.tsx` via a `switch` on `data.theme`:

| Theme | Tier | Description |
|---|---|---|
| `minimalist` | Free | Bold black/white, Helvetica, hard ruled lines |
| `corporate` | Pro | Stone tones, structured header block |
| `retro` | Pro | Red accent, editorial newspaper feel |
| `clean` | Pro | Neutral/soft, modern whitespace-heavy |
| `modern` | Pro | Near-black, high-contrast agency look |

---

## 8. User Flows

### InvoiceWizard (3 steps)

**Step 1 — Choose Identity:** Theme picker grid. Pro themes show a lock badge for free users; clicking triggers UpgradeModal.

**Step 2 — Input Details:** Two tabs:
- `Details` tab → `InvoiceForm` (full form: sender, receiver, line items, tax, currency, logo upload, notes, signature)
- `Preview` tab → `InvoicePreview` at 70% zoom (tab layout confirmed for v1 launch)

**Step 3 — Final Review:** Export hub:
- Download PDF (A4, ~300DPI effective via html2canvas 2× scale)
- Download PNG (lossless, same engine)
- Copy Link (Pro only — `/preview/:id`)
- Pro upsell card for free users

Save button: "Commit to Vault & Exit" → saves to Supabase, navigates to `/app`.

### Dashboard

- Stats panel: Total Volume, Awaiting (sent count), Paid count
- Invoice vault table (desktop) / card view (mobile)
- Search by invoice number or client name
- Filter by status: all / draft / sent / paid
- Actions per invoice: Edit, Share (Pro), Delete (with confirm modal)
- Free tier shows "1/1 free invoice used" badge + upgrade CTA

### Settings

Business profile form (name, email, phone, address, GST, currency) persisted to `localStorage` as `invoicy_business_profile`. Auto-populates `DEFAULT_INVOICE()` sender fields.

---

## 9. Premium Gating (`useInvoicyPro` hook)

**Source:** `src/hooks/useInvoicyPro.ts`

**Resolution order:**
1. Email contains `+pro` or equals `pro@invoicy.test` / `premium@invoicy.test` → force premium
2. Email contains `+free` or equals `free@invoicy.test` → force free
3. Supabase `profiles.is_premium` lookup

**Free limits:**
- Max 1 invoice (`isLimitReached(count)` → `!isPremium && count >= 1`)
- 1 theme: minimalist only
- No share links
- No exports (enforcement pending — see bug #1)

**Pro activation:**
`activatePro()` opens Lemon Squeezy checkout with `checkout[custom][user_id]` appended. Uses `LemonSqueezy.Url.Open()` overlay (script loaded in `index.html`), falls back to `window.open`.

---

## 10. Payment Integration (Lemon Squeezy)

**Flow:**
1. User clicks "Get Lifetime Access" → `activatePro()` → LS checkout opens
2. User pays → LS fires `order_created` webhook to `/api/webhooks/lemonsqueezy`
3. Server verifies HMAC (`x-signature` header), extracts `meta.custom_data.user_id`, updates `profiles.is_premium = true`
4. Next app load: `useInvoicyPro` fetches updated Supabase profile

**Required env vars:**
```
VITE_LEMON_SQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-side only — used in webhook handler
```

**Status:** Code complete. Lemon Squeezy product, store, and webhook need to be configured.

---

## 11. Known Bugs — Fix Before Launch

| # | Bug | Location | Fix Required |
|---|---|---|---|
| 1 | **Export not gated** | `InvoiceWizard.tsx:51` | Free users can export — lock icon is decorative only. Add `pro.isPremium` check before `handleExport()` fires. |
| 2 | **Share link broken** | `supabase/schema.sql:30` + `PreviewPage.tsx` | RLS blocks anon viewers. Need an anon SELECT policy on `invoices` scoped to the invoice id (or use a service role read for preview). |
| 3 | **Status display-only** | `Dashboard.tsx` | No UI to change draft → sent → paid. |
| 4 | **Validation hardcoded green** | `InvoiceWizard.tsx:357` | Step 3 always shows "Validation Status: Perfect" regardless of field state. |
| 5 | **Logo missing from Settings** | `Settings.tsx` | Logo upload only exists in InvoiceForm (per-invoice). Settings business profile has no logo field — default logo doesn't persist. |

---

## 12. Pre-Launch Checklist

**Lemon Squeezy setup:**
- [ ] Create store + product ($20 one-time, lifetime access)
- [ ] Configure webhook URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
- [ ] Copy webhook signing secret → `LEMON_SQUEEZY_WEBHOOK_SECRET`
- [ ] Copy checkout URL → `VITE_LEMON_SQUEEZY_CHECKOUT_URL`
- [ ] Test end-to-end in LS test mode

**Bug fixes (§11 above — all must close before launch):**
- [ ] Gate PDF/PNG export behind `pro.isPremium`
- [ ] Fix share link RLS
- [ ] Add status toggle (draft → sent → paid)
- [ ] Fix hardcoded Step 3 validation
- [ ] Add logo to Settings/business profile

**Deployment:**
- [ ] Choose host (needs Node.js for webhooks — Railway, Fly.io, or Vercel + separate webhook handler)
- [ ] Set all env vars in production
- [ ] Point LS webhook to production URL
- [ ] Add production domain to Clerk allowed origins
- [ ] Confirm Supabase RLS policies active, add anon preview policy

**Polish:**
- [ ] Rename asset images from `regenerated_image_*.png`
- [ ] Update README (replace AI Studio boilerplate with real setup instructions)
- [ ] Remove `console.log("Studio Landing Page Initialized")` from `LandingPage.tsx`

---

## 13. File Map (Key Files)

```
src/
  App.tsx                    # Router + invoice state + CRUD handlers
  types.ts                   # InvoiceData, InvoiceItem, ThemeType, DEFAULT_INVOICE()
  hooks/
    useInvoicyPro.ts         # Premium gating hook
  lib/
    invoiceService.ts        # Supabase CRUD (saveInvoice, fetchInvoices, deleteInvoice)
    supabaseClient.ts        # Supabase client init
    utils.ts                 # cn(), exportToPDF(), exportToPNG()
  components/
    InvoiceWizard.tsx        # 3-step wizard orchestrator
    InvoiceForm.tsx          # Step 2 form (all fields, logo upload, line items)
    InvoicePreview.tsx       # Live preview — all 5 themes via switch statement
    Dashboard.tsx            # Invoice vault, stats, search/filter
    AppLayout.tsx            # Sidebar (desktop) + bottom nav (mobile)
    AuthGuard.tsx            # Clerk auth gate
    Settings.tsx             # Business profile → localStorage
    UpgradeModal.tsx         # $20 lifetime CTA modal
    PreviewPage.tsx          # Public share page /preview/:id
    LandingPage.tsx          # Marketing homepage
    BrandLogo.tsx            # SVG flame mark
server.ts                    # Express + Vite middleware + LS webhook
supabase/schema.sql          # Profiles + invoices tables + RLS policies
```
