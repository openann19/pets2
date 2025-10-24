'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../src/lib/auth-store';
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
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Swipes', value: '247', icon: BoltIcon, color: 'from-blue-500 to-cyan-500' },
    { label: 'Likes Received', value: '89', icon: HeartIcon, color: 'from-pink-500 to-rose-500' },
    { label: 'Active Matches', value: '12', icon: FireIcon, color: 'from-orange-500 to-red-500' },
    { label: 'Super Likes', value: '5', icon: StarIcon, color: 'from-purple-500 to-indigo-500' },
  ];

  const quickActions = [
    {
      title: 'Discover Pets',
      description: 'Start swiping to find new matches',
      href: '/swipe',
      icon: MagnifyingGlassIcon,
      gradient: 'from-pink-500 to-purple-600',
    },
    {
      title: 'View Matches',
      description: 'Chat with your matched pets',
      href: '/matches',
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Add a Pet',
      description: 'Create a profile for your pet',
      href: '/pets/new',
      icon: PlusCircleIcon,
      gradient: 'from-green-500 to-teal-600',
    },
    {
      title: 'My Pets',
      description: 'Manage your pet profiles',
      href: '/my-pets',
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

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Pet Lover'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Your pets have been waiting for you. Let's find them some new friends!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="block bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.gradient} mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium Upsell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Unlock Premium Features</h3>
              </div>
              <p className="text-white/90">
                Get unlimited swipes, see who likes you, and access AI-powered matching!
              </p>
            </div>
            <Link
              href="/premium"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
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
    </div>
  );
}
