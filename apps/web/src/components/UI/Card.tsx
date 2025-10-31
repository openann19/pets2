/**
 * 🎴 CARD COMPONENT - WEB VERSION
 * Matches mobile Card component API exactly
 * Uses theme tokens for consistent styling
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import type { AppTheme, SpacingScale, RadiiScale } from '@/theme';
import { cn } from '@/lib/utils';

type SpacingKey = keyof SpacingScale;
type RadiiKey = 'sm' | 'md' | 'lg';
type ShadowKey = 'elevation1' | 'elevation2' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: SpacingKey;
  radius?: RadiiKey;
  shadow?: ShadowKey | 'none';
  tone?: 'surface' | 'surfaceMuted' | 'background';
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

const shadowMap: Record<RadiiKey, ShadowKey> = {
  sm: 'elevation1',
  md: 'elevation2',
  lg: 'glass',
};

export function Card({
  padding = 'lg',
  radius = 'md',
  shadow,
  tone = 'surface',
  hover = false,
  className,
  children,
  style,
  ...props
}: CardProps): React.ReactElement {
  const theme = useTheme() as AppTheme;

  const resolvedPadding = theme.spacing[padding];
  const resolvedRadius = theme.radii[radius];
  const shadowKey = shadow || shadowMap[radius];
  const shadowValue = shadowKey !== 'none' ? theme.shadows[shadowKey] : null;
  const backgroundColor = 
    tone === 'surface' ? theme.colors.surface :
    tone === 'surfaceMuted' ? theme.colors.surface :
    theme.colors.bg;

  // Convert shadow to CSS string if it's an object
  const shadowString = typeof shadowValue === 'string' 
    ? shadowValue 
    : shadowValue 
      ? `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
      : 'none';

  return (
    <motion.div
      className={cn(
        'border',
        className
      )}
      style={{
        backgroundColor,
        borderRadius: resolvedRadius,
        padding: resolvedPadding,
        borderColor: 'rgba(15, 23, 42, 0.05)',
        boxShadow: shadowString,
        ...style,
      }}
      whileHover={hover ? {
        transform: 'translateY(-4px)',
        boxShadow: typeof theme.shadows.elevation2 === 'string' 
          ? theme.shadows.elevation2 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      } : {}}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Card;
//# sourceMappingURL=Card.jsx.map