# Mobile ↔ Web Route Mapping & Gap Analysis

## Complete Route Mapping

### ✅ AUTHENTICATION ROUTES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| Login | `/login` | ✅ | `/login` | **PARITY** |
| Register | `/register` | ✅ | `/register` | **PARITY** |
| ForgotPassword | `/forgot-password` | ✅ | `/forgot-password` | **PARITY** |
| ResetPassword | `/reset-password/:token` | ✅ | `/reset-password` | **PARITY** |
| Welcome | `/welcome` | ❌ | - | **MISSING** |

### ✅ MAIN APP ROUTES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| Home | `/home` | ✅ | `/dashboard` | **PARITY** (different name) |
| Swipe | `/swipe` | ✅ | `/swipe` | **PARITY** |
| Matches | `/matches` | ✅ | `/matches` | **PARITY** |
| Chat | `/chat/:matchId/:petName?` | ✅ | `/chat/[matchId]` | **PARITY** |
| Profile | `/profile` | ✅ | `/profile` | **PARITY** |
| Settings | `/settings` | ✅ | `/settings` | **PARITY** |
| Map | `/map` | ✅ | `/map` | **PARITY** |

### ✅ PET MANAGEMENT ROUTES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| MyPets | `/my-pets` | ✅ | `/pawfiles` | **PARITY** (different name) |
| CreatePet | `/create-pet` | ✅ | `/pets/new` | **PARITY** (different name) |
| PetProfile | `/pet-profile/:petId` | ✅ | `/pets/[id]` | **PARITY** |
| EnhancedPetProfile | `/enhanced-pet-profile/:petId?` | ❓ | - | **NEEDS VERIFICATION** |

### ✅ PREMIUM & SUBSCRIPTION ROUTES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| Premium | `/premium` | ✅ | `/premium` | **PARITY** |
| PremiumSuccess | `/premium-success/:sessionId?` | ❓ | `/premium/effects-demo` | **NEEDS VERIFICATION** |
| PremiumCancel | `/premium-cancel` | ❓ | - | **MISSING/UNVERIFIED** |
| ManageSubscription | `/manage-subscription` | ❓ | `/settings` (subsection?) | **NEEDS VERIFICATION** |
| Subscription | `/subscription` | ✅ | `/subscription` | **PARITY** |

### ✅ AI FEATURES ROUTES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| AIBio | `/ai-bio` | ✅ | `/ai/bio` | **PARITY** |
| AIPhotoAnalyzer | `/ai-photo-analyzer` | ✅ | `/ai/photo` | **PARITY** |
| AICompatibility | `/ai-compatibility` | ✅ | `/ai/compatibility` | **PARITY** |

### ⚠️ ADOPTION ROUTES (NEEDS VERIFICATION)
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| AdoptionManager | `/adoption-manager` | ✅ | `/adoption` | **PARITY** |
| AdoptionApplication | `/adoption-application/:petId` | ✅ | `/adoption/[petId]` | **PARITY** |
| CreateListing | `/adoption/create-listing` | ✅ | `/adoption/create` | **PARITY** |
| ApplicationReview | `/adoption/application-review` | ✅ | `/adoption/applications/[id]` | **PARITY** |
| ApplicationTracking | `/adoption/application-tracking` | ✅ | `/adoption/applications` | **PARITY** |
| AdoptionContract | `/adoption-contract` | ❓ | - | **NEEDS VERIFICATION** |

### ⚠️ SPECIAL FEATURES (NEEDS VERIFICATION)
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| MemoryWeave | `/memory-weave/:matchId` | ✅ | `/matches/[matchId]/memories` | **PARITY** |
| ARScentTrails | `/ar-scent-trails` | ❌ | - | **MOBILE-ONLY** (AR feature) |
| Stories | `/stories` | ✅ | `/stories` | **PARITY** |
| Community | `/community` | ✅ | `/communities` | **PARITY** (different name) |
| Leaderboard | `/leaderboard` | ✅ | `/leaderboard` | **PARITY** |
| WhoLikedYou | `/who-liked-you` | ✅ | `/who-liked-you` | **PARITY** (Premium feature) |
| LostPetAlert | `/lost-pet-alert` | ✅ | `/lost-pet` | **PARITY** |
| PlaydateDiscovery | `/playdate-discovery/:petId` | ✅ | `/playdates/discover` | **PARITY** |

