/**
 * Pet Controller for PawfectMatch
 * Handles pet creation, discovery, swiping, and management
 */

import type { Request, Response } from 'express';
import Pet from '../models/Pet';
import User from '../models/User';
import Match from '../models/Match';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';
import { getAIRecommendations, analyzePetCompatibility } from '../services/aiService';
const logger = require('../utils/logger');

// Type definitions for file uploads
interface MulterRequest extends Request {
  files?: Array<{
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }>;
}

interface CreatePetBody {
  name: string;
  species: string;
  breed: string;
  age: string | number;
  gender: string;
  size: string;
  weight?: string | number;
  color?: Record<string, string | number>;
  description: string;
  personalityTags: string[];
  intent: string;
  availability?: {
    isAvailable: boolean;
    [key: string]: string | number | boolean;
  };
  healthInfo?: Record<string, string | number | boolean>;
  specialNeeds?: string;
}

interface DiscoverPetsQuery {
  species?: string;
  intent?: string;
  maxDistance?: string | number;
  minAge?: string | number;
  maxAge?: string | number;
  size?: string;
  gender?: string;
  page?: string | number;
  limit?: string | number;
  breed?: string;
  personalityTags?: string;
}

interface SwipePetBody {
  action: 'like' | 'pass' | 'superlike';
}

interface UpdatePetBody extends Partial<CreatePetBody> {
  removePhotos?: string[];
}

interface PetPhoto {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private
export const createPet = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const {
      name, species, breed, age, gender, size, weight, color,
      description, personalityTags, intent, availability,
      healthInfo, specialNeeds
    }: CreatePetBody = req.body;

