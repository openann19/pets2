/**
 * PET-FOCUSED COMMUNITY GROUPS SYSTEM
 *
 * A comprehensive system for creating and managing pet-focused communities,
 * including breed-specific groups, location-based packs, activity clubs,
 * and interest-based communities.
 */

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Community Group Types
export interface PetCommunity {
  id: string;
  name: string;
  description: string;
  type: CommunityType;
  category: CommunityCategory;
  avatar?: string;
  coverImage?: string;
  location?: GeoPoint;
  radius?: number; // For location-based groups
  criteria: CommunityCriteria;
  settings: CommunitySettings;
  stats: CommunityStats;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CommunityType =
  | 'breed_specific'      // Groups for specific breeds
  | 'location_based'      // Local neighborhood packs
  | 'activity_based'      // Hiking, swimming, training groups
  | 'age_based'          // Puppy, senior, etc.
  | 'interest_based'     // Photography, training, rescue
  | 'emergency'          // Lost pet networks
  | 'professional'       // Vets, groomers, trainers
  | 'mixed';             // General pet communities

export type CommunityCategory =
  | 'dogs' | 'cats' | 'birds' | 'small_pets'
  | 'reptiles' | 'fish' | 'farm_animals' | 'exotic'
  | 'mixed';

export interface CommunityCriteria {
  petTypes: string[];           // Allowed pet types
  breeds?: string[];           // Specific breeds (for breed-specific groups)
  ageRange?: { min: number; max: number }; // Age restrictions
  locationRequired?: boolean;  // Must be local
  verificationRequired?: boolean; // Owner verification needed
  membershipApproval?: boolean; // Admin approval required
}

export interface CommunitySettings {
  isPrivate: boolean;
  allowPosts: boolean;
  allowEvents: boolean;
  allowTrading: boolean;
  moderatedContent: boolean;
  maxMembers?: number;
  rules: string[];
  admins: string[];
  moderators: string[];
}

export interface CommunityStats {
  memberCount: number;
  activeMembers: number;
  postCount: number;
  eventCount: number;
  lastActivity: Date;
}

export interface CommunityMember {
  id: string;
  userId: string;
  petIds: string[];          // Pets in this community
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  lastActive: Date;
  contributionScore: number;
  isActive: boolean;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  petId?: string;            // Associated pet
  type: 'text' | 'photo' | 'video' | 'event' | 'question' | 'trade';
  title?: string;
  content: string;
  mediaUrls?: string[];
  tags: string[];
  location?: GeoPoint;
  metadata: PostMetadata;
  interactions: PostInteractions;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMetadata {
  eventDetails?: EventDetails;
  tradeDetails?: TradeDetails;
  questionTopic?: string;
}

export interface EventDetails {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: GeoPoint;
  maxAttendees?: number;
  attendeeCount: number;
  attendees: string[];
}

export interface TradeDetails {
  itemType: 'pet' | 'supplies' | 'services' | 'other';
  title: string;
  description: string;
  price?: number;
  condition?: 'new' | 'used' | 'good' | 'fair';
  images: string[];
}

export interface PostInteractions {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  likedBy: string[];
}

// Community Groups Engine
export class CommunityGroupsEngine {
  // Community Discovery and Recommendations
  static async discoverCommunities(
    userId: string,
    userProfile: UserProfile,
    preferences: DiscoveryPreferences
  ): Promise<PetCommunity[]> {
    const candidates = await this.getCommunityCandidates(userId, userProfile, preferences);

    // Score and rank communities
    const scored = await Promise.all(
      candidates.map(async community => ({
        community,
        score: await this.calculateCommunityScore(community, userProfile, preferences),
      }))
    );

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(item => item.community);
  }

  private static async getCommunityCandidates(
    userId: string,
    userProfile: UserProfile,
    preferences: DiscoveryPreferences
  ): Promise<PetCommunity[]> {
    const candidates: PetCommunity[] = [];

    // 1. Breed-specific communities
    if (preferences.includeBreedSpecific) {
      for (const pet of userProfile.pets) {
        const breedCommunities = await this.findBreedCommunities(pet.breed);
        candidates.push(...breedCommunities);
      }
    }

    // 2. Location-based communities
    if (preferences.includeLocationBased) {
      const locationCommunities = await this.findNearbyCommunities(
        userProfile.location,
        preferences.locationRadiusKm
      );
      candidates.push(...locationCommunities);
    }

    // 3. Activity-based communities
    if (preferences.includeActivityBased) {
      for (const activity of userProfile.interests) {
        const activityCommunities = await this.findActivityCommunities(activity);
        candidates.push(...activityCommunities);
      }
    }

    // 4. Social connections' communities
    if (preferences.includeSocialBased) {
      const socialCommunities = await this.findSocialCommunities(userId);
      candidates.push(...socialCommunities);
    }

    // Remove duplicates and already joined communities
    const uniqueCommunities = this.deduplicateCommunities(candidates);
    const notJoined = await this.filterNotJoinedCommunities(uniqueCommunities, userId);

    return notJoined;
  }

