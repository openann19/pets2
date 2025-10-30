import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

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
                { backgroundColor: Theme.colors.status.info },
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

const styles = StyleSheet.create({
  optionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionBlur: {
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
