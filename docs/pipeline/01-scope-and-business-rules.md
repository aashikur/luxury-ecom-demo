# [ধাপ ১] Scope & Business Rules Locked — Master Specification

> **Phase Status:** 🔒 **CR-LOCKED & AUTHORITATIVE (Baseline v1.0)**  
> **Master Pipeline Stage:** Step 1 of 7  
> **Target:** Multi-Niche 1-Click Client Deployment & 500 Orders/Day Scalability  
> **Change Governance (CR Policy):** Once locked, **NO rules in this file may be modified casually**. Any post-lock scope modification MUST be logged in Section 4 (`Change Request (CR) Log`) with CR ID, impact on Schema/API/UI, and explicit human approval. Any code that violates these rules must be rejected.

---

## 🗺️ The 7-Step Senior Master Pipeline

```
[ধাপ ১] Scope & Business Rules Locked (THIS DOCUMENT)
  │      - 7 Core Collections + 4 Growth/Taxonomy Collections Boundaries (Total 11)
  │      - Bangladeshi Guest-First Checkout, 3-Zone Delivery & Incomplete Lead Rules
  │      - Concurrency, Idempotency & Atomic Inventory Rules
  │      - Zero-Latency Performance SLA, Security Shield & Payment State Rules
  ▼
[ধাপ ২] Schema, Interface & Response Envelope Locked
  │      - TypeScript DTOs & Mongoose Schema Interfaces
  │      - Standard API Response Contract: { success, data, error, code }
  ▼
[ধাপ ৩] Automated Seed Engine & Fixtures (npm run db:seed)
  │      - 1-Command realistic catalog, taxonomies, and admin credentials
  ▼
[ধাপ ৪] Core Backend Services & State Machines
  │      - Atomic Decrement ($inc) & Zero Oversell Guarantee
  │      - Order Lifecycle Transitions & Steadfast Courier Integration
  │      - On-Demand Cache Busters (revalidatePath)
  ▼
[ধাপ ৫] Admin & Staff Auth (RBAC)
  │      - HttpOnly Cookie sessions for Admin / Call-Center Moderators
  │      - Zero-password barrier for customers
  ▼
[ধাপ ৬] Frontend UI Wireup (Storefront & Admin)
  │      - 1-Page COD Drawer, Size Charts, Color Swatches
  │      - Locked Admin Design Hierarchy (#060d11, Emerald #076E46)
  ▼
[ধাপ ৭] Hardening, Concurrency & Production Checklist Sign-off
         - Race conditions, edge headers, and backup restore drills (docs/PRODUCTION_CHECKLIST.md)
```

---

## 1. Top-Level Collection Scope (What is IN vs OUT)

### A. The 7 Core Collections (Mandatory for Day-1 Launch)
1. **`StoreConfig` (`storeconfigs`)**: Single document singleton storing brand identity, niche, colors, header/footer navigation, drag-and-drop `homeSections[]`, courier credentials, payment wallets, and global feature toggles.
2. **`Category` (`categories`)**: Self-referential taxonomy tree with materialized path `ancestors[]` (e.g. `Men › Topwear › Hoodies`).
3. **`Collection` (`collections`)**: Marketing & merchandising campaign tags (e.g. *Winter Drop 2026*, *Flash Sale*, *Best Sellers*).
4. **`Product` (`products`)**: Master catalog item. Contains root pricing, inventory, and embedded subdocuments:
   - `variants[]` (Size × Color multi-axis SKU matrix with granular stock)
   - `sizeChart[]` (Dynamic measurements: Chest, Length, Sleeve, Waist)
   - `specifications[]` (Fabric details, GSM, care instructions)
   - `modifierGroups[]` (Gift box, custom embroidery, add-on accessories)
5. **`Order` (`orders`)**: Order state machine from checkout lead (`INCOMPLETE`) to `DELIVERED` / `RETURNED`. Embeds purchased item snapshots and courier consignment data.
6. **`User` (`users`)**: Unified authentication & RBAC accounts supporting 5 roles: `SUPER_ADMIN`, `ADMIN`, `MODERATOR` (future-configurable), `MERCHANT` (future B2B wholesale buyer), and `USER` (registered retail shopper; guest checkout remains passwordless).
7. **`Customer` (`customers`)**: Phone-number-indexed customer profiles caching total order history, completed delivery count, and courier fraud risk.

### B. The Growth & Taxonomy Collections (Scaled on Demand)
8. **`Brand` (`brands`)**: Multi-niche brand entities (e.g. *Apple*, *Samsung*, *Nike*, *Aurem*). Stores logo, slug, description, website, and active status. Linked optionally in `Product` via `brandId` with denormalized `brandName` & `brandSlug` for zero-join queries.
9. **`Coupon` (`coupons`)**: Discount vouchers, minimum spend limits, expiry dates, and usage limits.
10. **`Review` (`reviews`)**: Verified customer ratings, text reviews, and uploaded photos.
11. **`AuditLog` (`auditlogs`)**: Sensitive admin action tracking (who approved order, who updated prices).

### C. Prohibited Collections (Anti-Over-Engineering)
- ❌ **NO `Variants` Table:** Embedded in `Product.variants[]` for atomic updates and zero `$lookup` joins.
- ❌ **NO `HomeBanner` Table:** Embedded in `StoreConfig.homeSections[]` (entire homepage loads in 1 query).
- ❌ **NO `NavbarMenu` Table:** Embedded in `StoreConfig.headerNavLinks[]` + dynamic `Category` tree.
- ❌ **NO `Filters` / `FilterOptions` Table:** Dynamically aggregated from existing `Product` fields (`basePrice`, `inStock`, `brandSlug`, `variants.size`, `variants.colorName`). Zero desync risk.
- ❌ **NO External Search Cluster (Elastic/Algolia):** Instant search runs via micro-payload `/api/search` directly against `Product` text and compound indexes with sub-40ms response.
- ❌ **NO `Cart` Table in Database:** Session carts live client-side in Zustand + LocalStorage for zero-latency UI.

---

## 2. Business Rules & Logic Contracts

### Rule #1: Bangladeshi Guest-First Checkout (No Signup / No Password) & Smart Drawer Toggle
- **Problem:** Requiring password creation or email verification causes 70%+ checkout abandonment in Bangladesh.
- **Rule:** The storefront checkout MUST be a **3-field Slide-Over Drawer**:
  1. Full Name (`string`, min 2 chars)
  2. Mobile Phone Number (`string`, strictly validated against BD regex: `/^01[3-9]\d{8}$/`)
  3. Full Delivery Address (`string`, District + Thana/Area + House/Street details)
