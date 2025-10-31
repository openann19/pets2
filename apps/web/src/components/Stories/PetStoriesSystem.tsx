/**
 * PET-FOCUSED STORIES SYSTEM
 *
 * A comprehensive stories system designed specifically for pet owners,
 * featuring pet-focused content, playdate highlights, community events,
 * and interactive pet experiences.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Stories Types
export interface PetStory {
  id: string;
  authorId: string;
  petId: string;
  type: 'photo' | 'video' | 'text' | 'playdate' | 'event' | 'achievement' | 'mood';
  content: StoryContent;
  metadata: StoryMetadata;
  interactions: StoryInteractions;
  expiresAt: Date;
  createdAt: Date;
}

export interface StoryContent {
  mediaUrl?: string;
  thumbnailUrl?: string;
  text?: string;
  duration?: number; // for videos
  location?: GeoPoint;
  tags?: string[];
}

export interface StoryMetadata {
  petName: string;
  petBreed: string;
  petAge: number;
  activity?: string;
  mood?: 'happy' | 'excited' | 'playful' | 'relaxed' | 'curious' | 'tired';
  weather?: WeatherInfo;
  playdate?: PlaydateInfo;
  achievement?: AchievementInfo;
}

export interface StoryInteractions {
  views: number;
  likes: number;
  replies: number;
  shares: number;
  viewerIds: string[];
  likedBy: string[];
}

export interface PlaydateInfo {
  participants: string[]; // pet IDs
  location: GeoPoint;
  activity: string;
  highlights: string[];
}

export interface AchievementInfo {
  type: 'training' | 'social' | 'health' | 'adventure';
  title: string;
  description: string;
  badgeUrl?: string;
}

// Stories Feed System
export class StoriesFeedSystem {
  private static readonly STORY_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_STORIES_PER_USER = 10;

  static async createPetStory(storyData: CreateStoryData): Promise<PetStory> {
    const story: PetStory = {
      id: generateId(),
      authorId: storyData.authorId,
      petId: storyData.petId,
      type: storyData.type,
      content: storyData.content,
      metadata: storyData.metadata,
      interactions: {
        views: 0,
        likes: 0,
        replies: 0,
        shares: 0,
        viewerIds: [],
        likedBy: [],
      },
      expiresAt: new Date(Date.now() + this.STORY_DURATION),
      createdAt: new Date(),
    };

    // Store in database/cache
    await this.persistStory(story);

    // Notify followers
    await this.notifyFollowers(story);

    return story;
  }

  static async getStoriesFeed(userId: string): Promise<StoryGroup[]> {
    // Get stories from friends, followed pets, and nearby pets
    const followingStories = await this.getFollowingStories(userId);
    const nearbyStories = await this.getNearbyStories(userId);
    const trendingStories = await this.getTrendingStories();

    // Group by user/pet
    return this.groupStories([
      ...followingStories,
      ...nearbyStories,
      ...trendingStories,
    ]);
  }

  private static async getFollowingStories(userId: string): Promise<PetStory[]> {
    // Get stories from users and pets the user follows
    const followingIds = await this.getFollowingIds(userId);
    return await this.getStoriesByAuthors(followingIds);
  }

  private static async getNearbyStories(userId: string): Promise<PetStory[]> {
    // Get stories from pets within geographic radius
    const userLocation = await this.getUserLocation(userId);
    const nearbyPets = await this.findNearbyPets(userLocation, 10); // 10km radius

    const nearbyStories = await this.getStoriesByAuthors(nearbyPets.map(p => p.ownerId));
    return nearbyStories.filter(story =>
      story.content.location &&
      this.calculateDistance(userLocation, story.content.location) <= 10
    );
  }

  private static async getTrendingStories(): Promise<PetStory[]> {
    // Algorithm to find trending pet stories
    const recentStories = await this.getRecentStories(24); // Last 24 hours

    return recentStories
      .filter(story => story.interactions.views > 10) // Minimum engagement
      .sort((a, b) => this.calculateTrendingScore(b) - this.calculateTrendingScore(a))
      .slice(0, 20); // Top 20 trending
  }

  private static calculateTrendingScore(story: PetStory): number {
    const hoursSinceCreation = (Date.now() - story.createdAt.getTime()) / (1000 * 60 * 60);
    const engagement = story.interactions.likes + story.interactions.replies * 2 + story.interactions.shares * 3;
    const recency = Math.max(0, 24 - hoursSinceCreation); // Boost recent stories

    return engagement * recency;
  }

  private static groupStories(stories: PetStory[]): StoryGroup[] {
    const groups = new Map<string, PetStory[]>();

    stories.forEach(story => {
      const key = `${story.authorId}-${story.petId}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(story);
    });

    return Array.from(groups.entries()).map(([key, userStories]) => ({
      id: key,
      authorId: userStories[0].authorId,
      petId: userStories[0].petId,
      stories: userStories.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      lastUpdated: userStories[0].createdAt,
    }));
  }

  // Persistence and notifications
  private static async persistStory(story: PetStory): Promise<void> {
    // Implement database persistence
  }

  private static async notifyFollowers(story: PetStory): Promise<void> {
    // Send push notifications to followers
  }

  private static calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    // Haversine formula
    const R = 6371;
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper methods for data access
  private static async getFollowingIds(userId: string): Promise<string[]> {
    // Get IDs of followed users and pets
    return [];
  }

  private static async getUserLocation(userId: string): Promise<GeoPoint> {
    // Get user's current location
    return { lat: 0, lng: 0 };
  }

  private static async findNearbyPets(location: GeoPoint, radiusKm: number): Promise<Pet[]> {
    // Find pets within radius
    return [];
  }

  private static async getStoriesByAuthors(authorIds: string[]): Promise<PetStory[]> {
    // Get stories by author IDs
    return [];
  }

  private static async getRecentStories(hours: number): Promise<PetStory[]> {
    // Get stories from last N hours
    return [];
  }
}

// React Hooks for Stories System
export const usePetStories = (userId: string) => {
  return useQuery({
    queryKey: ['pet-stories', userId],
    queryFn: () => StoriesFeedSystem.getStoriesFeed(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreatePetStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyData: CreateStoryData) =>
      StoriesFeedSystem.createPetStory(storyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-stories'] });
    },
  });
};

export const useStoryInteractions = (storyId: string) => {
  const queryClient = useQueryClient();

  const likeStory = useMutation({
    mutationFn: () => api.likeStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-stories'] });
    },
  });

  const replyToStory = useMutation({
    mutationFn: (replyData: ReplyData) => api.replyToStory(storyId, replyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-stories'] });
    },
  });

  return {
    likeStory,
    replyToStory,
  };
};

// Story Creation Components
export const PetStoryCreator = ({ petId, onStoryCreated }: PetStoryCreatorProps) => {
  const [storyType, setStoryType] = useState<PetStory['type']>('photo');
  const [content, setContent] = useState<Partial<StoryContent>>({});
  const [metadata, setMetadata] = useState<Partial<StoryMetadata>>({});

  const createStory = useCreatePetStory();

  const handleCreateStory = useCallback(async () => {
    if (!content.text && !content.mediaUrl) return;

    await createStory.mutateAsync({
      petId,
      type: storyType,
      content: content as StoryContent,
      metadata: metadata as StoryMetadata,
    });

    onStoryCreated?.();
  }, [petId, storyType, content, metadata, createStory, onStoryCreated]);

  return (
    <div className="pet-story-creator">
      <StoryTypeSelector value={storyType} onChange={setStoryType} />

      {storyType === 'text' && (
        <TextStoryEditor
          value={content.text || ''}
          onChange={(text) => setContent(prev => ({ ...prev, text }))}
        />
      )}

      {storyType === 'photo' && (
        <PhotoStoryUploader
          onUpload={(mediaUrl, thumbnailUrl) =>
            setContent(prev => ({ ...prev, mediaUrl, thumbnailUrl }))
          }
        />
      )}

      <PetMetadataForm
        value={metadata}
        onChange={setMetadata}
        storyType={storyType}
      />

      <button
        onClick={handleCreateStory}
        disabled={createStory.isPending}
        className="create-story-button"
      >
        {createStory.isPending ? 'Creating...' : 'Share Story'}
      </button>
    </div>
  );
};

// Story Viewer with Pet Context
export const PetStoryViewer = ({ story, onClose, onNext, onPrevious }: PetStoryViewerProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Auto-advance stories
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext?.();
          return 0;
        }
        return prev + (100 / 5000) * 100; // 5 seconds per story
      });
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, onNext]);

  const currentStory = story.stories[currentStoryIndex];
  const interactions = useStoryInteractions(currentStory.id);

  return (
    <div className="pet-story-viewer">
      {/* Progress bars */}
      <div className="story-progress">
        {story.stories.map((_, index) => (
          <div
            key={index}
            className={`progress-bar ${index <= currentStoryIndex ? 'active' : ''}`}
            style={{
              width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%'
            }}
          />
        ))}
      </div>

      {/* Story content */}
      <div className="story-content">
        {currentStory.type === 'text' && (
          <TextStoryDisplay story={currentStory} />
        )}

        {currentStory.type === 'photo' && (
          <PhotoStoryDisplay story={currentStory} />
        )}

        {currentStory.type === 'playdate' && (
          <PlaydateStoryDisplay story={currentStory} />
        )}

        {currentStory.type === 'achievement' && (
          <AchievementStoryDisplay story={currentStory} />
        )}
      </div>

      {/* Pet info overlay */}
      <div className="pet-info-overlay">
        <div className="pet-avatar">
          <img src={currentStory.metadata.petPhoto} alt={currentStory.metadata.petName} />
        </div>
        <div className="pet-details">
          <h3>{currentStory.metadata.petName}</h3>
          <p>{currentStory.metadata.petBreed}, {currentStory.metadata.petAge} years old</p>
          {currentStory.metadata.mood && (
            <span className="mood-indicator">{currentStory.metadata.mood}</span>
          )}
        </div>
      </div>

      {/* Interaction buttons */}
      <div className="story-interactions">
        <button
          onClick={() => interactions.likeStory.mutate()}
          className={`like-button ${currentStory.interactions.likedBy.includes(userId) ? 'liked' : ''}`}
        >
          ❤️ {currentStory.interactions.likes}
        </button>

        <button
          onClick={() => setShowReplies(true)}
          className="reply-button"
        >
          💬 {currentStory.interactions.replies}
        </button>
      </div>
    </div>
  );
};

