'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChatBubbleLeftRightIcon, PhoneIcon, VideoCameraIcon, HeartIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../../src/components/UI/LoadingSpinner';
import PremiumButton from '../../../src/components/UI/PremiumButton';
import PremiumCard from '../../../src/components/UI/PremiumCard';

export default function MatchesPage() {
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      // Mock data for now - will be replaced with actual API call
      return [
        {
          id: '1',
          pet: { name: 'Luna', breed: 'Golden Retriever', age: 3, photo: '/images/luna.jpg' },
          owner: { name: 'Sarah Johnson', location: 'San Francisco, CA' },
          matchedAt: '2024-01-15',
          lastMessage: 'Would love to meet at the park!',
        },
        {
          id: '2',
          pet: { name: 'Max', breed: 'Border Collie', age: 2, photo: '/images/max.jpg' },
          owner: { name: 'Mike Chen', location: 'Austin, TX' },
          matchedAt: '2024-01-14',
          lastMessage: 'Max is excited to play!',
        },
        {
          id: '3',
          pet: { name: 'Bella', breed: 'Rescue Mix', age: 4, photo: '/images/bella.jpg' },
          owner: { name: 'Emily Rodriguez', location: 'Miami, FL' },
          matchedAt: '2024-01-13',
          lastMessage: 'When are you free this week?',
        },
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" variant="gradient" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading matches</p>
          <PremiumButton
            onClick={() => window.location.reload()}
            variant="gradient"
            size="md"
            glow
          >
            Retry
          </PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Your Matches</h1>
            <span className="text-sm text-gray-600">
              {matches?.length || 0} active matches
            </span>
          </div>
        </div>
      </header>

      {/* Matches Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {matches && matches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match, index) => (
              <PremiumCard
                key={match.id}
                variant="glass"
                hover
                glow
                entrance="fadeInUp"
                delay={index * 0.1}
                padding="none"
                className="overflow-hidden"
              >
                {/* Pet Photo */}
                <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                  <img
                    src={match.pet.photo}
                    alt={match.pet.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-pet.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-purple-600">
                    Matched {new Date(match.matchedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Match Info */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{match.pet.name}</h3>
                    <p className="text-sm text-gray-600">
                      {match.pet.breed}, {match.pet.age} years old
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">{match.owner.name}</p>
                    <p className="text-xs text-gray-500">{match.owner.location}</p>
                  </div>

                  {/* Last Message */}
                  {match.lastMessage && (
                    <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 truncate">{match.lastMessage}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/chat/${match.id}`}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Chat</span>
                    </Link>
                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <PhoneIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <VideoCameraIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐶</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
            <Link href="/swipe">
              <PremiumButton
                variant="gradient"
                size="lg"
                icon={<HeartIcon className="w-5 h-5" />}
                glow
                magneticEffect
                haptic
              >
                Start Swiping
              </PremiumButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
