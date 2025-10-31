import { getAsset } from '../../assets/index';

export interface DemoPet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed: string;
  age: number;
  image: string;
  description: string;
}

export const demoPets: DemoPet[] = [
  {
    id: 'demo1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    image: getAsset('pets/buddy.jpg'),
    description: 'Friendly and energetic. Loves agility courses and lake days.',
  },
  {
    id: 'demo2',
    name: 'Mittens',
    species: 'Cat',
    breed: 'Siamese',
    age: 2,
    image: getAsset('pets/mittens.jpg'),
    description: 'Sunbeam connoisseur with a knack for winning over new friends.',
  },
  {
    id: 'demo3',
    name: 'Piper',
    species: 'Dog',
    breed: 'Border Collie',
    age: 4,
    image: getAsset('pets/piper.jpg'),
    description: 'Clicker-training prodigy who thrives on puzzles and fetch relays.',
  },
  {
    id: 'demo4',
    name: 'Mochi',
    species: 'Dog',
    breed: 'Shiba Inu',
    age: 1,
    image: getAsset('pets/mochi.jpg'),
    description: 'Adventurous pup obsessed with scenic hikes and squeaky toys.',
  },
];