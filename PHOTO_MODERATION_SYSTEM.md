# 📸 Photo Moderation System - PawfectMatch

## Overview
Multi-layer content moderation system combining AI detection with human review to prevent inappropriate content (18+, violence, self-harm, etc.)

---

## Architecture

### 1. Upload Flow
```
User Upload → AI Pre-Screen → Moderation Queue → Manual Review → Approved/Rejected
```

### 2. Components
- **AI Content Detection** (AWS Rekognition / Google Vision)
- **Moderation Queue** (Database + Admin UI)
- **Support Dashboard** (Manual review interface)
- **User Notifications** (Status updates)
- **Audit Trail** (Compliance tracking)

---

## Implementation Plan

### Phase 1: Database Schema

```typescript
// server/models/PhotoModeration.js
interface PhotoModeration {
  _id: ObjectId;
  userId: ObjectId;
  photoUrl: string;
  uploadedAt: Date;
  
  // AI Detection Results
  aiScanResults: {
    scannedAt: Date;
    provider: 'aws-rekognition' | 'google-vision' | 'azure-moderator';
    confidence: number; // 0-100
    flags: {
      explicitNudity: number;
      suggestiveNudity: number;
      violence: number;
      gore: number;
      selfHarm: number;
      drugs: number;
      hateSpeech: number;
      weapons: number;
    };
    labels: Array<{
      name: string;
      confidence: number;
      instances?: number;
    }>;
    autoRejected: boolean;
    autoRejectionReason?: string;
  };
  
  // Moderation Status
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'auto-rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Based on AI confidence
  
  // Manual Review
  reviewedBy?: ObjectId; // Moderator ID
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectionCategory?: 'explicit' | 'violence' | 'self-harm' | 'spam' | 'other';
  
  // User Context
  userHistory: {
    totalUploads: number;
    rejectedUploads: number;
    approvedUploads: number;
    isTrustedUser: boolean; // Auto-approve for trusted users
  };
  
  // Appeal Process
  appeal?: {
    submittedAt: Date;
    reason: string;
    reviewedBy?: ObjectId;
    reviewedAt?: Date;
    decision: 'upheld' | 'overturned';
  };
}
```

### Phase 2: AI Content Detection Service

