# 📚 Engineering Prompt Library & Directives

> **Curated High-Performance Prompts for AI Pair-Programming & Developer Delegation**  
> Use these master prompt templates to instruct AI assistants or team engineers with zero ambiguity and senior-level architectural compliance.

---

## 1. Real-Time Data Consistency & Zero-Stale Cache Directive

Use this prompt whenever you ask an AI or developer to build, refactor, or update any e-commerce catalog, admin management suite, or inventory synchronization feature.

### 📋 The Prompt (Copy & Paste Ready)

```text
Task: Build/Update [Feature Name, e.g. Product Catalog / Admin Table / Inventory Sync] with real-time data consistency and zero-stale cache on Vercel.

Architecture Requirements:
1. Dynamic Route Directives:
   Ensure all admin routes (/admin/...) and storefront catalog routes (/ and /shop) include:
   export const dynamic = 'force-dynamic';
   export const revalidate = 0;

2. On-Demand Revalidation:
   In any API route handler or Server Action that creates, updates, or deletes records (POST, PUT, DELETE, PATCH), import { revalidatePath } from 'next/cache' and revalidate affected paths:
   - Homepage: revalidatePath('/', 'page')
   - Shop catalog: revalidatePath('/shop', 'page')
   - Admin lists: revalidatePath('/admin/products', 'page')
   - Dynamic item routes: revalidatePath(`/products/${slug}`, 'page')

3. Client Component Synchronization:
   For interactive table or listing client components (e.g. ProductsTableClient):
   - Add a useEffect to synchronize local state whenever the server passes an updated initial data prop.
   - Add an immediate background fetch with { cache: 'no-store' } on mount and after delete/stock actions so the UI never displays stale cached items.

4. Verify edge response headers so X-Vercel-Cache and X-Nextjs-Prerender never freeze production data.
```

---

## 2. Why This Prompt Works

1. **Explicit Routing Segment Lock:** Eliminates Next.js App Router's default behavior of treating database Server Components as static SSG pages at build-time.
2. **On-Demand Purging:** Forces Next.js and Vercel Edge CDN to purge in-memory cache whenever mutations (`POST`, `PUT`, `DELETE`) happen.
3. **Resilient Dual-Tier Sync:** Prevents the React client component from holding onto obsolete `initialData` snapshots when Next.js soft-navigates.
4. **Production Observability:** Directs the engineer to check HTTP response headers (`X-Vercel-Cache`, `Age`, `X-Nextjs-Prerender`) rather than just relying on local `localhost:3000` dev server (where caching is disabled by default).

---

## 3. Related Documentation

* Reference Architecture: [`docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`](./11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md)
* Admin Products Management: [`docs/07-admin-products-management.md`](./07-admin-products-management.md)
* Backend API Reference: [`docs/postman/API_REFERENCE.md`](./postman/API_REFERENCE.md)
* Master Scope & Pipeline: [`docs/pipeline/scope.md`](./pipeline/scope.md)
