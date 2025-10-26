/**
 * Enhanced Encryption Utilities (2025 Standards)
 * - Secure key derivation with scrypt
 * - AES-256-GCM authenticated encryption
 * - Key rotation support
 * - Salt management
 * - Proper IV handling
 */

import crypto from 'crypto';
import { promisify } from 'util';
import logger from './logger';

// Modern encryption constants
const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12;          // GCM recommended 12 bytes
const KEY_LENGTH = 32;         // 256 bits
const SALT_LENGTH = 16;        // 128 bits
const TAG_LENGTH = 16;         // 128 bits
const VERSION = 1;             // For future algorithm upgrades
const CURRENT_KEY_VERSION = 1; // For key rotation

// Promisify crypto functions for async usage
const scryptAsync = promisify(crypto.scrypt);

/**
 * Encryption info returned by getEncryptionInfo
 */
export interface IEncryptionInfo {
  isEncrypted: boolean;
  version?: number;
  keyVersion?: number;
  contentLength?: number;
}

/**
 * Get encryption key with rotation support
 * @param version - Key version to use (for key rotation)
 * @returns Derived encryption key
 */
async function getKey(version: number = CURRENT_KEY_VERSION): Promise<Buffer> {
  // Get the appropriate key based on version
  let keyString: string | undefined;
  
  switch (version) {
    case 1:
      keyString = process.env.CONFIG_ENCRYPTION_KEY;
      break;
    case 2: 
      keyString = process.env.CONFIG_ENCRYPTION_KEY_V2;
      break;
    default:
      throw new Error(`Unsupported key version: ${version}`);
  }
  
  if (!keyString) {
    throw new Error(`Missing encryption key for version ${version}`);
  }
  
  return Buffer.from(keyString, 'utf8');
}

/**
 * Derive a secure key from raw key material
 * @param key - Raw key material
 * @param salt - Salt for key derivation
 * @returns Derived key
 */
async function deriveKey(key: Buffer, salt: Buffer): Promise<Buffer> {
  try {
    // Use scrypt with secure parameters
    // Note: Node.js crypto.scrypt uses default secure parameters internally
    return await scryptAsync(key, salt, KEY_LENGTH) as Buffer;
  } catch (error) {
    logger.error('Key derivation failed', { error: (error as Error).message });
    throw new Error('Encryption key derivation failed');
  }
}

/**
 * Encrypt data using AES-256-GCM with key derivation
 * @param text - Text to encrypt
 * @param keyVersion - Version of the key to use
 * @returns Encrypted data in base64 format
 */
export async function encrypt(text: string, keyVersion: number = CURRENT_KEY_VERSION): Promise<string> {
  if (!text) return '';
  
  try {
    // Generate random IV and salt
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Get and derive the key
    const rawKey = await getKey(keyVersion);
    const derivedKey = await deriveKey(rawKey, salt);
    
    // Encrypt the data with authentication
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv, {
      authTagLength: TAG_LENGTH
    });
    
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    // Format: VERSION + KEY_VERSION + SALT + IV + TAG + ENCRYPTED
    // This format allows for future algorithm changes and key rotation
    const versionBuffer = Buffer.alloc(1);
    versionBuffer.writeUInt8(VERSION);
    
    const keyVersionBuffer = Buffer.alloc(1);
    keyVersionBuffer.writeUInt8(keyVersion);
    
    return Buffer.concat([
      versionBuffer,
      keyVersionBuffer,
      salt,
      iv,
      tag,
      encrypted
    ]).toString('base64');
  } catch (error) {  
    logger.error('Encryption failed', { error: (error as Error).message });
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data that was encrypted using the encrypt function
 * @param enc - Base64 encoded encrypted data
 * @returns Decrypted text
 */
export async function decrypt(enc: string): Promise<string> {
  if (!enc) return '';
  
  try {
    // Parse the encrypted data
    const data = Buffer.from(enc, 'base64');
    
    // Extract version information
    const version = data.readUInt8(0);
    const keyVersion = data.readUInt8(1);
    
    // Ensure we support this version
    if (version !== VERSION) {
      throw new Error(`Unsupported encryption version: ${version}`);
    }
    
    // Extract components based on our format
    // Format: VERSION(1) + KEY_VERSION(1) + SALT(16) + IV(12) + TAG(16) + ENCRYPTED
    const salt = data.slice(2, 2 + SALT_LENGTH);
    const iv = data.slice(2 + SALT_LENGTH, 2 + SALT_LENGTH + IV_LENGTH);
    const tag = data.slice(2 + SALT_LENGTH + IV_LENGTH, 2 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = data.slice(2 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Get and derive the key using the same version as when encrypted
    const rawKey = await getKey(keyVersion);
    const derivedKey = await deriveKey(rawKey, salt);
    
    // Decrypt with authentication
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv, {
      authTagLength: TAG_LENGTH
    });
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Decryption failed', { error: (error as Error).message });
    throw new Error('Decryption failed. Data may be corrupted or tampered with.');
  }
}

/**
 * Rotates encryption keys by re-encrypting with a new key
 * @param encryptedData - Data encrypted with old key
 * @param newKeyVersion - New key version to use
 * @returns Data re-encrypted with new key
 */
export async function rotateKey(encryptedData: string, newKeyVersion: number = CURRENT_KEY_VERSION): Promise<string> {
  // Decrypt with the old key
  const decrypted = await decrypt(encryptedData);
  
  // Re-encrypt with the new key
  return encrypt(decrypted, newKeyVersion);
}

/**
 * Checks if a value is encrypted
 * @param value - Value to check
 * @returns True if the value is likely encrypted
 */
export function isEncrypted(value: unknown): boolean {
  if (!value || typeof value !== 'string') return false;
  
  try {
    // Try to decode as base64
    const data = Buffer.from(value, 'base64');
    
    // Check minimum length and version byte
    return data.length >= (2 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH) && 
           data.readUInt8(0) === VERSION;
  } catch {
    return false;
  }
}

/**
 * Gets information about encrypted data without decrypting it
 * @param encryptedData - Encrypted data
 * @returns Information about the encrypted data
 */
export function getEncryptionInfo(encryptedData: string): IEncryptionInfo {
  if (!encryptedData || !isEncrypted(encryptedData)) {
    return { isEncrypted: false };
  }
  
  try {
    const data = Buffer.from(encryptedData, 'base64');
    return {
      isEncrypted: true,
      version: data.readUInt8(0),
      keyVersion: data.readUInt8(1),
      contentLength: data.length - (2 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    };
  } catch {
    return { isEncrypted: false };
  }
}

