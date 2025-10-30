/**
 * 🌍 LANGUAGE SECTION
 * Language switcher component for settings
 */

import { useTheme } from '@mobile/theme';
import { StyleSheet, Text, View } from 'react-native';
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

export function LanguageSection() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Language</Text>
      <View style={styles.sectionContent}>
        <LanguageSwitcher />
      </View>
    </View>
  );
}
