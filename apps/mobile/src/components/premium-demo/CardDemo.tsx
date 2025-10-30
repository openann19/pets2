import React from 'react';
import { View, Text } from 'react-native';

// Project Hyperion Components
import ImmersiveCard from '../ImmersiveCard';
import { StaggeredFadeInUpList, ScrollTrigger } from '../MotionPrimitives';

// Design tokens
const SemanticColors = {
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
  },
};

const EnhancedTypography = {
  effects: {
    gradient: {
      secondary: {
        color: '#5856D6',
        fontWeight: '700' as const,
      },
    },
  },
};

interface CardDemoProps {
  onCardPress: (variant: string) => void;
}

const cardVariants = ['glass', 'holographic', 'elevated', 'minimal', 'outlined', 'filled'] as const;

const gradientNames = ['primary', 'secondary', 'premium', 'sunset', 'ocean'] as const;

export default function CardDemo({ onCardPress }: CardDemoProps) {
  const handleCardPress = (variant: string) => {
    onCardPress(variant);
  };

  return (
    <ScrollTrigger
      animation="scaleIn"
      triggerPoint={0.8}
    >
      <View style={{ padding: 20 }}>
        <Text
          style={{
            ...EnhancedTypography.effects.gradient.secondary,
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 30,
          }}
        >
          Immersive Cards
        </Text>

        <StaggeredFadeInUpList delay={150}>
          {cardVariants.map((variant, index) => (
            <ImmersiveCard
              key={variant}
              variant={variant as any}
              size="lg"
              tiltEnabled={true}
              magneticHover={true}
              shimmerEffect={variant === 'holographic'}
              entranceAnimation="scaleIn"
              gradientName={
                variant === 'holographic' &&
                gradientNames[index % gradientNames.length] !== 'sunset' &&
                gradientNames[index % gradientNames.length] !== 'ocean'
                  ? (gradientNames[index % gradientNames.length] as
                      | 'primary'
                      | 'secondary'
                      | 'premium')
                  : variant === 'holographic'
                    ? 'premium'
                    : undefined
              }
              glowColor={variant === 'elevated' ? 'primary' : undefined}
              style={{ marginBottom: 20 }}
              onPress={() => {
                handleCardPress(variant);
              }}
            >
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: SemanticColors.text.primary,
                    marginBottom: 10,
                  }}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)} Card
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: SemanticColors.text.secondary,
                    lineHeight: 20,
                  }}
                >
                  This is a premium {variant} card with advanced visual effects, 3D tilt
                  interactions, and smooth animations. Experience the future of mobile UI.
                </Text>
              </View>
            </ImmersiveCard>
          ))}
        </StaggeredFadeInUpList>
      </View>
    </ScrollTrigger>
  );
}
