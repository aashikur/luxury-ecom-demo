# 00. Documentation Protocol & Note-Taking Standard

> **Directive for All AI Assistants & Engineers Working on this Codebase:**  
> Maintain documentation in this `docs/` directory strictly following this protocol. Do not write massive 1,000-line unorganized text blocks. Keep every lesson split, modular, and instantly scannable for quick revision and interview prep.

---

## 1. Documentation Separation of Concerns (SoC) & Master Index

To prevent confusion between **CR-Locked Production Rules**, **Domain Specifications**, **API Contracts**, and **Historical MVP Learning Notes**, all `docs/` files follow this 5-tier hierarchy:

### Tier 1: Authoritative CR-Locked Pipeline Specs (`docs/pipeline/`)
* `docs/pipeline/01-scope-and-business-rules.md` — **Step 1 🔒 CR-LOCKED (`CR-000`):** Single Source of Truth for business rules (`Rules #1 – #23`), security, RBAC, caching, and performance SLAs.
* `docs/pipeline/scope.md` — Master 7-Step Pipeline Tracker, v1 MVP vs v2 Rebuild status, and per-task changelog.

### Tier 2: Domain Architecture & Design Rules
* `.gemini/rules/admin-ui-design-system.md` & `docs/08-admin-design-hierarchy-and-ui-tokens.md` — Locked Admin UI tokens (`#060d11`, `#076E46`).
* `docs/09-database-collection-architecture.md` — 7 Core + 4 Growth MongoDB collection boundaries (11 total).
* `docs/10-store-settings-and-configuration-scope.md` — 7-module `StoreConfig` specification & 3-Layer Secret Shield.
* `docs/11-nextjs-caching-ssg-dynamic-rendering-and-revalidation.md` — Next.js 16 Split Cache, `getPublicStoreConfig()`, `bf-cache`, & `revalidateTag`.
* `docs/PROMPT_LIBRARY.md` — Ready-to-use AI/developer engineering prompts.

### Tier 3: Live API Contract
* `docs/postman/API_REFERENCE.md` — Active + v2 target HTTP endpoints, payloads, RBAC gates, and revalidation behavior.

### Tier 4: Historical MVP Study Notes (`01`–`07` & Reference Guides)
* `docs/00-how-to-notes.md` (This protocol)
* `docs/01-database-mongodb.md` (DB singleton & health probe)
* `docs/02-storage-cloudinary-vs-r2.md` (Media storage & Cloudflare R2 `$0` egress)
* `docs/03-schemas-and-models.md` (Early v1 3-model study note)
* `docs/04-api-and-uploads.md` (Early v1 upload & config study note)
* `docs/05-ui-audit-and-typography-refinement.md` (Early v1 storefront typography & theme note)
* `docs/06-admin-dashboard-and-settings.md` (Early v1 5-tab settings study note)
* `docs/07-admin-products-management.md` (Admin products table, MediaUploader, & live sync guide)
* `docs/PROJECT_REFERENCE_NOTES.md` (Early v1 folder walkthrough)
* `docs/server-guide.md` (Traffic math, Cloudflare CDN, & Upstash rate-limiting guide)

### Tier 5: Production Hardening & Launch Sign-Off
* `docs/PRODUCTION_CHECKLIST.md` — Pre-launch Step 7 verification checklist & AI review format.

---

## 2. Mandatory 4-Section Template for Every Note File

Every new note file must strictly follow this exact 4-part structure:

### `## 1. What We Built`
* Exact file paths created or modified (e.g. `src/lib/db.ts`).
* Concrete list of functions, components, or endpoints added.

### `## 2. Why We Built It (Senior Engineering / Interview Concept)`
* The architectural reason why this exists (e.g. Serverless connection pooling, \$0 egress fees).
* The bug or disaster that happens if you don't do it this way.
* Ready-to-use answer for technical job interviews.

### `## 3. Key Concepts Checklist (Quick Revision)`
* Crisp bullet points and diagrams.
* No filler words; bullet-driven mental models only.
* Cheat-sheet tables comparing alternatives when relevant.

### `## 4. Official Docs & Sources`
* Clickable links to official documentation for independent verification and deep-dive reading.

---

## 3. Rules of Engagement
1. **Real-Time API & Postman Documentation:** Whenever any backend API route or endpoint is created or modified, it MUST be documented immediately in `docs/postman/API_REFERENCE.md`. Every endpoint entry must specify:
   * **Endpoint & HTTP Method** (`GET`, `POST`, `PUT`, `DELETE`)
   * **Consumer / Who Uses It** (e.g. `Storefront Guest Checkout`, `Admin Dashboard`, `DevOps Monitor`)
   * **Request Payload / Params** (Headers, Query string, or Body JSON)
   * **Response Payload (Success & Error)** with HTTP status codes.
2. **Never dump secrets:** Never write actual passwords, secret keys, or tokens in documentation. Use placeholders (`<password>`, `your_api_key`).
3. **Update on feature completion:** After building a new milestone, create or update the corresponding split note file before moving to the next phase.
4. **Keep it scannable:** A developer should be able to review the entire concept in **under 2 minutes** before an interview or code review.
5. **Continuous Pipeline & Scope Tracking (`docs/pipeline/scope.md`):**
   * Whenever any task, feature, or refactor is implemented, `docs/pipeline/scope.md` **MUST be updated continuously in the same work cycle**.
   * It serves as the single source of truth for the platform's overarching scope, granular module completion status, technical specifications (APIs, data models, constraints), and per-task changelog.
   * Every AI agent or engineer must verify and update `docs/pipeline/scope.md` upon completing any milestone before marking the task complete.
6. **Change Request (CR) Discipline for Locked Pipeline Steps:**
   * Once a pipeline document (e.g. `docs/pipeline/01-scope-and-business-rules.md`) is marked `🔒 CR-LOCKED`, any modification to locked rules MUST be recorded in that document's `Change Request (CR) Log` with CR ID, impacted steps, and explicit human approval.
   * When any conflict exists between a Tier 4 Historical MVP Study Note (`01`–`07`, `PROJECT_REFERENCE_NOTES.md`) and Tier 1 (`docs/pipeline/01-scope-and-business-rules.md`), **Tier 1 ALWAYS wins**.

---

## 4. UI Design & Engineering References
* **Dashboard UI Inspiration:** [Apex Shadcn Dashboard](https://apex-shadcn.dashboardpack.com/products/prod-1)
* **Tone & Styling Standard:** Ultra-clean, minimalistic senior-engineer UI. No decorative notice fluff, emojis, sparkles, or excessive AI badges.
* **Prompt Library:** Master AI & engineering prompt templates are stored in `docs/PROMPT_LIBRARY.md`.

