import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

export type StackDirection = 'horizontal' | 'vertical';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  readonly direction?: StackDirection;
  readonly gap?: number;
  readonly wrap?: boolean;
  readonly align?: CSSProperties['alignItems'];
  readonly justify?: CSSProperties['justifyContent'];
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = 'vertical',
      gap = 16,
      wrap = false,
      align = 'stretch',
      justify = 'flex-start',
      style,
      ...rest
    },
    ref,
  ) => {
    const flexDirection = direction === 'horizontal' ? 'row' : 'column';

    const computedStyle: CSSProperties = {
      display: 'flex',
      flexDirection,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap,
      alignItems: align,
      justifyContent: justify,
      ...style,
    };

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...rest}
      />
    );
  },
);

Stack.displayName = 'Stack';
