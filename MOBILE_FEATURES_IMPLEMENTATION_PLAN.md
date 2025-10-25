# 📱 Mobile Features Implementation Plan
## Comprehensive Guide for Bringing Web Features to Mobile

**Generated:** January 2025  
**Status:** Ready for Implementation  
**Estimated Timeline:** 8-10 weeks for complete parity

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Priority Matrix](#priority-matrix)
3. [Detailed Implementation Plans](#detailed-implementation-plans)
4. [Testing Strategy](#testing-strategy)
5. [Deployment Strategy](#deployment-strategy)

---

## Executive Summary

This document provides a complete implementation roadmap for bringing missing web features to the mobile app, with **30 specific features** across **8 major categories**.

### Current State

✅ **Already Complete (Mobile)**:
- Basic authentication
- Pet profiles
- Swipe matching
- Basic chat/messaging
- Basic offline support
- Deep linking
- Push notifications

❌ **Missing from Mobile**:
- Advanced admin features (11 sections)
- Stories system
- Full gamification UI
- Community feed with AI
- Location-based travel mode
- Premium tier standardization
- Enhanced adoption system
- Advanced AI features

### Success Criteria

✅ **Goal 1:** 100% feature parity in core user-facing features  
✅ **Goal 2:** Standardized premium tiers across platforms  
✅ **Goal 3:** Complete admin functionality parity  
✅ **Goal 4:** Comprehensive testing suite (250+ tests)

---

## Priority Matrix

### 🔴 Critical (Weeks 1-2)
These must be done first for business continuity.

1. **Premium Tier Standardization** (12 hours)
2. **Mobile Admin Dashboard Enhancement** (24 hours)
3. **Gamification UI Implementation** (16 hours)
4. **Stories System Integration** (20 hours)

**Why:** Premium tiers fix revenue issues. Admin enables content management. Gamification drives engagement. Stories drive retention.

### 🟡 High Priority (Weeks 3-4)
Strong user impact and engagement drivers.

5. **Community Feed with AI** (20 hours)
6. **Advanced AI Features** (24 hours)
7. **Location-Based Features** (12 hours)

**Why:** Community increases stickiness. AI improves matching. Location improves discovery.

### 🟢 Medium Priority (Weeks 5-6)
Enhancement and polish features.

9. **Adoption System Enhancement** (16 hours)
10. **Advanced Video Calling** (12 hours)
11. **Calendar & Reminders** (12 hours)
12. **Comprehensive Testing Suite** (40 hours)

**Why:** Testing ensures quality. Enhanced adoption improves conversion. Better video calls improve engagement.

---

## Detailed Implementation Plans

## Phase 1: Critical Fixes (Weeks 1-2)

### Feature 1.1: Premium Tier Standardization

**Status:** 🔴 CRITICAL  
**Estimated Time:** 12 hours  
**Files to Modify:** 3 files

#### Problem Statement

Web app has 3 tiers: Free ($0), Premium ($9.99/mo), Ultimate ($19.99/mo)  
Mobile app has 3 tiers: Basic ($9.99/mo), Premium ($19.99/mo), Ultimate ($29.99/mo)

**Revenue Impact:**
- Users pay different prices for same features
- Confusing cross-platform experience
- Support tickets increase
- Revenue leakage

#### Solution

Standardize both platforms to use:
- **Free:** $0/month - 5 daily swipes, basic matching
- **Premium:** $9.99/month - Unlimited swipes, AI matching, see likes
- **Ultimate:** $19.99/month - Everything + video calls, priority support

#### Implementation Steps

**Step 1: Update Mobile Premium Configuration**

**File:** `apps/mobile/src/screens/premium/PremiumScreen.tsx`

**Current Code (lines 35-91):**
```typescript
const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: { monthly: 0, yearly: 0 },
    // ...
  },
  {
    id: "premium",
    name: "Premium",
    price: { monthly: 9.99, yearly: 99.99 },
    // ...
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: { monthly: 19.99, yearly: 199.99 },
    // ...
  },
];
```

**Replace With:**
```typescript
const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    stripePriceId: {
      monthly: "",
      yearly: "",
    },
    features: [
      "5 daily swipes",
      "Basic matching algorithm",
      "Standard chat features",
      "Basic analytics",
      "Community support access",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: { monthly: 9.99, yearly: 99.99 },
    stripePriceId: {
      monthly: "price_premium_monthly",
      yearly: "price_premium_yearly",
    },
    features: [
      "Unlimited swipes",
      "See who liked you",
      "AI-powered matching",
      "Advanced search filters",
      "Priority in search results",
      "Read receipts",
      "Ad-free experience",
      "5 Super Likes per day",
    ],
    popular: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: { monthly: 19.99, yearly: 199.99 },
    stripePriceId: {
      monthly: "price_ultimate_monthly",
      yearly: "price_ultimate_yearly",
    },
    features: [
      "All Premium features",
      "HD video calls",
      "Advanced AI recommendations",
      "Profile boost weekly",
      "Unlimited Super Likes",
      "Exclusive events access",
      "VIP customer support",
      "Advanced analytics dashboard",
    ],
  },
];
```

**Step 2: Update Web Premium Configuration**

**File:** `apps/web/src/components/Premium/SubscriptionManager.tsx`

**Current Code (lines 17-83):**
```typescript
const premiumPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    // ...
  },
  {
    id: 'premium',
    name: 'Premium',
    price: billingInterval === 'monthly' ? 9.99 : 89.99,
    // ...
  },
  {
    id: 'ultimate',
    name: 'Ultimate'
    // ...
  },
];
```

**Replace With (align pricing and features exactly):**
```typescript
const premiumPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: billingInterval,
    stripePriceId: '',
    features: [
      '5 daily swipes',
      'Basic matching algorithm',
      'Standard chat features',
      'Basic analytics',
      'Community support access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: billingInterval === 'monthly' ? 9.99 : 99.99, // FIXED: Was 89.99
    currency: 'USD',
    interval: billingInterval,
    popular: true,
    savings: billingInterval === 'yearly' ? 'Save 17%' : undefined,
    stripePriceId: billingInterval === 'monthly' ? 'price_premium_monthly' : 'price_premium_yearly',
    features: [
      '✨ Unlimited swipes',
      '🎯 See who liked you',
      '🤖 AI-powered matching',
      '🔍 Advanced search filters',
      '⚡ Priority in search results',
      '✓ Read receipts',
      '🚫 Ad-free experience',
      '⭐ 5 Super Likes per day',
    ]
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: billingInterval === 'monthly' ? 19.99 : 199.99, // FIXED: Aligned pricing
    currency: 'USD',
    interval: billingInterval,
    savings: billingInterval === 'yearly' ? 'Save 17%' : undefined,
    stripePriceId: billingInterval === 'monthly' ? 'price_ultimate_monthly' : 'price_ultimate_yearly',
    features: [
      '🏆 All Premium features',
      '📹 HD video calls',
      '🧠 Advanced AI recommendations',
      '📈 Profile boost weekly',
      '💎 Unlimited Super Likes',
      '🎪 Exclusive events access',
      '👑 VIP customer support',
      '📊 Advanced analytics dashboard',
    ]
  },
];
```

**Step 3: Update Server-Side Tier Logic**

**File:** `server/src/models/User.js` or `server/src/models/Subscription.js`

Ensure server checks for tier access:
```javascript
// Add tier limits
const TIER_LIMITS = {
  free: {
    dailySwipes: 5,
    hasAdvancedAI: false,
    hasVideoCalls: false,
    superLikesPerDay: 0,
  },
  premium: {
    dailySwipes: -1, // unlimited
    hasAdvancedAI: true,
    hasVideoCalls: false,
    superLikesPerDay: 5,
  },
  ultimate: {
    dailySwipes: -1,
    hasAdvancedAI: true,
    hasVideoCalls: true,
    superLikesPerDay: -1,
  },
};
```

**Step 4: Update Stripe Products**

Run Stripe CLI commands or update dashboard:
```bash
# Update existing products or create new ones
stripe products update prod_XXXXX --name="Premium" --description="Unlimited swipes and AI matching"
stripe prices create --product=prod_XXXXX --amount=999 --currency=usd --recurring=month
stripe prices create --product=prod_XXXXX --amount=9999 --currency=usd --recurring=year
```

**Testing Checklist:**
- [ ] Free tier users see "5 Swipes Remaining" badge
- [ ] Premium tier allows unlimited swipes
- [ ] Ultimate tier shows video call button
- [ ] Pricing matches on both web and mobile
- [ ] Stripe checkout flow works
- [ ] Subscription upgrade/downgrade works
- [ ] Feature gating enforced on server

---

### Feature 1.2: Mobile Admin Dashboard Enhancement

**Status:** 🔴 CRITICAL  
**Estimated Time:** 24 hours  
**Files to Create:** 12 files  
**Files to Modify:** 3 files

#### Problem Statement

Web has comprehensive 11-section admin dashboard. Mobile has basic admin with limited functionality.

**User Impact:**
- Admins can't manage users on mobile
- Can't monitor security in real-time
- Can't approve payments or handle support tickets
- Can't view detailed analytics

#### Solution

Build comprehensive admin dashboard matching web feature parity.

#### Implementation Steps

**Step 1: Create Admin Screen Components**

Create new directory structure:
```
apps/mobile/src/screens/admin/
├── AdminDashboardScreen.tsx (modified)
├── AdminAnalyticsScreen.tsx (new)
├── AdminUsersScreen.tsx (new)
├── AdminSecurityScreen.tsx (new)
├── AdminBillingScreen.tsx (new)
├── AdminChatsScreen.tsx (new)
├── AdminUploadsScreen.tsx (new)
├── AdminVerificationsScreen.tsx (new)
├── AdminSettingsScreen.tsx (new)
├── AdminReportsScreen.tsx (new)
├── AdminSystemHealthScreen.tsx (new)
└── AdminAIStatusScreen.tsx (new)
```

**Step 2: Implement Admin Analytics Screen**

**File:** `apps/mobile/src/screens/admin/AdminAnalyticsScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { adminAPI } from '../../services/api';
import { ChartBarIcon, TrendingUpIcon, UsersIcon } from 'react-native-heroicons/outline';
import { logger } from '@pawfectmatch/core';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalMatches: number;
  messagesToday: number;
  revenue: {
    today: number;
    thisMonth: number;
    total: number;
  };
  trends: {
    userGrowth: number;
    matchRate: number;
    engagementRate: number;
  };
}

export default function AdminAnalyticsScreen({ navigation }: AdminScreenProps<'AdminAnalytics'>): JSX.Element {
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      logger.error('Failed to load analytics', { error });
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <ChartBarIcon size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Analytics Dashboard</Text>
      </View>

      {/* User Stats */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <UsersIcon size={24} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>User Statistics</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {analytics?.totalUsers.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Total Users</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {analytics?.activeUsers.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Active Users</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#3B82F6' }]}>
              +{analytics?.newUsersToday}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>New Today</Text>
          </View>
        </View>
      </View>

      {/* Match Stats */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <TrendingUpIcon size={24} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Match Statistics</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {analytics?.totalMatches.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Total Matches</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {analytics?.messagesToday.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Messages Today</Text>
          </View>
        </View>
      </View>

      {/* Revenue Stats */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              ${analytics?.revenue.today.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Today</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              ${analytics?.revenue.thisMonth.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>This Month</Text>
          </View>
        </View>
      </View>

      {/* Trends */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <TrendingUpIcon size={24} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Trends</Text>
        </View>
        <TrendItem label="User Growth" value={`+${analytics?.trends.userGrowth}%`} />
        <TrendItem label="Match Rate" value={`${analytics?.trends.matchRate}%`} />
        <TrendItem label="Engagement" value={`${analytics?.trends.engagementRate}%`} />
      </View>
    </ScrollView>
  );
}

const TrendItem = ({ label, value }: { label: string; value: string }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.trendRow}>
      <Text style={[styles.trendLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.trendValue, { color: '#10B981' }]}>{value}</Text>
    </View>
  );
};

const styles = {
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 12 },
  card: { margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, opacity: 0.7 },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  trendLabel: { fontSize: 14 },
  trendValue: { fontSize: 16, fontWeight: 'bold' },
};
```

**Step 3: Add Navigation Routes**

**File:** `apps/mobile/src/navigation/AdminNavigator.tsx`

Add new screen configurations:
```typescript
<Stack.Screen
  name="AdminAnalytics"
  component={AdminAnalyticsScreen}
  options={{ title: 'Analytics' }}
/>
<Stack.Screen
  name="AdminUsers"
  component={AdminUsersScreen}
  options={{ title: 'User Management' }}
/>
<Stack.Screen
  name="AdminSecurity"
  component={AdminSecurityScreen}
  options={{ title: 'Security' }}
/>
// ... add all 11 admin screens
```

**Step 4: Create API Integration**

**File:** `apps/mobile/src/services/adminAPI.ts` (expand existing)

```typescript
export const adminAPI = {
  // Existing methods...
  
  getAnalytics: async (): Promise<ApiResponse<Analytics>> => {
    return api.get('/admin/analytics');
  },
  
  getUsers: async (params: UserListParams): Promise<ApiResponse<User[]>> => {
    return api.get('/admin/users', { params });
  },
  
  updateUserStatus: async (userId: string, status: string): Promise<ApiResponse> => {
    return api.patch(`/admin/users/${userId}`, { status });
  },
  
  getSecurityAlerts: async (): Promise<ApiResponse<SecurityAlert[]>> => {
    return api.get('/admin/security/alerts');
  },
  
  // ... more methods
};
```

**Testing Checklist:**
- [ ] Analytics screen loads data
- [ ] Pull-to-refresh updates data
- [ ] User search and filter works
- [ ] Security alerts display in real-time
- [ ] User actions (suspend/ban) work
- [ ] Billing transactions display correctly
- [ ] Navigation between screens smooth
- [ ] Data persists after app restart

---

### Feature 1.3: Gamification UI Implementation

**Status:** 🔴 CRITICAL  
**Estimated Time:** 16 hours  
**Files to Create:** 5 files  
**Files to Modify:** 2 files

#### Problem Statement

Mobile has `LeaderboardService.ts` backend but no UI. Web has complete gamification UI with badges, achievements, and leaderboards.

**User Impact:**
- No way to see badges on mobile
- No achievement notifications
- No leaderboard UI
- Missing engagement drivers

#### Solution

Build complete gamification UI using existing LeaderboardService.

#### Implementation Steps

**Step 1: Create Badge System Component**

**File:** `apps/mobile/src/components/gamification/BadgeSystem.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TrophyIcon, FireIcon, StarIcon } from 'react-native-heroicons/outline';
import { LeaderboardService } from '../../services/LeaderboardService';
import { Badge } from '../../services/LeaderboardService';

const RARITY_COLORS = {
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export function BadgeSystem({ userId }: { userId: string }) {
  const { colors } = useTheme();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      const leaderboardService = new LeaderboardService();
      const userBadges = await leaderboardService.getUserBadges(userId);
      setBadges(userBadges);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBadge = (badge: Badge) => {
    const rarityColor = RARITY_COLORS[badge.rarity];
    const isEarned = badge.unlockedAt !== null;

    return (
      <TouchableOpacity
        key={badge.id}
        style={[
          styles.badgeCard,
          {
            backgroundColor: colors.card,
            borderColor: isEarned ? rarityColor : '#E5E7EB',
            opacity: isEarned ? 1 : 0.5,
          },
        ]}
        onPress={() => showBadgeDetails(badge)}
      >
        <View
          style={[
            styles.badgeIcon,
            {
              backgroundColor: isEarned ? rarityColor : '#E5E7EB',
            },
          ]}
        >
          {badge.icon ? (
            <Image source={{ uri: badge.icon }} style={styles.badgeImage} />
          ) : (
            <TrophyIcon size={32} color={isEarned ? '#FFFFFF' : '#9CA3AF'} />
          )}
        </View>
        <Text
          style={[
            styles.badgeName,
            {
              color: colors.text,
              fontWeight: isEarned ? 'bold' : 'normal',
            },
          ]}
        >
          {badge.name}
        </Text>
        <Text style={[styles.badgeDescription, { color: colors.text, opacity: 0.7 }]}>
          {badge.description}
        </Text>
        {isEarned && (
          <View
            style={[
              styles.rarityBadge,
              {
                backgroundColor: rarityColor,
              },
            ]}
          >
            <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TrophyIcon size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Your Badges</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {badges.filter((b) => b.unlockedAt).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{badges.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Total</Text>
        </View>
      </View>

      <View style={styles.badgeGrid}>
        {badges.map(renderBadge)}
      </View>
    </ScrollView>
  );
}

const styles = {
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 12 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { fontSize: 14, opacity: 0.7 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeImage: { width: 48, height: 48 },
  badgeName: { fontSize: 14, textAlign: 'center', marginBottom: 4 },
  badgeDescription: { fontSize: 12, textAlign: 'center', marginBottom: 8 },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  rarityText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
};
```

**Step 2: Create Leaderboard Component**

**File:** `apps/mobile/src/components/gamification/Leaderboard.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TrophyIcon, FireIcon, StarIcon } from 'react-native-heroicons/solid';
import { LeaderboardService, LeaderboardEntry } from '../../services/LeaderboardService';

export function Leaderboard({ userId }: { userId: string }) {
  const { colors } = useTheme();
  const [category, setCategory] = useState<'overall' | 'streak' | 'matches' | 'engagement'>('overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  const categories = [
    { id: 'overall', label: 'Overall', icon: TrophyIcon },
    { id: 'streak', label: 'Streak', icon: FireIcon },
    { id: 'matches', label: 'Matches', icon: StarIcon },
    { id: 'engagement', label: 'Engagement', icon: TrophyIcon },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Category Tabs */}
      <View style={styles.tabs}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.tab,
              category === cat.id && { backgroundColor: colors.primary },
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <cat.icon size={20} color={category === cat.id ? '#FFFFFF' : colors.text} />
            <Text style={[styles.tabLabel, { color: category === cat.id ? '#FFFFFF' : colors.text }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard */}
      <ScrollView style={styles.list}>
        {entries.map((entry, index) => (
          <View
            key={entry.userId}
            style={[
              styles.entry,
              {
                backgroundColor: entry.userId === userId ? colors.primary + '20' : colors.card,
              },
            ]}
          >
            <View style={styles.rank}>
              <Text style={[styles.rankText, { color: index < 3 ? '#F59E0B' : colors.text }]}>
                #{index + 1}
              </Text>
            </View>
            <Image source={{ uri: entry.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{entry.name}</Text>
              <Text style={[styles.userScore, { color: colors.primary }]}>{entry.score}</Text>
            </View>
            {index < 3 && <TrophyIcon size={24} color="#F59E0B" />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
```

**Step 3: Create Gamification Screen**

**File:** `apps/mobile/src/screens/gamification/GamificationScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { BadgeSystem } from '../../components/gamification/BadgeSystem';
import { Leaderboard } from '../../components/gamification/Leaderboard';
import { AchievementTracker } from '../../components/gamification/AchievementTracker';
import { useAuthStore } from '../../stores/authStore';

const Tab = createMaterialTopTabNavigator();

export default function GamificationScreen() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Badges" component={() => <BadgeSystem userId={user.id} />} />
      <Tab.Screen name="Leaderboard" component={() => <Leaderboard userId={user.id} />} />
      <Tab.Screen name="Achievements" component={() => <AchievementTracker userId={user.id} />} />
    </Tab.Navigator>
  );
}
```

**Testing Checklist:**
- [ ] Badges display with correct rarity colors
- [ ] Badge notifications trigger on unlock
- [ ] Leaderboard updates in real-time
- [ ] Current user highlighted in leaderboard
- [ ] Achievement progress shows accurate percentages
- [ ] Points increment correctly on actions
- [ ] Streak counter accurate
- [ ] All gamification features work offline

---

## Phase 2: High Priority Features (Weeks 3-4)

### Feature 2.1: Stories System Integration

**Status:** 🟡 HIGH PRIORITY  
**Estimated Time:** 20 hours  
**Files to Create:** 6 files  
**Files to Modify:** 2 files

#### Problem Statement

Web has complete stories system. Mobile has none.

**User Impact:**
- No way to share 24-hour photo/video stories
- Missing social engagement feature
- Lower user retention
- Can't compete with Instagram/TikTok

#### Solution

Implement complete stories system matching web functionality.

#### Implementation Steps

**Step 1: Create Story Models & Types**

**File:** `packages/core/src/types/story.ts` (already exists but verify)

**Step 2: Create Story Service**

**File:** `apps/mobile/src/services/StoryService.ts`

```typescript
import { api } from './api';

export interface Story {
  id: string;
  userId: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration: number;
  views: StoryView[];
  replies: StoryReply[];
  createdAt: string;
  expiresAt: string;
}

export interface StoryView {
  userId: string;
  viewedAt: string;
}

export interface StoryReply {
  userId: string;
  message: string;
  createdAt: string;
}

class StoryService {
  async getStoryFeed(): Promise<Story[]> {
    return api.get('/stories');
  }

  async getMyStories(): Promise<Story[]> {
    return api.get('/stories/me');
  }

  async uploadStory(media: { uri: string; type: 'photo' | 'video' }, caption?: string): Promise<Story> {
    const formData = new FormData();
    formData.append('media', {
      uri: media.uri,
      type: media.type === 'photo' ? 'image/jpeg' : 'video/mp4',
      name: 'story.' + (media.type === 'photo' ? 'jpg' : 'mp4'),
    });
    if (caption) {
      formData.append('caption', caption);
    }

    return api.post('/stories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async viewStory(storyId: string): Promise<void> {
    return api.post(`/stories/${storyId}/view`);
  }

  async replyToStory(storyId: string, message: string): Promise<void> {
    return api.post(`/stories/${storyId}/reply`, { message });
  }

  async deleteStory(storyId: string): Promise<void> {
    return api.delete(`/stories/${storyId}`);
  }
}

export const storyService = new StoryService();
```

**Step 3: Create Story Viewer Component**

**File:** `apps/mobile/src/components/stories/StoryViewer.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Video, Dimensions } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { storyService, Story } from '../../services/StoryService';

const { width, height } = Dimensions.get('window');

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<Video>(null);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    // Auto-advance logic
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          nextStory();
          return 0;
        }
        return prev + 0.01;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    storyService.viewStory(currentStory.id);
  }, [currentIndex]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress bars */}
      <View style={styles.progressContainer}>
        {stories.map((story, index) => (
          <View
            key={story.id}
            style={[
              styles.progressBar,
              index < currentIndex && styles.progressBarComplete,
              index === currentIndex && { width: `${progress * 100}%` },
            ]}
          />
        ))}
      </View>

      {/* Media */}
      <TouchableOpacity
        style={styles.mediaContainer}
        activeOpacity={1}
        onPress={nextStory}
      >
        {currentStory.mediaType === 'photo' ? (
          <Image source={{ uri: currentStory.mediaUrl }} style={styles.media} />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode="contain"
            shouldPlay
            isLooping={false}
          />
        )}
      </TouchableOpacity>

      {/* Caption */}
      {currentStory.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{currentStory.caption}</Text>
        </View>
      )}

      {/* Gesture handlers */}
      <GestureHandlerRootView style={styles.gestureContainer}>
        <Swipeable
          renderRightActions={() => null}
          onSwipeableRightOpen={prevStory}
        >
          <View style={styles.invisible} />
        </Swipeable>
      </GestureHandlerRootView>
    </View>
  );
}
```

**Step 4: Create Story Composer**

**File:** `apps/mobile/src/components/stories/StoryComposer.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { storyService } from '../../services/StoryService';

export function StoryComposer({ onClose }: StoryComposerProps) {
  const [media, setMedia] = useState<{ uri: string; type: 'photo' | 'video' } | null>(null);
  const [caption, setCaption] = useState('');

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets?.[0]) {
        setMedia({ uri: response.assets[0].uri, type: 'photo' });
      }
    });
  };

  const selectFromGallery = () => {
    launchImageLibrary({ mediaType: 'mixed', quality: 1 }, (response) => {
      if (response.assets?.[0]) {
        const type = response.assets[0].type?.startsWith('video/') ? 'video' : 'photo';
        setMedia({ uri: response.assets[0].uri, type });
      }
    });
  };

  const publish = async () => {
    if (!media) return;

    try {
      await storyService.uploadStory(media, caption);
      onClose();
    } catch (error) {
      console.error('Failed to publish story:', error);
    }
  };

  return (
    <View style={styles.container}>
      {media ? (
        <View style={styles.preview}>
          <Image source={{ uri: media.uri }} style={styles.image} />
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Add a caption..."
            style={styles.input}
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setMedia(null)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={publish}>
              <Text>Publish</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity onPress={takePhoto}>
            <Text>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={selectFromGallery}>
            <Text>Select from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
```

**Testing Checklist:**
- [ ] Story feed loads with grouped users
- [ ] Story viewer displays media correctly
- [ ] Auto-advance works (5s for photos)
- [ ] Swipe navigation works
- [ ] Photo/video capture works
- [ ] Story upload completes
- [ ] View tracking accurate
- [ ] Stories expire after 24 hours
- [ ] Story rings show viewed/unviewed status

---

## Feature 2.2: Community Feed with AI

**Status:** 🟡 HIGH PRIORITY  
**Estimated Time:** 20 hours  
**Files to Create:** 4 files  
**Files to Modify:** 1 file

#### Implementation Steps

**Step 1: Create Community Feed Component**

**File:** `apps/mobile/src/components/community/CommunityFeed.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { communityAPI } from '../../services/communityAPI';
import { useAuthStore } from '../../stores/authStore';

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  packId?: string;
}

export function CommunityFeed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await communityAPI.getFeed();
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.images && (
        <View style={styles.images}>
          {item.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.image} />
          ))}
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleLike(item.id)}>
          <Text>❤️ {item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleComment(item.id)}>
          <Text>💬 {item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return <FlatList data={posts} renderItem={renderPost} keyExtractor={(item) => item.id} />;
}
```

**Step 2: Create Community API Service**

**File:** `apps/mobile/src/services/communityAPI.ts`

```typescript
import { api } from './api';

export const communityAPI = {
  getFeed: async (params = {}) => {
    return api.get('/community/feed', { params });
  },

  createPost: async (data: { content: string; images?: string[]; packId?: string }) => {
    return api.post('/community/posts', data);
  },

  likePost: async (postId: string) => {
    return api.post(`/community/posts/${postId}/like`);
  },

  addComment: async (postId: string, content: string) => {
    return api.post(`/community/posts/${postId}/comments`, { content });
  },
};
```

**Testing Checklist:**
- [ ] Feed loads with real-time updates
- [ ] AI suggestions appear correctly
- [ ] Pack groups filter works
- [ ] Like/comment interactions work
- [ ] Pull-to-refresh updates
- [ ] Infinite scroll works
- [ ] Moderation system flags content

---

## Phase 3: Advanced Features (Weeks 5-8)


---

## Comprehensive Testing Strategy

### Testing Goals

- Target 250+ test cases
- 90%+ code coverage
- Comprehensive E2E tests
- Performance benchmarks

### Test Structure

```
apps/mobile/src/__tests__/
├── services/
│   ├── LeaderboardService.test.ts
│   ├── StoryService.test.ts
│   └── communityAPI.test.ts
├── components/
│   ├── gamification/
│   │   ├── BadgeSystem.test.tsx
│   │   └── Leaderboard.test.tsx
│   └── stories/
│       ├── StoryViewer.test.tsx
│       └── StoryComposer.test.tsx
└── e2e/
    ├── gamification.spec.ts
    ├── stories.spec.ts
    └── admin.spec.ts
```

### Sample Test Suite

**File:** `apps/mobile/src/__tests__/services/LeaderboardService.test.ts`

```typescript
import { LeaderboardService } from '../../services/LeaderboardService';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(() => {
    service = new LeaderboardService();
  });

  describe('getUserBadges', () => {
    it('should return user badges', async () => {
      const badges = await service.getUserBadges('user123');
      expect(badges).toBeDefined();
      expect(Array.isArray(badges)).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      // Mock network failure
      await expect(service.getUserBadges('user123')).rejects.toThrow();
    });
  });

  describe('recordAchievement', () => {
    it('should record new achievement', async () => {
      const result = await service.recordAchievement('user123', 'first_match');
      expect(result.success).toBe(true);
    });
  });
});
```

---

## Deployment Strategy

### Phase 1 Rollout (Week 1-2)
- Deploy premium tier fix (critical)
- Deploy gamification UI (high engagement)
- Monitor metrics closely

### Phase 2 Rollout (Week 3-4)
- Deploy stories system (virality)
- Deploy community feed (engagement)
- A/B test features

### Phase 3 Rollout (Week 5-8)
- Deploy remaining features
- Full testing suite
- Performance optimization

### Monitoring

Track metrics:
- Feature adoption rates
- User engagement (DAU/MAU)
- Premium conversion rates
- Error rates
- Performance metrics

---

## Success Metrics

### Week 2 Checkpoint
- [ ] Premium tiers standardized
- [ ] Gamification UI live
- [ ] 50% feature parity achieved

### Week 4 Checkpoint
- [ ] Stories system live
- [ ] Community feed active
- [ ] 75% feature parity achieved

### Week 8 Checkpoint
- [ ] All features deployed
- [ ] 90% feature parity achieved
- [ ] 250+ tests passing
- [ ] Zero critical bugs

---

**Estimated Total Time:** 180-220 hours  
**Team Size:** 2-3 developers  
**Timeline:** 8-10 weeks

---

*This document is a living implementation guide. Update as features are completed or requirements change.*

