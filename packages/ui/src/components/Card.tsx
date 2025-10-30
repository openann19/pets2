import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly elevated?: boolean;
}

const baseStyle: CSSProperties = {
  borderRadius: 'var(--pm-radius-lg, 16px)',
  padding: 'var(--pm-spacing-lg, 24px)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--pm-spacing-md, 16px)',
};

const elevatedStyle: CSSProperties = {
  boxShadow: '0 18px 35px rgba(15, 23, 42, 0.12)',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const computedStyle: CSSProperties = {
      ...baseStyle,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.muted}`,
      ...(elevated ? elevatedStyle : {}),
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

Card.displayName = 'Card';
