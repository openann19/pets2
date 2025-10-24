import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EliteButton } from '../EliteButton';
import { GlowContainer } from '../GlowContainer';
import { PremiumHeading } from '../PremiumHeading';
import { PremiumBody } from '../PremiumBody';

interface EmptyStateProps {
  type: 'error' | 'empty';
  title: string;
  subtitle: string;
  buttonTitle: string;
  onButtonPress: () => void;
}

export function EmptyState({ type, title, subtitle, buttonTitle, onButtonPress }: EmptyStateProps) {
  const isError = type === 'error';
  
  return (
    <View style={styles.emptyContainer}>
      <GlowContainer 
        color={isError ? "error" : "primary"} 
        intensity={isError ? "medium" : "light"} 
        animated={true}
      >
        <Ionicons 
          name={isError ? "alert-circle-outline" : "heart-outline"} 
          size={80} 
          color={isError ? "#ff6b6b" : "#ec4899"} 
        />
      </GlowContainer>
      <PremiumHeading 
        level={2} 
        gradient={isError ? "error" : "primary"} 
        animated={true}
      >
        {title}
      </PremiumHeading>
      <PremiumBody size="base" weight="regular">
        {subtitle}
      </PremiumBody>
      <EliteButton
        title={buttonTitle}
        variant={isError ? "primary" : "secondary"}
        size="lg"
        icon="refresh"
        magnetic={true}
        ripple={true}
        glow={true}
        onPress={onButtonPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
});
