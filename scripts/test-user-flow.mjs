import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testUserFlow() {
  console.log('🚀 Running User Flow Simulation on http://localhost:3000 ...\n');
  const results = [];

  async function checkRoute(name, url, options = {}) {
    try {
      const res = await fetch(url, options);
      const isOk = res.status >= 200 && res.status < 400;
      const statusText = `HTTP ${res.status}`;
      let extra = '';

      if (options.headers?.accept === 'application/json' || url.includes('/api/')) {
        const json = await res.json().catch(() => null);
        if (json) {
          extra = json.success !== undefined ? `(success: ${json.success})` : '';
          if (Array.isArray(json.data)) extra += ` [${json.data.length} items]`;
          else if (json.data && typeof json.data === 'object') extra += ` [keys: ${Object.keys(json.data).length}]`;
        }
      } else {
        const text = await res.text();
        extra = `[body: ${text.length} bytes]`;
      }

      results.push({ name, url, isOk, statusText, extra });
      console.log(`${isOk ? '✅' : '❌'} [${statusText}] ${name} ${extra}`);
      return { ok: isOk, res };
    } catch (err) {
      results.push({ name, url, isOk: false, statusText: 'ERROR', extra: err.message });
      console.log(`❌ [ERROR] ${name}: ${err.message}`);
      return { ok: false, error: err };
    }
  }

  // 1. Storefront Routes
  console.log('--- 1. Storefront User Browsing ---');
  await checkRoute('Storefront Home Page', 'http://localhost:3000/');
  await checkRoute('Storefront Catalog (/shop)', 'http://localhost:3000/shop');

  // 2. Fetch a real product slug for PDP test
  console.log('\n--- 2. Product Detail Page (PDP) Test ---');
  const prodRes = await fetch('http://localhost:3000/api/products');
  const prodJson = await prodRes.json();
  if (prodJson.success && prodJson.data?.length > 0) {
    const slug = prodJson.data[0].slug;
    await checkRoute(`Product Detail Page (/products/${slug})`, `http://localhost:3000/products/${slug}`);
  }

  // 3. Store APIs
  console.log('\n--- 3. Public APIs (0ms / Cached) ---');
  await checkRoute('StoreConfig API (Public)', 'http://localhost:3000/api/config');
  await checkRoute('Categories API', 'http://localhost:3000/api/categories');
  await checkRoute('Collections API', 'http://localhost:3000/api/collections');
  await checkRoute('Brands API', 'http://localhost:3000/api/brands');
  await checkRoute('Products API', 'http://localhost:3000/api/products');

  // 4. Admin Management Routes (SSR Verification)
  console.log('\n--- 4. Admin Surface Verification ---');
  await checkRoute('Admin Dashboard Root (/admin)', 'http://localhost:3000/admin');
  await checkRoute('Admin Categories (/admin/categories)', 'http://localhost:3000/admin/categories');
  await checkRoute('Admin New Category (/admin/categories/new)', 'http://localhost:3000/admin/categories/new');
  await checkRoute('Admin Collections (/admin/collections)', 'http://localhost:3000/admin/collections');
  await checkRoute('Admin New Collection (/admin/collections/new)', 'http://localhost:3000/admin/collections/new');
  await checkRoute('Admin Brands (/admin/brands)', 'http://localhost:3000/admin/brands');
  await checkRoute('Admin New Brand (/admin/brands/new)', 'http://localhost:3000/admin/brands/new');
  await checkRoute('Admin Store Settings (/admin/settings)', 'http://localhost:3000/admin/settings');
  await checkRoute('Admin Config API (Full with admin=true)', 'http://localhost:3000/api/config?admin=true');

  // 4b. Unified Authentication Verification
  console.log('\n--- 4b. Unified Auth Portals & Flow ---');
  await checkRoute('Auth Login Portal (/auth/login)', 'http://localhost:3000/auth/login');
  await checkRoute('Auth Register Portal (/auth/register)', 'http://localhost:3000/auth/register');
  await checkRoute('Legacy Admin Login Portal (/admin/login)', 'http://localhost:3000/admin/login');
  await checkRoute('Better Auth Credentials Validation', 'http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'admin@aurem.com', password: 'AdminPassword123!' }),
  });

  // 5. Checkout Lead Capture Simulation
  console.log('\n--- 5. Guest Checkout & Lead Capture Simulation ---');
  const leadRes = await checkRoute('Abandoned Cart Lead Capture', 'http://localhost:3000/api/orders/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Ashik Rahaman (Test Lead)',
      phone: '01712345678',
      address: 'House 12, Road 4, Dhanmondi, Dhaka',
      deliveryZone: 'INSIDE_DHAKA',
      items: [
        {
          productId: prodJson.data?.[0]?._id || '6af1b56fd577686920388ef0',
          variantId: 'v1',
          name: 'Test Product',
          price: 1500,
          quantity: 1,
        },
      ],
    }),
  });

  const allPassed = results.every((r) => r.isOk);
  console.log('\n----------------------------------------');
  if (allPassed) {
    console.log('🎉 ALL USER FLOW TESTS PASSED SUCCESSFULLY (100% OPERATIONAL)!');
  } else {
    const failed = results.filter((r) => !r.isOk);
    console.log(`⚠️ ${failed.length} route(s) failed.`);
  }
}

testUserFlow().catch(console.error);
