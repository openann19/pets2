/**
 * Optimized Image Component
 * 
 * Wrapper around ProgressiveImage with additional optimizations
 */
import React from 'react';
import { ProgressiveImage } from './ProgressiveImage';
import { useAdaptiveImageQuality } from '@/hooks/optimization/useAdaptiveQuality';
import type { FastImageProps, Source } from 'react-native-fast-image';

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  /** Image source */
  source: Source | number;
  /** Whether to use adaptive quality */
  adaptive?: boolean;
  /** Estimated height for layout preservation */
  estimatedHeight?: number;
}

/**
 * Fully optimized image component
 * Combines progressive loading + adaptive quality + network awareness
 */
export function OptimizedImage({
  source,
  adaptive = true,
  estimatedHeight = 200,
  ...props
}: OptimizedImageProps): React.JSX.Element {
  const { getImageUrl, getImagePriority, quality } = useAdaptiveImageQuality();

  // Get adaptive source if variants available
  const adaptiveSource = React.useMemo(() => {
    if (typeof source === 'number') return source;
    
    // If source is an object with variants, use adaptive quality
    if (adaptive && source.uri) {
      // This assumes source might have variants - adjust based on your API
      return { uri: source.uri };
    }
    
    return source;
  }, [source, adaptive]);

  const priority = getImagePriority();

  return (
    <ProgressiveImage
      source={adaptiveSource}
      estimatedHeight={estimatedHeight}
      adaptive={adaptive}
      priority={priority}
      {...props}
    />
  );
}

