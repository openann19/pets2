const Pet = require('../models/Pet');
const User = require('../models/User');
const Match = require('../models/Match');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { getAIRecommendations, analyzePetCompatibility } = require('../services/aiService');
const logger = require('../utils/logger');

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private
const createPet = async (req, res) => {
  try {
    const {
      name, species, breed, age, gender, size, weight, color,
      description, personalityTags, intent, availability,
      healthInfo, specialNeeds
    } = req.body;

    // Handle photo uploads
    let photos = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'pets');
          photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: photos.length === 0 // First photo is primary
          });
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
        }
      }
    }

    // Get user's location for pet location
    const user = await User.findById(req.userId);

    const pet = new Pet({
      owner: req.userId,
      name,
      species,
      breed,
      age: parseInt(age),
      gender,
      size,
      weight: weight ? parseFloat(weight) : undefined,
      color: color || {},
      description,
      personalityTags: Array.isArray(personalityTags) ? personalityTags : [],
      intent,
      availability: availability || { isAvailable: true },
      healthInfo: healthInfo || {},
      specialNeeds: specialNeeds?.trim?.() || undefined,
      photos,
      location: user.location || {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    await pet.save();

    // Add pet to user's pets array
    await User.findByIdAndUpdate(req.userId, {
      $push: { pets: pet._id }
    });

    // Populate owner info
    await pet.populate('owner', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: { pet }
    });

  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pet',
      error: error.message
    });
  }
};

