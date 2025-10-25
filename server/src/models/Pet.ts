import mongoose, { Schema, Document } from 'mongoose';
import { IPet } from '../types';

const petSchema = new Schema<IPet>({
  // Owner
  owner: {
    type: Schema.Types.ObjectId,
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
      values: ['adoption', 'mating', 'playdate', 'other'],
      message: 'Intent must be one of: adoption, mating, playdate, other'
    }
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    schedule: Schema.Types.Mixed, // Flexible schedule object
    restrictions: [String] // Array of restriction strings
  },
  
  // Health Information
  healthInfo: {
    vaccinated: { type: Boolean, default: false },
    spayedNeutered: { type: Boolean, default: false },
    medicalHistory: [String],
    allergies: [String],
    medications: [String],
    vetContact: {
      name: String,
      phone: String,
      clinic: String
    }
  },
  
  // Special Needs
  specialNeeds: {
    type: String,
    maxlength: [500, 'Special needs description cannot exceed 500 characters']
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
  
  // AI Analysis
  aiAnalysis: {
    breedConfidence: Number,
    healthScore: Number,
    qualityScore: Number,
    characteristics: Schema.Types.Mixed,
    suggestions: [String],
    tags: [String],
    analyzedAt: Date
  },
  
  // Social Stats
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  matches: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
  
  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationNotes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
petSchema.index({ owner: 1 });
petSchema.index({ species: 1, breed: 1 });
petSchema.index({ location: '2dsphere' });
petSchema.index({ isActive: 1, isVerified: 1 });
petSchema.index({ createdAt: -1 });
petSchema.index({ 'photos.isPrimary': 1 });

// Virtual for primary photo
petSchema.virtual('primaryPhoto').get(function() {
  const primaryPhoto = this.photos.find(photo => photo.isPrimary);
  return primaryPhoto ? primaryPhoto.url : (this.photos[0] ? this.photos[0].url : null);
});

// Virtual for age in human years (for display)
petSchema.virtual('ageInHumanYears').get(function() {
  if (!this.age) return null;
  
  // Rough conversion based on species
  const conversionRates: { [key: string]: number } = {
    dog: 7,
    cat: 5,
    bird: 2,
    rabbit: 3,
    other: 4
  };
  
  const rate = conversionRates[this.species] || 4;
  return Math.round(this.age * rate);
});

// Virtual for compatibility score with another pet
petSchema.virtual('compatibilityScore').get(function() {
  // This would be calculated based on various factors
  // For now, return a placeholder
  return 0;
});

// Pre-save middleware to ensure at least one photo is primary
petSchema.pre('save', function(next) {
  if (this.photos && this.photos.length > 0) {
    const primaryCount = this.photos.filter(photo => photo.isPrimary).length;
    if (primaryCount === 0) {
      this.photos[0].isPrimary = true;
    } else if (primaryCount > 1) {
      // If multiple photos are marked as primary, keep only the first one
      let foundPrimary = false;
      this.photos.forEach(photo => {
        if (photo.isPrimary && !foundPrimary) {
          foundPrimary = true;
        } else if (photo.isPrimary) {
          photo.isPrimary = false;
        }
      });
    }
  }
  next();
});

// Pre-save middleware to update timestamps
petSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to add photo
petSchema.methods.addPhoto = function(photoData: { url: string; publicId?: string; caption?: string }) {
  this.photos.push({
    ...photoData,
    isPrimary: this.photos.length === 0 // First photo is primary
  });
  return this.save();
};

// Instance method to set primary photo
petSchema.methods.setPrimaryPhoto = function(photoIndex: number) {
  if (photoIndex >= 0 && photoIndex < this.photos.length) {
    this.photos.forEach((photo, index) => {
      photo.isPrimary = index === photoIndex;
    });
    return this.save();
  }
  throw new Error('Invalid photo index');
};

// Instance method to remove photo
petSchema.methods.removePhoto = function(photoIndex: number) {
  if (photoIndex >= 0 && photoIndex < this.photos.length) {
    const removedPhoto = this.photos.splice(photoIndex, 1)[0];
    
    // If we removed the primary photo, set the first remaining photo as primary
    if (removedPhoto.isPrimary && this.photos.length > 0) {
      this.photos[0].isPrimary = true;
    }
    
    return this.save();
  }
  throw new Error('Invalid photo index');
};

// Instance method to calculate compatibility with another pet
petSchema.methods.calculateCompatibility = function(otherPet: IPet): number {
  let score = 0;
  let factors = 0;
  
  // Species compatibility
  if (this.species === otherPet.species) {
    score += 30;
  }
  factors++;
  
  // Age compatibility (within reasonable range)
  const ageDiff = Math.abs(this.age - otherPet.age);
  if (ageDiff <= 2) {
    score += 20;
  } else if (ageDiff <= 5) {
    score += 10;
  }
  factors++;
  
  // Size compatibility
  const sizeOrder = ['tiny', 'small', 'medium', 'large', 'extra-large'];
  const thisSizeIndex = sizeOrder.indexOf(this.size);
  const otherSizeIndex = sizeOrder.indexOf(otherPet.size);
  const sizeDiff = Math.abs(thisSizeIndex - otherSizeIndex);
  
  if (sizeDiff <= 1) {
    score += 20;
  } else if (sizeDiff <= 2) {
    score += 10;
  }
  factors++;
  
  // Personality compatibility
  const commonPersonalities = this.personalityTags.filter(tag => 
    otherPet.personalityTags.includes(tag)
  );
  score += (commonPersonalities.length / Math.max(this.personalityTags.length, otherPet.personalityTags.length)) * 30;
  factors++;
  
  return Math.round(score / factors);
};

// Static method to find pets by location
petSchema.statics.findByLocation = function(coordinates: [number, number], maxDistance: number = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true
  });
};

// Static method to find pets by species and breed
petSchema.statics.findBySpeciesAndBreed = function(species: string, breed?: string) {
  const query: any = { species, isActive: true };
  if (breed) {
    query.breed = new RegExp(breed, 'i');
  }
  return this.find(query);
};

// Static method to find available pets
petSchema.statics.findAvailable = function() {
  return this.find({ 
    'availability.isAvailable': true, 
    isActive: true 
  });
};

export default mongoose.model<IPet>('Pet', petSchema);
