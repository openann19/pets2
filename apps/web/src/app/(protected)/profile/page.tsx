'use client';
import AchievementBadges from '@/components/Gamification/AchievementBadges';
import DailyStreak from '@/components/Gamification/DailyStreak';
import { CodeSplitter } from '@/components/Performance/CodeSplitter';
import { LazyImage } from '@/components/Performance/LazyImage';
import PhotoCropper from '@/components/Photo/PhotoCropper';
import PhotoEditor from '@/components/Photo/PhotoEditor';
import { useToast } from '@/components/ui/toast';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { CameraIcon } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import React, { useState } from 'react';
export default function ProfilePage() {
    const toast = useToast();
    const { user } = useAuthStore();
    const [showPhotoCropper, setShowPhotoCropper] = useState(false);
    const [showPhotoEditor, setShowPhotoEditor] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [croppedImage, setCroppedImage] = useState('');
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result);
                setShowPhotoCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleCropComplete = async (blob) => {
        const url = URL.createObjectURL(blob);
        setCroppedImage(url);
        setShowPhotoCropper(false);
        setShowPhotoEditor(true);
    };
    const handlePhotoSave = async (blob) => {
        // Upload photo to server
        const formData = new FormData();
        formData.append('photo', blob);
        try {
            await fetch('/api/user/photo', {
                method: 'POST',
                body: formData,
            });
            setShowPhotoEditor(false);
            toast.success('Photo uploaded successfully!', 'Your profile photo has been updated.');
        }
        catch (error) {
            logger.error('Failed to upload photo:', { error });
            toast.error('Failed to upload photo', 'Please try again or contact support.');
        }
    };
    // Mock achievements data
    const achievements = [
        {
            id: 'first-match',
            title: 'First Match',
            description: 'Made your first match',
            icon: 'heart',
            unlocked: true,
            rarity: 'common',
            unlockedAt: new Date(),
        },
        {
            id: 'week-streak',
            title: '7 Day Streak',
            description: 'Logged in for 7 days straight',
            icon: 'fire',
            unlocked: true,
            rarity: 'rare',
            unlockedAt: new Date(Date.now() - 86400000),
        },
        {
            id: 'social-butterfly',
            title: 'Social Butterfly',
            description: 'Sent 100 messages',
            icon: 'chat',
            unlocked: true,
            rarity: 'epic',
            unlockedAt: new Date(Date.now() - 172800000),
        },
        {
            id: 'perfect-match',
            title: 'Perfect Match',
            description: 'Get 10 matches in one day',
            icon: 'star',
            unlocked: false,
            progress: 6,
            maxProgress: 10,
            rarity: 'legendary',
        },
        {
            id: 'month-streak',
            title: '30 Day Streak',
            description: 'Logged in for 30 days straight',
            icon: 'trophy',
            unlocked: false,
            progress: 15,
            maxProgress: 30,
            rarity: 'legendary',
        },
        {
            id: 'super-liker',
            title: 'Super Liker',
            description: 'Give 50 super likes',
            icon: 'sparkles',
            unlocked: false,
            progress: 23,
            maxProgress: 50,
            rarity: 'epic',
        },
    ];
    if (!user) {
        return null;
    }
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (<LazyImage src={user.avatar} alt={user.firstName} width={96} height={96} className="w-full h-full object-cover" placeholder="blur" blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="/>) : (<span className="text-4xl">🐾</span>)}
                </div>
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                <CameraIcon className="w-4 h-4 text-white"/>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden"/>
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {user.premium?.isActive && (<div className="mt-2 inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                  <span className="text-white text-sm font-semibold">✨ Premium</span>
                </div>)}
            </div>
          </div>
        </div>

        {/* Daily Streak with Code Splitting */}
        <div className="mb-8">
          <CodeSplitter fallback={<div className="h-32 bg-gray-200 animate-pulse rounded-lg"/>}>
            <DailyStreak currentStreak={user.streak?.current || 0} longestStreak={user.streak?.longest || 0} lastCheckIn={user.streak?.lastCheckIn}/>
          </CodeSplitter>
        </div>

        {/* Achievements with Code Splitting */}
        <div className="mb-8">
          <CodeSplitter fallback={<div className="h-48 bg-gray-200 animate-pulse rounded-lg"/>}>
            <AchievementBadges achievements={achievements} onBadgeClick={(achievement) => {
            alert(`${achievement.title}\n\n${achievement.description}\n\nRarity: ${achievement.rarity}`);
        }}/>
          </CodeSplitter>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-pink-600">{user.stats?.matches || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Matches</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-purple-600">{user.stats?.messages || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Messages</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-orange-600">{user.stats?.likes || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Likes Given</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-green-600">
              {achievements.filter((a) => a.unlocked).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Achievements</div>
          </div>
        </div>
      </div>

      {/* Photo Cropper Modal */}
      {showPhotoCropper && (<PhotoCropper image={selectedImage} onCropComplete={handleCropComplete} onCancel={() => setShowPhotoCropper(false)} aspectRatio={1} cropShape="round"/>)}

      {/* Photo Editor Modal */}
      {showPhotoEditor && (<PhotoEditor image={croppedImage} onSave={handlePhotoSave} onCancel={() => setShowPhotoEditor(false)}/>)}
    </div>);
}
//# sourceMappingURL=page.jsx.map