# 🚀 Backend API Reference & Postman Documentation

> **Base URL (Local):** `http://localhost:3000`  
> **Production Base URL:** `https://aurum-lexury582.vercel.app`  
> **Authoritative Contract:** Aligned with [`docs/pipeline/01-scope-and-business-rules.md`](../pipeline/01-scope-and-business-rules.md) and [`02-schema-interface-and-response-envelope.md`](../pipeline/02-schema-interface-and-response-envelope.md).  
> **Universal Standard Envelope:**
> ```json
> {
>   "success": true,
>   "data": { ... },
>   "pagination": { "total": 100, "page": 1, "pages": 5, "limit": 20, "hasNextPage": true, "hasPrevPage": false },
>   "message": "Optional feedback"
> }
> ```
> **Error Contract:**
> ```json
> {
>   "success": false,
>   "error": "Descriptive human-readable error string",
>   "code": "VALIDATION_ERROR | OUT_OF_STOCK | NOT_FOUND | COUPON_INVALID | UNAUTHORIZED | INTERNAL_ERROR"
> }
> ```

---

## 1. System Health & Infrastructure

### `GET /api/health`
* **Consumer:** DevOps, UptimeRobot, Health Monitors.
* **Headers:** None.
* **Success Response (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "db": "connected",
    "timestamp": "2026-11-14T17:25:00.000Z"
  }
  ```

---

## 2. Media Upload Pipeline (Cloudflare R2)

### `POST /api/upload`
* **Consumer:** Admin Product Form, Banner Manager (`ADMIN` / `SUPER_ADMIN`).
* **Request:** `multipart/form-data` with `file: File` (WebP, PNG, JPEG <= 5MB).
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "url": "https://cdn-demo.vectorfitlab.com/products/1794643000-tee.webp",
      "key": "products/1794643000-tee.webp"
    }
  }
  ```

### `DELETE /api/upload?key=<asset_key>`
* **Consumer:** Admin Media Uploader (removing uncommitted image draft).
* **Query Params:** `key=products/1794643000-tee.webp`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Asset deleted successfully"
  }
  ```

---

## 3. Store Configuration & Dynamic Theme

### `GET /api/config`
* **Consumer:** Public Storefront (`getPublicStoreConfig()`), Admin Settings Dashboard.
* **Query Params:**
  * `?admin=true` (Admin view: returns un-sanitized config; requires admin session)
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "branding": {
        "storeName": "Aurem Luxury",
        "tagline": "Artisanal Craftsmanship & Heavyweight Silhouettes",
        "currencySymbol": "৳",
        "currencyCode": "BDT",
        "colors": { "primary": "#060d11", "accent": "#076E46" }
      },
      "logistics": {
        "insideDhakaFee": 70,
        "suburbsDhakaFee": 100,
        "outsideDhakaFee": 130,
        "isFreeShippingEnabled": true,
        "freeShippingThreshold": 2500
      },
      "payment": {
        "cashOnDelivery": { "enabled": true },
        "manualBkash": { "enabled": true, "walletNumber": "01700000000", "walletType": "MERCHANT" }
      }
    }
  }
  ```

