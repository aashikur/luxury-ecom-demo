import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * Migration Script: Migrate Legacy Images & PrimaryCategory to Greenfield Media Architecture
 * Authoritative: .gemini/rules/backend-architecture-rules.md
 */
async function migrateDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('✅ Connected successfully.\n');

  const db = mongoose.connection.db;

  // =========================================================================
  // 1. MIGRATE PRODUCTS (images -> media, primaryCategory -> categoryName)
  // =========================================================================
  console.log('📦 Starting Products Collection Migration...');
  const products = await db.collection('products').find({}).toArray();
  let migratedProductsCount = 0;

  for (const product of products) {
    const $set = {};
    const $unset = {};

    // A. Migrate Images -> Media
    const hasLegacyImages = Array.isArray(product.images) && product.images.length > 0;
    const hasMedia = Array.isArray(product.media) && product.media.length > 0;

    if (!hasMedia && hasLegacyImages) {
      $set.media = product.images.map((img, idx) => ({
        url: img.url,
        key: img.key || '',
        thumbnailUrl: img.thumbnailUrl || img.url,
        type: img.type || 'IMAGE',
        altText: img.altText || `${product.title} view ${idx + 1}`,
      }));
      console.log(`  [Product ${product.slug}]: Migrated ${product.images.length} legacy images -> media`);
    } else if (hasMedia && hasLegacyImages) {
      console.log(`  [Product ${product.slug}]: Already has media; cleaning up legacy images field.`);
    }

    // Always unset legacy images property
    if (product.images !== undefined) {
      $unset.images = '';
    }

    // B. Migrate PrimaryCategory -> CategoryName
    if (!product.categoryName && product.primaryCategory) {
      $set.categoryName = product.primaryCategory;
      console.log(`  [Product ${product.slug}]: Migrated primaryCategory "${product.primaryCategory}" -> categoryName`);
    }

    // Always unset legacy primaryCategory property
    if (product.primaryCategory !== undefined) {
      $unset.primaryCategory = '';
    }

    // C. Calculate and Normalize Total Stock & inStock
    let computedTotalStock = product.totalStock ?? product.stock ?? 0;
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      computedTotalStock = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      $set.hasVariants = true;
    } else {
      $set.hasVariants = Boolean(product.hasVariants);
    }
    $set.totalStock = computedTotalStock;
    $set.inStock = computedTotalStock > 0;
    $set.stockStatus = product.stockStatus || (computedTotalStock > 0 ? 'AUTO' : 'FORCE_OUT_OF_STOCK');

    // D. Status and Visibility Normalization
    const isPublished = product.status === 'PUBLISHED' || (product.isActive && product.status !== 'DRAFT');
    $set.status = isPublished ? 'PUBLISHED' : (product.status || 'DRAFT');
    $set.isActive = isPublished;

    // E. Audit Trail
    if (!product.createdBy) $set.createdBy = 'SEED_OR_ADMIN';
    if (!product.updatedBy) $set.updatedBy = 'MIGRATION_SCRIPT';
    if (!product.createdAt) $set.createdAt = new Date();
    $set.updatedAt = new Date();

    // Perform atomic update if changes exist
    const updatePayload = {};
    if (Object.keys($set).length > 0) updatePayload.$set = $set;
    if (Object.keys($unset).length > 0) updatePayload.$unset = $unset;

    if (Object.keys(updatePayload).length > 0) {
      await db.collection('products').updateOne({ _id: product._id }, updatePayload);
      migratedProductsCount++;
    }
  }

  console.log(`✅ Products Migration Complete. Modified ${migratedProductsCount} of ${products.length} products.\n`);

  // =========================================================================
  // 2. MIGRATE REVIEWS (photos -> media)
  // =========================================================================
  console.log('⭐ Starting Reviews Collection Migration...');
  const reviews = await db.collection('reviews').find({}).toArray();
  let migratedReviewsCount = 0;

  for (const review of reviews) {
    const $set = {};
    const $unset = {};

    const hasLegacyPhotos = Array.isArray(review.photos) && review.photos.length > 0;
    const hasMedia = Array.isArray(review.media) && review.media.length > 0;

    if (!hasMedia && hasLegacyPhotos) {
      $set.media = review.photos.map((p) => ({
        url: p.url,
        key: p.key || '',
        thumbnailUrl: p.thumbnailUrl || p.url,
        type: 'IMAGE',
      }));
    }

    if (review.photos !== undefined) {
      $unset.photos = '';
    }

    if (!review.createdBy) $set.createdBy = 'CUSTOMER';
    if (!review.updatedBy) $set.updatedBy = 'MIGRATION_SCRIPT';

    const updatePayload = {};
    if (Object.keys($set).length > 0) updatePayload.$set = $set;
    if (Object.keys($unset).length > 0) updatePayload.$unset = $unset;

    if (Object.keys(updatePayload).length > 0) {
      await db.collection('reviews').updateOne({ _id: review._id }, updatePayload);
      migratedReviewsCount++;
    }
  }

  console.log(`✅ Reviews Migration Complete. Modified ${migratedReviewsCount} reviews.\n`);

  // =========================================================================
  // 3. AUDIT ORDERS ITEMS IMAGE NORMALIZATION
  // =========================================================================
  console.log('📋 Auditing Orders Items Images...');
  const orders = await db.collection('orders').find({}).toArray();
  let updatedOrdersCount = 0;

  // Build product media map for fallback recovery
  const freshProducts = await db.collection('products').find({}).toArray();
  const productMediaMap = new Map();
  for (const p of freshProducts) {
    if (p.media && p.media.length > 0 && p.media[0].url) {
      productMediaMap.set(p._id.toString(), p.media[0].url);
    }
  }

  for (const order of orders) {
    const $set = {};
    let orderChanged = false;

    const items = (order.items || []).map((item) => {
      if (!item.image && item.productId) {
        const fallbackUrl = productMediaMap.get(item.productId.toString());
        if (fallbackUrl) {
          orderChanged = true;
          return { ...item, image: fallbackUrl };
        }
      }
      return item;
    });

    if (orderChanged) {
      $set.items = items;
    }

    // Normalize root financial fields
    const totalAmount = order.totalAmount ?? order.financials?.totalAmount ?? 0;
    const subtotal = order.subtotal ?? order.financials?.subtotal ?? 0;
    const deliveryFee = order.deliveryFee ?? order.financials?.deliveryFee ?? 0;
    const discountAmount = order.discountAmount ?? order.financials?.discount ?? 0;

    if (order.totalAmount === undefined) {
      $set.totalAmount = totalAmount;
      orderChanged = true;
    }
    if (order.subtotal === undefined) {
      $set.subtotal = subtotal;
      orderChanged = true;
    }
    if (order.deliveryFee === undefined) {
      $set.deliveryFee = deliveryFee;
      orderChanged = true;
    }
    if (order.discountAmount === undefined) {
      $set.discountAmount = discountAmount;
      orderChanged = true;
    }

    const st = order.orderStatus || order.status || 'PENDING';
    if (!order.orderStatus) {
      $set.orderStatus = st;
      orderChanged = true;
    }
    if (!order.status) {
      $set.status = st;
      orderChanged = true;
    }

    if (orderChanged) {
      $set.updatedAt = new Date();
      await db.collection('orders').updateOne(
        { _id: order._id },
        { $set }
      );
      updatedOrdersCount++;
    }
  }
  console.log(`✅ Orders Image Audit Complete. Updated ${updatedOrdersCount} orders.\n`);

  console.log('🎉 ALL DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!');
  await mongoose.disconnect();
}

migrateDatabase().catch((err) => {
  console.error('❌ Migration Error:', err);
  process.exit(1);
});
