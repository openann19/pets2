/**
 * 🏠 Adoption API
 * Pet adoption listings and applications matching mobile app structure
 */

import { apiInstance } from './api';
import type { ApiResponse, Pet } from '../types';

export interface AdoptionApplication {
  _id: string;
  petId: string;
  applicantId: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

/**
 * Adoption API matching mobile app structure
 */
export const adoptionAPI = {
  /**
   * Get adoption listings
   */
  getListings: async (): Promise<Pet[]> => {
    try {
      const response = await apiInstance.request<Pet[]>('/adoption/listings', {
        method: 'GET',
      });

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get adoption listings');
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get adoption listings');
    }
  },

  /**
   * Get adoption applications
   */
  getApplications: async (): Promise<AdoptionApplication[]> => {
    try {
      const response = await apiInstance.request<AdoptionApplication[]>(
        '/adoption/applications',
        { method: 'GET' },
      );

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'Failed to get adoption applications');
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Failed to get adoption applications');
    }
  },
};

export default adoptionAPI;

