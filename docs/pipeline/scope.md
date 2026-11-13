# 📋 Enterprise Luxury Garments E-Commerce — Platform Scope & Specification Pipeline

> **Master Scope Document & Technical Specification Matrix**  
> **Repository:** `e-com`  
> **Brand Identity:** AUREM / Config-Driven Multi-Brand Architecture  
> **Tech Stack:** Next.js 16 (App Router + Turbopack), TypeScript, Tailwind CSS v4, MongoDB Atlas (Mongoose singleton), Cloudflare R2 (S3 SDK), Cloudinary  
> **Continuous Sync Standard:** Under `docs/00-how-to-notes.md` Rule #5, this document is continuously maintained and updated after every task to reflect live deliverables, active technical specifications, and project scope.

---

## 🗺️ The 7-Step Senior Master Pipeline

| Step | Milestone | Scope & Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **01** | **Scope & Business Rules Locked** | 7 Core + 4 Growth Collections, Guest 3-field COD & 3-Zone delivery, Unified Payment Adapter (`COD`+`SSLCommerz`+SMS-webhook), 5-Role RBAC & CSP, Idempotent atomic stock, Zero-latency Storefront SLA (`getPublicStoreConfig()` cache, `bf-cache`, `loading.tsx`, 2-col `384w`), WCAG AA Gate, & Admin Anti-Over-Engineering Rules (`.aggregate()`, URL pagination `<=50`, fixed shell + `{children}` skeleton). | 🔒 **LOCKED** ([Spec](./01-scope-and-business-rules.md)) |
| **02** | **Schema, Interface & Envelope** | TypeScript DTOs, Mongoose Schema interfaces, 11-collection typing (7 Core + 4 Growth/Taxonomy), Standard `{ success, data, pagination, error, code }` response contract, bounded pagination (`limit <= 50`), and Zod request validation allowlists. | 🔒 **LOCKED** ([Spec](./02-schema-interface-and-response-envelope.md)) |
| **03** | **Seed Engine & Fixtures** | 1-Command database seeding script (`npm run db:seed`) generating realistic multi-variant products, categories, collections, and admin credentials. | ⏳ **PENDING** |
| **04** | **Core Backend & State Machine** | Atomic inventory decrement, Order lifecycle transitions (`INCOMPLETE` $\rightarrow$ `DELIVERED`), Steadfast courier API integration, `revalidatePath` cache busters. | ⏳ **PENDING** |
| **05** | **Admin & Staff Auth (RBAC)** | HttpOnly Cookie sessions for Admin / Call-Center staff; zero-password barrier for guest buyers. | ⏳ **PENDING** |
| **06** | **Frontend UI Wireup** | 1-Page COD drawer, Size chart modal, Color swatches, Admin taxonomy management (`/admin/categories`, `/admin/collections`), Variant matrix builder. | ⏳ **PENDING** |
| **07** | **Hardening & Launch Sign-Off** | Concurrency verification, Vercel Edge cache inspection, backup restore drills per `docs/PRODUCTION_CHECKLIST.md`. | ⏳ **PENDING** |

---

## 1. v1 MVP Baseline Matrix (Pre-Hardening Prototype)

> **Clarification:** Phases 01–11 below track the **initial v1 MVP prototype**. Production hardening, security, 11-collection schema expansion, ~0ms caching, and remaining v2 features are governed by the **7-Step Senior Master Pipeline** above (with [`01-scope-and-business-rules.md`](./01-scope-and-business-rules.md) as the single CR-Locked authority).

