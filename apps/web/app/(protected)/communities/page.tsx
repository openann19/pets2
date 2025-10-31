'use client';

/**
 * COMMUNITY DISCOVERY PAGE
 *
 * Advanced community discovery platform where users can find and join
 * pet-focused communities, groups, and packs based on location, interests,
 * and pet compatibility.
 */

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { CommunityDiscovery, CommunityCreator } from '@/src/components/Community/PetCommunityGroups';
import { useAuthStore } from '@/src/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClickOutside } from '@/src/hooks/useClickOutside';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Heart,
  Sparkles,
  TrendingUp,
  Star,
  Shield,
  Zap
} from 'lucide-react';

export default function CommunitiesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Click outside to close dialog
  const dialogRef = useRef<HTMLDivElement>(null);
  useClickOutside(dialogRef, () => setShowCreateDialog(false), showCreateDialog);

  // Enhanced community stats
  const communityStats = {
    totalCommunities: 2847,
    activeMembers: 12543,
    newThisWeek: 23,
    popularCategories: [
      { name: 'Dogs', count: 1247, icon: '🐕', color: 'from-orange-400 to-red-500' },
      { name: 'Cats', count: 892, icon: '🐱', color: 'from-purple-400 to-pink-500' },
      { name: 'Training', count: 567, icon: '🎾', color: 'from-blue-400 to-indigo-500' },
      { name: 'Local Packs', count: 423, icon: '📍', color: 'from-green-400 to-teal-500' },
      { name: 'Health', count: 378, icon: '🏥', color: 'from-pink-400 to-rose-500' },
      { name: 'Rescue', count: 289, icon: '💝', color: 'from-yellow-400 to-orange-500' },
    ]
  };

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Communities</h1>
                  <p className="text-sm text-gray-600">Find your pack and connect with fellow pet lovers</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4" />
                  Create Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    {communityStats.totalCommunities.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Active Communities</div>
                  <div className="text-xs text-blue-600 mt-1">
                    +{communityStats.newThisWeek} new this week
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {communityStats.activeMembers.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Pet Parents Connected</div>
                  <div className="text-xs text-green-600 mt-1">
                    Across all communities
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-900 mb-1">
                    {communityStats.popularCategories.length}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Community Types</div>
                  <div className="text-xs text-purple-600 mt-1">
                    Find your perfect fit
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Community Insights */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Zap className="w-5 h-5" />
              AI Community Matching
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Our AI analyzes your pets and interests to recommend the perfect communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">96%</div>
                <div className="text-sm text-indigo-700">Match Accuracy</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">50+</div>
                <div className="text-sm text-purple-700">Compatibility Factors</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 mb-1">24/7</div>
                <div className="text-sm text-pink-700">Smart Recommendations</div>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg">
                <div className="text-2xl font-bold text-rose-600 mb-1">∞</div>
                <div className="text-sm text-rose-700">Community Options</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search communities by name, location, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
        </div>

        {/* Popular Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Popular Categories
            </CardTitle>
            <CardDescription>
              Discover trending community types and find where you belong
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {communityStats.popularCategories.map((category, index) => (
                <div
                  key={category.name}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 bg-gradient-to-br ${category.color} text-white`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="font-semibold text-sm mb-1">{category.name}</div>
                    <div className="text-xs opacity-90">{category.count.toLocaleString()} communities</div>
                    {index < 3 && (
                      <div className="mt-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                        🔥 Popular
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Communities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Featured Communities
            </CardTitle>
            <CardDescription>
              Hand-picked communities that are making a difference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock featured communities */}
              {[
                {
                  name: "Golden Retriever Guardians",
                  description: "The largest community for Golden Retriever owners worldwide",
                  members: 5423,
                  type: "Breed Specific",
                  badge: "🏆 Most Active"
                },
                {
                  name: "Urban Dog Walkers NYC",
                  description: "Connect with fellow dog parents in New York City",
                  members: 2156,
                  type: "Local Pack",
                  badge: "📍 Local Favorite"
                },
                {
                  name: "Puppy Training Academy",
                  description: "Professional training tips and success stories",
                  members: 3876,
                  type: "Training",
                  badge: "🎓 Expert Led"
                }
              ].map((community, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{community.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{community.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {community.members.toLocaleString()}
                        </span>
                        <span>{community.type}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        {community.badge}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Join Community
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Discovery */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Discover Communities</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              All communities are moderated and pet-safe
            </div>
          </div>

          <CommunityDiscovery userId={user?.id || ''} />
        </div>

        {/* Community Guidelines */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" />
              Community Guidelines
            </CardTitle>
            <CardDescription className="text-blue-700">
              Help us keep our communities safe, respectful, and pet-focused
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Be Respectful</div>
                    <div className="text-sm text-blue-700">Treat all members and their pets with kindness</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Stay On Topic</div>
                    <div className="text-sm text-blue-700">Keep discussions relevant to pets and communities</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Report Issues</div>
                    <div className="text-sm text-blue-700">Use the report feature for inappropriate content</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Share Positively</div>
                    <div className="text-sm text-blue-700">Celebrate pet achievements and support each other</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Community Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent ref={dialogRef} className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Build a community around your shared interests and help fellow pet lovers connect
              </DialogDescription>
            </DialogHeader>

            <CommunityCreator onCommunityCreated={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </ScreenShell>
  );
}
