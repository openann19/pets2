import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps): React.JSX.Element {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.bg,
          borderRadius: 16,
          padding: 16,
          margin: 8,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        title: {
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 16,
          textAlign: 'center',
        },
        actionsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
        },
        actionButton: {
          width: 80,
          height: 80,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 4,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        },
        actionText: {
          fontSize: 12,
          fontWeight: '500',
          color: 'white',
          marginTop: 4,
          textAlign: 'center',
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={StyleSheet.flatten([styles.actionButton, { backgroundColor: action.color }])}
            onPress={action.onPress}
          >
            <Ionicons
              name={action.icon}
              size={24}
              color={colors.text}
            />
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
