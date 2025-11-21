/**
 * Security Service for PawfectMatch
 * Advanced security utilities and threat detection
 */

import crypto from 'crypto';
import logger from '../utils/logger';

class SecurityService {
  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password with salt
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [salt, hashedPassword] = hash.split(':');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return verifyHash === hashedPassword;
    } catch (error) {
      logger.error('Error verifying password', { error });
      return false;
    }
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string, key: string): string {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Error decrypting data', { error });
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Detect suspicious activity
   */
  detectSuspiciousActivity(activity: any): { isSuspicious: boolean; riskScore: number; reasons: string[] } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for rapid requests
    if (activity.requestCount > 100) {
      reasons.push('High request volume');
      riskScore += 30;
    }

    // Check for unusual IP patterns
    if (activity.ipChanges > 5) {
      reasons.push('Multiple IP addresses');
      riskScore += 20;
    }

    // Check for failed login attempts
    if (activity.failedLogins > 3) {
      reasons.push('Multiple failed login attempts');
      riskScore += 25;
    }

    // Check for unusual user agent
    if (activity.userAgent.includes('bot') || activity.userAgent.includes('crawler')) {
      reasons.push('Suspicious user agent');
      riskScore += 15;
    }

    return {
      isSuspicious: riskScore > 50,
      riskScore,
      reasons
    };
  }

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length > 0;
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }
}

export default new SecurityService();