// Specialized Story Components
export const PlaydateStoryDisplay = ({ story }: { story: PetStory }) => {
  const playdateInfo = story.metadata.playdate!;

  return (
    <div className="playdate-story">
      <div className="playdate-header">
        <h2>🎾 Playdate Time!</h2>
        <p>{story.metadata.petName} had an amazing time!</p>
      </div>

      <div className="playdate-participants">
        <h3>Participants:</h3>
        <div className="pet-avatars">
          {playdateInfo.participants.map(participantId => (
            <PetAvatar key={participantId} petId={participantId} />
          ))}
        </div>
      </div>

      <div className="playdate-activity">
        <h3>Activity: {playdateInfo.activity}</h3>
      </div>

      <div className="playdate-highlights">
        <h3>Highlights:</h3>
        <ul>
          {playdateInfo.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const AchievementStoryDisplay = ({ story }: { story: PetStory }) => {
  const achievement = story.metadata.achievement!;

  return (
    <div className="achievement-story">
      <div className="achievement-header">
        <div className="achievement-badge">
          {achievement.badgeUrl ? (
            <img src={achievement.badgeUrl} alt="Achievement Badge" />
          ) : (
            <div className="default-badge">🏆</div>
          )}
        </div>
        <h2>Achievement Unlocked!</h2>
      </div>

      <div className="achievement-details">
        <h3>{achievement.title}</h3>
        <p>{achievement.description}</p>
        <span className="achievement-type">{achievement.type}</span>
      </div>

      <div className="celebration">
        <p>🎉 Congratulations to {story.metadata.petName}! 🎉</p>
      </div>
    </div>
  );
};

// Stories Feed Component
export const PetStoriesFeed = ({ userId }: { userId: string }) => {
  const { data: storyGroups, isLoading } = usePetStories(userId);
  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  if (isLoading) {
    return <StoriesSkeleton />;
  }

  return (
    <div className="pet-stories-feed">
      {/* Stories bar */}
      <div className="stories-bar">
        {/* Create story button */}
        <div
          className="create-story-button"
          onClick={() => setShowCreator(true)}
        >
          <div className="create-story-avatar">
            <span>+</span>
          </div>
          <span>Your Pet's Story</span>
        </div>

        {/* Story groups */}
        {storyGroups?.map(group => (
          <StoryGroupItem
            key={group.id}
            group={group}
            onClick={() => setSelectedGroup(group)}
          />
        ))}
      </div>

      {/* Story viewer modal */}
      {selectedGroup && (
        <PetStoryViewer
          story={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onNext={() => {
            const currentIndex = storyGroups?.findIndex(g => g.id === selectedGroup.id) || 0;
            const nextIndex = (currentIndex + 1) % (storyGroups?.length || 1);
            setSelectedGroup(storyGroups?.[nextIndex] || null);
          }}
          onPrevious={() => {
            const currentIndex = storyGroups?.findIndex(g => g.id === selectedGroup.id) || 0;
            const prevIndex = currentIndex === 0 ? (storyGroups?.length || 1) - 1 : currentIndex - 1;
            setSelectedGroup(storyGroups?.[prevIndex] || null);
          }}
        />
      )}

      {/* Story creator modal */}
      {showCreator && (
        <PetStoryCreator
          petId={userId} // Could be selected pet
          onStoryCreated={() => setShowCreator(false)}
        />
      )}
    </div>
  );
};

// Helper Components
const StoryGroupItem = ({ group, onClick }: { group: StoryGroup; onClick: () => void }) => {
  const latestStory = group.stories[0];
  const hasUnviewedStories = group.stories.some(story =>
    !story.interactions.viewerIds.includes(userId)
  );

  return (
    <div
      className={`story-group-item ${hasUnviewedStories ? 'unviewed' : ''}`}
      onClick={onClick}
    >
      <div className="story-avatar">
        <img
          src={latestStory.content.thumbnailUrl || '/pet-placeholder.jpg'}
          alt={latestStory.metadata.petName}
        />
        {hasUnviewedStories && <div className="unviewed-indicator" />}
      </div>
      <span className="pet-name">{latestStory.metadata.petName}</span>
    </div>
  );
};

const StoriesSkeleton = () => (
  <div className="stories-skeleton">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="skeleton-story">
        <div className="skeleton-avatar" />
        <div className="skeleton-name" />
      </div>
    ))}
  </div>
);

// Type definitions
interface CreateStoryData {
  authorId: string;
  petId: string;
  type: PetStory['type'];
  content: StoryContent;
  metadata: StoryMetadata;
}

interface StoryGroup {
  id: string;
  authorId: string;
  petId: string;
  stories: PetStory[];
  lastUpdated: Date;
}

interface PetStoryCreatorProps {
  petId: string;
  onStoryCreated?: () => void;
}

interface PetStoryViewerProps {
  story: StoryGroup;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

interface GeoPoint {
  lat: number;
  lng: number;
}

interface Pet {
  id: string;
  ownerId: string;
  name: string;
  location: GeoPoint;
}

interface WeatherInfo {
  condition: string;
  temperature: number;
  humidity: number;
}

interface ReplyData {
  content: string;
  mediaUrl?: string;
}

// Mock API functions (replace with real API calls)
const api = {
  likeStory: async (storyId: string) => ({ success: true }),
  replyToStory: async (storyId: string, replyData: ReplyData) => ({ success: true }),
};

const userId = 'current-user'; // Replace with actual user ID from auth context

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
