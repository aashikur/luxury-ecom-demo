# E-commerce Production Readiness Checklist

> **Purpose:** A practical, security- and performance-focused checklist
> for launching and maintaining a reusable e-commerce application.
>
> **Current deployment:** Next.js on Vercel · MongoDB Atlas (currently
> Free/M0) · Cloudflare CDN/Edge · Cloudflare R2 image storage.
>
> **Future deployment target:** Keep the application portable to a VPS
> (for example, Next.js + Node.js behind Nginx/PM2) and allow a
> different storefront frontend without rewriting commerce rules.
>
> **How to use:** Check an item only after verifying it. For critical
> items, record evidence (test result, screenshot, dashboard setting,
> code path, or backup restore result). `BLOCKER` means do not launch
> until fixed or explicitly accepted as a documented business risk.

------------------------------------------------------------------------

## 0. Launch decision --- read this first

### Current stack risks

-   [ ] **BLOCKER --- Database tier decision:** Confirm the exact Atlas
    tier and region. Atlas Free/M0 is a development/small-scale tier,
    has a 512 MB data-plus-index storage limit and restricted
    operational features. It is not a good long-term home for a live
    store's orders and customer records. Prefer a paid dedicated tier
    for production. If remaining on M0 for a short soft launch, set a
    strict order/traffic limit, monitor storage and latency, arrange an
    independent backup, and have a tested upgrade plan.
-   [ ] **BLOCKER --- A restorable backup exists:** Export/backup the
    production database before launch. Confirm that you can restore it
    into a separate database and that the restored data is readable. A
    backup that has never been restored is unproven.
-   [ ] **BLOCKER --- Payment is verified server-side:** A
    success/thank-you page or browser redirect must never mark an order
    as paid. Verify payment with the provider's server-side
    validation/IPN flow.
-   [ ] **BLOCKER --- Stock cannot go negative:** Concurrent checkouts
    must not oversell inventory.
-   [ ] **BLOCKER --- Customer and admin data cannot leak through
    cache:** Account, cart, checkout, order, admin, and personalized API
    responses must not be shared-cacheable.
-   [ ] **BLOCKER --- Admin access is protected:** Strong
    authentication, role checks on every privileged API, and no
    default/shared admin credentials.
-   [ ] **BLOCKER --- Production secrets are private:** No database,
    payment, R2, auth, or signing secret in Git, browser bundles, logs,
    screenshots, or public environment variables.
-   [ ] **BLOCKER --- Order flow tested end to end:** A real or
    provider-approved test transaction has been followed through
    creation, payment status, stock update, admin fulfillment,
    cancellation/refund where applicable.
-   [ ] **BLOCKER --- Rollback is possible:** A known-good deployment
    can be restored quickly, and the database is not dependent on an
    irreversible schema change.

### Launch recommendation

If any blocker remains unchecked, do not call the system
production-ready. If business timing forces a launch, reduce risk:
soft-launch to a small audience, limit order volume, monitor closely,
and clearly assign someone to handle failed orders and customer support.
Do not run paid traffic at scale on an unverified payment/order flow or
an unbacked database.

**Launch owner:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Launch date/time (timezone):**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Production URL:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Database tier/region:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Rollback deployment:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Person watching orders and alerts:**
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

------------------------------------------------------------------------

## 1. Architecture rules --- keep these true as the product grows

### Source of truth

-   [ ] Commerce rules live in a server-side domain/service layer, not
    only in React components or browser code.
-   [ ] The database and trusted server code are authoritative for
    product price, discounts, tax/shipping rules, stock, order totals,
    payment state, and permissions.
-   [ ] The browser sends product IDs, quantities, coupon codes, and
    delivery choices---not trusted totals, discounts, payment status,
    roles, or stock values.
-   [ ] Reusable commerce logic is separated from the current hosting
    provider. Avoid putting business rules directly inside Vercel-only
    code, Cloudflare-specific code, or UI components.
-   [ ] Storefront-specific code calls stable application APIs/services.
    A future custom frontend should be able to use the same catalog,
    cart, checkout, order, and customer capabilities.
-   [ ] Infrastructure adapters are isolated: database connection,
    object storage, email/SMS, payment gateway, cache, and background
    jobs can be replaced without rewriting order rules.
-   [ ] Keep the deployment configuration documented: runtime version,
    build command, start command, required environment variables, health
    endpoint, database indexes, and migration/seed procedure.
-   [ ] Avoid introducing microservices, Kubernetes, queues, or a
    complex abstraction layer without a real operational need. A modular
    monolith is sufficient for this scale.

### Suggested logical boundaries

-   [ ] `catalog`: products, categories, variants, prices, product
    visibility.
-   [ ] `cart/checkout`: cart validation, shipping choice, final quote.
-   [ ] `inventory`: stock availability, reservation/adjustment, stock
    history.
-   [ ] `orders`: order creation, status transitions, immutable purchase
    snapshots.
-   [ ] `payments`: gateway session, callback/IPN, validation,
    refunds/reconciliation.
-   [ ] `customers/auth`: identity, sessions, addresses, account
    permissions.
-   [ ] `admin`: staff roles, product/order management, audit trail.
-   [ ] `storage`: R2 upload and object lifecycle.
-   [ ] `notifications`: email/SMS/WhatsApp delivery and retry handling.

These are logical boundaries, not a requirement to create a separate
service or package for each one.

------------------------------------------------------------------------

## 2. Secrets, environments, and repository hygiene

-   [ ] Separate development, preview/staging, and production
    configuration. Do not let preview deployments use production payment
    credentials or production customer data by default.
-   [ ] Use Vercel environment scopes correctly: Development, Preview,
    Production. Review every variable in the dashboard.
-   [ ] Only values intentionally safe for the browser use
    `NEXT_PUBLIC_`. Never expose secrets using this prefix.
