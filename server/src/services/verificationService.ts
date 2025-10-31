/**
 * Verification Service - Multi-Tier Trust System
 * 
 * Implements verification tiers (0-4) as per blueprint:
 * - Tier 0: Basic account (email + phone OTP)
 * - Tier 1: Identity verification (ID + selfie liveness)
 * - Tier 2: Pet ownership verification (registration, microchip, adoption docs)
 * - Tier 3: Veterinary verification (vaccination, health certificates)
 * - Tier 4: Organization verification (breeder/shelter/rescue)
 */

import mongoose from 'mongoose';
import Verification from '../models/Verification';
import User from '../models/User';
import Pet from '../models/Pet';
import sharp from 'sharp';
import logger from '../utils/logger';

export type VerificationTier = 'tier0' | 'tier1' | 'tier2' | 'tier3' | 'tier4';

export interface TierRequirements {
  tier0: {
    email: boolean;
    phoneOtp: boolean;
    deviceRiskSignals: boolean;
    termsAccepted: boolean;
  };
  tier1: {
    idDocument: 'passport' | 'drivers_license' | 'national_id';
    selfieLiveness: boolean;
    personalInfo: {
      legalName: string;
      dateOfBirth: Date;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    consentToDataProcessing: boolean;
  };
  tier2: {
    primaryProof: {
      type: 'registration' | 'microchip' | 'adoption_contract' | 'vaccination_booklet' | 'vet_invoice';
      documentUrl: string;
    };
    secondaryProof: {
      type: 'selfie_with_pet' | 'home_photo' | 'microchip_number';
      documentUrl?: string;
      microchipNumber?: string;
    };
    petInfo: {
      petId: string;
      petName: string;
      species: string;
      breed?: string;
    };
  };
  tier3: {
    veterinaryDocuments: {
      vaccinationRecord: string;
      spayNeuterProof?: string;
      healthCertificate?: string;
    };
    vetClinicInfo: {
      name: string;
      city: string;
      state?: string;
      country: string;
    };
    piiRedacted: boolean; // Personal info removed from docs
  };
  tier4: {
    organizationType: 'breeder' | 'shelter' | 'rescue';
    documents: {
      licenseOrRegistration: string;
      businessRegistration?: string;
      website?: string;
    };
    selfieAtFacility?: string;
    publicListingUrl?: string; // For shelters/rescues
  };
}

export interface VerificationStatus {
  tier: VerificationTier;
  verified: boolean;
  badges: string[];
  requirements: Partial<TierRequirements>;
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
}

/**
 * Get user's current verification status
 */
export async function getUserVerificationStatus(userId: string): Promise<VerificationStatus> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const verification = await Verification.findOne({ userId });
    
    const badges: string[] = [];
    let tier: VerificationTier = 'tier0';

    // Tier 0 checks
    const hasEmail = !!user.email;
    const hasPhone = !!user.phone;
    const isTier0 = hasEmail && hasPhone;

    // Tier 1 checks
    if (verification && verification.type === 'identity' && verification.status === 'approved') {
      tier = 'tier1';
      badges.push('ID Verified');
    }

    // Tier 2 checks
    if (verification && verification.type === 'pet_ownership' && verification.status === 'approved') {
      tier = 'tier2';
      badges.push('Pet Owner Verified');
    }

    // Tier 3 checks
    if (verification && verification.type === 'veterinary' && verification.status === 'approved') {
      tier = 'tier3';
      badges.push('Vet Verified');
    }

    // Tier 4 checks
    if (verification && verification.type === 'rescue_organization' && verification.status === 'approved') {
      tier = 'tier4';
      badges.push('Shelter Verified');
    }

    return {
      tier,
      verified: verification?.status === 'approved',
      badges,
      requirements: {},
      status: verification?.status || 'not_started',
      rejectionReason: verification?.rejectionReason,
      submittedAt: verification?.submittedAt,
      reviewedAt: verification?.reviewedAt,
    };
  } catch (error) {
    logger.error('Error getting verification status:', error);
    throw error;
  }
}

