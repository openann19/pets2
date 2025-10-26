/**
 * Chat Service for PawfectMatch Mobile
 * Handles chat features: reactions, attachments, voice notes
 */

import { logger } from "@pawfectmatch/core";
import { request } from "./api";

export interface ChatReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface ChatAttachment {
  type: "image" | "video" | "file";
  url: string;
  name?: string;
  size?: number;
}

export interface VoiceNote {
  url: string;
  duration: number;
  waveform?: number[];
}

interface SendReactionParams {
  matchId: string;
  messageId: string;
  reaction: string;
}

interface SendAttachmentParams {
  matchId: string;
  attachmentType: "image" | "video" | "file";
  file: File | Blob;
  name?: string;
}

interface SendVoiceNoteParams {
  matchId: string;
  audioBlob: Blob;
  duration: number;
}

/**
 * Chat Service for reactions, attachments, and voice notes
 */
class ChatService {
  /**
   * Send a reaction to a message
   */
  async sendReaction(params: SendReactionParams): Promise<{
    success: boolean;
    messageId: string;
    reactions: ChatReaction[];
  }> {
    try {
      const response = await request<{
        success: boolean;
        messageId: string;
        reactions: ChatReaction[];
      }>("/chat/reactions", {
        method: "POST",
        body: {
          matchId: params.matchId,
          messageId: params.messageId,
          reaction: params.reaction,
        },
      });

      logger.info("Reaction sent successfully", { params });

      return response;
    } catch (error) {
      logger.error("Failed to send reaction", { error, params });
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
      const formData = new FormData();
      formData.append("file", params.file);
      formData.append("matchId", params.matchId);
      formData.append("type", params.attachmentType);
      if (params.name) {
        formData.append("name", params.name);
      }

      const response = await request<{
        success: boolean;
        url: string;
        type: string;
      }>("/chat/attachments", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type - FormData sets it automatically
        },
      });

      logger.info("Attachment sent successfully", { params });

      return response;
    } catch (error) {
      logger.error("Failed to send attachment", { error, params });
      throw error;
    }
  }

  /**
   * Send a voice note
   */
  async sendVoiceNote(params: SendVoiceNoteParams): Promise<{
    success: boolean;
    url: string;
    duration: number;
  }> {
    try {
      const formData = new FormData();
      
      // Create a file-like object for the audio blob
      const audioFile = new File([params.audioBlob], "voice-note.m4a", {
        type: "audio/m4a",
      });
      
      formData.append("audioBlob", audioFile);
      formData.append("matchId", params.matchId);
      formData.append("duration", String(params.duration));

      const response = await request<{
        success: boolean;
        url: string;
        duration: number;
      }>("/api/chat/voice", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type - FormData sets it automatically
        },
      });

      logger.info("Voice note sent successfully", { params });

      return response;
    } catch (error) {
      logger.error("Failed to send voice note", { error, params });
      throw error;
    }
  }
}

export const chatService = new ChatService();