// @desc    Get all pets for discovery (with filters)
// @route   GET /api/pets/discover
// @access  Private
const discoverPets = async (req, res) => {
  try {
    const {
      species,
      intent,
      maxDistance = 50,
      minAge,
      maxAge,
      size,
      gender,
      breed,
      page = 1,
      limit = 10
    } = req.query;

    const user = await User.findById(req.userId);

    // Get IDs of pets already swiped by user
    const swipedPetIds = user.swipedPets.map(swipe => swipe.petId);

    // Build query
    const query = {
      owner: { $ne: req.userId }, // Exclude user's own pets
      _id: { $nin: swipedPetIds }, // Exclude already swiped pets
      isActive: true,
      status: 'active'
    };

    // Apply filters
    if (species) query.species = species;
    if (intent) query.intent = { $in: [intent, 'all'] };
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }
    if (size) query.size = size;
    if (gender) query.gender = gender;
    if (breed) query.breed = new RegExp(breed, 'i');

    let petsQuery = Pet.find(query)
      .populate('owner', 'firstName lastName avatar premium.isActive')
      .sort({ 'featured.isFeatured': -1, createdAt: -1 });

    // Add location-based filtering if user has coordinates
    if (user.location && user.location.coordinates[0] !== 0) {
      petsQuery = Pet.aggregate([
        {
          $geoNear: {
            near: user.location,
            distanceField: 'distance',
            maxDistance: maxDistance * 1000, // Convert km to meters
            spherical: true,
            query: query
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
            pipeline: [
              { $project: { firstName: 1, lastName: 1, avatar: 1, 'premium.isActive': 1 } }
            ]
          }
        },
        { $unwind: '$owner' },
        { $sort: { 'featured.isFeatured': -1, createdAt: -1 } }
      ]);
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pets;
    if (Array.isArray(petsQuery)) {
      // Aggregation result
      pets = petsQuery.slice(skip, skip + parseInt(limit));
    } else {
      pets = await petsQuery.skip(skip).limit(parseInt(limit));
    }

    // Get AI recommendations if premium user
    let aiRecommendations = [];
    if (user.premium.isActive && pets.length > 0) {
      try {
        aiRecommendations = await getAIRecommendations(user._id, pets.map(p => p._id));
      } catch (aiError) {
        logger.error('AI recommendations error', { error: aiError, userId: user._id });
      }
    }

    res.json({
      success: true,
      data: {
        pets,
        aiRecommendations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: pets.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Discover pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover pets',
      error: error.message
    });
  }
};

// @desc    Swipe on a pet
// @route   POST /api/pets/:petId/swipe
// @access  Private
const swipePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { action } = req.body; // 'like', 'pass', 'superlike'

    if (!['like', 'pass', 'superlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swipe action'
      });
    }

    const user = await User.findById(req.userId);
    const pet = await Pet.findById(petId).populate('owner');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if already swiped
    const alreadySwiped = user.swipedPets.find(swipe =>
      swipe.petId.toString() === petId
    );

    if (alreadySwiped) {
      return res.status(400).json({
        success: false,
        message: 'Already swiped on this pet'
      });
    }

    // Add swipe to user's record
    user.swipedPets.push({
      petId: petId,
      action: action
    });

    // Update analytics
    user.analytics.totalSwipes += 1;
    if (action === 'like' || action === 'superlike') {
      user.analytics.totalLikes += 1;
    }

    await user.save();

    // Update pet analytics
    await pet.updateAnalytics('view');
    if (action === 'like' || action === 'superlike') {
      await pet.updateAnalytics('like');
    }

    let isMatch = false;
    let matchId = null;
    let matchData = null;

    // Check for mutual match if it's a like/superlike
    if (action === 'like' || action === 'superlike') {
      const otherUser = await User.findById(pet.owner._id);
      const mutualLike = otherUser.swipedPets.find(swipe =>
        user.pets.some(userPetId =>
          userPetId.toString() === swipe.petId.toString() &&
          (swipe.action === 'like' || swipe.action === 'superlike')
        )
      );

      if (mutualLike) {
        // Create match
        const Match = require('../models/Match');

        // Find which of user's pets was liked
        const likedUserPet = user.pets.find(userPetId =>
          userPetId.toString() === mutualLike.petId.toString()
        );

        const match = new Match({
          pet1: likedUserPet,
          pet2: petId,
          user1: req.userId,
          user2: pet.owner._id,
          matchType: pet.intent === 'all' ? 'general' : pet.intent,
          compatibilityScore: 50 // Default score, will be updated below
        });

        await match.save();

        // Get real compatibility score from AI service
        try {
          const compatibilityData = await analyzePetCompatibility(likedUserPet, petId);
          if (compatibilityData && compatibilityData.compatibility_score) {
            match.compatibilityScore = compatibilityData.compatibility_score;
            match.aiRecommendationReason = compatibilityData.recommendation;
            await match.save();
          }
        } catch (aiError) {
          logger.error('AI compatibility score error', { error: aiError, petId: pet._id });
          // Continue without AI score if it fails
        }

        // Add match to both users
        await User.findByIdAndUpdate(pet.owner._id, {
          $push: { matches: match._id }
        });
        await User.findByIdAndUpdate(req.userId, {
          $push: { matches: match._id }
        });

        // Update analytics
        user.analytics.totalMatches += 1;
        otherUser.analytics.totalMatches += 1;
        await user.save();
        await otherUser.save();

        await pet.updateAnalytics('match');

        isMatch = true;
        matchId = match._id;

        // Populate the match with all necessary data to avoid API waterfall
        await match.populate('pet1 pet2');
        await match.populate('user1 user2', 'firstName lastName avatar bio premium.isActive');

        matchData = match;
      }
    }

    res.json({
      success: true,
      message: 'Swipe recorded successfully',
      data: {
        isMatch,
        matchId,
        action,
        // Include match data to avoid API waterfall on frontend
        match: matchData
      }
    });

  } catch (error) {
    console.error('Swipe pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record swipe',
      error: error.message
    });
  }
};

// @desc    Get user's pets
// @route   GET /api/pets/my-pets
// @access  Private
const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pets }
    });

  } catch (error) {
    console.error('Get my pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pets',
      error: error.message
    });
  }
};

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Private
const getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar bio premium.isActive');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Update view analytics if not the owner
    if (pet.owner._id.toString() !== req.userId.toString()) {
      await pet.updateAnalytics('view');
    }

    res.json({
      success: true,
      data: { pet }
    });

  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pet',
      error: error.message
    });
  }
};

