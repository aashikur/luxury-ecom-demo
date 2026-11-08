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
* **Error Response (`503 Service Unavailable`):**
  ```json
  {
    "status": "degraded",
    "message": "One or more cloud services failed.",
    "services": {
      "database": { "state": "disconnected", "readyStateCode": 0 },
      "cloudinary": { "status": "failed" },
      "cloudflareR2": { "status": "failed" }
    }
  }
  ```

---

## 2. Media Upload Pipeline (Cloudflare R2)

### `POST /api/upload`
* **Consumer / Who uses it:** Admin Product Manager, Admin Banner Manager, Storefront Profile Uploader.
* **Purpose:** Receives binary file, uploads it directly to Cloudflare R2 bucket (`ecom-demo`), and returns public CDN URL.
* **Request:**
  * Content-Type: `multipart/form-data`
  * Body:
    * `file`: Binary file (WebP, PNG, JPEG, SVG, MP4)
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "File successfully uploaded to Cloudflare R2",
    "url": "https://cdn-demo.vectorfitlab.com/products/1794171873780-tshirt.webp",
    "key": "products/1794171873780-tshirt.webp"
  }
  ```
* **Error Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "error": "Unsupported file type: application/pdf. Allowed: WebP, JPEG, PNG, SVG, MP4."
  }
  ```

---

### `DELETE /api/upload?key=<asset_key>`
* **Consumer / Who uses it:** Admin Product Manager (when removing an image from product gallery).
* **Purpose:** Deletes the specified object key from Cloudflare R2 bucket to prevent storage clutter.
* **Request:**
  * Query Param: `key=products/1794171873780-tshirt.webp`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Asset 'products/1794171873780-tshirt.webp' successfully deleted from Cloudflare R2"
  }
  ```
* **Error Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "error": "Asset key is required to delete"
  }
  ```

---

## 3. Store Configuration & Dynamic Theme

### `GET /api/config`
* **Consumer / Who uses it:** Storefront Root Layout (loads colors, logo, brand name), Admin Settings Dashboard.
* **Purpose:** Fetches the active singleton `StoreConfig`. If database is brand new, automatically seeds default configuration into MongoDB.
* **Request:**
  * Headers: `None`
  * Body: `None`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6af0e406e36767103e4d54a5",
      "branding": {
        "storeName": "VectroFit Luxury",
        "tagline": "Engineered Streetwear & Minimal Garments",
        "themeMode": "DARK",
        "colors": {
          "primary": "#0F172A",
          "accent": "#E11D48",
          "bg": "#09090B",
          "surface": "#18181B",
          "fg": "#FAFAFA",
          "muted": "#71717A"
        }
      },
      "homeSections": [
        {
          "id": "sec_hero_1",
          "type": "HERO_CAROUSEL",
          "title": "Winter Luxury Drop 2026",
          "order": 1,
          "isActive": true
        }
      ],
      "logistics": {
        "insideDhakaFee": 70,
        "outsideDhakaFee": 130,
        "freeShippingThreshold": 2500
      },
      "payment": {
        "cod": { "enabled": true },
        "manualBkash": { "enabled": true, "number": "01700000000" },
        "sslCommerz": { "enabled": false }
      },
      "features": {
        "abandonedCartCapture": true,
        "couponEnabled": true
      }
    }
  }
  ```

---

### `PUT /api/config`
* **Consumer / Who uses it:** Super Admin / Merchant Dashboard Settings page.
* **Purpose:** Updates branding, delivery fees, payment switches, or reordered `homeSections`.
* **Request:**
  * Content-Type: `application/json`
  * Body: Any partial or full `StoreConfig` object.
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Store configuration updated successfully",
    "data": { ... }
  }
  ```
