# 📚 Developer Learning Notes & Project Reference Guide

> **Status:** Tier 4 Historical MVP Study Note (`v1` — Day-1 architecture snapshot). For current CR-Locked v2 specifications (11 collections, 5 RBAC roles, Unified Payment Adapter, & Zero-Latency SLAs), follow [`docs/pipeline/01-scope-and-business-rules.md`](./pipeline/01-scope-and-business-rules.md) & [`docs/00-how-to-notes.md`](./00-how-to-notes.md).  
> **Project:** Luxury Garments E-Commerce (Config-Driven MVP)  
> **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, MongoDB (Mongoose), Cloudflare R2 (S3 SDK), Cloudinary  
> **Author & Learner:** Ashik Rahaman  
> **Date Started:** November 2026

---

## 1. What We Are Building & Why

Traditional e-commerce projects hardcode brand names, colors, and shipping fees directly in the UI code. If a new store owner comes along, a developer has to edit code files and redeploy.

In this architecture, we follow a **Zero-Hardcode / Config-Driven Architecture**:
1. **The Store Configuration lives in MongoDB:** The brand name, logo URL, dark/light theme colors, delivery fees (inside/outside Dhaka), payment options, tracking tokens, and homepage layout blocks live in a single document called `StoreConfig`.
2. **The Codebase is 100% DRY (Don't Repeat Yourself):** One master codebase can be deployed for different brands simply by changing environment variables and DB records.
3. **High-Scale Media Pipeline:** 
   * **Cloudflare R2 (Primary Storage):** S3-compatible, **\$0 Egress bandwidth fees** engineered for 1M+ monthly users.
   * **Cloudinary (Transformations):** On-the-fly image transformations and fast fallback CDN.
   * **YouTube Iframe Player:** \$0 bandwidth video streaming for reels and shorts.
   * **MongoDB:** Stores only `{ url, key }`, keeping the database ultra-fast and lightweight.
4. **Shopify-Style Homepage Customizer:** Dynamic `homeSections` array allowing the admin to reorder, add, or remove banner and category blocks without writing code.
5. **Flexible Product Collections:** Tag-based collections (`collections: ["hoodies", "winter-drop", "featured"]`) replacing rigid boolean flags.
6. **Frictionless Bangladesh COD Checkout:** Zero-login guest checkout with 11-digit BD phone validation, auto-lead capture for abandoned carts (`INCOMPLETE`), and manual MFS verification (`senderPhone`, `trxId`).

---

## 2. Directory Structure & Folder-by-Folder Guide

```text
e-com/
├── docs/                       # Project documentation & split modular learning notes
│   ├── 00-how-to-notes.md      # Note-taking standard protocol (AI & developer guideline)
│   ├── 01-database-mongodb.md  # MongoDB singleton & connection lifecycle guide
│   ├── 02-storage-cloudinary-vs-r2.md # Cloudinary vs Cloudflare R2 evaluation & S3 setup
│   ├── 03-schemas-and-models.md # StoreConfig, Product, and Order data architecture
│   └── PROJECT_REFERENCE_NOTES.md # This master reference document
│
├── public/                     # Static public assets (SVGs, favicon, public icons)
├── src/
│   ├── app/                    # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── api/                # Backend HTTP API endpoints
│   │   │   └── health/route.ts # Multi-service live health check (DB + Cloudinary + R2)
│   │   ├── layout.tsx          # Root layout wrapping the entire app
│   │   ├── page.tsx            # Main storefront home page
│   │   └── globals.css         # Global Tailwind CSS styles and custom theme variables
│   │
│   ├── components/             # Reusable React UI Components
│   │   ├── shared/             # Cross-cutting components (ImageUploader, FeatureGate)
│   │   ├── storefront/         # Customer-facing UI (Navbar, Hero, ProductCard, CartDrawer)
│   │   └── admin/              # Merchant Dashboard UI (ProductForm, OrdersTable)
│   │
│   ├── lib/                    # Server-side utilities, singletons & cloud SDK clients
│   │   ├── db.ts               # Mongoose connection manager with global singleton caching
│   │   ├── cloudinary.ts       # Cloudinary SDK client configuration
│   │   ├── r2.ts               # Cloudflare R2 S3 SDK client initialization
│   │   └── storage.ts          # Upload & delete helpers for Cloudflare R2
│   │
│   └── models/                 # Database Schema definitions (Mongoose + TypeScript)
│       ├── StoreConfig.ts      # Branding, homeSections, logistics, payments, tracking, features
│       ├── Product.ts          # Garment catalog, collections, variants (sizes/stock), sizeChart, priority
│       └── Order.ts            # Guest checkout, 7 lifecycle states, COD, manual bKash/Nagad, courier
│
├── .env.example                # Safe template showing required environment variable names
├── .env.local                  # Local secrets (NEVER committed to Git!)
├── .gitignore                  # Tells Git which files/folders to never track
├── package.json                # Defines installed dependencies and executable npm scripts
├── tsconfig.json               # TypeScript compiler options and "@/*" path alias definitions
└── next.config.ts              # Next.js config with remotePatterns whitelisting for R2 & Cloudinary
```

---

## 3. Deep-Dive: Core Configuration & Packages

### 1. `package.json` Dependencies
* **`next`, `react`, `react-dom`:** Modern React web framework with App Router & Turbopack.
* **`mongoose`:** MongoDB Object Data Modeling with strict schemas and connection pooling.
* **`@aws-sdk/client-s3`:** Official AWS S3 SDK used to communicate with Cloudflare R2.
* **`cloudinary`:** SDK for media uploads and dynamic optimizations.
* **`lucide-react`:** Lightweight SVG icon set.

### 2. Live Cloud Infrastructure
* **MongoDB Atlas Cluster:** Target database `ecom_demo` running on AWS (Singapore region), firewall configured with `0.0.0.0/0`.
* **Cloudflare R2 Bucket:** `ecom-demo` with custom domain `cdn-demo.vectorfitlab.com` and public dev URL enabled.
* **Cloudinary:** Account active (`dlfrd8scy`).
* **Health Check API:** Verified via `GET /api/health` returning live status for all 3 cloud services.

---

## 4. Terminal Command Cheat-Sheet (What Was Run & Why)

| Command | Purpose | Why We Used It |
| :--- | :--- | :--- |
| `npx create-next-app@latest . ...` | Project Scaffolding | Next.js with TypeScript, Tailwind CSS, App Router, and `@/*` alias. |
| `npm install mongoose cloudinary lucide-react` | Core Dependencies | Added DB ORM, Cloudinary SDK, and UI icons. |
| `npm install @aws-sdk/client-s3` | S3 SDK Installation | Added AWS S3 client to communicate directly with Cloudflare R2. |
| `npm run test:db` | Database Test | Runs `scripts/test-db.mjs` to measure MongoDB latency and connectivity. |
| `curl http://localhost:3000/api/health` | Health Check | Validates that DB, Cloudinary, and R2 are operational in a single call. |
| `git status / add / commit / push` | Source Control | Tracks changes locally and pushes commits to the remote GitHub repository. |
