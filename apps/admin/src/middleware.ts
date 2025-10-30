import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for RBAC enforcement
 */
export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip middleware for public routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Get session from cookies
  const sessionToken = request.cookies.get('admin-session')?.value;
  
  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has session and on login page, redirect to dashboard
  if (sessionToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check permissions based on route
  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles.length > 0) {
    // In production, decode session and check roles
    // For now, allow access if session exists
    // TODO: Implement actual role checking
  }

  return NextResponse.next();
}

function getRequiredRoles(pathname: string): string[] {
  if (pathname.startsWith('/billing')) return ['superadmin', 'finance'];
  if (pathname.startsWith('/moderation')) return ['superadmin', 'moderator'];
  if (pathname.startsWith('/users')) return ['superadmin', 'support', 'moderator'];
  return ['superadmin'];
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
