import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for Administrative Route Shielding
 *
 * NOTE: Auth guard is temporarily toggled OFF (permissive mode) per development request.
 * Set ENABLE_AUTH_GUARD='true' in .env.local to activate edge-level credential protection.
 */
const AUTH_GUARD_ENABLED = process.env.ENABLE_AUTH_GUARD === 'true';

export async function middleware(request: NextRequest) {
  // If Edge Auth enforcement is inactive, allow seamless access to operations
  if (!AUTH_GUARD_ENABLED) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Protect administrative dashboard routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token');

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
