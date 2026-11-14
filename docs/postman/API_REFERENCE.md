# 🚀 Backend API Reference & Postman Documentation

> **Base URL (Local):** `http://localhost:3000`  
> **Authoritative Contract:** Aligned with [`docs/pipeline/01-scope-and-business-rules.md`](../pipeline/01-scope-and-business-rules.md) (`CR-000` Baseline).  
> **Standard Envelope (v2 Lock):** `{ success: boolean, data?: T, error?: string, code?: string }`

---

## 1. System Health & Infrastructure

### `GET /api/health`
* **Consumer / Who uses it:** DevOps, UptimeRobot, Serverless Health Monitors, Developers.
* **Purpose:** Verifies that MongoDB Atlas, Cloudinary SDK, and Cloudflare R2 bucket are live (`force-dynamic`).
* **Success Response (`200 OK`):** Status `healthy` with readyStateCode `1`.

---

## 2. Media Upload Pipeline (Cloudflare R2)

### `POST /api/upload`
* **Consumer / Who uses it:** Admin Product Manager, Admin Banner Manager (`ADMIN` / `SUPER_ADMIN` RBAC + rate limit + magic-byte & size validation).
* **Request:** `multipart/form-data` with `file`
* **Success Response (`201 Created`):** Returns `{ url, key }`.

### `DELETE /api/upload?key=<asset_key>`
* **Consumer / Who uses it:** Admin Product Manager (cleaning up removed images; `ADMIN` / `SUPER_ADMIN` RBAC).

---

## 3. Store Configuration & Dynamic Theme

### `GET /api/config`
* **Consumer / Who uses it:** Storefront (`getPublicStoreConfig()`), Admin Settings Dashboard.
* **Security & Projection Rule:** Public callers MUST receive a sanitized projection stripping all server secrets (`courier.steadfast`, `courier.pathao`, `payment.bkashPGW`, `payment.sslCommerz`, `metaCapiToken`, `tiktokEventsApiToken`). Raw/masked admin editing view requires `SUPER_ADMIN` session.
* **Success Response (`200 OK`):** Returns active `StoreConfig`. Auto-seeds on fresh DB.

