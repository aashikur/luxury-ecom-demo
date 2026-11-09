# 00. Documentation Protocol & Note-Taking Standard

> **Directive for All AI Assistants & Engineers Working on this Codebase:**  
> Maintain documentation in this `docs/` directory strictly following this protocol. Do not write massive 1,000-line unorganized text blocks. Keep every lesson split, modular, and instantly scannable for quick revision and interview prep.

---

## 1. File Naming Convention
* Use two-digit sequential prefixes:
  * `00-how-to-notes.md` (This standard protocol)
  * `01-database-mongodb.md` (Database singleton, health checks)
  * `02-storage-cloudinary-vs-r2.md` (Media storage, S3/R2 architecture)
  * `03-schemas-and-models.md` (Mongoose Schemas: Config, Product, Order)
  * `04-api-and-crud.md` (Next.js route handlers, uploads, validations)
  * `05-storefront-and-cart.md` (State management, guest cart, UI)
  * `06-checkout-and-orders.md` (1-page COD flow)
  * `07-admin-dashboard.md` (Catalog management & order fulfillment)

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

---

## 4. UI Design & Engineering References
* **Dashboard UI Inspiration:** [Apex Shadcn Dashboard](https://apex-shadcn.dashboardpack.com/products/prod-1)
* **Tone & Styling Standard:** Ultra-clean, minimalistic senior-engineer UI. No decorative notice fluff, emojis, sparkles, or excessive AI badges.
