/**
 * Schemas Export Surface Unit Tests
 * Tests that all schemas export correctly via package name and subpaths
 */

describe('Schemas Export Surface', () => {
  describe('Package Import Tests', () => {
    it('should import schemas via package name', () => {
      // Test main package import
      expect(() => {
        require('@pawfectmatch/core');
      }).not.toThrow();
    });

    it('should import schemas via subpath', () => {
      // Test subpath import for schemas
      expect(() => {
        // This simulates importing @pawfectmatch/core/schemas
        const schemas = require('../src/schemas');
        expect(schemas).toBeDefined();
        expect(schemas.loginSchema).toBeDefined();
        expect(schemas.registerSchema).toBeDefined();
        expect(schemas.petSchema).toBeDefined();
      }).not.toThrow();
    });

    it('should export all required schemas', () => {
      const schemas = require('../src/schemas');
      
      // Authentication schemas
      expect(schemas.loginSchema).toBeDefined();
      expect(schemas.registerSchema).toBeDefined();
      
      // Entity schemas
      expect(schemas.petSchema).toBeDefined();
      expect(schemas.userProfileSchema).toBeDefined();
      expect(schemas.messageSchema).toBeDefined();
      expect(schemas.swipeSchema).toBeDefined();
      expect(schemas.searchSchema).toBeDefined();
      
      // Story schemas
      expect(schemas.storyCreateSchema).toBeDefined();
      expect(schemas.storyReplySchema).toBeDefined();
    });

    it('should export all TypeScript types', () => {
      const schemas = require('../src/schemas');
      
      // Authentication types
      expect(schemas.LoginFormData).toBeDefined();
      expect(schemas.RegisterFormData).toBeDefined();
      
      // Entity types
      expect(schemas.PetFormData).toBeDefined();
      expect(schemas.UserProfileData).toBeDefined();
      expect(schemas.MessageData).toBeDefined();
      expect(schemas.SwipeData).toBeDefined();
      expect(schemas.SearchData).toBeDefined();
      
      // Story types
      expect(schemas.CreateStoryInput).toBeDefined();
      expect(schemas.ReplyStoryInput).toBeDefined();
    });
  });

  describe('ESM and CJS Compatibility', () => {
    it('should work with CommonJS require', () => {
      const schemas = require('../src/schemas');
      
      // Test that schemas are functional
      expect(() => {
        schemas.loginSchema.parse({
          email: 'test@example.com',
          password: 'password123'
        });
      }).not.toThrow();
    });

    it('should work with ES modules', async () => {
      // Dynamic import to test ESM compatibility
      const schemas = await import('../src/schemas');
      
      expect(schemas.loginSchema).toBeDefined();
      expect(() => {
        schemas.loginSchema.parse({
          email: 'test@example.com',
          password: 'password123'
        });
      }).not.toThrow();
    });
  });

  describe('Schema Validation', () => {
    it('should validate login data correctly', () => {
      const { loginSchema } = require('../src/schemas');
      
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      expect(() => loginSchema.parse(validData)).not.toThrow();
      
      const invalidData = {
        email: 'invalid-email',
        password: '123'
      };
      
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should validate pet data correctly', () => {
      const { petSchema } = require('../src/schemas');
      
      const validData = {
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        personalityTags: ['friendly', 'energetic'],
        intent: 'adoption',
        healthInfo: {
          vaccinated: true,
          spayedNeutered: true,
          microchipped: true
        },
        location: {
          coordinates: [40.7128, -74.0060]
        },
        photos: ['photo1.jpg']
      };
      
      expect(() => petSchema.parse(validData)).not.toThrow();
    });

    it('should validate message data correctly', () => {
      const { messageSchema } = require('../src/schemas');
      
      const validData = {
        content: 'Hello, world!',
        messageType: 'text'
      };
      
      expect(() => messageSchema.parse(validData)).not.toThrow();
      
      const invalidData = {
        content: '',
        messageType: 'invalid'
      };
      
      expect(() => messageSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should provide correct TypeScript inference', () => {
      const { petSchema, PetFormData } = require('../src/schemas');
      
      const validData = {
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        personalityTags: ['friendly'],
        intent: 'adoption',
        healthInfo: {
          vaccinated: true,
          spayedNeutered: true,
          microchipped: true
        },
        location: {
          coordinates: [40.7128, -74.0060]
        },
        photos: ['photo1.jpg']
      };
      
      const result = petSchema.parse(validData);
      
      // Type assertion to ensure TypeScript types are working
      expect(result.name).toBe('Buddy');
      expect(result.species).toBe('dog');
      expect(typeof result.age).toBe('number');
      expect(Array.isArray(result.personalityTags)).toBe(true);
    });
  });
});
