/**
 * Admin UI Configuration Controller
 * Manages premium UI style configuration via admin panel
 */

import type { Request, Response } from 'express';
import Configuration from '../models/Configuration';
import { logAdminActivity } from '../middleware/adminLogger';
import logger from '../utils/logger';

const CONFIG_TYPE = 'ui-style-premium';

export interface PremiumStyleConfig {
  animations: {
    enabled: boolean;
    reducedMotion: boolean;
    springConfig: {
      stiffness: number;
      damping: number;
      mass: number;
    };
    entranceDelay: number;
    staggerDelay: number;
  };
  pageTransitions: {
    enabled: boolean;
    defaultPreset: 'fade' | 'scale' | 'slideRight' | 'slideLeft' | 'slideUp' | 'zoom' | 'blurFade';
    routeMappings: Record<string, 'fade' | 'scale' | 'slideRight' | 'slideLeft' | 'slideUp' | 'zoom' | 'blurFade'>;
    duration: number;
    easing: [number, number, number, number];
  };
  card: {
    variant: 'elevated' | 'glass' | 'neon' | 'minimal' | 'holographic';
    enableGlow: boolean;
    enableShimmer: boolean;
    enableTilt: boolean;
    enableMagnetic: boolean;
    blurIntensity: number;
    shadowIntensity: number;
  };
  button: {
    variant: 'primary' | 'secondary' | 'premium' | 'glass' | 'neon';
    enableRipple: boolean;
    enableMagnetic: boolean;
    enableGlow: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
  };
  typography: {
    enableGradientText: boolean;
    enableKineticTypography: boolean;
    enableScrollReveal: boolean;
    gradientSpeed: number;
    kineticVariant: 'bounce' | 'wave' | 'pulse' | 'slide';
    fontFamily?: string;
    headingFontFamily?: string;
  };
  effects: {
    enableParallax: boolean;
    enableParticles: boolean;
    enableConfetti: boolean;
    parallaxLayers: number;
    particleCount: number;
  };
  colors: {
    enableNeonAccents: boolean;
    neonIntensity: number;
    enableHDR: boolean;
    enableDynamicColors: boolean;
    enableGradientMeshes: boolean;
    accentColor?: string;
    primaryGradient?: string[];
    secondaryGradient?: string[];
  };
  scroll: {
    enableParallax: boolean;
    enableSticky: boolean;
    enableMomentum: boolean;
    parallaxIntensity: number;
    stickyTransform: boolean;
  };
  performance: {
    enableGPUAcceleration: boolean;
    enableLazyLoading: boolean;
    maxFPS: number;
    qualityTier: 'auto' | 'low' | 'medium' | 'high' | 'ultra';
  };
}

/**
 * Get UI Style Configuration
 */
export const getUIStyleConfig = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const config = await Configuration.findOne({ type: CONFIG_TYPE });

    if (!config) {
      // Return default config if none exists
      const defaultConfig: PremiumStyleConfig = {
        animations: {
          enabled: true,
          reducedMotion: false,
          springConfig: { stiffness: 300, damping: 30, mass: 1 },
          entranceDelay: 0,
          staggerDelay: 0.06,
        },
        pageTransitions: {
          enabled: true,
          defaultPreset: 'fade',
          routeMappings: {
            '/dashboard': 'fade',
            '/swipe': 'scale',
            '/matches': 'slideRight',
            '/chat': 'slideLeft',
            '/profile': 'zoom',
            '/settings': 'slideUp',
            '/premium': 'blurFade',
          },
          duration: 0.6,
          easing: [0.22, 0.68, 0, 1],
        },
        card: {
          variant: 'glass',
          enableGlow: true,
          enableShimmer: true,
          enableTilt: true,
          enableMagnetic: false,
          blurIntensity: 20,
          shadowIntensity: 0.3,
        },
        button: {
          variant: 'premium',
          enableRipple: true,
          enableMagnetic: false,
          enableGlow: true,
          hapticFeedback: true,
          soundEffects: false,
        },
        typography: {
          enableGradientText: true,
          enableKineticTypography: false,
          enableScrollReveal: true,
          gradientSpeed: 3000,
          kineticVariant: 'wave',
        },
        effects: {
          enableParallax: true,
          enableParticles: false,
          enableConfetti: true,
          parallaxLayers: 3,
          particleCount: 50,
        },
        colors: {
          enableNeonAccents: true,
          neonIntensity: 50,
          enableHDR: false,
          enableDynamicColors: false,
          enableGradientMeshes: true,
        },
        scroll: {
          enableParallax: true,
          enableSticky: true,
          enableMomentum: true,
          parallaxIntensity: 0.5,
          stickyTransform: true,
        },
        performance: {
          enableGPUAcceleration: true,
          enableLazyLoading: true,
          maxFPS: 60,
          qualityTier: 'auto',
        },
      };

      res.json({
        success: true,
        data: defaultConfig,
        isDefault: true,
      });
      return;
    }

    res.json({
      success: true,
      data: config.data,
      isDefault: false,
    });
  } catch (error) {
    logger.error('Failed to get UI style config', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get UI style configuration',
    });
  }
};

