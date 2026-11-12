# 11. Next.js 16 Caching, SSG Prerendering & On-Demand Revalidation

> **Senior Engineering Guide & Architecture Note:**  
> Resolving stale production caches, bridging Vercel Edge CDN with live MongoDB Atlas data, and mastering the 4 levels of Next.js App Router caching.

---

## 1. What We Built

* **Dynamic Segment Directives Locked Across App Routes:**
  * `src/app/page.tsx` (Storefront Homepage)
  * `src/app/shop/page.tsx` (Storefront Catalog)
  * `src/app/products/[slug]/page.tsx` (Storefront Single Product Page)
  * `src/app/(admin)/admin/layout.tsx` (Admin Root Layout Segment)
  * `src/app/(admin)/admin/page.tsx` (Admin Dashboard)
  * `src/app/(admin)/admin/products/page.tsx` (Admin Products Catalog)
  * `src/app/(admin)/admin/products/[id]/page.tsx` (Admin Product Inspector)
  * `src/app/(admin)/admin/products/[id]/edit/page.tsx` (Admin Product Form)
  * `src/app/(admin)/admin/settings/page.tsx` (Admin Store Configuration)
  * Directives applied:
    ```typescript
    export const dynamic = 'force-dynamic';
    export const revalidate = 0;
    ```

* **On-Demand Cache Invalidation in Mutation Route Handlers (`revalidatePath`):**
  * `POST /api/products`: Automatically purges `'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, and `'/products/[slug]'`.
  * `PUT /api/products/[slug]`: Automatically purges `'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, `'/admin/products/[id]'`, and `'/products/[slug]'`.
  * `DELETE /api/products/[slug]`: Automatically purges all catalog and product pages, and cascades Cloudflare R2 image asset deletion.
  * `PUT /api/config`: Purges `'/'`, `'/shop'`, `'/admin'`, and `'/admin/settings'` upon store brand/logistics updates.
  * `POST /api/orders` & `PATCH /api/orders`: Purges catalog routes when order stock deduction occurs.
  * `/api/categories` & `/api/collections`: Purges catalog routes on taxonomy mutations.

* **Client Table State Synchronization & Live Fallback (`ProductsTableClient.tsx`):**
  * Added `useEffect(() => setProducts(initialProducts), [initialProducts])` to react to Server Component re-renders.
  * Added `refreshProducts()` executing an immediate `fetch('/api/products?all=true', { cache: 'no-store' })` on mount and after delete / inline stock edits.

* **Intelligent Homepage Section Taxonomy Matching (`src/app/page.tsx`):**
  * Replaced strict slug-only array check with multi-attribute matching (`collections`, `categorySlug`, `categoryPath`, and normalized `primaryCategory`) with fallback to active products.

---

## 2. Why We Built It (Senior Interview Concepts)

### The Stale Production Cache Bug
In Next.js App Router (versions 14, 15, and 16):
When an async Server Component queries a database directly (e.g. `connectDB()` + `Product.find().lean()`) and contains no dynamic inputs (no `cookies()`, `headers()`, or `searchParams`), Next.js automatically marks the route as **Static (SSG)** during `next build`.

```text
Build Time:
MongoDB Atlas Query ──> Next.js Server ──> HTML / RSC Payload Baked ──> Vercel Edge CDN (HIT)

Runtime Problem:
Merchant Uploads New Product ──> MongoDB Atlas Updated ✅
Visitor Hits Homepage ───────> Vercel Edge Serves Old Build Cache ❌ (Age: 1200s+)
Merchant Checks View Page ───> Route has [id] parameter ──> Hits DB Live ✅
Merchant Confused: "Changes visible in View, but not in Products Page or Store!"
```

### The 4 Levels of Next.js Caching
1. **Request Memoization (React):** Deduplicates identical `fetch` requests during a single render pass.
2. **Data Cache (Next.js Server):** Stores data across server requests (`fetch(url, { cache: 'force-cache' })`).
3. **Full Route Cache (Server / CDN):** Prerenders and caches full HTML and RSC payload at build/request time.
4. **Router Cache (Browser Client):** Stores RSC payloads in browser memory during client-side navigation.

### The Solution Architecture (Split Cache Strategy — CR-Locked Rule #7)

1. **Admin, Checkout & Account (`/admin/**`, `/checkout`, `/account`) — Strictly Dynamic:**
   * Apply `export const dynamic = 'force-dynamic'; export const revalidate = 0;` + `Cache-Control: private, no-store` so merchants never act on stale inventory/orders and sensitive PII/admin pages never enter browser `bf-cache`.
