# 10 - Store Settings & Configuration Architecture Scope (`StoreConfig`)

## Overview
For a production-grade, white-label, multi-niche e-commerce platform designed for rapid, 1-click per-client deployments, the **Admin Settings (`StoreConfig` / `/admin/settings`)** allows merchants and agency operators to configure, brand, and launch a complete e-commerce store in minutes without writing or modifying a single line of application code.

---

## The 7 Core Setting Modules

### 1. General Branding & Store Identity
Controls the look, feel, niche, and layout orientation of the store.
- **Store Name & Tagline**: e.g., `Aurem Luxury` — *"Engineered Streetwear & Minimal Garments"*.
- **Store Niche**:
  - `CLOTHING` (activates Size Charts, Swatches, Fabric specs)
  - `GADGETS` (activates Specs, RAM/ROM matrix, Warranty modifiers)
  - `FOOD` (activates Toppings, Prep time, Dietary tags)
  - `GENERAL` (universal e-commerce layout)
- **Store Mode**:
  - `MULTI_PRODUCT`: Full catalog browsing with categories and collections.
  - `SINGLE_PRODUCT_FUNNEL`: High-converting single-page landing funnel focused on one hero product (`featuredProductSlug`).
- **Logo & Favicon**: Cloudflare R2 / CDN image uploads for desktop header and browser tab favicon.
- **Dynamic Color Tokens**:
  - Accent Color (`#076E46` / `#B8860B`)
  - Background & Surface tokens
  - Dark / Light Theme Mode toggle
- **Hero Variant**: `SPLIT` | `CENTER` | `FULL_SLIDER`.
- **Currency & Global Symbols**:
  - Currency Symbol: `৳` (Default)
  - Currency Code: `BDT`
- **Announcement Bar**:
  - Enable/Disable Toggle
  - Banner Text: e.g. *"Free express delivery across Bangladesh on orders over ৳2,500"*

#### 1.1 Header Navigation & Quick Category Bar (`headerNavLinks`)
Provides the luxury e-commerce split navbar layout: `[Logo] [ Menu ▾ ] | [ Category 1 ] [ Category 2 ] ... [ Cart / Search ]`:
- **Universal "Menu" Trigger (All Categories Mega Menu / Drawer):**
  - Always visible across Mobile and Desktop.
  - Hover or click reveals the complete 3-level taxonomy tree (`Root Category ➔ Sub-Category ➔ Sub-Sub Category`) dynamically queried from `Category` collection.
- **Configurable Pinned Quick Links (`StoreConfig.headerNavLinks[]`):**
  - Next to the "Menu" button, the admin can feature 1 to 4+ high-converting or seasonal categories (e.g. *Hoodies, Winter Drop, Oversized Tees*).
  - **Embedded Schema Fields:**
    - `id`: unique string identifier (e.g. `nav_1`)
    - `label`: Display text on navbar (e.g. `Heavyweight Hoodies`)
    - `href`: Target URL (e.g. `/category/hoodies`)
    - `categoryId`: Optional ObjectId reference to `Category`
    - `badgeText`: Optional promotional pill (e.g. `HOT`, `NEW`, `SALE`)
    - `isActive`: Boolean visibility toggle (👁️ Eye icon)
    - `order`: Numeric sort position (⬆️ ⬇️ Move Up / Down)
- **Admin Management Operations (`/admin/settings`):**
  - **Reorder:** Move Up / Down buttons to rearrange order in real-time.
  - **Hide/Unhide (👁️ Eye Icon):** Instantly toggle visibility on the storefront without deleting the link.
  - **Add Link (`+ Add Quick Link`):** Dropdown modal allowing one-click selection of existing Category / Sub-Category (auto-fills label & href) or custom manual URL.
  - **Delete (`🗑️ Trash Icon`):** Remove obsolete quick links permanently.
- **Responsive Presentation:**
  - **Desktop:** Inline horizontal category pills next to the "Menu" trigger + Mega-Menu dropdown.
  - **Mobile:** Slide-over category drawer on Menu tap + horizontal touch-scrollable category chips below the header.

---

