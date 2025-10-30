/**
 * 👤 PROFILE SUMMARY SECTION
 * Extracted from SettingsScreen
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AdvancedCard, CardConfigs } from '../../components/Advanced/AdvancedCard';

import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface ProfileSummarySectionProps {
  onEditProfile: () => void;
}

export function ProfileSummarySection({ onEditProfile }: ProfileSummarySectionProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  
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
            <Ionicons
              name="person"
              size={32}
              color={theme.colors.onMuted}
            />
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

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
  profileSection: {
    padding: 20,
    paddingBottom: 0,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.colors.bg,
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
    backgroundColor: theme.colors.border,
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
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.onMuted,
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
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.onMuted,
    fontWeight: '500',
  },
  });
}

