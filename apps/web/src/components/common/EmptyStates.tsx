/**
 * EmptyState Component - Web Version
 * 
 * Reusable empty state component matching mobile EmptyStates exactly
 * Provides consistent messaging and actions when no data is available.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  WifiIcon, 
  ExclamationCircleIcon,
  HeartIcon,
  PawPrintIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  testID?: string;
  premium?: boolean;
  animated?: boolean;
}

/**
 * Empty state component for screens with no data
 */
export function EmptyState({
  title,
  message,
  icon: Icon = ExclamationCircleIcon,
  actionLabel,
  onAction,
  className,
  testID,
  premium = true,
  animated = true,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center flex-1 p-8",
        className
      )}
      data-testid={testID}
      role="alert"
      aria-label={`${title}. ${message}`}
    >
      <motion.div
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
        className="mb-4"
      >
        <Icon className="w-16 h-16 text-gray-400" />
      </motion.div>
      
      <motion.h2
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-2 text-center"
        role="heading"
      >
        {title}
      </motion.h2>
      
      <motion.p
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 mb-6 text-center max-w-md"
      >
        {message}
      </motion.p>
      
      {actionLabel && onAction && (
        <motion.button
          initial={animated ? { scale: 0, opacity: 0 } : {}}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
          onClick={onAction}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors min-w-[120px]"
          aria-label={actionLabel}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Pre-configured empty states for common scenarios - matching mobile exactly
 */
export const EmptyStates = {
  /**
   * No data available
   */
  NoData: ({
    title = 'No data available',
    message = 'There\'s nothing here yet. Check back later!',
    actionLabel,
    onAction,
    className,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon={DocumentTextIcon}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      testID="empty-state-no-data"
    />
  ),

  /**
   * Network error
   */
  NetworkError: ({
    title = 'Connection Error',
    message = 'Unable to load data. Please check your internet connection.',
    actionLabel = 'Retry',
    onAction,
    className,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon={CloudArrowUpIcon}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      testID="empty-state-network-error"
    />
  ),

  /**
   * Offline mode
   */
  Offline: ({
    title = 'You\'re Offline',
    message = 'Some features may be limited. Please connect to the internet.',
    actionLabel,
    onAction,
    className,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon={WifiIcon}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      testID="empty-state-offline"
    />
  ),

  /**
   * Error state
   */
  Error: ({
    title = 'Something went wrong',
    message = 'We encountered an error. Please try again.',
    actionLabel = 'Retry',
    onAction,
    className,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon={ExclamationCircleIcon}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      testID="empty-state-error"
    />
  ),

  /**
   * No matches
   */
  NoMatches: ({
    title = 'No matches yet',
    message = 'Keep swiping to find your perfect match!',
    actionLabel = 'Start Swiping',
    onAction,
    className,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon={HeartIcon}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      testID="empty-state-no-matches"
    />
  ),

  /**
   * No pets
   */
  NoPets: ({
    title = 'No pets yet',
    message = 'Add your first pet to get started!',
    actionLabel = 'Add Pet',
    onAction,
    className,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon={PawPrintIcon}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
      testID="empty-state-no-pets"
    />
  ),
};

