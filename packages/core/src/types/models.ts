/**
 * Core type definitions for the application models
 * These are used across the application for type safety
 */

export type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  status?: string;
  isEmailVerified?: boolean;
  dateOfBirth?: string | Date;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string | Date;
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
};

export type Pet = {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  owner: string;
  age?: number; // age in months for precision
  photos?: string[];

  // Pet-First Enhancements
  sex?: 'M' | 'F';
  weightKg?: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';

  // Play & Personality (NEW)
  playStyle?: ('chase' | 'tug' | 'fetch' | 'wrestle' | 'water')[];
  energy?: 1 | 2 | 3 | 4 | 5; // 1=lap cat, 5=hyper puppy
  sociability?: 'shy' | 'neutral' | 'social';
  goodWith?: {
    dogs?: boolean;
    cats?: boolean;
    kids?: boolean;
    preyDrive?: 'low' | 'medium' | 'high';
  };

  // Care & Verification (NEW)
  badges?: ('vaccinated' | 'microchipped' | 'spayed_neutered' | 'trained' | 'rescue')[];
  verificationStatus?: 'unverified' | 'pending' | 'verified';
  microchipId?: string;
  vetContact?: {
    name: string;
    phone: string;
    clinic: string;
  };

  // Health Records (NEW)
  healthRecords?: {
    vaccines?: VaccineRecord[];
    medications?: MedicationRecord[];
    allergies?: string[];
    conditions?: string[];
    lastCheckup?: string;
  };

  // Availability (NEW)
  availability?: {
    weekdays?: TimeSlot[];
    weekends?: TimeSlot[];
    preferredParks?: string[];
  };

  // Legacy fields (for backward compatibility)
  bio?: string;
  uri?: string;
};

export type Match = {
  _id: string;
  pet1: Pet;
  pet2: Pet;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Message = {
  _id: string;
  matchId: string;
  sender: string;
  content: string;
  read: boolean;
  createdAt: string | Date;
};

// Pet-First Supporting Types
export type VaccineRecord = {
  type: string; // 'rabies', 'dhpp', 'bordetella', etc.
  administeredAt: string;
  expiresAt?: string;
  vetName: string;
  certificateUrl?: string;
};

export type MedicationRecord = {
  name: string;
  dosage: string;
  frequency: string;
  prescribedAt: string;
  expiresAt?: string;
  vetName: string;
  notes?: string;
};

export type TimeSlot = {
  start: string; // '09:00'
  end: string;   // '17:00'
  days: number[]; // 0=Sunday, 6=Saturday
};

export type PlaydateMatch = {
  id: string;
  pet1: Pet;
  pet2: Pet;
  compatibilityScore: number; // 0-100
  compatibilityFactors: {
    playStyle: number;    // 0-25
    energy: number;       // 0-25
    size: number;         // 0-20
    sociability: number;  // 0-15
    location: number;     // 0-15
  };
  recommendedActivities: string[];
  safetyNotes?: string[];
  distanceKm: number;
};

export type LostPetAlert = {
  id: string;
  petId: string;
  status: 'active' | 'found' | 'cancelled';
  lastSeenAt: string;
  lastSeenLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  reward?: number;
  contactInfo: {
    method: 'inapp' | 'phone' | 'email';
    value: string;
  };
  broadcastRadius: number; // km
  sightings: LostPetSighting[];
  createdAt: string;
};

export type LostPetSighting = {
  id: string;
  reporterId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  photos?: string[];
  reportedAt: string;
  verified: boolean;
};

export type Venue = {
  id: string;
  name: string;
  type: 'park' | 'trail' | 'patio' | 'vet' | 'groomer' | 'shelter' | 'store';
  coordinates: { lat: number; lng: number };
  address: string;
  amenities: string[];
  petPolicies: {
    allowed: boolean;
    restrictions?: string[];
    maxSize?: 'small' | 'medium' | 'large' | 'any';
    leashedRequired: boolean;
    fees?: number;
  };
  rating: number; // 1-5
  reviews: number;
};
