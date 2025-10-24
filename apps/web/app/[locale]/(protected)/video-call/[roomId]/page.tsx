/**
 * 🎥 Video Call Page - Phase 3
 * WebRTC video calling interface
 */

'use client';

import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import VideoCallRoom from '@/components/VideoCall/VideoCallRoom';
import { usePremiumTier } from '@/hooks/premium-hooks';
import { useAuthStore } from '@/lib/auth-store';
import { VideoCameraIcon } from '@heroicons/react/24/solid';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasFeature } = usePremiumTier(user?.id || '');
  const [inCall, setInCall] = useState(false);

  const roomId = (params?.['roomId'] as string) || '';
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
            Video calls are available for Premium Plus subscribers and above
          </p>
          <PremiumButton
            size="lg"
            variant="primary"
            glow
            magneticEffect
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl w-full justify-center"
            onClick={() => router.push('/premium')}
          >
            Upgrade to Premium Plus
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
              variant="outline"
              className="flex-1 bg-white/20 border-2 border-white/50 hover:bg-white/30 hover:border-white font-semibold justify-center"
              onClick={() => router.back()}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              size="lg"
              variant="primary"
              glow
              magneticEffect
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl justify-center"
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
