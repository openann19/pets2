import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserModel from '../models/User';
import PetModel from '../models/Pet';
import MatchModel from '../models/Match';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinaryService';
import logger from '../utils/logger';
import { AuthenticatedRequest, IUser, IPet, IMatch } from '../types';

// @desc    Get comprehensive user profile with analytics
// @route   GET /api/users/profile/complete
// @access  Private
const getCompleteProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId)
      .populate('pets', 'name species photos breed age')
      .populate('matches', 'compatibilityScore createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate profile completeness score
    const completenessScore = calculateProfileCompleteness(user);

    // Get recent activity
    const recentActivity = await getUserRecentActivity(req.userId);

    // Get privacy-safe stats (only show user's own data)
    const stats = {
      totalPets: user.pets?.length || 0,
      totalMatches: user.matches?.length || 0,
      profileViews: user.analytics?.profileViews || 0,
      joinDate: user.createdAt,
      lastActive: user.analytics?.lastActive,
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: {
        user,
        stats,
        completenessScore,
        recentActivity,
        privacySettings: user.privacySettings || {},
        preferences: user.preferences || {}
      }
    });

  } catch (error) {
    logger.error('Get complete profile error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get complete profile'
    });
  }
};

// @desc    Update user profile with advanced validation
// @route   PUT /api/users/profile/advanced
// @access  Private
const updateAdvancedProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { dateOfBirth, location, preferences } = req.body;

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Advanced validation
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: 'You must be at least 18 years old'
        });
      }
    }

    // Sanitize and update profile
    const updates = {};
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'dateOfBirth', 'phone',
      'socialLinks', 'website', 'occupation', 'education',
      'interests', 'languages', 'relationshipStatus'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update location if provided
    if (location) {
      updates.location = { ...user.location, ...location };
    }

    // Update preferences if provided
    if (preferences) {
      updates.preferences = { ...user.preferences, ...preferences };
    }

    // Update user
    Object.assign(user, updates);
    await user.save();

    // Calculate new completeness score
    const completenessScore = calculateProfileCompleteness(user);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
        completenessScore
      }
    });

  } catch (error) {
    logger.error('Update advanced profile error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc    Update user privacy settings
// @route   PUT /api/users/privacy-settings
// @access  Private
const updatePrivacySettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      profileVisibility,
      showOnlineStatus,
      showLastActive,
      allowMessaging,
      showPets,
      showLocation,
      allowPetDiscovery,
      dataSharing
    } = req.body;

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.privacySettings = {
      ...user.privacySettings,
      profileVisibility: profileVisibility || 'public',
      showOnlineStatus: showOnlineStatus !== false,
      showLastActive: showLastActive !== false,
      allowMessaging: allowMessaging !== false,
      showPets: showPets !== false,
      showLocation: showLocation !== false,
      allowPetDiscovery: allowPetDiscovery !== false,
      dataSharing: dataSharing || {}
    };

    await user.save();

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: { privacySettings: user.privacySettings }
    });

  } catch (error) {
    logger.error('Update privacy settings error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings'
    });
  }
};

// @desc    Update user notification preferences
// @route   PUT /api/users/notification-preferences
// @access  Private
const updateNotificationPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      email,
      push,
      matches,
      messages,
      likes,
      comments,
      reminders,
      marketing,
      system
    } = req.body;

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.preferences.notifications = {
      ...user.preferences.notifications,
      email: email !== false,
      push: push !== false,
      matches: matches !== false,
      messages: messages !== false,
      likes: likes !== false,
      comments: comments !== false,
      reminders: reminders !== false,
      marketing: marketing !== false,
      system: system !== false
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { notifications: user.preferences.notifications }
    });

  } catch (error) {
    logger.error('Update notification preferences error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};

// @desc    Upload and manage multiple profile photos
// @route   POST /api/users/photos
// @access  Private
const uploadProfilePhotos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos provided'
      });
    }

    // Limit to 6 photos maximum
    const currentPhotoCount = user.photos?.length || 0;
    if (currentPhotoCount + req.files.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 profile photos allowed'
      });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      try {
        const uploadResult = await uploadToCloudinary(file.buffer, 'profiles');
        uploadedPhotos.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          uploadedAt: new Date(),
          isPrimary: currentPhotoCount === 0 && uploadedPhotos.length === 0
        });
      } catch (uploadError) {
        logger.error('Profile photo upload error', { error: uploadError, userId: req.userId });
      }
    }

    // Add photos to user profile
    user.photos = user.photos || [];
    user.photos.push(...uploadedPhotos);

    await user.save();

    res.json({
      success: true,
      message: `${uploadedPhotos.length} photos uploaded successfully`,
      data: {
        photos: user.photos,
        uploadedCount: uploadedPhotos.length
      }
    });

  } catch (error) {
    logger.error('Upload profile photos error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to upload photos'
    });
  }
};

