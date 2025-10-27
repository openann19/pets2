'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftRightIcon, BellIcon, MagnifyingGlassIcon, UserGroupIcon, SparklesIcon, ArrowPathIcon, PlusIcon, } from '@heroicons/react/24/outline';
import { InteractiveButton } from './Interactive';
// Predefined illustrations for different empty states
const illustrations = {
    discover: (<div className="relative">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center">
          <MagnifyingGlassIcon className="w-12 h-12 text-pink-500"/>
        </div>
      </motion.div>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-2 -right-2">
        <SparklesIcon className="w-8 h-8 text-yellow-500"/>
      </motion.div>
    </div>),
    chat: (<div className="relative">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-500"/>
        </div>
      </motion.div>
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"/>
      </motion.div>
    </div>),
    notifications: (<div className="relative">
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
          <BellIcon className="w-12 h-12 text-orange-500"/>
        </div>
      </motion.div>
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"/>
    </div>),
    matches: (<div className="relative">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/20 to-red-600/20 flex items-center justify-center">
          <HeartIcon className="w-12 h-12 text-pink-500"/>
        </div>
      </motion.div>
      <motion.div animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute -top-2 -left-2">
        <SparklesIcon className="w-6 h-6 text-yellow-500"/>
      </motion.div>
    </div>),
    pets: (<div className="relative">
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
          <UserGroupIcon className="w-12 h-12 text-green-500"/>
        </div>
      </motion.div>
      <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-1 -right-1">
        <div className="text-2xl">🐾</div>
      </motion.div>
    </div>),
};
// Contextual messages for different scenarios
const contextualMessages = {
    discover: {
        noPets: {
            title: "No pets to discover yet",
            description: "Check back soon! New pets are joining PawfectMatch every day.",
            action: { label: "Refresh", onClick: () => { window.location.reload(); } },
        },
        noMatches: {
            title: "Keep swiping to find matches!",
            description: "The perfect match for your pet is just a swipe away.",
            action: { label: "Start Swiping", onClick: () => { } },
        },
        filtersTooStrict: {
            title: "Try adjusting your filters",
            description: "Your current filters might be too specific. Try expanding your search radius or age range.",
            action: { label: "Adjust Filters", onClick: () => { } },
        },
    },
    chat: {
        noConversations: {
            title: "No conversations yet",
            description: "Start swiping to find matches and begin chatting with other pet owners!",
            action: { label: "Start Swiping", onClick: () => { } },
        },
        noMessages: {
            title: "Start the conversation!",
            description: "Send the first message to break the ice and get to know each other.",
            action: { label: "Send Message", onClick: () => { } },
        },
    },
    notifications: {
        noNotifications: {
            title: "All caught up!",
            description: "You're all up to date. New notifications will appear here.",
            action: { label: "Refresh", onClick: () => { window.location.reload(); } },
        },
    },
};
export function EmptyState({ type, title, description, action, secondaryAction, illustration, className = '', }) {
    const defaultIllustration = illustrations[type] || illustrations.discover;
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className={`
        flex flex-col items-center justify-center
        py-12 px-6 text-center
        max-w-md mx-auto
        ${className}
      `}>
      {/* Illustration */}
      <div className="mb-8">
        {illustration || defaultIllustration}
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="space-y-4">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-8 space-y-3 w-full">
          {action && (<InteractiveButton variant={action.variant || 'primary'} onClick={action.onClick} className="w-full">
              {action.label}
            </InteractiveButton>)}
          
          {secondaryAction && (<InteractiveButton variant="outline" onClick={secondaryAction.onClick} className="w-full">
              {secondaryAction.label}
            </InteractiveButton>)}
        </motion.div>)}
    </motion.div>);
}
// Predefined empty state components
export function DiscoverEmptyState({ scenario = 'noPets', onRefresh, onStartSwiping, onAdjustFilters, }) {
    const config = contextualMessages.discover[scenario];
    const actionMap = {
        noPets: { label: "Refresh", onClick: onRefresh || (() => { window.location.reload(); }) },
        noMatches: { label: "Start Swiping", onClick: onStartSwiping || (() => { }) },
        filtersTooStrict: { label: "Adjust Filters", onClick: onAdjustFilters || (() => { }) },
    };
    return (<EmptyState type="discover" title={config.title} description={config.description} action={actionMap[scenario]}/>);
}
export function ChatEmptyState({ scenario = 'noConversations', onStartSwiping, onSendMessage, }) {
    const config = contextualMessages.chat[scenario];
    const actionMap = {
        noConversations: { label: "Start Swiping", onClick: onStartSwiping || (() => { }) },
        noMessages: { label: "Send Message", onClick: onSendMessage || (() => { }) },
    };
    return (<EmptyState type="chat" title={config.title} description={config.description} action={actionMap[scenario]}/>);
}
export function NotificationsEmptyState({ onRefresh, }) {
    const config = contextualMessages.notifications.noNotifications;
    return (<EmptyState type="notifications" title={config.title} description={config.description} action={{ label: "Refresh", onClick: onRefresh || (() => { window.location.reload(); }) }}/>);
}
// Loading empty state with skeleton
export function LoadingEmptyState({ type = 'discover', className = '', }) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`
        flex flex-col items-center justify-center
        py-12 px-6 text-center
        max-w-md mx-auto
        ${className}
      `}>
      {/* Animated skeleton illustration */}
      <div className="mb-8">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-700"/>
      </div>

      {/* Skeleton content */}
      <div className="space-y-4 w-full">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded-lg mx-auto w-3/4"/>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-lg mx-auto w-full"/>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }} className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-lg mx-auto w-2/3"/>
      </div>

      {/* Skeleton button */}
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} className="mt-8 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-full"/>
    </motion.div>);
}
// Error empty state
export function ErrorEmptyState({ title = "Something went wrong", description = "We're having trouble loading this content. Please try again.", onRetry, onGoBack, }) {
    return (<EmptyState type="custom" title={title} description={description} action={onRetry ? { label: "Try Again", onClick: onRetry } : undefined} secondaryAction={onGoBack ? { label: "Go Back", onClick: onGoBack } : undefined} illustration={<div className="relative">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-24 h-24 mx-auto mb-6">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500/20 to-pink-600/20 flex items-center justify-center">
              <ArrowPathIcon className="w-12 h-12 text-red-500"/>
            </div>
          </motion.div>
        </div>}/>);
}
//# sourceMappingURL=EmptyState.jsx.map