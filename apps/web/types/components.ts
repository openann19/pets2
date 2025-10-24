/**
 * Web Component Type Definitions
 * TypeScript definitions for web UI components
 * Aligned with design tokens and accessibility standards
 */

import React from 'react';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS } from '@pawfectmatch/design-tokens';

// Base Component Props (shared across all components)
export interface BaseComponentProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Child components */
  children?: React.ReactNode;
  /** Test ID for testing */
  'data-testid'?: string;
  /** Unique identifier */
  id?: string;
}

// Button Variants and Sizes
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button Component Props
export interface ButtonProps extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'className'> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Haptic feedback on press */
  haptic?: boolean;
  /** Button shape */
  shape?: 'rounded' | 'square' | 'pill';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

// Input Variants and Types
export type InputVariant = 'default' | 'filled' | 'outlined' | 'underlined';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

// Input Component Props
export interface InputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style' | 'className' | 'size'> {
  /** Input variant */
  variant?: InputVariant;
  /** Input type */
  type?: InputType;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Clear button */
  clearable?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
}

// Textarea Component Props
export interface TextareaProps extends BaseComponentProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style' | 'className'> {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Character limit */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Auto-resize */
  autoResize?: boolean;
  /** Minimum rows */
  minRows?: number;
  /** Maximum rows */
  maxRows?: number;
  /** Full width */
  fullWidth?: boolean;
}

// Select Component Props
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps extends BaseComponentProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'style' | 'className'> {
  /** Options array */
  options: SelectOption[];
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Multiple selection */
  multiple?: boolean;
  /** Searchable */
  searchable?: boolean;
  /** Clearable */
  clearable?: boolean;
  /** Custom option renderer */
  renderOption?: (option: SelectOption) => React.ReactNode;
}

// Modal Component Props
export interface ModalProps extends BaseComponentProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show close button */
  closable?: boolean;
  /** Backdrop style */
  backdrop?: 'blur' | 'dark' | 'none';
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  /** Custom footer */
  footer?: React.ReactNode;
  /** Custom header */
  header?: React.ReactNode;
}

// Card Component Props
export interface CardProps extends BaseComponentProps {
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  /** Card padding */
  padding?: keyof typeof SPACING;
  /** Card shadow */
  shadow?: string;
  /** Hover effect */
  hoverable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Border radius */
  rounded?: string;
}

// Avatar Component Props
export interface AvatarProps extends BaseComponentProps {
  /** Avatar source */
  src?: string;
  /** Fallback text */
  name?: string;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Avatar shape */
  shape?: 'circle' | 'square' | 'rounded';
  /** Online status indicator */
  online?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// Badge Component Props
export interface BadgeProps extends BaseComponentProps {
  /** Badge variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Badge shape */
  shape?: 'pill' | 'square' | 'circle';
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Dot indicator */
  dot?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// Loading Component Props
export interface LoadingProps extends BaseComponentProps {
  /** Loading type */
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  /** Loading size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Loading color */
  color?: string;
  /** Custom message */
  message?: string;
  /** Overlay mode */
  overlay?: boolean;
  /** Full screen */
  fullScreen?: boolean;
}

// Progress Component Props
export interface ProgressProps extends BaseComponentProps {
  /** Progress value (0-100) */
  value: number;
  /** Progress max value */
  max?: number;
  /** Progress variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Progress size */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage */
  showPercentage?: boolean;
  /** Animated */
  animated?: boolean;
  /** Striped */
  striped?: boolean;
}

// Alert/Toast Component Props
export interface AlertProps extends BaseComponentProps {
  /** Alert type */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Dismissible */
  dismissible?: boolean;
  /** Auto-dismiss delay (ms) */
  autoDismiss?: number;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom action */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** On dismiss callback */
  onDismiss?: () => void;
}

export interface TableColumn<T = unknown> {
  /** Column key */
  key: keyof T | string;
  /** Column header */
  header: string;
  /** Custom render function */
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  /** Column width */
  width?: string | number;
  /** Sortable column */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom className */
  className?: string;
}

export interface TableProps<T = unknown> extends BaseComponentProps {
  /** Table data */
  data: T[];
  /** Table columns */
  columns: TableColumn<T>[];
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Row selection */
  selectable?: boolean;
  /** Selected rows */
  selectedRows?: T[];
  /** Selection change handler */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Sort handler */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Pagination */
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
}

// Form Component Props
export interface FormProps extends BaseComponentProps {
  /** Form submit handler */
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  /** Form validation schema */
  validationSchema?: Record<string, unknown>;
  /** Initial form values */
  initialValues?: Record<string, unknown>;
  /** Form loading state */
  loading?: boolean;
  /** Form disabled state */
  disabled?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Reset button text */
  resetText?: string;
  /** Show reset button */
  showReset?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Field type */
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  /** Field placeholder */
  placeholder?: string;
  /** Field required */
  required?: boolean;
  /** Field disabled */
  disabled?: boolean;
  /** Field error */
  error?: string;
  /** Field helper text */
  helperText?: string;
  /** Field options (for select/radio) */
  options?: SelectOption[];
  /** Field validation rules */
  validation?: Record<string, unknown>;
}

// Navigation Component Props
export interface NavItem {
  /** Navigation label */
  label: string;
  /** Navigation href */
  href: string;
  /** Navigation icon */
  icon?: React.ComponentType<{ className?: string }>;
  /** Child navigation items */
  children?: NavItem[];
  /** Badge/count */
  badge?: string | number;
  /** Active state */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  /** Navigation items */
  items: NavItem[];
  /** Navigation variant */
  variant?: 'horizontal' | 'vertical' | 'sidebar';
  /** Active item */
  activeItem?: string;
  /** Collapsible (for sidebar) */
  collapsible?: boolean;
  /** Navigation click handler */
  onItemClick?: (item: NavItem) => void;
}

// Layout Component Props
export interface LayoutProps extends BaseComponentProps {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Show sidebar */
  showSidebar?: boolean;
  /** Show header */
  showHeader?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error;
}

// Theme and Styling Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = keyof typeof _COLORS;
export type SpacingScale = keyof typeof _SPACING;
export type FontSize = keyof typeof _TYPOGRAPHY.fontSizes;
export type FontWeight = keyof typeof _TYPOGRAPHY.fontWeights;

// Export React for JSX compatibility
export { React };
