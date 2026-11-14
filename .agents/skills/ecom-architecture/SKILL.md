---
name: ecom-architecture
description: >-
  Comprehensive guide, rules, and runbooks for the Aurem Enterprise E-Commerce platform.
  Covers the 4-tier clean architecture, Better Auth RBAC, Zero-Waterfall performance optimization,
  Next.js 16 split-caching, 3-zone Bangladesh delivery logistics, Steadfast courier integration,
  and locked admin UI design tokens.
---

# Aurem Enterprise E-Commerce Architecture & Engineering Skill

> **AUTHORITY: MANDATORY FOR ALL ASSISTANTS & ENGINEERS**  
> Use this skill to navigate, develop, modify, and optimize the Aurem E-Commerce platform without needing repeated explanations of project architecture or business conventions.

---

## 🏛️ 1. Architecture Map (The 4 Tiers)

```
[ Client / Browser / Webhook ]
              │
              ▼
1. Transport Layer (Thin Controllers: src/app/api/**/route.ts)
   - Only validates requests, extracts params/body, and delegates to Domain Services.
   - Always returns universal envelope: apiSuccess() or apiError().
   - NO direct business calculations or heavy queries.
              │
              ▼
2. Domain Services Layer (Pure Business Engines: src/services/*.service.ts)
   - Order service (src/services/order.service.ts): Server-authoritative pricing, atomic stock lock.
   - Courier service (src/services/courier.service.ts): Steadfast API dispatch & sandbox simulation.
   - Reusable across Route Handlers and Server Components (0ms in-memory calls).
              │
              ▼
3. Data Persistence Layer (Mongoose Singleton: src/models/*.ts)
   - 11 POJO domain collections (StoreConfig, Category, Collection, Brand, Product, Order, Customer, User, Coupon, Review, AuditLog).
   - Cached globally in src/lib/db.ts to avoid Atlas pool exhaustion.
              │
              ▼
4. Infrastructure Adapters (src/lib/)
   - Cloudflare R2 S3 SDK (src/lib/r2.ts).
   - Better Auth Server (src/lib/auth.ts) & Client (src/lib/auth-client.ts).
   - Universal API envelope helpers (src/lib/api-response.ts).
```

---

## ⚡ 2. Performance & Caching Quick Reference

1. **Server Components:** NEVER call `fetch('/api/...')` internally. Always invoke Domain Services in-memory (`src/services/*.service.ts`) at 0ms latency.
2. **Database Queries:** Always use `.lean()` and explicit `.select()` projections. Never run unprojected `.find()`.
3. **Zero-Waterfall Queries:** Batch independent async queries with `Promise.all([ ... ])`.
4. **Next.js 16 Split-Cache:**
   - `/admin/**`, `/checkout`, `/account` $\rightarrow$ `export const dynamic = 'force-dynamic'; export const revalidate = 0;` + `no-store`.
   - Storefront `/`, `/shop`, `/products/[slug]` $\rightarrow$ `unstable_cache` with tags (`'products'`, `'store-config'`) + `must-revalidate` (NEVER `no-store` on HTML so mobile `bf-cache` works).
5. **Dual Invalidation:** On every mutation (`POST`, `PUT`, `PATCH`, `DELETE`), call both `revalidateTag(...)` AND `revalidatePath(...)`.
6. **LCP Hero Gate:** Hero product images and first catalog images MUST use `<Image priority sizes="..." />`.

---

## 🇧🇩 3. Bangladesh Domain & Checkout Rules

1. **Guest 3-Field Checkout:** Storefront checkout drawer requires ONLY Name, 11-digit Phone (`/^01[3-9]\d{8}$/`), and Delivery Address. No mandatory password or registration.
2. **3-Zone Delivery:**
   - `INSIDE_DHAKA`: ৳70
   - `DHAKA_SUBURBS`: ৳100 (Savar, Gazipur, Keraniganj, Narayanganj)
   - `OUTSIDE_DHAKA`: ৳130 (All other 63 districts)
   - Free shipping above threshold (default ৳2500).
3. **Server-Authoritative Pricing:** Client sends zero price fields. The server resolves prices strictly from MongoDB.
4. **Atomic Conditional Stock:** All stock decrements require `{ 'variants.stock': { $gte: qty } }` with automatic rollback on partial failure.
5. **Steadfast Courier 1-Click Booking:** Books directly via Steadfast API or auto-simulates sandbox consignment (`SF-XXXXXX`) in dev.

---

## 🎨 4. Admin UI Design System Tokens

- **Page Title:** `text-2xl font-bold tracking-tight text-[#060d11]`
- **Breadcrumbs:** 14px (`text-sm`), inactive `text-slate-500 hover:text-[#060d11] transition-colors`, active `text-[#060d11] font-medium`
- **Card Title:** `text-base font-semibold leading-none tracking-tight text-[#060d11]`
- **Card Description:** `text-sm text-slate-500`
- **Primary Action CTA:** `bg-[#076E46] text-white hover:bg-[#055C3A]`
- **Unboxed Surfaces:** No nested grey boxes, no decorative icons beside labels.
- **Multi-Tab Horizontal Scroll:** Mousewheel `onWheel` translation (`scrollLeft += e.deltaY`) + chevron buttons + `shrink-0`.

---

## 🚫 5. Anti-Drift & Greenfield Rules

1. **Zero Legacy Baggage:** NEVER use or re-introduce `images`, `photos`, or `primaryCategory`. Always use `media: IProductMedia[]` and `categoryName`.
2. **No Extra DB Tables:** Variants live embedded in `Product.variants[]`. Banners live embedded in `StoreConfig.homeSections[]`. Carts live in client Zustand.
3. **Standard Envelope:** All API responses use `ApiResponse<T>` (`apiSuccess` / `apiError`).
