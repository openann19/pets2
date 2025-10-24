import { useReducedMotion } from 'framer-motion';
import React from 'react';
export type LoadingSkeletonProps = {
    variant?: 'card' | 'list' | 'table' | 'chart';
    count?: number;
    className?: string;
};
export type EnhancedButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    className?: string;
    ariaLabel?: string;
};
export type EnhancedCardProps = {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    glass?: boolean;
    onClick?: () => void;
    ariaLabel?: string;
};
export type EnhancedInputProps = {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    step?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    helpText?: string;
    icon?: React.ReactNode;
    className?: string;
    id?: string;
    ariaLabel?: string;
};
export type EnhancedModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdrop?: boolean;
    showCloseButton?: boolean;
};
export type EnhancedTooltipProps = {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
};
export type EnhancedProgressBarProps = {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'gradient' | 'striped';
    animated?: boolean;
    className?: string;
};
export type EnhancedBadgeProps = {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
};
export type EnhancedDropdownProps = {
    label?: string;
    options: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    helpText?: string;
    className?: string;
    id?: string;
    ariaLabel?: string;
};
export type EnhancedToastProps = {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number | undefined;
    onClose: () => void;
    action?: {
        label: string;
        onClick: () => void;
    };
};
export type EnhancedDataTableProps<T extends Record<string, unknown> = Record<string, unknown>> = {
    data: T[];
    columns: Array<{
        key: string;
        label: string;
        sortable?: boolean;
        render?: (value: unknown, row: T) => React.ReactNode;
    }>;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    className?: string;
};
export declare const LoadingSkeleton: ({ variant, count, className }: LoadingSkeletonProps) => JSX.Element;
export declare const SkipLink: ({ href, children }: {
    href: string;
    children: React.ReactNode;
}) => JSX.Element;
export declare const useAnnouncement: () => {
    announce: (message: string) => void;
};
export declare const useColorScheme: () => "dark" | "light";
export declare const useFocusManagement: () => {
    saveFocus: () => void;
    restoreFocus: () => void;
    focusFirst: () => void;
};
export declare const useHighContrastMode: () => boolean;
export { useReducedMotion };
export declare const EnhancedButton: ({ children, onClick, variant, size, disabled, loading, icon, iconPosition, className, ariaLabel, }: EnhancedButtonProps) => JSX.Element;
export declare const EnhancedCard: ({ children, className, hover, gradient, glass, onClick, ariaLabel, }: EnhancedCardProps) => JSX.Element;
export declare const EnhancedInput: ({ label, value, onChange, onInputChange, type, placeholder, required, disabled, error, helpText, icon, className, id, step, min, max, ariaLabel, }: EnhancedInputProps) => JSX.Element;
export declare const EnhancedModal: ({ isOpen, onClose, title, children, size, closeOnBackdrop, showCloseButton, }: EnhancedModalProps) => JSX.Element | null;
export declare const EnhancedTooltip: ({ children, content, position, delay, className }: EnhancedTooltipProps) => JSX.Element;
export declare const EnhancedProgressBar: ({ value, max, label, showValue, size, variant, animated, className, }: EnhancedProgressBarProps) => JSX.Element;
export declare const EnhancedBadge: ({ children, variant, size, animated, className }: {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info" | "gradient";
    size?: "sm" | "md" | "lg";
    animated?: boolean;
    className?: string;
}) => JSX.Element;
export declare const EnhancedDropdown: ({ label, options, value, onChange, placeholder, required, disabled, error, helpText, className, id, ariaLabel, }: EnhancedDropdownProps) => JSX.Element;
export declare const EnhancedToast: ({ message, type, duration, onClose, action, }: EnhancedToastProps) => JSX.Element;
export declare const EnhancedDataTable: <T extends Record<string, unknown> = Record<string, unknown>>({ data, columns, onSort, sortBy, sortDirection, className, }: EnhancedDataTableProps<T>) => JSX.Element;
//# sourceMappingURL=UIEnhancements.d.ts.map