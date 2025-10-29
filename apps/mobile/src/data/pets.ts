export interface PetProfile {
  id: string;
  name: string;
  breed: string;
  distance: string;
  personality: string[];
  photo: string;
}

export const featuredPets: PetProfile[] = [
  {
    id: 'luna',
    name: 'Luna',
    breed: 'Golden Retriever',
    distance: '2 miles away',
    personality: ['Gentle', 'Playful', 'Great with kids'],
    photo:
      'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'milo',
    name: 'Milo',
    breed: 'Border Collie',
    distance: '4 miles away',
    personality: ['Intelligent', 'Active', 'Agility champion'],
    photo:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'nova',
    name: 'Nova',
    breed: 'Australian Shepherd',
    distance: '7 miles away',
    personality: ['Affectionate', 'Alert', 'Family ready'],
    photo:
      'https://images.unsplash.com/photo-1489417139533-915815598d31?auto=format&fit=crop&w=600&q=80',
  },
];
