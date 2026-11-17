import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Master Picture Library from Current Database
const IMAGES = {
  // Abayas & Modest Wear
  BLACK_ABAYA: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp',
    key: 'products/1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp'
  },
  MODEST_ABEYA_EDITORIAL: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794857190613-53a46ec25eb81317a77ac17c994de109.jpg',
    key: 'products/1794857190613-53a46ec25eb81317a77ac17c994de109.jpg'
  },
  MODEST_WEAR_GARMENT: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794858573960-0116-PR-A639_1.webp',
    key: 'products/1794858573960-0116-PR-A639_1.webp'
  },
  LINEN_KIMONO: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794318039923-8299EB87-2946-4592-9770-DCCA7F2FB032.webp',
    key: 'products/1794318039923-8299EB87-2946-4592-9770-DCCA7F2FB032.webp'
  },

  // Khaddar & Embroidered Suits
  LIRA_3PC_LUXURY: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794319193364-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp',
    key: 'products/1794319193364-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp'
  },
  ZARI_EMBROIDERED_KHADDAR: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312231641-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp',
    key: 'products/1794312231641-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_5_43089da9-0f97-4977-8bdc-7673ab166d66.webp'
  },
  LIRA_3PC_ALT: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312239582-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_2.webp',
    key: 'products/1794312239582-Lira_3pc_Luxeurs_Embroidered_Khaddar_Dress_2.webp'
  },
  VIOLA_3PC_KHADDAR: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312274748-Viola3pcLuxeursEmbroideredKhaddarDress_2.webp',
    key: 'products/1794312274748-Viola3pcLuxeursEmbroideredKhaddarDress_2.webp'
  },
  SKY_2PC_PRET: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312179544-Sky2pcLuxeursEmbroideredKhaddarDress_5.webp',
    key: 'products/1794312179544-Sky2pcLuxeursEmbroideredKhaddarDress_5.webp'
  },
  SKY_2PC_ALT: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312187203-Sky_2pc_Luxeurs_Embroidered_Khaddar_Dress_4.webp',
    key: 'products/1794312187203-Sky_2pc_Luxeurs_Embroidered_Khaddar_Dress_4.webp'
  },
  BERRY_2PC_PRET: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312297438-Berry2pcLuxeursEmbroideredKhaddarDress_1.webp',
    key: 'products/1794312297438-Berry2pcLuxeursEmbroideredKhaddarDress_1.webp'
  },
  LYON_COORDS: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794312317052-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp',
    key: 'products/1794312317052-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp'
  },
  LYON_COORDS_ALT: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794647649595-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp',
    key: 'products/1794647649595-Lyon2pcLuxeursEmbroideredKhaddarDress_1.webp'
  },

  // Hijabs, Shawls & Gifts
  SILK_HIJAB: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794318093129-796A9FCE-98A0-4F69-BBA4-1E02602B4740.webp',
    key: 'products/1794318093129-796A9FCE-98A0-4F69-BBA4-1E02602B4740.webp'
  },
  SATIN_SILK_FLORAL: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794317939439-90F0999E-D22C-48ED-80DC-6A9E89022999-(1).webp',
    key: 'products/1794317939439-90F0999E-D22C-48ED-80DC-6A9E89022999-(1).webp'
  },
  FLORAL_GIFT_HAMPER: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794317984119-7563EC8B-DB00-4E05-A4AB-F2174A4B602F.webp',
    key: 'products/1794317984119-7563EC8B-DB00-4E05-A4AB-F2174A4B602F.webp'
  },
  CASHMERE_SHAWL: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794428314779-1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp',
    key: 'products/1794428314779-1794318064819-04A97825-EF41-48E4-972E-5243E7BD3839.webp'
  },

  // Men & Footwear
  MEN_SNEAKER: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794887131108-1000198138.jpg',
    key: 'products/1794887131108-1000198138.jpg'
  },
  MEN_SNEAKER_ALT: {
    url: 'https://cdn-demo.vectorfitlab.com/products/1794887162493-1000198149.jpg',
    key: 'products/1794887162493-1000198149.jpg'
  },

  // Brand Logo
  AUREM_LOGO: {
    url: 'https://cdn-demo.vectorfitlab.com/branding/logo.png',
    key: 'branding/logo.png'
  }
};

