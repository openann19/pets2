/**
 * Simplified VerificationService Tests - Core functionality
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { verificationService } from '../verificationService';

// Mock dependencies
jest.mock('../api', () => ({
  request: jest.fn(),
}));
jest.mock('../upload/index', () => ({
  uploadAdapter: {
    uploadGeneric: jest.fn(),
  },
}));

import { request } from '../api';
import { uploadAdapter } from '../upload/index';

const mockRequest = request as jest.MockedFunction<typeof request>;
const mockUploadGeneric = uploadAdapter.uploadGeneric as jest.MockedFunction<any>;

describe('VerificationService - Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    it('should retrieve verification status successfully', async () => {
      const mockStatus = {
        tier: 'tier1' as const,
        verified: true,
        badges: ['identity_verified'],
        status: 'approved' as const,
        submittedAt: new Date('2024-01-01'),
        reviewedAt: new Date('2024-01-02'),
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
  });

  describe('submitIdentityVerification', () => {
    const mockIdentityData = {
      idDocument: { front: 'front-doc-url', back: 'back-doc-url' },
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
  });

  describe('getRequirements', () => {
    it('should get requirements for a tier', async () => {
      const mockRequirements = ['identity', 'petOwnership'];

      mockRequest.mockResolvedValueOnce({ requirements: mockRequirements });

      const result = await verificationService.getRequirements('tier2');

      expect(result).toEqual(mockRequirements);
      expect(mockRequest).toHaveBeenCalledWith('/verification/requirements/tier2', {
        method: 'GET',
      });
    });
  });

  describe('hasTier', () => {
    it('should check if user has specific tier', async () => {
      mockRequest.mockResolvedValueOnce({ hasTier: true });

      const result = await verificationService.hasTier('tier1');

      expect(result).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith('/verification/has-tier/tier1', { method: 'GET' });
    });

    it('should return false if user does not have tier', async () => {
      mockRequest.mockResolvedValueOnce({ hasTier: false });

      const result = await verificationService.hasTier('tier2');

      expect(result).toBe(false);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const mockUploadResult = { url: 'uploaded-doc-url' };
      const mockResponse = { url: 'registered-doc-url' };

      mockUploadGeneric.mockResolvedValueOnce(mockUploadResult);
      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await verificationService.uploadDocument('file://document.jpg', 'document');

      expect(result).toBe('registered-doc-url');
      expect(mockUploadGeneric).toHaveBeenCalledWith({
        uri: 'file://document.jpg',
        name: 'document_document.jpg',
        contentType: 'image/jpeg',
        extraFields: { documentType: 'document' },
      });
      expect(mockRequest).toHaveBeenCalledWith('/verification/register-upload', {
        method: 'POST',
        body: {
          url: 'uploaded-doc-url',
          documentType: 'document',
        },
      });
    });

    it('should handle empty file uploads', async () => {
      await expect(verificationService.uploadDocument('', 'document')).rejects.toThrow(
        'Empty file',
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
  });
});
