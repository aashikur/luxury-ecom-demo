<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Admin UI Design System & Token Hierarchy
All administrative dashboard interfaces must follow the locked tokens and minimalist Shopify/WordPress layout conventions specified in `.gemini/rules/admin-ui-design-system.md` and `docs/08-admin-design-hierarchy-and-ui-tokens.md`:
- Page Title: `text-2xl font-bold tracking-tight text-[#060d11]`
- Breadcrumbs: 14px (`text-sm`), inactive `text-slate-500 hover:text-[#060d11] transition-colors`, active `text-[#060d11] font-medium`
- Page/Card Descriptions: `text-sm text-slate-500`
- Card Titles: `text-base font-semibold leading-none tracking-tight text-[#060d11]`
- Primary Action: `#076E46` (`bg-[#076E46] text-white hover:bg-[#055C3A]`)
- Form Options: Short, minimal labels and values (e.g. `Status` -> `Active`, `Draft`, `Archived`; no verbose parentheticals).
- Card Interiors: Clean, unboxed surfaces (no nested grey box wrappers, no decorative icons beside labels).

## Storefront SEO & Metadata Architecture
All public storefront pages and admin routes must adhere to the SEO specifications in `docs/12-seo-metadata-and-crawler-architecture.md` and Rule #24 in `docs/pipeline/01-scope-and-business-rules.md`:
- Dynamic Routes (`/products/[slug]`, `/category/[slug]`, etc.) MUST export `generateMetadata` with unique title, description, Open Graph images (1200x630), Twitter cards, and `alternates.canonical` pointing to the canonical URL.
- Dynamic PDPs MUST render inline JSON-LD Schema.org structured data (`Product`, `Offer` with BDT price, `availability: InStock/OutOfStock`, and `Brand`).
- Admin routes (`/admin/**`) and internal API routes MUST be shielded from indexing via `robots: { index: false, follow: false }` and `X-Robots-Tag: noindex, nofollow`.
- Crawlers are governed via App Router native `src/app/robots.ts` and `src/app/sitemap.ts`.
- Deleted or inactive products must trigger Next.js `notFound()` (true HTTP 404/410, never soft 404). First catalog image and PDP hero image must use `<Image priority sizes="..." />` to protect LCP Core Web Vitals.

## Backend Architecture & Clean Domain Service Rules
All backend development, database interaction, authentication, and API endpoints must adhere strictly to the 8 golden rules specified in `.gemini/rules/backend-architecture-rules.md` and `docs/13-better-auth-and-domain-services-architecture.md`:
- **4-Tier Clean Architecture:** Transport (`src/app/api/**/route.ts` thin controllers) -> Domain Services (`src/services/*.service.ts` pure business logic) -> Persistence (`src/models/*.ts` Mongoose singletons) -> Adapters (`src/lib/*`).
- **No Internal `fetch()`:** Server Components (`page.tsx`) MUST call Domain Services directly in memory at 0ms latency; never loopback `fetch('/api/...')`.
- **Zero Legacy Baggage:** Use pure schema fields (`media: IProductMedia[]`, `categoryName`). Never re-introduce fallback crutches (`images`, `photos`, `primaryCategory`).
- **Zero-Trust Pricing & Atomic Stock:** Prices must be resolved server-side from DB; inventory decrements strictly require `{ 'variants.stock': { $gte: qty } }`.
- **Universal Envelope:** All API responses must use `ApiResponse<T>` (`apiSuccess` / `apiError`).
- **Better Auth & Edge Security:** `/admin/**` protected by Edge middleware reading Better Auth session tokens.

## Performance Optimization, Caching & Data-Fetching Rules
All data access, page rendering, and caching strategies must follow `.gemini/rules/performance-and-caching.md` and `docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`:
- **Strict Projections & Lean Hydration:** Always append `.lean()` and explicit `.select(...)` to all read queries. Never run unprojected `.find()`.
- **Zero-Waterfall Queries:** Independent queries MUST execute concurrently via `Promise.all([ ... ])`; never sequential `await` loops.
- **Next.js 16 Split-Cache:** `/admin/**`, `/checkout`, and `/account` are strictly `dynamic = 'force-dynamic'` + `no-store`. Public storefront uses tagged `unstable_cache` (`['products']`, `['store-config']`).
- **Mobile `bf-cache` Protection:** Public storefront HTML must NEVER use `no-store`; use `must-revalidate` so mobile Back/Forward swipe restores in 0ms.
- **Dual Invalidation:** Every mutation handler (`POST`, `PUT`, `PATCH`, `DELETE`) MUST invoke both `revalidateTag(...)` and `revalidatePath(...)`.
- **LCP Gate & R2 WebP:** Catalog images are 3:4 portrait delivered in WebP from Cloudflare R2 CDN. Hero images and first catalog cards MUST use `<Image priority sizes="..." />`.
- **Connection Pool Singleton:** Database connections must route strictly through `src/lib/db.ts` and `src/lib/mongodb-client.ts` cached in `globalThis`.

## E-Commerce Domain Logic & Bangladesh Localization Rules
All checkout, payment, order state, and courier integrations must follow `.gemini/rules/ecommerce-business-logic.md` and `docs/pipeline/01-scope-and-business-rules.md`:
- **Bangladeshi 3-Field Guest Checkout:** Name, 11-digit mobile phone (`/^01[3-9]\d{8}$/`), and Delivery Address. No mandatory account creation or password.
- **3-Zone Delivery Logistics:** `INSIDE_DHAKA` (৳70), `DHAKA_SUBURBS` (৳100), `OUTSIDE_DHAKA` (৳130), with free shipping threshold support.
- **Steadfast Courier 1-Click Booking:** 1-click consignment creation via `src/services/courier.service.ts` with automated fallback sandbox simulation in dev.
- **Anti-Over-Engineering Data Boundaries:** Variants are embedded in `Product.variants[]`. Banners are embedded in `StoreConfig.homeSections[]`. Carts live client-side in Zustand. No separate DB collections for Variants, Banners, or Carts.


