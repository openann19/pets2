/**
 * Verification Service - Mobile Client
 * 
 * Handles all verification-related API calls and state management
 * for user verification tier progression.
 */

import { request } from './api';
import { logger } from './logger';

export interface VerificationRequirements {
  [key: string]: unknown;
}

export interface VerificationStatus {
  tier: 'tier0' | 'tier1' | 'tier2' | 'tier3' | 'tier4';
  verified: boolean;
  badges: string[];
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  requirements?: VerificationRequirements;
}

export interface IdentityVerificationData {
  idDocument: {
    front: string;
    back?: string;
  };
  selfie: string;
  personalInfo: {
    legalName: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
  };
  consentToDataProcessing: boolean;
}

export interface PetOwnershipVerificationData {
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
}

export interface VeterinaryVerificationData {
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
  piiRedacted: boolean;
}

export interface OrganizationVerificationData {
  organizationType: 'breeder' | 'shelter' | 'rescue';
  documents: {
    licenseOrRegistration: string;
    businessRegistration?: string;
    website?: string;
  };
  selfieAtFacility?: string;
  publicListingUrl?: string;
}

class VerificationService {
  /**
   * Get user's current verification status
   */
  async getStatus(): Promise<VerificationStatus> {
    try {
      return await request<VerificationStatus>('/verification/status', { method: 'GET' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error getting verification status', { error: errorMessage });
      throw errorMessage;
    }
  }

  /**
   * Submit Tier 1: Identity Verification
   */
  async submitIdentityVerification(data: IdentityVerificationData): Promise<VerificationStatus> {
    try {
      return await request<VerificationStatus>('/verification/identity', { method: 'POST', body: data });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error submitting identity verification', { error: errorMessage });
      throw errorMessage;
    }
  }

  /**
   * Submit Tier 2: Pet Ownership Verification
   */
  async submitPetOwnershipVerification(
    data: PetOwnershipVerificationData
  ): Promise<VerificationStatus> {
    try {
      return await request<VerificationStatus>('/verification/pet-ownership', { method: 'POST', body: data });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error submitting pet ownership verification', { error: errorMessage });
      throw errorMessage;
    }
  }

  /**
   * Submit Tier 3: Veterinary Verification
   */
  async submitVeterinaryVerification(
    data: VeterinaryVerificationData
  ): Promise<VerificationStatus> {
    try {
      return await request<VerificationStatus>('/verification/veterinary', { method: 'POST', body: data });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error submitting veterinary verification', { error: errorMessage });
      throw errorMessage;
    }
  }

  /**
   * Submit Tier 4: Organization Verification
   */
  async submitOrganizationVerification(
    data: OrganizationVerificationData
  ): Promise<VerificationStatus> {
    try {
      return await request<VerificationStatus>('/verification/organization', { method: 'POST', body: data });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error submitting organization verification', { error: errorMessage });
      throw errorMessage;
    }
  }

  /**
   * Get verification requirements for a specific tier
   */
  async getRequirements(tier: string): Promise<string[]> {
    try {
      const response = await request<{ requirements: string[] }>(`/verification/requirements/${tier}`, { method: 'GET' });
      return response.requirements;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error getting requirements', { error: errorMessage, tier });
      throw errorMessage;
    }
  }

  /**
   * Cancel pending verification
   */
  async cancelVerification(verificationId: string): Promise<void> {
    try {
      await request(`/verification/${verificationId}/cancel`, { method: 'POST' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error canceling verification', { error: errorMessage, verificationId });
      throw errorMessage;
    }
  }

  /**
   * Get user badges
   */
  async getBadges(): Promise<string[]> {
    try {
      const response = await request<{ badges: string[] }>('/verification/badges', { method: 'GET' });
      return response.badges;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error getting badges', { error: errorMessage });
      throw errorMessage;
    }
  }

  /**
   * Check if user has required tier
   */
  async hasTier(requiredTier: string): Promise<boolean> {
    try {
      const response = await request<{ hasTier: boolean }>(`/verification/has-tier/${requiredTier}`, { method: 'GET' });
      return response.hasTier;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error checking tier', { error: errorMessage, requiredTier });
      throw errorMessage;
    }
  }

  /**
   * Upload verification document
   */
  async uploadDocument(
    fileUri: string,
    documentType: string,
    verificationType?: string
  ): Promise<string> {
    if (!fileUri || fileUri.trim() === '') {
      throw new Error('Empty file');
    }

    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      // In React Native, you'd use expo-file-system or similar
      // formData.append('file', {
      //   uri: fileUri,
      //   name: 'document.jpg',
      //   type: 'image/jpeg',
      // });

      const response = await request<{ url: string }>('/verification/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          documentType,
          verificationType,
        },
      });

      return response.url;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error uploading document', { error: errorMessage, documentType, verificationType });
      throw errorMessage;
    }
  }

  /**
   * Request verification review status update
   */
  async requestStatusUpdate(): Promise<void> {
    try {
      await request('/verification/request-update', { method: 'POST' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      logger.error('Error requesting status update', { error: errorMessage });
      throw errorMessage;
    }
  }
}

export const verificationService = new VerificationService();

