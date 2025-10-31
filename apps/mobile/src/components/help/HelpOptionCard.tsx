import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/theme';

import type { HelpOption } from '../../hooks/useHelpSupportData';

interface HelpOptionCardProps {
  option: HelpOption;
  animatedStyle: any;
  onPress: (option: HelpOption) => void;
}

export const HelpOptionCard: React.FC<HelpOptionCardProps> = ({
  option,
  animatedStyle,
  onPress,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <Animated.View style={StyleSheet.flatten([styles.optionCard, animatedStyle])}>
      <TouchableOpacity
        onPress={() => {
          onPress(option);
        }}
      >
        <BlurView
          intensity={20}
          style={styles.optionBlur}
        >
          <View style={styles.optionContent}>
            <View
              style={StyleSheet.flatten([
                styles.optionIcon,
                { backgroundColor: theme.colors.info },
              ])}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color="white"
              />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.6)"
            />
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    optionCard: {
      marginBottom: theme.spacing.md,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
    },
    optionBlur: {
      padding: theme.spacing.md,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      lineHeight: 20,
    },
  });
}
