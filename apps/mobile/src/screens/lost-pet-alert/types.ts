/**
 * Lost Pet Alert Types
 * Type definitions for lost pet alert functionality
 */
export interface LostPetAlertWithSightings {
  id: string;
  petId: string;
  status: 'active' | 'found' | 'cancelled';
  lastSeenLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  reward?: number;
  broadcastRadius?: number;
  sightings?: LostPetSighting[];
  createdAt: string;
  updatedAt?: string;
}

export interface LostPetSighting {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  reportedAt: string;
}

export interface AlertFormData {
  lastSeenLocation: string;
  description: string;
  reward: string;
  broadcastRadius: number;
  contactMethod: 'inapp' | 'phone' | 'email';
  contactValue: string;
}

export interface SightingFormData {
  location: string;
  description: string;
  contactInfo: string;
}

