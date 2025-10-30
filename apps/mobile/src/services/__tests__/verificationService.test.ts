/**
 * Comprehensive tests for VerificationService
 *
 * Coverage:
 * - Verification status retrieval and management
 * - Multi-tier verification submission (Identity, Pet Ownership, Veterinary, Organization)
 * - Document upload functionality
 * - Badge and tier checking
 * - Requirements fetching
 * - Verification cancellation
 * - Status updates and error handling
 * - Data validation and edge cases
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { verificationService } from '../verificationService';

// Mock the API service
jest.mock('../api', () => ({
  request: jest.fn(),
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock form-data module
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(() => ({
    append: jest.fn(),
  }));
});

import { request } from '../api';

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('VerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should retrieve verification status successfully', async () => {
      const mockStatus = {
        tier: 'tier1' as const,
        verified: true,
        badges: ['identity_verified', 'pet_owner'],
        status: 'approved' as const,
        submittedAt: new Date('2024-01-01'),
        reviewedAt: new Date('2024-01-02'),
        requirements: {
          identity: 'completed',
          petOwnership: 'completed',
        },
      };

      mockRequest.mockResolvedValueOnce(mockStatus);

      const result = await verificationService.getStatus();

      expect(result).toEqual(mockStatus);
      expect(mockRequest).toHaveBeenCalledWith('/verification/status', { method: 'GET' });
    });

    it('should handle API errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('API Error'));

      await expect(verificationService.getStatus()).rejects.toThrow('API Error');
    });

    it('should handle network errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Network Error'));

      await expect(verificationService.getStatus()).rejects.toThrow('Network Error');
    });
  });

  describe('submitIdentityVerification', () => {
    const mockIdentityData = {
      idDocument: {
        front: 'front-doc-url',
        back: 'back-doc-url',
      },
      selfie: 'selfie-url',
      personalInfo: {
        legalName: 'John Doe',
        dateOfBirth: '1990-01-01',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        phone: '+1234567890',
      },
      consentToDataProcessing: true,
    };

    it('should submit identity verification successfully', async () => {
      const mockResponse = {
        tier: 'tier1' as const,
        verified: false,
        badges: [],
        status: 'pending_review' as const,
        submittedAt: new Date(),
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitIdentityVerification(mockIdentityData);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/verification/identity', {
        method: 'POST',
        body: mockIdentityData,
      });
    });

    it('should handle submission errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Submission failed'));

      await expect(
        verificationService.submitIdentityVerification(mockIdentityData),
      ).rejects.toThrow('Submission failed');
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ...mockIdentityData,
        personalInfo: {
          ...mockIdentityData.personalInfo,
          legalName: '', // Invalid empty name
        },
      };

      mockRequest.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(verificationService.submitIdentityVerification(invalidData)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('submitPetOwnershipVerification', () => {
    const mockPetOwnershipData = {
      primaryProof: {
        type: 'registration' as const,
        documentUrl: 'registration-doc-url',
      },
      secondaryProof: {
        type: 'selfie_with_pet' as const,
        documentUrl: 'selfie-url',
      },
      petInfo: {
        petId: 'pet123',
        petName: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
      },
    };

    it('should submit pet ownership verification successfully', async () => {
      const mockResponse = {
        tier: 'tier2' as const,
        verified: false,
        badges: ['pet_owner'],
        status: 'in_progress' as const,
        submittedAt: new Date(),
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitPetOwnershipVerification(mockPetOwnershipData);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/verification/pet-ownership', {
        method: 'POST',
        body: mockPetOwnershipData,
      });
    });

    it('should handle different proof types', async () => {
      const microchipData = {
        ...mockPetOwnershipData,
        secondaryProof: {
          type: 'microchip_number' as const,
          microchipNumber: '123456789',
        },
      };

      const mockResponse = {
        tier: 'tier2' as const,
        verified: false,
        badges: ['pet_owner'],
        status: 'pending_review' as const,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitPetOwnershipVerification(microchipData);

      expect(result.status).toBe('pending_review');
    });

    it('should handle submission errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Pet verification failed'));

      await expect(
        verificationService.submitPetOwnershipVerification(mockPetOwnershipData),
      ).rejects.toThrow('Pet verification failed');
    });
  });

  describe('submitVeterinaryVerification', () => {
    const mockVeterinaryData = {
      veterinaryDocuments: {
        vaccinationRecord: 'vaccination-url',
        spayNeuterProof: 'spay-neuter-url',
        healthCertificate: 'health-cert-url',
      },
      vetClinicInfo: {
        name: 'Happy Paws Veterinary',
        city: 'New York',
        state: 'NY',
        country: 'USA',
      },
      piiRedacted: true,
    };

    it('should submit veterinary verification successfully', async () => {
      const mockResponse = {
        tier: 'tier3' as const,
        verified: false,
        badges: ['veterinary_verified'],
        status: 'pending_review' as const,
        submittedAt: new Date(),
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitVeterinaryVerification(mockVeterinaryData);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/verification/veterinary', {
        method: 'POST',
        body: mockVeterinaryData,
      });
    });

    it('should handle minimal veterinary data', async () => {
      const minimalData = {
        veterinaryDocuments: {
          vaccinationRecord: 'vaccination-url',
        },
        vetClinicInfo: {
          name: 'Vet Clinic',
          city: 'City',
          country: 'Country',
        },
        piiRedacted: false,
      };

      const mockResponse = {
        tier: 'tier3' as const,
        verified: false,
        status: 'in_progress' as const,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitVeterinaryVerification(minimalData);

      expect(result.tier).toBe('tier3');
      expect(mockRequest).toHaveBeenCalledWith('/verification/veterinary', {
        method: 'POST',
        body: minimalData,
      });
    });

    it('should handle veterinary submission errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Veterinary verification failed'));

      await expect(
        verificationService.submitVeterinaryVerification(mockVeterinaryData),
      ).rejects.toThrow('Veterinary verification failed');
    });
  });

  describe('submitOrganizationVerification', () => {
    const mockOrganizationData = {
      organizationType: 'shelter' as const,
      documents: {
        licenseOrRegistration: 'license-url',
        businessRegistration: 'business-reg-url',
        website: 'https://example-shelter.com',
      },
      selfieAtFacility: 'selfie-facility-url',
      publicListingUrl: 'https://shelter-listing.com',
    };

    it('should submit organization verification successfully', async () => {
      const mockResponse = {
        tier: 'tier4' as const,
        verified: false,
        badges: ['organization_verified'],
        status: 'pending_review' as const,
        submittedAt: new Date(),
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitOrganizationVerification(mockOrganizationData);

      expect(result).toEqual(mockResponse);
      expect(mockRequest).toHaveBeenCalledWith('/verification/organization', {
        method: 'POST',
        body: mockOrganizationData,
      });
    });

    it('should handle different organization types', async () => {
      const breederData = {
        ...mockOrganizationData,
        organizationType: 'breeder' as const,
      };

      const mockResponse = {
        tier: 'tier4' as const,
        verified: false,
        badges: ['breeder_verified'],
        status: 'in_progress' as const,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitOrganizationVerification(breederData);

      expect(result.badges).toContain('breeder_verified');
      expect(mockRequest).toHaveBeenCalledWith('/verification/organization', {
        method: 'POST',
        body: breederData,
      });
    });

    it('should handle minimal organization data', async () => {
      const minimalData = {
        organizationType: 'rescue' as const,
        documents: {
          licenseOrRegistration: 'license-url',
        },
      };

      const mockResponse = {
        tier: 'tier4' as const,
        verified: false,
        status: 'pending_review' as const,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.submitOrganizationVerification(minimalData);

      expect(result.tier).toBe('tier4');
      expect(mockRequest).toHaveBeenCalledWith('/verification/organization', {
        method: 'POST',
        body: minimalData,
      });
    });

    it('should handle organization submission errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Organization verification failed'));

      await expect(
        verificationService.submitOrganizationVerification(mockOrganizationData),
      ).rejects.toThrow('Organization verification failed');
    });
  });

  describe('getRequirements', () => {
    it('should retrieve tier requirements successfully', async () => {
      const mockRequirements = [
        'Valid government-issued ID',
        'Clear selfie photo',
        'Address verification',
      ];

      mockRequest.mockResolvedValueOnce({ requirements: mockRequirements });

      const result = await verificationService.getRequirements('tier1');

      expect(result).toEqual(mockRequirements);
      expect(mockRequest).toHaveBeenCalledWith('/verification/requirements/tier1', {
        method: 'GET',
      });
    });

    it('should handle requirements retrieval errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Requirements not found'));

      await expect(verificationService.getRequirements('tier5')).rejects.toThrow(
        'Requirements not found',
      );
    });
  });

  describe('cancelVerification', () => {
    it('should cancel verification successfully', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      await expect(
        verificationService.cancelVerification('verification-123'),
      ).resolves.not.toThrow();

      expect(mockRequest).toHaveBeenCalledWith('/verification/verification-123/cancel', {
        method: 'POST',
      });
    });

    it('should handle cancellation errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Cannot cancel completed verification'));

      await expect(verificationService.cancelVerification('verification-123')).rejects.toThrow(
        'Cannot cancel completed verification',
      );
    });
  });

  describe('getBadges', () => {
    it('should retrieve user badges successfully', async () => {
      const mockBadges = ['identity_verified', 'pet_owner', 'veterinary_verified'];

      mockRequest.mockResolvedValueOnce({ badges: mockBadges });

      const result = await verificationService.getBadges();

      expect(result).toEqual(mockBadges);
      expect(mockRequest).toHaveBeenCalledWith('/verification/badges', { method: 'GET' });
    });

    it('should handle empty badges list', async () => {
      mockRequest.mockResolvedValueOnce({ badges: [] });

      const result = await verificationService.getBadges();

      expect(result).toEqual([]);
    });

    it('should handle badge retrieval errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Badges not available'));

      await expect(verificationService.getBadges()).rejects.toThrow('Badges not available');
    });
  });

  describe('hasTier', () => {
    it('should check tier availability successfully', async () => {
      mockRequest.mockResolvedValueOnce({ hasTier: true });

      const result = await verificationService.hasTier('tier2');

      expect(result).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith('/verification/has-tier/tier2', { method: 'GET' });
    });

    it('should return false for unavailable tier', async () => {
      mockRequest.mockResolvedValueOnce({ hasTier: false });

      const result = await verificationService.hasTier('tier4');

      expect(result).toBe(false);
    });

    it('should handle tier checking errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Tier check failed'));

      await expect(verificationService.hasTier('tier3')).rejects.toThrow('Tier check failed');
    });
  });

  describe('uploadDocument', () => {
    beforeEach(() => {
      // Mock is already set up at module level
    });

    it('should upload document successfully', async () => {
      const mockFormData = {
        append: jest.fn(),
      };

      mockRequest.mockResolvedValueOnce({ url: 'uploaded-doc-url' });

      const result = await verificationService.uploadDocument(
        'file://document.jpg',
        'identity_document',
        'tier1',
      );

      expect(result).toBe('uploaded-doc-url');
      expect(mockRequest).toHaveBeenCalledWith('/verification/upload', {
        method: 'POST',
        body: mockFormData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          documentType: 'identity_document',
          verificationType: 'tier1',
        },
      });
    });

    it('should upload document without verification type', async () => {
      const mockFormData = {
        append: jest.fn(),
      };

      mockRequest.mockResolvedValueOnce({ url: 'uploaded-doc-url' });

      const result = await verificationService.uploadDocument('file://document.jpg', 'pet_proof');

      expect(mockRequest).toHaveBeenCalledWith('/verification/upload', {
        method: 'POST',
        body: mockFormData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          documentType: 'pet_proof',
          verificationType: undefined,
        },
      });
    });

    it('should handle upload errors', async () => {
      const mockFormData = {
        append: jest.fn(),
      };

      mockRequest.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        verificationService.uploadDocument('file://document.jpg', 'identity_document'),
      ).rejects.toThrow('Upload failed');
    });

    it('should handle FormData creation errors', async () => {
      // Mock form-data to throw an error
      const formDataModule = require('form-data');
      formDataModule.mockImplementationOnce(() => {
        throw new Error('FormData not available');
      });

      mockRequest.mockResolvedValueOnce({ url: 'uploaded-doc-url' });

      await expect(
        verificationService.uploadDocument('file://document.jpg', 'document'),
      ).rejects.toThrow('FormData not available');
    });
  });

  describe('requestStatusUpdate', () => {
    it('should request status update successfully', async () => {
      mockRequest.mockResolvedValueOnce({ success: true });

      await expect(verificationService.requestStatusUpdate()).resolves.not.toThrow();

      expect(mockRequest).toHaveBeenCalledWith('/verification/request-update', { method: 'POST' });
    });

    it('should handle status update request errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Status update failed'));

      await expect(verificationService.requestStatusUpdate()).rejects.toThrow(
        'Status update failed',
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed API responses', async () => {
      mockRequest.mockResolvedValueOnce(null);

      await expect(verificationService.getStatus()).rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(verificationService.getStatus()).rejects.toThrow('Request timeout');
    });

    it('should handle unauthorized access', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(verificationService.getStatus()).rejects.toThrow('Unauthorized');
    });

    it('should handle server errors', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Internal server error'));

      await expect(verificationService.submitIdentityVerification({} as any)).rejects.toThrow(
        'Internal server error',
      );
    });

    it('should handle concurrent requests', async () => {
      mockRequest.mockResolvedValue({
        tier: 'tier0' as const,
        verified: false,
        badges: [],
        status: 'not_started' as const,
      });

      const promises = [
        verificationService.getStatus(),
        verificationService.getStatus(),
        verificationService.getStatus(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should handle large data payloads', async () => {
      const largeIdentityData = {
        idDocument: {
          front: 'A'.repeat(1000), // Large URL/data
          back: 'B'.repeat(1000),
        },
        selfie: 'C'.repeat(1000),
        personalInfo: {
          legalName: 'John Doe',
          dateOfBirth: '1990-01-01',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
          },
          phone: '+1234567890',
        },
        consentToDataProcessing: true,
      };

      mockRequest.mockResolvedValueOnce({
        tier: 'tier1',
        verified: false,
        status: 'pending_review',
      });

      const result = await verificationService.submitIdentityVerification(largeIdentityData);

      expect(result.status).toBe('pending_review');
    });
  });

  describe('Data Validation', () => {
    it('should handle invalid tier names', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Invalid tier'));

      await expect(verificationService.getRequirements('invalid-tier')).rejects.toThrow(
        'Invalid tier',
      );
    });

    it('should handle invalid verification IDs', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Invalid verification ID'));

      await expect(verificationService.cancelVerification('invalid-id')).rejects.toThrow(
        'Invalid verification ID',
      );
    });

    it('should handle empty file uploads', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Empty file'));

      await expect(verificationService.uploadDocument('', 'document')).rejects.toThrow(
        'Empty file',
      );
    });

    it('should handle unsupported document types', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Unsupported document type'));

      await expect(
        verificationService.uploadDocument('file://document.exe', 'executable'),
      ).rejects.toThrow('Unsupported document type');
    });
  });

  describe('Status Transitions', () => {
    it('should handle tier progression', async () => {
      // Start with tier0
      mockRequest.mockResolvedValueOnce({
        tier: 'tier0' as const,
        verified: false,
        badges: [],
        status: 'not_started' as const,
      });

      let status = await verificationService.getStatus();
      expect(status.tier).toBe('tier0');

      // Progress to tier1
      mockRequest.mockResolvedValueOnce({
        tier: 'tier1' as const,
        verified: false,
        badges: ['identity_verified'],
        status: 'approved' as const,
      });

      status = await verificationService.submitIdentityVerification({} as any);
      expect(status.tier).toBe('tier1');
      expect(status.badges).toContain('identity_verified');
    });

    it('should handle verification rejection', async () => {
      mockRequest.mockResolvedValueOnce({
        tier: 'tier1' as const,
        verified: false,
        badges: [],
        status: 'rejected' as const,
        rejectionReason: 'Document unclear',
      });

      const status = await verificationService.submitIdentityVerification({} as any);

      expect(status.status).toBe('rejected');
      expect(status.rejectionReason).toBe('Document unclear');
    });

    it('should handle pending review status', async () => {
      const submittedAt = new Date();
      mockRequest.mockResolvedValueOnce({
        tier: 'tier2' as const,
        verified: false,
        badges: ['pet_owner'],
        status: 'pending_review' as const,
        submittedAt,
      });

      const status = await verificationService.submitPetOwnershipVerification({} as any);

      expect(status.status).toBe('pending_review');
      expect(status.submittedAt).toBeInstanceOf(Date);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete verification workflow', async () => {
      // 1. Check initial status
      mockRequest.mockResolvedValueOnce({
        tier: 'tier0' as const,
        verified: false,
        badges: [],
        status: 'not_started' as const,
      });

      let status = await verificationService.getStatus();
      expect(status.tier).toBe('tier0');

      // 2. Submit identity verification
      mockRequest.mockResolvedValueOnce({
        tier: 'tier1' as const,
        verified: true,
        badges: ['identity_verified'],
        status: 'approved' as const,
      });

      status = await verificationService.submitIdentityVerification({} as any);
      expect(status.tier).toBe('tier1');
      expect(status.verified).toBe(true);

      // 3. Check badges
      mockRequest.mockResolvedValueOnce({
        badges: ['identity_verified'],
      });

      const badges = await verificationService.getBadges();
      expect(badges).toContain('identity_verified');

      // 4. Check tier availability
      mockRequest.mockResolvedValueOnce({
        hasTier: true,
      });

      const hasTier = await verificationService.hasTier('tier1');
      expect(hasTier).toBe(true);
    });

    it('should handle document upload workflow', async () => {
      // FormData is already mocked at module level

      // 1. Upload identity document
      mockRequest.mockResolvedValueOnce({ url: 'uploaded-identity-url' });

      const identityUrl = await verificationService.uploadDocument(
        'file://identity.jpg',
        'identity_document',
        'tier1',
      );
      expect(identityUrl).toBe('uploaded-identity-url');

      // 2. Upload pet ownership document
      mockRequest.mockResolvedValueOnce({ url: 'uploaded-pet-url' });

      const petUrl = await verificationService.uploadDocument(
        'file://pet-registration.pdf',
        'pet_registration',
        'tier2',
      );
      expect(petUrl).toBe('uploaded-pet-url');
    });
  });
});
