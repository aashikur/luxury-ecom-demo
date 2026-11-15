import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAll() {
  console.log('🧪 Starting Full System Integration Audit...');

  // 1. Categories
  const catRes = await fetch('http://localhost:3000/api/categories');
  const catJson = await catRes.json();
  if (!catJson.success || !Array.isArray(catJson.data)) {
    throw new Error('Categories API failed: ' + JSON.stringify(catJson));
  }
  console.log(`✅ Categories API: ${catJson.data.length} categories verified.`);

  // 2. Collections
  const colRes = await fetch('http://localhost:3000/api/collections');
  const colJson = await colRes.json();
  if (!colJson.success || !Array.isArray(colJson.data)) {
    throw new Error('Collections API failed: ' + JSON.stringify(colJson));
  }
  console.log(`✅ Collections API: ${colJson.data.length} collections verified.`);

  // 3. Brands
  const brandRes = await fetch('http://localhost:3000/api/brands');
  const brandJson = await brandRes.json();
  if (!brandJson.success || !Array.isArray(brandJson.data)) {
    throw new Error('Brands API failed: ' + JSON.stringify(brandJson));
  }
  console.log(`✅ Brands API: ${brandJson.data.length} brands verified.`);

  // 4. StoreConfig Admin
  const cfgAdminRes = await fetch('http://localhost:3000/api/config?admin=true');
  const cfgAdminJson = await cfgAdminRes.json();
  if (!cfgAdminJson.success || !cfgAdminJson.data?.branding) {
    throw new Error('Admin StoreConfig API failed: ' + JSON.stringify(cfgAdminJson));
  }
  console.log('✅ Admin StoreConfig: retrieved and validated.');

  // 5. StoreConfig Public
  const cfgPubRes = await fetch('http://localhost:3000/api/config');
  const cfgPubJson = await cfgPubRes.json();
  if (!cfgPubJson.success || !cfgPubJson.data?.branding) {
    throw new Error('Public StoreConfig API failed: ' + JSON.stringify(cfgPubJson));
  }
  if (cfgPubJson.data.courier?.steadfast?.apiKey || cfgPubJson.data.courier?.steadfast?.secretKey) {
    throw new Error('Security Leak in Public StoreConfig!');
  }
  console.log('✅ Public StoreConfig: retrieved with strict security sanitization.');

  console.log('🎉 ALL TAXONOMY & CONFIGURATION SERVICES ARE 100% OPERATIONAL!');
}

testAll().catch((err) => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
