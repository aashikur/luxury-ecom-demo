# 📚 Engineering Prompt Library & Directives

> **Curated High-Performance Prompts for AI Pair-Programming & Developer Delegation**  
> Aligned with [`docs/pipeline/01-scope-and-business-rules.md`](./pipeline/01-scope-and-business-rules.md) (`CR-000` Baseline). Use this master prompt to instruct AI assistants or engineers with zero ambiguity.

---

## 1. Real-Time Data Consistency, ~0ms Performance & Security Directive

Use this prompt whenever you ask an AI or developer to build, refactor, or update any e-commerce storefront, catalog, checkout, or admin management feature.

### 📋 The Prompt (Copy & Paste Ready)

```text
Task: Build/Update [Feature Name, e.g. Product Catalog / Admin Table / Storefront / Checkout] strictly following docs/pipeline/01-scope-and-business-rules.md (Rules #1–#23) with ~0ms storefront latency, zero-stale admin data, and production-grade security.

Architecture Requirements:
1. Split Cache & Edge Directives (Rule #7):
   - Admin, Checkout, & Account (/admin/**, /checkout, /account): Enforce `export const dynamic = 'force-dynamic'; export const revalidate = 0;` + `Cache-Control: private, no-store`.
   - Public Storefront (/, /shop, /category/[slug], /collections/[slug], /brand/[slug], /products/[slug]): Use `getPublicStoreConfig()` and catalog queries wrapped in Next.js `unstable_cache` (tags: 'store-config', 'products', 'categories', 'collections', 'brands') with `Cache-Control: public, max-age=0, must-revalidate` (NO `no-store` on public catalog HTML so mobile `bf-cache` restores in 0ms).

2. On-Demand Invalidation (Rule #7):
   In every API route handler or Server Action that mutates records (POST, PUT, DELETE, PATCH), call `revalidateTag(...)` AND `revalidatePath(...)` for affected paths ('/', '/shop', '/admin', '/admin/products', '/admin/orders', '/admin/settings', `/products/${slug}`).

3. Zero-Latency Performance & Anti-Over-Engineering (Rules #21–#23):
   - Use `.lean()`, strict `.select()` projections (`images: { $slice: 1 }` on card/table lists), and `Promise.all` parallel queries (zero DB waterfalls).
   - Paginate all lists via URL SearchParams (`limit = 20`, hard cap `<= 50`) with exact SSR/Client limit parity; compute Dashboard KPIs via single `.aggregate([$group])`.
   - Add Tailwind `animate-pulse` `loading.tsx` skeletons (fixed sidebar shell, skeleton only inside `{children}`) + `<Suspense>` streaming + Next.js 16 `useLinkStatus()`.
   - Enforce `<Image>` with explicit `sizes`, `priority` on Hero & top 4 cards, mobile 2-col `grid-cols-2` (`384w`), shimmer `blurDataURL`, and WCAG AA 4.5:1 contrast.

4. Admin Client Synchronization (Rule #23):
   In interactive admin client components (`ProductsTableClient`, `SettingsFormClient`), sync incoming `initial*` props via `useEffect`, fetch with `{ cache: 'no-store' }` on refresh/mutations matching SSR `page`/`limit`, and call `router.refresh()` after saves.

5. Security & Correctness (Rules #17–#20):
   Validate inputs with strict Zod DTO allowlists, enforce server-side RBAC (`USER`/`MERCHANT`/`MODERATOR`/`ADMIN`/`SUPER_ADMIN`), never trust client-sent prices/totals, use `idempotencyKey` + dual conditional `$inc` stock guards, and verify enforced CSP + edge cache headers.
```

---

## 2. Why This Prompt Works

1. **Solves Both Freshness AND ~0ms Speed:** Separates `/admin/**` (`force-dynamic` + `no-store`) from public storefront (`unstable_cache` + `revalidateTag` + `bf-cache`) instead of killing storefront speed with `no-store`.
2. **Eliminates UI Freezes & Over-Fetching:** Enforces `loading.tsx` skeletons, `Promise.all`, `.select()` projections, and bounded server pagination (`limit <= 50`).
3. **Prevents Security & Concurrency Bugs:** Locks server-authoritative pricing, RBAC boundaries, atomic stock checks, and enforced CSP headers from Day 1.

---

## 3. Related Documentation

* Master Locked Scope: [`docs/pipeline/01-scope-and-business-rules.md`](./pipeline/01-scope-and-business-rules.md)
* Caching & Edge Strategy: [`docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`](./11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md)
* Admin Products Management: [`docs/07-admin-products-management.md`](./07-admin-products-management.md)
* Backend API Reference: [`docs/postman/API_REFERENCE.md`](./postman/API_REFERENCE.md)
* Master Scope & Pipeline Tracker: [`docs/pipeline/scope.md`](./pipeline/scope.md)
