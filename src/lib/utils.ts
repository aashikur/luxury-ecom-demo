export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

const VIDEO_EXTENSIONS_REGEX = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return VIDEO_EXTENSIONS_REGEX.test(url);
}

export function getSafeImageUrl(
  url?: string | null,
  fallback = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
): string {
  if (!url || isVideoUrl(url)) {
    return fallback;
  }
  return url;
}

export function getProductPrimaryImage(
  product?: {
    media?: Array<{ url?: string; thumbnailUrl?: string; type?: string }>;
    images?: Array<{ url?: string }>;
  } | null,
  fallback = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
): string {
  if (!product) return fallback;

  // 1. Check media items for first valid IMAGE
  if (Array.isArray(product.media) && product.media.length > 0) {
    const firstImage = product.media.find(
      (m) => m?.url && m.type !== 'VIDEO' && !isVideoUrl(m.url)
    );
    if (firstImage?.url) return firstImage.url;

    // 2. If all media are videos, check if any video has a valid thumbnailUrl
    const videoWithThumb = product.media.find(
      (m) => m?.thumbnailUrl && !isVideoUrl(m.thumbnailUrl)
    );
    if (videoWithThumb?.thumbnailUrl) return videoWithThumb.thumbnailUrl;
  }

  // 3. Fallback to legacy images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstLegacyImg = product.images.find(
      (img) => img?.url && !isVideoUrl(img.url)
    );
    if (firstLegacyImg?.url) return firstLegacyImg.url;
  }

  return fallback;
}
