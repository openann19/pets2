import type { Match } from '../../hooks/useMatchesData';
import { getAsset } from '../../assets/index';

const now = new Date();

const daysAgo = (days: number): string => {
  const date = new Date(now);
  date.setDate(now.getDate() - days);
  return date.toISOString();
};

export const demoMatches: Match[] = [
  {
    _id: 'match-1',
    petId: 'demo1',
    petName: 'Buddy',
    petPhoto: getAsset('pets/buddy.jpg'),
    petAge: 3,
    petBreed: 'Golden Retriever',
    lastMessage: {
      content: 'Can’t wait to meet at the West Loop dog park this weekend! 🐾',
      timestamp: daysAgo(1),
      senderId: 'userA',
    },
    isOnline: true,
    matchedAt: daysAgo(2),
    unreadCount: 1,
  },
  {
    _id: 'match-2',
    petId: 'demo2',
    petName: 'Mittens',
    petPhoto: getAsset('pets/mittens.jpg'),
    petAge: 2,
    petBreed: 'Siamese',
    lastMessage: {
      content: 'Shared the adoption checklist—let me know if you have questions!',
      timestamp: daysAgo(3),
      senderId: 'userB',
    },
    isOnline: false,
    matchedAt: daysAgo(5),
    unreadCount: 0,
  },
  {
    _id: 'match-3',
    petId: 'demo3',
    petName: 'Piper',
    petPhoto: getAsset('pets/piper.jpg'),
    petAge: 4,
    petBreed: 'Border Collie',
    lastMessage: {
      content: 'Piper learned a new trick! Sending a video shortly.',
      timestamp: daysAgo(0),
      senderId: 'userC',
    },
    isOnline: true,
    matchedAt: daysAgo(0),
    unreadCount: 4,
  },
];

export const demoLikedYou: Match[] = [
  {
    _id: 'match-liked-1',
    petId: 'demo4',
    petName: 'Mochi',
    petPhoto: getAsset('pets/mochi.jpg'),
    petAge: 1,
    petBreed: 'Shiba Inu',
    lastMessage: {
      content: '',
      timestamp: daysAgo(4),
      senderId: 'userD',
    },
    isOnline: false,
    matchedAt: daysAgo(4),
    unreadCount: 0,
  },
];