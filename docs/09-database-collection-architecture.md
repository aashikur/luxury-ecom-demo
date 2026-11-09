# 09 - Production Database Collection Architecture & Anti-Over-Engineering Spec

## 1. Architectural Philosophy for 1-Click Client Deployments

When building a production-grade, white-label e-commerce platform designed for rapid, 1-click per-client deployments (Clothing, Gadgets, Food, Multi-niche), the database architecture must strike a balance between:
- **Maximum Agility & Zero Complex Joins**: Utilizing MongoDB's embedded document capability for high-speed single-query reads.
- **Minimal Schema Migration Overhead**: Fewer top-level collections mean instant automated seeding, seamless backups, and hassle-free version upgrades across hundreds of client instances.
- **BD E-Commerce Realities**: Guest checkouts via phone number, courier return fraud protection, and automated abandoned-cart lead capturing.

---

## 2. Definitive Collection Specification (7 Core + 3 Growth)

### A. Core Collections (Required for Any Store Instance)

| # | Collection Name | Mongoose Model | Purpose & Embedding Strategy |
| :--- | :--- | :--- | :--- |
| **1** | `storeconfigs` | `StoreConfig` | **Single Document Singleton.** Stores store name, domain, theme tokens, header/footer nav menus, homepage drag-and-drop section layout blocks, courier credentials (Steadfast/Pathao), and payment gateway keys. Eliminates separate `Banner`, `Theme`, or `NavMenu` tables. |
| **2** | `categories` | `Category` | **Structural Taxonomy Tree.** Department -> Category -> Subcategory. Stores parent-child references, nested `ancestors[]` slugs, and image banners. |
| **3** | `collections` | `Collection` | **Marketing & Merchandising.** Seasonal drops (e.g. *Winter Drop 2026*), flash sales, featured home showcases. Separates marketing campaigns from permanent category trees. |
| **4** | `products` | `Product` | **Master Product Document.** Houses root pricing, inventory, SEO, plus embedded sub-documents: `variants[]` (multi-axis size × color matrix), `sizeChart[]`, `specifications[]`, and `modifierGroups[]`. Eliminates 4-5 relational join tables. |
| **5** | `orders` | `Order` | **Full Order Lifecycle.** Captures `INCOMPLETE` (abandoned checkout leads as soon as phone number is typed) up to `DELIVERED` and `RETURNED`. Embeds ordered item snapshots, customer address, and courier tracking data. |
| **6** | `users` | `User` | **Authentication & RBAC.** Admin dashboard access, call center moderator credentials, and optional customer accounts (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `CUSTOMER`). |
| **7** | `customers` | `Customer` | **Phone-Indexed Intelligence & Fraud Prevention.** In BD, 90%+ purchases are guest checkouts. Indexed by phone number to cache total orders, completed deliveries, return/cancellation ratio, and Courier Fraud Risk (`LOW`, `MEDIUM`, `BLACKLIST`). |

---

### B. Growth / Extension Collections (Scale When Needed)

| # | Collection Name | Mongoose Model | Purpose |
| :--- | :--- | :--- | :--- |
| **8** | `coupons` | `Coupon` | Promo codes, flat/percentage discounts, minimum spend conditions, usage quotas, and expiry dates. |
| **9** | `reviews` | `Review` | Customer feedback ratings, verified buyer badges, comments, and customer-uploaded fit photos. |
| **10** | `auditlogs` | `AuditLog` | Enterprise compliance and security trail (who edited product price, who canceled an order, who changed courier settings). |

---

## 3. Anti-Over-Engineering Proof: What NOT to Create

1. **NO Separate `Variants` Table:** Embedded in `Product.variants[]`. Gives atomic inventory updates without multi-table transactions or slow `$lookup` pipelines.
2. **NO Separate `HomeSlider` / `Banner` Table:** Embedded inside `StoreConfig.homeSections[]`. The entire storefront homepage loads in a single query.
3. **NO Database `Cart` / `Wishlist` Table:** Session carts live client-side in Zustand / LocalStorage for instantaneous, zero-latency UI interactions. Once the user enters checkout and provides a phone number, it converts directly into an `INCOMPLETE` lead in the `orders` collection.

---

## 4. 1-Click Deployment Checklist per Client

When spawning a new store instance for a client:
1. Copy template repository or branch.
2. Set `.env.local` (`MONGODB_URI`, `R2_ACCESS_KEYS`, `STORE_NAME`).
3. Seed default `StoreConfig` (theme colors + dummy banner) and default Admin `User`.
4. Deploy to Vercel / VPS with zero schema migration dependencies.
