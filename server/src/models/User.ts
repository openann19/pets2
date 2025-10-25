import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  // Basic Info
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },

  // Profile
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },

  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' }
    }
  },

  // Preferences
  preferences: {
    maxDistance: { type: Number, default: 50 }, // km
    ageRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 20 }
    },
    species: [{ type: String, enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] }],
    intents: [{ type: String, enum: ['adoption', 'mating', 'playdate'] }],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    }
  },

  // Premium Features
  premium: {
    isActive: { type: Boolean, default: false },
    plan: { type: String, enum: ['basic', 'premium', 'ultimate'], default: 'basic' },
    expiresAt: Date,
    stripeSubscriptionId: String,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['active', 'past_due', 'failed'], default: 'active' },
    features: {
      unlimitedLikes: { type: Boolean, default: false },
      boostProfile: { type: Boolean, default: false },
      seeWhoLiked: { type: Boolean, default: false },
      advancedFilters: { type: Boolean, default: false },
      aiMatching: { type: Boolean, default: false }
    }
  },

  // Analytics
  analytics: {
    lastActive: Date,
    totalPetsCreated: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    totalMessagesSent: { type: Number, default: 0 },
    totalSubscriptionsStarted: { type: Number, default: 0 },
    totalSubscriptionsCancelled: { type: Number, default: 0 },
    totalPremiumFeaturesUsed: { type: Number, default: 0 },
    events: [{
      type: String,
      timestamp: Date,
      metadata: Schema.Types.Mixed
    }]
  },

  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationExpires: Date,

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Two-Factor Authentication
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },

  // Biometric Credentials
  biometricCredentials: [{ type: Schema.Types.ObjectId, ref: 'BiometricCredential' }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this['password']);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate verification code
userSchema.methods.generateVerificationCode = function(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return code;
};

// Instance method to check if verification code is valid
userSchema.methods.isVerificationCodeValid = function(code: string): boolean {
  return this.verificationCode === code && 
         this.verificationExpires && 
         this.verificationExpires > new Date();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isVerified: true });
};

export default mongoose.model<IUser>('User', userSchema);
