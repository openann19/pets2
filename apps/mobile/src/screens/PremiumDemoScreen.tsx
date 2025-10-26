import { BlurView } from "expo-blur";
import { logger } from "@pawfectmatch/core";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
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
  AnimatedFlatList,
} from "../components/MotionPrimitives";

// Project Hyperion Design System
import {
  useEntranceAnimation,
  useStaggeredFadeIn,
  useGlowEffect,
} from "../hooks/useMotionSystem";

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
    primary: "#000000",
    secondary: "#666666",
    inverse: "#FFFFFF",
  },
  background: {
    primary: "#FFFFFF",
    secondary: "#F8F9FA",
    dark: "#000000",
  },
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// === PROJECT HYPERION: PREMIUM DEMO SCREEN ===
// Showcases all premium components and features properly wired together

function PremiumDemoScreen(): JSX.Element {
  const [activeDemo, setActiveDemo] = useState<
    "buttons" | "cards" | "animations" | "glass"
  >("buttons");

  // Premium entrance animation
  const headerEntrance = useEntranceAnimation("fadeInUp");

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

  // Demo data
  const buttonVariants: Array<
    "primary" | "secondary" | "holographic" | "glass" | "outline"
  > = ["primary", "secondary", "holographic", "glass", "outline"];

  const cardVariants: Array<"default" | "glass" | "holographic" | "elevated"> =
    ["default", "glass", "holographic", "elevated"];

  const gradientNames: Array<keyof typeof DynamicColors.gradients> = [
    "primary",
    "secondary",
    "premium",
    "sunset",
    "ocean",
  ];

  const handleButtonPress = (variant: string) => {
    logger.info(`Pressed ${variant} button`);
    // Add haptic feedback here
  };

  const handleCardPress = (variant: string) => {
    logger.info(`Pressed ${variant} card`);
    // Add haptic feedback here
  };

  const renderButtonDemo = () => (
    <ScrollTrigger animation="fadeInUp" triggerPoint={0.8}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            ...EnhancedTypography.effects.gradient.primary,
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Interactive Buttons
        </Text>

        <StaggeredFadeInUpList delay={100}>
          {buttonVariants.map((variant, index) => (
            <View key={variant} style={{ marginBottom: 20 }}>
              <InteractiveButton
                title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`}
                variant={variant as any}
                size="lg"
                magneticEffect={true}
                glowEffect={variant === "holographic"}
                gradientName={
                  variant === "holographic"
                    ? gradientNames[index % gradientNames.length]
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
                  flexDirection: "row",
                  justifyContent: "space-between",
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

  const renderCardDemo = () => (
    <ScrollTrigger animation="scaleIn" triggerPoint={0.8}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            ...EnhancedTypography.effects.gradient.secondary,
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
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
              shimmerEffect={variant === "holographic"}
              entranceAnimation="scaleIn"
              gradientName={
                variant === "holographic" ? gradientNames[index] : undefined
              }
              glowColor={variant === "elevated" ? "primary" : undefined}
              style={{ marginBottom: 20 }}
              onPress={() => {
                handleCardPress(variant);
              }}
            >
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
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
                  This is a premium {variant} card with advanced visual effects,
                  3D tilt interactions, and smooth animations. Experience the
                  future of mobile UI.
                </Text>
              </View>
            </ImmersiveCard>
          ))}
        </StaggeredFadeInUpList>
      </View>
    </ScrollTrigger>
  );

  const renderAnimationDemo = () => (
    <ScrollTrigger animation="slideInLeft" triggerPoint={0.8}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 30,
            color: SemanticColors.text.primary,
          }}
        >
          Motion System Demo
        </Text>

        {/* Physics-based ScaleIn */}
        <PhysicsBasedScaleIn delay={300} style={{ marginBottom: 30 }}>
          <View
            style={{
              padding: 20,
              backgroundColor: SemanticColors.background.secondary,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: SemanticColors.text.primary }}>
              Physics-Based Scale Animation
            </Text>
          </View>
        </PhysicsBasedScaleIn>

        {/* Staggered List */}
        <StaggeredFadeInUpList delay={100} style={{ marginBottom: 30 }}>
          {["First Item", "Second Item", "Third Item", "Fourth Item"].map(
            (item, index) => (
              <View
                key={index}
                style={{
                  padding: 15,
                  backgroundColor: SemanticColors.background.secondary,
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: SemanticColors.text.primary }}>
                  {item}
                </Text>
              </View>
            ),
          )}
        </StaggeredFadeInUpList>

        {/* Page Transition Demo */}
        <PageTransition type="scale" duration={800}>
          <View
            style={{
              padding: 20,
              backgroundColor: DynamicColors.glass.medium.backgroundColor,
              borderRadius: 16,
              alignItems: "center",
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

  const renderGlassDemo = () => (
    <ScrollTrigger animation="slideInRight" triggerPoint={0.8}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 30,
            color: SemanticColors.text.primary,
          }}
        >
          Glass Morphism Showcase
        </Text>

        {/* Background with gradient */}
        <LinearGradient
          colors={DynamicColors.gradients.premium.colors as any}
          locations={DynamicColors.gradients.premium.locations}
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
                fontWeight: "600",
                color: SemanticColors.text.primary,
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Premium Glass Container
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: SemanticColors.text.secondary,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Experience layered transparency with backdrop blur effects and
              subtle border styling for a modern, premium look.
            </Text>
          </BlurView>
        </LinearGradient>

        {/* Multiple glass tiers */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {(["subtle", "medium", "strong"] as const).map((tier) => (
            <BlurView
              key={tier}
              intensity={tier === "subtle" ? 10 : tier === "medium" ? 20 : 30}
              tint="light"
              style={{
                flex: 1,
                marginHorizontal: 5,
                borderRadius: 12,
                padding: 15,
                ...DynamicColors.glass[tier],
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
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
                  textAlign: "center",
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

  const renderDemoContent = () => {
    switch (activeDemo) {
      case "buttons":
        return renderButtonDemo();
      case "cards":
        return renderCardDemo();
      case "animations":
        return renderAnimationDemo();
      case "glass":
        return renderGlassDemo();
      default:
        return renderButtonDemo();
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}
    >
      <StatusBar barStyle="light-content" />

      {/* Premium Header with Glass Morphism */}
      <LinearGradient
        colors={DynamicColors.gradients.primary.colors as any}
        locations={DynamicColors.gradients.primary.locations}
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
