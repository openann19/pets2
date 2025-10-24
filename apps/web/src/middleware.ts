import { NextResponse } from 'next/server';
import { validateToken } from './utils/jwt-validator';
import { rateLimiter } from './utils/rate-limiter';
/**
 * Production-ready middleware for security and authentication
 * Implements httpOnly cookie strategy and security headers
 */
const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/',
    '/about',
    '/privacy',
    '/terms',
];
export async function middleware(request) {
    const response = NextResponse.next();
    const { pathname } = request.nextUrl;
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const isAllowed = rateLimiter.isAllowed(ip, 100, 60000); // 100 requests per minute
    if (!isAllowed) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }
    // Security headers (additional to next.config.js)
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    // CSRF protection for mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');
        // Verify origin matches host
        if (origin && host && !origin.includes(host)) {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }
    // Check authentication for protected routes
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    const authToken = request.cookies.get('pm_auth_token')?.value;
    // Validate JWT token for protected routes
    if (!isPublicPath && authToken) {
        const payload = await validateToken(authToken);
        if (!payload) {
            // Invalid token - redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }
    // Redirect to login if accessing protected route without auth
    if (!isPublicPath && !authToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    // Redirect to home if accessing login/register while authenticated
    if ((pathname === '/login' || pathname === '/register') && authToken) {
        const payload = await validateToken(authToken);
        if (payload) {
            return NextResponse.redirect(new URL('/swipe', request.url));
        }
    }
    // Add security headers to response
    response.headers.set('X-Request-ID', crypto.randomUUID());
    return response;
}
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
//# sourceMappingURL=middleware.js.map