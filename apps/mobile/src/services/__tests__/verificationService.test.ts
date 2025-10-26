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
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { api } from '../api';

const mockApi = api as jest.Mocked<typeof api>;

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

      mockApi.get.mockResolvedValueOnce({ data: mockStatus });

      const result = await verificationService.getStatus();

      expect(result).toEqual(mockStatus);
      expect(mockApi.get).toHaveBeenCalledWith('/verification/status');
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(verificationService.getStatus()).rejects.toThrow('API Error');
    });

    it('should handle network errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network Error'));

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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitIdentityVerification(mockIdentityData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/verification/identity', mockIdentityData);
    });

    it('should handle submission errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Submission failed'));

      await expect(
        verificationService.submitIdentityVerification(mockIdentityData)
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

      mockApi.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(
        verificationService.submitIdentityVerification(invalidData)
      ).rejects.toThrow('Validation failed');
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitPetOwnershipVerification(mockPetOwnershipData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/verification/pet-ownership', mockPetOwnershipData);
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitPetOwnershipVerification(microchipData);

      expect(result.status).toBe('pending_review');
    });

    it('should handle submission errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Pet verification failed'));

      await expect(
        verificationService.submitPetOwnershipVerification(mockPetOwnershipData)
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitVeterinaryVerification(mockVeterinaryData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/verification/veterinary', mockVeterinaryData);
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitVeterinaryVerification(minimalData);

      expect(result.tier).toBe('tier3');
    });

    it('should handle veterinary submission errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Veterinary verification failed'));

      await expect(
        verificationService.submitVeterinaryVerification(mockVeterinaryData)
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitOrganizationVerification(mockOrganizationData);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith('/verification/organization', mockOrganizationData);
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitOrganizationVerification(breederData);

      expect(result.badges).toContain('breeder_verified');
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

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await verificationService.submitOrganizationVerification(minimalData);

      expect(result.tier).toBe('tier4');
    });

    it('should handle organization submission errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Organization verification failed'));

      await expect(
        verificationService.submitOrganizationVerification(mockOrganizationData)
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

      mockApi.get.mockResolvedValueOnce({ data: { requirements: mockRequirements } });

      const result = await verificationService.getRequirements('tier1');

      expect(result).toEqual(mockRequirements);
      expect(mockApi.get).toHaveBeenCalledWith('/verification/requirements/tier1');
    });

    it('should handle requirements retrieval errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Requirements not found'));

      await expect(verificationService.getRequirements('tier5')).rejects.toThrow('Requirements not found');
    });
  });

  describe('cancelVerification', () => {
    it('should cancel verification successfully', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { success: true } });

      await expect(
        verificationService.cancelVerification('verification-123')
      ).resolves.not.toThrow();

      expect(mockApi.post).toHaveBeenCalledWith('/verification/verification-123/cancel');
    });

    it('should handle cancellation errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Cannot cancel completed verification'));

      await expect(
        verificationService.cancelVerification('verification-123')
      ).rejects.toThrow('Cannot cancel completed verification');
    });
  });

  describe('getBadges', () => {
    it('should retrieve user badges successfully', async () => {
      const mockBadges = ['identity_verified', 'pet_owner', 'veterinary_verified'];

      mockApi.get.mockResolvedValueOnce({ data: { badges: mockBadges } });

      const result = await verificationService.getBadges();

      expect(result).toEqual(mockBadges);
      expect(mockApi.get).toHaveBeenCalledWith('/verification/badges');
    });

    it('should handle empty badges list', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { badges: [] } });

      const result = await verificationService.getBadges();

      expect(result).toEqual([]);
    });

    it('should handle badge retrieval errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Badges not available'));

      await expect(verificationService.getBadges()).rejects.toThrow('Badges not available');
    });
  });

  describe('hasTier', () => {
    it('should check tier availability successfully', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { hasTier: true } });

      const result = await verificationService.hasTier('tier2');

      expect(result).toBe(true);
      expect(mockApi.get).toHaveBeenCalledWith('/verification/has-tier/tier2');
    });

    it('should return false for unavailable tier', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { hasTier: false } });

      const result = await verificationService.hasTier('tier4');

      expect(result).toBe(false);
    });

    it('should handle tier checking errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Tier check failed'));

      await expect(verificationService.hasTier('tier3')).rejects.toThrow('Tier check failed');
    });
  });

  describe('uploadDocument', () => {
    beforeEach(() => {
      // Mock FormData
      global.FormData = jest.fn(() => ({
        append: jest.fn(),
      })) as any;
    });

    it('should upload document successfully', async () => {
      const mockFormData = {
        append: jest.fn(),
      };
      (global.FormData as jest.Mock).mockImplementation(() => mockFormData);

      mockApi.post.mockResolvedValueOnce({ data: { url: 'uploaded-doc-url' } });

      const result = await verificationService.uploadDocument(
        'file://document.jpg',
        'identity_document',
        'tier1'
      );

      expect(result).toBe('uploaded-doc-url');
      expect(mockApi.post).toHaveBeenCalledWith('/verification/upload', mockFormData, {
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
      (global.FormData as jest.Mock).mockImplementation(() => mockFormData);

      mockApi.post.mockResolvedValueOnce({ data: { url: 'uploaded-doc-url' } });

      const result = await verificationService.uploadDocument('file://document.jpg', 'pet_proof');

      expect(mockApi.post).toHaveBeenCalledWith('/verification/upload', mockFormData, {
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
      (global.FormData as jest.Mock).mockImplementation(() => mockFormData);

      mockApi.post.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        verificationService.uploadDocument('file://document.jpg', 'identity_document')
      ).rejects.toThrow('Upload failed');
    });

    it('should handle FormData creation errors', async () => {
      (global.FormData as jest.Mock).mockImplementation(() => {
        throw new Error('FormData not available');
      });

      mockApi.post.mockResolvedValueOnce({ data: { url: 'uploaded-doc-url' } });

      await expect(
        verificationService.uploadDocument('file://document.jpg', 'document')
      ).rejects.toThrow('FormData not available');
    });
  });

  describe('requestStatusUpdate', () => {
    it('should request status update successfully', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { success: true } });

      await expect(verificationService.requestStatusUpdate()).resolves.not.toThrow();

      expect(mockApi.post).toHaveBeenCalledWith('/verification/request-update');
    });

    it('should handle status update request errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Status update failed'));

      await expect(verificationService.requestStatusUpdate()).rejects.toThrow('Status update failed');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed API responses', async () => {
      mockApi.get.mockResolvedValueOnce({ data: null });

      await expect(verificationService.getStatus()).rejects.toThrow();
    });

    it('should handle network timeouts', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(verificationService.getStatus()).rejects.toThrow('Request timeout');
    });

    it('should handle unauthorized access', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(verificationService.getStatus()).rejects.toThrow('Unauthorized');
    });

    it('should handle server errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Internal server error'));

      await expect(
        verificationService.submitIdentityVerification({} as any)
      ).rejects.toThrow('Internal server error');
    });

    it('should handle concurrent requests', async () => {
      mockApi.get.mockResolvedValue({ data: { tier: 'tier0', verified: false, badges: [], status: 'not_started' } });

      const promises = [
        verificationService.getStatus(),
        verificationService.getStatus(),
        verificationService.getStatus(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockApi.get).toHaveBeenCalledTimes(3);
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

      mockApi.post.mockResolvedValueOnce({ data: { tier: 'tier1', verified: false, status: 'pending_review' } });

      const result = await verificationService.submitIdentityVerification(largeIdentityData);

      expect(result.status).toBe('pending_review');
    });
  });

  describe('Data Validation', () => {
    it('should handle invalid tier names', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Invalid tier'));

      await expect(verificationService.getRequirements('invalid-tier')).rejects.toThrow('Invalid tier');
    });

    it('should handle invalid verification IDs', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid verification ID'));

      await expect(verificationService.cancelVerification('invalid-id')).rejects.toThrow('Invalid verification ID');
    });

    it('should handle empty file uploads', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Empty file'));

      await expect(
        verificationService.uploadDocument('', 'document')
      ).rejects.toThrow('Empty file');
    });

    it('should handle unsupported document types', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Unsupported document type'));

      await expect(
        verificationService.uploadDocument('file://document.exe', 'executable')
      ).rejects.toThrow('Unsupported document type');
    });
  });

  describe('Status Transitions', () => {
    it('should handle tier progression', async () => {
      // Start with tier0
      mockApi.get.mockResolvedValueOnce({
        data: { tier: 'tier0', verified: false, badges: [], status: 'not_started' }
      });

      let status = await verificationService.getStatus();
      expect(status.tier).toBe('tier0');

      // Progress to tier1
      mockApi.post.mockResolvedValueOnce({
        data: { tier: 'tier1', verified: false, badges: ['identity_verified'], status: 'approved' }
      });

      status = await verificationService.submitIdentityVerification({} as any);
      expect(status.tier).toBe('tier1');
      expect(status.badges).toContain('identity_verified');
    });

    it('should handle verification rejection', async () => {
      mockApi.post.mockResolvedValueOnce({
        data: {
          tier: 'tier1',
          verified: false,
          badges: [],
          status: 'rejected',
          rejectionReason: 'Document unclear'
        }
      });

      const status = await verificationService.submitIdentityVerification({} as any);

      expect(status.status).toBe('rejected');
      expect(status.rejectionReason).toBe('Document unclear');
    });

    it('should handle pending review status', async () => {
      mockApi.post.mockResolvedValueOnce({
        data: {
          tier: 'tier2',
          verified: false,
          badges: ['pet_owner'],
          status: 'pending_review',
          submittedAt: new Date()
        }
      });

      const status = await verificationService.submitPetOwnershipVerification({} as any);

      expect(status.status).toBe('pending_review');
      expect(status.submittedAt).toBeInstanceOf(Date);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete verification workflow', async () => {
      // 1. Check initial status
      mockApi.get.mockResolvedValueOnce({
        data: { tier: 'tier0', verified: false, badges: [], status: 'not_started' }
      });

      let status = await verificationService.getStatus();
      expect(status.tier).toBe('tier0');

      // 2. Submit identity verification
      mockApi.post.mockResolvedValueOnce({
        data: { tier: 'tier1', verified: true, badges: ['identity_verified'], status: 'approved' }
      });

      status = await verificationService.submitIdentityVerification({} as any);
      expect(status.tier).toBe('tier1');
      expect(status.verified).toBe(true);

      // 3. Check badges
      mockApi.get.mockResolvedValueOnce({
        data: { badges: ['identity_verified'] }
      });

      const badges = await verificationService.getBadges();
      expect(badges).toContain('identity_verified');

      // 4. Check tier availability
      mockApi.get.mockResolvedValueOnce({
        data: { hasTier: true }
      });

      const hasTier = await verificationService.hasTier('tier1');
      expect(hasTier).toBe(true);
    });

    it('should handle document upload workflow', async () => {
      // Mock FormData for document upload
      const mockFormData = {
        append: jest.fn(),
      };
      (global.FormData as jest.Mock).mockImplementation(() => mockFormData);

      // 1. Upload identity document
      mockApi.post.mockResolvedValueOnce({
        data: { url: 'uploaded-identity-url' }
      });

      const identityUrl = await verificationService.uploadDocument(
        'file://identity.jpg',
        'identity_document',
        'tier1'
      );
      expect(identityUrl).toBe('uploaded-identity-url');

      // 2. Upload pet ownership document
      mockApi.post.mockResolvedValueOnce({
        data: { url: 'uploaded-pet-url' }
      });

      const petUrl = await verificationService.uploadDocument(
        'file://pet-registration.pdf',
        'pet_registration',
        'tier2'
      );
      expect(petUrl).toBe('uploaded-pet-url');
    });
  });
});
