/**
 * Verification Service - Mobile Client
 * 
 * Handles all verification-related API calls and state management
 * for user verification tier progression.
 */

import { api } from './api';

export interface VerificationStatus {
  tier: 'tier0' | 'tier1' | 'tier2' | 'tier3' | 'tier4';
  verified: boolean;
  badges: string[];
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  requirements?: Record<string, any>;
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
      const response = await api.get('/verification/status');
      return response.data;
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw error;
    }
  }

  /**
   * Submit Tier 1: Identity Verification
   */
  async submitIdentityVerification(data: IdentityVerificationData): Promise<VerificationStatus> {
    try {
      const response = await api.post('/verification/identity', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting identity verification:', error);
      throw error;
    }
  }

  /**
   * Submit Tier 2: Pet Ownership Verification
   */
  async submitPetOwnershipVerification(
    data: PetOwnershipVerificationData
  ): Promise<VerificationStatus> {
    try {
      const response = await api.post('/verification/pet-ownership', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting pet ownership verification:', error);
      throw error;
    }
  }

  /**
   * Submit Tier 3: Veterinary Verification
   */
  async submitVeterinaryVerification(
    data: VeterinaryVerificationData
  ): Promise<VerificationStatus> {
    try {
      const response = await api.post('/verification/veterinary', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting veterinary verification:', error);
      throw error;
    }
  }

  /**
   * Submit Tier 4: Organization Verification
   */
  async submitOrganizationVerification(
    data: OrganizationVerificationData
  ): Promise<VerificationStatus> {
    try {
      const response = await api.post('/verification/organization', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting organization verification:', error);
      throw error;
    }
  }

  /**
   * Get verification requirements for a specific tier
   */
  async getRequirements(tier: string): Promise<string[]> {
    try {
      const response = await api.get(`/verification/requirements/${tier}`);
      return response.data.requirements;
    } catch (error) {
      console.error('Error getting requirements:', error);
      throw error;
    }
  }

  /**
   * Cancel pending verification
   */
  async cancelVerification(verificationId: string): Promise<void> {
    try {
      await api.post(`/verification/${verificationId}/cancel`);
    } catch (error) {
      console.error('Error canceling verification:', error);
      throw error;
    }
  }

  /**
   * Get user badges
   */
  async getBadges(): Promise<string[]> {
    try {
      const response = await api.get('/verification/badges');
      return response.data.badges;
    } catch (error) {
      console.error('Error getting badges:', error);
      throw error;
    }
  }

  /**
   * Check if user has required tier
   */
  async hasTier(requiredTier: string): Promise<boolean> {
    try {
      const response = await api.get(`/verification/has-tier/${requiredTier}`);
      return response.data.hasTier;
    } catch (error) {
      console.error('Error checking tier:', error);
      throw error;
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
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      // In React Native, you'd use expo-file-system or similar
      // formData.append('file', {
      //   uri: fileUri,
      //   name: 'document.jpg',
      //   type: 'image/jpeg',
      // });

      const response = await api.post('/verification/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          documentType,
          verificationType,
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Request verification review status update
   */
  async requestStatusUpdate(): Promise<void> {
    try {
      await api.post('/verification/request-update');
    } catch (error) {
      console.error('Error requesting status update:', error);
      throw error;
    }
  }
}

export const verificationService = new VerificationService();

