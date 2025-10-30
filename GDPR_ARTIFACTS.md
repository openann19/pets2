# GDPR Artifacts - PawfectMatch

**Status**: ✅ Complete  
**Last Updated**: 2025-10-26

---

## 1. Lawful Basis Map

### 1.1 Data Categories & Lawful Bases

| Data Category | Lawful Basis | Purpose | Legal Reference |
|--------------|--------------|---------|-----------------|
| Email, Phone | Consent (Contract) | Service delivery, communication | GDPR Art. 6(1)(a),(b) |
| Pet Photos | Consent | Profile creation, matching | GDPR Art. 6(1)(a) |
| Verification Documents | Consent (Legal obligation) | Identity verification, fraud prevention | GDPR Art. 6(1)(a),(c) |
| Biometric Data (Selfie/Liveness) | Explicit Consent (Special category) | Identity verification | GDPR Art. 9(2)(a) |
| Location Data | Consent (Legitimate Interest) | Location-based matching | GDPR Art. 6(1)(a),(f) |
| Chat Messages | Contract Performance | Communication feature | GDPR Art. 6(1)(b) |
| Usage Analytics | Legitimate Interest | Service improvement | GDPR Art. 6(1)(f) |

### 1.2 Special Category Data

**Biometric Data** (Selfie/Liveness for verification):
- **Legal Basis**: Explicit Consent (GDPR Art. 9(2)(a))
- **Collection**: On-demand only (Tier 1+ verification)
- **Retention**: 90 days from verification decision
- **Processing**: On-device capture + secure backend storage
- **User Rights**: View, delete, request processing restriction

---

## 2. Data Protection Impact Assessment (DPIA)

### 2.1 Processing Activities Assessed

#### A. Photo Upload & AI Analysis
- **Risk**: High volume personal data, AI profiling
- **Mitigation**: 
  - Client-side EXIF stripping
  - Server-side MIME validation
  - Perceptual hash for duplicate detection
  - Encrypted storage (S3 SSE)
  - Audit trail for all AI decisions
- **Controls**: Rate limiting, quota management

#### B. Identity Verification (Biometric)
- **Risk**: Special category data exposure, identity theft
- **Mitigation**:
  - Liveness detection to prevent spoofing
  - Document authenticity checks
  - Short retention period (90 days)
  - Encryption at rest (AES-256)
  - Access controls (admin-only)
- **Controls**: Staff training, incident response plan

#### C. Automated Moderation
- **Risk**: Incorrect blocking, bias
- **Mitigation**:
  - Human review for borderline cases
  - Appeal process for rejections
  - Transparent rejection reasons
  - Model version tracking
- **Controls**: Regular model audits, bias testing

---

## 3. Retention Schedule

### 3.1 Data Categories & Retention

| Data Category | Retention Period | Deletion Trigger | Legal Basis |
|---------------|------------------|------------------|-------------|
| User Profile (basic) | While account active | Account deletion | Contract |
| Pet Photos | While pet active | Pet deletion | Consent |
| Verification Documents | 90 days | Post-decision | Explicit consent |
| Chat Messages | 365 days | User request | Contract |
| Moderation Decisions | 5 years | Compliance | Legal obligation |
| Audit Logs | 7 years | Compliance | Legal obligation |
| Analytics (anonymized) | Indefinite | N/A (anonymized) | Legitimate interest |

### 3.2 Special Cases

**Rejected Uploads**: Delete after 30 days unless under appeal  
**Pending Verifications**: Keep until decision + 90 days  
**Appealed Content**: Retain until appeal resolved + 90 days

---

## 4. Data Subject Rights Implementation

### 4.1 Right to Access (Article 15)

**Endpoint**: `GET /api/account/export`  
**Response Format**: JSON (machine-readable)  
**Includes**: Profile, pets, messages, matches, verification status, moderation history

### 4.2 Right to Rectification (Article 16)

**Endpoints**: 
- `PUT /api/profile` - Update profile
- `PUT /api/pets/:id` - Update pet info
- `POST /api/verification/:id/documents` - Add verification docs

