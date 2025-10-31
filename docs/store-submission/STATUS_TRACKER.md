# 📊 Store Submission Status Tracker
**App**: PawfectMatch Premium  
**Purpose**: Quick one-line status checks for submission readiness  
**Last Updated**: [DATE]  
**Verified By**: [NAME]

---

## ✅ ONE-LINE STATUS CHECKS

### iOS App Store

- [ ] **ATT**: Confirm ATT shown only when needed and App Privacy answers match SDKs
- [ ] **Account Deletion**: Account deletion fully in-app; payments compliant; reviewer notes drafted
- [ ] **Store Assets**: All screenshots, metadata, and TestFlight build ready
- [ ] **Quality**: Crash rate < 0.2%, cold start < 2.5s, IAP flows tested

**Status**: ⚠️ **IN PROGRESS**
- ✅ Account deletion implemented
- ✅ IAP via RevenueCat
- ⚠️ ATT review needed (generic description)
- ⚠️ TestFlight build needed
- ⚠️ Screenshots needed

---

### Android Play Store

- [ ] **Target API**: Confirm target API 35, Data safety/deletion forms submitted, Pre-launch report clean
- [ ] **Account Deletion**: Account deletion fully in-app; payments compliant; reviewer notes drafted
- [ ] **Store Assets**: All screenshots, metadata, and AAB build ready
- [ ] **Quality**: Crash rate < 0.2%, ANR < 0.1%, cold start < 2.5s, Play Billing flows tested

**Status**: ❌ **BLOCKED**
- ✅ Account deletion implemented
- ✅ Play Billing via RevenueCat
- ❌ **Target API 35 required** (currently API 34)
- ⚠️ Data Safety form needs completion
- ⚠️ Pre-launch report needs to be run
- ⚠️ Screenshots needed

---

## 🎯 PRIORITY ACTIONS (Before Submission)

### iOS Priority Actions

1. **🔴 HIGH**: Review ATT implementation
   - [ ] Audit tracking SDKs
   - [ ] Remove ATT key if no tracking, OR implement ATT if tracking exists
   - [ ] Update NSUserTrackingUsageDescription to be specific

2. **🟡 MEDIUM**: Prepare TestFlight build
   - [ ] Build production iOS build
   - [ ] Upload to TestFlight
   - [ ] Test with external testers (if needed)

3. **🟡 MEDIUM**: Store assets
   - [ ] Take screenshots (6.5" iPhone, 6.7" iPhone, iPad)
   - [ ] Write app description
   - [ ] Prepare preview video (optional)

4. **🟢 LOW**: Verify links
   - [ ] Test privacy policy URL
   - [ ] Verify all in-app links work

---

### Android Priority Actions

1. **🔴 CRITICAL**: Update Target API
   - [ ] Update `targetSdkVersion: 35` in `app.config.cjs`
   - [ ] Update `compileSdkVersion: 35`
   - [ ] Test on Android 15 emulator/device
   - [ ] Rebuild production AAB

2. **🔴 HIGH**: Complete Data Safety form
   - [ ] Audit all SDKs for data collection
   - [ ] Fill Data Safety form accurately
   - [ ] Complete Data deletion questions
   - [ ] Verify form matches code behavior

3. **🟡 MEDIUM**: Run Pre-launch report
   - [ ] Upload AAB to Play Console
   - [ ] Run Pre-launch report
   - [ ] Fix all crashes/ANRs
   - [ ] Verify no malware flags

4. **🟡 MEDIUM**: Store assets
   - [ ] Take screenshots (phone, tablet)
   - [ ] Write app description
   - [ ] Prepare preview video (optional)

5. **🟢 LOW**: Verify links
   - [ ] Test privacy policy URL
   - [ ] Verify all in-app links work

---

## 📝 DETAILED STATUS

### iOS App Store Connect

| Item | Status | Notes |
|------|--------|-------|
| App Privacy questions | ⚠️ Partial | Needs SDK audit |
| ATT implementation | ⚠️ Review | Generic description, needs audit |
| Account deletion | ✅ Complete | Implemented in-app |
| IAP compliance | ✅ Complete | RevenueCat integration |
| TestFlight build | ❌ Missing | Need to build and upload |
| Screenshots | ❌ Missing | Need to take |
| App metadata | ⚠️ Partial | Description needed |
| Reviewer notes | ⚠️ Draft | Use template |
| Demo account | ⚠️ Needed | Create test account |

---

### Google Play Console

| Item | Status | Notes |
|------|--------|-------|
| Target API 35 | ❌ Blocked | Currently API 34, needs update |
| Data Safety form | ❌ Missing | Needs completion |
| Data deletion questions | ❌ Missing | Needs completion |
| Account deletion | ✅ Complete | Implemented in-app |
| Play Billing | ✅ Complete | RevenueCat integration |
| Pre-launch report | ❌ Not run | Run after AAB upload |
| AAB build | ⚠️ Needed | Need API 35 build |
| Screenshots | ❌ Missing | Need to take |
| App metadata | ⚠️ Partial | Description needed |
| Reviewer notes | ⚠️ Draft | Use template |
| Demo account | ⚠️ Needed | Create test account |

---

## 🚦 SUBMISSION READINESS

### iOS: ⚠️ **NOT READY**
- Blockers: ATT review, TestFlight build, screenshots
- ETA: [ESTIMATE]

### Android: ❌ **NOT READY**
- Blockers: Target API 35, Data Safety form, Pre-launch report
- ETA: [ESTIMATE]

---

## 📅 TIMELINE

### Phase 1: Preparation (Week 1)
- [ ] iOS: ATT audit and fix
- [ ] Android: Update to API 35
- [ ] Both: Complete store assets (screenshots, metadata)

### Phase 2: Testing (Week 2)
- [ ] iOS: TestFlight build and testing
- [ ] Android: Pre-launch report and fixes
- [ ] Both: End-to-end testing (purchases, deletion, etc.)

### Phase 3: Submission (Week 3)
- [ ] iOS: Submit to App Store Connect
- [ ] Android: Submit to Play Console (start with Internal Testing)
- [ ] Both: Monitor review status

---

## 📞 CONTACTS

- **App Store Connect**: [APPLE_ID]
- **Play Console**: [GOOGLE_ACCOUNT]
- **Demo Account (iOS)**: reviewer@pawfectmatch.com
- **Demo Account (Android)**: reviewer@pawfectmatch.com
- **Support Email**: support@pawfectmatch.com

---

**Next Review Date**: [DATE]  
**Last Verified**: [DATE]