    // Handle photo uploads
    let photos: PetPhoto[] = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, { folder: 'pets' });
          photos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: photos.length === 0 // First photo is primary
          });
        } catch (uploadError) {
          logger.error('Photo upload error:', uploadError);
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
      age: parseInt(age.toString()),
      gender,
      size,
      weight: weight ? parseFloat(weight.toString()) : undefined,
      color: color || {},
      description,
      personalityTags: Array.isArray(personalityTags) ? personalityTags : [],
      intent,
      availability: availability || { isAvailable: true },
      healthInfo: healthInfo || {},
      specialNeeds: specialNeeds?.trim?.() || undefined,
      photos,
      location: user?.location || {
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
    logger.error('Create pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get all pets for discovery (with filters)
// @route   GET /api/pets/discover
// @access  Private
export const discoverPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      species,
      intent,
      maxDistance = 50,
      minAge,
      maxAge,
      size,
      gender,
      page = 1,
      limit = 20,
      breed,
      personalityTags
    }: DiscoverPetsQuery = req.query;

    // Get current user for location-based filtering
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Build query
    const query: {
      owner: { $ne: string };
      'availability.isAvailable': boolean;
      isActive: boolean;
      species?: string;
      intent?: string;
      age?: { $gte?: number; $lte?: number };
      size?: string;
      location?: {
        $near: {
          $geometry: { type: 'Point'; coordinates: [number, number] };
          $maxDistance: number;
        };
      };
    } = {
      owner: { $ne: req.userId }, // Exclude user's own pets
      'availability.isAvailable': true,
      isActive: true
    };

    // Add filters
    if (species) query.species = species;
    if (intent) query.intent = intent;
    if (size) query.size = size;
    if (gender) query.gender = gender;
    if (breed) query.breed = new RegExp(breed, 'i');
    if (personalityTags) {
      const tags = personalityTags.split(',').map((tag: string) => tag.trim());
      query.personalityTags = { $in: tags };
    }

    // Age range filter
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge.toString());
      if (maxAge) query.age.$lte = parseInt(maxAge.toString());
    }

    // Location-based filtering (if user has location)
    if (currentUser.location && currentUser.location.coordinates) {
      const maxDistanceMeters = parseInt(maxDistance.toString()) * 1000; // Convert km to meters
      query.location = {
        $near: {
          $geometry: currentUser.location,
          $maxDistance: maxDistanceMeters
        }
      };
    }

    // Get user's already swiped pets to exclude them
    const userSwipes = await Match.find({
      $or: [
        { 'pet1.owner': req.userId },
        { 'pet2.owner': req.userId }
      ]
    }).distinct('pet1._id pet2._id');

    // Exclude already swiped pets
    const swipedPetIds = userSwipes.filter((id: { toString: () => string }) => id.toString() !== req.userId);
    if (swipedPetIds.length > 0) {
      query._id = { $nin: swipedPetIds };
    }

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const pets = await Pet.find(query)
      .populate('owner', 'firstName lastName avatar bio premium.isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Pet.countDocuments(query);

    res.json({
      success: true,
      data: {
        pets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    logger.error('Discover pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to discover pets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Swipe on a pet
// @route   POST /api/pets/:petId/swipe
// @access  Private
export const swipePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;
    const { action }: SwipePetBody = req.body; // 'like', 'pass', 'superlike'

    // Get the target pet
    const targetPet = await Pet.findById(petId).populate('owner');
    if (!targetPet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
      return;
    }

    // Get current user's active pet (for simplicity, using first pet)
    const currentUser = await User.findById(req.userId).populate('pets');
    if (!currentUser || !currentUser.pets || currentUser.pets.length === 0) {
      res.status(400).json({
        success: false,
        message: 'You need to have a pet to swipe'
      });
      return;
    }

    const currentPet = currentUser.pets[0]; // Using first pet for swiping

    // Check if already swiped
    const existingMatch = await Match.findOne({
      $or: [
        { 'pet1._id': currentPet._id, 'pet2._id': targetPet._id },
        { 'pet1._id': targetPet._id, 'pet2._id': currentPet._id }
      ]
    });

    if (existingMatch) {
      res.status(400).json({
        success: false,
        message: 'Already swiped on this pet'
      });
      return;
    }

    // Create match record
    const match = new Match({
      pet1: {
        _id: currentPet._id,
        owner: req.userId,
        name: currentPet.name,
        photos: currentPet.photos
      },
      pet2: {
        _id: targetPet._id,
        owner: targetPet.owner._id,
        name: targetPet.name,
        photos: targetPet.photos
      },
      pet1Action: action,
      pet2Action: null, // Will be set when they swipe back
      isMatch: false,
      createdAt: new Date()
    });

    await match.save();

    // Check if the other user already liked this pet
    const reciprocalMatch = await Match.findOne({
      'pet1._id': targetPet._id,
      'pet2._id': currentPet._id,
      pet1Action: { $in: ['like', 'superlike'] }
    });

    let isMatch = false;
    if (reciprocalMatch && (action === 'like' || action === 'superlike')) {
      // It's a match!
      isMatch = true;
      match.isMatch = true;
      match.matchedAt = new Date();
      await match.save();

      // Update the reciprocal match as well
      reciprocalMatch.pet2Action = action;
      reciprocalMatch.isMatch = true;
      reciprocalMatch.matchedAt = new Date();
      await reciprocalMatch.save();
    }

    // Update analytics
    if (action === 'like') {
      await Pet.findByIdAndUpdate(targetPet._id, { $inc: { 'analytics.likes': 1 } });
      await Pet.findByIdAndUpdate(currentPet._id, { $inc: { 'analytics.likesGiven': 1 } });
    } else if (action === 'superlike') {
      await Pet.findByIdAndUpdate(targetPet._id, { $inc: { 'analytics.superLikes': 1 } });
      await Pet.findByIdAndUpdate(currentPet._id, { $inc: { 'analytics.superLikesGiven': 1 } });
    }

    if (isMatch) {
      await Pet.findByIdAndUpdate(targetPet._id, { $inc: { 'analytics.matches': 1 } });
      await Pet.findByIdAndUpdate(currentPet._id, { $inc: { 'analytics.matches': 1 } });
    }

    res.json({
      success: true,
      message: isMatch ? 'It\'s a match!' : 'Swipe recorded',
      data: {
        action,
        isMatch,
        match: isMatch ? match : null
      }
    });

  } catch (error) {
    logger.error('Swipe pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to swipe',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get user's pets
// @route   GET /api/pets/my-pets
// @access  Private
export const getMyPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const pets = await Pet.find({ owner: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pets }
    });

  } catch (error) {
    logger.error('Get my pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Private
export const getPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('owner', 'firstName lastName avatar bio premium.isActive');

    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
      return;
    }

    // Increment view count
    await Pet.findByIdAndUpdate(req.params.id, {
      $inc: { 'analytics.views': 1 },
      $set: { 'analytics.lastViewed': new Date() }
    });

    res.json({
      success: true,
      data: { pet }
    });

  } catch (error) {
    logger.error('Get pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
export const updatePet = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found or unauthorized'
      });
      return;
    }

    const {
      name, species, breed, age, gender, size, weight, color,
      description, personalityTags, intent, availability,
      healthInfo, specialNeeds, removePhotos
    }: UpdatePetBody = req.body;

    // Handle photo uploads
    let newPhotos: PetPhoto[] = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.buffer, { folder: 'pets' });
          newPhotos.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: false
          });
        } catch (uploadError) {
          logger.error('Photo upload error:', uploadError);
        }
      }
    }

    // Remove photos if specified
    if (removePhotos && removePhotos.length > 0) {
      for (let publicId of removePhotos) {
        try {
          await deleteFromCloudinary(publicId);
          pet.photos = pet.photos.filter((photo: { publicId: string }) => photo.publicId !== publicId);
        } catch (deleteError) {
          logger.error('Photo delete error:', deleteError);
        }
      }
    }

    // Update fields
    if (name !== undefined) pet.name = name;
    if (species !== undefined) pet.species = species;
    if (breed !== undefined) pet.breed = breed;
    if (age !== undefined) pet.age = parseInt(age.toString());
    if (gender !== undefined) pet.gender = gender;
    if (size !== undefined) pet.size = size;
    if (weight !== undefined) pet.weight = parseFloat(weight.toString());
    if (color !== undefined) pet.color = color;
    if (description !== undefined) pet.description = description;
    if (personalityTags !== undefined) pet.personalityTags = personalityTags;
    if (intent !== undefined) pet.intent = intent;
    if (availability !== undefined) pet.availability = availability;
    if (healthInfo !== undefined) pet.healthInfo = healthInfo;
    if (specialNeeds !== undefined) pet.specialNeeds = specialNeeds;

    // Add new photos
    if (newPhotos.length > 0) {
      pet.photos.push(...newPhotos);
    }

    pet.updatedAt = new Date();
    await pet.save();

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet }
    });

  } catch (error) {
    logger.error('Update pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private
export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });

    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found or unauthorized'
      });
      return;
    }

    // Delete photos from Cloudinary
    for (let photo of pet.photos) {
      try {
        await deleteFromCloudinary(photo.publicId);
      } catch (deleteError) {
        logger.error('Photo delete error:', deleteError);
      }
    }

    // Remove pet from user's pets array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { pets: pet._id }
    });

    // Delete the pet
    await Pet.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });

  } catch (error) {
    logger.error('Delete pet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export all functions
export default {
  createPet,
  discoverPets,
  swipePet,
  getMyPets,
  getPet,
  updatePet,
  deletePet
};
