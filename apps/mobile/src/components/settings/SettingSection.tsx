import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { SettingItemComponent } from './SettingItemComponent';

export interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  destructive?: boolean;
}

interface SettingSectionProps {
  title: string;
  items: SettingItem[];
  category?: 'notifications' | 'preferences';
  onItemPress?: (id: string) => void;
  onToggle?: (id: string, value: boolean) => void;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  items,
  category,
  onItemPress,
  onToggle,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sectionSlug = slugify(title);

  return (
    <View
      style={styles.section}
      testID={`settings-section-${sectionSlug}`}
      accessible
      accessibilityLabel={`${title} section`}
    >
      <Text
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={styles.sectionContent}>
        {items.map((item) => (
          <SettingItemComponent
            key={item.id}
            item={item}
            {...(category ? { category } : {})}
            {...(onItemPress ? { onPress: onItemPress } : {})}
            {...(onToggle ? { onToggle } : {})}
          />
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      color: theme.colors.onMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.md,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      shadowColor: theme.colors.overlay,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  });

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'section';
