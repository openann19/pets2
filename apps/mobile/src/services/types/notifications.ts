export interface NotificationToken {
  token: string;
  platform: 'ios' | 'android';
  createdAt: number;
  lastUsed: number;
}

export interface NotificationValidationError extends Error {
  code: 'TOKEN_INVALID' | 'TOKEN_EXPIRED' | 'TOKEN_BLACKLISTED' | 'RATE_LIMIT_EXCEEDED';
  details?: Record<string, unknown>;
}

export interface NotificationDeepLink {
  scheme: 'pawfectmatch';
  path: string;
  params: Record<string, string>;
}

export function isValidDeepLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'pawfectmatch:' && parsed.pathname.length > 0;
  } catch {
    return false;
  }
}