- **Customer Account:** Customers are NEVER required to create a password. Their identity is indexed solely by their 11-digit phone number.
- **Smart Checkout Mode (`smartCheckoutEnabled`):**
  - **ON (Default: `true`):** Order placement completes entirely within the slide-over sidebar drawer (`CartDrawer`) with zero page reload or URL navigation. Best for fast impulse buying and viral traffic.
  - **OFF (`false`):** "Buy Now" or "Checkout" button routes to the dedicated `/checkout` full page. Useful for merchants requiring additional form fields, complex payment gateways, or multi-step checkout reviews.

---

### Rule #2: Abandoned Lead Capture & Order State Machine

```
[Customer types phone in Drawer] ──► status: 'INCOMPLETE' (Saved silently in DB)
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
         [Abandons / Closes Tab]                             [Clicks "Confirm Order"]
                    │                                                   │
                    ▼                                                   ▼
        (Call-center calls lead)                               status: 'PENDING'
                    │                                                   │
                    ▼                                                   ▼
        status: 'CONFIRMED'  ◄──────────────────────────────────────────┘
                    │
                    ▼
        status: 'PROCESSING' / 'SHIPPED' (Steadfast Consignment ID created)
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
status: 'DELIVERED'        status: 'RETURNED' / 'CANCELLED'
(Success, stats +1)        (Restores stock, flags fraud score +1)
```

- **Order State Machine Constraints & Allowed Transitions:**
  - `INCOMPLETE`: Generated on phone input blur. Does NOT deduct stock.
  - `PENDING`: User clicked "Confirm Order" (for COD / Manual MFS) or gateway reservation started. Deducts inventory atomically (`inventoryState: 'DEDUCTED'`).
  - `CONFIRMED`: Staff verified order via call or auto-rules (or online gateway IPN verified `PAID`).
  - `SHIPPED`: Courier tracking number generated. Order items CANNOT be edited once shipped.
  - `DELIVERED`: Terminal state. Marks order fulfilled and atomically increments `Customer.deliveredCount` & `Customer.totalSpent`.
  - `CANCELLED` / `RETURNED`: **Idempotently restores product stock ONCE** (`inventoryState === 'DEDUCTED' -> 'RESTORED'`) and atomically updates `Customer.returnedCount` / `cancelledCount` for fraud scoring.
  - **Strict Transition Guard:** Reject illegal backwards transitions (e.g., `DELIVERED -> PENDING` or `CANCELLED -> CONFIRMED` without explicit re-deduction).

---

### Rule #3: Zero Overselling, Dual Stock Predicate & Idempotent Ledger
- **Problem:** During flash sales (e.g. 10 users buying the last 2 hoodies simultaneously), non-atomic checks create negative stock (`-3`), and double-cancel clicks can restore stock twice (`+2`).
- **Dual Conditional Atomic Update Rule:**
  - **Variant Product (`hasVariants: true`):**
    ```ts
    Product.findOneAndUpdate(
      { _id: productId, isActive: true, 'variants._id': variantId, 'variants.stock': { $gte: qty } },
      { $inc: { 'variants.$.stock': -qty, totalStock: -qty } }
    );
    ```
  - **Single/Regular Product (`hasVariants: false`):**
    ```ts
    Product.findOneAndUpdate(
      { _id: productId, isActive: true, totalStock: { $gte: qty } },
      { $inc: { totalStock: -qty } }
    );
    ```
- **Idempotency & Reservation Invariants:**
  - Every `Order` tracks `inventoryState: 'NONE' | 'DEDUCTED' | 'RESTORED'` so cancellations/refunds/webhooks can NEVER deduct or restore stock twice.
  - For Online Gateways (`SSLCommerz` / `bKash PGW`), stock reserved at initiation carries `stockReservationExpiresAt` (e.g., 15 mins); expired unpaid reservations are released idempotently.
  - If an atomic predicate returns `null`, fail immediately and rollback prior item deductions in that order, returning `{ success: false, error: "Selected item is out of stock", code: "OUT_OF_STOCK" }`.

---

### Rule #4: 3-Zone Delivery, Courier Auto-Booking, Fraud Shield & Advance Fee
- **3-Zone Bangladesh Delivery Tariffs (`Order.customer.deliveryZone`):**
  - `INSIDE_DHAKA`: City core tariff (`StoreConfig.logistics.insideDhakaFee`, default `৳70`).
  - `DHAKA_SUBURBS`: Gazipur, Savar, Narayanganj, Keraniganj (`StoreConfig.logistics.suburbsDhakaFee`, default `৳100`).
  - `OUTSIDE_DHAKA`: Nationwide 63 districts (`StoreConfig.logistics.outsideDhakaFee`, default `৳130`).
  - Free shipping unlocks automatically when `isFreeShippingEnabled` is `true` and `subtotal >= freeShippingThreshold`.
- **Default Courier:** Integrated with **Steadfast Courier API** (with secondary support for Pathao and RedX).
- **Fraud Score Shield & Alert Threshold:**
  - On checkout/admin order view, system checks the customer's 11-digit BD phone against `Customer` history & courier delivery success rates.
  - **Configurable Alert Threshold (Default: < 60%):** Flags orders below threshold as **High Risk**.
  - **Auto-Hold High Risk Orders:** Optional switch to hold flagged orders for phone verification before dispatching.
- **Advance Delivery Charge Protection (Optional Toggle & Configurable Amount):**
  - **Toggleable (`advancePayment.enabled` / `features.advanceDeliveryFeeEnabled`):** Merchants can turn advance delivery fee collection ON or OFF anytime.
  - **Configurable Amount (`advancePayment.amount`):** Default `৳130` (customizable e.g. ৳100, ৳130, ৳150).
  - **Scope:** Configurable for `OUTSIDE_DHAKA` only (default; `DHAKA_SUBURBS` exempt unless `applyOnlyOutsideDhaka === false`) or All Orders.
  - **Payment Wallets:** Supports bKash, Nagad, or Rocket with custom instruction notes.
