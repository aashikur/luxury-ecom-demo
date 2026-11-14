/**
 * Master Database Seeding Engine for Aurem E-Commerce Platform
 * Run with: npm run db:seed  (or: node scripts/seed.mjs)
 */

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, phoneNumber } from 'better-auth/plugins';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'aurem-secret-key-32-chars-long!!';
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const StoreConfigSchema = new mongoose.Schema(
  {
    branding: {
      storeName: { type: String, default: 'AUREM Luxury Garments' },
      tagline: { type: String, default: 'Artisanal Craftsmanship & Heavyweight Silhouettes' },
      storeNiche: { type: String, default: 'CLOTHING' },
      storeMode: { type: String, default: 'MULTI_PRODUCT' },
      logo: { url: { type: String, default: '' }, key: { type: String, default: '' } },
      favicon: { url: { type: String, default: '' }, key: { type: String, default: '' } },
      currencySymbol: { type: String, default: '৳' },
      currencyCode: { type: String, default: 'BDT' },
      themeMode: { type: String, default: 'LIGHT' },
      colors: {
        primary: { type: String, default: '#060d11' },
        accent: { type: String, default: '#076E46' },
        bg: { type: String, default: '#ffffff' },
        surface: { type: String, default: '#f8fafc' },
        fg: { type: String, default: '#060d11' },
        muted: { type: String, default: '#64748b' },
      },
      heroVariant: { type: String, default: 'SPLIT' },
    },
    homeSections: { type: Array, default: [] },
    logistics: {
      supportPhone: { type: String, default: '01700000000' },
      whatsappNumber: { type: String, default: '01700000000' },
      supportEmail: { type: String, default: 'support@aurem.com' },
      showroomAddress: { type: String, default: 'Banani 11, Dhaka, Bangladesh' },
      insideDhakaFee: { type: Number, default: 70 },
      suburbsDhakaFee: { type: Number, default: 100 },
      outsideDhakaFee: { type: Number, default: 130 },
      isFreeShippingEnabled: { type: Boolean, default: true },
      freeShippingThreshold: { type: Number, default: 2500 },
      estimatedDeliveryDays: {
        insideDhaka: { type: String, default: '24-48 Hours' },
        outsideDhaka: { type: String, default: '3-5 Days' },
      },
    },
    payment: {
      cashOnDelivery: { enabled: { type: Boolean, default: true } },
      manualBkash: {
        enabled: { type: Boolean, default: true },
        walletNumber: { type: String, default: '01700000000' },
        walletType: { type: String, default: 'MERCHANT' },
      },
      sslCommerz: {
        enabled: { type: Boolean, default: false },
        isSandbox: { type: Boolean, default: true },
      },
    },
    courier: {
      provider: { type: String, default: 'STEADFAST' },
    },
    features: {
      guestCheckoutOnly: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
      enableCoupons: { type: Boolean, default: true },
      enableStockBadges: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    ancestors: [String],
    image: { url: String, key: String },
    level: { type: Number, default: 0 },
    displayOrder: { type: Number, default: 0 },
    isFeaturedHome: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CollectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    bannerImage: { url: String, key: String },
    badgeText: String,
    displayOrder: { type: Number, default: 0 },
    isFeaturedHome: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    productType: { type: String, default: 'CLOTHING' },
    categorySlug: { type: String, required: true },
    categoryName: { type: String, default: '' },
    collections: [String],
    description: String,
    highlights: [String],
    media: [
      {
        url: String,
        key: String,
        type: { type: String, default: 'IMAGE' },
        altText: String,
      },
    ],
    basePrice: { type: Number, required: true },
    discountPrice: Number,
    hasVariants: { type: Boolean, default: true },
    variantOptions: Array,
    variants: Array,
    sizeChart: Array,
    totalStock: { type: Number, default: 50 },
    stockStatus: { type: String, default: 'AUTO' },
    inStock: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    status: { type: String, default: 'PUBLISHED' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StoreConfig = mongoose.models.StoreConfig || mongoose.model('StoreConfig', StoreConfigSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function runSeed() {
  console.log('🚀 Starting Aurem Master Database Seed Engine...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB via Mongoose');

  const nativeClient = new MongoClient(MONGODB_URI);
  await nativeClient.connect();
  const db = nativeClient.db();

  // 1. Better Auth Instance for Seeding Admin
  const auth = betterAuth({
    database: mongodbAdapter(db),
    secret: BETTER_AUTH_SECRET,
    baseURL: BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: 'string', defaultValue: 'USER' },
        phone: { type: 'string', required: false },
      },
    },
    plugins: [
      admin({
        defaultRole: 'USER',
        adminRole: ['ADMIN', 'SUPER_ADMIN'],
      }),
      phoneNumber({ sendOTP: async () => {} }),
    ],
  });

  // 2. Seed StoreConfig Singleton
  console.log('📦 Checking StoreConfig...');
  let config = await StoreConfig.findOne({ isActive: true });
  if (!config) {
    config = await StoreConfig.create({
      homeSections: [
        {
          id: 'sec-hero',
          type: 'HERO',
          title: 'Heavyweight Winter Drop 2026',
          subtitle: 'French Terry Cotton 450 GSM',
          order: 1,
          isActive: true,
        },
        {
          id: 'sec-winter-drop',
          type: 'COLLECTION_CAROUSEL',
          title: 'Winter Capsule Collection',
          subtitle: 'Curated winter silhouettes',
          collectionSlug: 'winter-drop-2026',
          limit: 8,
          order: 2,
          isActive: true,
        },
      ],
      isActive: true,
    });
    console.log('  ✨ Created default StoreConfig with 3-Zone tariffs (৳70/৳100/৳130)');
  } else {
    console.log('  ℹ️ StoreConfig already exists.');
  }

  // 3. Seed Marketing Collections
  console.log('📦 Checking Collections...');
  const collectionsData = [
    {
      title: 'Winter Drop 2026',
      slug: 'winter-drop-2026',
      description: 'Exclusive 450 GSM heavy French Terry and fleece outerwear.',
      badgeText: 'SEASON DROP',
      displayOrder: 1,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Featured Collection',
      slug: 'featured',
      description: 'Handcrafted signature essentials.',
      badgeText: 'BESTSELLERS',
      displayOrder: 2,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Heavyweight Hoodies',
      slug: 'hoodies',
      description: 'Signature oversized drop-shoulder silhouettes.',
      badgeText: 'CORE',
      displayOrder: 3,
      isFeaturedHome: false,
      isActive: true,
    },
  ];

  for (const c of collectionsData) {
    await Collection.findOneAndUpdate({ slug: c.slug }, c, { upsert: true });
  }
  console.log(`  ✨ Verified ${collectionsData.length} marketing collections.`);

  // 4. Seed Categories
  console.log('📦 Checking Categories...');
  const categoriesData = [
    { name: 'Men', slug: 'men', level: 0, displayOrder: 1, isActive: true },
    { name: 'Tops', slug: 'tops', level: 1, displayOrder: 2, ancestors: ['men'], isActive: true },
    { name: 'Hoodies', slug: 'hoodies', level: 2, displayOrder: 3, ancestors: ['men', 'tops'], isActive: true },
    { name: 'T-Shirts', slug: 't-shirts', level: 2, displayOrder: 4, ancestors: ['men', 'tops'], isActive: true },
    { name: 'Bottoms', slug: 'bottoms', level: 1, displayOrder: 5, ancestors: ['men'], isActive: true },
  ];

  for (const cat of categoriesData) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }
  console.log(`  ✨ Verified ${categoriesData.length} categories.`);

  // 5. Seed Products
  console.log('📦 Checking Products...');
  const productsData = [
    {
      title: 'Vintage Heavyweight Acid-Wash Hoodie',
      slug: 'vintage-heavyweight-acid-wash-hoodie',
      categorySlug: 'hoodies',
      categoryName: 'Hoodies',
      collections: ['winter-drop-2026', 'featured', 'hoodies'],
      description: '450 GSM French Terry Cotton. Custom vintage acid wash with dropped shoulders, double-layered hood, and raw distressing.',
      highlights: ['450 GSM French Terry Cotton', 'Oversized Boxy Silhouette', 'Pre-shrunk Vintage Acid Wash'],
      basePrice: 1850,
      discountPrice: 1450,
      hasVariants: true,
      totalStock: 30,
      inStock: true,
      status: 'PUBLISHED',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          key: 'seed/hoodie-1.webp',
          type: 'IMAGE',
          altText: 'Front view acid wash hoodie',
        },
        {
          url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
          key: 'seed/hoodie-2.webp',
          type: 'IMAGE',
          altText: 'Back view acid wash hoodie',
        },
      ],
      variantOptions: [
        { name: 'Size', values: [{ label: 'M' }, { label: 'L' }, { label: 'XL' }] },
        { name: 'Color', values: [{ label: 'Acid Black', meta: '#18181B' }] },
      ],
      variants: [
        {
          title: 'M / Acid Black',
          sku: 'HD-ACID-M',
          stock: 10,
          selectedOptions: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'Acid Black' },
          ],
        },
        {
          title: 'L / Acid Black',
          sku: 'HD-ACID-L',
          stock: 12,
          selectedOptions: [
            { name: 'Size', value: 'L' },
            { name: 'Color', value: 'Acid Black' },
          ],
        },
        {
          title: 'XL / Acid Black',
          sku: 'HD-ACID-XL',
          stock: 8,
          selectedOptions: [
            { name: 'Size', value: 'XL' },
            { name: 'Color', value: 'Acid Black' },
          ],
        },
      ],
      sizeChart: [
        { size: 'M', chest: '44', length: '28', sleeve: '24' },
        { size: 'L', chest: '46', length: '29', sleeve: '25' },
        { size: 'XL', chest: '48', length: '30', sleeve: '25.5' },
      ],
    },
    {
      title: 'Boxy Heavyweight Drop-Shoulder Tee',
      slug: 'boxy-heavyweight-drop-shoulder-tee',
      categorySlug: 't-shirts',
      categoryName: 'T-Shirts',
      collections: ['featured'],
      description: '280 GSM Compact Combed Cotton. Ribbed high-collar, double-needle stitching, and structured drape.',
      highlights: ['280 GSM Pure Combed Cotton', 'Boxy Streetwear Fit', 'Zero Shrinkage Guarantee'],
      basePrice: 950,
      discountPrice: 750,
      hasVariants: true,
      totalStock: 36,
      inStock: true,
      status: 'PUBLISHED',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          key: 'seed/tee-1.webp',
          type: 'IMAGE',
          altText: 'Bone White Boxy Tee',
        },
      ],
      variantOptions: [
        { name: 'Size', values: [{ label: 'M' }, { label: 'L' }] },
        { name: 'Color', values: [{ label: 'Bone White', meta: '#F5F5F0' }] },
      ],
      variants: [
        {
          title: 'M / Bone White',
          sku: 'TEE-BOXY-M',
          stock: 20,
          selectedOptions: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'Bone White' },
          ],
        },
        {
          title: 'L / Bone White',
          sku: 'TEE-BOXY-L',
          stock: 16,
          selectedOptions: [
            { name: 'Size', value: 'L' },
            { name: 'Color', value: 'Bone White' },
          ],
        },
      ],
      sizeChart: [
        { size: 'M', chest: '42', length: '28', sleeve: '9.5' },
        { size: 'L', chest: '44', length: '29', sleeve: '10' },
      ],
    },
  ];

  for (const p of productsData) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
  }
  console.log(`  ✨ Verified ${productsData.length} multi-variant products.`);

  // 6. Seed Initial Better Auth SUPER_ADMIN
  console.log('🔒 Checking Super Admin account...');
  const adminEmail = 'admin@aurem.com';
  const adminPassword = 'AdminPassword123!';

  const existingUser = await db.collection('user').findOne({ email: adminEmail });
  if (!existingUser) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: 'Platform Super Admin',
        },
      });

      // Elevate role to SUPER_ADMIN
      await db.collection('user').updateOne(
        { email: adminEmail },
        { $set: { role: 'SUPER_ADMIN' } }
      );

      console.log('  🎉 SUPER_ADMIN account created successfully!');
      console.log(`     Email:    ${adminEmail}`);
      console.log(`     Password: ${adminPassword}`);
      console.log(`     Role:     SUPER_ADMIN`);
    } catch (err) {
      console.warn('  ⚠️ Notice during admin creation:', err.message);
    }
  } else {
    // Ensure role is SUPER_ADMIN
    await db.collection('user').updateOne(
      { email: adminEmail },
      { $set: { role: 'SUPER_ADMIN' } }
    );
    console.log(`  ℹ️ Super Admin account already exists (${adminEmail} - role: SUPER_ADMIN).`);
  }

  console.log('✅ Master Database Seeding Completed Successfully!\n');
  await nativeClient.close();
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