-   [ ] Keep `.env*` files out of Git except safe examples such as
    `.env.example`. Check Git history, not only the current working
    tree.
-   [ ] Use separate, least-privilege credentials for MongoDB, R2,
    payment gateway, email, analytics, and other providers.
-   [ ] Restrict Atlas database users to the required database and
    actions. Do not use an Atlas admin account in the application
    connection string.
-   [ ] Restrict Atlas network access. Prefer a supported private
    connectivity option where practical; otherwise use the narrowest
    reliable IP allowlist available for the hosting environment. Do not
    leave `0.0.0.0/0` open without a documented reason and compensating
    controls.
-   [ ] Use separate R2 API tokens for production and development, with
    only the required bucket permissions.
-   [ ] Rotate any secret that was committed, pasted into a public
    issue, exposed in a browser bundle, or shared in an unsafe log.
    Removing it from the latest commit is not enough.
-   [ ] Do not log passwords, access tokens, session cookies, full
    payment payloads containing sensitive data, database URIs, R2
    signatures, or personal data not needed for debugging.
-   [ ] Verify the production domain uses HTTPS and HTTP redirects to
    HTTPS.
-   [ ] Pin dependencies with the committed lockfile. Use a supported
    Node.js version and record it in the project.
-   [ ] Review dependencies for known vulnerabilities; remove unused
    packages and suspicious/unmaintained packages.
-   [ ] Ensure production build does not contain development endpoints,
    test credentials, debug routes, stack traces, or sample admin
    accounts.

**Evidence to keep:** a redacted environment-variable inventory (names
only), dependency audit output, Atlas network/user settings, and
confirmation that secrets are not present in the client bundle.

------------------------------------------------------------------------

## 3. Authentication, authorization, and application security

### Authentication and sessions

-   [ ] Passwords are hashed with a modern password-hashing algorithm
    (Argon2id or bcrypt with an appropriate work factor); never store
    plaintext or reversible passwords.
-   [ ] Login, registration, password reset, OTP, and resend flows have
    rate limits and abuse protection.
-   [ ] Password reset tokens/OTPs are random, short-lived, single-use,
    and stored/compared safely.
-   [ ] Session cookies are `HttpOnly`, `Secure` in production, and use
    an appropriate `SameSite` setting. Do not store long-lived
    privileged tokens in `localStorage` if a safer cookie-based design
    is available.
-   [ ] Logout invalidates the session/token as appropriate. Password
    changes and account recovery invalidate old sessions where required.
-   [ ] Admin/staff accounts use strong unique passwords and preferably
    MFA if supported by the authentication setup.
-   [ ] Authentication errors do not reveal whether an email/phone
    number exists.

### Authorization --- test every endpoint

-   [ ] Every admin action checks the user's role/permission on the
    server, not merely by hiding a button in the frontend.
-   [ ] A customer can only read/update their own profile, addresses,
    cart, and orders.
-   [ ] Order access checks ownership or an authorized staff role on
    every request. Guessing another order ID must not reveal its
    details.
-   [ ] Staff permissions are limited to the actions they need. Do not
    give every staff account super-admin access.
-   [ ] Product, price, stock, discount, order status, payment status,
    and role updates cannot be performed by ordinary customers.
-   [ ] Test IDOR/BOLA: change IDs in API requests and confirm that
    another customer's data is not returned or modified.
-   [ ] Protect destructive actions (delete product, cancel order,
    refund, change role) with server-side permission checks and
    appropriate confirmation/audit logging.

### Input and API protection

-   [ ] Validate all incoming data on the server using explicit
    DTO/schema allowlists. Reject unexpected fields rather than passing
    arbitrary request objects into database updates.
-   [ ] Validate MongoDB ObjectIds, enum values, quantities, pagination
    bounds, sort fields, and filter fields.
-   [ ] Prevent NoSQL injection: never accept raw MongoDB operators or
    user-supplied query objects as filters/updates.
-   [ ] Prevent mass assignment: never spread an untrusted request body
    directly into a Mongoose update or model constructor for privileged
    fields.
-   [ ] Set request body and upload size limits.
-   [ ] Configure CORS for only the actual storefront/admin origins.
    CORS is not authentication and does not protect an API from direct
    requests.
-   [ ] Add rate limits to login, OTP, password reset, search, coupon
    validation, checkout, order creation, payment initiation, and
    upload-signing endpoints.
-   [ ] Apply sensible pagination and maximum page sizes to list
    endpoints. Do not return unlimited products/orders.
-   [ ] Use safe error responses in production. Do not return stack
    traces, raw database errors, internal paths, or secrets.
-   [ ] Set security headers: Content-Security-Policy (introduced
    carefully and tested), `X-Content-Type-Options: nosniff`,
    `Referrer-Policy`, and clickjacking protection via CSP
    `frame-ancestors` or appropriate `X-Frame-Options`.
-   [ ] Ensure HTML output is escaped and rich text/HTML content is
    sanitized with a maintained sanitizer.
-   [ ] Do not trust uploaded filenames, extensions, MIME headers, or
    client-provided image dimensions.
-   [ ] Protect state-changing requests against CSRF if cookie-based
    authentication is used. `SameSite` alone may not cover every flow.
-   [ ] Disable or protect debug, metrics, test, seed, and maintenance
    endpoints.
-   [ ] Use generic 404/403 responses where revealing resource existence
    would be unsafe.

------------------------------------------------------------------------

## 4. E-commerce correctness --- products, cart, pricing, orders

### Product and price integrity

-   [ ] Product price and sale price are loaded from the database at
    checkout. Never trust the price sent by the browser.
-   [ ] Validate product is active, purchasable, and available for the
    requested quantity.
-   [ ] Validate variant/SKU selection and ensure the variant belongs to
    the selected product.
