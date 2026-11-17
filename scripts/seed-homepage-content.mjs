/**
 * Professional Content Strategy Seed Script
 * - Enriches Categories and Subcategories with authentic high-res product media
 * - Enriches Marketing Collections with banners and product tags
 * - Sets up StoreConfig.homeSections with an organized, high-converting luxury modest layout
 * Run with: node scripts/seed-homepage-content.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Authentic Cloudflare R2 Product Images from Live Database
const MEDIA = {
  skyKhaddar1: 'https://cdn-demo.vectorfitlab.com/products/1794312179544-Sky2pcLuxeursEmbroideredKhaddarDress_5.webp',
  skyKhaddar2: 'https://cdn-demo.vectorfitlab.com/products/1794312187203-Sky_2pc_Luxeurs_Embroidered_Khaddar_Dress_4.webp',
  violaKhaddar: 'https://cdn-demo.vectorfitlab.com/products/1794312274748-Viola3pcLuxeursEmbroideredKhaddarDress_2.webp',
  liraKhaddar1: 'https://cdn-demo.vectorfitlab.com/products/1794312231641-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp',
  liraKhaddar3: 'https://cdn-demo.vectorfitlab.com/products/1794319193364-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp',
  lyonKhaddar: 'https://cdn-demo.vectorfitlab.com/products/1794312317052-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp',
  stoleLeopard: 'https://cdn-demo.vectorfitlab.com/products/1794317984119-7563EC8B-DB00-4E05-A4AB-F2174A4B602F.webp',
  stolePashmina: 'https://cdn-demo.vectorfitlab.com/products/1794428314779-1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp',
  stoleGeometric: 'https://cdn-demo.vectorfitlab.com/products/1794318039923-8299EB87-2946-4592-9770-DCCA7F2FB032.webp',
  stoleSilkFloral: 'https://cdn-demo.vectorfitlab.com/products/1794318093129-796A9FCE-98A0-4F69-BBA4-1E02602B4740.webp',
  womenAbeya: 'https://cdn-demo.vectorfitlab.com/products/1794857190613-53a46ec25eb81317a77ac17c994de109.jpg',
};

async function seed() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  const db = mongoose.connection;

  // -------------------------------------------------------------------------
  // 1. Enrich Categories with Authentic High-Res Images & Descriptions
  // -------------------------------------------------------------------------
  console.log('\n📁 Enrolling Images into Categories...');

  const categoryImages = {
    'women': MEDIA.womenAbeya,
    'abayas-and-kimonos': MEDIA.liraKhaddar3,
    'hijabs-and-stoles': MEDIA.stoleSilkFloral,
    'pret-and-embroidered-suits': MEDIA.skyKhaddar1,
    'floral-and-gift-sets': MEDIA.stoleLeopard,
    'classic-black-abayas': MEDIA.liraKhaddar3,
    'embroidered-luxury-abayas': MEDIA.violaKhaddar,
    'open-front-kimonos': MEDIA.stoleGeometric,
    'silk-and-georgette-hijabs': MEDIA.stoleSilkFloral,
    'embroidered-khaddar-stoles': MEDIA.stoleLeopard,
    'cashmere-pashmina-shawls': MEDIA.stolePashmina,
    '3-piece-embroidered-khaddar': MEDIA.liraKhaddar1,
    '2-piece-luxury-pret': MEDIA.skyKhaddar1,
    'everyday-minimalist-coords': MEDIA.lyonKhaddar,
    'luxury-hijab-gift-boxes': MEDIA.stoleSilkFloral,
    'bridal-floral-hampers': MEDIA.stoleLeopard,
  };

  for (const [slug, url] of Object.entries(categoryImages)) {
    const res = await db.collection('categories').updateOne(
      { slug },
      {
        $set: {
          image: { url, key: `cat-${slug}` },
          isFeaturedHome: true,
          isActive: true,
        },
      }
    );
    console.log(`  ✨ Category [${slug}] image assigned (matched: ${res.matchedCount})`);
  }

  // -------------------------------------------------------------------------
  // 2. Enrich Collections with Banners & Product Tags
  // -------------------------------------------------------------------------
  console.log('\n🏷️ Enrolling Banners & Products into Collections...');

  const collectionBanners = {
    'occasions': MEDIA.stoleLeopard,
    'ramadan': MEDIA.liraKhaddar1,
    'eid-ul-fitr': MEDIA.violaKhaddar,
    'luxury-gift-hampers': MEDIA.stoleLeopard,
    'modest-fashion': MEDIA.liraKhaddar3,
    'signature-abayas': MEDIA.liraKhaddar3,
    'winter-khaddar-2026': MEDIA.skyKhaddar1,
    'pret-and-coords': MEDIA.lyonKhaddar,
    'best-sellers': MEDIA.liraKhaddar3,
    'under-3000-everyday': MEDIA.stolePashmina,
    'featured': MEDIA.skyKhaddar1,
  };

  for (const [slug, url] of Object.entries(collectionBanners)) {
    await db.collection('collections').updateOne(
      { slug },
      {
        $set: {
          bannerImage: { url, key: `col-${slug}` },
          isFeaturedHome: true,
          isActive: true,
        },
      }
    );
    console.log(`  ✨ Collection [${slug}] banner assigned`);
  }

  // Tag products for ramadan and eid-ul-fitr
  await db.collection('products').updateMany(
    { categorySlug: { $in: ['classic-black-abayas', 'silk-and-georgette-hijabs', '3-piece-embroidered-khaddar'] } },
    { $addToSet: { collections: 'ramadan' } }
  );
  await db.collection('products').updateMany(
    { categorySlug: { $in: ['embroidered-luxury-abayas', 'bridal-floral-hampers'] } },
    { $addToSet: { collections: 'eid-ul-fitr' } }
  );
  console.log('  ✨ Tagged products into seasonal collections (ramadan, eid-ul-fitr)');

  // -------------------------------------------------------------------------
  // 3. Seed StoreConfig.homeSections with High-Converting Brand Layout
  // -------------------------------------------------------------------------
  console.log('\n🎨 Seeding StoreConfig Homepage Layout Blocks...');

  const homeSections = [
    // 1. Multi-Slide Hero Carousel
    {
      id: `sec_hero_${Date.now()}`,
      type: 'HERO_BANNER',
      layoutWidth: 'WIDE_FULL',
      title: 'Aurem Luxury Couture',
      subtitle: 'WINTER MODEST DROP 2026',
      description: 'Artisanal Dubai Nida Abayas, Pure Egyptian Combed Cotton, and Hand-Embroidered Luxury Pret.',
      buttonText: 'EXPLORE COLLECTION',
      buttonLink: '/shop',
      bannerImage: {
        url: MEDIA.liraKhaddar3,
        key: 'hero-main-1',
      },
      slides: [
        {
          url: MEDIA.liraKhaddar3,
          title: 'Timeless Dubai Silhouettes',
          subtitle: 'SIGNATURE ABAYA EDIT',
          buttonText: 'SHOP ABAYAS',
          buttonLink: '/shop?collection=signature-abayas',
        },
        {
          url: MEDIA.skyKhaddar1,
          title: 'Artisanal Winter Khaddar',
          subtitle: 'HAND-EMBROIDERED LUXURY PRET',
          buttonText: 'VIEW PRET',
          buttonLink: '/shop?collection=winter-khaddar-2026',
        },
        {
          url: MEDIA.stoleSilkFloral,
          title: 'Pure Pashmina & Silk Stoles',
          subtitle: 'LIMITED ACCENTS',
          buttonText: 'SHOP HIJABS',
          buttonLink: '/shop?category=hijabs-and-stoles',
        },
      ],
      order: 1,
      isActive: true,
    },

    // 2. Circular Story Discovery Pills
    {
      id: `sec_pills_${Date.now()}`,
      type: 'CATEGORY_PILLS',
      cardShape: 'CIRCLE',
      showTitle: true,
      title: 'Aura Collections',
      subtitle: 'VISUAL DISCOVERY',
      order: 2,
      isActive: true,
    },

    // 3. Signature Abayas Product Showcase
    {
      id: `sec_abayas_${Date.now()}`,
      type: 'COLLECTION_SECTION',
      title: 'Signature Abayas',
      subtitle: 'Handcrafted Dubai Nida & Breathable Double-Georgette Silhouettes',
      collectionSlug: 'signature-abayas',
      buttonText: 'VIEW ALL ABAYAS',
      buttonLink: '/shop?collection=signature-abayas',
      showTitle: true,
      themeStyle: 'LIGHT',
      order: 3,
      isActive: true,
    },

    // 4. Universal Dual-Mode CTA Banner (Full Bleed Photo BG)
    {
      id: `sec_promo1_${Date.now()}`,
      type: 'PROMO_CTA_CARD',
      title: 'Free Express Shipping Across Bangladesh',
      subtitle: 'BANGLADESH LOGISTICS',
      description: 'Guaranteed 24-48h dispatch inside Dhaka (৳70) & 3-5 days across 64 districts (৳130). Free shipping on all orders over ৳2,500.',
      buttonText: 'SHOP WITH CONFIDENCE',
      buttonLink: '/shop',
      bannerImage: {
        url: MEDIA.stolePashmina,
        key: 'promo-shipping-bg',
      },
      layoutWidth: 'WIDE_FULL',
      bgMode: 'PHOTO_BG',
      order: 4,
      isActive: true,
    },

    // 5. Editorial Split Showcase
    {
      id: `sec_split_${Date.now()}`,
      type: 'SPLIT_SHOWCASE',
      title: 'Winter Khaddar & Luxury Pret',
      subtitle: 'EDITORIAL SPOTLIGHT',
      description: 'Woven with heritage heavyweight yarns and delicate hand-embroidery.',
      collectionSlug: 'winter-khaddar-2026',
      buttonText: 'DISCOVER LOOKBOOK',
      buttonLink: '/shop?collection=winter-khaddar-2026',
      bannerImage: {
        url: MEDIA.violaKhaddar,
        key: 'split-banner-khaddar',
      },
      order: 5,
      isActive: true,
    },

    // 6. Festive Dark-Band Collection Grid
    {
      id: `sec_festive_${Date.now()}`,
      type: 'COLLECTION_SECTION',
      title: 'Sacred Festive & Gift Sets',
      subtitle: 'Opulent Gold-Zari Ensembles & Thoughtful Hijab Gift Hampers',
      collectionSlug: 'luxury-gift-hampers',
      buttonText: 'EXPLORE GIFTS',
      buttonLink: '/shop?collection=luxury-gift-hampers',
      showTitle: true,
      themeStyle: 'DARK_BAND',
      order: 6,
      isActive: true,
    },

    // 7. Boxed Minimalist Trust Banner
    {
      id: `sec_trust_${Date.now()}`,
      type: 'PROMO_CTA_CARD',
      title: 'Cash On Delivery & Steadfast 1-Click Dispatch',
      subtitle: 'ZERO-RISK BANGLADESH COMMERCE',
      description: 'Inspect your package upon parcel delivery anywhere in Bangladesh. Verified phone return fraud shield & automated tracking.',
      buttonText: 'BROWSE FULL CATALOG',
      buttonLink: '/shop',
      layoutWidth: 'WIDE_BOX',
      bgMode: 'SOLID_SURFACE',
      order: 7,
      isActive: true,
    },
  ];

  const updateResult = await db.collection('storeconfigs').updateOne(
    { isActive: true },
    {
      $set: {
        homeSections,
        updatedAt: new Date(),
      },
    }
  );

  console.log(`\n🎉 StoreConfig homeSections updated! (matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount})`);

  // Close connection
  await mongoose.connection.close();
  console.log('✅ Seeding completed cleanly!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error seeding homepage content:', err);
  process.exit(1);
});
