import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface HelpContactCardProps {
  onPress: () => void;
}

export const HelpContactCard: React.FC<HelpContactCardProps> = ({ onPress }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView
        intensity={20}
        style={StyleSheet.flatten([styles.contactCard])}
      >
        <View style={styles.contactContent}>
          <Ionicons name="mail-outline" size={24} color={theme.colors.info} />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactDescription}>support@pawfectmatch.com</Text>
          </View>
          <Ionicons name="open-outline" size={20} color={theme.colors.onPrimary} style={{ marginLeft: 8 }} />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    contactCard: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      padding: 16,
    },
    contactContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactText: {
      flex: 1,
      marginLeft: 16,
    },
    contactTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
      marginBottom: 4,
    },
    contactDescription: {
      fontSize: 14,
      color: theme.colors.onPrimary,
    },
  });
}
