# 🔧 Backend Implementation Plan - Critical Path

**Status**: 🚨 **BLOCKING MOBILE APP FUNCTIONALITY**  
**Priority**: CRITICAL - Must complete before mobile app works  
**Estimated Time**: 11-13 hours  
**Date**: October 25, 2025  

---

## 🎯 Executive Summary

**Mobile app UI is 90% complete** but **cannot function** because backend APIs don't exist.

**Gap Summary**:
- ❌ **0%** GDPR endpoints (delete account, export data)
- ❌ **0%** Chat management endpoints (export, clear, unmatch)
- ❌ **0%** Message reactions endpoints
- ⚠️ **50%** Boost endpoint (exists but needs verification)

**Result**: Mobile app makes API calls to endpoints that return 404.

---

## 📋 Required Backend Implementation

### Phase 1: GDPR Endpoints (6 hours) 🔴 CRITICAL

#### File Structure to Create:
```
server/
├── src/
│   ├── controllers/
│   │   └── gdprController.ts          ← NEW (2 hours)
│   ├── routes/
│   │   └── gdpr.ts                    ← NEW (1 hour)
│   ├── services/
│   │   ├── dataExportService.ts       ← NEW (2 hours)
│   │   └── accountDeletionService.ts  ← NEW (1 hour)
│   └── models/
│       └── User.ts                    ← UPDATE (add fields)
```

#### API Endpoints to Implement:

##### 1. DELETE /api/users/delete-account
```typescript
// server/src/controllers/gdprController.ts

export const deleteAccount = async (req, res) => {
  try {
    const { password, reason, feedback } = req.body;
    const userId = req.user.id;

    // 1. Verify password
    const user = await User.findById(userId);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 2. Set deletion scheduled
    const gracePeriodEndsAt = new Date();
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 30);

    user.deletion_scheduled_at = new Date();
    user.grace_period_ends_at = gracePeriodEndsAt;
    user.account_status = 'deletion_pending';
    user.deletion_reason = reason;
    user.deletion_feedback = feedback;
    await user.save();

    // 3. Send confirmation email
    await emailService.sendDeletionScheduledEmail(user.email, {
      gracePeriodEndsAt,
      cancellationUrl: `${process.env.APP_URL}/cancel-deletion/${user.cancellation_token}`
    });

    // 4. Log for audit
    await AuditLog.create({
      userId,
      action: 'account_deletion_scheduled',
      details: { reason, gracePeriodEndsAt },
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Account deletion scheduled',
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString()
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to schedule deletion' });
  }
};
```

##### 2. POST /api/users/export-data
```typescript
export const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Create export job
    const exportJob = await DataExport.create({
      userId,
      status: 'pending',
      requestedAt: new Date()
    });

    // 2. Queue background job
    await exportQueue.add('generate-export', {
      jobId: exportJob._id,
      userId
    });

    // 3. Send immediate response
    res.json({
      success: true,
      message: 'Data export initiated',
      estimatedTime: '24-48 hours',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Background job will:
    // - Fetch all user data (profile, pets, matches, messages, photos)
    // - Generate JSON + CSV files
    // - Upload to S3
    // - Email download link
  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to initiate export' });
  }
};
```

##### 3. POST /api/users/confirm-deletion
```typescript
export const confirmDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 1. Check grace period expired
    if (new Date() < user.grace_period_ends_at) {
      return res.status(400).json({ 
        error: 'Grace period not expired',
        expiresAt: user.grace_period_ends_at
      });
    }

    // 2. Perform soft delete
    user.account_status = 'deleted';
    user.deleted_at = new Date();
    user.email = `deleted_${user._id}@deleted.com`;
    user.phone = null;
    
    // Anonymize sensitive data
    user.firstName = 'Deleted';
    user.lastName = 'User';
    await user.save();

    // 3. Anonymize related data
    await Pet.updateMany(
      { userId },
      { $set: { name: 'Deleted Pet', bio: '' } }
    );
    
    await Message.updateMany(
      { senderId: userId },
      { $set: { senderName: 'Deleted User' } }
    );

    // 4. Log deletion
    await AuditLog.create({
      userId,
      action: 'account_deleted',
      details: { deletedAt: new Date() }
    });

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    logger.error('Confirm deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
```

##### 4. POST /api/users/cancel-deletion
```typescript
export const cancelDeletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // 1. Check within grace period
    if (new Date() > user.grace_period_ends_at) {
      return res.status(400).json({ error: 'Grace period expired' });
    }

    // 2. Cancel deletion
    user.deletion_scheduled_at = null;
    user.grace_period_ends_at = null;
    user.account_status = 'active';
    user.deletion_reason = null;
    await user.save();

    // 3. Send confirmation
    await emailService.sendDeletionCancelledEmail(user.email);

    // 4. Log cancellation
    await AuditLog.create({
      userId,
      action: 'account_deletion_cancelled',
      ip: req.ip
    });

    res.json({ success: true, message: 'Deletion cancelled' });
  } catch (error) {
    logger.error('Cancel deletion error:', error);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
};
```

