# 07: Admin Products & Inventory Management Guide

> **Status:** Tier 4 Historical MVP Study Note (`v1`). For v2 CR-Locked rules (URL SearchParams server pagination `limit <= 50`, SSR/Client limit parity, `.select()` projections, `{children}` `loading.tsx`, & `useLinkStatus()`), follow [`Rule #23` in `01-scope-and-business-rules.md`](./pipeline/01-scope-and-business-rules.md).

## 1. What We Built
- **Apex High-Contrast Workspace Lock**: Standardized layout with a Jet-Black left sidebar (`#09090B`) paired with a high-clarity Light canvas (`#F8FAFC`, `#FFFFFF` cards, `#EAECF0` borders) matching the reference design.
- **Three-Dots Floating Action Popover**: Row-level popover containing `View` (`Eye`), `Edit` (`Pencil`), and `Delete` (`Trash`, red).
- **Inline Stock Quick-Edit Stepper**: Table stock column supports live clicking to activate an inline stepper input box (`[ 999 ⇅ ] ✓ ✕`) for real-time inventory updates without opening a modal or navigating away.
- **Universal DRY Media Uploader (`MediaUploader.tsx`) & Browser Compressor (`imageCompressor.ts`)**: Decoupled, multi-ratio (`3:4`, `1:1`, `16:9`, `4:5`, `free`) media upload engine with zero-dependency HTML5 Canvas compression. Downsamples massive DSLR/iPhone photos into ultra-fast WebP in browser memory before uploading to Cloudflare R2, complete with live savings stats, 3:4 portrait guideline pills, cover badge selection, and single/multiple modes.
- **Unified DRY Product Form (`ProductFormClient.tsx`)**: Consolidated New Product (`/admin/products/new`) and Edit Product (`/admin/products/[id]/edit`) into a single 2-column component supporting both `create` and `edit` modes, eliminating code duplication while preserving 1:1 visual fidelity with the reference screenshots.
- **Dedicated 2-Column Edit Route (`/admin/products/[id]/edit`)**:
  - *Left Card*: Product Information (Title, Description, Price ৳, and Stock side-by-side).
  - *Right Card*: Organization (Category dropdown, Status dropdown, full-width `Save Changes` & `Cancel`).
- **Product Inspection View (`/admin/products/[id]`)**: High-clarity 2-column breakdown of garment specs, Cloudflare R2 gallery, and size variant matrix.
- **Garment Upload Page (`/admin/products/new`)**: Driven by unified `ProductFormClient` in create mode.
- **Zero-Stale Dynamic Rendering & Client Live Sync**:
  - Locked `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` on all admin product routes.
  - Table client component (`ProductsTableClient.tsx`) syncs server prop updates via `useEffect([initialProducts])` and executes an immediate background `no-store` fetch on mount and after mutations.
  - Mutation handlers (`POST /api/products`, `PUT /api/products/[slug]`, `DELETE /api/products/[slug]`) call `revalidatePath` to purge Vercel edge and Next.js full-route caches in real time.

---

## 2. Why We Built It (Senior Interview Concepts)
- **1:1 Design Parity**: Fully locks the Admin UX to the Apex Dashboard reference images.
- **Operational Efficiency**: The inline stock edit feature allows merchants to adjust stock in under 2 seconds during showroom inventory counts.
- **Zero Cache Lag**: Without `force-dynamic` and on-demand `revalidatePath`, Vercel Edge CDN caches product lists as static HTML (`X-Vercel-Cache: HIT`), causing newly created garments and updated images to vanish from the products table while appearing only in single view routes.
- **Optimistic UI with Fallback SWR**: Table filtering, sorting, popovers, and stock edits use optimistic client states backed by atomic Mongoose updates and background revalidation.

---

## 3. Checklist
- [x] Lock Admin Layout to Jet-Black Sidebar + Crisp Light Workspace canvas.
- [x] Full-width workspace normalization (`w-full` replacing restrictive `max-w-*` wrappers).
- [x] Implement row-level Three-Dots popover menu (`View`, `Edit`, `Delete`).
- [x] Implement Inline Stock Quick-Edit Stepper (`[ 999 ⇅ ] ✓ ✕`) with live `PUT /api/products/[slug]`.
- [x] Create dedicated Edit Page at `src/app/(admin)/admin/products/[id]/edit/page.tsx`.
- [x] Enforce dynamic rendering and on-demand cache revalidation across catalog and admin routes.
- [x] Add client-side live fetch on mount with `cache: 'no-store'` to eliminate router cache desync.

---

## 4. Sources & Cross References
- Documentation Note: [`docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md`](file:///c:/WebDevs/luxury-ecom-demo/docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md)
- Products Table: [`src/components/admin/ProductsTableClient.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/components/admin/ProductsTableClient.tsx)
- Unified Product Form: [`src/components/admin/ProductFormClient.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/components/admin/ProductFormClient.tsx)
- Universal Media Uploader: [`src/components/admin/MediaUploader.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/components/admin/MediaUploader.tsx)
- Browser Image Compressor: [`src/lib/imageCompressor.ts`](file:///c:/WebDevs/luxury-ecom-demo/src/lib/imageCompressor.ts)
- Product Detail: [`src/components/admin/ProductDetailClient.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/components/admin/ProductDetailClient.tsx)
- Admin Layout: [`src/app/(admin)/admin/layout.tsx`](file:///c:/WebDevs/luxury-ecom-demo/src/app/(admin)/admin/layout.tsx)
