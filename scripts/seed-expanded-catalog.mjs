import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Schemas
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    ancestors: [{ type: String }],
    image: { url: { type: String, default: '' }, key: { type: String, default: '' } },
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

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { url: { type: String }, key: { type: String } },
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
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    highlights: [{ type: String }],
    productType: { type: String, default: 'REGULAR' },
    hasVariants: { type: Boolean, default: false },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    categorySlug: { type: String, default: '' },
    categoryPath: [{ type: String }],
    categoryName: { type: String, default: '' },
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
    totalStock: { type: Number, default: 50 },
    stockStatus: { type: String, default: 'AUTO' },
    inStock: { type: Boolean, default: true },

    media: [
      {
        url: String,
        key: String,
        thumbnailUrl: String,
        type: { type: String, default: 'IMAGE' },
        videoProvider: String,
        altText: String,
      },
    ],

    variantOptions: { type: Array, default: [] },
    variants: { type: Array, default: [] },
    modifierGroups: { type: Array, default: [] },
    sizeChart: { type: Array, default: [] },
    specifications: [
      {
        groupName: String,
        items: [
          {
            label: String,
            value: String,
          },
        ],
      },
    ],

    status: { type: String, default: 'PUBLISHED' },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// CDN Images mapped by category type
const IMAGES = {
  cybertruck: 'https://cdn-demo.vectorfitlab.com/products/1794968284009-tesla-cybertruck.jpg',
  model3: 'https://cdn-demo.vectorfitlab.com/products/1794968285337-tesla-model-3.jpg',
  model3Highland: 'https://cdn-demo.vectorfitlab.com/products/1794968289372-tesla-model-3-highland.jpg',
  modelS: 'https://cdn-demo.vectorfitlab.com/products/1794968290477-tesla-model-s.jpg',
  modelY: 'https://cdn-demo.vectorfitlab.com/products/1794968291733-tesla-model-y.jpg',
  appleWatch: 'https://cdn-demo.vectorfitlab.com/products/1794968484522-Apple-Watch-Ultra-2-Modular-Ultra-watch-face-230912_inline.jpg.large.jpg',
  dyson: 'https://cdn-demo.vectorfitlab.com/products/1794968485716-Dyson-V15.png',
  fridge: 'https://cdn-demo.vectorfitlab.com/products/1794968486792-frezze.jpg',
  headphones: 'https://cdn-demo.vectorfitlab.com/products/1794968487958-HeadPhone.jpg',
  iphone: 'https://cdn-demo.vectorfitlab.com/products/1794968489441-ipohone.jpg',
  laptop: 'https://cdn-demo.vectorfitlab.com/products/1794968490358-labtop.jpg',
  tv: 'https://cdn-demo.vectorfitlab.com/products/1794968492907-TV.jpg',
  washer: 'https://cdn-demo.vectorfitlab.com/products/1794968494335-washin-matchine.webp',
};

