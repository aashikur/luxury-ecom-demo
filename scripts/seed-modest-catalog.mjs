/**
 * Master Modest Luxury Fashion Seed Engine (100+ Products)
 * Run with: node scripts/seed-modest-catalog.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 18 Cloudflare R2 Authentic Garment Photographs from Live Cloud
// ---------------------------------------------------------------------------
const CLOUD_IMAGES = {
  skyKhaddar1: 'https://cdn-demo.vectorfitlab.com/products/1794312179544-Sky2pcLuxeursEmbroideredKhaddarDress_5.webp',
  skyKhaddar2: 'https://cdn-demo.vectorfitlab.com/products/1794312187203-Sky_2pc_Luxeurs_Embroidered_Khaddar_Dress_4.webp',
  skyKhaddar3: 'https://cdn-demo.vectorfitlab.com/products/1794647679721-Sky2pcLuxeursEmbroideredKhaddarDress_5.webp',
  berryKhaddar1: 'https://cdn-demo.vectorfitlab.com/products/1794312297438-Berry2pcLuxeursEmbroideredKhaddarDress_1.webp',
  berryKhaddar2: 'https://cdn-demo.vectorfitlab.com/products/1794317905415-Berry2pcLuxeursEmbroideredKhaddarDress_1.webp',
  violaKhaddar: 'https://cdn-demo.vectorfitlab.com/products/1794312274748-Viola3pcLuxeursEmbroideredKhaddarDress_2.webp',
  liraKhaddar1: 'https://cdn-demo.vectorfitlab.com/products/1794312231641-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp',
  liraKhaddar2: 'https://cdn-demo.vectorfitlab.com/products/1794312239582-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_2.webp',
  liraKhaddar3: 'https://cdn-demo.vectorfitlab.com/products/1794319193364-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp',
  lyonKhaddar1: 'https://cdn-demo.vectorfitlab.com/products/1794312317052-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp',
  lyonKhaddar2: 'https://cdn-demo.vectorfitlab.com/products/1794647649595-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp',
  stoleLeopard1: 'https://cdn-demo.vectorfitlab.com/products/1794317939439-90F0999E-D22C-48ED-80DC-6A9E89022999-(1).webp',
  stoleLeopard2: 'https://cdn-demo.vectorfitlab.com/products/1794317984119-7563EC8B-DB00-4E05-A4AB-F2174A4B602F.webp',
  stolePashmina1: 'https://cdn-demo.vectorfitlab.com/products/1794428314779-1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp',
  stolePashmina2: 'https://cdn-demo.vectorfitlab.com/products/1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp',
  stolePashmina3: 'https://cdn-demo.vectorfitlab.com/products/1794814085687-1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp',
  stoleGeometric: 'https://cdn-demo.vectorfitlab.com/products/1794318039923-8299EB87-2946-4592-9770-DCCA7F2FB032.webp',
  stoleSilkFloral: 'https://cdn-demo.vectorfitlab.com/products/1794318093129-796A9FCE-98A0-4F69-BBA4-1E02602B4740.webp',
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
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
    parentSlug: { type: String, default: null, index: true },
    description: String,
    bannerImage: { url: String, key: String },
    badgeText: String,
    displayOrder: { type: Number, default: 0 },
    isFeaturedHome: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
    productType: { type: String, default: 'CLOTHING' },
    hasVariants: { type: Boolean, default: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    categorySlug: { type: String, default: '' },
    categoryPath: [{ type: String }],
    categoryName: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
    brandName: { type: String, default: '' },
    brandSlug: { type: String, default: '' },
    collections: [{ type: String }],
    tags: [{ type: String }],
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    maxPrice: { type: Number },
    costPrice: { type: Number },
    sku: { type: String, default: '' },
    totalStock: { type: Number, default: 0 },
    stockStatus: { type: String, default: 'AUTO' },
    inStock: { type: Boolean, default: true },
    media: [
      {
        url: { type: String, required: true },
        key: { type: String, default: '' },
        thumbnailUrl: { type: String, default: '' },
        type: { type: String, default: 'IMAGE' },
        altText: { type: String, default: '' },
      },
    ],
    variantOptions: [
      {
        name: { type: String, required: true },
        values: [
          {
            label: { type: String, required: true },
            meta: { type: String, default: '' },
          },
        ],
      },
    ],
    variants: [
      {
        sku: { type: String, required: true },
        title: { type: String, default: '' },
        label: { type: String, default: '' },
        selectedOptions: [
          {
            name: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
        price: { type: Number },
        discountPrice: { type: Number },
        costPrice: { type: Number },
        stock: { type: Number, default: 0 },
        stockStatus: { type: String, default: 'AUTO' },
        image: { url: { type: String, default: '' } },
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
      },
    ],
    sizeChart: [
      {
        size: String,
        chest: String,
        length: String,
        sleeve: String,
      },
    ],
    status: { type: String, default: 'PUBLISHED' },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StoreConfigSchema = new mongoose.Schema({}, { strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const StoreConfig = mongoose.models.StoreConfig || mongoose.model('StoreConfig', StoreConfigSchema);

async function runSeed() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  // -------------------------------------------------------------------------
  // 1. Seed Brands
  // -------------------------------------------------------------------------
  console.log('\n👑 Seeding Brands...');
  await Brand.deleteMany({});
  const brandsData = [
    {
      name: 'Aurem Modest Couture',
      slug: 'aurem-modest-couture',
      description: 'Signature luxury abayas, Dubai kimonos, and artisanal embroidery.',
      featured: true,
      order: 1,
      isActive: true,
    },
    {
      name: 'Luxeurs Heritage',
      slug: 'luxeurs-heritage',
      description: 'Handcrafted khaddar, unstitched & pret 3-piece luxury suits.',
      featured: true,
      order: 2,
      isActive: true,
    },
    {
      name: 'Flora & Grace',
      slug: 'flora-and-grace',
      description: 'Botanical prints, lightweight silk scarves, and floral gift hampers.',
      featured: true,
      order: 3,
      isActive: true,
    },
    {
      name: 'Bari Textiles',
      slug: 'bari-textiles',
      description: 'Everyday premium pashmina stoles, daily prayer abayas, and essentials.',
      featured: false,
      order: 4,
      isActive: true,
    },
  ];

  const brandDocs = {};
  for (const b of brandsData) {
    const created = await Brand.create(b);
    brandDocs[b.slug] = created;
    console.log(`  ✨ Brand: ${b.name} (${b.slug})`);
  }

  // -------------------------------------------------------------------------
  // 2. Seed Marketing Collections
  // -------------------------------------------------------------------------
  console.log('\n🏷️ Seeding Marketing Collections...');
  await Collection.deleteMany({});
  const collectionsData = [
    // 1. Top-Level Parent: Occasions
    {
      title: 'Occasions & Celebrations',
      slug: 'occasions',
      parentSlug: null,
      description: 'Exclusive artisanal curation for sacred celebrations and festive gatherings.',
      badgeText: 'FESTIVE EDIT',
      displayOrder: 1,
      isFeaturedHome: true,
      isActive: true,
    },
    // Child Collections of Occasions
    {
      title: 'Ramadan Edit',
      slug: 'ramadan',
      parentSlug: 'occasions',
      description: 'Serene silhouettes, breathable khaddar, and modest everyday abayas for Ramadan.',
      badgeText: 'HOLY MONTH',
      displayOrder: 1,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Eid-ul-Fitr Luxury',
      slug: 'eid-ul-fitr',
      parentSlug: 'occasions',
      description: 'Opulent gold-zari embroidered ensembles, organza dupattas, and festive luxury.',
      badgeText: 'EID 2026',
      displayOrder: 2,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Luxury Gift Hampers',
      slug: 'luxury-gift-hampers',
      parentSlug: 'occasions',
      description: 'Thoughtfully packaged hijab, fragrance, and floral gift boxes for special moments.',
      badgeText: 'GIFT BOX',
      displayOrder: 3,
      isFeaturedHome: true,
      isActive: true,
    },

    // 2. Top-Level Parent: Modest Fashion
    {
      title: 'Modest Couture',
      slug: 'modest-fashion',
      parentSlug: null,
      description: 'Contemporary modest silhouettes tailored with bespoke luxury and refined craftsmanship.',
      badgeText: 'SIGNATURE',
      displayOrder: 2,
      isFeaturedHome: true,
      isActive: true,
    },
    // Child Collections of Modest Fashion
    {
      title: 'Signature Abayas',
      slug: 'signature-abayas',
      parentSlug: 'modest-fashion',
      description: 'Tailored Dubai-cut and Turkish nida abayas with subtle hand-worked embellishments.',
      badgeText: 'LUXURY CUT',
      displayOrder: 1,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Winter Khaddar Drop 2026',
      slug: 'winter-khaddar-2026',
      parentSlug: 'modest-fashion',
      description: 'Heavyweight embroidered 2pc and 3pc khaddar suits for winter comfort.',
      badgeText: 'SEASONAL DROP',
      displayOrder: 2,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Pret & Co-ords',
      slug: 'pret-and-coords',
      parentSlug: 'modest-fashion',
      description: 'Modern two-piece ensembles designed for effortless elegance.',
      badgeText: 'TRENDING',
      displayOrder: 3,
      isFeaturedHome: true,
      isActive: true,
    },

    // 3. Standalone Curations
    {
      title: 'Best Sellers',
      slug: 'best-sellers',
      parentSlug: null,
      description: 'Our most sought-after silhouettes and client-favorite restocks.',
      badgeText: 'TOP RATED',
      displayOrder: 3,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Under ৳3,000 Everyday',
      slug: 'under-3000-everyday',
      parentSlug: null,
      description: 'Accessible luxury essentials, everyday stoles, and casual co-ords.',
      badgeText: 'VALUE',
      displayOrder: 4,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Featured Collection',
      slug: 'featured',
      parentSlug: null,
      description: 'Editorially curated garments spotlighted across the boutique.',
      badgeText: 'FEATURED',
      displayOrder: 5,
      isFeaturedHome: true,
      isActive: true,
    },
  ];

  for (const c of collectionsData) {
    await Collection.create(c);
    console.log(`  ✨ Collection: ${c.title} (${c.slug})`);
  }

  // -------------------------------------------------------------------------
  // 3. Seed Hierarchical Taxonomy (Categories & Subcategories)
  // -------------------------------------------------------------------------
  console.log('\n📁 Seeding Categories & Subcategories...');
  await Category.deleteMany({});

  // Level 0: Root Department
  const womenRoot = await Category.create({
    name: 'Women',
    slug: 'women',
    level: 0,
    displayOrder: 1,
    isFeaturedHome: true,
    isActive: true,
    description: 'Luxury modest wear, bespoke abayas, unstitched pret, and artisanal stoles.',
  });

  // Level 1: Primary Categories
  const catAbayas = await Category.create({
    name: 'Abayas & Kimonos',
    slug: 'abayas-and-kimonos',
    parentId: womenRoot._id,
    ancestors: ['women'],
    level: 1,
    displayOrder: 1,
    isFeaturedHome: true,
    isActive: true,
  });

  const catHijabs = await Category.create({
    name: 'Hijabs & Luxury Stoles',
    slug: 'hijabs-and-stoles',
    parentId: womenRoot._id,
    ancestors: ['women'],
    level: 1,
    displayOrder: 2,
    isFeaturedHome: true,
    isActive: true,
  });

  const catPret = await Category.create({
    name: 'Pret & Embroidered Suits',
    slug: 'pret-and-embroidered-suits',
    parentId: womenRoot._id,
    ancestors: ['women'],
    level: 1,
    displayOrder: 3,
    isFeaturedHome: true,
    isActive: true,
  });

  const catGifts = await Category.create({
    name: 'Floral & Gift Sets',
    slug: 'floral-and-gift-sets',
    parentId: womenRoot._id,
    ancestors: ['women'],
    level: 1,
    displayOrder: 4,
    isFeaturedHome: true,
    isActive: true,
  });

  // Level 2: Subcategories
  const subCats = {};

  const subCatDefs = [
    // Under Abayas
    { parent: catAbayas, name: 'Classic Black Abayas', slug: 'classic-black-abayas' },
    { parent: catAbayas, name: 'Embroidered Luxury Abayas', slug: 'embroidered-luxury-abayas' },
    { parent: catAbayas, name: 'Open-Front Linen Kimonos', slug: 'open-front-kimonos' },

    // Under Hijabs & Stoles
    { parent: catHijabs, name: 'Silk & Georgette Hijabs', slug: 'silk-and-georgette-hijabs' },
    { parent: catHijabs, name: 'Embroidered Khaddar Stoles', slug: 'embroidered-khaddar-stoles' },
    { parent: catHijabs, name: 'Cashmere & Pashmina Shawls', slug: 'cashmere-pashmina-shawls' },

    // Under Pret & Suits
    { parent: catPret, name: '3-Piece Embroidered Khaddar', slug: '3-piece-embroidered-khaddar' },
    { parent: catPret, name: '2-Piece Luxury Pret', slug: '2-piece-luxury-pret' },
    { parent: catPret, name: 'Everyday Minimalist Co-ords', slug: 'everyday-minimalist-coords' },

    // Under Gifts
    { parent: catGifts, name: 'Luxury Hijab Gift Boxes', slug: 'luxury-hijab-gift-boxes' },
    { parent: catGifts, name: 'Bridal Floral Hampers', slug: 'bridal-floral-hampers' },
  ];

  for (const s of subCatDefs) {
    const created = await Category.create({
      name: s.name,
      slug: s.slug,
      parentId: s.parent._id,
      ancestors: ['women', s.parent.slug],
      level: 2,
      displayOrder: 1,
      isFeaturedHome: true,
      isActive: true,
    });
    subCats[s.slug] = created;
    console.log(`  ↳ Subcategory: ${s.name} (${s.slug}) under ${s.parent.name}`);
  }

  // -------------------------------------------------------------------------
  // 4. Generate 100+ Curated Products
  // -------------------------------------------------------------------------
  console.log('\n👗 Generating 100+ Products using Cloudflare R2 Cloud Images...');
  await Product.deleteMany({});

  // Garment sizes & charts
  const abayaSizes = ['52', '54', '56', '58'];
  const pretSizes = ['S', 'M', 'L', 'XL'];
  const freeSize = ['Free Size'];

  const abayaSizeChart = [
    { size: '52', chest: '40', length: '52', sleeve: '27' },
    { size: '54', chest: '42', length: '54', sleeve: '28' },
    { size: '56', chest: '44', length: '56', sleeve: '28.5' },
    { size: '58', chest: '46', length: '58', sleeve: '29' },
  ];

  const pretSizeChart = [
    { size: 'S', chest: '38', length: '40', sleeve: '22' },
    { size: 'M', chest: '40', length: '42', sleeve: '22.5' },
    { size: 'L', chest: '43', length: '43', sleeve: '23' },
    { size: 'XL', chest: '46', length: '44', sleeve: '23.5' },
  ];

  // Curated Color Palettes
  const colors = [
    { label: 'Midnight Black', meta: '#1C1C1E' },
    { label: 'Deep Berry', meta: '#6B2D5C' },
    { label: 'Sky Khaddar', meta: '#4A6B82' },
    { label: 'Sand Dune', meta: '#C2A68D' },
    { label: 'Olive Emerald', meta: '#355E3B' },
    { label: 'Champagne Gold', meta: '#D4AF37' },
    { label: 'Smoky Viola', meta: '#4E3852' },
    { label: 'Mocha Rose', meta: '#8B5A5A' },
  ];

  // Catalog Blueprint: 11 Categories, generating ~10 products per category = 110 total products
  const categoryBlueprints = [
    // 1. Classic Black Abayas (10 products)
    {
      subSlug: 'classic-black-abayas',
      brandSlug: 'aurem-modest-couture',
      collections: ['signature-abayas', 'best-sellers', 'featured'],
      sizes: abayaSizes,
      sizeChart: abayaSizeChart,
      type: 'ABAYA',
      images: [CLOUD_IMAGES.liraKhaddar3, CLOUD_IMAGES.stolePashmina2],
      basePriceRange: [3850, 4850],
      titles: [
        'Noor Classic Dubai Nida Black Abaya',
        'Zahra Minimalist Wide-Sleeve A-Line Abaya',
        'Ayah Double-Georgette Pleated Black Abaya',
        'Sultana Hand-Stitched Cuffed Dubai Abaya',
        'Mina Everyday Lightweight Crepe Abaya',
        'Layla Modest Flared Umbrella Abaya',
        'Safiyya Button-Front Formal Black Abaya',
        'Hafsa Bell-Sleeve Korean Nida Abaya',
        'Maryam Textured Matte Silk Black Abaya',
        'Ruqayyah Classic Straight-Cut Everyday Abaya',
      ],
      descTemplate: (title) =>
        `${title}. Tailored from premium Dubai Nida and Japanese crepe fabric. Features a generous silhouette, graceful drape, and breathable softness designed for all-day elegance.`,
      highlights: ['Premium Breathable Dubai Nida', 'Wrinkle-Resistant Flowing Silhouette', 'Concealed Side Pockets & Cuffed Sleeves'],
    },

    // 2. Embroidered Luxury Abayas (10 products)
    {
      subSlug: 'embroidered-luxury-abayas',
      brandSlug: 'aurem-modest-couture',
      collections: ['signature-abayas', 'featured'],
      sizes: abayaSizes,
      sizeChart: abayaSizeChart,
      type: 'ABAYA',
      images: [CLOUD_IMAGES.violaKhaddar, CLOUD_IMAGES.liraKhaddar1],
      basePriceRange: [5250, 6850],
      titles: [
        'Zulaikha Intricate Gold Zari Embroidered Abaya',
        'Aurelia Resham Threadwork Festive Abaya',
        'Malika Floral Vine Hand-Embroidered Abaya',
        'Samira Scalloped Lace Hemline Luxury Abaya',
        'Farah Cutwork Sleeve Organza Panel Abaya',
        'Nazia Persian Paisley Embroidered Kimono Abaya',
        'Yasmin Pearl-Embellished Formal Evening Abaya',
        'Shahida Royal Velvet Yoke Embroidered Abaya',
        'Khadija Crystal Stone Bordered Luxury Abaya',
        'Inaya Metallic Thread Artisanal Black Abaya',
      ],
      descTemplate: (title) =>
        `${title}. An exquisite artisanal masterpiece crafted with meticulous threadwork and delicate embellishments across the neckline and cuffs. Ideal for formal gatherings and festive celebrations.`,
      highlights: ['Handcrafted Resham & Zari Needlework', 'Includes Matching Embroidered Sheila Hijab', 'Lined with Silky Soft Touch Interior'],
    },

    // 3. Open-Front Linen Kimonos (10 products)
    {
      subSlug: 'open-front-kimonos',
      brandSlug: 'aurem-modest-couture',
      collections: ['signature-abayas', 'pret-and-coords'],
      sizes: abayaSizes,
      sizeChart: abayaSizeChart,
      type: 'ABAYA',
      images: [CLOUD_IMAGES.stoleGeometric, CLOUD_IMAGES.skyKhaddar2],
      basePriceRange: [3450, 4450],
      titles: [
        'Sahara Slub Linen Belted Kimono Overcoat',
        'Atlas Textured Earth Tone Open Kimono',
        'Oasis Dropped-Shoulder Breezy Linen Duster',
        'Nile Cascading Lapel Modest Linen Shrug',
        'Casablanca Minimalist Pinstripe Open Abaya',
        'Cordoba Flared Cuff Pure Cotton Kimono',
        'Tanger Relaxed Fit Bohemian Modest Duster',
        'Valencia Structured Linen Outerwear Cardigan',
        'Granada Tailored Lapel Modest Trench Kimono',
        'Petra Raw-Edge Textured Earthy Kimono',
      ],
      descTemplate: (title) =>
        `${title}. Effortlessly layer your wardrobe with this breathable slub linen open-front kimono. Features a relaxed tailored fit, detachable waist tie belt, and deep patch pockets.`,
      highlights: ['100% Breathable Slub Linen', 'Detachable Self-Fabric Tie Belt', 'Versatile Layering for Casual & Formal Looks'],
    },

    // 4. Silk & Georgette Hijabs (10 products)
    {
      subSlug: 'silk-and-georgette-hijabs',
      brandSlug: 'flora-and-grace',
      collections: ['under-3000-everyday', 'best-sellers'],
      sizes: freeSize,
      sizeChart: [{ size: 'Free Size', chest: 'N/A', length: '75 x 30 in', sleeve: 'N/A' }],
      type: 'HIJAB',
      images: [CLOUD_IMAGES.stoleSilkFloral, CLOUD_IMAGES.stoleLeopard1],
      basePriceRange: [1150, 1650],
      titles: [
        'Flora Pure Satin Silk Floral Print Hijab',
        'Aria Premium Korean Heavy Georgette Scarf',
        'Luxe Crinkled Chiffon Everyday Hijab',
        'Botanical Garden Watercolor Silk Square Scarf',
        'Opal Shimmer Textured Modal Silk Hijab',
        'Monochrome Abstract Bordered Satin Scarf',
        'Dahlia Pastel Rose Printed Silk Shawl',
        'Celeste Metallic Foil Dot Georgette Hijab',
        'Mariposa Wildflower Luxury Satin Hijab',
        'Serena Non-Slip Matte Silk Chiffon Hijab',
      ],
      descTemplate: (title) =>
        `${title}. Ultra-soft touch with graceful opacity and elegant drape. Measuring 75 x 30 inches for full coverage and effortless styling without slippage.`,
      highlights: ['Non-Slip Premium Korean Fabric', 'Generous 75 x 30 Inches Full Coverage', 'Fade-Resistant Eco-Friendly Reactive Dye'],
    },

    // 5. Embroidered Khaddar Stoles (10 products)
    {
      subSlug: 'embroidered-khaddar-stoles',
      brandSlug: 'luxeurs-heritage',
      collections: ['winter-khaddar-2026', 'under-3000-everyday'],
      sizes: freeSize,
      sizeChart: [{ size: 'Free Size', chest: 'N/A', length: '80 x 28 in', sleeve: 'N/A' }],
      type: 'STOLE',
      images: [CLOUD_IMAGES.stoleLeopard2, CLOUD_IMAGES.stolePashmina1],
      basePriceRange: [1450, 1950],
      titles: [
        'Zeba Embroidered Pallu Khaddar Stole',
        'Rangrez Contrast Resham Khaddar Shawl',
        'Pari Cross-Stitch Floral Border Stole',
        'Gulrukh Heavy Khaddar Winter Shawl',
        'Nazneen Kashmiri Paisley Embroidered Stole',
        'Sitara Geometric Thread Khaddar Wrap',
        'Mahnoor Block Print Textured Khaddar Stole',
        'Zeenat Multi-Tone Embroidered Khaddar Wrap',
        'Afreen Fringe Hem Floral Khaddar Stole',
        'Bano Traditional Needlework Khaddar Shawl',
      ],
      descTemplate: (title) =>
        `${title}. Woven on traditional wooden looms from textured pure khaddar yarn, decorated with vibrant ethnic thread embroidery and hand-tied fringes.`,
      highlights: ['Warm Handspun Khaddar Fabric', 'Traditional Needlework Embroidery', 'Hand-Knotted Tassel Fringes'],
    },

    // 6. Cashmere & Pashmina Shawls (10 products)
    {
      subSlug: 'cashmere-pashmina-shawls',
      brandSlug: 'bari-textiles',
      collections: ['winter-khaddar-2026', 'featured'],
      sizes: freeSize,
      sizeChart: [{ size: 'Free Size', chest: 'N/A', length: '85 x 35 in', sleeve: 'N/A' }],
      type: 'SHAWL',
      images: [CLOUD_IMAGES.stolePashmina1, CLOUD_IMAGES.stolePashmina2],
      basePriceRange: [2250, 3250],
      titles: [
        'Kashmir Sozni Tilla Work Pashmina Shawl',
        'Royal Jacquard Woven Cashmere Winter Wrap',
        'Chinar Leaf Antique Pashmina Warm Shawl',
        'Vintage Jamawar Reversible Pashmina Shawl',
        'Heritage Bordered Cashmere Wool Stole',
        'Imperial Mughal Motif Pashmina Wrap',
        'Valley Mist Solid Pure Cashmere Shawl',
        'Badam Kani Woven Pashmina Heritage Stole',
        'Velvet Finish Ultra-Soft Pashmina Shawl',
        'Koh-i-Noor Embroidered Border Cashmere Wrap',
      ],
      descTemplate: (title) =>
        `${title}. Luxuriously featherlight yet deeply insulating. Woven with authentic cashmere wool fibers and detailed with delicate ethnic border motifs.`,
      highlights: ['Ultra-Soft Pure Cashmere Feel', 'Featherlight Weight with High Insulation', 'Timeless Heritage Heirloom Piece'],
    },

    // 7. 3-Piece Embroidered Khaddar Suits (10 products)
    {
      subSlug: '3-piece-embroidered-khaddar',
      brandSlug: 'luxeurs-heritage',
      collections: ['winter-khaddar-2026', 'best-sellers', 'featured'],
      sizes: pretSizes,
      sizeChart: pretSizeChart,
      type: 'SUIT_3PC',
      images: [CLOUD_IMAGES.liraKhaddar1, CLOUD_IMAGES.liraKhaddar2, CLOUD_IMAGES.violaKhaddar],
      basePriceRange: [4250, 5650],
      titles: [
        'Lira 3-Piece Embroidered Khaddar Festive Suit',
        'Viola 3-Piece Resham Khaddar Ensemble',
        'Mehru 3-Piece Zari Khaddar Suit with Wool Dupatta',
        'Sahar 3-Piece Hand-Embroidered Khaddar Set',
        'Rani 3-Piece Jacquard Khaddar Formal Suit',
        'Dua 3-Piece Velvet Patch Embroidered Khaddar Suit',
        'Anum 3-Piece Floral Embroidered Khaddar Ensemble',
        'Kainat 3-Piece Heavy Neckline Khaddar Suit',
        'Zoya 3-Piece Winter Khaddar Suit with Pashmina Shawl',
        'Hoor 3-Piece Contrast Embroidered Khaddar Luxury Suit',
      ],
      descTemplate: (title) =>
        `${title}. Includes an intricately embroidered khaddar shirt with organza cutwork, tailored straight trousers, and an all-over printed pashmina wool shawl.`,
      highlights: ['Complete 3-Piece Luxury Ensemble', 'Heavy Embroidered Yoke & Border Patch', 'Includes Warm Printed Pashmina Shawl'],
    },

    // 8. 2-Piece Luxury Pret (10 products)
    {
      subSlug: '2-piece-luxury-pret',
      brandSlug: 'luxeurs-heritage',
      collections: ['winter-khaddar-2026', 'pret-and-coords', 'under-3000-everyday'],
      sizes: pretSizes,
      sizeChart: pretSizeChart,
      type: 'SUIT_2PC',
      images: [CLOUD_IMAGES.skyKhaddar1, CLOUD_IMAGES.skyKhaddar2, CLOUD_IMAGES.berryKhaddar1],
      basePriceRange: [2850, 3650],
      titles: [
        'Sky 2-Piece Embroidered Khaddar Co-ord Set',
        'Berry 2-Piece Minimalist Embroidered Khaddar Suit',
        'Lyon 2-Piece Tailored Kurti & Cigarette Pant Set',
        'Amber 2-Piece A-Line Khaddar Pret Suit',
        'Indigo 2-Piece Block Print Khaddar Tunic & Trousers',
        'Sage 2-Piece Scalloped Hem Embroidered Pret',
        'Blush 2-Piece Pearl Button Khaddar Tunic Set',
        'Charcoal 2-Piece Geometric Embroidered Kurti Set',
        'Mustard 2-Piece Raw Edge Khaddar Kurta Set',
        'Teal 2-Piece Schiffli Embroidered Khaddar Suit',
      ],
      descTemplate: (title) =>
        `${title}. A contemporary 2-piece ready-to-wear ensemble tailored with clean cuts, high-definition thread embroidery, and matching tailored cigarette trousers.`,
      highlights: ['Contemporary Semi-Formal Cut', 'Pre-Shrunk 100% Cotton Khaddar', 'Tailored Cigarette Trousers with Elastic Back'],
    },

    // 9. Everyday Minimalist Co-ords (10 products)
    {
      subSlug: 'everyday-minimalist-coords',
      brandSlug: 'luxeurs-heritage',
      collections: ['pret-and-coords', 'under-3000-everyday'],
      sizes: pretSizes,
      sizeChart: pretSizeChart,
      type: 'COORD',
      images: [CLOUD_IMAGES.lyonKhaddar1, CLOUD_IMAGES.lyonKhaddar2],
      basePriceRange: [2450, 2950],
      titles: [
        'Urban Nomad Minimalist Boxy Kurta & Trouser Co-ord',
        'Monochrome Slit-Hem Relaxed Co-ord Set',
        'Oatmeal Melange Textured Daily Co-ord',
        'Earthy Terracotta Everyday Button-Front Co-ord',
        'Slate Grey Drop-Shoulder Minimalist Co-ord',
        'Forest Pine Tailored Tunic & Culotte Co-ord',
        'Sandstone Pure Linen Relaxed Co-ord Set',
        'Dusty Cedar Mandarin Collar Co-ord Set',
        'Olive Branch Wide-Leg Casual Loungewear Co-ord',
        'Pewter Everyday High-Low Hemline Co-ord',
      ],
      descTemplate: (title) =>
        `${title}. Designed for the modern woman seeking uncompromised modesty with streamlined, relaxed proportions. Easy to care for and tailored for everyday luxury.`,
      highlights: ['Breathable Combed Cotton & Linen Blend', 'Deep Side Pockets on Pants and Tunic', 'Zero-Fuss Minimalist Aesthetic'],
    },

    // 10. Luxury Hijab Gift Boxes (10 products)
    {
      subSlug: 'luxury-hijab-gift-boxes',
      brandSlug: 'flora-and-grace',
      collections: ['luxury-gift-hampers', 'best-sellers', 'featured'],
      sizes: freeSize,
      sizeChart: [{ size: 'Free Size', chest: 'N/A', length: 'Standard Gift Box', sleeve: 'N/A' }],
      type: 'GIFT_BOX',
      images: [CLOUD_IMAGES.stoleSilkFloral, CLOUD_IMAGES.stoleLeopard1],
      basePriceRange: [2850, 3850],
      titles: [
        'The Royal Velvet 4-Piece Satin Hijab Hamper',
        'Ethereal Grace Chiffon Hijab & Magnet Pin Gift Box',
        'Serenity Pastel Silk Scarf & Scented Candle Box',
        'Bespoke Bridal Gold-Foil Hijab Presentation Box',
        'The Minimalist Earth Palette 3-Piece Hijab Box',
        'Midnight Elegance Black-Tie Hijab & Brooch Box',
        'Rosewater Luxury Silk Hijab & Pearl Pin Set',
        'The Heritage Collection Embroidered Stole Gift Set',
        'Blossom Keepsake Box with Georgette Scarves',
        'Opulence Velvet Presentation Box with Turkish Silk Hijabs',
      ],
      descTemplate: (title) =>
        `${title}. Curated inside a gold-embossed keepsake hardbox tied with double-faced satin ribbon. Includes coordinating scarves, magnetic hijab pins, and a customized greeting card.`,
      highlights: ['Includes Rigid Gold-Embossed Keepsake Box', 'Includes Scratch-Free Magnetic Hijab Pins', 'Ready to Gift with Satin Ribbon & Greeting Card'],
    },

    // 11. Bridal Floral Hampers (10 products)
    {
      subSlug: 'bridal-floral-hampers',
      brandSlug: 'flora-and-grace',
      collections: ['luxury-gift-hampers', 'featured'],
      sizes: freeSize,
      sizeChart: [{ size: 'Free Size', chest: 'N/A', length: 'Deluxe Hamper Box', sleeve: 'N/A' }],
      type: 'GIFT_BOX',
      images: [CLOUD_IMAGES.stoleLeopard2, CLOUD_IMAGES.stoleSilkFloral],
      basePriceRange: [4850, 7500],
      titles: [
        'Bridal Radiance Pure Silk Scarf & Floral Bouquet Hamper',
        'The Sultana Grand Wedding Gift Basket',
        'Eternal Blossom Dried Floral & Pashmina Hamper',
        'Golden Nikkah Keepsake Hamper with Embroidered Shawl',
        'Velvet Romance Silk Nightwear & Scarf Gift Hamper',
        'Aura of Spring Fresh-Cut Floral & Perfume Hamper',
        'Imperial Bride Gold Zari Stole & Crystal Tasbih Box',
        'The Royal Empress Deluxe Multi-Tier Gift Hamper',
        'White Jasmine Floral Scent & Pure Georgette Gift Set',
        'Heirloom Bridal Cashmere & Preserved Roses Hamper',
      ],
      descTemplate: (title) =>
        `${title}. The ultimate gesture of celebration. Hand-assembled with premium preserved florals, handcrafted luxury shawls, artisanal fragrance, and custom calligraphy.`,
      highlights: ['Artisan Handcrafted Preserved Floral Bouquet', 'Includes Premium Pure Silk or Pashmina Shawl', 'Luxury Hardcover Gift Presentation with Personal Message'],
    },
  ];

  const allProductsToInsert = [];
  let productCounter = 1;

  for (const bp of categoryBlueprints) {
    const subCat = subCats[bp.subSlug];
    const brand = brandDocs[bp.brandSlug];

    if (!subCat) {
      console.warn(`Subcategory missing for ${bp.subSlug}`);
      continue;
    }

    for (let i = 0; i < bp.titles.length; i++) {
      const title = bp.titles[i];
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Base price variations
      const minP = bp.basePriceRange[0];
      const maxP = bp.basePriceRange[1];
      const step = Math.floor((maxP - minP) / bp.titles.length);
      const basePrice = minP + step * i;
      const discountPrice = Math.round((basePrice * 0.85) / 50) * 50; // ~15% off discount price rounded to 50s

      // Select 2 colors from palette for variants
      const color1 = colors[i % colors.length];
      const color2 = colors[(i + 3) % colors.length];
      const selectedColors = [color1, color2];

      // Build Variant Options
      const variantOptions = [
        {
          name: 'Size',
          values: bp.sizes.map((s) => ({ label: s })),
        },
        {
          name: 'Color',
          values: selectedColors.map((c) => ({ label: c.label, meta: c.meta })),
        },
      ];

      // Build Variant Matrix
      const variants = [];
      let totalStock = 0;

      for (const size of bp.sizes) {
        for (const col of selectedColors) {
          const skuCode = `${bp.type.substring(0, 3)}-${slug.substring(0, 6).toUpperCase()}-${size.replace(/\s+/g, '')}-${col.label.substring(0, 3).toUpperCase()}`;
          const stock = 8 + ((i * 3 + size.length) % 15);
          totalStock += stock;

          variants.push({
            sku: skuCode,
            title: `${size} / ${col.label}`,
            label: `${size} / ${col.label}`,
            selectedOptions: [
              { name: 'Size', value: size },
              { name: 'Color', value: col.label },
            ],
            price: basePrice,
            discountPrice,
            stock,
            stockStatus: 'AUTO',
            image: { url: bp.images[0] },
            isDefault: variants.length === 0,
            isActive: true,
          });
        }
      }

      // Media Array
      const media = bp.images.map((imgUrl, imgIdx) => ({
        url: imgUrl,
        key: `cloud-product-${productCounter}-${imgIdx + 1}`,
        type: 'IMAGE',
        altText: `${title} - View ${imgIdx + 1}`,
      }));

      allProductsToInsert.push({
        title,
        slug,
        description: bp.descTemplate(title),
        highlights: bp.highlights,
        productType: 'CLOTHING',
        hasVariants: true,
        categoryId: subCat._id,
        categorySlug: subCat.slug,
        categoryPath: ['women', subCat.slug],
        categoryName: subCat.name,
        brandId: brand?._id || null,
        brandName: brand?.name || 'Aurem Modest Couture',
        brandSlug: brand?.slug || 'aurem-modest-couture',
        collections: bp.collections,
        tags: [subCat.slug, brand?.slug, bp.type.toLowerCase(), 'modest-fashion'],
        basePrice,
        discountPrice,
        maxPrice: basePrice,
        costPrice: Math.round(basePrice * 0.55),
        sku: `${bp.type.substring(0, 3)}-ROOT-${String(productCounter).padStart(3, '0')}`,
        totalStock,
        stockStatus: 'AUTO',
        inStock: true,
        media,
        variantOptions,
        variants,
        sizeChart: bp.sizeChart,
        status: 'PUBLISHED',
        isActive: true,
        isPinned: i === 0, // Pin first product of each category
        priority: 100 - productCounter,
      });

      productCounter++;
    }
  }

  console.log(`\n📦 Inserting ${allProductsToInsert.length} products in bulk into database...`);
  await Product.insertMany(allProductsToInsert);
  console.log(`🎉 Successfully seeded ${allProductsToInsert.length} luxury modest wear products!`);

  // -------------------------------------------------------------------------
  // 5. Update StoreConfig with Modest Luxury Merchandising
  // -------------------------------------------------------------------------
  console.log('\n⚙️ Aligning StoreConfig with Modest Luxury Collections & Header Links...');
  const currentConfig = await StoreConfig.findOne({ isActive: true });

  const updatedHomeSections = [
    {
      id: 'sec-hero-modest',
      type: 'HERO',
      title: 'Winter Modest Luxury 2026',
      subtitle: 'Artisanal Khaddar Suits, Dubai Silhouettes & Silk Shawls',
      buttonText: 'EXPLORE CATALOG',
      buttonLink: '/shop',
      order: 1,
      isActive: true,
    },
    {
      id: 'sec-winter-khaddar',
      type: 'COLLECTION_CAROUSEL',
      title: 'Winter Khaddar Drop 2026',
      subtitle: 'Heavyweight handspun khaddar suits with wool pashmina shawls',
      collectionSlug: 'winter-khaddar-2026',
      buttonText: 'VIEW ALL KHADDAR',
      buttonLink: '/shop?collection=winter-khaddar-2026',
      limit: 8,
      order: 2,
      isActive: true,
    },
    {
      id: 'sec-signature-abayas',
      type: 'COLLECTION_SECTION',
      title: 'Signature Dubai Abayas & Kimonos',
      subtitle: 'Tailored luxury cuts from premium Japanese and Dubai Nida',
      collectionSlug: 'signature-abayas',
      buttonText: 'SHOP ABAYAS',
      buttonLink: '/shop?collection=signature-abayas',
      limit: 8,
      order: 3,
      isActive: true,
    },
    {
      id: 'sec-best-sellers',
      type: 'FEATURED_GRID',
      title: 'Most Loved Client Favorites',
      subtitle: 'Repeat restocks and most demanded modest silhouettes',
      collectionSlug: 'best-sellers',
      buttonText: 'DISCOVER BEST SELLERS',
      buttonLink: '/shop?collection=best-sellers',
      limit: 8,
      order: 4,
      isActive: true,
    },
    {
      id: 'sec-luxury-gifts',
      type: 'COLLECTION_CAROUSEL',
      title: 'Curated Floral & Hijab Gift Boxes',
      subtitle: 'Gold-foil embossed presentation boxes for memorable moments',
      collectionSlug: 'luxury-gift-hampers',
      buttonText: 'BROWSE GIFT HAMPERS',
      buttonLink: '/shop?collection=luxury-gift-hampers',
      limit: 6,
      order: 5,
      isActive: true,
    },
  ];

  const updatedHeaderLinks = [
    {
      id: 'nav-modest',
      label: 'Modest Couture',
      href: '/collections/modest-fashion',
      badgeText: 'NEW',
      isActive: true,
      order: 1,
      children: [
        {
          id: 'nav-abayas',
          label: 'Signature Abayas & Kimonos',
          href: '/collections/signature-abayas',
          badgeText: 'LUXURY CUT',
          isActive: true,
          order: 1,
        },
        {
          id: 'nav-khaddar',
          label: 'Winter Khaddar Suits',
          href: '/collections/winter-khaddar-2026',
          badgeText: 'WINTER',
          isActive: true,
          order: 2,
        },
        {
          id: 'nav-pret',
          label: 'Pret & Co-ords',
          href: '/collections/pret-and-coords',
          isActive: true,
          order: 3,
        },
      ],
    },
    {
      id: 'nav-occasions',
      label: 'Occasions & Festive',
      href: '/collections/occasions',
      badgeText: 'FESTIVE',
      isActive: true,
      order: 2,
      children: [
        {
          id: 'nav-ramadan',
          label: 'Ramadan Essentials',
          href: '/collections/ramadan',
          badgeText: 'HOLY MONTH',
          isActive: true,
          order: 1,
        },
        {
          id: 'nav-eid',
          label: 'Eid-ul-Fitr Luxury',
          href: '/collections/eid-ul-fitr',
          badgeText: 'EID 2026',
          isActive: true,
          order: 2,
        },
        {
          id: 'nav-gifts',
          label: 'Luxury Gift Hampers',
          href: '/collections/luxury-gift-hampers',
          badgeText: 'GIFT BOX',
          isActive: true,
          order: 3,
        },
      ],
    },
    {
      id: 'nav-best-sellers',
      label: 'Best Sellers',
      href: '/collections/best-sellers',
      badgeText: 'TOP',
      isActive: true,
      order: 3,
    },
    {
      id: 'nav-everyday',
      label: 'Under ৳3,000',
      href: '/collections/under-3000-everyday',
      badgeText: 'VALUE',
      isActive: true,
      order: 4,
    },
    {
      id: 'nav-all',
      label: 'All Garments',
      href: '/shop',
      isActive: true,
      order: 5,
    },
  ];

  if (currentConfig) {
    currentConfig.homeSections = updatedHomeSections;
    currentConfig.headerNavLinks = updatedHeaderLinks;
    currentConfig.branding = {
      ...(currentConfig.branding || {}),
      storeName: 'AUREM Modest Luxury',
      tagline: 'Artisanal Khaddar Suits, Signature Abayas & Silk Shawls',
      storeNiche: 'CLOTHING',
    };
    await currentConfig.save();
    console.log('✅ StoreConfig updated with 5 modest luxury sections and 5 quick links.');
  }

  console.log('\n========================================');
  console.log('🎉 MASTER SEED ENGINE COMPLETE!');
  console.log(`- Brands Seeded: ${Object.keys(brandDocs).length}`);
  console.log(`- Collections Seeded: ${collectionsData.length}`);
  console.log(`- Categories Seeded: ${1 + 4 + Object.keys(subCats).length}`);
  console.log(`- Products Seeded: ${allProductsToInsert.length}`);
  console.log('========================================\n');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('❌ Seed Failed:', err);
  process.exit(1);
});
