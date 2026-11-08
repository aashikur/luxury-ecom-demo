import type { NextConfig } from "next";

/**
 * ============================================================================
 * LESSON: Next.js Image Optimization & Remote Domains
 * ============================================================================
 * 
 * WHY IS THIS NEEDED?
 * Next.js protects your users by blocking images from external domains unless 
 * explicitly whitelisted here in `remotePatterns`.
 * 
 * We whitelist:
 * 1. Cloudflare R2 custom domain (cdn-demo.vectorfitlab.com)
 * 2. Cloudflare R2 dev domains (*.r2.dev)
 * 3. Cloudinary CDN (res.cloudinary.com)
 */

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-demo.vectorfitlab.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
