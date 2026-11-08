# 03. Database Schemas: StoreConfig Architecture

## 1. What We Built
* **StoreConfig Model:** `src/models/StoreConfig.ts`
* **Sections Included:**
  * `branding`: Store name, logo, favicon, dark/light theme colors, hero variant
  * `logistics`: Support phone, WhatsApp chat, delivery charges (Inside/Outside Dhaka), delivery timelines
  * `tracking`: Meta Pixel + CAPI token, GTM, GA4, TikTok Pixel + Events API
  * `courier`: Steadfast API, Courier FraudCheck threshold, Advance Payment rules
  * `payment`: Cash on Delivery (COD), Manual bKash/Nagad with TrxID, Automated bKash PGW & SSLCommerz
  * `media`: Video provider (`YOUTUBE` default, `R2`, `BUNNY_STREAM`)
  * `features`: Master switchboard for feature gating

---

## 2. Why We Built It (Senior Interview Concept)
* **The "Zero-Hardcode" Master Boilerplate:**  
  Most e-commerce websites hardcode store titles, phone numbers, delivery fees, and pixel IDs in React files. When deploying for 10 clients, developers end up maintaining 10 different git forks, causing merge conflict nightmares.
* **The Solution:**  
  All client-specific configurations live in this single MongoDB document. The code remains **100% identical** across all clients. Updating the core app upstream updates all clients cleanly.
* **The Model Cache Fix in Next.js:**  
  `mongoose.models.StoreConfig || mongoose.model(...)` prevents `OverwriteModelError` during Next.js Hot Module Reloading in development.

---

## 3. Key Concepts Checklist
* **Manual MFS Payment (BD Standard):**  
  Customer sends money from personal app ➔ enters Sender Phone & TrxID ➔ Admin verifies before shipping.
* **Video Strategy:**  
  YouTube handles heavy bandwidth & encoding for \$0; custom UI player strips YouTube branding for luxury feel; config keeps R2 and Bunny.net ready for seamless upgrades.
* **Feature Gating:**  
  Features are toggled via boolean flags (`features.capiEnabled`, `features.manualBkash`). If false, the UI removes the component and the API rejects the request.

---

## 4. Official Docs & Sources
* 📖 [Mongoose Schemas Guide](https://mongoosejs.com/docs/guide.html)
* 📖 [Meta Conversions API (CAPI) Overview](https://developers.facebook.com/docs/marketing-api/conversions-api)
* 📖 [Steadfast Courier API Docs](https://portal.packzy.com/)