  private static async calculateCommunityScore(
    community: PetCommunity,
    userProfile: UserProfile,
    preferences: DiscoveryPreferences
  ): Promise<number> {
    let score = 50; // Base score

    // Pet compatibility (40 points max)
    score += this.calculatePetCompatibilityScore(community, userProfile.pets) * 40;

    // Location relevance (30 points max)
    if (community.location) {
      const distance = this.calculateDistance(userProfile.location, community.location);
      if (distance <= (community.radius || 10)) {
        score += 30;
      } else if (distance <= preferences.locationRadiusKm) {
        score += 20;
      }
    }

    // Activity alignment (20 points max)
    score += this.calculateActivityAlignmentScore(community, userProfile.interests) * 20;

    // Social connections (10 points max)
    score += this.calculateSocialConnectionScore(community, userProfile.connections) * 10;

    // Community health (bonus points)
    score += this.calculateCommunityHealthScore(community) * 10;

    return Math.min(100, Math.max(0, score));
  }

  private static calculatePetCompatibilityScore(community: PetCommunity, pets: Pet[]): number {
    if (community.criteria.petTypes.length === 0) return 1; // Open community

    const compatiblePets = pets.filter(pet =>
      community.criteria.petTypes.includes(pet.type) &&
      (!community.criteria.breeds || community.criteria.breeds.includes(pet.breed))
    );

    return compatiblePets.length / pets.length;
  }

  private static calculateActivityAlignmentScore(community: PetCommunity, interests: string[]): number {
    if (community.type !== 'activity_based') return 0.5;

    // This would match community activities with user interests
    // Simplified for now
    return interests.length > 0 ? 0.8 : 0.3;
  }

  private static calculateSocialConnectionScore(community: PetCommunity, connections: string[]): number {
    // Check if friends/family are in the community
    const overlappingMembers = community.stats.memberCount > 0 ?
      connections.filter(id => this.isMemberOfCommunity(id, community.id)).length : 0;

    return Math.min(1, overlappingMembers / Math.max(1, connections.length / 10));
  }

  private static calculateCommunityHealthScore(community: PetCommunity): number {
    // Score based on activity, member engagement, moderation
    const activityScore = Math.min(1, community.stats.postCount / 100);
    const engagementScore = community.stats.activeMembers / community.stats.memberCount;
    const moderationScore = community.settings.moderatedContent ? 1 : 0.5;

    return (activityScore + engagementScore + moderationScore) / 3;
  }

