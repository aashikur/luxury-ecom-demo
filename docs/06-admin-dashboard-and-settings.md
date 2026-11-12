# 06: Admin Dashboard & Store Settings Guide

> **Status:** Tier 4 Historical MVP Study Note (`v1` — early 5-tab settings). Expanded to **7 modules**, `SUPER_ADMIN`-only RBAC, `next/dynamic` lazy tabs, & `.aggregate()` KPIs — see [`docs/10-store-settings-and-configuration-scope.md`](./10-store-settings-and-configuration-scope.md) & [`Rule #23`](./pipeline/01-scope-and-business-rules.md).

## 1. What We Built
- **Isolated Admin Route Group**: Created `src/app/(admin)/admin/` with an enterprise-grade dark sidebar (`bg-zinc-950`) inspired by the Apex Dashboard reference.
- **Admin Layout (`layout.tsx`)**: High-contrast dark navigation with Overview, Commerce (Orders, Products), System (Settings), live store shortcut, and admin profile card.
- **Interactive Store Settings (`/admin/settings`)**: A 5-tab settings studio directly mapped to MongoDB Atlas `StoreConfig`:
  1. *Branding & Theme*: Store Name, Tagline, Dynamic Color Picker (`#B8860B`), Theme Mode (Light/Dark).
  2. *Logistics & Delivery*: Inside/Outside Dhaka fees, Free shipping threshold (৳2,500), Hotline, Showroom address.
  3. *Payment Gateways*: Cash on Delivery toggle, Manual bKash toggle + wallet number + instructions.
  4. *Steadfast Courier*: API Key, Secret Key, Base URL, Auto-booking switch, Fraud check ratio.
  5. *Homepage Sections*: Show/Hide visibility toggles and Up/Down reordering for Hero Banner, Collection Grids, and Promo Banner.
- **Overview Landing Page (`/admin`)**: 4 KPI metric cards (Total Revenue, Active Orders, Garments in Catalog, Steadfast Dispatches) with instant jump buttons.

---

## 2. Why We Built It
- **Code-Free Merchant Control**: Allows the store owner to change delivery rates, phone numbers, bKash wallets, and banner ordering in 5 seconds without touching code.
- **Zero Style Collision**: Placing admin inside route group `(admin)` guarantees that admin CSS, dark layouts, and fonts never bleed into or conflict with the storefront.
- **Direct Database Mutation**: Clicking "Save Settings" directly dispatches a `PUT /api/config` request, updating the live MongoDB Atlas singleton in real-time.

---

## 3. Checklist
- [x] Create `src/app/(admin)/admin/layout.tsx` with Apex-style dark sidebar.
- [x] Implement responsive mobile slide-over drawer (`AdminShellClient.tsx`) with backdrop, hamburger trigger, route auto-close, and close button matching Apex reference.
- [x] Refine branding to strictly use Lucide vector icons (`Zap`) with `#00C885` rounded container and typography (`AUREM` + `DASHBOARD`), strictly eliminating emoji characters across admin views.
- [x] Implement `src/components/admin/SettingsFormClient.tsx` with 5 reactive tabs.
- [x] Wire server component `src/app/(admin)/admin/settings/page.tsx` with live DB data.
- [x] Implement overview dashboard landing at `src/app/(admin)/admin/page.tsx`.
- [x] Verify production build passes with exit code 0 (`12/12` pages compiled).

---

## 4. Sources & Cross References
- Settings Page: [`src/app/(admin)/admin/settings/page.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/app/(admin)/admin/settings/page.tsx)
- Settings Client Component: [`src/components/admin/SettingsFormClient.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/components/admin/SettingsFormClient.tsx)
- Admin Layout: [`src/app/(admin)/admin/layout.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/app/(admin)/admin/layout.tsx)
- API Reference: [`docs/postman/API_REFERENCE.md`](./postman/API_REFERENCE.md)
