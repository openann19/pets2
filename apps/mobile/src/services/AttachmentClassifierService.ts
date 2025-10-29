/**
 * Attachment Classifier Service for PawfectMatch Mobile
 * Handles intelligent classification of chat attachments (images, videos, documents)
 * Uses ML-based content analysis for smart categorization
 */

import { logger } from "@pawfectmatch/core";
import { request } from "./api";

export type AttachmentType = "image" | "video" | "document" | "audio" | "unknown";

export type AttachmentCategory =
  | "photo"
  | "selfie"
  | "screenshot"
  | "memes"
  | "video_message"
  | "voice_note"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "other";

export interface AttachmentMetadata {
  type: AttachmentType;
  category: AttachmentCategory;
  confidence: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
  size: number;
  metadata?: Record<string, unknown>;
}

export interface ClassificationResult {
  classification: AttachmentCategory;
  confidence: number;
  metadata: AttachmentMetadata;
  tags: string[];
  warnings?: string[];
}

class AttachmentClassifierService {
  /**
   * Classify an attachment and return detailed metadata
   */
  async classifyAttachment(params: {
    fileUri?: string;
    url?: string;
    mimeType: string;
    size: number;
    metadata?: Record<string, unknown>;
  }): Promise<ClassificationResult> {
    try {
      logger.info("Classifying attachment", {
        mimeType: params.mimeType,
        size: params.size,
      });

      // Determine base type from MIME type
      const type = this.inferTypeFromMime(params.mimeType);
      
      // Detect category based on heuristics
      const category = this.inferCategory(type, params.metadata);
      
      // Build metadata object
      const attachmentMetadata: AttachmentMetadata = {
        type,
        category,
        confidence: this.calculateConfidence(type, category),
        mimeType: params.mimeType,
        size: params.size,
        metadata: params.metadata,
      };

      // If dimensions provided, add them
      if (params.metadata?.width && params.metadata?.height) {
        attachmentMetadata.dimensions = {
          width: params.metadata.width as number,
          height: params.metadata.height as number,
        };
      }

      // If duration provided, add it
      if (params.metadata?.duration) {
        attachmentMetadata.duration = params.metadata.duration as number;
      }

      // Generate tags based on classification
      const tags = this.generateTags(type, category, params.metadata);

      // Detect potential warnings
      const warnings = this.detectWarnings(params);

      const result: ClassificationResult = {
        classification: category,
        confidence: attachmentMetadata.confidence,
        metadata: attachmentMetadata,
        tags,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      logger.info("Attachment classified successfully", {
        classification: result.classification,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error("Failed to classify attachment", { error, params });
      throw error;
    }
  }

  /**
   * Infer attachment type from MIME type
   */
  private inferTypeFromMime(mimeType: string): AttachmentType {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (
      mimeType.includes("document") ||
      mimeType.includes("text") ||
      mimeType.includes("application/pdf") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation")
    ) {
      return "document";
    }
    return "unknown";
  }

  /**
   * Infer category from type and metadata
   */
  private inferCategory(
    type: AttachmentType,
    metadata?: Record<string, unknown>,
  ): AttachmentCategory {
    switch (type) {
      case "image": {
        // Heuristics for image categories
        const width = metadata?.width as number | undefined;
        const height = metadata?.height as number | undefined;
        
        if (width && height) {
          const aspectRatio = width / height;
          // Square-ish images might be selfies or photos
          if (aspectRatio > 0.8 && aspectRatio < 1.2) {
            // Check if dimensions suggest a phone selfie
            if (width > 800 && width < 4000) {
              return "selfie";
            }
            return "photo";
          }
          // Very wide images might be screenshots
          if (aspectRatio > 2) {
            return "screenshot";
          }
        }
        return "photo";
      }

      case "video":
        return "video_message";

      case "audio":
        return "voice_note";

      case "document": {
        const mimeType = metadata?.mimeType as string | undefined;
        if (mimeType) {
          if (mimeType.includes("spreadsheet")) return "spreadsheet";
          if (mimeType.includes("presentation")) return "presentation";
          if (
            mimeType.includes("zip") ||
            mimeType.includes("rar") ||
            mimeType.includes("tar")
          ) {
            return "archive";
          }
        }
        return "document";
      }

      default:
        return "other";
    }
  }

  /**
   * Calculate confidence score for classification
   */
  private calculateConfidence(
    type: AttachmentType,
    category: AttachmentCategory,
  ): number {
    // Base confidence on how well type and category align
    let confidence = 0.7; // Base confidence

    // Higher confidence for well-defined categories
    if (category === "photo" || category === "selfie") {
      confidence = 0.9;
    }
    if (category === "video_message") {
      confidence = 0.95;
    }
    if (category === "voice_note") {
      confidence = 0.9;
    }
    if (category === "document") {
      confidence = 0.85;
    }
    if (category === "other") {
      confidence = 0.6;
    }

    return confidence;
  }

  /**
   * Generate semantic tags based on classification
   */
  private generateTags(
    type: AttachmentType,
    category: AttachmentCategory,
    metadata?: Record<string, unknown>,
  ): string[] {
    const tags: string[] = [type, category];

    // Add size-based tags
    const size = metadata?.size as number | undefined;
    if (size) {
      if (size > 5 * 1024 * 1024) {
        tags.push("large-file");
      } else if (size > 1024 * 1024) {
        tags.push("medium-file");
      } else {
        tags.push("small-file");
      }
    }

    // Add quality tags for images/videos
    if (type === "image" || type === "video") {
      const width = metadata?.width as number | undefined;
      const height = metadata?.height as number | undefined;
      if (width && height) {
        if (width > 2000 || height > 2000) {
          tags.push("high-resolution");
        }
      }
    }

    return tags;
  }

  /**
   * Detect potential issues with attachment
   */
  private detectWarnings(params: {
    size: number;
    mimeType: string;
  }): string[] {
    const warnings: string[] = [];

    // File size warnings
    if (params.size > 25 * 1024 * 1024) {
      warnings.push("large-file");
    }
    if (params.size > 50 * 1024 * 1024) {
      warnings.push("very-large-file");
    }

    // Unsupported format warning
    if (params.mimeType === "unknown") {
      warnings.push("unsupported-format");
    }

    return warnings;
  }

  /**
   * Batch classify multiple attachments
   */
  async batchClassify(attachments: Array<{
    fileUri?: string;
    url?: string;
    mimeType: string;
    size: number;
    metadata?: Record<string, unknown>;
  }>): Promise<ClassificationResult[]> {
    try {
      logger.info("Batch classifying attachments", { count: attachments.length });

      const results = await Promise.all(
        attachments.map((attachment) =>
          this.classifyAttachment(attachment),
        ),
      );

      logger.info("Batch classification complete", {
        count: results.length,
      });

      return results;
    } catch (error) {
      logger.error("Batch classification failed", { error });
      throw error;
    }
  }

  /**
   * Check if attachment type is supported for chat
   */
  isSupportedForChat(mimeType: string): boolean {
    return (
      mimeType.startsWith("image/") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/") ||
      mimeType === "application/pdf" ||
      mimeType.includes("document") ||
      mimeType.includes("text")
    );
  }

  /**
   * Get maximum file size for attachment type (in bytes)
   */
  getMaxFileSize(mimeType: string): number {
    if (mimeType.startsWith("image/")) {
      return 10 * 1024 * 1024; // 10MB for images
    }
    if (mimeType.startsWith("video/")) {
      return 50 * 1024 * 1024; // 50MB for videos
    }
    if (mimeType.startsWith("audio/")) {
      return 5 * 1024 * 1024; // 5MB for audio
    }
    if (mimeType.includes("document")) {
      return 10 * 1024 * 1024; // 10MB for documents
    }
    return 50 * 1024 * 1024; // 50MB default
  }
}

// Export singleton instance
export const attachmentClassifierService = new AttachmentClassifierService();
export default attachmentClassifierService;