const { sanitizeObject } = require('../utils/sanitize');

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'pets');
          pet.photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: pet.photos.length === 0
          });
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
        }
      }
    }

    // Sanitize input to prevent XSS
    const sanitizedBody = sanitizeObject(req.body);

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'personalityTags', 'intent', 'availability',
      'healthInfo', 'status', 'isActive'
    ];

    allowedUpdates.forEach(field => {
      if (sanitizedBody[field] !== undefined) {
        pet[field] = sanitizedBody[field];
      }
    });

    await pet.save();

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet }
    });

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet',
      error: error.message
    });
  }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    // Delete photos from Cloudinary
    for (let photo of pet.photos) {
      if (photo.publicId) {
        try {
          await deleteFromCloudinary(photo.publicId);
        } catch (deleteError) {
          logger.error('Photo deletion error', { error: deleteError, photoId: photo.publicId });
        }
      }
    }

    await Pet.findByIdAndDelete(req.params.id);

    // Remove pet from user's pets array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { pets: req.params.id }
    });

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet',
      error: error.message
    });
  }
};

// @desc    Get comprehensive pet profile with analytics
// @route   GET /api/pets/:id/complete
// @access  Private
const getCompletePetProfile = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar bio premium.isActive')
      .lean();

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user owns this pet or has access
    if (pet.owner._id.toString() !== req.userId && !pet.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Get analytics and stats
    const analytics = await pet.getAnalytics();
    const matches = await Match.find({
      $or: [{ pet1: pet._id }, { pet2: pet._id }],
      status: 'active'
    }).select('compatibilityScore createdAt');

    const stats = {
      totalViews: analytics?.views || 0,
      totalLikes: analytics?.likes || 0,
      totalMatches: matches.length,
      avgCompatibility: matches.length > 0 ?
        Math.round(matches.reduce((sum, m) => sum + (m.compatibilityScore || 0), 0) / matches.length) : 0,
      featured: pet.featured?.isFeatured || false,
      featuredExpires: pet.featured?.expiresAt,
      createdAt: pet.createdAt,
      lastActive: pet.lastActivity
    };

    // Get recent activity
    const recentActivity = await getPetRecentActivity(pet._id);

    res.json({
      success: true,
      data: {
        pet,
        stats,
        analytics,
        recentActivity,
        canEdit: pet.owner._id.toString() === req.userId,
        isOwner: pet.owner._id.toString() === req.userId
      }
    });

  } catch (error) {
    logger.error('Get complete pet profile error', { error, petId: req.params.id, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet profile'
    });
  }
};

