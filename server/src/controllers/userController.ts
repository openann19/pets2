import { Request, Response } from 'express';
import User, { IUserDocument } from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinaryService';
import logger from '../utils/logger';

/**
 * Request interfaces
 */
interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

interface GetCompleteProfileRequest extends AuthenticatedRequest {}

interface UpdateAdvancedProfileRequest extends AuthenticatedRequest {
  body: {
    dateOfBirth?: string;
    location?: any;
    preferences?: any;
    firstName?: string;
    lastName?: string;
    bio?: string;
    phone?: string;
    socialLinks?: any;
    website?: string;
    occupation?: string;
    education?: string;
    interests?: string[];
    languages?: string[];
    relationshipStatus?: string;
  };
}

interface UpdatePrivacySettingsRequest extends AuthenticatedRequest {
  body: {
    profileVisibility?: string;
    showOnlineStatus?: boolean;
    showLastActive?: boolean;
    allowMessaging?: boolean;
    showPets?: boolean;
    showLocation?: boolean;
    allowPetDiscovery?: boolean;
    dataSharing?: any;
  };
}

interface UpdateNotificationPreferencesRequest extends AuthenticatedRequest {
  body: {
    email?: boolean;
    push?: boolean;
    matches?: boolean;
    messages?: boolean;
    likes?: boolean;
    comments?: boolean;
    reminders?: boolean;
    marketing?: boolean;
    system?: boolean;
  };
}

interface UploadProfilePhotosRequest extends AuthenticatedRequest {
  files?: any[];
}

interface DeleteProfilePhotoRequest extends AuthenticatedRequest {
  params: {
    photoId: string;
  };
}

interface SetPrimaryPhotoRequest extends AuthenticatedRequest {
  params: {
    photoId: string;
  };
}

interface GetUserAnalyticsRequest extends AuthenticatedRequest {}

interface ExportUserDataRequest extends AuthenticatedRequest {}

interface DeactivateAccountRequest extends AuthenticatedRequest {
  body: {
    reason?: string;
    feedback?: string;
  };
}

interface ReactivateAccountRequest extends AuthenticatedRequest {}

/**
 * Helper function to calculate profile completeness score
 */
