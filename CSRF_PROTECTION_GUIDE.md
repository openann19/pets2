# CSRF Protection Implementation Guide

## 🛡️ Overview

PawfectMatch Premium now has **comprehensive CSRF (Cross-Site Request Forgery) protection** implemented following OWASP security standards. This document explains the implementation, usage, and security considerations.

## 🎯 Security Level: P0 CRITICAL

**Status**: ✅ **IMPLEMENTED**

Per `document3.md` requirements:
> "CSRF hardening - require either Authorization header or a CSRF token when cookie auth is used for POST /api/moderation/*"

## 🏗️ Architecture

### Components

1. **`/apps/web/src/middleware/csrf.ts`** - Server-side CSRF middleware
2. **`/apps/web/middleware.ts`** - Integration with Next.js middleware
3. **`/apps/web/src/providers/CsrfProvider.tsx`** - Client-side token management
4. **`/apps/web/app/api/auth/csrf/route.ts`** - Token generation endpoint
5. **`/apps/web/src/services/api.ts`** - Automatic CSRF header injection

### Protection Mechanisms

1. **Double-Submit Cookie Pattern**
   - CSRF token stored in HttpOnly cookie
   - Same token must be sent in `x-csrf-token` header
   - Timing-safe comparison prevents timing attacks

2. **Origin/Referer Validation**
   - Validates request origin matches expected domain
   - Prevents cross-origin attacks
   - Allows localhost in development

3. **SameSite Cookie Policy**
   - Cookies set with `SameSite=Strict`
   - Prevents browser from sending cookies in cross-site requests

4. **Cryptographically Secure Tokens**
   - Generated using `crypto.randomBytes(32)`
   - 256-bit entropy (base64url encoded)
   - Rotated on authentication events

## 🔒 Security Rules

### Protected Methods
CSRF protection applies to state-changing HTTP methods:
- ✅ `POST`
- ✅ `PUT`
- ✅ `PATCH`
- ✅ `DELETE`

Safe methods (GET, HEAD, OPTIONS) do NOT require CSRF tokens.

### Route Categories

#### 1. Bypass Routes (No CSRF Required)
- `/api/auth/login` - Initial authentication
- `/api/auth/register` - User registration
- `/api/auth/refresh` - Token refresh
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset completion

#### 2. Standard Routes (CSRF OR Authorization)
Most API routes accept EITHER:
- Valid `Authorization: Bearer <token>` header, OR
- Valid CSRF token (cookie + header match)

#### 3. Critical Routes (CSRF AND Authorization BOTH REQUIRED)
High-risk operations require BOTH:
- `/api/moderation/*` - Content moderation actions
- `/api/admin/*` - Admin operations
- `/api/payments/*` - Payment processing
- `/api/user/delete` - Account deletion

## 💻 Usage

### Automatic Protection (Recommended)

The API service automatically includes CSRF tokens:

```typescript
import { api } from '@/services/api';

// CSRF token automatically included
await api.pets.likePet(petId);
await api.updateProfile(profileData);
await api.moderation.approvePet(petId);
```

### Manual Usage with useCsrfToken Hook

```typescript
'use client';

import { useCsrfToken } from '@/providers/CsrfProvider';

function MyComponent() {
  const { token, refreshToken, isLoading } = useCsrfToken();

  const handleSubmit = async () => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  };

  return <div>...</div>;
}
```

### Manual Usage with Helper Functions

```typescript
import { getCsrfHeaders, withCsrfToken } from '@/providers/CsrfProvider';

// Option 1: Get headers object
const headers = {
  'Content-Type': 'application/json',
  ...getCsrfHeaders(),
};

// Option 2: Wrap fetch
const csrfFetch = withCsrfToken(fetch);
await csrfFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### Provider Setup

Add `CsrfProvider` to your root layout:

```typescript
// app/layout.tsx
import { CsrfProvider } from '@/providers/CsrfProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CsrfProvider>
          {children}
        </CsrfProvider>
      </body>
    </html>
  );
}
```

## 🧪 Testing

### Test CSRF Protection

```bash
# Should succeed (has CSRF token)
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Cookie: csrf-token=<token>" \
  -H "x-csrf-token: <token>" \
  -d '{"data":"value"}'

# Should fail (missing CSRF token)
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"data":"value"}'

# Should succeed (has Authorization header)
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"data":"value"}'
```

### Unit Tests

```typescript
import { validateCsrfToken, generateCsrfToken } from '@/middleware/csrf';

