# 📋 Enterprise Luxury Garments E-Commerce — Platform Scope & Specification Pipeline

> **Master Scope Document & Technical Specification Matrix**  
> **Repository:** `e-com`  
> **Brand Identity:** AUREM / Config-Driven Multi-Brand Architecture  
> **Tech Stack:** Next.js 16 (App Router + Turbopack), TypeScript, Tailwind CSS v4, MongoDB Atlas (Mongoose singleton), Cloudflare R2 (S3 SDK), Cloudinary  
> **Continuous Sync Standard:** Under `docs/00-how-to-notes.md` Rule #5, this document is continuously maintained and updated after every task to reflect live deliverables, active technical specifications, and project scope.

---

## 1. Master Scope & Milestone Progress Matrix

| Phase | Module | Scope & Core Deliverables | Status | Live Components / Routes |
| :--- | :--- | :--- | :---: | :--- |
| **01** | **Cloud & DB Infrastructure** | MongoDB Atlas connection pool singleton, Cloudflare R2 bucket with custom domain CDN, Cloudinary backup, Multi-service health probe. | ✅ **DONE** | `src/lib/db.ts`<br>`src/lib/r2.ts`<br>`src/lib/storage.ts`<br>`GET /api/health` |
| **02** | **Data Architecture & Schemas** | Mongoose schemas for `StoreConfig` (branding, logistics, payments, tracking, features), `Product` (garments, 3:4 portrait, variants, sizes, tags), and `Order` (7-stage state machine, BD COD, manual MFS). | ✅ **DONE** | `src/models/StoreConfig.ts`<br>`src/models/Product.ts`<br>`src/models/Order.ts` |
| **03** | **Zero-Dep Media Pipeline** | Pure HTML5 Canvas rule-based client-side image compressor (3-tier matrix, max 1200px cap, target < 200KB WebP) + Cloudflare R2 upload API. | ✅ **DONE** | `src/lib/imageCompressor.ts`<br>`POST /api/upload`<br>`DELETE /api/upload` |
| **04** | **Storage Garbage Collection** | Lifecycle asset cleanup: instant R2 deletion on media remove (✕), batch purge of uncommitted draft uploads on form cancel, and cascade deletion on product delete. | ✅ **DONE** | `src/components/admin/MediaUploader.tsx`<br>`src/components/admin/ProductFormClient.tsx`<br>`DELETE /api/products/[slug]` |
| **05** | **Admin Navigation & Shell** | Full-width edge-to-edge admin layout, responsive mobile header, mobile slide-over navigation drawer with backdrop blur, route auto-close. | ✅ **DONE** | `src/app/(admin)/admin/layout.tsx`<br>`src/components/admin/AdminShellClient.tsx` |
| **06** | **Product Management Suite** | Unified 2-column Product Form for Create (`/admin/products/new`) & Edit (`/admin/products/[id]/edit`), auto-slug generation, stock badges, instant client search, 3:4 portrait uploader. | ✅ **DONE** | `src/app/(admin)/admin/products/`<br>`src/components/admin/ProductFormClient.tsx` |
| **07** | **Store Settings Engine** | 6-module configuration dashboard: General & Brand, Logistics & Shipping, Payment Gateways, Courier & Fraud Shield, Marketing & Pixels, Storefront & Layout. | 🟡 **IN PROGRESS** | `src/app/(admin)/admin/settings/`<br>`src/components/admin/SettingsFormClient.tsx` |
| **08** | **Orders & Fulfillment Suite** | Manual order entry (`/admin/orders/new`), live orders table with status badges (`PENDING` to `DELIVERED`), Steadfast courier 1-click booking, customer phone search. | ⏳ **PENDING** | `src/app/(admin)/admin/orders/`<br>`src/models/Order.ts` |
| **09** | **Storefront Catalog & Discovery** | Luxury garments storefront homepage (`/`), Shop catalog (`/shop`), 3:4 portrait cards, sticky filters, responsive cart drawer, size guide modal, product detail page (`/products/[slug]`). | ⏳ **PENDING** | `src/app/(storefront)/`<br>`src/components/storefront/` |
| **10** | **Frictionless 1-Page BD Checkout** | Zero-login guest checkout, 11-digit BD phone validation (`01XXXXXXXXX`), auto-lead capture for abandoned carts (`INCOMPLETE`), inside/outside Dhaka logistics, advance payment rules. | ⏳ **PENDING** | `src/app/(storefront)/checkout/`<br>`POST /api/orders` |

---

## 2. Technical Specifications & Architecture Rules

### 2.1 Media Optimization Engine (`src/lib/imageCompressor.ts`)
* **Standard Garment Aspect Ratio:** Strictly locked to **3:4 Portrait** (`1200 x 1600 px`) for catalog parity and zero edge-cropping across responsive cards.
* **Format:** Universal target `image/webp`.
* **Cap Dimension:** Max 1200px edge (preserves aspect ratio without distortion).
* **Target Weight:** Strictly within 80 KB – 180 KB.
* **Conditional Optimization Matrix:**
  * **Case A (< 100 KB):**
    * Already `image/webp` AND max dimension $\le$ 1200px: **BYPASS** (return original file).
    * Dimension > 1200px: Downscale to 1200px, export WebP at quality `0.90`.
    * Non-WebP (PNG/JPG): Convert to WebP at quality `0.92`.
  * **Case B (100 KB – 200 KB):**
    * Already `image/webp` AND max dimension $\le$ 1200px: **BYPASS**.
    * Dimension > 1200px OR format is non-WebP: Downscale to 1200px, export WebP at quality `0.90`.
  * **Case C (> 200 KB to 9 MB+):**
    * Always downscale to 1200px max edge.
    * Dynamic quality scaling:
      * 200 KB – 3 MB: quality `0.82`
      * \> 3 MB: quality `0.78`
    * Enforce adaptive multi-pass check to stay strictly between 80 KB and 180 KB.
