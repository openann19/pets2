/**
 * Comprehensive tests for JWT utilities
 * Tests JWT token decoding, validation, and expiration checking
 */
import {
  decodeJWT,
  isTokenExpired,
  getTokenExpiration,
  getTokenExpiresIn,
  shouldRefreshToken,
  validateToken,
  getUserIdFromToken,
  getTokenMetadata,
  type JWTPayload,
} from "../jwt";

describe("JWT Utilities", () => {
  const createValidToken = (expiresInSeconds: number): string => {
    const expiry = Math.floor((Date.now() + expiresInSeconds * 1000) / 1000);
    const header = btoa(JSON.stringify({ typ: "JWT", alg: "HS256" }));
    const payload = btoa(
      JSON.stringify({
        exp: expiry,
        iat: Math.floor(Date.now() / 1000),
        sub: "user-123",
        email: "test@example.com",
      }),
    );
    const signature = btoa("signature");
    return `${header}.${payload}.${signature}`;
  };

  const createExpiredToken = (): string => {
    const expiry = Math.floor((Date.now() - 1000) / 1000); // 1 second ago
    const header = btoa(JSON.stringify({ typ: "JWT", alg: "HS256" }));
    const payload = btoa(
      JSON.stringify({
        exp: expiry,
        iat: Math.floor((Date.now() - 3600) / 1000),
        sub: "user-123",
        email: "test@example.com",
      }),
    );
    const signature = btoa("signature");
    return `${header}.${payload}.${signature}`;
  };

  describe("decodeJWT", () => {
    it("should decode valid JWT token", () => {
      const token = createValidToken(3600);
      const payload = decodeJWT(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe("user-123");
      expect(payload?.email).toBe("test@example.com");
    });

    it("should return null for invalid token format", () => {
      const invalidToken = "invalid.token";
      const payload = decodeJWT(invalidToken);

      expect(payload).toBeNull();
    });

    it("should return null for token with incorrect parts", () => {
      const invalidToken = "header.payload"; // Missing signature
      const payload = decodeJWT(invalidToken);

      expect(payload).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid token", () => {
      const token = createValidToken(3600); // Expires in 1 hour
      const expired = isTokenExpired(token);

      expect(expired).toBe(false);
    });

    it("should return true for expired token", () => {
      const token = createExpiredToken();
      const expired = isTokenExpired(token);

      expect(expired).toBe(true);
    });

    it("should return false for token without exp claim", () => {
      const header = btoa(JSON.stringify({ typ: "JWT" }));
      const payload = btoa(JSON.stringify({ sub: "user-123" }));
      const signature = btoa("signature");
      const token = `${header}.${payload}.${signature}`;

      const expired = isTokenExpired(token);

      expect(expired).toBe(false);
    });
  });

  describe("getTokenExpiration", () => {
    it("should return expiration date for valid token", () => {
      const token = createValidToken(3600);
      const expiration = getTokenExpiration(token);

      expect(expiration).not.toBeNull();
      expect(expiration).toBeInstanceOf(Date);
    });

    it("should return null for token without exp claim", () => {
      const header = btoa(JSON.stringify({ typ: "JWT" }));
      const payload = btoa(JSON.stringify({ sub: "user-123" }));
      const signature = btoa("signature");
      const token = `${header}.${payload}.${signature}`;

      const expiration = getTokenExpiration(token);

      expect(expiration).toBeNull();
    });
  });

  describe("getTokenExpiresIn", () => {
    it("should return positive milliseconds for future expiration", () => {
      const token = createValidToken(3600);
      const expiresIn = getTokenExpiresIn(token);

      expect(expiresIn).toBeGreaterThan(0);
      expect(expiresIn).toBeLessThanOrEqual(3600 * 1000);
    });

    it("should return 0 for expired token", () => {
      const token = createExpiredToken();
      const expiresIn = getTokenExpiresIn(token);

      expect(expiresIn).toBe(0);
    });
  });

  describe("shouldRefreshToken", () => {
    it("should return true when token expires soon (default 5 minutes)", () => {
      const token = createValidToken(3 * 60); // Expires in 3 minutes
      const shouldRefresh = shouldRefreshToken(token);

      expect(shouldRefresh).toBe(true);
    });

    it("should return false when token has plenty of time", () => {
      const token = createValidToken(3600); // Expires in 1 hour
      const shouldRefresh = shouldRefreshToken(token);

      expect(shouldRefresh).toBe(false);
    });

    it("should return false for expired token", () => {
      const token = createExpiredToken();
      const shouldRefresh = shouldRefreshToken(token);

      expect(shouldRefresh).toBe(false);
    });

    it("should respect custom threshold", () => {
      const token = createValidToken(10 * 60); // Expires in 10 minutes
      const shouldRefresh = shouldRefreshToken(token, 15 * 60 * 1000); // 15 min threshold

      expect(shouldRefresh).toBe(true);
    });
  });

  describe("validateToken", () => {
    it("should validate valid token", () => {
      const token = createValidToken(3600);
      const result = validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.expiresAt).not.toBeNull();
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it("should detect expired token", () => {
      const token = createExpiredToken();
      const result = validateToken(token);

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.expiresAt).not.toBeNull();
      expect(result.expiresIn).toBe(0);
    });

    it("should handle invalid token format", () => {
      const invalidToken = "invalid.token";
      const result = validateToken(invalidToken);

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(false);
      expect(result.payload).toBeNull();
      expect(result.error).toBe("Invalid token format");
    });
  });

  describe("getUserIdFromToken", () => {
    it("should extract user ID from sub claim", () => {
      const token = createValidToken(3600);
      const userId = getUserIdFromToken(token);

      expect(userId).toBe("user-123");
    });

    it("should try alternative ID fields", () => {
      const header = btoa(JSON.stringify({ typ: "JWT" }));
      const payload = btoa(
        JSON.stringify({
          exp: Math.floor((Date.now() + 3600) / 1000),
          userId: "alt-user-id",
        }),
      );
      const signature = btoa("signature");
      const token = `${header}.${payload}.${signature}`;

      const userId = getUserIdFromToken(token);

      expect(userId).toBe("alt-user-id");
    });

    it("should return null when no ID field exists", () => {
      const header = btoa(JSON.stringify({ typ: "JWT" }));
      const payload = btoa(
        JSON.stringify({
          exp: Math.floor((Date.now() + 3600) / 1000),
          email: "test@example.com",
        }),
      );
      const signature = btoa("signature");
      const token = `${header}.${payload}.${signature}`;

      const userId = getUserIdFromToken(token);

      expect(userId).toBeNull();
    });
  });

  describe("getTokenMetadata", () => {
    it("should extract all metadata from token", () => {
      const header = btoa(JSON.stringify({ typ: "JWT" }));
      const iat = Math.floor((Date.now() - 3600) / 1000);
      const exp = Math.floor((Date.now() + 3600) / 1000);
      const payload = btoa(
        JSON.stringify({
          exp,
          iat,
          sub: "user-123",
          iss: "pawfectmatch",
          aud: "mobile-app",
        }),
      );
      const signature = btoa("signature");
      const token = `${header}.${payload}.${signature}`;

      const metadata = getTokenMetadata(token);

      expect(metadata.issuer).toBe("pawfectmatch");
      expect(metadata.audience).toBe("mobile-app");
      expect(metadata.issuedAt).not.toBeNull();
      expect(metadata.expiresAt).not.toBeNull();
    });

    it("should return undefined for missing fields", () => {
      const token = createValidToken(3600);
      const metadata = getTokenMetadata(token);

      expect(metadata.issuer).toBeUndefined();
      expect(metadata.audience).toBeUndefined();
    });
  });
});

