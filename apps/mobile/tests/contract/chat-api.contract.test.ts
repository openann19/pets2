/**
 * Contract Tests for Chat API Endpoints
 * Validates request/response schemas, error codes, and edge cases
 */

import { chatService } from '../../../src/services/chatService';
import { request } from '../../../src/services/api';
import { uploadAdapter } from '../../../src/services/upload/index';

jest.mock('../../../src/services/api');
jest.mock('../../../src/services/upload/index');

const mockRequest = request as jest.MockedFunction<typeof request>;
const mockUploadAdapter = uploadAdapter as jest.Mocked<typeof uploadAdapter>;

describe('Chat API Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /chat/reactions', () => {
    const validRequest = {
      matchId: 'match123',
      messageId: 'msg456',
      reaction: '❤️',
    };

    it('should send valid reaction request', async () => {
      const validResponse = {
        success: true,
        messageId: 'msg456',
        reactions: [
          {
            emoji: '❤️',
            userId: 'user789',
            timestamp: '2025-01-27T00:00:00Z',
          },
        ],
      };

      mockRequest.mockResolvedValue(validResponse);

      const result = await chatService.sendReaction(
        validRequest.matchId,
        validRequest.messageId,
        validRequest.reaction,
      );

      expect(mockRequest).toHaveBeenCalledWith('/chat/reactions', {
        method: 'POST',
        body: validRequest,
      });

      expect(result).toEqual(validResponse);
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg456');
      expect(Array.isArray(result.reactions)).toBe(true);
      expect(result.reactions[0]).toHaveProperty('emoji');
      expect(result.reactions[0]).toHaveProperty('userId');
      expect(result.reactions[0]).toHaveProperty('timestamp');
    });

    it('should handle invalid reaction type', async () => {
      mockRequest.mockRejectedValue({
        status: 400,
        message: 'Invalid reaction type',
      });

      await expect(
        chatService.sendReaction(validRequest.matchId, validRequest.messageId, 'invalid'),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Invalid reaction type',
      });
    });

    it('should handle unauthorized requests', async () => {
      mockRequest.mockRejectedValue({
        status: 401,
        message: 'Unauthorized',
      });

      await expect(
        chatService.sendReaction(validRequest.matchId, validRequest.messageId, validRequest.reaction),
      ).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should handle rate limit errors', async () => {
      mockRequest.mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded',
      });

      await expect(
        chatService.sendReaction(validRequest.matchId, validRequest.messageId, validRequest.reaction),
      ).rejects.toMatchObject({
        status: 429,
        message: 'Rate limit exceeded',
      });
    });

    it('should validate required fields', async () => {
      await expect(
        chatService.sendReaction('', '', '❤️'),
      ).rejects.toThrow();

      await expect(
        chatService.sendReaction(validRequest.matchId, '', '❤️'),
      ).rejects.toThrow();
    });
  });

  describe('POST /chat/attachments', () => {
    const validParams = {
      matchId: 'match123',
      attachmentType: 'image' as const,
      uri: 'file://photo.jpg',
      name: 'photo.jpg',
      contentType: 'image/jpeg',
    };

    beforeEach(() => {
      mockUploadAdapter.uploadPhoto = jest.fn().mockResolvedValue({
        url: 'https://cdn.example.com/photo.jpg',
      });
    });

    it('should send valid attachment request', async () => {
      const validResponse = {
        success: true,
        url: 'https://cdn.example.com/photo.jpg',
        type: 'image',
      };

      mockRequest.mockResolvedValue(validResponse);

      const result = await chatService.sendAttachment(validParams);

      expect(mockUploadAdapter.uploadPhoto).toHaveBeenCalledWith({
        uri: validParams.uri,
        name: validParams.name,
        contentType: validParams.contentType,
      });

      expect(mockRequest).toHaveBeenCalledWith('/chat/attachments', {
        method: 'POST',
        body: {
          matchId: validParams.matchId,
          url: 'https://cdn.example.com/photo.jpg',
          type: validParams.attachmentType,
          name: validParams.name,
        },
      });

      expect(result).toEqual(validResponse);
      expect(result.success).toBe(true);
      expect(result.url).toBeTruthy();
      expect(result.type).toBe('image');
    });

    it('should handle video attachments', async () => {
      const videoParams = {
        ...validParams,
        attachmentType: 'video' as const,
        contentType: 'video/mp4',
      };

      mockUploadAdapter.uploadVideo = jest.fn().mockResolvedValue({
        url: 'https://cdn.example.com/video.mp4',
      });

      const validResponse = {
        success: true,
        url: 'https://cdn.example.com/video.mp4',
        type: 'video',
      };

      mockRequest.mockResolvedValue(validResponse);

      const result = await chatService.sendAttachment(videoParams);

      expect(mockUploadAdapter.uploadVideo).toHaveBeenCalled();
      expect(result.type).toBe('video');
    });

    it('should handle oversize files', async () => {
      mockRequest.mockRejectedValue({
        status: 413,
        message: 'File too large',
      });

      await expect(chatService.sendAttachment(validParams)).rejects.toMatchObject({
        status: 413,
        message: 'File too large',
      });
    });

    it('should handle invalid file type', async () => {
      const invalidParams = {
        ...validParams,
        attachmentType: 'invalid' as any,
      };

      await expect(chatService.sendAttachment(invalidParams)).rejects.toThrow();
    });
  });

  describe('POST /chat/voice-notes', () => {
    const validParams = {
      matchId: 'match123',
      audioUri: 'file://voice.m4a',
      duration: 5000,
    };

    beforeEach(() => {
      mockUploadAdapter.uploadVideo = jest.fn().mockResolvedValue({
        url: 'https://cdn.example.com/voice.m4a',
      });
    });

    it('should send valid voice note request', async () => {
      const validResponse = {
        success: true,
        url: 'https://cdn.example.com/voice.m4a',
        duration: 5000,
      };

      mockRequest.mockResolvedValue(validResponse);

      const result = await chatService.sendVoiceNote(validParams);

      expect(mockUploadAdapter.uploadVideo).toHaveBeenCalledWith({
        uri: validParams.audioUri,
        name: 'voice.m4a',
        contentType: 'audio/m4a',
      });

      expect(mockRequest).toHaveBeenCalledWith('/chat/voice-notes', {
        method: 'POST',
        body: {
          matchId: validParams.matchId,
          url: 'https://cdn.example.com/voice.m4a',
          duration: validParams.duration,
        },
      });

      expect(result).toEqual(validResponse);
      expect(result.success).toBe(true);
      expect(result.url).toBeTruthy();
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle legacy method signature', async () => {
      const validResponse = {
        success: true,
        url: 'https://cdn.example.com/voice.m4a',
        duration: 3000,
      };

      mockRequest.mockResolvedValue(validResponse);

      const result = await chatService.sendVoiceNote(
        validParams.matchId,
        validParams.audioUri,
        validParams.duration,
      );

      expect(result).toBeDefined();
    });

    it('should handle missing audioUri in legacy signature', async () => {
      await expect(
        chatService.sendVoiceNote(validParams.matchId, undefined as any, validParams.duration),
      ).rejects.toThrow('audioUri is required');
    });

    it('should handle storage full errors', async () => {
      mockRequest.mockRejectedValue({
        status: 507,
        message: 'Storage full',
      });

      await expect(chatService.sendVoiceNote(validParams)).rejects.toMatchObject({
        status: 507,
        message: 'Storage full',
      });
    });

    it('should handle file too large errors', async () => {
      mockRequest.mockRejectedValue({
        status: 413,
        message: 'File too large',
      });

      await expect(chatService.sendVoiceNote(validParams)).rejects.toMatchObject({
        status: 413,
        message: 'File too large',
      });
    });

    it('should validate duration is positive', async () => {
      const invalidParams = {
        ...validParams,
        duration: -1000,
      };

      await expect(chatService.sendVoiceNote(invalidParams)).rejects.toThrow();
    });
  });

  describe('Error Response Contracts', () => {
    it('should handle 400 Bad Request', async () => {
      mockRequest.mockRejectedValue({
        status: 400,
        message: 'Bad Request',
        errors: ['Invalid matchId'],
      });

      await expect(
        chatService.sendReaction('', 'msg123', '❤️'),
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should handle 404 Not Found', async () => {
      mockRequest.mockRejectedValue({
        status: 404,
        message: 'Match not found',
      });

      await expect(
        chatService.sendReaction('nonexistent', 'msg123', '❤️'),
      ).rejects.toMatchObject({
        status: 404,
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      mockRequest.mockRejectedValue({
        status: 500,
        message: 'Internal Server Error',
      });

      await expect(
        chatService.sendReaction('match123', 'msg123', '❤️'),
      ).rejects.toMatchObject({
        status: 500,
      });
    });
  });
});
