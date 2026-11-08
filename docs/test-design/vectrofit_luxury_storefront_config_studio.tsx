import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Settings2,
  X,
  Plus,
  Minus,
  ArrowRight,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Save,
  Ruler,
  Check,
  Copy,
  Truck,
  Sliders,
  Layers,
  CreditCard,
  Code2,
  MessageCircle,
  EyeOff
} from 'lucide-react';

/**
 * ============================================================================
 * STORECONFIG SINGLETON SEED (Updated for Editorial Light Luxury Aesthetic)
 * ============================================================================
 */
const DEFAULT_CONFIG_SEED = {
  branding: {
    storeName: 'VectroFit Luxury',
    tagline: 'Engineered Streetwear & Minimal Garments',
    logo: {
      url: 'https://cdn-demo.vectorfitlab.com/branding/logo.png',
      key: 'branding/logo.png',
    },
    favicon: {
      url: '',
      key: '',
    },
    themeMode: 'LIGHT',
    colors: {
      primary: '#111111',
      accent: '#B8860B', // Refined Antique Gold accent (adjustable to #E11D48 Crimson or #111111 Noir)
      bg: '#FFFFFF',
      surface: '#F9FAFB',
      fg: '#09090B',
      muted: '#71717A',
    },
    heroVariant: 'CENTER',
  },
  homeSections: [
    {
      id: 'sec_hero_1',
      type: 'HERO_CAROUSEL',
      title: 'Winter Luxury Drop 2026',
      subtitle: 'Premium Acid-Wash & Heavyweight Fleece',
      linkUrl: '/products',
      order: 1,
      isActive: true,
    },
    {
      id: 'sec_cat_hoodies',
      type: 'CATEGORY_GRID',
      title: 'Heavyweight Hoodies',
      subtitle: '450 GSM French Terry Fleece',
      collectionSlug: 'hoodies',
      order: 2,
      isActive: true,
    },
    {
      id: 'sec_banner_promo',
      type: 'PROMO_BANNER',
      title: 'Free Express Shipping Across Bangladesh',
      subtitle: 'On all orders above 2,500 BDT',
      linkUrl: '/products',
      order: 3,
      isActive: true,
    },
    {
      id: 'sec_cat_tees',
      type: 'CATEGORY_SLIDER',
      title: 'Oversized Tees',
      subtitle: '240 GSM Combed Cotton',
      collectionSlug: 't-shirts',
      order: 4,
      isActive: true,
    },
  ],
  logistics: {
    supportPhone: '01700000000',
    whatsappNumber: '8801700000000',
    showroomAddress: 'Banani 11, Dhaka, Bangladesh',
    insideDhakaFee: 70,
    outsideDhakaFee: 130,
    freeShippingThreshold: 2500,
    estimatedDeliveryDays: {
      insideDhaka: '24-48 Hours',
      outsideDhaka: '3-5 Days',
    },
  },
  tracking: {
    metaPixelId: '',
    metaCapiToken: '',
    metaTestEventCode: '',
    gtmId: '',
    ga4MeasurementId: '',
    tiktokPixelId: '',
    tiktokEventsApiToken: '',
  },
  courier: {
    provider: 'STEADFAST',
    steadfast: {
      apiKey: '',
      secretKey: '',
      baseUrl: 'https://portal.packzy.com/api/v1',
    },
    fraudCheck: {
      apiKey: '',
      riskThresholdRatio: 0.3,
    },
    advancePayment: {
      requiredForOutsideDhaka: false,
      advanceAmount: 150,
      bkashMerchantNumber: '',
    },
  },
  payment: {
    cod: {
      enabled: true,
      note: 'Cash on delivery across 64 districts in Bangladesh',
    },
    manualBkash: {
      enabled: true,
      number: '01700000000',
      accountType: 'PERSONAL',
      instructions: 'Send Money to our personal bKash number and paste your TrxID below.',
    },
    manualNagad: {
      enabled: true,
      number: '01700000000',
      accountType: 'PERSONAL',
      instructions: 'Send Money to our personal Nagad number and paste your TrxID below.',
    },
    bkashPGW: {
      enabled: false,
      isSandbox: true,
    },
    sslCommerz: {
      enabled: false,
      isSandbox: true,
    },
  },
  media: {
    defaultVideoProvider: 'YOUTUBE',
  },
  features: {
    capiEnabled: false,
    tiktokPixelEnabled: false,
    gtmEnabled: false,
    courierAutoBooking: false,
    fraudCheckEnabled: false,
    abandonedCartCapture: true,
    advanceDeliveryFeeEnabled: false,
    couponEnabled: true,
  },
  isActive: true,
};

/**
 * ============================================================================
 * EDITORIAL PRODUCT ARCHIVE
 * ============================================================================
 */