```typescript
// server/services/contentModerationService.js
import AWS from 'aws-sdk';

class ContentModerationService {
  constructor() {
    this.rekognition = new AWS.Rekognition({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    // Configurable thresholds
    this.THRESHOLDS = {
      AUTO_REJECT: {
        explicitNudity: 80,
        violence: 85,
        gore: 80,
        selfHarm: 90,
        drugs: 75
      },
      FLAG_FOR_REVIEW: {
        explicitNudity: 50,
        suggestiveNudity: 60,
        violence: 60,
        gore: 50,
        selfHarm: 70,
        drugs: 50,
        weapons: 70
      }
    };
  }
  
  async scanImage(imageBuffer, imageUrl) {
    try {
      // 1. Detect unsafe content
      const moderationResult = await this.rekognition.detectModerationLabels({
        Image: {
          Bytes: imageBuffer
        },
        MinConfidence: 50 // Detect anything above 50% confidence
      }).promise();
      
      // 2. Parse results
      const flags = this.parseModerationLabels(moderationResult.ModerationLabels);
      
      // 3. Determine action
      const action = this.determineAction(flags);
      
      // 4. Save to moderation queue
      const moderation = await PhotoModeration.create({
        photoUrl: imageUrl,
        aiScanResults: {
          scannedAt: new Date(),
          provider: 'aws-rekognition',
          confidence: Math.max(...Object.values(flags)),
          flags,
          labels: moderationResult.ModerationLabels,
          autoRejected: action === 'auto-reject',
          autoRejectionReason: action === 'auto-reject' ? this.getAutoRejectionReason(flags) : null
        },
        status: action === 'auto-reject' ? 'auto-rejected' : 
                action === 'flag' ? 'flagged' : 'pending',
        priority: this.calculatePriority(flags)
      });
      
      return {
        safe: action === 'approve',
        moderation,
        action
      };
      
    } catch (error) {
      console.error('Content moderation scan failed:', error);
      // On error, flag for manual review
      return {
        safe: false,
        action: 'flag',
        error: error.message
      };
    }
  }
  
  parseModerationLabels(labels) {
    const flags = {
      explicitNudity: 0,
      suggestiveNudity: 0,
      violence: 0,
      gore: 0,
      selfHarm: 0,
      drugs: 0,
      hateSpeech: 0,
      weapons: 0
    };
    
    labels.forEach(label => {
      const name = label.Name.toLowerCase();
      const confidence = label.Confidence;
      
      if (name.includes('explicit nudity') || name.includes('nudity')) {
        flags.explicitNudity = Math.max(flags.explicitNudity, confidence);
      } else if (name.includes('suggestive')) {
        flags.suggestiveNudity = Math.max(flags.suggestiveNudity, confidence);
      } else if (name.includes('violence') || name.includes('graphic')) {
        flags.violence = Math.max(flags.violence, confidence);
      } else if (name.includes('gore') || name.includes('blood')) {
        flags.gore = Math.max(flags.gore, confidence);
      } else if (name.includes('self') && name.includes('harm')) {
        flags.selfHarm = Math.max(flags.selfHarm, confidence);
      } else if (name.includes('drug')) {
        flags.drugs = Math.max(flags.drugs, confidence);
      } else if (name.includes('hate') || name.includes('offensive')) {
        flags.hateSpeech = Math.max(flags.hateSpeech, confidence);
      } else if (name.includes('weapon')) {
        flags.weapons = Math.max(flags.weapons, confidence);
      }
    });
    
    return flags;
  }
  
  determineAction(flags) {
    // Auto-reject if any flag exceeds auto-reject threshold
    for (const [category, value] of Object.entries(flags)) {
      if (this.THRESHOLDS.AUTO_REJECT[category] && 
          value >= this.THRESHOLDS.AUTO_REJECT[category]) {
        return 'auto-reject';
      }
    }
    
    // Flag for review if any flag exceeds review threshold
    for (const [category, value] of Object.entries(flags)) {
      if (this.THRESHOLDS.FLAG_FOR_REVIEW[category] && 
          value >= this.THRESHOLDS.FLAG_FOR_REVIEW[category]) {
        return 'flag';
      }
    }
    
    // Otherwise, pending (will be reviewed in batch or auto-approved if trusted user)
    return 'pending';
  }
  
  calculatePriority(flags) {
    const maxConfidence = Math.max(...Object.values(flags));
    
    if (flags.selfHarm > 70 || flags.violence > 80) return 'urgent';
    if (maxConfidence > 70) return 'high';
    if (maxConfidence > 50) return 'medium';
    return 'low';
  }
  
  getAutoRejectionReason(flags) {
    const reasons = [];
    
    if (flags.explicitNudity >= this.THRESHOLDS.AUTO_REJECT.explicitNudity) {
      reasons.push('explicit content detected');
    }
    if (flags.violence >= this.THRESHOLDS.AUTO_REJECT.violence) {
      reasons.push('violent content detected');
    }
    if (flags.selfHarm >= this.THRESHOLDS.AUTO_REJECT.selfHarm) {
      reasons.push('self-harm content detected');
    }
    if (flags.drugs >= this.THRESHOLDS.AUTO_REJECT.drugs) {
      reasons.push('drug-related content detected');
    }
    
    return reasons.join(', ');
  }
}

export default new ContentModerationService();
```

### Phase 3: Upload Handler (Integrated with Moderation)