-   [ ] Validate coupon eligibility, expiry, usage limits, per-customer
    limits, minimum spend, product/category restrictions, and stacking
    rules on the server.
-   [ ] Recalculate subtotal, discount, delivery charge, and final total
    on the server using a consistent currency and rounding rule.
-   [ ] Use integer minor units (for example, paisa) or a carefully
    defined decimal strategy; avoid floating-point arithmetic for money.
-   [ ] Store a purchase snapshot in each order: product name,
    SKU/variant, unit price, quantity, discount, and other relevant
    details at the time of purchase. Later product edits must not
    rewrite old orders.
-   [ ] Define what happens if price or stock changes between adding to
    cart and checkout. Revalidate and clearly show the customer the
    updated quote.

### Cart and checkout

-   [ ] Cart quantity has a lower bound and a reasonable upper bound.
-   [ ] Checkout validates customer name, phone, address, delivery area,
    shipping method, and required fields on the server.
-   [ ] The server creates the final order total; frontend totals are
    display-only.
-   [ ] Duplicate submissions cannot create duplicate orders. Use an
    idempotency key or equivalent server-side duplicate protection.
-   [ ] Refreshing the success page does not create another order or
    payment.
-   [ ] Cart state is not accidentally shared between users or cached
    publicly.
-   [ ] Checkout handles unavailable products, expired coupons, changed
    prices, and shipping failures without losing the user's information
    unnecessarily.

### Order lifecycle

-   [ ] Model order fulfillment and payment as separate states. Example:
    `orderStatus = pending | confirmed | processing | shipped | delivered | cancelled`;
    `paymentStatus = unpaid | pending | paid | failed | refunded | partially_refunded`.
-   [ ] Define allowed state transitions on the server. Reject
    impossible transitions (for example, delivered → processing).
-   [ ] Record who changed an order status, when, and why.
-   [ ] Keep an immutable order reference/number that is safe to share
    with customer support; do not expose sequential database IDs as
    authorization.
-   [ ] Store timestamps consistently (UTC in storage; local timezone in
    display).
-   [ ] Customer cancellation, staff cancellation, failed payment, COD
    confirmation, partial fulfillment, refund, and return flows have
    explicit rules.
-   [ ] Never mark an order delivered merely because a payment
    succeeded.
-   [ ] Send customer notifications only after the corresponding state
    transition is committed. Notification failure must not undo a valid
    order.
-   [ ] Provide an admin way to identify orders requiring manual review
    (payment pending too long, stock issue, callback mismatch,
    notification failure).

### Inventory and overselling

-   [ ] Stock decrement/reservation is atomic. Do not implement "read
    stock → check in JavaScript → write new stock" as separate
    unprotected operations.
-   [ ] Use a conditional atomic update (for example, decrement only
    when `stock >= requestedQuantity`) and check whether the update
    matched.
-   [ ] If an order/payment workflow spans multiple documents, use a
    MongoDB transaction only when the cluster topology supports it and
    the transaction is correctly configured. Do not assume a standalone
    deployment supports multi-document transactions.
-   [ ] Decide whether stock is reserved at order creation or after
    payment confirmation. Document the policy for COD and online
    payment.
-   [ ] If stock is reserved while awaiting payment, reservation expiry
    and release must be implemented safely and idempotently.
-   [ ] Payment retries and duplicate callbacks must not decrement stock
    twice.
-   [ ] Cancellation/refund must not restore stock twice.
-   [ ] Keep a stock movement/history record for manual adjustments,
    sales, cancellations, returns, and corrections.
-   [ ] Test two or more customers attempting to buy the final item at
    the same time.

------------------------------------------------------------------------

## 5. Payments --- COD and SSLCommerz (or other gateway)

### Common payment rules

-   [ ] Order creation, payment initiation, payment confirmation, and
    fulfillment are distinct operations.
-   [ ] The server generates the payable amount and currency from
    trusted order data.
-   [ ] Every payment attempt has a unique internal ID and is linked to
    exactly one order.
-   [ ] Store gateway transaction/session identifiers and the minimum
    provider response needed for reconciliation. Do not store card
    numbers, CVV, or sensitive card data.
-   [ ] Payment state changes are idempotent: repeated callbacks produce
    the same final state and do not duplicate stock or notifications.
-   [ ] A browser redirect, query parameter, client-side callback, or
    screenshot is never accepted as proof of payment.
-   [ ] Validate transaction status with the gateway's server-to-server
    validation mechanism and verify order reference, amount, currency,
    and transaction identity.
-   [ ] Verify callback authenticity according to the gateway's
    documented mechanism. Do not rely on an unverified IPN body alone.
-   [ ] Handle success, failure, cancellation, timeout, duplicate
    callback, delayed callback, and callback arriving before/after the
    customer returns.
-   [ ] Do not expose gateway secrets or server validation credentials
    to the browser.
-   [ ] Add a reconciliation process: find old `pending` payments and
    compare with gateway records before manually changing their state.
-   [ ] Define refund and partial-refund handling, including stock
    restoration rules and audit records.

### SSLCommerz-specific verification

-   [ ] Use the correct production store credentials and production
    gateway endpoint only in production.
-   [ ] Confirm success, fail, and cancel URLs use HTTPS and the correct
    production domain.
-   [ ] Implement and test the IPN/callback plus server-side transaction
    validation flow as required by the current SSLCommerz documentation.
-   [ ] Verify the validated transaction's amount, currency, transaction
    ID, and order mapping before setting `paymentStatus = paid`.
-   [ ] Treat the success URL as a customer-facing return page, not as
    the authoritative payment confirmation.
-   [ ] Test duplicate IPN, forged callback, mismatched amount,
    mismatched currency, unknown transaction ID, delayed IPN, and
    customer closing the browser.
-   [ ] Confirm how COD orders are represented: normally `unpaid` until
    collected/confirmed under the store's defined process, not
    automatically `paid`.