// @desc    Create pet with advanced validation and AI enhancement
// @route   POST /api/pets/advanced
// @access  Private
const createPetAdvanced = async (req, res) => {
  try {
    const {
      name, species, breed, age, gender, size, weight, color,
      description, personalityTags, intent, availability,
      healthInfo, specialNeeds, medicalHistory, vaccinationStatus,
      behaviorNotes, trainingLevel, energyLevel, socialization
    } = req.body;

    // Advanced validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Pet name must be at least 2 characters'
      });
    }

    if (!['dog', 'cat', 'bird', 'rabbit', 'other'].includes(species)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pet species'
      });
    }

    // Check user's pet limit (premium feature)
    const user = await User.findById(req.userId);
    const existingPets = await Pet.countDocuments({ owner: req.userId, isActive: true });

    let maxPets = 3; // Basic limit
    if (user.premium?.isActive) {
      maxPets = user.premium.plan === 'ultimate' ? 10 : 5;
    }

    if (existingPets >= maxPets) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxPets} pets allowed. Upgrade to premium for more pets.`,
        upgradeRequired: !user.premium?.isActive
      });
    }

    // Handle photo uploads with validation
    let photos = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 photos allowed'
        });
      }

      for (const file of req.files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          return res.status(400).json({
            success: false,
            message: 'Each photo must be less than 5MB'
          });
        }

        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'pets');
          photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: photos.length === 0, // First photo is primary
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          logger.error('Pet photo upload error', { error: uploadError, userId: req.userId });
        }
      }
    }

    // AI-enhanced personality analysis (if description provided)
    let aiPersonalityTags = [];
    if (description && description.length > 20) {
      try {
        // This would call an AI service to analyze the description
        // For now, we'll use basic keyword extraction
        const keywords = ['friendly', 'playful', 'calm', 'energetic', 'shy', 'loyal', 'independent'];
        aiPersonalityTags = keywords.filter(keyword =>
          description.toLowerCase().includes(keyword)
        );
      } catch (aiError) {
        logger.warn('AI personality analysis failed', { error: aiError });
      }
    }

    const pet = new Pet({
      owner: req.userId,
      name: name.trim(),
      species,
      breed: breed?.trim(),
      age: parseInt(age),
      gender,
      size,
      weight: weight ? parseFloat(weight) : undefined,
      color: color || {},
      description: description?.trim(),
      personalityTags: [...new Set([...(personalityTags || []), ...aiPersonalityTags])],
      intent: intent || 'all',
      availability: availability || { isAvailable: true },
      healthInfo: healthInfo || {},
      specialNeeds: specialNeeds?.trim(),
      medicalHistory: medicalHistory || [],
      vaccinationStatus: vaccinationStatus || {},
      behaviorNotes: behaviorNotes?.trim(),
      trainingLevel: trainingLevel || 'unknown',
      energyLevel: energyLevel || 'moderate',
      socialization: socialization || 'good',
      photos,
      location: user.location || {
        type: 'Point',
        coordinates: [0, 0]
      },
      metadata: {
        createdVia: 'advanced_form',
        hasAIEnhancement: aiPersonalityTags.length > 0
      }
    });

    await pet.save();

    // Add pet to user's pets array
    await User.findByIdAndUpdate(req.userId, {
      $push: { pets: pet._id },
      $inc: { 'analytics.totalPetsCreated': 1 }
    });

    // Populate owner info for response
    await pet.populate('owner', 'firstName lastName avatar');

    logger.info(`Advanced pet created: ${pet._id}`, {
      userId: req.userId,
      species,
      hasPhotos: photos.length > 0,
      aiEnhanced: aiPersonalityTags.length > 0
    });

    res.status(201).json({
      success: true,
      message: 'Pet profile created successfully',
      data: { pet }
    });

  } catch (error) {
    logger.error('Create advanced pet error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to create pet profile'
    });
  }
};

// @desc    Update pet with advanced features
// @route   PUT /api/pets/:id/advanced
// @access  Private
const updatePetAdvanced = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    const {
      name, description, personalityTags, intent, availability,
      healthInfo, specialNeeds, behaviorNotes, trainingLevel,
      energyLevel, socialization, status
    } = req.body;

    // Update allowed fields with validation
    const updates = {};

    if (name && name.trim().length >= 2) {
      updates.name = name.trim();
    }

    if (description) {
      updates.description = description.trim();
      // Re-analyze personality if description changed significantly
      if (description.length > pet.description?.length + 20) {
        try {
          const keywords = ['friendly', 'playful', 'calm', 'energetic', 'shy', 'loyal', 'independent'];
          const aiTags = keywords.filter(keyword =>
            description.toLowerCase().includes(keyword)
          );
          updates.personalityTags = [...new Set([...(personalityTags || pet.personalityTags), ...aiTags])];
        } catch (aiError) {
          logger.warn('AI personality re-analysis failed', { error: aiError });
        }
      }
    }

    if (personalityTags) {
      updates.personalityTags = personalityTags;
    }

    if (intent) {
      updates.intent = intent;
    }

    if (availability) {
      updates.availability = availability;
    }

    if (healthInfo) {
      updates.healthInfo = healthInfo;
    }

    if (specialNeeds !== undefined) {
      updates.specialNeeds = specialNeeds?.trim();
    }

    if (behaviorNotes !== undefined) {
      updates.behaviorNotes = behaviorNotes?.trim();
    }

    if (trainingLevel) {
      updates.trainingLevel = trainingLevel;
    }

    if (energyLevel) {
      updates.energyLevel = energyLevel;
    }

    if (socialization) {
      updates.socialization = socialization;
    }

    if (status && ['active', 'inactive', 'adopted', 'passed'].includes(status)) {
      updates.status = status;
      updates.isActive = status === 'active';
    }

    // Handle new photo uploads
    if (req.files && req.files.length > 0) {
      const currentPhotoCount = pet.photos?.length || 0;
      if (currentPhotoCount + req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 photos allowed'
        });
      }

      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, 'pets');
          pet.photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          logger.error('Pet photo update error', { error: uploadError, petId: req.params.id });
        }
      }
    }

    // Apply updates
    Object.assign(pet, updates);
    pet.lastModified = new Date();
    await pet.save();

    logger.info(`Pet updated: ${req.params.id}`, {
      userId: req.userId,
      updates: Object.keys(updates)
    });

    res.json({
      success: true,
      message: 'Pet profile updated successfully',
      data: { pet }
    });

  } catch (error) {
    logger.error('Update advanced pet error', { error, petId: req.params.id, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update pet profile'
    });
  }
};

// @desc    Get pet analytics and insights
// @route   GET /api/pets/:id/analytics
// @access  Private
const getPetAnalytics = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    const analytics = await pet.getAnalytics();
    const matches = await Match.find({
      $or: [{ pet1: pet._id }, { pet2: pet._id }]
    }).select('compatibilityScore createdAt status');

    const insights = {
      profile: {
        completeness: calculatePetProfileCompleteness(pet),
        photoQuality: pet.photos?.length > 0 ? 'good' : 'needs_photos',
        descriptionLength: pet.description?.length || 0,
        personalityTags: pet.personalityTags?.length || 0
      },
      performance: {
        totalViews: analytics?.views || 0,
        totalLikes: analytics?.likes || 0,
        totalMatches: matches.length,
        avgCompatibility: matches.length > 0 ?
          Math.round(matches.reduce((sum, m) => sum + (m.compatibilityScore || 0), 0) / matches.length) : 0,
        matchRate: analytics?.views > 0 ? Math.round((matches.length / analytics.views) * 100) : 0
      },
      activity: {
        lastActive: pet.lastActivity,
        featured: pet.featured?.isFeatured || false,
        featuredViews: analytics?.featuredViews || 0,
        status: pet.status
      },
      recommendations: generatePetImprovementRecommendations(pet, analytics)
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    logger.error('Get pet analytics error', { error, petId: req.params.id, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet analytics'
    });
  }
};

// @desc    Duplicate pet profile (template feature)
// @route   POST /api/pets/:id/duplicate
// @access  Private
const duplicatePet = async (req, res) => {
  try {
    const originalPet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!originalPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    // Check pet limit
    const user = await User.findById(req.userId);
    const existingPets = await Pet.countDocuments({ owner: req.userId, isActive: true });
    const maxPets = user.premium?.isActive ?
      (user.premium.plan === 'ultimate' ? 10 : 5) : 3;

    if (existingPets >= maxPets) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxPets} pets allowed`,
        upgradeRequired: !user.premium?.isActive
      });
    }

    // Create duplicate with modifications
    const duplicateData = {
      ...originalPet.toObject(),
      _id: undefined,
      name: `${originalPet.name} (Copy)`,
      photos: [], // Don't duplicate photos
      isActive: true,
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      analytics: {
        views: 0,
        likes: 0,
        matches: 0,
        swipes: { likes: 0, passes: 0, superlikes: 0 }
      }
    };

    delete duplicateData._id;
    const duplicatePet = new Pet(duplicateData);
    await duplicatePet.save();

    // Add to user's pets
    await User.findByIdAndUpdate(req.userId, {
      $push: { pets: duplicatePet._id }
    });

    logger.info(`Pet duplicated: ${originalPet._id} -> ${duplicatePet._id}`, {
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Pet profile duplicated successfully',
      data: { pet: duplicatePet }
    });

  } catch (error) {
    logger.error('Duplicate pet error', { error, petId: req.params.id, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate pet profile'
    });
  }
};