  // Community Creation and Management
  static async createCommunity(
    creatorId: string,
    communityData: CreateCommunityData
  ): Promise<PetCommunity> {
    // Validate creation criteria
    await this.validateCommunityCreation(creatorId, communityData);

    const community: PetCommunity = {
      id: generateId(),
      name: communityData.name,
      description: communityData.description,
      type: communityData.type,
      category: communityData.category,
      location: communityData.location,
      radius: communityData.radius,
      criteria: communityData.criteria,
      settings: {
        isPrivate: false,
        allowPosts: true,
        allowEvents: true,
        allowTrading: communityData.type === 'interest_based',
        moderatedContent: true,
        rules: communityData.rules || this.getDefaultRules(communityData.type),
        admins: [creatorId],
        moderators: [],
        ...communityData.settings,
      },
      stats: {
        memberCount: 1,
        activeMembers: 1,
        postCount: 0,
        eventCount: 0,
        lastActivity: new Date(),
      },
      createdBy: creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create community in database
    await this.persistCommunity(community);

    // Add creator as admin member
    await this.addCommunityMember(community.id, {
      userId: creatorId,
      petIds: communityData.initialPets,
      role: 'admin',
      joinedAt: new Date(),
      lastActive: new Date(),
      contributionScore: 0,
      isActive: true,
    });

    return community;
  }

  private static async validateCommunityCreation(
    creatorId: string,
    data: CreateCommunityData
  ): Promise<void> {
    // Check if user has required pets
    const userPets = await this.getUserPets(creatorId);
    const hasRequiredPets = data.criteria.petTypes.some(type =>
      userPets.some(pet => pet.type === type)
    );

    if (!hasRequiredPets) {
      throw new Error('Creator must have at least one pet matching community criteria');
    }

    // Check community name uniqueness
    const existingCommunity = await this.findCommunityByName(data.name);
    if (existingCommunity) {
      throw new Error('Community name already exists');
    }

    // Rate limiting: max 3 communities per user per month
    const userCommunities = await this.getUserCreatedCommunities(creatorId);
    const recentCommunities = userCommunities.filter(c =>
      c.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (recentCommunities.length >= 3) {
      throw new Error('Maximum 3 communities per user per month');
    }
  }

  private static getDefaultRules(type: CommunityType): string[] {
    const baseRules = [
      'Be respectful to all members and their pets',
      'No spam or excessive self-promotion',
      'Keep discussions pet-related and appropriate',
      'Report inappropriate content to moderators',
    ];

    const typeSpecificRules: Record<CommunityType, string[]> = {
      breed_specific: ['Share breed-specific care tips and experiences'],
      location_based: ['Respect local laws and community guidelines', 'Use designated pet areas'],
      activity_based: ['Follow safety guidelines for activities', 'Respect other participants'],
      age_based: ['Be mindful of age-specific needs and limitations'],
      interest_based: ['Stay on topic with the stated interest area'],
      emergency: ['Only post about genuine emergencies', 'Respect privacy during crises'],
      professional: ['Verify professional credentials when applicable'],
      mixed: [],
    };

    return [...baseRules, ...typeSpecificRules[type]];
  }

  // Member Management
  static async joinCommunity(
    userId: string,
    communityId: string,
    petIds: string[]
  ): Promise<void> {
    const community = await this.getCommunity(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // Check membership criteria
    await this.validateMembershipCriteria(userId, petIds, community);

    // Check if already a member
    const existingMember = await this.getCommunityMember(communityId, userId);
    if (existingMember) {
      throw new Error('Already a member of this community');
    }

    // Create membership
    const member: CommunityMember = {
      id: generateId(),
      userId,
      petIds,
      role: 'member',
      joinedAt: new Date(),
      lastActive: new Date(),
      contributionScore: 0,
      isActive: true,
    };

    await this.addCommunityMember(communityId, member);

    // Update community stats
    await this.updateCommunityStats(communityId, {
      memberCount: community.stats.memberCount + 1,
      activeMembers: community.stats.activeMembers + 1,
    });

    // Send welcome notification
    await this.sendWelcomeNotification(userId, community);
  }

  private static async validateMembershipCriteria(
    userId: string,
    petIds: string[],
    community: PetCommunity
  ): Promise<void> {
    // Check if user owns the specified pets
    const userPets = await this.getUserPets(userId);
    const ownedPetIds = userPets.map(pet => pet.id);

    if (!petIds.every(petId => ownedPetIds.includes(petId))) {
      throw new Error('User does not own all specified pets');
    }

    // Check pet type compatibility
    const pets = userPets.filter(pet => petIds.includes(pet.id));
    const compatiblePets = pets.filter(pet =>
      community.criteria.petTypes.includes(pet.type) &&
      (!community.criteria.breeds || community.criteria.breeds.includes(pet.breed))
    );

    if (compatiblePets.length === 0) {
      throw new Error('No pets meet community membership criteria');
    }

    // Check age requirements
    if (community.criteria.ageRange) {
      const inAgeRange = pets.some(pet =>
        pet.age >= community.criteria.ageRange!.min &&
        pet.age <= community.criteria.ageRange!.max
      );

      if (!inAgeRange) {
        throw new Error('Pet age does not meet community requirements');
      }
    }

    // Check location requirements
    if (community.criteria.locationRequired && community.location) {
      const userLocation = await this.getUserLocation(userId);
      const distance = this.calculateDistance(userLocation, community.location);

      if (distance > (community.radius || 10)) {
        throw new Error('User is not within community location radius');
      }
    }
  }

  // Content Management
  static async createCommunityPost(
    communityId: string,
    authorId: string,
    postData: CreatePostData
  ): Promise<CommunityPost> {
    const community = await this.getCommunity(communityId);
    const member = await this.getCommunityMember(communityId, authorId);

    if (!member || !member.isActive) {
      throw new Error('User is not an active member of this community');
    }

    // Validate post content
    await this.validatePostContent(postData, community.settings);

    const post: CommunityPost = {
      id: generateId(),
      communityId,
      authorId,
      petId: postData.petId,
      type: postData.type,
      title: postData.title,
      content: postData.content,
      mediaUrls: postData.mediaUrls,
      tags: postData.tags || [],
      location: postData.location,
      metadata: postData.metadata || {},
      interactions: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        likedBy: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create post in database
    await this.persistCommunityPost(post);

    // Update community stats
    await this.updateCommunityStats(communityId, {
      postCount: community.stats.postCount + 1,
      lastActivity: new Date(),
    });

    // Update member contribution score
    await this.updateMemberContributionScore(member.id, 1);

    // Send notifications to community members (optional)
    if (community.settings.moderatedContent) {
      await this.notifyModeratorsOfNewPost(communityId, post);
    }

    return post;
  }

  // Helper methods for data access and utilities
  private static async findBreedCommunities(breed: string): Promise<PetCommunity[]> {
    // Database query for breed-specific communities
    return [];
  }

  private static async findNearbyCommunities(location: GeoPoint, radiusKm: number): Promise<PetCommunity[]> {
    // Database query for location-based communities within radius
    return [];
  }

  private static async findActivityCommunities(activity: string): Promise<PetCommunity[]> {
    // Database query for activity-based communities
    return [];
  }

  private static async findSocialCommunities(userId: string): Promise<PetCommunity[]> {
    // Find communities that user's connections are members of
    return [];
  }

  private static deduplicateCommunities(communities: PetCommunity[]): PetCommunity[] {
    const seen = new Set<string>();
    return communities.filter(community => {
      if (seen.has(community.id)) return false;
      seen.add(community.id);
      return true;
    });
  }

  private static async filterNotJoinedCommunities(
    communities: PetCommunity[],
    userId: string
  ): Promise<PetCommunity[]> {
    const joinedCommunityIds = await this.getUserJoinedCommunityIds(userId);
    return communities.filter(community => !joinedCommunityIds.includes(community.id));
  }

  private static calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const R = 6371; // Earth's radius in km
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

  private static isMemberOfCommunity(userId: string, communityId: string): boolean {
    // Check if user is member of community
    return false; // Placeholder
  }

  // Database persistence methods (implement with actual database)
  private static async persistCommunity(community: PetCommunity): Promise<void> {}
  private static async persistCommunityPost(post: CommunityPost): Promise<void> {}
  private static async addCommunityMember(communityId: string, member: CommunityMember): Promise<void> {}
  private static async updateCommunityStats(communityId: string, updates: Partial<CommunityStats>): Promise<void> {}
  private static async updateMemberContributionScore(memberId: string, scoreIncrease: number): Promise<void> {}
  private static async sendWelcomeNotification(userId: string, community: PetCommunity): Promise<void> {}
  private static async notifyModeratorsOfNewPost(communityId: string, post: CommunityPost): Promise<void> {}
  private static async validatePostContent(postData: CreatePostData, settings: CommunitySettings): Promise<void> {}
  private static async getCommunity(communityId: string): Promise<PetCommunity | null> { return null; }
  private static async getCommunityMember(communityId: string, userId: string): Promise<CommunityMember | null> { return null; }
  private static async getUserPets(userId: string): Promise<Pet[]> { return []; }
  private static async findCommunityByName(name: string): Promise<PetCommunity | null> { return null; }
  private static async getUserCreatedCommunities(userId: string): Promise<PetCommunity[]> { return []; }
  private static async getUserJoinedCommunityIds(userId: string): Promise<string[]> { return []; }
  private static async getUserLocation(userId: string): Promise<GeoPoint> { return { lat: 0, lng: 0 }; }
}

// React Hooks for Community Groups
export const useDiscoverCommunities = (userId: string, preferences: DiscoveryPreferences) => {
  return useQuery({
    queryKey: ['community-discovery', userId, preferences],
    queryFn: () => CommunityGroupsEngine.discoverCommunities(userId, { pets: [], location: { lat: 0, lng: 0 }, interests: [], connections: [] }, preferences),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCommunityDetails = (communityId: string) => {
  return useQuery({
    queryKey: ['community-details', communityId],
    queryFn: () => CommunityGroupsEngine.getCommunity(communityId),
    enabled: !!communityId,
  });
};

export const useCommunityMembers = (communityId: string) => {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: () => CommunityGroupsEngine.getCommunityMembers(communityId),
    enabled: !!communityId,
  });
};

export const useCommunityPosts = (communityId: string, filters?: PostFilters) => {
  return useQuery({
    queryKey: ['community-posts', communityId, filters],
    queryFn: () => CommunityGroupsEngine.getCommunityPosts(communityId, filters),
    enabled: !!communityId,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommunityData) =>
      CommunityGroupsEngine.createCommunity('current-user-id', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-communities'] });
      queryClient.invalidateQueries({ queryKey: ['community-discovery'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, petIds }: { communityId: string; petIds: string[] }) =>
      CommunityGroupsEngine.joinCommunity('current-user-id', communityId, petIds),
    onSuccess: (_, { communityId }) => {
      queryClient.invalidateQueries({ queryKey: ['community-details', communityId] });
      queryClient.invalidateQueries({ queryKey: ['user-communities'] });
    },
  });
};

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ communityId, postData }: { communityId: string; postData: CreatePostData }) =>
      CommunityGroupsEngine.createCommunityPost(communityId, 'current-user-id', postData),
    onSuccess: (_, { communityId }) => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-details', communityId] });
    },
  });
};

// Community Discovery Component
export const CommunityDiscovery = ({ userId }: { userId: string }) => {
  const [preferences, setPreferences] = useState<DiscoveryPreferences>({
    includeBreedSpecific: true,
    includeLocationBased: true,
    includeActivityBased: true,
    includeSocialBased: true,
    locationRadiusKm: 25,
  });

  const { data: communities, isLoading } = useDiscoverCommunities(userId, preferences);
  const joinCommunity = useJoinCommunity();

  const handleJoinCommunity = useCallback(async (community: PetCommunity) => {
    // Get user's pets that match community criteria
    const matchingPets = await getUserMatchingPets(userId, community.criteria);
    const petIds = matchingPets.map(pet => pet.id);

    await joinCommunity.mutateAsync({ communityId: community.id, petIds });
  }, [userId, joinCommunity]);

  if (isLoading) {
    return <CommunityDiscoverySkeleton />;
  }

  return (
    <div className="community-discovery">
      <div className="discovery-header">
        <h2>Discover Communities</h2>
        <p>Find communities perfect for you and your pets</p>
      </div>

      <DiscoveryFilters
        preferences={preferences}
        onChange={setPreferences}
      />

      <div className="communities-grid">
        {communities?.map(community => (
          <CommunityCard
            key={community.id}
            community={community}
            onJoin={() => handleJoinCommunity(community)}
            isJoining={joinCommunity.isPending}
          />
        ))}
      </div>
    </div>
  );
};

// Community Card Component
export const CommunityCard = ({
  community,
  onJoin,
  isJoining
}: {
  community: PetCommunity;
  onJoin: () => void;
  isJoining: boolean;
}) => {
  const getTypeIcon = (type: CommunityType) => {
    const icons: Record<CommunityType, string> = {
      breed_specific: '🐕',
      location_based: '📍',
      activity_based: '⚽',
      age_based: '🎂',
      interest_based: '💡',
      emergency: '🚨',
      professional: '👨‍⚕️',
      mixed: '🌟',
    };
    return icons[type];
  };

  return (
    <div className="community-card">
      <div className="community-header">
        <div className="community-avatar">
          {community.avatar ? (
            <img src={community.avatar} alt={community.name} />
          ) : (
            <div className="default-avatar">{getTypeIcon(community.type)}</div>
          )}
        </div>
        <div className="community-info">
          <h3>{community.name}</h3>
          <div className="community-meta">
            <span className="member-count">{community.stats.memberCount} members</span>
            <span className="community-type">{community.type.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <p className="community-description">{community.description}</p>

      <div className="community-stats">
        <div className="stat">
          <span className="stat-value">{community.stats.postCount}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat">
          <span className="stat-value">{community.stats.eventCount}</span>
          <span className="stat-label">Events</span>
        </div>
        <div className="stat">
          <span className="stat-value">{community.stats.activeMembers}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      <div className="community-actions">
        <button
          className="join-button"
          onClick={onJoin}
          disabled={isJoining}
        >
          {isJoining ? 'Joining...' : 'Join Community'}
        </button>
      </div>
    </div>
  );
};

// Community Creation Component
export const CommunityCreator = ({ onCommunityCreated }: { onCommunityCreated?: () => void }) => {
  const [formData, setFormData] = useState<Partial<CreateCommunityData>>({
    type: 'mixed',
    category: 'mixed',
    criteria: {
      petTypes: [],
      membershipApproval: false,
    },
    settings: {
      isPrivate: false,
      moderatedContent: true,
    },
  });

  const createCommunity = useCreateCommunity();

  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.description) return;

    await createCommunity.mutateAsync(formData as CreateCommunityData);
    onCommunityCreated?.();
  }, [formData, createCommunity, onCommunityCreated]);

