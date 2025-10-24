# PawfectMatch API Documentation

## Overview

The PawfectMatch API provides comprehensive endpoints for pet adoption, user management, AI-powered matching, and subscription services. This RESTful API is built with Express.js and TypeScript, offering robust authentication, validation, and error handling.

## Base URLs

- **Production**: `https://api.pawfectmatch.com/v1`
- **Staging**: `https://staging-api.pawfectmatch.com/v1`
- **Development**: `http://localhost:3000/api/v1`

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register a new account**:

   ```bash
   curl -X POST https://api.pawfectmatch.com/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "securepassword123"
     }'
   ```

2. **Login with existing account**:
   ```bash
   curl -X POST https://api.pawfectmatch.com/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "securepassword123"
     }'
   ```

## Rate Limiting

- **1000 requests per hour** per authenticated user
- **100 requests per minute** per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "preferences": {
    "species": ["dog", "cat"],
    "ageRange": [1, 5],
    "activityLevelRange": [3, 7]
  }
}
```

**Response**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "preferences": { ... },
    "premium": {
      "isActive": false,
      "plan": "free"
    }
  }
}
```

#### POST /auth/login

Authenticate user with email and password.

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### POST /auth/logout

Logout user and invalidate token.

**Headers**: `Authorization: Bearer <token>`

**Response**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /auth/me

Get current authenticated user information.

**Headers**: `Authorization: Bearer <token>`

**Response**:

```json
{
  "success": true,
  "user": { ... }
}
```

### Pets

#### GET /pets

Retrieve paginated list of pets with filtering options.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `species` (string) - Filter by species (dog, cat, bird, etc.)
- `breed` (string) - Filter by breed
- `ageMin` (integer) - Minimum age in years
- `ageMax` (integer) - Maximum age in years
- `gender` (string) - Filter by gender (male, female)
- `size` (string) - Filter by size (small, medium, large)
- `location` (string) - Filter by location

**Example**:

```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.pawfectmatch.com/v1/pets?species=dog&ageMin=1&ageMax=5&page=1&limit=10"
```

**Response**:

