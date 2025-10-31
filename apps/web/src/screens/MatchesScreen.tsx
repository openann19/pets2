/**
 * MatchesScreen - WEB VERSION
 * Main matches screen matching mobile MatchesScreen exactly
 * Includes tabs (Matches/Liked You) and match listings
 */

'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '@/components/layout/AdvancedHeader';
import { useTheme } from '@/theme';
import { useMatchesData } from '@/hooks/useMatchesData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { MatchesTabs, MatchCard } from '@/components/matches';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchesScreen() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const listRef = useRef<HTMLDivElement>(null);

  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      refetch();
    },
  });

  // Error handling with retry
  const {
    error: errorHandlingError,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: false,
    logError: true,
  });

  // Matches data
  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
    isLoading,
    error,
    onRefresh,
    refetch,
    setSelectedTab,
    handleScroll,
  } = useMatchesData();

  // Calculate unread message count from matches
  const unreadMessages = matches.reduce((sum, match) => sum + (match.unreadCount || 0), 0);

  // Restore scroll position on mount
  useEffect(() => {
    if (listRef.current && typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('web_matches_scroll');
        if (saved) {
          listRef.current.scrollTop = Number(saved);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  const handleMatchPress = useCallback((matchId: string, petName: string) => {
    navigate(`/chat/${matchId}`);
  }, [navigate]);

  const handleFilterPress = useCallback(() => {
    // TODO: Implement filter functionality
    console.log('Filter matches');
  }, []);

  const handleSearchPress = useCallback(() => {
    // TODO: Implement search functionality
    console.log('Search matches');
  }, []);

  const currentData = selectedTab === 'matches' ? matches : likedYou;
  const isEmpty = !isLoading && currentData.length === 0;

  // Handle scroll events
  const handleScrollEvent = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (listRef.current) {
      const scrollTop = e.currentTarget.scrollTop;
      handleScroll(scrollTop);
      
      try {
        sessionStorage.setItem('web_matches_scroll', String(scrollTop));
      } catch {
        // Ignore storage errors
      }
    }
  }, [handleScroll]);

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('matches.title') || 'Matches',
            subtitle: selectedTab === 'matches' 
              ? `${matches.length} ${t('matches.active') || 'active matches'}`
              : `${likedYou.length} ${t('matches.likedYou') || 'liked you'}`,
            showBackButton: true,
            onBackPress: () => navigate(-1),
            rightButtons: [
              {
                type: 'filter',
                onPress: handleFilterPress,
                variant: 'glass',
                haptic: 'light',
              },
              {
                type: 'search',
                onPress: handleSearchPress,
                variant: 'minimal',
                haptic: 'light',
              },
            ],
          })}
        />
      }
    >
      <div
        style={{
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        }}
      >
        {/* Tabs */}
        <MatchesTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Loading State */}
        {isLoading && currentData.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing.xl,
              minHeight: '40vh',
            }}
          >
            <div
              className="animate-spin rounded-full border-4 border-t-transparent"
              style={{
                width: 48,
                height: 48,
                borderColor: theme.colors.primary,
                borderTopColor: 'transparent',
                marginBottom: theme.spacing.md,
              }}
            />
            <p
              style={{
                color: theme.colors.onMuted,
                fontSize: theme.typography.body.size,
              }}
            >
              {t('matches.loading') || 'Loading matches...'}
            </p>
          </div>
        )}

        {/* Offline State */}
        {isOffline && currentData.length === 0 && (
          <Card padding="xl" radius="md" shadow="elevation2" tone="surface">
            <div className="text-center">
              <h3
                style={{
                  fontSize: theme.typography.h2.size,
                  fontWeight: 'bold',
                  color: theme.colors.onSurface,
                  marginBottom: theme.spacing.md,
                }}
              >
                {t('matches.offline.title') || "You're offline"}
              </h3>
              <p
                style={{
                  color: theme.colors.onMuted,
                  fontSize: theme.typography.body.size,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {t('matches.offline.message') || 'Connect to the internet to see your matches'}
              </p>
              <Button
                title={t('matches.offline.retry') || 'Retry'}
                variant="primary"
                onPress={() => {
                  clearError();
                  if (isOnline) {
                    refetch();
                  }
                }}
              />
            </div>
          </Card>
        )}

        {/* Error State */}
        {(error || errorHandlingError) && currentData.length === 0 && (
          <Card padding="xl" radius="md" shadow="elevation2" tone="surface">
            <div className="text-center">
              <h3
                style={{
                  fontSize: theme.typography.h2.size,
                  fontWeight: 'bold',
                  color: theme.colors.onSurface,
                  marginBottom: theme.spacing.md,
                }}
              >
                {t('matches.error.title') || 'Unable to load matches'}
              </h3>
              <p
                style={{
                  color: theme.colors.onMuted,
                  fontSize: theme.typography.body.size,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {errorHandlingError?.message || error?.message || t('matches.error.message') || 'Please check your connection and try again'}
              </p>
              <Button
                title={t('matches.error.retry') || 'Retry'}
                variant="primary"
                onPress={() => {
                  clearError();
                  retry();
                }}
              />
            </div>
          </Card>
        )}

        {/* Empty State */}
        {isEmpty && (
          <Card padding="xl" radius="md" shadow="elevation2" tone="surface">
            <div className="text-center">
              {selectedTab === 'matches' ? (
                <>
                  <h3
                    style={{
                      fontSize: theme.typography.h2.size,
                      fontWeight: 'bold',
                      color: theme.colors.onSurface,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    {t('matches.empty.title') || 'No matches yet'}
                  </h3>
                  <p
                    style={{
                      color: theme.colors.onMuted,
                      fontSize: theme.typography.body.size,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    {t('matches.empty.subtitle') || 'Start swiping to find your perfect match!'}
                  </p>
                  <Button
                    title={t('matches.empty.action') || 'Go to Swipe'}
                    variant="primary"
                    onPress={() => navigate('/swipe')}
                  />
                </>
              ) : (
                <>
                  <h3
                    style={{
                      fontSize: theme.typography.h2.size,
                      fontWeight: 'bold',
                      color: theme.colors.onSurface,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    {t('matches.empty.liked_you.title') || 'No one liked you yet'}
                  </h3>
                  <p
                    style={{
                      color: theme.colors.onMuted,
                      fontSize: theme.typography.body.size,
                    }}
                  >
                    {t('matches.empty.liked_you.subtitle') || 'Keep swiping and people will start liking you!'}
                  </p>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Matches List */}
        {!isEmpty && currentData.length > 0 && (
          <div
            ref={listRef}
            onScroll={handleScrollEvent}
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              paddingRight: theme.spacing.xs,
            }}
          >
            <AnimatePresence>
              {currentData.map((match, index) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  onPress={() => handleMatchPress(match._id, match.petName)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
