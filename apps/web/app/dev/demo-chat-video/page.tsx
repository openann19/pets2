'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import {
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  UserIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function DemoChatVideoPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // Set auth token in localStorage for demo
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRiMjczNzgwZDllNGJiODlkZmYyNzkiLCJpYXQiOjE3NTkxOTI4ODcsImV4cCI6MTc1OTE5Mzc4N30.CpmDRqT6O6l-Nzz-cFnDnAFCVxwgfO-KRleAmUeRNIg';
    localStorage.setItem('authToken', token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '68db273780d9e4bb89dff279',
        name: 'Test User',
        email: 'test@example.com',
      }),
    );
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-4">
        <PremiumCard
          className="max-w-md w-full p-8 text-center"
        >
          <UserIcon className="w-20 h-20 mx-auto text-white mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Demo Login</h2>
          <p className="text-white/70 mb-6">
            Click below to login as a test user and access chat & video calling features
          </p>
          <PremiumButton
            size="lg"
            onClick={handleLogin}
            className="w-full"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Login as Test User
          </PremiumButton>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎉 Chat & Video Call Demo</h1>
          <p className="text-white/70 mb-6">Test the premium chat and video calling features</p>
          <PremiumButton
            variant="secondary"
            onClick={handleLogout}
            className="mb-4"
          >
            Logout
          </PremiumButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chat Demo */}
          <PremiumCard
            className="p-8 text-center"
            hover
          >
            <ChatBubbleLeftRightIcon className="w-20 h-20 mx-auto text-white mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Chat Demo</h3>
            <p className="text-white/70 mb-6">
              Experience real-time messaging with premium features like typing indicators, read
              receipts, and emoji reactions
            </p>
            <PremiumButton
              size="lg"
              onClick={() => router.push('/chat/68db276a0953a352b5a7c7c8')}
              className="w-full"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Open Chat
            </PremiumButton>
          </PremiumCard>

          {/* Video Call Demo */}
          <PremiumCard
            className="p-8 text-center"
            hover
          >
            <VideoCameraIcon className="w-20 h-20 mx-auto text-white mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Video Call Demo</h3>
            <p className="text-white/70 mb-6">
              Test WebRTC video calling with screen sharing, mute controls, and premium call quality
            </p>
            <PremiumButton
              size="lg"
              onClick={() => router.push('/video-call/demo-room')}
              className="w-full"
            >
              <VideoCameraIcon className="w-5 h-5 mr-2" />
              Start Video Call
            </PremiumButton>
          </PremiumCard>
        </div>

        <div className="mt-8 text-center">
          <PremiumCard
            className="p-6"
            variant="glass"
          >
            <h4 className="text-lg font-semibold text-white mb-2">🚀 Premium Features Available</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
              <div>
                <strong>Chat Features:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Real-time messaging</li>
                  <li>• Typing indicators</li>
                  <li>• Read receipts</li>
                  <li>• Emoji reactions</li>
                </ul>
              </div>
              <div>
                <strong>Video Features:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• HD video calling</li>
                  <li>• Screen sharing</li>
                  <li>• Mute/unmute</li>
                  <li>• Call recording</li>
                </ul>
              </div>
              <div>
                <strong>Premium UI:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Glassmorphism effects</li>
                  <li>• Smooth animations</li>
                  <li>• Haptic feedback</li>
                  <li>• Premium styling</li>
                </ul>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
