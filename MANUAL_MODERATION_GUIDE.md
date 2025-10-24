# 📸 Manual Photo Moderation System - Human Only

## Overview
**100% Human-Driven** content moderation system with no AI. Every photo upload goes directly to your support team for manual review through the admin console.

---

## How It Works

### User Upload Flow
```
1. User uploads photo
   ↓
2. Photo stored in "moderation-queue" folder (Cloudinary)
   ↓
3. Added to pending review queue
   ↓
4. Support team reviews in admin console
   ↓
5. Click "Approve" ✓ or "Reject" ✗
   ↓
6. User notified of decision
```

### Trusted User Auto-Approval
Users become "trusted" after:
- ✅ 10+ approved uploads
- ✅ 0 rejected uploads  
- ✅ 30+ days account age
- ✅ Email verified

Trusted users get **instant approval** (skip manual review).

---

## Admin Console Access

### Login
1. Navigate to `/admin/moderation`
2. Login with admin credentials
3. You'll see the moderation queue

### Interface
```
┌─────────────────────────────────────────┐
│  Photo Moderation Queue                 │
│  [Pending: 12]  [All]    Item 1 of 15  │
└─────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────┐
│                      │  │ Photo Details│
│   [PHOTO PREVIEW]    │  │ ──────────── │
│                      │  │ 1920 × 1080  │
│      Click to zoom   │  │ JPG, 2.3 MB  │
└──────────────────────┘  │              │
                          │ User Context │
  [✓ Approve]  [✗ Reject] │ ──────────── │
                          │ Name: John   │
  Quick Reject:           │ Uploads: 5   │
  [Explicit] [Violence]   │ Approved: 3  │
  [Self-Harm] [Spam]     │ Rejected: 1  │
                          │ Trusted: No  │
  [← Previous] [Next →]   └──────────────┘
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **A** | Approve photo |
| **R** | Reject photo |
| **←** | Previous photo |
| **→** | Next photo |

---

## Moderation Guidelines

### ✅ APPROVE if photo shows:
- User's pet (dog, cat, etc.)
- Clear, appropriate pet photo
- Profile pictures (person + pet)
- Pet in normal activities (playing, sleeping, eating)
- Multiple pets together
- Pet accessories/toys (context appropriate)

### ✗ REJECT if photo contains:

#### 1. **Explicit Content**
- Nudity or sexual content
- Inappropriate exposure
- Sexual acts or gestures
- Inappropriate clothing

#### 2. **Violence**
- Animal abuse or cruelty
- Fighting or aggressive behavior
- Blood or injuries (graphic)
- Weapons pointed at animals
- Dead animals

#### 3. **Self-Harm**
- Cutting or self-injury
- Suicide-related content
- Self-harm tools or methods
- **🚨 URGENT**: If you see this, also report to safety team immediately

#### 4. **Drugs**
- Drug paraphernalia (pipes, bongs, needles)
- Illegal substances
- Pills/medications (unless clearly pet medication with vet context)
- Smoking (if primary focus)

#### 5. **Hate Speech / Offensive**
- Nazi symbols, KKK imagery
- Hate group symbols
- Offensive gestures
- Racist, sexist, or discriminatory content

#### 6. **Spam / Irrelevant**
- Not a pet photo at all
- Screenshots of other apps
- Text-only images
- Advertisements
- QR codes or promotional material
- Random objects with no pet
- Memes (unless pet-related and appropriate)

#### 7. **Quality Issues** (use judgment)
- Completely blurry (can't see pet)
- Inappropriate cropping (showing private areas)
- Photo of a photo (screenshot)
- Clearly stolen/watermarked professional photos

---

## Decision Making Guide

### When in Doubt
1. **Look at user history** - Have they uploaded good photos before?
2. **Context matters** - Is the focus on the pet?
3. **Err on side of caution** - If unsure, reject with reason
4. **Ask for second opinion** - Flag unusual cases to senior moderator

### Common Edge Cases

**Q: Photo shows person in swimwear at beach with dog?**  
A: ✅ APPROVE if appropriate swimwear and focus is on pet

**Q: Pet with minor injury (bandage visible)?**  
A: ✅ APPROVE if not graphic, shows care

**Q: Prescription medication visible in background?**  
A: ✅ APPROVE if clearly pet medication and not primary focus

**Q: Pet costume that could be offensive?**  
A: ✗ REJECT if costume depicts violence, hate symbols, or inappropriate content

**Q: Professional photo with watermark?**  
A: ✗ REJECT - likely stolen, ask user to upload original

---

## How to Approve

1. Review photo carefully
2. Check it meets guidelines
3. Click **"✓ Approve"** button or press **A** key
4. Photo moves to "approved" folder
5. User gets notification: "Photo approved!"
6. Next photo loads automatically

---

## How to Reject

### Method 1: Quick Reject (Recommended)
1. Click one of the quick reject buttons:
   - **[Explicit]** - Sexual/inappropriate content
   - **[Violence]** - Violent or disturbing
   - **[Self-Harm]** - Self-harm content
   - **[Spam]** - Not a pet photo
2. Photo deleted from storage
3. User gets notification with reason

### Method 2: Custom Reject
1. Press **R** key or click **"✗ Reject"**
2. Enter category: `explicit`, `violence`, `self-harm`, `spam`, `other`
3. Enter reason (shown to user): e.g., "Photo does not show a pet"
4. Confirm
5. Photo deleted, user notified

### Rejection Message Examples

**Good:**
- "Photo contains explicit content not appropriate for our platform"
- "This photo appears to be spam or not pet-related"
- "Photo shows concerning self-harm content. If you need help, please contact [crisis line]"

**Bad:**
- "Rejected" (too vague)
- "Gross" (unprofessional)
- "You violated rules" (not helpful)

---

## Daily Workflow

### Morning (10-15 minutes)
1. Login to `/admin/moderation`
2. Check queue size (shown at top)
3. Review all "High Priority" items first
4. Process 20-30 photos

### Throughout Day (as needed)
- Check queue every 2-3 hours
- Respond to urgent items within 1 hour
- Target: < 50 items in queue at all times

### End of Day (5 minutes)
- Clear any remaining items
- Flag any difficult cases for review
- Note any patterns (repeated violators, etc.)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| **Average Review Time** | < 30 seconds per photo |
| **Queue Wait Time** | < 2 hours |
| **Daily Throughput** | 100+ photos reviewed |
| **Accuracy** | < 5% appeals overturned |

---

## Reporting & Escalation

### Report to Safety Team if you see:
- 🚨 Self-harm or suicide content
- 🚨 Child endangerment
- 🚨 Animal abuse/cruelty
- 🚨 Illegal activities

**How to Report:**
1. Screenshot (DO NOT save the photo)
2. Note moderation ID and user ID
3. Immediately email safety@pawfectmatch.com
4. Reject the photo
5. Flag user account for review

### Escalate to Senior Moderator if:
- Unsure about decision
- Celebrity/public figure photo
- Legal concerns (copyright, trademark)
- Repeated violations from same user
- Technical issues (photo won't load, etc.)

---

## User Communication

### Approval Notification (Auto-Sent)
```
✓ Photo Approved!

