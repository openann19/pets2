# 🔒 Security Token Storage Fix Plan

**Date**: January 2025  
**Priority**: P0 - HIGH RISK  
**Status**: Analysis Complete - Implementation Plan Created

---

## Current State Analysis

### Mobile App ✅ SECURE
- ✅ Uses `expo-secure-store` for JWT tokens
- ✅ Uses `react-native-keychain` with biometric protection
- ✅ Secure storage adapter for Zustand persist
- ✅ AuthService uses Keychain + SecureStore fallback
- **Status**: Already properly secured

### Web App ⚠️ NEEDS FIX
- ❌ Still stores tokens in `localStorage` (XSS vulnerable)
- ⚠️ Sets cookies client-side (not httpOnly)
- ⚠️ Cookies accessible via JavaScript (should be httpOnly)

---

## Required Changes

### 1. Backend Changes (REQUIRED)
**Files**: `server/src/routes/auth.ts` or `server/src/controllers/authController.ts`

```typescript
// Login endpoint should set httpOnly cookies
res.cookie('accessToken', token, {
  httpOnly: true,  // NOT accessible via JavaScript
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,  // 15 minutes
  path: '/',
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/',
});
```

### 2. Client Changes (CRITICAL)
**Files to Update**:
- `apps/web/src/lib/auth-store.ts`
- `apps/web/src/services/api.ts`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/hooks/useAuth.ts`
- `apps/web/src/components/providers/AuthProvider.tsx`

**Changes Needed**:
1. Remove all `localStorage.setItem('accessToken', ...)` calls
2. Remove all `localStorage.getItem('accessToken')` calls
3. Remove token storage from Zustand persist (only persist user, not tokens)
4. Update API client to read tokens from cookies server-side only
5. Use Next.js API routes or middleware to access httpOnly cookies

---

## Implementation Steps

### Phase 1: Backend Cookie Setting
1. Update login endpoint to set httpOnly cookies
2. Update refresh token endpoint to set new cookies
3. Update logout endpoint to clear cookies
4. Test cookie setting in development (with httpOnly=false for testing)

### Phase 2: Client Token Removal
1. Update `auth-store.ts` to not store tokens in localStorage
2. Update `api.ts` to not read from localStorage
3. Update all API calls to use credentials: 'include' for cookies
4. Remove token from Zustand persist partialize

### Phase 3: Cookie Reading
1. Create Next.js API route/middleware to read httpOnly cookies
2. Use server-side cookie reading for authenticated requests
3. Update WebSocket connection to use cookie-based auth

---

## Security Benefits

### Before (Current - INSECURE):
- ❌ Tokens in localStorage → XSS attacks can steal tokens
- ❌ Cookies accessible via JavaScript → XSS can read cookies
- ❌ Tokens persist across sessions → Higher attack window

### After (Fixed - SECURE):
- ✅ Tokens in httpOnly cookies → JavaScript cannot access
- ✅ Cookies only sent over HTTPS in production
- ✅ SameSite=strict → CSRF protection
- ✅ No localStorage tokens → XSS cannot steal tokens

---

## Testing Checklist

- [ ] Login sets httpOnly cookies
- [ ] Refresh token sets new cookies
- [ ] Logout clears cookies
- [ ] API requests include cookies automatically
- [ ] WebSocket connection uses cookies
- [ ] No tokens in localStorage
- [ ] No tokens accessible via JavaScript
- [ ] Works in development (with httpOnly=false)
- [ ] Works in production (with httpOnly=true, secure=true)

---

## Migration Path

### Option 1: Gradual Migration (Recommended)
1. Deploy backend with httpOnly cookies
2. Keep localStorage fallback temporarily
3. Migrate clients gradually
4. Remove localStorage after all clients updated

### Option 2: Big Bang Migration
1. Deploy backend + client changes simultaneously
2. All users re-authenticate
3. Clean break from old storage

**Recommendation**: Option 1 for zero downtime

---

## Notes

- Cookies must be set by the server (httpOnly=true) - client cannot set httpOnly cookies
- Next.js middleware or API routes needed to read httpOnly cookies server-side
- WebSocket connections need special handling for cookie-based auth
- Consider using Next.js Server Actions for authenticated requests

---

**Next Steps**: Implement backend cookie setting first, then update clients

