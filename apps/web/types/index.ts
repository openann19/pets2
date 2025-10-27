/**
 * Web Application Type Definitions
 * Production-hardened TypeScript definitions for Next.js web application
 * Standalone types without external dependencies
 */

import React from 'react';
import type { ComponentType } from 'react';
import type { NextPage } from 'next';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS } from '@pawfectmatch/design-tokens';

// Local color and spacing type definitions
export type ColorScheme = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
export type FontWeight = 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
export type ShadowSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type RadiusSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
export type TransitionType = 'fast' | 'normal' | 'slow' | 'bounce';
export type ZIndexLevel = 'auto' | '0' | '10' | '20' | '30' | '40' | '50' | 'dropdown' | 'sticky' | 'fixed' | 'modal-backdrop' | 'modal' | 'popover' | 'tooltip' | 'toast';

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'data-testid'?: string;
}

// Button Component Types
export interface ButtonProps extends BaseComponentProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

// Input Component Types
export interface InputProps extends BaseComponentProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Modal Component Types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  backdrop?: 'blur' | 'dark' | 'none';
}

// Card Component Props
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: SpacingScale | 'none';
  hoverable?: boolean;
  onClick?: () => void;
}

// Form Component Types
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

// Layout Component Types
export interface LayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  loading?: boolean;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Data Display Types
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  width?: string | number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T = Record<string, unknown>> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T, index: number) => void;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
}

// Form Component Props
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  validationSchema?: Record<string, unknown>;
  initialValues?: Record<string, unknown>;
  loading?: boolean;
  disabled?: boolean;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  name: Theme;
  colors: typeof COLORS;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  shadows: typeof SHADOWS;
  radius: typeof RADIUS;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export type AnimationType = 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounce' | 'shake';

// Notification Types
export interface NotificationConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

// Loading Types
export interface LoadingConfig {
  id: string;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'bar' | 'dots';
  overlay?: boolean;
}

// Error Types
export interface ErrorConfig {
  code?: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  recoverable?: boolean;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Next.js Specific Types
export interface PageProps {
  params?: { [key: string]: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export type CustomNextPage<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactElement;
};

// Hook Types
export interface UseFormReturn<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  validate: () => boolean;
  reset: () => void;
  submit: () => Promise<void>;
}

// Event Handler Types
export type ChangeHandler<T = any> = (value: T, name?: string) => void;
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;
export type ClickHandler = (event: React.MouseEvent) => void | Promise<void>;
export type FocusHandler = (event: React.FocusEvent) => void;
export type BlurHandler = (event: React.FocusEvent) => void;

// Style Utility Types
export type CSSLength = string | number;
export type CSSTime = string | number;

export interface CSSAnimation {
  name: string;
  duration: CSSTime;
  timingFunction?: string;
  delay?: CSSTime;
  iterationCount?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// Environment Types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: Record<string, boolean>;
  limits: {
    maxFileSize: number;
    maxImages: number;
    apiTimeout: number;
  };
}

// Export React for JSX compatibility
export { React };
export type { ComponentType };
