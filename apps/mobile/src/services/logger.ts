/**
 * Mobile Logger Service
 * Lightweight logging for React Native with Sentry integration
 */

import * as Sentry from '@sentry/react-native';
import * as Keychain from 'react-native-keychain';
import * as Aes from 'react-native-aes-crypto';
import EncryptedStorage from 'react-native-encrypted-storage';

// Declare global __DEV__ variable
declare const __DEV__: boolean;

// Type assertion for Sentry to avoid unsafe call errors
const sentry = Sentry as {
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level: string) => void;
  setContext: (key: string, context: Record<string, unknown>) => void;
  setUser: (user: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
};

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export type LogLevelType = `${LogLevel}`;

export interface ErrorMetadata {
  message: string;
  stack?: string;
  name: string;
  code?: string;
}

export interface LogMetadata {
  [key: string]: unknown;
  error?: Error;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  tags?: string[];
  version?: string;
  timestamp?: string;
  level?: LogLevel;
  errorMetadata?: ErrorMetadata;
  isEncrypted?: boolean;
  encryptedAt?: string;
  encryptedData?: EncryptedData;
  integrity?: {
    hash: string;
    timestamp: string;
  };
  isRedacted?: boolean;
}

  interface AuditLogRequest {
    startDate?: Date;
    endDate?: Date;
    levels?: LogLevel[];
    includeMetrics?: boolean;
  }

  export interface AuditLogFilters {
    startDate: string;
    endDate: string;
    levels: LogLevel[];
    includeMetrics: boolean;
    contentHash: string;
    totalEntries: number;
  }

  interface ExportMetadata {
    timestamp: string;
    exportId: string;
    filters: AuditLogFilters;
  }

  interface AuditLogExport {
    logs: StructuredLogEntry[];
    metrics?: LogBufferMetrics;
    exportMetadata: ExportMetadata;
  }export interface ErrorMetadata {
  [key: string]: unknown;
  error?: Error;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  tags?: string[];
  version?: string;
  timestamp?: string;
  level?: LogLevel;
  errorMetadata?: ErrorMetadata;
}

/**
 * Storage key type
 */
type StorageKey = string;

/**
 * Interface for encrypted log storage item
 */
interface EncryptedLogStorageItem {
  data: EncryptedData;
  timestamp: string;
  level: LogLevel;
  hash: string;
}

  /** 
   * Type for working with storage keys
   * @private
   */
  type StorageKey = string & { readonly __storageKey: unique symbol };

  /**
   * Interface for encrypted log storage item
   * @private
   */
  interface EncryptedLogStorageItem {
    data: EncryptedData;
    timestamp: string;
    level: LogLevel;
    hash: string;
  }

  /**
   * Interface for Keychain options
   * @private
   */
  interface KeychainOptions {
    accessible?: Keychain.ACCESSIBLE;
    accessControl?: Keychain.ACCESS_CONTROL;
  }

  /**
   * Interface for encryption keys
   * @private
   */
  interface EncryptionKeys {
    key: string;
    salt: string;
  }

  /**
   * Core log entry structure
   */
  export interface StructuredLogEntry {
    message: string;
    level: LogLevel;
    timestamp: string;
    metadata: LogMetadata;
  }interface RateLimitConfig {
  points: number;
  interval: number; // in milliseconds
}

interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag?: string;
}

interface EncryptionKeys {
  key: string;
  salt: string;
}

interface LogBufferMetrics {
  totalEntries: number;
  criticalEntries: number;
  oldestEntry: Date | null;
  latestEntry: Date | null;
}

class MobileLogger {
  private isDevelopment = __DEV__;
  private sessionId: string;
  private appVersion: string;
  private userInfo: {id?: string; email?: string; username?: string} | null = null;
  private logBuffer: StructuredLogEntry[] = [];
  private offlineBuffer: StructuredLogEntry[] = [];
  private encryptionKey: string | null = null;
  private encryptionSalt: string | null = null;
  
  // Encryption constants
  private readonly ENCRYPTION_KEY_SIZE = 32; // 256 bits
  private readonly ENCRYPTION_IV_SIZE = 16; // 128 bits
  private readonly ENCRYPTION_KEY_STORAGE_KEY = 'logger_encryption_key';
  private readonly ENCRYPTION_SALT_STORAGE_KEY = 'logger_encryption_salt';
  
  // Constants
  private readonly MAX_LOG_BUFFER_SIZE = 1000;
  private readonly MAX_LOG_SIZE = 32768; // 32KB per log entry
  private readonly MAX_OFFLINE_BUFFER_SIZE = 500;
  private rateLimitBackoff = 100; // Initial backoff in ms