Your photo has been approved and is now visible on your profile.

Thank you for using PawfectMatch!
```

### Rejection Notification (Auto-Sent)
```
Photo Upload Rejected

Your photo was rejected: [REASON]

Please review our Community Guidelines and upload an appropriate photo.

If you believe this was a mistake, you can contact support.

[Community Guidelines Button]
```

---

## Stats & Analytics

### View Your Stats
Navigate to `/admin/moderation/stats` to see:
- Photos reviewed today/this week
- Approval vs rejection rate
- Average review time
- Your accuracy score (based on appeals)

### Queue Stats
- Total pending
- Average wait time
- High priority items
- Oldest unreviewed photo

---

## Training Checklist

### Before Going Live
- [ ] Review all moderation guidelines
- [ ] Practice with 20 test photos
- [ ] Know how to approve/reject
- [ ] Understand keyboard shortcuts
- [ ] Know when to escalate
- [ ] Have safety team contact info
- [ ] Test admin console access

### Week 1
- [ ] Shadow experienced moderator
- [ ] Review decisions with supervisor
- [ ] Ask questions on edge cases

### Week 2
- [ ] Moderate independently
- [ ] Track your stats
- [ ] Aim for targets

---

## FAQs

**Q: How long should I spend on each photo?**  
A: Average 15-30 seconds. If you need more than 1 minute, escalate.

**Q: What if the photo won't load?**  
A: Refresh page. If still broken, note the photo ID and skip it.

**Q: Can users appeal rejections?**  
A: Yes. Appeals go to senior moderator queue.

**Q: Do I need to explain every rejection?**  
A: No, use quick reject buttons for common cases.

**Q: What if I accidentally approve a bad photo?**  
A: Immediately notify senior moderator to remove it.

**Q: Can I moderate from my phone?**  
A: Yes, admin console is mobile-responsive, but desktop is recommended.

---

## Setup Instructions

### For Admins (One-Time Setup)

1. **Create Admin Account**
   ```bash
   # Add moderator role to user
   db.users.update(
     { email: "moderator@pawfectmatch.com" },
     { $set: { role: "moderator", isAdmin: true } }
   )
   ```

2. **Add Upload Route to Server**
   ```javascript
   // server/index.js
   const uploadRoutes = require('./routes/uploadRoutes');
   const moderationRoutes = require('./routes/moderationRoutes');
   
   app.use('/api/upload', uploadRoutes);
   app.use('/api/moderation', moderationRoutes);
   ```

3. **Configure Cloudinary**
   ```bash
   # .env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Test the System**
   - Upload a test photo as regular user
   - Login as admin to `/admin/moderation`
   - Approve or reject the test photo
   - Verify user receives notification

---

## Technical Details

### Database Schema
```javascript
PhotoModeration {
  userId: ObjectId,
  photoUrl: String,
  cloudinaryPublicId: String,
  status: 'pending' | 'approved' | 'rejected',
  priority: 'normal' | 'high',
  uploadedAt: Date,
  reviewedBy: ObjectId,
  reviewedAt: Date,
  rejectionReason: String,
  rejectionCategory: String,
  userHistory: {
    totalUploads: Number,
    approvedUploads: Number,
    rejectedUploads: Number,
    isTrustedUser: Boolean
  }
}
```

### API Endpoints
- `POST /api/upload/photo` - Upload new photo
- `GET /api/moderation/queue` - Get pending photos
- `POST /api/moderation/:id/approve` - Approve photo
- `POST /api/moderation/:id/reject` - Reject photo
- `GET /api/moderation/stats` - Get statistics

---

## Support

**Technical Issues:** tech@pawfectmatch.com  
**Safety Concerns:** safety@pawfectmatch.com  
**General Questions:** Ask your team lead

---

## Version History

- **v1.0** (Current) - Manual moderation with basic queue
- **Planned v1.1** - Batch operations, advanced filtering
- **Planned v1.2** - Mobile app for moderators

---

**Last Updated:** October 13, 2025  
**Maintained By:** Product Team
