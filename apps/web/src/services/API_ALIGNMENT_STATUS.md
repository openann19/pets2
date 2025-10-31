# API Service Alignment Status

## Overview
This document tracks the alignment between mobile and web API service structures.

## ✅ Completed

### 1. GDPR Service (`apps/web/src/services/gdprService.ts`)
- ✅ Created unified GDPR service matching mobile app structure
- ✅ Methods implemented:
  - `requestAccountDeletion` - Request account deletion with grace period
  - `cancelAccountDeletion` - Cancel pending deletion
  - `getAccountDeletionStatus` - Get deletion status
  - `exportUserData` - Export user data (Article 20)
- ✅ Type definitions match mobile app contracts
- ✅ Error handling aligned with mobile patterns

### 2. Theme System
- ✅ Unified theme structure matching mobile (`apps/web/src/theme/`)
- ✅ `AppTheme` type contract identical to mobile
- ✅ Semantic tokens: `colors.bg`, `colors.surface`, `colors.onSurface`, etc.
- ✅ Spacing/radii tokens: `spacing.{xs...4xl}`, `radii.{none...full}`
- ✅ Integrated with next-themes via `UnifiedThemeProvider`

## 🔄 In Progress

### Service Method Parity
Need to verify all mobile API methods have web equivalents:

**Mobile API Structure:**
- `matchesAPI` - Matches, messages, chat methods
- `likesAPI` - Who liked you feature
- `premiumAPI` - Subscription management
- `adoptionAPI` - Adoption listings/applications
- `moderationAPI` - Moderation queue/stats
- `notificationPreferencesAPI` - Notification settings
- `aiAPI` - AI bio, photo analysis, compatibility
- GDPR methods (now aligned ✅)

**Web API Structure:**
- `matchesAPI` ✅
- `petsAPI` ✅
- `chatAPI` ✅
- `aiAPI` ✅
- `subscriptionAPI` ✅
- `gdprService` ✅ (newly added)

**Missing/Needs Verification:**
- `likesAPI` - Who liked you (premium feature)
- `adoptionAPI` - Adoption flows
- `moderationAPI` - Moderation tools
- `notificationPreferencesAPI` - Notification preferences

## 📋 Next Steps

1. **Add missing API modules** to match mobile structure
2. **Align method signatures** - ensure all methods have same parameters/return types
3. **Standardize error handling** - use consistent error patterns
4. **Update components** to use unified API structure
5. **Document API contracts** - create OpenAPI spec for web routes matching mobile

## Migration Guide

### For Components Using GDPR:
```typescript
// Old (DeleteAccountDialog.tsx pattern)
const accountService = new AccountService();
await accountService.requestAccountDeletion(args, token);

// New (unified)
import { gdprService } from '@/services/gdprService';
await gdprService.requestAccountDeletion(data);
```

### For Components Using Theme:
```typescript
// Old
import { COLORS } from '@/constants/design-tokens';

// New
import { useTheme } from '@/theme';
const theme = useTheme();
// Use theme.colors.bg, theme.colors.surface, etc.
```