// @desc    Archive/unarchive pet
// @route   PUT /api/pets/:id/archive
// @access  Private
const togglePetArchive = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or you are not the owner'
      });
    }

    const newArchivedStatus = !pet.isArchived;
    pet.isArchived = newArchivedStatus;
    pet.archivedAt = newArchivedStatus ? new Date() : null;
    pet.unarchivedAt = newArchivedStatus ? null : new Date();

    await pet.save();

    logger.info(`Pet ${newArchivedStatus ? 'archived' : 'unarchived'}: ${req.params.id}`, {
      userId: req.userId
    });

    res.json({
      success: true,
      message: `Pet ${newArchivedStatus ? 'archived' : 'unarchived'} successfully`,
      data: { pet }
    });

  } catch (error) {
    logger.error('Toggle pet archive error', { error, petId: req.params.id, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update pet archive status'
    });
  }
};

// Helper functions
function calculatePetProfileCompleteness(pet) {
  const fields = [
    'name', 'species', 'breed', 'age', 'gender', 'size',
    'description', 'personalityTags', 'photos'
  ];

  let completed = 0;
  fields.forEach(field => {
    if (pet[field]) {
      if (field === 'photos' && pet.photos.length > 0) {
        completed++;
      } else if (field === 'personalityTags' && pet.personalityTags.length > 0) {
        completed++;
      } else if (field !== 'photos' && field !== 'personalityTags') {
        completed++;
      }
    }
  });

  return Math.round((completed / fields.length) * 100);
}