```typescript
// server/routes/uploadRoutes.js
import contentModerationService from '../services/contentModerationService.js';
import cloudinary from '../services/cloudinaryService.js';

router.post('/upload-photo', authMiddleware, async (req, res) => {
  try {
    const { file } = req;
    const userId = req.user._id;
    
    // 1. Upload to temporary storage
    const tempUpload = await cloudinary.uploader.upload(file.path, {
      folder: 'pawfectmatch/temp',
      resource_type: 'image'
    });
    
    // 2. Download image buffer for AI scanning
    const imageBuffer = await downloadImageBuffer(tempUpload.secure_url);
    
    // 3. Run AI content moderation
    const moderationResult = await contentModerationService.scanImage(
      imageBuffer,
      tempUpload.secure_url
    );
    
    // 4. Update moderation record with user context
    await PhotoModeration.findByIdAndUpdate(moderationResult.moderation._id, {
      userId,
      userHistory: await getUserModerationHistory(userId)
    });
    
    // 5. Handle based on moderation result
    if (moderationResult.action === 'auto-reject') {
      // Delete from temp storage
      await cloudinary.uploader.destroy(tempUpload.public_id);
      
      // Notify user
      await notifyUserPhotoRejected(userId, moderationResult.moderation);
      
      return res.status(400).json({
        success: false,
        message: 'Photo contains inappropriate content and cannot be uploaded',
        reason: moderationResult.moderation.aiScanResults.autoRejectionReason
      });
    }
    
    if (moderationResult.action === 'flag') {
      // Move to moderation queue folder
      const moderatedUpload = await cloudinary.uploader.rename(
        tempUpload.public_id,
        `pawfectmatch/moderation-queue/${userId}_${Date.now()}`
      );
      
      // Notify moderators of high-priority item
      if (moderationResult.moderation.priority === 'urgent') {
        await notifyModeratorsUrgent(moderationResult.moderation);
      }
      
      return res.json({
        success: true,
        message: 'Photo uploaded and is under review. You will be notified when approved.',
        status: 'pending_review',
        photoId: moderationResult.moderation._id
      });
    }
    
    // 6. If safe, move to approved storage
    const finalUpload = await cloudinary.uploader.rename(
      tempUpload.public_id,
      `pawfectmatch/photos/${userId}_${Date.now()}`
    );
    
    // 7. Auto-approve if pending and trusted user
    const isTrustedUser = await checkTrustedUser(userId);
    if (isTrustedUser) {
      await PhotoModeration.findByIdAndUpdate(moderationResult.moderation._id, {
        status: 'approved',
        reviewedAt: new Date(),
        reviewNotes: 'Auto-approved for trusted user'
      });
    }
    
    res.json({
      success: true,
      photoUrl: finalUpload.secure_url,
      photoId: moderationResult.moderation._id,
      status: isTrustedUser ? 'approved' : 'pending_review'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});
```

### Phase 4: Admin Moderation Dashboard

