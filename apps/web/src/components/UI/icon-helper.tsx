import React from 'react';
import type { ComponentType } from 'react';
import type { SVGProps } from 'react';

/**
 * React 19 compatibility helper for Hero Icons
 * Properly typed for strict mode and exactOptionalPropertyTypes
 */

interface IconProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}

/**
 * Helper to properly render HeroIcons in React 19
 * This wraps the icon component to ensure it can be used as a JSX element
 */
export function Icon({ icon: IconComponent, className }: IconProps): JSX.Element {
  // Construct props object with proper undefined handling for exactOptionalPropertyTypes
  const iconProps: Record<string, unknown> = {
    ...(className !== undefined ? { className } : {}),
  };
  return <IconComponent {...(iconProps as SVGProps<SVGSVGElement>)} />;
}
//# sourceMappingURL=icon-helper.jsx.map
//# sourceMappingURL=icon-helper.jsx.map