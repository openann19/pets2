/**
 * NextAuth Configuration for One-Tap Social Sign-in
 * Supports Google, Apple, and other OAuth providers
 */
import { NextAuthOptions } from 'next-auth'
import { logger } from '@pawfectmatch/core';
;
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
// MongoDB connection for NextAuth adapter
const client = new MongoClient(process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017/pawfectmatch');
const clientPromise = client.connect();
export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env['GOOGLE_CLIENT_ID'],
            clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                    scope: 'openid email profile',
                },
            },
        }),
        AppleProvider({
            clientId: process.env['APPLE_ID'],
            clientSecret: process.env['APPLE_SECRET'],
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });
                    const data = await response.json();
                    if (response.ok && data.success) {
                        return {
                            id: data.data.user._id,
                            email: data.data.user.email,
                            name: `${data.data.user.firstName} ${data.data.user.lastName}`,
                            image: data.data.user.profilePicture,
                            accessToken: data.data.accessToken,
                        };
                    }
                }
                catch (error) {
                    logger.error('Auth error:', { error });
                }
                return null;
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Persist the OAuth access_token and or the user id to the token right after signin
            if (account) {
                if (account.access_token)
                    token.accessToken = account.access_token;
                if (account.provider)
                    token.provider = account.provider;
            }
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            session.user.id = token.id;
            session.accessToken = token.accessToken;
            session.provider = token.provider;
            return session;
        },
        async signIn({ user, account, profile }) {
            // Custom logic for handling social sign-ins
            if (account?.provider === 'google' || account?.provider === 'apple') {
                try {
                    // Check if user exists in our database
                    const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/auth/social-login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            provider: account.provider,
                            providerId: account.providerAccountId,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            accessToken: account.access_token,
                        }),
                    });
                    const data = await response.json();
                    return data.success;
                }
                catch (error) {
                    logger.error('Social login error:', { error });
                    return false;
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
        // newUser: '/auth/welcome', // optional
    },
    events: {
        async signIn({ user, account, isNewUser }) {
            logger.info('User signed in:', { userId: user.id, provider: account?.provider, isNewUser });
        },
        async signOut({ session, token }) {
            logger.info('User signed out:', { userId: token?.id });
        },
    },
    debug: process.env.NODE_ENV === 'development',
};
//# sourceMappingURL=nextauth.js.map