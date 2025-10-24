import type { Request, Response, NextFunction } from 'express';

const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
const PRIVATE_IP_RANGES = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  'fc00::/7',
  'fe80::/10'
];

export interface SecurityConfig {
  maxRequestSize?: number;
  allowedDomains?: string[];
  allowedIpRanges?: string[];
  objectProtectionEnabled?: boolean;
  urlValidationEnabled?: boolean;
}

export class SecurityMiddleware {
  private config: Required<SecurityConfig>;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      maxRequestSize: config.maxRequestSize ?? MAX_REQUEST_SIZE,
      allowedDomains: config.allowedDomains ?? [],
      allowedIpRanges: config.allowedIpRanges ?? [],
      objectProtectionEnabled: config.objectProtectionEnabled ?? true,
      urlValidationEnabled: config.urlValidationEnabled ?? true
    };
  }

  /**
   * Request size limiter
   */
  public requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
    const contentLengthHeader = req.headers['content-length'];
    const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
    if (contentLength > 0 && contentLength > this.config.maxRequestSize) {
      res.status(413).json({
        error: 'Payload too large',
        maxSize: this.config.maxRequestSize
      });
      return;
    }
    next();
  };

  /**
   * IP validation middleware
   */
  public validateIp = (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.socket?.remoteAddress;
    if (!clientIp || clientIp.trim() === '' || !this.isIpAllowed(clientIp)) {
      res.status(403).json({
        error: 'IP address not allowed'
      });
      return;
    }
    next();
  };

  /**
   * URL validation middleware
   */
  public validateUrl = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.config.urlValidationEnabled) {
      next();
      return;
    }

    const queryUrl = req.query['url'] as unknown;
    const bodyUrl = req.body?.url as unknown;
    const url = (typeof queryUrl === 'string' && queryUrl.trim().length > 0) ? queryUrl :
                (typeof bodyUrl === 'string' && bodyUrl.trim().length > 0) ? bodyUrl : null;

    if (url !== null && !this.isUrlAllowed(url)) {
      res.status(400).json({
        error: 'URL validation failed'
      });
      return;
    }
    next();
  };

  /**
   * Object prototype pollution protection
   */
  public protectObjects = (req: Request, _res: Response, next: NextFunction): void => {
    if (!this.config.objectProtectionEnabled) {
      next();
      return;
    }

    // Freeze object prototypes
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);

    // Deep freeze request body
    if (req.body && typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
      this.deepFreeze(req.body as Record<string, unknown>);
    }

    next();
  };

  /**
   * Apply all security middleware
   */
  public applyAll = (router: { use: (middleware: (req: Request, res: Response, next: NextFunction) => void) => void }): void => {
    router.use(this.requestSizeLimit);
    router.use(this.validateIp);
    router.use(this.validateUrl);
    router.use(this.protectObjects);
  };

  private isIpAllowed(ip: string): boolean {
    // First check against allowed ranges
    if (this.config.allowedIpRanges.length > 0) {
      return this.config.allowedIpRanges.some(range => this.ipInRange(ip, range));
    }

    // Then check against private ranges
    return !PRIVATE_IP_RANGES.some(range => this.ipInRange(ip, range));
  }

  private isUrlAllowed(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      // Check against allowed domains
      if (this.config.allowedDomains.length > 0) {
        return this.config.allowedDomains.some(domain => 
          hostname === domain || hostname.endsWith(`.${domain}`)
        );
      }

      // Validate URL format and protocol
      return (
        /^https?:\/\//.test(url) &&
        !this.isPrivateHostname(hostname)
      );
    } catch {
      return false;
    }
  }

  private isPrivateHostname(hostname: string): boolean {
    // Check for localhost variations
    if (/^(localhost|127\.0\.0\.1|::1)$/.test(hostname)) {
      return true;
    }

    // Check for private IP addresses
    const ipMatch = hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (ipMatch !== null && ipMatch[0] && ipMatch[0].length > 0) {
      return PRIVATE_IP_RANGES.some(range => this.ipInRange(hostname, range));
    }

    return false;
  }

  private ipInRange(ip: string, range: string): boolean {
    // Simple IP range check - in production, use a proper IP library
    const [rangeIp, bitsStr] = range.split('/');
    const bits = bitsStr ? parseInt(bitsStr, 10) : 32;
    const mask = ~((1 << (32 - bits)) - 1);

    const ipLong = this.ipToLong(ip);
    const rangeLong = rangeIp ? this.ipToLong(rangeIp) : 0;

    return (ipLong & mask) === (rangeLong & mask);
  }

  private ipToLong(ip: string): number {
    return ip.split('.')
      .reduce((long, octet) => {
        const parsedOctet = octet ? parseInt(octet, 10) : 0;
        return (long << 8) + parsedOctet;
      }, 0) >>> 0;
  }

  private deepFreeze(obj: Record<string, unknown>): Record<string, unknown> {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      const value = obj[prop];
      if (value !== null
          && (typeof value === 'object' || typeof value === 'function')
          && !Object.isFrozen(value)) {
        this.deepFreeze(value as Record<string, unknown>);
      }
    });
    return Object.freeze(obj);
  }
}