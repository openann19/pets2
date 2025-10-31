/**
 * 🎥 Video Call Page - Phase 3
 * WebRTC video calling interface
 */

'use client';

import { VideoCameraIcon } from '@heroicons/react/24/solid';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import PremiumButton from '../../../../src/components/UI/PremiumButton';
import PremiumCard from '../../../../src/components/UI/PremiumCard';
import VideoCallRoom from '../../../../src/components/VideoCall/VideoCallRoom';
import { usePremiumTier } from '../../../../src/hooks/premium-hooks';
import { useAuthStore } from '../../../../src/lib/auth-store';


export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasFeature } = usePremiumTier(user?.id || '');
  const [inCall, setInCall] = useState(false);

  const roomId = params['roomId'] as string;
  const hasVideoAccess = hasFeature('videoCalls');

  // Check premium access
  if (!hasVideoAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <PremiumCard className="max-w-md w-full p-8 text-center">
          <VideoCameraIcon className="w-20 h-20 mx-auto text-purple-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Premium Feature
          </h2>
          <p className="text-gray-600 mb-6">
            Video calls are available for Premium subscribers and above
          </p>
          <PremiumButton
            size="lg"
            onClick={() => router.push('/premium')}
          >
            Upgrade to Premium
          </PremiumButton>
        </PremiumCard>
      </div>
    );
  }

  if (!inCall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <PremiumCard className="max-w-md w-full p-8 text-center" glow>
          <VideoCameraIcon className="w-20 h-20 mx-auto text-purple-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Video Call
          </h2>
          <p className="text-gray-600 mb-2">
            Room: <span className="font-mono font-semibold">{roomId}</span>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Make sure your camera and microphone are ready
          </p>
          <div className="flex gap-3">
            <PremiumButton
              size="lg"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              size="lg"
              onClick={() => setInCall(true)}
            >
              Join Call
            </PremiumButton>
          </div>
        </PremiumCard>
      </div>
    );
  }

  return (
    <VideoCallRoom
      roomId={roomId}
      userId={user?.id || ''}
      userName={user?.name || 'User'}
      onLeave={() => {
        setInCall(false);
        router.push('/dashboard');
      }}
    />
  );
}