// @desc    Delete profile photo
// @route   DELETE /api/users/photos/:photoId
// @access  Private
const deleteProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const photoIndex = user.photos?.findIndex(photo => photo._id.toString() === photoId);
    if (photoIndex === undefined || photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const photo = user.photos[photoIndex];

    // Delete from Cloudinary
    if (photo.publicId) {
      try {
        await deleteFromCloudinary(photo.publicId);
      } catch (deleteError) {
        logger.error('Profile photo deletion error', { error: deleteError, userId: req.userId });
      }
    }

    // Remove from user photos
    user.photos.splice(photoIndex, 1);

    // If this was the primary photo, set the first remaining photo as primary
    if (photo.isPrimary && user.photos.length > 0) {
      user.photos[0].isPrimary = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: { photos: user.photos }
    });

  } catch (error) {
    logger.error('Delete profile photo error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
};

// @desc    Set primary profile photo
// @route   PUT /api/users/photos/:photoId/primary
// @access  Private
const setPrimaryPhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Reset all photos to non-primary
    user.photos?.forEach(photo => {
      photo.isPrimary = false;
    });

    // Set the specified photo as primary
    const photo = user.photos?.find(photo => photo._id.toString() === photoId);
    if (photo) {
      photo.isPrimary = true;
    } else {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Primary photo updated successfully',
      data: { photos: user.photos }
    });

  } catch (error) {
    logger.error('Set primary photo error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to set primary photo'
    });
  }
};