| Phase | Module | Scope & Core Deliverables | v1 MVP Status | Live Components / Routes |
| :--- | :--- | :--- | :---: | :--- |
| **01** | **Cloud & DB Infrastructure** | MongoDB Atlas connection pool singleton, Cloudflare R2 bucket with custom domain CDN, Cloudinary backup, Multi-service health probe. | ✅ **DONE** | `src/lib/db.ts`<br>`src/lib/r2.ts`<br>`src/lib/storage.ts`<br>`GET /api/health` |
| **02** | **v1 Core Schemas** | Initial v1 Mongoose schemas for `StoreConfig`, `Product`, and `Order` (to be hardened & expanded to 11 collections in **v2 Step 02**). | ✅ **v1 DONE** *(v2 Step 02 Pending)* | `src/models/StoreConfig.ts`<br>`src/models/Product.ts`<br>`src/models/Order.ts` |
| **03** | **Zero-Dep Media Pipeline** | Pure HTML5 Canvas rule-based client-side image compressor (3-tier matrix, max 1200px cap, target < 200KB WebP) + Cloudflare R2 upload API. | ✅ **DONE** | `src/lib/imageCompressor.ts`<br>`POST /api/upload`<br>`DELETE /api/upload` |
| **04** | **Storage Garbage Collection** | Lifecycle asset cleanup: instant R2 deletion on media remove (✕), batch purge of uncommitted draft uploads on form cancel, and cascade deletion on product delete. | ✅ **DONE** | `src/components/admin/MediaUploader.tsx`<br>`src/components/admin/ProductFormClient.tsx`<br>`DELETE /api/products/[slug]` |
| **05** | **Admin Navigation & Shell** | Full-width edge-to-edge admin layout, responsive mobile header, mobile slide-over navigation drawer with backdrop blur, route auto-close. | ✅ **DONE** | `src/app/(admin)/admin/layout.tsx`<br>`src/components/admin/AdminShellClient.tsx` |
| **06** | **Product Management Suite** | Unified 2-column Product Form for Create (`/admin/products/new`) & Edit (`/admin/products/[id]/edit`), auto-slug generation, stock badges, 3:4 portrait uploader (v2 pagination & `loading.tsx` in **Step 06**). | ✅ **v1 DONE** *(v2 Step 06 Hardening)* | `src/app/(admin)/admin/products/`<br>`src/components/admin/ProductFormClient.tsx` |
| **07** | **Category & Collection Engine** | Managed taxonomy tree (ancestors materialized path, circular safeguard, delete protection), marketing collections, cascading selectors in Admin. | ✅ **DONE** | `src/models/Category.ts`<br>`src/models/Collection.ts`<br>`/api/categories`<br>`/api/collections` |
| **08** | **Store Settings Engine** | 7-module configuration dashboard (`branding`, `logistics`, `payment`, `courier`, `tracking`, `sections`, `features`) — v2 RBAC, AES-256 encryption, & lazy tabs pending in **Steps 04–06**. | 🟡 **IN PROGRESS** | `src/app/(admin)/admin/settings/`<br>`src/components/admin/SettingsFormClient.tsx` |
| **09** | **Orders & Fulfillment Suite** | `/admin/orders`, manual order entry, live orders table, Steadfast courier 1-click booking, customer fraud view. | ⏳ **PENDING** *(Step 06)* | `src/models/Order.ts`<br>`/api/orders` |
| **10** | **Storefront Catalog & Discovery** | Basic `/`, `/shop`, & `/products/[slug]` live in v1; v2 faceted URL filters, `/category/[slug]`, `/brand/[slug]`, `/api/search`, 2-col mobile grid, `bf-cache` & `loading.tsx` in **Steps 04–06**. | 🟡 **v1 LIVE** *(v2 Step 06 Hardening)* | `src/app/page.tsx`<br>`src/app/shop/page.tsx`<br>`src/app/products/[slug]/page.tsx` |
| **11** | **Frictionless 1-Page BD Checkout** | Slide-over `CartDrawer` live for `COD` + `MANUAL_BKASH`; v2 3-zone delivery, server-authoritative pricing, `idempotencyKey`, `SSLCommerz` IPN, SMS webhook, & `/checkout` in **Steps 04–06**. | 🟡 **v1 PARTIAL** *(v2 Step 04–06)* | `src/components/storefront/CartDrawer.tsx`<br>`POST /api/orders` |

---

## 2. Technical Specifications & Architecture References (Zero-Duplication SoC)