### 4.3 Right to Erasure (Article 17)

**Endpoint**: `DELETE /api/account`  
**Grace Period**: 30 days (cancellable)  
**Deletion Scope**: 
- User account soft-deleted
- Pet profiles deleted
- Chat messages deleted
- Verification docs deleted (if within retention)
- Photos in S3 tagged for deletion
- Backup retention: 90 days (legal holds)

### 4.4 Right to Restrict Processing (Article 18)

**Endpoint**: `PUT /api/privacy`  
**Options**:
- Disable analytics
- Disable location tracking
- Disable push notifications
- Disable matching algorithm

### 4.5 Right to Data Portability (Article 20)

**Endpoint**: `GET /api/account/export`  
**Format**: 
- JSON export (complete data)
- CSV export (tabular data)
- Download link (30-day expiration)

### 4.6 Right to Object (Article 21)

**Endpoints**:
- `PUT /api/privacy` - Opt-out controls
- `DELETE /api/account` - Account deletion

---

## 5. Consent Management

### 5.1 Consent Types

1. **Essential** (Cannot opt-out)
   - Email verification
   - Terms acceptance
   - Privacy policy acceptance

2. **Functional** (Default opt-in, can opt-out)
   - Photo upload
   - Location tracking
   - Chat functionality

3. **Marketing** (Default opt-out)
   - Email notifications
   - Push notifications
   - Third-party sharing

### 5.2 Consent Records

**Storage**: MongoDB `consents` collection  
**Fields**: userId, type, grantedAt, version, optOutAt  
**Versioning**: Track policy changes

---

## 6. Security Measures

### 6.1 Technical Safeguards

- **Encryption at Rest**: AES-256 (S3), database encryption
- **Encryption in Transit**: TLS 1.3 (HTTPS only)
- **Access Controls**: Role-based (RBAC), IP whitelisting
- **Audit Logging**: All data access logged
- **Backup Strategy**: Encrypted backups, 90-day retention
- **Incident Response**: < 72 hour breach notification

### 6.2 Organizational Measures

- **Staff Training**: GDPR awareness, data protection
- **DPO Contact**: dpo@pawfectmatch.com
- **Data Processing Agreements**: With all processors (S3, Cloudinary, Stripe)
- **Third-Party Audits**: Annual security assessments

---

## 7. International Transfers

### 7.1 Data Transfers

| Destination | Legal Mechanism | Data Types |
|-------------|-----------------|------------|
| US (AWS S3) | Standard Contractual Clauses | Photos, profile data |
| US (Cloudinary) | SCC | Image processing |
| US (Stripe) | SCC | Payment data |
| EU (MongoDB Atlas) | No transfer | Primary database |

### 7.2 Safeguards

- SCC Module 2 (controller-to-controller)
- Supplier security assessments
- Encryption for all transfers

---

## 8. User Rights Exercise

### 8.1 How Users Exercise Rights

**Mobile App**:
- Settings → Privacy → Export Data
- Settings → Privacy → Delete Account
- Settings → Verification → View/Delete Documents

**Web**:
- Privacy Dashboard
- Account Deletion Form
- Data Export Request

**Email**:
- dpo@pawfectmatch.com
- Support@email.com

### 8.2 Response Times

- **Data Export**: < 30 days
- **Account Deletion**: < 30 days (+ grace period)
- **Rectification**: < 14 days
- **Complaint Response**: < 7 days

---

## 9. Compliance Monitoring

### 9.1 KPIs

- Consent rate: > 95%
- DSAR response time: < 7 days
- Breach incidents: < 1/year
- DPIA coverage: 100%

### 9.2 Audits

- **Frequency**: Quarterly
- **Scope**: Data processing activities, security measures
- **External**: Annual third-party audit

---

## 10. Contact Information

**Data Protection Officer**:  
Email: dpo@pawfectmatch.com  
Address: [Company Address]

**Supervisory Authority**:  
[Relevant EU DPA]

---

**End of GDPR Artifacts**

