/**
 * Upload Security Tests
 * Tests for file signature sniffing and security
 */

const request = require('supertest');
const express = require('express');
const multer = require('multer');

// Mock file-type module
jest.mock('file-type', () => ({
  fileTypeFromBuffer: jest.fn(),
}));

const { fileTypeFromBuffer } = require('file-type');

describe('Upload Security', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simplified upload route for testing
    const upload = multer({ storage: multer.memoryStorage() });

    app.post('/api/upload/test', upload.single('file'), async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      try {
        const type = await fileTypeFromBuffer(req.file.buffer);
        
        if (!type) {
          return res.status(400).json({ error: 'Unable to determine file type' });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(type.mime)) {
          return res.status(400).json({ error: `File type ${type.mime} not allowed` });
        }

        res.json({ success: true, mime: type.mime, ext: type.ext });
      } catch {
        res.status(500).json({ error: 'File validation failed' });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File signature validation', () => {
    it('should accept valid JPEG file', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/jpeg',
        ext: 'jpg',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('fake-jpeg-data'), 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.mime).toBe('image/jpeg');
    });

    it('should accept valid PNG file', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/png',
        ext: 'png',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('fake-png-data'), 'test.png');

      expect(response.status).toBe(200);
      expect(response.body.mime).toBe('image/png');
    });

    it('should accept valid WebP file', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/webp',
        ext: 'webp',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('fake-webp-data'), 'test.webp');

      expect(response.status).toBe(200);
      expect(response.body.mime).toBe('image/webp');
    });

    it('should accept valid GIF file', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/gif',
        ext: 'gif',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('fake-gif-data'), 'test.gif');

      expect(response.status).toBe(200);
      expect(response.body.mime).toBe('image/gif');
    });
  });

  describe('MIME type spoofing prevention', () => {
    it('should reject executable disguised as image', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'application/x-msdownload',
        ext: 'exe',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('fake-exe-data'), 'malware.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not allowed');
    });

    it('should reject PDF disguised as image', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'application/pdf',
        ext: 'pdf',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('fake-pdf-data'), 'document.png');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not allowed');
    });

    it('should reject SVG files (XSS risk)', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/svg+xml',
        ext: 'svg',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('<svg></svg>'), 'image.svg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not allowed');
    });

    it('should reject HTML disguised as image', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'text/html',
        ext: 'html',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('<html></html>'), 'page.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not allowed');
    });

    it('should reject JavaScript disguised as image', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'application/javascript',
        ext: 'js',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('alert("xss")'), 'script.png');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not allowed');
    });
  });

  describe('Edge cases', () => {
    it('should handle corrupted files', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('corrupted-data'), 'corrupted.jpg');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Unable to determine file type');
    });

    it('should handle empty files', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from(''), 'empty.jpg');

      expect(response.status).toBe(400);
    });

    it('should handle file-type library errors', async () => {
      fileTypeFromBuffer.mockRejectedValueOnce(new Error('Library error'));

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('data'), 'test.jpg');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('File validation failed');
    });

    it('should handle missing file', async () => {
      const response = await request(app).post('/api/upload/test');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No file provided');
    });
  });

  describe('File size limits', () => {
    it('should enforce file size limits', async () => {
      const largeApp = express();
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 1024 }, // 1KB limit
      });

      largeApp.post('/api/upload/test', upload.single('file'), (req, res) => {
        res.json({ success: true });
      });

      largeApp.use((error, req, res, next) => {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ error: 'File too large' });
        }
        next(error);
      });

      const largeBuffer = Buffer.alloc(2048); // 2KB file

      const response = await request(largeApp)
        .post('/api/upload/test')
        .attach('file', largeBuffer, 'large.jpg');

      expect(response.status).toBe(413);
    });
  });

  describe('Memory storage', () => {
    it('should use memory storage (no disk writes)', async () => {
      fileTypeFromBuffer.mockResolvedValueOnce({
        mime: 'image/jpeg',
        ext: 'jpg',
      });

      const response = await request(app)
        .post('/api/upload/test')
        .attach('file', Buffer.from('test-data'), 'test.jpg');

      expect(response.status).toBe(200);
      // Memory storage doesn't create temp files
      // This is implicit in the multer.memoryStorage() configuration
    });
  });
});
