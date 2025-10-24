/**
 * Unit tests for mapper functions
 * Ensures proper data transformation between legacy and core types
 */

import { toCoreMessage, toCorePet, toCoreUser } from '@pawfectmatch/core';

describe('Mappers', () => {
  describe('toCoreUser', () => {
    it('should convert legacy user to core user', () => {
      const legacyUser: LegacyWebUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        isPremium: true,
      };

      const coreUser = toCoreUser(legacyUser);

      expect(coreUser._id).toBe('user-123');
      expect(coreUser.email).toBe('test@example.com');
      expect(coreUser.firstName).toBe('John');
      expect(coreUser.lastName).toBe('Doe');
      expect(coreUser.avatar).toBe('https://example.com/avatar.jpg');
      expect(coreUser.premium.isActive).toBe(true);
    });

    it('should handle single name correctly', () => {
      const legacyUser: LegacyWebUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Madonna',
      };

      const coreUser = toCoreUser(legacyUser);

      expect(coreUser.firstName).toBe('Madonna');
      expect(coreUser.lastName).toBe('');
    });

    it('should handle missing optional fields', () => {
      const legacyUser: LegacyWebUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const coreUser = toCoreUser(legacyUser);

      expect(coreUser.avatar).toBeUndefined();
      expect(coreUser.premium.isActive).toBe(false);
    });
  });

  describe('toCorePet', () => {
    it('should convert legacy pet to core pet', () => {
      const legacyPet: LegacyWebPet = {
        id: 'pet-123',
        ownerId: 'user-123',
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        weight: 70,
        species: 'dog',
        description: 'Friendly dog',
        temperament: ['friendly', 'energetic'],
        photos: [
          { url: 'https://example.com/photo1.jpg', isPrimary: true },
          { url: 'https://example.com/photo2.jpg' },
        ],
        location: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      const corePet = toCorePet(legacyPet);

      expect(corePet._id).toBe('pet-123');
      expect(corePet.owner).toBe('user-123');
      expect(corePet.name).toBe('Buddy');
      expect(corePet.breed).toBe('Golden Retriever');
      expect(corePet.age).toBe(3);
      expect(corePet.gender).toBe('male');
      expect(corePet.size).toBe('large');
      expect(corePet.weight).toBe(70);
      expect(corePet.species).toBe('dog');
      expect(corePet.description).toBe('Friendly dog');
      expect(corePet.personalityTags).toEqual(['friendly', 'energetic']);
      expect(corePet.photos).toHaveLength(2);
      expect(corePet.location.coordinates).toEqual([-74.006, 40.7128]);
    });

    it('should handle alternative location formats', () => {
      const legacyPet: LegacyWebPet = {
        id: 'pet-123',
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        location: {
          lat: 40.7128,
          lon: -74.006,
        },
      };

      const corePet = toCorePet(legacyPet);

      expect(corePet.location.coordinates).toEqual([-74.006, 40.7128]);
    });

    it('should handle string photos array', () => {
      const legacyPet: LegacyWebPet = {
        id: 'pet-123',
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      };

      const corePet = toCorePet(legacyPet);

      expect(corePet.photos).toHaveLength(2);
      expect(corePet.photos[0].url).toBe('https://example.com/photo1.jpg');
      expect(corePet.photos[0].isPrimary).toBe(true);
      expect(corePet.photos[1].isPrimary).toBe(false);
    });
  });

  describe('toCoreMessage', () => {
    it('should convert legacy message to core message', () => {
      const legacyMessage: LegacyWebMessage = {
        id: 'msg-123',
        senderId: 'user-123',
        sender: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://example.com/avatar.jpg',
        },
        content: 'Hello!',
        type: 'text',
        sentAt: '2024-01-01T00:00:00.000Z',
      };

      const coreMessage = toCoreMessage(legacyMessage);

      expect(coreMessage._id).toBe('msg-123');
      expect(coreMessage.content).toBe('Hello!');
      expect(coreMessage.messageType).toBe('text');
      expect(coreMessage.sentAt).toBe('2024-01-01T00:00:00.000Z');
      expect(coreMessage.sender._id).toBe('user-123');
      expect(coreMessage.sender.firstName).toBe('John');
      expect(coreMessage.sender.lastName).toBe('Doe');
    });

    it('should handle alternative content field names', () => {
      const legacyMessage: LegacyWebMessage = {
        id: 'msg-123',
        text: 'Hello from text field!',
      };

      const coreMessage = toCoreMessage(legacyMessage);

      expect(coreMessage.content).toBe('Hello from text field!');
    });

    it('should handle string sender ID', () => {
      const legacyMessage: LegacyWebMessage = {
        id: 'msg-123',
        sender: 'user-123',
        content: 'Hello!',
      };

      const coreMessage = toCoreMessage(legacyMessage);

      expect(coreMessage.sender._id).toBe('user-123');
    });

    it('should convert attachments correctly', () => {
      const legacyMessage: LegacyWebMessage = {
        id: 'msg-123',
        content: 'Check this out',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            fileName: 'image.jpg',
          },
        ],
      };

      const coreMessage = toCoreMessage(legacyMessage);

      expect(coreMessage.attachments).toHaveLength(1);
      expect(coreMessage.attachments?.[0].url).toBe('https://example.com/image.jpg');
      expect(coreMessage.attachments?.[0].type).toBe('image');
    });
  });
});
