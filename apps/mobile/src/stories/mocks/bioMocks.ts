/**
 * Mock Data for AI Bio Components
 * Production-grade mock data for stories and tests
 */

import type { GeneratedBio } from '../../hooks/useAIBio';

/**
 * Mock validation errors
 */
export const mockValidationErrors = {
  petName: '',
  petBreed: '',
  petAge: '',
  petPersonality: '',
};

export const mockValidationErrorsWithErrors = {
  petName: 'Pet name is required',
  petBreed: 'Pet breed is required',
  petAge: 'Pet age is required',
  petPersonality: 'Pet personality is required',
};

/**
 * Mock generated bio - Playful tone
 */
export const mockBioPlayful: GeneratedBio = {
  bio: "Meet 🎾 Max, the most playful pup you'll ever encounter! This energetic 2-year-old Golden Retriever has more personality than a pack of dogs twice his size. Max lives for adventure - whether it's chasing squirrels, playing fetch until your arm falls off, or making friends with literally everyone at the dog park.\n\nHe's got that infectious Golden Retriever smile and a tail that wags so hard it could power a small generator. Max is the friend who's always ready for your next adventure, bringing joy and endless cuddles wherever he goes. His favorite activities include swimming, hiking, and convincing you to share your snacks with those irresistible puppy eyes!\n\nIf you're looking for a furry best friend who will keep you active and laughing every single day, Max is your guy! 🐾💕",
  keywords: ['playful', 'energetic', 'friendly', 'adventurous', 'Golden Retriever', 'active'],
  sentiment: {
    score: 0.92,
    label: 'Very Positive',
  },
  matchScore: 95,
  createdAt: new Date().toISOString(),
};

/**
 * Mock generated bio - Professional tone
 */
export const mockBioProfessional: GeneratedBio = {
  bio: "Max is a well-mannered 2-year-old Golden Retriever with an impressive pedigree and impeccable temperament. He has undergone professional training and demonstrates excellent obedience skills. Max exhibits a calm, composed demeanor suitable for various professional environments.\n\nHis balanced personality makes him an ideal companion for individuals seeking a reliable, disciplined pet. Max maintains a consistent daily routine and responds well to structured activities. His health records are maintained with the utmost care, and he has received all standard vaccinations and regular veterinary check-ups.\n\nMax represents the ideal combination of loyalty, discipline, and companionship - perfect for those who appreciate the refined qualities of a well-trained companion animal.",
  keywords: ['professional', 'well-trained', 'disciplined', 'reliable', 'obedience'],
  sentiment: {
    score: 0.65,
    label: 'Positive',
  },
  matchScore: 78,
  createdAt: new Date().toISOString(),
};

/**
 * Mock generated bio - Casual tone
 */
export const mockBioCasual: GeneratedBio = {
  bio: "Hey there! 😊 I'm Max, just a regular dude who happens to be a dog. I'm a pretty chill 2-year-old Golden Retriever who loves hanging out, going for walks, and making new friends. Nothing fancy, just a good boy looking for a good home!\n\nI enjoy the simple things in life - playing fetch, belly rubs, and those long lazy afternoons. I'm pretty easy-going and get along with everyone. Sometimes I might get a bit excited around new people, but I mean well!\n\nIf you're looking for a laid-back companion who's down for whatever you're up for, I might be your guy. Let's chat!",
  keywords: ['casual', 'friendly', 'relaxed', 'easy-going', 'laid-back'],
  sentiment: {
    score: 0.75,
    label: 'Positive',
  },
  matchScore: 82,
  createdAt: new Date().toISOString(),
};

/**
 * Mock generated bio - Romantic tone
 */
export const mockBioRomantic: GeneratedBio = {
  bio: "My heart belongs to you... 💕 Meet Max, a tender-hearted 2-year-old Golden Retriever whose love knows no bounds. His gentle eyes sparkle with endless affection, and his warm, welcoming nature makes everyone feel like they've found their soulmate.\n\nMax lives for moments of connection - quiet evenings curled up together, gentle walks under the stars, and those sweet moments when you need unconditional love the most. He's the kind of companion who understands when you need comfort, who celebrates your joys, and who makes every ordinary moment feel special.\n\nIf you're searching for that perfect soul connection, a furry love that completes your world, Max is waiting with open paws and an open heart. Together, we could create countless beautiful memories. Will you be my forever home? 💖",
  keywords: ['romantic', 'affectionate', 'loving', 'tender', 'devoted'],
  sentiment: {
    score: 0.88,
    label: 'Very Positive',
  },
  matchScore: 90,
  createdAt: new Date().toISOString(),
};

/**
 * Mock generated bio - Mysterious tone
 */
export const mockBioMysterious: GeneratedBio = {
  bio: "Beneath the surface lies a story waiting to be discovered... 🕵️‍♂️ Max is not your ordinary Golden Retriever. At 2 years old, he carries an air of mystery that draws you in, challenging you to uncover his true nature.\n\nHis eyes hold secrets of adventures yet to be written. There's something intriguing about the way he watches the world, as if he sees beyond the ordinary. Those who take the time to know Max discover layers of complexity, unexpected intelligence, and a unique perspective on life.\n\nFor those who appreciate the enigmatic, who are drawn to stories yet untold, Max offers the promise of a journey unlike any other. Will you dare to explore the depths of this mysterious companion's soul? The choice is yours...",
  keywords: ['mysterious', 'intriguing', 'enigmatic', 'unique', 'complex'],
  sentiment: {
    score: 0.58,
    label: 'Neutral-Positive',
  },
  matchScore: 72,
  createdAt: new Date().toISOString(),
};

/**
 * Array of all mock bios for easy selection
 */
export const mockBios = [
  mockBioPlayful,
  mockBioProfessional,
  mockBioCasual,
  mockBioRomantic,
  mockBioMysterious,
];

/**
 * Pet form data fixtures
 */
export const mockFormData = {
  empty: {
    petName: '',
    petBreed: '',
    petAge: '',
    petPersonality: '',
  },
  valid: {
    petName: 'Max',
    petBreed: 'Golden Retriever',
    petAge: '2 years old',
    petPersonality: 'Playful, energetic, loves fetch and swimming',
  },
  partial: {
    petName: 'Max',
    petBreed: 'Golden Retriever',
    petAge: '',
    petPersonality: '',
  },
  withPhoto: {
    petName: 'Max',
    petBreed: 'Golden Retriever',
    petAge: '2 years old',
    petPersonality: 'Playful, energetic, loves fetch and swimming',
    photoUri: 'file:///photo.jpg',
  },
};

