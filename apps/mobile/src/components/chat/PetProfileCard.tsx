/**
 * Pet Profile Card Component
 * Displays pet profile information in chat messages
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { PetProfileCard as PetProfileCardType } from '@pawfectmatch/core/types/pet-chat';
import { Ionicons } from '@expo/vector-icons';

interface PetProfileCardProps {
  profile: PetProfileCardType;
  onPress?: () => void;
  showFullDetails?: boolean;
  compatibilityScore?: number;
}

export const PetProfileCard: React.FC<PetProfileCardProps> = ({
  profile,
  onPress,
  showFullDetails = false,
  compatibilityScore,
}) => {
  const theme = useTheme();

  const badgeColors: Record<string, string> = {
    vaccinated: theme.colors.success,
    microchipped: theme.colors.info,
    spayed_neutered: theme.colors.info,
    trained: theme.colors.primary,
    rescue: theme.colors.warning,
  };

  const badgeIcons: Record<string, string> = {
    vaccinated: 'shield-checkmark',
    microchipped: 'radio',
    spayed_neutered: 'heart',
    trained: 'trophy',
    rescue: 'heart-circle',
  };

  const verificationIcon = profile.verificationStatus === 'verified' ? 'checkmark-circle' : 
                           profile.verificationStatus === 'pending' ? 'time' : 'help-circle';

  const verificationColor = profile.verificationStatus === 'verified' ? theme.colors.success :
                           profile.verificationStatus === 'pending' ? theme.colors.warning :
                           theme.colors.onMuted;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Photo Carousel */}
      {profile.photos && profile.photos.length > 0 && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: profile.photos[0] }}
            style={styles.photo}
            resizeMode="cover"
          />
          {profile.photos.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{profile.photos.length}</Text>
            </View>
          )}
        </View>
      )}

      {/* Main Info */}
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>
              {profile.petName}
            </Text>
            {profile.verificationStatus && (
              <Ionicons
                name={verificationIcon}
                size={16}
                color={verificationColor}
                style={styles.verificationIcon}
              />
            )}
          </View>
          <Text style={[styles.ageBreed, { color: theme.colors.onMuted }]}>
            {profile.age} {profile.age === 1 ? 'year' : 'years'} • {profile.breed}
          </Text>
        </View>

        {/* Compatibility Score */}
        {compatibilityScore !== undefined && (
          <View style={styles.compatibilityContainer}>
            <View style={styles.compatibilityBar}>
              <View
                style={[
                  styles.compatibilityFill,
                  {
                    width: `${compatibilityScore}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.compatibilityText, { color: theme.colors.onMuted }]}>
              {compatibilityScore}% Match
            </Text>
          </View>
        )}

        {/* Personality Tags */}
        {profile.personality && profile.personality.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
            contentContainerStyle={styles.tagsContent}
          >
            {profile.personality.slice(0, 5).map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: theme.colors.onSurface }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <View style={styles.badgesContainer}>
            {profile.badges.map((badge, index) => (
              <View
                key={index}
                style={[
                  styles.badge,
                  {
                    backgroundColor: `${badgeColors[badge] || theme.colors.primary}20`,
                    borderColor: badgeColors[badge] || theme.colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name={badgeIcons[badge] as any}
                  size={12}
                  color={badgeColors[badge] || theme.colors.primary}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: badgeColors[badge] || theme.colors.primary },
                  ]}
                >
                  {badge.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Energy & Sociability */}
        {showFullDetails && (
          <View style={styles.detailsContainer}>
            {profile.energy !== undefined && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.onMuted }]}>
                  Energy:
                </Text>
                <View style={styles.energyBars}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.energyBar,
                        {
                          backgroundColor:
                            level <= profile.energy!
                              ? theme.colors.primary
                              : theme.colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
            {profile.sociability && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.onMuted }]}>
                  Sociability:
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                  {profile.sociability.charAt(0).toUpperCase() + profile.sociability.slice(1)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <Text
            style={[styles.bio, { color: theme.colors.onSurface }]}
            numberOfLines={showFullDetails ? undefined : 2}
          >
            {profile.bio}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 4,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  verificationIcon: {
    marginLeft: 4,
  },
  ageBreed: {
    fontSize: 14,
  },
  compatibilityContainer: {
    marginBottom: 12,
  },
  compatibilityBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tagsContent: {
    paddingRight: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  energyBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  energyBar: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
});

