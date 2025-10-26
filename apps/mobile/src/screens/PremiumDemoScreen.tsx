import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";

// Project Hyperion Components
import ImmersiveCard from "../components/ImmersiveCard";
import InteractiveButton from "../components/InteractiveButton";
import {
  StaggeredFadeInUpList,
  PhysicsBasedScaleIn,
  PageTransition,
  ScrollTrigger,
} from "../components/MotionPrimitives";

// Project Hyperion Design System
import {
  useEntranceAnimation,
  useStaggeredFadeIn,
  useGlowEffect,
} from "../hooks/useMotionSystem";
import { usePremiumDemoScreen } from "../hooks/screens/usePremiumDemoScreen";
import { Theme } from '../theme/unified-theme';

// Import extracted demo components
import {
  ButtonDemo,
  CardDemo,
  AnimationDemo,
  GlassDemo,
} from "../components/premium-demo";

// Define fallback design tokens
const DynamicColors = {
  gradients: {
    primary: ["#007AFF", "#5856D6"],
    secondary: ["#FF3B30", "#FF9500"],
    premium: ["#FFD700", "#FFA500"],
    sunset: ["#FF6B6B", "#FFE66D"],
    ocean: ["#4ECDC4", "#44A08D"],
  },
  glass: {
    colors: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
    locations: [0, 1],
    subtle: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
    },
    medium: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
    },
    strong: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      borderWidth: 1,
    },
  },
};

const EnhancedTypography = {
  effects: {
    gradient: {
      primary: {
        color: "#007AFF",
        fontWeight: "700" as const,
      },
      secondary: {
        color: "#5856D6",
        fontWeight: "700" as const,
      },
    },
    shadow: {
      text: {
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      glow: {
        textShadowColor: "rgba(255, 215, 0, 0.8)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
      },
    },
  },
};

const SemanticColors = {
  premium: {
    gold: "#FFD700",
    platinum: "#E5E4E2",
    diamond: "#B9F2FF",
  },
  interactive: {
    primary: "#007AFF",
    secondary: "#5856D6",
  },
  text: {
    primary: "Theme.colors.neutral[950]",
    secondary: "#666666",
    inverse: "Theme.colors.neutral[0]",
  },
  background: {
    primary: "Theme.colors.neutral[0]",
    secondary: "#F8F9FA",
    dark: "Theme.colors.neutral[950]",
  },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// === PROJECT HYPERION: PREMIUM DEMO SCREEN ===
// Showcases all premium components and features properly wired together

function PremiumDemoScreen(): JSX.Element {
  const {
    activeDemo,
    setActiveDemo,
    handleButtonPress,
    handleCardPress,
    buttonVariants,
    cardVariants,
    gradientNames,
  } = usePremiumDemoScreen();

  // Premium entrance animation
  const headerEntrance = useEntranceAnimation("fadeIn");

  // Staggered animations for demo sections
  const demoItems = [
    { id: "buttons", title: "Interactive Buttons", icon: "⚡" },
    { id: "cards", title: "Immersive Cards", icon: "💎" },
    { id: "animations", title: "Motion System", icon: "🌊" },
    { id: "glass", title: "Glass Morphism", icon: "✨" },
  ];

  const staggeredAnimations = useStaggeredFadeIn(demoItems.length, 150);

  // Glow effect for active demo
  const glowEffect = useGlowEffect(0.8, 2000);

  const renderDemoContent = () => {
    switch (activeDemo) {
      case "buttons":
        return <ButtonDemo onButtonPress={handleButtonPress} />;
      case "cards":
        return <CardDemo onCardPress={handleCardPress} />;
      case "animations":
        return <AnimationDemo />;
      case "glass":
        return <GlassDemo />;
      default:
        return <ButtonDemo onButtonPress={handleButtonPress} />;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}
    >
      <StatusBar barStyle="light-content" />

      {/* Premium Header with Glass Morphism */}
      <LinearGradient
        colors={DynamicColors.gradients.primary}
        locations={DynamicColors.glass.locations}
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
            ...DynamicColors.glass.medium,
          }}
        >
          <PageTransition type="fade" duration={1000}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: SemanticColors.text.inverse,
                textAlign: "center",
                marginBottom: 10,
                ...EnhancedTypography.effects.shadow.glow,
              }}
            >
              Project Hyperion
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Premium Mobile Experience Demo
            </Text>
          </PageTransition>

          {/* Demo Selector Buttons */}
          <StaggeredFadeInUpList delay={200}>
            {demoItems.map((item, index) => (
              <InteractiveButton
                key={item.id}
                title={`${item.icon} ${item.title}`}
                variant={activeDemo === item.id ? "holographic" : "glass"}
                size="md"
                magneticEffect={true}
                glowEffect={activeDemo === item.id}
                gradientName={activeDemo === item.id ? "premium" : undefined}
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
