# 04. API Layer & Media Upload Pipeline

> **Status:** Tier 4 Historical MVP Study Note (`v1`). For authoritative CR-Locked API security (`SUPER_ADMIN` RBAC on `/api/config`, AES-256 secrets, rate limits, & `API_REFERENCE.md`), follow [`docs/pipeline/01-scope-and-business-rules.md`](./pipeline/01-scope-and-business-rules.md) & [`docs/postman/API_REFERENCE.md`](./postman/API_REFERENCE.md).

## 1. What We Built
* **Media Upload API:** `src/app/api/upload/route.ts`
  * `POST`: Directly uploads multipart image buffers to Cloudflare R2 bucket (`ecom-demo`).
  * `DELETE`: Removes obsolete assets from R2 bucket via `?key=...`.
* **Store Config API & Auto-Seeder:** `src/app/api/config/route.ts`
  * `GET`: Retrieves store config; automatically seeds default settings to MongoDB Atlas if empty.
  * `PUT`: Updates brand settings, Shopify-style `homeSections`, logistics, and payment toggles.

---

## 2. Why We Built It (Senior Interview Concepts)
* **Native FormData Parsing in Next.js:**  
  Unlike legacy Express apps that require bloated middleware like `multer`, modern Next.js route handlers natively support `request.formData()`.
* **Zero-File-System Serverless Rule:**  
  In serverless hosting (Vercel, AWS Lambda), the local disk is ephemeral and read-only. Uploading directly from incoming memory buffer to Cloudflare R2 via AWS S3 SDK (`uploadToR2()`) ensures our media pipeline never depends on local server storage.
* **Auto-Seeding Singleton Pattern:**  
  When deploying for a new client, developers shouldn't need to run manual database migration scripts. `GET /api/config` detects an empty database and seeds production-ready defaults on the first request.

---

## 3. Key Concepts Checklist
* **Binary Buffer Conversion:** `Buffer.from(await file.arrayBuffer())` bridges web streams with the Node S3 client.
* **Allowed MIME Types:** Security gate preventing executable script uploads (allows `.webp`, `.png`, `.jpg`, `.svg`, `.mp4`).
* **Atomic Upsert:** `StoreConfig.findOneAndUpdate({ isActive: true }, { $set: body }, { new: true, upsert: true })` guarantees exactly one singleton config document exists.

---

## 4. Official Docs & Sources
* 📖 [Next.js Route Handlers: FormData](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#form-data)
* 📖 [AWS SDK v3 PutObjectCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/PutObjectCommand/)
