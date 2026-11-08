# 02. Media Storage: Cloudinary vs. Cloudflare R2

## 1. What We Built
* **Cloudflare R2 Client:** `src/lib/r2.ts` (S3 SDK client initialized)
* **Storage Upload/Delete Utility:** `src/lib/storage.ts` (`uploadToR2`, `deleteFromR2`)
* **Cloudinary Client:** `src/lib/cloudinary.ts` (Configured as fallback)
* **Custom Domain Hooked:** `cdn-demo.vectorfitlab.com` / `pub-xxxxxx.r2.dev`

---

## 2. Why R2 for 1M Users / Month? (Senior Interview Answer)
* **The "Egress Fee" Problem:** AWS S3 and Cloudinary charge per gigabyte downloaded by customers.
  * 1,000,000 visitors $\times$ 20 product views $\times$ 200KB = **4 Terabytes/month**.
  * AWS S3 / Cloudinary bandwidth bill = **\$300 – \$600+ / month**.
* **The Cloudflare R2 Solution:**
  * **\$0 Egress Fees:** Download bandwidth is 100% free forever.
  * Storage is only **\$0.015 / GB** per month.
  * Same 4 TB costs under **\$5 / month**.
* **S3 Protocol Compatible:** Uses the standard `@aws-sdk/client-s3`.

---

## 3. How R2 Image Flow Works (Mental Model)

```text
[ Browser ] 
    │ (Uploads garment image e.g. tshirt.webp)
    ▼
[ Next.js API: /api/upload ]
    │ (Takes file buffer)
    ▼
[ src/lib/storage.ts: uploadToR2() ]
    │ (Sends PutObjectCommand with AWS S3 SDK)
    ▼
[ Cloudflare R2 Bucket: "ecom-demo" ]
    │ (Stores binary image in cloud edge)
    ▼
[ Return Public URL ]
    ├── URL: https://cdn-demo.vectorfitlab.com/products/173111-tshirt.webp
    └── Key: products/173111-tshirt.webp
    │
    ▼
[ MongoDB Database ]
    └── Saves ONLY: { url, key } (Keeps DB super fast and lightweight!)
```

---

## 4. Key Concepts Checklist
* **Bucket:** The storage folder in Cloudflare (e.g. `ecom-demo`).
* **Key:** The unique file path inside the bucket (e.g. `products/171000-hoodie.webp`).
* **Public Domain / R2.dev:** The CDN URL prefix used by browsers to load the image.
* **PutObjectCommand:** The standard S3 operation used to upload files.
* **DeleteObjectCommand:** The standard S3 operation used to clean up deleted product images.

---

## 5. Official Docs & Sources
* 📖 [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
* 📖 [AWS S3 Client PutObject Command](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/PutObjectCommand/)
