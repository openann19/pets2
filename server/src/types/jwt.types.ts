/**
 * JWT Access token payload
 */
export interface IAccessTokenPayload {
  userId: string;
  jti: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Refresh token payload
 */
export interface IRefreshTokenPayload {
  userId: string;
  jti: string;
  typ: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Token pair
 */
export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Decoded JWT structure
 */
export interface IDecodedJWT {
  userId: string;
  jti: string;
  typ?: string;
  iat?: number;
  exp?: number;
}

