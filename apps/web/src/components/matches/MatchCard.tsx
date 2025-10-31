/**
 * MatchCard - WEB VERSION
 * Card component for displaying a match
 * Matches mobile MatchCard exactly
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import { Card } from '@/components/UI/Card';
import type { Match } from '@/hooks/useMatchesData';

export interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const theme = useTheme();

  const petPhoto = match.petPhoto || '/placeholder-pet.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        padding="md"
        radius="md"
        shadow="elevation1"
        tone="surface"
        style={{
          cursor: onPress ? 'pointer' : 'default',
          marginBottom: theme.spacing.md,
          overflow: 'hidden',
        }}
        onClick={onPress}
      >
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          {/* Pet Photo */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: theme.radii.full,
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <img
              src={petPhoto}
              alt={match.petName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-pet.jpg';
              }}
            />
            {match.isOnline && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: theme.colors.success,
                  border: `2px solid ${theme.colors.surface}`,
                }}
                aria-label="Online"
              />
            )}
          </div>

          {/* Match Info */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: theme.spacing.xs,
              }}
            >
              <h3
                style={{
                  fontSize: theme.typography.h2.size * 0.8,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {match.petName}
              </h3>
              {match.unreadCount > 0 && (
                <div
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: '600',
                    paddingLeft: 4,
                    paddingRight: 4,
                  }}
                >
                  {match.unreadCount > 99 ? '99+' : match.unreadCount}
                </div>
              )}
            </div>

            <p
              style={{
                fontSize: theme.typography.body.size * 0.875,
                color: theme.colors.onMuted,
                margin: 0,
                marginBottom: theme.spacing.xs,
              }}
            >
              {match.petBreed} • {match.petAge} years old
            </p>

            {match.lastMessage?.content && (
              <p
                style={{
                  fontSize: theme.typography.body.size * 0.875,
                  color: theme.colors.onMuted,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {match.lastMessage.content}
              </p>
            )}

            <p
              style={{
                fontSize: theme.typography.body.size * 0.875,
                color: theme.colors.onMuted,
                margin: 0,
                marginTop: theme.spacing.xs,
              }}
            >
              Matched {new Date(match.matchedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

