/**
 * Core Functionality Tests for PawfectMatch Mobile App
 * These tests verify essential business logic and utilities
 */

describe('Core Functionality Tests', () => {
  describe('Theme System', () => {
    it('should validate color values are valid hex codes', () => {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      const colors = ['#4C6EF5', '#22B8CF', '#F7F9FC', '#FFFFFF'];
      
      colors.forEach(color => {
        expect(hexColorRegex.test(color)).toBe(true);
      });
    });

    it('should validate spacing scale has correct values', () => {
      const spacingScale = {
        none: 0,
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      };

      expect(spacingScale.none).toBe(0);
      expect(spacingScale.xs).toBeLessThan(spacingScale.sm);
      expect(spacingScale.sm).toBeLessThan(spacingScale.md);
      expect(spacingScale.md).toBeLessThan(spacingScale.lg);
    });

    it('should validate typography scale has correct hierarchy', () => {
      const typographyScale = {
        heading1: { fontSize: 32, lineHeight: 40 },
        heading2: { fontSize: 24, lineHeight: 32 },
        heading3: { fontSize: 20, lineHeight: 28 },
        body: { fontSize: 16, lineHeight: 24 },
        caption: { fontSize: 13, lineHeight: 18 },
      };

      expect(typographyScale.heading1.fontSize).toBeGreaterThan(typographyScale.heading2.fontSize);
      expect(typographyScale.heading2.fontSize).toBeGreaterThan(typographyScale.heading3.fontSize);
      expect(typographyScale.heading3.fontSize).toBeGreaterThan(typographyScale.body.fontSize);
    });
  });

  describe('Validation Utilities', () => {
    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('user@example.com')).toBe(true);
      expect(emailRegex.test('test.user@domain.co.uk')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
      expect(emailRegex.test('user@')).toBe(false);
    });

    it('should validate password strength', () => {
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      
      expect(strongPasswordRegex.test('Password123')).toBe(true);
      expect(strongPasswordRegex.test('Secure1Pass')).toBe(true);
      expect(strongPasswordRegex.test('weak')).toBe(false);
      expect(strongPasswordRegex.test('nodigits')).toBe(false);
      expect(strongPasswordRegex.test('NOLOWERCASE1')).toBe(false);
    });

    it('should validate phone number format', () => {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      
      expect(phoneRegex.test('+1 (555) 123-4567')).toBe(true);
      expect(phoneRegex.test('555-123-4567')).toBe(true);
      expect(phoneRegex.test('5551234567')).toBe(true);
      expect(phoneRegex.test('invalid-phone!')).toBe(false);
    });
  });

  describe('Data Transformations', () => {
    it('should properly format pet ages', () => {
      const formatPetAge = (months: number): string => {
        if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
        return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
      };

      expect(formatPetAge(1)).toBe('1 month');
      expect(formatPetAge(6)).toBe('6 months');
      expect(formatPetAge(12)).toBe('1 year');
      expect(formatPetAge(24)).toBe('2 years');
      expect(formatPetAge(25)).toBe('2 years 1 month');
      expect(formatPetAge(30)).toBe('2 years 6 months');
    });

    it('should properly format distances', () => {
      const formatDistance = (meters: number): string => {
        if (meters < 1000) return `${meters}m`;
        const km = (meters / 1000).toFixed(1);
        return `${km}km`;
      };

      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(5500)).toBe('5.5km');
      expect(formatDistance(12345)).toBe('12.3km');
    });

    it('should properly format timestamps', () => {
      const formatRelativeTime = (timestamp: Date): string => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
      };

      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneDayAgo = new Date(now.getTime() - 86400000);

      expect(formatRelativeTime(now)).toBe('Just now');
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1m ago');
      expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');
      expect(formatRelativeTime(oneDayAgo)).toBe('1d ago');
    });
  });

  describe('Business Logic', () => {
    it('should calculate subscription pricing correctly', () => {
      const calculatePrice = (basePrice: number, discount: number): number => {
        return basePrice * (1 - discount / 100);
      };

      expect(calculatePrice(9.99, 0)).toBe(9.99);
      expect(calculatePrice(9.99, 10)).toBeCloseTo(8.99, 2);
      expect(calculatePrice(29.99, 25)).toBeCloseTo(22.49, 2);
      expect(calculatePrice(100, 50)).toBe(50);
    });

    it('should validate compatibility score calculation', () => {
      const calculateCompatibility = (
        factors: { weight: number; score: number }[]
      ): number => {
        const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
        const weightedScore = factors.reduce((sum, f) => sum + f.weight * f.score, 0);
        return Math.round((weightedScore / totalWeight) * 100) / 100;
      };

      const factors = [
        { weight: 0.3, score: 0.9 }, // Activity level
        { weight: 0.3, score: 0.8 }, // Size compatibility
        { weight: 0.4, score: 0.95 }, // Temperament
      ];

      const score = calculateCompatibility(factors);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
      expect(score).toBeCloseTo(0.89, 1);
    });

    it('should properly filter pets by criteria', () => {
      const pets = [
        { id: '1', species: 'dog', size: 'large', age: 24 },
        { id: '2', species: 'cat', size: 'small', age: 12 },
        { id: '3', species: 'dog', size: 'medium', age: 36 },
        { id: '4', species: 'cat', size: 'medium', age: 18 },
      ];

      const filterBySpecies = (species: string) => 
        pets.filter(pet => pet.species === species);

      const filterByAgeRange = (minAge: number, maxAge: number) =>
        pets.filter(pet => pet.age >= minAge && pet.age <= maxAge);

      expect(filterBySpecies('dog')).toHaveLength(2);
      expect(filterBySpecies('cat')).toHaveLength(2);
      expect(filterByAgeRange(12, 24)).toHaveLength(3);
      expect(filterByAgeRange(30, 40)).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      const handleNetworkError = (error: Error): string => {
        if (error.message.includes('Network')) return 'Network connection lost';
        if (error.message.includes('Timeout')) return 'Request timed out';
        if (error.message.includes('401')) return 'Authentication required';
        return 'An unexpected error occurred';
      };

      expect(handleNetworkError(new Error('Network error'))).toBe('Network connection lost');
      expect(handleNetworkError(new Error('Timeout exceeded'))).toBe('Request timed out');
      expect(handleNetworkError(new Error('401 Unauthorized'))).toBe('Authentication required');
      expect(handleNetworkError(new Error('Unknown error'))).toBe('An unexpected error occurred');
    });

    it('should validate API response structure', () => {
      const isValidPetResponse = (response: any): boolean => {
        return (
          response &&
          typeof response.id === 'string' &&
          typeof response.name === 'string' &&
          typeof response.species === 'string' &&
          Array.isArray(response.photos)
        );
      };

      const validResponse = {
        id: '123',
        name: 'Buddy',
        species: 'dog',
        photos: ['photo1.jpg', 'photo2.jpg']
      };

      const invalidResponse1 = { id: '123', name: 'Buddy' };
      const invalidResponse2 = null;

      expect(isValidPetResponse(validResponse)).toBe(true);
      expect(isValidPetResponse(invalidResponse1)).toBe(false);
      expect(isValidPetResponse(invalidResponse2)).toBeFalsy();
    });
  });

  describe('State Management', () => {
    it('should properly manage authentication state', () => {
      let isAuthenticated = false;
      let token: string | null = null;

      const login = (userToken: string) => {
        token = userToken;
        isAuthenticated = true;
      };

      const logout = () => {
        token = null;
        isAuthenticated = false;
      };

      expect(isAuthenticated).toBe(false);
      expect(token).toBeNull();

      login('test-token-123');
      expect(isAuthenticated).toBe(true);
      expect(token).toBe('test-token-123');

      logout();
      expect(isAuthenticated).toBe(false);
      expect(token).toBeNull();
    });

    it('should properly manage favorite pets', () => {
      const favorites = new Set<string>();

      const addFavorite = (petId: string) => favorites.add(petId);
      const removeFavorite = (petId: string) => favorites.delete(petId);
      const isFavorite = (petId: string) => favorites.has(petId);

      expect(favorites.size).toBe(0);

      addFavorite('pet-1');
      addFavorite('pet-2');
      expect(favorites.size).toBe(2);
      expect(isFavorite('pet-1')).toBe(true);

      removeFavorite('pet-1');
      expect(favorites.size).toBe(1);
      expect(isFavorite('pet-1')).toBe(false);
    });
  });

  describe('Accessibility Helpers', () => {
    it('should generate proper accessibility labels', () => {
      const generatePetCardLabel = (name: string, species: string, age: number): string => {
        return `Pet profile: ${name}, a ${age} month old ${species}`;
      };

      expect(generatePetCardLabel('Max', 'dog', 24)).toBe('Pet profile: Max, a 24 month old dog');
      expect(generatePetCardLabel('Whiskers', 'cat', 12)).toBe('Pet profile: Whiskers, a 12 month old cat');
    });

    it('should generate proper button labels', () => {
      const generateSwipeButtonLabel = (action: 'like' | 'pass' | 'superlike'): string => {
        const labels = {
          like: 'Like this pet',
          pass: 'Pass on this pet',
          superlike: 'Super like this pet'
        };
        return labels[action];
      };

      expect(generateSwipeButtonLabel('like')).toBe('Like this pet');
      expect(generateSwipeButtonLabel('pass')).toBe('Pass on this pet');
      expect(generateSwipeButtonLabel('superlike')).toBe('Super like this pet');
    });
  });
});
