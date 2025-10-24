/**
 * NextAuth API Route Handler
 * Handles all authentication requests including social logins
 */
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
//# sourceMappingURL=route.js.map