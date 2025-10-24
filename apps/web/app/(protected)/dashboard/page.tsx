'use client';

import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  SparklesIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  FireIcon,
  StarIcon,
  VideoCameraIcon,
  ChartBarIcon,
  CameraIcon,
  BeakerIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import PremiumButton from '../../../src/components/UI/PremiumButton';
import PremiumCard from '../../../src/components/UI/PremiumCard';
import { 
  PREMIUM_VARIANTS, 
  STAGGER_CONFIG,
  SPRING_CONFIG,
} from '../../../src/constants/animations';
import { useDashboardData, useWebSocket } from '../../../src/hooks/api-hooks';
import { useAuthStore } from '../../../src/lib/auth-store';
import StoriesRow, { useStoryRings } from '../../../src/components/Stories/StoryRing';
import StoriesCarousel, { useStories } from '../../../src/components/Stories/StoriesCarousel';
import StoryComposer, { useStoryComposer } from '../../../src/components/Stories/StoryComposer';
import HomeFeed, { useHomeFeed } from '../../../src/components/Feed/HomeFeed';


export default function DashboardPage() {
  const { user: authUser } = useAuthStore();
  const { user, pets, matches, notifications, subscription, isLoading } = useDashboardData();
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  
  // Stories functionality
  const { storyRings, addStoryRing, markStoriesAsSeen } = useStoryRings();
  const { 
    stories, 
    currentStoryIndex, 
    isOpen: isStoriesOpen, 
    openStories, 
    closeStories, 
    setCurrentStoryIndex 
  } = useStories();
  const { 
    isOpen: isComposerOpen, 
    openComposer, 
    closeComposer, 
    publishStory 
  } = useStoryComposer();
  
  // Feed functionality
  const { posts, loadMorePosts, refreshFeed } = useHomeFeed();
  
  // Setup WebSocket connection
  useWebSocket((authUser as any)?.id || '');

  // Enhanced time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    // Online status tracking
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enhancedStats = [
    { 
      label: 'My Pets', 
      value: Array.isArray(pets) ? pets.length.toString() : '0', 
      icon: BoltIcon, 
      variant: 'glass' as const,
      description: 'Active profiles',
      trend: '+2 this week',
      color: 'primary' 
    },
    { 
      label: 'Active Matches', 
      value: Array.isArray(matches) ? matches.length.toString() : '0', 
      icon: HeartIcon, 
      variant: 'gradient' as const,
      description: 'Mutual connections',
      trend: '+5 today',
      color: 'success' 
    },
    { 
      label: 'Messages', 
      value: Array.isArray(matches) ? matches.reduce((acc: number, match: any) => acc + (match.unreadCount || 0), 0).toString() : '0', 
      icon: FireIcon, 
      variant: 'neon' as const,
      description: 'Unread chats',
      trend: 'Live updates',
      color: 'warning' 
    },
    { 
      label: 'Premium Status', 
      value: subscription?.isActive ? 'Active' : 'Free', 
      icon: StarIcon, 
      variant: 'holographic' as const,
      description: subscription?.isActive ? 'Premium member' : 'Upgrade available',
      trend: subscription?.isActive ? '30 days left' : 'Special offer',
      color: 'purple' 
    },
  ];

  const quickActions = [
    {
      title: 'Discover Pets',
      description: 'Start swiping to find new matches',
      href: './swipe',
      icon: MagnifyingGlassIcon,
      gradient: 'from-pink-500 to-purple-600',
    },
    {
      title: 'Video Call',
      description: 'Start a video call with matches',
      href: './video-call/demo-room',
      icon: VideoCameraIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Analytics',
      description: 'View your performance insights',
      href: './analytics',
      icon: ChartBarIcon,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Upgrade Premium',
      description: 'Unlock all premium features',
      href: './premium',
      icon: SparklesIcon,
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'View Matches',
      description: 'Chat with your matched pets',
      href: './matches',
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Add a Pet',
      description: 'Create a profile for your pet',
      href: './pets/new',
      icon: PlusCircleIcon,
      gradient: 'from-green-500 to-teal-600',
    },
    {
      title: 'My Pets',
      description: 'Manage your pet profiles',
      href: './my-pets',
      icon: UserGroupIcon,
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  const recentActivity = [
    { type: 'match', name: 'Luna', breed: 'Golden Retriever', time: '2 hours ago' },
    { type: 'message', name: 'Max', breed: 'Border Collie', time: '5 hours ago' },
    { type: 'like', name: 'Bella', breed: 'Rescue Mix', time: '1 day ago' },
    { type: 'match', name: 'Charlie', breed: 'Beagle', time: '2 days ago' },
  ];

  const recommendations = [
    { name: 'Cooper', breed: 'Labrador', age: '3 years', distance: '2 miles' },
    { name: 'Bailey', breed: 'Poodle', age: '2 years', distance: '5 miles' },
    { name: 'Daisy', breed: 'German Shepherd', age: '4 years', distance: '8 miles' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🐾</div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PawfectMatch
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                Profile
              </Link>
              <Link href="/premium" className="text-purple-600 hover:text-purple-700 font-medium">
                Go Premium
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          variants={PREMIUM_VARIANTS.fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8 relative"
        >
          {/* Online status indicator */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-ping absolute`} />
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold gradient-text mb-2">
            Good {timeOfDay}, {user?.name || 'Pet Lover'}! 
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
              transition={{ duration: 2.5, delay: 0.5 }}
              className="inline-block ml-2"
            >
              👋
            </motion.span>
          </h1>
          <motion.p 
            className="text-lg text-neutral-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your pets have been waiting for you. Let's find them some amazing new friends!
          </motion.p>
          
          {/* Premium status banner */}
          {!subscription?.isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <PremiumCard variant="gradient" glow className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Unlock Premium Features</h3>
                    <p className="text-white/80 text-sm">Get unlimited matches and AI insights</p>
                  </div>
                  <PremiumButton variant="glass" size="sm">
                    <StarIcon className="w-4 h-4 mr-2" />
                    Upgrade
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          )}
        </motion.div>

        {/* Stories Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={PREMIUM_VARIANTS.fadeInUp}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold gradient-text">Pet Stories</h2>
            <button
              onClick={openComposer}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              <CameraIcon className="w-5 h-5" />
              <span>Create Story</span>
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 mb-6">
            {storyRings.map((story) => (
              <div key={story.petId} className="flex-shrink-0">
                <div className="relative w-16 h-16">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary-500">
                    <Image
                      src={story.petAvatar}
                      alt={story.petName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {story.hasUnseenStories && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <p className="text-xs text-center mt-2 truncate w-16">{story.petName}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: STAGGER_CONFIG.normal }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {enhancedStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <PremiumCard
                variant={stat.variant}
                hover
                tilt
                glow
                className="p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <motion.div
                    className="text-xs px-2 py-1 bg-white/20 rounded-full text-white backdrop-blur"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stat.trend}
                  </motion.div>
                </div>
                
                <div className="mb-2">
                  <motion.span
                    className="text-3xl font-bold"
                    style={{ 
                      color: stat.variant === 'gradient' || stat.variant === 'neon' || stat.variant === 'holographic' 
                        ? '#ffffff' 
                        : '#1f2937' 
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {stat.value}
                  </motion.span>
                </div>
                
                <p className={`text-sm font-medium ${
                  stat.variant === 'gradient' || stat.variant === 'neon' || stat.variant === 'holographic' 
                    ? 'text-white/90' 
                    : 'text-gray-700'
                }`}>
                  {stat.label}
                </p>
                
                <p className={`text-xs mt-1 ${
                  stat.variant === 'gradient' || stat.variant === 'neon' || stat.variant === 'holographic' 
                    ? 'text-white/70' 
                    : 'text-gray-500'
                }`}>
                  {stat.description}
                </p>
              </PremiumCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
          className="mb-8"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: STAGGER_CONFIG.normal }}
        >
          <motion.h2 
            className="text-2xl font-bold gradient-text mb-6"
            variants={PREMIUM_VARIANTS.fadeInUp}
          >
            ⚡ Quick Actions
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={PREMIUM_VARIANTS.fadeInUp}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={action.href} className="block">
                  <PremiumCard
                    variant="glass"
                    hover
                    tilt
                    glow
                    className="p-6 group cursor-pointer transition-all duration-300"
                  >
                    <div className="relative">
                      <motion.div 
                        className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.gradient} mb-4 group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <action.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      
                      {/* Floating badge */}
                      <motion.div
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0] 
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: index * 0.3 
                        }}
                      >
                        {index === 0 ? 'NEW' : index === 1 ? '🔥' : index === 2 ? 'AI' : '✨'}
                      </motion.div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700">
                      {action.description}
                    </p>
                    
                    {/* Hover arrow */}
                    <motion.div
                      className="mt-3 flex items-center text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100"
                      initial={{ x: -10 }}
                      animate={{ x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <span>Get Started</span>
                      <motion.span
                        className="ml-1"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  </PremiumCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Premium Showcase */}
        {!subscription?.isActive && (
          <motion.div
            variants={PREMIUM_VARIANTS.scale}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <PremiumCard variant="holographic" glow className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <SparklesIcon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white">Premium Experience</h3>
                  </div>
                  <p className="text-white/90 text-lg mb-4">
                    Unlock AI-powered insights, unlimited matches, and premium features
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { icon: '🚀', label: 'Unlimited Swipes' },
                      { icon: '🤖', label: 'AI Insights' },
                      { icon: '💎', label: 'Priority Support' },
                    ].map((feature, i) => (
                      <motion.div
                        key={feature.label}
                        className="flex items-center space-x-2 text-white/80"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                      >
                        <span className="text-xl">{feature.icon}</span>
                        <span className="text-sm font-medium">{feature.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/premium">
                    <PremiumButton 
                      variant="glass" 
                      size="lg"
                      glow
                      magneticEffect
                      icon={<StarIcon className="w-5 h-5" />}
                    >
                      Upgrade to Premium
                    </PremiumButton>
                  </Link>
                </motion.div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Feed Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={PREMIUM_VARIANTS.fadeInUp}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Pet Feed</h2>
            <button
              onClick={refreshFeed}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm text-neutral-700 rounded-full hover:bg-white transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <HomeFeed
            posts={posts}
            onLoadMore={loadMorePosts}
            onLike={(postId) => {
              // Handle like
              console.log('Liked post:', postId);
            }}
            onComment={(postId, comment) => {
              // Handle comment
              console.log('Commented on post:', postId, comment);
            }}
            onShare={(postId) => {
              // Handle share
              console.log('Shared post:', postId);
            }}
            onBookmark={(postId) => {
              // Handle bookmark
              console.log('Bookmarked post:', postId);
            }}
            className="max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {activity.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.type === 'match' && '💕 New match with '}
                          {activity.type === 'message' && '💬 Message from '}
                          {activity.type === 'like' && '❤️ Liked by '}
                          {activity.name}
                        </p>
                        <p className="text-sm text-gray-500">{activity.breed}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">For You</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                {recommendations.map((pet, index) => (
                  <motion.div
                    key={pet.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {pet.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pet.name}</p>
                        <p className="text-sm text-gray-500">{pet.breed}, {pet.age}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{pet.distance}</p>
                      <Link
                        href="/swipe"
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/swipe"
                className="block w-full text-center mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                See all recommendations →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Story Components */}
      <AnimatePresence>
        {isStoriesOpen && (
          <StoriesCarousel
            stories={stories}
            currentStoryIndex={currentStoryIndex}
            onClose={closeStories}
            onStoryChange={setCurrentStoryIndex}
            onReply={(storyId, message) => {
              console.log('Reply to story:', storyId, message);
            }}
            onReaction={(storyId, reaction) => {
              console.log('Reaction to story:', storyId, reaction);
            }}
            onShare={(storyId) => {
              console.log('Share story:', storyId);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComposerOpen && (
          <StoryComposer
            isOpen={isComposerOpen}
            onClose={closeComposer}
            onPublish={async (storyData) => {
              try {
                await publishStory(storyData);
                console.log('Story published:', storyData);
              } catch (error) {
                console.error('Failed to publish story:', error);
              }
            }}
            petId={pets?.[0]?.id || 'default-pet'}
            petName={pets?.[0]?.name || 'Your Pet'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
