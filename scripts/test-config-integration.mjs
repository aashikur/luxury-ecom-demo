import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runConfigTest() {
  console.log('🧪 Starting StoreConfig Integration Test...');

  // 1. Fetch Admin Config
  const adminRes = await fetch('http://localhost:3000/api/config?admin=true');
  const adminJson = await adminRes.json();
  if (!adminJson.success) {
    throw new Error('Failed to fetch admin config: ' + JSON.stringify(adminJson));
  }
  console.log('✅ Admin config retrieved successfully.');
  const initial = adminJson.data;

  // 2. Test PUT update
  const testStoreName = 'Aurem Luxury - Verified';
  const updatedPayload = {
    ...initial,
    branding: {
      ...initial.branding,
      storeName: testStoreName,
    },
    headerNavLinks: [
      { id: 'test-nav-1', label: 'Hoodies', href: '/category/hoodies', badgeText: 'HOT', isActive: true, order: 1 },
      { id: 'test-nav-2', label: 'T-Shirts', href: '/category/t-shirts', badgeText: 'NEW', isActive: true, order: 2 },
    ],
  };

  const putRes = await fetch('http://localhost:3000/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPayload),
  });
  const putJson = await putRes.json();
  if (!putJson.success) {
    throw new Error('Failed to PUT config: ' + JSON.stringify(putJson));
  }
  console.log('✅ StoreConfig saved successfully via PUT /api/config');

  // 3. Test Public Config sanitization
  const pubRes = await fetch('http://localhost:3000/api/config');
  const pubJson = await pubRes.json();
  if (!pubJson.success) {
    throw new Error('Failed to fetch public config: ' + JSON.stringify(pubJson));
  }
  const pub = pubJson.data;

  // Assert secrets are not leaked
  if (pub.courier?.steadfast?.apiKey || pub.courier?.steadfast?.secretKey) {
    throw new Error('Security Leak: Steadfast API keys exposed on public config!');
  }
  if (pub.payment?.bkashPGW?.appSecret || pub.payment?.sslCommerz?.storePass) {
    throw new Error('Security Leak: Payment secrets exposed on public config!');
  }
  if (pub.tracking?.metaCapiToken) {
    throw new Error('Security Leak: Meta CAPI token exposed on public config!');
  }
  console.log('✅ Security verified: No secrets leaked to public storefront.');

  // Assert public properties exist
  if (!Array.isArray(pub.headerNavLinks) || pub.headerNavLinks.length === 0) {
    throw new Error('Public config is missing headerNavLinks!');
  }
  if (!pub.payment?.cod || !pub.payment?.manualBkash) {
    throw new Error('Public config is missing active payment methods!');
  }
  console.log('✅ Public storefront payload validated.');

  // 4. Revert store name to original
  const revertPayload = {
    ...initial,
    branding: {
      ...initial.branding,
      storeName: 'Aurem Luxury',
    },
  };
  await fetch('http://localhost:3000/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(revertPayload),
  });
  console.log('✅ StoreConfig restored to clean state.');

  console.log('🎉 ALL STORE CONFIG INTEGRATION TESTS PASSED 100%!');
}

runConfigTest().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
