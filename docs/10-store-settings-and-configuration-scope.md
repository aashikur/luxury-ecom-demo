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

---

### 2. Logistics & Delivery (Shipping Rates & Helpdesk)
Manages delivery tariffs and customer communication channels.
- **Inside Dhaka Delivery Fee**: Flat rate for city deliveries (e.g. `৳70`).
- **Outside Dhaka Delivery Fee**: Nationwide courier rate (e.g. `৳130`).
- **Free Shipping Threshold**: Order amount required to unlock free shipping (e.g. `৳2,500`).
- **Estimated Delivery Timelines**:
  - Inside Dhaka: e.g. `1-2 Days`
  - Outside Dhaka: e.g. `3-5 Days`
- **Customer Helpline Contacts**:
  - Hotline Phone: e.g. `01700000000`
  - WhatsApp Order Number: e.g. `8801700000000`
  - Showroom / Outlet Address: e.g. `Banani 11, Dhaka, Bangladesh`

---

### 3. Payment Methods (Gateways & Manual Wallets)
Supports cash on delivery alongside automated and manual mobile financial services.
- **Cash on Delivery (COD)**:
  - Enabled / Disabled switch
  - Checkout instructions note: e.g., *"পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করুন"*
- **Manual bKash & Nagad**:
  - Enabled switch
  - Wallet Number (e.g. `018xxxxxxxx`)
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
- **Auto Booking Switch**: Approving an order in admin automatically generates a consignment note and tracking code in the courier portal.
- **Fraud Risk Shield**:
  - Queries customer phone number against courier delivery success rates.
  - Flags orders with `< 60%` delivery success as **High Risk** to prevent return delivery fee losses.
- **Advance Delivery Charge Protection**:
  - Required for Outside Dhaka (Yes/No).
  - Advance Amount (e.g. `৳130` via bKash before shipping to prevent fake orders).

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
- `abandonedCartCapture`: Instantly records checkout leads as `INCOMPLETE` orders as soon as the phone number is entered.
- `fraudCheckEnabled`: Automatically checks customer courier delivery history upon order submission.
- `advanceDeliveryFeeEnabled`: Requires outside-Dhaka customers to pay delivery fees in advance.
- `couponEnabled`: Shows promo coupon input box at checkout.
- `capiEnabled`: Dispatches server-side conversion events to Meta CAPI.
