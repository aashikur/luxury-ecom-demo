/**
 * Seed script for production Category taxonomy and marketing Collections
 * Run with: node scripts/seed-taxonomies.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

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
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  // Clean existing demo taxonomies
  await Category.deleteMany({});
  await Collection.deleteMany({});

  console.log('Cleared existing categories and collections.');

  // 1. Root / Departments (Level 0)
  const men = await Category.create({
    name: 'Men',
    slug: 'men',
    level: 0,
    displayOrder: 1,
    isFeaturedHome: true,
    isActive: true,
    description: 'Luxury menswear, tailored fits, and streetwear.',
  });

  const women = await Category.create({
    name: 'Women',
    slug: 'women',
    level: 0,
    displayOrder: 2,
    isFeaturedHome: true,
    isActive: true,
    description: 'Contemporary luxury womenswear, co-ords, and modest wear.',
  });

  const unisex = await Category.create({
    name: 'Unisex',
    slug: 'unisex',
    level: 0,
    displayOrder: 3,
    isFeaturedHome: true,
    isActive: true,
    description: 'Oversized luxury streetwear for everyone.',
  });

  // 2. Parent Categories (Level 1)
  const menTops = await Category.create({
    name: 'Tops',
    slug: 'men-tops',
    parentId: men._id,
    ancestors: ['men'],
    level: 1,
    displayOrder: 1,
    isActive: true,
  });

  const menBottoms = await Category.create({
    name: 'Bottoms',
    slug: 'men-bottoms',
    parentId: men._id,
    ancestors: ['men'],
    level: 1,
    displayOrder: 2,
    isActive: true,
  });

  const womenTops = await Category.create({
    name: 'Tops & Co-ords',
    slug: 'women-tops',
    parentId: women._id,
    ancestors: ['women'],
    level: 1,
    displayOrder: 1,
    isActive: true,
  });

  const womenModest = await Category.create({
    name: 'Modest Wear',
    slug: 'women-modest-wear',
    parentId: women._id,
    ancestors: ['women'],
    level: 1,
    displayOrder: 2,
    isFeaturedHome: true,
    isActive: true,
  });

  // 3. Child Specific Categories (Level 2)
  const hoodies = await Category.create({
    name: 'Hoodies & Sweatshirts',
    slug: 'men-hoodies',
    parentId: menTops._id,
    ancestors: ['men', 'men-tops'],
    level: 2,
    displayOrder: 1,
    isFeaturedHome: true,
    isActive: true,
  });

  const tshirts = await Category.create({
    name: 'T-Shirts & Polos',
    slug: 'men-tshirts',
    parentId: menTops._id,
    ancestors: ['men', 'men-tops'],
    level: 2,
    displayOrder: 2,
    isFeaturedHome: true,
    isActive: true,
  });

  const cargos = await Category.create({
    name: 'Cargo Pants & Chinos',
    slug: 'men-cargos',
    parentId: menBottoms._id,
    ancestors: ['men', 'men-bottoms'],
    level: 2,
    displayOrder: 1,
    isActive: true,
  });

  const hijab = await Category.create({
    name: 'Hijab & Abaya',
    slug: 'women-hijab-abaya',
    parentId: womenModest._id,
    ancestors: ['women', 'women-modest-wear'],
    level: 2,
    displayOrder: 1,
    isFeaturedHome: true,
    isActive: true,
  });

  console.log('✅ Created 10 Categories across 3 levels (Men, Women, Unisex, Tops, Bottoms, Modest, Hoodies, Tees, Cargos, Hijab)');

  // 4. Marketing Collections
  await Collection.create([
    {
      title: 'Winter Drop 2026',
      slug: 'winter-drop-2026',
      description: 'Heavyweight french terry hoodies and technical outerwear.',
      badgeText: 'SEASONAL DROP',
      displayOrder: 1,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Best Sellers',
      slug: 'best-sellers',
      description: 'Customer favorites and repeat restocks.',
      badgeText: 'TOP RATED',
      displayOrder: 2,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Eid Luxury Edit',
      slug: 'eid-luxury-edit',
      description: 'Premium panjabis and festive garments.',
      badgeText: 'FESTIVE EDIT',
      displayOrder: 3,
      isFeaturedHome: true,
      isActive: true,
    },
    {
      title: 'Flash Sale',
      slug: 'flash-sale',
      description: 'Limited-time special prices.',
      badgeText: 'SPECIAL PRICE',
      displayOrder: 4,
      isFeaturedHome: false,
      isActive: true,
    },
  ]);

  console.log('✅ Created 4 Collections (Winter Drop 2026, Best Sellers, Eid Luxury Edit, Flash Sale)');

  await mongoose.disconnect();
  console.log('Seed finished successfully!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