### 2. Logistics, Delivery & Contacts (Shipping Rates & Helpdesk)
Manages delivery tariffs, delivery policy, free shipping progress bar, and customer communication channels.
- **Inside Dhaka Delivery Fee**: Flat rate for city deliveries (Default: `৳70`).
- **Dhaka Suburbs Delivery Fee (Gazipur, Savar, Narayanganj)**: Tariff for perimeter zones (Default: `৳100`).
- **Outside Dhaka Delivery Fee**: Nationwide courier rate for 63 districts (Default: `৳130`).
- **Free Shipping Toggle & Threshold**:
  - `isFreeShippingEnabled`: Enable/Disable switch for free shipping campaigns.
  - `freeShippingThreshold`: Order amount required to unlock free shipping (Default: `৳2,500`). Powers the live progress meter in Cart Drawer.
- **Estimated Delivery Timelines**:
  - Inside Dhaka: e.g. `24-48 Hours`
  - Outside Dhaka: e.g. `3-5 Days`
- **Customer Helpline & Social Contacts**:
  - Hotline Phone: e.g. `01700000000` (appears on top announcement bar, footer, and invoice)
  - WhatsApp Order Hotline: e.g. `8801700000000` (sanitized for instant `https://wa.me/` floating chat)
  - Support Email: e.g. `support@aurem.com`
  - Helpline Availability Hours: e.g. `10:00 AM - 10:00 PM (Everyday)`
  - Showroom / Outlet Address: e.g. `Banani 11, Dhaka, Bangladesh`
- **Delivery Policy Note**: Checkout trust reminder (e.g. *"পণ্য ডেলিভারিম্যানের সামনে চেক করে গ্রহণ করুন"*).

---

### 3. Payment Methods (Gateways & Manual Wallets)
Supports cash on delivery alongside automated and manual mobile financial services.
- **Cash on Delivery (COD)**:
  - Enabled / Disabled switch
  - Checkout instructions note: e.g., *"পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করুন"*
- **Manual bKash, Nagad & Rocket**:
  - Individual Enabled / Disabled switches
  - Wallet Numbers (e.g. `017xxxxxxxx`)
  - Account Type (`PERSONAL` | `AGENT` | `MERCHANT`)
  - Step-by-step instructions (e.g. *"বিকাশ সেন্ড মানি করে ট্রানজেকশন আইডি দিন"*)
- **Automated Payment Gateways (Ready for API integration)**:
  - `bKash PGW`: App Key, App Secret, Username, Password, Sandbox switch.
  - `SSLCommerz`: Store ID, Store Password, Sandbox switch.

---

### 4. Courier Integration & Fraud Shield
Automated dispatching and return fraud prevention for Bangladesh logistics.
- **Default Courier Provider**: `STEADFAST` | `PATHAO` | `REDX`.
- **Steadfast API Credentials**:
  - `API Key`, `Secret Key`, `Base URL`.
- **Pathao Courier Credentials**:
  - `Store ID`, `Client ID`, `Client Secret`, `Username`, `Password`, `Base URL`.
- **Auto Booking Switch**: Approving an order in admin automatically generates a consignment note and tracking code in the courier portal.
- **Fraud Risk Shield**:
  - Queries customer phone number against courier delivery success rates.
  - **Alert Threshold Rate**: Configurable threshold (Default: `< 60%`). Flags orders below this delivery success rate as **High Risk** to prevent return delivery fee losses.
  - **Auto-Hold High Risk Orders**: Switch to automatically hold flagged orders for phone verification before dispatching.
- **Advance Delivery Charge Protection (Configurable Amount & Toggle)**:
  - **Enabled / Disabled Toggle**: Merchant can turn advance payment requirement ON or OFF anytime.
  - **Charge Scope**: Outside Dhaka Only (Recommended) or All Orders.
  - **Configurable Amount**: Customizable advance fee input (Default: `৳130`, e.g. 100/130/150).
  - **Payment Wallet & Instructions**: Select bKash / Nagad / Rocket, enter wallet number and instructions note for customers.

---

