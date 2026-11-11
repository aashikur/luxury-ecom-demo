# [ধাপ ১] Scope & Business Rules Locked — Master Specification

> **Phase Status:** 🔒 **LOCKED & AUTHORITATIVE**  
> **Master Pipeline Stage:** Step 1 of 7  
> **Target:** Multi-Niche 1-Click Client Deployment & 500 Orders/Day Scalability  
> **Rule of Engagement:** Any subsequent schema, backend code, or frontend UI that violates these rules must be rejected.

---

## 🗺️ The 7-Step Senior Master Pipeline

```
[ধাপ ১] Scope & Business Rules Locked (THIS DOCUMENT)
  │      - 7 Core Collections + 3 Growth Collections Boundaries
  │      - Bangladeshi Guest-First Checkout & Incomplete Lead Rules
  │      - Concurrency & Atomic Inventory Rules
  │      - Courier Return Fraud & State Transition Rules
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
6. **`User` (`users`)**: Admin and call-center staff accounts with Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`).
7. **`Customer` (`customers`)**: Phone-number-indexed customer profiles caching total order history, completed delivery count, and courier fraud risk.

### B. The 3 Growth Collections (Scaled on Demand)
8. **`Coupon` (`coupons`)**: Discount vouchers, minimum spend limits, expiry dates, and usage limits.
9. **`Review` (`reviews`)**: Verified customer ratings, text reviews, and uploaded photos.
10. **`AuditLog` (`auditlogs`)**: Sensitive admin action tracking (who approved order, who updated prices).

### C. Prohibited Collections (Anti-Over-Engineering)
- ❌ **NO `Variants` Table:** Embedded in `Product.variants[]` for atomic updates and zero `$lookup` joins.
- ❌ **NO `HomeBanner` Table:** Embedded in `StoreConfig.homeSections[]` (entire homepage loads in 1 query).
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

- **Order State Machine Constraints:**
  - `INCOMPLETE`: Generated on phone input blur. Does NOT deduct stock.
  - `PENDING`: User clicked "Confirm Order". Deducts inventory atomically.
  - `CONFIRMED`: Staff verified order via call or auto-rules.
  - `SHIPPED`: Courier tracking number generated. Order items CANNOT be edited once shipped.
  - `DELIVERED`: Terminal state. Marks order fulfilled and updates customer delivery success count.
  - `CANCELLED` / `RETURNED`: **Automatically restores product variant stock** and increments customer return ratio.

---

### Rule #3: Zero Overselling & Atomic Concurrency
- **Problem:** During flash sales (e.g. 10 users buying the last 2 hoodies simultaneously), non-atomic checks create negative stock (`-3`).
- **Rule:** Stock deductions MUST use MongoDB atomic operators with a conditional predicate:
  ```ts
  Product.findOneAndUpdate(
    { 
      _id: productId, 
      'variants._id': variantId, 
      'variants.stock': { $gte: qty } // STRICT CONDITION
    },
    { 
      $inc: { 
        'variants.$.stock': -qty, 
        totalStock: -qty 
      } 
    }
  );
  ```
- **Invariant:** If the query returns `null`, the transaction fails immediately and returns:
  `{ success: false, error: "Selected item is out of stock", code: "OUT_OF_STOCK" }`.

---

### Rule #4: Courier Auto-Booking, Return Fraud Shield & Advance Delivery Fee Protection
- **Default Courier:** Integrated with **Steadfast Courier API** (with secondary support for Pathao and RedX).
- **Fraud Score Shield & Alert Threshold:**
  - On checkout/admin order view, system checks the customer's phone number against courier delivery history.
  - **Configurable Alert Threshold (Default: < 60%):** Flags orders where historical delivery success rate is below this threshold with a prominent **High Risk** warning.
  - **Auto-Hold High Risk Orders:** Optional switch to hold flagged orders for phone verification before dispatching.
- **Advance Delivery Charge Protection (Optional Toggle & Configurable Amount):**
  - **Toggleable (`advancePayment.enabled` / `features.advanceDeliveryFeeEnabled`):** Merchants can turn advance delivery fee collection ON or OFF anytime.
  - **Configurable Amount (`advancePayment.amount`):** Default `৳130` (customizable e.g. ৳100, ৳130, ৳150).
  - **Scope:** Can be set for *Outside Dhaka Only* or *All Orders*.
  - **Payment Wallets:** Supports bKash, Nagad, or Rocket with custom instruction notes.
- **1-Click Bulk Dispatch:** Admin can select multiple `CONFIRMED` orders and dispatch to Steadfast in a single batch API call, auto-generating 4×6 inch thermal shipping labels.

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

### Rule #7: Next.js 16 Zero-Stale Cache Invalidation Contract
- **Admin & Store Catalog Routes:**
  ```ts
  export const dynamic = 'force-dynamic';
  export const revalidate = 0;
  ```
- **Mutation Handlers (`POST`, `PUT`, `DELETE`):**
  Must call `revalidatePath` on `'/'`, `'/shop'`, `'/admin/products'`, and `'/products/[slug]'` so Vercel Edge CDN never serves stale static build caches to visitors.

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

## 3. Step 1 Sign-Off Checklist

- [x] Top-level collections strictly capped at 7 Core + 3 Growth.
- [x] Prohibited anti-over-engineered tables documented.
- [x] 3-Field guest checkout with 11-digit BD phone regex & Smart Drawer toggle locked.
- [x] Abandoned lead capture (`INCOMPLETE`) and state machine transitions locked.
- [x] Atomic `$inc` inventory check locked against overselling.
- [x] Steadfast courier auto-booking, configurable fraud alert (<60%), and optional advance delivery fee locked.
- [x] Multi-niche and single-product funnel rules codified.
- [x] Zero-egress Cloudflare R2 media lifecycle and Next.js 16 cache invalidation locked.
- [x] Category (3-level tree) vs Collection (promotions) relationship locked.
- [x] Slug-centric flat URL architecture (`/category/[slug]`, `/products/[slug]`) locked.
- [x] Modular homepage section engine (wideFull/wideBox, smart banner, dual-source products) locked.
- [x] Unified analytics wrapper with dual CAPI deduplication, GTM dataLayer, and BD phone hashing locked.
- [x] 3-Layer Credential Security Shield (AES-256 field-level encryption, sanitized public projection, and Super-Admin RBAC) locked.

👉 **Next Step:** `[ধাপ ২] Schema, Interface & Response Envelope Locked`