const PRODUCTS = [
  {
    id: 'vf-hd-01',
    name: 'Obsidian Acid-Wash Boxy Hoodie',
    sku: 'VF-HD26-01',
    collectionSlug: 'hoodies',
    categoryLabel: 'Heavyweight Hoodies',
    price: 2690,
    compareAtPrice: 3200,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 450 GSM 100% Ring-Spun French Terry Fleece',
      'Fit: Boxy Drop-Shoulder Architectural Silhouette',
      'Finish: Artisanal Enzyme Acid-Wash Patina',
      'Construction: Double-Layered Hood (No Drawcord)',
      'Ribbing: High-Density 2x2 Lycra Spandex Cuff & Hem',
    ],
    description:
      'Engineered for structure and longevity, our Obsidian Acid-Wash Boxy Hoodie is cut from custom-milled 450 GSM French Terry cotton. Pre-shrunk and enzyme-treated for a lived-in luxury handfeel.',
  },
  {
    id: 'vf-hd-02',
    name: 'Slate Heavyweight Full-Zip Hoodie',
    sku: 'VF-HD26-02',
    collectionSlug: 'hoodies',
    categoryLabel: 'Heavyweight Hoodies',
    price: 2850,
    compareAtPrice: 3400,
    image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 450 GSM Brushed Heavyweight Fleece',
      'Hardware: Custom Antique Silver Two-Way YKK Metal Zipper',
      'Fit: Relaxed Cropped Waist Proportion',
      'Stitching: Reverse Flatlock Reinforced Seams',
      'Care: Zero-Pilling Bio-Polished Surface',
    ],
    description:
      'Featuring a two-way metallic YKK zipper and structured double-panel hood, the Slate Full-Zip bridges minimal tailoring and heavyweight street utility.',
  },
  {
    id: 'vf-hd-03',
    name: 'Burgundy Garment-Dyed Pullover',
    sku: 'VF-HD26-03',
    collectionSlug: 'hoodies',
    categoryLabel: 'Heavyweight Hoodies',
    price: 2490,
    compareAtPrice: 2950,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 450 GSM Unbrushed Loopback French Terry',
      'Dye Process: Reactive Garment-Dyed Deep Burgundy',
      'Fit: Oversized Contemporary Drop-Shoulder',
      'Pocket: Concealed Side-Seam Kangaroo Welts',
      'Collar: Crossover Gusset Neckline',
    ],
    description:
      'Rich pigment depth meets substantial drape. Designed to layer cleanly or stand alone as a statement winter essential.',
  },
  {
    id: 'vf-hd-04',
    name: 'Raw Concrete Minimal Seam Hoodie',
    sku: 'VF-HD26-04',
    collectionSlug: 'hoodies',
    categoryLabel: 'Heavyweight Hoodies',
    price: 2590,
    compareAtPrice: 3100,
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 450 GSM Organic Combed Cotton Fleece',
      'Fit: Wide Chest with Structured Rib Waistband',
      'Detail: Tonal High-Density Silicone Branding',
      'Durability: Pre-Shrunk & Colorfast Treated',
      'Ideal For: Winter Layering & Elevated Casual Wear',
    ],
    description:
      'Clean concrete grey hue with zero visual noise. Tailored for clients who appreciate quiet luxury and heavyweight textile engineering.',
  },
  {
    id: 'vf-ts-01',
    name: 'Monolith 240 GSM Oversized Tee (Jet Black)',
    sku: 'VF-TS26-01',
    collectionSlug: 't-shirts',
    categoryLabel: 'Oversized Tees',
    price: 1290,
    compareAtPrice: 1590,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 240 GSM Compact Combed Single Jersey',
      'Collar: Thick 1.2-Inch Anti-Sag Ribbed Crewneck',
      'Fit: Engineered Oversized Drop-Shoulder',
      'Finish: Bio-Polished Ultra-Smooth Handfeel',
      'Breathability: All-Season Tropical Weight Structure',
    ],
    description:
      'Our signature architectural tee crafted with a high-ribbed collar that never loses shape and 240 GSM compact cotton that drapes without clinging.',
  },
  {
    id: 'vf-ts-02',
    name: 'Warm Bone Archival Heavy Tee',
    sku: 'VF-TS26-02',
    collectionSlug: 't-shirts',
    categoryLabel: 'Oversized Tees',
    price: 1350,
    compareAtPrice: 1650,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 240 GSM Heavyweight Combed Cotton',
      'Shade: Custom Warm Bone / Ecru Undertone',
      'Fit: Boxy Half-Sleeve Proportion',
      'Stitching: Double-Needle Chainstitch Hem',
      'Comfort: Tagless Heat-Transfer Neck Label',
    ],
    description:
      'An understated neutral staple in Warm Bone. Opaque 240 GSM construction ensures zero sheer and crisp lines all day.',
  },
  {
    id: 'vf-ts-03',
    name: 'Washed Graphite Boxy Pocket Tee',
    sku: 'VF-TS26-03',
    collectionSlug: 't-shirts',
    categoryLabel: 'Oversized Tees',
    price: 1450,
    compareAtPrice: 1790,
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 240 GSM Enzyme-Washed Cotton Jersey',
      'Fit: Relaxed Street Boxy Cut',
      'Detail: Minimalist Reinforced Chest Pocket',
      'Collar: Heavy Lycra-Blended Crew Rib',
      'Care: Machine Wash Cold, Zero Shrinkage',
    ],
    description:
      'Individually enzyme-washed for a matte charcoal finish. Pairs effortlessly with pleated trousers, cargos, or raw denim.',
  },
  {
    id: 'vf-ts-04',
    name: 'Titanium Mock-Neck Tailored Tee',
    sku: 'VF-TS26-04',
    collectionSlug: 't-shirts',
    categoryLabel: 'Oversized Tees',
    price: 1390,
    compareAtPrice: 1690,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
    ],
    highlights: [
      'Fabric: 240 GSM Luxury Compact Cotton',
      'Neckline: Structured High Mock-Neck Collar',
      'Fit: Tailored Boxy Drop-Shoulder',
      'Finish: Silky Mercerized Surface Sheen',
      'Versatility: Ideal Under Overshirts & Blazers',
    ],
    description:
      'Designed with an elevated mock-neck profile, this piece brings refined proportion to minimalist everyday dressing.',
  },
];

const SIZES = ['S', 'M', 'L', 'XL'];