- **1-Click Bulk Dispatch & Non-Blocking Webhook Sync:** Admin dispatches `CONFIRMED` orders to Steadfast in batches (4×6 thermal labels); Steadfast delivery/return status webhooks update `Order` and `Customer` counters idempotently.

---

### Rule #5: Multi-Niche & Multi-Mode Adaptability
The platform adapts dynamically based on `StoreConfig`:
1. **Store Niches:**
   - `CLOTHING`: Activates Size Charts, Color Swatches, Fabric & GSM specs.
   - `GADGETS`: Activates Technical Specifications (RAM, Storage, Warranty, Chipset).
   - `FOOD`: Activates Topping Modifiers, Preparation Time, and Delivery Time slots.
   - `GENERAL`: Clean universal layout.
2. **Store Modes:**
   - `MULTI_PRODUCT`: Standard browsing with `/shop`, categories, and collections.
   - `SINGLE_PRODUCT_FUNNEL`: High-converting single-page landing funnel centered on `featuredProductSlug`.

---

### Rule #6: Zero-Egress Media & Asset Lifecycle
- **Aspect Ratio:** Strictly **3:4 Portrait** (`1200 x 1600 px`) for clothing/catalog consistency.
- **Client-Side Compression:** Images are compressed in-browser via HTML5 Canvas into WebP (target 80 KB – 180 KB) before uploading.
- **Cloudflare R2 Storage:** \$0 egress download fees.
- **Lifecycle Garbage Collection:** Removing an image in admin triggers instant `DELETE /api/upload?key=...`. Deleting a product cascades to delete all its images from R2.

---

### Rule #7: Next.js 16 Zero-Stale Cache, `StoreConfig` Singleton Cache & `bf-cache` Split Strategy
- **Admin, Checkout & Account (`/admin/**`, `/checkout`, `/account`):**
  - Strictly dynamic (`export const dynamic = 'force-dynamic'; export const revalidate = 0;`) + `Cache-Control: private, no-store` — prevents stale inventory/orders/PII and blocks `bf-cache` snapshots of sensitive admin/checkout pages.
  - Client table/form wrappers (`ProductsTableClient`, `SettingsFormClient`) sync incoming props via `useEffect` and support `{ cache: 'no-store' }` refresh on mount/after mutations.
- **Public Storefront Catalog (`/`, `/shop`, `/category/[slug]`, `/collections/[slug]`, `/brand/[slug]`, `/products/[slug]`):**
  - **Shared `getPublicStoreConfig()` Cache:** Wrapped in Next.js `unstable_cache` (`tags: ['store-config']`, `revalidate: 86400` or `false`) with public-only `.select()` projection. Serves 100k+ visitors across all Vercel serverless instances with **0 DB queries** until Super Admin saves settings (`PUT /api/config`).
  - **Catalog Data Cache & `bf-cache` Enabler:** Public storefront queries run through tagged `unstable_cache` (`'products'`, `'categories'`, `'collections'`, `'brands'`) with `Cache-Control: public, max-age=0, must-revalidate` (**STRICTLY NO `no-store`** on public storefront HTML!) so Chrome/Safari **Back/Forward Cache (`bf-cache`)** restores pages in **`0ms`** on mobile back-swipe.
