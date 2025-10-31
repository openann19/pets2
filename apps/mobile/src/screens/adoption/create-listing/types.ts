/**
 * Create Listing Types
 */

export interface PetListingFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  photos: string[];
}

