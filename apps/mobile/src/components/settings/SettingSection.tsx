import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SettingItemComponent } from './SettingItemComponent';

interface SettingItem {
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
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {items.map((item) => (
        <SettingItemComponent
          key={item.id}
          item={item}
          category={category}
          onPress={onItemPress}
          onToggle={onToggle}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Theme.colors.neutral[0],
    borderRadius: 12,
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
