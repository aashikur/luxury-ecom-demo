# 📚 Developer Learning Notes & Project Reference Guide

> **Project:** Luxury Garments E-Commerce (Config-Driven MVP)  
> **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, MongoDB (Mongoose), Cloudinary  
> **Author & Learner:** Ashik Rahaman  
> **Date Started:** November 2026

---

## 1. What We Are Building & Why

Traditional e-commerce projects hardcode brand names, colors, and shipping fees directly in the UI code. If a new store owner comes along, a developer has to edit code files and redeploy.

In this architecture, we follow a **Zero-Hardcode / Config-Driven Architecture**:
1. **The Store Configuration lives in MongoDB:** The brand name, logo URL, dark/light theme colors, delivery fees (inside/outside Dhaka), and banners are stored in a single database document called `StoreConfig`.
2. **The Codebase is 100% DRY (Don't Repeat Yourself):** One master codebase can be deployed for different brands simply by changing environment variables and DB records.
3. **Optimized Media Pipeline:** Product images are uploaded to **Cloudinary** (CDN storage). MongoDB stores only `{ url, publicId }`, keeping the database fast, lightweight, and clean.
4. **Frictionless Bangladesh COD Checkout:** Zero-login guest checkout optimized for high conversion (Name, Phone number, Delivery Zone, Cash on Delivery).

---

## 2. Directory Structure & Folder-by-Folder Guide

Here is a map of the project structure and the exact responsibility of every folder:

```text
e-com/
├── docs/                       # Project documentation, learning notes & guides
├── public/                     # Static public assets (SVGs, favicon, public icons)
├── src/
│   ├── app/                    # Next.js App Router (Pages, Layouts & API Routes)
│   │   ├── api/                # Backend HTTP API endpoints (CRUD operations, uploads)
│   │   ├── layout.tsx          # Root layout wrapping the entire app (HTML, fonts, global providers)
│   │   ├── page.tsx            # Main storefront home page
│   │   └── globals.css         # Global Tailwind CSS styles and custom theme variables
│   │
│   ├── components/             # Reusable React UI Components
│   │   ├── shared/             # Components used across storefront & admin (ImageUploader, Modal)
│   │   ├── storefront/         # Customer-facing UI (Navbar, Hero, ProductCard, CartDrawer)
│   │   └── admin/              # Merchant Dashboard UI (ProductForm, OrdersTable)
│   │
│   ├── lib/                    # Server-side utilities, connection singletons & SDK clients
│   │   ├── db.ts               # Mongoose connection manager with global singleton caching
│   │   └── cloudinary.ts       # Cloudinary SDK configuration for uploads & asset deletion
│   │
│   └── models/                 # Database Schema definitions (Mongoose)
│       ├── StoreConfig.ts      # Branding, delivery charges, theme colors, feature flags
│       ├── Product.ts          # Garment catalog, sizes, variants, pricing, and images
│       └── Order.ts            # Customer orders, cart items, COD status, delivery address
│
├── .env.example                # Safe template showing required environment variable names
├── .env.local                  # Local secrets (NEVER committed to Git!)
├── .gitignore                  # Tells Git which files/folders to never track (like node_modules, .env.local)
├── package.json                # Defines installed dependencies and executable npm scripts
├── tsconfig.json               # TypeScript compiler options and "@/*" path alias definitions
└── next.config.ts              # Next.js framework configuration (image domains, redirects)
```

---

## 3. Deep-Dive: What Each Root Configuration File Does

### 1. `package.json`
* **`dependencies`**: The packages required when the app is actively running:
  * `next`, `react`, `react-dom`: The core React web framework.
  * `mongoose`: The MongoDB object modeling library.
  * `cloudinary`: SDK to upload and delete images on Cloudinary.
  * `lucide-react`: Lightweight SVG icon set.
* **`devDependencies`**: Tools only used by developers during coding:
  * `typescript`, `@types/*`: Type definitions for compile-time checking.
  * `tailwindcss`: Generates CSS classes on demand.
  * `eslint`: Checks for syntax bugs and code smells.
* **`scripts`**:
  * `npm run dev`: Boots the local server on `http://localhost:3000`.
  * `npm run build`: Compiles optimized production bundle.
  * `npm start`: Runs the production server after building.

### 2. `src/lib/db.ts` (The Mongoose Connection Singleton)
* **Problem:** In Next.js App Router, every file save in development triggers a rebuild, and serverless functions spin up dynamically. If you call `mongoose.connect()` directly inside routes, each reload spawns a brand new database connection until MongoDB Atlas crashes with `Connection pool exhausted`.
* **Solution:** We cache the active Mongoose connection promise in Node’s `global` object (`global.mongooseCache`). On every request, `connectDB()` reuses the existing cached connection.

### 3. `.env.local` vs `.env.example`
* **Security Golden Rule:** Never commit passwords, database connection strings, or API secrets to GitHub.
* `.gitignore` automatically blocks `.env*.local` from ever being uploaded to Git.
* `.env.example` is committed to Git as a blank template so other developers know which keys the app requires without revealing actual secrets.

---

## 4. Terminal Command Cheat-Sheet (What Was Run & Why)

| Command | Purpose | Why We Used It |
| :--- | :--- | :--- |
| `npx create-next-app@latest . ...` | Project Scaffolding | Generated the Next.js app with TypeScript, Tailwind CSS, App Router, and `@/*` alias directly in this directory. |
| `npm install mongoose cloudinary lucide-react` | Dependency Installation | Added MongoDB ORM (`mongoose`), image CDN SDK (`cloudinary`), and UI icons (`lucide-react`). |
| `git status` | Source Control Check | Inspects which files have been modified, created, or deleted since the last commit. |
| `git add <files>` | Staging Changes | Prepares selected files to be included in the next snapshot (commit). |
| `git commit -m "..."` | Saving Snapshot | Records a permanent snapshot of the staged files with an explanatory commit message. |
| `git push -u origin <branch>` | Remote Upload | Uploads your local commits to a remote hosting platform like GitHub. |
