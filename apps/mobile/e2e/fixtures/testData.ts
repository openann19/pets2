/**
 * Test data fixtures for E2E tests
 * 
 * Provides deterministic test users, pets, and scenarios
 */

/**
 * Test users for authentication
 */
export const testUsers = {
  newUser: {
    email: 'newuser+e2e@pawfectmatch.com',
    password: 'TestPassword123!',
    name: 'E2E Test User',
  },
  existingUser: {
    email: 'existing+e2e@pawfectmatch.com',
    password: 'TestPassword123!',
    name: 'E2E Existing User',
  },
  premiumUser: {
    email: 'premium+e2e@pawfectmatch.com',
    password: 'TestPassword123!',
    name: 'E2E Premium User',
  },
};

/**
 * Test pets for swipe tests
 */
export const testPets = [
  {
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    personality: ['friendly', 'playful', 'intelligent'],
  },
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Siamese',
    age: 2,
    personality: ['affectionate', 'curious', 'playful'],
  },
  {
    name: 'Max',
    species: 'dog',
    breed: 'Border Collie',
    age: 5,
    personality: ['energetic', 'smart', 'loyal'],
  },
];

/**
 * Test matches
 */
export const testMatches = [
  {
    matchId: 'match_001',
    petName: 'Buddy',
    lastMessage: 'Hello!',
    timestamp: new Date().toISOString(),
  },
  {
    matchId: 'match_002',
    petName: 'Luna',
    lastMessage: 'How are you?',
    timestamp: new Date().toISOString(),
  },
];

/**
 * Test chat messages
 */
export const testMessages = [
  { text: 'Hello!', sent: true },
  { text: 'Hey there!', sent: false },
  { text: 'How are you?', sent: true },
];

/**
 * Test scenarios for feature testing
 */
export const testScenarios = {
  onboarding: {
    skipTutorial: false,
    enableNotifications: true,
    setLocation: true,
  },
  swiping: {
    likesToGive: 10,
    superLikesToGive: 1,
    expectMatches: 3,
  },
  messaging: {
    messagesToSend: 5,
    includePhoto: true,
    includeVoice: false,
  },
  premium: {
    subscribe: true,
    plan: 'monthly',
    expectFeatures: ['unlimited_likes', 'super_likes', 'boost'],
  },
  profile: {
    updatePhotos: true,
    updateBio: true,
    addPreferences: true,
  },
  settings: {
    changeTheme: 'dark',
    enableBiometric: true,
    exportData: false,
  },
};

/**
 * Generate unique test user email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}+${timestamp}${random}@pawfectmatch.com`;
}

/**
 * Generate test pet data
 */
export function generateTestPet(overrides: Record<string, any> = {}) {
  return {
    name: 'Test Pet',
    species: 'dog',
    breed: 'Mixed',
    age: 3,
    personality: ['friendly'],
    ...overrides,
  };
}

