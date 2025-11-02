/**
 * Adoption Controller
 * Handles adoption listings, applications, and reviews
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Pet } from '../models/Pet';
import { User } from '../models/User';
import logger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Define AdoptionApplication schema inline if model doesn't exist
let AdoptionApplication;
try {
  AdoptionApplication = require('../models/AdoptionApplication');
} catch {
  // Create a simple in-memory model if not exists
  const adoptionApplicationSchema = new mongoose.Schema({
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    applicationData: {
      experience: String,
      livingSituation: String,
      otherPets: String,
      timeAlone: String,
      vetReference: String,
      personalReference: String,
      additionalInfo: String
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: String
  });

  AdoptionApplication = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
}

/**
 * Get pet details for adoption
 */
export const getPetDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findById(petId)
      .populate('owner', 'firstName lastName email avatar')
      .lean();

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    // Check if user has already applied
    let hasApplied = false;
    if (req.user) {
      const existingApplication = await AdoptionApplication.findOne({
        petId,
        applicantId: req.user.id
      });
      hasApplied = !!existingApplication;
    }

    res.json({
      success: true,
      data: {
        ...pet,
        hasApplied
      }
    });
  } catch (error: any) {
    logger.error('Failed to get pet details', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet details',
      error: error.message
    });
  }
};

/**
 * Submit adoption application
 */
export const submitApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { petId } = req.params;
    const applicantId = req.user?.id;
    
    if (!applicantId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const applicationData = req.body;

    // Check if pet exists and is available for adoption
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (pet.intent !== 'adoption') {
      return res.status(400).json({
        success: false,
        message: 'This pet is not available for adoption'
      });
    }

    // Check if user already applied
    const existingApplication = await AdoptionApplication.findOne({
      petId,
      applicantId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this pet'
      });
    }

    // Create new application
    const application = new AdoptionApplication({
      petId,
      applicantId,
      applicationData,
      status: 'pending'
    });

    await application.save();

    logger.info('Adoption application submitted', { petId, applicantId });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error: any) {
    logger.error('Failed to submit application', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

/**
 * Review adoption application (for pet owners)
 */
export const reviewApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const application = await AdoptionApplication.findById(applicationId)
      .populate('petId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the reviewer owns the pet
    // @ts-ignore - petId might be populated
    if (application.petId.owner.toString() !== reviewerId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this application'
      });
    }

    // Update application
    application.status = status;
    application.reviewNotes = notes;
    application.reviewedAt = new Date();
    application.reviewedBy = reviewerId;

    await application.save();

    logger.info('Adoption application reviewed', { applicationId, status, reviewerId });

    res.json({
      success: true,
      data: application,
      message: 'Application reviewed successfully'
    });
  } catch (error: any) {
    logger.error('Failed to review application', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to review application',
      error: error.message
    });
  }
};

/**
 * Create adoption listing
 */
export const createListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const listingData = {
      ...req.body,
      owner: userId,
      intent: 'adoption',
      isActive: true
    };

    const pet = new Pet(listingData);
    await pet.save();

    // Add pet to user's pets array
    await User.findByIdAndUpdate(userId, {
      $push: { pets: pet._id }
    });

    logger.info('Adoption listing created', { petId: pet._id, userId });

    res.status(201).json({
      success: true,
      data: pet,
      message: 'Adoption listing created successfully'
    });
  } catch (error: any) {
    logger.error('Failed to create adoption listing', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create adoption listing',
      error: error.message
    });
  }
};

/**
 * Get user's adoption applications
 */
export const getMyApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicantId = req.user?.id;

    if (!applicantId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const applications = await AdoptionApplication.find({ applicantId })
      .populate('petId', 'name breed species photos')
      .sort({ submittedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    logger.error('Failed to get applications', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: error.message
    });
  }
};

/**
 * Get single adoption application by ID
 */
export const getApplicationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const application = await AdoptionApplication.findById(applicationId)
      .populate('petId', 'name breed species photos')
      .populate('applicantId', 'firstName lastName email avatar phone address');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the user has access to this application (either applicant or pet owner)
    const pet = await Pet.findById((application.petId as any)._id);
    // @ts-ignore
    if (pet?.owner.toString() !== userId && (application.applicantId as any)._id?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error: any) {
    logger.error('Failed to get application', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get application',
      error: error.message
    });
  }
};

/**
 * Get applications for user's pets (for pet owners)
 */
export const getApplicationsForMyPets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find all user's pets
    const userPets = await Pet.find({ owner: userId }).select('_id');
    const petIds = userPets.map(pet => pet._id);

    // Find all applications for these pets
    const applications = await AdoptionApplication.find({
      petId: { $in: petIds }
    })
      .populate('petId', 'name breed species photos')
      .populate('applicantId', 'firstName lastName email avatar')
      .sort({ submittedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: applications
    });
  } catch (error: any) {
    logger.error('Failed to get applications for pets', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: error.message
    });
  }
};

export default {
  getPetDetails,
  submitApplication,
  reviewApplication,
  createListing,
  getMyApplications,
  getApplicationById,
  getApplicationsForMyPets
};