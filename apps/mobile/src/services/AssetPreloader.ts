/**
 * Asset Preloading Service for PawfectMatch Mobile App
 * Preloads critical images, fonts, and assets for instant UX
 */
import { logger } from "@pawfectmatch/core";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Image, type ImageSourcePropType } from "react-native";

// Critical assets that should be preloaded
const CRITICAL_IMAGES: string[] = [
  // App icons and logos
  // require('../assets/icon.png'),
  // require('../assets/splash.png'),
  // Common UI assets
  // Add your critical images here
];

const CRITICAL_FONTS = {
  // System fonts are usually preloaded, add custom fonts here
  // 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  // 'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
};

class AssetPreloader {
  private static instance: AssetPreloader | undefined;
  private preloadPromise: Promise<void> | null = null;
  private isPreloaded = false;

  private constructor() {}

  static getInstance(): AssetPreloader {
    if (AssetPreloader.instance === undefined) {
      AssetPreloader.instance = new AssetPreloader();
    }
    return AssetPreloader.instance;
  }

  /**
   * Preload all critical assets
   */
  async preloadCriticalAssets(): Promise<void> {
    if (this.isPreloaded) {
      return;
    }

    if (this.preloadPromise !== null) {
      return this.preloadPromise;
    }

    this.preloadPromise = this.performPreloading();
    return this.preloadPromise;
  }

  /**
   * Perform the actual preloading
   */
  private async performPreloading(): Promise<void> {
    try {
      logger.info("Starting asset preloading...");

      const startTime = Date.now();

      // Prevent splash screen from hiding while loading
      await SplashScreen.preventAutoHideAsync();

      // Preload images in parallel
      const imagePromises = CRITICAL_IMAGES.map((uri) =>
        this.preloadImage(uri),
      );

      // Load fonts
      const fontPromise = this.loadFonts();

      // Wait for all assets to load
      await Promise.all([...imagePromises, fontPromise]);

      const loadTime = Date.now() - startTime;
      logger.info("Asset preloading completed", {
        loadTime,
        imageCount: CRITICAL_IMAGES.length,
      });

      this.isPreloaded = true;

      // Hide splash screen after loading
      await SplashScreen.hideAsync();
    } catch (error) {
      logger.error("Asset preloading failed", { error });
      // Don't fail the app if preloading fails
      this.isPreloaded = true;
      await SplashScreen.hideAsync();
    }
  }

  /**
   * Preload a single image
   */
  private async preloadImage(source: unknown): Promise<void> {
    return new Promise((resolve) => {
      const imageSource = Image.resolveAssetSource(
        source as ImageSourcePropType,
      );
      if (imageSource.uri) {
        Image.prefetch(imageSource.uri)
          .then(() => {
            resolve();
          })
          .catch((error: unknown) => {
            logger.warn("Image preload failed", { source, error });
            resolve(); // Don't fail on individual image errors
          });
      } else {
        resolve(); // Skip invalid sources
      }
    });
  }

  /**
   * Load custom fonts
   */
  private async loadFonts(): Promise<void> {
    try {
      if (Object.keys(CRITICAL_FONTS).length > 0) {
        await Font.loadAsync(CRITICAL_FONTS);
        logger.info("Fonts loaded successfully");
      }
    } catch (error) {
      logger.error("Font loading failed", { error });
      throw error;
    }
  }

  /**
   * Preload images by URL (for remote images)
   */
  async preloadRemoteImages(urls: string[]): Promise<void> {
    try {
      const promises = urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            Image.prefetch(url)
              .then(() => {
                resolve();
              })
              .catch(() => {
                resolve();
              }); // Don't fail on individual image errors
          }),
      );

      await Promise.all(promises);
      logger.info("Remote images preloaded", { count: urls.length });
    } catch (error) {
      logger.error("Remote image preloading failed", { error });
    }
  }

  /**
   * Preload assets for a specific screen
   */
  async preloadScreenAssets(
    screenName: string,
    assets: {
      images?: string[];
      fonts?: Record<string, unknown>;
    },
  ): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      // Preload screen-specific images
      if (assets.images !== undefined && assets.images.length > 0) {
        const imagePromises = assets.images.map((uri) =>
          this.preloadImage(uri),
        );
        promises.push(...imagePromises);
      }

      // Load screen-specific fonts
      if (assets.fonts !== undefined && Object.keys(assets.fonts).length > 0) {
        const fontPromise = Font.loadAsync(
          assets.fonts as Record<string, Font.FontSource>,
        );
        promises.push(fontPromise);
      }

      await Promise.all(promises);
      logger.info("Screen assets preloaded", {
        screenName,
        assetCount: promises.length,
      });
    } catch (error) {
      logger.error("Screen asset preloading failed", { error, screenName });
    }
  }

  /**
   * Check if assets are preloaded
   */
  isAssetsPreloaded(): boolean {
    return this.isPreloaded;
  }

  /**
   * Get preload status
   */
  getPreloadStatus(): {
    isPreloaded: boolean;
    isLoading: boolean;
  } {
    return {
      isPreloaded: this.isPreloaded,
      isLoading: this.preloadPromise !== null && !this.isPreloaded,
    };
  }
}

// Create singleton instance
export const assetPreloader = AssetPreloader.getInstance();

// Export convenience functions
export const preloadCriticalAssets = () =>
  assetPreloader.preloadCriticalAssets();
export const preloadRemoteImages = (urls: string[]) =>
  assetPreloader.preloadRemoteImages(urls);
export const preloadScreenAssets = (
  screenName: string,
  assets: {
    images?: string[];
    fonts?: Record<string, unknown>;
  },
) => assetPreloader.preloadScreenAssets(screenName, assets);
export const isAssetsPreloaded = () => assetPreloader.isAssetsPreloaded();

export default assetPreloader;
