/**
 * Demo Stories Fixtures
 * Deterministic data for StoriesScreen in demo mode
 */

export interface Story {
  _id: string;
  userId: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  caption?: string;
  duration: number; // ms
  viewCount: number;
  createdAt: string; // ISO
}

export interface StoryUser {
  _id: string;
  username: string;
  profilePhoto?: string;
}

export interface StoryGroup {
  userId: string;
  user: StoryUser;
  stories: Story[];
  storyCount: number;
}

const now = new Date().toISOString();

export const demoStories: StoryGroup[] = [
  {
    userId: 'demo-user-1',
    user: {
      _id: 'demo-user-1',
      username: 'BuddyOwner',
      profilePhoto: 'https://via.placeholder.com/40',
    },
    stories: [
      {
        _id: 'story-1',
        userId: 'demo-user-1',
        mediaType: 'photo',
        mediaUrl: 'https://via.placeholder.com/400x800',
        caption: 'Morning walk with Buddy! 🐾',
        duration: 5000,
        viewCount: 42,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        _id: 'story-2',
        userId: 'demo-user-1',
        mediaType: 'video',
        mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        caption: 'Buddy playing fetch',
        duration: 10000,
        viewCount: 38,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
    ],
    storyCount: 2,
  },
  {
    userId: 'demo-user-2',
    user: {
      _id: 'demo-user-2',
      username: 'MittensMom',
      profilePhoto: 'https://via.placeholder.com/40',
    },
    stories: [
      {
        _id: 'story-3',
        userId: 'demo-user-2',
        mediaType: 'photo',
        mediaUrl: 'https://via.placeholder.com/400x800',
        caption: 'Mittens found a new favorite spot!',
        duration: 5000,
        viewCount: 25,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      },
    ],
    storyCount: 1,
  },
];

