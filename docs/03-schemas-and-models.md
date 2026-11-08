# 03. Database Schemas & Core Data Models

## 1. What We Built
* **StoreConfig Model:** `src/models/StoreConfig.ts`
  * `branding`: Dynamic logo, theme colors, dark/light mode
  * `homeSections`: Shopify-style reorderable array for homepage sections
  * `payment`: COD, Manual bKash/Nagad (Sender Phone + TrxID), Automated PGW
  * `tracking`: Meta Pixel + CAPI token, GTM, GA4, TikTok Pixel
  * `features`: Master switchboard for feature gating
* **Product Model:** `src/models/Product.ts`
  * `collections`: Array of flexible tags (`["hoodies", "winter-drop", "featured"]`)
  * `variants`: Size-specific inventory (`S, M, L, XL, XXL`)
  * `sizeChart`: Chest, length, and sleeve measurements
  * `isPinned` & `priority`: Controlled catalog sorting without DB performance traps
* **Order Model:** `src/models/Order.ts`
  * Zero-login guest checkout with 11-digit BD phone validation
  * `INCOMPLETE` state for auto-capturing abandoned cart leads
  * Manual MFS verification (`senderPhone`, `trxId`)
  * Courier tracking payload (`consignmentId`, `trackingCode`)

---

## 2. Why We Built It (Senior Interview Concepts)
* **Shopify-Style Dynamic Sections (`homeSections`):**  
  Hardcoding the homepage layout means developers must push code changes whenever marketing wants a new banner or category slider. An array of `{ type, title, collectionSlug, order }` allows the admin to reorder (DND) sections without code edits.
* **Collections vs Rigid Booleans:**  
  Instead of adding a new boolean (`isFeatured`, `isWinterSale`, `isFlashDeal`) every time marketing has an idea, a single `collections: [String]` array allows unlimited grouping with clean MongoDB queries (`Product.find({ collections: 'flash-sale' })`).
* **The Product Reordering Trap:**  
  Dragging products in a large table requires rewriting 50+ DB indexes per drag. Using `isPinned` and `priority` gives instant control with zero performance penalty.

---

## 3. Key Concepts Checklist
* **Compound Indexing:** `ProductSchema.index({ isPinned: -1, priority: -1, createdAt: -1 })` gives blazing-fast sorting.
* **Single Source of Truth:** `StoreConfig` is a singleton document that drives the storefront without code redeployments.
* **Hot-Reload Model Guard:** `mongoose.models.Product || mongoose.model(...)` prevents Next.js from throwing `OverwriteModelError`.

---

## 4. Official Docs & Sources
* 📖 [Mongoose Compound Indexes](https://mongoosejs.com/docs/guide.html#indexes)
* 📖 [Shopify Theme Architecture & Dynamic Sections](https://shopify.dev/docs/themes/architecture/sections)
