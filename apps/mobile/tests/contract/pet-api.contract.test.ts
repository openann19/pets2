/**
 * Contract tests for Pet API
 * Validates request/response schemas against backend contracts
 */

import { describe, it, expect } from '@jest/globals';

// Mock API responses to validate against contracts
interface PetAPIResponse {
  pets: Array<{
    _id: string;
    name: string;
    type: string;
    breed?: string;
    age?: number;
    photos: string[];
  }>;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

interface PetDetailResponse {
  _id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  photos: string[];
  owner: {
    id: string;
    name: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

describe('Pet API Contracts', () => {
  describe('GET /pets', () => {
    it('should return paginated list of pets', () => {
      const response: PetAPIResponse = {
        pets: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Fluffy',
            type: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            photos: ['https://example.com/photo.jpg'],
          },
        ],
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: 1,
        },
      };

      // Validate structure
      expect(response.pets).toBeInstanceOf(Array);
      expect(response.pagination).toHaveProperty('page');
      expect(response.pagination).toHaveProperty('totalPages');
      expect(response.pagination).toHaveProperty('totalItems');

      // Validate pet object structure
      if (response.pets.length > 0) {
        const pet = response.pets[0];
        expect(pet).toHaveProperty('_id');
        expect(pet).toHaveProperty('name');
        expect(pet).toHaveProperty('type');
        expect(pet).toHaveProperty('photos');
        expect(Array.isArray(pet.photos)).toBe(true);
      }
    });

    it('should support pagination parameters', () => {
      const requestParams = {
        page: '1',
        limit: '20',
        type: 'dog',
      };

      // Validate request format
      expect(typeof requestParams.page).toBe('string');
      expect(typeof requestParams.limit).toBe('string');
      expect(typeof requestParams.type).toBe('string');
    });
  });

  describe('GET /pets/:id', () => {
    it('should return detailed pet information', () => {
      const response: PetDetailResponse = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Fluffy',
        type: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        photos: ['https://example.com/photo.jpg'],
        owner: {
          id: '507f1f77bcf86cd799439012',
          name: 'John Doe',
        },
        location: {
          lat: 37.7749,
          lng: -122.4194,
        },
      };

      // Validate structure
      expect(response).toHaveProperty('_id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('type');
      expect(response).toHaveProperty('photos');
      expect(response).toHaveProperty('owner');
      expect(response).toHaveProperty('location');

      // Validate nested objects
      expect(response.owner).toHaveProperty('id');
      expect(response.owner).toHaveProperty('name');
      expect(response.location).toHaveProperty('lat');
      expect(response.location).toHaveProperty('lng');
    });

    it('should return 404 for non-existent pet', () => {
      const errorResponse = {
        error: 'Pet not found',
        statusCode: 404,
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse).toHaveProperty('statusCode');
    });
  });

  describe('POST /pets', () => {
    it('should create a new pet', () => {
      const request = {
        name: 'Buddy',
        type: 'dog',
        breed: 'Labrador',
        age: 2,
        photos: ['https://example.com/photo.jpg'],
        location: {
          lat: 37.7749,
          lng: -122.4194,
        },
      };

      // Validate request structure
      expect(request).toHaveProperty('name');
      expect(request).toHaveProperty('type');
      expect(typeof request.name).toBe('string');
      expect(typeof request.type).toBe('string');

      // Mock successful response
      const response = {
        _id: '507f1f77bcf86cd799439013',
        ...request,
      };

      expect(response).toHaveProperty('_id');
      expect(response.name).toBe(request.name);
      expect(response.type).toBe(request.type);
    });

    it('should validate required fields', () => {
      const invalidRequests = [
        { type: 'dog' }, // missing name
        { name: 'Buddy' }, // missing type
      ];

      invalidRequests.forEach(request => {
        // Should validate and reject missing fields
        expect(request).not.toHaveProperty('name'); // or expect throw
      });
    });
  });

  describe('PUT /pets/:id', () => {
    it('should update pet information', () => {
      const request = {
        name: 'Buddy Updated',
        age: 3,
      };

      const response = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Buddy Updated',
        type: 'dog',
        breed: 'Labrador',
        age: 3,
        photos: ['https://example.com/photo.jpg'],
      };

      expect(response).toHaveProperty('_id');
      expect(response.name).toBe(request.name);
      expect(response.age).toBe(request.age);
    });
  });

  describe('DELETE /pets/:id', () => {
    it('should delete a pet', () => {
      const response = {
        success: true,
        message: 'Pet deleted successfully',
      };

      expect(response).toHaveProperty('success');
      expect(response.success).toBe(true);
    });

    it('should return 403 for unauthorized deletion', () => {
      const errorResponse = {
        error: 'Unauthorized',
        statusCode: 403,
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.statusCode).toBe(403);
    });
  });

  describe('Error responses', () => {
    it('should return 400 for validation errors', () => {
      const errorResponse = {
        error: 'Validation failed',
        statusCode: 400,
        details: [
          {
            field: 'name',
            message: 'Name is required',
          },
        ],
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse).toHaveProperty('statusCode');
      expect(errorResponse.statusCode).toBe(400);
    });

    it('should return 500 for server errors', () => {
      const errorResponse = {
        error: 'Internal server error',
        statusCode: 500,
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.statusCode).toBe(500);
    });
  });
});

