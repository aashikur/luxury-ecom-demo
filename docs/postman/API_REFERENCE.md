# 🚀 Backend API Reference & Postman Documentation

> **Base URL (Local):** `http://localhost:3000`  
> **Rule:** Every backend route created in this project is documented here in real-time with Request, Response, and Consumer specifications.

---

## 1. System Health & Infrastructure

### `GET /api/health`
* **Consumer / Who uses it:** DevOps, UptimeRobot, Serverless Health Monitors, Developers.
* **Purpose:** Verifies that MongoDB Atlas, Cloudinary SDK, and Cloudflare R2 bucket are live.
* **Success Response (`200 OK`):** Status `healthy` with readyStateCode `1`.

---

## 2. Media Upload Pipeline (Cloudflare R2)

### `POST /api/upload`
* **Consumer / Who uses it:** Admin Product Manager, Admin Banner Manager, Storefront Profile Uploader.
* **Request:** `multipart/form-data` with `file`
* **Success Response (`201 Created`):** Returns `{ url, key }`.

### `DELETE /api/upload?key=<asset_key>`
* **Consumer / Who uses it:** Admin Product Manager (cleaning up removed images).

---

## 3. Store Configuration & Dynamic Theme

### `GET /api/config`
* **Consumer / Who uses it:** Storefront Root Layout, Admin Settings Dashboard.
* **Success Response (`200 OK`):** Returns active `StoreConfig`. Auto-seeds on fresh DB.

### `PUT /api/config`
* **Consumer / Who uses it:** Super Admin / Merchant Settings.
* **Cache Revalidation:** Automatically purges Next.js full-route cache for `'/'`, `'/shop'`, `'/admin'`, and `'/admin/settings'`.

---

## 4. Products & Catalog Engine

### `GET /api/products`
* **Consumer / Who uses it:** Storefront Catalog, Homepage Sections, Search & Filters.
* **Query Parameters:** `?collection=...`, `?category=...`, `?limit=...`, `?page=...`, `?all=true`

### `POST /api/products`
* **Consumer / Who uses it:** Admin Product Creation Form.
* **Cache Revalidation:** Automatically triggers on-demand `revalidatePath` for `'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, and `'/products/:slug'`.

### `GET /api/products/:slug`
* **Consumer / Who uses it:** Customer Product Detail Page (`/products/[slug]`).

### `PUT /api/products/:slug`
* **Consumer / Who uses it:** Admin Product Edit Form & Inline Stock Stepper.
* **Cache Revalidation:** Automatically triggers on-demand `revalidatePath` for `'/'`, `'/shop'`, `'/admin'`, `'/admin/products'`, `'/admin/products/:id'`, and `'/products/:slug'`.

### `DELETE /api/products/:slug`
* **Consumer / Who uses it:** Admin Product Table.
* **Cache Revalidation:** Automatically triggers on-demand `revalidatePath` for catalog routes and cascades Cloudflare R2 asset deletion.

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
* **Consumer / Who uses it:** Customer Cart Drawer (Guest 1-Page COD Checkout).
* **Purpose:** Places order with customer info, delivery zone, payment method, calculates server-side financials, and generates readable `orderNumber` (e.g. `ORD-10482`).
* **Request:**
  * Content-Type: `application/json`
  * Body:
    ```json
    {
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
          "title": "Vintage Heavyweight Acid-Wash Hoodie",
          "image": "https://images.unsplash.com/...",
          "size": "L",
          "quantity": 1,
          "unitPrice": 1450
        }
      ],
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
        "totalAmount": 1520
      },
      "payment": { "method": "COD", "status": "UNPAID" },
      "status": "PENDING"
    }
  }
  ```

---

### `GET /api/orders`
* **Consumer / Who uses it:** Admin Order Management Dashboard.
* **Purpose:** Queries orders with status filter (`PENDING`, `CONFIRMED`, `SHIPPED`, etc.) and pagination.
* **Query Parameters:** `?status=PENDING&page=1&limit=20`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [ ... ],
    "pagination": { "total": 1, "page": 1, "pages": 1, "limit": 20 }
  }
  ```
