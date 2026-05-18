# Invoicy — Pre-Launch Checklist

Everything that must be in place before the first public user lands on the product.
Items are organized by category. Code changes have exact file references.

---

## ✅ Already Done

| # | Item | Location |
|---|------|----------|
| 1 | PDF/PNG export working on all 5 themes (multi-page, no overlap) | `src/lib/utils.ts` — PR #2 |
| 2 | "Made with Invoicy" attribution badge on public share links | `src/components/PreviewPage.tsx` |
| 3 | Dashboard: PDF toast, status badges, free counter — all fixed | `src/components/Dashboard.tsx` |
| 4 | Overdue invoice filter on dashboard | `src/components/Dashboard.tsx` |
| 5 | `FREE_INVOICE_LIMIT` constant extracted — one source of truth | `src/hooks/useInvoicyPro.ts:5` |
| 6 | GST/VAT field on sender and receiver | `src/types.ts` + `InvoiceForm.tsx` |
| 7 | INR (₹) currency support | Invoice form currency selector |
| 8 | Mobile-responsive layout (bottom nav, collapsible sidebar) | `src/components/AppLayout.tsx` |
| 9 | Public share link per invoice (`/preview/:id`) | `src/components/PreviewPage.tsx` |
| 10 | 5 themes rendering correctly in preview and PDF export | `src/components/InvoicePreview.tsx` |
| 11 | Supabase cloud sync for all invoices | `src/lib/invoiceService.ts` |
| 12 | Lemon Squeezy webhook sets `is_premium = true` on purchase | `server.ts` / `api/webhooks/lemonsqueezy.ts` |
| 13 | Retry button on fetch error banner (no duplicate toast) | `src/components/Dashboard.tsx` + `src/App.tsx` |

---

## 🔴 Code Changes Required

### C1 — Raise free invoice limit from 1 → 3

**File:** `src/hooks/useInvoicyPro.ts:5`

```typescript
// Before:
export const FREE_INVOICE_LIMIT = 1;
// After:
export const FREE_INVOICE_LIMIT = 3;
```

**Why:** 1 invoice is not enough for a user to reach the "aha moment." 3 invoices lets them experience the full workflow (create → preview → share → PDF) for real clients before hitting the paywall. GTM strategy: free tier generous enough to convert naturally at the 4th invoice.

---

### C2 — 3-tier pricing on Landing Page

**File:** `src/components/LandingPage.tsx`

Current state: 2-tier pricing (Starter $0, Studio Pro $20 lifetime).

Required tiers:

| Plan | Price | Key limits |
|------|-------|-----------|
| Free | $0 | 3 invoices, 1 theme (Minimalist), share link with badge |
| Pro Monthly | $9/mo | Unlimited, all themes, dashboard PDF download, no watermark |
| Pro Annual | $69/yr | Everything in Monthly — "2 months free" callout |
| Founding Member | $29 one-time | Everything forever — "Limited to first 200" urgency badge |

India subtiers (add below each USD price or in a toggle):
- Pro Monthly: ₹749/mo
- Pro Annual: ₹5,499/yr
- Lifetime: ₹2,499 one-time

Visual hierarchy: Annual plan dominant (most prominent card), Lifetime below it with "Best Deal" badge, Monthly as low-friction entry. Free always visible.

---

### C3 — 3-tier pricing in Upgrade Modal

**File:** `src/components/UpgradeModal.tsx`

Current state: shows "$20 lifetime access" (old single-tier).

Required: rebuild to show all 3 paid options. Suggested layout:
1. **Monthly** — $9/mo — small card, low-friction
2. **Annual** — $69/yr — large card, "Most Popular" badge, "Save 35%" callout
3. **Founding Member** — $29 lifetime — "Best Value" badge, "Only X spots left" counter, strike-through at $79 future price

The `activatePro()` call needs to route to the correct Lemon Squeezy URL per plan (see C5).

---

### C4 — SEO meta tags in `index.html`

**File:** `index.html`

Add inside `<head>`:

```html
<meta name="description" content="Create client-ready invoices in 60 seconds. 5 studio-grade themes, PDF/PNG export, and cloud sync. Built for freelancers who are done hacking Google Docs." />
<meta property="og:type" content="website" />
<meta property="og:title" content="Invoicy — 60-Second Professional Invoices for Freelancers" />
<meta property="og:description" content="Stop invoicing in Google Docs. Invoicy gives you 5 beautiful themes, one-click PDF export, and a share link — in under 60 seconds." />
<meta property="og:image" content="https://yourdomain.com/og-image.png" />
<meta property="og:url" content="https://yourdomain.com" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Invoicy — 60-Second Professional Invoices" />
<meta name="twitter:description" content="Stop invoicing in Google Docs. 5 beautiful themes, PDF export, cloud sync." />
<meta name="twitter:image" content="https://yourdomain.com/og-image.png" />
<link rel="canonical" href="https://yourdomain.com" />
```

Also update `<title>` from the current default to `Invoicy — Professional Invoice Generator`.

**Also needed:** Create a 1200×630px `og-image.png` (a clean Retro or Modern theme invoice screenshot works perfectly).

---

### C5 — Multiple Lemon Squeezy checkout URLs

**Files:** `src/hooks/useInvoicyPro.ts`, `.env.example`

Current state: single `VITE_LEMON_SQUEEZY_CHECKOUT_URL` env var, `activatePro()` takes no args.

Required: 3 env vars + typed `activatePro(plan)`:

```typescript
// .env.example additions:
VITE_LS_CHECKOUT_MONTHLY=
VITE_LS_CHECKOUT_ANNUAL=
VITE_LS_CHECKOUT_LIFETIME=

// hook change:
type Plan = 'monthly' | 'annual' | 'lifetime';

const activatePro = (plan: Plan = 'annual') => {
  const urls = {
    monthly: import.meta.env.VITE_LS_CHECKOUT_MONTHLY,
    annual: import.meta.env.VITE_LS_CHECKOUT_ANNUAL,
    lifetime: import.meta.env.VITE_LS_CHECKOUT_LIFETIME,
  };
  const checkoutUrl = urls[plan];
  // ... existing URL append logic
};
```

Default to `'annual'` (highest LTV, visually dominant in UI).

---

### C6 — Analytics event tracking

**Files:** `src/main.tsx` or `index.html`, `.env.example`

Add PostHog (free tier, browser-side, no server required):

```html
<!-- index.html, before </head> -->
<script>
  !function(t,e){...}(window, document)
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, { api_host: 'https://app.posthog.com' })
</script>
```

Or install the npm package and init in `src/main.tsx`.

Track these events at minimum:

| Event | Where to fire |
|-------|--------------|
| `sign_up` | After Clerk sign-up redirect to `/app` (check `isSignedIn` transition in App.tsx) |
| `invoice_created` | In `handleSaveInvoice` after successful save (`App.tsx:70`) |
| `upgrade_modal_opened` | When UpgradeModal mounts |
| `checkout_started` | Inside `activatePro()` before `window.open` |
| `pdf_downloaded` | Inside Dashboard export success toast handler |

Add to `.env.example`:
```
VITE_POSTHOG_KEY=
```

---

### C7 — Verify free-tier PDF gate is correct

**File:** `src/components/Dashboard.tsx`

Per GTM strategy: free users should **not** have a dashboard PDF download button — they get PDF only via the public share link's "Download PDF" button.

Currently the download button is gated behind `pro.isPremium` in ActionButtons — verify this is correct and the share link's PDF download does NOT check premium status (it should be free since the share link is public and attribution badge is shown).

Check `src/components/PreviewPage.tsx` — confirm the PDF/PNG download on the public preview page has no pro gate.

---

## 🟡 Platform / Ops Tasks