* **Authoritative Rules (`Rules #1 – #23`):** All business logic, security, payment adapters, RBAC, caching, performance SLAs, and CR log live strictly in [`docs/pipeline/01-scope-and-business-rules.md`](./01-scope-and-business-rules.md).
* **7-Module `StoreConfig` & 3-Layer Secret Shield:** Detailed field specifications live in [`docs/10-store-settings-and-configuration-scope.md`](../10-store-settings-and-configuration-scope.md).
* **Media Optimization Engine (`src/lib/imageCompressor.ts`):** Strictly locked **3:4 Portrait** (`1200 x 1600 px`), WebP format, target 80 KB – 180 KB (3-tier Case A/B/C matrix), and 3-stage Cloudflare R2 garbage collection (`MediaUploader` remove ✕, draft cancel purge, and product cascade delete).

---

## 3. Continuous Per-Task Changelog

### Task #01: Zero-Dep Image Compressor & UI Clean-up
* **Files Modified/Created:** `src/lib/imageCompressor.ts`, `src/components/admin/MediaUploader.tsx`.
* **Changes:** Replaced naive canvas downscaling with 3-tier intelligent rule matrix (Case A, B, C). Removed AI badges and notice boxes. Added standard subtitle: `Accepted ratio 3:4 · Max size 500 KB · WebP, PNG, JPG`. Added compression feedback string.

### Task #02: Cloudflare R2 Garbage Collection & Asset Lifecycle
* **Files Modified:** `src/components/admin/MediaUploader.tsx`, `src/components/admin/ProductFormClient.tsx`, `src/app/api/products/[slug]/route.ts`.
* **Changes:** Added async deletion on media remove, session key tracking for clean draft cancel purge, and product cascade image deletion in route handler.

### Task #03: Pipeline Specification Standard & Documentation Sync
* **Files Modified:** `docs/00-how-to-notes.md`, `docs/pipeline/scope.md`.
* **Changes:** Established Rule #5 in documentation standard. Authored complete Project Scope and Technical Specification Pipeline tracking all 10 platform modules.

### Task #04: Enterprise Dynamic Category & Collection Engine
* **Files Created/Modified:** `src/models/Category.ts`, `src/models/Collection.ts`, `src/models/Product.ts`, `src/app/api/categories/route.ts`, `src/app/api/collections/route.ts`, `src/components/admin/ProductFormClient.tsx`, `scripts/seed-taxonomies.mjs`.
* **Changes:** Replaced static category strings with database-driven taxonomy tree (Materialized Path `ancestors`, circular dependency guard, delete protection against assigned products). Integrated 3-level cascading category selector in Admin Product Form with live path breadcrumbs (`Men › Tops › Hoodies`), in-line "+ Quick Add Category" modal, and multi-select marketing collection tags. Seeded production categories and collections. All 16 routes verified and compiling cleanly with Next.js Turbopack.

### Task #05: Admin Design System Lock & Multi-Client Database Collection Architecture
* **Files Created/Modified:** `.gemini/rules/admin-ui-design-system.md`, `docs/08-admin-design-hierarchy-and-ui-tokens.md`, `docs/09-database-collection-architecture.md`, `src/components/ui/*`, `src/components/admin/ProductsTableClient.tsx`, `src/components/admin/ProductDetailClient.tsx`.
* **Changes:** Enforced locked typography and UI token hierarchy (`text-2xl font-bold tracking-tight text-[#060d11]`, 14px breadcrumbs with `#060d11` active state, `#076E46` emerald CTAs, unboxed minimal card surfaces). Standardized 7 Core + 3 Growth database collections architecture optimized for 1-click client deployments with zero join overhead.

### Task #06: Store Settings & Configuration Architecture Scope
* **Files Created/Modified:** `docs/10-store-settings-and-configuration-scope.md`, `docs/pipeline/scope.md`.
* **Changes:** Fully codified the 7-module settings specification (`General Branding & Store Niche`, `Logistics & Delivery`, `Payment Gateways & Manual Wallets`, `Courier & Fraud Shield`, `Marketing & Tracking Pixels`, `Homepage Layout Builder`, and `Global Feature Toggles`) enabling complete zero-code client onboarding.


