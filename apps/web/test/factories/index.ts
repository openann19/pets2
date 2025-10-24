/**
 * Export all test factories for easy importing
 */

export * from './matchFactory';
export * from './petFactory';
export * from './userFactory';

// Re-export commonly used factory functions with shorter names
export {
    createAdminUser as adminUser, createPremiumUser as premiumUser, createUser as user, createUsers as users
} from './userFactory';

export {
    createCat as cat, createDog as dog, createIdealMatchPet as idealMatchPet, createPet as pet, createPets as pets,
    createSpecialNeedsPet as specialNeedsPet
} from './petFactory';

export {
    createActiveMatch as activeMatch, createHighCompatibilityMatch as highCompatibilityMatch, createMatch as match, createMatches as matches, createNewMatch as newMatch
} from './matchFactory';
