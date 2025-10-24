const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  // Owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pet must have an owner']
  },
  
  // Basic Info
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [50, 'Pet name cannot exceed 50 characters']
  },
  species: {
    type: String,
    required: [true, 'Species is required'],
    enum: {
      values: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      message: 'Species must be one of: dog, cat, bird, rabbit, other'
    }
  },
  breed: {
    type: String,
    required: [true, 'Breed is required'],
    trim: true,
    maxlength: [100, 'Breed cannot exceed 100 characters']
  },
  
  // Physical Characteristics
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [30, 'Age cannot exceed 30 years']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be either male or female'
    }
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: {
      values: ['tiny', 'small', 'medium', 'large', 'extra-large'],
      message: 'Size must be one of: tiny, small, medium, large, extra-large'
    }
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    max: [200, 'Weight cannot exceed 200kg']
  },
  color: {
    primary: String,
    secondary: String,
    pattern: {
      type: String,
      enum: ['solid', 'spotted', 'striped', 'mixed', 'other']
    }
  },
  
  // Media
  photos: [{
    url: { type: String, required: true },
    publicId: String, // Cloudinary public ID
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  videos: [{
    url: String,
    publicId: String,
    caption: String,
    duration: Number
  }],
  
  // Description & Personality
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  personalityTags: [{
    type: String,
    enum: [
      'friendly', 'energetic', 'calm', 'playful', 'shy', 'protective',
      'good-with-kids', 'good-with-pets', 'good-with-strangers',
      'trained', 'house-trained', 'leash-trained', 'crate-trained',
      'vocal', 'quiet', 'independent', 'clingy', 'intelligent',
      'gentle', 'active', 'lazy', 'social', 'aggressive', 'anxious'
    ]
  }],
  
  // Intent & Availability
  intent: {
    type: String,
    required: [true, 'Intent is required'],
    enum: {
      values: ['adoption', 'mating', 'playdate', 'all'],
      message: 'Intent must be one of: adoption, mating, playdate, all'
    }
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    schedule: {
      monday: { available: Boolean, times: [String] },
      tuesday: { available: Boolean, times: [String] },
      wednesday: { available: Boolean, times: [String] },
      thursday: { available: Boolean, times: [String] },
      friday: { available: Boolean, times: [String] },
      saturday: { available: Boolean, times: [String] },
      sunday: { available: Boolean, times: [String] }
    }
  },
  
  // Health & Care
  healthInfo: {
    vaccinated: { type: Boolean, default: false },
    spayedNeutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false },
    healthConditions: [String],
    medications: [String],
    specialNeeds: {
      type: String,
      maxlength: [500, 'Special needs cannot exceed 500 characters']
    },
    lastVetVisit: Date,
    vetContact: {
      name: String,
      phone: String,
      clinic: String
    }
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
      required: [true, 'Pet location is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' }
    }
  },
  
  // AI Enhancement
  aiData: {
    personalityArchetype: {
      primary: String,
      secondary: String,
      confidence: Number
    },
    personalityScore: {
      friendliness: { type: Number, min: 0, max: 10 },
      energy: { type: Number, min: 0, max: 10 },
      trainability: { type: Number, min: 0, max: 10 },
      socialness: { type: Number, min: 0, max: 10 },
      aggression: { type: Number, min: 0, max: 10 },
      independence: { type: Number, min: 0, max: 10 }
    },
    compatibilityTags: [String],
    breedCharacteristics: {
      temperament: [String],
      energyLevel: String,
      groomingNeeds: String,
      healthConcerns: [String]
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Premium Features
  featured: {
    isFeatured: { type: Boolean, default: false },
    featuredUntil: Date,
    boostCount: { type: Number, default: 0 },
    lastBoosted: Date
  },
  
  // Activity & Analytics
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    superLikes: { type: Number, default: 0 },
    matches: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    lastViewed: Date,
    events: [{
      type: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: { type: Date, default: Date.now },
      metadata: Object
    }]
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'paused', 'adopted', 'unavailable'],
    default: 'active'
  },
  
  // Timestamps
  adoptedAt: Date,
  listedAt: { type: Date, default: Date.now }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
petSchema.index({ location: '2dsphere' });
petSchema.index({ owner: 1 });
petSchema.index({ species: 1, intent: 1 });
petSchema.index({ breed: 1 });
petSchema.index({ isActive: 1, status: 1 });
petSchema.index({ 'featured.isFeatured': 1, 'featured.featuredUntil': 1 });
petSchema.index({ createdAt: -1 });

// Virtual for age in months for more precise filtering
petSchema.virtual('ageInMonths').get(function() {
  return this.age * 12;
});

// Virtual for primary photo
petSchema.virtual('primaryPhoto').get(function() {
  const primary = this.photos.find(photo => photo.isPrimary);
  return primary || this.photos[0] || null;
});

// Pre-save middleware
petSchema.pre('save', function(next) {
  // Ensure only one primary photo
  if (this.photos && this.photos.length > 0) {
    const primaryPhotos = this.photos.filter(photo => photo.isPrimary);
    if (primaryPhotos.length === 0) {
      this.photos[0].isPrimary = true;
    } else if (primaryPhotos.length > 1) {
      this.photos.forEach((photo, index) => {
        photo.isPrimary = index === 0;
      });
    }
  }
  
  // Update AI data timestamp if personality or breed info changed
  if (this.isModified('personalityTags') || this.isModified('breed')) {
    this.aiData.lastUpdated = new Date();
  }
  
  next();
});

// Instance methods
petSchema.methods.updateAnalytics = function(action) {
  switch (action) {
    case 'view':
      this.analytics.views += 1;
      this.analytics.lastViewed = new Date();
      break;
    case 'like':
      this.analytics.likes += 1;
      break;
    case 'match':
      this.analytics.matches += 1;
      break;
    case 'message':
      this.analytics.messages += 1;
      break;
  }
  return this.save();
};

petSchema.methods.isCompatibleWith = function(otherPet) {
  // Basic compatibility check
  if (this.species !== otherPet.species) return false;
  if (this.intent === 'mating' && otherPet.intent === 'mating') {
    return this.gender !== otherPet.gender;
  }
  return true;
};

// Static methods
petSchema.statics.findBySpeciesAndIntent = function(species, intent) {
  const query = { isActive: true, status: 'active' };
  if (species) query.species = species;
  if (intent) query.intent = { $in: [intent, 'all'] };
  return this.find(query);
};

petSchema.statics.findFeatured = function() {
  return this.find({
    'featured.isFeatured': true,
    'featured.featuredUntil': { $gt: new Date() },
    isActive: true,
    status: 'active'
  }).sort({ 'featured.lastBoosted': -1 });
};

module.exports = mongoose.model('Pet', petSchema);