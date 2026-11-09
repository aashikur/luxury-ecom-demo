# 07: Admin Products & Inventory Management Guide

## 1. What We Built
- **Apex High-Contrast Workspace Lock**: Standardized layout with a Jet-Black left sidebar (`#09090B`) paired with a high-clarity Light canvas (`#F8FAFC`, `#FFFFFF` cards, `#EAECF0` borders) matching the reference design.
- **Three-Dots Floating Action Popover ([Image 1])**: Row-level popover containing `View` (`Eye`), `Edit` (`Pencil`), and `Delete` (`Trash`, red).
- **Inline Stock Quick-Edit Stepper ([Image 3])**: Table stock column supports live clicking to activate an inline stepper input box (`[ 999 ⇅ ] ✓ ✕`) for real-time inventory updates without opening a modal or navigating away.
- **Dedicated 2-Column Edit Route (`/admin/products/[id]/edit`) ([Image 2])**:
  - *Left Card*: Product Information (Title, Description, Price ৳, and Stock side-by-side).
  - *Right Card*: Organization (Category dropdown, Status dropdown, full-width `Save Changes` & `Cancel`).
- **Product Inspection View (`/admin/products/[id]`) ([Image 4])**: High-clarity 2-column breakdown of garment specs, Cloudflare R2 gallery, and size variant matrix.
- **Garment Upload Page (`/admin/products/new`)**: Upload and publish new garments with custom-milled fleece specs and stock matrices.

---

## 2. Why We Built It
- **1:1 Design Parity**: Fully locks the Admin UX to the Apex Dashboard reference images.
- **Operational Efficiency**: The inline stock edit feature allows merchants to adjust stock in under 2 seconds during banani showroom inventory counts.
- **Zero Hydration Latency**: Table filtering, sorting, popovers, and stock edits use optimistic client states backed by atomic Mongoose updates.

---

## 3. Checklist
- [x] Lock Admin Layout to Jet-Black Sidebar + Crisp Light Workspace canvas.
- [x] Implement row-level Three-Dots popover menu (`View`, `Edit`, `Delete`).
- [x] Implement Inline Stock Quick-Edit Stepper (`[ 999 ⇅ ] ✓ ✕`) with live `PUT /api/products/[slug]`.
- [x] Create dedicated Edit Page at `src/app/(admin)/admin/products/[id]/edit/page.tsx`.
- [x] Verify production build passes with exit code 0 (`14/14` pages compiled).

---

## 4. Sources & Cross References
- Products Table: [`src/components/admin/ProductsTableClient.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/ProductsTableClient.tsx)
- Edit Product Form: [`src/components/admin/EditProductClient.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/EditProductClient.tsx)
- Product Detail: [`src/components/admin/ProductDetailClient.tsx`](file:///e:/WebDevs/Testing/e-com/src/components/admin/ProductDetailClient.tsx)
- Admin Layout: [`src/app/(admin)/admin/layout.tsx`](file:///e:/WebDevs/Testing/e-com/src/app/(admin)/admin/layout.tsx)
