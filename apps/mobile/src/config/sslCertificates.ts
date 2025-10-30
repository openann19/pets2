/**
 * SSL Certificate Configuration for PawfectMatch
 * Certificate fingerprints for SSL pinning
 *
 * IMPORTANT SECURITY NOTES:
 * 1. Never commit real certificate fingerprints to version control
 * 2. Use environment variables or secure configuration for production certificates
 * 3. Regularly rotate certificates and update fingerprints
 * 4. Test certificate changes in staging before production deployment
 */

// Certificate fingerprints configuration
// In production, these should be loaded from secure environment variables
export const SSL_CERTIFICATES = {
  // Production API certificates
  'api.pawfectmatch.com': [
    {
      algorithm: 'sha256',
      // Placeholder - replace with actual certificate fingerprint
      value: process.env['EXPO_PUBLIC_API_CERT_SHA256'] || 'PLACEHOLDER_CERT_SHA256',
    },
    {
      algorithm: 'sha1',
      // Backup certificate fingerprint
      value: process.env['EXPO_PUBLIC_API_CERT_SHA1'] || 'PLACEHOLDER_CERT_SHA1',
    },
  ],

  // WebSocket certificates (if using secure WebSocket)
  'ws.pawfectmatch.com': [
    {
      algorithm: 'sha256',
      value: process.env['EXPO_PUBLIC_WS_CERT_SHA256'] || 'PLACEHOLDER_WS_CERT_SHA256',
    },
  ],

  // Development certificates (only for __DEV__ builds)
  ...(process.env.NODE_ENV === 'development'
    ? {
        'localhost': [
          // Allow self-signed certificates in development
          // In production, remove localhost configuration
        ],
        '10.0.2.2': [
          // Android emulator localhost
        ],
        '127.0.0.1': [
          // iOS simulator localhost
        ],
      }
    : {}),
};

// SSL pinning configuration
export const SSL_CONFIG = {
  // Enable SSL pinning in production builds
  enabled: process.env.NODE_ENV === 'production' || !__DEV__,

  // Timeout for SSL operations
  timeout: 30000,

  // Certificate validation mode
  // 'strict' - only allow pinned certificates
  // 'permissive' - allow pinned certificates, fallback to system validation
  mode: 'strict' as 'strict' | 'permissive',

  // Domains that require SSL pinning
  pinnedDomains: Object.keys(SSL_CERTIFICATES),

  // Retry configuration for SSL failures
  retries: {
    count: 3,
    delay: 1000,
    backoff: 2,
  },
};

/**
 * Validate SSL certificate configuration
 */
export function validateSSLConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if certificates are configured
  if (SSL_CONFIG.enabled && Object.keys(SSL_CERTIFICATES).length === 0) {
    errors.push('SSL pinning is enabled but no certificates are configured');
  }

  // Check for placeholder values in production
  if (SSL_CONFIG.enabled) {
    Object.entries(SSL_CERTIFICATES).forEach(([domain, certs]) => {
      certs.forEach((cert, index) => {
        if (cert.value.includes('PLACEHOLDER')) {
          errors.push(`Certificate ${index + 1} for ${domain} contains placeholder value`);
        }
      });
    });
  }

  // Validate certificate formats
  Object.entries(SSL_CERTIFICATES).forEach(([domain, certs]) => {
    certs.forEach((cert, index) => {
      if (!['sha1', 'sha256', 'sha384', 'sha512'].includes(cert.algorithm)) {
        errors.push(
          `Invalid algorithm '${cert.algorithm}' for certificate ${index + 1} on ${domain}`,
        );
      }

      // Basic fingerprint format validation
      const expectedLengthMap = {
        sha1: 40,
        sha256: 64,
        sha384: 96,
        sha512: 128,
      } as const;
      const expectedLength = expectedLengthMap[cert.algorithm as keyof typeof expectedLengthMap];

      if (expectedLength && cert.value.replace(/:/g, '').length !== expectedLength) {
        errors.push(
          `Invalid ${cert.algorithm} fingerprint length for certificate ${index + 1} on ${domain}`,
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get SSL configuration for a specific domain
 */
export function getSSLConfigForDomain(domain: string): any {
  const certificates = SSL_CERTIFICATES[domain as keyof typeof SSL_CERTIFICATES];

  if (!certificates || certificates.length === 0) {
    if (__DEV__) {
      // In development, allow untrusted certificates
      return {
        sslPinning: {
          certs: 'public',
        },
      };
    }
    throw new Error(`No SSL certificates configured for domain: ${domain}`);
  }

  return {
    sslPinning: {
      certs: certificates,
    },
    timeoutInterval: SSL_CONFIG.timeout,
  };
}

/**
 * Security status report
 */
export function getSSLStatus(): {
  pinningEnabled: boolean;
  certificatesConfigured: number;
  domainsCovered: string[];
  configurationValid: boolean;
  validationErrors: string[];
} {
  const validation = validateSSLConfig();

  return {
    pinningEnabled: SSL_CONFIG.enabled,
    certificatesConfigured: Object.values(SSL_CERTIFICATES).flat().length,
    domainsCovered: Object.keys(SSL_CERTIFICATES),
    configurationValid: validation.valid,
    validationErrors: validation.errors,
  };
}
