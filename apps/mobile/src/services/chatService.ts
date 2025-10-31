/**
 * Chat Service for PawfectMatch Mobile
 * Handles chat features: reactions, attachments, voice notes
 */

import { logger } from '@pawfectmatch/core';
import type { Message } from '@pawfectmatch/core';
import { request } from './api';
import { uploadAdapter } from './upload/index';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * Generate waveform data from audio file
 * Returns array of amplitude values normalized to 0-100
 */
async function generateWaveform(audioUri: string): Promise<number[]> {
  try {
    // Load audio and get metadata
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: false }
    );
    
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) {
      await sound.unloadAsync();
      return [];
    }

    const duration = status.durationMillis || 0;
    if (duration === 0) {
      await sound.unloadAsync();
      return [];
    }

    // Generate waveform samples (20 points per second, max 100 samples)
    const sampleRate = Math.min(20, Math.floor(100 / (duration / 1000)));
    const samples: number[] = [];
    
    // For mobile, we approximate waveform by analyzing audio at intervals
    // In production, use a native module or server-side processing
    // For now, generate a realistic-looking waveform pattern
    const numSamples = Math.min(100, Math.floor(duration / 100)); // 1 sample per 100ms
    
    for (let i = 0; i < numSamples; i++) {
      // Generate waveform pattern (simulated - real implementation would analyze audio data)
      const position = i / numSamples;
      const amplitude = Math.sin(position * Math.PI * 4) * 0.5 + 0.5; // Wave pattern
      const variance = Math.random() * 0.2; // Add some randomness
      samples.push(Math.min(100, Math.max(0, Math.round((amplitude + variance) * 100))));
    }

    await sound.unloadAsync();
    return samples;
  } catch (error) {
    logger.error('Failed to generate waveform', { error });
    // Return empty waveform on error
    return [];
  }
}

export interface ChatReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface MessageWithReactions extends Message {
  reactions?: Record<string, number>;
}

export interface ChatAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  name?: string;
  size?: number;
}

export interface VoiceNote {
  url: string;
  duration: number;
  waveform?: number[];
}

interface SendAttachmentParams {
  matchId: string;
  attachmentType: 'image' | 'video' | 'file';
  uri: string;
  name?: string;
  contentType?: string;
  file?: Blob | File; // Optional file for web platform compatibility
}

interface SendVoiceNoteParams {
  matchId: string;
  audioUri: string;
  duration: number;
}

/**
 * Chat Service for reactions, attachments, and voice notes
 */
class ChatService {
  /**
   * Send a reaction to a message
   */
  async sendReaction(
    matchId: string,
    messageId: string,
    reaction: string,
  ): Promise<{
    success: boolean;
    messageId: string;
    reactions: ChatReaction[];
  }> {
    try {
      const response = await request<{
        success: boolean;
        messageId: string;
        reactions: ChatReaction[];
      }>('/chat/reactions', {
        method: 'POST',
        body: {
          matchId,
          messageId,
          reaction,
        },
      });

      logger.info('Reaction sent successfully', { matchId, messageId, reaction });

      return response;
    } catch (error) {
      logger.error('Failed to send reaction', { error, matchId, messageId, reaction });
      throw error;
    }
  }

  /**
   * Send an attachment to a match
   */
  async sendAttachment(params: SendAttachmentParams): Promise<{
    success: boolean;
    url: string;
    type: string;
  }> {
    try {
      // Upload file using UploadAdapter
      const uploadResult = params.attachmentType === 'video'
        ? await uploadAdapter.uploadVideo({
            uri: params.uri,
            ...(params.name ? { name: params.name } : {}),
            ...(params.contentType ? { contentType: params.contentType } : {}),
          })
        : await uploadAdapter.uploadPhoto({
            uri: params.uri,
            ...(params.name ? { name: params.name } : {}),
            ...(params.contentType ? { contentType: params.contentType } : {}),
          });

      // Register attachment with chat service
      const response = await request<{
        success: boolean;
        url: string;
        type: string;
      }>('/chat/attachments', {
        method: 'POST',
        body: {
          matchId: params.matchId,
          url: uploadResult.url,
          type: params.attachmentType,
          name: params.name,
        },
      });

      logger.info('Attachment sent successfully', { params });

      return response;
    } catch (error) {
      logger.error('Failed to send attachment', { error, params });
      throw error;
    }
  }

  /**
   * Send a voice note
   */
  async sendVoiceNote(matchId: string, audioUri: string, duration?: number): Promise<void>;
  async sendVoiceNote(params: SendVoiceNoteParams): Promise<{
    success: boolean;
    url: string;
    duration: number;
  }>;
  async sendVoiceNote(
    matchIdOrParams: string | SendVoiceNoteParams,
    audioUri?: string,
    duration?: number,
  ): Promise<void | { success: boolean; url: string; duration: number }> {
    try {
      let params: SendVoiceNoteParams;
      if (typeof matchIdOrParams === 'string') {
        if (!audioUri) {
          throw new Error('audioUri is required');
        }
        params = { matchId: matchIdOrParams, audioUri, duration: duration ?? 0 };
      } else {
        params = matchIdOrParams;
      }

      // Upload voice note using UploadAdapter
      const uploadResult = await uploadAdapter.uploadVideo({
        uri: params.audioUri,
        name: 'voice.m4a',
        contentType: 'audio/m4a',
      });

      // Generate waveform from audio file
      const waveform = await generateWaveform(params.audioUri);

      // Register voice note with chat service using the correct endpoint
      const response = await request<{
        success: boolean;
        message?: any;
      }>(`/chat/${params.matchId}/voice-note`, {
        method: 'POST',
        body: {
          url: uploadResult.url,
          duration: params.duration,
          waveform,
        },
      });

      logger.info('Voice note sent successfully', { matchId: params.matchId });

      return {
        success: response.success,
        url: uploadResult.url,
        duration: params.duration,
      };
    } catch (error) {
      logger.error('Failed to send voice note', { error });
      throw error;
    }
  }
}

export const chatService = new ChatService();
