'use client';

import dynamic from 'next/dynamic';

import PremiumLayout from '@/components/Layout/PremiumLayout';
import { BlockMuteMenu } from '@/components/moderation/BlockMuteMenu';
import { ReportDialog } from '@/components/moderation/ReportDialog';
import { LazyImage } from '@/components/Performance/LazyImage';
import { DialogComponent as Dialog, DialogContentComponent as DialogContent, DialogDescriptionComponent as DialogDescription, DialogHeaderComponent as DialogHeader, DialogTitleComponent as DialogTitle } from '@/components/UI/dialog';
import { GlassCard } from '@/components/UI/glass-card';
import PremiumButton from '@/components/UI/PremiumButton';
import { SkeletonLoader } from '@/components/UI/SkeletonLoader';
import { api } from '@/services/api';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  SparklesIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { filterContent } from '@pawfectmatch/core/utils';
import { useQuery } from '@tanstack/react-query';
import type { PanInfo } from 'framer-motion';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

// Lazy load heavy components
const CompatibilityMatrix = dynamic(() => import('@/components/Personality/CompatibilityMatrix').then(mod => ({ default: mod.CompatibilityMatrix })), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <span className="ml-2 text-white">Loading compatibility analysis...</span>
    </div>
  ),
  ssr: false
});

import { useFocusTrap } from '@/hooks/useFocusTrap';
import confetti from 'canvas-confetti';

interface Pet {
  id: string;
  name: string;
  age: number;
  breed: string;
  species: string;
  description: string;
  photos: string[];
  location: string;
  owner: {
    id?: string;
    name: string;
    avatar?: string;
  };
}

