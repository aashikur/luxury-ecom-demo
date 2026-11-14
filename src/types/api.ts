/**
 * Universal Standard API Request & Response Envelope Types
 * Master Specification: docs/pipeline/02-schema-interface-and-response-envelope.md
 */

export interface ApiPaginationMeta {
  total: number;        // Total matched records in database
  page: number;         // Current active page (1-indexed)
  pages: number;        // Total available pages (Math.ceil(total / limit))
  limit: number;        // Items per page (strictly bounded: 1 <= limit <= 50)
  hasNextPage: boolean; // true if page < pages
  hasPrevPage: boolean; // true if page > 1
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  pagination?: ApiPaginationMeta;
  message?: string;
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'            // 401: Missing or invalid session cookie
  | 'FORBIDDEN'               // 403: Role insufficient
  | 'NOT_FOUND'               // 404: Resource does not exist
  | 'VALIDATION_ERROR'        // 400: Zod/Input validation failed on request
  | 'OUT_OF_STOCK'            // 409: Insufficient atomic stock for requested variant
  | 'COUPON_INVALID'          // 400: Expired, spend condition unmet, or usage limit exceeded
  | 'PAYMENT_FAILED'          // 402: Gateway rejected charge or invalid TrxID
  | 'DUPLICATE_ORDER'         // 409: IdempotencyKey collision
  | 'RATE_LIMITED'            // 429: Too many requests on IP or phone number
  | 'INTERNAL_ERROR';         // 500: Serverless failure (sanitized; no raw stack traces)

export interface ApiValidationErrorDetail {
  field: string;               // Dot-path to invalid property (e.g. "customer.phone")
  message: string;             // Validation rule violated
}

export interface ApiErrorResponse {
  success: false;
  error: string;               // Primary human-readable error string
  code: ApiErrorCode;          // Machine-readable uppercase error token
  details?: ApiValidationErrorDetail[] | unknown;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