-   [ ] Keep a manual reconciliation path for gateway dashboard vs
    application orders.

**Payment launch test:** Complete one approved test transaction and
verify the database order, payment record, stock, admin order view, and
customer status. If using live credentials, use a controlled low-value
transaction and follow the provider's rules.

------------------------------------------------------------------------

## 6. MongoDB Atlas and Mongoose

-   [ ] Confirm cluster tier, region, storage limit, and proximity to
    the Vercel function region. Avoid unnecessary cross-region database
    calls.
-   [ ] Create the required indexes before launch. Typical candidates
    (adjust to actual queries): unique SKU; product slug; product
    status/category; order number unique; customer ID + createdAt;
    payment transaction ID unique; order status + createdAt.
-   [ ] Use unique indexes for invariants that must not duplicate (order
    number, gateway transaction ID, idempotency key where applicable).
    Application-level "check then insert" is not a substitute for a
    unique index.
-   [ ] Use `lean()` for read-only Mongoose queries where document
    methods/change tracking are not needed.
-   [ ] Select only the fields required for each response. Never return
    password hashes, internal notes, tokens, or sensitive fields.
-   [ ] Avoid unbounded `.populate()` chains and N+1 query patterns.
-   [ ] Use projections and bounded pagination. Avoid expensive
    unindexed regex searches on every keystroke.
-   [ ] Review slow queries and query plans for catalog, product detail,
    search, checkout, admin order list, and reports.
-   [ ] Set sensible connection pool settings for the actual Vercel
    runtime and workload. Do not open a new MongoDB connection for every
    request; reuse connections safely within the runtime process.
-   [ ] Do not assume a serverless function has one permanent process or
    one shared in-memory cache. Design for multiple concurrent
    instances.
-   [ ] Use database transactions only where supported by the selected
    cluster topology; test transaction failure and retry behavior.
-   [ ] Handle duplicate-key errors and transient database errors
    deliberately.
-   [ ] Set database-level validation or Mongoose schema validation for
    important invariants where appropriate.
-   [ ] Keep indexes in source-controlled deployment/setup
    documentation; do not rely on a developer's local database having
    them.
-   [ ] Configure Atlas alerts for storage, availability, connection
    usage, and performance to the extent the selected tier supports
    them.
-   [ ] Have an independent backup/export plan and test restore. Do not
    assume a free-tier backup feature is available in every account or
    that it replaces a tested recovery plan.
-   [ ] Define a retention policy for old logs, abandoned carts,
    temporary payment records, and customer data. Do not delete
    financial/order records without understanding legal/accounting
    requirements.

**M0 caution:** Free clusters have a small storage cap and restricted
features. They may be acceptable for development or a tightly controlled
temporary proof of concept, but they are a weak foundation for a real
store. Confirm current Atlas limits and available backup options in your
own account before launch.

------------------------------------------------------------------------

## 7. Cloudflare CDN and cache safety

### Golden rule

**Cache public, stable assets. Do not cache private or user-specific
commerce responses.** A cache leak can expose one customer's
account/order/cart to another customer.

### Safe to cache (when URLs are versioned or content is immutable)

-   [ ] Versioned Next.js static assets under `/_next/static/`.
-   [ ] Public product images served from the R2 custom domain.
-   [ ] Public, non-personalized category/product data only when the
    cache key and invalidation strategy are correct.
-   [ ] Public static files such as logos, fonts, and icons.

### Bypass cache

-   [ ] `/api/*` by default unless a specific endpoint is intentionally
    designed and verified as public-cacheable.
-   [ ] Login, register, logout, password reset, OTP, account, profile,
    address, cart, checkout, order history, order detail, admin, payment
    initiation, payment callback/IPN, and customer-specific routes.
-   [ ] Requests with authentication/session cookies or authorization
    headers.
-   [ ] Responses containing `Set-Cookie`, private data, or
    user-specific content.
-   [ ] Any response whose output varies by user, role, cart, location,
    or authorization.

### Configuration checks

-   [ ] Do not apply a broad "Cache Everything" rule to the whole
    storefront hostname.
-   [ ] Create narrow, ordered Cache Rules based on exact host/path and
    known public assets.
-   [ ] Ensure bypass rules take precedence for private routes and API
    endpoints.
-   [ ] Do not assume Cloudflare automatically understands application
    authentication. Explicitly test your rules.
-   [ ] Avoid caching HTML containing cart counts, user names, prices
    personalized by customer, or session state unless the design safely
    separates those fragments.
-   [ ] Use correct `Cache-Control` headers from the application/origin.
    Use `private, no-store` for sensitive personalized responses where
    appropriate.
-   [ ] Purge or revalidate public product/category caches when price,
    availability, title, image, or visibility changes.
-   [ ] Test cache HIT/MISS behavior using response headers and two
    separate customer sessions.
-   [ ] Verify a logged-in customer's response is never returned to a
    logged-out user or a different customer.
-   [ ] Keep origin access protected as far as the architecture permits.
    Do not assume that enabling Cloudflare proxy automatically prevents
    direct access to a Vercel origin hostname.
-   [ ] Check Cloudflare SSL/TLS mode and certificate status; use strict
    end-to-end TLS where supported.
-   [ ] Enable appropriate WAF/rate-limit/bot controls if available on
    the plan, but do not treat them as a replacement for application
    authorization and rate limits.

**Required cache-leak test:** Customer A logs in and adds an item to
cart. Customer B, in a separate browser/session, opens the same routes.
Confirm B never sees A's name, cart, order, address, or personalized
response. Repeat after logout.

------------------------------------------------------------------------

## 8. Cloudflare R2 image and file storage

-   [ ] Keep the bucket private unless public read access is
    intentionally required for public product images.
