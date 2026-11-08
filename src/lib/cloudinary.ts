import { v2 as cloudinary } from 'cloudinary';

/**
 * ============================================================================
 * LESSON: Cloudinary SDK Configuration (Singleton)
 * ============================================================================
 * 
 * WHY IS THIS NEEDED?
 * The Cloudinary SDK needs our credentials (cloud_name, api_key, api_secret) 
 * before it can sign upload/delete requests.
 * 
 * By configuring it once here in `src/lib/cloudinary.ts`, any API route or server 
 * action can import `cloudinary` without configuring it repeatedly (DRY principle).
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

export default cloudinary;