describe('CSRF Protection', () => {
  it('should validate matching tokens', () => {
    const token = generateCsrfToken();
    expect(validateCsrfToken(token, token)).toBe(true);
  });

  it('should reject mismatched tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(validateCsrfToken(token1, token2)).toBe(false);
  });

  it('should reject empty tokens', () => {
    expect(validateCsrfToken('', '')).toBe(false);
  });
});
```

## 🚨 Error Responses

### CSRF_INVALID_ORIGIN
```json
{
  "error": "Invalid origin",
  "message": "Request origin validation failed",
  "code": "CSRF_INVALID_ORIGIN"
}
```
**Status**: 403 Forbidden  
**Cause**: Origin/Referer header doesn't match expected domain

### CSRF_TOKEN_MISSING
```json
{
  "error": "CSRF token missing",
  "message": "CSRF token not found in cookies",
  "code": "CSRF_TOKEN_MISSING"
}
```
**Status**: 403 Forbidden  
**Cause**: No CSRF cookie present for state-changing request

### CSRF_HEADER_MISSING
```json
{
  "error": "CSRF token missing",
  "message": "CSRF token required in x-csrf-token header",
  "code": "CSRF_HEADER_MISSING"
}
```
**Status**: 403 Forbidden  
**Cause**: CSRF cookie exists but header not provided

### CSRF_TOKEN_INVALID
```json
{
  "error": "CSRF validation failed",
  "message": "CSRF token validation failed",
  "code": "CSRF_TOKEN_INVALID"
}
```
**Status**: 403 Forbidden  
**Cause**: Cookie token doesn't match header token

### CSRF_MISSING_AUTH
```json
{
  "error": "Unauthorized",
  "message": "Authorization required for this endpoint",
  "code": "CSRF_MISSING_AUTH"
}
```
**Status**: 401 Unauthorized  
**Cause**: Critical route requires Authorization header

## 🔧 Configuration

### Customize Settings

Edit `/apps/web/src/middleware/csrf.ts`:

```typescript
const CSRF_CONFIG = {
  cookieName: 'csrf-token',      // Cookie name
  headerName: 'x-csrf-token',    // Header name
  tokenLength: 32,                // Token bytes (256 bits)
  maxAge: 60 * 60,               // 1 hour
  sameSite: 'strict',            // SameSite policy
  secure: NODE_ENV === 'production', // HTTPS only
  
  // Add routes to bypass CSRF
  bypassRoutes: [
    '/api/auth/login',
    '/api/custom-endpoint',
  ],
  
  // Add routes requiring extra protection
  criticalRoutes: [
    '/api/moderation',
    '/api/custom-critical',
  ],
};
```

## 📊 Token Lifecycle

1. **Generation**
   - Client makes GET request to any API endpoint
   - Middleware detects missing CSRF cookie
   - Generates 256-bit random token
   - Sets HttpOnly cookie with SameSite=Strict

2. **Usage**
   - Client reads token from cookie
   - Includes token in `x-csrf-token` header
   - Server validates: cookie token === header token
   - Request proceeds if valid

3. **Rotation**
   - Token rotated after login/authentication
   - Token expires after 1 hour
   - New token generated on expiry

4. **Cleanup**
   - Token cleared on logout
   - Cookie expires after maxAge

## 🎯 Best Practices

### ✅ DO

- Always use the API service for requests (auto-includes CSRF)
- Include `credentials: 'include'` in manual fetch calls
- Rotate tokens on authentication events
- Log CSRF validation failures for monitoring
- Test CSRF protection in E2E tests

### ❌ DON'T

- Don't disable CSRF protection in production
- Don't expose CSRF tokens in URLs or logs
- Don't use same token across different sessions
- Don't bypass origin validation without good reason
- Don't store CSRF tokens in localStorage (use cookies)

## 🐛 Troubleshooting

### Issue: "CSRF token missing" in development

**Solution**: Ensure cookies are enabled in browser and API calls include `credentials: 'include'`

```typescript
fetch('/api/endpoint', {
  method: 'POST',
  credentials: 'include', // ← Required!
});
```

### Issue: CSRF validation fails after login

**Solution**: Token should be rotated after login. Check authentication endpoint calls `rotateCsrfToken()`:

```typescript
import { rotateCsrfToken } from '@/middleware/csrf';

// In login endpoint
const response = NextResponse.json({ success: true });
rotateCsrfToken(response);
return response;
```

### Issue: Cross-domain requests fail

**Solution**: Update allowed origins in `validateOrigin()` function or use Authorization header instead of CSRF for API clients.

## 📈 Monitoring

### Key Metrics

- CSRF validation failures by endpoint
- Token generation rate
- Token expiry events
- Origin validation failures

### Logging

CSRF middleware logs key events:

```typescript
console.log('[CSRF] Validation passed:', { pathname, method });
console.warn('[CSRF] Invalid origin:', { origin, referer, host });
console.warn('[CSRF] Token mismatch:', { pathname });
```

Set up monitoring for these log messages in production.

## 🔗 References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Double-Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)

## ✅ Compliance

This implementation satisfies:

- ✅ OWASP Top 10 - A01:2021 Broken Access Control
- ✅ OWASP Top 10 - A07:2021 Identification and Authentication Failures
- ✅ PCI DSS 3.2.1 - Requirement 6.5.9
- ✅ SOC 2 - Security Controls
- ✅ GDPR - Security of Processing (Article 32)

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production-Ready
