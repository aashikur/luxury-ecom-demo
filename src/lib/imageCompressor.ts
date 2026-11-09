/**
 * ============================================================================
 * Intelligent Rule-Based Client-Side Image Optimization Engine (HTML5 Canvas)
 * ============================================================================
 * 
 * Rules:
 * - Target format: image/webp
 * - Max dimension cap: 1200px (preserves 1:1, 3:4, 4:5, 16:9 aspect ratios)
 * - Target weight: strictly under 200 KB (ideal 80 KB - 180 KB)
 * 
 * Matrix:
 * - Case A (< 100 KB):
 *   * WebP & <= 1200px: BYPASS completely
 *   * > 1200px: Downscale to 1200px, quality 0.90
 *   * Non-WebP: Convert to WebP, quality 0.92
 * - Case B (100 KB - 200 KB):
 *   * WebP & <= 1200px: BYPASS
 *   * > 1200px or non-WebP: Downscale to 1200px, quality 0.90
 * - Case C (> 200 KB, e.g. 500 KB - 9 MB+):
 *   * Downscale if > 1200px
 *   * Dynamic quality: 200 KB - 3 MB: 0.82 | > 3 MB: 0.78
 *   * Strict target: under 180 KB
 * 
 * Safeguards:
 * - Never upscale
 * - Return original if compressed is larger
 * - Memory cleanup (revokeObjectURL, canvas reset)
 */

export interface CompressionResult {
  file: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercent: number;
  width: number;
  height: number;
  bypassed: boolean;
  ruleApplied:
    | 'CASE_A_BYPASS'
    | 'CASE_A_DOWNSCALE'
    | 'CASE_A_CONVERT'
    | 'CASE_B_BYPASS'
    | 'CASE_B_OPTIMIZE'
    | 'CASE_C_DYNAMIC'
    | 'FALLBACK_ORIGINAL';
  feedback: string;
}