---

### Phase 2: Chat Management (3 hours) 🔴 CRITICAL

#### Files to Modify:
```
server/
├── src/
│   ├── controllers/
│   │   ├── chatController.ts          ← UPDATE
│   │   └── matchController.ts         ← UPDATE
│   └── routes/
│       ├── chat.ts                    ← UPDATE
│       └── matches.ts                 ← UPDATE
```

#### Endpoints to Add:

##### 1. POST /api/chat/:matchId/export
```typescript
// server/src/controllers/chatController.ts

export const exportChat = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    // 1. Verify user is part of match
    const match = await Match.findById(matchId);
    if (!match.participants.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // 2. Fetch all messages
    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .lean();

    // 3. Generate export file
    const exportData = {
      matchId,
      exportedAt: new Date(),
      messages: messages.map(m => ({
        sender: m.senderName,
        content: m.content,
        timestamp: m.createdAt,
        type: m.type
      }))
    };

    // 4. Upload to S3
    const filename = `chat-export-${matchId}-${Date.now()}.json`;
    const uploadUrl = await s3Service.uploadJSON(filename, exportData);

    // 5. Generate expiring download link
    const downloadUrl = await s3Service.getSignedUrl(filename, 7 * 24 * 60 * 60); // 7 days

    // 6. Email link
    await emailService.sendChatExportEmail(req.user.email, {
      downloadUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      success: true,
      message: 'Chat export will be emailed shortly',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    logger.error('Export chat error:', error);
    res.status(500).json({ error: 'Failed to export chat' });
  }
};
```

##### 2. DELETE /api/chat/:matchId/clear
```typescript
export const clearChatHistory = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    // 1. Verify ownership
    const match = await Match.findById(matchId);
    if (!match.participants.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // 2. Soft delete messages (keep for moderation)
    await Message.updateMany(
      { matchId },
      { 
        $set: { 
          deleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
          // Keep content for 30 days for moderation
          moderationRetainUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    );

    // 3. Log action
    await AuditLog.create({
      userId,
      action: 'chat_history_cleared',
      details: { matchId },
      ip: req.ip
    });

    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    logger.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear chat' });
  }
};
```

##### 3. DELETE /api/matches/:matchId/unmatch
```typescript
// server/src/controllers/matchController.ts

export const unmatchUser = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    // 1. Find match
    const match = await Match.findById(matchId);
    if (!match.participants.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // 2. Set unmatch with grace period
    const gracePeriodEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    match.status = 'unmatched';
    match.unmatchedBy = userId;
    match.unmatchedAt = new Date();
    match.gracePeriodEndsAt = gracePeriodEndsAt;
    await match.save();

    // 3. Hide from both users
    await User.updateOne(
      { _id: userId },
      { $pull: { activeMatches: matchId } }
    );

    // 4. Notify other user
    const otherUserId = match.participants.find(id => id.toString() !== userId.toString());
    await notificationService.send(otherUserId, {
      type: 'unmatch',
      message: 'You have been unmatched'
    });

    // 5. Log action
    await AuditLog.create({
      userId,
      action: 'unmatch',
      details: { matchId, gracePeriodEndsAt }
    });

    res.json({
      success: true,
      message: 'Unmatched successfully',
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString()
    });
  } catch (error) {
    logger.error('Unmatch error:', error);
    res.status(500).json({ error: 'Failed to unmatch' });
  }
};
```

---

### Phase 3: Message Reactions (2 hours) 🟡 HIGH

#### Files to Modify:
```
server/
├── models/
│   └── Message.ts                     ← UPDATE (add reactions field)
└── src/
    ├── controllers/
    │   └── chatController.ts          ← UPDATE
    └── routes/
        └── chat.ts                    ← UPDATE
```

#### Database Schema Update:
```typescript
// server/models/Message.ts

const MessageSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'gif'], default: 'text' },
  
  // NEW: Reactions
  reactions: [{
    emoji: { type: String, required: true }, // '👍', '❤️', etc.
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false }
});

// Index for efficient queries
MessageSchema.index({ matchId: 1, createdAt: -1 });
MessageSchema.index({ 'reactions.userId': 1 });
```

#### Endpoints to Add:

##### 1. POST /api/messages/:messageId/react
```typescript
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // 1. Validate emoji
    const allowedEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
    if (!allowedEmojis.includes(emoji)) {
      return res.status(400).json({ error: 'Invalid emoji' });
    }

    // 2. Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 3. Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.userId.toString() === userId.toString() && r.emoji === emoji
    );
    
    if (existingReaction) {
      return res.status(400).json({ error: 'Already reacted with this emoji' });
    }

    // 4. Add reaction
    message.reactions.push({
      emoji,
      userId,
      createdAt: new Date()
    });
    await message.save();

    // 5. Emit socket event to both users in match
    const match = await Match.findById(message.matchId);
    match.participants.forEach(participantId => {
      io.to(participantId.toString()).emit('message_reaction_added', {
        messageId,
        emoji,
        userId,
        reactions: message.reactions
      });
    });

    // 6. Aggregate reaction counts
    const reactionCounts = message.reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({
        emoji,
        count,
        userReacted: message.reactions.some(
          r => r.emoji === emoji && r.userId.toString() === userId.toString()
        )
      }))
    });
  } catch (error) {
    logger.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
};
```

