import { S3Client } from '@aws-sdk/client-s3';

/**
 * ============================================================================
 * LESSON: Cloudflare R2 Client (S3-Compatible Protocol)
 * ============================================================================
 * 
 * WHY IS THIS AN S3 CLIENT?
 * Cloudflare R2 intentionally designed its API to be 100% compatible with 
 * Amazon Web Services (AWS) S3.
 * 
 * This means we use Amazon's official `@aws-sdk/client-s3` library, but point 
 * the `endpoint` to Cloudflare's server:
 * https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
 */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

export const r2 = new S3Client({
  region: 'auto', // Cloudflare R2 automatically handles region routing
  endpoint: R2_ACCOUNT_ID
    ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});
