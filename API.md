# PawfectMatch API Documentation

## Overview

PawfectMatch is a comprehensive pet matching platform with real-time chat, AI-powered recommendations, and premium features. This API provides endpoints for user management, pet profiles, matching, and real-time communication.

## Base URL

```
https://api.pawfectmatch.com
```

## Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "dateOfBirth": "1990-01-01",
  "password": "password123",
  "phone": "+1234567890"
}
```
**Response:**
```json
{
  "success": true,
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "isEmailVerified": false,
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```
#### Login User
```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

### Pets

#### Create Pet Profile
```http
POST /api/pets
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "gender": "male",
  "size": "large",
  "description": "Friendly and energetic dog",
  "personalityTags": ["friendly", "energetic", "playful"],
  "intent": "playdate",
  "healthInfo": {
    "vaccinated": true,
    "spayedNeutered": true,
    "microchipped": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pet": {
      "_id": "pet_id",
      "name": "Buddy",
      "species": "dog",
      "breed": "Golden Retriever",
      "owner": "user_id",
      "photos": [],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get Pet Profiles
```http
GET /api/pets/discover?species=dog&limit=10&skip=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `species`: Filter by species (dog, cat, etc.)
- `breed`: Filter by breed
- `size`: Filter by size (tiny, small, medium, large, extra-large)
- `intent`: Filter by intent (playdate, mating, adoption)
- `maxDistance`: Maximum distance in miles (default: 25)
- `limit`: Number of results (default: 10, max: 50)
- `skip`: Number of results to skip for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "_id": "pet_id",
        "name": "Buddy",
        "species": "dog",
        "breed": "Golden Retriever",
        "age": 3,
        "photos": [
          {
            "url": "https://cloudinary.com/image.jpg",
            "isPrimary": true
          }
        ],
        "compatibilityScore": 85
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

#### Swipe on Pet
```http
POST /api/pets/:petId/swipe
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "like"
}
```

**Actions:**
- `like`: Like the pet
- `pass`: Pass on the pet
- `superlike`: Superlike the pet (premium feature)

**Response:**
```json
{
  "success": true,
  "data": {
    "isMatch": true,
    "matchId": "match_id",
    "action": "like",
    "match": {
      "_id": "match_id",
      "pet1": { /* pet object */ },
      "pet2": { /* pet object */ },
      "user1": { /* user object */ },
      "user2": { /* user object */ },
      "compatibilityScore": 85,
      "messages": []
    }
  }
}
```

### Matches

#### Get User Matches
```http
GET /api/matches
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "_id": "match_id",
        "pet1": { /* pet object */ },
        "pet2": { /* pet object */ },
        "user1": { /* user object */ },
        "user2": { /* user object */ },
        "compatibilityScore": 85,
        "lastActivity": "2023-01-01T00:00:00.000Z",
        "messages": [
          {
            "_id": "msg_id",
            "sender": { /* user object */ },
            "content": "Hello!",
            "messageType": "text",
            "sentAt": "2023-01-01T00:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

#### Send Message
```http
POST /api/matches/:matchId/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "Hello! How is Buddy doing?",
  "messageType": "text"
}
```

**Message Types:**
- `text`: Plain text message
- `image`: Image message with attachments
- `location`: Location sharing

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "msg_id",
      "sender": { /* user object */ },
      "content": "Hello! How is Buddy doing?",
      "messageType": "text",
      "sentAt": "2023-01-01T00:00:00.000Z",
      "readBy": []
    }
  }
}
```

### Real-time Events (Socket.io)

#### Connect
```javascript
const socket = io('https://api.pawfectmatch.com', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

#### Join Match Room
```javascript
socket.emit('join_match', { matchId: 'match_id' });
```

#### Send Message
```javascript
socket.emit('send_message', {
  matchId: 'match_id',
  content: 'Hello!',
  messageType: 'text'
});
```

#### Listen for Messages
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing', {
  matchId: 'match_id',
  isTyping: true
});

// Stop typing
socket.emit('typing', {
  matchId: 'match_id',
  isTyping: false
});

// Listen for typing
socket.on('user_typing', (data) => {
  console.log(`${data.userName} is typing: ${data.isTyping}`);
});
```

### AI Service

#### Get Recommendations
```http
POST /api/ai/recommend
Content-Type: application/json

{
  "userId": "user_id",
  "petIds": ["pet1", "pet2", "pet3"]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "petId": "pet_id",
      "score": 85.5,
      "reasons": [
        "Similar breed characteristics",
        "Compatible personality traits"
      ]
    }
  ]
}
```

#### Analyze Compatibility
```http
POST /api/ai/compatibility
Content-Type: application/json

{
  "pet1": {
    "id": "pet1_id",
    "species": "dog",
    "breed": "Golden Retriever",
    "age": 3,
    "size": "large",
    "personality_tags": ["friendly", "energetic"],
    "intent": "playdate"
  },
  "pet2": {
    "id": "pet2_id",
    "species": "dog",
    "breed": "Labrador",
    "age": 2,
    "size": "large",
    "personality_tags": ["friendly", "playful"],
    "intent": "playdate"
  }
}
```

**Response:**
```json
{
  "compatibility_score": 87.5,
  "factors": [
    "Similar breed characteristics",
    "Compatible personality traits",
    "Similar ages"
  ],
  "recommendation": "Highly Compatible"
}
```

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully" // optional
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information" // optional
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

- **Free users**: 100 requests per hour
- **Premium users**: 1000 requests per hour
- **Rate limit headers**:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Webhooks

Register webhooks to receive real-time notifications:

### Webhook Events

#### Match Created
```json
{
  "event": "match.created",
  "data": {
    "matchId": "match_id",
    "users": ["user1_id", "user2_id"],
    "pets": ["pet1_id", "pet2_id"]
  }
}
```

#### Message Received
```json
{
  "event": "message.received",
  "data": {
    "matchId": "match_id",
    "messageId": "message_id",
    "senderId": "user_id",
    "content": "Hello!"
  }
}
```

### Register Webhook
```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-app.com/webhooks",
  "events": ["match.created", "message.received"]
}
```

## SDKs and Libraries

### JavaScript/TypeScript SDK
```bash
npm install pawfectmatch-sdk
```

```javascript
import { PawfectMatch } from 'pawfectmatch-sdk';

const client = new PawfectMatch({
  apiKey: 'your_api_key',
  baseURL: 'https://api.pawfectmatch.com'
});

// Authenticate
await client.auth.login('email', 'password');

// Get recommendations
const recommendations = await client.pets.discover({
  species: 'dog',
  limit: 10
});
```

## Support

For API support and questions:
- **Email**: api-support@pawfectmatch.com
- **Documentation**: https://docs.pawfectmatch.com
- **Status Page**: https://status.pawfectmatch.com

## Changelog

### v1.0.0 (Current)
- Initial API release
- Core authentication and pet management
- Real-time messaging with Socket.io
- AI-powered recommendations
- Premium subscription features

---

*This API documentation is automatically generated and kept up-to-date with the latest endpoints and features.*