async function syncAllImages() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('--- STARTING DATABASE IMAGE ASSIGNMENT ---');

  // 1. UPDATE ALL CATEGORIES
  const categoryImageMap = {
    'women': IMAGES.MODEST_ABEYA_EDITORIAL,
    'men': IMAGES.MEN_SNEAKER,
    'kids': IMAGES.SATIN_SILK_FLORAL,
    'abayas-and-kimonos': IMAGES.MODEST_WEAR_GARMENT,
    'classic-black-abayas': IMAGES.BLACK_ABAYA,
    'embroidered-luxury-abayas': IMAGES.VIOLA_3PC_KHADDAR,
    'open-front-kimonos': IMAGES.LINEN_KIMONO,
    'hijabs-and-stoles': IMAGES.SILK_HIJAB,
    'silk-and-georgette-hijabs': IMAGES.SATIN_SILK_FLORAL,
    'embroidered-khaddar-stoles': IMAGES.FLORAL_GIFT_HAMPER,
    'cashmere-pashmina-shawls': IMAGES.CASHMERE_SHAWL,
    'pret-and-embroidered-suits': IMAGES.SKY_2PC_PRET,
    '3-piece-embroidered-khaddar': IMAGES.LIRA_3PC_ALT,
    '2-piece-luxury-pret': IMAGES.BERRY_2PC_PRET,
    'everyday-minimalist-coords': IMAGES.LYON_COORDS,
    'floral-and-gift-sets': IMAGES.FLORAL_GIFT_HAMPER,
    'luxury-hijab-gift-boxes': IMAGES.SILK_HIJAB,
    'bridal-floral-hampers': IMAGES.FLORAL_GIFT_HAMPER
  };

  const categories = await db.collection('categories').find({}).toArray();
  console.log(`\n1. Updating Categories (${categories.length} total)...`);
  for (const cat of categories) {
    const assignedImage = categoryImageMap[cat.slug] || IMAGES.MODEST_ABEYA_EDITORIAL;
    await db.collection('categories').updateOne(
      { _id: cat._id },
      { $set: { image: assignedImage, updatedAt: new Date() } }
    );
    console.log(`  ✓ [Category] ${cat.name} (${cat.slug}) -> ${assignedImage.url.slice(-35)}`);
  }

  // 2. UPDATE ALL BRANDS
  const brandImageMap = {
    'aurem-modest-couture': IMAGES.AUREM_LOGO,
    'luxeurs-heritage': IMAGES.LIRA_3PC_LUXURY,
    'flora-and-grace': IMAGES.FLORAL_GIFT_HAMPER,
    'bari-textiles': IMAGES.LYON_COORDS
  };

  const brands = await db.collection('brands').find({}).toArray();
  console.log(`\n2. Updating Brands (${brands.length} total)...`);
  for (const brand of brands) {
    const assignedLogo = brandImageMap[brand.slug] || IMAGES.AUREM_LOGO;
    await db.collection('brands').updateOne(
      { _id: brand._id },
      { $set: { logo: assignedLogo, updatedAt: new Date() } }
    );
    console.log(`  ✓ [Brand] ${brand.name} (${brand.slug}) -> ${assignedLogo.url.slice(-35)}`);
  }

  // 3. UPDATE ALL COLLECTIONS
  const collectionImageMap = {
    'signature-abayas': IMAGES.BLACK_ABAYA,
    'modest-fashion': IMAGES.MODEST_ABEYA_EDITORIAL,
    'ramadan': IMAGES.ZARI_EMBROIDERED_KHADDAR,
    'eid-ul-fitr': IMAGES.VIOLA_3PC_KHADDAR,
    'winter-khaddar-2026': IMAGES.SKY_2PC_ALT,
    'pret-and-coords': IMAGES.LYON_COORDS,
    'best-sellers': IMAGES.LIRA_3PC_LUXURY,
    'under-3000-everyday': IMAGES.CASHMERE_SHAWL,
    'featured': IMAGES.SKY_2PC_PRET,
    'luxury-gift-hampers': IMAGES.FLORAL_GIFT_HAMPER,
    'occasions': IMAGES.SILK_HIJAB
  };

  const collections = await db.collection('collections').find({}).toArray();
  console.log(`\n3. Updating Collections (${collections.length} total)...`);
  for (const col of collections) {
    const assignedBanner = collectionImageMap[col.slug] || IMAGES.MODEST_ABEYA_EDITORIAL;
    await db.collection('collections').updateOne(
      { _id: col._id },
      { $set: { bannerImage: assignedBanner, updatedAt: new Date() } }
    );
    console.log(`  ✓ [Collection] ${col.title} (${col.slug}) -> ${assignedBanner.url.slice(-35)}`);
  }

  // 4. UPDATE STORE CONFIG HOMEPAGE SECTIONS
  console.log('\n4. Updating StoreConfig Home Sections with rich banners...');
  const storeConfig = await db.collection('storeconfigs').findOne({ isActive: true });
  if (storeConfig && storeConfig.homeSections) {
    const sectionImageMap = {
      'Signature Abayas': IMAGES.BLACK_ABAYA,
      'Sacred Festive & Gift Sets': IMAGES.FLORAL_GIFT_HAMPER,
      'Cash On Delivery & Steadfast 1-Click Dispatch': IMAGES.LYON_COORDS
    };

    const updatedSections = storeConfig.homeSections.map((sec) => {
      if (!sec.bannerImage?.url && sectionImageMap[sec.title]) {
        return {
          ...sec,
          bannerImage: sectionImageMap[sec.title]
        };
      }
      return sec;
    });

    await db.collection('storeconfigs').updateOne(
      { _id: storeConfig._id },
      {
        $set: {
          homeSections: updatedSections,
          'branding.favicon': IMAGES.AUREM_LOGO,
          updatedAt: new Date()
        }
      }
    );
    console.log('  ✓ Updated StoreConfig homeSections and branding favicon');
  }

  // 5. AUDIT & VERIFY
  console.log('\n=== AUDIT RESULTS ===');
  const catWithoutImg = await db.collection('categories').countDocuments({
    $or: [{ 'image.url': { $exists: false } }, { 'image.url': '' }, { 'image.url': null }]
  });
  console.log(`Categories with missing image: ${catWithoutImg}`);

  const brandWithoutLogo = await db.collection('brands').countDocuments({
    $or: [{ 'logo.url': { $exists: false } }, { 'logo.url': '' }, { 'logo.url': null }]
  });
  console.log(`Brands with missing logo: ${brandWithoutLogo}`);

  const colWithoutBanner = await db.collection('collections').countDocuments({
    $or: [{ 'bannerImage.url': { $exists: false } }, { 'bannerImage.url': '' }, { 'bannerImage.url': null }]
  });
  console.log(`Collections with missing banner: ${colWithoutBanner}`);

  await mongoose.disconnect();
  console.log('\nAll pictures synced successfully!');
}

syncAllImages().catch(console.error);
