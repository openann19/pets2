import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User Management
      'get_all_users',
      'get_user_details',
      'suspend_user',
      'ban_user',
      'activate_user',
      'update_user_role',
      'get_user_activity',
      // Chat Moderation
      'get_all_chats',
      'get_chat_details',
      'delete_message',
      'block_chat',
      'unblock_chat',
      'get_chat_analytics',
      // Upload Management
      'get_all_uploads',
      'approve_upload',
      'reject_upload',
      'delete_upload',
      'get_upload_analytics',
      // Verification Management
      'get_pending_verifications',
      'approve_verification',
      'reject_verification',
      'get_verification_history',
      // System Analytics
      'get_admin_analytics',
      'get_system_health',
      'get_error_logs',
      'get_performance_metrics',
      // Content Moderation
      'get_reported_content',
      'moderate_content',
      'get_moderation_queue',
      // Security & Monitoring
      'get_security_alerts',
      'get_suspicious_activity',
      'get_audit_logs',
      // User Actions (for tracking)
      'user_login',
      'user_logout',
      'user_register',
      'user_profile_update',
      'pet_create',
      'pet_update',
      'pet_delete',
      'match_create',
      'message_send',
      'message_delete',
      'subscription_start',
      'subscription_cancel',
      'payment_success',
      'payment_failed',
      'login_failed',
      'password_reset_request',
      'email_verification_sent',
      'verification_submit',
      'upload_file',
      'report_content',
      'block_user',
      'unblock_user',
      'report_user'
    ]
  },
  resourceType: {
    type: String,
    enum: ['user', 'pet', 'match', 'message', 'upload', 'verification', 'report', 'system', 'payment', 'subscription']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  result: {
    type: String,
    enum: ['success', 'failure', 'error'],
    default: 'success'
  },
  errorMessage: String,
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  sessionId: String,
  requestId: String,
  duration: {
    type: Number, // in milliseconds
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  tags: [String],
  isSensitive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ result: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ sessionId: 1 });

// Compound indexes
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ result: 1, severity: 1 });

// TTL index for automatic cleanup (keep logs for 1 year)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export default mongoose.model('AuditLog', auditLogSchema);

