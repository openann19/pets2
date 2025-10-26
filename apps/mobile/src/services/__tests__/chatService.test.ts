/**
 * Chat Service Tests
 * Tests chat features: reactions, attachments, voice notes
 */

import { chatService } from '../chatService';

// Mock the request function
jest.mock('../api', () => ({
  request: jest.fn(),
}));

import { request } from '../api';

const mockRequest = request as jest.MockedFunction<typeof request>;

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendReaction', () => {
    it('should send reaction successfully', async () => {
      const mockResponse = {
        success: true,
        messageId: 'msg123',
        reactions: [
          {
            emoji: '👍',
            userId: 'user123',
            timestamp: '2024-01-01T12:00:00Z',
          },
        ],
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await chatService.sendReaction('match123', 'msg123', '👍');

      expect(mockRequest).toHaveBeenCalledWith('/chat/reactions', {
        method: 'POST',
        body: {
          matchId: 'match123',
          messageId: 'msg123',
          reaction: '👍',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle reaction send failure', async () => {
      const mockError = new Error('Network error');
      mockRequest.mockRejectedValue(mockError);

      await expect(
        chatService.sendReaction('match123', 'msg123', '👍')
      ).rejects.toThrow('Network error');
    });
  });

  describe('sendAttachment', () => {
    it('should send image attachment successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/image.jpg',
        type: 'image',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await chatService.sendAttachment({
        matchId: 'match123',
        attachmentType: 'image',
        file: mockFile,
        name: 'test.jpg',
      });

      expect(mockRequest).toHaveBeenCalledWith('/chat/attachments', {
        method: 'POST',
        body: expect.any(FormData),
        headers: {}, // FormData sets Content-Type automatically
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send video attachment successfully', async () => {
      const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/video.mp4',
        type: 'video',
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await chatService.sendAttachment({
        matchId: 'match123',
        attachmentType: 'video',
        file: mockFile,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle attachment upload failure', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Upload failed');
      mockRequest.mockRejectedValue(mockError);

      await expect(
        chatService.sendAttachment({
          matchId: 'match123',
          attachmentType: 'image',
          file: mockFile,
        })
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('sendVoiceNote', () => {
    it('should send voice note with new signature successfully', async () => {
      const mockFormData = new FormData();
      const mockResponse = {
        success: true,
        url: 'https://example.com/voice.webm',
        duration: 30,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await chatService.sendVoiceNote('match123', mockFormData, 30);

      expect(mockRequest).toHaveBeenCalledWith('/api/chat/voice', {
        method: 'POST',
        body: mockFormData,
        headers: {},
      });
      // Note: The actual implementation doesn't return the response, it just sends
      expect(result).toBeUndefined();
    });

    it('should send voice note with legacy signature successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'audio/m4a' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/voice.m4a',
        duration: 25,
      };

      mockRequest.mockResolvedValue(mockResponse);

      const result = await chatService.sendVoiceNote({
        matchId: 'match123',
        audioBlob: mockBlob,
        duration: 25,
      });

      expect(result).toBeUndefined();
    });

    it('should handle voice note upload failure', async () => {
      const mockFormData = new FormData();
      const mockError = new Error('Upload failed');
      mockRequest.mockRejectedValue(mockError);

      await expect(
        chatService.sendVoiceNote('match123', mockFormData)
      ).rejects.toThrow('Upload failed');
    });

    it('should handle invalid file type', async () => {
      const result = await chatService.sendVoiceNote('match123', 'invalid' as any);

      // Should not throw but handle gracefully
      expect(result).toBeUndefined();
    });
  });

  describe('sendVoiceNoteNative', () => {
    beforeEach(() => {
      // Mock FileSystem
      jest.mock('expo-file-system', () => ({
        uploadAsync: jest.fn().mockResolvedValue({}),
        FileSystemUploadType: {
          BINARY_CONTENT: 'BINARY_CONTENT',
        },
      }));

      // Reset the native method on chatService
      delete (chatService as any).sendVoiceNoteNative;
    });

    it('should send native voice note successfully', async () => {
      const mockRequest = require('../api').request;
      mockRequest.mockResolvedValueOnce({ url: 'presign-url', key: 'file-key' });
      mockRequest.mockResolvedValueOnce({}); // Register message response

      const result = await (chatService as any).sendVoiceNoteNative('match123', {
        fileUri: 'file://test.webm',
        duration: 30,
      });

      expect(result).toBeUndefined();
    });
  });
});