-   [ ] If public product images are served from a custom domain, expose
    only the intended public image bucket. Do not put private invoices,
    identity documents, customer uploads, or internal exports in a
    publicly readable bucket.
-   [ ] Keep R2 access key/secret only on the server. Never place them
    in `NEXT_PUBLIC_*` variables or browser code.
-   [ ] Use least-privilege R2 API tokens scoped to the required bucket
    and actions.
-   [ ] Generate object keys on the server. Do not allow a user to
    choose arbitrary bucket paths or overwrite another user's file.
-   [ ] Validate actual file type/content, file size, image dimensions,
    and allowed formats. Do not trust the filename or browser MIME type.
-   [ ] Prefer a safe image allowlist (for example JPEG, PNG, WebP, AVIF
    as supported by your image pipeline); reject executable and
    unexpected formats.
-   [ ] Re-encode/normalize uploaded images where practical; strip
    unnecessary metadata such as EXIF location data.
-   [ ] Limit upload size and number of uploads per user/admin.
-   [ ] For direct browser uploads, issue short-lived, object-specific
    presigned URLs with only the required method and content
    constraints. Treat a presigned URL as a bearer token until it
    expires.
-   [ ] Configure R2 CORS only for the actual site/admin origins and
    required methods/headers. CORS does not replace authorization.
-   [ ] Prevent public listing of bucket contents and avoid predictable
    sensitive object names.
-   [ ] Set correct `Content-Type` and safe `Content-Disposition`
    behavior.
-   [ ] Use immutable/versioned object keys for updated product images
    or purge CDN cache after replacement.
-   [ ] Implement safe deletion: deleting a product should not
    accidentally delete images still used by another product or
    historical order.
-   [ ] Keep a way to identify orphaned uploads and clean them up
    safely.
-   [ ] Test upload, replacement, deletion, unauthorized access,
    oversized file, fake MIME type, and expired presigned URL.

------------------------------------------------------------------------

## 9. Next.js on Vercel --- production and performance

### Deployment configuration

-   [ ] Production branch is explicit (for example `main`); only
    reviewed changes are merged into it.
-   [ ] Preview deployments are separated from production secrets and
    production data.
-   [ ] Confirm the production domain points to the intended Vercel
    project and the HTTPS certificate is valid.
-   [ ] Protect preview deployments from public access where possible.
    Confirm which Vercel plan/protection scope is available; do not
    assume a setting protects the production domain on every plan.
-   [ ] Build succeeds from a clean checkout using the committed
    lockfile.
-   [ ] Run lint, type-check, tests, and production build before
    deployment.
-   [ ] Confirm the Vercel function/runtime region is close to the Atlas
    cluster region where possible.
-   [ ] Set appropriate function timeout/memory only where needed; do
    not increase limits to hide slow database queries.
-   [ ] Review Vercel usage, function invocations, bandwidth, image
    optimization, and spend alerts/limits available on the current plan.
-   [ ] Confirm environment variables are present in the correct
    environment and a redeployment has applied any changes.
-   [ ] Keep a known-good deployment and know how to roll back.

### Next.js security and rendering

-   [ ] Review every Server Action and Route Handler as a public API
    entry point: authenticate, authorize, validate input, and rate-limit
    as needed.
-   [ ] Server Components must not expose private fields in props or
    serialized output sent to the browser.
-   [ ] Never place server secrets in client components or import
    server-only modules into client bundles.
-   [ ] Review `NEXT_PUBLIC_` variables and browser network requests for
    accidental exposure.
-   [ ] Set a deliberate Content Security Policy. Start with report-only
    if needed, identify required payment/analytics/image origins, then
    enforce without using broad unsafe allowances unnecessarily.
-   [ ] Configure security headers and a clear error boundary/404
    experience.
-   [ ] Do not cache authenticated pages or personalized data with
    static/ISR caching.
-   [ ] For public product/category pages, use a deliberate
    cache/revalidation strategy. Product price and stock must not remain
    stale longer than the business accepts.
-   [ ] Revalidate public product/category pages after admin changes if
    using ISR or cached data.
-   [ ] Ensure search parameters and dynamic APIs do not accidentally
    turn large parts of the site dynamic or cause unintended cache
    behavior.
-   [ ] Use `next/image` or a deliberate image optimization strategy;
    configure allowed remote image hosts narrowly.
-   [ ] Use optimized local fonts where possible; avoid loading several
    unnecessary font weights.
-   [ ] Defer nonessential analytics, chat widgets, pixels, and
    third-party scripts. Do not let them block checkout.
-   [ ] Add loading, empty, error, and not-found states to key pages.
-   [ ] Ensure checkout remains usable on a slow mobile connection and
    after a recoverable network error.
-   [ ] Test on real mobile devices or realistic mobile emulation, not
    only a desktop browser.

### Performance checks

-   [ ] Run Lighthouse against the production build/site for home,
    category, product, cart, and checkout.
-   [ ] Measure Core Web Vitals with field monitoring when traffic
    exists; Lighthouse is a lab test, not proof of real-user
    performance.
-   [ ] Check LCP image is optimized and not lazy-loaded when it is the
    primary above-the-fold image.
-   [ ] Prevent layout shifts by reserving image dimensions/aspect
    ratios.
-   [ ] Reduce unnecessary client components and large client-side
    bundles.
-   [ ] Avoid sequential API waterfalls; parallelize independent
    server-side data fetching.
-   [ ] Add database indexes based on real query patterns and verify
    slow endpoints.
-   [ ] Avoid fetching the full catalog or all orders when a paginated
    subset is needed.
-   [ ] Search is debounced and bounded; avoid a database query on every
    keystroke.
-   [ ] Verify product pages remain fast on cache MISS as well as cache
    HIT.
-   [ ] Test checkout and admin pages without relying on CDN cache.

------------------------------------------------------------------------

## 10. API, background work, and reliability