  return (
    <div className="community-creator">
      <h2>Create a Community</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Community Name</label>
          <input
            id="name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Golden Retriever Lovers"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your community..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Community Type</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CommunityType }))}
          >
            <option value="breed_specific">Breed Specific</option>
            <option value="location_based">Location Based</option>
            <option value="activity_based">Activity Based</option>
            <option value="age_based">Age Based</option>
            <option value="interest_based">Interest Based</option>
            <option value="professional">Professional</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category">Pet Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CommunityCategory }))}
          >
            <option value="dogs">Dogs</option>
            <option value="cats">Cats</option>
            <option value="birds">Birds</option>
            <option value="small_pets">Small Pets</option>
            <option value="reptiles">Reptiles</option>
            <option value="fish">Fish</option>
            <option value="farm_animals">Farm Animals</option>
            <option value="exotic">Exotic</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={createCommunity.isPending}
          className="create-community-button"
        >
          {createCommunity.isPending ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
};

// Type definitions
interface UserProfile {
  pets: Pet[];
  location: GeoPoint;
  interests: string[];
  connections: string[];
}

interface DiscoveryPreferences {
  includeBreedSpecific: boolean;
  includeLocationBased: boolean;
  includeActivityBased: boolean;
  includeSocialBased: boolean;
  locationRadiusKm: number;
}

