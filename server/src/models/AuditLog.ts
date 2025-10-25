const mongoose = require('mongoose');

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

// Indexes for performance
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

// Virtual for log age in days
auditLogSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted duration
auditLogSchema.virtual('formattedDuration').get(function() {
  if (this.duration < 1000) {
    return `${this.duration}ms`;
  } else if (this.duration < 60000) {
    return `${(this.duration / 1000).toFixed(2)}s`;
  } else {
    return `${(this.duration / 60000).toFixed(2)}m`;
  }
});

// Method to check if action is sensitive
auditLogSchema.methods.isSensitiveAction = function() {
  const sensitiveActions = [
    'suspend_user',
    'ban_user',
    'delete_message',
    'block_chat',
    'reject_upload',
    'delete_upload',
    'reject_verification',
    'moderate_content'
  ];
  return sensitiveActions.includes(this.action);
};

// Method to check if action requires immediate attention
auditLogSchema.methods.requiresAttention = function() {
  return this.severity === 'critical' || 
         this.result === 'error' || 
         this.isSensitiveAction();
};

// Static method to get logs by admin
auditLogSchema.statics.getLogsByAdmin = function(adminId, limit = 50, skip = 0) {
  return this.find({ adminId })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get logs by user
auditLogSchema.statics.getLogsByUser = function(userId, limit = 50, skip = 0) {
  return this.find({ userId })
    .populate('adminId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get logs by action
auditLogSchema.statics.getLogsByAction = function(action, limit = 50, skip = 0) {
  return this.find({ action })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get error logs
auditLogSchema.statics.getErrorLogs = function(limit = 50, skip = 0) {
  return this.find({ result: 'error' })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get critical logs
auditLogSchema.statics.getCriticalLogs = function(limit = 50, skip = 0) {
  return this.find({ severity: 'critical' })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get sensitive logs
auditLogSchema.statics.getSensitiveLogs = function(limit = 50, skip = 0) {
  return this.find({ isSensitive: true })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get logs by resource
auditLogSchema.statics.getLogsByResource = function(resourceType, resourceId, limit = 50, skip = 0) {
  return this.find({ resourceType, resourceId })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get audit statistics
auditLogSchema.statics.getAuditStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        errorCount: {
          $sum: { $cond: [{ $eq: ['$result', 'error'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get admin activity statistics
auditLogSchema.statics.getAdminActivityStats = function(adminId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        adminId: mongoose.Types.ObjectId(adminId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        errorCount: {
          $sum: { $cond: [{ $eq: ['$result', 'error'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Static method to get security alerts
auditLogSchema.statics.getSecurityAlerts = function(limit = 50, skip = 0) {
  const securityActions = [
    'ban_user',
    'suspend_user',
    'block_chat',
    'delete_message',
    'reject_upload',
    'delete_upload',
    'reject_verification',
    'moderate_content'
  ];
  
  return this.find({ action: { $in: securityActions } })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get suspicious activity
auditLogSchema.statics.getSuspiciousActivity = function(limit = 50, skip = 0) {
  return this.find({
    $or: [
      { result: 'error' },
      { severity: 'critical' },
      { isSensitive: true },
      { action: { $regex: /failed|error|exception/i } }
    ]
  })
    .populate('adminId', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to set severity based on action
auditLogSchema.pre('save', function(next) {
  if (this.isNew) {
    const severityMap = {
      'ban_user': 'critical',
      'suspend_user': 'high',
      'delete_message': 'high',
      'block_chat': 'medium',
      'reject_upload': 'medium',
      'delete_upload': 'high',
      'reject_verification': 'medium',
      'moderate_content': 'medium',
      'update_user_role': 'high'
    };
    
    this.severity = severityMap[this.action] || 'low';
    this.isSensitive = this.isSensitiveAction();
  }
  
  next();
});

// Pre-save middleware to sanitize sensitive data
auditLogSchema.pre('save', function(next) {
  if (this.isSensitive && this.details) {
    // Remove sensitive information from details
    const sanitizedDetails = { ...this.details };
    
    // Remove password-related fields
    delete sanitizedDetails.password;
    delete sanitizedDetails.newPassword;
    delete sanitizedDetails.confirmPassword;
    
    // Remove token-related fields
    delete sanitizedDetails.token;
    delete sanitizedDetails.accessToken;
    delete sanitizedDetails.refreshToken;
    
    // Remove personal information
    delete sanitizedDetails.ssn;
    delete sanitizedDetails.socialSecurityNumber;
    delete sanitizedDetails.creditCard;
    delete sanitizedDetails.bankAccount;
    
    this.details = sanitizedDetails;
  }
  
  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
