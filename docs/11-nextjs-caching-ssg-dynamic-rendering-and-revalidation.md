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

### The Solution Architecture
1. **`export const dynamic = 'force-dynamic'`**: Bypasses the Full Route Cache and forces the server component to execute on every incoming request.
2. **`revalidatePath(path, 'page')`**: Actively notifies the Next.js cache engine and Vercel CDN to purge existing cached payloads for that path.
3. **Client `no-store` Revalidation**: Guarantees that even if client-side Router Cache holds an in-memory snapshot, the client component refetches live data from the database.

---

## 3. Key Concepts Checklist & Audit Playbook

### Diagnostic HTTP Header Inspection
When debugging "storefront not updating" issues in production, run:
```bash
curl -I https://your-domain.vercel.app/
```
Key headers to evaluate:
* `X-Vercel-Cache: HIT` with `Age: > 0`: The page is being served from edge cache without touching your server or database.
* `X-Nextjs-Prerender: 1`: Next.js classified this page as static at build time.
* `Cache-Control: private, no-cache, no-store`: The page is dynamic and hits the server on every request.

### Golden Rules for E-Commerce Route Configuration
* **Admin Dashboard & Management Routes:** Must **ALWAYS** be `dynamic = 'force-dynamic'`. Merchants cannot operate on cached inventory or stale orders.
* **Mutation Handlers (`POST`, `PUT`, `DELETE`):** Must **ALWAYS** call `revalidatePath` for every route that displays the affected resource.
* **Storefront Catalog (`/` and `/shop`):** Either `dynamic = 'force-dynamic'` (zero cache lag) OR ISR with a short revalidation window (`revalidate = 60`) combined with on-demand `revalidatePath` on mutations.

---

## 4. Master Prompt Template for Future Tasks

When prompting an AI assistant or delegating to an engineer for e-commerce catalog or inventory features, use this structured prompt:

```text
Task: Implement [Feature Name] with real-time data consistency and cache invalidation.

Requirements:
1. Route Type: Ensure all admin routes (/admin/...) and dynamic store pages have:
   export const dynamic = 'force-dynamic';
   export const revalidate = 0;
2. Cache Invalidation: In any API route or Server Action that mutates [Product/Order/Config], import { revalidatePath } from 'next/cache' and revalidate affected paths:
   - Homepage ('/')
   - Shop catalog ('/shop')
   - Admin lists ('/admin/products', '/admin/orders')
   - Single item dynamic routes ('/products/[slug]')
3. Client State Sync: In client table/list components, sync with incoming props via useEffect and provide a fallback client-side fetch with { cache: 'no-store' } on mount and after mutations.
4. Edge CDN Verification: Verify response headers on Vercel so X-Vercel-Cache and X-Nextjs-Prerender do not serve frozen SSG payloads.
```

---

## 5. Official Docs & Sources

* 📖 [Next.js App Router: Dynamic Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)
* 📖 [Next.js App Router: revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
* 📖 [Next.js App Router: Caching Architecture Deep Dive](https://nextjs.org/docs/app/building-your-application/caching)
* 📖 [Vercel Edge Network Caching](https://vercel.com/docs/edge-network/caching)
