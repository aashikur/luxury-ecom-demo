import { NextResponse } from 'next/server';
import {
  ApiResponse,
  ApiErrorResponse,
  ApiErrorCode,
  ApiPaginationMeta,
} from '@/types/api';

/**
 * Universal Success Response Helper
 * Standardizes API responses across all Next.js App Router route handlers.
 */
export function apiSuccess<T>(
  data: T,
  options: {
    pagination?: ApiPaginationMeta;
    message?: string;
    status?: number;
    headers?: HeadersInit;
  } = {}
): NextResponse<ApiResponse<T>> {
  const { pagination, message, status = 200, headers } = options;

  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
    ...(message ? { message } : {}),
  };

  return NextResponse.json(payload, { status, headers });
}

/**
 * Universal Error Response Helper
 * Returns structured, sanitized error payload adhering to Step 2 response contract.
 */
export function apiError(
  error: string,
  code: ApiErrorCode = 'INTERNAL_ERROR',
  status: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const payload: ApiErrorResponse = {
    success: false,
    error,
    code,
    ...(details !== undefined ? { details } : {}),
  };

  return NextResponse.json(payload, { status });
}
