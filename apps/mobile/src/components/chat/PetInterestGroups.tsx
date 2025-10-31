/**
 * Pet Interest Groups Component
 * Join chat groups based on pet types (dog lovers, cat people, etc.)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';
import type { PetInterestGroup } from '@pawfectmatch/core/types/pet-chat';

interface PetInterestGroupsProps {
  userId: string;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  userGroups?: string[];
}

const POPULAR_GROUPS: PetInterestGroup[] = [
  {
    groupId: 'dog_lovers',
    name: 'Dog Lovers',
    description: 'Connect with fellow dog owners and share tips, stories, and playdates',
    category: 'pet_type',
    memberCount: 1250,
    isPublic: true,
    tags: ['dogs', 'puppies', 'training', 'playdates'],
    icon: '🐕',
  },
  {
    groupId: 'cat_people',
    name: 'Cat People',
    description: 'A community for cat enthusiasts to share advice and experiences',
    category: 'pet_type',
    memberCount: 980,
    isPublic: true,
    tags: ['cats', 'kittens', 'care', 'health'],
    icon: '🐱',
  },
  {
    groupId: 'local_park_meetups',
    name: 'Local Park Meetups',
    description: 'Organize and join pet meetups at local parks',
    category: 'activity',
    memberCount: 456,
    isPublic: true,
    tags: ['meetups', 'parks', 'social', 'outdoor'],
    icon: '🌳',
  },
  {
    groupId: 'rescue_pets',
    name: 'Rescue Pets Community',
    description: 'Support and connect with rescue pet owners',
    category: 'interest',
    memberCount: 789,
    isPublic: true,
    tags: ['rescue', 'adoption', 'support', 'care'],
    icon: '❤️',
  },
  {
    groupId: 'training_tips',
    name: 'Training Tips & Tricks',
    description: 'Share training techniques and get advice from experienced owners',
    category: 'activity',
    memberCount: 623,
    isPublic: true,
    tags: ['training', 'behavior', 'tips', 'education'],
    icon: '🎓',
  },
];

export const PetInterestGroups: React.FC<PetInterestGroupsProps> = ({
  userId: _userId,
  onJoinGroup,
  onLeaveGroup,
  userGroups = [],
}) => {
  const theme = useTheme();
  // @ts-expect-error - State declared for future implementation
  const [groups, setGroups] = useState<PetInterestGroup[]>(POPULAR_GROUPS);
  // @ts-expect-error - State declared for future implementation
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const isMember = (groupId: string) => userGroups.includes(groupId);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Pet Interest Groups
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onMuted }]}>
          Connect with pet owners who share your interests
        </Text>
      </View>

      <ScrollView
        style={styles.groupsList}
        contentContainerStyle={styles.groupsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.map((group) => {
          const member = isMember(group.groupId);
          return (
            <View
              key={group.groupId}
              style={[
                styles.groupCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: member ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <View style={styles.groupHeader}>
                <View style={styles.groupIconContainer}>
                  <Text style={styles.groupIcon}>{group.icon}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupName, { color: theme.colors.onSurface }]}>
                    {group.name}
                  </Text>
                  <Text style={[styles.groupDescription, { color: theme.colors.onMuted }]}>
                    {group.description}
                  </Text>
                </View>
              </View>

              <View style={styles.groupStats}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color={theme.colors.onMuted} />
                  <Text style={[styles.statText, { color: theme.colors.onMuted }]}>
                    {group.memberCount.toLocaleString()} members
                  </Text>
                </View>
                <View style={styles.tagContainer}>
                  {group.tags.slice(0, 3).map((tag, index) => (
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
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  {
                    backgroundColor: member ? theme.colors.surface : theme.colors.primary,
                    borderColor: member ? theme.colors.primary : theme.colors.primary,
                  },
                ]}
                onPress={() => {
                  if (member) {
                    onLeaveGroup(group.groupId);
                  } else {
                    onJoinGroup(group.groupId);
                  }
                }}
              >
                <Ionicons
                  name={member ? 'checkmark-circle' : 'add-circle-outline'}
                  size={18}
                  color={member ? theme.colors.primary : theme.colors.onPrimary}
                />
                <Text
                  style={[
                    styles.joinButtonText,
                    {
                      color: member ? theme.colors.primary : theme.colors.onPrimary,
                    },
                  ]}
                >
                  {member ? 'Joined' : 'Join Group'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  groupsList: {
    flex: 1,
  },
  groupsContent: {
    padding: 16,
    gap: 16,
  },
  groupCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    gap: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIcon: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

