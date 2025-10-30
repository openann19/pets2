import mongoose from 'mongoose';

const AdoptionApplicationSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  answers: {
    type: Object,
    default: {},
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  reviewNotes: {
    type: String,
    maxlength: 5000
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate applications
AdoptionApplicationSchema.index({ petId: 1, applicantId: 1 }, { unique: true });

// Additional indexes for performance
AdoptionApplicationSchema.index({ applicantId: 1, status: 1 });
AdoptionApplicationSchema.index({ ownerId: 1, status: 1 });
AdoptionApplicationSchema.index({ petId: 1, status: 1 });
AdoptionApplicationSchema.index({ reviewedBy: 1 });
AdoptionApplicationSchema.index({ createdAt: -1 });

export const AdoptionApplication = mongoose.model('AdoptionApplication', AdoptionApplicationSchema);

export default AdoptionApplication;