/**
 * Submit Tier 1: Identity Verification
 */
export async function submitIdentityVerification(
  userId: string,
  requirements: TierRequirements['tier1']
): Promise<any> {
  try {
    // Validate input
    if (!requirements.idDocument) {
      throw new Error('ID document type is required');
    }
    if (!requirements.selfieLiveness) {
      throw new Error('Selfie liveness verification is required');
    }
    if (!requirements.personalInfo.legalName || !requirements.personalInfo.dateOfBirth) {
      throw new Error('Personal information is incomplete');
    }

    // Check for existing verification
    const existing = await Verification.findOne({
      userId,
      type: 'identity',
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      throw new Error('Identity verification already exists');
    }

    // Create verification record
    const verification = new Verification({
      userId,
      type: 'identity',
      status: 'pending',
      personalInfo: {
        firstName: requirements.personalInfo.legalName.split(' ')[0],
        lastName: requirements.personalInfo.legalName.split(' ').slice(1).join(' '),
        dateOfBirth: requirements.personalInfo.dateOfBirth,
        address: requirements.personalInfo.address,
      },
      submittedAt: new Date(),
    });

    await verification.save();

    logger.info('Identity verification submitted', {
      userId,
      verificationId: verification._id,
    });

    return verification;
  } catch (error) {
    logger.error('Error submitting identity verification:', error);
    throw error;
  }
}

/**
 * Submit Tier 2: Pet Ownership Verification
 */
export async function submitPetOwnershipVerification(
  userId: string,
  requirements: TierRequirements['tier2']
): Promise<any> {
  try {
    // Validate input
    if (!requirements.primaryProof.documentUrl) {
      throw new Error('Primary proof document is required');
    }
    if (!requirements.petInfo.petId || !requirements.petInfo.petName) {
      throw new Error('Pet information is incomplete');
    }

    // Verify pet belongs to user
    const pet = await Pet.findOne({
      _id: requirements.petInfo.petId,
      owner: userId,
    });

    if (!pet) {
      throw new Error('Pet not found or does not belong to user');
    }

    // Check for existing verification
    const existing = await Verification.findOne({
      userId,
      type: 'pet_ownership',
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      throw new Error('Pet ownership verification already exists');
    }

    // Create verification record
    const verification = new Verification({
      userId,
      type: 'pet_ownership',
      status: 'pending',
      petInfo: {
        petId: new mongoose.Types.ObjectId(requirements.petInfo.petId),
        petName: requirements.petInfo.petName,
        species: requirements.petInfo.species,
        breed: requirements.petInfo.breed,
        microchipNumber: requirements.secondaryProof.microchipNumber,
      },
      submittedAt: new Date(),
    });

    await verification.save();

    logger.info('Pet ownership verification submitted', {
      userId,
      petId: requirements.petInfo.petId,
      verificationId: verification._id,
    });

    return verification;
  } catch (error) {
    logger.error('Error submitting pet ownership verification:', error);
    throw error;
  }
}

/**
 * Submit Tier 3: Veterinary Verification
 */
export async function submitVeterinaryVerification(
  userId: string,
  requirements: TierRequirements['tier3']
): Promise<any> {
  try {
    // Validate input
    if (!requirements.veterinaryDocuments.vaccinationRecord) {
      throw new Error('Vaccination record is required');
    }

    // Check for existing verification
    const existing = await Verification.findOne({
      userId,
      type: 'veterinary',
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      throw new Error('Veterinary verification already exists');
    }

    // Create verification record
    const verification = new Verification({
      userId,
      type: 'veterinary',
      status: 'pending',
      submittedAt: new Date(),
    });

    await verification.save();

    logger.info('Veterinary verification submitted', {
      userId,
      verificationId: verification._id,
    });

    return verification;
  } catch (error) {
    logger.error('Error submitting veterinary verification:', error);
    throw error;
  }
}

/**
 * Submit Tier 4: Organization Verification
 */
export async function submitOrganizationVerification(
  userId: string,
  requirements: TierRequirements['tier4']
): Promise<any> {
  try {
    // Validate input
    if (!requirements.documents.licenseOrRegistration) {
      throw new Error('License or registration document is required');
    }

    // Check for existing verification
    const existing = await Verification.findOne({
      userId,
      type: 'rescue_organization',
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      throw new Error('Organization verification already exists');
    }

    // Create verification record
    const verification = new Verification({
      userId,
      type: 'rescue_organization',
      status: 'pending',
      organizationInfo: {
        registrationNumber: requirements.documents.licenseOrRegistration.split('/').pop() || '',
        contactPerson: '', // To be filled by admin
        email: '', // To be filled by user or admin
        website: requirements.documents.website,
      },
      submittedAt: new Date(),
    });

    await verification.save();

    logger.info('Organization verification submitted', {
      userId,
      organizationType: requirements.organizationType,
      verificationId: verification._id,
    });

    return verification;
  } catch (error) {
    logger.error('Error submitting organization verification:', error);
    throw error;
  }
}

/**
 * Admin: Approve verification
 */
export async function approveVerification(
  verificationId: string,
  adminId: string,
  notes?: string
): Promise<any> {
  try {
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.status === 'approved') {
      throw new Error('Verification already approved');
    }

    verification.status = 'approved';
    verification.approvedAt = new Date();
    verification.approvedBy = new mongoose.Types.ObjectId(adminId);
    if (notes) {
      verification.approvalNotes = notes;
    }

    await verification.save();

    logger.info('Verification approved', {
      verificationId,
      adminId,
      type: verification.type,
    });

    return verification;
  } catch (error) {
    logger.error('Error approving verification:', error);
    throw error;
  }
}

/**
 * Admin: Reject verification
 */
export async function rejectVerification(
  verificationId: string,
  adminId: string,
  reason: string,
  notes?: string
): Promise<any> {
  try {
    const verification = await Verification.findById(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.status === 'rejected') {
      throw new Error('Verification already rejected');
    }

    verification.status = 'rejected';
    verification.rejectedAt = new Date();
    verification.rejectedBy = new mongoose.Types.ObjectId(adminId);
    verification.rejectionReason = reason;
    if (notes) {
      verification.rejectionNotes = notes;
    }

    await verification.save();

    logger.info('Verification rejected', {
      verificationId,
      adminId,
      type: verification.type,
      reason,
    });

    return verification;
  } catch (error) {
    logger.error('Error rejecting verification:', error);
    throw error;
  }
}

/**
 * Get all user badges
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const status = await getUserVerificationStatus(userId);
    return status.badges;
  } catch (error) {
    logger.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Check if user has required tier
 */
export async function hasTier(
  userId: string,
  requiredTier: VerificationTier
): Promise<boolean> {
  try {
    const status = await getUserVerificationStatus(userId);
    
    const tierOrder: VerificationTier[] = ['tier0', 'tier1', 'tier2', 'tier3', 'tier4'];
    const currentIndex = tierOrder.indexOf(status.tier);
    const requiredIndex = tierOrder.indexOf(requiredTier);

    return currentIndex >= requiredIndex;
  } catch (error) {
    logger.error('Error checking tier:', error);
    return false;
  }
}

/**
 * Get verification requirements for a tier
 */
export function getTierRequirements(tier: VerificationTier): string[] {
  switch (tier) {
    case 'tier0':
      return ['Email verified', 'Phone OTP verified', 'Terms accepted'];
    case 'tier1':
      return ['ID document uploaded', 'Selfie liveness check passed', 'Personal info provided'];
    case 'tier2':
      return ['Primary ownership proof (registration/microchip/adoption)', 'Secondary proof (selfie with pet or home photo)', 'Pet info provided'];
    case 'tier3':
      return ['Vaccination record uploaded', 'Spay/neuter proof (optional)', 'Health certificate (optional)', 'Vet clinic info provided'];
    case 'tier4':
      return ['License or registration document', 'Business registration (for breeders)', 'Selfie at facility (optional)', 'Public listing URL (for shelters/rescues)'];
    default:
      return [];
  }
}

