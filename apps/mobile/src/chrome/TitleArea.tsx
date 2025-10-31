/**
 * 🎯 TITLE AREA - Header title and subtitle
 * Accessible, semantic, responsive
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function TitleArea({ title, subtitle }: Props) {
  const theme = useTheme() as AppTheme;
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Text
        accessibilityRole="header"
        style={styles.title}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={styles.subtitle}
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityLabel={`Subtitle: ${subtitle}`}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingRight: theme.spacing.sm,
    },
    title: {
      color: theme.colors.onSurface,
      fontWeight: '800',
      fontSize: 18,
      lineHeight: 22,
    },
    subtitle: {
      color: theme.colors.onMuted,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 2,
    },
  });

