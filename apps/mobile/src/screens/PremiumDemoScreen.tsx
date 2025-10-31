import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';

// Project Hyperion Components
import InteractiveButton from '../components/InteractiveButton';
import { PageTransition, StaggeredFadeInUpList } from '../components/MotionPrimitives';

// Project Hyperion Design System
import { useTheme } from '@mobile/theme';
import { usePremiumDemoScreen } from '../hooks/screens/usePremiumDemoScreen';

// Import extracted demo components
// Demo components not available

// Define theme-aware design tokens


const SemanticColors = (theme: ReturnType<typeof useTheme>) => ({
  premium: {
    gold: theme.colors.warning,
    platinum: theme.colors.surface,
    diamond: theme.colors.info,
  },
  interactive: {
    primary: theme.colors.primary,
  },
  text: {
    primary: theme.colors.onSurface,
    secondary: theme.colors.onMuted,
    inverse: theme.colors.onBg,
  },
  background: {
    primary: theme.colors.bg,
    secondary: theme.colors.surface,
    dark: theme.colors.onSurface,
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
        return (
          <View style={{ height: 50, backgroundColor: 'lightgreen', borderRadius: 8 }}>
            <Text onPress={handleButtonPress}>Button Demo</Text>
          </View>
        );
      case 'cards':
        return (
          <View style={{ height: 80, backgroundColor: 'lightyellow', borderRadius: 8 }}>
            <Text onPress={handleCardPress}>Card Demo</Text>
          </View>
        );
      case 'animations':
        return <View style={{ height: 100, backgroundColor: 'lightblue', borderRadius: 8 }} />;
      case 'glass':
        return <View style={{ height: 70, backgroundColor: 'lightpink', borderRadius: 8 }} />;
      default:
        return (
          <View style={{ height: 50, backgroundColor: 'lightgreen', borderRadius: 8 }}>
            <Text onPress={handleButtonPress}>Button Demo</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SemanticColors(theme).background.primary }}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header with Glass Morphism */}
      <LinearGradient
        colors={theme.palette.gradients.primary || [theme.colors.primary, theme.colors.info]}
        locations={[0, 1]}
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 20,
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
                textShadowColor: theme.colors.primary,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
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