### Task #07: Production Cache Invalidation, On-Demand Revalidation & Dynamic Rendering Lock
* **Files Created/Modified:** `src/app/page.tsx`, `src/app/shop/page.tsx`, `src/app/products/[slug]/page.tsx`, `src/app/(admin)/admin/layout.tsx`, `src/app/(admin)/admin/page.tsx`, `src/app/(admin)/admin/products/page.tsx`, `src/app/(admin)/admin/products/[id]/page.tsx`, `src/app/(admin)/admin/products/[id]/edit/page.tsx`, `src/app/(admin)/admin/settings/page.tsx`, `src/app/api/products/route.ts`, `src/app/api/products/[slug]/route.ts`, `src/app/api/config/route.ts`, `src/app/api/orders/route.ts`, `src/app/api/categories/route.ts`, `src/app/api/collections/route.ts`, `src/components/admin/ProductsTableClient.tsx`, `docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`, `docs/pipeline/scope.md`.
* **Changes:** Diagnosed and eliminated production stale-cache issue on Vercel Edge (`X-Vercel-Cache: HIT`, `X-Nextjs-Prerender: 1`) where product creations and image edits updated MongoDB Atlas but were masked by static build caching. Locked `export const dynamic = 'force-dynamic'` and `revalidate = 0` across all admin routes and storefront catalog. Integrated `revalidatePath` into all mutation route handlers (`POST`, `PUT`, `DELETE`). Added client-side prop sync and `no-store` background fetch on mount in `ProductsTableClient.tsx`. Upgraded homepage collection matching to support multi-attribute category and taxonomy fallback. Fully codified lesson and master prompt template in `docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`.


### Task #08: Master 7-Step Pipeline Codification & Step 1 Scope and Business Rules Lock
* **Files Created/Modified:** `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/scope.md`.
* **Changes:** Formulated and locked the 7-Step Senior Master Engineering Pipeline (`Scope & Rules` ➔ `Schema & Envelope` ➔ `Seed Engine` ➔ `Core Backend & State Machine` ➔ `Admin Auth` ➔ `Frontend Wireup` ➔ `Hardening & Sign-off`). Authored exhaustive Step 1 specification locking the 7 Core + 3 Growth collections boundaries, Bangladeshi 3-field guest checkout rules (`01XXXXXXXXX`), abandoned cart lead state machine (`INCOMPLETE`), atomic conditional stock decrement (`$inc`), Steadfast courier fraud thresholds, multi-niche adaptability, and Cloudflare R2 media lifecycle.

### Task #09: Production Security, Unified Payment Adapter, 5-Role RBAC & Zero-Latency SLA Scope Lock
* **Files Modified:** `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/scope.md`.
* **Changes:** Hardened Step 1 Scope ahead of Step 2 Schema & Database Design by locking: (1) 3-Zone delivery rules (`INSIDE_DHAKA`, `DHAKA_SUBURBS`, `OUTSIDE_DHAKA`), dual atomic stock predicates (`hasVariants` true/false) with `inventoryState` idempotency guard, and `Customer` fraud feedback counters; (2) Split Cache Strategy (`force-dynamic` Admin vs tagged `unstable_cache` + `revalidateTag`/`revalidatePath` ~0ms Storefront); (3) Unified Payment Adapter (`COD` + `SSLCommerz` primary + Manual MFS & signed Mobile SMS-Forwarder webhook auto-verify using identical `paymentStatus` state contract); (4) 5-Role RBAC permission matrix (`USER` retail, `MERCHANT` future wholesale pricing, `MODERATOR` limited future staff, `ADMIN` store owner excluding `StoreConfig`, `SUPER_ADMIN` exclusive `StoreConfig`/secrets owner) with `AuditLog` triggers; (5) Server-authoritative pricing, checkout `idempotencyKey`, DTO allowlists, rate limiting (including webhook HMAC), and IDOR-safe guest order tracking; (6) Rule #21 Zero-Latency Performance SLA mandating `.select()` projections, `.lean()`, `Promise.all`, `loading.tsx` skeletons + `<Suspense>` streaming, `useLinkStatus()` tap feedback, explicit `<Image sizes>` + `priority` + shimmer blur placeholder, and `sin1` Singapore region co-location.