export function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(kb)} KB`;
}

/**
 * Helper to export canvas to a WebP blob with a given quality
 */
function canvasToBlobAsync(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
  });
}

/**
 * Main Optimization Engine
 */
export async function optimizeImageRuleBased(
  file: File,
  maxDimensionCap: number = 1200
): Promise<CompressionResult> {
  const originalBytes = file.size;
  const originalSizeKB = Math.round(originalBytes / 1024);
  const isWebP = file.type === 'image/webp';

  // SVG / GIF bypass directly
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      savingsPercent: 0,
      width: 0,
      height: 0,
      bypassed: true,
      ruleApplied: 'FALLBACK_ORIGINAL',
      feedback: `${formatFileSize(originalSizeKB)} ${file.type.split('/')[1]?.toUpperCase()} (Preserved)`,
    };
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      try {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const maxDimension = Math.max(naturalWidth, naturalHeight);

        // --------------------------------------------------------------------
        // 1. Calculate Target Dimensions (Never upscale small images)
        // --------------------------------------------------------------------
        let targetWidth = naturalWidth;
        let targetHeight = naturalHeight;

        if (maxDimension > maxDimensionCap) {
          const scaleFactor = maxDimensionCap / maxDimension;
          targetWidth = Math.round(naturalWidth * scaleFactor);
          targetHeight = Math.round(naturalHeight * scaleFactor);
        }

        const needsDownscale = maxDimension > maxDimensionCap;

        // --------------------------------------------------------------------
        // 2. Evaluate Conditional Rule Matrix
        // --------------------------------------------------------------------
        let ruleApplied: CompressionResult['ruleApplied'];
        let initialQuality: number;
        let shouldBypass = false;

        if (originalSizeKB < 100) {
          // --- Case A (< 100 KB) ---
          if (isWebP && !needsDownscale) {
            shouldBypass = true;
            ruleApplied = 'CASE_A_BYPASS';
            initialQuality = 1.0;
          } else if (needsDownscale) {
            ruleApplied = 'CASE_A_DOWNSCALE';
            initialQuality = 0.90;
          } else {
            // Non-WebP small file (< 100 KB)
            ruleApplied = 'CASE_A_CONVERT';
            initialQuality = 0.92;
          }
        } else if (originalSizeKB <= 200) {
          // --- Case B (100 KB – 200 KB) ---
          if (isWebP && !needsDownscale) {
            shouldBypass = true;
            ruleApplied = 'CASE_B_BYPASS';
            initialQuality = 1.0;
          } else {
            ruleApplied = 'CASE_B_OPTIMIZE';
            initialQuality = 0.90;
          }
        } else {
          // --- Case C (> 200 KB, e.g. 500 KB to 9 MB+) ---
          ruleApplied = 'CASE_C_DYNAMIC';
          // 200 KB – 3 MB: quality 0.82 | > 3 MB: quality 0.78
          initialQuality = originalSizeKB > 3072 ? 0.78 : 0.82;
        }

        // --------------------------------------------------------------------
        // 3. Early Bypass Return (Zero re-compression, zero quality loss)
        // --------------------------------------------------------------------
        if (shouldBypass) {
          URL.revokeObjectURL(objectUrl);
          return resolve({
            file,
            originalSizeKB,
            compressedSizeKB: originalSizeKB,
            savingsPercent: 0,
            width: naturalWidth,
            height: naturalHeight,
            bypassed: true,
            ruleApplied,
            feedback: `${formatFileSize(originalSizeKB)} (Preserved - Already optimal)`,
          });
        }

        // --------------------------------------------------------------------
        // 4. Render to Canvas
        // --------------------------------------------------------------------
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          return reject(new Error('HTML5 Canvas 2D context is unavailable'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Memory cleanup of source image
        URL.revokeObjectURL(objectUrl);

        // --------------------------------------------------------------------
        // 5. First Pass Export to WebP
        // --------------------------------------------------------------------
        let blob = await canvasToBlobAsync(canvas, initialQuality);
        if (!blob) {
          canvas.width = 0;
          canvas.height = 0;
          return reject(new Error('Canvas failed to encode image/webp blob'));
        }

        let compressedBytes = blob.size;
        let compressedSizeKB = Math.round(compressedBytes / 1024);

        // --------------------------------------------------------------------
        // 6. Case C Enforcement: Target strictly within 80 KB – 180 KB
        // --------------------------------------------------------------------
        if (originalSizeKB > 200 && compressedSizeKB > 180) {
          // Adaptive second pass down to quality 0.72
          const secondPassBlob = await canvasToBlobAsync(canvas, 0.72);
          if (secondPassBlob && secondPassBlob.size < compressedBytes) {
            blob = secondPassBlob;
            compressedBytes = secondPassBlob.size;
            compressedSizeKB = Math.round(compressedBytes / 1024);
          }

          // If still over 190 KB on ultra-dense detail, third pass at 0.68
          if (compressedSizeKB > 190) {
            const thirdPassBlob = await canvasToBlobAsync(canvas, 0.68);
            if (thirdPassBlob && thirdPassBlob.size < compressedBytes) {
              blob = thirdPassBlob;
              compressedBytes = thirdPassBlob.size;
              compressedSizeKB = Math.round(compressedBytes / 1024);
            }
          }
        }

        // Clean up canvas memory
        canvas.width = 0;
        canvas.height = 0;

        // --------------------------------------------------------------------
        // 7. Safeguard: If output is larger than original, return original
        // --------------------------------------------------------------------
        if (compressedBytes >= originalBytes) {
          return resolve({
            file,
            originalSizeKB,
            compressedSizeKB: originalSizeKB,
            savingsPercent: 0,
            width: naturalWidth,
            height: naturalHeight,
            bypassed: true,
            ruleApplied: 'FALLBACK_ORIGINAL',
            feedback: `${formatFileSize(originalSizeKB)} (Preserved - Output was not smaller)`,
          });
        }

        // --------------------------------------------------------------------
        // 8. Generate WebP File and Detailed Feedback Stats
        // --------------------------------------------------------------------
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const newFileName = `${baseName}.webp`;

        const optimizedFile = new File([blob], newFileName, {
          type: 'image/webp',
          lastModified: Date.now(),
        });

        const savingsPercent = Math.max(
          1,
          Math.round(((originalBytes - compressedBytes) / originalBytes) * 100)
        );

        const feedback = `${formatFileSize(originalSizeKB)} ➔ ${formatFileSize(compressedSizeKB)} (-${savingsPercent}%)`;

        resolve({
          file: optimizedFile,
          originalSizeKB,
          compressedSizeKB,
          savingsPercent,
          width: targetWidth,
          height: targetHeight,
          bypassed: false,
          ruleApplied,
          feedback,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image: "${file.name}"`));
    };

    img.src = objectUrl;
  });
}
