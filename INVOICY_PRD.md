# Invoicy - Product Requirements Document (PRD)

## 1. Project Overview & Context
**Product Name:** Invoicy
**Description:** A high-performance billing engine for modern studios. Generates agency-grade invoices in seconds without the bloat of traditional accounting software. Combines high-end typography with a razor-sharp export engine to give businesses a premium aesthetic presence.
**Target Audience:** Design agencies, modern studios, freelancers, and creative professionals.
**Core Value Proposition:** Move away from spreadsheets that look like they are from 1998. Provide a beautifully designed, dark-mode focused invoicing tool.

---

## 2. Tech Stack
- **Frontend Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
  - Custom Color Palette: `abyssal` (deep dark background), `flame` (primary accent/orange), `palladian` (secondary bright), `oatmeal` (muted text color)
- **Authentication:** Clerk (`@clerk/clerk-react` v5+)
- **Database/Backend:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Export Engine:** Client-side React-to-Print / auto-pagination capabilities for high-fidelity PDF exports.

---

## 3. Architecture & Routing Structure
The application follows a strict structural division between public pages and the authenticated dashboard.

### Public Routes:
- `/` - Landing Page (Features showcase, pricing, CTA to login)
- `/login/*` - Clerk SignIn component (`routing="path"`, `path="/login"`, `fallbackRedirectUrl="/app"`, `signUpUrl="/sign-up"`)
- `/sign-up/*` - Clerk SignUp component (`routing="path"`, `path="/sign-up"`, `fallbackRedirectUrl="/app"`, `signInUrl="/login"`)
- `/about`, `/privacy`, `/terms` - Legal pages detailing the company mission ("Design. Bill. Repeat.").

### Authenticated Routes (Behind `<AuthGuard />`):
Wrapped in `AppLayout` with a premium sidebar/nav and Clerk `<UserButton />`.
- `/app` - **Dashboard:** Grid/List of past records/invoices in the vault, Pro plan status banner, CTA to create new.
- `/app/create` - **Invoice Wizard:** Split view with form on the left (client info, line items) and live document preview on the right.
- `/app/edit/:id` - **Edit Invoice:** Same wizard, loaded with existing invoice data.
- `/app/settings` - **Settings:** Brand defaults and account management.

---

## 4. Authentication Integration (Clerk)
- Utilizes modern Clerk v5+ components.
- Seamless flow toggling between Login and Signup.
- Secures application using JWT to interact with external databases when needed.
- Requires standard environment variable: `VITE_CLERK_PUBLISHABLE_KEY`.
- Test credentials are fundamentally tied to the email address (e.g., `pro@invoicy.test` for premium unlocks).

---

## 5. Database Schema & State (Supabase)
Supabase handles all persistence.

**Table 1: `profiles`**
- `id` (UUID, PK, linked directly to Clerk User ID)
- `email` (String)
- `is_premium` (Boolean) - Determines if the user has unlocked Pro features.

**Table 2: `invoices`**
- `id` (UUID, PK)
- `user_id` (UUID, FK to profiles)
- `invoice_number` (String)
- `date` (Timestamp)
- `due_date` (Timestamp)
- `client_name` (String)
- `client_email` (String)
- `client_address` (Text)
- `items` (JSONB) - Array of line items `{ description, quantity, price, total }`
- `subtotal` (Decimal/Numeric)
- `tax_rate` (Decimal/Numeric)
- `tax_amount` (Decimal/Numeric)
- `total` (Decimal/Numeric)
- `notes` (Text)
- `theme_id` (String) - Stores the user's selected design identity (e.g., minimalist, corporate, retro).
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

---

## 6. Premium Mechanics & Tier Logic (`useInvoicyPro` hook)
The app utilizes a standard freemium model.
- **State Management:** Handled globally by the `useInvoicyPro` custom hook.
- **Free Tier Constraints:** 
  - Access limited to 1 basic default theme ('minimalist').
  - Usage limits applied (e.g., maximum of 1 or 3 downloaded exports across the lifetime).
- **Pro Tier Unlocks:**
  - Access to all 12 premium design identities / themes.
  - Infinite / unlimited high-fidelity exports.
  - Premium tag displayed on the Dashboard.
- **Verification:** Users are validated against the `is_premium` column in Supabase, or natively overridden if logging in via specific test emails like `pro@invoicy.test` or `email+pro@gmail.com`.

---

## 7. Core Frontend Components
- **`Dashboard.tsx`:** Primary workspace view showing total records in the vault and current tier.
- **`InvoiceWizard.tsx`:** The core engine. Allows users to select their theme, input data dynamically, and see it generated on a scale-adjustable canvas on the right.
- **`InvoiceForm.tsx`:** The complex left-panel inputs capturing the line items and calculations.
- **`BrandLogo.tsx`:** Custom SVG implementation for the distinct Invoicy flame/brand mark.
- **`useInvoicyPro.ts`:** Resolves Clerk Auth + Supabase calls to verify feature gating in real-time.
