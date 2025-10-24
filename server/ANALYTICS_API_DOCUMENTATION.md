# 📊 PawfectMatch Analytics API Documentation

## Overview

The Analytics API provides comprehensive tracking and reporting capabilities for user behavior, pet interactions, and match activities within the PawfectMatch platform.

---

## 🔐 Authentication

All analytics endpoints require authentication via JWT token.

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📍 Base URL

```
Production: https://api.pawfectmatch.com/api/analytics
Development: http://localhost:3001/api/analytics
```

---

## 🎯 Event Types

### User Events
- `user_register` - User account creation
- `user_login` - User login
- `profile_update` - Profile information update

### Pet Events
- `pet_create` - New pet profile created
- `pet_view` - Pet profile viewed
- `pet_like` - Pet liked
- `pet_superlike` - Pet super-liked
- `pet_pass` - Pet passed/rejected

### Match Events
- `match_create` - New match created
- `message_send` - Message sent in match

### Premium Events
- `subscription_start` - Premium subscription started
- `subscription_cancel` - Premium subscription cancelled
- `premium_feature_use` - Premium feature used

---

## 📡 API Endpoints

### 1. Track User Event

Track user-level events and activities.

**Endpoint:** `POST /api/analytics/user`

**Request Body:**
```json
{
  "eventType": "user_login",
  "metadata": {
    "source": "mobile_app",
    "device": "iPhone 14",
    "os": "iOS 17.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User event tracked successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid event type
- `401` - Unauthorized
- `500` - Server error

**Example:**
```javascript
// JavaScript/TypeScript
import { analyticsAPI } from './services/api';

