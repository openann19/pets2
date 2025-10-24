import { Request, Response, NextFunction } from 'express';
import { MultipartParser } from '../multipart';
import type { SecureParserOptions } from '../secure-multipart-parser';

jest.mock('../middleware/secure-multipart-parser', () => ({
  parse: jest.fn().mockImplementation((req: Request, options: SecureParserOptions) => {
    const mockFile = {
      filename: 'test.jpg',
      encoding: '7bit',
      mime: 'image/jpeg',
      data: Buffer.from('test')
    };
    options.onFile(mockFile);
    options.onEnd();
  })
}));

describe('MultipartParser', () => {
  let parser: MultipartParser;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: jest.Mock<NextFunction>;

  beforeEach(() => {
    parser = new MultipartParser({
      maxFileSize: 1024 * 1024, // 1MB
      maxFiles: 2,
      allowedMimeTypes: ['image/jpeg', 'image/png']
    });

    mockReq = {
      is: jest.fn(),
      headers: {
        'content-type': 'multipart/form-data; boundary=---123',
        'content-length': '1000'
      },
      pipe: jest.fn()
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFn = jest.fn();
  });

  describe('parseMultipart', () => {
    it('should pass through non-multipart requests', async () => {
      (mockReq.is as jest.Mock).mockReturnValue(false);
      
      await parser.parseMultipart(mockReq as Request, mockRes as Response, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should validate content length', async () => {
      (mockReq.is as jest.Mock).mockReturnValue(true);
      if (mockReq.headers) {
        mockReq.headers['content-length'] = '5242880'; // 5MB
      }
      
      await parser.parseMultipart(mockReq as Request, mockRes as Response, nextFn);
      
      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should process valid files', async () => {
      (mockReq.is as jest.Mock).mockReturnValue(true);
      
      await parser.parseMultipart(mockReq as Request, mockRes as Response, nextFn);
      
      expect(nextFn).toHaveBeenCalled();
      expect((mockReq as any).validatedFiles).toBeDefined();
      expect((mockReq as any).validatedFiles.length).toBe(1);
    });

    it('should handle parser errors', async () => {
      (mockReq.is as jest.Mock).mockReturnValue(true);
      const mockParser = jest.requireMock<typeof import('../middleware/secure-multipart-parser')>('../middleware/secure-multipart-parser');
      mockParser.parse.mockImplementation((_req: Request, options: SecureParserOptions) => {
        options.onError(new Error('Parser error'));
      });
      
      await parser.parseMultipart(mockReq as Request, mockRes as Response, nextFn);
      
      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});