# 07: Admin Products & Inventory Management Guide

## 1. What We Built
- **Apex High-Contrast Workspace Lock**: Standardized layout with a Jet-Black left sidebar (`#09090B`) paired with a high-clarity Light canvas (`#F8FAFC`, `#FFFFFF` cards, `#EAECF0` borders) matching the reference design.
- **Three-Dots Floating Action Popover ([Image 1])**: Row-level popover containing `View` (`Eye`), `Edit` (`Pencil`), and `Delete` (`Trash`, red).
- **Inline Stock Quick-Edit Stepper ([Image 3])**: Table stock column supports live clicking to activate an inline stepper input box (`[ 999 ⇅ ] ✓ ✕`) for real-time inventory updates without opening a modal or navigating away.
- **Universal DRY Media Uploader (`MediaUploader.tsx`) & Browser Compressor (`imageCompressor.ts`)**: Decoupled, multi-ratio (`3:4`, `1:1`, `16:9`, `4:5`, `free`) media upload engine with zero-dependency HTML5 Canvas compression. Downsamples massive DSLR/iPhone photos into ultra-fast WebP in browser memory before uploading to Cloudflare R2, complete with live savings stats, 3:4 portrait guideline pills, cover badge selection, and single/multiple modes.
- **Unified DRY Product Form (`ProductFormClient.tsx`)**: Consolidated New Product (`/admin/products/new`) and Edit Product (`/admin/products/[id]/edit`) into a single 2-column component supporting both `create` and `edit` modes, eliminating code duplication while preserving 1:1 visual fidelity with the reference screenshots.
- **Dedicated 2-Column Edit Route (`/admin/products/[id]/edit`) ([Image 2])**:
  - *Left Card*: Product Information (Title, Description, Price ৳, and Stock side-by-side).
  - *Right Card*: Organization (Category dropdown, Status dropdown, full-width `Save Changes` & `Cancel`).
- **Product Inspection View (`/admin/products/[id]`) ([Image 4])**: High-clarity 2-column breakdown of garment specs, Cloudflare R2 gallery, and size variant matrix.
- **Garment Upload Page (`/admin/products/new`)**: Driven by unified `ProductFormClient` in create mode.

---

## 2. Why We Built It
- **1:1 Design Parity**: Fully locks the Admin UX to the Apex Dashboard reference images.
- **Operational Efficiency**: The inline stock edit feature allows merchants to adjust stock in under 2 seconds during banani showroom inventory counts.
- **Zero Hydration Latency**: Table filtering, sorting, popovers, and stock edits use optimistic client states backed by atomic Mongoose updates.

---

## 3. Checklist
- [x] Lock Admin Layout to Jet-Black Sidebar + Crisp Light Workspace canvas.
- [x] Full-width workspace normalization (`w-full` replacing restrictive `max-w-*` wrappers) matching edge-to-edge reference layout.
- [x] Implement row-level Three-Dots popover menu (`View`, `Edit`, `Delete`).
- [x] Implement Inline Stock Quick-Edit Stepper (`[ 999 ⇅ ] ✓ ✕`) with live `PUT /api/products/[slug]`.
- [x] Create dedicated Edit Page at `src/app/(admin)/admin/products/[id]/edit/page.tsx`.
- [x] Verify production build passes with exit code 0 (`14/14` pages compiled).

---

## 4. Sources & Cross References
- Products Table: [`src/components/admin/ProductsTableClient.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/ProductsTableClient.tsx)
- Unified Product Form: [`src/components/admin/ProductFormClient.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/ProductFormClient.tsx)
- Universal Media Uploader: [`src/components/admin/MediaUploader.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/MediaUploader.tsx)
- Browser Image Compressor: [`src/lib/imageCompressor.ts`](file:///e:/WebDevs/Testing/e-com/src/lib/imageCompressor.ts)
- Product Detail: [`src/components/admin/ProductDetailClient.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/ProductDetailClient.tsx)
- Admin Layout: [`src/app/(admin)/admin/layout.tsx`](file:///e:/WebDevs/Testing/e-com/src/app/(admin)/admin/layout.tsx)
