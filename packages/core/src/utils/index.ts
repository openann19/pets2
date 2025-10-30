/**
 * Shared Utility Functions
 * Platform-agnostic logic for both web and mobile
 */

import type { Pet, User } from '../types';

// Re-export logger
export * from './logger';

// Age calculation utility
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }

  return age;
}

// Distance calculation (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Pet compatibility scoring
export function calculateCompatibilityScore(pet1: Pet, pet2: Pet): number {
  let score = 0;

  // Species match (40 points)
  if (pet1.species === pet2.species) {
    score += 40;
  }

  // Size compatibility (20 points)
  const sizeCompatibility = getSizeCompatibility(pet1.size, pet2.size);
  score += sizeCompatibility;

  // Age compatibility (20 points)
  const ageDiff = Math.abs(pet1.age - pet2.age);
  if (ageDiff <= 1) score += 20;
  else if (ageDiff <= 2) score += 15;
  else if (ageDiff <= 3) score += 10;
  else if (ageDiff <= 5) score += 5;

  // Personality match (20 points)
  const personalityOverlap = pet1.personalityTags.filter((tag) =>
    pet2.personalityTags.includes(tag),
  ).length;
  score += Math.min(personalityOverlap * 5, 20);

  return Math.min(score, 100);
}

function getSizeCompatibility(size1: string, size2: string): number {
  const sizeOrder = ['small', 'medium', 'large', 'extra-large'];
  const index1 = sizeOrder.indexOf(size1.toLowerCase());
  const index2 = sizeOrder.indexOf(size2.toLowerCase());

  if (index1 === -1 || index2 === -1) return 10; // Unknown sizes get moderate score

  const diff = Math.abs(index1 - index2);
  if (diff === 0) return 20; // Same size
  if (diff === 1) return 15; // Adjacent sizes
  if (diff === 2) return 10; // Two sizes apart
  return 5; // Very different sizes
}

// Format display name for users
export function formatDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName.charAt(0)}.`;
}

// Format pet description
export function formatPetAge(age: number): string {
  if (age < 1) return 'Puppy/Kitten';
  if (age === 1) return '1 year old';
  return `${String(age)} years old`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate random ID (for temporary use)
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Time formatting utilities
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${String(Math.floor(diffInSeconds / 60))}m ago`;
  if (diffInSeconds < 86400) return `${String(Math.floor(diffInSeconds / 3600))}h ago`;
  if (diffInSeconds < 604800) return `${String(Math.floor(diffInSeconds / 86400))}d ago`;

  return messageDate.toLocaleDateString();
}

export * from './contentFilter';
export * from './storage';

// Note: Constants are exported from types/index.ts to avoid duplication
