import mongoose from 'mongoose';

/**
 * AuditLog Model
 * Stores audit trails for admin actions
 */
export interface IAuditLog extends mongoose.Document {
  id: string;
  at: Date;
  adminId: string;
  ip?: string;
  action: string;
  target?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>({
  at: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  adminId: {
    type: String,
    required: true,
    index: true,
  },
  ip: {
    type: String,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  target: {
    type: String,
    index: true,
  },
  before: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  after: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  reason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound indexes
auditLogSchema.index({ adminId: 1, at: -1 });
auditLogSchema.index({ action: 1, at: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);