| # | Task | Priority | Notes |
|---|------|----------|-------|
| P1 | Register domain: `invoicy.io` or `invoicy.app` | 🔴 Critical | Check availability; `invoicy.app` is clean and memorable |
| P2 | Set up 3 Lemon Squeezy products: Monthly $9, Annual $69, Lifetime $29 | 🔴 Critical | Each product needs a checkout URL for C5 above |
| P3 | Configure LS webhook → production URL `/api/webhooks/lemonsqueezy` | 🔴 Critical | Test with LS test mode before going live |
| P4 | Set all production env vars in hosting dashboard | 🔴 Critical | All 9 vars (6 existing + 3 new checkout URLs from C5 + PostHog key from C6) |
| P5 | Deploy to production host | 🔴 Critical | Railway / Fly.io / Render — needs Node.js runtime for `tsx server.ts` |
| P6 | Create Twitter/X @InvoicyHQ account | 🟠 High | Pin a before/after Google Doc vs Invoicy screenshot |
| P7 | Submit ProductHunt "Upcoming" page | 🟠 High | Start collecting followers 2 weeks before launch day |
| P8 | Create IndieHackers product page | 🟠 High | Write "how I built it" post, not just a product listing |
| P9 | Set up PostHog account → get `VITE_POSTHOG_KEY` | 🟠 High | Free tier handles 1M events/mo |
| P10 | Configure Lemon Squeezy email receipts (add Invoicy logo + branding) | 🟡 Medium | First touchpoint after payment — make it feel premium |
| P11 | Set up welcome email via LS / Resend / Loops | 🟡 Medium | Day 0: welcome + "here's what you can do". Day 3: theme showcase. Day 7: upgrade nudge |
| P12 | Add Invoicy to `betalist.com` and `startupbase.io` for pre-launch exposure | 🟡 Medium | Free listing, no effort, trickle of early users |
| P13 | Claim Google Business Profile (optional, helps local SEO) | 🟢 Low | |

---

## 🟢 Content Tasks

| # | Task | Priority | Notes |
|---|------|----------|-------|
| K1 | Create 1200×630px `og-image.png` — a clean theme screenshot | 🔴 Critical | Used in every social share of the site URL |
| K2 | ProductHunt gallery: 3 theme screenshots (Retro, Minimalist, Modern) + 1 GIF of live preview | 🟠 High | Export-quality PNG from existing export tooling |
| K3 | 5 Twitter/X launch day posts ready to schedule | 🟠 High | Hour 0, 2, 5, 8, 12 — milestone updates + demo |
| K4 | Write ProductHunt tagline + description (problem first, then 3 bullet benefits) | 🟠 High | Tagline: "Stop invoicing in Google Docs. You deserve better." |
| K5 | Write IndieHackers "How I built Invoicy" post | 🟠 High | Origin story + tech choices + early stats = highest-converting IH content format |
| K6 | 3 SEO blog posts (can be brief at launch, expand later) | 🟡 Medium | Titles: "Free invoice generator for freelancers", "Invoice template for freelancers India", "How to invoice clients as a freelancer" |
| K7 | Dribbble / Behance post: Retro + Clean theme designs tagged "invoice UI design" | 🟡 Medium | Drives designer audience; backlinks help SEO |
| K8 | r/freelance + r/webdev launch post — honest founder story, not marketing | 🟠 High | Show HN format: "I built X because Y, here's what I learned" |

---

## Launch Day Sequence

1. **12:01am PST** — Submit ProductHunt listing
2. **6:00am** — Post in r/webdev and r/freelance (US morning engagement peak)
3. **9:00am** — Twitter/X update #1: "We launched on ProductHunt today"
4. **12:00pm** — Reddit r/IndiaStartups post + LinkedIn India post (India afternoon peak)
5. **3:00pm** — Twitter/X update #2: current ranking + first user feedback quote
6. **6:00pm** — Twitter/X update #3: milestone (X sign-ups, X invoices created)
7. **9:00pm** — IndieHackers post goes live (US evening reading time)
8. **11:00pm** — Final Twitter/X wrap-up post with stats from day 1

---

## Post-Launch Week 1 Monitoring

Watch these daily:

- Supabase `profiles` table count — total sign-ups
- Lemon Squeezy orders — free → paid conversion rate (target 5–8%)
- PostHog funnel: landing → sign-up → invoice created → upgrade modal → checkout
- Any PDF export failure reports (watch app console errors via PostHog or Sentry)
- Checkout abandonment rate (if > 70%, test lowering monthly to $7/mo)

**If conversion < 3% after 100 sign-ups:**
- Raise `FREE_INVOICE_LIMIT` from 3 → 5 in `src/hooks/useInvoicyPro.ts:5`
- Improve upgrade modal copy — test "Your client deserves this" vs "Unlock Pro"
- Add a single testimonial quote above the upgrade CTA
