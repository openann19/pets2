# SSL Pinning Implementation Guide

## Overview

SSL Pinning is a security mechanism that helps prevent man-in-the-middle attacks
by ensuring that the app only accepts connections from servers with specific SSL
certificates.

## Current Implementation

The API service includes a framework for SSL pinning with the following
features:

- **Development Mode**: Uses regular fetch for easier debugging
- **Production Mode**: Implements SSL pinning with fallback to regular fetch
- **Certificate Management**: Configurable certificate hashes per domain
- **Error Handling**: Graceful fallback if SSL pinning fails

## Required Dependencies

To implement full SSL pinning, install one of these React Native libraries:

```bash
# Option 1: react-native-ssl-pinning (Recommended)
npm install react-native-ssl-pinning
cd ios && pod install # For iOS

# Option 2: react-native-cert-pinner
npm install react-native-cert-pinner
cd ios && pod install # For iOS

# Option 3: Custom implementation with react-native-keychain
npm install react-native-keychain
cd ios && pod install # For iOS
```

## Certificate Configuration

### 1. Get Your SSL Certificate Hashes

For your production API domain (`api.pawfectmatch.com`):

```bash
# Get certificate chain
openssl s_client -servername api.pawfectmatch.com -connect api.pawfectmatch.com:443 -showcerts

# Extract certificate and get SHA256 hash
openssl x509 -in certificate.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
```

### 2. Update Certificate Configuration

Replace the placeholder certificates in `api.ts`:

```typescript
private getPinnedCertificates(): string[] {
  const certificates: Record<string, string[]> = {
    'api.pawfectmatch.com': [
      'sha256/YOUR_ACTUAL_CERTIFICATE_HASH_1=',
      'sha256/YOUR_ACTUAL_CERTIFICATE_HASH_2=',
    ],
    'localhost': [], // No pinning for localhost
  };

  const hostname = new URL(BASE_URL).hostname;
  return certificates[hostname] || [];
}
```

## Implementation Options

### Option 1: react-native-ssl-pinning

```typescript
import { fetch } from 'react-native-ssl-pinning';

private async makePinnedRequest(
  url: string,
  options: RequestInit,
  certificates: string[]
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    sslPinning: {
      certs: certificates,
    },
    timeoutInterval: this.NETWORK_TIMEOUT,
  });

  return response;
}
```

### Option 2: react-native-cert-pinner

```typescript
import { CertPinner } from 'react-native-cert-pinner';

private async makePinnedRequest(
  url: string,
  options: RequestInit,
  certificates: string[]
): Promise<Response> {
  const certPinner = new CertPinner();

  // Pin certificates
  certificates.forEach(cert => {
    certPinner.addPin(cert);
  });

  const response = await certPinner.fetch(url, options);
  return response;
}
```

## Security Best Practices

### 1. Certificate Rotation

- **Backup Certificates**: Always pin at least 2 certificates
- **Rotation Strategy**: Update certificates before they expire
- **Monitoring**: Monitor certificate expiration dates

### 2. Error Handling

- **Graceful Fallback**: Always provide fallback to regular HTTPS
- **User Notification**: Inform users of security issues
- **Logging**: Log SSL pinning failures for monitoring

### 3. Development vs Production

- **Development**: Disable SSL pinning for easier debugging
- **Production**: Enable SSL pinning with proper certificates
- **Testing**: Test both pinned and fallback scenarios

## Environment Configuration

Add SSL pinning configuration to your environment:

```bash
# Enable/disable SSL pinning
EXPO_PUBLIC_SSL_PINNING_ENABLED=true

# Certificate hashes (comma-separated)
EXPO_PUBLIC_SSL_PINNED_CERTS=sha256/hash1=,sha256/hash2=

# Fallback behavior
EXPO_PUBLIC_SSL_PINNING_FALLBACK=true
```

## Testing SSL Pinning

### 1. Test Certificate Validation

```bash
# Test with valid certificate
curl -k https://api.pawfectmatch.com/api/health

# Test with invalid certificate (should fail)
curl -k --cert invalid.pem https://api.pawfectmatch.com/api/health
```

### 2. Test Man-in-the-Middle Protection

- Use tools like Burp Suite or OWASP ZAP
- Attempt to intercept and modify requests
- Verify that SSL pinning prevents unauthorized connections

## Monitoring and Maintenance

### 1. Certificate Expiration Monitoring

```typescript
// Add certificate expiration check
private async checkCertificateExpiration(): Promise<void> {
  const certificates = this.getPinnedCertificates();
  // Implement certificate expiration checking logic
  // Alert when certificates are close to expiration
}
```

### 2. SSL Pinning Metrics

- Track SSL pinning success/failure rates
- Monitor certificate validation errors
- Alert on unusual SSL pinning patterns

## Troubleshooting

### Common Issues

1. **Certificate Mismatch**: Update certificate hashes
2. **Network Timeouts**: Adjust timeout values
3. **Fallback Failures**: Check fallback implementation
4. **Development Issues**: Ensure SSL pinning is disabled in dev mode

### Debug Mode

```typescript
// Enable SSL pinning debug logging
if (__DEV__) {
  logger.info('SSL Pinning Debug', {
    url,
    certificates,
    isPinningEnabled: !__DEV__,
  });
}
```

## Production Deployment Checklist

- [ ] Install SSL pinning library
- [ ] Configure production certificate hashes
- [ ] Test SSL pinning in staging environment
- [ ] Verify fallback behavior
- [ ] Set up certificate expiration monitoring
- [ ] Configure SSL pinning metrics
- [ ] Test man-in-the-middle protection
- [ ] Document certificate rotation process

## Security Considerations

- **Certificate Transparency**: Monitor certificate transparency logs
- **Key Pinning**: Consider implementing HTTP Public Key Pinning (HPKP)
- **Certificate Authority**: Use trusted certificate authorities
- **Regular Updates**: Keep SSL pinning library updated
- **Security Audits**: Regular security audits of SSL implementation
