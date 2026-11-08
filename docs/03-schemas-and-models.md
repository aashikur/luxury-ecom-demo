# 03. Database Schemas & Core Data Models

## 1. What We Built
* **StoreConfig Model:** `src/models/StoreConfig.ts`
  * `branding`: Dynamic logo, theme colors, dark/light mode
  * `homeSections`: Shopify-style reorderable array for homepage sections
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
  * Full lifecycle order status with business rationale

---

## 2. Order Lifecycle States (The Bangladesh E-Commerce Standard)

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

## 3. Key Concepts Checklist
* **Compound Indexing:** `ProductSchema.index({ isPinned: -1, priority: -1, createdAt: -1 })` gives blazing-fast sorting.
* **Single Source of Truth:** `StoreConfig` is a singleton document that drives the storefront without code redeployments.
* **Hot-Reload Model Guard:** `mongoose.models.Product || mongoose.model(...)` prevents Next.js from throwing `OverwriteModelError`.

---

## 4. Official Docs & Sources
* 📖 [Mongoose Compound Indexes](https://mongoosejs.com/docs/guide.html#indexes)
* 📖 [SSLCommerz Integration Docs](https://developer.sslcommerz.com/)
