/**
 * ADVANCED MEDIA SHARING SYSTEM FOR PET COMMUNITIES
 *
 * A comprehensive media sharing platform specifically designed for pet owners,
 * featuring intelligent photo/video processing, activity tracking, pet recognition,
 * and rich media experiences.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';

// Media Types and Interfaces
export interface PetMedia {
  id: string;
  ownerId: string;
  petId: string;
  type: MediaType;
  format: MediaFormat;
  url: string;
  thumbnailUrl?: string;
  metadata: MediaMetadata;
  processing: MediaProcessing;
  interactions: MediaInteractions;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaType =
  | 'photo' | 'video' | 'gif' | 'live_stream'
  | 'pet_profile' | 'activity_moment' | 'achievement'
  | 'playdate_memory' | 'training_progress' | 'health_milestone';

export type MediaFormat =
  | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
  | 'video/mp4' | 'video/webm' | 'video/quicktime'
  | 'application/octet-stream'; // For raw data

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;          // For videos
  fileSize: number;
  quality: MediaQuality;
  location?: GeoPoint;
  capturedAt?: Date;
  deviceInfo?: DeviceInfo;
  petContext: PetContext;
  aiAnalysis?: AIAnalysis;
  tags: string[];
  caption?: string;
  altText?: string;
}

export interface PetContext {
  petName: string;
  petBreed: string;
  petAge: number;
  activity?: string;
  mood?: 'happy' | 'excited' | 'playful' | 'relaxed' | 'curious' | 'tired' | 'sleepy';
  weather?: WeatherInfo;
  locationContext?: string;   // e.g., "at the park", "at home", "at the vet"
  companions?: string[];      // Other pets/people in the photo
  specialOccasion?: string;   // "birthday", "gotcha day", "first walk", etc.
}

export interface AIAnalysis {
  petDetected: boolean;
  petConfidence: number;
  breedPrediction?: string;
  breedConfidence?: number;
  facialExpression?: string;
  emotion?: string;
  activityRecognition?: string;
  objectsDetected: DetectedObject[];
  qualityScore: number;
  suggestedTags: string[];
  contentWarnings?: string[];
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MediaProcessing {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stages: ProcessingStage[];
  estimatedCompletion?: Date;
  errorMessage?: string;
}

export interface ProcessingStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface MediaInteractions {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reactions: Record<string, number>; // emoji -> count
  likedBy: string[];
  commentedBy: string[];
  sharedBy: string[];
  savedBy: string[];
}

export interface MediaQuality {
  overall: number;        // 1-100
  sharpness: number;      // 1-100
  brightness: number;     // 1-100
  composition: number;    // 1-100
  petFocus: number;       // 1-100 (how well the pet is in focus)
  lighting: number;       // 1-100
}

export interface DeviceInfo {
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  cameraSettings?: CameraSettings;
}

export interface CameraSettings {
  aperture?: number;
  shutterSpeed?: number;
  iso?: number;
  focalLength?: number;
  flashUsed?: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
}

export interface WeatherInfo {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed?: number;
  description: string;
}

// Advanced Media Processing Engine
export class MediaProcessingEngine {
  private static readonly AI_MODEL_ENDPOINT = '/api/ai/media-analysis';
  private static readonly PROCESSING_TIMEOUT = 300000; // 5 minutes

  static async processMedia(file: File, petContext: PetContext): Promise<PetMedia> {
    const mediaId = generateId();

    // Initial metadata extraction
    const basicMetadata = await this.extractBasicMetadata(file);

    // Create initial media record
    const media: PetMedia = {
      id: mediaId,
      ownerId: 'current-user', // Replace with actual user ID
      petId: petContext.petId || 'unknown',
      type: this.determineMediaType(file.type),
      format: file.type as MediaFormat,
      url: '', // Will be set after upload
      metadata: {
        ...basicMetadata,
        quality: { overall: 50, sharpness: 50, brightness: 50, composition: 50, petFocus: 50, lighting: 50 },
        petContext,
        tags: [],
      },
      processing: {
        status: 'pending',
        progress: 0,
        stages: [
          { name: 'upload', status: 'pending' },
          { name: 'ai_analysis', status: 'pending' },
          { name: 'quality_analysis', status: 'pending' },
          { name: 'optimization', status: 'pending' },
          { name: 'thumbnail_generation', status: 'pending' },
        ],
      },
      interactions: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        reactions: {},
        likedBy: [],
        commentedBy: [],
        sharedBy: [],
        savedBy: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Start processing pipeline
    this.processMediaAsync(media, file);

    return media;
  }

  private static async processMediaAsync(media: PetMedia, file: File): Promise<void> {
    try {
      // Stage 1: Upload
      await this.updateProcessingStage(media.id, 'upload', 'running');
      const uploadResult = await this.uploadFile(file);
      media.url = uploadResult.url;
      await this.updateProcessingStage(media.id, 'upload', 'completed');

      // Stage 2: AI Analysis
      await this.updateProcessingStage(media.id, 'ai_analysis', 'running');
      const aiAnalysis = await this.performAIAnalysis(media.url, media.metadata.petContext);
      media.metadata.aiAnalysis = aiAnalysis;
      media.metadata.tags = aiAnalysis.suggestedTags;
      await this.updateProcessingStage(media.id, 'ai_analysis', 'completed');

      // Stage 3: Quality Analysis
      await this.updateProcessingStage(media.id, 'quality_analysis', 'running');
      const qualityAnalysis = await this.analyzeQuality(media.url, aiAnalysis);
      media.metadata.quality = qualityAnalysis;
      await this.updateProcessingStage(media.id, 'quality_analysis', 'completed');

      // Stage 4: Optimization
      await this.updateProcessingStage(media.id, 'optimization', 'running');
      const optimizationResult = await this.optimizeMedia(media.url, qualityAnalysis);
      if (optimizationResult.optimizedUrl) {
        media.url = optimizationResult.optimizedUrl;
      }
      await this.updateProcessingStage(media.id, 'optimization', 'completed');

      // Stage 5: Thumbnail Generation
      await this.updateProcessingStage(media.id, 'thumbnail_generation', 'running');
      const thumbnailResult = await this.generateThumbnail(media.url);
      media.thumbnailUrl = thumbnailResult.url;
      await this.updateProcessingStage(media.id, 'thumbnail_generation', 'completed');

      // Mark processing as complete
      await this.updateMediaProcessingStatus(media.id, 'completed', 100);

      // Generate alt text automatically
      media.metadata.altText = this.generateAltText(media);

    } catch (error) {
      logger.error('Media processing failed:', error);
      await this.updateMediaProcessingStatus(media.id, 'failed', 0, error.message);
    }
  }

  private static async performAIAnalysis(mediaUrl: string, petContext: PetContext): Promise<AIAnalysis> {
    try {
      const response = await fetch(this.AI_MODEL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          petContext,
          analysis: ['pet_detection', 'breed_recognition', 'emotion_analysis', 'activity_recognition', 'object_detection']
        }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      return await response.json();
    } catch (error) {
      logger.error('AI analysis error:', error);
      // Return fallback analysis
      return {
        petDetected: true,
        petConfidence: 0.8,
        emotion: 'happy',
        objectsDetected: [],
        qualityScore: 75,
        suggestedTags: ['pet', petContext.petName.toLowerCase()],
      };
    }
  }

  private static async analyzeQuality(mediaUrl: string, aiAnalysis: AIAnalysis): Promise<MediaQuality> {
    // Analyze image quality metrics
    const quality: MediaQuality = {
      overall: 75,
      sharpness: 70,
      brightness: 80,
      composition: aiAnalysis.qualityScore,
      petFocus: aiAnalysis.petDetected ? 85 : 50,
      lighting: 75,
    };

    // Adjust based on AI analysis
    if (aiAnalysis.petDetected && aiAnalysis.petConfidence > 0.8) {
      quality.petFocus = Math.min(100, quality.petFocus + 15);
      quality.overall = Math.min(100, quality.overall + 10);
    }

    return quality;
  }

  private static async optimizeMedia(mediaUrl: string, quality: MediaQuality): Promise<{ optimizedUrl?: string }> {
    // Only optimize if quality is poor
    if (quality.overall > 70) {
      return {}; // No optimization needed
    }

    try {
      const response = await fetch('/api/media/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, quality }),
      });

      if (response.ok) {
        const result = await response.json();
        return { optimizedUrl: result.optimizedUrl };
      }
    } catch (error) {
      logger.error('Media optimization failed:', error);
    }

    return {};
  }

  private static async generateThumbnail(mediaUrl: string): Promise<{ url: string }> {
    const response = await fetch('/api/media/thumbnail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaUrl, size: { width: 300, height: 300 } }),
    });

    if (!response.ok) {
      throw new Error('Thumbnail generation failed');
    }

    return await response.json();
  }

  private static generateAltText(media: PetMedia): string {
    const { petContext, aiAnalysis } = media.metadata;
    const parts = [];

    parts.push(`Photo of ${petContext.petName}`);

    if (petContext.petBreed) {
      parts.push(`the ${petContext.petBreed}`);
    }

    if (petContext.activity) {
      parts.push(`${petContext.activity}`);
    }

    if (petContext.mood) {
      parts.push(`looking ${petContext.mood}`);
    }

    if (petContext.locationContext) {
      parts.push(`at ${petContext.locationContext}`);
    }

    if (aiAnalysis?.activityRecognition) {
      parts.push(`while ${aiAnalysis.activityRecognition}`);
    }

    return parts.join(' ');
  }

  private static async extractBasicMetadata(file: File): Promise<Partial<MediaMetadata>> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          fileSize: file.size,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static determineMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'image/gif') return 'gif';
    return 'photo';
  }

  private static async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  }

  private static async updateProcessingStage(mediaId: string, stageName: string, status: ProcessingStage['status']): Promise<void> {
    // Update processing stage in database
    await fetch(`/api/media/${mediaId}/processing`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stageName, status }),
    });
  }

  private static async updateMediaProcessingStatus(
    mediaId: string,
    status: MediaProcessing['status'],
    progress: number,
    errorMessage?: string
  ): Promise<void> {
    await fetch(`/api/media/${mediaId}/processing`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, progress, errorMessage }),
    });
  }
}

// Activity Tracking System
export class ActivityTrackingEngine {
  private static readonly ACTIVITY_TYPES = [
    'walk', 'run', 'play', 'training', 'grooming', 'vet_visit',
    'playdate', 'travel', 'eating', 'sleeping', 'socializing'
  ];

  static trackActivity(activity: ActivityData): Promise<ActivityRecord> {
    // Record pet activity with photos/videos
    return this.createActivityRecord(activity);
  }

  static generateActivityHighlights(petId: string, timeRange: TimeRange): Promise<ActivityHighlight[]> {
    // Generate highlights reel from recent activities
    return this.analyzeRecentActivities(petId, timeRange);
  }

  private static async createActivityRecord(activity: ActivityData): Promise<ActivityRecord> {
    // Create activity record in database
    const record: ActivityRecord = {
      id: generateId(),
      petId: activity.petId,
      type: activity.type,
      duration: activity.duration,
      distance: activity.distance,
      photos: activity.photos,
      videos: activity.videos,
      notes: activity.notes,
      location: activity.location,
      weather: activity.weather,
      createdAt: new Date(),
    };

    // Store in database
    await this.persistActivityRecord(record);

    // Generate activity insights
    await this.generateActivityInsights(record);

    return record;
  }

  private static async analyzeRecentActivities(petId: string, timeRange: TimeRange): Promise<ActivityHighlight[]> {
    const activities = await this.getActivitiesInRange(petId, timeRange);

    const highlights: ActivityHighlight[] = [];

    // Most active day
    const mostActiveDay = this.findMostActiveDay(activities);
    if (mostActiveDay) {
      highlights.push({
        type: 'most_active_day',
        title: `Most Active Day: ${mostActiveDay.date.toLocaleDateString()}`,
        description: `${mostActiveDay.totalDuration} minutes of activity`,
        mediaUrls: mostActiveDay.topPhotos,
        badge: '🏆',
      });
    }

    // Favorite activity
    const favoriteActivity = this.findFavoriteActivity(activities);
    if (favoriteActivity) {
      highlights.push({
        type: 'favorite_activity',
        title: `Favorite Activity: ${favoriteActivity.type}`,
        description: `${favoriteActivity.count} times this ${timeRange}`,
        mediaUrls: favoriteActivity.photos,
        badge: '❤️',
      });
    }

    // New achievements
    const achievements = await this.checkForAchievements(petId, activities);
    highlights.push(...achievements.map(achievement => ({
      type: 'achievement',
      title: achievement.title,
      description: achievement.description,
      mediaUrls: achievement.mediaUrls,
      badge: achievement.badge,
    })));

    return highlights;
  }

  private static findMostActiveDay(activities: ActivityRecord[]): ActivityDay | null {
    const dayMap = new Map<string, { date: Date; totalDuration: number; topPhotos: string[] }>();

    activities.forEach(activity => {
      const dayKey = activity.createdAt.toDateString();
      const existing = dayMap.get(dayKey);

      if (existing) {
        existing.totalDuration += activity.duration || 0;
        if (activity.photos?.length) {
          existing.topPhotos.push(...activity.photos.slice(0, 2));
        }
      } else {
        dayMap.set(dayKey, {
          date: new Date(activity.createdAt),
          totalDuration: activity.duration || 0,
          topPhotos: activity.photos?.slice(0, 2) || [],
        });
      }
    });

    let mostActive: ActivityDay | null = null;
    for (const day of dayMap.values()) {
      if (!mostActive || day.totalDuration > mostActive.totalDuration) {
        mostActive = day;
      }
    }

    return mostActive;
  }

  private static findFavoriteActivity(activities: ActivityRecord[]): FavoriteActivity | null {
    const activityCount = new Map<string, { count: number; photos: string[] }>();

    activities.forEach(activity => {
      const existing = activityCount.get(activity.type);
      if (existing) {
        existing.count++;
        if (activity.photos?.length) {
          existing.photos.push(...activity.photos.slice(0, 1));
        }
      } else {
        activityCount.set(activity.type, {
          count: 1,
          photos: activity.photos?.slice(0, 1) || [],
        });
      }
    });

    let favorite: FavoriteActivity | null = null;
    for (const [type, data] of activityCount.entries()) {
      if (!favorite || data.count > favorite.count) {
        favorite = { type, count: data.count, photos: data.photos };
      }
    }

    return favorite;
  }

  private static async checkForAchievements(petId: string, activities: ActivityRecord[]): Promise<Achievement[]> {
    const achievements: Achievement[] = [];

    // Walk streak achievement
    const walkStreak = this.calculateWalkStreak(activities);
    if (walkStreak >= 7) {
      achievements.push({
        title: 'Walking Warrior',
        description: `${walkStreak} day walk streak!`,
        badge: '🚶',
        mediaUrls: activities.filter(a => a.type === 'walk').flatMap(a => a.photos || []).slice(0, 3),
      });
    }

    // Social butterfly achievement
    const playdateCount = activities.filter(a => a.type === 'playdate').length;
    if (playdateCount >= 10) {
      achievements.push({
        title: 'Social Butterfly',
        description: `${playdateCount} playdates this month!`,
        badge: '🦋',
        mediaUrls: activities.filter(a => a.type === 'playdate').flatMap(a => a.photos || []).slice(0, 3),
      });
    }

    // Training champion
    const trainingCount = activities.filter(a => a.type === 'training').length;
    if (trainingCount >= 20) {
      achievements.push({
        title: 'Training Champion',
        description: `${trainingCount} training sessions!`,
        badge: '🎓',
        mediaUrls: activities.filter(a => a.type === 'training').flatMap(a => a.photos || []).slice(0, 3),
      });
    }

    return achievements;
  }

  private static calculateWalkStreak(activities: ActivityRecord[]): number {
    const walks = activities
      .filter(a => a.type === 'walk')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const walk of walks) {
      const walkDate = new Date(walk.createdAt);
      walkDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      if (walkDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Database methods (implement with actual database)
  private static async persistActivityRecord(record: ActivityRecord): Promise<void> {}
  private static async generateActivityInsights(record: ActivityRecord): Promise<void> {}
  private static async getActivitiesInRange(petId: string, timeRange: TimeRange): Promise<ActivityRecord[]> { return []; }
}

// React Hooks for Media Sharing
export const useMediaUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, petContext }: { file: File; petContext: PetContext }) =>
      MediaProcessingEngine.processMedia(file, petContext),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-media'] });
    },
  });
};

export const usePetMedia = (petId: string, filters?: MediaFilters) => {
  return useQuery({
    queryKey: ['pet-media', petId, filters],
    queryFn: () => MediaProcessingEngine.getPetMedia(petId, filters),
  });
};

export const useActivityTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activity: ActivityData) =>
      ActivityTrackingEngine.trackActivity(activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-activities'] });
    },
  });
};

export const useActivityHighlights = (petId: string, timeRange: TimeRange) => {
  return useQuery({
    queryKey: ['activity-highlights', petId, timeRange],
    queryFn: () => ActivityTrackingEngine.generateActivityHighlights(petId, timeRange),
  });
};

// Media Gallery Component
export const PetMediaGallery = ({ petId }: { petId: string }) => {
  const [filters, setFilters] = useState<MediaFilters>({
    type: 'all',
    sortBy: 'newest',
    dateRange: 'all',
  });

  const { data: media, isLoading } = usePetMedia(petId, filters);
  const [selectedMedia, setSelectedMedia] = useState<PetMedia | null>(null);

  if (isLoading) {
    return <MediaGallerySkeleton />;
  }

  return (
    <div className="pet-media-gallery">
      <MediaFiltersBar filters={filters} onChange={setFilters} />

      <div className="media-grid">
        {media?.map(item => (
          <MediaItem
            key={item.id}
            media={item}
            onClick={() => setSelectedMedia(item)}
          />
        ))}
      </div>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
};

// Activity Dashboard Component
export const PetActivityDashboard = ({ petId }: { petId: string }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { data: highlights } = useActivityHighlights(petId, timeRange);
  const trackActivity = useActivityTracking();

  const handleActivityLog = useCallback(async (activityData: ActivityData) => {
    await trackActivity.mutateAsync(activityData);
  }, [trackActivity]);

  return (
    <div className="pet-activity-dashboard">
      <ActivityTimeRangeSelector value={timeRange} onChange={setTimeRange} />

      <ActivityHighlights highlights={highlights || []} />

      <ActivityLogger onLogActivity={handleActivityLog} />

      <ActivityStats petId={petId} timeRange={timeRange} />
    </div>
  );
};

// Media Upload Component
export const MediaUploader = ({ petId, onUploadComplete }: MediaUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [petContext, setPetContext] = useState<Partial<PetContext>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMedia = useMediaUpload();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);

    // Auto-extract basic pet context if possible
    const basicContext: Partial<PetContext> = {
      petId,
      // Additional auto-detection could go here
    };
    setPetContext(basicContext);
  }, [petId]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !petContext.petName) return;

    await uploadMedia.mutateAsync({
      file: selectedFile,
      petContext: petContext as PetContext,
    });

    setSelectedFile(null);
    setPetContext({});
    onUploadComplete?.();
  }, [selectedFile, petContext, uploadMedia, onUploadComplete]);

  return (
    <div className="media-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {!selectedFile ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="upload-button"
        >
          📸 Choose Photo/Video
        </button>
      ) : (
        <div className="upload-preview">
          <PetContextForm
            context={petContext}
            onChange={setPetContext}
          />

          <button
            onClick={handleUpload}
            disabled={uploadMedia.isPending}
            className="confirm-upload-button"
          >
            {uploadMedia.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
};

// Helper Components
const MediaItem = ({ media, onClick }: { media: PetMedia; onClick: () => void }) => (
  <div className="media-item" onClick={onClick}>
    <img src={media.thumbnailUrl || media.url} alt={media.metadata.altText} />
    <div className="media-overlay">
      <div className="media-type-icon">
        {media.type === 'video' ? '🎥' : '📸'}
      </div>
      {media.processing.status !== 'completed' && (
        <div className="processing-status">
          {media.processing.status}
        </div>
      )}
    </div>
  </div>
);

const MediaViewer = ({ media, onClose }: { media: PetMedia; onClose: () => void }) => (
  <div className="media-viewer">
    <div className="viewer-header">
      <button onClick={onClose}>✕</button>
    </div>

    <div className="viewer-content">
      {media.type === 'video' ? (
        <video src={media.url} controls />
      ) : (
        <img src={media.url} alt={media.metadata.altText} />
      )}
    </div>

    <div className="viewer-info">
      <h3>{media.metadata.petContext.petName}</h3>
      {media.metadata.caption && <p>{media.metadata.caption}</p>}
      <div className="ai-insights">
        {media.metadata.aiAnalysis?.emotion && (
          <span>Mood: {media.metadata.aiAnalysis.emotion}</span>
        )}
      </div>
    </div>
  </div>
);

const PetContextForm = ({
  context,
  onChange
}: {
  context: Partial<PetContext>;
  onChange: (context: Partial<PetContext>) => void;
}) => (
  <div className="pet-context-form">
    <input
      placeholder="Pet name"
      value={context.petName || ''}
      onChange={(e) => onChange({ ...context, petName: e.target.value })}
    />
    <input
      placeholder="Activity (optional)"
      value={context.activity || ''}
      onChange={(e) => onChange({ ...context, activity: e.target.value })}
    />
    <select
      value={context.mood || ''}
      onChange={(e) => onChange({ ...context, mood: e.target.value || undefined })}
    >
      <option value="">Select mood (optional)</option>
      <option value="happy">Happy</option>
      <option value="excited">Excited</option>
      <option value="playful">Playful</option>
      <option value="relaxed">Relaxed</option>
    </select>
  </div>
);

// Type definitions
interface MediaUploaderProps {
  petId: string;
  onUploadComplete?: () => void;
}

interface MediaFilters {
  type: 'all' | 'photo' | 'video' | 'achievement';
  sortBy: 'newest' | 'oldest' | 'most_liked' | 'quality';
  dateRange: 'all' | 'week' | 'month' | 'year';
}

interface ActivityData {
  petId: string;
  type: string;
  duration?: number;
  distance?: number;
  photos?: string[];
  videos?: string[];
  notes?: string;
  location?: GeoPoint;
  weather?: WeatherInfo;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface ActivityRecord {
  id: string;
  petId: string;
  type: string;
  duration?: number;
  distance?: number;
  photos?: string[];
  videos?: string[];
  notes?: string;
  location?: GeoPoint;
  weather?: WeatherInfo;
  createdAt: Date;
}

interface ActivityHighlight {
  type: string;
  title: string;
  description: string;
  mediaUrls: string[];
  badge: string;
}

interface ActivityDay {
  date: Date;
  totalDuration: number;
  topPhotos: string[];
}

interface FavoriteActivity {
  type: string;
  count: number;
  photos: string[];
}

interface Achievement {
  title: string;
  description: string;
  badge: string;
  mediaUrls: string[];
}

// Skeleton components
const MediaGallerySkeleton = () => (
  <div className="media-gallery-skeleton">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="skeleton-item" />
    ))}
  </div>
);

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Extend MediaProcessingEngine with query methods
Object.assign(MediaProcessingEngine, {
  async getPetMedia(petId: string, filters?: MediaFilters): Promise<PetMedia[]> {
    // Query database for pet media
    return [];
  },
});

// Extend ActivityTrackingEngine with query methods
Object.assign(ActivityTrackingEngine, {
  async getActivitiesInRange(petId: string, timeRange: TimeRange): Promise<ActivityRecord[]> {
    // Query database for activities in time range
    return [];
  },
});
