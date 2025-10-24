import type { Readable } from 'stream';
import busboy from 'busboy';
import contentType from 'content-type';
import type { Request } from 'express';

export interface MultipartFile {
  filename: string;
  encoding: string;
  mime: string;
  data: Buffer;
}

export interface SecureParserOptions {
  maxFileSize: number;
  onFile: (file: MultipartFile) => void;
  onField?: (name: string, value: string) => void;
  onError: (err: Error) => void;
  onEnd: () => void;
}

// For testing purposes
export type MockParseOptions = SecureParserOptions;

interface FileMetadata {
  filename: string;
  encoding: string;
  mime: string;
}

export function parse(req: Request, options: SecureParserOptions): void {
  try {
    const contentTypeHeader = req.headers['content-type'];
    if (!contentTypeHeader) {
      throw new Error('Missing Content-Type header');
    }

    const { type } = contentType.parse(contentTypeHeader);
    if (type !== 'multipart/form-data') {
      throw new Error('Invalid Content-Type');
    }

    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: options.maxFileSize,
        files: 1 // Process one file at a time
      }
    });

    bb.on('file', (_fieldname: string, stream: Readable, fileInfo: FileMetadata) => {
      const chunks: Buffer[] = [];
      let fileSize = 0;

      stream.on('data', (chunk: Buffer) => {
        fileSize += chunk.length;
        if (fileSize > options.maxFileSize) {
          stream.destroy(new Error('File size limit exceeded'));
          return;
        }
        chunks.push(chunk);
      });

      stream.on('end', () => {
        const fileData = Buffer.concat(chunks);
        options.onFile({
          filename: fileInfo.filename,
          encoding: fileInfo.encoding,
          mime: fileInfo.mime,
          data: fileData
        });
      });

      stream.on('error', (err: Error) => {
        options.onError(err);
      });
    });

    bb.on('field', (name: string, value: string) => {
      if (options.onField) {
        options.onField(name, value);
      }
    });

    bb.on('finish', () => {
      options.onEnd();
    });

    bb.on('error', (err: Error) => {
      options.onError(err);
    });

    req.pipe(bb);
  } catch (err) {
    options.onError(err instanceof Error ? err : new Error('Unknown error'));
  }
}