### `PUT /api/config`
* **Consumer:** Admin Settings Dashboard (`SUPER_ADMIN`).
* **Request Body:** Partial or complete `StoreConfig` object.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store configuration updated successfully",
    "data": { ... }
  }
  ```

---

## 4. Products & Catalog Engine

### `GET /api/products`
* **Consumer:** Storefront Catalog, Filter Drawers, Admin Products Table.
* **Query Parameters:**
  * `page` (number, default: `1`)
  * `limit` (number, strictly bounded: `1 <= limit <= 50`, default: `20`)
  * `collection` (string, e.g. `hoodies`, `winter-drop-2026`)
  * `categorySlug` (string, e.g. `t-shirts`, `outerwear`)
  * `brand` (string, e.g. `aurem-studio`)
  * `q` (string, search query across title, description, and SKU)
  * `minPrice` & `maxPrice` (numbers)
  * `inStock` (boolean, `true | false`)
  * `isPinned` (boolean, `true | false`)
  * `all` (boolean, `true` returns DRAFT/ARCHIVED for Admin)
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6af0eb83e36767103e4d54aa",
        "title": "Vintage Heavyweight Acid-Wash Hoodie",
        "slug": "vintage-heavyweight-acid-wash-hoodie",
        "productType": "CLOTHING",
        "categorySlug": "hoodie",
        "categoryName": "Hoodies",
        "basePrice": 1850,
        "discountPrice": 1450,
        "totalStock": 36,
        "inStock": true,
        "status": "PUBLISHED",
        "media": [
          {
            "url": "https://cdn-demo.vectorfitlab.com/products/hoodie.webp",
            "key": "products/hoodie.webp",
            "type": "IMAGE"
          }
        ]
      }
    ],
    "pagination": {
      "total": 16,
      "page": 1,
      "pages": 1,
      "limit": 20,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

### `POST /api/products`
* **Consumer:** Admin Product Creation Form.
* **Request Body:**
  ```json
  {
    "title": "Bone White Boxy Tee",
    "slug": "bone-white-boxy-tee",
    "categorySlug": "t-shirts",
    "categoryName": "T-Shirts",
    "productType": "CLOTHING",
    "basePrice": 950,
    "discountPrice": 750,
    "hasVariants": true,
    "variantOptions": [
      { "name": "Size", "values": [{ "label": "M" }, { "label": "L" }] }
    ],
    "variants": [
      {
        "sku": "TEE-WHITE-M",
        "title": "M / Bone White",
        "stock": 20,
        "selectedOptions": [{ "name": "Size", "value": "M" }]
      }
    ],
    "media": [
      { "url": "https://cdn-demo.vectorfitlab.com/tee.webp", "key": "tee.webp" }
    ],
    "status": "PUBLISHED"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": { "_id": "...", "slug": "bone-white-boxy-tee", "inStock": true }
  }
  ```

### `GET /api/products/:slug`
* **Consumer:** Customer PDP (`/products/[slug]`), Admin Edit Form.
* **Path Params:** `slug` or `_id`.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6af0eb83e36767103e4d54aa",
      "title": "Vintage Heavyweight Acid-Wash Hoodie",
      "slug": "vintage-heavyweight-acid-wash-hoodie",
      "variants": [ ... ],
      "sizeChart": [ { "size": "M", "chest": "42", "length": "28" } ],
      "specifications": [ { "group": "Fabric", "key": "GSM", "value": "450" } ]
    }
  }
  ```

### `PUT /api/products/:slug`
* **Consumer:** Admin Product Edit Form & Inline Stock Stepper.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "data": { ... }
  }
  ```

### `DELETE /api/products/:slug`
* **Consumer:** Admin Products Table.
* **Behavior:** Cascades asynchronous deletion of all associated Cloudflare R2 images.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product and associated storage assets deleted successfully",
    "data": { "success": true, "deletedSlug": "bone-white-boxy-tee" }
  }
  ```

---

## 5. Orders, Checkout & Lead Capture

### `POST /api/orders`
* **Consumer:** Storefront 1-Page Checkout / CartDrawer.
* **Security Rule:** Server-Authoritative Pricing (client `unitPrice` is strictly ignored).
* **Request Body:**
  ```json
  {
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
    "customer": {
      "name": "Ashikur Rahaman",
      "phone": "01700000000",
      "address": "Banani 11, Dhaka",
      "deliveryZone": "INSIDE_DHAKA",
      "note": "Please call before arrival"
    },
    "items": [
      {
        "productId": "6af0eb83e36767103e4d54aa",
        "variantId": "6af0eb83e36767103e4d54ab",
        "quantity": 1
      }
    ],
    "couponCode": "WINTER20",
    "paymentMethod": "COD"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Order placed successfully!",
    "data": {
      "_id": "6af80d...",
      "orderNumber": "AUR-58291",
      "customer": { "name": "Ashikur Rahaman", "phone": "01700000000", "deliveryZone": "INSIDE_DHAKA" },
      "subtotal": 1450,
      "deliveryFee": 70,
      "discountAmount": 290,
      "totalAmount": 1230,
      "orderStatus": "PENDING",
      "payment": { "method": "COD", "status": "UNPAID" },
      "inventoryState": "DEDUCTED"
    }
  }
  ```
* **Error Responses:**
  * `400 VALIDATION_ERROR`: Invalid phone number, missing address, or cart empty.
  * `409 OUT_OF_STOCK`: An item or variant has insufficient atomic inventory.

