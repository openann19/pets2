# Eligibility Requirements for Posting and Liking

## Current Implementation Status

Based on code analysis of `server/src/routes/community.ts` and authentication middleware:

---

## ✅ **POSTING TO COMMUNITY** 

### **Who Can Post:**
**ANY authenticated user** with:
- ✅ Valid JWT token (authentication required)
- ✅ Account is active (`isActive: true`)
- ✅ Account is not blocked (`isBlocked: false`)
- ✅ Account status is not `'banned'` or `'suspended'`

### **Current Requirements:**
- ✅ **Authentication**: Required (via `authenticateToken` middleware)
- ✅ **Account Status**: Must be active and not blocked
- ❌ **Premium**: NOT required
- ❌ **Email Verification**: NOT checked
- ❌ **Phone Verification**: NOT checked
- ❌ **Verification Tier**: NOT checked
- ❌ **Profile Completeness**: NOT checked

### **Route**: `POST /api/community/posts`
```typescript
router.post('/posts', authenticateToken, async (req, res) => {
  // Only checks: req.user exists && isActive && !isBlocked
  // No premium/verification checks
});
```

---

## ✅ **LIKING POSTS**

### **Who Can Like:**
**ANY authenticated user** with:
- ✅ Valid JWT token (authentication required)
- ✅ Account is active (`isActive: true`)
- ✅ Account is not blocked (`isBlocked: false`)
- ✅ Account status is not `'banned'` or `'suspended'`

### **Current Requirements:**
- ✅ **Authentication**: Required (via `authenticateToken` middleware)
- ✅ **Account Status**: Must be active and not blocked
- ❌ **Premium**: NOT required
- ❌ **Email Verification**: NOT checked
- ❌ **Phone Verification**: NOT checked
- ❌ **Verification Tier**: NOT checked

### **Route**: `POST /api/community/posts/:id/like`
```typescript
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  // Only checks: req.user exists && isActive && !isBlocked
  // No premium/verification checks
});
```

---

## 📋 **Authentication Middleware Checks**

The `authenticateToken` middleware (`server/src/middleware/auth.ts`) validates:

1. ✅ Token exists (Bearer token or httpOnly cookie)
2. ✅ Token is valid (JWT verification)
3. ✅ User exists in database
4. ✅ `user.isActive === true`
5. ✅ `user.isBlocked === false`
6. ✅ Token not revoked (checks `tokensInvalidatedAt`)

**Does NOT check:**
- ❌ `isEmailVerified`
- ❌ `isPhoneVerified`
- ❌ `premium.isActive`
- ❌ `status === 'pending'` (only blocks 'banned'/'suspended')
- ❌ Verification tier
- ❌ Profile completeness

---

## 🔍 **Gap Analysis**

### **Missing Eligibility Checks:**

#### **For Posting:**
1. **Email Verification** - Currently unverified users can post
2. **Profile Completeness** - Users without pets can post
3. **Rate Limiting** - No daily/hourly post limits enforced
4. **Community Membership** - No check if user belongs to pack/community

#### **For Liking:**
1. **Rate Limiting** - No limits on likes per day/hour
2. **Spam Prevention** - No checks for excessive liking patterns

---

## 💡 **Recommendations**

### **Suggested Eligibility Requirements:**

#### **Minimum Requirements (Current):**
- ✅ Authenticated user
- ✅ Active account
- ✅ Not blocked/banned

#### **Recommended Additional Checks:**

**For Posting:**
1. **Email Verification** (`isEmailVerified: true`)
2. **Profile Completeness** (at least one pet profile)
3. **Rate Limiting** (e.g., max 10 posts per day)
4. **Content Moderation** (already implemented ✅)

**For Liking:**
1. **Rate Limiting** (e.g., max 100 likes per day)
2. **Spam Detection** (flag excessive auto-liking)

**Optional Premium Features:**
- Premium users: Unlimited posts/likes
- Premium users: Priority visibility
- Premium users: Advanced analytics

---

## 📊 **User Account Status Values**

From `server/src/models/User.ts`:

```typescript
status: {
  type: String,
  enum: ['active', 'suspended', 'banned', 'pending'],
  default: 'active'
}

isActive: { type: Boolean, default: true }
isBlocked: { type: Boolean, default: false }
isEmailVerified: { type: Boolean, default: false }
isPhoneVerified: { type: Boolean, default: false }
```

**Current Behavior:**
- ✅ `status: 'active'` → Can post/like
- ❌ `status: 'suspended'` → Cannot post/like (blocked by auth middleware)
- ❌ `status: 'banned'` → Cannot post/like (blocked by auth middleware)
- ⚠️ `status: 'pending'` → **CAN post/like** (not blocked by middleware)
- ⚠️ `isEmailVerified: false` → **CAN post/like** (not checked)

---

## 🚨 **Security Concerns**

1. **Unverified Users Can Post**: Users with `isEmailVerified: false` can still create posts
2. **Pending Accounts Can Post**: Users with `status: 'pending'` can post/like
3. **No Rate Limiting**: No protection against spam/abuse
4. **No Profile Completeness**: Users without pets can post to pet community

---

## ✅ **Summary**

**Current Eligibility:**
- **Posting**: Any authenticated, active, non-blocked user
- **Liking**: Any authenticated, active, non-blocked user

**No Premium Required**: Both features are available to free users

**No Verification Required**: Email/phone verification not checked

**Status**: ✅ **Basic eligibility implemented** | ⚠️ **May need additional security checks**