-   [ ] Use consistent API response and error shapes; do not leak
    internal errors.
-   [ ] Add request IDs/correlation IDs so a customer report can be
    traced through logs.
-   [ ] Use timeouts for external provider calls. A slow
    email/SMS/payment API must not hang a request indefinitely.
-   [ ] Retry only operations that are safe to retry. Use idempotency
    for payment, order, stock, and notification operations.
-   [ ] Do not rely on an in-memory timer or background promise inside a
    serverless request for critical work. Use a durable scheduled/queue
    mechanism if a task must reliably run later.
-   [ ] Critical side effects (payment confirmation, stock movement,
    order status change) are persisted before noncritical notifications
    are sent.
-   [ ] Failed email/SMS delivery does not roll back an order. Record
    failure and provide retry/manual resend.
-   [ ] Add a lightweight health endpoint that checks application
    readiness without exposing secrets or detailed infrastructure
    information.
-   [ ] Handle provider/database downtime with a safe customer-facing
    error and avoid creating partially confirmed orders.
-   [ ] Define what happens when the browser closes during checkout or
    the network drops after the order is submitted.
-   [ ] Ensure payment callback/IPN endpoints are not blocked by
    authentication middleware, bot challenges, or cache rules, while
    still validating authenticity and data.
-   [ ] Keep a manual operational path for stuck orders, failed
    notifications, payment reconciliation, and stock corrections.

------------------------------------------------------------------------

## 11. Testing --- minimum useful coverage, not test theatre

Automated tests are currently limited. Do not try to test every UI
detail before launch; prioritize money, access control, stock, and order
correctness.

### Must pass before launch

-   [ ] **Build/type checks:** clean install, lint, type-check,
    production build.
-   [ ] **Auth:** registration/login/logout, invalid password, password
    reset, rate limiting, session expiry.
-   [ ] **Authorization:** customer cannot access another customer's
    order/profile; non-admin cannot access admin APIs; staff permissions
    are enforced server-side.
-   [ ] **Catalog:** inactive product cannot be purchased; invalid
    variant/quantity rejected; price is server-calculated.
-   [ ] **Cart/checkout:** correct subtotal/discount/delivery/total;
    invalid coupon rejected; duplicate submit does not duplicate order.
-   [ ] **Inventory:** two simultaneous attempts for final stock do not
    oversell; cancellation/restock does not double-add stock.
-   [ ] **Payment:** success, failure, cancel, forged callback, wrong
    amount, duplicate callback, delayed callback, refresh/retry.
-   [ ] **COD:** COD order has the correct unpaid/confirmation state and
    admin workflow.
-   [ ] **Admin:** product/stock/order changes work and are audit-logged
    where appropriate.
-   [ ] **R2:** valid upload works; invalid/oversized upload fails;
    unauthorized upload fails; public/private access is correct.
-   [ ] **Cache:** two users cannot see each other's cart/account/order;
    API and checkout do not return a shared cached response.
-   [ ] **Mobile:** home → product → cart → checkout → order
    confirmation works on a mobile viewport.
-   [ ] **Recovery:** restore a database backup into a separate database
    and verify core collections.

### Small automated test set to add first

-   [ ] Unit tests for price calculation, coupon eligibility, order
    state transitions, and stock rules.
-   [ ] Integration tests for order creation and payment validation
    using a test database/provider sandbox.
-   [ ] API tests for customer-vs-admin authorization and IDOR.
-   [ ] One Playwright happy-path checkout test and one payment
    callback/idempotency test.
-   [ ] Add a regression test for every production incident or serious
    bug.

### Basic load test

-   [ ] Load-test a staging environment, not production payment
    endpoints.
-   [ ] Model realistic journeys: browse category → product → add to
    cart → checkout; include admin order listing separately.
-   [ ] Ramp gradually (for example 5, 10, 20, then 50 concurrent
    virtual users) and stop if errors or latency rise sharply.
-   [ ] Monitor Vercel functions, Atlas
    CPU/operations/connections/storage, cache HIT ratio, and error rate
    during the test.
-   [ ] Test cache HIT and MISS separately. A CDN can make product pages
    look fast while checkout or database-backed requests remain slow.
-   [ ] Do not claim "100 orders/day supported" from a virtual-user
    count alone. Orders/day, concurrent visitors, burst traffic, and
    checkout request rate are different metrics.

------------------------------------------------------------------------

## 12. Monitoring, alerts, and support operations

-   [ ] Capture application errors with a service such as Sentry or an
    equivalent error tracker.
-   [ ] Monitor Vercel deployment/function errors, latency, invocations,
    and usage.
-   [ ] Monitor Atlas availability, storage, query performance, and
    connections within the selected tier's capabilities.
-   [ ] Monitor Cloudflare cache status, origin errors, WAF events, and
    R2 usage.
-   [ ] Log order ID, payment attempt ID, request ID, event type, and
    timestamp where useful---but avoid logging full personal/payment
    secrets.
-   [ ] Alert on payment callback failures, a growing number of pending
    payments, order creation errors, database connection failures, and
    storage nearing its limit.
-   [ ] Define a person and channel responsible for alerts during
    launch.
-   [ ] Check order and payment dashboards frequently during the first
    launch day.
-   [ ] Keep a short incident note: time, impact, affected orders,
    action taken, and follow-up fix.
-   [ ] Prepare customer support responses for payment deducted but
    order pending, duplicate payment, failed delivery, cancellation, and
    refund.

------------------------------------------------------------------------

## 13. Backup, recovery, and deployment rollback

-   [ ] Confirm database backup/export schedule and retention.
-   [ ] Store backups separately from the live database account/cluster
    where practical; restrict access and encrypt them.
-   [ ] Test restore to a separate database before launch.
-   [ ] Define acceptable data loss (RPO) and recovery time (RTO), even
    if the initial target is modest.
