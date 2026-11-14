import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for Administrative Route Shielding
 * Automatically guards /admin/** while permitting public access to /admin/login and storefront.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Guard all /admin/** routes except the login screen and public static assets
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
