import mongoose, { Schema, Document } from 'mongoose';
import { IFavorite } from '../types';

/**
 * Favorite Model
 * 
 * Stores user's favorited pets (separate from matches/likes).
 * Used for saving interesting pets for later viewing.
 */

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, petId: 1 }, { unique: true });

// Indexes for efficient querying
favoriteSchema.index({ userId: 1, createdAt: -1 });
favoriteSchema.index({ petId: 1 });

// Virtual for time since favorited
favoriteSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
});

// Static method to add favorite
favoriteSchema.statics.addFavorite = function(userId: string, petId: string) {
  return this.findOneAndUpdate(
    { userId, petId },
    { userId, petId, createdAt: new Date() },
    { upsert: true, new: true }
  );
};

// Static method to remove favorite
favoriteSchema.statics.removeFavorite = function(userId: string, petId: string) {
  return this.findOneAndDelete({ userId, petId });
};

// Static method to check if favorited
favoriteSchema.statics.isFavorited = function(userId: string, petId: string) {
  return this.findOne({ userId, petId });
};

// Static method to get user favorites
favoriteSchema.statics.getUserFavorites = function(userId: string, limit: number = 50, page: number = 1) {
  const skip = (page - 1) * limit;
  
  return this.find({ userId })
    .populate('petId', 'name species breed age photos description')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get favorite count for user
favoriteSchema.statics.getFavoriteCount = function(userId: string) {
  return this.countDocuments({ userId });
};

// Static method to get favorite count for pet
favoriteSchema.statics.getPetFavoriteCount = function(petId: string) {
  return this.countDocuments({ petId });
};

// Static method to get most favorited pets
favoriteSchema.statics.getMostFavoritedPets = function(limit: number = 20) {
  return this.aggregate([
    {
      $group: {
        _id: '$petId',
        favoriteCount: { $sum: 1 },
        lastFavorited: { $max: '$createdAt' },
      },
    },
    {
      $lookup: {
        from: 'pets',
        localField: '_id',
        foreignField: '_id',
        as: 'pet',
      },
    },
    {
      $unwind: '$pet',
    },
    {
      $match: {
        'pet.isActive': true,
      },
    },
    {
      $sort: { favoriteCount: -1, lastFavorited: -1 },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        pet: 1,
        favoriteCount: 1,
        lastFavorited: 1,
      },
    },
  ]);
};

// Static method to cleanup old favorites (optional cleanup)
favoriteSchema.statics.cleanupOldFavorites = function(daysOld: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
  });
};

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);
