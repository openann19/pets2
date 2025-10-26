import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISecurityAlert extends Document {
  title: string;
  description: string;
  type: 'authentication' | 'authorization' | 'data' | 'system' | 'network' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'acknowledged' | 'resolved' | 'escalated';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  source: {
    type: 'user_report' | 'system' | 'admin' | 'automated';
    name?: string;
    ip?: string;
    location?: string;
  };
  affectedResources: Array<{
    type: string;
    id: string;
    name: string;
    status: string;
  }>;
  timeline: Array<{
    timestamp: Date;
    event: string;
    description: string;
    actor: string;
  }>;
  evidence: Array<{
    type: string;
    name: string;
    url: string;
    size?: number;
  }>;
  assignedTo?: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: {
    id: mongoose.Types.ObjectId;
    name: string;
    timestamp: Date;
  };
  escalationLevel: number;
  escalatedAt?: Date;
  escalatedBy?: {
    id: mongoose.Types.ObjectId;
    name: string;
  };
  escalationReason?: string;
  resolvedAt?: Date;
  resolvedBy?: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  resolution?: string;
  relatedAlerts: mongoose.Types.ObjectId[];
  riskScore: number;
  impactAssessment: {
    confidentiality: 'critical' | 'high' | 'medium' | 'low';
    integrity: 'critical' | 'high' | 'medium' | 'low';
    availability: 'critical' | 'high' | 'medium' | 'low';
    businessImpact: 'critical' | 'high' | 'medium' | 'low';
  };
  remediation: {
    steps: Array<{
      id: string;
      description: string;
      status: 'pending' | 'in_progress' | 'completed';
      completedAt?: Date;
    }>;
    estimatedTime?: string;
    completedAt?: Date;
  };
  tags: string[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const securityAlertSchema = new Schema<ISecurityAlert>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['authentication', 'authorization', 'data', 'system', 'network', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'acknowledged', 'resolved', 'escalated'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    required: true
  },
  source: {
    type: {
      type: String,
      enum: ['user_report', 'system', 'admin', 'automated'],
      required: true
    },
    name: String,
    ip: String,
    location: String
  },
  affectedResources: [{
    type: String,
    id: String,
    name: String,
    status: String
  }],
  timeline: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    event: String,
    description: String,
    actor: String
  }],
  evidence: [{
    type: String,
    name: String,
    url: String,
    size: Number
  }],
  assignedTo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String
  },
  isAcknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedAt: Date,
  acknowledgedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    timestamp: Date
  },
  escalationLevel: {
    type: Number,
    default: 0
  },
  escalatedAt: Date,
  escalatedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  },
  escalationReason: String,
  resolvedAt: Date,
  resolvedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String
  },
  resolution: String,
  relatedAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SecurityAlert'
  }],
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  impactAssessment: {
    confidentiality: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    integrity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    availability: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },
    businessImpact: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    }
  },
  remediation: {
    steps: [{
      id: String,
      description: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      },
      completedAt: Date
    }],
    estimatedTime: String,
    completedAt: Date
  },
  tags: [String],
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    requestId: String,
    correlationId: String
  }
}, {
  timestamps: true
});

// Indexes for performance
securityAlertSchema.index({ status: 1, createdAt: -1 });
securityAlertSchema.index({ severity: 1, createdAt: -1 });
securityAlertSchema.index({ type: 1 });
securityAlertSchema.index({ priority: 1 });
securityAlertSchema.index({ isAcknowledged: 1 });
securityAlertSchema.index({ 'assignedTo.id': 1 });
securityAlertSchema.index({ tags: 1 });

// Compound indexes
securityAlertSchema.index({ status: 1, severity: 1 });
securityAlertSchema.index({ severity: 1, priority: 1 });
securityAlertSchema.index({ type: 1, status: 1 });

// Method to calculate risk score
securityAlertSchema.methods.calculateRiskScore = function(): number {
  const severityScores = { critical: 100, high: 75, medium: 50, low: 25 };
  const impactScores = { critical: 100, high: 75, medium: 50, low: 25 };
  
  const severityScore = severityScores[this.severity] || 50;
  const impactAvg = (
    impactScores[this.impactAssessment.confidentiality] +
    impactScores[this.impactAssessment.integrity] +
    impactScores[this.impactAssessment.availability] +
    impactScores[this.impactAssessment.businessImpact]
  ) / 4;
  
  this.riskScore = Math.round((severityScore + impactAvg) / 2);
  return this.riskScore;
};

// Method to add timeline event
securityAlertSchema.methods.addTimelineEvent = function(event: string, description: string, actor: string): void {
  this.timeline.push({
    timestamp: new Date(),
    event,
    description,
    actor
  });
};

// Method to acknowledge alert
securityAlertSchema.methods.acknowledge = function(adminId: mongoose.Types.ObjectId, adminName: string): void {
  this.isAcknowledged = true;
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = {
    id: adminId,
    name: adminName,
    timestamp: new Date()
  };
  this.addTimelineEvent('Alert Acknowledged', 'Admin acknowledged this security alert', adminName);
};

// Method to escalate alert
securityAlertSchema.methods.escalate = function(adminId: mongoose.Types.ObjectId, adminName: string, reason: string, level: number): void {
  this.status = 'escalated';
  this.escalationLevel = level;
  this.escalatedAt = new Date();
  this.escalatedBy = {
    id: adminId,
    name: adminName
  };
  this.escalationReason = reason;
  this.addTimelineEvent('Alert Escalated', `Alert escalated to level ${level}: ${reason}`, adminName);
};

// Method to resolve alert
securityAlertSchema.methods.resolve = function(adminId: mongoose.Types.ObjectId, adminName: string, adminEmail: string, resolution: string): void {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = {
    id: adminId,
    name: adminName,
    email: adminEmail
  };
  this.resolution = resolution;
  this.addTimelineEvent('Alert Resolved', resolution, adminName);
};

// Static method to get alerts by status
securityAlertSchema.statics.getAlertsByStatus = function(status: string, limit = 50, skip = 0) {
  return this.find({ status })
    .populate('assignedTo.id', 'firstName lastName email')
    .populate('acknowledgedBy.id', 'firstName lastName email')
    .populate('resolvedBy.id', 'firstName lastName email')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get critical alerts
securityAlertSchema.statics.getCriticalAlerts = function(limit = 50, skip = 0) {
  return this.find({
    status: { $in: ['new', 'investigating'] },
    severity: { $in: ['critical', 'high'] }
  })
    .populate('assignedTo.id', 'firstName lastName email')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to calculate risk score
securityAlertSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('severity') || this.isModified('impactAssessment')) {
    this.calculateRiskScore();
  }
  
  // Set initial timeline event if new
  if (this.isNew) {
    this.timeline = [{
      timestamp: new Date(),
      event: 'Alert Created',
      description: 'Security alert was generated',
      actor: 'System'
    }];
  }
  
  next();
});

export const SecurityAlert: Model<ISecurityAlert> = mongoose.model<ISecurityAlert>('SecurityAlert', securityAlertSchema);
export default SecurityAlert;