##### 2. DELETE /api/messages/:messageId/unreact
```typescript
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // 1. Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // 2. Remove reaction
    message.reactions = message.reactions.filter(
      r => !(r.userId.toString() === userId.toString() && r.emoji === emoji)
    );
    await message.save();

    // 3. Emit socket event
    const match = await Match.findById(message.matchId);
    match.participants.forEach(participantId => {
      io.to(participantId.toString()).emit('message_reaction_removed', {
        messageId,
        emoji,
        userId,
        reactions: message.reactions
      });
    });

    // 4. Return updated reactions
    const reactionCounts = message.reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({
        emoji,
        count,
        userReacted: message.reactions.some(
          r => r.emoji === emoji && r.userId.toString() === userId.toString()
        )
      }))
    });
  } catch (error) {
    logger.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
};
```

---

## 🗂️ File Checklist

### Files to CREATE:
- [ ] `server/src/controllers/gdprController.ts`
- [ ] `server/src/routes/gdpr.ts`
- [ ] `server/src/services/dataExportService.ts`
- [ ] `server/src/services/accountDeletionService.ts`

### Files to MODIFY:
- [ ] `server/models/User.ts` (add deletion fields)
- [ ] `server/models/Message.ts` (add reactions array)
- [ ] `server/src/controllers/chatController.ts` (add 4 new methods)
- [ ] `server/src/controllers/matchController.ts` (add unmatch)
- [ ] `server/src/routes/chat.ts` (add routes)
- [ ] `server/src/routes/matches.ts` (add unmatch route)
- [ ] `server/server.ts` (register GDPR routes)

### Dependencies to Install:
```bash
# If not already installed:
npm install bullmq      # For background jobs (data export)
npm install aws-sdk     # For S3 uploads (exports)
npm install archiver    # For ZIP file creation
```

---

## ⏱️ Time Breakdown

| Task | Hours | Priority |
|------|-------|----------|
| GDPR Controller | 2h | 🔴 |
| GDPR Routes | 1h | 🔴 |
| Data Export Service | 2h | 🔴 |
| Account Deletion Service | 1h | 🔴 |
| Chat Export/Clear | 2h | 🔴 |
| Unmatch Endpoint | 1h | 🔴 |
| Message Reactions Schema | 0.5h | 🟡 |
| Reactions Endpoints | 1.5h | 🟡 |
| **TOTAL** | **11h** | |

---

## 🧪 Testing Requirements

For each endpoint, create:
1. Unit tests (Jest)
2. Integration tests
3. Postman/Insomnia collection

### Test Cases Needed:

#### GDPR
- [ ] Delete account with valid password
- [ ] Delete account with invalid password
- [ ] Cancel deletion within grace period
- [ ] Cannot cancel after grace period
- [ ] Data export generates complete file
- [ ] Export link expires after 7 days

#### Chat Management
- [ ] Export chat for valid match
- [ ] Cannot export other user's chat
- [ ] Clear history soft-deletes messages
- [ ] Cleared messages retained for 30 days
- [ ] Unmatch sets grace period correctly
- [ ] Can reverse unmatch within grace period

#### Reactions
- [ ] Add allowed emoji
- [ ] Cannot add invalid emoji
- [ ] Cannot react twice with same emoji
- [ ] Remove own reaction
- [ ] Socket events emitted correctly
- [ ] Reaction counts accurate

---

## 🚀 Deployment Checklist

Before deploying:
- [ ] Run database migrations (add new fields)
- [ ] Configure S3 bucket for exports
- [ ] Set up background job queue (Bull/BullMQ)
- [ ] Configure email templates
- [ ] Set environment variables
- [ ] Run all tests
- [ ] Update API documentation
- [ ] Deploy to staging first
- [ ] Test all mobile flows end-to-end
- [ ] Deploy to production
- [ ] Monitor error logs

---

## 📊 Success Criteria

✅ All 12 endpoints implemented  
✅ All database schemas updated  
✅ All tests passing  
✅ Mobile app can call all APIs successfully  
✅ No 404 errors in logs  
✅ GDPR compliance verified  
✅ Grace periods work correctly  
✅ Data exports generate complete files  
✅ Socket events for reactions work  
✅ Admin panel can see all data  

---

**Status**: Ready to implement  
**Next Action**: Start with Phase 1 (GDPR endpoints)  
**Blocker**: None - all requirements documented  

---

*This backend implementation will unblock mobile app functionality and achieve 100% feature completeness.*