```json
{
  "success": true,
  "pets": [
    {
      "id": "pet_123",
      "name": "Buddy",
      "species": "dog",
      "breed": "Golden Retriever",
      "age": 3,
      "gender": "male",
      "size": "large",
      "photos": ["https://example.com/photo1.jpg"],
      "description": "Friendly and energetic dog...",
      "temperament": ["friendly", "energetic"],
      "health": {
        "vaccinated": true,
        "spayed": false,
        "medicalIssues": []
      },
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102"
      },
      "shelter": {
        "id": "shelter_123",
        "name": "SF Animal Care & Control",
        "contact": "415-554-6364"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /pets/{id}

Get detailed information about a specific pet.

**Headers**: `Authorization: Bearer <token>`

**Response**:

```json
{
  "success": true,
  "pet": { ... }
}
```

### Swipes and Matches

#### POST /swipes

Record a swipe action (like, pass, or super like).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "petId": "pet_123",
  "direction": "like"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Swipe recorded",
  "isMatch": true,
  "match": {
    "id": "match_123",
    "pet": { ... },
    "user": { ... },
    "compatibilityScore": 85,
    "matchedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /matches

Get all matches for the current user.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `status` (string) - Filter by status (active, archived, blocked)
- `page` (integer) - Page number
- `limit` (integer) - Items per page

**Response**:

```json
{
  "success": true,
  "matches": [
    {
      "id": "match_123",
      "pet": { ... },
      "user": { ... },
      "compatibilityScore": 85,
      "matchedAt": "2024-01-15T10:30:00Z",
      "status": "active",
      "lastMessageAt": "2024-01-15T10:35:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### GET /matches/{id}

Get detailed information about a specific match.

**Headers**: `Authorization: Bearer <token>`

**Response**:

```json
{
  "success": true,
  "match": { ... }
}
```

### Messages

#### GET /matches/{id}/messages

Get messages for a specific match.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `page` (integer) - Page number
- `limit` (integer) - Items per page

**Response**:

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "senderId": "user_123",
      "content": "Hi! I'm interested in adopting this pet.",
      "type": "text",
      "timestamp": "2024-01-15T10:30:00Z",
      "readAt": "2024-01-15T10:31:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### POST /matches/{id}/messages

Send a message in a match conversation.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "content": "Hi! I'm interested in adopting this pet.",
  "type": "text"
}
```

**Response**:

```json
{
  "success": true,
  "message": {
    "id": "msg_123",
    "senderId": "user_123",
    "content": "Hi! I'm interested in adopting this pet.",
    "type": "text",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### AI Services

#### POST /ai/analyze-photo

Use AI to analyze a pet photo and extract information.

**Headers**: `Authorization: Bearer <token>`

**Request Body**: `multipart/form-data`

- `photo` (file) - Pet photo to analyze

**Response**:

```json
{
  "success": true,
  "analysis": {
    "species": "dog",
    "breed": "Golden Retriever",
    "confidence": 0.95,
    "age": 3,
    "health": {
      "overall": "good",
      "issues": []
    },
    "characteristics": {
      "size": "large",
      "color": "golden",
      "temperament": ["friendly", "energetic"]
    }
  }
}
```

#### POST /ai/match

Use AI to find compatible pets based on user preferences.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "preferences": {
    "species": ["dog", "cat"],
    "ageRange": [1, 5],
    "activityLevelRange": [3, 7]
  },
  "limit": 10
}
```

**Response**:

```json
{
  "success": true,
  "matches": [
    {
      "pet": { ... },
      "compatibilityScore": 85,
      "reasons": [
        "Similar activity level preferences",
        "Compatible temperament",
        "Age range matches your preferences"
      ]
    }
  ]
}
```

### Subscriptions

#### GET /subscriptions

Get current user's subscription information.

**Headers**: `Authorization: Bearer <token>`

**Response**:

```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "plan": "premium",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null
  }
}
```

#### POST /subscriptions

Create a new subscription for the user.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "plan": "premium",
  "paymentMethodId": "pm_1234567890"
}
```

**Response**:

```json
{
  "success": true,
  "subscription": { ... }
}
```

#### DELETE /subscriptions/{id}

Cancel the user's subscription.

**Headers**: `Authorization: Bearer <token>`

**Response**:

```json
{
  "success": true,
  "message": "Subscription cancelled"
}
```

### Payments

#### POST /payments/create-intent

Create a Stripe payment intent for subscription.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "amount": 999,
  "currency": "usd"
}
```

**Response**:

```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_abcdef"
}
```

#### POST /payments/confirm

Confirm a payment intent.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response**:

```json
{
  "success": true,
  "payment": {
    "id": "pi_123",
    "status": "succeeded",
    "amount": 999,
    "currency": "usd",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Admin Endpoints

#### GET /admin/analytics/subscription

Get subscription analytics for admin dashboard.

**Headers**: `Authorization: Bearer <admin-token>`

**Query Parameters**:

- `timeframe` (string) - Time period (7d, 30d, 90d, 1y)

**Response**:

```json
{
  "success": true,
  "analytics": {
    "totalUsers": 1000,
    "totalPremiumUsers": 250,
    "mrr": 12500,
    "arr": 150000,
    "churnRate": 5.2,
    "conversionRate": 25.0,
    "userGrowth": 15.5,
    "usage": {
      "totalSwipesUsed": 50000,
      "totalSuperLikesUsed": 5000,
      "totalBoostsUsed": 1000,
      "totalMessagesSent": 25000,
      "totalProfileViews": 100000
    }
  }
}
```

#### GET /admin/payments/retry-stats

Get payment retry statistics for admin dashboard.

**Headers**: `Authorization: Bearer <admin-token>`

**Response**:

```json
{
  "success": true,
  "stats": {
    "totalRetries": 150,
    "successfulRetries": 120,
    "failedRetries": 30,
    "averageRetryAttempts": 2.1,
    "retrySuccessRate": 80.0
  }
}
```

## Webhooks

### Stripe Webhooks

The API accepts Stripe webhooks for payment events:

**Endpoint**: `POST /webhooks/stripe`

**Headers**:

- `Stripe-Signature` - Stripe webhook signature

**Supported Events**:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @pawfectmatch/api-client
```

```typescript
import { PawfectMatchAPI } from '@pawfectmatch/api-client';

const api = new PawfectMatchAPI({
  baseURL: 'https://api.pawfectmatch.com/v1',
  apiKey: 'your-api-key',
});

// Get pets
const pets = await api.pets.list({
  species: 'dog',
  ageMin: 1,
  ageMax: 5,
});

// Send a message
const message = await api.messages.create('match_123', {
  content: "Hi! I'm interested in adopting this pet.",
});
```

### Python

```bash
pip install pawfectmatch-api
```

```python
from pawfectmatch import PawfectMatchAPI

api = PawfectMatchAPI(
    base_url='https://api.pawfectmatch.com/v1',
    api_key='your-api-key'
)

# Get pets
pets = api.pets.list(species='dog', age_min=1, age_max=5)

# Send a message
message = api.messages.create('match_123', {
    'content': 'Hi! I\'m interested in adopting this pet.'
})
```

### React Native

```bash
npm install @pawfectmatch/react-native-sdk
```

```typescript
import { PawfectMatchSDK } from '@pawfectmatch/react-native-sdk';

const sdk = new PawfectMatchSDK({
  apiKey: 'your-api-key',
  enableOffline: true,
  enablePushNotifications: true,
});

// Initialize SDK
await sdk.initialize();

// Get pets with offline support
const pets = await sdk.pets.getPets();

// Send message with offline support
await sdk.messages.sendMessage('match_123', 'Hello!');
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

## Changelog

### v1.0.0 (2024-01-15)

- Initial API release
- Authentication system
- Pet discovery and matching
- AI-powered pet analysis
- Subscription management
- Payment processing
- Real-time messaging
- Admin analytics

## Support

- **Documentation**: https://docs.pawfectmatch.com
- **API Status**: https://status.pawfectmatch.com
- **Support Email**: api-support@pawfectmatch.com
- **GitHub Issues**: https://github.com/pawfectmatch/api/issues

## License

This API is licensed under the MIT License. See the [LICENSE](https://github.com/pawfectmatch/api/blob/main/LICENSE) file for details.
