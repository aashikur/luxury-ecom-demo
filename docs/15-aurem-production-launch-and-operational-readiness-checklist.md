# 15. Aurem Production Launch & Operational Readiness Checklist

> **Authoritative Launch Blueprint & Senior Engineering Audit:**  
> **Brand:** AUREM (Luxury Apparel, Streetwear & High-End Gadgets)  
> **Scale Baseline:** 1,000,000 Facebook Page Followers · 100–200 Daily Orders (~৳5,000,000–৳20,000,000+ BDT Monthly GMV)  
> **Target Deployment:** Next.js 16 (App Router + Turbopack) · MongoDB Atlas M10 (Singapore `ap-southeast-1`) · Cloudflare CDN/Edge · Cloudflare R2 · Steadfast Courier  

---

## 1. What We Built & Audited

A comprehensive technical and operational audit of the Aurem E-Commerce platform across architecture, database, checkout, security, courier integration, and commercial readiness.

### A. Current Software Engineering Baseline (Passed & Ready)
1. **Next.js 16 App Router & React 19 Core:**
   - Full production build compiled cleanly with **0 errors** across all 40+ static and dynamic routes (`npm run build`).
   - Clean 4-Tier Clean Architecture: Transport Controllers (`src/app/api/**`) $\rightarrow$ Domain Services (`src/services/**`) $\rightarrow$ Mongoose Persistence (`src/models/**`) $\rightarrow$ Adapters (`src/lib/**`).
   - Zero internal `fetch()` loopback overhead: Server Components invoke Domain Services directly in-memory at 0ms latency.
2. **Bangladesh E-Commerce Domain Engine:**
   - **Guest 3-Field Checkout:** Seamless 1-page checkout drawer requiring only Customer Name, 11-digit mobile phone (`/^01[3-9]\d{8}$/`), and Delivery Address. No forced account registration or passwords.
   - **3-Zone Delivery Logistics:** Automatic tariff resolution for `INSIDE_DHAKA` (৳70), `DHAKA_SUBURBS` (৳100), and `OUTSIDE_DHAKA` (৳130), with configurable free shipping thresholds.
   - **Zero-Oversell Atomic Stock Engine:** Conditional decrement strictly enforced via `{ 'variants.stock': { $gte: qty } }` with automatic multi-item rollback on partial failure.
   - **Server-Authoritative Pricing:** Client sends zero price fields; prices are resolved directly from MongoDB.
3. **Admin Dashboard & Fulfillment:**
   - Minimalist Shopify/WordPress design tokens (`#060d11`, `#076E46`).
   - 1-Click Steadfast Courier dispatch integration (`src/services/courier.service.ts` and `/api/courier/dispatch`).
   - Product catalog, variant matrix builder, R2 media uploader with client-side canvas compression (`3:4 WebP < 200KB`).
   - Better Auth RBAC with Edge middleware shielding all `/admin/**` routes.

---

## 2. Why We Built It (Senior Engineering & Business Concepts)

### A. The 1M Followers Viral Spike Reality
With 1,000,000 Facebook followers, website traffic does not arrive in a steady stream. When a Facebook post, reel, or sponsored campaign goes live, traffic surges in **sudden traffic bursts of 500 to 2,000 concurrent visitors within minutes**.
* **The Disaster if Launched on Current Dev Stack:** The current MongoDB Atlas M0 (Free Tier) has a 512MB storage cap and 100–500 connection limit. When 100 customers hit the checkout button simultaneously during a campaign spike, serverless connection pooling exhausts, throwing `queryTxt ETIMEOUT` or connection refused errors, crashing the store during peak sales.
* **The Solution:** Dedicated MongoDB Atlas M10+ co-located in Singapore (`ap-southeast-1`), paired with Next.js 16 split-caching and Cloudflare Edge caching with BDIX peering in Dhaka.

### B. The Facebook CAPI & iOS 14.5 Tracking Dilemma
A Facebook-based business lives and dies by its Facebook Ad ROAS (Return On Ad Spend).
* **The Problem:** Modern mobile browsers (iOS Safari, Brave) block up to 70% of standard client-side browser cookies and pixel tracking (`fbq`). If the ad algorithm does not know which users bought products, customer acquisition costs (CAC) soar, ad budgets are wasted, and retargeting fails.
* **The Solution:** A dual-layer tracking architecture combining browser Meta Pixel with Server-Side Meta Conversions API (CAPI). The server dispatches purchase events directly to Meta’s Graph API with hashed customer phone numbers and order values for 100% attribution accuracy.

