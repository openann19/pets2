import { getAsset } from '../../assets/index';

export interface DemoAdoptionItem {
  id: string;
  petId: string;
  status: 'available' | 'pending' | 'adopted';
  postedAt: string;
  image: string;
}

const isoDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const demoAdoptionItems: DemoAdoptionItem[] = [
  {
    id: 'adopt-1',
    petId: 'demo1',
    status: 'available',
    postedAt: isoDaysAgo(1),
    image: getAsset('pets/buddy.jpg'),
  },
  {
    id: 'adopt-2',
    petId: 'demo3',
    status: 'pending',
    postedAt: isoDaysAgo(3),
    image: getAsset('pets/piper.jpg'),
  },
];