### `PUT /api/config`
* **Consumer / Who uses it:** **`SUPER_ADMIN` ONLY** (Rule #19; writes `AuditLog`, encrypts secrets via AES-256-GCM at rest).
* **Cache Revalidation:** Triggers `revalidateTag('store-config')` + `revalidatePath` for `'/'` (`layout`), `'/shop'`, `'/admin'`, and `'/admin/settings'`.

---

## 4. Products & Catalog Engine

### `GET /api/products`
* **Consumer / Who uses it:** Storefront Catalog, Homepage Sections, Admin Products Table (`limit <= 50` hard cap, `.lean()` + `.select()` projection).
* **Query Parameters:** `?collection=...`, `?category=...`, `?brand=...`, `?limit=20` (max `50`), `?page=1`, `?all=true` (admin-only)

### `POST /api/products`
* **Consumer / Who uses it:** Admin Product Creation Form (`ADMIN` / `SUPER_ADMIN`).
* **Cache Revalidation:** Triggers `revalidateTag('products')` + `revalidatePath` for `'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, and `'/products/:slug'`.

### `GET /api/products/:slug`
* **Consumer / Who uses it:** Customer Product Detail Page (`/products/[slug]`).

### `PUT /api/products/:slug`
* **Consumer / Who uses it:** Admin Product Edit Form & Inline Stock Stepper (`ADMIN` / `SUPER_ADMIN`; price/stock edits write `AuditLog`).
* **Cache Revalidation:** Triggers `revalidateTag('products')` + `revalidatePath` for `'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, `'/admin/products/:id'`, and `'/products/:slug'`.

### `DELETE /api/products/:slug`
* **Consumer / Who uses it:** Admin Product Table (`ADMIN` / `SUPER_ADMIN`; writes `AuditLog`).
* **Cache Revalidation:** Triggers `revalidateTag('products')` + `revalidatePath` for catalog routes and cascades Cloudflare R2 asset deletion.

---

## 5. Taxonomy & Collection Engine (Dynamic Categories & Marketing Drops)

### `GET /api/categories`
* **Consumer:** Storefront Navigation Menu, Shop Filter Accordion, Admin Cascading Selectors.
* **Query Parameters:**
  * `?tree=true`: Returns hierarchical nested tree (`ICategoryTreeNode[]` with `.children`).
  * `?featured=true`: Returns categories flagged with `isFeaturedHome: true` for the homepage.
  * `?parentId=<id|null>`: Returns direct child categories of a given parent.
* **Success Response (`200 OK`):** `{ success: true, count: number, data: ICategory[] | ICategoryTreeNode[] }`

### `POST /api/categories`
* **Consumer:** Admin Category Manager & In-line Quick Add Modal.
* **Payload:** `{ name: string, parentId?: string, description?: string, image?: { url, key }, isFeaturedHome?: boolean, displayOrder?: number }`
* **Behavior:** Auto-generates unique `slug`, computes `level` (parent.level + 1), and derives `ancestors` array.

### `PUT /api/categories`
* **Consumer:** Admin Category Manager.
* **Payload:** `{ id: string, name?: string, parentId?: string, ... }`
* **Safeguard:** Circular hierarchy protection (blocks setting a descendant or self as parent).

### `DELETE /api/categories?id=<id>`
* **Consumer:** Admin Category Manager.
* **Safeguards:** 
  * Aborts with `400` if child subcategories exist under it.
  * Aborts with `400` if active products are assigned to this category.

### `GET /api/collections`
* **Consumer:** Storefront Homepage Campaign Sliders, Shop Filter Drawer, Admin Product Form.
* **Query Parameters:** `?featured=true` for homepage drops.

### `POST /api/collections`
* **Consumer:** Admin Marketing Manager.
* **Payload:** `{ title: string, badgeText?: string, bannerImage?: { url, key }, isFeaturedHome?: boolean, startDate?: Date, endDate?: Date }`

### `DELETE /api/collections?id=<id>`
* **Consumer:** Admin Marketing Manager.
* **Behavior:** Deletes collection and unlinks collection slug from all associated products.

---

## 6. Orders & Bangladesh 1-Page Checkout

### `POST /api/orders`
* **Consumer / Who uses it:** Customer Cart Drawer / Checkout Page (`USER` guest or registered; rate-limited by IP + BD phone).
* **Purpose:** Places order with strict **Server-Authoritative Pricing** (Rule #17 — client NEVER sends `unitPrice` or `totalAmount`), checkout `idempotencyKey`, 3-zone delivery tariffs (`INSIDE_DHAKA | DHAKA_SUBURBS | OUTSIDE_DHAKA`), and dual atomic conditional `$inc` stock deduction (Rule #3).
* **Request:**
  * Content-Type: `application/json`
  * Body:
    ```json
    {
      "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
      "customer": {
        "name": "Ashik Rahaman",
        "phone": "01700000000",
        "address": "House 12, Road 4, Banani, Dhaka",
        "deliveryZone": "INSIDE_DHAKA",
        "note": "Please call before arrival"
      },
      "items": [
        {
          "productId": "6af0eb83e36767103e4d54aa",
          "variantId": "6af0eb83e36767103e4d54ab",
          "modifierLabels": [],
          "quantity": 1
        }
      ],
      "couponCode": "",
      "paymentMethod": "COD"
    }
    ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Order placed successfully!",
    "data": {
      "_id": "6af0f4...",
      "orderNumber": "ORD-54812",
      "customer": { ... },
      "financials": {
        "subtotal": 1450,
        "deliveryFee": 70,
        "discount": 0,
        "totalAmount": 1520
      },
      "payment": { "method": "COD", "status": "UNPAID" },
      "inventoryState": "DEDUCTED",
      "status": "PENDING"
    }
  }
  ```
* **Error Responses:** `400 VALIDATION_ERROR` | `409 OUT_OF_STOCK` | `429 RATE_LIMITED`

---

### `GET /api/orders`
* **Consumer / Who uses it:** Admin Order Management Dashboard (`MODERATOR` / `ADMIN` / `SUPER_ADMIN` RBAC required).
* **Purpose:** Queries orders with status filter (`INCOMPLETE`, `PENDING`, `CONFIRMED`, `SHIPPED`, etc.), strict `.select()` list projection, `.lean()`, and bounded pagination (`limit <= 50` hard cap).
* **Query Parameters:** `?status=PENDING&page=1&limit=20&q=...`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [ ... ],
    "pagination": { "total": 1, "page": 1, "pages": 1, "limit": 20 }
  }
  ```

---

### `POST /api/courier/dispatch`
* **Consumer / Who uses it:** Admin Orders Table (`ADMIN` / `SUPER_ADMIN` / `MODERATOR`).
* **Purpose:** 1-Click order dispatch to Steadfast Courier. Creates a live consignment via Steadfast API or automatic sandbox fallback, populates consignment ID and tracking code on the order, advances order status to `SHIPPED`, and revalidates `/admin/orders`.
* **Request:**
  ```json
  {
    "orderId": "6af0f4...",
    "orderNumber": "AUR-54812",
    "operator": "ADMIN"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "consignmentId": "SF-482910",
      "trackingCode": "TRK-98124501",
      "provider": "STEADFAST",
      "status": "in_review"
    },
    "message": "Order successfully booked with STEADFAST. Tracking: TRK-98124501"
  }
  ```

---

## 7. Authentication & Staff Session Engine (Better Auth)

### `ALL /api/auth/[...all]`
* **Consumer / Who uses it:** Staff, Admin Dashboard, Customer Phone OTP / Social Login.
* **Engine:** Better Auth with MongoDB native adapter, Email & Password, Phone Number OTP plugin, and Admin RBAC plugin.
* **Core Endpoints Handled:**
  - `POST /api/auth/sign-in/email`: Staff/Admin email & password authentication.
  - `POST /api/auth/sign-out`: Session termination and cookie revocation.
  - `GET /api/auth/get-session`: Edge/Server session verification returning `{ user, session }`.
  - `POST /api/auth/phone-number/send-otp`: Sends 4-6 digit SMS OTP to 11-digit BD phone numbers.
  - `POST /api/auth/phone-number/verify`: Verifies customer OTP and issues authenticated session cookie.
* **Session Cookies:** `better-auth.session_token` (`HttpOnly`, `SameSite=Lax`, `Secure` in production).

---

## 8. v2 Target Endpoints Locked in Step 1 Scope (Upcoming in Step 4)

| Endpoint | Consumer / Auth | Purpose (Scope Rule Reference) |
| :--- | :--- | :--- |
| `GET /api/search?q=...` | Public Storefront (Rate-Limited) | Sub-40ms micro-payload auto-suggest returning top 6 items (`Rule #16`). |
| `POST /api/orders/lead` | Public Checkout Drawer | Silent `INCOMPLETE` abandoned-cart lead capture on BD phone blur (`Rule #2`). |
| `GET /api/orders/track` | Public Guest (`orderNumber` + last 4 digits phone) | IDOR-safe guest order status & courier tracking (`Rule #20`). |
| `POST /api/webhooks/sslcommerz/ipn` | Server-to-Server IPN | Validates `val_id`, `tran_id`, `amount`, `currency === 'BDT'` -> marks `PAID` (`Rule #18`). |
| `POST /api/webhooks/sms-payment` | Mobile SMS-Forwarder (HMAC + Rate-Limit) | Matches incoming bKash/Nagad/Rocket SMS `(trxId, amount)` -> auto-verifies `PAID` (`Rule #18`). |
| `POST /api/coupons/validate` | Public Checkout (Rate-Limited) | Validates active coupon, minSpend, expiry, & `perPhoneLimit` (`Rule #17`). |
| `PUT /api/categories/reorder` | `ADMIN` / `SUPER_ADMIN` | Single-trip `bulkWrite` sibling reorder (`Rule #8`). |
| `POST /api/auth/login` & `/logout` | Staff / Registered `USER` / `MERCHANT` | Password auth (`Argon2id`/`bcrypt`), `HttpOnly` cookie + `sessionVersion` (`Rule #19`). |
