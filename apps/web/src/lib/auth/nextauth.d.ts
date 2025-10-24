/**
 * NextAuth Configuration for One-Tap Social Sign-in
 * Supports Google, Apple, and other OAuth providers
 */
import { NextAuthOptions } from 'next-auth';
export declare const authOptions: NextAuthOptions;
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
        };
        accessToken: string;
        provider: string;
    }
    interface User {
        id: string;
        accessToken?: string;
    }
}
declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        accessToken: string;
        provider: string;
    }
}
//# sourceMappingURL=nextauth.d.ts.map