* **Safeguards:** Small images are never upscaled. If output size $\ge$ input size, return original file. Canvas elements and Object URLs are immediately revoked to eliminate memory leaks.

### 2.2 Storage Garbage Collection & Lifecycle (`Cloudflare R2`)
To guarantee \$0 storage bloat and prevent orphaned zombie assets:
1. **Direct UI Removal:** Clicking the remove icon (✕) on an uploaded thumbnail in `MediaUploader.tsx` optimistically updates UI state and asynchronously invokes `DELETE /api/upload?key=<key>` (seed assets with `seed/` prefix are protected).
2. **Form Cancellation Purge:** Draft images uploaded in a session are tracked in `ProductFormClient.tsx` via `sessionUploadedKeys.current`. If the user cancels or navigates away without saving, all uncommitted assets are purged from R2 before redirecting.
3. **Product Cascade Deletion:** Invoking `DELETE /api/products/[slug]` deletes the product document from MongoDB and concurrently deletes all associated cover and gallery images from R2 via `deleteFromR2(image.key)`.

### 2.3 Store Configuration Engine Scope (`/admin/settings`)
The single-document `StoreConfig` architecture controls 6 distinct store modules:
1. **General & Brand:** Store Name, Tagline, Logo URL (R2), Favicon, OpenGraph Image, Primary/Accent Hex Colors, Support Phone, WhatsApp Number, Support Email, Physical Showroom Address, Social Links, Invoice Prefix (`AUR-`), Invoice Footer Policy Note.
2. **Shipping & Delivery:** Inside Dhaka Delivery Fee (৳80 default), Outside Dhaka Delivery Fee (৳150 default), Suburbs/Gazipur/Savar Delivery Fee (৳120), Free Shipping Threshold (৳2500 default) + toggle, Estimated Delivery Timelines (Dhaka: 24-48 hrs, Outside: 3-5 days), Outside Dhaka Delivery Advance Charge Requirement (৳150 delivery charge in advance toggle).
3. **Payment Gateways:** Cash on Delivery (COD) enable/disable toggle, Manual bKash Personal/Merchant Number + QR code upload + Payment instructions note, Manual Nagad Number + QR code, SSLCommerz credentials (Store ID, Store Password, Sandbox toggle), bKash PGW credentials.
4. **Courier & Fraud Shield:** Steadfast Courier API Key & Secret Key, 1-Click Auto-Booking toggle upon order confirmation, Fraud Risk Score threshold (flags orders with $\ge 2$ prior courier returns).
5. **Marketing & Tracking Pixels:** Meta Pixel ID + Conversions API (CAPI) Server Token, Google Tag Manager (GTM) Container ID, Google Analytics 4 (GA4) Measurement ID, TikTok Pixel ID.
6. **Storefront & Layout Customizer:** Top Announcement Bar text + visibility toggle, Homepage Section Order array (Hero Banner, Featured Drop, Categories, New Arrivals, Customer Reviews).

### 2.4 Bangladesh Garment Logistics & Order Lifecycle
* **Order Status State Machine:**  
  `INCOMPLETE` (auto-captured on phone input) $\rightarrow$ `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED` (or `CANCELLED` / `RETURNED`).
* **Fraud Mitigation:** Validates 11-digit BD mobile phone regex `^01[3-9]\d{8}$`. Tracks return history to flag serial COD abusers.

---

## 3. Continuous Per-Task Changelog

### Task #01: Zero-Dep Image Compressor & UI Clean-up
* **Files Modified/Created:** `src/lib/imageCompressor.ts`, `src/components/admin/MediaUploader.tsx`.
* **Changes:** Replaced naive canvas downscaling with 3-tier intelligent rule matrix (Case A, B, C). Removed AI badges and notice boxes. Added standard subtitle: `Accepted ratio 3:4 · Max size 500 KB · WebP, PNG, JPG`. Added compression feedback string.

### Task #02: Cloudflare R2 Garbage Collection & Asset Lifecycle
* **Files Modified:** `src/components/admin/MediaUploader.tsx`, `src/components/admin/ProductFormClient.tsx`, `src/app/api/products/[slug]/route.ts`.
* **Changes:** Added async deletion on media remove, session key tracking for clean draft cancel purge, and product cascade image deletion in route handler.

### Task #03: Pipeline Specification Standard & Documentation Sync
* **Files Modified:** `docs/00-how-to-notes.md`, `docs/pipeline/scope.md`.
* **Changes:** Established Rule #5 in documentation standard. Authored complete Project Scope and Technical Specification Pipeline tracking all 10 platform modules.