// Fetch real pets from API
function useBrowsePets() {
  return useQuery({
    queryKey: ['browse-pets'],
    queryFn: async () => {
      const response = await api.getPets();
      return (response as { pets?: Pet[] }).pets || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export default function BrowsePage() {
  const { data: pets, isLoading, error } = useBrowsePets();
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionType, setActionType] = useState<'like' | 'chat' | null>(null);
  const [likedPets, setLikedPets] = useState<string[]>([]);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const modalRef = useFocusTrap(showLoginModal);

  // Haptic feedback function for web
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    // Visual feedback for web (since we can't use native haptics)
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const nextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev: number) => {
      const pet = pets?.[currentPetIndex];
      if (!pet?.photos || pet.photos.length <= 1) return prev;
      return (prev + 1) % pet.photos.length;
    });
  }, [currentPetIndex, pets]);

  const prevPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev: number) => {
      const pet = pets?.[currentPetIndex];
      if (!pet?.photos || pet.photos.length <= 1) return prev;
      return (prev - 1 + pet.photos.length) % pet.photos.length;
    });
  }, [currentPetIndex, pets]);

  const SWIPE_THRESHOLD = 120;
  const handleSwipeEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    const x = info.offset.x;
    if (x > SWIPE_THRESHOLD) {
      setDragOffset({ x: 0, y: 0 });
      void handleLike();
    } else if (x < -SWIPE_THRESHOLD) {
      setDragOffset({ x: 0, y: 0 });
      void handlePass();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PremiumLayout>
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <SkeletonLoader width={200} height={32} className="rounded-lg" />
            <SkeletonLoader width={80} height={24} className="rounded-full" />
          </div>

          {/* Pet card skeleton */}
          <div className="relative">
            <GlassCard className="overflow-hidden" variant="medium" blur="lg" hover animate glow>
              {/* Photo skeleton */}
              <div className="relative h-96 bg-black/20">
                <SkeletonLoader width="100%" height="100%" radius={0} />
              </div>

              {/* Pet info skeleton */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <SkeletonLoader width={120} height={24} className="mb-2" />
                    <SkeletonLoader width={100} height={16} className="mb-2" />
                    <SkeletonLoader width={80} height={14} />
                  </div>
                  <SkeletonLoader width={48} height={48} radius={24} />
                </div>

                <SkeletonLoader width="100%" height={16} className="mb-2" count={3} />

                {/* Action buttons skeleton */}
                <div className="flex gap-3 mt-6">
                  <SkeletonLoader width="25%" height={48} radius={8} />
                  <SkeletonLoader width="25%" height={48} radius={8} />
                  <SkeletonLoader width="25%" height={48} radius={8} />
                  <SkeletonLoader width="25%" height={48} radius={8} />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // Error state
  if (error || !pets || pets.length === 0) {
    return (
      <PremiumLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center" hover animate glow>
            <SparklesIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? 'Unable to load pets' : 'No pets available'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error ? 'Please try again later' : 'Check back soon for new matches!'}
            </p>
            <PremiumButton
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </PremiumButton>
          </GlassCard>
        </div>
      </PremiumLayout>
    );
  }

  const currentPet = pets[currentPetIndex];

  // Guard against undefined currentPet
  if (!currentPet) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">No more pets to browse</p>
        </div>
      </PremiumLayout>
    );
  }

  // Keyboard navigation for photo carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentPet.photos.length <= 1) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevPhoto();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextPhoto();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPet.photos.length, prevPhoto, nextPhoto]);
  // Keyboard navigation for all actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with photo carousel navigation
      if (event.target instanceof HTMLButtonElement && event.target.getAttribute('aria-label')?.includes('Photo')) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          // Focus management for action buttons
          break;
        case 'Escape':
          event.preventDefault();
          // Close modals or cancel actions
          if (showLoginModal) {
            setShowLoginModal(false);
          }
          if (showCompatibility) {
            setShowCompatibility(false);
            setSelectedPet(null);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLoginModal, showCompatibility]);

  const handleLike = async () => {
    if (isLiking) return; // Prevent double-clicks

    const currentPetId = currentPet?.id;
    if (!currentPetId) return;

    setIsLiking(true);

    // Optimistic update - show confetti immediately
    setLikedPets((prev: string[]) => [...prev, currentPetId]);

    // Trigger confetti celebration
    triggerHaptic('heavy'); // Haptic feedback

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const particleCount = 50;

    setTimeout(() => {
      confetti({
        particleCount,
        startVelocity: randomInRange(50, 100),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        },
        colors: ['#ff6b9d', '#4facfe', '#a855f7', '#ec4899', '#f59e0b']
      });

      confetti({
        particleCount,
        startVelocity: randomInRange(50, 100),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#ff6b9d', '#4facfe', '#a855f7', '#ec4899', '#f59e0b']
      });
    }, 250);

    try {
      // Call real API endpoint
      await api.pets.likePet(currentPetId);

      // Move to next pet after successful like
      setTimeout(() => {
        if (pets && pets.length > 0) {
          setCurrentPetIndex((prev: number) => (prev + 1) % pets.length);
          setCurrentPhotoIndex(0);
        }
      }, 1500);
    } catch (error) {
      // Revert optimistic update on error
      setLikedPets((prev: string[]) => prev.filter((id: string) => id !== currentPetId));
      console.error('Failed to like pet:', error);
      // TODO: Show error toast
    } finally {
      setIsLiking(false);
    }
  };

  const handlePass = async () => {
    if (isPassing) return; // Prevent double-clicks

    const currentPetId = currentPet?.id;
    if (!currentPetId) return;

    setIsPassing(true);

    // Haptic feedback for pass action
    triggerHaptic('medium');

    try {
      // Call real API endpoint
      await api.pets.passPet(currentPetId);

      // Move to next pet
      setCurrentPetIndex((prev: number) => (prev + 1) % pets.length);
      setCurrentPhotoIndex(0);
    } catch (error) {
      console.error('Failed to pass pet:', error);
      // TODO: Show error toast
    } finally {
      setIsPassing(false);
    }
  };

  const handleChat = async () => {
    if (isChatting) return; // Prevent double-clicks

    const currentPetId = currentPet?.id;
    if (!currentPetId) return;

    setIsChatting(true);

    // Haptic feedback for chat action
    triggerHaptic('light');

    try {
      // Like the pet first to create a match (if not already matched)
      const response = await api.pets.likePet(currentPetId) as { matched?: boolean; matchId?: string };

      if (response.matched && response.matchId) {
        // Navigate to chat if match was created
        window.location.href = `/chat/${response.matchId}`;
      } else {
        // Show login modal if not authenticated or match pending
        setActionType('chat');
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('Failed to initiate chat:', error);
      // Show login modal on error (likely auth issue)
      setActionType('chat');
      setShowLoginModal(true);
    } finally {
      setIsChatting(false);
    }
  };

  // Login success handler removed - modal handles its own flow

  return (
    <PremiumLayout>
      {/* Page Header */}
      <div className="max-w-md mx-auto px-4 py-6" role="main" aria-labelledby="browse-heading">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" id="browse-heading">
            <span className="mr-1">🐾</span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Browse Pets
            </span>
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <span className="text-sm text-white/70">
              {currentPetIndex + 1} of {pets.length}
            </span>
          </div>
        </div>

        {/* Pet Card */}
        <div className="relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDrag={(_, info) => {
              setDragOffset({ x: info.offset.x, y: info.offset.y });
            }}
            onDragEnd={handleSwipeEnd}
            animate={{
              x: dragOffset.x,
              rotate: dragOffset.x * 0.1,
              scale: isDragging ? 0.95 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <GlassCard
              className="overflow-hidden"
              variant="medium"
              blur="lg"
              hover
              animate
              interactive
              glow
            >
              {/* Photo Carousel */}
              <div className="relative h-96 bg-black/20">
                <LazyImage
                  src={currentPet.photos[currentPhotoIndex] || 'https://via.placeholder.com/400x500?text=No+Photo'}
                  alt={currentPet.name || 'Pet photo'}
                  className="w-full h-full object-cover"
                />

                {/* Photo Navigation */}
                {currentPet.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 hover:scale-110 active:scale-95 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-md"
                      aria-label="Previous photo"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 hover:scale-110 active:scale-95 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-md"
                      aria-label="Next photo"
                    >
                      →
                    </button>

                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {currentPet.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentPhotoIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentPhotoIndex
                            ? 'bg-white scale-125 shadow-lg'
                            : 'bg-white/50 hover:bg-white/70 hover:scale-110 active:scale-95'
                            }`}
                          aria-label={`Photo ${index + 1} of ${currentPet.photos.length}`}
                          aria-pressed={index === currentPhotoIndex}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Like Status */}
                {likedPets.includes(currentPet.id) && (
                  <div className="absolute top-4 right-4 bg-white/10 border border-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ❤️ Liked!
                  </div>
                )}
              </div>

              {/* Pet Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white" id="pet-name">{currentPet.name}</h2>
                    <p className="text-white/70">
                      {currentPet.age} year old {currentPet.breed}
                    </p>
                    <p className="text-sm text-white/60 flex items-center gap-1">
                      📍 {currentPet.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white font-bold">
                      {currentPet.owner.avatar || currentPet.owner.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{currentPet.owner.name}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setReportOpen(true)}
                        className="text-[11px] text-red-300 hover:text-red-200 underline"
                        aria-label="Report this pet"
                      >
                        Report
                      </button>
                      {currentPet.owner?.id ? (
                        <div className="scale-90 origin-top-right">
                          <BlockMuteMenu userId={currentPet.owner.id} userName={currentPet.owner.name} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {(() => {
                  const { output, matched } = filterContent(currentPet.description);
                  return (
                    <div className="mb-6">
                      <p className="text-white/80">{output}</p>
                      {matched.length > 0 ? (
                        <p className="mt-1 text-[11px] text-yellow-200/80">Some content was filtered for safety.</p>
                      ) : null}
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex gap-3" role="group" aria-labelledby="pet-name" aria-label="Pet interaction actions">
                  <PremiumButton
                    variant="outline"
                    size="lg"
                    onClick={handlePass}
                    disabled={isPassing}
                    className={`flex-1 bg-error-500/20 border-error-500/50 text-white hover:bg-error-500/30 hover:border-error-500/70 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    icon={<XMarkIcon className="w-5 h-5" />}
                    aria-label={isPassing ? "Passing..." : "Pass on this pet"}
                    aria-pressed={false}
                  >
                    {isPassing ? 'Passing...' : 'Pass'}
                  </PremiumButton>

                  <PremiumButton
                    variant="outline"
                    size="lg"
                    onClick={handleLike}
                    disabled={isLiking}
                    className="flex-1 bg-primary-500/20 border-primary-500/50 text-white hover:bg-primary-500/30 hover:border-primary-500/70 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
                    icon={
                      likedPets.includes(currentPet?.id || '') ? (
                        <HeartSolid className="w-5 h-5" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )
                    }
                    aria-label={isLiking ? "Liking..." : likedPets.includes(currentPet?.id || '') ? "Already liked" : "Like this pet"}
                    aria-pressed={likedPets.includes(currentPet?.id || '')}
                  >
                    {isLiking ? 'Liking...' : likedPets.includes(currentPet?.id || '') ? 'Liked' : 'Like'}
                  </PremiumButton>

                  <PremiumButton
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSelectedPet(currentPet);
                      setShowCompatibility(true);
                    }}
                    className="flex-1 bg-purple-500/20 border-purple-500/50 text-white hover:bg-purple-500/30 hover:border-purple-500/70 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 backdrop-blur-md"
                    icon={<ChartBarIcon className="w-5 h-5" />}
                    aria-label="View compatibility analysis"
                    aria-expanded={showCompatibility}
                  >
                    Compatibility
                  </PremiumButton>

                  <PremiumButton
                    variant="outline"
                    size="lg"
                    onClick={handleChat}
                    disabled={isChatting}
                    className={`flex-1 bg-secondary-500/20 border-secondary-500/50 text-white hover:bg-secondary-500/30 hover:border-secondary-500/70 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                    icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                    aria-label={isChatting ? "Connecting..." : "Start chat with pet owner"}
                  >
                    {isChatting ? 'Connecting...' : 'Chat'}
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Swipe Indicators */}
          {isDragging ? (
            <>
              <motion.div
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-red-500/80 text-white px-4 py-2 rounded-full font-bold text-lg backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: dragOffset.x < -50 ? 1 : 0,
                  scale: dragOffset.x < -50 ? 1 : 0.8,
                }}
              >
                PASS
              </motion.div>
              <motion.div
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-primary-500/80 text-white px-4 py-2 rounded-full font-bold text-lg backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: dragOffset.x > 50 ? 1 : 0,
                  scale: dragOffset.x > 50 ? 1 : 0.8,
                }}
              >
                LIKE
              </motion.div>
            </>
          ) : null}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            💡 <strong>Tip:</strong> Swipe left to pass, right to like, or use buttons below. Login
            required to like or chat!
          </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Dialog>
          <DialogContent>
            <div ref={(el: HTMLDivElement | null) => { (modalRef as unknown as { current: HTMLDivElement | null }).current = el; }}>
              <DialogHeader>
                <div className="text-center mb-6">
                  {actionType === 'like' ? (
                    <HeartIcon className="w-16 h-16 mx-auto text-primary-500 mb-4" />
                  ) : (
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-secondary-500 mb-4" />
                  )}
                </div>
                <DialogTitle>{actionType === 'like' ? 'Like This Pet?' : 'Start Chatting?'}</DialogTitle>
                <DialogDescription>
                  {actionType === 'like'
                    ? 'Create an account to like pets and see who liked you back!'
                    : 'Sign up to start chatting with pet owners and arrange meetups!'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <PremiumButton
                  size="lg"
                  onClick={() => (window.location.href = '/register')}
                  className="w-full"
                  icon={<UserIcon className="w-5 h-5" />}
                >
                  Sign Up Free
                </PremiumButton>

                <PremiumButton
                  variant="secondary"
                  size="lg"
                  onClick={() => (window.location.href = '/login')}
                  className="w-full"
                  icon={<SparklesIcon className="w-5 h-5" />}
                >
                  Already have an account? Login
                </PremiumButton>

                <button
                  onClick={() => {
                    setShowLoginModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:scale-105 active:scale-95 text-sm transition-all duration-200 w-full py-2"
                  data-modal-close
                >
                  Continue browsing
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Compatibility Matrix */}
      {selectedPet ? (
        <CompatibilityMatrix
          pet1={{
            id: 'current-user-pet',
            name: 'Your Pet'
          }}
          pet2={{
            id: selectedPet.id,
            name: selectedPet.name
          }}
          interactionType="playdate"
          isOpen={showCompatibility}
          onClose={() => {
            setShowCompatibility(false);
            setSelectedPet(null);
          }}
        />
      ) : null}

      {/* Report Dialog */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetId={currentPet.id}
        category="pet"
      />
    </PremiumLayout>
  );
}
