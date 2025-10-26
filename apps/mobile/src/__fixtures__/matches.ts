/**
 * Match and message test fixtures
 */

export const testMatches = {
  active: {
    id: 'match-1',
    userId: 'user-1',
    petId: 'pet-dog-1',
    matchedUserId: 'user-2',
    matchedPetId: 'pet-dog-2',
    status: 'active',
    createdAt: '2024-06-01T10:00:00Z',
    lastMessageAt: '2024-06-15T14:30:00Z',
    unreadCount: 0,
    matchedUser: {
      id: 'user-2',
      name: 'Jane Doe',
      avatar: 'https://example.com/avatars/jane.jpg',
    },
    matchedPet: {
      id: 'pet-dog-2',
      name: 'Charlie',
      type: 'dog',
      breed: 'Beagle',
      age: 4,
      photos: ['https://example.com/pets/charlie1.jpg'],
    },
  },

  new: {
    id: 'match-new',
    userId: 'user-1',
    petId: 'pet-dog-1',
    matchedUserId: 'user-3',
    matchedPetId: 'pet-dog-3',
    status: 'new',
    createdAt: '2024-06-20T08:00:00Z',
    lastMessageAt: null,
    unreadCount: 1,
    matchedUser: {
      id: 'user-3',
      name: 'Bob Smith',
      avatar: 'https://example.com/avatars/bob.jpg',
    },
    matchedPet: {
      id: 'pet-dog-3',
      name: 'Luna',
      type: 'dog',
      breed: 'Husky',
      age: 2,
      photos: ['https://example.com/pets/luna1.jpg'],
    },
  },

  archived: {
    id: 'match-archived',
    userId: 'user-1',
    petId: 'pet-dog-1',
    matchedUserId: 'user-4',
    matchedPetId: 'pet-dog-4',
    status: 'archived',
    createdAt: '2024-04-01T10:00:00Z',
    lastMessageAt: '2024-04-05T16:00:00Z',
    unreadCount: 0,
    matchedUser: {
      id: 'user-4',
      name: 'Alice Johnson',
      avatar: 'https://example.com/avatars/alice.jpg',
    },
    matchedPet: {
      id: 'pet-dog-4',
      name: 'Rocky',
      type: 'dog',
      breed: 'German Shepherd',
      age: 5,
      photos: ['https://example.com/pets/rocky1.jpg'],
    },
  },
};

export const testMessages = {
  sent: {
    id: 'msg-1',
    matchId: 'match-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    text: 'Hey! Our dogs would love to play together!',
    timestamp: '2024-06-15T14:30:00Z',
    read: true,
    delivered: true,
  },

  received: {
    id: 'msg-2',
    matchId: 'match-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    text: 'That sounds great! When are you free?',
    timestamp: '2024-06-15T14:32:00Z',
    read: false,
    delivered: true,
  },

  pending: {
    id: 'msg-pending',
    matchId: 'match-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    text: 'How about tomorrow at 3pm?',
    timestamp: '2024-06-15T14:35:00Z',
    read: false,
    delivered: false,
    pending: true,
  },

  withImage: {
    id: 'msg-image',
    matchId: 'match-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    text: null,
    image: 'https://example.com/messages/img1.jpg',
    timestamp: '2024-06-15T14:40:00Z',
    read: false,
    delivered: true,
  },
};

export const testConversation = [
  testMessages.sent,
  testMessages.received,
  testMessages.pending,
  testMessages.withImage,
];

export const testMatchList = Object.values(testMatches);