  // Rate limiting configuration per log level
  private readonly rateLimits: Record<LogLevel, RateLimitConfig> = {
    [LogLevel.DEBUG]: { points: 1000, interval: 60000 }, // 1000 per minute
    [LogLevel.INFO]: { points: 500, interval: 60000 },   // 500 per minute
    [LogLevel.WARN]: { points: 100, interval: 60000 },   // 100 per minute
    [LogLevel.ERROR]: { points: 50, interval: 60000 },   // 50 per minute
    [LogLevel.SECURITY]: { points: 20, interval: 60000 }, // 20 per minute
    [LogLevel.PERFORMANCE]: { points: 200, interval: 60000 } // 200 per minute
  };

  // Rate limiting state
  private rateTracking: Record<LogLevel, { count: number; resetTime: number }> = {
    [LogLevel.DEBUG]: { count: 0, resetTime: Date.now() },
    [LogLevel.INFO]: { count: 0, resetTime: Date.now() },
    [LogLevel.WARN]: { count: 0, resetTime: Date.now() },
    [LogLevel.ERROR]: { count: 0, resetTime: Date.now() },
    [LogLevel.SECURITY]: { count: 0, resetTime: Date.now() },
    [LogLevel.PERFORMANCE]: { count: 0, resetTime: Date.now() }
  };
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.appVersion = '1.0.0'; // Could be from app config
    this.setupLogRotation();
    void this.initializeEncryption();
  }

  /**
   * Initialize encryption keys and storage
   */
  private async initializeEncryption(): Promise<void> {
    try {
      // Try to retrieve existing encryption keys
      const storedKey = await Keychain.getGenericPassword(this.ENCRYPTION_KEY_STORAGE_KEY);
      const storedSalt = await Keychain.getGenericPassword(this.ENCRYPTION_SALT_STORAGE_KEY);

      if (storedKey && storedSalt) {
        this.encryptionKey = storedKey.password;
        this.encryptionSalt = storedSalt.password;
      } else {
        // Generate new encryption keys
        const key = await this.generateSecureKey();
        const salt = await this.generateSecureRandomBytes(this.ENCRYPTION_KEY_SIZE);

        // Store keys securely
        await Keychain.setGenericPassword(
          this.ENCRYPTION_KEY_STORAGE_KEY,
          key
        );
        await Keychain.setGenericPassword(
          this.ENCRYPTION_SALT_STORAGE_KEY,
          salt
        );

        this.encryptionKey = key;
        this.encryptionSalt = salt;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('Failed to initialize encryption', { 
        error: new Error(errorMessage),
        component: 'Logger',
        action: 'initializeEncryption'
      });
      // Fall back to unencrypted logging if encryption setup fails
      this.encryptionKey = null;
      this.encryptionSalt = null;
    }
  }

  /**
   * Generate a secure random key for encryption
   */
  private async generateSecureKey(): Promise<string> {
    try {
      const randomBytes = await this.generateSecureRandomBytes(this.ENCRYPTION_KEY_SIZE);
      return await Aes.pbkdf2(
        randomBytes,
        this.encryptionSalt ?? await this.generateSecureRandomBytes(this.ENCRYPTION_KEY_SIZE),
        10000, // Iterations
        this.ENCRYPTION_KEY_SIZE,
        'sha256' // Hash algorithm
      );
    } catch (error) {
      throw new Error('Failed to generate secure key: ' + String(error));
    }
  }

  /**
   * Generate secure random bytes
   */
  private async generateSecureRandomBytes(size: number): Promise<string> {
    try {
      const key = await Aes.randomKey(size);
      return key;
    } catch (error) {
      throw new Error('Failed to generate random bytes: ' + String(error));
    }
  }

  /**
   * Encrypt sensitive data
   */
  private async encryptData(data: string): Promise<EncryptedData> {
    try {
      if (!this.encryptionKey || !this.encryptionSalt) {
        throw new Error('Encryption not initialized');
      }

      const iv = await this.generateSecureRandomBytes(this.ENCRYPTION_IV_SIZE);
      const ciphertext = await Aes.encrypt(
        data,
        this.encryptionKey,
        iv,
        'aes-256-cbc'
      );

      return {
        ciphertext,
        iv
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + String(error));
    }
  }

  /**
   * Decrypt encrypted data
   */
  private async decryptData(encryptedData: EncryptedData): Promise<string> {
    try {
      if (!this.encryptionKey || !this.encryptionSalt) {
        throw new Error('Encryption not initialized');
      }

      const decrypted = await Aes.decrypt(
        encryptedData.ciphertext,
        this.encryptionKey,
        encryptedData.iv,
        'aes-128-cbc'
      );

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + String(error));
    }
  }

  /**
   * Set up periodic log rotation
   */
  private setupLogRotation(): void {
    setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.rotateAndPersistLogs();
      }
    }, 60000); // Rotate every minute if needed
  }

  /**
   * Rotate and persist logs securely
   */
  private async rotateAndPersistLogs(): Promise<void> {
    try {
      const logsToRotate = [...this.logBuffer];
      this.logBuffer = [];
      
      // Encrypt sensitive logs before persisting
      const encryptedLogs = await Promise.all(logsToRotate.map(async log => 
        this.shouldEncryptLog(log) ? await this.encryptLogEntry(log) : log
      ));

      // Here we could persist to secure storage or send to secure logging service
      // For now, we'll just keep in memory with size limits
      this.logBuffer = encryptedLogs.slice(-this.MAX_LOG_BUFFER_SIZE);
    } catch (error) {
      console.error('Failed to rotate logs:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Check if log entry contains sensitive data requiring encryption
   */
  private shouldEncryptLog(log: StructuredLogEntry): boolean {
    return log.level === LogLevel.SECURITY || 
           log.metadata.userId !== undefined ||
           log.metadata.sessionId !== undefined;
  }

  /**
   * Basic encryption for sensitive log entries
   */
  private async encryptLogEntry(log: StructuredLogEntry): Promise<StructuredLogEntry> {
    try {
      if (!this.encryptionKey) {
        // Fall back to redaction if encryption is not available
        return {
          ...log,
          message: '[REDACTED] Encryption unavailable',
          metadata: {
            timestamp: log.timestamp,
            level: log.level,
            isRedacted: true
          }
        };
      }

      // Encrypt the sensitive parts
      const encryptedData = await this.encryptData(JSON.stringify({
        message: log.message,
        metadata: this.sanitizeMetadata(log.metadata)
      }));

      return {
        ...log,
        message: '[ENCRYPTED]',
        metadata: {
          ...log.metadata,
          isEncrypted: true,
          encryptedAt: new Date().toISOString(),
          encryptedData: encryptedData,
          integrity: {
            hash: await this.generateHMAC(log.message + JSON.stringify(log.metadata)),
            timestamp: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      // If encryption fails, redact sensitive data
      this.error('Log encryption failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        component: 'Logger',
        action: 'encryptLogEntry'
      });
      
      return {
        ...log,
        message: '[REDACTED] Log encryption failed',
        metadata: {
          timestamp: log.timestamp,
          level: log.level,
          isRedacted: true,
          error: new Error('Encryption failed')
        }
      };
    }
  }

  /**
   * Generate HMAC for log integrity
   */
  private async generateHMAC(data: string): Promise<string> {
    try {
      if (!this.encryptionKey || !this.encryptionSalt) {
        throw new Error('Encryption not initialized');
      }

      const hmac = await Aes.hmac256(
        data,
        this.encryptionKey
      );
      return hmac;
    } catch (error) {
      throw new Error('HMAC generation failed: ' + String(error));
    }
  }
  
  private generateSessionId(): string {
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    return `mobile_session_${timestamp.toString()}_${randomValue}`;
  }

  /**
   * Sanitizes log data to comply with privacy regulations
   */
  private sanitizeMetadata(data?: Record<string, unknown>): LogMetadata {
    if (data === undefined || data === null) {
      return {};
    }
    
    const sanitized: LogMetadata = {};
    const sensitiveFields = [
      'password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey', 
      'authorization', 'auth', 'credentials', 'credit', 'card', 'ccv', 'cvv', 'ssn', 
      'social', 'address', 'phone', 'birth', 'zip', 'postal', 'payment'
    ];
    
    const hashValue = (value: string): string => {
      if (value === undefined || value === null || value === '') {
        return 'empty';
      }
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16).substring(0, 8);
    };
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (typeof value === 'string' && value !== '') {
          sanitized[key] = `[REDACTED:${hashValue(value)}]`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (value instanceof Error) {
        // Process error safely
        const stackLines = value.stack?.split('\n') ?? [];
        const sensitivePatterns = [
          /password=/i,
          /api_?key=/i,
          /secret=/i,
          /token=/i,
          /auth=/i,
          /bearer /i,
          /basic /i,
          /\/users\/\d+/i,
          /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,
          /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
        ];
        
        // Filter sensitive info from stack if in development
        const sanitizedStack = this.isDevelopment ? 
          stackLines
            .filter(line => !sensitivePatterns.some(pattern => pattern.test(line)))
            .join('\n')
          : undefined;

        sanitized[key] = {
          message: value.message ?? 'Unknown error',
          stack: sanitizedStack,
          name: value.name ?? 'Error',
          code: (value as Error & { code?: string }).code ?? 'UNKNOWN'
        };
      } else if (value !== null && typeof value === 'object') {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private formatLogMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const sanitized = this.sanitizeMetadata(metadata);
    
    const parts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      message,
    ];
    
    if (Object.keys(sanitized).length > 0) {
      parts.push(JSON.stringify(sanitized, null, 2));
    }
    
    return parts.join(' ');
  }

  /**
   * Core logging function
   */
  private validateLogEntry(message: string, metadata?: LogMetadata): boolean {
    if (message.length === 0) {
      return false;
    }

    // Check total log size
    const totalSize = new TextEncoder().encode(
      JSON.stringify({ message, metadata })
    ).length;

    if (totalSize > this.MAX_LOG_SIZE) {
      this.warn('Log entry exceeded maximum size limit', {
        size: totalSize,
        limit: this.MAX_LOG_SIZE,
        truncated: true
      });
      return false;
    }

    return true;
  }

  /**
   * Check and update rate limits for a specific log level
   */
  private checkRateLimit(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // No rate limiting in development
    }

    const now = Date.now();
    const tracking = this.rateTracking[level];
    const limits = this.rateLimits[level];

    // Reset if interval has passed
    if (now - tracking.resetTime >= limits.interval) {
      tracking.count = 0;
      tracking.resetTime = now;
    }

    // Check if within limits
    if (tracking.count >= limits.points) {
      return false;
    }

    tracking.count++;
    return true;
  }

  /**
   * Apply general rate limiting with backoff
   */
  private applyRateLimit(): boolean {
    if (this.isDevelopment) {
      return true;
    }

    const now = Date.now();
    const timeSinceLastLog = now - this.lastLogTime;

    if (timeSinceLastLog < this.rateLimitBackoff) {
      // Increase backoff for frequent logging
      this.rateLimitBackoff = Math.min(this.rateLimitBackoff * 2, 5000);
      return false;
    }

    // Reset backoff if enough time has passed
    if (timeSinceLastLog > 1000) {
      this.rateLimitBackoff = 100;
    }

    this.lastLogTime = now;
    return true;
  }

  /**
   * Add entry to offline buffer
   */
  private async bufferOfflineLog(entry: StructuredLogEntry): Promise<void> {
    // Only buffer important logs
    if (entry.level === LogLevel.DEBUG || entry.level === LogLevel.INFO) {
      return;
    }

    try {
      // Add to memory buffer
      this.offlineBuffer.push(entry);
      
      // Trim buffer if it exceeds size limit
      if (this.offlineBuffer.length > this.MAX_OFFLINE_BUFFER_SIZE) {
        // Keep most recent logs, removing oldest
        this.offlineBuffer = this.offlineBuffer.slice(-this.MAX_OFFLINE_BUFFER_SIZE);
      }

      // Persist to secure storage
      const storageKey = `offline_log_${entry.timestamp}_${this.hashIdentifier(entry.message)}`;
      const encryptedData = await this.encryptData(JSON.stringify(entry));
      
      await EncryptedStorage.setItem(
        storageKey,
        JSON.stringify({
          data: encryptedData,
          timestamp: entry.timestamp,
          level: entry.level,
          hash: await this.generateHMAC(JSON.stringify(entry))
        })
      );

      // Clean up old entries from storage
      await this.cleanupOldOfflineLogs();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('Failed to buffer offline log', { 
        error: new Error(errorMessage),
        component: 'Logger',
        action: 'bufferOfflineLog'
      });
    }
  }

  /**
   * Clean up old offline logs from secure storage
   */
  private async cleanupOldOfflineLogs(): Promise<void> {
    try {
      // Get all storage keys
      const allKeys = Object.keys(await EncryptedStorage.getItem('__keys__') || {});
      const offlineLogKeys = allKeys.filter((key): key is string => key.startsWith('offline_log_'));

      // Sort by timestamp (embedded in key)
      offlineLogKeys.sort((a, b) => {
        const [, , timestampA = '0'] = a.split('_');
        const [, , timestampB = '0'] = b.split('_');
        return timestampA.localeCompare(timestampB);
      });

      // Remove oldest entries if we exceed the limit
      const logsToRemove = offlineLogKeys.slice(0, -this.MAX_OFFLINE_BUFFER_SIZE);
      await Promise.all(logsToRemove.map(key => EncryptedStorage.removeItem(key)));

      // Log cleanup
      if (logsToRemove.length > 0) {
        this.info('Cleaned up old offline logs', {
          component: 'Logger',
          action: 'cleanupOldOfflineLogs',
          removedCount: logsToRemove.length
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('Failed to cleanup old offline logs', { 
        error: new Error(errorMessage),
        component: 'Logger',
        action: 'cleanupOldOfflineLogs'
      });
    }
  }

  /**
   * Load persisted offline logs from secure storage
   */
  /**
   * Load persisted logs from secure storage on initialization
   * @private
   */
  private async loadOfflineLogs(): Promise<void> {
    try {
      // Get all stored keys
      const allKeys = Object.keys(await EncryptedStorage.getItem('__keys__') || {});
      const offlineLogKeys = allKeys.filter((key: string): key is StorageKey => 
        key.startsWith('offline_log_')
      );

      // Load and decrypt all logs
      const encryptedLogs = await Promise.all(
        offlineLogKeys.map(async (key: StorageKey) => {
          try {
            const encrypted = await EncryptedStorage.getItem(key);
            if (!encrypted) return null;

            const parsedItem = JSON.parse(encrypted) as EncryptedLogStorageItem;
            return { key, ...parsedItem };
          } catch (error) {
            // Clean up corrupted entries
            await EncryptedStorage.removeItem(key);
            return null;
          }
        })
      );

      // Process valid logs
      for (const log of encryptedLogs) {
        if (!log) continue;

        try {
          const decrypted = await this.decryptData(log.data);
          const entry = JSON.parse(decrypted) as StructuredLogEntry;

          // Verify integrity
          const calculatedHash = await this.generateHMAC(JSON.stringify(entry));
          if (calculatedHash !== log.hash) {
            this.error('Offline log integrity check failed', {
              error: new Error('Log tampering detected'),
              component: 'Logger',
              action: 'loadOfflineLogs',
              key: log.key
            });
            await EncryptedStorage.removeItem(log.key);
            continue;
          }

          this.offlineBuffer.push(entry);
        } catch (decryptError) {
          // Remove corrupted log
          await EncryptedStorage.removeItem(log.key);
          // Log error details
          const errorMessage = decryptError instanceof Error ? decryptError.message : String(decryptError);
          this.error('Failed to decrypt offline log', {
            error: new Error(errorMessage),
            component: 'Logger',
            action: 'loadOfflineLogs',
            key: log.key
          });
        }
      }

      // Sort and trim buffer
      this.offlineBuffer.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      if (this.offlineBuffer.length > this.MAX_OFFLINE_BUFFER_SIZE) {
        this.offlineBuffer = this.offlineBuffer.slice(-this.MAX_OFFLINE_BUFFER_SIZE);
      }

      // Log success
      this.info('Offline logs loaded successfully', {
        component: 'Logger',
        action: 'loadOfflineLogs',
        logsLoaded: this.offlineBuffer.length
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('Failed to load offline logs', { 
        error: new Error(errorMessage),
        component: 'Logger',
        action: 'loadOfflineLogs'
      });
    }
  }

  /**
   * Get buffer metrics for monitoring
   */
  private getBufferMetrics(): LogBufferMetrics {
    const criticalEntries = this.offlineBuffer.filter(
      entry => entry.level === LogLevel.ERROR || entry.level === LogLevel.SECURITY
    ).length;

    let oldestEntry: Date | null = null;
    let latestEntry: Date | null = null;

    if (this.offlineBuffer.length > 0) {
      const firstEntry = this.offlineBuffer[0];
      const lastEntry = this.offlineBuffer[this.offlineBuffer.length - 1];
      
      if (firstEntry && firstEntry.timestamp) {
        oldestEntry = new Date(firstEntry.timestamp);
      }
      
      if (lastEntry && lastEntry.timestamp) {
        latestEntry = new Date(lastEntry.timestamp);
      }
    }

    return {
      totalEntries: this.offlineBuffer.length,
      criticalEntries,
      oldestEntry,
      latestEntry
    };
  }

  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // Skip debug logs in production
    if (!this.isDevelopment && level === LogLevel.DEBUG) {
      return;
    }

    // Validate log entry
    if (!this.validateLogEntry(message, metadata)) {
      return;
    }

    // Apply both general and level-specific rate limiting
    if (!this.applyRateLimit() || !this.checkRateLimit(level)) {
      // Buffer important logs that were rate limited
      if (level === LogLevel.ERROR || level === LogLevel.SECURITY) {
        const timestamp = new Date().toISOString();
        this.bufferOfflineLog({
          message: `[Rate Limited] ${message}`,
          level,
          timestamp,
          metadata: {
            ...metadata,
            rateLimited: true,
            originalTimestamp: timestamp
          }
        });
      }
      return;
    }
    
    // Add standard metadata
    const enhancedMetadata: LogMetadata = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      version: this.appVersion,
      userId: this.userInfo?.id !== undefined ? this.userInfo.id : 'anonymous',
      ...metadata,
      // Add security context
      securityContext: {
        environment: this.isDevelopment ? 'development' : 'production',
        sessionHash: this.hashIdentifier(this.sessionId),
        logId: this.hashIdentifier(`${level}_${Date.now()}_${message}`)
      }
    };

    const formattedMessage = this.formatLogMessage(level, message, enhancedMetadata);
    const sanitized = this.sanitizeMetadata(enhancedMetadata);

    // Create structured log entry
    const logEntry: StructuredLogEntry = {
      message,
      level,
      timestamp: enhancedMetadata.timestamp ?? new Date().toISOString(),
      metadata: sanitized
    };

    // Add to buffer for potential offline persistence
    this.bufferOfflineLog(logEntry);

    // Console logging (only in development) - using logger methods instead of console
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          // Use console.warn for debug in development
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          // Use console.warn for info in development
          console.warn(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.SECURITY:
          console.warn(`🔒 ${formattedMessage}`);
          break;
        case LogLevel.PERFORMANCE:
          console.warn(`⚡ ${formattedMessage}`);
          break;
      }
    }

    // Send to Sentry for errors and security events with enhanced context
    if (level === LogLevel.ERROR || level === LogLevel.SECURITY) {
      try {
        // Create secure fingerprint for error grouping
        const fingerprint = this.generateErrorFingerprint(message, metadata);
        
        if (metadata?.error instanceof Error) {
          // Enhanced error capture with secure context
          sentry.captureException(metadata.error, {
            extra: sanitized,
            tags: {
              logLevel: level,
              errorType: metadata.error.name,
              errorCode: (metadata.error as Error & { code?: string }).code,
              ...(metadata.tags !== undefined ? Object.fromEntries(metadata.tags.map(tag => [tag, true])) : {})
            },
            fingerprint,
            // Add secure transaction data if available
            ...(metadata.correlationId ? { 
              transaction: `${metadata.component ?? 'unknown'}.${metadata.action ?? 'action'}`,
              transactionHash: this.hashIdentifier(metadata.correlationId)
            } : {})
          });
        } else {
          const sentryLevel = level === 'security' ? 'warning' : 'error';
          
          // Set secure context before capturing message
          const secureContext = {
            ...sanitized,
            timestamp: new Date().toISOString(),
            sessionHash: this.hashIdentifier(this.sessionId),
            environment: this.isDevelopment ? 'development' : 'production'
          };
          
          sentry.setContext('metadata', secureContext);
          sentry.captureMessage(message, sentryLevel);
        }

        // Clean up sensitive context after sending
        this.clearSentryContext();
      } catch (error) {
        // Fallback to console if Sentry fails
        if (this.isDevelopment) {
          console.error('Failed to send to Sentry:', 
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.ERROR, message, metadata);
  }
  
  /**
   * Log security-related events
   */
  security(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.SECURITY, message, { 
      ...metadata, 
      tags: [...(metadata?.tags !== undefined && metadata.tags !== null ? metadata.tags : []), 'security'] 
    });
  }
  
  /**
   * Log performance metrics
   */
  performance(operation: string, durationMs: number, metadata?: LogMetadata): void {
    this.log(LogLevel.PERFORMANCE, `${operation} completed in ${String(durationMs)}ms`, {
      ...metadata,
      duration: durationMs,
      operation,
      tags: [...(metadata?.tags !== undefined && metadata.tags !== null ? metadata.tags : []), 'performance']
    });
  }
  
  /**
   * Create a performance timer that logs when stopped
   */
  startTimer(operation: string): () => void {
    const startTime = Date.now();
    return (metadata?: LogMetadata) => {
      const duration = Math.round(Date.now() - startTime);
      this.performance(operation, duration, metadata);
    };
  }

  /**
   * Set user context for logging systems
   */
  setUser(user: { id: string; email: string; username: string }): void {
    if (user === undefined || user === null || 
        user.id === undefined || user.id === null || user.id === '' ||
        user.email === undefined || user.email === null || user.email === '' ||
        user.username === undefined || user.username === null || user.username === '') {
      throw new Error('Invalid user data provided to logger');
    }

    this.userInfo = user;
    
    // Update Sentry user context
    sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
    
    this.info('User context set', { 
      userId: user.id,
      tags: ['user-context'],
      level: LogLevel.INFO
    } as LogMetadata);
  }

  /**
   * Add breadcrumb for tracing and debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    const sanitizedData = this.sanitizeMetadata(data);
    
    // Add secure breadcrumb with enhanced context
    try {
      const secureBreadcrumb = {
        message: this.truncateString(message, 1000), // Limit message size
        category: this.validateCategory(category),
        data: sanitizedData,
        level: 'info',
        timestamp: Date.now() / 1000,
        // Add security context
        sessionHash: this.hashIdentifier(this.sessionId),
        sourceComponent: data?.['component'] ?? 'unknown'
      };

      sentry.addBreadcrumb(secureBreadcrumb);
      
      // Debug log the breadcrumb in development
      if (this.isDevelopment) {
        this.debug(`Breadcrumb: ${message}`, { 
          category, 
          ...sanitizedData,
          securityHash: this.hashIdentifier(message)
        });
      }
    } catch (error) {
      // Fail silently but log locally
      if (this.isDevelopment) {
        console.warn('Failed to add breadcrumb:', 
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }
  
  // ===== SECURITY CONTROLS =====



  async exportAuditLogs(options: AuditLogRequest = {}): Promise<AuditLogExport> {
    try {
      const {
        startDate,
        endDate = new Date(),
        levels = Object.values(LogLevel),
        includeMetrics = false
      } = options;

      // Validate inputs
      if (endDate < (startDate ?? new Date(0))) {
        throw new Error('End date must be after start date');
      }

      // Filter and sanitize logs with proper type handling
      const filteredLogs = [...this.logBuffer, ...this.offlineBuffer]
        .filter(entry => {
          if (!entry.timestamp) {
            return false;
          }
          const entryDate = new Date(entry.timestamp);
          if (isNaN(entryDate.getTime())) {
            return false;
          }
          const matchesDate = startDate ? entryDate >= startDate && entryDate <= endDate : true;
          const matchesLevel = levels.includes(entry.level);
          return matchesDate && matchesLevel;
        })
        .map(entry => ({
          ...entry,
          metadata: this.sanitizeMetadata(entry.metadata)
        }));

      const exportData = {
        logs: filteredLogs,
        ...(includeMetrics ? { metrics: this.getBufferMetrics() } : {}),
        exportMetadata: {
          timestamp: new Date().toISOString(),
          exportId: this.hashIdentifier(`audit_${Date.now()}`),
          filters: {
            startDate: startDate?.toISOString(),
            endDate: endDate.toISOString(),
            levels,
            includeMetrics,
            contentHash: undefined,
            totalEntries: undefined
          }
        }
      };

      // Add integrity verification
      const contentHash = this.hashIdentifier(JSON.stringify(exportData.logs));
      exportData.exportMetadata.filters.contentHash = contentHash;
      exportData.exportMetadata.filters.totalEntries = filteredLogs.length;

      // Log export attempt for security audit
      this.security('Audit logs exported', {
        exportId: exportData.exportMetadata.exportId,
        entriesCount: filteredLogs.length,
        timeRange: {
          start: startDate?.toISOString(),
          end: endDate.toISOString()
        },
        contentHash
      });

      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('Failed to export audit logs', {
        error: new Error(errorMessage),
        options
      });
      throw new Error('Audit log export failed: ' + errorMessage);
    }
  }

  /**
   * Generate a secure fingerprint for error grouping
   */
  private generateErrorFingerprint(message: string, metadata?: LogMetadata): string[] {
    const components = [
      metadata?.component ?? 'unknown',
      metadata?.action ?? 'action',
      // Hash message to normalize it for grouping
      this.hashIdentifier(message)
    ];

    if (metadata?.error instanceof Error) {
      components.push(
        metadata.error.name,
        (metadata.error as Error & { code?: string }).code ?? 'UNKNOWN'
      );
    }

    if (metadata?.tags !== undefined) {
      components.push(...metadata.tags);
    }

    return components;
  }

  /**
   * Create a secure hash for identifiers
   */
  private hashIdentifier(value: string): string {
    // Simple but consistent hashing for grouping
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36).substring(0, 8);
  }

  /**
   * Clear sensitive context data from Sentry
   */
  private clearSentryContext(): void {
    try {
      sentry.setContext('metadata', {});
      sentry.setUser({});
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Export logs securely for audit purposes with enhanced security and validation
   */
  async exportSecureAuditLogs(options: {
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    levels?: LogLevel[] | undefined;
    includeMetrics?: boolean | undefined;
  } = {}): Promise<{
    logs: StructuredLogEntry[];
    metrics: LogBufferMetrics;
    exportMetadata: {
      timestamp: string;
      exportId: string;
      filters: AuditLogFilters;
    };
  }> {
    try {
      const {
        startDate,
        endDate = new Date(),
        levels = Object.values(LogLevel),
        includeMetrics = false
      } = options;

      // Validate input dates
      if (endDate < (startDate ?? new Date(0))) {
        throw new Error('End date must be after start date');
      }

      // Create a secure copy of logs with filtering
      const filteredLogs = [...this.logBuffer, ...this.offlineBuffer]
        .filter(entry => {
          if (!entry.timestamp) {
            return false;
          }
          const entryDate = new Date(entry.timestamp);
          if (isNaN(entryDate.getTime())) {
            return false;
          }
          const matchesDate = startDate ? entryDate >= startDate && entryDate <= endDate : true;
          const matchesLevel = levels.includes(entry.level);
          return matchesDate && matchesLevel;
        })
        .map(entry => ({
          ...entry,
          metadata: this.sanitizeMetadata(entry.metadata)
        }));

      // Get current metrics
      const metrics = this.getBufferMetrics();

      // Calculate integrity hash
      const contentHash = this.hashIdentifier(JSON.stringify(filteredLogs));

      const exportData = {
        logs: filteredLogs,
        metrics,
        exportMetadata: {
          timestamp: new Date().toISOString(),
          exportId: this.hashIdentifier(`audit_${Date.now()}`),
          filters: {
            startDate: startDate?.toISOString() ?? undefined,
            endDate: endDate.toISOString(),
            levels,
            includeMetrics,
            contentHash,
            totalEntries: filteredLogs.length
          } as AuditLogFilters
        }
      };

      // Log export attempt for security audit
      this.security('Audit logs exported', {
        exportId: exportData.exportMetadata.exportId,
        entriesCount: filteredLogs.length,
        timeRange: {
          start: startDate?.toISOString() ?? 'beginning',
          end: endDate.toISOString()
        },
        contentHash
      });

      return exportData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error('Failed to export audit logs', {
        error: new Error(errorMessage),
        options
      });
      throw new Error('Audit log export failed: ' + errorMessage);
    }
  }

  /**
   * Validate and sanitize category strings
   */
  private validateCategory(category: string): string {
    // Only allow alphanumeric and basic punctuation
    return category.replace(/[^a-zA-Z0-9_.-]/g, '_')
      .substring(0, 100); // Limit length
  }

  /**
   * Safely truncate strings to prevent oversized logs
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Track feature usage
   */
  /**
   * Track feature usage with security context
   */
  trackFeature(feature: string, metadata?: LogMetadata): void {
    const enhancedMetadata = {
      ...metadata,
      feature,
      tags: [...(metadata?.tags !== undefined ? metadata.tags : []), 'feature-usage'],
      // Add security tracking
      trackingId: this.hashIdentifier(`${feature}_${Date.now()}`),
      featureHash: this.hashIdentifier(feature),
      // Add execution context
      timestamp: new Date().toISOString(),
      sessionHash: this.hashIdentifier(this.sessionId)
    };

    this.info(`Feature used: ${feature}`, enhancedMetadata);
  }

  // ===== SECURITY CONTROLS =====

  /**
   * Rate limiting for log messages
   */
  private lastLogTime: number = 0;
  // Rate limiting now uses dynamic backoff via rateLimitBackoff


  /**
   * Structured logging for security events
   */
  /**
   * Structured logging for security events with enhanced context and validation
   */
  logSecurityEvent(event: string, details: Record<string, unknown>): void {
    // Validate event name
    const safeEvent = this.validateCategory(event);
    const sanitizedDetails = this.sanitizeMetadata(details);
    
    // Add security-specific context
    const enhancedDetails = {
      ...sanitizedDetails,
      eventType: safeEvent,
      timestamp: new Date().toISOString(),
      sessionHash: this.hashIdentifier(this.sessionId),
      securityLevel: 'standard',
      // Add security scanning markers
      contentHash: this.hashIdentifier(JSON.stringify(sanitizedDetails)),
      // Add execution context
      component: String(details['component'] ?? 'unknown'),
      action: String(details['action'] ?? 'unknown'),
      // Add tracking
      eventId: this.hashIdentifier(`${safeEvent}_${Date.now()}`),
      environmentHash: this.hashIdentifier(this.isDevelopment ? 'development' : 'production')
    };

    this.security(`Security Event: ${safeEvent}`, enhancedDetails);

    // Clear sensitive context after logging
    this.clearSentryContext();
  }
}

export const logger = new MobileLogger();
