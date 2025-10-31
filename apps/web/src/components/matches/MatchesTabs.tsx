/**
 * MatchesTabs - WEB VERSION
 * Tab component for switching between Matches and Liked You
 * Matches mobile MatchesTabs exactly
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import { Card } from '@/components/UI/Card';

interface MatchesTabsProps {
  selectedTab: 'matches' | 'likedYou';
  onTabChange: (tab: 'matches' | 'likedYou') => void;
}

export function MatchesTabs({ selectedTab, onTabChange }: MatchesTabsProps) {
  const theme = useTheme();

  return (
    <Card
      padding="md"
      radius="md"
      shadow="elevation1"
      tone="surface"
      style={{
        marginBottom: theme.spacing.md,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
        }}
      >
        <button
          onClick={() => onTabChange('matches')}
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: theme.radii.md,
            border: 'none',
            backgroundColor: selectedTab === 'matches' ? theme.colors.primary : 'transparent',
            color: selectedTab === 'matches' ? theme.colors.onPrimary : theme.colors.onSurface,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: theme.typography.body.size,
            fontWeight: selectedTab === 'matches' ? '600' : '400',
            position: 'relative',
          }}
          aria-label="View matches"
          aria-selected={selectedTab === 'matches'}
          role="tab"
        >
          {selectedTab === 'matches' && (
            <motion.div
              layoutId="activeTab"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.xs,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
          Matches
        </button>

        <button
          onClick={() => onTabChange('likedYou')}
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: theme.radii.md,
            border: 'none',
            backgroundColor: selectedTab === 'likedYou' ? theme.colors.primary : 'transparent',
            color: selectedTab === 'likedYou' ? theme.colors.onPrimary : theme.colors.onSurface,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: theme.typography.body.size,
            fontWeight: selectedTab === 'likedYou' ? '600' : '400',
            position: 'relative',
          }}
          aria-label="View liked you"
          aria-selected={selectedTab === 'likedYou'}
          role="tab"
        >
          {selectedTab === 'likedYou' && (
            <motion.div
              layoutId="activeTab"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.xs,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
          )}
          Liked You
        </button>
      </div>
    </Card>
  );
}

