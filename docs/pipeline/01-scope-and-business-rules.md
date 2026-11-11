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

### Rule #1: Bangladeshi Guest-First Checkout (No Signup / No Password)
- **Problem:** Requiring password creation or email verification causes 70%+ checkout abandonment in Bangladesh.
- **Rule:** The storefront checkout MUST be a **3-field Slide-Over Drawer**:
  1. Full Name (`string`, min 2 chars)
  2. Mobile Phone Number (`string`, strictly validated against BD regex: `/^01[3-9]\d{8}$/`)
  3. Full Delivery Address (`string`, District + Thana/Area + House/Street details)
- **Customer Account:** Customers are NEVER required to create a password. Their identity is indexed solely by their 11-digit phone number.

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

### Rule #4: Courier Auto-Booking & Return Fraud Prevention
- **Default Courier:** Integrated with **Steadfast Courier API**.
- **Fraud Score Shield:**
  - On checkout, system checks the customer's phone number against courier delivery history.
  - **Success Rate $\ge$ 80%:** Green Badge (Safe for 100% COD).
  - **Success Rate 50% – 79%:** Yellow Badge (Phone confirmation required).
  - **Success Rate < 50% OR $\ge 2$ Prior Returns:** Red Alert (Requires ৳130–150 advance delivery charge via bKash before dispatch).
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

## 3. Step 1 Sign-Off Checklist

- [x] Top-level collections strictly capped at 7 Core + 3 Growth.
- [x] Prohibited anti-over-engineered tables documented.
- [x] 3-Field guest checkout with 11-digit BD phone regex locked.
- [x] Abandoned lead capture (`INCOMPLETE`) and state machine transitions locked.
- [x] Atomic `$inc` inventory check locked against overselling.
- [x] Steadfast courier auto-booking and fraud score thresholds locked.
- [x] Multi-niche and single-product funnel rules codified.
- [x] Zero-egress Cloudflare R2 media lifecycle and Next.js 16 cache invalidation locked.

👉 **Next Step:** `[ধাপ ২] Schema, Interface & Response Envelope Locked`
