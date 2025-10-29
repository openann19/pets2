import { forwardRef, type CSSProperties, type InputHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly error?: string | null;
  readonly label?: string;
  readonly hint?: string;
}

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--pm-spacing-xs, 4px)',
};

const labelStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: '0.875rem',
};

const hintStyle: CSSProperties = {
  fontSize: '0.75rem',
};

const InputField = forwardRef<HTMLInputElement, InputProps>(
  ({ error = null, label, hint, style, ...rest }, ref) => {
    const { theme } = useTheme();
    const hasError = typeof error === 'string' && error.length > 0;
    const hasHint = typeof hint === 'string' && hint.length > 0;
    const hasLabel = typeof label === 'string' && label.length > 0;

    const fieldStyle: CSSProperties = {
      padding: 'var(--pm-spacing-sm, 12px) var(--pm-spacing-md, 16px)',
      borderRadius: 'var(--pm-radius-md, 8px)',
      border: `1px solid ${hasError ? theme.colors.danger : theme.colors.muted}`,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      font: theme.typography.body.md,
      outline: 'none',
      transition: 'border-color 120ms ease, box-shadow 120ms ease',
      boxShadow: hasError ? '0 0 0 2px rgba(229, 62, 62, 0.2)' : 'none',
      ...style,
    };

    return (
      <label style={containerStyle}>
        {hasLabel ? <span style={{ ...labelStyle, color: theme.colors.text }}>{label}</span> : null}
        <input
          ref={ref}
          style={fieldStyle}
          {...rest}
        />
        {hasError ? (
          <span style={{ ...hintStyle, color: theme.colors.danger }}>{error}</span>
        ) : hasHint ? (
          <span style={{ ...hintStyle, color: theme.colors.textMuted }}>{hint}</span>
        ) : null}
      </label>
    );
  },
);

InputField.displayName = 'Input';

export const Input = InputField;
