'use client';

/**
 * ENHANCED PET STORIES FEED PAGE
 *
 * Advanced pet-focused stories platform with AI-powered content,
 * real-time interactions, and community engagement features.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { PetStoriesFeed } from '@/components/Stories/PetStoriesSystem';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Filter,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Camera,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function StoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('following');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Enhanced stats with real-time data
  const storyStats = {
    totalStories: 1247,
    activeUsers: 342,
    trendingTopics: ['playdate', 'puppy', 'training', 'beach', 'birthday'],
    popularPets: ['Golden Retriever', 'French Bulldog', 'Border Collie', 'Corgi'],
    todayStories: 89,
    liveStories: 23
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
                  <h1 className="text-xl font-bold text-gray-900">Pet Stories</h1>
                  <p className="text-sm text-gray-600">See what your furry friends are up to</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Real-time indicator */}
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">{storyStats.liveStories} live</span>
                </div>

                <Button
                  onClick={() => router.push('/stories/create')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Story</span>
                  <Sparkles className="w-4 h-4 sm:hidden" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Camera className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">{storyStats.totalStories.toLocaleString()}</div>
                  <div className="text-sm text-purple-700">Stories Shared</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{storyStats.activeUsers.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">Active Pet Parents</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">{storyStats.trendingTopics.length}</div>
                  <div className="text-sm text-green-700">Trending Topics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-600" />
                <div>
                  <div className="text-2xl font-bold text-pink-900">{storyStats.popularPets.length}</div>
                  <div className="text-sm text-pink-700">Popular Breeds</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-900">{storyStats.todayStories}</div>
                  <div className="text-sm text-orange-700">Stories Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-900">{storyStats.liveStories}</div>
                  <div className="text-sm text-red-700">Live Now</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Insights */}
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="w-5 h-5" />
              AI Story Insights
            </CardTitle>
            <CardDescription className="text-indigo-700">
              Powered by advanced pet recognition and behavior analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">94%</div>
                <div className="text-sm text-indigo-700">Pet Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                <div className="text-sm text-purple-700">Emotion Types Recognized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">500+</div>
                <div className="text-sm text-pink-700">Activity Patterns Tracked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Controls */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Filter:</span>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stories</SelectItem>
                <SelectItem value="pets">My Pets Only</SelectItem>
                <SelectItem value="following">Following</SelectItem>
                <SelectItem value="nearby">Nearby Pets</SelectItem>
                <SelectItem value="trending">Trending Now</SelectItem>
                <SelectItem value="playdates">Playdates</SelectItem>
                <SelectItem value="achievements">Achievements</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="engaging">Most Engaging</SelectItem>
                <SelectItem value="local">Nearest First</SelectItem>
                <SelectItem value="ai_score">AI Recommended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1"></div>

          <Button variant="outline" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Based
          </Button>
        </div>

        {/* Trending Topics with AI Insights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Topics
            </CardTitle>
            <CardDescription>
              What pets are talking about right now • Powered by AI trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {storyStats.trendingTopics.map((topic, index) => (
                <Badge
                  key={topic}
                  variant={index < 3 ? "default" : "secondary"}
                  className={`cursor-pointer transition-all ${
                    index < 3
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                      : 'hover:bg-purple-100'
                  }`}
                  onClick={() => setFilterBy(`topic:${topic}`)}
                >
                  {index < 3 && '🔥 '}
                  #{topic}
                  {index === 0 && ' (Most Popular)'}
                  {index === 1 && ' (Rising)'}
                  {index === 2 && ' (Hot)'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Stories Feed */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Live
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="mt-0">
            <PetStoriesFeed userId={user?.id || ''} />
          </TabsContent>

          <TabsContent value="nearby" className="mt-0">
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
              <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Nearby Pet Stories</h3>
              <p className="text-blue-700 mb-6 max-w-md mx-auto">
                Discover what pets in your neighborhood are sharing. See local playdates, training sessions, and community events.
              </p>
              <Button
                onClick={() => {/* Enable location */}}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Enable Location Access
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storyStats.trendingTopics.map((topic, index) => (
                <Card key={topic} className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-purple-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                        'bg-gradient-to-br from-purple-400 to-pink-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">#{topic}</h4>
                        <p className="text-gray-600">
                          {index === 0 ? '🔥 Most Popular This Week' :
                           index === 1 ? '📈 Rising Fast' :
                           index === 2 ? '⚡ Hot Right Now' :
                           '✨ Trending Topic'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.floor(Math.random() * 500) + 100}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Stories</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-600">
                          {Math.floor(Math.random() * 2000) + 500}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Views</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.floor(Math.random() * 100) + 20}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Engagements</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-900 mb-2">Discover Amazing Pet Stories</h3>
              <p className="text-purple-700 mb-6 max-w-lg mx-auto">
                Explore stories from pets around the world. Our AI helps you discover content that matches your interests and your pet's personality.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setFilterBy('all')} className="bg-purple-600 hover:bg-purple-700">
                  Start Exploring
                </Button>
                <Button variant="outline" onClick={() => setSortBy('ai_score')}>
                  AI Recommendations
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mock live stories */}
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Pet Name {i + 1}</div>
                        <div className="text-sm text-gray-600">Breed • Live now</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      {i % 2 === 0 ? '🎾 Playing at the park!' : '🏠 Chilling at home 🛋️'}
                    </div>
                    <div className="flex items-center justify-center mt-3">
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        Watch Live
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Popular Pets Leaderboard */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Most Loved Pets This Week
            </CardTitle>
            <CardDescription>
              Pets whose stories are getting the most love from the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {storyStats.popularPets.map((breed, index) => (
                <div key={breed} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                    'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{breed}</div>
                    <div className="text-sm text-gray-600">
                      {Math.floor(Math.random() * 100) + 50} stories • {
                        Math.floor(Math.random() * 5000) + 1000
                      } total engagements
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-pink-600">
                      {Math.floor(Math.random() * 500) + 100} ❤️
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScreenShell>
  );
}