### `GET /api/orders`
* **Consumer:** Admin Orders Dashboard.
* **Query Params:** `page=1&limit=20&status=PENDING&q=017...`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [ ... ],
    "pagination": { "total": 10, "page": 1, "pages": 1, "limit": 20, "hasNextPage": false, "hasPrevPage": false }
  }
  ```

### `PATCH /api/orders`
* **Consumer:** Admin Orders Status Transitions.
* **Request Body:**
  ```json
  {
    "orderId": "6af80d...",
    "orderStatus": "CANCELLED"
  }
  ```
* **Behavior:** When transitioning to `CANCELLED` or `RETURNED`, automatically restores deducted inventory via atomic `$inc` and sets `inventoryState = 'RESTORED'`. Updates customer delivery metrics.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Order status updated to CANCELLED",
    "data": { ... }
  }
  ```

### `POST /api/orders/lead`
* **Consumer:** Checkout Drawer phone input `onBlur`.
* **Purpose:** Captures silent `INCOMPLETE` abandoned-cart leads (Rule #2).
* **Request Body:**
  ```json
  {
    "phone": "01700000000",
    "name": "Ashikur",
    "address": "Banani, Dhaka",
    "deliveryZone": "INSIDE_DHAKA"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Lead captured successfully",
    "data": { "leadId": "LEAD-48192" }
  }
  ```

### `GET /api/orders/track`
* **Consumer:** Customer Public Guest Tracking Drawer (`Rule #20`).
* **Security:** IDOR-safe (requires orderNumber + last 4 digits of phone).
* **Query Params:** `?orderNumber=AUR-58291&phoneLast4=0000`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "orderNumber": "AUR-58291",
      "customer": { "name": "Ashikur", "phoneMasked": "017****0000" },
      "orderStatus": "SHIPPED",
      "paymentStatus": "UNPAID",
      "totalAmount": 1230,
      "courier": {
        "provider": "STEADFAST",
        "consignmentId": "SF-482910",
        "trackingCode": "TRK-98124501"
      },
      "createdAt": "2026-11-14T12:00:00.000Z"
    }
  }
  ```

---

## 6. Coupons & Promotions

### `POST /api/coupons/validate`
* **Consumer:** Checkout Drawer Promo Code Form.
* **Request Body:**
  ```json
  {
    "code": "WINTER20",
    "subtotal": 1450,
    "customerPhone": "01700000000"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "code": "WINTER20",
      "discountAmount": 290,
      "discountType": "PERCENTAGE",
      "discountValue": 20
    }
  }
  ```
* **Error Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "error": "Minimum order amount of ৳2000 required for this coupon",
    "code": "COUPON_INVALID"
  }
  ```

---

## 7. Courier & Automated Dispatch

### `POST /api/courier/dispatch`
* **Consumer:** Admin Orders Dashboard 1-Click Dispatch.
* **Request Body:**
  ```json
  {
    "orderId": "6af80d...",
    "orderNumber": "AUR-58291"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Order successfully booked with STEADFAST. Tracking: TRK-98124501",
    "data": {
      "success": true,
      "consignmentId": "SF-482910",
      "trackingCode": "TRK-98124501",
      "provider": "STEADFAST",
      "status": "in_review"
    }
  }
  ```

---

## 8. Webhooks & Automated Payment Verification

### `POST /api/webhooks/sslcommerz/ipn`
* **Consumer:** SSLCommerz Gateway Server-to-Server IPN.
* **Request:** `application/x-www-form-urlencoded` or JSON with `tran_id`, `val_id`, `amount`, `status`, `currency`.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "IPN processed successfully",
    "orderNumber": "AUR-58291"
  }
  ```

### `POST /api/webhooks/sms-payment`
* **Consumer:** Mobile Android SMS-Forwarder App.
* **Request Body:**
  ```json
  {
    "sender": "bKash",
    "message": "You have received Tk 1,230.00 from 01700000000. Ref AUR-58291. Fee Tk 0.00. Balance Tk 50,000.00. TrxID 9L38DJ21 at 14/11/2026 18:00"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Payment verified for Order: AUR-58291",
    "data": {
      "matched": true,
      "orderNumber": "AUR-58291"
    }
  }
  ```
