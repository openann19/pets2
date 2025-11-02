/**
 * Validation Service for PawfectMatch
 * Centralized validation logic for various data types
 */

import logger from '../utils/logger';

class ValidationService {
  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Validate date of birth
   */
  validateDateOfBirth(dateOfBirth: string | Date): { isValid: boolean; age?: number; errors: string[] } {
    const errors: string[] = [];
    const date = new Date(dateOfBirth);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
      return { isValid: false, errors };
    }
    
    if (age < 18) {
      errors.push('Must be at least 18 years old');
    }
    
    if (age > 120) {
      errors.push('Invalid age');
    }
    
    return {
      isValid: errors.length === 0,
      age,
      errors
    };
  }

  /**
   * Validate pet data
   */
  validatePetData(petData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!petData.name || petData.name.trim().length < 2) {
      errors.push('Pet name must be at least 2 characters long');
    }
    
    if (!petData.species || !['dog', 'cat', 'bird', 'rabbit', 'other'].includes(petData.species)) {
      errors.push('Invalid species');
    }
    
    if (!petData.age || petData.age < 0 || petData.age > 30) {
      errors.push('Invalid age');
    }
    
    if (!petData.breed || petData.breed.trim().length < 2) {
      errors.push('Breed must be at least 2 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate location coordinates
   */
  validateLocation(location: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!location.coordinates || !Array.isArray(location.coordinates)) {
      errors.push('Invalid coordinates format');
      return { isValid: false, errors };
    }
    
    const [lat, lng] = location.coordinates;
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      errors.push('Coordinates must be numbers');
    }
    
    if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
    
    if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input string
   */
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }
    
    if (file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new ValidationService();
