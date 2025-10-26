/**
 * 👤 PROFILE SUMMARY SECTION
 * Extracted from SettingsScreen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AdvancedCard, CardConfigs } from '../../components/Advanced/AdvancedCard';

interface ProfileSummarySectionProps {
  onEditProfile: () => void;
}

export function ProfileSummarySection({ onEditProfile }: ProfileSummarySectionProps) {
  return (
    <View style={styles.profileSection}>
      <AdvancedCard
        {...CardConfigs.glass({
          interactions: ['hover', 'press', 'glow'],
          haptic: 'light',
          actions: [
            {
              icon: 'pencil',
              title: 'Edit',
              variant: 'minimal',
              onPress: onEditProfile,
            },
          ],
        })}
        style={styles.profileCard}
      >
        <View style={styles.profileCardContent}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#9CA3AF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john@example.com</Text>
            <View style={styles.profileStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Free Plan</Text>
            </View>
          </View>
        </View>
      </AdvancedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    padding: 20,
    paddingBottom: 0,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

