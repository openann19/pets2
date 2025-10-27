/**
 * Adoption Controller for PawfectMatch
 * Handles adoption listings, applications, and reviews
 */

import type { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import Pet from '../models/Pet';
import User from '../models/User';
import { AdoptionApplication } from '../models/AdoptionApplication';
const logger = require('../utils/logger');

// Type definitions
interface AuthRequest extends Request {
  user?: any;
  userId?: string;
}

interface ApplicationData {
  experience?: string;
  livingSituation?: string;
  otherPets?: string;
  timeAlone?: string;
  vetReference?: string;
  personalReference?: string;
  additionalInfo?: string;
}

/**
 * Get pet details for adoption
 * GET /api/adoption/pets/:petId
 */
export const getPetDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findById(petId)
      .populate('owner', 'firstName lastName email avatar')
      .lean();

    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
      return;
    }

    // Check if user has already applied
    let hasApplied = false;
    if (req.user) {
      const existingApplication = await AdoptionApplication.findOne({
        petId,
        applicantId: req.user._id || req.user.id
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

  } catch (error) {
    logger.error('Failed to get pet details', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get pet details',
      error: (error as Error).message
    });
  }
};

/**
 * Submit adoption application
 * POST /api/adoption/pets/:petId/apply
 */
export const submitApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;
    const applicantId = req.user!._id || req.user!.id;
    const applicationData: ApplicationData = req.body;

    // Check if pet exists and is available for adoption
    const pet = await Pet.findById(petId);
    if (!pet) {
      res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
      return;
    }

    if (!pet.availability?.isAvailable || pet.intent !== 'adoption') {
      res.status(400).json({
        success: false,
        message: 'Pet is not available for adoption'
      });
      return;
    }

    // Check if user already applied
    const existingApplication = await AdoptionApplication.findOne({
      petId,
      applicantId
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied for this pet'
      });
      return;
    }

    // Get ownerId from pet
    const ownerId = pet.owner;

    // Create application
    const application = await AdoptionApplication.create({
      petId,
      applicantId,
      ownerId,
      answers: applicationData,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });

  } catch (error) {
    logger.error('Failed to submit application', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: (error as Error).message
    });
  }
};

/**
 * Get user's adoption applications
 * GET /api/adoption/applications
 */
export const getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applicantId = req.user!._id || req.user!.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { applicantId };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const applications = await AdoptionApplication.find(query)
      .populate('petId', 'name species breed age photos')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await AdoptionApplication.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get user applications', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: (error as Error).message
    });
  }
};

/**
 * Get applications for pet owner
 * GET /api/adoption/pets/:petId/applications
 */
export const getPetApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;
    const ownerId = req.user!._id || req.user!.id;

    // Check if user owns the pet
    const pet = await Pet.findOne({ _id: petId, owner: ownerId });
    if (!pet) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this pet'
      });
      return;
    }

    const applications = await AdoptionApplication.find({ petId })
      .populate('applicantId', 'firstName lastName email avatar')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { applications }
    });

  } catch (error) {
    logger.error('Failed to get pet applications', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: (error as Error).message
    });
  }
};

/**
 * Update application status
 * PUT /api/adoption/applications/:applicationId
 */
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const { status, reviewNotes }: { status: string; reviewNotes?: string } = req.body;
    const reviewerId = req.user!._id || req.user!.id;

    const application = await AdoptionApplication.findById(applicationId)
      .populate('petId');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Check if user owns the pet
    const pet = application.petId as any;
    if (pet.owner.toString() !== reviewerId.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to review this application'
      });
      return;
    }

    // Update application
    application.status = status as 'pending' | 'approved' | 'rejected' | 'withdrawn';
    application.reviewedAt = new Date();
    application.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }

    await application.save();

    // If approved, mark pet as adopted
    if (status === 'approved') {
      await Pet.findByIdAndUpdate(pet._id, {
        'availability.isAvailable': false,
        adoptedBy: application.applicantId,
        adoptedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application }
    });

  } catch (error) {
    logger.error('Failed to update application status', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: (error as Error).message
    });
  }
};

/**
 * Get adoption statistics
 * GET /api/adoption/stats
 */
export const getAdoptionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id || req.user!.id;

    // Get stats for user's pets
    const userPets = await Pet.find({ owner: userId });

    const stats = {
      totalPetsListed: userPets.length,
      totalApplications: 0,
      approvedApplications: 0,
      pendingApplications: 0,
      rejectedApplications: 0
    };

    for (const pet of userPets) {
      const applications = await AdoptionApplication.find({ petId: pet._id });
      stats.totalApplications += applications.length;
      stats.approvedApplications += applications.filter(app => app.status === 'approved').length;
      stats.pendingApplications += applications.filter(app => app.status === 'pending').length;
      stats.rejectedApplications += applications.filter(app => app.status === 'rejected').length;
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    logger.error('Failed to get adoption stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: (error as Error).message
    });
  }
};

export default {
  getPetDetails,
  submitApplication,
  getUserApplications,
  getPetApplications,
  updateApplicationStatus,
  getAdoptionStats
};
