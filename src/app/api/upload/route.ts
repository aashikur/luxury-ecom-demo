import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, deleteFromR2 } from '@/lib/storage';

/**
 * ============================================================================
 * LESSON: Next.js App Router Media Upload Handler (Cloudflare R2)
 * ============================================================================
 * 
 * 1. FORM DATA HANDLING:
 *    NextRequest.formData() natively parses multipart/form-data without needing 
 *    old libraries like multer or formidable.
 * 
 * 2. BUFFER CONVERSION:
 *    File.arrayBuffer() reads binary stream, converted to Node.js Buffer for S3 upload.
 * 
 * 3. RESPONSE:
 *    Returns { success: true, url, key } ready to be stored in MongoDB Product or StoreConfig.
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in request' },
        { status: 400 }
      );
    }

    // Security check: validate MIME type (allow images and webp/mp4)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
      'video/mp4',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed: WebP, JPEG, PNG, SVG, MP4.`,
        },
        { status: 400 }
      );
    }

    // Convert file to binary buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to Cloudflare R2 bucket
    const result = await uploadToR2(buffer, file.name, file.type);

    return NextResponse.json(
      {
        success: true,
        message: 'File successfully uploaded to Cloudflare R2',
        url: result.url,
        key: result.key,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Upload Error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Clean up an asset from Cloudflare R2 when removed from a product
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Asset key is required to delete' },
        { status: 400 }
      );
    }

    await deleteFromR2(key);

    return NextResponse.json({
      success: true,
      message: `Asset '${key}' successfully deleted from Cloudflare R2`,
    });
  } catch (error: unknown) {
    console.error('Delete Error:', error);
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