export default function App() {
  // Singleton StoreConfig State
  const [config, setConfig] = useState(() => structuredClone(DEFAULT_CONFIG_SEED));

  // Navigation & View States ('HOME' | 'PRODUCT_DETAIL')
  const [currentView, setCurrentView] = useState('HOME');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCollectionFilter, setActiveCollectionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Product Detail Page States
  const [pdpSize, setPdpSize] = useState('L');
  const [pdpQty, setPdpQty] = useState(1);
  const [pdpTab, setPdpTab] = useState('DESCRIPTION'); // 'DESCRIPTION' | 'ADDITIONAL' | 'POLICY'
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Studio & API Simulation States
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState('branding');
  const [apiLogs, setApiLogs] = useState([
    {
      id: 'log-1',
      method: 'GET',
      status: 200,
      message: 'Seeded & fetched active StoreConfig singleton',
      timestamp: 'Just now',
    },
  ]);
  const [toast, setToast] = useState(null);

  // Cart & Bangladesh Checkout Drawer States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([
    {
      product: PRODUCTS[0],
      size: 'L',
      quantity: 1,
    },
  ]);
  const [deliveryZone, setDeliveryZone] = useState('insideDhaka');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    trxId: '',
  });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keep payment method valid when toggled in Studio
  useEffect(() => {
    const p = config.payment;
    const enabledKeys = Object.keys(p).filter((k) => p[k]?.enabled);
    if (enabledKeys.length > 0 && !p[paymentMethod]?.enabled) {
      setPaymentMethod(enabledKeys[0]);
    }
  }, [config.payment, paymentMethod]);

  // Open Dedicated Product Detail View (AQVEN Reference Style)
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setPdpSize('L');
    setPdpQty(1);
    setActiveGalleryIdx(0);
    setCurrentView('PRODUCT_DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Functions
  const addToCart = (product, size = 'L', qty = 1, openDrawerAfter = false) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.size === size);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += qty;
        return updated;
      }
      return [...prev, { product, size, quantity: qty }];
    });
    if (openDrawerAfter) {
      setIsCartOpen(true);
    } else {
      showToast(`Added ${product.name} (${size}) to bag`);
    }
  };

  const updateCartQty = (productId, size, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Totals Calculation
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (!config.features.couponEnabled || !appliedCoupon) return 0;
    return Math.round(subtotal * (appliedCoupon.percent / 100));
  }, [subtotal, appliedCoupon, config.features.couponEnabled]);

  const isFreeShipping = useMemo(
    () => subtotal - discountAmount >= config.logistics.freeShippingThreshold && subtotal > 0,
    [subtotal, discountAmount, config.logistics.freeShippingThreshold]
  );

  const deliveryFee = useMemo(() => {
    if (cart.length === 0 || isFreeShipping) return 0;
    return deliveryZone === 'insideDhaka'
      ? Number(config.logistics.insideDhakaFee)
      : Number(config.logistics.outsideDhakaFee);
  }, [cart.length, isFreeShipping, deliveryZone, config.logistics]);

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const activeSections = useMemo(
    () => [...config.homeSections].filter((s) => s.isActive).sort((a, b) => a.order - b.order),
    [config.homeSections]
  );

  const moveSectionOrder = (id, direction) => {
    setConfig((prev) => {
      const sorted = [...prev.homeSections].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const tempOrder = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
      sorted[swapIdx] = { ...sorted[swapIdx], order: tempOrder };
      return { ...prev, homeSections: sorted };
    });
  };

  const handleSimulatePut = () => {
    setApiLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        method: 'PUT',
        status: 200,
        message: 'Store configuration updated successfully (upsert: true)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 4),
    ]);
    showToast('PUT /api/store-config saved');
  };

  const handleResetSeed = () => {
    setConfig(structuredClone(DEFAULT_CONFIG_SEED));
    showToast('Reset to DEFAULT_CONFIG_SEED');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone || !customerForm.address) {
      showToast('Please enter your Name, Phone, and Address', 'error');
      return;
    }
    if (
      (paymentMethod === 'manualBkash' || paymentMethod === 'manualNagad') &&
      !customerForm.trxId.trim()
    ) {
      showToast('Please enter your TrxID', 'error');
      return;
    }
    setOrderSuccess({
      orderId: `VF-${Math.floor(10000 + Math.random() * 90000)}`,
      consignmentId: `SF-${Math.floor(100000 + Math.random() * 900000)}`,
      total: grandTotal,
      zone: deliveryZone === 'insideDhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
      eta:
        deliveryZone === 'insideDhaka'
          ? config.logistics.estimatedDeliveryDays.insideDhaka
          : config.logistics.estimatedDeliveryDays.outsideDhaka,
    });
    setCart([]);
  };

  const { colors } = config.branding;

  /**
   * ==========================================================================
   * REUSABLE ZERO-CLUTTER WIDE EDITORIAL PRODUCT CARD
   * (Inspired directly by AQVEN & luxury boutique references:
   *  clean portrait photo, subtle discount pill, centered title, price, full-width button)
   * ==========================================================================
   */
  const renderEditorialCard = (product, darkSurface = false) => {
    const discountPct =
      product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0;

    return (
      <div
        key={product.id}
        className={`group flex flex-col justify-between rounded-sm transition-all duration-300 ${
          darkSurface
            ? 'bg-zinc-900/90 border border-zinc-800 p-3.5'
            : 'bg-white border border-zinc-200/80 p-3.5 hover:shadow-xl hover:border-zinc-300'
        }`}
      >
        {/* Clean Portrait Image Area */}
        <div>
          <div
            onClick={() => openProductDetail(product)}
            className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 cursor-pointer mb-4"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Single Minimal Discount Pill (Top Left Only) */}
            {discountPct > 0 && (
              <span
                style={{ backgroundColor: colors.accent }}
                className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white tracking-wide"
              >
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Centered Title & Clean Price Row */}
          <div className="text-center px-2">
            <h3
              onClick={() => openProductDetail(product)}
              className={`text-sm font-medium tracking-tight cursor-pointer transition-colors line-clamp-1 mb-1.5 ${
                darkSurface
                  ? 'text-zinc-100 group-hover:text-white'
                  : 'text-zinc-900 group-hover:opacity-75'
              }`}
            >
              {product.name}
            </h3>

            <div className="flex items-center justify-center gap-2 mb-4">
              {product.compareAtPrice > product.price && (
                <span className="text-xs line-through text-zinc-400">
                  {product.compareAtPrice.toLocaleString()}৳
                </span>
              )}
              <span
                style={{ color: darkSurface ? '#FFFFFF' : colors.accent }}
                className="text-sm font-bold"
              >
                {product.price.toLocaleString()}৳
              </span>
            </div>
          </div>
        </div>

        {/* Full-Width Clean Action Button */}
        <button
          onClick={() => openProductDetail(product)}
          style={{
            backgroundColor: darkSurface ? '#FFFFFF' : colors.accent,
            color: darkSurface ? '#09090B' : '#FFFFFF',
          }}
          className="w-full py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition hover:opacity-90 cursor-pointer"
        >
          ADD TO CART
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.fg,
      }}
      className="min-h-screen font-sans antialiased transition-colors duration-300"
    >
      {/* ====================================================================
          MINIMAL TOAST NOTIFICATION
      ==================================================================== */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 bg-zinc-950 text-white text-xs uppercase tracking-widest shadow-2xl">
          <span
            style={{ backgroundColor: toast.type === 'error' ? '#EF4444' : colors.accent }}
            className="w-2 h-2 rounded-full"
          />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ====================================================================
          1. SLIM HIGH-CONTRAST BLACK TOP BAR (Reference Style)
      ==================================================================== */}
      <div className="bg-zinc-950 text-zinc-200 text-[11px] tracking-wider border-b border-zinc-900">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-9 flex items-center justify-between">
          <p className="font-medium tracking-widest uppercase truncate">
            {config.branding.tagline}
          </p>
          <div className="hidden sm:flex items-center gap-5 text-zinc-400">
            <span>
              Free Shipping Over <strong className="text-white">৳{config.logistics.freeShippingThreshold}</strong>
            </span>
            <span>•</span>
            <span>Hotline: {config.logistics.supportPhone}</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. LUXURY CENTER-LOGO EDITORIAL HEADER
      ==================================================================== */}
      <header
        style={{ backgroundColor: colors.bg }}
        className="sticky top-0 z-30 border-b border-zinc-200/80 backdrop-blur-md bg-opacity-95"
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 grid grid-cols-3 items-center">
          {/* Left Navigation Links */}
          <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.14em]">
            <button
              onClick={() => {
                setCurrentView('HOME');
                setActiveCollectionFilter('ALL');
              }}
              style={{
                color:
                  currentView === 'HOME' && activeCollectionFilter === 'ALL'
                    ? colors.accent
                    : colors.fg,
              }}
              className="hover:opacity-70 transition cursor-pointer"
            >
              HOME
            </button>
            <button
              onClick={() => {
                setCurrentView('HOME');
                setActiveCollectionFilter('hoodies');
              }}
              style={{
                color: activeCollectionFilter === 'hoodies' ? colors.accent : colors.fg,
              }}
              className="hidden md:inline-block hover:opacity-70 transition cursor-pointer"
            >
              HOODIES
            </button>
            <button
              onClick={() => {
                setCurrentView('HOME');
                setActiveCollectionFilter('t-shirts');
              }}
              style={{
                color: activeCollectionFilter === 't-shirts' ? colors.accent : colors.fg,
              }}
              className="hidden md:inline-block hover:opacity-70 transition cursor-pointer"
            >
              OVERSIZED TEES
            </button>
          </nav>

          {/* Centered Brand Monogram & Wordmark */}
          <div className="text-center">
            <button
              onClick={() => {
                setCurrentView('HOME');
                setActiveCollectionFilter('ALL');
              }}
              className="inline-flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span
                style={{ color: colors.accent }}
                className="text-xl sm:text-2xl font-serif font-bold tracking-[0.22em] uppercase"
              >
                {config.branding.storeName.split(' ')[0]}
              </span>
              <span className="h-5 w-px bg-zinc-300 hidden sm:inline-block" />
              <span className="hidden sm:inline-block text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-medium">
                LUXURY
              </span>
            </button>
          </div>

          {/* Right Action Icons (Search, StoreConfig Studio, Bag) */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="p-2 hover:opacity-70 transition cursor-pointer"
              title="Search Collection"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsStudioOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300 text-[11px] font-semibold uppercase tracking-wider hover:border-zinc-900 transition cursor-pointer"
              title="Open StoreConfig Studio"
            >
              <Settings2 style={{ color: colors.accent }} className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Config Studio</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 p-2 hover:opacity-75 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span
                style={{ backgroundColor: colors.accent }}
                className="w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
              >
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Clean Expandable Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-zinc-200 bg-zinc-50 py-3 px-4 sm:px-8">
            <div className="max-w-xl mx-auto flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'HOME') setCurrentView('HOME');
                }}
                placeholder="Search Heavyweight Hoodies or 240 GSM Tees..."
                className="w-full bg-transparent text-xs focus:outline-none text-zinc-900"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-zinc-400 hover:text-zinc-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          3. MAIN VIEW SWITCHER: DEDICATED PRODUCT DETAIL vs HOME STOREFRONT
      ==================================================================== */}
      {currentView === 'PRODUCT_DETAIL' && selectedProduct ? (
        /* ------------------------------------------------------------------
           DEDICATED PRODUCT DETAIL VIEW (Matches AQVEN Reference Image 2)
        ------------------------------------------------------------------ */
        <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12">
          {/* Top Two-Column Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-zinc-200">
            {/* Left Column: Large Clean Portrait Image */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[4/5] w-full bg-zinc-100 overflow-hidden border border-zinc-200/80">
                <img
                  src={selectedProduct.gallery?.[activeGalleryIdx] || selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover object-center"
                />
                {selectedProduct.compareAtPrice > selectedProduct.price && (
                  <span
                    style={{ backgroundColor: colors.accent }}
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                  >
                    -
                    {Math.round(
                      ((selectedProduct.compareAtPrice - selectedProduct.price) /
                        selectedProduct.compareAtPrice) *
                        100
                    )}
                    %
                  </span>
                )}
              </div>

              {/* Subtle Thumbnail Strip if multiple images */}
              {selectedProduct.gallery && selectedProduct.gallery.length > 1 && (
                <div className="flex gap-3">
                  {selectedProduct.gallery.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveGalleryIdx(i)}
                      className={`w-20 aspect-[3/4] border overflow-hidden cursor-pointer ${
                        activeGalleryIdx === i ? 'border-zinc-900' : 'border-zinc-200 opacity-60'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Editorial Specs, Size Boxes, Add to Cart & Order Now */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
                <button
                  onClick={() => setCurrentView('HOME')}
                  className="hover:text-zinc-900 transition cursor-pointer"
                >
                  Home
                </button>
                <span>/</span>
                <button
                  onClick={() => {
                    setActiveCollectionFilter(selectedProduct.collectionSlug);
                    setCurrentView('HOME');
                  }}
                  className="hover:text-zinc-900 transition cursor-pointer"
                >
                  {selectedProduct.categoryLabel}
                </button>
                <span>/</span>
                <span className="text-zinc-800 font-medium">{selectedProduct.name}</span>
              </nav>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-3">
                {selectedProduct.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-6">
                {selectedProduct.compareAtPrice > selectedProduct.price && (
                  <span className="text-lg line-through text-zinc-400">
                    {selectedProduct.compareAtPrice.toLocaleString()}৳
                  </span>
                )}
                <span style={{ color: colors.accent }} className="text-2xl font-bold">
                  {selectedProduct.price.toLocaleString()}৳
                </span>
              </div>

              {/* Clean Bullet Highlights (Matching Reference 2) */}
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 mb-8">
                {selectedProduct.highlights.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-zinc-900 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Square Size Selector Row */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Size :
                </span>
                <div className="flex items-center gap-2">
                  {SIZES.map((sz) => {
                    const active = pdpSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setPdpSize(sz)}
                        className={`w-9 h-9 text-xs font-bold border transition cursor-pointer ${
                          active
                            ? 'bg-zinc-950 text-white border-zinc-950'
                            : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-900'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper + ADD TO CART Row */}
              <div className="flex items-stretch gap-3 mb-3">
                <div className="flex items-center border border-zinc-300 bg-white">
                  <button
                    onClick={() => setPdpQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-3 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold">{pdpQty}</span>
                  <button
                    onClick={() => setPdpQty((q) => q + 1)}
                    className="px-3 py-3 text-zinc-600 hover:text-zinc-950 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(selectedProduct, pdpSize, pdpQty, false)}
                  className="flex-1 py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-zinc-900 text-xs font-bold uppercase tracking-[0.18em] transition cursor-pointer"
                >
                  ADD TO CART
                </button>
              </div>

              {/* Full-Width Primary ORDER NOW Button */}
              <button
                onClick={() => addToCart(selectedProduct, pdpSize, pdpQty, true)}
                style={{ backgroundColor: colors.accent }}
                className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-95 cursor-pointer mb-5"
              >
                ORDER NOW
              </button>

              {/* Size Guide Link */}
              <div className="pb-6 mb-6 border-b border-zinc-200">
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  <Ruler className="w-4 h-4" />
                  <span>Size guide</span>
                </button>
              </div>

              {/* Clean Metadata Footer */}
              <div className="space-y-1.5 text-xs text-zinc-500">
                <p>
                  <strong className="text-zinc-800">SKU:</strong> {selectedProduct.sku}
                </p>
                <p>
                  <strong className="text-zinc-800">Category:</strong>{' '}
                  {selectedProduct.categoryLabel}, Streetwear Archive
                </p>
                <p>
                  <strong className="text-zinc-800">Delivery:</strong> Inside Dhaka{' '}
                  {config.logistics.estimatedDeliveryDays.insideDhaka} (৳
                  {config.logistics.insideDhakaFee}) • Outside Dhaka{' '}
                  {config.logistics.estimatedDeliveryDays.outsideDhaka} (৳
                  {config.logistics.outsideDhakaFee})
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Clean Tabs (DESCRIPTION / ADDITIONAL INFORMATION / OUR POLICY) */}
          <div className="py-12 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-8 border-b border-zinc-200 mb-8">
              {[
                { id: 'DESCRIPTION', label: 'DESCRIPTION' },
                { id: 'ADDITIONAL', label: 'ADDITIONAL INFORMATION' },
                { id: 'POLICY', label: 'OUR POLICY' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPdpTab(tab.id)}
                  style={{
                    borderColor: pdpTab === tab.id ? colors.accent : 'transparent',
                  }}
                  className={`pb-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition cursor-pointer ${
                    pdpTab === tab.id ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-w-3xl mx-auto text-sm text-zinc-700 leading-relaxed space-y-6">
              {pdpTab === 'DESCRIPTION' && (
                <>
                  <p>{selectedProduct.description}</p>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-2">Product Details</h4>
                    <ul className="space-y-1.5 text-xs sm:text-sm">
                      {selectedProduct.highlights.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-1">Sizes Available</h4>
                    <p className="text-xs sm:text-sm">S | M | L | XL</p>
                  </div>
                </>
              )}

              {pdpTab === 'ADDITIONAL' && (
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm border border-zinc-200 p-6">
                  <div className="font-semibold text-zinc-900">Available Sizes</div>
                  <div>S (Chest 42"), M (Chest 44"), L (Chest 46"), XL (Chest 48")</div>
                  <div className="font-semibold text-zinc-900">Wash Care</div>
                  <div>Cold gentle machine wash inside out. Do not tumble dry or iron print.</div>
                  <div className="font-semibold text-zinc-900">Showroom Dispatch</div>
                  <div>{config.logistics.showroomAddress}</div>
                </div>
              )}

              {pdpTab === 'POLICY' && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <p>
                    <strong>1. Nationwide Cash on Delivery:</strong> Available across all 64
                    districts in Bangladesh via {config.courier.provider}. You may inspect the
                    garment in front of the delivery rider.
                  </p>
                  <p>
                    <strong>2. Easy Size Exchange:</strong> Instant size exchange within 3 days of
                    delivery if the garment remains unworn with original tags attached.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products 4-Column Wide Row */}
          <div className="pt-14">
            <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-900 mb-8">
              Related products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {PRODUCTS.filter((p) => p.id !== selectedProduct.id)
                .slice(0, 4)
                .map((rel) => renderEditorialCard(rel, false))}
            </div>
          </div>
        </main>
      ) : (
        /* ------------------------------------------------------------------
           HOME STOREFRONT VIEW (Driven by active homeSections)
        ------------------------------------------------------------------ */
        <main className="pb-24">
          {activeSections.length === 0 ? (
            <div className="max-w-lg mx-auto my-24 p-10 border border-zinc-200 text-center">
              <EyeOff className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
              <h3 className="text-base font-bold mb-1">All Storefront Sections Hidden</h3>
              <p className="text-xs text-zinc-500 mb-5">
                Re-enable sections inside StoreConfig Studio to display the storefront.
              </p>
              <button
                onClick={() => {
                  setIsStudioOpen(true);
                  setStudioTab('sections');
                }}
                style={{ backgroundColor: colors.accent }}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
              >
                Open Sections Manager
              </button>
            </div>
          ) : (
            activeSections.map((section) => {
              /* ------------------------------------------------------------
                 1. WIDE EDITORIAL HERO BANNER (Matches Reference 1 & 3)
              ------------------------------------------------------------ */
              if (section.type === 'HERO_CAROUSEL') {
                const variant = config.branding.heroVariant || 'CENTER';
                return (
                  <section
                    key={section.id}
                    className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-6 pb-12"
                  >
                    <div className="relative rounded-md overflow-hidden bg-zinc-950 text-white min-h-[460px] sm:min-h-[540px] flex items-center">
                      {/* Editorial Campaign Background Image */}
                      <img
                        src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1800&q=85"
                        alt={section.title}
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

                      {/* Content Container */}
                      <div
                        className={`relative z-10 w-full px-8 sm:px-16 py-16 ${
                          variant === 'CENTER' ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'
                        }`}
                      >
                        <p
                          style={{ color: colors.accent }}
                          className="text-xs font-bold uppercase tracking-[0.35em] mb-4"
                        >
                          {config.branding.storeName} // ARCHIVE
                        </p>
                        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[1.03] mb-4">
                          {section.title}
                        </h1>
                        <p className="text-sm sm:text-base text-zinc-300 tracking-wide mb-8">
                          {section.subtitle}
                        </p>
                        <div
                          className={`flex flex-wrap gap-4 ${
                            variant === 'CENTER' ? 'justify-center' : 'justify-start'
                          }`}
                        >
                          <a
                            href="#collection-showcase"
                            className="px-8 py-3.5 bg-white text-zinc-950 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition"
                          >
                            SHOP NOW
                          </a>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }

              /* ------------------------------------------------------------
                 2. WIDE EDITORIAL PRODUCT SECTIONS (CATEGORY_GRID & SLIDER)
              ------------------------------------------------------------ */
              if (section.type === 'CATEGORY_GRID' || section.type === 'CATEGORY_SLIDER') {
                const sectionProducts = PRODUCTS.filter((p) => {
                  if (
                    activeCollectionFilter !== 'ALL' &&
                    p.collectionSlug !== activeCollectionFilter
                  ) {
                    return false;
                  }
                  if (
                    searchQuery.trim() &&
                    !p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ) {
                    return false;
                  }
                  return p.collectionSlug === section.collectionSlug;
                });

                if (sectionProducts.length === 0) return null;

                // Use high-contrast dark gallery band for CATEGORY_SLIDER (like Reference 1 middle dark section)
                const isDarkBand = section.type === 'CATEGORY_SLIDER';

                return (
                  <section
                    id="collection-showcase"
                    key={section.id}
                    className={
                      isDarkBand
                        ? 'bg-zinc-950 text-white py-20 my-12'
                        : 'py-14 max-w-[1360px] mx-auto px-4 sm:px-8'
                    }
                  >
                    <div className={isDarkBand ? 'max-w-[1360px] mx-auto px-4 sm:px-8' : ''}>
                      {/* Section Header (Matches Reference 3: Left Title + Right VIEW ALL button) */}
                      <div className="flex items-end justify-between mb-10 pb-4 border-b border-zinc-200/20">
                        <div>
                          <h2
                            className={`text-xl sm:text-2xl font-bold uppercase tracking-[0.12em] ${
                              isDarkBand ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {section.title}
                          </h2>
                          <p
                            className={`text-xs mt-1 tracking-wide ${
                              isDarkBand ? 'text-zinc-400' : 'text-zinc-500'
                            }`}
                          >
                            {section.subtitle}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setActiveCollectionFilter(
                              activeCollectionFilter === section.collectionSlug
                                ? 'ALL'
                                : section.collectionSlug
                            )
                          }
                          className={`px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] border transition cursor-pointer ${
                            isDarkBand
                              ? 'border-zinc-700 text-white hover:bg-white hover:text-zinc-950'
                              : 'border-zinc-900 text-zinc-900 hover:bg-zinc-950 hover:text-white'
                          }`}
                        >
                          {activeCollectionFilter === section.collectionSlug
                            ? 'SHOW ALL'
                            : 'VIEW ALL'}
                        </button>
                      </div>

                      {/* Wide 4-Column Zero-Clutter Portrait Card Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                        {sectionProducts.map((product) =>
                          renderEditorialCard(product, isDarkBand)
                        )}
                      </div>
                    </div>
                  </section>
                );
              }

              /* ------------------------------------------------------------
                 3. FULL-WIDTH EDITORIAL PROMO BANNER
              ------------------------------------------------------------ */
              if (section.type === 'PROMO_BANNER') {
                return (
                  <section
                    key={section.id}
                    className="max-w-[1360px] mx-auto px-4 sm:px-8 my-12"
                  >
                    <div className="relative overflow-hidden bg-stone-100 border border-zinc-200 px-8 py-14 sm:px-16 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-2 text-center md:text-left">
                        <p
                          style={{ color: colors.accent }}
                          className="text-[11px] font-bold uppercase tracking-[0.28em]"
                        >
                          {config.courier.provider} EXPRESS DISPATCH
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 uppercase">
                          {section.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-600">
                          {section.subtitle} • Inside Dhaka ৳{config.logistics.insideDhakaFee} (
                          {config.logistics.estimatedDeliveryDays.insideDhaka}) • Outside Dhaka ৳
                          {config.logistics.outsideDhakaFee} (
                          {config.logistics.estimatedDeliveryDays.outsideDhaka})
                        </p>
                      </div>

                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-8 py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition shrink-0 cursor-pointer"
                      >
                        VIEW BAG & SHIPPING
                      </button>
                    </div>
                  </section>
                );
              }

              return null;
            })
          )}
        </main>
      )}

      {/* ====================================================================
          4. HIGH-CONTRAST BLACK LUXURY FOOTER (Matches Reference Images)
      ==================================================================== */}
      <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-12 text-xs border-t border-zinc-900">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
          <div className="space-y-3">
            <span
              style={{ color: colors.accent }}
              className="text-xl font-serif font-bold tracking-[0.2em] uppercase block"
            >
              {config.branding.storeName}
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {config.branding.tagline}. Crafted with architectural precision for everyday
              confidence and timeless comfort.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-widest mb-3">
              SHOP ADDRESS
            </h4>
            <p>
              <strong className="text-zinc-200">Address:</strong>{' '}
              {config.logistics.showroomAddress}
            </p>
            <p>
              <strong className="text-zinc-200">Phone:</strong> {config.logistics.supportPhone}
            </p>
            <p>
              <strong className="text-zinc-200">WhatsApp:</strong> +
              {config.logistics.whatsappNumber}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-widest mb-3">
              IMPORTANT LINKS
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('HOME')}
                  className="hover:text-white transition"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('HOME')}
                  className="hover:text-white transition"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('HOME')}
                  className="hover:text-white transition"
                >
                  Return & Exchange Policy
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-widest mb-3">
              QUICK LINKS
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('HOME');
                    setActiveCollectionFilter('ALL');
                  }}
                  className="hover:text-white transition"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('HOME');
                    setActiveCollectionFilter('hoodies');
                  }}
                  className="hover:text-white transition"
                >
                  450 GSM Hoodies
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('HOME');
                    setActiveCollectionFilter('t-shirts');
                  }}
                  className="hover:text-white transition"
                >
                  240 GSM Oversized Tees
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© 2026 {config.branding.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {config.payment.cod.enabled && <span>COD (64 Districts)</span>}
            {config.payment.manualBkash.enabled && <span>• bKash</span>}
            {config.payment.manualNagad.enabled && <span>• Nagad</span>}
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Concierge Button (Bottom Right like Reference) */}
      <a
        href={`https://wa.me/${config.logistics.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-emerald-500 text-white shadow-xl flex items-center justify-center hover:scale-105 transition"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* ====================================================================
          SIZE GUIDE MODAL
      ==================================================================== */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 max-w-lg w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200">
              <h3 className="text-sm font-bold uppercase tracking-widest">
                VectroFit Garment Measurements (Inches)
              </h3>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase">
                  <th className="py-2.5">Size</th>
                  <th className="py-2.5">Chest</th>
                  <th className="py-2.5">Length</th>
                  <th className="py-2.5">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="py-2.5 font-bold">S</td>
                  <td className="py-2.5">42"</td>
                  <td className="py-2.5">27.5"</td>
                  <td className="py-2.5">20.5"</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">M</td>
                  <td className="py-2.5">44"</td>
                  <td className="py-2.5">28.5"</td>
                  <td className="py-2.5">21.5"</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">L</td>
                  <td className="py-2.5">46"</td>
                  <td className="py-2.5">29.5"</td>
                  <td className="py-2.5">22.5"</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">XL</td>
                  <td className="py-2.5">48"</td>
                  <td className="py-2.5">30.5"</td>
                  <td className="py-2.5">23.5"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. CLEAN SLIDE-OVER BANGLADESH CART & CHECKOUT DRAWER
      ==================================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-zinc-900 h-full flex flex-col justify-between shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Shopping Bag & Checkout
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Free Shipping over ৳{config.logistics.freeShippingThreshold.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setOrderSuccess(null);
                }}
                className="p-2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {orderSuccess ? (
                <div className="p-6 border border-zinc-200 bg-zinc-50 text-center space-y-4">
                  <div
                    style={{ backgroundColor: colors.accent }}
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center mx-auto"
                  >
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold uppercase">Order Confirmed</h3>
                  <div className="text-xs space-y-1.5 text-left bg-white p-4 border border-zinc-200">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Order ID:</span>
                      <span className="font-bold">{orderSuccess.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Steadfast ID:</span>
                      <span className="font-mono">{orderSuccess.consignmentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Delivery Zone:</span>
                      <span>
                        {orderSuccess.zone} ({orderSuccess.eta})
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-100">
                      <span className="text-zinc-500">Total Payable:</span>
                      <span className="font-bold">৳{orderSuccess.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setIsCartOpen(false);
                    }}
                    className="w-full py-3 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-400">
                  Your shopping bag is currently empty.
                </div>
              ) : (
                <>
                  {/* Line Items */}
                  <div className="divide-y divide-zinc-200">
                    {cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className="py-3.5 flex items-center gap-3.5"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover bg-zinc-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Size: {item.size}</p>
                          <p
                            style={{ color: colors.accent }}
                            className="text-xs font-bold mt-1"
                          >
                            {(item.product.price * item.quantity).toLocaleString()}৳
                          </p>
                        </div>
                        <div className="flex items-center border border-zinc-200">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.size, -1)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.size, 1)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Zone */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Delivery Area
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryZone('insideDhaka')}
                        className={`p-3 border text-left text-xs cursor-pointer ${
                          deliveryZone === 'insideDhaka'
                            ? 'border-zinc-950 bg-zinc-50 font-bold'
                            : 'border-zinc-200'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>Inside Dhaka</span>
                          <span>৳{config.logistics.insideDhakaFee}</span>
                        </div>
                        <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                          {config.logistics.estimatedDeliveryDays.insideDhaka}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryZone('outsideDhaka')}
                        className={`p-3 border text-left text-xs cursor-pointer ${
                          deliveryZone === 'outsideDhaka'
                            ? 'border-zinc-950 bg-zinc-50 font-bold'
                            : 'border-zinc-200'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>Outside Dhaka</span>
                          <span>৳{config.logistics.outsideDhakaFee}</span>
                        </div>
                        <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                          {config.logistics.estimatedDeliveryDays.outsideDhaka}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Shipping Form */}
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Recipient Details
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (017XXXXXXXX)"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900"
                    />
                    <textarea
                      rows={2}
                      placeholder="Full Delivery Address"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 border border-zinc-300 text-xs focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  {/* Payment Selector */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {config.payment.cod.enabled && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer ${
                            paymentMethod === 'cod'
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-200 text-zinc-700'
                          }`}
                        >
                          COD
                        </button>
                      )}
                      {config.payment.manualBkash.enabled && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('manualBkash')}
                          className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer ${
                            paymentMethod === 'manualBkash'
                              ? 'border-pink-600 bg-pink-600 text-white'
                              : 'border-zinc-200 text-zinc-700'
                          }`}
                        >
                          bKash
                        </button>
                      )}
                      {config.payment.manualNagad.enabled && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('manualNagad')}
                          className={`py-2.5 px-2 border text-[11px] font-bold cursor-pointer ${
                            paymentMethod === 'manualNagad'
                              ? 'border-orange-600 bg-orange-600 text-white'
                              : 'border-zinc-200 text-zinc-700'
                          }`}
                        >
                          Nagad
                        </button>
                      )}
                    </div>

                    {(paymentMethod === 'manualBkash' || paymentMethod === 'manualNagad') && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Send Money Number:</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                config.payment[paymentMethod].number
                              );
                              setCopiedPhone(true);
                              setTimeout(() => setCopiedPhone(false), 1500);
                            }}
                            className="inline-flex items-center gap-1 font-mono font-bold text-zinc-900"
                          >
                            <span>{config.payment[paymentMethod].number}</span>
                            {copiedPhone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Enter TrxID"
                          value={customerForm.trxId}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              trxId: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-zinc-300 font-mono text-xs uppercase"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Totals */}
            {!orderSuccess && cart.length > 0 && (
              <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()}৳</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Delivery</span>
                    <span>{isFreeShipping ? 'FREE' : `${deliveryFee}৳`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                    <span>Total</span>
                    <span>{grandTotal.toLocaleString()}৳</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  style={{ backgroundColor: colors.accent }}
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white cursor-pointer"
                >
                  CONFIRM ORDER • {grandTotal.toLocaleString()}৳
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          6. LIVE STORECONFIG STUDIO DRAWER (/api/store-config Simulator)
      ==================================================================== */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-zinc-950 text-zinc-100 h-full flex flex-col justify-between shadow-2xl">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest">
                  StoreConfig Singleton Studio
                </h2>
                <p className="text-[11px] font-mono text-zinc-400">
                  GET & PUT /api/store-config
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetSeed}
                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Seed</span>
                </button>
                <button
                  onClick={handleSimulatePut}
                  style={{ backgroundColor: colors.accent }}
                  className="px-3 py-1.5 rounded text-[11px] font-bold uppercase text-white flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>PUT Save</span>
                </button>
                <button
                  onClick={() => setIsStudioOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 bg-zinc-900/50 border-b border-zinc-800 flex gap-2 overflow-x-auto text-xs">
              {[
                { id: 'branding', label: 'Branding', icon: Sliders },
                { id: 'sections', label: 'Sections', icon: Layers },
                { id: 'logistics', label: 'Logistics', icon: Truck },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'json', label: 'Raw JSON', icon: Code2 },
              ].map((t) => {
                const Icon = t.icon;
                const active = studioTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setStudioTab(t.id)}
                    style={{
                      borderColor: active ? colors.accent : 'transparent',
                      color: active ? '#FFF' : '#A1A1AA',
                    }}
                    className="flex items-center gap-1.5 px-3 py-2.5 border-b-2 font-semibold whitespace-nowrap"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Studio Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {studioTab === 'branding' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={config.branding.storeName}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          branding: { ...p.branding, storeName: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={config.branding.tagline}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          branding: { ...p.branding, tagline: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white"
                    />
                  </div>

                  {/* Quick Accent Presets */}
                  <div>
                    <label className="block text-zinc-400 mb-2">
                      Luxury Accent Color (`branding.colors.accent`)
                    </label>
                    <div className="flex gap-2">
                      {[
                        { label: 'AQVEN Gold', hex: '#B8860B' },
                        { label: 'Vectro Crimson', hex: '#E11D48' },
                        { label: 'Pure Obsidian', hex: '#111111' },
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          onClick={() =>
                            setConfig((p) => ({
                              ...p,
                              branding: {
                                ...p.branding,
                                colors: { ...p.branding.colors, accent: preset.hex },
                              },
                            }))
                          }
                          className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 flex items-center gap-2"
                        >
                          <span
                            style={{ backgroundColor: preset.hex }}
                            className="w-3.5 h-3.5 rounded-full"
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {studioTab === 'sections' && (
                <div className="space-y-3">
                  {[...config.homeSections]
                    .sort((a, b) => a.order - b.order)
                    .map((sec, idx, arr) => (
                      <div
                        key={sec.id}
                        className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-zinc-300">
                            #{sec.order} {sec.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => moveSectionOrder(sec.id, 'up')}
                              className="p-1 bg-zinc-800 rounded disabled:opacity-30"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === arr.length - 1}
                              onClick={() => moveSectionOrder(sec.id, 'down')}
                              className="p-1 bg-zinc-800 rounded disabled:opacity-30"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setConfig((p) => ({
                                  ...p,
                                  homeSections: p.homeSections.map((s) =>
                                    s.id === sec.id ? { ...s, isActive: !s.isActive } : s
                                  ),
                                }))
                              }
                              className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                                sec.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {sec.isActive ? 'ACTIVE' : 'HIDDEN'}
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) =>
                            setConfig((p) => ({
                              ...p,
                              homeSections: p.homeSections.map((s) =>
                                s.id === sec.id ? { ...s, title: e.target.value } : s
                              ),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-white"
                        />
                      </div>
                    ))}
                </div>
              )}

              {studioTab === 'logistics' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">Inside Dhaka (৳)</label>
                    <input
                      type="number"
                      value={config.logistics.insideDhakaFee}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          logistics: {
                            ...p.logistics,
                            insideDhakaFee: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Outside Dhaka (৳)</label>
                    <input
                      type="number"
                      value={config.logistics.outsideDhakaFee}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          logistics: {
                            ...p.logistics,
                            outsideDhakaFee: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Free Threshold (৳)</label>
                    <input
                      type="number"
                      value={config.logistics.freeShippingThreshold}
                      onChange={(e) =>
                        setConfig((p) => ({
                          ...p,
                          logistics: {
                            ...p.logistics,
                            freeShippingThreshold: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800"
                    />
                  </div>
                </div>
              )}

              {studioTab === 'payments' && (
                <div className="space-y-2.5">
                  {[
                    { key: 'cod', label: 'Cash on Delivery (64 Districts)' },
                    { key: 'manualBkash', label: 'Manual bKash (Personal)' },
                    { key: 'manualNagad', label: 'Manual Nagad (Personal)' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded bg-zinc-900 border border-zinc-800"
                    >
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={config.payment[item.key]?.enabled || false}
                        onChange={(e) =>
                          setConfig((p) => ({
                            ...p,
                            payment: {
                              ...p.payment,
                              [item.key]: {
                                ...p.payment[item.key],
                                enabled: e.target.checked,
                              },
                            },
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
              )}

              {studioTab === 'json' && (
                <pre className="p-4 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {JSON.stringify(config, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}