# Performance Optimization, Caching & Data-Fetching Rules

> **AUTHORITY: MANDATORY FOR ALL AI AGENTS & ENGINEERS**  
> Every route handler, server component, database query, and UI component in this repository must strictly obey these performance standards. Any code introducing sequential waterfalls, un-projected database queries, or broken caching boundaries violates production SLAs.

---

## ⚡ Rule 1: Strict Selective Projections (`.select()`) & Lean Hydration (`.lean()`)

1. **Never return bloated Mongoose documents on read queries:**
   - Always append `.lean()` to all read operations to bypass heavy Mongoose document hydration, change-tracking overhead, and internal prototype methods.
   - Saves 70%+ memory and cuts execution time by up to 5x.
2. **Never execute un-projected `.find()` or `.findOne()` queries:**
   - Always specify a strict `.select('field1 field2 ...')` projection containing *only* the fields required by the UI or consumer.
   - **Storefront Security Rule:** Never query `StoreConfig` on public routes without stripping server secrets:
     ```typescript
     // ✅ CORRECT:
     const config = await StoreConfig.findOne({ isActive: true })
       .select('branding homeSections logistics courier.provider')
       .lean();

     // ❌ FORBIDDEN:
     const config = await StoreConfig.findOne({ isActive: true }); // Exposes secret keys!
     ```
3. **Hard Cap on List Queries:**
   - All catalog and admin query endpoints must enforce a bounded limit: `1 <= limit <= 50`.
   - Never query unbounded arrays or `Product.find({})` without pagination (`skip` + `limit`).

---

## 🌊 Rule 2: Zero-Waterfall Concurrent Queries (`Promise.all`)

1. **Never sequentially `await` independent database queries or service calls:**
   - Sequential awaits introduce network and database waterfalls, multiplying latency (e.g. 3 sequential 150ms queries = 450ms TTFB).
2. **Always batch independent queries with `Promise.all`:**
   ```typescript
   // ✅ CORRECT (Concurrent ~150ms total latency):
   const [config, products, categories] = await Promise.all([
     StoreConfig.findOne({ isActive: true }).select('branding homeSections').lean(),
     Product.find({ isActive: true }).select('title slug basePrice media').limit(20).lean(),
     Category.find({ isActive: true }).select('name slug ancestors').lean(),
   ]);

   // ❌ FORBIDDEN (Sequential ~450ms waterfall):
   const config = await StoreConfig.findOne(...);
   const products = await Product.find(...);
   const categories = await Category.find(...);
   ```

---

## 🛡️ Rule 3: Next.js 16 Split-Cache Strategy

1. **Admin Dashboard, Checkout & User Account (`/admin/**`, `/checkout`, `/account`):**
   - Strictly **Dynamic**: Must always export:
     ```typescript
     export const dynamic = 'force-dynamic';
     export const revalidate = 0;
     ```
   - Headers: `Cache-Control: private, no-cache, no-store`. Merchants and shoppers must never see stale inventory, orders, or PII.
2. **Public Storefront (`/`, `/shop`, `/products/[slug]`, `/category/[slug]`):**
   - Must achieve **~0ms TTFB** using Next.js tagged caching (`unstable_cache`) paired with on-demand revalidation.
   - **StoreConfig Singleton:** Cached with tag `['store-config']` so 100,000+ visitors consume **0 DB queries**.
   - **Product Catalog:** Cached with tag `['products']`.
3. **Dual Cache Invalidation Contract on Mutations:**
   - Every mutation handler (`POST`, `PUT`, `PATCH`, `DELETE`) affecting products, categories, orders, or store config **MUST** trigger both:
     ```typescript
     // Invalidate Data Cache:
     revalidateTag('products');
     // Invalidate Full Route Cache:
     revalidatePath('/', 'page');
     revalidatePath('/shop', 'page');
     revalidatePath('/admin', 'page');
     ```

---

## 📱 Rule 4: Mobile `bf-cache` (Back/Forward Cache) Protection

1. **The Problem:** Setting `Cache-Control: no-store` on public storefront pages disables the browser's Back/Forward Cache. When a user views a product and swipes back to the catalog, the browser is forced to refetch everything over the cellular network, creating noticeable lag and UI flicker.
2. **The Rule:**
   - **NEVER** return `no-store` headers on public storefront HTML pages (`/`, `/shop`, `/products/[slug]`).
   - Use `Cache-Control: public, max-age=0, must-revalidate` combined with tagged Next.js caching.
   - Result: Users swiping back in Chrome or Safari on mobile get an **instant 0ms restoration** of catalog scroll position and state.

---

## 🖼️ Rule 5: Image Optimization & Core Web Vitals (LCP Gate)

1. **Aspect Ratio Standard:**
   - All product garment catalog images are strictly **3:4 Portrait** (`1200 x 1600 px` max).
2. **CDN Delivery:**
   - All images must be delivered via Cloudflare R2 custom domain CDN in modern **WebP** format.
3. **Largest Contentful Paint (LCP < 2.5s) Protection:**
   - The first catalog product image and the hero image on Product Detail Pages (`/products/[slug]`) **MUST** use Next.js `<Image priority sizes="..." />`.
   - Never use naive `<img>` tags for above-the-fold media.
   - Always specify explicit `sizes` (e.g. `sizes="(max-width: 768px) 50vw, 384px"`) so the browser downloads the exact responsive asset without layout shifts.

---

## 🔌 Rule 6: Global Database Connection Pool Singleton

1. **Serverless Hot-Reload Exhaustion Prevention:**
   - Next.js development hot-reloading and Vercel serverless cold starts can spawn dozens of concurrent MongoDB connections, rapidly exhausting MongoDB Atlas pool limits.
2. **Cached Global Singleton:**
   - All database access must strictly route through `src/lib/db.ts` (for Mongoose) and `src/lib/mongodb-client.ts` (for Better Auth / native MongoClient).
   - Both clients cache their active connection promises in `globalThis` to guarantee connection reuse across all serverless invocations.

---

## ⚡ Rule 7: Edge Runtime vs Node.js Runtime Segregation

1. **`src/middleware.ts` runs on the Vercel Edge Runtime:**
   - **NEVER** import Mongoose, MongoDB drivers, bcrypt, or heavy Node.js native modules (`fs`, `crypto`, `net`) inside `middleware.ts`.
   - Authentication in middleware is validated strictly by reading the Better Auth session token from cookies using Edge-compatible APIs.
2. **Domain Services, Route Handlers & Mongoose run on Node.js Runtime:**
   - All database operations, Steadfast courier HTTP requests, and image garbage collection run in standard Node.js serverless functions.
