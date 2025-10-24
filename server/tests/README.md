# PawfectMatch Server Tests

This directory contains comprehensive tests for the PawfectMatch server application, focusing on reliability, security, and edge case handling.

## Test Structure

- **Integration Tests**: Located in `/tests/integration/`
  - `auth/`: Authentication flow tests including token lifecycle and concurrent sessions
  - `premium/`: Premium subscription tests including Stripe integration and race conditions
  
- **Security Tests**: Located in `/tests/security/`
  - Input validation
  - Token security
  - Password reset security

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Categories

```bash
# Run all authentication tests
npm test -- --testPathPattern=tests/integration/auth

# Run all premium subscription tests
npm test -- --testPathPattern=tests/integration/premium

# Run all security tests
npm test -- --testPathPattern=tests/security
```

## Premium Subscription Testing

The premium subscription tests focus on ensuring the Stripe integration is robust and can handle various edge cases:

1. **Stripe Checkout Flow**: Tests the entire checkout process including handling network interruptions
   - Validates session creation
   - Handles network failures and retries
   - Maintains consistent state if browser is closed mid-checkout

2. **Webhook Resilience**: Tests the system's ability to handle webhook delivery issues
   - Idempotency (handling duplicate webhook events)
   - Server restart during webhook processing
   - Database connection interruptions

3. **Race Conditions**: Tests scenarios where timing issues might occur
   - User trying to access premium features immediately after purchase but before webhook processing
   - Mid-cycle subscription cancellations
   - Concurrent feature usage requests

## Security Testing

Security tests focus on ensuring the application is protected against common vulnerabilities:

1. **Token Security**: Tests JWT token security
   - Rejects modified payloads
   - Handles token revocation after password change
   - Rejects malformed tokens

2. **Password Reset Security**: Tests password reset workflow security
   - One-time use tokens
   - Expiration handling
   - Protection against timing attacks

3. **Input Validation**: Tests protection against injection attacks
   - XSS prevention in various fields
   - SQL/NoSQL injection prevention
   - Unicode and character encoding handling

## Contributing

When adding new tests, please follow these guidelines:

1. Place tests in the appropriate directory based on their category
2. Use descriptive test names that explain what's being tested
3. Mock external services (like Stripe) to avoid real API calls
4. Include both happy path and edge case scenarios

## Test Environment Setup

Tests use:
- MongoDB Memory Server for database testing
- Mocked Stripe API to avoid real payment processing
- Jest for test running and assertions
