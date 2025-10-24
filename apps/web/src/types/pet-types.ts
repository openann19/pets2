/**
 * Type guard function to check if a pet has the featured property
 */
export function isFeaturedPet(pet) {
    return !!pet.featured?.isFeatured;
}
/**
 * Type guard function to check if a pet has personality tags
 */
export function hasPetPersonality(pet) {
    return !!pet.personalityTags?.length;
}
/**
 * Type guard function to check if a pet has health info
 */
export function hasPetHealthInfo(pet) {
    return !!pet.healthInfo;
}
//# sourceMappingURL=pet-types.js.map