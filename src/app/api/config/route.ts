import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import {
  getPublicStoreConfig,
  getAdminStoreConfig,
  updateStoreConfig,
} from '@/services/config.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config: Public or Admin StoreConfig fetcher
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const config = isAdmin
      ? await getAdminStoreConfig()
      : await getPublicStoreConfig();

    if (!config) {
      return apiError('Store configuration not found', 'NOT_FOUND', 404);
    }

    return apiSuccess(config);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch config';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}

/**
 * PUT /api/config: Update store configuration (Admin)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await updateStoreConfig(body, body.updatedBy || 'ADMIN');

    return apiSuccess(updated, {
      message: 'Store configuration updated successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update config';
    return apiError(message, 'INTERNAL_ERROR', 500);
  }
}