// @desc    Get user profile analytics
// @route   GET /api/users/analytics
// @access  Private
const getUserAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get detailed analytics
    const analytics = {
      profile: {
        views: user.analytics?.profileViews || 0,
        completeness: calculateProfileCompleteness(user),
        lastActive: user.analytics?.lastActive,
        joinDate: user.createdAt
      },
      pets: {
        total: user.pets?.length || 0,
        active: await PetModel.countDocuments({ owner: req.userId, isActive: true }),
        featured: await PetModel.countDocuments({ owner: req.userId, 'featured.isFeatured': true })
      },
      matches: {
        total: user.matches?.length || 0,
        active: await MatchModel.countDocuments({
          $or: [{ user1: req.userId }, { user2: req.userId }],
          status: 'active'
        }),
        compatibility: await getUserCompatibilityStats(req.userId)
      },
      activity: {
        totalSwipes: user.analytics?.totalSwipes || 0,
        totalLikes: user.analytics?.totalLikes || 0,
        totalMatches: user.analytics?.totalMatches || 0,
        totalMessages: user.analytics?.totalMessagesSent || 0,
        avgCompatibilityScore: await getUserAvgCompatibility(req.userId)
      },
      premium: {
        isActive: user.premium?.isActive || false,
        featuresUsed: user.analytics?.totalPremiumFeaturesUsed || 0,
        subscriptionTier: user.premium?.plan || 'basic'
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Get user analytics error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};

// @desc    Export user data for backup/download
// @route   GET /api/users/export
// @access  Private
const exportUserData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId)
      .populate('pets')
      .populate('matches', 'compatibilityScore createdAt')
      .populate('swipedPets.petId', 'name species')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prepare export data (exclude sensitive information)
    const exportData = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastActive: user.analytics?.lastActive
      },
      pets: user.pets?.map(pet => ({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        description: pet.description,
        personalityTags: pet.personalityTags,
        createdAt: pet.createdAt
      })) || [],
      matches: user.matches?.map(match => ({
        compatibilityScore: match.compatibilityScore,
        createdAt: match.createdAt
      })) || [],
      statistics: {
        totalPets: user.pets?.length || 0,
        totalMatches: user.matches?.length || 0,
        totalSwipes: user.analytics?.totalSwipes || 0,
        totalLikes: user.analytics?.totalLikes || 0,
        totalMessages: user.analytics?.totalMessagesSent || 0
      },
      exportDate: new Date(),
      version: '1.0'
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=pawfectmatch-data-${user._id}-${new Date().toISOString().split('T')[0]}.json`);

    res.json(exportData);

  } catch (error) {
    logger.error('Export user data error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
};

// @desc    Deactivate user account (soft delete)
// @route   POST /api/users/deactivate
// @access  Private
const deactivateAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { reason, feedback } = req.body;
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mark as inactive
    user.isActive = false;
    user.status = 'inactive';
    user.deactivatedAt = new Date();
    user.deactivationReason = reason;
    user.deactivationFeedback = feedback;

    // Deactivate all pets
    await PetModel.updateMany({ owner: req.userId }, { isActive: false });

    await user.save();

    logger.info(`User account deactivated: ${req.userId}`, { reason });

    res.json({
      success: true,
      message: 'Account deactivated successfully. You can reactivate at any time.',
      data: {
        deactivatedAt: user.deactivatedAt,
        canReactivate: true
      }
    });

  } catch (error) {
    logger.error('Deactivate account error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account'
    });
  }
};

// @desc    Reactivate user account
// @route   POST /api/users/reactivate
// @access  Private
const reactivateAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is already active'
      });
    }

    // Reactivate account
    user.isActive = true;
    user.status = 'active';
    user.reactivatedAt = new Date();
    user.deactivatedAt = null;
    user.deactivationReason = null;

    // Reactivate pets
    await PetModel.updateMany({ owner: req.userId }, { isActive: true });

    await user.save();

    logger.info(`User account reactivated: ${req.userId}`);

    res.json({
      success: true,
      message: 'Account reactivated successfully',
      data: {
        reactivatedAt: user.reactivatedAt
      }
    });

  } catch (error) {
    logger.error('Reactivate account error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate account'
    });
  }
};

// Helper functions
function calculateProfileCompleteness(user: any): number {
  const fields = [
    'firstName', 'lastName', 'bio', 'avatar', 'dateOfBirth',
    'phone', 'location', 'preferences'
  ];

  let completed = 0;
  fields.forEach(field => {
    if (user[field] && user[field] !== '') {
      if (field === 'location' && user.location?.coordinates?.[0] !== 0) {
        completed++;
      } else if (field !== 'location') {
        completed++;
      }
    }
  });

  // Add pets to completeness
  if (user.pets && user.pets.length > 0) {
    completed++;
  }

  return Math.round((completed / (fields.length + 1)) * 100);
}

async function getUserRecentActivity(userId: string | mongoose.Types.ObjectId): Promise<Array<{ type: string; description: string; timestamp: Date }>> {
  const activities = [];

  // Recent pets created
  const recentPets = await PetModel.find({ owner: userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('name createdAt');

  recentPets.forEach(pet => {
    activities.push({
      type: 'pet_created',
      description: `Created pet profile for ${pet.name}`,
      timestamp: pet.createdAt
    });
  });

  // Recent matches
  const recentMatches = await MatchModel.find({
    $or: [{ user1: userId }, { user2: userId }]
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .select('createdAt compatibilityScore');

  recentMatches.forEach(match => {
    activities.push({
      type: 'match_created',
      description: `Found a new match (${match.compatibilityScore}% compatibility)`,
      timestamp: match.createdAt
    });
  });

  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
}

async function getUserCompatibilityStats(userId: string | mongoose.Types.ObjectId): Promise<{ average: number; highest: number; lowest: number; total: number } | null> {
  const matches = await MatchModel.find({
    $or: [{ user1: userId }, { user2: userId }]
  }).select('compatibilityScore');

  if (matches.length === 0) return null;

  const scores = matches.map(m => m.compatibilityScore).filter(score => score != null);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return {
    average: Math.round(avgScore),
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    total: matches.length
  };
}

async function getUserAvgCompatibility(userId: string | mongoose.Types.ObjectId): Promise<number> {
  const stats = await getUserCompatibilityStats(userId);
  return stats?.average || 0;
}

export default {
  getCompleteProfile,
  updateAdvancedProfile,
  updatePrivacySettings,
  updateNotificationPreferences,
  uploadProfilePhotos,
  deleteProfilePhoto,
  setPrimaryPhoto,
  getUserAnalytics,
  exportUserData,
  deactivateAccount,
  reactivateAccount
};
