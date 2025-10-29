// Removed empty import statement

/**
 * Legacy pet shape from web API responses
 */
export interface LegacyWebPet {
  id: string;
  ownerId?: string;
  name: string;
  species?: string;
  breed: string;
  age: number;
  gender?: 'male' | 'female';
  size?: string;
  weight?: number;
  photos?: Array<string | { url: string; isPrimary?: boolean }>;
  description?: string;
  temperament?: string[];
  location?:
    | {
        latitude?: number;
        longitude?: number;
      }
    | {
        lat?: number;
        lon?: number;
        coordinates?: [number, number];
      };
}

/**
 * Convert legacy web pet to core Pet type
 */
import type { Pet } from '../types';

export function toCorePet(legacy: LegacyWebPet): Pet {
  const now = new Date().toISOString();

  // Handle various location formats
  let coordinates: [number, number] = [0, 0];
  if (legacy.location != null) {
    if ('coordinates' in legacy.location && Array.isArray(legacy.location.coordinates)) {
      coordinates = legacy.location.coordinates;
    } else if ('latitude' in legacy.location && 'longitude' in legacy.location) {
      coordinates = [legacy.location.longitude ?? 0, legacy.location.latitude ?? 0];
    } else if ('lon' in legacy.location && 'lat' in legacy.location) {
      coordinates = [legacy.location.lon ?? 0, legacy.location.lat ?? 0];
    }
  }

  // Normalize size
  const sizeMap: Record<string, Pet['size']> = {
    'small': 'small',
    'medium': 'medium',
    'large': 'large',
    'tiny': 'tiny',
    'extra-large': 'extra-large',
    'xl': 'extra-large',
  };
  const size =
    legacy.size != null && legacy.size.length > 0
      ? (sizeMap[legacy.size.toLowerCase()] ?? 'medium')
      : 'medium';

  // Normalize species
  const speciesMap: Record<string, Pet['species']> = {
    dog: 'dog',
    cat: 'cat',
    bird: 'bird',
    rabbit: 'rabbit',
  };
  const species =
    legacy.species != null && legacy.species.length > 0
      ? (speciesMap[legacy.species.toLowerCase()] ?? 'other')
      : 'dog';

  // Convert photos
  const photos = (legacy.photos != null ? legacy.photos : []).map((photo, index) => ({
    url: typeof photo === 'string' ? photo : photo.url,
    isPrimary:
      typeof photo === 'object'
        ? photo.isPrimary != null
          ? photo.isPrimary
          : index === 0
        : index === 0,
    caption: '',
  }));

  const corePet: Pet = {
    _id: legacy.id,
    id: legacy.id,
    owner: legacy.ownerId != null ? legacy.ownerId : '',
    name: legacy.name.length > 0 ? legacy.name : 'Unknown',
    species,
    breed: legacy.breed.length > 0 ? legacy.breed : 'Mixed',
    age: !isNaN(legacy.age) ? legacy.age : 0,
    gender: legacy.gender != null ? legacy.gender : 'male',
    size,
    ...(legacy.weight != null && !isNaN(legacy.weight) && { weight: legacy.weight }),
    photos,
    videos: [],
    description:
      legacy.description != null && legacy.description.length > 0 ? legacy.description : '',
    personalityTags: legacy.temperament != null ? legacy.temperament : [],
    intent: 'all',
    availability: {
      isAvailable: true,
    },
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
    location: {
      type: 'Point',
      coordinates,
    },
    featured: {
      isFeatured: false,
      boostCount: 0,
    },
    analytics: {
      views: 0,
      likes: 0,
      matches: 0,
      messages: 0,
    },
    isActive: true,
    isVerified: false,
    status: 'active',
    listedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  return corePet;
}

/**
 * Convert array of legacy pets to core Pet types
 */
export function toCorePets(legacyPets: LegacyWebPet[]): Pet[] {
  return legacyPets.map(toCorePet);
}

/**
 * Convert core Pet to legacy format (for API requests)
 */
export function toLegacyPet(pet: Pet): LegacyWebPet {
  const legacy: LegacyWebPet = {
    id: pet._id,
    name: pet.name,
    breed: pet.breed,
    age: pet.age,
  };

  if (typeof pet.owner === 'string') {
    legacy.ownerId = pet.owner;
  } else if (typeof pet.owner === 'object' && '_id' in pet.owner) {
    legacy.ownerId = pet.owner._id;
  }

  legacy.species = pet.species;
  legacy.gender = pet.gender;
  legacy.size = pet.size;
  if (pet.weight != null) legacy.weight = pet.weight;
  if (pet.description != null) legacy.description = pet.description;
  legacy.temperament = pet.personalityTags;

  if (pet.photos.length > 0) {
    legacy.photos = pet.photos.map((p) => ({ url: p.url, isPrimary: p.isPrimary }));
  }

  legacy.location = {
    longitude: pet.location.coordinates[0],
    latitude: pet.location.coordinates[1],
  };

  return legacy;
}
