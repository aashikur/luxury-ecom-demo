import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for Administrative Route Shielding
 * NOTE: Temporarily bypassed upon request so frontend & backend admin operations
 * work without mandatory authentication.
 */
export async function middleware(request: NextRequest) {
  // --- TEMPORARILY DISABLED AUTH GUARD ---
  // To re-enable Better Auth edge shielding, uncomment the block below:
  /*
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token');

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
