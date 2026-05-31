# Invoicy — Pre-Launch QA Checklist

Manual browser pass on **https://invoicy-nine.vercel.app** (hard-refresh first: Cmd/Ctrl+Shift+R).
Each item notes the session fix it verifies. Check the browser **Console** (F12) for red errors throughout.

## 1. Auth (Clerk ↔ Supabase)
- [ ] Sign up with a new account → lands on `/app`
- [ ] Sign in with an existing account → lands on `/app`
- [ ] Dashboard loads **without** the "Failed to load invoices" banner — *verifies the Clerk→Supabase token + RLS chain*
- [ ] Sign out, then hit `/app` directly → redirected to `/login`

## 2. Create & save an invoice (core happy path)
- [ ] "New Invoice" → wizard opens on Step 1
- [ ] Step 2: edit sender/client, add line items, set quantity/price
- [ ] **Clear a price field, retype** → preview never crashes/blanks *(HIGH-1)*
- [ ] Set a due date **before** the issue date → inline warning shows *(MED-4)*
- [ ] Step 3: validation card reflects real field state (blank a required field → "Incomplete") *(Bug #4)*
- [ ] "Save Invoice" → returns to Dashboard, invoice appears *(verifies authenticated write under RLS)*
- [ ] Edit the invoice, type in a field, then trigger any background update → **unsaved edits are NOT lost** *(CRIT-2)*

## 3. Dashboard
- [ ] Status dropdown on a row → change status → **persists after refresh** *(Bug #3)*
- [ ] All status filters work: draft / sent / viewed / partial / paid / overdue / cancelled *(MED-2)*
- [ ] Search by invoice # and by client name filters correctly
- [ ] With invoices present, set a filter that matches none → "No matches" + "Clear Filters" *(MED-7)*
- [ ] Delete an invoice → modal reads "Delete Invoice? / Yes, Delete Invoice / Cancel" *(quick-win copy)*
- [ ] Tab with keyboard to a row → action buttons become visible *(MED-8)*

## 4. Export — the critical one (test on **every theme**)
For each of **minimalist, corporate, retro, clean, modern**:
- [ ] PDF export downloads a correctly-styled A4 file — **no "unsupported color function oklch" error** *(the big fix)*
- [ ] PNG export downloads a correctly-styled image
- [ ] Dashboard row "Download" button exports the same way
- [ ] **Safari specifically**: exported PDF is fully styled (not blank/unstyled) *(HIGH-2)*

## 5. Share links (public preview)
- [ ] Pro user: "Copy Link" → success toast; if clipboard blocked, error toast (not silent) *(HIGH-7)*
- [ ] Open the copied `/preview/:id?t=...` in an **incognito window** → invoice renders, brand logo links home *(LOW-7)*
- [ ] Tamper with the `?t=` token → "This invoice isn't available"
- [ ] Export PDF/PNG from the preview page → works, with toast feedback *(HIGH-5)*

## 6. Premium / upgrade (Lemon Squeezy **test mode**)
- [ ] Free user hits the 1-invoice limit → "New Invoice" prompts upgrade
- [ ] Free user clicks PDF/PNG export → modal says **"Unlock PDF & PNG Export"** *(HIGH-11)*
- [ ] Free user clicks a Pro theme → upgrade modal; after upgrading, that theme is **auto-applied** *(LOW-3)*
- [ ] Pro plan name reads **"Studio Pro"** everywhere (sidebar, wizard, modal) *(quick-win)*
- [ ] Complete a **test-mode** purchase → after refresh, Pro features unlock *(verifies the live webhook end-to-end)*
- [ ] (If checkout URL ever unset) upgrade button shows an error toast, not a silent no-op *(MED-9)*

## 7. Settings
- [ ] Upload a business logo → save → create a **new** invoice → logo is pre-filled *(Bug #5)*
- [ ] "Clear Local Data" → confirm → business profile actually clears *(HIGH-4)*

## 8. Landing page & navigation
- [ ] Signed-out header shows **Sign In + Get Started**; "Get Started"/"Start Free" → `/sign-up` *(HIGH-12)*
- [ ] Footer About / Privacy / Terms navigate correctly (right-clickable links) *(LOW-5)*
- [ ] Hero image loads fast (≈400 KB, lazy) — check Network tab *(perf)*

## 9. Cross-cutting
- [ ] **Firefox**: wizard Step 2 preview scales correctly (not clipped) *(MED-3)*
- [ ] **Mobile**: bottom nav not obscured by the home indicator (iOS safe area) *(MED-10)*
- [ ] Network tab: `html2canvas`/`jspdf` chunks load **only when exporting**, not on initial page view *(HIGH-9)*
- [ ] No duplicate Supabase `profiles` request storm on `/app` load *(HIGH-6)*

---

### Known non-blockers / follow-ups
- DiceBear testimonial avatars are still external CDN fetches (lazy-loaded, with error fallback) — could be migrated to static assets later.
- `server.ts` (local dev server) is unused in the Vercel deployment; production uses the `api/webhooks/lemonsqueezy.ts` serverless function.
