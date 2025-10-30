import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeTypographyScale } from '../theme/theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'mono';
export type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'label'
  | 'strong'
  | 'em';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  readonly as?: TextElement;
  readonly variant?: TextVariant;
  readonly muted?: boolean;
}

const defaultElementByVariant: Record<TextVariant, TextElement> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  caption: 'p',
  mono: 'p',
};

const typographyByVariant = (variant: TextVariant, themeFont: ThemeTypographyScale) => {
  switch (variant) {
    case 'h1':
      return themeFont.heading.h1;
    case 'h2':
      return themeFont.heading.h2;
    case 'h3':
      return themeFont.heading.h3;
    case 'h4':
      return themeFont.heading.h4;
    case 'mono':
      return themeFont.mono;
    case 'caption':
      return themeFont.body.sm;
    case 'body':
    default:
      return themeFont.body.md;
  }
};

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as, variant = 'body', muted = false, style, children, ...rest }, ref) => {
    const { theme } = useTheme();
    const element: TextElement = as ?? defaultElementByVariant[variant];
    const fontValue = typographyByVariant(variant, theme.typography);
    const isMuted = muted;

    const computedStyle: CSSProperties = {
      margin: 0,
      color: isMuted ? theme.colors.textMuted : theme.colors.text,
      font: fontValue.length > 0 ? fontValue : theme.typography.body.md,
      ...(variant === 'mono' ? { letterSpacing: '0.03em' } : {}),
      ...style,
    };

    const ElementTag = element;

    return (
      <ElementTag
        ref={ref as never}
        style={computedStyle}
        {...rest}
      >
        {children}
      </ElementTag>
    );
  },
);

Text.displayName = 'Text';
