/**
 * Quick Actions Section Component
 * Provides quick navigation to admin features
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    actionsContainer: {
      marginTop: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    actionCard: {
      width: '23%',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      ...theme.shadows.elevation2,
    },
    actionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionTitle: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      textAlign: 'center',
    },
  });
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsSectionProps {
  onNavigate: (screen: string) => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  const actions: QuickAction[] = [
    {
      id: 'users',
      title: 'Users',
      icon: 'people',
      color: colors.primary,
      onPress: () => onNavigate('AdminUsers'),
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'stats-chart',
      color: colors.info,
      onPress: () => onNavigate('AdminAnalytics'),
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'shield',
      color: colors.danger,
      onPress: () => onNavigate('AdminSecurity'),
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: 'cash',
      color: colors.success,
      onPress: () => onNavigate('AdminBilling'),
    },
    {
      id: 'verifications',
      title: 'Verifications',
      icon: 'checkmark-circle',
      color: colors.warning,
      onPress: () => onNavigate('AdminVerifications'),
    },
    {
      id: 'chats',
      title: 'Chats',
      icon: 'chatbubbles',
      color: colors.primary,
      onPress: () => onNavigate('AdminChats'),
    },
    {
      id: 'uploads',
      title: 'Uploads',
      icon: 'cloud-upload',
      color: colors.primary,
      onPress: () => onNavigate('AdminUploads'),
    },
    {
      id: 'services',
      title: 'Services',
      icon: 'server',
      color: colors.info,
      onPress: () => onNavigate('AdminServices'),
    },
    {
      id: 'config',
      title: 'Config',
      icon: 'settings',
      color: colors.warning,
      onPress: () => onNavigate('AdminConfig'),
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'document-text',
      color: colors.danger,
      onPress: () => onNavigate('AdminReports'),
    },
    {
      id: 'logs',
      title: 'Logs',
      icon: 'document-text',
      color: colors.onMuted,
      onPress: () => onNavigate('AdminLogs'),
    },
  ];

  return (
    <View
      style={styles.actionsContainer}
      testID="quick-actions-section"
      accessibilityLabel="Quick actions for admin dashboard"
    >
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={action.onPress}
            testID={`quick-action-${action.id}`}
            accessibilityLabel={action.title}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
              <Ionicons
                name={action.icon as any}
                size={24}
                color={theme.colors.onPrimary}
              />
            </View>
            <Text style={[styles.actionTitle, { color: colors.onSurface }]}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