interface CreateCommunityData {
  name: string;
  description: string;
  type: CommunityType;
  category: CommunityCategory;
  location?: GeoPoint;
  radius?: number;
  criteria: CommunityCriteria;
  initialPets: string[];
  rules?: string[];
  settings?: Partial<CommunitySettings>;
}

interface CreatePostData {
  petId?: string;
  type: CommunityPost['type'];
  title?: string;
  content: string;
  mediaUrls?: string[];
  tags?: string[];
  location?: GeoPoint;
  metadata?: PostMetadata;
}

interface PostFilters {
  type?: CommunityPost['type'];
  petId?: string;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
}

interface GeoPoint {
  lat: number;
  lng: number;
}

interface Pet {
  id: string;
  type: string;
  breed: string;
  age: number;
  ownerId: string;
}

// Helper Components
const CommunityDiscoverySkeleton = () => (
  <div className="community-discovery-skeleton">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-avatar" />
        <div className="skeleton-content">
          <div className="skeleton-title" />
          <div className="skeleton-text" />
          <div className="skeleton-stats" />
        </div>
      </div>
    ))}
  </div>
);

const DiscoveryFilters = ({
  preferences,
  onChange
}: {
  preferences: DiscoveryPreferences;
  onChange: (prefs: DiscoveryPreferences) => void;
}) => (
  <div className="discovery-filters">
    <h3>Filter Communities</h3>
    <div className="filter-options">
      <label>
        <input
          type="checkbox"
          checked={preferences.includeBreedSpecific}
          onChange={(e) => onChange({ ...preferences, includeBreedSpecific: e.target.checked })}
        />
        Breed Specific
      </label>
      <label>
        <input
          type="checkbox"
          checked={preferences.includeLocationBased}
          onChange={(e) => onChange({ ...preferences, includeLocationBased: e.target.checked })}
        />
        Location Based
      </label>
      <label>
        <input
          type="checkbox"
          checked={preferences.includeActivityBased}
          onChange={(e) => onChange({ ...preferences, includeActivityBased: e.target.checked })}
        />
        Activity Based
      </label>
      <label>
        <input
          type="checkbox"
          checked={preferences.includeSocialBased}
          onChange={(e) => onChange({ ...preferences, includeSocialBased: e.target.checked })}
        />
        Social Connections
      </label>
    </div>
  </div>
);

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Mock API functions removed - using CommunityGroupsEngine class instead

async function getUserMatchingPets(userId: string, criteria: CommunityCriteria): Promise<Pet[]> {
  // Get user's pets that match community criteria
  return [];
}