-   [ ] Document how to restore the database, update the connection
    string, redeploy, and verify orders.
-   [ ] Keep a known-good Vercel deployment and know the exact rollback
    action.
-   [ ] Avoid deploying destructive database changes and application
    code together without a backward-compatible migration plan.
-   [ ] Prefer additive schema changes first; remove old fields only
    after all running versions no longer depend on them.
-   [ ] Confirm rollback does not break payment callbacks or leave
    orders in an unknown state.
-   [ ] Keep a manual order export/report process for emergency business
    continuity.

------------------------------------------------------------------------

## 14. VPS portability --- prepare now, do not build it prematurely

The goal is to keep the application deployable outside Vercel without
maintaining two separate products. Do not add a VPS now just for
theoretical scale. Preserve portability with a few deliberate choices.

### Application portability

-   [ ] Keep business logic independent of Vercel request/response APIs
    where practical.
-   [ ] Avoid making critical business operations depend exclusively on
    Vercel Cron, Edge Runtime, or platform-specific storage.
-   [ ] Keep Node.js server-only code compatible with a normal Node
    runtime. Do not assume every dependency works in Edge Runtime.
-   [ ] Document a standard production command/build output and required
    environment variables.
-   [ ] Provide a health/readiness endpoint and graceful shutdown
    behavior for a long-running Node process.
-   [ ] Do not keep critical state only in process memory. Multiple PM2
    workers or multiple servers must see consistent sessions, carts,
    locks, and job state.
-   [ ] Use an external/shared store for distributed rate limits, locks,
    queues, and sessions if/when multiple instances require them.
-   [ ] Use the same MongoDB data model and the same payment/storage
    adapters regardless of where the frontend or API runs.
-   [ ] Keep uploads on R2 rather than local VPS disk, so redeploys and
    multiple servers do not lose files.
-   [ ] Keep scheduled jobs explicit and idempotent so they can move
    from Vercel Cron to a VPS scheduler/queue later.

### Future VPS deployment checklist (when there is a real reason to move)

-   [ ] Choose a supported Node.js LTS runtime and pin it.
-   [ ] Run the app under a non-root Linux user.
-   [ ] Use Nginx as reverse proxy with HTTPS, request-size limits, and
    sensible proxy timeouts.
-   [ ] Use PM2 or systemd for process supervision, restart policy, and
    startup on reboot.
-   [ ] Keep secrets in server environment/secret management, not in the
    repository.
-   [ ] Configure firewall rules; expose only required ports (normally
    80/443 and restricted SSH).
-   [ ] Keep MongoDB Atlas access restricted to the VPS egress IP where
    stable; never expose MongoDB publicly without controls.
-   [ ] Configure log rotation and disk monitoring.
-   [ ] Add uptime/health monitoring and test process restart/reboot.
-   [ ] Keep R2 as shared object storage and Cloudflare as CDN/WAF where
    useful.
-   [ ] Automate deploy, health check, and rollback. Do not rely on
    manual SSH editing of production source files.
-   [ ] Test backup restore and database connectivity from the VPS
    before switching DNS/traffic.
-   [ ] Plan DNS cutover and rollback before migration.

### Different storefront frontend later

-   [ ] Keep a documented, versioned API contract for catalog, cart,
    checkout, customer, and order operations.
-   [ ] Keep authorization and business rules on the server; a new
    frontend must not need to duplicate them.
-   [ ] Use stable identifiers and consistent response shapes.
-   [ ] Document authentication/session behavior, CORS origins,
    pagination, errors, and idempotency.
-   [ ] Build a new storefront against staging APIs first; do not point
    an untested frontend at live checkout.
-   [ ] Keep admin and storefront permissions separate.

------------------------------------------------------------------------

## 15. Launch-day runbook

### Before opening the site

-   [ ] Confirm latest production deployment is the intended commit.
-   [ ] Confirm environment variables and provider credentials are
    production values.
-   [ ] Confirm domain, HTTPS, redirects, and canonical URL.
-   [ ] Confirm Atlas tier, region, network access, user permissions,
    storage headroom, and backup.
-   [ ] Confirm Cloudflare cache rules: public assets cache; private
    routes and APIs bypass.
-   [ ] Confirm R2 bucket access and upload behavior.
-   [ ] Confirm payment gateway production configuration and
    callback/IPN URL.
-   [ ] Confirm admin login, roles, and ability to update product stock.
-   [ ] Confirm delivery charge, service areas, COD rules, coupon rules,
    and contact information.
-   [ ] Run one final customer journey from a clean browser session.
-   [ ] Ensure someone is ready to monitor orders, payments, and errors.

### First live order verification

-   [ ] Place a controlled order using the intended payment method.
-   [ ] Confirm exactly one order is created.
-   [ ] Confirm the order snapshot contains correct product, quantity,
    price, discount, delivery fee, and total.
-   [ ] Confirm payment status is correct and supported by server-side
    verification.
-   [ ] Confirm stock is adjusted exactly once according to the chosen
    policy.
-   [ ] Confirm the admin can see and process the order.
-   [ ] Confirm customer confirmation/notification is correct and
    contains no sensitive data.
-   [ ] Confirm refresh/retry does not create a duplicate order.
-   [ ] Reconcile the gateway dashboard and application record for the
    test payment.

### First 24 hours

-   [ ] Check failed requests, server/function errors, and checkout
    conversion.
-   [ ] Check pending payments and callback delivery.
-   [ ] Check stock anomalies and duplicate orders.
-   [ ] Check Atlas storage, latency, and connections.
-   [ ] Check Cloudflare cache behavior and origin errors.
-   [ ] Check R2 upload/image delivery and usage.
-   [ ] Keep a manual record of any customer-impacting issue and
    affected order IDs.
-   [ ] Do not deploy unrelated refactors during the first live period
    unless fixing a serious issue.

