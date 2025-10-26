/**
 * Chat Service for PawfectMatch Mobile
 * Handles chat features: reactions, attachments, voice notes
 */

import { logger } from "@pawfectmatch/core";
import type { Message } from "@pawfectmatch/core";
import { request } from "./api";
import * as FileSystem from "expo-file-system";

export interface ChatReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface MessageWithReactions extends Message {
  reactions?: Record<string, number>;
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
  async sendReaction(
    matchId: string,
    messageId: string,
    reaction: string
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
      }>("/chat/reactions", {
        method: "POST",
        body: {
          matchId,
          messageId,
          reaction,
        },
      });

      logger.info("Reaction sent successfully", { matchId, messageId, reaction });

      return response;
    } catch (error) {
      logger.error("Failed to send reaction", { error, matchId, messageId, reaction });
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
   * Supports both FormData (native) and Blob (web)
   */
  async sendVoiceNote(
    matchId: string,
    file: FormData | Blob,
    duration?: number
  ): Promise<void>;
  
  /**
   * Send a voice note (legacy signature)
   */
  async sendVoiceNote(params: SendVoiceNoteParams): Promise<{
    success: boolean;
    url: string;
    duration: number;
  }>;
  
  async sendVoiceNote(
    matchIdOrParams: string | SendVoiceNoteParams,
    file?: FormData | Blob,
    duration?: number
  ): Promise<void> {
    try {
      // Handle both signatures
      let formData: FormData;
      let matchId: string;
      let voiceDuration: number;
      
      if (typeof matchIdOrParams === "string") {
        // New signature: sendVoiceNote(matchId, file, duration?)
        matchId = matchIdOrParams;
        if (file instanceof FormData) {
          // Native: FormData already has the file wrapped
          formData = file;
          formData.append("matchId", matchId);
        } else if (file instanceof Blob) {
          // Web: wrap Blob in FormData
          formData = new FormData();
          const audioFile = new File([file], "voice-note.webm", {
            type: "audio/webm",
          });
          formData.append("audioBlob", audioFile);
          formData.append("matchId", matchId);
        } else {
          throw new Error("Invalid file type");
        }
        voiceDuration = duration || 0;
      } else {
        // Legacy signature: sendVoiceNote({ matchId, audioBlob, duration })
        const params = matchIdOrParams;
        matchId = params.matchId;
        formData = new FormData();
        const audioFile = new File([params.audioBlob], "voice-note.m4a", {
          type: "audio/m4a",
        });
        formData.append("audioBlob", audioFile);
        formData.append("matchId", matchId);
        formData.append("duration", String(params.duration));
        voiceDuration = params.duration;
      }

      await request("/api/chat/voice", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type - FormData sets it automatically
        },
      });

      logger.info("Voice note sent successfully", { matchId, duration: voiceDuration });
    } catch (error) {
      logger.error("Failed to send voice note", { error, matchIdOrParams });
      throw error;
    }
  }
}

export const chatService = new ChatService();

// Native voice note upload helper
export async function sendVoiceNoteNative(matchId: string, p: { fileUri: string; duration: number }) {
  // presign
  const presign = await request("/uploads/voice/presign", {
    method: "POST",
    body: { contentType: "audio/webm" },
  });
  const { url, key } = presign;

  // PUT to S3
  await FileSystem.uploadAsync(url, p.fileUri, {
    httpMethod: "PUT",
    headers: { "Content-Type": "audio/webm" },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  // register message
  await request(`/chat/${matchId}/voice-note`, {
    method: "POST",
    body: { key, duration: p.duration, waveform: [] },
  });
}

// Inject to chatService
(chatService as any).sendVoiceNoteNative = sendVoiceNoteNative;
