/**
 * ============================================================================
 * Zero-Dependency Client-Side Image Compressor (HTML5 Canvas Engine)
 * ============================================================================
 * 
 * Takes raw heavy photos (e.g. 5MB-15MB DSLR / iPhone RAW / JPEG / PNG)
 * and resizes/compresses them into ultra-sharp, lightweight WebP in browser memory
 * before sending to Cloudflare R2 or S3.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.82)
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export interface CompressionResult {
  file: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export async function compressImageInBrowser(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 2133, // Default 3:4 boundary
    quality = 0.82,
    outputFormat = 'image/webp',
  } = options;

  const originalSizeKB = Math.round(file.size / 1024);

  // SVG and GIF are vector/animated; do not raster compress
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      savingsPercent: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;

      // Scale down if dimensions exceed bounds while maintaining natural aspect ratio
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Draw onto HTML5 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas 2D context unavailable'));
      }

      // High-quality downsampling interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background for transparent PNGs converting to JPEG/WebP
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Export to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to encode image to blob'));
          }

          const compressedSizeKB = Math.round(blob.size / 1024);
          const savingsPercent =
            originalSizeKB > 0
              ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100))
              : 0;

          // Generate clean filename with appropriate extension
          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const extension = outputFormat === 'image/webp' ? 'webp' : outputFormat === 'image/png' ? 'png' : 'jpg';
          const newFileName = `${originalName}.${extension}`;

          const compressedFile = new File([blob], newFileName, {
            type: outputFormat,
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            originalSizeKB,
            compressedSizeKB,
            savingsPercent,
            width: targetWidth,
            height: targetHeight,
          });
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}
