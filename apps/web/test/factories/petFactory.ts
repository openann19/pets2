/**
 * Factory for creating Pet test data with sensible defaults
 * Provides full type safety and easy overrides for testing
 */

interface Pet {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed: string;
    age: number;
    size: 'small' | 'medium' | 'large';
    gender: 'male' | 'female';
    color: string;
    temperament: string[];
    description: string;
    photos: string[];
    videos?: string[];
    location: {
        city: string;
        state: string;
        country: string;
        coordinates?: { lat: number; lng: number };
    };
    owner: {
        id: string;
        name: string;
        avatar?: string;
    };
    health: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        allergies?: string[];
        medications?: string[];
        conditions?: string[];
    };
    preferences: {
        goodWithKids: boolean;
        goodWithPets: boolean;
        energyLevel: 'low' | 'medium' | 'high';
        training: 'none' | 'basic' | 'advanced';
        houseTrained: boolean;
    };
    availability: {
        status: 'available' | 'pending' | 'adopted';
        adoptionFee?: number;
        specialNeeds?: boolean;
    };
    createdAt: string;
    updatedAt: string;
    featured?: boolean;
    verified?: boolean;
}

/**
 * Creates a Pet with sensible defaults for testing
 */
export function createPet(overrides: Partial<Pet> = {}): Pet {
    const breeds = {
        dog: ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle'],
        cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll'],
        bird: ['Parrot', 'Canary', 'Cockatiel', 'Budgie', 'Lovebird'],
        rabbit: ['Holland Lop', 'Flemish Giant', 'Angora', 'Rex', 'Dutch'],
        other: ['Guinea Pig', 'Hamster', 'Ferret', 'Chinchilla', 'Hedgehog'],
    };

    const species = overrides.species ?? 'dog';
    const breedOptions = breeds[species];
    const randomBreed = breedOptions[Math.floor(Math.random() * breedOptions.length)] ?? 'Mixed Breed';

    const basePet: Pet = {
        id: `pet-${Math.random().toString(36).substring(2, 11)}`,
        name: `Pet ${Math.random().toString(36).substring(2, 5)}`,
        species,
        breed: randomBreed,
        age: Math.floor(Math.random() * 12) + 1,
        size: 'medium',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        color: 'Brown',
        temperament: ['friendly', 'playful'],
        description: 'A wonderful pet looking for a loving home.',
        photos: [
            `https://example.com/pet-photo-1-${Math.random().toString(36).substring(2, 7)}.jpg`,
            `https://example.com/pet-photo-2-${Math.random().toString(36).substring(2, 7)}.jpg`,
        ],
        videos: [
            `https://example.com/pet-video-${Math.random().toString(36).substring(2, 7)}.mp4`,
        ],
        location: {
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            coordinates: { lat: 37.7749, lng: -122.4194 },
        },
        owner: {
            id: `owner-${Math.random().toString(36).substring(2, 11)}`,
            name: `Owner ${Math.random().toString(36).substring(2, 5)}`,
            avatar: `https://example.com/owner-avatar-${Math.random().toString(36).substring(2, 7)}.jpg`,
        },
        health: {
            vaccinated: true,
            spayedNeutered: true,
            microchipped: true,
            allergies: [],
            medications: [],
            conditions: [],
        },
        preferences: {
            goodWithKids: true,
            goodWithPets: true,
            energyLevel: 'medium',
            training: 'basic',
            houseTrained: true,
        },
        availability: {
            status: 'available',
            adoptionFee: Math.floor(Math.random() * 500) + 100,
            specialNeeds: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
        verified: true,
    };

    return { ...basePet, ...overrides };
}

/**
 * Creates a dog with specific breed and characteristics
 */
export function createDog(breed?: string, overrides: Partial<Pet> = {}): Pet {
    const dogBreeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Chihuahua', 'Beagle'];
    const selectedBreed = breed ?? dogBreeds[Math.floor(Math.random() * dogBreeds.length)] ?? 'Mixed Breed';

    return createPet({
        species: 'dog',
        breed: selectedBreed,
        temperament: ['loyal', 'playful', 'friendly'],
        preferences: {
            goodWithKids: true,
            goodWithPets: true,
            energyLevel: 'high',
            training: 'basic',
            houseTrained: true,
        },
        ...overrides,
    });
}

/**
 * Creates a cat with specific breed and characteristics
 */
export function createCat(breed?: string, overrides: Partial<Pet> = {}): Pet {
    const catBreeds = ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Tabby'];
    const selectedBreed = breed ?? catBreeds[Math.floor(Math.random() * catBreeds.length)] ?? 'Mixed Breed';

    return createPet({
        species: 'cat',
        breed: selectedBreed,
        temperament: ['independent', 'calm', 'affectionate'],
        preferences: {
            goodWithKids: true,
            goodWithPets: false,
            energyLevel: 'low',
            training: 'none',
            houseTrained: true,
        },
        ...overrides,
    });
}

/**
 * Creates a pet with special needs for testing accessibility features
 */
export function createSpecialNeedsPet(overrides: Partial<Pet> = {}): Pet {
    return createPet({
        availability: {
            status: 'available',
            adoptionFee: 50, // Reduced fee for special needs
            specialNeeds: true,
        },
        health: {
            vaccinated: true,
            spayedNeutered: true,
            microchipped: true,
            allergies: ['wheat', 'corn'],
            medications: ['insulin', 'pain medication'],
            conditions: ['diabetes', 'arthritis'],
        },
        description: 'A special needs pet who needs extra care and love. Medical support provided.',
        ...overrides,
    });
}

/**
 * Creates a batch of pets for testing lists and filtering
 */
export function createPets(count: number, overrides: Partial<Pet> = {}): Pet[] {
    return Array.from({ length: count }, (_, index) =>
        createPet({
            name: `Pet ${(index + 1).toString()}`,
            ...overrides,
        })
    );
}

/**
 * Creates pets with different species for testing filters
 */
export function createMixedSpeciesPets(): Pet[] {
    return [
        createDog('Golden Retriever', { name: 'Buddy' }),
        createCat('Siamese', { name: 'Whiskers' }),
        createPet({ species: 'bird', breed: 'Parrot', name: 'Polly' }),
        createPet({ species: 'rabbit', breed: 'Holland Lop', name: 'Bunny' }),
    ];
}

/**
 * Creates a pet that's perfect for matching tests (high compatibility)
 */
export function createIdealMatchPet(overrides: Partial<Pet> = {}): Pet {
    return createPet({
        temperament: ['friendly', 'playful', 'gentle', 'loyal'],
        health: {
            vaccinated: true,
            spayedNeutered: true,
            microchipped: true,
            allergies: [],
            medications: [],
            conditions: [],
        },
        preferences: {
            goodWithKids: true,
            goodWithPets: true,
            energyLevel: 'medium',
            training: 'advanced',
            houseTrained: true,
        },
        availability: {
            status: 'available',
            adoptionFee: 200,
            specialNeeds: false,
        },
        featured: true,
        verified: true,
        ...overrides,
    });
}