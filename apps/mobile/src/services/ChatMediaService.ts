/**
 * Chat Media Service
 * Unified service for handling all chat media types: images, videos, voice, files, GIFs, stickers
 */
import * as ImagePicker from 'expo-image-picker';
// Note: expo-document-picker needs to be installed
// import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { logger } from './logger';
import { chatService } from './chatService';
import { offlineMessageQueue } from './OfflineMessageQueue';
import NetInfo from '@react-native-community/netinfo';

export type MediaType = 'image' | 'video' | 'voice' | 'file' | 'gif' | 'sticker';

export interface MediaFile {
  uri: string;
  type: MediaType;
  name?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number; // For video/voice
}

export interface GifResult {
  id: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

export interface StickerResult {
  id: string;
  url: string;
  category: string;
}

export interface SendMediaOptions {
  matchId: string;
  media: MediaFile | GifResult | StickerResult;
  replyTo?: string;
}

export interface MediaPickerOptions {
  allowsMultipleSelection?: boolean;
  mediaTypes?: MediaType[];
  quality?: number;
  maxSize?: number; // in bytes
}

class ChatMediaService {
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  private readonly MAX_VOICE_DURATION = 60; // 60 seconds

  /**
   * Request media library permissions
   */
  async requestMediaPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Failed to request media permissions', { error });
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Failed to request camera permissions', { error });
      return false;
    }
  }

  /**
   * Pick image from library
   */
  async pickImage(options: {
    allowsEditing?: boolean;
    quality?: number;
    allowsMultipleSelection?: boolean;
  } = {}): Promise<MediaFile[]> {
    const hasPermission = await this.requestMediaPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      quality: options.quality ?? 0.8,
      allowsMultipleSelection: options.allowsMultipleSelection ?? false,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      type: 'image' as MediaType,
      name: asset.fileName || `image_${Date.now()}.jpg`,
      mimeType: asset.type || 'image/jpeg',
      width: asset.width,
      height: asset.height,
      size: asset.fileSize,
    }));
  }

  /**
   * Take photo with camera
   */
  async takePhoto(options: { allowsEditing?: boolean; quality?: number } = {}): Promise<MediaFile | null> {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options.allowsEditing ?? true,
      quality: options.quality ?? 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image' as MediaType,
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      mimeType: asset.type || 'image/jpeg',
      width: asset.width,
      height: asset.height,
      size: asset.fileSize,
    };
  }

  /**
   * Pick video from library
   */
  async pickVideo(options: { quality?: number } = {}): Promise<MediaFile[]> {
    const hasPermission = await this.requestMediaPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: options.quality ?? 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset) => ({
      uri: asset.uri,
      type: 'video' as MediaType,
      name: asset.fileName || `video_${Date.now()}.mp4`,
      mimeType: asset.type || 'video/mp4',
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      size: asset.fileSize,
    }));
  }

  /**
   * Record video with camera
   */
  async recordVideo(options: { quality?: number; maxDuration?: number } = {}): Promise<MediaFile | null> {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: options.quality ?? 0.8,
      videoMaxDuration: options.maxDuration ?? 60,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'video' as MediaType,
      name: asset.fileName || `video_${Date.now()}.mp4`,
      mimeType: asset.type || 'video/mp4',
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      size: asset.fileSize,
    };
  }

  /**
   * Pick file from document picker
   */
  async pickFile(options: { 
    type?: string[];
    copyToCacheDirectory?: boolean;
  } = {}): Promise<MediaFile[]> {
    try {
      // Dynamic import to handle missing package gracefully
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: options.type || ['*/*'],
        copyToCacheDirectory: options.copyToCacheDirectory ?? true,
        multiple: false,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      return result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'file' as MediaType,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        size: asset.size,
      }));
    } catch (error) {
      logger.error('Failed to pick file', { error });
      // If document picker is not available, return empty array
      if (error instanceof Error && error.message.includes('expo-document-picker')) {
        logger.warn('expo-document-picker not installed, file picking unavailable');
      }
      return [];
    }
  }

  /**
   * Search for GIFs using Giphy API
   */
  async searchGifs(query: string, limit: number = 25): Promise<GifResult[]> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GIPHY_API_KEY || process.env.GIPHY_API_KEY;
      if (!apiKey) {
        logger.warn('Giphy API key not configured');
        return [];
      }

      const url = new URL('https://api.giphy.com/v1/gifs/search');
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('rating', 'pg-13'); // Safe for dating app

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Giphy API error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.data || []).map((gif: any): GifResult => ({
        id: gif.id,
        url: gif.images?.original?.url || gif.images?.fixed_height?.url || '',
        preview: gif.images?.fixed_width_small?.url || gif.images?.preview?.url || '',
        width: gif.images?.original?.width || 200,
        height: gif.images?.original?.height || 200,
      }));
    } catch (error) {
      logger.error('Failed to search GIFs', { error, query, limit });
      return [];
    }
  }

  /**
   * Get trending GIFs from Giphy API
   */
  async getTrendingGifs(limit: number = 25): Promise<GifResult[]> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GIPHY_API_KEY || process.env.GIPHY_API_KEY;
      if (!apiKey) {
        logger.warn('Giphy API key not configured');
        return [];
      }

      const url = new URL('https://api.giphy.com/v1/gifs/trending');
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('rating', 'pg-13');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Giphy API error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.data || []).map((gif: any): GifResult => ({
        id: gif.id,
        url: gif.images?.original?.url || gif.images?.fixed_height?.url || '',
        preview: gif.images?.fixed_width_small?.url || gif.images?.preview?.url || '',
        width: gif.images?.original?.width || 200,
        height: gif.images?.original?.height || 200,
      }));
    } catch (error) {
      logger.error('Failed to get trending GIFs', { error, limit });
      return [];
    }
  }

  /**
   * Get sticker categories
   * Uses Giphy Stickers API
   */
  async getStickerCategories(): Promise<string[]> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GIPHY_API_KEY || process.env.GIPHY_API_KEY;
      if (!apiKey) {
        // Return default categories if API not configured
        return ['reactions', 'emotions', 'animals', 'objects', 'celebration'];
      }

      // Giphy Stickers doesn't have explicit categories endpoint
      // Return predefined categories that work with Giphy
      return ['trending', 'reactions', 'emotions', 'animals', 'objects', 'celebration'];
    } catch (error) {
      logger.error('Failed to get sticker categories', { error });
      return ['reactions', 'emotions', 'animals', 'objects'];
    }
  }

  /**
   * Get stickers by category using Giphy Stickers API
   */
  async getStickers(category: string): Promise<StickerResult[]> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GIPHY_API_KEY || process.env.GIPHY_API_KEY;
      if (!apiKey) {
        logger.warn('Giphy API key not configured for stickers');
        return [];
      }

      const url = new URL('https://api.giphy.com/v1/stickers/search');
      url.searchParams.set('api_key', apiKey);
      
      // Map category to search term
      const searchTerm = category === 'trending' ? '' : category;
      if (searchTerm) {
        url.searchParams.set('q', searchTerm);
      } else {
        // Use trending endpoint instead
        const trendingUrl = new URL('https://api.giphy.com/v1/stickers/trending');
        trendingUrl.searchParams.set('api_key', apiKey);
        trendingUrl.searchParams.set('limit', '25');
        
        const response = await fetch(trendingUrl.toString());
        if (!response.ok) {
          throw new Error(`Giphy Stickers API error: ${response.status}`);
        }

        const data = await response.json();
        
        return (data.data || []).map((sticker: any): StickerResult => ({
          id: sticker.id,
          url: sticker.images?.original?.url || sticker.images?.fixed_height?.url || '',
          category: category || 'trending',
        }));
      }

      url.searchParams.set('limit', '25');
      url.searchParams.set('rating', 'pg-13');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Giphy Stickers API error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.data || []).map((sticker: any): StickerResult => ({
        id: sticker.id,
        url: sticker.images?.original?.url || sticker.images?.fixed_height?.url || '',
        category,
      }));
    } catch (error) {
      logger.error('Failed to get stickers', { error, category });
      return [];
    }
  }

  /**
   * Validate media file
   */
  private validateMedia(media: MediaFile): { valid: boolean; error?: string } {
    if (!media.uri) {
      return { valid: false, error: 'Media URI is required' };
    }

    switch (media.type) {
      case 'image':
        if (media.size && media.size > this.MAX_IMAGE_SIZE) {
          return { valid: false, error: `Image size exceeds ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB limit` };
        }
        break;
      case 'video':
        if (media.size && media.size > this.MAX_VIDEO_SIZE) {
          return { valid: false, error: `Video size exceeds ${this.MAX_VIDEO_SIZE / 1024 / 1024}MB limit` };
        }
        if (media.duration && media.duration > 300) {
          return { valid: false, error: 'Video duration exceeds 5 minutes' };
        }
        break;
      case 'file':
        if (media.size && media.size > this.MAX_FILE_SIZE) {
          return { valid: false, error: `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit` };
        }
        break;
      case 'voice':
        if (media.duration && media.duration > this.MAX_VOICE_DURATION) {
          return { valid: false, error: `Voice note exceeds ${this.MAX_VOICE_DURATION} seconds` };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Send media file to chat
   */
  async sendMedia(options: SendMediaOptions): Promise<void> {
    const { matchId, media, replyTo } = options;

    // Check network status
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected ?? false;

    // Handle GIF/Sticker (direct URL, no upload needed)
    if ('id' in media && (media.type === 'gif' || media.type === 'sticker')) {
      const gifOrSticker = media as GifResult | StickerResult;
      // Send as message with attachment URL
      await this.sendMediaMessage(matchId, gifOrSticker.url, media.type, replyTo);
      return;
    }

    // Validate media file
    const fileMedia = media as MediaFile;
    const validation = this.validateMedia(fileMedia);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid media file');
    }

    try {
      if (isOnline) {
        // Upload and send immediately
        await chatService.sendAttachment({
          matchId,
          attachmentType: fileMedia.type === 'video' ? 'video' : 
                          fileMedia.type === 'voice' ? 'video' : 'image',
          uri: fileMedia.uri,
          name: fileMedia.name,
          contentType: fileMedia.mimeType,
        });

        logger.info('Media sent successfully', { matchId, type: fileMedia.type });
      } else {
        // Queue for offline send
        await offlineMessageQueue.enqueue({
          matchId,
          content: `[${fileMedia.type}]`,
          messageType: fileMedia.type,
          attachments: [{
            uri: fileMedia.uri,
            name: fileMedia.name,
            mimeType: fileMedia.mimeType,
            size: fileMedia.size,
          }],
          replyTo: replyTo,
        });

        logger.info('Media queued for offline send', { matchId, type: fileMedia.type });
      }
    } catch (error) {
      logger.error('Failed to send media', { error, matchId, type: fileMedia.type });
      throw error;
    }
  }

  /**
   * Send media message (for GIF/stickers)
   */
  private async sendMediaMessage(
    matchId: string,
    url: string,
    type: MediaType,
    replyTo?: string,
  ): Promise<void> {
    // Send GIF/sticker as a message with attachment
    try {
      await chatService.sendAttachment({
        matchId,
        attachmentType: type === 'gif' ? 'image' : 'image',
        uri: url,
        name: type === 'gif' ? 'gif.gif' : 'sticker.png',
        contentType: type === 'gif' ? 'image/gif' : 'image/png',
      });
      logger.info('Media message sent', { matchId, url, type });
    } catch (error) {
      logger.error('Failed to send media message', { error, matchId, url, type });
      throw error;
    }
  }
}

export const chatMediaService = new ChatMediaService();

