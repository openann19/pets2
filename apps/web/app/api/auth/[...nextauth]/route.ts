/**
 * NextAuth API Route Handler (app directory)
 * This file ensures Next.js routes the NextAuth endpoints under /api/auth/*
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