- **Immediate On-Demand Invalidation (`POST`, `PUT`, `PATCH`, `DELETE`):**
  - Every Admin or Order mutation MUST call `revalidateTag(...)` AND `revalidatePath(...)` (`'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, `'/admin/settings'`, `'/products/[slug]'`, `'/category/[slug]'`) so changes propagate globally in **< 1 second**.

---

### Rule #8: Category vs Collection Architecture & Relationship Contracts
- **Category (Physical Taxonomy - "What the product IS"):**
  - **Single Self-Referential Schema:** All 3 levels (Root, Sub, Item) live in `categories`. No separate `SubCategory` tables.
  - **Level Structure:** Level 0 (Root, `parentId: null`), Level 1 (Sub-category), Level 2 (Item type).
  - **Materialized Ancestors:** `ancestors: ['men', 'topwear']` stores slug trail for instant breadcrumbs and fast parent queries without `$lookup`.
  - **Local Sibling Reordering:** Scoped per parent using compound index `{ parentId: 1, displayOrder: 1 }`. Reordering items within `Topwear` never affects `Bottomwear`.
  - **Batch Reordering:** Updated via `bulkWrite` in a single trip (`PUT /api/categories/reorder`).
  - **Deletion Safeguards:**
    1. Blocks deletion if child categories exist.
    2. Blocks deletion if active products are assigned to the category.
- **Collection (Marketing & Merchandising - "How we SELL the product"):**
  - Separate top-level collection (`collections`) for promotional drops (*Winter Drop 2026*, *Flash Sale*).
  - Stores `bannerImage`, `badgeText` (`HOT`, `SALE`, `40% OFF`), and campaign dates.
  - **Relationship:** Many-to-many string array on product (`Product.collections: string[]`). A single hoodie can belong to multiple collections simultaneously.
  - **Safe Deletion:** Deleting a collection removes marketing tags from products; products themselves remain 100% intact.

---

### Rule #9: Slug-Centric Flat URL Architecture & Dynamic Breadcrumbs
- **The Anti-Pattern (Deep Nested URLs):** URLs like `/shop/men/topwear/hoodies/acid-wash-hoodie` create broken links when categories are renamed, break running Facebook ads, and cause duplicate content SEO penalties.
- **The Shopify & Nike Standard (Canonical Flat URLs):**
  - **Category Pages:** `/category/[slug]` (e.g. `/category/men`, `/category/hoodies`). Short, clean for social ads, permanent permalink.
  - **Collection Pages:** `/collections/[slug]` (e.g. `/collections/winter-drop-2026`).
  - **Product Pages:** `/products/[slug]` (e.g. `/products/heavyweight-acid-wash-hoodie`). Flat canonical URL that never breaks or duplicates.
- **Dynamic 14px Breadcrumbs:** The product page dynamically traverses `Product.categoryPath` (`["men", "topwear", "hoodies"]`) to render clickable breadcrumb links: `Home › Men › Topwear › Hoodies › Product Name`.

---

### Rule #10: Modular Homepage Section Engine (`StoreConfig.homeSections[]`)
The storefront homepage is fully dynamic and zero-code configurable via `StoreConfig.homeSections[]`:
1. **Reorderable & Unlimited:** Admin can click `[+ Add Section]` to append unlimited sections, moving them Up/Down via `order: 1, 2, 3...` without code changes.
2. **Container Widths (`layoutWidth`):**
   - `WIDE_FULL`: 100vw edge-to-edge layout for immersive lifestyle banners.
   - `WIDE_BOX`: Centered container (`max-w-7xl mx-auto px-4`) for elegant boxed aesthetics.
3. **Smart Banners (Static or Carousel):**
   - 1 Image = Static Hero Banner (zero JS overhead).
   - Multi-Images = Auto-playing Swiper Carousel slider.
   - **Fallback Logic:** If only image + link (`bannerURL_link`) are provided, the entire image acts as a clean clickable poster. If text/button are provided, renders luxury typography overlay.
4. **Compact Promo CTA Cards:**
   - Heights: `S` (~120px mini-strip), `M` (~220px standard voucher), `L` (~320px countdown/event card).
   - Fully clickable with customizable promo badges.
5. **Product Showcase Sections (The Dual-Source Engine):**
   - Display Style: `GRID` (4 columns) or `CAROUSEL` (horizontal swipe).
   - **Mode A (Auto from Category / Collection):** Selects a category or collection slug; automatically pulls live products dynamically.
   - **Mode B (Manual Curated Products):** Admin searches products by name/SKU and hand-picks specific 4-8 items.
6. **Performance Guardrail (The Batch Query Rule):**
   - Regardless of whether there are 3 or 12 sections on the homepage, the Next.js Server Component executes **ONE single database query** on load (`Product.find({ isActive: true })`) and filters in-memory.
   - **Guaranteed Homepage Load Time: < 600ms**.

---

### Rule #11: Unified Analytics & Dual-Tracking Engine (Wrapper, CAPI & GTM)
A centralized, zero-bloat tracking architecture ensuring 100% ad attribution while keeping page speed under 800ms:
1. **The Single Facade Wrapper (`src/lib/analytics.ts`):**
   - All storefront components, buttons, and drawers call a single unified function: `trackEvent(eventName, payload)`.
   - UI components NEVER directly invoke `fbq`, `ttq`, or `dataLayer`.
2. **Feature-Flag Controlled Execution:**
   - Checks `StoreConfig.features`: `capiEnabled`, `gtmEnabled`, `tiktokPixelEnabled`, `clarityEnabled`.
   - Dedicated 1-Click Trackers:
     - Meta Pixel (`metaPixelId`) & CAPI (`metaCapiToken`)
     - Google Analytics 4 (`ga4MeasurementId`)
     - Microsoft Clarity Heatmap & Session Recording (`clarityProjectId`)
     - TikTok Pixel (`tiktokPixelId`)
     - Google Tag Manager (`gtmId`)
   - Skips disabled trackers silently without console errors or runtime crashes.
   - In development mode (`NODE_ENV === 'development'`), logs events cleanly to console with zero fake data sent to live ad accounts.
3. **Dual-Tracking with Event Deduplication (`event_id`):**
   - Browser Pixel (`fbq`) and Server-Side CAPI (`POST /api/orders`) send the EXACT SAME `event_id` (e.g. `orderNumber: "AUR-1042"`).
   - Meta deduplicates identical events, eliminating double-counting while capturing 100% of sales bypassed by iOS Safari/Ad-blockers.
4. **Bangladeshi Advanced Matching & Attribution:**
   - Normalizes BD phone numbers to E.164 format (`88017XXXXXXXX`) and SHA-256 hashes them (`ph`) before transmission, boosting Event Match Quality to **8.5 – 9.5 / 10**.
   - Captures `_fbp` and `_fbc` (from ad click `fbclid`) cookies and forwards them in CAPI for precise campaign ROAS attribution.
5. **GTM-Only Agency Decoupling:**
   - Professional marketing agencies can disable native CAPI/pixels and enable GTM (`gtmEnabled: true` + `gtmId: "GTM-XXXXX"`).
   - The wrapper automatically pushes standardized GA4 e-commerce events to `window.dataLayer`.
   - Marketers can configure Microsoft Clarity, TikTok, Google Ads, or Snapchat inside GTM without touching application code.
6. **Performance & Non-Blocking Invariant:**
   - ZERO heavy external NPM analytics packages (pure ~60-line TypeScript utility).
   - Server CAPI runs as a non-blocking background task ("fire-and-forget"). Order confirmation response is returned in < 200ms regardless of Facebook API latency.
   - Browser scripts use `next/script` with `strategy="afterInteractive"`.
7. **Strict 5 Canonical E-Commerce Events (Zero Noise):**
   - `PageView`
   - `ViewContent` (PDP with SKU, price, category)
   - `AddToCart` (Drawer or inline button)
   - `InitiateCheckout` (Fired on phone input blur)
   - `Purchase` (Order confirmation with full transaction payload)

---

### Rule #12: 3-Layer Credential Security & Field-Level Encryption Shield
To allow non-technical merchants self-serve control over third-party API credentials without compromising application security:
1. **Server Environment Invariant (`.env`):**
   - `MONGODB_URI` and the master cryptographic key `ENCRYPTION_KEY` (32-byte hex secret) reside strictly in `.env`.
   - These secrets are NEVER committed to git, exposed via API endpoints, or transmitted to client browsers.
2. **Field-Level Encryption at Rest (AES-256-GCM):**
   - High-risk server secrets stored in `StoreConfig` (`courier.steadfast.secretKey`, `payment.bkashPGW.appSecret`, `payment.bkashPGW.password`, `payment.sslCommerz.storePass`, `tracking.metaCapiToken`, `tracking.tiktokEventsApiToken`) MUST be encrypted with `ENCRYPTION_KEY` before saving to MongoDB Atlas.
   - In MongoDB, secrets appear as ciphertext (`enc:v1:7a9f8c4...`). Even a full database dump leaves credentials completely unreadable.
3. **Strict Public Projection Sanitization:**
   - Storefront endpoints (`/api/config`, Server Component queries) query MongoDB with a projection that strips all secret fields (`-courier.steadfast.secretKey`, `-payment.bkashPGW.appSecret`, etc.).
   - Ordinary store visitors NEVER receive third-party API secrets or payment passwords in JSON payloads or DevTools network responses.
4. **Super-Admin RBAC & Masked Settings UI:**
   - Modifying credentials (`PUT /api/config`) strictly requires a valid, verified `SUPER_ADMIN` session cookie.
   - Admin settings inputs display masked values (`••••••••••••••••`) to prevent shoulder surfing or clear-text HTTP echoing.
5. **Zero-Client Third-Party Calls:**
   - The browser client NEVER initiates direct authenticated requests to Steadfast, bKash PGW, or Facebook Graph API.
   - All third-party interactions execute server-to-server inside Next.js API routes where keys are decrypted in server memory in-flight.

---

### Rule #13: Universal Menu & Configurable Quick-Category Bar (`headerNavLinks`)
Provides the high-converting luxury e-commerce navigation pattern: `[Logo] [ Menu ▾ ] | [ Category 1 ] [ Category 2 ] ... [ Cart / Search ]`:
1. **Anti-Over-Engineering Invariant:**
   - ❌ **NO separate `NavbarMenu` table or collection in MongoDB.**
   - Pinned quick links are embedded directly inside `StoreConfig.headerNavLinks[]`.
   - The universal "Menu" button dynamically queries the existing 3-level `Category` collection (`Root ➔ Sub ➔ Sub-Sub`) without redundant intermediate tables.
2. **Universal "Menu" Trigger:**
   - Always accessible across Desktop and Mobile headers.
   - Hover or click reveals the entire category hierarchy in a desktop Mega-Menu dropdown or mobile slide-over drawer.
3. **Admin Quick Links Control (`/admin/settings`):**
   - **Order Control (⬆️ ⬇️):** Reorder links horizontally.
   - **Eye Icon Toggle (👁️):** Hide or show links without deletion (ideal for seasonal items like *Winter Drop*).
   - **One-Click Add (`+`):** Select existing Category / Sub-Category to auto-populate label, slug, and href.
   - **Delete (🗑️):** Permanently remove obsolete links.
4. **Mobile Responsive Invariant:**
   - Desktop renders inline horizontal pills next to the Menu button.
   - Mobile renders horizontal touch-scrollable category pills directly below the main navbar with active scroll-snap.

---

### Rule #14: Brand Architecture & Optional Taxonomy Linking
- **Multi-Niche Adaptability:** In `GADGETS` or multi-brand storefronts, customers filter and shop specifically by brand (e.g. *Apple*, *Samsung*, *Anker*, *Sony*). In single-brand fashion stores (e.g. *Aurem*), brand is redundant.
- **Optional Product Association:** During product creation/edit, the Brand selection dropdown is **strictly optional**. Single-brand merchants leave it blank without validation errors.
- **Zero-Join Denormalization:** `Product` stores `brandId` (ObjectId ref) alongside denormalized `brandName` and `brandSlug`. Catalog queries and filters run at wire-speed without `$lookup` overhead.

---

### Rule #15: Advanced Faceted Filtering via URL SearchParams (Zero Extra Collections)
- **Anti-Over-Engineering Invariant:** NO separate `Filters` collection or complex EAV tables. Filter facets are dynamically derived from live `Product` fields (`basePrice`, `inStock`, `brandSlug`, `categorySlug`, `variants.size`, `variants.colorName`).
- **Single Source of Truth:** Filters operate strictly via URL SearchParams (e.g. `/shop?brand=apple,sony&minPrice=2000&maxPrice=15000&inStock=true&sort=price_asc`).
  - 100% shareable links across WhatsApp, Messenger, and Social Ads.
  - SSR & SEO indexable; zero React state desynchronization.
- **Faceted Pipeline Performance:** A single MongoDB query with compound indexes executes sub-20ms filtering and returns facet counts in one round-trip.
- **Pages with Advanced Filters:**
  1. `/shop` (Primary catalog with full sidebar / drawer filter)
  2. `/category/[slug]` (Category drill-down filters)
  3. `/brand/[slug]` (Dedicated brand hub with sub-category & price filters)
  4. `/collections/[slug]` (Campaign / Flash sale filters)
  5. `/admin/products` (Merchant inventory filter by status, category, brand, and stock)

---

### Rule #16: Instant Live Auto-Suggest Search Engine (`/api/search`)
- **Micro-Payload Architecture:** Rather than loading the heavy 50-80KB master `/api/products` payload, auto-suggest runs on a dedicated `/api/search?q=...` endpoint.
- **Payload Projection:** Strips heavy descriptions, variants, size charts, and modifiers. Returns only:
  `{ title, slug, basePrice, discountPrice, image: images[0].url, inStock }`
- **Ultra-Low Latency:** Debounced (300ms) query limited to top 6 results runs across `title`, `tags`, `brandName`, and `sku` in < 40ms.
- **Click Navigation:** Clicking any result routes directly to `/products/[slug]`. Clicking "View all results" routes to `/shop?q=...`.

---

### Rule #17: Server-Authoritative Pricing, Wholesale Role Gate & Checkout Idempotency
- **Zero Client Price Trust:** The checkout browser payload ONLY submits `{ productId, variantId, modifierLabels, quantity, couponCode, deliveryZone, idempotencyKey }`. The server NEVER trusts client-supplied `unitPrice`, `subtotal`, `discount`, `deliveryFee`, or `totalAmount`.
- **Server Recalculation & Dual-Tier Pricing Rule:** Backend fetches live prices from `Product`, verifies `isActive: true` and variant ownership, calculates 3-zone delivery fee from `StoreConfig` (with `freeShippingThreshold`), validates coupons, and stores immutable purchase snapshots on `Order.items[]`.
  - **Retail vs Merchant Wholesale Gate:** Regular guests and `USER` accounts strictly receive Retail price (`discountPrice ?? basePrice`). Future `MERCHANT` wholesale pricing (`wholesalePrice`) is applied ONLY when the server verifies an authenticated, approved `session.user.role === 'MERCHANT'` (and `qty >= wholesaleMinQty`).
- **Coupon Enforcement:** Validates `isActive`, `startsAt <= now <= expiresAt`, `minSpend`, global `usageLimit`, `perPhoneLimit` (against `01XXXXXXXXX`), and non-stackable rule.
- **Checkout Idempotency (`idempotencyKey`):** Every order submission generates a client UUID `idempotencyKey` stored with a unique sparse index on `Order`. Duplicate submissions/double-taps return the existing order without creating a second order or double-deducting stock.

---

### Rule #18: Unified Payment Adapter, COD + SSLCommerz Primary & SMS-Forwarder Auto-Verify
- **Day-1 Primary Payment Scope (Locked):** Primary launch supports **`COD` (Cash on Delivery)** and **`SSLCOMMERZ` (Automated Online Gateway)**, built behind a **Unified Payment Adapter Contract** (`initiatePayment()`, `verifyPayment()`, `refundPayment()`) so future gateways (`BKASH_PGW`, `NAGAD_PGW`, `ROCKET_PGW`) and manual MFS plug in without rewriting order or checkout flows.
- **Decoupled States:** Fulfillment (`orderStatus`) and payment (`paymentStatus: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'`) are strictly separate fields. Marking an order `PAID` never skips fulfillment; marking `DELIVERED` requires verified settlement or COD collection.
- **Unified Payment Metadata (`Order.payment`):** Tracks `method`, `status`, `amountDue`, `amountPaid`, `trxId`, `senderPhone`, `gatewayRef` (`val_id` / `bank_tran_id`), and `verifiedBy: 'IPN' | 'SMS_WEBHOOK' | 'ADMIN' | 'COD_SETTLEMENT'`.
- **SSLCommerz Golden Rule:** Checkout creates the order with `paymentStatus: 'UNPAID'` and `stockReservationExpiresAt`. Browser success/fail redirect URLs NEVER mark an order `PAID` — ONLY server-to-server IPN + SSLCommerz Validation API verifying matching `tran_id`, `amount`, and `currency === 'BDT'` marks `paymentStatus: 'PAID'` and moves `orderStatus` to `'CONFIRMED'`.
- **Manual MFS (`MANUAL_BKASH` / `MANUAL_NAGAD` / `MANUAL_ROCKET`) — Identical Adapter Flow:**
  - Customer submits `trxId` (normalized uppercase, unique across active orders) + `senderPhone` $\rightarrow$ order enters `paymentStatus: 'PENDING_VERIFICATION'`.
  - **Verification Path A (Admin Manual Approve):** Staff verifies `trxId` in wallet/SMS and approves $\rightarrow$ transitions `paymentStatus: 'PAID'` (`verifiedBy: 'ADMIN'`).
  - **Verification Path B (Mobile SMS-Forwarder Auto-Verify Webhook):** An Android SMS-forwarder app posts incoming MFS SMS payloads to a signed endpoint (`POST /api/webhooks/sms-payment` secured via HMAC/webhook secret). The server parses `(provider, trxId, amount, senderPhone)` and, upon exact match with an order in `PENDING_VERIFICATION`, **automatically transitions `paymentStatus: 'PAID'` (`verifiedBy: 'SMS_WEBHOOK'`)** — behaving identically to an SSLCommerz IPN callback.

---

### Rule #19: 5-Role RBAC Matrix, Phased Visibility & Mandatory AuditLog
- **Strict Role Boundaries (Server-Enforced on Every Route & API):**
  1. **`USER` (Retail Customer — Guest or Registered):** Browses catalog, sees **Retail price only**, places orders via guest checkout or optional registered account, manages own profile/addresses/orders. No `/admin` access.
  2. **`MERCHANT` (B2B Wholesale Buyer — Future-Ready in Schema):** Shops like `USER` (no `/admin` access). When wholesale mode is enabled in future, authenticated approved `MERCHANT` accounts view **both Retail & Wholesale prices** on product cards/PDP and checkout at wholesale rates.
  3. **`MODERATOR` (Limited Admin Staff — Future-Configurable):** Accesses `/admin` with restricted operational scope (e.g., manage orders, edit existing product details/stock; exact permissions configurable later). Strictly NO `/admin/settings` (`StoreConfig`), NO deletions, NO staff management.
  4. **`ADMIN` (Store Owner / Site Malik):** Full day-to-day store management — Products CRUD (create/edit/delete), Categories, Collections, Brands, Coupons, Orders fulfillment, Courier bulk dispatch, Customers, and Moderator management. **Cannot view or modify `StoreConfig` / site-level credentials, feature flags, or infrastructure settings.**
  5. **`SUPER_ADMIN` (Platform Architect Above Admin):** Full `ADMIN` capabilities **PLUS exclusive ownership of `StoreConfig` (`/admin/settings`)** — branding/niche infrastructure, payment gateway keys, courier API credentials, encryption/feature flags, and Admin account creation/revocation.
- **Day-1 UI Visibility Contract:** Initially only `USER`, `ADMIN`, and `SUPER_ADMIN` workflows are surfaced in the UI; `MERCHANT` and `MODERATOR` live in the `User.role` enum and RBAC middleware from Day 1 so enabling them later requires zero database migration.
- **Session & Credential Hardening:** Passwords hashed with `Argon2id` or `bcrypt`; sessions stored in `HttpOnly`, `Secure` (prod), `SameSite=Lax` cookies; CSRF origin/token protection; `User.sessionVersion` incremented on password/role changes to immediately revoke old sessions.
- **Mandatory `AuditLog` Trail:** Every price change, manual stock adjustment, order status/payment verification override, `StoreConfig`/secret update, role change, and deletion writes an immutable `AuditLog` entry (`actorId`, `role`, `action`, `targetId`, `before`, `after`, `timestamp`).

---

### Rule #20: API Protection, Rate Limiting & Guest Privacy (IDOR Prevention)
- **Strict DTO Allowlists & Input Validation:** All API inputs are validated with explicit allowlist schemas (Zod). Reject unknown fields, block raw MongoDB `$` operators (NoSQL injection), and forbid mass-assignment spreading of `req.body` into Mongoose models.
- **Public Abuse & Bot Rate Limiting:** Enforce IP + phone rate limits on `POST /api/orders`, `POST /api/orders/lead`, `/api/search`, `/api/coupons/validate`, `/api/upload`, `/api/auth/login`, and `/api/webhooks/sms-payment` (plus shared secret/HMAC signature verification on all payment webhooks).
- **Guest Order Tracking Privacy (Zero IDOR):** Public order tracking (`/track-order`) NEVER exposes customer phone/address by sequential ID or raw `orderNumber` alone — requires **`orderNumber` + last 4 digits of BD phone** (or signed tracking token).
- **Upload, CSP & Header Hardening:** `/api/upload` validates file magic bytes & max byte limits server-side. Responses MUST enforce **`Content-Security-Policy` (CSP) in enforcement mode** (whitelisting `'self'`, Cloudflare R2 CDN, and active tracking domains `connect.facebook.net`, `googletagmanager.com`, `clarity.ms`; blocking inline XSS & `frame-ancestors 'none'`), alongside `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and strict CORS origins without leaking stack traces in production.

---

### Rule #21: Zero-Latency Performance, Projections, Streaming & Image SLA
- **Mandatory `.select()` Projections & `.lean()`:**
  - **Catalog / Card Grids (`/`, `/shop`, `/category/[slug]`, `/collections/[slug]`, `/brand/[slug]`, Related):** Query ONLY card-required fields (`title`, `slug`, `basePrice`, `discountPrice`, `maxPrice`, `inStock`, `stockStatus`, `primaryCategory`, `hasVariants`, and cover `images` sliced to 1) via `.lean()` — NEVER pull `description`, `sizeChart`, `specifications`, or `modifierGroups` (cuts payload 70–90%).
  - **Public `StoreConfig` Projection:** Select only storefront-safe fields (`branding`, `logistics`, `homeSections`, `headerNavLinks`, `features`, public pixel IDs) — strip all server secrets.
  - **Zero Double-Serialization:** Replace `JSON.parse(JSON.stringify(...))` on large lists with lightweight typed DTO mappers.
- **Zero-Waterfall `Promise.all` Rule:** Independent server queries (`StoreConfig`, `Product`, `Category`) MUST execute in parallel via `Promise.all`. List endpoints require bounded pagination (`limit <= 48`) and compound indexes.
- **Instant Click UX Contract (<16ms Perceived Transition — Zero Freeze):**
  - **Mandatory `loading.tsx` Skeletons:** Every interactive route (`/products/[slug]`, `/shop`, `/category/[slug]`, `/collections/[slug]`, `/brand/[slug]`, `/admin/products`, `/admin/orders`) MUST have a lightweight Tailwind `animate-pulse` `loading.tsx` boundary — eliminating click freeze on slow 3G/4G mobile AND unlocking Next.js dynamic `<Link>` prefetching.
  - **`<Suspense>` Streaming:** Heavy secondary blocks (Related Products, Reviews) stream inside `<Suspense>` so above-the-fold PDP content renders immediately.
  - **Native Tactile Feedback:** Use CSS `:active` scale (`active:scale-[0.98]`) + Next.js 16 `useLinkStatus()` subtle pending bar/pulse on slow transitions — zero heavy spinner libraries.
- **Strict `<Image>`, Mobile `deviceSizes` & Region Co-location Contract:**
  - Hero banner MUST use Next.js `<Image fill priority fetchPriority="high" sizes="100vw" />` (NO raw `<img>`). Above-the-fold first 4 catalog cards set `priority`.
  - Mobile catalog grids default to **2 columns (`grid-cols-2 lg:grid-cols-4`)** with `sizes="(max-width: 640px) 50vw, 25vw"` and tuned `next.config.ts` `deviceSizes` (`384`, `480`, `640`, `750`, ...) so mobile cards fetch `~384w` WebP instead of over-serving `w=750`.
  - Every `fill` image MUST define exact `sizes` (`sizes="80px"` on PDP thumbnails, `sizes="(max-width: 1024px) 100vw, 50vw"` on PDP main gallery).
  - Use a tiny inline SVG shimmer `placeholder="blur"` (`blurDataURL`) + gallery hover pre-warming for instant image swaps.
  - Co-locate Vercel Functions (`sin1` Singapore) with MongoDB Atlas (`ap-southeast-1` Singapore) and execute Steadfast/Meta CAPI calls non-blocking (`<200ms` checkout response SLA).

---

### Rule #22: WCAG AA Accessibility & Clean Incognito Lighthouse Launch Gate
- **4.5:1 Color Contrast Guardrail:** Storefront accent colors (`#076E46` emerald or darkened gold `#8A6508`; or dark `#09090B` foreground text on `#B8860B` gold buttons/badges) MUST maintain $\ge 4.5:1$ contrast ratio against backgrounds across sale prices, buttons, and discount badges.
- **Semantic Heading Hierarchy & Accessible Controls:** Maintain sequential heading order (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`; never jump `h2` to `h4` in Footer) and ensure interactive icon/counter buttons (e.g., Navbar Cart badge) align `aria-label` with visible text or `.sr-only` labels (`label-content-name-mismatch` = 0).
- **Incognito Lighthouse Launch Gate (Step 7):** Production Lighthouse verification MUST run in **Chrome Incognito (Zero Extensions)** targeting `Performance >= 90`, `Accessibility = 100`, `Best Practices = 100`, `SEO = 100`, `bf-cache = PASS`, and enforced CSP.

---

### Rule #23: Admin Dashboard Performance, Scalability & Anti-Over-Engineering Rules (`/admin/**`)
- **Anti-Over-Engineering Invariant (Zero Table/State Bloat):**
  - ❌ **NO Heavy Grid Libraries (`TanStack Table`, `AG Grid`):** Use clean semantic HTML tables driven by URL SearchParams.
  - ❌ **NO Redux / RTK Query / Full-Catalog Client State:** Never pull all DB records into browser RAM to paginate or filter client-side.
  - ❌ **NO External Progress Libraries (`nprogress`):** Use native Next.js 16 `loading.tsx` + `useLinkStatus()`.
- **Shell-Stable Instant Transitions (`Sidebar` Fixed, `{children}` Skeleton Only):**
  - `AdminShellClient` (Sidebar + Top Header) lives in `admin/layout.tsx` and NEVER unmounts during navigation.
  - Every admin segment (`/admin`, `/admin/products`, `/admin/orders`, `/admin/settings`, `/admin/products/[id]`) MUST define a lightweight Tailwind `animate-pulse` `loading.tsx` inside `{children}` — delivering **<16ms perceived transition** and unlocking Next.js `<Link>` prefetching.
  - Sidebar navigation links use `useLinkStatus()` to render a subtle pending indicator next to the clicked menu item during server fetch.
- **URL-Driven Server Pagination, Projections & SSR/Client Parity:**
  - All admin list pages (`/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/audit-logs`) and APIs (`GET /api/products`, `GET /api/orders`) MUST paginate server-side via URL SearchParams (`?page=1&limit=20&status=...&q=...`) with a strict cap **`limit <= 50`**.
  - **SSR & Client Limit Parity Rule:** Server Page and Client Table MUST share the exact same `page` / `limit` parameters (NEVER load unbounded `Product.find({})` in SSR and then overwrite with `limit=20` on client mount!).
  - **Mandatory List Projections:** Admin tables MUST use `.lean()` + `.select(...)` + `images: { $slice: 1 }` (strip `description`, `sizeChart`, `specifications`, `modifierGroups`, and full `items[]` sub-arrays in list views).
  - **Indexed Prefix/Text Search:** Search queries hit indexed fields (`slug`, `sku`, `orderNumber`, `customer.phone` anchored `^` regex) — never unindexed regex scans over `description`.
- **Dashboard KPIs via Single `.aggregate()` + `Promise.all`:**
  - Overview KPIs (Total Revenue, Today's Orders, Pending Verification Count, Courier Dispatches) MUST execute in **1 parallel `Promise.all`** round-trip using MongoDB `.aggregate([$group])` and indexed `Order.status` predicates (NEVER `Order.find({})` + JS `.reduce()`, and NEVER wrong field names like `orderStatus`).
  - Sidebar notification badges (e.g., Pending Orders count) MUST reflect live DB counts via lightweight `countDocuments({ status: 'PENDING' })` — never hardcoded strings.
- **Modular Lazy-Loaded Admin Tabs & Server-Passed Taxonomies:**
  - Multi-tab admin views (`/admin/settings` — avoiding 2,000-line monolith bundles) MUST split each tab into modular components loaded lazily on-demand via `next/dynamic`, keeping initial admin JS parse under **<100ms**.
  - Product Create/Edit forms receive cached `Category` tree and `Collection` list from the Server Component via `Promise.all` (`unstable_cache` with `'categories'`/`'collections'` tags) — eliminating post-mount loading flashes.
- **Admin Freshness & Currency Consistency:**
  - All `/admin/**` pages strictly retain `export const dynamic = 'force-dynamic'; export const revalidate = 0;` + `Cache-Control: private, no-store` (`bf-cache` disabled for safety).
  - Client forms/tables sync `initial*` props via `useEffect`, pass `{ cache: 'no-store' }` on manual refresh/mutations, call `router.refresh()` on save, and display `StoreConfig.branding.currencySymbol` (`৳`, never hardcoded `$`).

---

## 3. Step 1 Sign-Off Checklist

- [x] Top-level collections strictly capped at 7 Core + 4 Growth/Taxonomy (11 Total).
- [x] Prohibited anti-over-engineered tables documented (NO Variants, NO Banners, NO Filters, NO ElasticSearch cluster).
- [x] 3-Field guest checkout with 11-digit BD phone regex, 3-zone delivery tariffs, & Smart Drawer toggle locked.
- [x] Abandoned lead capture (`INCOMPLETE`) and idempotent state machine transitions locked.
- [x] Dual atomic `$inc` inventory predicate (`hasVariants` true/false) + `inventoryState` guard locked against overselling and double-restore.
- [x] Steadfast courier auto-booking, configurable fraud alert (<60%), and optional advance delivery fee locked.
- [x] Multi-niche and single-product funnel rules codified.
- [x] Zero-egress Cloudflare R2 media lifecycle, `getPublicStoreConfig()` singleton cache, & `bf-cache`-safe Split Cache Strategy locked.
- [x] Category (3-level tree) vs Collection (promotions) relationship locked.
- [x] Slug-centric flat URL architecture (`/category/[slug]`, `/products/[slug]`, `/brand/[slug]`) locked.
- [x] Modular homepage section engine (wideFull/wideBox, smart banner, dual-source products) locked.
- [x] Unified analytics wrapper with dual CAPI deduplication, GTM dataLayer, and BD phone hashing locked.
- [x] 3-Layer Credential Security Shield (AES-256 field-level encryption, sanitized public projection, and Super-Admin RBAC) locked.
- [x] Universal Menu (Mega-Menu & Drawer) & Configurable Quick-Category Bar (`headerNavLinks`) locked.
- [x] Brand taxonomy with optional product linking and zero-join denormalization locked.
- [x] Advanced Faceted Filter via URL SearchParams (zero extra collections) locked.
- [x] Instant Live Search engine with micro-payload `/api/search` locked.
- [x] Server-authoritative pricing (with Retail vs `MERCHANT` wholesale gate), coupon validation, & checkout `idempotencyKey` locked.
- [x] Unified Payment Adapter (`COD` + `SSLCommerz` primary + Manual MFS & Mobile SMS-Forwarder auto-verify webhook) & separate `paymentStatus` state machine locked.
- [x] 5-Role RBAC permission matrix (`USER` / `MERCHANT` / `MODERATOR` / `ADMIN` / `SUPER_ADMIN` exclusive `StoreConfig`), session hardening, & `AuditLog` triggers locked.
- [x] API DTO allowlists, rate limiting (including webhook HMAC verification), enforced CSP + HSTS headers, & guest tracking IDOR prevention locked.
- [x] Zero-latency SLA: mandatory `.select()` projections, `.lean()`, `Promise.all`, `loading.tsx` skeletons, `useLinkStatus`, mobile 2-col `384w` `<Image sizes>`, & `sin1` region co-location locked.
- [x] WCAG AA 4.5:1 contrast, heading order, ARIA label parity, & Incognito Lighthouse Launch Gate locked.
- [x] Admin Dashboard Performance & Anti-Over-Engineering rules (fixed shell + `{children}` `loading.tsx`, `useLinkStatus()`, URL SearchParams server pagination `limit <= 50`, list projections, `.aggregate()` KPIs, lazy-loaded tabs, & server-passed taxonomies) locked.

---

## 4. Change Request (CR) Governance & Log

> **Rule:** Step 1 (`Rules #1 – #23`) is frozen at Baseline `v1.0`. Do not modify prior rules directly without appending a formal CR entry below specifying Schema, API, and UI impact.

| CR ID | Date | Author / Approver | Summary of Scope Change | Impacted Rules / Steps | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **`CR-000`** | 2026-11-12 | Ashikur + Principal Spec Audit | Initial Production Baseline Lock (`Rules #1 – #23`, 7 Core + 4 Growth Collections, Unified Payment Adapter, 5-Role RBAC, Zero-Latency Storefront & Admin SLAs, WCAG AA & CSP). | Step 1 Baseline | 🔒 **LOCKED** |

👉 **Next Step:** `[ধাপ ২] Schema, Interface & Response Envelope Locked`
