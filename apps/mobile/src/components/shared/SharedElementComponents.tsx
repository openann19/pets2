/**
 * 🎯 SHARED ELEMENT WRAPPER COMPONENTS
 * 
 * Convenient wrapper components for common shared element use cases
 */

import React from 'react';
import { Image, ImageProps, ViewStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { SharedElement, type SharedElementConfig } from '@/foundation/shared-element';
import type { SharedElementLayout } from '@/foundation/shared-element';

const AnimatedImage = Animated.createAnimatedComponent(Image);

// ===== SHARED IMAGE COMPONENT =====

export interface SharedImageProps extends Omit<ImageProps, 'style'> {
  /** Shared element ID */
  id: string;
  /** Source or destination */
  type?: 'source' | 'destination';
  /** Style override */
  style?: StyleProp<ViewStyle>;
  /** Config override */
  config?: Partial<SharedElementConfig>;
  /** Called when layout measured */
  onLayoutMeasured?: (layout: SharedElementLayout) => void;
}

/**
 * SharedImage component
 * 
 * Wraps an Image with shared element transition support
 * 
 * @example
 * ```tsx
 * // Source (Card)
 * <SharedImage
 *   id={`pet-image-${pet.id}`}
 *   source={{ uri: pet.photo }}
 *   style={styles.cardImage}
 *   type="source"
 * />
 * 
 * // Destination (Detail)
 * <SharedImage
 *   id={`pet-image-${pet.id}`}
 *   source={{ uri: pet.photo }}
 *   style={styles.heroImage}
 *   type="destination"
 * />
 * ```
 */
export function SharedImage({
  id,
  type = 'source',
  style,
  config,
  onLayoutMeasured,
  ...imageProps
}: SharedImageProps) {
  return (
    <SharedElement
      id={id}
      type={type}
      config={config}
      onLayoutMeasured={onLayoutMeasured}
      style={style}
    >
      <AnimatedImage {...imageProps} style={style} />
    </SharedElement>
  );
}

// ===== SHARED VIEW COMPONENT =====

export interface SharedViewProps {
  /** Shared element ID */
  id: string;
  /** Source or destination */
  type?: 'source' | 'destination';
  /** Children */
  children: React.ReactNode;
  /** Style override */
  style?: StyleProp<ViewStyle>;
  /** Config override */
  config?: Partial<SharedElementConfig>;
  /** Called when layout measured */
  onLayoutMeasured?: (layout: SharedElementLayout) => void;
}

/**
 * SharedView component
 * 
 * Wraps any View content with shared element transition support
 * Useful for text, cards, or other non-image elements
 * 
 * @example
 * ```tsx
 * // Source (Card name)
 * <SharedView id={`pet-name-${pet.id}`} type="source">
 *   <Text>{pet.name}</Text>
 * </SharedView>
 * 
 * // Destination (Detail name)
 * <SharedView id={`pet-name-${pet.id}`} type="destination">
 *   <Text style={styles.detailName}>{pet.name}</Text>
 * </SharedView>
 * ```
 */
export function SharedView({
  id,
  type = 'source',
  children,
  style,
  config,
  onLayoutMeasured,
}: SharedViewProps) {
  return (
    <SharedElement
      id={id}
      type={type}
      config={config}
      onLayoutMeasured={onLayoutMeasured}
      style={style}
    >
      {children}
    </SharedElement>
  );
}

export default {
  SharedImage,
  SharedView,
};

