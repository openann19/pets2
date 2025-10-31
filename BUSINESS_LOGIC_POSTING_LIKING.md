# Complete Business Logic: Posting and Liking Eligibility

**Date**: January 2025  
**Scope**: PawfectMatch Community Features  
**Status**: Comprehensive Analysis

---

## 📋 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Posting Eligibility](#posting-eligibility)
3. [Liking Eligibility](#liking-eligibility)
4. [Content Moderation](#content-moderation)
5. [Rate Limiting](#rate-limiting)
6. [Premium Features](#premium-features)
7. [Business Rules](#business-rules)
8. [Security Checks](#security-checks)

---

## 1. Authentication & Authorization

### Route Protection
**File**: `server/src/routes/community.ts`
```typescript
// Apply authentication to all community routes
router.use(requireAuth);  // Line 30
```

**Middleware**: `server/src/middleware/adminAuth.ts` → `requireAuth`

### Authentication Flow

```typescript
// Step 1: Token Extraction
1. Check Authorization header: "Bearer <token>"
2. Fallback: Check httpOnly cookies (accessToken, access_token, pm_access)
3. If no token → 401 Unauthorized

// Step 2: Token Verification
1. Verify JWT signature using JWT_SECRET
2. Extract userId and jti from token
3. If invalid/expired → 401 Unauthorized

// Step 3: User Lookup
1. Query User.findById(decoded.userId)
2. Select fields: exclude password and refreshTokens
3. If user not found → 401 Unauthorized

// Step 4: Account Status Checks
1. Check user.isActive === true
   → If false → 401 "Account is inactive"
   
2. Check user.isBlocked === false
   → If true → 401 "Account is blocked"
   
3. Check token revocation:
   - tokensInvalidatedAt timestamp
   - revokedJtis array (per-session revocation)
   → If revoked → 401 "Token revoked"

// Step 5: Attach User to Request
req.user = user
req.userId = user._id.toString()
req.jti = decoded.jti
req.user.subscriptionActive = user.premium?.isActive && 
  (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date())
```

### Account Status Values

```typescript
// User Model Fields (server/src/models/User.ts)

isActive: Boolean (default: true)
  ✅ true → Can authenticate
  ❌ false → Cannot authenticate (401)

isBlocked: Boolean (default: false)
  ✅ false → Can authenticate
  ❌ true → Cannot authenticate (401)

status: String enum ['active', 'suspended', 'banned', 'pending']
  ✅ 'active' → Can authenticate
  ❌ 'suspended' → Cannot authenticate (401)
  ❌ 'banned' → Cannot authenticate (401)
  ⚠️ 'pending' → CAN authenticate (not checked in middleware)

isEmailVerified: Boolean (default: false)
  ⚠️ NOT checked for posting/liking
  ⚠️ 'pending' users can post/like

isPhoneVerified: Boolean (default: false)
  ⚠️ NOT checked for posting/liking
```

**Key Finding**: `status: 'pending'` users CAN post/like (not blocked by middleware)

---

## 2. Posting Eligibility

### Route: `POST /api/community/posts`

**File**: `server/src/routes/community.ts:125-257`

### Step-by-Step Business Logic

#### Step 1: Authentication Check ✅
```typescript
// Middleware: requireAuth
// Requirements:
- Valid JWT token
- user.isActive === true
- user.isBlocked === false
- Token not revoked
```

#### Step 2: Content Validation ✅
```typescript
const { content, images = [], packId, type = 'post', activityDetails } = req.body;

// Validation:
if (!content || !content.trim()) {
  return 400 "Post content is required"
}

// Content limits:
- content: maxlength 5000 characters (from schema)
- images: array of image objects
- type: enum ['post', 'activity', 'announcement'] (default: 'post')
```

#### Step 3: Automated Moderation ✅
```typescript
// Import automated moderation service
const automatedModerationService = await import('../services/automatedModeration');

// Analyze content before creating post
const moderationResult = await automatedModerationService.analyzeContent({
  contentId: 'temp', // Updated after post creation
  contentType: 'story',
  content: {
    content: content.trim(),
    media: images,
  },
  user: req.user || {},
});

// Severity scoring:
- highestSeverity >= 3 → moderationStatus = 'pending' (requires human review)
- highestSeverity === 2 → moderationStatus = 'pending' (requires human review)
- highestSeverity === 1 → moderationStatus = 'approved' (auto-approved)
- No flags → moderationStatus = 'approved' (default)

// Fail-open policy:
- If moderation fails → moderationStatus = 'approved' (don't block legitimate content)
```

#### Step 4: Post Creation ✅
```typescript
const postData = {
  author: req.user?._id,              // Required: User ID from auth
  content: content.trim(),            // Required: Trimmed content
  images,                             // Optional: Array of images
  packId,                             // Optional: Pack reference
  type,                               // Required: 'post' | 'activity' | 'announcement'
  activityDetails: type === 'activity' ? activityDetails : undefined,
  moderationStatus,                   // Set by moderation service
  likes: [],                          // Initialize empty
  comments: [],                       // Initialize empty
  shares: []                          // Initialize empty
};

const newPost = await CommunityPost.create(postData);
```

#### Step 5: Post-Moderation ✅
```typescript
// If moderationStatus === 'pending':
// Re-run moderation with actual post ID
if (moderationStatus === 'pending') {
  await automatedModerationService.analyzeContent({
    contentId: newPost._id.toString(), // Actual post ID
    contentType: 'story',
    content: {
      content: content.trim(),
      media: images,
    },
    user: req.user || {},
  });
}
```

#### Step 6: Response ✅
```typescript
// Response includes:
{
  success: true,
  post: {
    _id,
    author: { _id, firstName, lastName, avatar },
    content,
    images,
    likes: 0,
    comments: [],
    createdAt,
    packId,
    packName,
    type,
    activityDetails,
    moderationStatus  // 'approved' | 'pending' | 'rejected'
  },
  message: moderationStatus === 'pending' 
    ? 'Post created and submitted for review'
    : 'Post created successfully'
}
```

### Posting Eligibility Summary

**✅ Required:**
- Authentication (JWT token)
- `user.isActive === true`
- `user.isBlocked === false`
- Content not empty
- Content ≤ 5000 characters

**❌ NOT Required:**
- Premium subscription
- Email verification (`isEmailVerified`)
- Phone verification (`isPhoneVerified`)
- Verification tier
- Profile completeness (pet profiles)
- Account status `'pending'` is allowed

**⚠️ Content Moderation:**
- Automated moderation runs before post creation
- High severity → Status `'pending'` (requires review)
- Medium severity → Status `'pending'` (requires review)
- Low severity → Status `'approved'` (auto-approved)
- Moderation failure → Status `'approved'` (fail-open)

---

## 3. Liking Eligibility

### Route: `POST /api/community/posts/:id/like`

**File**: `server/src/routes/community.ts:262-302`

### Step-by-Step Business Logic

#### Step 1: Authentication Check ✅
```typescript
// Same as posting:
- Valid JWT token
- user.isActive === true
- user.isBlocked === false
- Token not revoked
```

#### Step 2: Post Existence Check ✅
```typescript
const { id } = req.params;
const post = await CommunityPost.findById(id);

if (!post) {
  return 404 "Post not found"
}
```

#### Step 3: Like Toggle ✅
```typescript
// Uses CommunityPost model method: toggleLike(userId)
const wasLiked = post.toggleLike(req.user?._id);

// Toggle logic (inferred from usage):
- If user already liked → Remove like (unlike)
- If user hasn't liked → Add like
- Returns boolean: true if liked, false if unliked
```

#### Step 4: Save Post ✅
```typescript
await post.save();

// Post likes array structure:
likes: [{
  user: ObjectId (ref: 'User'),
  likedAt: Date (default: Date.now)
}]
```

#### Step 5: Response ✅
```typescript
{
  success: true,
  post: {
    _id: post._id,
    likes: post.likes?.length || 0,
    liked: wasLiked  // true if liked, false if unliked
  },
  message: wasLiked 
    ? 'Post liked successfully'
    : 'Post unliked successfully'
}
```

### Liking Eligibility Summary

**✅ Required:**
- Authentication (JWT token)
- `user.isActive === true`
- `user.isBlocked === false`
- Post exists

**❌ NOT Required:**
- Premium subscription
- Email verification
- Phone verification
- Rate limiting (no daily/hourly limits)
- Post moderation status check (can like pending posts)

**⚠️ Current Behavior:**
- Users can like/unlike posts
- No rate limiting on likes
- No spam prevention
- Can like posts with `moderationStatus: 'pending'`

---

## 4. Content Moderation

### Automated Moderation Service

**File**: `server/src/services/automatedModeration.ts`

### Moderation Flow

```typescript
// 1. Content Analysis
analyzeContent({
  contentId: string,
  contentType: 'story',
  content: {
    content: string,
    media: array
  },
  user: User object
})

// 2. Flag Detection
- Checks for toxicity, hate speech, sexual content, violence, spam
- Animal abuse detection (pattern matching)
- Severity scoring (1-5 scale)

// 3. Moderation Status Decision
highestSeverity >= 3 → 'pending' (human review required)
highestSeverity === 2 → 'pending' (human review required)
highestSeverity === 1 → 'approved' (auto-approved)
no flags → 'approved'

// 4. Post Visibility
// Only posts with moderationStatus: 'approved' are visible in feed
GET /api/community/posts filters:
  query: {
    moderationStatus: 'approved',
    isArchived: false
  }
```

### Moderation Status Values

```typescript
moderationStatus: enum ['pending', 'approved', 'rejected']
  'pending' → Not visible in feed, awaiting review
  'approved' → Visible in feed
  'rejected' → Not visible in feed
```

---

## 5. Rate Limiting

### Global Rate Limiting

**File**: `server/server.ts` (lines 305-395)

```typescript
// API Rate Limiter (general endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  keyGenerator: (req) => {
    // Use authenticated user ID if available, otherwise IP
    const userId = req.userId || req.user?.id;
    return userId ? `user_${userId}` : ipKeyGenerator(req.ip);
  }
});

// Premium users get higher limits
const premiumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,  // Higher limit for premium users
  skip: (req) => {
    // Skip for premium users with active subscription
    return req.user?.subscription?.status === 'active';
  }
});
```

### Community Routes Rate Limiting

**Current Status**: ❌ **NO specific rate limiting on community routes**

- `POST /api/community/posts` → Uses global `apiLimiter` only
- `POST /api/community/posts/:id/like` → Uses global `apiLimiter` only
- No per-user daily limits
- No spam prevention
- No abuse detection

### Rate Limiting Gaps

**Missing:**
- Daily post limits per user
- Daily like limits per user
- Spam detection (excessive posting/liking)
- Behavioral analysis (unusual patterns)

---

## 6. Premium Features

### Premium Status Check

```typescript
// From authentication middleware:
req.user.subscriptionActive = user.premium?.isActive === true && 
  (!user.premium.expiresAt || new Date(user.premium.expiresAt) > new Date())

// Premium fields:
premium: {
  isActive: Boolean (default: false)
  plan: enum ['free', 'premium', 'ultimate'] (default: 'free')
  expiresAt: Date (optional)
  features: {
    unlimitedLikes: Boolean
    boostProfile: Boolean
    seeWhoLiked: Boolean
    advancedFilters: Boolean
    aiMatching: Boolean
    prioritySupport: Boolean
    globalPassport: Boolean
  }
}
```

### Premium Impact on Posting/Liking

**Current Status**: ❌ **NO premium requirements for posting/liking**

- Free users can post unlimited posts
- Free users can like unlimited posts
- Premium features don't affect community posting/liking

**Note**: Premium features affect:
- Swipe limits (5 daily swipes for free users)
- Super likes (0 for free, must purchase via IAP)
- Profile boosts
- See who liked you
- Advanced filters

---

## 7. Business Rules

### Post Creation Rules

```typescript
// 1. Content Requirements
- content: Required, max 5000 characters
- images: Optional array
- type: Required, enum ['post', 'activity', 'announcement']

// 2. Activity Posts
if (type === 'activity') {
  activityDetails: {
    date: Date
    location: String
    maxAttendees: Number
    currentAttendees: [ObjectId]
    cost: { amount: Number, currency: String }
    requirements: [String]
    contactInfo: { email: String, phone: String }
  }
}

// 3. Post Visibility
- Only posts with moderationStatus: 'approved' appear in feed
- Posts with moderationStatus: 'pending' are hidden
- Posts with moderationStatus: 'rejected' are hidden
- Archived posts (isArchived: true) are hidden

// 4. Post Ownership
- Only post author can update/delete post
- Admins can delete any post
- Post owner can update content, images, activityDetails
```

### Like Rules

```typescript
// 1. Like Toggle
- Same user can like/unlike same post
- No duplicate likes (handled by toggleLike method)
- Like count = post.likes.length

// 2. Like Data Structure
likes: [{
  user: ObjectId (ref: 'User'),
  likedAt: Date (default: Date.now)
}]

// 3. No Restrictions
- No daily limits
- No rate limiting
- No spam detection
- Can like pending posts
```

### Comment Rules

```typescript
// Comment Creation
POST /api/community/posts/:id/comments

Requirements:
- Authentication (same as posting)
- content: Required, max 1000 characters
- Post must exist

Comment Structure:
comments: [{
  author: ObjectId (ref: 'User'),
  content: String (max 1000 chars),
  likes: [ObjectId],
  replies: [{
    author: ObjectId,
    content: String (max 500 chars),
    likes: [ObjectId],
    createdAt: Date,
    updatedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}]
```

### Activity Participation Rules

```typescript
// Join Activity
POST /api/community/posts/:id/join

Requirements:
- Authentication
- Post must exist
- Post type must be 'activity'

Logic:
- Adds user to activityDetails.currentAttendees array
- Uses $addToSet to prevent duplicates
- No maxAttendees check (unlimited)

// Leave Activity
POST /api/community/posts/:id/leave

Requirements:
- Authentication
- Post must exist
- Post type must be 'activity'

Logic:
- Removes user from activityDetails.currentAttendees array
```

---

## 8. Security Checks

### Current Security Measures ✅

1. **Authentication**: JWT token verification
2. **Account Status**: Checks `isActive` and `isBlocked`
3. **Token Revocation**: Checks `tokensInvalidatedAt` and `revokedJtis`
4. **Content Moderation**: Automated moderation before post creation
5. **Input Validation**: Content length limits, type validation
6. **Global Rate Limiting**: 100 requests per 15 minutes per user/IP

### Security Gaps ⚠️

1. **No Email Verification Check**: Unverified users can post/like
2. **No Phone Verification Check**: Unverified users can post/like
3. **Pending Account Allowed**: `status: 'pending'` users can post/like
4. **No Profile Completeness**: Users without pets can post to pet community
5. **No Post Rate Limiting**: No daily/hourly post limits
6. **No Like Rate Limiting**: No daily/hourly like limits
7. **No Spam Detection**: No behavioral analysis for excessive posting/liking
8. **No Content Repetition Check**: No duplicate content detection
9. **No User Reputation Check**: No checks for users with multiple violations
10. **No Geographic Restrictions**: No location-based restrictions

---

## 9. Complete Eligibility Matrix

### Posting Eligibility

| Requirement | Status | Value |
|------------|--------|-------|
| Authentication | ✅ Required | JWT token |
| Account Active | ✅ Required | `isActive: true` |
| Account Not Blocked | ✅ Required | `isBlocked: false` |
| Account Status | ⚠️ Not Checked | `status: 'pending'` allowed |
| Email Verified | ❌ Not Required | `isEmailVerified: false` allowed |
| Phone Verified | ❌ Not Required | `isPhoneVerified: false` allowed |
| Premium Subscription | ❌ Not Required | Free users can post |
| Verification Tier | ❌ Not Required | No tier check |
| Profile Completeness | ❌ Not Required | No pet required |
| Content Validation | ✅ Required | Content not empty, max 5000 chars |
| Content Moderation | ✅ Applied | Automated moderation runs |
| Rate Limiting | ⚠️ Global Only | 100 req/15min (no post-specific limits) |

### Liking Eligibility

| Requirement | Status | Value |
|------------|--------|-------|
| Authentication | ✅ Required | JWT token |
| Account Active | ✅ Required | `isActive: true` |
| Account Not Blocked | ✅ Required | `isBlocked: false` |
| Account Status | ⚠️ Not Checked | `status: 'pending'` allowed |
| Email Verified | ❌ Not Required | `isEmailVerified: false` allowed |
| Phone Verified | ❌ Not Required | `isPhoneVerified: false` allowed |
| Premium Subscription | ❌ Not Required | Free users can like unlimited |
| Post Exists | ✅ Required | Post must exist |
| Post Moderation | ❌ Not Checked | Can like pending posts |
| Rate Limiting | ❌ Not Applied | No daily/hourly like limits |
| Spam Detection | ❌ Not Applied | No behavioral checks |

---

## 10. Code Flow Diagrams

### Post Creation Flow

```
User Request
    ↓
[Authentication Middleware]
    ├─ Token exists? → NO → 401 Unauthorized
    ├─ Token valid? → NO → 401 Invalid token
    ├─ User exists? → NO → 401 User not found
    ├─ isActive? → NO → 401 Account inactive
    └─ isBlocked? → YES → 401 Account blocked
    ↓
[Content Validation]
    ├─ Content exists? → NO → 400 Content required
    └─ Content length ≤ 5000? → NO → 400 Too long
    ↓
[Automated Moderation]
    ├─ Analyze content
    ├─ Calculate severity
    ├─ severity ≥ 3 → moderationStatus = 'pending'
    ├─ severity === 2 → moderationStatus = 'pending'
    └─ severity ≤ 1 → moderationStatus = 'approved'
    ↓
[Post Creation]
    ├─ Create post in database
    ├─ If pending → Re-run moderation with post ID
    └─ Populate author and packId
    ↓
[Response]
    └─ Return post with moderationStatus
```

### Like Toggle Flow

```
User Request
    ↓
[Authentication Middleware]
    ├─ Token exists? → NO → 401 Unauthorized
    ├─ Token valid? → NO → 401 Invalid token
    ├─ User exists? → NO → 401 User not found
    ├─ isActive? → NO → 401 Account inactive
    └─ isBlocked? → YES → 401 Account blocked
    ↓
[Post Lookup]
    ├─ Post exists? → NO → 404 Post not found
    └─ Post found → Continue
    ↓
[Like Toggle]
    ├─ User already liked? → YES → Remove like (unlike)
    └─ User not liked? → NO → Add like
    ↓
[Save Post]
    └─ Update likes array in database
    ↓
[Response]
    └─ Return updated like count and liked status
```

---

## 11. Recommendations

### Immediate Improvements

1. **Add Email Verification Check**
```typescript
if (!user.isEmailVerified) {
  return res.status(403).json({
    success: false,
    message: 'Email verification required to post'
  });
}
```

2. **Add Post Rate Limiting**
```typescript
// Daily post limit: 10 posts per day for free users
// Unlimited for premium users
const dailyPostLimit = user.premium?.isActive ? Infinity : 10;
```

3. **Add Like Rate Limiting**
```typescript
// Daily like limit: 100 likes per day for free users
// Unlimited for premium users
const dailyLikeLimit = user.premium?.isActive ? Infinity : 100;
```

4. **Block Pending Accounts**
```typescript
if (user.status === 'pending') {
  return res.status(403).json({
    success: false,
    message: 'Account verification pending'
  });
}
```

5. **Add Profile Completeness Check**
```typescript
if (!user.pets || user.pets.length === 0) {
  return res.status(403).json({
    success: false,
    message: 'At least one pet profile required to post'
  });
}
```

### Long-term Enhancements

1. **Reputation System**: Track user violations, reduce limits for low-reputation users
2. **Spam Detection**: Behavioral analysis for excessive posting/liking patterns
3. **Content Deduplication**: Prevent duplicate content posting
4. **Geographic Restrictions**: Location-based posting restrictions
5. **Community Membership**: Require pack/community membership for certain posts

---

## 12. Summary

### Current State

**Who Can Post:**
- ✅ Any authenticated user with active, non-blocked account
- ⚠️ Email verification NOT required
- ⚠️ Account status `'pending'` allowed
- ❌ No premium requirement
- ❌ No profile completeness check

**Who Can Like:**
- ✅ Any authenticated user with active, non-blocked account
- ⚠️ Email verification NOT required
- ⚠️ Account status `'pending'` allowed
- ❌ No premium requirement
- ❌ No rate limiting
- ❌ No spam detection

**Content Moderation:**
- ✅ Automated moderation runs before post creation
- ✅ High/medium severity → `'pending'` status (requires review)
- ✅ Low severity → `'approved'` status (auto-approved)
- ⚠️ Moderation failure → `'approved'` (fail-open policy)

**Rate Limiting:**
- ✅ Global API rate limiting: 100 requests/15min per user/IP
- ❌ No specific post rate limiting
- ❌ No specific like rate limiting
- ❌ No spam prevention

---

**Last Updated**: January 2025  
**Next Review**: After implementing security improvements

