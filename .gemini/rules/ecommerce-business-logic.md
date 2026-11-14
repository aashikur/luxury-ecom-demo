# E-Commerce Domain Logic & Bangladesh Localization Rules

> **AUTHORITY: MANDATORY FOR ALL AI AGENTS & ENGINEERS**  
> Every checkout flow, pricing calculation, order transition, and logistics integration in this codebase must strictly adhere to these business rules.

---

## 🇧🇩 Rule 1: Bangladeshi Guest-First Checkout (Zero-Friction Rule)

1. **The 3-Field Guest Form:**
   - Requiring password creation or account registration causes 70%+ drop-offs in Bangladesh.
   - Storefront checkout must require ONLY 3 core fields:
     1. **Full Name** (`string`, min 2 characters).
     2. **Mobile Number** (`string`, strictly validated against BD regex: `/^01[3-9]\d{8}$/`).
     3. **Delivery Address** (`string`, District + Thana/Area + House/Street).
2. **Customer Identity Standard:**
   - Customers are indexed by their **11-digit mobile number** (e.g., `017XXXXXXXX`).
   - Normalization standard: Always strip spaces, dashes, and international prefix `+88` / `88` before storing or querying.
   - Customers have zero mandatory password requirements.

---

## 🚚 Rule 2: 3-Zone Bangladesh Delivery Logistics & Thresholds

1. **Standard 3-Zone Hierarchy:**
   - **Zone 1: Inside Dhaka (`INSIDE_DHAKA`):** Default ৳70 (Next-day delivery).
   - **Zone 2: Dhaka Suburbs (`DHAKA_SUBURBS`):** Default ৳100 (Savar, Gazipur, Keraniganj, Narayanganj).
   - **Zone 3: Outside Dhaka (`OUTSIDE_DHAKA`):** Default ৳130 (All other 63 districts nationwide via Steadfast Courier).
2. **Dynamic Store Configuration:**
   - Delivery fees must NEVER be hardcoded into UI components.
   - Fees are resolved dynamically from `StoreConfig.logistics` (`insideDhakaFee`, `suburbsDhakaFee`, `outsideDhakaFee`).
3. **Free Shipping Tier:**
   - If `order.subtotal >= config.logistics.freeShippingThreshold` (default ৳2500), `deliveryFee` is automatically set to `0`.

---

## 💰 Rule 3: Zero-Trust Server-Authoritative Pricing

1. **The Vulnerability:** Malicious users modifying client-side JavaScript or sending forged POST requests with `unitPrice: 1` or `totalAmount: 10`.
2. **The Strict Rule:**
   - The server **NEVER** trusts client-submitted prices (`unitPrice`, `discountPrice`, `totalAmount`).
   - The backend `createOrder` domain service resolves the true price of every item directly from the MongoDB `Product` record in server memory.
   - Pricing Resolution Priority:
     `variant.discountPrice ?? variant.price ?? product.discountPrice ?? product.basePrice`
   - Total amount is computed strictly on the server: `subtotal + deliveryFee - couponDiscount`.

---

## 📦 Rule 4: Atomic Conditional Stock Decrement & Automatic Rollback

1. **Concurrency Protection:**
   - Prevents overselling when two shoppers checkout the last remaining item at the exact same millisecond.
2. **Strict `$gte` Conditional Lock:**
   - Stock decrements **MUST** include an atomic condition checking that current stock is greater than or equal to requested quantity:
     ```typescript
     // For variant products:
     await Product.updateOne(
       { _id: item.productId, 'variants._id': item.variantId, 'variants.stock': { $gte: qty } },
       { $inc: { 'variants.$.stock': -qty, totalStock: -qty } }
     );
     // For regular products:
     await Product.updateOne(
       { _id: item.productId, totalStock: { $gte: qty } },
       { $inc: { totalStock: -qty } }
     );
     ```
3. **Atomic Rollback on Partial Failures:**
   - If a multi-item order fails halfway through (item 1 succeeds, but item 2 is out of stock), the service **MUST** immediately roll back all previously deducted items before returning `409 OUT_OF_STOCK`.
4. **Restoration on Cancellation:**
   - If an order's status changes to `CANCELLED` or `RETURNED`, deducted inventory must be atomically restored (`$inc: +qty`) back to the catalog.

---

## 🔄 Rule 5: Order State Machine & Lifecycle Transitions

```
[Lead in Checkout] ──► INCOMPLETE (Saved on phone blur; abandoned lead capture)
                            │
                            ▼ [Customer clicks Confirm Order]
                         PENDING (Stock atomically reserved; unverified COD)
                            │
                            ├──────────────────────────┐
                            ▼                          ▼
                        CONFIRMED                  CANCELLED (Stock restored)
                            │
                            ▼
                        PROCESSING (Packed & ready for dispatch)
                            │
                            ▼
                         SHIPPED (Steadfast Consignment ID created)
                            │
                            ├──────────────────────────┐
                            ▼                          ▼
                        DELIVERED                  RETURNED (Stock restored)
```

---

## 🚚 Rule 6: Steadfast Courier Integration & Sandbox Fallback

1. **Default Courier:** Integrated with **Steadfast Courier API**.
2. **1-Click Consignment Creation:**
   - Admin clicks `Dispatch` on `/admin/orders`.
   - Backend calls Steadfast `POST /api/v1/create_order` with recipient name, phone, address, and COD amount.
3. **Resilient Sandbox Simulation:**
   - In development environments or when API keys are not yet configured, the system **MUST NOT** fail with network errors.
   - It automatically simulates a sandbox consignment (`SF-XXXXXX` / `TRK-XXXXXX`), sets the status to `in_review`, and transitions the order to `SHIPPED`.
4. **Cash on Delivery (COD) Rules:**
   - If `order.payment.status === 'PAID'`, COD amount sent to courier is strictly `0`.
   - Otherwise, COD amount equals `order.totalAmount`.

---

## 🚫 Rule 7: Anti-Over-Engineering Collection Boundaries

To maintain high throughput and low database complexity, the following separate tables/collections are **STRICTLY PROHIBITED**:
- ❌ **NO `Variants` Table:** Variants live embedded inside `Product.variants[]`.
- ❌ **NO `HomeBanner` Table:** Banners live embedded inside `StoreConfig.homeSections[]`.
- ❌ **NO `Cart` Table in MongoDB:** Session carts live client-side in Zustand + LocalStorage.
- ❌ **NO `NavbarMenu` Table:** Menu links live in `StoreConfig.headerNavLinks[]` + `Category` tree.
- ❌ **NO External Search Cluster (Elastic/Algolia):** Instant search runs via micro-payload against MongoDB compound indexes with sub-40ms response.
