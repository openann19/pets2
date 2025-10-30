import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

const paddingTokens: Record<ButtonSize, [string, string]> = {
  sm: ['var(--pm-spacing-xs, 4px)', 'var(--pm-spacing-sm, 8px)'],
  md: ['var(--pm-spacing-sm, 8px)', 'var(--pm-spacing-md, 16px)'],
  lg: ['var(--pm-spacing-md, 16px)', 'var(--pm-spacing-lg, 24px)'],
};

const baseStyle: CSSProperties = {
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--pm-radius-md, 8px)',
  transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
  gap: 'var(--pm-spacing-xs, 4px)',
};

const disabledStyle: CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.6,
  boxShadow: 'none',
  transform: 'none',
};

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', style, disabled, children, ...rest }, ref) => {
    const { theme } = useTheme();
    const paddingValues = paddingTokens[size];
    const isDisabled = disabled === true;
    const fontBySize: Record<ButtonSize, string> = {
      sm: theme.typography.body.sm,
      md: theme.typography.body.md,
      lg: theme.typography.body.lg,
    };

    const variantStyles: Record<ButtonVariant, CSSProperties> = {
      primary: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.background,
        boxShadow: '0 10px 20px rgba(108, 99, 255, 0.35)',
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        color: theme.colors.background,
        boxShadow: '0 10px 18px rgba(255, 101, 132, 0.35)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.colors.text,
        border: `1px solid ${theme.colors.muted}`,
      },
    };

    const { backgroundColor, color, border, boxShadow } = variantStyles[variant];

    const computedStyle: CSSProperties = {
      ...baseStyle,
      padding: `${paddingValues[0]} ${paddingValues[1]}`,
      font: fontBySize[size],
      backgroundColor,
      color,
      border,
      boxShadow,
      transform: isDisabled ? 'none' : 'translateY(0)',
      ...(isDisabled ? disabledStyle : {}),
      ...style,
    };

    return (
      <button
        ref={ref}
        style={computedStyle}
        disabled={isDisabled}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

ButtonComponent.displayName = 'Button';

export const Button = ButtonComponent;
