# 13. Better Auth & 4-Tier Domain Services Architecture

> **Architecture Standard & Implementation Guide:**  
> This document codifies the technical integration of **Better Auth** with Next.js 16 App Router, MongoDB Atlas, Edge Middleware, and the 4-Tier Domain Services pattern.

---

## 1. What We Built

### Files Created & Integrated
* `src/lib/auth.ts`: Better Auth server configuration with MongoDB adapter, email/password credentials, and administrative 5-role RBAC schema.
* `src/lib/auth-client.ts`: Better Auth client instance exposing React hooks (`signIn`, `signOut`, `useSession`) for storefront and admin UI.
* `src/app/api/auth/[...all]/route.ts`: Wildcard App Router route handler serving Better Auth authentication endpoints (`toNextJsHandler(auth.handler)`).
* `src/middleware.ts`: Next.js Edge Middleware verifying Better Auth sessions and shielding `/admin/**` with role-based access control (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`).
* `src/services/auth.service.ts`: Administrative auth domain service providing helper methods for staff verification, session inspection, and audit trail hooks.
* `src/services/order.service.ts`: Reusable order business engine handling server-authoritative pricing, 3-zone tariffs, and atomic inventory locks.

---

## 2. Why We Built It (Senior Engineering / Interview Concept)

### Why Better Auth over NextAuth v5 or Hosted SaaS (Clerk/Auth0)?
1. **Zero External Dependency & Zero SaaS Vendor Lock-in:**  
   Unlike Clerk or Auth0, which charge recurring monthly active user (MAU) fees and can take down your store during third-party outages, Better Auth is self-hosted and directly queries your own MongoDB Atlas database.
2. **Next.js 16 & Edge Middleware Compatibility:**  
   NextAuth v5 has undergone breaking API changes and edge runtime incompatibilities. Better Auth uses standard Web Crypto API (`jose`) and cookie mechanisms that execute cleanly in Next.js Edge Middleware with zero cold-start delay.
3. **Hybrid E-Commerce Multi-Channel Support:**  
   In luxury garments e-commerce, **Guest Checkout must be 100% passwordless and frictionless** (3 fields: Name, Phone, Address). However, Staff requires strong password/2FA RBAC, and future customers can optionally log in via **Phone Number OTP** or **Google OAuth** for order tracking. Better Auth accommodates all three channels natively.

### Why 4-Tier Domain Services over Fat Route Handlers?
1. **Server Component 0ms Invocation:**  
   In Next.js App Router, a Server Component (`src/app/(admin)/admin/orders/page.tsx`) must NEVER execute `fetch('http://localhost:3000/api/orders')`. That introduces unnecessary TCP loopback, latency, and serialization overhead. With `src/services/order.service.ts`, the Server Component imports `getOrdersList()` directly, executing in memory at 0ms.
2. **Webhook & Cron Reusability:**  
   When Steadfast Courier sends a parcel delivery webhook or SSLCommerz sends an IPN payment confirmation, the webhook handler simply calls `orderService.updateOrderStatus()`. Business logic is never duplicated across route handlers.

---

## 3. Key Concepts Checklist (Quick Revision)

* [x] **Thin Controllers:** `src/app/api/**/route.ts` only extracts body/params, calls the Domain Service, and wraps output in `{ success, data, pagination, error, code }`.
* [x] **Edge Gatekeeper:** `src/middleware.ts` runs on Vercel Edge. Unauthenticated visitors hitting `/admin/**` are redirected to `/admin/login` before reaching serverless functions.
* [x] **Atomic Inventory Guarantee:** Stock decrement uses `{ 'variants.stock': { $gte: qty } }` with `$inc` to mathematically prevent negative inventory during flash sales.
* [x] **Server-Authoritative Pricing:** Server resolves prices from MongoDB `Product` documents; client `unitPrice` is strictly ignored.
* [x] **5-Role RBAC Model:** `SUPER_ADMIN` (settings + credentials), `ADMIN` (catalog + fulfillment), `MODERATOR` (call center verify), `MERCHANT` (wholesale price gate), and `USER` (retail).

---

## 4. Official Docs & Sources

* [Better Auth Official Documentation](https://www.better-auth.com/docs)
* [Better Auth Next.js Integration Guide](https://www.better-auth.com/docs/integrations/next)
* [Better Auth MongoDB Adapter](https://www.better-auth.com/docs/adapters/mongodb)
* [Next.js App Router Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