### C. The Bangladesh COD Return-to-Origin (RTO) Crisis
In Bangladesh, 80%–90% of e-commerce orders are Cash on Delivery (COD). Without instant transactional confirmation, **25%–35% of orders bounce at delivery**, costing the business double courier fees (delivery + return fee) and inventory lock-up.
* **The Solution:** Immediate automated transactional SMS upon order placement, instant WhatsApp order updates, and a dedicated 15-minute phone verification protocol before courier handover.

---

## 3. Key Concepts Checklist (The 4 Launch Answers)

### Question 1: Does this ready?
> **VERDICT: NO — It is NOT ready for official public commercial launch today.**

While the code compiles cleanly with 0 errors, there are **5 critical operational and infrastructure blockers** that must be resolved prior to driving paid traffic from 1M followers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAUNCH READINESS AUDIT                          │
├──────────────────────────────┬───────────────┬─────────────────────────┤
│ System / Component           │ Status        │ Live Risk Assessment    │
├──────────────────────────────┼───────────────┼─────────────────────────┤
│ Core Codebase & Next.js 16   │ ✅ 85% READY  │ 0 Build Errors, Solid   │
│ Guest 3-Field BD Checkout    │ ✅ READY      │ Tested & Functioning    │
│ Atomic Stock Decrement       │ ✅ READY      │ Concurrency Guarded     │
│ Database Tier (Atlas M0)     │ ❌ BLOCKER    │ 512MB limit, pool crash │
│ Meta Pixel & Server CAPI     │ ❌ BLOCKER    │ Blind Facebook Ads ROAS │
│ SMS Gateway (Order/Courier)  │ ❌ BLOCKER    │ High 30%+ RTO returns   │
│ Steadfast Courier API        │ 🟡 SANDBOX    │ Live keys not plugged   │
│ Checkout Bot Rate Limiter    │ ❌ BLOCKER    │ Fake order cart-locking │
│ Commercial Legal (DBID/BIN)  │ ⏳ PENDING    │ Bank & MFS requirement  │
│ Warehouse & Call Center Team │ ⏳ PENDING    │ Cannot fulfill 150/day  │
└──────────────────────────────┴───────────────┴─────────────────────────┘
```

---

### Question 2: What remains to launch and operate officially?

The remaining deliverables are grouped into 4 distinct operational pillars:

#### Pillar 1: Software Engineering & Code Completion
- [ ] **Meta Pixel & Server-Side Conversions API (CAPI):**
  - Inject browser Meta Pixel into `src/app/layout.tsx`.
  - Add server-side CAPI event dispatcher inside `src/services/order.service.ts` pushing `Purchase`, `InitiateCheckout`, and `AddToCart` directly to Meta Graph API with SHA-256 hashed phone/email.
- [ ] **Bangladeshi SMS Gateway Integration:**
  - Connect SMS API (Greenweb, BulkSMSBD, or SSL Wireless).
  - Auto-dispatch transactional SMS on order creation:  
    *“Dear [Name], your Aurem order #[OrderNo] for ৳[Total] is confirmed! Track live: [URL]”*
  - Auto-dispatch SMS on courier handover with Steadfast tracking code.
- [ ] **Checkout Abuse & Spam Shield (Rate Limiting):**
  - Implement IP and phone rate-limiting on `POST /api/orders` (maximum 3 orders per 10 minutes per IP/phone) to stop bot attacks and inventory cart-locking.
- [ ] **Technical SEO & Sitemap Generation:**
  - Create `src/app/robots.ts` and dynamic `src/app/sitemap.ts` to index luxury/gadget products while shielding `/admin/**` routes.
- [ ] **Steadfast Delivery Webhook Endpoint:**
  - Create `src/app/api/webhooks/steadfast/route.ts` to receive real-time courier callbacks and automatically update order statuses to `DELIVERED` or `RETURNED`.

#### Pillar 2: Cloud Infrastructure & DevOps Hardening
- [ ] **MongoDB Atlas Upgrade:**
  - Upgrade cluster from M0 Free to **Atlas M10+ (Dedicated)**.
  - Region selection: Singapore (`ap-southeast-1`) or Mumbai (`ap-south-1`) for ~35–45ms round-trip latency to Bangladesh.
  - Enable Automated Daily Backups and Point-In-Time-Recovery (PITR).
- [ ] **Cloudflare CDN & Edge Configuration:**
  - Point domain DNS (`aurem.com.bd` / `aurem.store`) to Cloudflare.
  - Enable SSL/TLS Full (Strict), HTTP/3, and Bot Fight Mode.
  - Configure Edge caching rules with Dhaka BDIX cache peering.
- [ ] **Cloudflare R2 Custom CDN Domain:**
  - Bind R2 bucket to `cdn.aurem.com.bd` for branded, high-speed image delivery with zero egress fees.
- [ ] **Production Hosting Deployment:**
  - Deploy to Vercel Pro or production Node.js VPS (Ubuntu 24.04 LTS behind Nginx and PM2) with production environment variables securely set.

#### Pillar 3: Commercial & Merchant Credentials
- [ ] **Steadfast Courier Live Account:**
  - Sign commercial merchant contract with Steadfast.
  - Plug live production `apiKey` and `secretKey` into `StoreConfig.courier.steadfast`.
  - Configure pickup hub address and primary contact.
- [ ] **Payment Gateway / MFS Merchant Setup:**
  - Onboard with bKash Merchant API / SSLCommerz / Nagad.
  - Configure live credentials in `StoreConfig.payment`.
- [ ] **Branded Support & Communication Channels:**
  - Set up `support@aurem.com.bd` on Google Workspace or Zoho Mail.
  - Configure official WhatsApp Business API phone number.

#### Pillar 4: Physical Operations & Fulfillment Setup
- [ ] **Authentic Catalog Ingestion:**
  - Upload 50–100 authentic luxury garments and gadget products with high-resolution 3:4 portrait photos, technical specifications, and real physical SKU stock counts.
- [ ] **Thermal Shipping Printer Station:**
  - Install a 4-inch thermal barcode printer (e.g. Xprinter XP-420B) for 1-second waybill sticker printing.
- [ ] **Packaging & Unboxing Assets:**
  - Custom branded Aurem boxes, luxury ribbon/tissue wrapping, security tamper-evident tape, and warranty cards for gadgets.

---

### Question 3: How long will it take and which parts need how many days?

Total Timeline to Commercial Launch: **12 to 14 Business Days (~2 Calendar Weeks)**.

```
Week 1: Engineering & Infrastructure Hardening
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Day 1-2    │    Day 3     │    Day 4     │    Day 5     │   Day 6-7    │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Meta Pixel & │ SMS Gateway  │ Bot Limiter  │ Atlas M10 DB │ Catalog &    │
│ Server CAPI  │ Integration  │ & robots.ts  │ & Cloudflare │ Live Keys    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

Week 2: Operations, Drills & Soft Launch
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Day 8-9    │    Day 10    │    Day 11    │    Day 12    │  Day 13-14   │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Real Product │ Steadfast    │ End-to-End   │ Staff Drill  │ Commercial   │
│ Upload & QC  │ Webhook Sync │ Test Orders  │ & Soft Launch│ 1M Go-Live!  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Detailed Breakdown by Component:
1. **Meta Pixel & Server CAPI Integration:** **1.5 Days**
   - Inject browser script, build server-side CAPI event dispatcher in `order.service.ts`, test via Meta Events Manager.
2. **SMS Gateway Integration:** **1.0 Day**
   - Implement provider client (Greenweb/BulkSMSBD), wire triggers for order confirmation and Steadfast tracking.
3. **Anti-Spam Rate Limiter & Technical SEO:** **1.0 Day**
   - In-memory/Redis rate limiter on checkout endpoint; build `robots.ts` and dynamic `sitemap.ts`.
4. **Cloud Infrastructure, MongoDB M10 & Cloudflare CDN:** **1.5 Days**
   - Provision M10 cluster in Singapore, migrate database, point DNS, configure Cloudflare CDN and R2 custom domain.
5. **Real Catalog Ingestion (50–100 items):** **2.5 Days**
   - Photograph, compress, upload products, assign categories/collections, and input variant inventory.
6. **Steadfast Delivery Webhook & Status Sync:** **1.0 Day**
   - Build webhook controller, test real consignment booking and live status transitions.
7. **End-to-End Live Order Drills:** **1.5 Days**
   - Execute 10 test purchases (COD, bKash), generate real Steadfast waybills, verify invoice printing, test return flow.
8. **Soft Launch & Monitoring (5% Audience):** **2.0 Days**
   - Open store for 10–20 orders/day, verify payment reconciliation and serverless connection stability before full blast.

---

### Question 4: External Departments, Teams, Agencies & Freelancers Needed

Engineering builds the engine, but running a business with 1M followers doing 100–200 daily orders requires dedicated personnel across 5 non-engineering disciplines:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AUREM CROSS-DEPARTMENT WORKFORCE                     │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Discipline / Role                │ Recommended Personnel & Mandate     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ 1. Order Confirmation Team       │ 1–2 In-House Call Agents            │
│ 2. Fulfillment & Packaging       │ 1–2 Warehouse / Packaging Staff     │
│ 3. Creative Studio & Photography │ Creative Agency or Freelance Studio │
│ 4. Performance Marketing         │ Media Buyer / Facebook Ads Agency   │
│ 5. Legal & Commercial Compliance │ Chartered Accountant / Legal Firm   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

#### 1. Order Confirmation & Customer Support Agents (1–2 In-House Staff or Outsourced Call Center)
* **The Necessity:** In Bangladesh, impulse Facebook buyers often provide inaccurate addresses or change their minds. Without human phone verification, 30%+ of COD parcels are returned.
* **Responsibilities:**
  - Call every customer within 10–20 minutes of placing an order to confirm sizing, color, address, and readiness to pay.
  - Filter out prank/fake orders before packages are booked into Steadfast.
  - Manage live customer queries on WhatsApp and Facebook Messenger.

#### 2. Warehouse, Packaging & Fulfillment Personnel (1–2 Dedicated Staff)
* **The Necessity:** 100–200 orders per day requires packing **15 to 25 parcels every single hour**.
* **Responsibilities:**
  - Perform Quality Check (QC) on every luxury garment and gadget item before boxing.
  - Securely pack gadgets in bubble wrap and luxury apparel in branded Aurem packaging.
  - Print 4-inch adhesive thermal waybill stickers and affix them to packages.
  - Sort parcels by courier zone and hand over to the Steadfast courier pickup rider by the daily 4:00 PM cutoff.

#### 3. Professional Product Photography & Media Studio (Creative Freelancer or Agency)
* **The Necessity:** Aurem positions itself as a luxury brand to 1M followers. Poor lighting or supplier photos instantly destroy brand credibility.
* **Responsibilities:**
  - Shoot high-fashion 3:4 portrait model imagery and high-detail macro gadget photography.
  - Produce 15-second vertical unboxing and lifestyle reels for Facebook/Instagram ads.
  - Edit images to ensure color accuracy under digital displays.

#### 4. Performance Marketing & Media Buying Specialist (In-House or Agency)
* **The Necessity:** Converting 1M followers into consistent 100–200 daily orders requires systematic ad spend management.
* **Responsibilities:**
  - Manage Meta Ads Manager campaigns (Advantage+ Shopping, Dynamic Product Ads).
  - Sync Meta Product Catalog with the platform's inventory.
  - Monitor Cost Per Purchase (CPP) and maintain target ROAS (4x–6x+).
  - Retarget visitors who abandoned checkout using data captured by the platform's `/api/orders/lead` engine.

#### 5. Legal, Licensing & Commercial Compliance (Accountant / Legal Advisor)
* **The Necessity:** Regulated commercial operations in Bangladesh require mandatory credentials for merchant gateway onboarding and corporate courier contracts.
* **Deliverables Required:**
  - **Trade License:** Registered under E-Commerce / Retail Goods category.
  - **e-TIN & BIN:** 13-digit Business Identification Number (VAT Certificate) from NBR.
  - **DBID (Digital Business Identification):** Mandatory certification from the Ministry of Commerce for digital commerce entities.
  - **Corporate Bank Account:** Dedicated current account matching the trade license name for bKash Merchant and gateway disbursements.

---

## 4. Official Docs & Sources

- **Next.js Production Deployment Checklist**: [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- **MongoDB Atlas Connection Pooling & Scaling**: [MongoDB Atlas Best Practices](https://www.mongodb.com/docs/atlas/reference/amazon-aws/#connection-limits)
- **Meta Conversions API (CAPI) Official Specification**: [Meta CAPI Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- **Steadfast Courier Developer API**: [Steadfast Merchant API Guide](https://portal.steadfast.com.bd/)
- **Bangladesh DBID Registration Portal**: [Ministry of Commerce DBID](https://dbid.gov.bd/)
