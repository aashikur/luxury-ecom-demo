# 12. Technical SEO, Metadata Architecture & Crawler Governance

> **Status:** Tier 2 Domain Architecture Specification  
> **Target:** Googlebot / Bingbot Crawl Budget Efficiency, Dynamic Rich Snippets (JSON-LD), Zero Duplicate Content & Social OG Previews  
> **Applies to:** Next.js App Router Storefront, Dynamic PDPs (`/products/[slug]`), Taxonomies (`/category/[slug]`, `/brand/[slug]`), and Admin Shielding  

---

## 1. Architecture Overview & Core Principles

Production e-commerce SEO requires strict separation between **Storefront Crawlable Pages** and **Protected Admin/Transactional Paths**. The system is built around 5 technical pillars:

1. **Crawl Budget & Crawler Governance (`robots.ts`):** Explicitly permit public storefront paths while blocking `/admin/`, `/api/`, `/checkout/`, `/account/`, and unbounded query parameter variations (`?filter=`, `?sort=`).
2. **Dynamic Live Sitemap (`sitemap.ts`):** Auto-generated XML sitemap querying active products (`isActive: true`), categories, and marketing collections with exact `lastModified` timestamps and priorities.
3. **Dynamic Metadata & Canonical Enforcement (`generateMetadata`):** Dynamic `<title>`, `<meta name="description">`, Open Graph cards, Twitter cards, and self-referencing canonical URLs for all dynamic routes to prevent duplicate content penalties from faceted filters.
4. **Structured Data / Rich Results (JSON-LD Schema.org):** Inline `application/ld+json` injecting `Product`, `Offer`, `BreadcrumbList`, and `Organization` schemas so Google Search displays live price (BDT), stock status (`InStock`/`OutOfStock`), and brand identity.
5. **Admin Shielding & 404/410 Handling:** Enforce `robots: { index: false, follow: false }` and HTTP response headers `X-Robots-Tag: noindex, nofollow` across all `/admin/**` routes. Discontinued products return proper HTTP 404/410 (never soft-404 200 OKs).

---

## 2. Technical Implementation Specifications

### A. App Router `robots.ts` (`src/app/robots.ts`)
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auremluxury.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/checkout/',
          '/account/',
          '/*?*sort=',     // Prevent crawl budget dilution on faceted sorting
          '/*?*filter=',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### B. Dynamic Product & Taxonomy `sitemap.ts` (`src/app/sitemap.ts`)
```typescript
import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auremluxury.com';

  await connectDB();
  const products = await Product.find({ isActive: true })
    .select('slug updatedAt')
    .lean();

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ];
}
```

### C. Dynamic Metadata & Canonical (`generateMetadata`)
Must be exported from all dynamic routes (`src/app/products/[slug]/page.tsx`, `src/app/category/[slug]/page.tsx`):
```typescript
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    return { title: 'Product Not Found | Aurem Luxury' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auremluxury.com';
  const canonicalUrl = `${siteUrl}/products/${product.slug}`;
  const ogImage = product.images?.[0]?.url || `${siteUrl}/og-image.jpg`;

  return {
    title: `${product.title} | Aurem Luxury`,
    description: product.summary || product.description?.slice(0, 160),
    alternates: {
      canonical: canonicalUrl, // Enforce canonical to prevent duplicate penalty
    },
    openGraph: {
      title: product.title,
      description: product.summary || product.description?.slice(0, 160),
      url: canonicalUrl,
      siteName: 'Aurem Luxury',
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.summary || product.description?.slice(0, 160),
      images: [ogImage],
    },
  };
}
```

### D. JSON-LD Rich Snippet Component (`src/components/storefront/ProductJsonLd.tsx`)
```tsx
export default function ProductJsonLd({ product }: { product: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.map((img: any) => img.url),
    description: product.summary || product.description,
    sku: product.sku || product._id?.toString(),
    brand: {
      '@type': 'Brand',
      name: 'Aurem Luxury',
    },
    offers: {
      '@type': 'Offer',
      url: `https://auremluxury.com/products/${product.slug}`,
      priceCurrency: 'BDT',
      price: product.pricing?.salePrice || product.pricing?.basePrice,
      availability:
        product.inventory?.quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Aurem Luxury',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### E. Admin Layout Indexing Shield (`src/app/(admin)/layout.tsx`)
```typescript
export const metadata: Metadata = {
  title: 'Admin Dashboard | Aurem Luxury',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
```

---

## 3. SEO Governance Checklist for Future Tasks

1. **New Storefront Routes:** Any public route (`/products/[slug]`, `/category/[slug]`, `/brand/[slug]`, `/collections/[slug]`) MUST implement `generateMetadata` and return a canonical URL.
2. **Social Previews:** Ensure every page has 1200x630 OG image representation fallback.
3. **Core Web Vitals:** First catalog image and PDP hero image must use `<Image priority sizes="..." />` to protect LCP scores.
4. **Zero Soft 404s:** Use Next.js `notFound()` which sets real HTTP status 404.
5. **No Broken Links:** When updating slugs in Admin, keep old slug redirect mapping or log audit alert.