2. **Public Storefront (`/`, `/shop`, `/category/[slug]`, `/collections/[slug]`, `/brand/[slug]`, `/products/[slug]`) — ~0ms Shared Cache + `bf-cache`:**
   * **Singleton Config Cache (`getPublicStoreConfig()`):** Wrapped in Next.js `unstable_cache` (`tags: ['store-config']`, `revalidate: 86400` or `false`) with public-only `.select()` projection. Serves 100k+ visitors across all Vercel serverless instances with **0 DB queries** until Super Admin saves `/admin/settings`.
   * **Catalog Data Cache:** Storefront product/taxonomy queries run via tagged `unstable_cache` (`'products'`, `'categories'`, `'collections'`, `'brands'`) with `.select()` projections and `.lean()`.
   * **`bf-cache` Enabler:** Public storefront HTML uses ISR / `Cache-Control: public, max-age=0, must-revalidate` (**NO `no-store`**) so Chrome/Safari Back/Forward swipe restores pages in **`0ms`**.
3. **On-Demand Invalidation (`revalidateTag` + `revalidatePath`):**
   * Every `POST`, `PUT`, `PATCH`, `DELETE` handler immediately calls `revalidateTag(...)` AND `revalidatePath(...)` so updates go live in **< 1 second**.
4. **Client `no-store` & `useEffect` Sync (Admin Tables/Forms):**
   * Admin client components (`ProductsTableClient`, `SettingsFormClient`) sync incoming `initial*` props via `useEffect`, pass `{ cache: 'no-store' }` on manual refresh/mutations, and call `router.refresh()` after saves.

---

## 3. Key Concepts Checklist & Audit Playbook

### Diagnostic HTTP Header Inspection
When debugging caching or `bf-cache` in production, run:
```bash
curl -I https://your-domain.vercel.app/
```
Key headers to evaluate:
* `X-Vercel-Cache: HIT` with `Age: > 0`: Served from Edge cache (~20–50ms TTFB; expected on public storefront when paired with `revalidateTag`/`revalidatePath` on mutations).
* `X-Nextjs-Prerender: 1`: Next.js classified this page as static/ISR. Good on public storefront *only* if mutation routes purge it; **BUG** if present on `/admin/**`!
* `Cache-Control: private, no-cache, no-store`: Mandatory on `/admin/**`, `/checkout`, `/account`; **FORBIDDEN** on public storefront `/` & `/shop` because `no-store` disables mobile `bf-cache`!

### Golden Rules for E-Commerce Route Configuration
* **Admin Dashboard & Checkout Routes:** Must **ALWAYS** be `dynamic = 'force-dynamic'` + `no-store`.
* **Mutation Handlers (`POST`, `PUT`, `PATCH`, `DELETE`):** Must **ALWAYS** call `revalidateTag` + `revalidatePath` for every route/tag displaying the affected resource.
* **Storefront Catalog & `StoreConfig`:** Use `unstable_cache` + `revalidateTag` + `must-revalidate` (zero `no-store`, zero per-visitor DB load, instant `bf-cache` back-swipe). *(Note: Commit `4a46e5d` used temporary `force-dynamic` on `/` as an emergency hotfix to clear the initial SSG freeze; v2 pipeline transitions public storefront to the tagged `unstable_cache` + `bf-cache` architecture per Rule #7.)*

---

## 4. Master Prompt Template for Future Tasks

See the canonical prompt in [`docs/PROMPT_LIBRARY.md`](./PROMPT_LIBRARY.md):

```text
Task: Build/Update [Feature Name, e.g. Product Catalog / Admin Table / Storefront] with real-time data consistency, ~0ms storefront latency, and zero-stale admin state on Vercel.

Architecture Requirements:
1. Split Cache & Route Directives:
   - Admin/Checkout/Account (/admin/**, /checkout, /account): Enforce `export const dynamic = 'force-dynamic'; export const revalidate = 0;` + `no-store`.
   - Public Storefront (/, /shop, /category/[slug], /products/[slug]): Use `unstable_cache` (tags: 'store-config', 'products', 'categories', 'collections', 'brands') + public `must-revalidate` headers (NO `no-store` so mobile `bf-cache` works in 0ms).
2. On-Demand Revalidation:
   In any API route handler or Server Action that creates, updates, or deletes records (POST, PUT, DELETE, PATCH), call `revalidateTag(...)` AND `revalidatePath(...)` for '/', '/shop', '/admin/products', '/admin/orders', '/admin/settings', and `/products/${slug}`.
3. Performance & Projections:
   Use `.lean()`, strict `.select()` projections (`images: { $slice: 1 }` on grids), `Promise.all` parallel queries, URL SearchParams pagination (`limit <= 50`), `loading.tsx` skeletons, `<Image>` with explicit `sizes`/`priority`, and `useLinkStatus()`.
4. Client Component Synchronization (Admin):
   Sync `initial*` props via `useEffect`, fetch with `{ cache: 'no-store' }` on refresh/mutations matching exact SSR `page`/`limit`, and call `router.refresh()` after saves.
```

---

## 5. Official Docs & Sources

* 📖 [Next.js App Router: Dynamic Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
* 📖 [Next.js App Router: revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
* 📖 [Next.js App Router: Caching Architecture Deep Dive](https://nextjs.org/docs/app/building-your-application/caching)
* 📖 [Vercel Edge Network Caching](https://vercel.com/docs/edge-network/caching)
