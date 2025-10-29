/**
 * Chat Service Test Suite
 * Tests reactions, attachments, voice notes, and messaging features
 */

import { chatService, sendVoiceNoteNative } from '../chatService';
import { request } from '../api';
import * as FileSystem from 'expo-file-system';

// Mock dependencies
jest.mock('../api', () => ({
  request: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn(),
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendReaction', () => {
    it('should send reaction successfully', async () => {
      const mockResponse = {
        success: true,
        messageId: 'msg-123',
        reactions: [{ emoji: '😍', userId: 'user-1', timestamp: '2024-01-01T00:00:00Z' }],
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendReaction('match-123', 'msg-123', '😍');

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/chat/reactions', {
        method: 'POST',
        body: {
          matchId: 'match-123',
          messageId: 'msg-123',
          reaction: '😍',
        },
      });
    });

    it('should throw error on failed reaction', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Failed to send reaction'));

      await expect(chatService.sendReaction('match-123', 'msg-123', '😍')).rejects.toThrow(
        'Failed to send reaction',
      );
    });

    it('should handle multiple reactions', async () => {
      const mockResponse = {
        success: true,
        messageId: 'msg-123',
        reactions: [
          { emoji: '😍', userId: 'user-1', timestamp: '2024-01-01T00:00:00Z' },
          { emoji: '❤️', userId: 'user-2', timestamp: '2024-01-01T00:01:00Z' },
        ],
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendReaction('match-123', 'msg-123', '❤️');

      expect(response.reactions).toHaveLength(2);
    });
  });

  describe('sendAttachment', () => {
    it('should send image attachment', async () => {
      const mockFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/photo.jpg',
        type: 'image',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendAttachment({
        matchId: 'match-123',
        attachmentType: 'image',
        file: mockFile,
        name: 'photo.jpg',
      });

      expect(response).toEqual(mockResponse);
      expect(request).toHaveBeenCalledWith('/chat/attachments', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    it('should send video attachment', async () => {
      const mockFile = new File(['video data'], 'video.mp4', { type: 'video/mp4' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/video.mp4',
        type: 'video',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendAttachment({
        matchId: 'match-123',
        attachmentType: 'video',
        file: mockFile,
        name: 'video.mp4',
      });

      expect(response.type).toBe('video');
    });

    it('should send file attachment', async () => {
      const mockFile = new File(['file data'], 'document.pdf', { type: 'application/pdf' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/document.pdf',
        type: 'file',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendAttachment({
        matchId: 'match-123',
        attachmentType: 'file',
        file: mockFile,
        name: 'document.pdf',
      });

      expect(response.type).toBe('file');
    });

    it('should handle attachment errors', async () => {
      const mockFile = new File(['data'], 'file.pdf', { type: 'application/pdf' });

      (request as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        chatService.sendAttachment({
          matchId: 'match-123',
          attachmentType: 'file',
          file: mockFile,
        }),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('sendVoiceNote', () => {
    it('should send voice note with FormData (native)', async () => {
      const formData = new FormData();
      formData.append('audio', new Blob(['audio data'], { type: 'audio/webm' }), {
        type: 'audio/webm',
      });

      (request as jest.Mock).mockResolvedValueOnce(undefined);

      await chatService.sendVoiceNote('match-123', formData, 5);

      expect(request).toHaveBeenCalledWith('/api/chat/voice', {
        method: 'POST',
        body: expect.any(FormData),
        headers: {},
      });
    });

    it('should send voice note with Blob (web)', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

      (request as jest.Mock).mockResolvedValueOnce(undefined);

      await chatService.sendVoiceNote('match-123', audioBlob, 5);

      expect(request).toHaveBeenCalledWith('/api/chat/voice', {
        method: 'POST',
        body: expect.any(FormData),
        headers: {},
      });
    });

    it('should send voice note with legacy signature', async () => {
      const audioBlob = new Blob(['audio data'], { type: 'audio/m4a' });

      (request as jest.Mock).mockResolvedValueOnce({
        success: true,
        url: 'https://example.com/voice.m4a',
        duration: 5,
      });

      await chatService.sendVoiceNote({
        matchId: 'match-123',
        audioBlob,
        duration: 5,
      });

      expect(request).toHaveBeenCalledWith('/api/chat/voice', {
        method: 'POST',
        body: expect.any(FormData),
        headers: {},
      });
    });

    it('should throw error for invalid file type', async () => {
      await expect(chatService.sendVoiceNote('match-123', {} as FormData, 5)).rejects.toThrow(
        'Invalid file type',
      );
    });

    it('should handle voice note upload errors', async () => {
      const formData = new FormData();

      (request as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

      await expect(chatService.sendVoiceNote('match-123', formData, 5)).rejects.toThrow(
        'Upload failed',
      );
    });
  });

  describe('sendVoiceNoteNative', () => {
    it('should upload voice note to S3 and register message', async () => {
      const presignResponse = {
        url: 'https://s3.example.com/upload',
        key: 'voice-notes/abc123.webm',
      };

      (request as jest.Mock)
        .mockResolvedValueOnce(presignResponse)
        .mockResolvedValueOnce({ status: 200 })
        .mockResolvedValueOnce({ success: true });

      (FileSystem.uploadAsync as jest.Mock).mockResolvedValueOnce({
        status: 200,
        body: 'Uploaded',
      });

      await sendVoiceNoteNative('match-123', {
        fileUri: 'file://voice.webm',
        duration: 10,
      });

      expect(request).toHaveBeenCalledWith('/uploads/voice/presign', {
        method: 'POST',
        body: { contentType: 'audio/webm' },
      });

      expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
        presignResponse.url,
        'file://voice.webm',
        {
          httpMethod: 'PUT',
          headers: { 'Content-Type': 'audio/webm' },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        },
      );

      expect(request).toHaveBeenCalledWith('/chat/match-123/voice-note', {
        method: 'POST',
        body: {
          key: presignResponse.key,
          duration: 10,
          waveform: [],
        },
      });
    });

    it('should handle S3 upload errors', async () => {
      (request as jest.Mock).mockResolvedValueOnce({
        url: 'https://s3.example.com/upload',
        key: 'voice-notes/abc123.webm',
      });

      (FileSystem.uploadAsync as jest.Mock).mockRejectedValueOnce(new Error('S3 upload failed'));

      await expect(
        sendVoiceNoteNative('match-123', {
          fileUri: 'file://voice.webm',
          duration: 10,
        }),
      ).rejects.toThrow('S3 upload failed');
    });

    it('should handle presign errors', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Presign failed'));

      await expect(
        sendVoiceNoteNative('match-123', {
          fileUri: 'file://voice.webm',
          duration: 10,
        }),
      ).rejects.toThrow('Presign failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large file uploads', async () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const mockResponse = {
        success: true,
        url: 'https://example.com/large.jpg',
        type: 'image',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendAttachment({
        matchId: 'match-123',
        attachmentType: 'image',
        file: largeFile,
      });

      expect(response.success).toBe(true);
    });

    it('should handle network errors during reaction', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(chatService.sendReaction('match-123', 'msg-123', '❤️')).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle invalid match ID', async () => {
      (request as jest.Mock).mockRejectedValueOnce(new Error('Match not found'));

      await expect(chatService.sendReaction('invalid-match', 'msg-123', '😍')).rejects.toThrow(
        'Match not found',
      );
    });

    it('should handle concurrent reactions', async () => {
      const mockResponse = {
        success: true,
        messageId: 'msg-123',
        reactions: [],
      };

      (request as jest.Mock).mockResolvedValue(mockResponse);

      const reactions = await Promise.all([
        chatService.sendReaction('match-123', 'msg-123', '😍'),
        chatService.sendReaction('match-123', 'msg-123', '❤️'),
        chatService.sendReaction('match-123', 'msg-123', '👍'),
      ]);

      expect(reactions).toHaveLength(3);
      expect(reactions[0]?.success).toBe(true);
    });

    it('should handle missing attachment name', async () => {
      const mockFile = new File(['data'], '', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        url: 'https://example.com/file',
        type: 'image',
      };

      (request as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await chatService.sendAttachment({
        matchId: 'match-123',
        attachmentType: 'image',
        file: mockFile,
      });

      expect(response.success).toBe(true);
    });
  });
});
