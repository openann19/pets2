/**
 * 🔄 Pet Card Data Adapter
 * Converts existing Pet type to new PetCardData structure for SwipeCardV2
 */
/**
 * Convert Pet to PetCardData for SwipeCardV2
 */
export const adaptPetToCardData = (pet) => {
    // Calculate distance (placeholder - would need actual user location)
    const distanceKm = pet.owner?.location !== undefined ? 2.5 : 0; // Placeholder distance
    // Get photos array
    const photos = pet.photos.map((photo) => photo.url);
    // Calculate compatibility score (placeholder - would use AI service)
    const compatibility = Math.floor(Math.random() * 40) + 60; // 60-100% range
    return {
        id: pet._id,
        name: pet.name,
        breed: pet.breed ?? 'Mixed',
        age: pet.age,
        size: pet.size,
        distanceKm,
        bio: pet.description ?? 'Super friendly and loves to play!',
        photos,
        compatibility,
        gender: pet.gender,
        species: pet.species,
    };
};
/**
 * Convert multiple Pet objects to PetCardData array
 */
export const adaptPetsToCardData = (pets) => {
    return pets.map(adaptPetToCardData);
};
/**
 * Mock data generator for testing
 */
export const generateMockPetCardData = () => {
    const names = ['Buddy', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Rocky', 'Molly'];
    const breeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle'];
    const sizes = ['tiny', 'small', 'medium', 'large', 'extra-large'];
    const bios = [
        'Super friendly and loves the water!',
        'Playful and energetic, great with kids!',
        'Calm and gentle, perfect for cuddles!',
        'Adventurous and loves long walks!',
        'Sweet and loyal companion!',
    ];
    return {
        id: Math.random().toString(36).substring(2, 11),
        name: names[Math.floor(Math.random() * names.length)],
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        age: Math.random() * 10 + 1,
        size: sizes[Math.floor(Math.random() * sizes.length)],
        distanceKm: Math.random() * 20 + 1,
        bio: bios[Math.floor(Math.random() * bios.length)],
        photos: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=500&fit=crop',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=500&fit=crop',
        ],
        compatibility: Math.floor(Math.random() * 40) + 60,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        species: 'dog',
    };
};
//# sourceMappingURL=petCardAdapter.js.map