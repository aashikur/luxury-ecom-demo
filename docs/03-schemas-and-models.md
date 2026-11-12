# 03. Database Schemas & Core Data Models

> **Status:** Tier 4 Historical MVP Study Note (`v1` — covers the initial 3 models). The v2 Production Architecture expands to **11 collections (7 Core + 4 Growth)**, 5 RBAC roles, Unified Payment Adapter (`COD` + `SSLCommerz` + SMS-webhook), & `idempotencyKey` — see [`docs/pipeline/01-scope-and-business-rules.md`](./pipeline/01-scope-and-business-rules.md) & [`docs/09-database-collection-architecture.md`](./09-database-collection-architecture.md).

## 1. What We Built
* **StoreConfig Model:** `src/models/StoreConfig.ts`
  * `branding`: Dynamic logo, theme colors, dark/light mode
  * `homeSections`: Shopify-style dynamic block builder array:
    * `HERO_BANNER`: `subtitle`, `title`, `description`, `buttonText`, `buttonLink`, `bannerImage`
    * `COLLECTION_SECTION`: `title`, `description`, `collectionSlug`, `buttonText`, `themeStyle ('LIGHT' | 'DARK_BAND')`
    * `PROMO_CTA_CARD`: `subtitle`, `title`, `description`, `buttonText`, `buttonLink`
  * `payment`: COD, Manual bKash/Nagad (Sender Phone + TrxID), Automated bKash PGW & SSLCommerz
  * `tracking`: Meta Pixel + CAPI token, GTM, GA4, TikTok Pixel
  * `features`: Master switchboard for feature gating
* **Product Model:** `src/models/Product.ts`
  * `collections`: Array of flexible tags (`["hoodies", "winter-drop", "featured"]`)
  * `variants`: Size-specific inventory (`S, M, L, XL, XXL`)
  * `sizeChart`: Chest, length, and sleeve measurements
  * `isPinned` & `priority`: Controlled catalog sorting without DB performance traps
* **Order Model:** `src/models/Order.ts`
  * Zero-login guest checkout with 11-digit BD phone validation
  * Supported payment methods: `COD`, `MANUAL_BKASH`, `MANUAL_NAGAD`, `BKASH_PGW`, `SSLCOMMERZ`
  * Full lifecycle order status with business rationale (`INCOMPLETE` to `DELIVERED`)

---

## 2. Page Architecture Pattern (Builder Engine vs Store Catalog)

1. **Page Pattern A: Builder Engine (`/` Homepage & Landing Pages)**  
   * Driven by dynamic DND sections (`homeSections`).
   * No hardcoded content; renders whatever blocks the admin configures.
2. **Page Pattern B: Master Store Catalog (`/shop` or `/products`)**  
   * Dedicated e-commerce catalog page.
   * Focuses on live filtering (by size S/M/L/XL, category, price range, and sorting).
3. **Page Pattern C: Product Detail Page (`/products/[slug]`)**  
   * 3:4 / 4:5 portrait media gallery, size boxes, instant COD checkout.

---

## 3. Order Lifecycle States (The Bangladesh E-Commerce Standard)

| Status | Business Meaning & Trigger |
| :--- | :--- |
| **`INCOMPLETE`** | **Abandoned Cart Lead:** Customer entered their 11-digit phone number but abandoned the page before clicking "Order". Telesales team calls to recover the sale. |
| **`PENDING`** | **New Order:** Customer clicked "Place Order". Awaiting merchant call/verification. |
| **`CONFIRMED`** | **Approved:** Merchant verified the order with the customer. Packed and ready for courier pickup. |
| **`SHIPPED`** | **In Transit:** Handed over to Steadfast/Pathao with an active tracking consignment ID. |
| **`DELIVERED`** | **Sale Complete:** Customer received the parcel and paid COD cash to the delivery agent. |
| **`CANCELLED`** | **Rejected/Cancelled:** Buyer declined or fraud check flagged as fake order. |
| **`RETURNED`** | **Failed Delivery:** Buyer rejected parcel at doorstep; courier is returning goods to warehouse. |

---

## 4. Key Concepts Checklist
* **ThemeStyle Banding:** `themeStyle: 'DARK_BAND'` allows dark high-contrast product sections on a light luxury storefront (as seen in luxury references).
* **Compound Indexing:** `ProductSchema.index({ isPinned: -1, priority: -1, createdAt: -1 })` gives blazing-fast sorting.
* **Hot-Reload Model Guard:** `mongoose.models.Product || mongoose.model(...)` prevents Next.js from throwing `OverwriteModelError`.

---

## 5. Official Docs & Sources
* 📖 [Mongoose Compound Indexes](https://mongoosejs.com/docs/guide.html#indexes)
* 📖 [Shopify Theme Architecture & Dynamic Sections](https://shopify.dev/docs/themes/architecture/sections)
