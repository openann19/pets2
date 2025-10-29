import React from 'react';
import { View, Text } from 'react-native';

// Project Hyperion Components
import {
  PhysicsBasedScaleIn,
  StaggeredFadeInUpList,
  PageTransition,
  ScrollTrigger,
} from '../MotionPrimitives';

// Design tokens
const SemanticColors = {
  text: {
    primary: '#1f2937',
  },
  background: {
    secondary: '#f9fafb',
  },
};

const DynamicColors = {
  glass: {
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    },
  },
};

export default function AnimationDemo() {
  return (
    <ScrollTrigger
      animation="slideIn"
      triggerPoint={0.8}
    >
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 30,
            color: SemanticColors.text.primary,
          }}
        >
          Motion System Demo
        </Text>

        {/* Physics-based ScaleIn */}
        <PhysicsBasedScaleIn
          delay={300}
          style={{ marginBottom: 30 }}
        >
          <View
            style={{
              padding: 20,
              backgroundColor: SemanticColors.background.secondary,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: SemanticColors.text.primary }}>
              Physics-Based Scale Animation
            </Text>
          </View>
        </PhysicsBasedScaleIn>

        {/* Staggered List */}
        <StaggeredFadeInUpList
          delay={100}
          style={{ marginBottom: 30 }}
        >
          {['First Item', 'Second Item', 'Third Item', 'Fourth Item'].map((item, index) => (
            <View
              key={index}
              style={{
                padding: 15,
                backgroundColor: SemanticColors.background.secondary,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: SemanticColors.text.primary }}>{item}</Text>
            </View>
          ))}
        </StaggeredFadeInUpList>

        {/* Page Transition Demo */}
        <PageTransition
          type="fade"
          duration={800}
        >
          <View
            style={{
              padding: 20,
              borderRadius: 16,
              alignItems: 'center',
              ...DynamicColors.glass.medium,
            }}
          >
            <Text style={{ fontSize: 16, color: SemanticColors.text.primary }}>
              Page Transition Effect
            </Text>
          </View>
        </PageTransition>
      </View>
    </ScrollTrigger>
  );
}
