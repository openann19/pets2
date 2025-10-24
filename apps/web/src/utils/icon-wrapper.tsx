import React, { ForwardRefExoticComponent, SVGProps } from 'react';

/**
 * Icon wrapper utility to convert Heroicons ForwardRefExoticComponent
 * to a ComponentType that accepts only className prop
 */
export const wrapIcon = <T extends SVGProps<SVGSVGElement>>(
  Icon: ForwardRefExoticComponent<T>
) => {
  return ({ className }: { className?: string }) => (
    <Icon className={className} />
  );
};

/**
 * Type-safe icon wrapper that preserves the original icon's props
 * but makes className optional and required
 */
export const wrapIconWithProps = <T extends SVGProps<SVGSVGElement>>(
  Icon: ForwardRefExoticComponent<T>
) => {
  return ({ className, ...props }: { className?: string } & Partial<T>) => (
    <Icon className={className} {...(props as T)} />
  );
};

/**
 * Helper to create a ComponentType from any icon component
 * Useful for components that expect ComponentType<{ className?: string }>
 */
export const createIconComponent = <T extends SVGProps<SVGSVGElement>>(
  Icon: ForwardRefExoticComponent<T>
) => {
  const WrappedIcon = ({ className }: { className?: string }) => (
    <Icon className={className} />
  );
  
  WrappedIcon.displayName = `WrappedIcon(${Icon.displayName || 'Icon'})`;
  
  return WrappedIcon;
};