```typescript
// apps/web/app/(admin)/moderation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { moderationAPI } from '@/services/api';

export default function ModerationDashboard() {
  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, flagged, all
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModerationQueue();
  }, [filter]);

  const loadModerationQueue = async () => {
    try {
      setLoading(true);
      const response = await moderationAPI.getQueue({ status: filter, limit: 50 });
      setQueue(response.items);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (moderationId) => {
    try {
      await moderationAPI.approve(moderationId, {
        notes: 'Content approved'
      });
      
      // Remove from queue
      setQueue(prev => prev.filter(item => item._id !== moderationId));
      
      // Move to next
      if (currentIndex >= queue.length - 1) {
        setCurrentIndex(0);
      }
    } catch (error) {
      alert('Failed to approve: ' + error.message);
    }
  };

  const handleReject = async (moderationId, reason, category) => {
    try {
      await moderationAPI.reject(moderationId, {
        reason,
        category,
        notes: `Rejected: ${reason}`
      });
      
      setQueue(prev => prev.filter(item => item._id !== moderationId));
      
      if (currentIndex >= queue.length - 1) {
        setCurrentIndex(0);
      }
    } catch (error) {
      alert('Failed to reject: ' + error.message);
    }
  };

  const currentItem = queue[currentIndex];

  if (loading) return <div>Loading moderation queue...</div>;
  if (!currentItem) return <div>No items in queue</div>;

  return (
    <div className="moderation-dashboard">
      <div className="header">
        <h1>Photo Moderation Queue</h1>
        <div className="stats">
          <span>Queue: {queue.length}</span>
          <span>Current: {currentIndex + 1}</span>
        </div>
      </div>

      <div className="filters">
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('flagged')}>Flagged</button>
        <button onClick={() => setFilter('all')}>All</button>
      </div>

      <div className="review-panel">
        {/* Photo Preview */}
        <div className="photo-preview">
          <img 
            src={currentItem.photoUrl} 
            alt="Under review" 
            style={{ maxWidth: '100%', maxHeight: '600px' }}
          />
        </div>

        {/* AI Detection Results */}
        <div className="ai-results">
          <h3>AI Detection Results</h3>
          <div className="confidence">
            Overall Confidence: {currentItem.aiScanResults.confidence}%
          </div>
          
          <div className="flags">
            {Object.entries(currentItem.aiScanResults.flags).map(([key, value]) => (
              value > 0 && (
                <div key={key} className={`flag ${value > 70 ? 'high' : value > 50 ? 'medium' : 'low'}`}>
                  <span>{key}:</span>
                  <span>{value.toFixed(1)}%</span>
                </div>
              )
            ))}
          </div>

          <div className="detected-labels">
            <h4>Detected Labels:</h4>
            {currentItem.aiScanResults.labels.map((label, i) => (
              <div key={i}>
                {label.name} ({label.confidence.toFixed(1)}%)
              </div>
            ))}
          </div>
        </div>

        {/* User Context */}
        <div className="user-context">
          <h3>User History</h3>
          <p>Total Uploads: {currentItem.userHistory.totalUploads}</p>
          <p>Approved: {currentItem.userHistory.approvedUploads}</p>
          <p>Rejected: {currentItem.userHistory.rejectedUploads}</p>
          <p>Trusted User: {currentItem.userHistory.isTrustedUser ? 'Yes' : 'No'}</p>
        </div>

        {/* Action Buttons */}
        <div className="actions">
          <button 
            className="btn-approve"
            onClick={() => handleApprove(currentItem._id)}
          >
            ✓ Approve
          </button>

          <button 
            className="btn-reject"
            onClick={() => {
              const reason = prompt('Rejection reason:');
              const category = prompt('Category (explicit/violence/self-harm/spam/other):');
              if (reason && category) {
                handleReject(currentItem._id, reason, category);
              }
            }}
          >
            ✗ Reject
          </button>

          <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}>
            ← Previous
          </button>

          <button onClick={() => setCurrentIndex(prev => Math.min(queue.length - 1, prev + 1))}>
            Next →
          </button>
        </div>

        {/* Quick Reject Templates */}
        <div className="quick-reject">
          <h4>Quick Reject:</h4>
          <button onClick={() => handleReject(currentItem._id, 'Explicit content', 'explicit')}>
            Explicit Content
          </button>
          <button onClick={() => handleReject(currentItem._id, 'Violent content', 'violence')}>
            Violence
          </button>
          <button onClick={() => handleReject(currentItem._id, 'Self-harm content', 'self-harm')}>
            Self-Harm
          </button>
          <button onClick={() => handleReject(currentItem._id, 'Spam/irrelevant', 'spam')}>
            Spam
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="keyboard-hints">
          <small>
            Shortcuts: A = Approve | R = Reject | ← → = Navigate
          </small>
        </div>
      </div>

      <style jsx>{`
        .moderation-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .review-panel {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        .photo-preview {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .ai-results, .user-context {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .flag {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          margin: 4px 0;
          border-radius: 4px;
        }
        .flag.high { background: #fee; border-left: 4px solid #f00; }
        .flag.medium { background: #ffe; border-left: 4px solid #fa0; }
        .flag.low { background: #efe; border-left: 4px solid #0a0; }
        .actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          padding: 20px;
          background: white;
          border-radius: 8px;
        }
        .btn-approve {
          background: #4caf50;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .btn-reject {
          background: #f44336;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .quick-reject {
          grid-column: 1 / -1;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .quick-reject button {
          margin: 5px;
          padding: 8px 16px;
          background: #ff5722;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
```

---

## API Endpoints

```typescript
// server/routes/moderationRoutes.js

// Get moderation queue
router.get('/moderation/queue', adminAuth, async (req, res) => {
  const { status = 'pending', limit = 50, priority } = req.query;
  
  const query = {};
  if (status !== 'all') query.status = status;
  if (priority) query.priority = priority;
  
  const items = await PhotoModeration.find(query)
    .sort({ priority: -1, uploadedAt: 1 })
    .limit(parseInt(limit))
    .populate('userId', 'name email');
  
  res.json({ items, count: items.length });
});

// Approve photo
router.post('/moderation/:id/approve', adminAuth, async (req, res) => {
  const { notes } = req.body;
  
  const moderation = await PhotoModeration.findByIdAndUpdate(req.params.id, {
    status: 'approved',
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    reviewNotes: notes
  });
  
  // Move photo from temp to permanent storage
  await moveToApprovedStorage(moderation.photoUrl);
  
  // Notify user
  await notifyUserPhotoApproved(moderation.userId);
  
  res.json({ success: true });
});

// Reject photo
router.post('/moderation/:id/reject', adminAuth, async (req, res) => {
  const { reason, category, notes } = req.body;
  
  const moderation = await PhotoModeration.findByIdAndUpdate(req.params.id, {
    status: 'rejected',
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    rejectionReason: reason,
    rejectionCategory: category,
    reviewNotes: notes
  });
  
  // Delete photo from storage
  await deleteFromStorage(moderation.photoUrl);
  
  // Notify user
  await notifyUserPhotoRejected(moderation.userId, { reason, category });
  
  res.json({ success: true });
});

// Get moderation stats
router.get('/moderation/stats', adminAuth, async (req, res) => {
  const stats = await PhotoModeration.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.json({ stats });
});
```

---

## Configuration

### Environment Variables

```bash
# AWS Rekognition
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Or Google Vision API
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Moderation Settings
AUTO_APPROVE_TRUSTED_USERS=true
MODERATION_QUEUE_SIZE=100
URGENT_ALERT_WEBHOOK=https://your-slack-webhook-url
```

### Trust Score System

```typescript
async function checkTrustedUser(userId) {
  const history = await getUserModerationHistory(userId);
  
  // User is trusted if:
  // - 10+ approved uploads
  // - 0 rejected uploads
  // - Account age > 30 days
  // - Email verified
  
  const user = await User.findById(userId);
  const accountAge = Date.now() - user.createdAt.getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);
  
  return history.approvedUploads >= 10 && 
         history.rejectedUploads === 0 &&
         daysOld >= 30 &&
         user.emailVerified;
}
```

---

## User Notifications

```typescript
// Notify user when photo is rejected
async function notifyUserPhotoRejected(userId, moderation) {
  await Notification.create({
    userId,
    type: 'photo_rejected',
    title: 'Photo Upload Rejected',
    message: `Your photo was rejected: ${moderation.rejectionReason}. Please review our community guidelines.`,
    data: {
      moderationId: moderation._id,
      category: moderation.rejectionCategory
    }
  });
  
  // Send email
  await sendEmail({
    to: user.email,
    subject: 'Photo Upload Rejected',
    template: 'photo-rejected',
    data: {
      reason: moderation.rejectionReason,
      guidelinesUrl: 'https://pawfectmatch.com/guidelines'
    }
  });
}

// Notify user when photo is approved
async function notifyUserPhotoApproved(userId) {
  await Notification.create({
    userId,
    type: 'photo_approved',
    title: 'Photo Approved',
    message: 'Your photo has been approved and is now visible on your profile!'
  });
}
```

---

## Compliance & Legal

### GDPR/Privacy Compliance
- Store moderation data for 90 days max
- Allow users to request deletion of rejected photos
- Anonymize data in audit logs after 1 year

### Audit Trail
- Log all moderation decisions
- Track moderator performance
- Generate monthly compliance reports

---

## Cost Estimation

### AWS Rekognition
- ~$1 per 1,000 images
- If 1,000 uploads/day: ~$30/month

### Google Vision API
- First 1,000 images/month: Free
- $1.50 per 1,000 images after

### Recommended: Start with Google Vision (free tier), migrate to AWS Rekognition at scale.

---

## Next Steps

1. **Install AWS SDK**: `npm install aws-sdk`
2. **Create moderation database model**
3. **Implement upload route with AI scanning**
4. **Build admin moderation dashboard**
5. **Set up notification system**
6. **Train support team on moderation tools**

---

## Support Team Training

### Quick Decision Matrix

| AI Confidence | Manual Review Needed? | Default Action |
|--------------|----------------------|----------------|
| < 50% | No | Auto-approve (trusted users) |
| 50-70% | Yes | Pending review |
| 70-85% | Yes | Flagged (priority) |
| > 85% | No | Auto-reject |

### Categories to Watch
1. **Explicit Content**: Nudity, sexual content
2. **Violence**: Gore, weapons, fighting
3. **Self-Harm**: Cutting, suicide content
4. **Drugs**: Drug paraphernalia
5. **Hate Speech**: Offensive symbols, text
6. **Spam**: Irrelevant images, advertisements

