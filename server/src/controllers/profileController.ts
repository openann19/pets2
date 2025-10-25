/**
 * Profile Controller
 * Handles user profile and pet profile operations
 */

const User = require('../models/User');
const Pet = require('../models/Pet');
const logger = require('../utils/logger');

/**
 * Update pet profile
 */
exports.updatePetProfile = async (req, res) => {
  try {
    const { petId } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    // Find the pet and verify ownership
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Verify the user owns this pet
    if (pet.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pet'
      });
    }

    // Update pet with new data
    Object.assign(pet, updates);
    await pet.save();

    logger.info('Pet profile updated', { petId, userId });

    res.json({
      success: true,
      data: pet,
      message: 'Pet profile updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update pet profile', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update pet profile',
      error: error.message
    });
  }
};

/**
 * Create new pet profile
 */
exports.createPetProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const petData = {
      ...req.body,
      owner: userId
    };

    const pet = new Pet(petData);
    await pet.save();

    // Add pet to user's pets array
    await User.findByIdAndUpdate(userId, {
      $push: { pets: pet._id }
    });

    logger.info('Pet profile created', { petId: pet._id, userId });

    res.status(201).json({
      success: true,
      data: pet,
      message: 'Pet profile created successfully'
    });
  } catch (error) {
    logger.error('Failed to create pet profile', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create pet profile',
      error: error.message
    });
  }
};

/**
 * Get user's message count
 */
exports.getMessageCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Implement actual message count from Match/Message models
    const Message = require('../models/Message');
    const count = await Message.countDocuments({
      $or: [
        { sender: userId },
        { recipient: userId }
      ],
      readAt: null // Unread messages
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Failed to get message count', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get message count',
      error: error.message
    });
  }
};

/**
 * Get user's pet count
 */
exports.getPetCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Pet.countDocuments({ owner: userId });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Failed to get pet count', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet count',
      error: error.message
    });
  }
};

/**
 * Get user privacy settings
 */
exports.getPrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('privacySettings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.privacySettings || {
        profileVisibility: 'everyone',
        showOnlineStatus: true,
        showDistance: true,
        showLastActive: true,
        allowMessages: 'everyone',
        showReadReceipts: true,
        incognitoMode: false,
        shareLocation: true
      }
    });
  } catch (error) {
    logger.error('Failed to get privacy settings', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get privacy settings',
      error: error.message
    });
  }
};

/**
 * Update user privacy settings
 */
exports.updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { privacySettings: settings },
      { new: true, runValidators: true }
    ).select('privacySettings');

    logger.info('Privacy settings updated', { userId });

    res.json({
      success: true,
      data: user.privacySettings,
      message: 'Privacy settings updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update privacy settings', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings',
      error: error.message
    });
  }
};

/**
 * Export user data (GDPR compliance)
 */
exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Gather all user data
    const user = await User.findById(userId).lean();
    const pets = await Pet.find({ owner: userId }).lean();
    const Message = require('../models/Message');
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).lean();

    const exportData = {
      user: {
        ...user,
        password: undefined, // Don't export password
        twoFactorSecret: undefined // Don't export 2FA secret
      },
      pets,
      messages,
      exportedAt: new Date().toISOString()
    };

    logger.info('User data exported', { userId });

    res.json({
      success: true,
      data: exportData,
      message: 'User data exported successfully'
    });
  } catch (error) {
    logger.error('Failed to export user data', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: error.message
    });
  }
};

/**
 * Delete user account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password before deletion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Soft delete: mark as inactive instead of hard delete
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    // Also deactivate all user's pets
    await Pet.updateMany(
      { owner: userId },
      { isActive: false }
    );

    logger.info('User account deleted', { userId });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete account', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};
