import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from './r2';

/**
 * ============================================================================
 * LESSON: Cloudflare R2 Storage Service (S3 Compatible)
 * ============================================================================
 * 
 * HOW AN IMAGE UPLOAD WORKS:
 * 1. Admin selects image in browser (e.g. "tshirt.webp")
 * 2. Next.js API receives file buffer in server
 * 3. `uploadToR2()` sends `PutObjectCommand` to Cloudflare R2 bucket
 * 4. R2 stores file and we construct public URL:
 *    https://cdn-demo.vectorfitlab.com/tshirt.webp
 * 5. MongoDB stores ONLY: { url, key: "tshirt.webp" }
 */

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ecom-demo';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a binary buffer to Cloudflare R2
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  // Generate a collision-resistant unique key
  const uniqueKey = `products/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueKey,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await r2.send(command);

  // Clean trailing slashes
  const baseUrl = PUBLIC_DOMAIN.replace(/\/$/, '');
  const publicUrl = `${baseUrl}/${uniqueKey}`;

  return {
    url: publicUrl,
    key: uniqueKey,
  };
}

/**
 * Delete an object from Cloudflare R2 by its key
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2.send(command);
}
