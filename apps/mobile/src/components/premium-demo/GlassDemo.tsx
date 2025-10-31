import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Project Hyperion Components
import { ScrollTrigger } from '../MotionPrimitives';

// Design tokens
const SemanticColors = {
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
  },
};

const DynamicColors = {
  gradients: {
    premium: ['#FFD700', '#FFA500'],
  },
  glass: {
    locations: [0, 1],
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
    },
  },
};

export default function GlassDemo() {
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
          Glass Morphism Showcase
        </Text>

        {/* Background with gradient */}
        <LinearGradient
          colors={DynamicColors.gradients.premium}
          locations={DynamicColors.glass.locations}
          style={{
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <BlurView
            intensity={20}
            tint="light"
            style={{
              borderRadius: 16,
              padding: 20,
              ...DynamicColors.glass.strong,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: SemanticColors.text.primary,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              Premium Glass Container
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: SemanticColors.text.secondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Experience layered transparency with backdrop blur effects and subtle border styling
              for a modern, premium look.
            </Text>
          </BlurView>
        </LinearGradient>

        {/* Multiple glass tiers */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {(['subtle', 'medium', 'strong'] as const).map((tier) => (
            <BlurView
              key={tier}
              intensity={tier === 'subtle' ? 10 : tier === 'medium' ? 20 : 30}
              tint="light"
              style={{
                flex: 1,
                marginHorizontal: 5,
                borderRadius: 12,
                padding: 15,
                ...DynamicColors.glass[tier],
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: SemanticColors.text.primary,
                  marginBottom: 5,
                }}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: SemanticColors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Glass Tier
              </Text>
            </BlurView>
          ))}
        </View>
      </View>
    </ScrollTrigger>
  );
}
