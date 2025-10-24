/**
 * File Upload Service for Chat Messages
 * Supports images, voice messages, and other file types
 */
export interface UploadResult {
    url: string;
    publicId: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
}
export interface UploadOptions {
    folder?: string | undefined;
    resourceType?: 'image' | 'video' | 'audio' | 'raw';
    transformation?: string;
    quality?: number;
    format?: string;
    maxFileSize?: number;
    allowedFormats?: string[];
}
declare class FileUploadService {
    private static instance;
    private cloudName;
    private uploadPreset;
    private apiKey;
    private constructor();
    static getInstance(): FileUploadService;
    /**
     * Upload file to Cloudinary
     */
    uploadFile(file: File, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Upload image with optimization
     */
    uploadImage(file: File, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Upload voice message
     * @param audioBlob - The audio blob to upload
     * @param duration - The duration of the audio in seconds (used for metadata)
     */
    uploadVoiceMessage(audioBlob: Blob, duration: number): Promise<UploadResult>;
    /**
     * Upload document or other file
     */
    uploadDocument(file: File, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Validate file before upload
     */
    private validateFile;
    /**
     * Detect resource type from file
     */
    private detectResourceType;
    /**
     * Format file size for display
     */
    private formatFileSize;
    /**
     * Delete uploaded file
     */
    deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'audio' | 'raw'): Promise<void>;
    /**
     * Check if service is configured
     */
    isConfigured(): boolean;
}
export declare const fileUploadService: FileUploadService;
export declare const uploadImage: (file: File, folder?: string) => Promise<UploadResult>;
export declare const uploadVoiceMessage: (audioBlob: Blob, duration: number) => Promise<UploadResult>;
export declare const uploadDocument: (file: File, folder?: string) => Promise<UploadResult>;
export default fileUploadService;
//# sourceMappingURL=fileUpload.d.ts.map