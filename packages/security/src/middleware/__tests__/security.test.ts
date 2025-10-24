import { Socket } from 'net';
import { Request, Response, NextFunction } from 'express';
import { SecurityMiddleware } from '../middleware/security';

// Mock Socket
class MockSocket extends Socket {
  constructor() {
    super();
  }
}

describe('SecurityMiddleware', () => {
  let security: SecurityMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: jest.Mock<NextFunction>;

  beforeEach(() => {
    security = new SecurityMiddleware({
      maxRequestSize: 1024 * 1024, // 1MB
      allowedDomains: ['example.com'],
      allowedIpRanges: ['192.168.1.0/24'],
      objectProtectionEnabled: true,
      urlValidationEnabled: true
    });

    mockReq = {
      headers: {},
      get: function(name: string) {
        return this.headers ? this.headers[name] : undefined;
      },
      socket: new MockSocket(),
      query: {},
      body: {}
    };

    // Set up mock IP
    Object.defineProperty(mockReq, 'ip', {
      get: function() { return '192.168.1.100'; }
    });

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFn = jest.fn();
  });

  describe('requestSizeLimit', () => {
    it('should allow requests under size limit', () => {
      mockReq.headers = { 'content-length': '512' };
      security.requestSizeLimit(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject requests over size limit', () => {
      mockReq.headers = { 'content-length': '2097152' }; // 2MB
      security.requestSizeLimit(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(413);
    });
  });

  describe('validateIp', () => {
    it('should allow IPs in allowed range', () => {
      security.validateIp(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject IPs outside allowed range', () => {
      Object.defineProperty(mockReq, 'ip', {
        get: function() { return '10.0.0.1'; }
      });
      security.validateIp(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('validateUrl', () => {
    it('should allow valid URLs from allowed domains', () => {
      mockReq.query = { url: 'https://example.com/path' };
      security.validateUrl(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject URLs from disallowed domains', () => {
      mockReq.query = { url: 'https://malicious.com/path' };
      security.validateUrl(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reject invalid URLs', () => {
      mockReq.query = { url: 'not-a-url' };
      security.validateUrl(mockReq as Request, mockRes as Response, nextFn);
      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('protectObjects', () => {
    it('should freeze object prototypes', () => {
      const body = { key: 'value' };
      mockReq.body = body;
      security.protectObjects(mockReq as Request, mockRes as Response, nextFn);
      
      expect(() => {
        (mockReq.body as any).__proto__.polluted = true;
      }).toThrow();
      
      expect(nextFn).toHaveBeenCalled();
    });

    it('should deep freeze nested objects', () => {
      const body = { nested: { deep: { value: 'test' } } };
      mockReq.body = body;
      security.protectObjects(mockReq as Request, mockRes as Response, nextFn);
      
      expect(() => {
        (mockReq.body as any).nested.deep.value = 'modified';
      }).toThrow();
      
      expect(nextFn).toHaveBeenCalled();
    });
  });

  describe('applyAll', () => {
    it('should apply all middleware functions', () => {
      const router = {
        use: jest.fn()
      };

      security.applyAll(router);

      expect(router.use).toHaveBeenCalledTimes(4);
      expect(router.use).toHaveBeenCalledWith(security.requestSizeLimit);
      expect(router.use).toHaveBeenCalledWith(security.validateIp);
      expect(router.use).toHaveBeenCalledWith(security.validateUrl);
      expect(router.use).toHaveBeenCalledWith(security.protectObjects);
    });
  });
});