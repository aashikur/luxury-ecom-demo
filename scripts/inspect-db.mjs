import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function inspect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // 1. Inspect Products
  const products = await db.collection('products').find({}).toArray();
  console.log(`\n--- PRODUCTS (Total: ${products.length}) ---`);
  for (const p of products) {
    console.log(`Product: "${p.title}" (slug: ${p.slug})`);
    console.log(`  - media:`, p.media ? `${p.media.length} items` : 'MISSING/UNDEFINED');
    if (p.media && p.media.length > 0) {
      console.log(`    first media:`, JSON.stringify(p.media[0]));
    }
    console.log(`  - images:`, p.images ? `${p.images.length} items` : 'MISSING/UNDEFINED');
    if (p.images && p.images.length > 0) {
      console.log(`    first image:`, JSON.stringify(p.images[0]));
    }
    console.log(`  - categoryName:`, p.categoryName);
    console.log(`  - primaryCategory:`, p.primaryCategory);
    if (p.variants && p.variants.length > 0) {
      console.log(`  - variants count: ${p.variants.length}`);
      console.log(`    first variant image:`, p.variants[0].image);
    }
  }

  // 2. Inspect Reviews
  const reviews = await db.collection('reviews').find({}).toArray();
  console.log(`\n--- REVIEWS (Total: ${reviews.length}) ---`);
  for (const r of reviews) {
    console.log(`Review ${r._id}: media=${r.media?.length || 0}, photos=${r.photos?.length || 0}`);
  }

  // 3. Inspect StoreConfig
  const configs = await db.collection('storeconfigs').find({}).toArray();
  console.log(`\n--- STORE CONFIG (Total: ${configs.length}) ---`);
  for (const c of configs) {
    console.log(`StoreConfig: name=${c.branding?.storeName}, active=${c.isActive}`);
  }

  await mongoose.disconnect();
}

inspect().catch(console.error);