function calculateProfileCompleteness(user: IUserDocument): number {
  const fields = [
    'firstName', 'lastName', 'bio', 'avatar', 'dateOfBirth',
    'phone', 'location', 'preferences'
  ];

  let completed = 0;
  fields.forEach(field => {
    if (user[field as keyof IUserDocument] && (user[field as keyof IUserDocument] as any) !== '') {
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

/**
 * Get user's recent activity
 */
async function getUserRecentActivity(userId: string): Promise<any[]> {
  const activities: any[] = [];

  // Recent pets created
  const recentPets = await Pet.find({ owner: userId })
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
  const recentMatches = await Match.find({
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

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
}

/**
 * Get user compatibility statistics
 */
async function getUserCompatibilityStats(userId: string): Promise<any> {
  const matches = await Match.find({
    $or: [{ user1: userId }, { user2: userId }]
  }).select('compatibilityScore');

  if (matches.length === 0) return null;

  const scores = matches.map((m: any) => m.compatibilityScore).filter((score: any) => score != null);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return {
    average: Math.round(avgScore),
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
    total: matches.length
  };
}

/**
 * Get user average compatibility
 */
async function getUserAvgCompatibility(userId: string): Promise<number> {
  const stats = await getUserCompatibilityStats(userId);
  return stats?.average || 0;
}

/**
 * @desc    Get comprehensive user profile with analytics
 * @route   GET /api/users/profile/complete
 * @access  Private
 */
export const getCompleteProfile = async (
  req: GetCompleteProfileRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('pets', 'name species photos breed age')
      .populate('matches', 'compatibilityScore createdAt')
      .lean();

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Calculate profile completeness score
    const completenessScore = calculateProfileCompleteness(user as IUserDocument);

    // Get recent activity
    const recentActivity = await getUserRecentActivity(req.userId);

    // Get privacy-safe stats (only show user's own data)
    const stats = {
      totalPets: (user as any).pets?.length || 0,
      totalMatches: (user as any).matches?.length || 0,
      profileViews: (user as any).analytics?.profileViews || 0,
      joinDate: (user as any).createdAt,
      lastActive: (user as any).analytics?.lastActive,
      accountAge: Math.floor((Date.now() - new Date((user as any).createdAt).getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: {
        user,
        stats,
        completenessScore,
        recentActivity,
        privacySettings: (user as any).privacySettings || {},
        preferences: (user as any).preferences || {}
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

/**
 * @desc    Update user profile with advanced validation
 * @route   PUT /api/users/profile/advanced
 * @access  Private
 */
export const updateAdvancedProfile = async (
  req: UpdateAdvancedProfileRequest,
  res: Response
): Promise<void> => {
  try {
    const { dateOfBirth, location, preferences } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Advanced validation
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        res.status(400).json({
          success: false,
          message: 'You must be at least 18 years old'
        });
        return;
      }
    }

    // Sanitize and update profile
    const updates: any = {};
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'dateOfBirth', 'phone',
      'socialLinks', 'website', 'occupation', 'education',
      'interests', 'languages', 'relationshipStatus'
    ];

    allowedFields.forEach(field => {
      if (req.body[field as keyof typeof req.body] !== undefined) {
        updates[field] = req.body[field as keyof typeof req.body];
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

/**
 * @desc    Update user privacy settings
 * @route   PUT /api/users/privacy-settings
 * @access  Private
 */
export const updatePrivacySettings = async (
  req: UpdatePrivacySettingsRequest,
  res: Response
): Promise<void> => {
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

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    (user as any).privacySettings = {
      ...(user as any).privacySettings,
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
      data: { privacySettings: (user as any).privacySettings }
    });

  } catch (error) {
    logger.error('Update privacy settings error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings'
    });
  }
};

/**
 * @desc    Update user notification preferences
 * @route   PUT /api/users/notification-preferences
 * @access  Private
 */
export const updateNotificationPreferences = async (
  req: UpdateNotificationPreferencesRequest,
  res: Response
): Promise<void> => {
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

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
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

/**
 * @desc    Upload and manage multiple profile photos
 * @route   POST /api/users/photos
 * @access  Private
 */
export const uploadProfilePhotos = async (
  req: UploadProfilePhotosRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No photos provided'
      });
      return;
    }

    // Limit to 6 photos maximum
    const currentPhotoCount = (user as any).photos?.length || 0;
    if (currentPhotoCount + req.files.length > 6) {
      res.status(400).json({
        success: false,
        message: 'Maximum 6 profile photos allowed'
      });
      return;
    }

    const uploadedPhotos: any[] = [];

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
    (user as any).photos = (user as any).photos || [];
    (user as any).photos.push(...uploadedPhotos);

    await user.save();

    res.json({
      success: true,
      message: `${uploadedPhotos.length} photos uploaded successfully`,
      data: {
        photos: (user as any).photos,
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

/**
 * @desc    Delete profile photo
 * @route   DELETE /api/users/photos/:photoId
 * @access  Private
 */
export const deleteProfilePhoto = async (
  req: DeleteProfilePhotoRequest,
  res: Response
): Promise<void> => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const photoIndex = (user as any).photos?.findIndex((photo: any) => photo._id.toString() === photoId);
    if (photoIndex === undefined || photoIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
      return;
    }

    const photo = (user as any).photos[photoIndex];

    // Delete from Cloudinary
    if (photo.publicId) {
      try {
        await deleteFromCloudinary(photo.publicId);
      } catch (deleteError) {
        logger.error('Profile photo deletion error', { error: deleteError, userId: req.userId });
      }
    }

    // Remove from user photos
    (user as any).photos.splice(photoIndex, 1);

    // If this was the primary photo, set the first remaining photo as primary
    if (photo.isPrimary && (user as any).photos.length > 0) {
      (user as any).photos[0].isPrimary = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: { photos: (user as any).photos }
    });

  } catch (error) {
    logger.error('Delete profile photo error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
};

/**
 * @desc    Set primary profile photo
 * @route   PUT /api/users/photos/:photoId/primary
 * @access  Private
 */
export const setPrimaryPhoto = async (
  req: SetPrimaryPhotoRequest,
  res: Response
): Promise<void> => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Reset all photos to non-primary
    (user as any).photos?.forEach((photo: any) => {
      photo.isPrimary = false;
    });

    // Set the specified photo as primary
    const photo = (user as any).photos?.find((photo: any) => photo._id.toString() === photoId);
    if (photo) {
      photo.isPrimary = true;
    } else {
      res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
      return;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Primary photo updated successfully',
      data: { photos: (user as any).photos }
    });

  } catch (error) {
    logger.error('Set primary photo error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to set primary photo'
    });
  }
};

/**
 * @desc    Get user profile analytics
 * @route   GET /api/users/analytics
 * @access  Private
 */
export const getUserAnalytics = async (
  req: GetUserAnalyticsRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
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
        active: await Pet.countDocuments({ owner: req.userId, isActive: true }),
        featured: await Pet.countDocuments({ owner: req.userId, 'featured.isFeatured': true })
      },
      matches: {
        total: user.matches?.length || 0,
        active: await Match.countDocuments({
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

/**
 * @desc    Export user data for backup/download
 * @route   GET /api/users/export
 * @access  Private
 */
export const exportUserData = async (
  req: ExportUserDataRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .populate('pets')
      .populate('matches', 'compatibilityScore createdAt')
      .populate('swipedPets.petId', 'name species')
      .lean();

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Prepare export data (exclude sensitive information)
    const exportData = {
      profile: {
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        bio: (user as any).bio,
        dateOfBirth: (user as any).dateOfBirth,
        location: (user as any).location,
        preferences: (user as any).preferences,
        createdAt: (user as any).createdAt,
        lastActive: (user as any).analytics?.lastActive
      },
      pets: (user as any).pets?.map((pet: any) => ({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        description: pet.description,
        personalityTags: pet.personalityTags,
        createdAt: pet.createdAt
      })) || [],
      matches: (user as any).matches?.map((match: any) => ({
        compatibilityScore: match.compatibilityScore,
        createdAt: match.createdAt
      })) || [],
      statistics: {
        totalPets: (user as any).pets?.length || 0,
        totalMatches: (user as any).matches?.length || 0,
        totalSwipes: (user as any).analytics?.totalSwipes || 0,
        totalLikes: (user as any).analytics?.totalLikes || 0,
        totalMessages: (user as any).analytics?.totalMessagesSent || 0
      },
      exportDate: new Date(),
      version: '1.0'
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=pawfectmatch-data-${(user as any)._id}-${new Date().toISOString().split('T')[0]}.json`);

    res.json(exportData);

  } catch (error) {
    logger.error('Export user data error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
};

/**
 * @desc    Deactivate user account (soft delete)
 * @route   POST /api/users/deactivate
 * @access  Private
 */
export const deactivateAccount = async (
  req: DeactivateAccountRequest,
  res: Response
): Promise<void> => {
  try {
    const { reason, feedback } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Mark as inactive
    user.isActive = false;
    user.status = 'inactive';
    (user as any).deactivatedAt = new Date();
    (user as any).deactivationReason = reason;
    (user as any).deactivationFeedback = feedback;

    // Deactivate all pets
    await Pet.updateMany({ owner: req.userId }, { isActive: false });

    await user.save();

    logger.info(`User account deactivated: ${req.userId}`, { reason });

    res.json({
      success: true,
      message: 'Account deactivated successfully. You can reactivate at any time.',
      data: {
        deactivatedAt: (user as any).deactivatedAt,
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

/**
 * @desc    Reactivate user account
 * @route   POST /api/users/reactivate
 * @access  Private
 */
export const reactivateAccount = async (
  req: ReactivateAccountRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.isActive) {
      res.status(400).json({
        success: false,
        message: 'Account is already active'
      });
      return;
    }

    // Reactivate account
    user.isActive = true;
    user.status = 'active';
    (user as any).reactivatedAt = new Date();
    (user as any).deactivatedAt = null;
    (user as any).deactivationReason = null;

    // Reactivate pets
    await Pet.updateMany({ owner: req.userId }, { isActive: true });

    await user.save();

    logger.info(`User account reactivated: ${req.userId}`);

    res.json({
      success: true,
      message: 'Account reactivated successfully',
      data: {
        reactivatedAt: (user as any).reactivatedAt
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

