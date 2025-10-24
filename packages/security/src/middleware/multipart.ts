import type { Request, Response, NextFunction } from 'express';
import type { MultipartFile } from './secure-multipart-parser';

/**
 * Validated file interface for multipart uploads
 */
export interface ValidatedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Convert MultipartFile to ValidatedFile with safe type guards
 */
function toValidatedFile(file: MultipartFile): ValidatedFile {
  const isObjectLike = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  const getString = (o: unknown, k: string, fb: string) =>
    isObjectLike(o) && typeof o[k] === 'string' ? (o[k] as string) : fb;

  const getNumber = (o: unknown, k: string, fb: number) =>
    isObjectLike(o) && typeof o[k] === 'number' ? (o[k] as number) : fb;

  const getBuffer = (o: unknown, k: string, fb: Buffer) =>
    isObjectLike(o) && Buffer.isBuffer(o[k]) ? (o[k] as Buffer) : fb;

  return {
    fieldname: getString(file, 'fieldname', 'file'),
    originalname: getString(file, 'originalname', file.filename),
    encoding: file.encoding,
    mimetype: getString(file, 'mimetype', file.mime),
    size: getNumber(file, 'size', file.data.length),
    buffer: getBuffer(file, 'buffer', file.data),
    // preserve any other fields coming from MultipartFile
    ...(file as object),
  } as ValidatedFile;
}

/**
 * Extended Request interface with validated files
 */
declare module 'express' {
  interface Request {
    validatedFiles?: ValidatedFile[];
  }
}

/**
 * Multipart form data parser with additional security controls
 */
export class MultipartParser {
  private maxFileSize: number;
  private maxFiles: number;
  private allowedMimeTypes: string[];

  constructor(options: {
    maxFileSize?: number;
    maxFiles?: number;
    allowedMimeTypes?: string[];
  } = {}) {
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.maxFiles = options.maxFiles || 10;
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];
  }

  /**
   * Safe multipart parser middleware
   */
  public parseMultipart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.is('multipart/form-data')) {
      next();
      return;
    }

    try {
      // Validate content length
      const contentLengthHeader = req.headers['content-length'];
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      if (contentLength > 0 && contentLength > this.maxFileSize * this.maxFiles) {
        throw new Error('Total upload size exceeds limit');
      }

      // Parse and validate each file
      const files = await this.parseFiles(req);

      // Attach validated files to request
      req.validatedFiles = files;

      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid multipart form data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  private async parseFiles(req: Request): Promise<ValidatedFile[]> {
    const files: ValidatedFile[] = [];
    let fileCount = 0;

    // Here we would use a secure multipart parser instead of dicer
    // This is a placeholder for the actual implementation
    const secureParser = await import('./secure-multipart-parser');

    return new Promise((resolve, reject) => {
      secureParser.parse(req, {
        maxFileSize: this.maxFileSize,
        onFile: (file: MultipartFile) => {
          // Convert MultipartFile to ValidatedFile
          const validated = toValidatedFile(file);

          if (fileCount >= this.maxFiles) {
            reject(new Error('Too many files'));
            return;
          }

          if (!this.allowedMimeTypes.includes(validated.mimetype)) {
            reject(new Error(`Invalid file type: ${validated.mimetype}`));
            return;
          }

          files.push(validated);
          fileCount++;
        },
        onError: (err: Error) => {
          reject(err);
        },
        onEnd: () => {
          resolve(files);
        }
      });
    });
  }
}