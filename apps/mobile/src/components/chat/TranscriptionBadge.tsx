import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export const TranscriptionBadge = ({ icon, label }: { icon: string; label: string }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.badge}>
      <Ionicons
        name={icon}
        size={12}
        color={theme.colors.primary}
      />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: `${theme.colors.primary}1A`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}40`,
    },
    text: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
}
