/**
 * Enhanced File Download Service
 * Handles file downloads, progress tracking, and storage
 */

import { FileSystem } from 'expo-file-system';
import { Sharing } from 'expo-sharing';
import { Alert } from 'react-native';
import { logger } from '../utils/logger';

export interface DownloadProgress {
  totalBytesExpected: number;
  totalBytesWritten: number;
  progress: number; // 0-1
}

export interface DownloadOptions {
  fileName?: string;
  showProgress?: boolean;
  autoShare?: boolean;
  saveToDownloads?: boolean;
}

export class FileDownloadService {
  private static activeDownloads = new Map<
    string,
    {
      progress: DownloadProgress;
      onComplete?: (uri: string) => void;
      onError?: (error: Error) => void;
      onProgress?: (progress: DownloadProgress) => void;
    }
  >();

  /**
   * Download and handle file with progress tracking
   */
  static async downloadFile(url: string, options: DownloadOptions = {}): Promise<string> {
    const {
      fileName = `export-${Date.now()}`,
      showProgress = true,
      autoShare = false,
      saveToDownloads = true,
    } = options;

    const downloadId = `download-${Date.now()}`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    try {
      if (showProgress) {
        Alert.alert(
          'Download Started',
          "Your file is being downloaded. You'll be notified when it's ready.",
        );
      }

      // Create download resumable for progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgressInfo) => {
          const progress: DownloadProgress = {
            totalBytesExpected: downloadProgressInfo.totalBytesExpected || 0,
            totalBytesWritten: downloadProgressInfo.totalBytesWritten || 0,
            progress:
              downloadProgressInfo.totalBytesExpected && downloadProgressInfo.totalBytesWritten
                ? downloadProgressInfo.totalBytesWritten / downloadProgressInfo.totalBytesExpected
                : 0,
          };

          // Update progress for active download
          const download = this.activeDownloads.get(downloadId);
          if (download?.onProgress) {
            download.onProgress(progress);
          }
        },
      );

      // Start the download
      const result = await downloadResumable.downloadAsync();

      if (!result) {
        throw new Error('Download failed - no result returned');
      }

      // Handle successful download
      if (saveToDownloads) {
        await this.moveToDownloads(result.uri, fileName);
      }

      if (autoShare) {
        await this.shareFile(result.uri, fileName);
      }

      if (showProgress) {
        Alert.alert('Download Complete', `File "${fileName}" has been downloaded successfully.`, [
          {
            text: 'OK',
            onPress: () => {
              const download = this.activeDownloads.get(downloadId);
              if (download?.onComplete) {
                download.onComplete(result.uri);
              }
            },
          },
          {
            text: 'Share',
            onPress: () => this.shareFile(result.uri, fileName),
          },
        ]);
      }

      // Clean up
      this.activeDownloads.delete(downloadId);

      logger.info('File download completed', {
        fileName,
        fileSize: result.headers?.['Content-Length'],
        uri: result.uri,
      });

      return result.uri;
    } catch (error) {
      // Handle download error
      this.activeDownloads.delete(downloadId);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (showProgress) {
        Alert.alert('Download Failed', `Failed to download "${fileName}": ${errorMessage}`);
      }

      // Notify error callback
      const download = this.activeDownloads.get(downloadId);
      if (download?.onError) {
        download.onError(error instanceof Error ? error : new Error(errorMessage));
      }

      logger.error('File download failed', { error, fileName, url });
      throw error;
    }
  }

  /**
   * Move file to downloads directory (Android) or share (iOS)
   */
  private static async moveToDownloads(uri: string, fileName: string): Promise<void> {
    try {
      // On Android, try to move to Downloads
      if (FileSystem.documentDirectory) {
        const downloadsUri = `${FileSystem.documentDirectory}../Downloads/${fileName}`;

        try {
          await FileSystem.moveAsync({
            from: uri,
            to: downloadsUri,
          });
          logger.info('File moved to Downloads', { fileName, uri: downloadsUri });
        } catch (moveError) {
          // If move fails, keep in documents and offer to share
          logger.warn('Could not move to Downloads, keeping in Documents', { error: moveError });
        }
      }
    } catch (error) {
      logger.warn('Failed to move file to Downloads', { error });
    }
  }

  /**
   * Share file using system share sheet
   */
  private static async shareFile(uri: string, fileName: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `Share ${fileName}`,
          mimeType: this.getMimeType(fileName),
          UTI: this.getUTI(fileName),
        });
      } else {
        Alert.alert(
          'Sharing Not Available',
          'File sharing is not available on this device. The file has been saved to your documents.',
        );
      }
    } catch (error) {
      logger.error('Failed to share file', { error, fileName });
      Alert.alert(
        'Share Failed',
        'Could not share the file, but it has been saved to your device.',
      );
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private static getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get UTI for iOS sharing
   */
  private static getUTI(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'json':
        return 'public.json';
      case 'csv':
        return 'public.comma-separated-values-text';
      case 'pdf':
        return 'com.adobe.pdf';
      case 'xlsx':
        return 'org.openxmlformats.spreadsheetml.sheet';
      default:
        return 'public.data';
    }
  }

  /**
   * Register progress callbacks for a download
   */
  static registerDownloadCallbacks(
    downloadId: string,
    callbacks: {
      onProgress?: (progress: DownloadProgress) => void;
      onComplete?: (uri: string) => void;
      onError?: (error: Error) => void;
    },
  ): void {
    this.activeDownloads.set(downloadId, {
      progress: { totalBytesExpected: 0, totalBytesWritten: 0, progress: 0 },
      ...callbacks,
    });
  }

  /**
   * Cancel an active download
   */
  static async cancelDownload(downloadId: string): Promise<void> {
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      this.activeDownloads.delete(downloadId);
      logger.info('Download cancelled', { downloadId });
    }
  }

  /**
   * Get active downloads count
   */
  static getActiveDownloadsCount(): number {
    return this.activeDownloads.size;
  }

  /**
   * Clean up old downloaded files
   */
  static async cleanupOldFiles(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      if (!FileSystem.documentDirectory) return;

      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const now = Date.now();

      for (const file of files) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${file}`);

          if (fileInfo.exists && fileInfo.modificationTime) {
            const fileAge = now - fileInfo.modificationTime * 1000;

            if (fileAge > maxAge) {
              await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`);
              logger.info('Cleaned up old file', { file, age: fileAge });
            }
          }
        } catch (error) {
          logger.warn('Failed to process file during cleanup', { file, error });
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old files', { error });
    }
  }
}
