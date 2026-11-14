# Backend Architecture Rules & Anti-Drift Standard (Next.js 16 App Router)

> **AUTHORITY: MANDATORY FOR ALL AI AGENTS & ENGINEERS**  
> Before modifying, adding, or refactoring any backend route, service, model, or database operation in this repository, you MUST read and adhere strictly to these rules. Any code that violates these principles introduces technical debt, circular dependencies, and security vulnerabilities.

---

## 🏛️ Rule 1: The 4-Tier Clean Domain Architecture

To prevent spaghetti code, duplication, and route handler bloat, the backend is strictly organized into 4 distinct tiers:

```
[ Client / Browser / Webhook ]
              │
              ▼
1. Transport Layer (Thin Controllers: src/app/api/**/route.ts)
   - ONLY extracts request body, query params, and headers.
   - Calls Domain Services in src/services/.
   - Returns standard envelope: apiSuccess() or apiError().
   - NO business logic, NO direct database calculations.
              │
              ▼
2. Domain Services Layer (Pure Business Engines: src/services/*.service.ts)
   - Contains ALL business logic, tariff calculations, and atomic stock operations.
   - Reusable across Route Handlers, Server Components (0ms in-memory), and Webhooks.
   - Pure, stateless async TypeScript functions (NO heavy OOP classes, NO DI bloat).
              │
              ▼
3. Data Persistence Layer (Mongoose Singleton: src/models/*.ts)
   - 11 Mongoose Schemas & POJO domain interfaces.
   - Connection cached globally in src/lib/db.ts to avoid Atlas pool exhaustion.
   - Strict compound indexes on all filter and sort fields.
              │
              ▼
4. Infrastructure & Integration Adapters (src/lib/)
   - Cloudflare R2 S3 SDK (src/lib/r2.ts).
   - Better Auth Server Instance (src/lib/auth.ts) & Client (src/lib/auth-client.ts).
   - Universal API envelope helpers (src/lib/api-response.ts).
```

---

## 🚫 Rule 2: Strict Prohibition of Internal `fetch()` in Server Components

* **The Rule:** In Next.js App Router, Server Components (`src/app/**/page.tsx` or `layout.tsx`) MUST NEVER call `fetch('/api/...')` or `fetch('http://localhost:3000/api/...')` to read their own data.
* **Why:** Internal `fetch()` creates an unnecessary TCP network loopback, cold-start latency, extra JSON serialization, and middleware overhead.
* **The Standard:** Server Components must import and invoke Domain Services directly in memory at **0ms latency**:
  ```typescript
  // ✅ CORRECT:
  import { getOrdersList } from '@/services/order.service';
  const { orders, total } = await getOrdersList({ limit: 20 });

  // ❌ STRICTLY FORBIDDEN:
  const res = await fetch('http://localhost:3000/api/orders');
  ```

---

## 📦 Rule 3: Universal API Response Envelope

Every App Router route handler (`src/app/api/**/route.ts`) MUST return the universal envelope from `src/lib/api-response.ts`. Never construct ad-hoc responses.

```typescript
// ✅ Success Response
return apiSuccess(data, {
  pagination?: ApiPaginationMeta, // total, page, pages, limit, hasNextPage, hasPrevPage
  message?: string,
  status?: number, // default: 200
});

// ❌ Error Response
return apiError(
  errorMessage: string,
  code: ApiErrorCode, // 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'OUT_OF_STOCK' | 'INTERNAL_ERROR'
  status: number,     // 400, 401, 403, 404, 409, 500
  details?: unknown
);
```

---

## 🛡️ Rule 4: Zero Overselling via Conditional Atomic Decrement

Inventory deduction MUST be executed at the database level using conditional atomic operators (`$inc` + `$gte`). Never compute inventory in Node.js memory.

```typescript
// ✅ CORRECT: Atomic decrement with zero-oversell guard
const res = await Product.updateOne(
  {
    _id: item.productId,
    'variants._id': item.variantId,
    'variants.stock': { $gte: item.quantity }, // Prevents negative inventory
  },
  {
    $inc: {
      'variants.$.stock': -item.quantity,
      totalStock: -item.quantity,
    },
  }
);
if (res.matchedCount === 0 || res.modifiedCount === 0) {
  // Item was out of stock -> Roll back any previously deducted items in this batch
  throw new Error('OUT_OF_STOCK');
}

// ❌ STRICTLY FORBIDDEN:
const p = await Product.findById(id);
p.stock = p.stock - qty; // RACE CONDITION VULNERABILITY!
await p.save();
```

---

## 🔒 Rule 5: Server-Authoritative Pricing (Zero Client Trust)

* **The Rule:** The server must NEVER read `unitPrice`, `discountPrice`, or `totalAmount` from the client request body.
* **The Standard:** All line-item prices MUST be resolved directly from the authoritative MongoDB `Product` and `Variant` records:
  ```typescript
  const unitPrice = variant?.discountPrice ?? variant?.price ?? product.discountPrice ?? product.basePrice;
  ```

---

## 🧹 Rule 6: Absolute Ban on Legacy Crutches & Aliases

The backend architecture is **100% Greenfield**. Do NOT introduce fallback chains or backward-compatible aliases in backend code:

| Entity | Strict Standard (Allowed) | Legacy Baggage (Strictly Banned) |
| :--- | :--- | :--- |
| **Media** | `media: IProductMedia[]` | ❌ `images`, `photos`, `IProductImage` |
| **Taxonomy** | `categorySlug`, `categoryName` | ❌ `primaryCategory` |
| **Order Status**| `orderStatus: OrderStatus` | ❌ `status` |
| **Inventory** | `inventoryState: 'NONE' \| 'RESERVED' \| 'DEDUCTED' \| 'RESTORED'` | ❌ Unmanaged stock states |
| **Audit Trail** | All models (`Brand`, `Coupon`, `Order`, `Product`, `Review`, `Category`, `Collection`) MUST have `createdBy`, `updatedBy`, `createdAt`, `updatedAt` | ❌ Missing audit author fields |

---

## 🔐 Rule 7: Better Auth & Edge Middleware Guard

* **Auth Engine:** All authentication runs through `better-auth` ([`src/lib/auth.ts`](file:///e:/WebDevs/Testing/e-com/src/lib/auth.ts)).
* **Edge Guard:** [`src/middleware.ts`](file:///e:/WebDevs/Testing/e-com/src/middleware.ts) protects all `/admin/**` routes on Vercel Edge. Unauthenticated visitors are redirected to `/admin/login` before reaching serverless functions.
* **Role Gate:** 5 distinct roles:
  1. `SUPER_ADMIN`: Full access + exclusive ownership of `/admin/settings` (`StoreConfig`).
  2. `ADMIN`: Catalog, categories, orders, and courier dispatches.
  3. `MODERATOR`: Restricted call center fulfillment (no deletions, no settings).
  4. `MERCHANT`: B2B wholesale pricing view.
  5. `USER`: Standard retail customer.

---

## 📊 Rule 8: Bounded Server-Side Pagination (`limit <= 50`)

Every list query and API endpoint (`/api/products`, `/api/orders`, `/api/customers`) MUST enforce bounded pagination:
```typescript
const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 50);
const page = Math.max(Number(rawPage) || 1, 1);
const skip = (page - 1) * limit;
```
Never return unbounded `find({})` queries in administrative list views or public catalogs.
