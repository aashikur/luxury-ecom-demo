# 🚀 Backend API Reference & Postman Documentation

> **Base URL (Local):** `http://localhost:3000`  
> **Rule:** Every backend route created in this project is documented here in real-time with Request, Response, and Consumer specifications.

---

## 1. System Health & Infrastructure

### `GET /api/health`
* **Consumer / Who uses it:** DevOps, UptimeRobot, Serverless Health Monitors, Developers.
* **Purpose:** Verifies that MongoDB Atlas, Cloudinary SDK, and Cloudflare R2 bucket are live.
* **Request:**
  * Headers: `None`
  * Body: `None`
* **Success Response (`200 OK`):**
  ```json
  {
    "status": "healthy",
    "message": "All cloud services operational (MongoDB + Cloudinary + Cloudflare R2).",
    "services": {
      "database": {
        "state": "connected",
        "readyStateCode": 1,
        "latency": "1ms"
      },
      "cloudinary": {
        "status": "connected",
        "cloudName": "dlfrd8scy",
        "latency": "1579ms"
      },
      "cloudflareR2": {
        "status": "connected",
        "bucket": "ecom-demo",
        "latency": "837ms"
      }
    },
    "totalLatency": "2417ms",
    "timestamp": "2026-11-08T20:08:02.881Z"
  }
  ```

---

## 2. Media Upload Pipeline (Cloudflare R2)

### `POST /api/upload`
* **Consumer / Who uses it:** Admin Product Manager, Admin Banner Manager, Storefront Profile Uploader.
* **Purpose:** Receives binary file, uploads it directly to Cloudflare R2 bucket (`ecom-demo`), and returns public CDN URL.
* **Request:**
  * Content-Type: `multipart/form-data`
  * Body: `file` (WebP, PNG, JPEG, SVG, MP4)
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "File successfully uploaded to Cloudflare R2",
    "url": "https://cdn-demo.vectorfitlab.com/products/1794171873780-tshirt.webp",
    "key": "products/1794171873780-tshirt.webp"
  }
  ```

### `DELETE /api/upload?key=<asset_key>`
* **Consumer / Who uses it:** Admin Product Manager (cleaning up removed images).
* **Request:** Query Param `?key=products/1794171873780-tshirt.webp`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Asset successfully deleted from Cloudflare R2"
  }
  ```

---

## 3. Store Configuration & Dynamic Theme

### `GET /api/config`
* **Consumer / Who uses it:** Storefront Root Layout (loads colors, logo, brand name), Admin Settings Dashboard.
* **Purpose:** Fetches active `StoreConfig`. If empty, auto-seeds default configuration to MongoDB.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "branding": {
        "storeName": "VectroFit Luxury",
        "themeMode": "DARK"
      },
      "homeSections": [...],
      "logistics": { "insideDhakaFee": 70, "outsideDhakaFee": 130 },
      "payment": { "cod": { "enabled": true }, "manualBkash": { "enabled": true } }
    }
  }
  ```

### `PUT /api/config`
* **Consumer / Who uses it:** Super Admin / Merchant Settings.
* **Request:** Content-Type: `application/json` (partial or full `StoreConfig` object).
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
* **Consumer / Who uses it:** Storefront Catalog, Homepage Sections, Search & Filters.
* **Purpose:** Queries products with collection/category filtering and compound index sorting (`isPinned` -> `priority` -> `createdAt`). Auto-seeds 3 demo garment products on fresh DB.
* **Query Parameters (Optional):**
  * `?collection=hoodies`
  * `?category=T-Shirt`
  * `?limit=20`
  * `?page=1`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6af0eb83e36767103e4d54aa",
        "title": "Vintage Heavyweight Acid-Wash Hoodie",
        "slug": "vintage-heavyweight-acid-wash-hoodie",
        "primaryCategory": "Hoodie",
        "collections": ["hoodies", "winter-drop-2026", "featured"],
        "basePrice": 1850,
        "discountPrice": 1450,
        "images": [{ "url": "https://...", "key": "seed/hoodie-1.webp" }],
        "variants": [
          { "size": "M", "stock": 12, "sku": "HD-ACID-M" },
          { "size": "L", "stock": 8, "sku": "HD-ACID-L" },
          { "size": "XL", "stock": 0, "sku": "HD-ACID-XL" }
        ],
        "sizeChart": [
          { "size": "M", "chest": "44", "length": "28", "sleeve": "25" }
        ],
        "isPinned": true,
        "priority": 10
      }
    ],
    "pagination": { "total": 3, "page": 1, "pages": 1, "limit": 20 }
  }
  ```

---

### `POST /api/products`
* **Consumer / Who uses it:** Admin Product Creation Form.
* **Purpose:** Validates input, auto-generates SEO slug, and creates product in MongoDB.
* **Request:**
  * Content-Type: `application/json`
  * Body:
    ```json
    {
      "title": "Drop Shoulder Washed Tee",
      "primaryCategory": "T-Shirt",
      "collections": ["t-shirts", "featured"],
      "basePrice": 1100,
      "discountPrice": 900,
      "images": [{ "url": "https://cdn-demo...", "key": "products/tee.webp" }],
      "variants": [{ "size": "M", "stock": 10, "sku": "TEE-M" }],
      "sizeChart": [{ "size": "M", "chest": "42", "length": "28" }]
    }
    ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "data": { ... }
  }
  ```

---

### `GET /api/products/:slug`
* **Consumer / Who uses it:** Customer Product Detail Page (`/products/[slug]`).
* **Purpose:** Fetches single product details with full image gallery, size variant matrix, and size chart.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "title": "Vintage Heavyweight Acid-Wash Hoodie",
      "slug": "vintage-heavyweight-acid-wash-hoodie",
      "basePrice": 1850,
      "variants": [...]
    }
  }
  ```
* **Error Response (`404 Not Found`):**
  ```json
  { "success": false, "error": "Product not found" }
  ```

---

### `PUT /api/products/:slug`
* **Consumer / Who uses it:** Admin Product Edit Form.
* **Purpose:** Updates product title, prices, inventory stock counts, or priority.

---

### `DELETE /api/products/:slug`
* **Consumer / Who uses it:** Admin Product Table.
* **Purpose:** Deletes product from database and returns its R2 image keys for cleanup.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product deleted successfully",
    "deletedImageKeys": ["products/1794-img1.webp"]
  }
  ```