/**
 * Update UI Style Configuration
 */
export const updateUIStyleConfig = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const updates = req.body as Partial<PremiumStyleConfig>;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Validate configuration
    // TODO: Add Joi/Zod validation schema

    const config = await Configuration.findOneAndUpdate(
      { type: CONFIG_TYPE },
      {
        type: CONFIG_TYPE,
        data: updates,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    await logAdminActivity({
      userId,
      action: 'update_ui_style_config',
      details: {
        configType: CONFIG_TYPE,
        updates: Object.keys(updates),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'UI style configuration updated successfully',
      data: config.data,
    });
  } catch (error) {
    logger.error('Failed to update UI style config', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to update UI style configuration',
    });
  }
};

/**
 * Reset UI Style Configuration to Defaults
 */
export const resetUIStyleConfig = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    await Configuration.findOneAndDelete({ type: CONFIG_TYPE });

    await logAdminActivity({
      userId,
      action: 'reset_ui_style_config',
      details: {
        configType: CONFIG_TYPE,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'UI style configuration reset to defaults',
    });
  } catch (error) {
    logger.error('Failed to reset UI style config', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to reset UI style configuration',
    });
  }
};

/**
 * Get UI Style Preview
 */
export const getUIStylePreview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const config = await Configuration.findOne({ type: CONFIG_TYPE });

    // Return preview data structure
    res.json({
      success: true,
      data: {
        config: config?.data || null,
        preview: {
          cards: {
            variant: config?.data?.card?.variant || 'glass',
            glow: config?.data?.card?.enableGlow || true,
            shimmer: config?.data?.card?.enableShimmer || true,
          },
          buttons: {
            variant: config?.data?.button?.variant || 'premium',
            ripple: config?.data?.button?.enableRipple || true,
            glow: config?.data?.button?.enableGlow || true,
          },
          animations: {
            enabled: config?.data?.animations?.enabled !== false,
            entranceDelay: config?.data?.animations?.entranceDelay || 0,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get UI style preview', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get UI style preview',
    });
  }
};

/**
 * Get Public UI Style Configuration (for users)
 * This endpoint is public and doesn't require admin authentication
 */
export const getPublicUIStyleConfig = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const config = await Configuration.findOne({ type: CONFIG_TYPE });

    if (!config) {
      // Return default config if none exists
      const defaultConfig: PremiumStyleConfig = {
        animations: {
          enabled: true,
          reducedMotion: false,
          springConfig: { stiffness: 300, damping: 30, mass: 1 },
          entranceDelay: 0,
          staggerDelay: 0.06,
        },
        pageTransitions: {
          enabled: true,
          defaultPreset: 'fade',
          routeMappings: {
            '/dashboard': 'fade',
            '/swipe': 'scale',
            '/matches': 'slideRight',
            '/chat': 'slideLeft',
            '/profile': 'zoom',
            '/settings': 'slideUp',
            '/premium': 'blurFade',
          },
          duration: 0.6,
          easing: [0.22, 0.68, 0, 1],
        },
        card: {
          variant: 'glass',
          enableGlow: true,
          enableShimmer: true,
          enableTilt: true,
          enableMagnetic: false,
          blurIntensity: 20,
          shadowIntensity: 0.3,
        },
        button: {
          variant: 'premium',
          enableRipple: true,
          enableMagnetic: false,
          enableGlow: true,
          hapticFeedback: true,
          soundEffects: false,
        },
        typography: {
          enableGradientText: true,
          enableKineticTypography: false,
          enableScrollReveal: true,
          gradientSpeed: 3000,
          kineticVariant: 'wave',
        },
        effects: {
          enableParallax: true,
          enableParticles: false,
          enableConfetti: true,
          parallaxLayers: 3,
          particleCount: 50,
        },
        colors: {
          enableNeonAccents: true,
          neonIntensity: 50,
          enableHDR: false,
          enableDynamicColors: false,
          enableGradientMeshes: true,
        },
        scroll: {
          enableParallax: true,
          enableSticky: true,
          enableMomentum: true,
          parallaxIntensity: 0.5,
          stickyTransform: true,
        },
        performance: {
          enableGPUAcceleration: true,
          enableLazyLoading: true,
          maxFPS: 60,
          qualityTier: 'auto',
        },
      };

      res.json({
        success: true,
        data: defaultConfig,
        version: '1.0.0',
        isDefault: true,
      });
      return;
    }

    res.json({
      success: true,
      data: config.data,
      version: config.version || '1.0.0',
      updatedAt: config.updatedAt,
      isDefault: false,
    });
  } catch (error) {
    logger.error('Failed to get public UI style config', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get UI style configuration',
    });
  }
};

