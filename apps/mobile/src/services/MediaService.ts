/**
 * Media Service
 * Handles image/video/voice media upload and processing for chat messages
 */

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';

export interface MediaAttachment {
  type: 'image' | 'video' | 'voice';
  uri: string;
  mimeType: string;
  fileName: string;
  size: number;
}

export class MediaService {
  /**
   * Request camera roll permissions for images/videos
   */
  static async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Failed to request media library permissions:', { error });
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  static async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('Failed to request camera permissions:', { error });
      return false;
    }
  }

  /**
   * Pick image from library or camera
   */
  static async pickImage(source: 'library' | 'camera'): Promise<MediaAttachment | null> {
    try {
      // Request permissions
      const hasPermission = source === 'camera' 
        ? await this.requestCameraPermissions()
        : await this.requestMediaLibraryPermissions();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          source === 'camera' 
            ? 'Please grant camera permissions to take photos.'
            : 'Please grant photo library permissions to select images.'
        );
        return null;
      }

      // Launch picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        return {
          type: 'image',
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `image-${Date.now()}.jpg`,
          size: blob.size,
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to pick image:', { error });
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  }

  /**
   * Pick video from library or camera
   */
  static async pickVideo(source: 'library' | 'camera'): Promise<MediaAttachment | null> {
    try {
      // Request permissions
      const hasPermission = source === 'camera' 
        ? await this.requestCameraPermissions()
        : await this.requestMediaLibraryPermissions();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          source === 'camera' 
            ? 'Please grant camera permissions to record videos.'
            : 'Please grant video library permissions to select videos.'
        );
        return null;
      }

      // Launch picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.8,
            videoMaxDuration: 60, // 60 seconds max
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get file size
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        return {
          type: 'video',
          uri: asset.uri,
          mimeType: asset.mimeType || 'video/mp4',
          fileName: asset.fileName || `video-${Date.now()}.mp4`,
          size: blob.size,
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to pick video:', { error });
      Alert.alert('Error', 'Failed to pick video. Please try again.');
      return null;
    }
  }

  /**
   * Upload media attachment to server
   */
  static async uploadMedia(media: MediaAttachment, matchId: string): Promise<string> {
    try {
      // Create FormData
      const formData = new FormData();
      
      formData.append('media', {
        uri: media.uri,
        type: media.mimeType,
        name: media.fileName,
      } as any);
      
      formData.append('type', media.type);
      formData.append('matchId', matchId);

      // Upload to server
      const response = await fetch(`/api/matches/${matchId}/media`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      logger.error('Failed to upload media:', { error });
      throw error;
    }
  }

  /**
   * Compress image for sending
   */
  static async compressImage(uri: string): Promise<string> {
    try {
      const manipulator = require('expo-image-manipulator').default;
      
      const manipulated = await manipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: manipulator.SaveFormat.JPEG }
      );
      
      return manipulated.uri;
    } catch (error) {
      logger.error('Failed to compress image:', { error });
      return uri; // Return original if compression fails
    }
  }
}

export default MediaService;

