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
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seedMultiDomain() {
  console.log('⚡ Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  // Clean up previous dummy draft if present
  await Product.deleteOne({ slug: 'smart-electronics-mobile-and-home-appliances' });
  console.log('🧹 Cleaned up temporary draft item.');

  // 1. Create or Find Categories
  const categoryDefs = [
    {
      name: 'Automobiles',
      slug: 'automobiles',
      description: 'Luxury Electric Vehicles & High-Performance Mobility',
      image: { url: 'https://cdn-demo.vectorfitlab.com/products/1794968284009-tesla-cybertruck.jpg', key: 'categories/automobiles.jpg' },
      isFeaturedHome: true,
      displayOrder: 1,
    },
    {
      name: 'Home Appliances',
      slug: 'home-appliances',
      description: 'Next-Generation Smart Living & Intelligent Appliances',
      image: { url: 'https://cdn-demo.vectorfitlab.com/products/1794968486792-frezze.jpg', key: 'categories/home-appliances.jpg' },
      isFeaturedHome: true,
      displayOrder: 2,
    },
    {
      name: 'Smart Electronics',
      slug: 'electronics',
      description: 'Flagship Computing, Mobile Tech & Audiophile Gear',
      image: { url: 'https://cdn-demo.vectorfitlab.com/products/1794968489441-ipohone.jpg', key: 'categories/electronics.jpg' },
      isFeaturedHome: true,
      displayOrder: 3,
    },
  ];

  const catMap = {};
  for (const c of categoryDefs) {
    const existing = await Category.findOne({ slug: c.slug });
    if (existing) {
      existing.image = c.image;
      existing.isFeaturedHome = true;
      existing.isActive = true;
      await existing.save();
      catMap[c.slug] = existing;
      console.log(`Updated Category: ${c.name}`);
    } else {
      const created = await Category.create({ ...c, isActive: true });
      catMap[c.slug] = created;
      console.log(`Created Category: ${c.name}`);
    }
  }

  // 2. Create or Find Brands
  const brandDefs = [
    { name: 'Tesla', slug: 'tesla', website: 'https://tesla.com', featured: true },
    { name: 'Apple', slug: 'apple', website: 'https://apple.com', featured: true },
    { name: 'Sony', slug: 'sony', website: 'https://sony.com', featured: true },
    { name: 'LG', slug: 'lg', website: 'https://lg.com', featured: true },
    { name: 'Samsung', slug: 'samsung', website: 'https://samsung.com', featured: true },
    { name: 'Dyson', slug: 'dyson', website: 'https://dyson.com', featured: true },
  ];

  const brandMap = {};
  for (const b of brandDefs) {
    const existing = await Brand.findOne({ slug: b.slug });
    if (existing) {
      brandMap[b.slug] = existing;
    } else {
      const created = await Brand.create({ ...b, isActive: true });
      brandMap[b.slug] = created;
      console.log(`Created Brand: ${b.name}`);
    }
  }

  // 3. Define the 12 Real Multi-Domain Products
  const productsToSeed = [
    // ---------------- AUTOMOBILES ----------------
    {
      title: 'Tesla Cybertruck Dual-Motor AWD',
      slug: 'tesla-cybertruck-dual-motor-awd',
      categorySlug: 'automobiles',
      categoryName: 'Automobiles',
      categoryId: catMap['automobiles']._id,
      brandSlug: 'tesla',
      brandName: 'Tesla',
      brandId: brandMap['tesla']._id,
      productType: 'REGULAR',
      basePrice: 14500000,
      discountPrice: 13900000,
      totalStock: 5,
      sku: 'TSLA-CYBER-001',
      highlights: [
        'Ultra-Hard 30X Cold-Rolled Stainless Steel Exoskeleton',
        'Armor Glass shatter-resistant acoustic compound',
        '340 miles estimated EPA driving range',
        '11,000 lbs heavy-duty towing capacity'
      ],
      description: 'Built for any adventure, Cybertruck features a durable exterior shell and futuristic minimalist cabin. With instant electric torque and electronic adaptive air suspension, it conquers both off-road trails and highway cruising.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968284009-tesla-cybertruck.jpg',
          key: 'products/1794968284009-tesla-cybertruck.jpg',
          altText: 'Tesla Cybertruck Dual-Motor AWD'
        }
      ],
      specifications: [
        {
          groupName: 'Powertrain & Performance',
          items: [
            { label: 'Drivetrain', value: 'Dual Motor All-Wheel Drive' },
            { label: 'Acceleration', value: '0-60 mph in 4.1 seconds' },
            { label: 'Top Speed', value: '112 mph' },
            { label: 'Horsepower', value: '600 hp' }
          ]
        },
        {
          groupName: 'Battery & Range',
          items: [
            { label: 'EPA Estimated Range', value: '340 Miles' },
            { label: 'Supercharging Speed', value: 'Up to 250 kW (136 mi in 15 mins)' },
            { label: 'Battery Capacity', value: '123 kWh structural pack' }
          ]
        },
        {
          groupName: 'Utility & Suspension',
          items: [
            { label: 'Towing Capacity', value: '11,000 lbs' },
            { label: 'Payload Capacity', value: '2,500 lbs' },
            { label: 'Suspension', value: 'Adaptive Air with 12" travel (up to 16" clearance)' }
          ]
        }
      ]
    },
    {
      title: 'Tesla Model S Plaid Tri-Motor',
      slug: 'tesla-model-s-plaid-tri-motor',
      categorySlug: 'automobiles',
      categoryName: 'Automobiles',
      categoryId: catMap['automobiles']._id,
      brandSlug: 'tesla',
      brandName: 'Tesla',
      brandId: brandMap['tesla']._id,
      productType: 'REGULAR',
      basePrice: 18500000,
      discountPrice: 17800000,
      totalStock: 3,
      sku: 'TSLA-S-PLAID-002',
      highlights: [
        '1,020 hp Tri-Motor All-Wheel Drive with torque vectoring',
        '0-60 mph in 1.99s — the quickest accelerating production sedan',
        '17-inch cinematic display with 10 teraflops gaming computer',
        'Tri-zone climate control with HEPA filtration'
      ],
      description: 'Model S Plaid has the quickest acceleration of any vehicle in production. Updated battery architecture enables back-to-back track runs without performance degradation.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968290477-tesla-model-s.jpg',
          key: 'products/1794968290477-tesla-model-s.jpg',
          altText: 'Tesla Model S Plaid'
        }
      ],
      specifications: [
        {
          groupName: 'Performance Specs',
          items: [
            { label: 'Powertrain', value: 'Tri-Motor Plaid AWD' },
            { label: 'Horsepower', value: '1,020 hp' },
            { label: '0-60 mph', value: '1.99 seconds' },
            { label: 'Quarter Mile', value: '9.23 seconds @ 155 mph' },
            { label: 'Top Speed', value: '200 mph' }
          ]
        },
        {
          groupName: 'Range & Charging',
          items: [
            { label: 'EPA Range', value: '359 Miles' },
            { label: 'Fast Charge', value: '200 mi in 15 mins via Supercharger' }
          ]
        }
      ]
    },
    {
      title: 'Tesla Model 3 Long Range (Highland Edition)',
      slug: 'tesla-model-3-long-range-highland',
      categorySlug: 'automobiles',
      categoryName: 'Automobiles',
      categoryId: catMap['automobiles']._id,
      brandSlug: 'tesla',
      brandName: 'Tesla',
      brandId: brandMap['tesla']._id,
      productType: 'REGULAR',
      basePrice: 7500000,
      discountPrice: 7100000,
      totalStock: 8,
      sku: 'TSLA-M3-HIGH-003',
      highlights: [
        'Redesigned aerodynamic silhouette (0.219 Cd drag coefficient)',
        '360-degree acoustic glass for whisper-quiet cabin',
        'Customizable wraparound ambient LED lighting',
        'Rear 8-inch passenger display with climate and media controls'
      ],
      description: 'The upgraded Model 3 Highland delivers refined styling, an ultra-quiet interior, improved range, and sophisticated suspension tuned for daily luxury driving.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968289372-tesla-model-3-highland.jpg',
          key: 'products/1794968289372-tesla-model-3-highland.jpg',
          altText: 'Tesla Model 3 Highland'
        },
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968285337-tesla-model-3.jpg',
          key: 'products/1794968285337-tesla-model-3.jpg',
          altText: 'Tesla Model 3 Side Profile'
        }
      ],
      specifications: [
        {
          groupName: 'Electric Drivetrain',
          items: [
            { label: 'Motors', value: 'Dual Motor AWD' },
            { label: 'Range', value: '341 Miles (EPA)' },
            { label: 'Acceleration', value: '0-60 mph in 4.2s' }
          ]
        },
        {
          groupName: 'Comfort & Cabin',
          items: [
            { label: 'Sound Isolation', value: 'Double-pane acoustic glass on all windows' },
            { label: 'Audio System', value: '17 speakers with dual subwoofers' }
          ]
        }
      ]
    },
    {
      title: 'Tesla Model Y Performance Dual-Motor',
      slug: 'tesla-model-y-performance-dual-motor',
      categorySlug: 'automobiles',
      categoryName: 'Automobiles',
      categoryId: catMap['automobiles']._id,
      brandSlug: 'tesla',
      brandName: 'Tesla',
      brandId: brandMap['tesla']._id,
      productType: 'REGULAR',
      basePrice: 8800000,
      discountPrice: 8400000,
      totalStock: 6,
      sku: 'TSLA-MY-PERF-004',
      highlights: [
        '21-inch Überturbine performance wheels',
        'Performance brakes & carbon fiber rear spoiler',
        'Lowered suspension for sharper dynamic handling',
        '76 cubic feet of versatile cargo space'
      ],
      description: 'Model Y Performance combines supercar acceleration with crossover SUV versatility, folding flat second-row seats, and expansive glass panoramic roof.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968291733-tesla-model-y.jpg',
          key: 'products/1794968291733-tesla-model-y.jpg',
          altText: 'Tesla Model Y Performance'
        }
      ],
      specifications: [
        {
          groupName: 'Performance Specs',
          items: [
            { label: 'Drivetrain', value: 'Performance All-Wheel Drive' },
            { label: 'Acceleration', value: '0-60 mph in 3.5 seconds' },
            { label: 'Top Speed', value: '155 mph' },
            { label: 'Range', value: '279 Miles' }
          ]
        }
      ]
    },

    // ---------------- HOME APPLIANCES ----------------
    {
      title: 'LG InstaView Door-in-Door Smart Refrigerator',
      slug: 'lg-instaview-door-in-door-refrigerator',
      categorySlug: 'home-appliances',
      categoryName: 'Home Appliances',
      categoryId: catMap['home-appliances']._id,
      brandSlug: 'lg',
      brandName: 'LG',
      brandId: brandMap['lg']._id,
      productType: 'REGULAR',
      basePrice: 320000,
      discountPrice: 295000,
      totalStock: 12,
      sku: 'LG-FREEZE-INSTA-001',
      highlights: [
        'Knock twice on mirrored glass panel to illuminate interior',
        'Inverter Linear Compressor with 10-year warranty',
        'DoorCooling+ delivers even temperatures 35% faster',
        'LG ThinQ WiFi control for temperature and smart diagnosis'
      ],
      description: 'The LG InstaView Door-in-Door refrigerator lets you see inside without opening the door, reducing cold air loss and keeping food fresh longer.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968486792-frezze.jpg',
          key: 'products/1794968486792-frezze.jpg',
          altText: 'LG InstaView Refrigerator'
        }
      ],
      specifications: [
        {
          groupName: 'Capacity & Dimensions',
          items: [
            { label: 'Total Capacity', value: '601 Liters' },
            { label: 'Refrigerator Capacity', value: '405 Liters' },
            { label: 'Freezer Capacity', value: '196 Liters' },
            { label: 'Dimensions (WxHxD)', value: '912 x 1790 x 738 mm' }
          ]
        },
        {
          groupName: 'Energy & Cooling',
          items: [
            { label: 'Compressor', value: 'Inverter Linear Compressor' },
            { label: 'Refrigerant', value: 'R600a Eco-Friendly' },
            { label: 'Multi-Air Flow', value: 'Digital Sensors with Surround Cooling' }
          ]
        }
      ]
    },
    {
      title: 'Samsung AI EcoBubble Front Load Washer (10.5kg)',
      slug: 'samsung-ai-ecobubble-front-load-washer',
      categorySlug: 'home-appliances',
      categoryName: 'Home Appliances',
      categoryId: catMap['home-appliances']._id,
      brandSlug: 'samsung',
      brandName: 'Samsung',
      brandId: brandMap['samsung']._id,
      productType: 'REGULAR',
      basePrice: 125000,
      discountPrice: 114000,
      totalStock: 15,
      sku: 'SMSNG-WASH-AI-002',
      highlights: [
        'AI EcoBubble™ turns detergent into gentle cleaning bubbles',
        'AI Wash with 4 intelligent sensors for load weight and fabric softness',
        'Digital Inverter Motor backed by 20-year warranty',
        'Hygiene Steam removes 99.9% of bacteria and allergens'
      ],
      description: 'Wash powerfully and gently with AI EcoBubble. It optimizes water, detergent, and rinse time automatically while protecting delicate fabrics.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968494335-washin-matchine.webp',
          key: 'products/1794968494335-washin-matchine.webp',
          altText: 'Samsung AI EcoBubble Washer'
        }
      ],
      specifications: [
        {
          groupName: 'Wash Capabilities',
          items: [
            { label: 'Capacity', value: '10.5 kg Front Load' },
            { label: 'Maximum Spin Speed', value: '1400 RPM' },
            { label: 'Quick Wash', value: '15 Min Express Cycle' }
          ]
        },
        {
          groupName: 'Smart & Efficiency',
          items: [
            { label: 'SmartThings App Support', value: 'Yes (WiFi Built-in)' },
            { label: 'Energy Star Rating', value: '5-Star A+++ Grade' }
          ]
        }
      ]
    },
    {
      title: 'Sony Bravia XR 65" 4K HDR OLED Smart TV',
      slug: 'sony-bravia-xr-65-4k-oled-tv',
      categorySlug: 'home-appliances',
      categoryName: 'Home Appliances',
      categoryId: catMap['home-appliances']._id,
      brandSlug: 'sony',
      brandName: 'Sony',
      brandId: brandMap['sony']._id,
      productType: 'GADGET',
      basePrice: 265000,
      discountPrice: 245000,
      totalStock: 7,
      sku: 'SNY-TV-OLED-65-003',
      highlights: [
        'Cognitive Processor XR understands how humans see and hear',
        'Pure OLED blacks and vibrant contrast with XR OLED Contrast Pro',
        'Acoustic Surface Audio+ turns the entire screen into a speaker',
        'HDMI 2.1 4K 120Hz VRR support for PlayStation 5'
      ],
      description: 'Experience pure OLED contrast with human cognitive intelligence. Sound and picture exist in perfect cinematic harmony directly in your living room.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968492907-TV.jpg',
          key: 'products/1794968492907-TV.jpg',
          altText: 'Sony Bravia XR 65 OLED TV'
        }
      ],
      specifications: [
        {
          groupName: 'Display Engine',
          items: [
            { label: 'Screen Diagonal', value: '65 Inch (164 cm)' },
            { label: 'Resolution', value: '3840 x 2160 (4K UHD)' },
            { label: 'Panel Refresh Rate', value: '120 Hz Native' },
            { label: 'HDR Formats', value: 'Dolby Vision, HDR10, HLG' }
          ]
        },
        {
          groupName: 'Acoustic Sound',
          items: [
            { label: 'Audio Technology', value: 'Acoustic Surface Audio+ (50W)' },
            { label: 'Surround Decoding', value: 'Dolby Atmos, DTS Digital Surround' }
          ]
        }
      ]
    },
    {
      title: 'Dyson V15 Detect Absolute Cordless Vacuum',
      slug: 'dyson-v15-detect-absolute-cordless-vacuum',
      categorySlug: 'home-appliances',
      categoryName: 'Home Appliances',
      categoryId: catMap['home-appliances']._id,
      brandSlug: 'dyson',
      brandName: 'Dyson',
      brandId: brandMap['dyson']._id,
      productType: 'GADGET',
      basePrice: 105000,
      discountPrice: 95000,
      totalStock: 10,
      sku: 'DYSN-V15-ABS-004',
      highlights: [
        'Laser reveals microscopic dust invisible on hard floors',
        'Piezo acoustic sensor continuously sizes and counts dust particles',
        'Dyson Hyperdymium™ motor generates 230 Air Watts of suction',
        'Advanced whole-machine filtration traps 99.99% of particles'
      ],
      description: 'The most powerful, intelligent cordless vacuum. Calculates particle counts in real time on the LCD screen and adapts suction power automatically.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968485716-Dyson-V15.png',
          key: 'products/1794968485716-Dyson-V15.png',
          altText: 'Dyson V15 Detect Cordless Vacuum'
        }
      ],
      specifications: [
        {
          groupName: 'Suction & Power',
          items: [
            { label: 'Motor Speed', value: '125,000 RPM' },
            { label: 'Suction Power', value: '230 AW (Boost Mode)' },
            { label: 'Runtime', value: 'Up to 60 minutes in Eco mode' }
          ]
        },
        {
          groupName: 'Filtration & Weight',
          items: [
            { label: 'Filtration Standard', value: 'HEPA 0.1 Micron (99.99%)' },
            { label: 'Bin Volume', value: '0.77 Liters' },
            { label: 'Unit Weight', value: '3.1 kg' }
          ]
        }
      ]
    },

    // ---------------- SMART ELECTRONICS ----------------
    {
      title: 'Apple iPhone 16 Pro Max (Desert Titanium)',
      slug: 'apple-iphone-16-pro-max-desert-titanium',
      categorySlug: 'electronics',
      categoryName: 'Smart Electronics',
      categoryId: catMap['electronics']._id,
      brandSlug: 'apple',
      brandName: 'Apple',
      brandId: brandMap['apple']._id,
      productType: 'GADGET',
      basePrice: 205000,
      discountPrice: 195000,
      totalStock: 20,
      sku: 'APPL-IPH16PM-001',
      highlights: [
        'A18 Pro chip with 6-core GPU powering Apple Intelligence',
        '6.9-inch Super Retina XDR display with thinnest borders ever',
        'Camera Control button for instant tactile photo capture',
        '48MP Fusion camera with 5x optical telephoto lens'
      ],
      description: 'Featuring a strong and lightweight titanium design with a larger 6.9-inch display, Camera Control, 4K 120 fps Dolby Vision recording, and revolutionary A18 Pro silicon.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968489441-ipohone.jpg',
          key: 'products/1794968489441-ipohone.jpg',
          altText: 'Apple iPhone 16 Pro Max Desert Titanium'
        }
      ],
      specifications: [
        {
          groupName: 'Silicon & Display',
          items: [
            { label: 'Chipset', value: 'Apple A18 Pro (3-nanometer)' },
            { label: 'Display Size', value: '6.9-inch OLED (2868 x 1320, 460 ppi)' },
            { label: 'Refresh Rate', value: 'ProMotion 1-120Hz' },
            { label: 'Peak Brightness', value: '2000 nits outdoor' }
          ]
        },
        {
          groupName: 'Pro Cameras',
          items: [
            { label: 'Main Lens', value: '48MP Fusion (24mm, f/1.78, 2nd-gen OIS)' },
            { label: 'Ultra-Wide', value: '48MP with autofocus macro' },
            { label: 'Telephoto', value: '12MP 5x Optical Zoom (120mm)' }
          ]
        }
      ]
    },
    {
      title: 'Apple MacBook Pro 16" (M3 Max Chip)',
      slug: 'apple-macbook-pro-16-m3-max',
      categorySlug: 'electronics',
      categoryName: 'Smart Electronics',
      categoryId: catMap['electronics']._id,
      brandSlug: 'apple',
      brandName: 'Apple',
      brandId: brandMap['apple']._id,
      productType: 'GADGET',
      basePrice: 440000,
      discountPrice: 420000,
      totalStock: 5,
      sku: 'APPL-MBP16-M3MAX-002',
      highlights: [
        'Apple M3 Max chip with 16-core CPU and 40-core GPU',
        '36GB fast unified memory and 1TB ultra-responsive SSD',
        'Liquid Retina XDR display with 1600 nits peak HDR brightness',
        'Up to 22 hours of battery life on a single charge'
      ],
      description: 'The ultimate professional workstation laptop. M3 Max brings outrageous performance for demanding workflows like 8K video rendering, 3D simulation, and LLM development.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968490358-labtop.jpg',
          key: 'products/1794968490358-labtop.jpg',
          altText: 'Apple MacBook Pro 16 Space Black'
        }
      ],
      specifications: [
        {
          groupName: 'Hardware Specs',
          items: [
            { label: 'Processor', value: 'Apple M3 Max (16 CPU / 40 GPU Cores)' },
            { label: 'Unified Memory', value: '36GB Unified RAM' },
            { label: 'Internal Storage', value: '1TB PCIe NVMe SSD' },
            { label: 'Display', value: '16.2-inch Liquid Retina XDR (3456x2234)' }
          ]
        },
        {
          groupName: 'I/O & Power',
          items: [
            { label: 'Connectivity', value: '3x Thunderbolt 4, HDMI 2.1, SDXC slot' },
            { label: 'Battery', value: '100Wh Lithium-Polymer (140W MagSafe 3)' }
          ]
        }
      ]
    },
    {
      title: 'Apple Watch Ultra 2 (Titanium GPS + Cellular)',
      slug: 'apple-watch-ultra-2-titanium',
      categorySlug: 'electronics',
      categoryName: 'Smart Electronics',
      categoryId: catMap['electronics']._id,
      brandSlug: 'apple',
      brandName: 'Apple',
      brandId: brandMap['apple']._id,
      productType: 'GADGET',
      basePrice: 115000,
      discountPrice: 105000,
      totalStock: 14,
      sku: 'APPL-WATCH-U2-003',
      highlights: [
        '49mm corrosion-resistant aerospace-grade titanium case',
        'Brightest Apple display ever at 3000 nits peak luminescence',
        'Precision dual-frequency GPS (L1 & L5) for exact route tracking',
        '100m water resistance, EN13319 certified for scuba diving to 40m'
      ],
      description: 'The most capable and rugged Apple Watch. Engineered for endurance athletes, outdoor adventurers, and deep ocean divers with customizable Action button.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968484522-Apple-Watch-Ultra-2-Modular-Ultra-watch-face-230912_inline.jpg.large.jpg',
          key: 'products/1794968484522-Apple-Watch-Ultra-2-Modular-Ultra-watch-face-230912_inline.jpg.large.jpg',
          altText: 'Apple Watch Ultra 2'
        }
      ],
      specifications: [
        {
          groupName: 'Chassis & Display',
          items: [
            { label: 'Case Material', value: 'Natural Titanium 49mm' },
            { label: 'Crystal', value: 'Flat Sapphire Front' },
            { label: 'Display Brightness', value: '3000 nits (down to 1 nit in dark)' }
          ]
        },
        {
          groupName: 'Sensors & Battery',
          items: [
            { label: 'Sensors', value: 'Water temp sensor, Depth gauge, ECG, Blood Oxygen' },
            { label: 'Battery Life', value: '36 hours normal use (72 hours Low Power Mode)' }
          ]
        }
      ]
    },
    {
      title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-anc-headphones',
      categorySlug: 'electronics',
      categoryName: 'Smart Electronics',
      categoryId: catMap['electronics']._id,
      brandSlug: 'sony',
      brandName: 'Sony',
      brandId: brandMap['sony']._id,
      productType: 'GADGET',
      basePrice: 45000,
      discountPrice: 39500,
      totalStock: 25,
      sku: 'SNY-WH1000XM5-004',
      highlights: [
        'Industry-leading Active Noise Cancellation with two processors & 8 mics',
        'Specially engineered 30mm carbon fiber driver unit for Hi-Res audio',
        'Crystal clear hands-free calling with AI beamforming microphones',
        'Up to 30-hour battery life with 3-minute quick charging (3 hours play)'
      ],
      description: 'The WH-1000XM5 rewrite the rules for distraction-free listening. Magnificent acoustics and best-in-class noise cancellation engineered for flights, commutes, and studio work.',
      media: [
        {
          url: 'https://cdn-demo.vectorfitlab.com/products/1794968487958-HeadPhone.jpg',
          key: 'products/1794968487958-HeadPhone.jpg',
          altText: 'Sony WH-1000XM5 Headphones'
        }
      ],
      specifications: [
        {
          groupName: 'Audio & ANC',
          items: [
            { label: 'Noise Canceling', value: 'Integrated Processor V1 + HD Processor QN1' },
            { label: 'Frequency Response', value: '4 Hz - 40,000 Hz' },
            { label: 'Bluetooth Codecs', value: 'LDAC, AAC, SBC (Hi-Res Audio Wireless)' }
          ]
        },
        {
          groupName: 'Comfort & Power',
          items: [
            { label: 'Battery Life', value: '30 Hours (NC ON), 40 Hours (NC OFF)' },
            { label: 'Weight', value: '250 grams (Soft fit leather)' }
          ]
        }
      ]
    }
  ];

  // Insert or update each product
  for (const p of productsToSeed) {
    const existing = await Product.findOne({ slug: p.slug });
    if (existing) {
      Object.assign(existing, { ...p, status: 'PUBLISHED', isActive: true, inStock: true });
      await existing.save();
      console.log(`Updated Product: ${p.title}`);
    } else {
      await Product.create({ ...p, status: 'PUBLISHED', isActive: true, inStock: true });
      console.log(`Created Product: ${p.title}`);
    }
  }

  console.log('🎉 Successfully seeded all 12 multi-domain products across Automobiles, Home Appliances, and Electronics!');
  await mongoose.connection.close();
  process.exit(0);
}

seedMultiDomain().catch((err) => {
  console.error('❌ Error seeding products:', err);
  process.exit(1);
});