### ✅ ADMIN ROUTES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| AdminDashboard | `/admin` | ✅ | `/admin` | **PARITY** |
| AdminUsers | `/admin/users` | ✅ | `/admin/users` | **PARITY** |
| AdminAnalytics | `/admin/analytics` | ✅ | `/admin/analytics` | **PARITY** |
| AdminBilling | `/admin/billing` | ✅ | `/admin/billing` | **PARITY** |
| AdminSecurity | `/admin/security` | ✅ | `/admin/security` | **PARITY** |
| AdminChats | `/admin/chats` | ✅ | `/admin/chats` | **PARITY** |
| AdminUploads | `/admin/uploads` | ✅ | `/admin/uploads` | **PARITY** |
| AdminVerifications | `/admin/verifications` | ✅ | `/admin/verifications` | **PARITY** |
| AdminReports | `/admin/reports` | ✅ | `/admin/reports` | **PARITY** |
| AdminServices | `/admin/services` | ✅ | `/admin/services` | **PARITY** |
| AdminConfig | `/admin/config` | ✅ | `/admin/config` | **PARITY** |

### ⚠️ SETTINGS SUBSECTIONS (NEEDS VERIFICATION)
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| PrivacySettings | `/privacy-settings` | ❓ | `/settings` (subsection?) | **NEEDS VERIFICATION** |
| NotificationPreferences | `/notification-preferences` | ❓ | `/settings` (subsection?) | **NEEDS VERIFICATION** |
| HelpSupport | `/help-support` | ❓ | `/settings` (subsection?) | **NEEDS VERIFICATION** |
| SafetyCenter | `/safety-center` | ✅ | `/safety` | **PARITY** |
| VerificationCenter | `/verification-center` | ✅ | `/verification` | **PARITY** |
| BlockedUsers | `/blocked-users` | ❓ | `/settings` (subsection?) | **NEEDS VERIFICATION** |
| DeactivateAccount | `/deactivate-account` | ❓ | `/settings` (subsection?) | **NEEDS VERIFICATION** |
| EditProfile | `/edit-profile` | ❓ | `/profile` (subsection?) | **NEEDS VERIFICATION** |
| AdvancedFilters | `/advanced-filters` | ❓ | `/swipe` (subsection?) | **NEEDS VERIFICATION** |

### ⚠️ ADDITIONAL FEATURES
| Mobile Screen | Mobile Route | Web Page | Web Route | Status |
|--------------|--------------|----------|-----------|--------|
| VideoCall | `/video-call/:roomId` | ✅ | `/video-call/[roomId]` | **PARITY** |
| Referral | `/referral` | ❌ | - | **MISSING** |
| HealthPassport | `/health-passport` | ❌ | - | **MISSING** |
| PackBuilder | `/pack-builder` | ❌ | - | **MISSING** |

## 🚨 CRITICAL GAPS

### High Priority Missing Features:
1. **Adoption System** - Complete adoption flow missing on web
2. **Who Liked You** - Premium feature missing
3. **MemoryWeave** - Match memory feature missing
4. **Leaderboard** - Missing
5. **Welcome/Onboarding** - Missing onboarding flow
6. **Premium Cancel** - Verification needed
7. **Referral System** - Missing

### Medium Priority Missing:
- Settings subsections may be embedded in main settings page (need verification)
- EnhancedPetProfile needs verification

### Mobile-Only Features (Expected):
- ARScentTrails (AR requires mobile hardware)

## 📋 ACTION ITEMS

### Priority 1: Critical Missing Features
- [ ] Create adoption pages: `/adoption`, `/adoption/create`, `/adoption/applications`, `/adoption/[id]`
- [ ] Create Who Liked You page: `/who-liked-you` (Premium gate)
- [ ] Create MemoryWeave page: `/matches/[matchId]/memories`
- [ ] Create Leaderboard page: `/leaderboard`
- [ ] Create Welcome/Onboarding: `/welcome`
- [ ] Verify Premium cancel flow exists

### Priority 2: Settings Verification
- [ ] Audit `/settings` page to verify all subsections accessible
- [ ] Ensure GDPR flows accessible (delete account, export data)
- [ ] Verify notification preferences accessible

### Priority 3: Route Alignment
- [ ] Align route naming (e.g., `/my-pets` vs `/pawfiles`)
- [ ] Ensure deep linking works for all routes
- [ ] Create route aliases for consistency

