/**
 * 📋 STAGGER LIST - ANIMATED LIST
 * Card stagger animation for lists
 * Uses cardStagger motion preset
 */

import React from 'react';
import Animated, { FadeInDown, Easing as REasing } from 'react-native-reanimated';
import { useMotion } from '../motion/useMotion';

export interface StaggerListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
}

/**
 * StaggerList - Animated list with card stagger effect
 * 
 * Usage:
 * ```tsx
 * <StaggerList
 *   data={items}
 *   renderItem={(item) => <Card {...item} />}
 * />
 * ```
 */
export function StaggerList<T extends { _id?: string }>({ 
  data, 
  renderItem,
  keyExtractor = (_, i) => i.toString()
}: StaggerListProps<T>) {
  const m = useMotion('cardStagger');

  return (
    <>
      {data.map((item, i) => (
        <Animated.View
          key={item._id ?? keyExtractor(item, i)}
          entering={FadeInDown.duration(m.duration).easing(REasing.bezier(0.2, 0, 0, 1)).delay(i * (m.stagger ?? 0))}
          style={{ marginBottom: 12 }}
        >
          {renderItem(item, i)}
        </Animated.View>
      ))}
    </>
  );
}