### Task #10: Lighthouse Audit Hardening (`bf-cache`, `StoreConfig` Singleton Cache, Enforced CSP, Mobile `384w` & WCAG AA Gate)
* **Files Modified:** `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/scope.md`.
* **Changes:** Incorporated production Mobile & Desktop Lighthouse audit findings into Step 1 Scope: (1) Locked `getPublicStoreConfig()` shared `unstable_cache` (`tags: ['store-config']`) + `Cache-Control: public, max-age=0, must-revalidate` (NO `no-store` on public storefront HTML) to enable `0ms` mobile `bf-cache` back-swipe while keeping `/admin/**`, `/checkout`, and `/account` strictly `no-store`; (2) Mandated enforced `Content-Security-Policy` (CSP) + HSTS headers in Rule #20; (3) Locked mobile 2-column grid (`grid-cols-2`) + `deviceSizes` (`384`, `480`) in Rule #21 to stop `w=750` over-serving; (4) Added **Rule #22** locking WCAG AA `4.5:1` contrast guardrail, sequential heading order (`h1 -> h2 -> h3`), ARIA label parity, and Chrome Incognito Lighthouse verification gate (`Perf >= 90`, `Acc/BP/SEO = 100`).

### Task #11: Admin Dashboard Performance, Scalability & Anti-Over-Engineering Scope Lock (`Rule #23`)
* **Files Modified:** `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/scope.md`.
* **Changes:** Locked **Rule #23** governing all `/admin/**` dashboard and management routes: (1) Zero table/state bloat (NO `TanStack Table`, NO `AG Grid`, NO Redux/RTK Query, NO `nprogress`); (2) Fixed `AdminShellClient` layout with per-route `{children}` `loading.tsx` skeletons + Next.js 16 `useLinkStatus()` sidebar indicator (`<16ms` transition); (3) URL SearchParams server pagination (`limit = 20`, hard cap `<= 50`) with strict SSR/Client limit parity + `.select()` + `images: { $slice: 1 }` + `.lean()` projections; (4) Single-trip `Promise.all` + MongoDB `.aggregate([$group])` dashboard KPIs querying indexed `Order.status` (fixing `orderStatus` mismatch) and live sidebar badges; (5) Modular `next/dynamic` tab code-splitting for heavy forms (`/admin/settings`) + server-passed cached taxonomies; (6) Enforced `force-dynamic`/`no-store`, `useEffect` prop sync, `router.refresh()`, and `StoreConfig` currency symbol parity (`৳`).

