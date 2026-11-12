# 09 - Production Database Collection Architecture & Anti-Over-Engineering Spec

## 1. Architectural Philosophy for 1-Click Client Deployments

When building a production-grade, white-label e-commerce platform designed for rapid, 1-click per-client deployments (Clothing, Gadgets, Food, Multi-niche), the database architecture must strike a balance between:
- **Maximum Agility & Zero Complex Joins**: Utilizing MongoDB's embedded document capability for high-speed single-query reads.
- **Minimal Schema Migration Overhead**: Fewer top-level collections mean instant automated seeding, seamless backups, and hassle-free version upgrades across hundreds of client instances.
- **BD E-Commerce Realities**: Guest checkouts via phone number, courier return fraud protection, and automated abandoned-cart lead capturing.

---

## 2. Definitive Collection Specification (7 Core + 4 Growth — 11 Total)

### A. Core Collections (Required for Any Store Instance)

| # | Collection Name | Mongoose Model | Purpose & Embedding Strategy |
| :--- | :--- | :--- | :--- |
| **1** | `storeconfigs` | `StoreConfig` | **Single Document Singleton.** Stores store name, domain, theme tokens, `headerNavLinks[]` quick-category bar, homepage drag-and-drop `homeSections[]` layout blocks, 3-zone Bangladesh logistics, courier credentials, payment gateway keys, and feature flags. |
| **2** | `categories` | `Category` | **Structural Taxonomy Tree.** Department -> Category -> Subcategory. Stores parent-child references, nested `ancestors[]` slugs, local sibling `displayOrder`, and image banners. |
| **3** | `collections` | `Collection` | **Marketing & Merchandising.** Seasonal drops (e.g. *Winter Drop 2026*), flash sales, featured home showcases. Separates marketing campaigns from permanent category trees. |
| **4** | `products` | `Product` | **Master Product Document.** Houses root retail & optional `MERCHANT` wholesale pricing, inventory, SEO, optional `Brand` denormalization (`brandId`, `brandName`, `brandSlug`), plus embedded sub-documents: `variants[]` (multi-axis size × color matrix), `sizeChart[]`, `specifications[]`, and `modifierGroups[]`. Eliminates 4-5 relational join tables. |
| **5** | `orders` | `Order` | **Full Order Lifecycle.** Captures `INCOMPLETE` (abandoned checkout leads on phone blur) up to `DELIVERED` and `RETURNED`, with decoupled `payment.status` (`UNPAID` / `PENDING_VERIFICATION` / `PAID` / `FAILED` / `REFUNDED`), `inventoryState` (`NONE` / `DEDUCTED` / `RESTORED`), `idempotencyKey` unique sparse index, 3-zone delivery, and immutable purchased item snapshots. |
| **6** | `users` | `User` | **Authentication & 5-Role RBAC.** Supports `SUPER_ADMIN` (exclusive `StoreConfig` + secrets), `ADMIN` (store owner), `MODERATOR` (limited future staff), `MERCHANT` (future B2B wholesale buyer), and `USER` (registered retail buyer). Includes `sessionVersion` for instant token revocation. |
| **7** | `customers` | `Customer` | **Phone-Indexed Intelligence & Fraud Prevention.** In BD, 90%+ purchases are guest checkouts. Indexed by 11-digit BD phone number to cache total orders, completed deliveries, return/cancellation ratio, and Courier Fraud Risk (`LOW`, `MEDIUM`, `BLACKLIST`). |

---

### B. Growth / Extension & Taxonomy Collections (Scale When Needed)

| # | Collection Name | Mongoose Model | Purpose |
| :--- | :--- | :--- | :--- |
| **8** | `brands` | `Brand` | **Multi-Niche Brand Entities.** Apple, Samsung, Sony, Aurem, etc. Stores brand logo, slug, description, website, and active status. Linked optionally in `Product` with denormalized name/slug for zero-join catalog filtering. |
| **9** | `coupons` | `Coupon` | Promo codes, flat/percentage discounts, minimum spend conditions, usage quotas, and expiry dates. |
| **10** | `reviews` | `Review` | Customer feedback ratings, verified buyer badges, comments, and customer-uploaded fit photos. |
| **11** | `auditlogs` | `AuditLog` | Enterprise compliance and security trail (who edited product price, who canceled an order, who changed courier settings). |

---

## 3. Anti-Over-Engineering Proof: What NOT to Create

1. **NO Separate `Variants` Table:** Embedded in `Product.variants[]`. Gives atomic inventory updates without multi-table transactions or slow `$lookup` pipelines.
2. **NO Separate `HomeSlider` / `Banner` Table:** Embedded inside `StoreConfig.homeSections[]`. The entire storefront homepage loads in a single query.
3. **NO Separate `NavbarMenu` Table:** Embedded in `StoreConfig.headerNavLinks[]` + dynamic `Category` tree.
4. **NO Separate `Filters` Table:** Dynamically derived from existing `Product` fields (`basePrice`, `inStock`, `brandSlug`, `variants.size`, `variants.colorName`). Zero desync risk.
5. **NO External Search Cluster (Elastic/Algolia):** Sub-40ms live auto-suggest runs on dedicated micro-payload `/api/search` directly using MongoDB text and compound indexes.
6. **NO Database `Cart` / `Wishlist` Table:** Session carts live client-side in Zustand / LocalStorage for instantaneous, zero-latency UI interactions. Once the user enters checkout and provides a phone number, it converts directly into an `INCOMPLETE` lead in the `orders` collection.

---

## 4. 1-Click Deployment Checklist per Client

When spawning a new store instance for a client:
1. Copy template repository or branch.
2. Set `.env.local` (`MONGODB_URI`, `R2_ACCESS_KEYS`, `STORE_NAME`).
3. Seed default `StoreConfig` (theme colors + dummy banner) and default Admin `User`.
4. Deploy to Vercel / VPS with zero schema migration dependencies.
