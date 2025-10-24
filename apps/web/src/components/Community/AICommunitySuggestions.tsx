import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Heart, MapPin, MessageCircle, Sparkles, Star, Target, TrendingUp, UserPlus, Users, } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
export const AICommunitySuggestions = memo(({ userId, userProfile, onJoinPack, onConnectWithUser, onViewProfile, }) => {
    const [suggestions, setSuggestions] = useState({
        packGroups: [],
        users: [],
        activities: [],
    });
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    // Memoize user profile analysis
    const userProfileAnalysis = useMemo(() => {
        const hasActivePets = userProfile.pets.some((pet) => pet.activityLevel === 'high');
        const hasModeratePets = userProfile.pets.some((pet) => pet.activityLevel === 'moderate');
        const hasSeniorPets = userProfile.pets.some((pet) => pet.age > 7);
        return {
            hasActivePets,
            hasModeratePets,
            hasSeniorPets,
            totalPets: userProfile.pets.length,
            interests: userProfile.interests,
            location: userProfile.location,
        };
    }, [userProfile]);
    useEffect(() => {
        analyzeCommunitySuggestions();
    }, [userProfileAnalysis]);
    const analyzeCommunitySuggestions = useCallback(async () => {
        setIsAnalyzing(true);
        // Simulate AI analysis
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const mockSuggestions = generateMockSuggestions(userProfileAnalysis);
        setSuggestions(mockSuggestions);
        setIsAnalyzing(false);
    }, [userProfileAnalysis]);
    // Memoized utility functions
    const getCompatibilityColor = useCallback((score) => {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 80)
            return 'text-blue-600';
        if (score >= 70)
            return 'text-yellow-600';
        return 'text-gray-600';
    }, []);
    const getCompatibilityBadge = useCallback((score) => {
        if (score >= 90)
            return { text: 'Perfect Match', variant: 'default' };
        if (score >= 80)
            return { text: 'Great Match', variant: 'secondary' };
        if (score >= 70)
            return { text: 'Good Match', variant: 'outline' };
        return { text: 'Worth Considering', variant: 'outline' };
    }, []);
    const generateMockSuggestions = useCallback((profile) => {
        // Mock pack group suggestions
        const packGroups = [
            {
                _id: '1',
                name: 'Downtown Dog Walkers',
                description: 'Daily walks and meetups in downtown area',
                location: profile.location,
                maxMembers: 30,
                currentMembers: 22,
                activityLevel: 'moderate',
                meetingFrequency: 'weekly',
                privacy: 'public',
                tags: ['walks', 'urban', 'daily'],
                createdBy: 'other-user',
                createdAt: new Date().toISOString(),
                members: [],
                activities: [],
                compatibilityScore: 92,
                reasons: [
                    'Location match - same city',
                    'Activity level compatible with your pets',
                    'Similar interests in daily walks',
                ],
            },
            {
                _id: '2',
                name: 'Pet Playtime Group',
                description: 'Organized play sessions and social events',
                location: profile.location,
                maxMembers: 25,
                currentMembers: 18,
                activityLevel: 'high',
                meetingFrequency: 'biweekly',
                privacy: 'public',
                tags: ['play', 'social', 'events'],
                createdBy: 'other-user',
                createdAt: new Date().toISOString(),
                members: [],
                activities: [],
                compatibilityScore: 87,
                reasons: [
                    "High energy activities match your pets' needs",
                    'Social focus aligns with your interests',
                    'Convenient meeting frequency',
                ],
            },
        ];
        // Mock user suggestions
        const users = [
            {
                _id: 'user1',
                name: 'Sarah Johnson',
                avatar: '/avatar1.jpg',
                location: profile.location,
                pets: [{ name: 'Max', species: 'dog', age: 3 }],
                interests: ['hiking', 'dog training', 'photography'],
                compatibilityScore: 89,
                reasons: [
                    'Similar pet ownership (dog)',
                    'Shared interest in hiking',
                    'Local to your area',
                ],
                commonInterests: ['hiking', 'dog training'],
            },
            {
                _id: 'user2',
                name: 'Mike Chen',
                avatar: '/avatar2.jpg',
                location: profile.location,
                pets: [{ name: 'Luna', species: 'cat', age: 2 }],
                interests: ['gardening', 'reading', 'cat care'],
                compatibilityScore: 76,
                reasons: [
                    'Different pet types but complementary interests',
                    'Both enjoy quiet activities',
                    'Same neighborhood',
                ],
                commonInterests: ['gardening'],
            },
        ];
        // Mock activity suggestions
        const activities = [
            {
                _id: 'activity1',
                title: 'Central Park Pet Meetup',
                description: 'Casual meetup for dogs and their owners in Central Park',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
                location: 'Central Park, New York, NY',
                attendees: 12,
                maxAttendees: 30,
                compatibilityScore: 94,
                reasons: [
                    'Perfect location match',
                    'Activity level matches your pets',
                    'Good attendance rate suggests quality event',
                ],
            },
            {
                _id: 'activity2',
                title: 'Dog Training Workshop',
                description: 'Learn basic obedience and socialization skills',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
                location: 'Community Center, Downtown',
                attendees: 8,
                maxAttendees: 20,
                compatibilityScore: 85,
                reasons: [
                    'Educational content matches your interests',
                    'Convenient timing and location',
                    'Small group size for better interaction',
                ],
            },
        ];
        return { packGroups, users, activities };
    }, [userProfileAnalysis]);
    if (isAnalyzing) {
        return (<Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 text-purple-500 animate-pulse mx-auto"/>
              <div>
                <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
                <p className="text-gray-600">Finding the perfect community matches for you...</p>
              </div>
              <Progress value={75} className="w-64 mx-auto"/>
            </div>
          </CardContent>
        </Card>);
    }
    return (<div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500"/>
              AI Community Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your profile, pets, and interests
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Pack Group Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500"/>
              Recommended Pack Groups
            </CardTitle>
            <CardDescription>
              Groups that match your location and activity preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.packGroups.map((pack) => {
            const badge = getCompatibilityBadge(pack.compatibilityScore);
            return (<div key={pack._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{pack.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4"/>
                          {pack.location}
                          <span>•</span>
                          <span>
                            {pack.currentMembers}/{pack.maxMembers} members
                          </span>
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{pack.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {pack.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>))}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Compatibility</span>
                        <span className={getCompatibilityColor(pack.compatibilityScore)}>
                          {pack.compatibilityScore}%
                        </span>
                      </div>
                      <Progress value={pack.compatibilityScore} className="h-2"/>
                    </div>

                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium">Why this matches you:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pack.reasons.map((reason, index) => (<li key={index} className="flex items-start gap-2">
                            <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0"/>
                            {reason}
                          </li>))}
                      </ul>
                    </div>

                    <Button onClick={() => onJoinPack?.(pack._id)} className="w-full">
                      <UserPlus className="h-4 w-4 mr-2"/>
                      Join Pack Group
                    </Button>
                  </div>);
        })}
            </div>
          </CardContent>
        </Card>

        {/* User Connection Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500"/>
              People You Might Connect With
            </CardTitle>
            <CardDescription>
              Pet owners with similar interests and complementary pet personalities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.users.map((user) => {
            const badge = getCompatibilityBadge(user.compatibilityScore);
            return (<div key={user._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar}/>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4"/>
                            {user.location}
                          </div>
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <span className="text-sm font-medium">Pets: </span>
                        <span className="text-sm text-gray-600">
                          {user.pets.map((pet) => `${pet.name} (${pet.species})`).join(', ')}
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Common interests: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.commonInterests.map((interest) => (<Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Compatibility</span>
                        <span className={getCompatibilityColor(user.compatibilityScore)}>
                          {user.compatibilityScore}%
                        </span>
                      </div>
                      <Progress value={user.compatibilityScore} className="h-2"/>
                    </div>

                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium">Why you might connect:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {user.reasons.map((reason, index) => (<li key={index} className="flex items-start gap-2">
                            <Heart className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0"/>
                            {reason}
                          </li>))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => onConnectWithUser?.(user._id)} className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2"/>
                        Connect
                      </Button>
                      <Button variant="outline" onClick={() => onViewProfile?.(user._id)} className="flex-1">
                        View Profile
                      </Button>
                    </div>
                  </div>);
        })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500"/>
              Recommended Activities
            </CardTitle>
            <CardDescription>Upcoming events and meetups that match your interests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.activities.map((activity) => {
            const badge = getCompatibilityBadge(activity.compatibilityScore);
            return (<div key={activity._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4"/>
                          {new Date(activity.date).toLocaleDateString()} at{' '}
                          {new Date(activity.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4"/>
                          {activity.location}
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{activity.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>
                        {activity.attendees}/{activity.maxAttendees} attending
                      </span>
                      <span className={getCompatibilityColor(activity.compatibilityScore)}>
                        {activity.compatibilityScore}% match
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium">Why this activity suits you:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {activity.reasons.map((reason, index) => (<li key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0"/>
                            {reason}
                          </li>))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2"/>
                      Join Activity
                    </Button>
                  </div>);
        })}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto"/>
              <div>
                <h3 className="text-lg font-semibold">AI Community Insights</h3>
                <p className="text-gray-600 mt-2">
                  Based on your profile analysis, you're most compatible with moderate-activity
                  groups and owners interested in training and outdoor activities. Consider joining
                  2-3 groups to start building your community network.
                </p>
              </div>
              <Alert>
                <TrendingUp className="h-4 w-4"/>
                <AlertDescription>
                  <strong>Pro tip:</strong> Users who join 2+ pack groups report 40% more social
                  interactions with their pets and owners in similar situations.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>);
});
//# sourceMappingURL=AICommunitySuggestions.jsx.map
//# sourceMappingURL=AICommunitySuggestions.jsx.map