async function getPetRecentActivity(petId) {
  const activities = [];

  // Recent matches
  const recentMatches = await Match.find({
    $or: [{ pet1: petId }, { pet2: petId }]
  })
  .sort({ createdAt: -1 })
  .limit(3)
  .select('compatibilityScore createdAt');

  recentMatches.forEach(match => {
    activities.push({
      type: 'match_created',
      description: `Found a match (${match.compatibilityScore}% compatibility)`,
      timestamp: match.createdAt
    });
  });

  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
}

function generatePetImprovementRecommendations(pet, analytics) {
  const recommendations = [];

  if ((analytics?.views || 0) < 10) {
    recommendations.push({
      type: 'visibility',
      priority: 'high',
      message: 'Consider upgrading to premium to boost your profile visibility',
      action: 'upgrade_premium'
    });
  }

  if (calculatePetProfileCompleteness(pet) < 70) {
    recommendations.push({
      type: 'completeness',
      priority: 'medium',
      message: 'Complete your pet profile to attract more matches',
      action: 'complete_profile'
    });
  }

  if (!pet.photos || pet.photos.length === 0) {
    recommendations.push({
      type: 'photos',
      priority: 'high',
      message: 'Add photos to make your profile more attractive',
      action: 'add_photos'
    });
  }

  if (!pet.description || pet.description.length < 50) {
    recommendations.push({
      type: 'description',
      priority: 'medium',
      message: 'Write a detailed description to showcase your pet\'s personality',
      action: 'improve_description'
    });
  }

  if (!pet.personalityTags || pet.personalityTags.length === 0) {
    recommendations.push({
      type: 'personality',
      priority: 'low',
      message: 'Add personality tags to help matching algorithms',
      action: 'add_personality_tags'
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

module.exports = {
  getCompletePetProfile,
  createPet,
  createPetAdvanced,
  discoverPets,
  swipePet,
  getMyPets,
  getPet,
  updatePet,
  updatePetAdvanced,
  getPetAnalytics,
  duplicatePet,
  togglePetArchive,
  deletePet
};