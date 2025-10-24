'use client';

import {
  BoltIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import PremiumLayout from '@/components/Layout/PremiumLayout';
import { EnhancedButton, EnhancedCard, InteractionProvider } from '@/components/UI/AdvancedInteractionSystem';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import {
  PREMIUM_VARIANTS,
  STAGGER_CONFIG
} from '@/constants/animations';
import { useDashboardData, useWebSocket } from '@/hooks/api-hooks';
import { useAuthStore } from '@/lib/auth-store';


export default function DashboardPage() {
  const { user: authUser } = useAuthStore();
  const { user, pets, matches, subscription } = useDashboardData();
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  
  // Setup WebSocket connection
  useWebSocket(authUser?.id);

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
      value: Array.isArray(matches) ? matches.reduce((acc: number, match: { unreadCount?: number }) => acc + (match.unreadCount ?? 0), 0).toString() : '0', 
      icon: FireIcon, 
      variant: 'neon' as const,
      description: 'Unread chats',
      trend: 'Live updates',
      color: 'warning' 
    },
    { 
      label: 'Premium Status', 
      value: subscription?.status === 'active' ? 'Active' : 'Free', 
      icon: StarIcon, 
      variant: 'holographic' as const,
      description: subscription?.status === 'active' ? 'Premium member' : 'Upgrade available',
      trend: subscription?.status === 'active' ? '30 days left' : 'Special offer',
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
    <InteractionProvider>
      <PremiumLayout>
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
          {subscription?.status !== 'active' && (
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
                  <PremiumButton 
                    variant="primary" 
                    size="md"
                    glow
                    magneticEffect
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-lg"
                  >
                    <StarIcon className="w-5 h-5 mr-2" />
                    Upgrade
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          )}
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
                  <EnhancedCard
                    id={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
                    variant="glass"
                    padding="lg"
                    effects={{
                      hover: true,
                      magnetic: true,
                      tilt: true,
                      glow: true,
                      ripple: true,
                      sound: true,
                      haptic: true,
                      shimmer: true,
                    }}
                    className="group cursor-pointer transition-all duration-300"
                    tooltip={`${action.description} - Click to get started`}
                    aria-label={`${action.title} - ${action.description}`}
                    apiOperation={`navigate-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
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
                  </EnhancedCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Premium Showcase */}
        {subscription?.status !== 'active' && (
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
                    <EnhancedButton
                      id="dashboard-premium-upgrade"
                      variant="holographic"
                      size="lg"
                      icon={<StarIcon className="w-6 h-6" />}
                      effects={{
                        hover: true,
                        magnetic: true,
                        glow: true,
                        ripple: true,
                        sound: true,
                        haptic: true,
                        shimmer: true,
                        particles: true,
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 font-bold shadow-xl w-full"
                      tooltip="Upgrade to Premium for exclusive features"
                      aria-label="Upgrade to Premium for exclusive features"
                      apiOperation="premium-upgrade"
                    >
                      Upgrade to Premium
                    </EnhancedButton>
                  </Link>
                </motion.div>
              </div>
            </PremiumCard>
          </motion.div>
        )}

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
      </PremiumLayout>
    </InteractionProvider>
  );
}
