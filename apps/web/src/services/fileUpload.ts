/**
 * File Upload Service for Chat Messages
 * Supports images, voice messages, and other file types
 */
import { logger } from '../services/logger';
class FileUploadService {
    static instance;
    cloudName;
    uploadPreset;
    apiKey;
    constructor() {
        // Get configuration from environment variables
        this.cloudName = process.env['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'] || '';
        this.uploadPreset = process.env['NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'] || '';
        this.apiKey = process.env['NEXT_PUBLIC_CLOUDINARY_API_KEY'] || '';
        if (!this.cloudName || !this.uploadPreset) {
            logger.warn('Cloudinary configuration missing - file uploads will use fallback');
        }
    }
    static getInstance() {
        if (!FileUploadService.instance) {
            FileUploadService.instance = new FileUploadService();
        }
        return FileUploadService.instance;
    }
    /**
     * Upload file to Cloudinary
     */
    async uploadFile(file, options = {}) {
        try {
            // Validate file
            this.validateFile(file, options);
            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            // Add folder if specified
            if (options.folder) {
                formData.append('folder', options.folder);
            }
            // Add resource type
            const resourceType = options.resourceType || this.detectResourceType(file);
            if (resourceType !== 'image') {
                formData.append('resource_type', resourceType);
            }
            // Add transformations
            if (options.transformation) {
                formData.append('transformation', options.transformation);
            }
            // Add quality
            if (options.quality !== undefined) {
                formData.append('quality', options.quality.toString());
            }
            // Add format
            if (options.format) {
                formData.append('format', options.format);
            }
            const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType === 'raw' ? 'raw' : 'upload'}`;
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Upload failed: ${response.status}`);
            }
            const result = await response.json();
            logger.info('File uploaded successfully', {
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                bytes: result.bytes
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                duration: result.duration,
            };
        }
        catch (error) {
            logger.error('File upload failed', { error, fileName: file.name, fileSize: file.size });
            throw error;
        }
    }
    /**
     * Upload image with optimization
     */
    async uploadImage(file, options = {}) {
        const imageOptions = {
            ...options,
            resourceType: 'image',
            quality: options.quality || 80,
            folder: options.folder || 'pawfectmatch/chat/images',
            allowedFormats: options.allowedFormats || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
        };
        return this.uploadFile(file, imageOptions);
    }
    /**
     * Upload voice message
     * @param audioBlob - The audio blob to upload
     * @param duration - The duration of the audio in seconds (used for metadata)
     */
    async uploadVoiceMessage(audioBlob, duration) {
        // Convert blob to file
        const roundedDuration = Math.max(Math.round(duration), 1);
        const file = new File([audioBlob], `voice_${Date.now()}_${roundedDuration}s.webm`, { type: 'audio/webm' });
        return this.uploadFile(file, {
            resourceType: 'video', // Cloudinary treats audio as video
            folder: 'pawfectmatch/chat/voice',
            format: 'mp3',
            allowedFormats: ['mp3', 'wav', 'ogg', 'webm'],
            maxFileSize: 25 * 1024 * 1024, // 25MB for voice
        });
    }
    /**
     * Upload document or other file
     */
    async uploadDocument(file, options = {}) {
        return this.uploadFile(file, {
            ...options,
            resourceType: 'raw',
            folder: options.folder || 'pawfectmatch/chat/documents',
            maxFileSize: options.maxFileSize || 50 * 1024 * 1024, // 50MB
        });
    }
    /**
     * Validate file before upload
     */
    validateFile(file, options) {
        const maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
        if (file.size > maxFileSize) {
            throw new Error(`File size exceeds maximum allowed size of ${this.formatFileSize(maxFileSize)}`);
        }
        if (options.allowedFormats && options.allowedFormats.length > 0) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!fileExtension || !options.allowedFormats.includes(fileExtension)) {
                throw new Error(`File format not allowed. Allowed formats: ${options.allowedFormats.join(', ')}`);
            }
        }
    }
    /**
     * Detect resource type from file
     */
    detectResourceType(file) {
        const type = file.type.toLowerCase();
        if (type.startsWith('image/'))
            return 'image';
        if (type.startsWith('video/'))
            return 'video';
        if (type.startsWith('audio/'))
            return 'audio';
        return 'raw';
    }
    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
    /**
     * Delete uploaded file
     */
    async deleteFile(publicId, resourceType = 'image') {
        try {
            if (!this.apiKey) {
                logger.warn('Cloudinary API key not configured - cannot delete file');
                return;
            }
            const deleteUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType === 'raw' ? 'raw' : resourceType}/destroy`;
            const formData = new FormData();
            formData.append('public_id', publicId);
            formData.append('api_key', this.apiKey);
            const response = await fetch(deleteUrl, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }
            logger.info('File deleted successfully', { publicId });
        }
        catch (error) {
            logger.error('File deletion failed', { error, publicId });
            throw error;
        }
    }
    /**
     * Check if service is configured
     */
    isConfigured() {
        return Boolean(this.cloudName && this.uploadPreset);
    }
}
// Export singleton instance
export const fileUploadService = FileUploadService.getInstance();
// Utility functions for common upload patterns
export const uploadImage = (file, folder) => fileUploadService.uploadImage(file, { folder: folder ?? undefined });
export const uploadVoiceMessage = (audioBlob, duration) => fileUploadService.uploadVoiceMessage(audioBlob, duration);
export const uploadDocument = (file, folder) => fileUploadService.uploadDocument(file, { folder: folder ?? undefined });
export default fileUploadService;
//# sourceMappingURL=fileUpload.js.map