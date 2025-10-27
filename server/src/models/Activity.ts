import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['like', 'match', 'message', 'adoption', 'milestone'],
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['User', 'Pet', 'Match']
  },
  description: {
    type: String,
    required: true
  },
  audience: {
    type: [String], // Array of user IDs or 'global'
    default: ['global']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ createdAt: -1 });
activitySchema.index({ audience: 1 });
activitySchema.index({ type: 1 });

export default mongoose.model('Activity', activitySchema);