------------------------------------------------------------------------

## 16. Reusable project handoff for AI and developers

Copy this section into the project README or provide it to an AI coding
assistant when asking it to build, review, or change the store.

### AI implementation rules

1.  Read the existing architecture and relevant files before proposing
    or changing code. Do not assume a file, endpoint, schema,
    environment variable, or provider configuration exists.
2.  Preserve the current stack unless a change is justified: Next.js,
    Vercel, MongoDB/Mongoose, Cloudflare CDN, and R2. Keep the app
    portable to a standard Node.js/VPS deployment.
3.  Do not over-engineer. Prefer a modular monolith and the smallest
    reliable implementation that meets the requirement.
4.  Never move trusted commerce rules into the browser. Server-side code
    must calculate prices, validate coupons, verify stock, create
    orders, and confirm payments.
5.  Treat every API route, Server Action, callback, and upload endpoint
    as untrusted input. Validate, authenticate, authorize, and
    rate-limit as appropriate.
6.  Never mark a payment successful from a browser redirect alone. Use
    the provider's documented server-side verification and make
    callbacks idempotent.
7.  Protect customer data from cross-user access and shared caching.
    Private routes/API responses must bypass shared CDN caching.
8.  Use atomic inventory updates and database uniqueness constraints for
    invariants. Do not rely on a read-then-write check for stock or
    duplicate prevention.
9.  Do not expose secrets, private fields, payment credentials, or R2
    credentials to the browser or logs.
10. Add or update tests for the behavior being changed, especially
    money, stock, payment, authorization, and order lifecycle.
11. Keep database indexes and deployment requirements documented and
    repeatable.
12. Avoid platform lock-in for critical business logic. Keep storage,
    payment, database, and job integrations behind small replaceable
    adapters where useful.
13. Before editing, summarize the intended change and affected files.
    After editing, report exact files changed, behavior changed,
    tests/build commands run, results, remaining risks, and any manual
    dashboard configuration needed.
14. Do not claim a test, backup, security check, or deployment setting
    is complete unless it was actually verified.
15. If a requirement is ambiguous or conflicts with existing behavior,
    ask before making a risky assumption.
16. Never run destructive production database operations, rotate
    credentials, change payment mode, or deploy to production without
    explicit human approval.

### Required AI review output

For each finding, report:

-   **Severity:** Blocker / High / Medium / Low.
-   **Status:** Confirmed issue / Potential risk / Verified safe.
-   **Evidence:** Exact file path, function, route, schema, or dashboard
    setting.
-   **Impact:** What could happen to customers, orders, money, security,
    or uptime.
-   **Fix:** Smallest practical correction.
-   **Verification:** Test or manual step proving the fix.
-   **Owner:** Developer / infrastructure owner / business operator.

Do not produce vague statements such as "security looks good." State
what was checked and what was not checked.

------------------------------------------------------------------------

## 17. Final sign-off

Only mark the store ready when the launch blockers have evidence and an
owner has accepted any remaining risks.

  Area                                       Status          Evidence / notes
  ------------------------------------------ --------------- ------------------
  Database tier and region                   ☐ Pass ☐ Fail   
  Backup and restore tested                  ☐ Pass ☐ Fail   
  Secrets and environment scopes             ☐ Pass ☐ Fail   
  Authentication and authorization           ☐ Pass ☐ Fail   
  Product, cart, pricing, checkout           ☐ Pass ☐ Fail   
  Inventory concurrency                      ☐ Pass ☐ Fail   
  COD and online payment verification        ☐ Pass ☐ Fail   
  Cloudflare cache isolation                 ☐ Pass ☐ Fail   
  R2 upload/access security                  ☐ Pass ☐ Fail   
  Vercel production build and rollback       ☐ Pass ☐ Fail   
  Mobile checkout and accessibility basics   ☐ Pass ☐ Fail   
  Monitoring and incident owner              ☐ Pass ☐ Fail   
  Launch-day order verification              ☐ Pass ☐ Fail   

**Final decision:** ☐ GO ☐ SOFT LAUNCH WITH DOCUMENTED LIMITS ☐ NO-GO

**Accepted risks and mitigation:**\
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Approved by:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

------------------------------------------------------------------------

## Official references

Use the current documentation for exact provider settings and
plan-specific availability; dashboard options and limits can change.

-   Next.js production checklist:
    https://nextjs.org/docs/app/guides/production-checklist
-   Vercel production checklist:
    https://vercel.com/docs/production-checklist
-   Vercel deployment protection:
    https://vercel.com/docs/deployment-protection
-   MongoDB Atlas Free cluster limitations:
    https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
-   MongoDB Atlas production notes:
    https://www.mongodb.com/docs/atlas/production-notes/
-   MongoDB Atlas backups for Free clusters:
    https://www.mongodb.com/docs/atlas/backup/cloud-backup/free-cluster-backup/
-   Cloudflare cache getting started:
    https://developers.cloudflare.com/cache/get-started/
-   Cloudflare bypass cache on cookie:
    https://developers.cloudflare.com/cache/how-to/cache-rules/examples/bypass-cache-on-cookie/
-   Cloudflare dynamic content and login issues:
    https://developers.cloudflare.com/cache/troubleshooting/dynamic-content-and-login-issues/
-   Cloudflare R2 public buckets:
    https://developers.cloudflare.com/r2/buckets/public-buckets/
-   Cloudflare R2 presigned URLs:
    https://developers.cloudflare.com/r2/api/s3/presigned-urls/
-   OWASP API Security Top 10: https://owasp.org/API-Security/
-   SSLCommerz developer documentation:
    https://developer.sslcommerz.com/

> **Important:** This is a readiness checklist, not a certification or
> an audit of your repository. A checked item should mean someone
> actually inspected or tested it in the running application or provider
> dashboard.