### Task #12: Full Documentation SoC Alignment, Security/Performance Sync & `CR-000` Baseline Lock
* **Files Modified:** `docs/00-how-to-notes.md`, `docs/01-database-mongodb.md` through `docs/07-admin-products-management.md`, `docs/09-database-collection-architecture.md`, `docs/10-store-settings-and-configuration-scope.md`, `docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`, `docs/PROJECT_REFERENCE_NOTES.md`, `docs/PROMPT_LIBRARY.md`, `docs/postman/API_REFERENCE.md`, `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/scope.md`.
* **Changes:** Eliminated all cross-document contradictions and enforced a strict 5-Tier Documentation SoC hierarchy (`00-how-to-notes.md` + Rule #6 CR discipline). Synced `11` & `PROMPT_LIBRARY.md` to the `Rule #7` Split Cache + `bf-cache` strategy (`unstable_cache` + `revalidateTag` vs `/admin` `force-dynamic`); aligned `09` to `7 Core + 4 Growth` (11 collections) and 5 RBAC roles (`USER`, `MERCHANT`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`); aligned `10` to `Rule #10` (`homeSections` fields), `Rule #22` (WCAG AA 4.5:1 contrast), & `Rule #23` (lazy tabs); updated `API_REFERENCE.md` to remove client `unitPrice`, require `idempotencyKey` + `limit <= 50` + `SUPER_ADMIN` config RBAC, and list v2 target endpoints; clearly separated v1 MVP Matrix vs v2 Master Pipeline in `scope.md`; marked `01`–`07` & `PROJECT_REFERENCE_NOTES.md` as Tier 4 Historical MVP Notes with fixed links; and formally locked Step 1 under `CR-000`.

### Task #13: Step 2 Schema, Interface & Response Envelope Lock
* **Files Created/Modified:** `docs/pipeline/02-schema-interface-and-response-envelope.md`, `docs/pipeline/scope.md`.
* **Changes:** Fully codified Step 2 of the Senior Master Pipeline: (1) Standardized universal API response envelope (`ApiResponse<T>`, `ApiErrorResponse`, `ApiPaginationMeta`, and `ApiErrorCode` enum); (2) Codified exact TypeScript interfaces across all 11 collections (`StoreConfig`, `Category`, `Collection`, `Brand`, `Product`, `Order`, `User`, `Customer`, `Coupon`, `Review`, `AuditLog`); (3) Formulated cross-collection relationship and compound index specifications; (4) Locked server-authoritative checkout Zod allowlists (`CreateOrderSchema`), hard-capped pagination (`limit <= 50`), public vs admin `.select()` projection filters, and atomic stock decrements with `inventoryState` anti-double-restore safeguards. Formally marked Step 2 🔒 **LOCKED**.

### Task #14: Product Media Architecture & Future-Proof Video Scope Lock (v1 vs v2)
* **Files Modified:** `docs/pipeline/02-schema-interface-and-response-envelope.md`, `docs/pipeline/scope.md`, `src/models/Product.ts`.
* **Changes:** Future-proofed product media and description specifications without introducing breaking migrations:
  1. **v1 Media Scope (Active):** High-speed client-side canvas compression (`3:4 WebP`, `1200px cap`, `80-180KB`) into Cloudflare R2 + responsive Next.js `<Image sizes>` dynamic edge thumbnails.
  2. **v2 Media Scope (Roadmapped & Schema-Ready):** Polymorphic mixed-media gallery (`[picture] [video] [picture]` custom ordering). Primary video provider roadmapped as YouTube embed / YouTube Shorts (zero cost, adaptive bitrate streaming, and automatic high-resolution thumbnail API `img.youtube.com/vi/{id}/hqdefault.jpg`), with architectural hooks for Bunny.net / Cloudflare Stream and self-hosted R2 MP4.
  3. **Forward-Compatible Schema Update:** Updated `IProductImage` and `ProductSchema` with optional fields: `thumbnailUrl?: string`, `type?: 'IMAGE' | 'VIDEO'`, `videoProvider?: 'YOUTUBE' | 'VIMEO' | 'R2' | 'BUNNY_STREAM'`, and optional R2 `key` (`default: ''` so external video embeds pass validation).
  4. **Product Bullet Highlights:** Added `highlights?: string[]` to `IProduct` and `ProductSchema` for structured bullet points and specifications on PDPs alongside markdown descriptions. All changes verified clean with TypeScript `tsc --noEmit`.

### Task #15: Marketing Collections Integrity & Anti-Drift Architecture Scope Lock
* **Files Modified:** `docs/pipeline/02-schema-interface-and-response-envelope.md`, `docs/pipeline/scope.md`.
* **Changes:** Resolved architectural ambiguity regarding `Product.collections: string[]`:
  1. **Integrity Rule:** `Product.collections` is strictly an array of validated `Collection.slug` foreign keys, never unmanaged "in-the-air" strings. All marketing collections must exist as first-class documents in the `Collection` (`collections`) collection to enable global campaign banners, dates, and homepage section curation.
  2. **Zero-Join Performance:** Retained `string[]` (slug) instead of `ObjectId[]` to enable 1ms multikey indexed catalog filtering (`Product.find({ collections: slug })`) without `$lookup` join overhead.
  3. **In-Line Creation Architecture:** Prohibited disconnected local tag entry; mandated that in-form creation of new collections must persist through `POST /api/collections` so newly created campaigns become instantly available across all products.
  4. **Pure POJO Specification Standard:** Removed all legacy Mongoose `extends Document` inheritance across all 11 collection interfaces in `02-schema-interface-and-response-envelope.md`, standardizing on pure Plain Old JavaScript Objects (POJOs) with explicit `_id?: string` to guarantee 100% type compatibility with `.lean()` queries and Next.js client component serialization.

### Task #16: Greenfield Taxonomy Architecture (`categoryName` & `categorySlug` Pure Symmetry)
* **Files Modified:** `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/02-schema-interface-and-response-envelope.md`, `docs/pipeline/scope.md`.
* **Changes:** Completely eliminated legacy baggage (`primaryCategory`) from the architectural scope and specifications:
  1. Standardized on pure, clean symmetry: `categorySlug` (indexed URL routing key) and `categoryName` (denormalized human-readable display label for zero-join catalog rendering), matching `brandSlug` and `brandName`.
  2. Purged all legacy references across Rule #21 projections, Collection 5 `IProduct` interfaces, and catalog DTO specifications to ensure a clean, zero-overhead foundation ahead of Step 3 and Step 4 backend execution.

### Task #17: Unified Media Pipeline Lock (`media: IProductMedia[]` Single Source of Truth)
* **Files Modified:** `docs/pipeline/01-scope-and-business-rules.md`, `docs/pipeline/02-schema-interface-and-response-envelope.md`, `docs/pipeline/scope.md`.
* **Changes:** Completely eliminated dual-media redundancy and consolidated gallery architecture:
  1. Purged the separate root `video?: { provider, url, videoId }` object and replaced legacy `images: IProductImage[]` with a unified polymorphic array: `media: IProductMedia[]`.
  2. Standardized `IProductMedia` with explicit fields: `url` (asset URL), `key?` (R2 storage key for deletion), `thumbnailUrl?` (video poster thumbnail frame), `type: 'IMAGE' | 'VIDEO'` (discriminator), `videoProvider?` ('YOUTUBE' | 'VIMEO' | 'R2' | 'BUNNY_STREAM'), and `altText?`.
  3. Natural sequence preserved: mixed gallery ordering `[picture][video][picture]` is determined naturally by array index position, eliminating multi-field synchronization overhead. Updated Rule #21 and catalog card projections (`media: { $slice: 1 }`).

### Task #18: Universal Dynamic Variant Architecture Lock (`selectedOptions` Standard)
* **Files Modified:** `docs/pipeline/02-schema-interface-and-response-envelope.md`, `docs/pipeline/scope.md`.
* **Changes:** Future-proofed variant matrix schema to natively support all e-commerce niches (Clothing, Perfumes, Gadgets, Food, Footwear) without hardcoded crutches:
  1. Purged hardcoded legacy fields (`size`, `colorName`, `colorHex`, and loose `attributes`) from `IVariant`.
  2. Standardized on the industry-standard dimensional model: `selectedOptions: IVariantSelectedOption[]` (`name: string; value: string;`) pairing cleanly with parent `variantOptions: IVariantOptionGroup[]`.
  3. Clarified architectural purpose of modular subdocuments: `variantOptions` (interactive UI selector buttons), `variants` (physical inventory SKUs & custom pricing), `sizeChart` (apparel measurement guide popup), `specifications` (structured technical fact table for perfume notes, fabric GSM, and electronics), and `modifierGroups` (unbundled optional add-ons like gift packaging or chargers without SKU explosion).

### Task #19: Codebase Field Name Synchronization (Zero UI Bloat Pre-Schema Alignment)
* **Files Modified:** `src/models/Product.ts`, `src/models/Order.ts`, `src/app/api/products/route.ts`, `src/app/api/products/[slug]/route.ts`, `src/app/page.tsx`, `src/app/shop/page.tsx`, `src/components/admin/ProductFormClient.tsx`, `src/components/admin/ProductsTableClient.tsx`, `src/components/admin/ProductDetailClient.tsx`, `src/components/storefront/ProductCard.tsx`, `src/components/storefront/ProductDetailView.tsx`, `src/components/storefront/CollectionSection.tsx`, `docs/pipeline/scope.md`.
* **Changes:** Synchronized all existing model and API field names ahead of Step 3 database schema construction without introducing unnecessary UI redesigns:
  1. `categoryName` strictly enforced across models, APIs, seeds, and table/card views.
  2. `media: IProductMedia[]` unified across `Product.ts`, R2 deletion cascade handlers, and client cards.
  3. Universal `selectedOptions` + `title` integrated into `IVariant` and `ProductSchema` index.
  4. Added `'DHAKA_SUBURBS'` deliveryZone enum to `Order.ts` aligning with Rule #2.
  5. 100% verified with `tsc --noEmit` (0 errors).