await analyticsAPI.trackUserEvent('user_login', {
  source: 'mobile_app',
  device: 'iPhone 14'
});
```

---

### 2. Track Pet Event

Track pet-related interactions and activities.

**Endpoint:** `POST /api/analytics/pet`

**Request Body:**
```json
{
  "petId": "507f1f77bcf86cd799439011",
  "eventType": "pet_like",
  "metadata": {
    "fromUserId": "507f1f77bcf86cd799439012",
    "intent": "playdate",
    "swipeDirection": "right"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pet event tracked successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid event type or missing petId
- `401` - Unauthorized
- `500` - Server error

**Example:**
```javascript
await analyticsAPI.trackPetEvent(
  petId,
  'pet_like',
  {
    fromUserId: currentUser.id,
    intent: 'playdate'
  }
);
```

---

### 3. Track Match Event

Track match-related activities and messages.

**Endpoint:** `POST /api/analytics/match`

**Request Body:**
```json
{
  "matchId": "507f1f77bcf86cd799439013",
  "eventType": "message_send",
  "metadata": {
    "messageLength": 45,
    "messageType": "text",
    "hasEmoji": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Match event tracked successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid event type or missing matchId
- `401` - Unauthorized
- `500` - Server error

**Example:**
```javascript
await analyticsAPI.trackMatchEvent(
  matchId,
  'message_send',
  {
    messageLength: message.length,
    messageType: 'text'
  }
);
```

---

### 4. Get User Analytics

Retrieve analytics data for the authenticated user.

**Endpoint:** `GET /api/analytics/user`

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalSwipes": 150,
      "totalLikes": 45,
      "totalMatches": 12,
      "profileViews": 89,
      "lastActive": "2025-10-10T20:30:00.000Z",
      "totalPetsCreated": 3,
      "totalMessagesSent": 234,
      "totalSubscriptionsStarted": 1,
      "totalSubscriptionsCancelled": 0,
      "totalPremiumFeaturesUsed": 56,
      "events": [
        {
          "type": "user_login",
          "timestamp": "2025-10-10T20:30:00.000Z",
          "metadata": {
            "source": "mobile_app"
          }
        }
      ]
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

**Example:**
```javascript
const analytics = await analyticsAPI.getUserAnalytics();
console.log(`Total matches: ${analytics.data.analytics.totalMatches}`);
```

---

### 5. Get Pet Analytics

Retrieve analytics data for a specific pet.

**Endpoint:** `GET /api/analytics/pet/:petId`

**URL Parameters:**
- `petId` (required) - MongoDB ObjectId of the pet

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "views": 234,
      "likes": 89,
      "superLikes": 12,
      "matches": 15,
      "messages": 156,
      "lastViewed": "2025-10-10T20:30:00.000Z",
      "events": [
        {
          "type": "pet_like",
          "userId": "507f1f77bcf86cd799439012",
          "timestamp": "2025-10-10T20:30:00.000Z",
          "metadata": {
            "intent": "playdate"
          }
        }
      ]
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Pet not found
- `500` - Server error

**Example:**
```javascript
const petAnalytics = await analyticsAPI.getPetAnalytics(petId);
console.log(`Pet views: ${petAnalytics.data.analytics.views}`);
```

---

### 6. Get Match Analytics

Retrieve analytics data for a specific match.

**Endpoint:** `GET /api/analytics/match/:matchId`

**URL Parameters:**
- `matchId` (required) - MongoDB ObjectId of the match

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "events": [
        {
          "type": "message_send",
          "userId": "507f1f77bcf86cd799439012",
          "timestamp": "2025-10-10T20:30:00.000Z",
          "metadata": {
            "messageLength": 45,
            "messageType": "text"
          }
        }
      ]
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Match not found
- `500` - Server error

**Example:**
```javascript
const matchAnalytics = await analyticsAPI.getMatchAnalytics(matchId);
console.log(`Total events: ${matchAnalytics.data.analytics.events.length}`);
```

---

## 📊 Data Models

### User Analytics Schema
```typescript
interface UserAnalytics {
  totalSwipes: number;
  totalLikes: number;
  totalMatches: number;
  profileViews: number;
  lastActive: Date;
  totalPetsCreated: number;
  totalMessagesSent: number;
  totalSubscriptionsStarted: number;
  totalSubscriptionsCancelled: number;
  totalPremiumFeaturesUsed: number;
  events: Event[];
}
```

### Pet Analytics Schema
```typescript
interface PetAnalytics {
  views: number;
  likes: number;
  superLikes: number;
  matches: number;
  messages: number;
  lastViewed: Date;
  events: Event[];
}
```

### Match Analytics Schema
```typescript
interface MatchAnalytics {
  events: Event[];
}
```

### Event Schema
```typescript
interface Event {
  type: string;
  userId?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

---

## 🔄 Rate Limiting

Analytics endpoints are rate-limited to prevent abuse:

- **Tracking Endpoints**: 100 requests per minute per user
- **Retrieval Endpoints**: 60 requests per minute per user

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696896000
```

---

## 🎯 Best Practices

### 1. Event Tracking
```javascript
// ✅ Good - Track with meaningful metadata
await analyticsAPI.trackPetEvent(petId, 'pet_like', {
  fromUserId: user.id,
  intent: pet.intent,
  compatibility: compatibilityScore
});

// ❌ Bad - Track without context
await analyticsAPI.trackPetEvent(petId, 'pet_like', {});
```

### 2. Error Handling
```javascript
// ✅ Good - Non-blocking with error handling
analyticsAPI.trackUserEvent('user_login', metadata)
  .catch(err => console.error('Analytics tracking failed:', err));

// ❌ Bad - Blocking main flow
await analyticsAPI.trackUserEvent('user_login', metadata);
```

### 3. Batch Operations
```javascript
// ✅ Good - Track multiple events efficiently
const events = [
  { type: 'pet_view', petId: pet1.id },
  { type: 'pet_view', petId: pet2.id },
  { type: 'pet_view', petId: pet3.id }
];

// Track in parallel
await Promise.allSettled(
  events.map(e => analyticsAPI.trackPetEvent(e.petId, e.type, {}))
);
```

### 4. Privacy Considerations
```javascript
// ✅ Good - Don't include PII in metadata
await analyticsAPI.trackUserEvent('profile_update', {
  fieldsUpdated: ['bio', 'preferences'],
  timestamp: Date.now()
});

// ❌ Bad - Including sensitive data
await analyticsAPI.trackUserEvent('profile_update', {
  email: user.email,
  password: user.password // NEVER DO THIS
});
```

---

## 🧪 Testing

### Unit Test Example
```javascript
describe('Analytics API', () => {
  it('should track user event successfully', async () => {
    const response = await analyticsAPI.trackUserEvent('user_login', {
      source: 'mobile_app'
    });
    
    expect(response.success).toBe(true);
    expect(response.message).toBe('User event tracked successfully');
  });
  
  it('should handle invalid event type', async () => {
    await expect(
      analyticsAPI.trackUserEvent('invalid_event', {})
    ).rejects.toThrow('Invalid event type');
  });
});
```

### Integration Test Example
```javascript
describe('Analytics Integration', () => {
  it('should track and retrieve user analytics', async () => {
    // Track event
    await analyticsAPI.trackUserEvent('user_login', {
      source: 'mobile_app'
    });
    
    // Retrieve analytics
    const analytics = await analyticsAPI.getUserAnalytics();
    
    expect(analytics.data.analytics.events).toHaveLength(1);
    expect(analytics.data.analytics.events[0].type).toBe('user_login');
  });
});
```

---

## 📈 Analytics Dashboard Integration

### Real-Time Metrics
```javascript
// Subscribe to real-time analytics updates
const unsubscribe = analyticsAPI.subscribeToMetrics((metrics) => {
  console.log('Real-time metrics:', metrics);
  updateDashboard(metrics);
});

// Cleanup
unsubscribe();
```

### Custom Reports
```javascript
// Generate custom analytics report
const report = await analyticsAPI.generateReport({
  startDate: '2025-10-01',
  endDate: '2025-10-10',
  metrics: ['totalMatches', 'totalMessages'],
  groupBy: 'day'
});
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Event Not Tracked
**Problem**: Event tracking returns success but data doesn't appear

**Solution**:
- Check if event type is valid
- Verify user is authenticated
- Check server logs for errors
- Ensure database connection is active

#### 2. Rate Limit Exceeded
**Problem**: Receiving 429 Too Many Requests

**Solution**:
- Implement exponential backoff
- Batch events when possible
- Cache analytics data locally
- Review tracking frequency

#### 3. Invalid Event Type
**Problem**: Receiving 400 Bad Request

**Solution**:
- Verify event type matches EVENT_TYPES enum
- Check API documentation for valid types
- Ensure proper spelling and casing

---

## 📞 Support

For analytics API support:
- **Email**: analytics-support@pawfectmatch.com
- **Slack**: #analytics-api
- **Documentation**: https://docs.pawfectmatch.com/analytics
- **Status Page**: https://status.pawfectmatch.com

---

## 📝 Changelog

### Version 1.0.0 (2025-10-10)
- Initial release
- User, Pet, and Match analytics endpoints
- Event tracking system
- Real-time analytics support
- Comprehensive test coverage

---

**API Version**: 1.0.0  
**Last Updated**: 2025-10-10  
**Status**: ✅ Production Ready  
**Maintainer**: PawfectMatch Engineering Team
