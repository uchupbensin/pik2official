import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !isLoginPage;

  const authCookie = request.cookies.get('admin_token')?.value;
  const session = await verifyToken(authCookie);

  if (isAdminRoute && !session) {
    // If not authenticated and trying to access admin routes
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && session) {
    // If already authenticated and trying to access login page
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: '/admin/:path*',
      has: [
        { type: 'header', key: 'accept' }
      ],
      missing: [
        { type: 'header', key: 'next-action' }
      ],
    }
  ],
};
