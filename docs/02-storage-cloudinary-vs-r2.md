# 02. Media Storage: Cloudinary vs. Cloudflare R2

## 1. What We Built & Are Building
* **Cloudinary Client:** `src/lib/cloudinary.ts` (Active & connected)
* **Cloudflare R2 Client:** `src/lib/r2.ts` (S3 SDK client)
* **Storage Strategy:** Store media in object storage/CDN; store only `{ url, key }` in MongoDB.

---

## 2. Why R2 for 1M Users / Month? (Senior Interview Answer)
* **The "Egress Fee" Problem:** AWS S3 and Cloudinary charge per GB downloaded.
  * 1,000,000 visitors $\times$ 20 product views $\times$ 200KB = **4 Terabytes/month**.
  * AWS S3 / Cloudinary bandwidth bill = **\$300 – \$600+ / month**.
* **The Cloudflare R2 Advantage:**
  * **\$0 Egress Fees:** Download bandwidth is 100% free forever.
  * Storage is only **\$0.015 / GB** per month.
  * Same 4 TB costs under **\$5 / month**.
* **S3 Protocol Compatible:** Uses the standard `@aws-sdk/client-s3`.

---

## 3. Comparison Cheat-Sheet

| Feature | Cloudinary | Cloudflare R2 |
| :--- | :--- | :--- |
| **Best For** | Fast Dev, Auto WebP compression, On-the-fly resizing | Massive scale (1M+ users), Ultra-cheap storage |
| **Bandwidth (Egress)** | Paid / Credit-capped | **100% Free (\$0 Egress)** |
| **SDK Used** | `cloudinary` | `@aws-sdk/client-s3` (Standard S3 API) |
| **Free Tier** | 25 Credits/month (~25GB) | 10 GB storage + 10M reads/month |

---

## 4. Official Docs & Sources
* 📖 [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
* 📖 [Cloudflare R2 S3 API Guide](https://developers.cloudflare.com/r2/api/s3/api/)
* 📖 [AWS S3 Client for JS v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/)
