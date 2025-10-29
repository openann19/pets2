import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, ScrollView, StatusBar, Text } from 'react-native';

// Project Hyperion Components
import InteractiveButton from '../components/InteractiveButton';
import { PageTransition, StaggeredFadeInUpList } from '../components/MotionPrimitives';

// Project Hyperion Design System
import { useTheme } from '@mobile/src/theme';
import { usePremiumDemoScreen } from '../hooks/screens/usePremiumDemoScreen';

// Import extracted demo components
import { AnimationDemo, ButtonDemo, CardDemo, GlassDemo } from '../components/premium-demo';

// Define theme-aware design tokens
const DynamicColors = (theme: ReturnType<typeof useTheme>) => ({
  gradients: {
    primary: [theme.colors.primary, theme.colors.primary],
    secondary: [theme.colors.danger, theme.colors.warning],
    premium: [theme.colors.warning, theme.colors.warning],
    sunset: [theme.colors.danger, theme.colors.warning],
    ocean: [theme.colors.success, theme.colors.success],
  },
  glass: {
    colors: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
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
});

const EnhancedTypography = (theme: ReturnType<typeof useTheme>) => ({
  effects: {
    gradient: {
      primary: {
        color: theme.colors.primary,
        fontWeight: '700' as const,
      },
      secondary: {
        color: theme.colors.primary,
        fontWeight: '700' as const,
      },
    },
    shadow: {
      text: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      glow: {
        textShadowColor: 'rgba(255, 215, 0, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
      },
    },
  },
});

const SemanticColors = (theme: ReturnType<typeof useTheme>) => ({
  premium: {
    gold: theme.colors.warning,
    platinum: theme.colors.bg.tertiary,
    diamond: theme.colors.status.info,
  },
  interactive: {
    primary: theme.colors.primary,
    secondary: theme.colors.primary,
  },
  text: {
    primary: theme.colors.onSurface.primary,
    secondary: theme.colors.onSurface.secondary,
    inverse: theme.colors.bg.primary,
  },
  background: {
    primary: theme.colors.bg.primary,
    secondary: theme.colors.bg.secondary,
    dark: theme.colors.onSurface.primary,
  },
});

// === PROJECT HYPERION: PREMIUM DEMO SCREEN ===
// Showcases all premium components and features properly wired together

function PremiumDemoScreen() {
  const theme = useTheme();
  const { activeDemo, setActiveDemo, handleButtonPress, handleCardPress } = usePremiumDemoScreen();

  // Staggered animations for demo sections
  const demoItems = [
    { id: 'buttons', title: 'Interactive Buttons', icon: '⚡' },
    { id: 'cards', title: 'Immersive Cards', icon: '💎' },
    { id: 'animations', title: 'Motion System', icon: '🌊' },
    { id: 'glass', title: 'Glass Morphism', icon: '✨' },
  ];

  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'buttons':
        return <ButtonDemo onButtonPress={handleButtonPress} />;
      case 'cards':
        return <CardDemo onCardPress={handleCardPress} />;
      case 'animations':
        return <AnimationDemo />;
      case 'glass':
        return <GlassDemo />;
      default:
        return <ButtonDemo onButtonPress={handleButtonPress} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SemanticColors(theme).background.primary }}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header with Glass Morphism */}
      <LinearGradient
        colors={DynamicColors(theme).gradients.primary}
        locations={DynamicColors(theme).glass.locations}
        style={{
          paddingTop: 20,
          paddingBottom: 30,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <BlurView
          intensity={15}
          tint="dark"
          style={{
            padding: 20,
            ...DynamicColors(theme).glass.medium,
          }}
        >
          <PageTransition
            type="fade"
            duration={1000}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: '800',
                color: SemanticColors(theme).text.inverse,
                textAlign: 'center',
                marginBottom: 10,
                ...EnhancedTypography(theme).effects.shadow.glow,
              }}
            >
              Project Hyperion
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              Premium Mobile Experience Demo
            </Text>
          </PageTransition>

          {/* Demo Selector Buttons */}
          <StaggeredFadeInUpList delay={200}>
            {demoItems.map((item) => (
              <InteractiveButton
                key={item.id}
                title={`${item.icon} ${item.title}`}
                variant={activeDemo === item.id ? 'holographic' : 'glass'}
                size="md"
                magneticEffect={true}
                glowEffect={activeDemo === item.id}
                gradientName={activeDemo === item.id ? 'premium' : undefined}
                onPress={() => {
                  setActiveDemo(item.id as any);
                }}
                style={{ marginBottom: 10 }}
              />
            ))}
          </StaggeredFadeInUpList>
        </BlurView>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {renderDemoContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

export default PremiumDemoScreen;