async function seedExpandedCatalog() {
  console.log('⚡ Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to DB');

  // 1. Create or Update Collections
  const newCollections = [
    {
      title: 'Electric Mobility & Supercars',
      slug: 'electric-mobility',
      description: 'Zero-Emission High Performance Electric Vehicles',
      badgeText: 'HYPER-EV',
      bannerImage: { url: IMAGES.cybertruck, key: 'collections/electric-mobility.jpg' },
      isFeaturedHome: true,
      displayOrder: 1,
    },
    {
      title: 'Smart Living & Intelligent Home',
      slug: 'smart-living',
      description: 'Next-Generation Refrigerator, AI Washers & Cleaning',
      badgeText: 'SMART AI',
      bannerImage: { url: IMAGES.fridge, key: 'collections/smart-living.jpg' },
      isFeaturedHome: true,
      displayOrder: 2,
    },
    {
      title: 'Pro Tech & Apple Silicon',
      slug: 'pro-tech-edition',
      description: 'Pro Workstations, Titanium Flagships & Smart Wearables',
      badgeText: 'FLAGSHIP',
      bannerImage: { url: IMAGES.laptop, key: 'collections/pro-tech.jpg' },
      isFeaturedHome: true,
      displayOrder: 3,
    },
    {
      title: 'Cinematic Living Room & Audio',
      slug: 'cinematic-entertainment',
      description: '4K OLED Displays & Wireless Noise-Canceling Audio',
      badgeText: 'CINEMA',
      bannerImage: { url: IMAGES.tv, key: 'collections/cinematic.jpg' },
      isFeaturedHome: true,
      displayOrder: 4,
    },
    {
      title: 'New Arrivals 2026',
      slug: 'new-arrivals-2026',
      description: 'Freshly Added Commercial & Consumer Showcase',
      badgeText: '2026 NEW',
      bannerImage: { url: IMAGES.modelS, key: 'collections/new-arrivals.jpg' },
      isFeaturedHome: true,
      displayOrder: 5,
    },
  ];

  for (const c of newCollections) {
    await Collection.findOneAndUpdate(
      { slug: c.slug },
      { $set: { ...c, isActive: true } },
      { upsert: true, new: true }
    );
    console.log(`Updated/Created Collection: ${c.title}`);
  }

  // 2. Create Root & Sub-Categories
  const categoriesToEnsure = [
    // Root
    { name: 'Automobiles', slug: 'automobiles', level: 0, isFeaturedHome: true, image: { url: IMAGES.cybertruck, key: '' } },
    { name: 'Home Appliances', slug: 'home-appliances', level: 0, isFeaturedHome: true, image: { url: IMAGES.fridge, key: '' } },
    { name: 'Smart Electronics', slug: 'electronics', level: 0, isFeaturedHome: true, image: { url: IMAGES.iphone, key: '' } },
  ];

  const catMap = {};
  for (const c of categoriesToEnsure) {
    const cat = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: { ...c, isActive: true } },
      { upsert: true, new: true }
    );
    catMap[c.slug] = cat;
  }

  // Subcategories
  const subCategories = [
    { name: 'Electric Sedans', slug: 'electric-sedans', parentSlug: 'automobiles', image: { url: IMAGES.modelS, key: '' } },
    { name: 'Electric SUVs & Trucks', slug: 'electric-suvs-trucks', parentSlug: 'automobiles', image: { url: IMAGES.cybertruck, key: '' } },
    { name: 'Refrigeration & Cooling', slug: 'refrigeration', parentSlug: 'home-appliances', image: { url: IMAGES.fridge, key: '' } },
    { name: 'Washing & Cleaning', slug: 'washing-cleaning', parentSlug: 'home-appliances', image: { url: IMAGES.washer, key: '' } },
    { name: 'Smart Televisions', slug: 'smart-tvs', parentSlug: 'home-appliances', image: { url: IMAGES.tv, key: '' } },
    { name: 'Flagship Smartphones', slug: 'smartphones', parentSlug: 'electronics', image: { url: IMAGES.iphone, key: '' } },
    { name: 'Laptops & Workstations', slug: 'laptops-workstations', parentSlug: 'electronics', image: { url: IMAGES.laptop, key: '' } },
    { name: 'Audio & Wearables', slug: 'audio-wearables', parentSlug: 'electronics', image: { url: IMAGES.headphones, key: '' } },
  ];

  for (const sc of subCategories) {
    const parent = catMap[sc.parentSlug];
    const createdSub = await Category.findOneAndUpdate(
      { slug: sc.slug },
      {
        $set: {
          name: sc.name,
          slug: sc.slug,
          parentId: parent._id,
          ancestors: [parent.slug],
          level: 1,
          image: sc.image,
          isActive: true,
          isFeaturedHome: true,
        },
      },
      { upsert: true, new: true }
    );
    catMap[sc.slug] = createdSub;
    console.log(`Updated/Created Subcategory: ${sc.name} (${sc.slug})`);
  }

  // 3. Brands Map
  const brandDefs = [
    { name: 'Tesla', slug: 'tesla' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Sony', slug: 'sony' },
    { name: 'LG', slug: 'lg' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Dyson', slug: 'dyson' },
  ];
  const brandMap = {};
  for (const b of brandDefs) {
    const brand = await Brand.findOneAndUpdate(
      { slug: b.slug },
      { $set: { name: b.name, slug: b.slug, isActive: true, featured: true } },
      { upsert: true, new: true }
    );
    brandMap[b.slug] = brand;
  }

  // 4. Update the first 12 products to link to new collections
  const updates = [
    { slug: 'tesla-cybertruck-dual-motor-awd', collections: ['electric-mobility', 'new-arrivals-2026'], subcat: 'electric-suvs-trucks' },
    { slug: 'tesla-model-s-plaid-tri-motor', collections: ['electric-mobility', 'new-arrivals-2026'], subcat: 'electric-sedans' },
    { slug: 'tesla-model-3-long-range-highland', collections: ['electric-mobility'], subcat: 'electric-sedans' },
    { slug: 'tesla-model-y-performance-dual-motor', collections: ['electric-mobility'], subcat: 'electric-suvs-trucks' },
    { slug: 'lg-instaview-door-in-door-refrigerator', collections: ['smart-living', 'new-arrivals-2026'], subcat: 'refrigeration' },
    { slug: 'samsung-ai-ecobubble-front-load-washer', collections: ['smart-living'], subcat: 'washing-cleaning' },
    { slug: 'sony-bravia-xr-65-4k-oled-tv', collections: ['cinematic-entertainment', 'smart-living'], subcat: 'smart-tvs' },
    { slug: 'dyson-v15-detect-absolute-cordless-vacuum', collections: ['smart-living'], subcat: 'washing-cleaning' },
    { slug: 'apple-iphone-16-pro-max-desert-titanium', collections: ['pro-tech-edition', 'new-arrivals-2026'], subcat: 'smartphones' },
    { slug: 'apple-macbook-pro-16-m3-max', collections: ['pro-tech-edition'], subcat: 'laptops-workstations' },
    { slug: 'apple-watch-ultra-2-titanium', collections: ['pro-tech-edition', 'wearables-audiophile'], subcat: 'audio-wearables' },
    { slug: 'sony-wh-1000xm5-wireless-anc-headphones', collections: ['cinematic-entertainment', 'wearables-audiophile'], subcat: 'audio-wearables' },
  ];

  for (const u of updates) {
    const subcat = catMap[u.subcat];
    await Product.updateOne(
      { slug: u.slug },
      {
        $set: {
          collections: u.collections,
          categorySlug: u.subcat,
          categoryName: subcat ? subcat.name : 'Automobiles',
          categoryId: subcat ? subcat._id : null,
          categoryPath: subcat && subcat.ancestors ? [...subcat.ancestors, subcat.slug] : [],
        },
      }
    );
  }
  console.log('✅ Updated existing 12 products with subcategories & collections!');

  // 5. Generate 24 Additional Varied Products (Total = 36 new tech/auto/appliance products!)
  const additionalProducts = [
    // --- AUTOMOBILES (6 More) ---
    {
      title: 'Tesla Cybertruck Cyberbeast Tri-Motor',
      slug: 'tesla-cybertruck-cyberbeast-tri-motor',
      catSlug: 'electric-suvs-trucks',
      brandSlug: 'tesla',
      collections: ['electric-mobility', 'new-arrivals-2026'],
      basePrice: 19500000,
      discountPrice: 18900000,
      image: IMAGES.cybertruck,
      highlights: ['845 Horsepower Beast Mode', '0-60 mph in 2.6 seconds', '320 miles range', 'All-Wheel Drive Torque Vectoring'],
      specs: [
        { groupName: 'Hyper Beast Power', items: [{ label: 'Powertrain', value: 'Tri-Motor AWD' }, { label: '0-60 mph', value: '2.6s (with rollout)' }, { label: 'Horsepower', value: '845 hp' }] }
      ]
    },
    {
      title: 'Tesla Model S Long Range AWD',
      slug: 'tesla-model-s-long-range-awd',
      catSlug: 'electric-sedans',
      brandSlug: 'tesla',
      collections: ['electric-mobility'],
      basePrice: 14800000,
      discountPrice: 14200000,
      image: IMAGES.modelS,
      highlights: ['402 miles maximum EPA driving range', 'Dual Motor AWD', '17" cinematic touchscreen', 'Supercharging up to 250 kW'],
      specs: [
        { groupName: 'Range Leader', items: [{ label: 'EPA Range', value: '402 Miles' }, { label: '0-60 mph', value: '3.1s' }] }
      ]
    },
    {
      title: 'Tesla Model 3 Performance Track Edition',
      slug: 'tesla-model-3-performance-track-edition',
      catSlug: 'electric-sedans',
      brandSlug: 'tesla',
      collections: ['electric-mobility', 'new-arrivals-2026'],
      basePrice: 8900000,
      discountPrice: 8500000,
      image: IMAGES.model3Highland,
      highlights: ['510 Horsepower Performance Drive Unit', 'Track Mode V3 calibration', 'Forged 20" Warp Wheels', 'Carbon Fiber Lip Spoiler'],
      specs: [
        { groupName: 'Track Performance', items: [{ label: 'Horsepower', value: '510 hp' }, { label: '0-60 mph', value: '2.9s' }, { label: 'Top Speed', value: '163 mph' }] }
      ]
    },
    {
      title: 'Tesla Model 3 Standard Range RWD',
      slug: 'tesla-model-3-standard-range-rwd',
      catSlug: 'electric-sedans',
      brandSlug: 'tesla',
      collections: ['electric-mobility'],
      basePrice: 5900000,
      discountPrice: 5600000,
      image: IMAGES.model3,
      highlights: ['272 miles daily electric commute range', 'Rear-Wheel Drive agility', 'LFP high-cycle battery pack'],
      specs: [
        { groupName: 'Efficient Commute', items: [{ label: 'Range', value: '272 Miles' }, { label: '0-60 mph', value: '5.8s' }] }
      ]
    },
    {
      title: 'Tesla Model Y Long Range AWD (7-Seater)',
      slug: 'tesla-model-y-long-range-7-seater',
      catSlug: 'electric-suvs-trucks',
      brandSlug: 'tesla',
      collections: ['electric-mobility'],
      basePrice: 8100000,
      discountPrice: 7700000,
      image: IMAGES.modelY,
      highlights: ['Optional 7-seat family interior', '310 miles EPA range', 'Dual Motor intelligent AWD'],
      specs: [
        { groupName: 'Family SUV', items: [{ label: 'Seating Capacity', value: '7 Passengers' }, { label: 'Cargo', value: '76 cu ft' }] }
      ]
    },
    {
      title: 'Tesla Model Y Standard RWD Utility',
      slug: 'tesla-model-y-standard-rwd-utility',
      catSlug: 'electric-suvs-trucks',
      brandSlug: 'tesla',
      collections: ['electric-mobility'],
      basePrice: 6800000,
      discountPrice: 6500000,
      image: IMAGES.modelY,
      highlights: ['260 miles range', 'Panoramic all-glass roof', 'Autopilot safety standard'],
      specs: [
        { groupName: 'Specs', items: [{ label: 'Drive', value: 'Rear-Wheel Drive' }, { label: 'Range', value: '260 Miles' }] }
      ]
    },

    // --- HOME APPLIANCES (8 More) ---
    {
      title: 'LG Side-by-Side Inverter Refrigerator (674L)',
      slug: 'lg-side-by-side-inverter-refrigerator-674l',
      catSlug: 'refrigeration',
      brandSlug: 'lg',
      collections: ['smart-living'],
      basePrice: 245000,
      discountPrice: 228000,
      image: IMAGES.fridge,
      highlights: ['Ultra-large 674 Liters storage capacity', 'LinearCooling reduces temperature fluctuations', 'Spaceplus Ice System built into door'],
      specs: [
        { groupName: 'Capacity', items: [{ label: 'Volume', value: '674 Liters' }, { label: 'Energy Rating', value: '5-Star' }] }
      ]
    },
    {
      title: 'Samsung Family Hub AI Smart Refrigerator',
      slug: 'samsung-family-hub-ai-smart-refrigerator',
      catSlug: 'refrigeration',
      brandSlug: 'samsung',
      collections: ['smart-living', 'new-arrivals-2026'],
      basePrice: 385000,
      discountPrice: 355000,
      image: IMAGES.fridge,
      highlights: ['21.5-inch Touchscreen Family Hub', 'Internal AI cameras show food status on phone', 'Bixby voice assistant & Spotify playback'],
      specs: [
        { groupName: 'Smart Refrigerator', items: [{ label: 'Screen', value: '21.5" Full HD Touch' }, { label: 'Capacity', value: '640 Liters' }] }
      ]
    },
    {
      title: 'LG AI DD Front Load Steam Washer (9kg)',
      slug: 'lg-ai-dd-front-load-steam-washer-9kg',
      catSlug: 'washing-cleaning',
      brandSlug: 'lg',
      collections: ['smart-living'],
      basePrice: 98000,
      discountPrice: 89000,
      image: IMAGES.washer,
      highlights: ['AI DD™ intelligent fabric care with 18% more protection', 'Steam+ removes 99.9% allergens and 30% fewer wrinkles', 'TurboWash™ 360 completes full load in 39 mins'],
      specs: [
        { groupName: 'Laundry', items: [{ label: 'Capacity', value: '9.0 kg' }, { label: 'Spin Speed', value: '1400 RPM' }] }
      ]
    },
    {
      title: 'Samsung Bespoke Washer & Dryer AI Combo',
      slug: 'samsung-bespoke-washer-dryer-ai-combo',
      catSlug: 'washing-cleaning',
      brandSlug: 'samsung',
      collections: ['smart-living', 'new-arrivals-2026'],
      basePrice: 195000,
      discountPrice: 180000,
      image: IMAGES.washer,
      highlights: ['Wash and dry in one single unit without transferring clothes', 'AI OptiWash & Dry automatically senses soil levels', 'SuperSpeed cycle washes and dries in 98 mins'],
      specs: [
        { groupName: 'Combo Tech', items: [{ label: 'Wash Capacity', value: '12 kg' }, { label: 'Dry Capacity', value: '8 kg' }] }
      ]
    },
    {
      title: 'Sony Bravia XR 55" 4K OLED Master Series',
      slug: 'sony-bravia-xr-55-4k-oled-master',
      catSlug: 'smart-tvs',
      brandSlug: 'sony',
      collections: ['cinematic-entertainment'],
      basePrice: 185000,
      discountPrice: 172000,
      image: IMAGES.tv,
      highlights: ['Cognitive Processor XR with XR Triluminos Pro', '120Hz high frame rate gaming on PS5', 'Dolby Vision HDR and IMAX Enhanced certification'],
      specs: [
        { groupName: 'Screen', items: [{ label: 'Display', value: '55 Inch OLED' }, { label: 'Refresh', value: '120Hz Native' }] }
      ]
    },
    {
      title: 'Sony Bravia 75" 4K Mini-LED Google TV',
      slug: 'sony-bravia-75-4k-mini-led-tv',
      catSlug: 'smart-tvs',
      brandSlug: 'sony',
      collections: ['cinematic-entertainment', 'new-arrivals-2026'],
      basePrice: 340000,
      discountPrice: 315000,
      image: IMAGES.tv,
      highlights: ['Massive 75-inch Mini-LED display with precise local dimming', 'XR Backlight Master Drive produces thousands of tiny LEDs', 'Voice remote with Hands-free Google Assistant'],
      specs: [
        { groupName: 'Cinema Scale', items: [{ label: 'Size', value: '75 Inch Mini-LED' }, { label: 'Peak Brightness', value: '2500 nits' }] }
      ]
    },
    {
      title: 'Dyson Gen5detect Absolute Cordless Vacuum',
      slug: 'dyson-gen5detect-absolute-cordless-vacuum',
      catSlug: 'washing-cleaning',
      brandSlug: 'dyson',
      collections: ['smart-living', 'new-arrivals-2026'],
      basePrice: 135000,
      discountPrice: 124000,
      image: IMAGES.dyson,
      highlights: ['Dyson\'s most powerful HEPA cordless vacuum (280 AW)', 'Up to 70 minutes run time with single-button power control', 'Illumination reveals twice the invisible dust'],
      specs: [
        { groupName: 'Suction Tech', items: [{ label: 'Air Watts', value: '280 AW' }, { label: 'Runtime', value: '70 Minutes' }] }
      ]
    },
    {
      title: 'Dyson Omni-glide Hard Floor Specialist',
      slug: 'dyson-omni-glide-hard-floor-specialist',
      catSlug: 'washing-cleaning',
      brandSlug: 'dyson',
      collections: ['smart-living'],
      basePrice: 65000,
      discountPrice: 58000,
      image: IMAGES.dyson,
      highlights: ['First omnidirectional Fluffy cleaner head moves in all directions', 'Lies completely flat to clean under tight furniture', 'Ultra-lightweight 1.9 kg handheld transformable'],
      specs: [
        { groupName: 'Ultra-light', items: [{ label: 'Weight', value: '1.9 kg' }, { label: 'Head Type', value: 'Double Fluffy Rollers' }] }
      ]
    },

    // --- SMART ELECTRONICS (10 More) ---
    {
      title: 'Apple iPhone 16 Pro (Black Titanium - 256GB)',
      slug: 'apple-iphone-16-pro-black-titanium-256gb',
      catSlug: 'smartphones',
      brandSlug: 'apple',
      collections: ['pro-tech-edition'],
      basePrice: 175000,
      discountPrice: 168000,
      image: IMAGES.iphone,
      highlights: ['6.3-inch Super Retina XDR ProMotion display', 'A18 Pro flagship silicon', '48MP Fusion & 5x optical zoom', 'Camera Control tactile haptic pad'],
      specs: [
        { groupName: 'Pro Specs', items: [{ label: 'Display', value: '6.3" OLED 120Hz' }, { label: 'Storage', value: '256GB NVMe' }] }
      ]
    },
    {
      title: 'Apple iPhone 16 Plus (Ultramarine - 128GB)',
      slug: 'apple-iphone-16-plus-ultramarine-128gb',
      catSlug: 'smartphones',
      brandSlug: 'apple',
      collections: ['pro-tech-edition'],
      basePrice: 135000,
      discountPrice: 129000,
      image: IMAGES.iphone,
      highlights: ['Massive 6.7-inch display with all-day battery powerhouse', 'A18 chip with 5-core GPU', '48MP 2-in-1 camera with spatial photo and video'],
      specs: [
        { groupName: 'Display & Battery', items: [{ label: 'Screen', value: '6.7" OLED' }, { label: 'Battery', value: '27 hours video' }] }
      ]
    },
    {
      title: 'Apple MacBook Pro 14" (M3 Pro Chip - 18GB RAM)',
      slug: 'apple-macbook-pro-14-m3-pro',
      catSlug: 'laptops-workstations',
      brandSlug: 'apple',
      collections: ['pro-tech-edition'],
      basePrice: 285000,
      discountPrice: 269000,
      image: IMAGES.laptop,
      highlights: ['Apple M3 Pro 11-core CPU & 14-core GPU', '18GB Unified Memory with 512GB SSD', '14.2" Liquid Retina XDR display (120Hz ProMotion)', 'Up to 18 hours battery life'],
      specs: [
        { groupName: 'Performance', items: [{ label: 'Processor', value: 'M3 Pro' }, { label: 'Memory', value: '18GB Unified' }] }
      ]
    },
    {
      title: 'Apple MacBook Air 15" (M3 Chip - Starlight)',
      slug: 'apple-macbook-air-15-m3-starlight',
      catSlug: 'laptops-workstations',
      brandSlug: 'apple',
      collections: ['pro-tech-edition'],
      basePrice: 185000,
      discountPrice: 175000,
      image: IMAGES.laptop,
      highlights: ['Impossibly thin 11.5mm fanless design', '15.3-inch Liquid Retina display with 500 nits brightness', 'M3 chip powers hardware-accelerated ray tracing', '18 hours battery life with MagSafe charging'],
      specs: [
        { groupName: 'Ultra-portable', items: [{ label: 'Thickness', value: '11.5 mm' }, { label: 'Weight', value: '1.51 kg' }] }
      ]
    },
    {
      title: 'Apple Watch Series 10 (Jet Black Aluminum - 46mm)',
      slug: 'apple-watch-series-10-jet-black-46mm',
      catSlug: 'audio-wearables',
      brandSlug: 'apple',
      collections: ['wearables-audiophile', 'pro-tech-edition', 'new-arrivals-2026'],
      basePrice: 62000,
      discountPrice: 57000,
      image: IMAGES.appleWatch,
      highlights: ['Thinnest Apple Watch ever with wide-angle OLED display', 'Sleep apnea detection and depth/water temperature sensors', 'Faster charging: 0 to 80% in just 30 minutes'],
      specs: [
        { groupName: 'Wearable Tech', items: [{ label: 'Case Size', value: '46mm Jet Black' }, { label: 'Display', value: 'Wide-Angle OLED' }] }
      ]
    },
    {
      title: 'Apple Watch SE (2nd Gen - Starlight 44mm)',
      slug: 'apple-watch-se-2nd-gen-44mm',
      catSlug: 'audio-wearables',
      brandSlug: 'apple',
      collections: ['wearables-audiophile'],
      basePrice: 38000,
      discountPrice: 35000,
      image: IMAGES.appleWatch,
      highlights: ['Essential fitness tracking and heart rate monitoring', 'Crash Detection and Emergency SOS', '50m water resistant swimproof design'],
      specs: [
        { groupName: 'Everyday Smartwatch', items: [{ label: 'Case', value: '44mm Aluminum' }, { label: 'Water Rating', value: '50m WR' }] }
      ]
    },
    {
      title: 'Sony WF-1000XM5 True Wireless Earbuds',
      slug: 'sony-wf-1000xm5-true-wireless-earbuds',
      catSlug: 'audio-wearables',
      brandSlug: 'sony',
      collections: ['wearables-audiophile', 'new-arrivals-2026'],
      basePrice: 32000,
      discountPrice: 28500,
      image: IMAGES.headphones,
      highlights: ['The best noise canceling true wireless earbuds in the world', 'Dynamic Driver X for richer vocals and enhanced detail', 'IPX4 water resistant with bone conduction call sensor'],
      specs: [
        { groupName: 'TWS Audio', items: [{ label: 'Battery', value: '8 hours (24 with case)' }, { label: 'Weight', value: '5.9g per bud' }] }
      ]
    },
    {
      title: 'Sony ULT WEAR Bass Boost ANC Headphones',
      slug: 'sony-ult-wear-bass-boost-anc-headphones',
      catSlug: 'audio-wearables',
      brandSlug: 'sony',
      collections: ['wearables-audiophile', 'cinematic-entertainment'],
      basePrice: 24000,
      discountPrice: 21500,
      image: IMAGES.headphones,
      highlights: ['ULT Power Sound with massive subterranean bass button', 'Integrated Processor V1 noise canceling', '30 hours battery life with swivel folding earcups'],
      specs: [
        { groupName: 'Bass Performance', items: [{ label: 'Driver', value: '40mm ULT unit' }, { label: 'Battery', value: '30 Hours' }] }
      ]
    },
    {
      title: 'Apple AirPods Max (USB-C - Space Gray)',
      slug: 'apple-airpods-max-usb-c-space-gray',
      catSlug: 'audio-wearables',
      brandSlug: 'apple',
      collections: ['wearables-audiophile', 'pro-tech-edition'],
      basePrice: 72000,
      discountPrice: 66000,
      image: IMAGES.headphones,
      highlights: ['Computational audio with Apple-designed H1 chip in each cup', 'Active Noise Cancellation with Transparency mode', 'Personalized Spatial Audio with dynamic head tracking', 'Now with high-speed USB-C charging'],
      specs: [
        { groupName: 'Audiophile Luxury', items: [{ label: 'Canopy', value: 'Breathable knit mesh' }, { label: 'Charging', value: 'USB-C' }] }
      ]
    },
    {
      title: 'Sony PlayStation 5 Pro Console (2TB SSD)',
      slug: 'sony-playstation-5-pro-console-2tb',
      catSlug: 'audio-wearables',
      brandSlug: 'sony',
      collections: ['cinematic-entertainment', 'new-arrivals-2026'],
      basePrice: 115000,
      discountPrice: 108000,
      image: IMAGES.tv,
      highlights: ['PlayStation Spectral Super Resolution (PSSR) AI upscaling', 'Upgraded GPU with 67% more Compute Units', 'Advanced ray tracing reflections and 4K 60-120fps fidelity'],
      specs: [
        { groupName: 'Gaming Hardware', items: [{ label: 'Storage', value: '2TB High-Speed SSD' }, { label: 'Video Output', value: '4K/8K 120Hz HDR' }] }
      ]
    }
  ];

  for (const item of additionalProducts) {
    const subcat = catMap[item.catSlug];
    const brand = brandMap[item.brandSlug];

    const prodPayload = {
      title: item.title,
      slug: item.slug,
      categorySlug: item.catSlug,
      categoryName: subcat ? subcat.name : 'Electronics',
      categoryId: subcat ? subcat._id : null,
      categoryPath: subcat && subcat.ancestors ? [...subcat.ancestors, subcat.slug] : [item.catSlug],
      brandSlug: item.brandSlug,
      brandName: brand ? brand.name : '',
      brandId: brand ? brand._id : null,
      collections: item.collections,
      productType: 'REGULAR',
      basePrice: item.basePrice,
      discountPrice: item.discountPrice,
      totalStock: 50,
      inStock: true,
      stockStatus: 'AUTO',
      highlights: item.highlights,
      description: `${item.title} offers pinnacle engineering and premium craftsmanship designed for enthusiasts and luxury consumers.`,
      media: [
        {
          url: item.image,
          key: `products/${item.slug}.jpg`,
          altText: item.title,
          type: 'IMAGE',
        },
      ],
      specifications: item.specs,
      status: 'PUBLISHED',
      isActive: true,
    };

    await Product.findOneAndUpdate(
      { slug: item.slug },
      { $set: prodPayload },
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded: ${item.title}`);
  }

  const finalCount = await Product.countDocuments({ isActive: true });
  console.log('====================================================');
  console.log(`🎉 CATALOG SEED EXPANSION COMPLETE!`);
  console.log(`📦 Total Active Products in Database: ${finalCount}`);
  console.log('====================================================');

  await mongoose.connection.close();
  process.exit(0);
}

seedExpandedCatalog().catch((err) => {
  console.error('❌ Error during expanded seed:', err);
  process.exit(1);
});
