import React from 'react';
import { View, Text } from 'react-native';

// Project Hyperion Components
import InteractiveButton from '../InteractiveButton';
import { StaggeredFadeInUpList, ScrollTrigger } from '../MotionPrimitives';

// Design tokens
const SemanticColors = {
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
  },
  background: {
    secondary: '#f9fafb',
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

interface ButtonDemoProps {
  onButtonPress: (variant: string) => void;
}

const buttonVariants = [
  'glass',
  'holographic',
  'elevated',
  'minimal',
  'outlined',
  'filled',
] as const;

const gradientNames = ['primary', 'secondary', 'premium', 'sunset', 'ocean'] as const;

export default function ButtonDemo({ onButtonPress }: ButtonDemoProps) {
  const handleButtonPress = (variant: string) => {
    onButtonPress(variant);
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
          Interactive Buttons
        </Text>

        <StaggeredFadeInUpList delay={100}>
          {buttonVariants.map((variant, index) => (
            <View
              key={variant}
              style={{ marginBottom: 20 }}
            >
              <InteractiveButton
                title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`}
                variant={variant as any}
                size="lg"
                magneticEffect={true}
                glowEffect={variant === 'holographic'}
                gradientName={
                  variant === 'holographic' &&
                  gradientNames[index % gradientNames.length] !== 'sunset'
                    ? (gradientNames[index % gradientNames.length] as
                        | 'primary'
                        | 'secondary'
                        | 'premium')
                    : variant === 'holographic'
                      ? 'premium'
                      : undefined
                }
                hapticFeedback={true}
                soundEffect={false}
                onPress={() => {
                  handleButtonPress(variant);
                }}
                style={{ marginBottom: 10 }}
              />

              <InteractiveButton
                title="Loading State"
                variant={variant as any}
                size="md"
                loading={true}
                disabled={false}
                style={{ marginBottom: 10 }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <InteractiveButton
                  title="SM"
                  variant={variant as any}
                  size="sm"
                  onPress={() => {
                    handleButtonPress(`${variant}-sm`);
                  }}
                />
                <InteractiveButton
                  title="MD"
                  variant={variant as any}
                  size="md"
                  onPress={() => {
                    handleButtonPress(`${variant}-md`);
                  }}
                />
                <InteractiveButton
                  title="LG"
                  variant={variant as any}
                  size="lg"
                  onPress={() => {
                    handleButtonPress(`${variant}-lg`);
                  }}
                />
                <InteractiveButton
                  title="XL"
                  variant={variant as any}
                  size="xl"
                  onPress={() => {
                    handleButtonPress(`${variant}-xl`);
                  }}
                />
              </View>
            </View>
          ))}
        </StaggeredFadeInUpList>
      </View>
    </ScrollTrigger>
  );
}
