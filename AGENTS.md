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