### 5. Marketing, Tracking & Pixels
Full-funnel attribution, user behavior heatmaps, and advertising tracking.
- **Meta (Facebook) Pixel & CAPI**:
  - Meta Pixel ID
  - Meta Conversions API (CAPI) Server Token
  - Test Event Code
- **Google Analytics 4 (GA4) & GTM**:
  - GA4 Measurement ID (`G-XXXXXXXX`)
  - GTM Container ID (`GTM-XXXXXX`)
- **Microsoft Clarity (Free Heatmaps & Screen Recording)**:
  - Clarity Project ID (`clarityProjectId`)
  - Enables 100% free visual replay of user sessions, click heatmaps, and checkout friction points without needing GTM.
- **TikTok Pixel & Events API**:
  - TikTok Pixel ID & Events API Token.

---

### 6. Drag-and-Drop Homepage Layout Builder (`homeSections`)
Zero-code homepage visual arrangement stored as an array in `StoreConfig`.
- Configurable blocks:
  - `id`: unique section identifier
  - `type`: `HERO_BANNER` | `COLLECTION_SECTION` | `PROMO_CTA_CARD`
  - `title` & `subtitle`: Section headings
  - `collectionSlug`: Associated product collection (e.g. `"winter-drop-2026"`)
  - `isActive`: Toggle visibility on the storefront
  - `order`: Move Up / Down controls to rearrange sections visually.

---

### 7. Global Feature Toggles (1-Click Feature Activation)
Enables or disables operational features on the fly:
- `smartCheckoutEnabled`: When enabled (`true`, default), order placement completes directly inside the slide-over sidebar drawer (`CartDrawer`) with zero page redirect. When disabled (`false`), clicking checkout routes to the dedicated `/checkout` page.
- `abandonedCartCapture`: Instantly records checkout leads as `INCOMPLETE` orders as soon as the phone number is entered.
- `fraudCheckEnabled`: Automatically checks customer courier delivery history upon order submission.
- `advanceDeliveryFeeEnabled`: Requires outside-Dhaka customers to pay delivery fees in advance.
- `couponEnabled`: Shows promo coupon input box at checkout.
- `capiEnabled`: Dispatches server-side conversion events to Meta CAPI.
- `gtmEnabled`: Dispatches events to Google Tag Manager dataLayer.
- `tiktokPixelEnabled`: Dispatches events to TikTok Pixel.
- `clarityEnabled`: Loads Microsoft Clarity session recorder and heatmaps.

---

## 8. Store Secrets & Security Architecture (The 3-Layer Shield)

To balance rapid, 1-click merchant deployments with banking-grade credential protection:

### Layer 1: Server Environment (`.env`)
- `MONGODB_URI` and master `ENCRYPTION_KEY` (32-byte hex secret) reside strictly on the server / Vercel Environment Variables.
- Never exposed via API, never committed to Git, never sent to the browser.

### Layer 2: Field-Level AES-256-GCM Encryption at Rest (MongoDB Atlas)
- High-risk third-party secrets stored in `StoreConfig` are encrypted using `ENCRYPTION_KEY` prior to persisting in the database:
  - `courier.steadfast.secretKey`
  - `payment.bkashPGW.appSecret` & `password`
  - `payment.sslCommerz.storePass`
  - `tracking.metaCapiToken` & `tracking.tiktokEventsApiToken`
- Stored as ciphertext (`enc:v1:7a9f8c4...`). Even a full MongoDB backup dump leaves all secrets completely unreadable.

### Layer 3: Public Projection Sanitization
- Storefront client endpoints (`GET /api/config`) query MongoDB with projection stripping all secret fields.
- Public customers/browsers only receive public tokens (`metaPixelId`, `ga4MeasurementId`, `branding`, `logistics`).

### Layer 4: Super-Admin RBAC & Masked Settings UI
- Modifying store configuration (`PUT /api/config`) strictly requires an authenticated `SUPER_ADMIN` HttpOnly session cookie.
- Admin input fields render secrets masked (`••••••••••••••••`) to eliminate shoulder surfing or cleartext network echoing.
- Third-party API interactions (Steadfast booking, bKash PGW checkout, Meta CAPI dispatch) run **100% server-to-server** inside Next.js API routes where keys are decrypted in server memory in-flight.
