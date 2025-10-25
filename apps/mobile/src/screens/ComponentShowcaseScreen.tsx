/**
 * PROJECT HYPERION: COMPONENT SHOWCASE SCREEN
 *
 * Comprehensive demonstration of all new architecture components.
 * This screen showcases the power and flexibility of the new system.
 */

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert, Dimensions } from "react-native";

// Import new architecture components
import {
  Theme,
  EliteButton,
  EliteButtonPresets,
  FXContainer,
  FXContainerPresets,
  ModernSwipeCard,
  ModernPhotoUpload,
  PerformanceTestSuite,
  Heading1,
  Heading2,
  Heading3,
  Body,
  BodySmall,
  Label,
  useStaggeredAnimation,
  useEntranceAnimation,
} from "../components";

// Import legacy components for comparison
import { EliteContainer, EliteHeader } from "../components/EliteComponents";
import { getTextColor } from "../../theme/helpers";

type RootStackParamList = {
  ComponentShowcase: undefined;
  Home: undefined;
};

type ComponentShowcaseScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ComponentShowcase"
>;

// Mock data for demonstration
const mockPet = {
  _id: "1",
  id: "1",
  name: "Luna",
  species: "Dog",
  breed: "Golden Retriever",
  age: 3,
  description:
    "A friendly and energetic golden retriever who loves playing fetch and going on long walks.",
  bio: "A friendly and energetic golden retriever who loves playing fetch and going on long walks.",
  photos: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
  ],
  location: "San Francisco, CA",
  distance: 2.5,
  compatibility: 95,
  isVerified: true,
  owner: {
    name: "Sarah Johnson",
    verified: true,
  },
  tags: ["Friendly", "Playful", "Good with kids", "House trained"],
};

const mockPhotos = [
  {
    id: "1",
    uri: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
  },
  {
    id: "2",
    uri: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
  },
];

export default function ComponentShowcaseScreen({
  navigation,
}: ComponentShowcaseScreenProps) {
  const [_selectedButton, setSelectedButton] = useState<string>("");
  const [_selectedContainer, setSelectedContainer] = useState<string>("");
  const [photos, setPhotos] = useState(mockPhotos);
  const [isLoading, setIsLoading] = useState(false);

  // Animation hooks
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(
      8, // Number of sections
      100,
      "gentle",
    );

  const { start: startEntranceAnimation, animatedStyle: entranceStyle } =
    useEntranceAnimation("fadeInUp", 0, "bouncy");

  // Start animations
  React.useEffect(() => {
    startStaggeredAnimation();
    startEntranceAnimation();
  }, [startStaggeredAnimation, startEntranceAnimation]);

  // Event handlers
  const handleButtonPress = useCallback(
    (buttonName: string) => {
      setSelectedButton(buttonName);
      Alert.alert("Button Pressed", `${buttonName} button was pressed!`);
    },
    [setSelectedButton],
  );

  const _handleContainerPress = useCallback(
    (containerName: string) => {
      setSelectedContainer(containerName);
      Alert.alert(
        "Container Pressed",
        `${containerName} container was pressed!`,
      );
    },
    [setSelectedContainer],
  );

  const handleSwipeLeft = useCallback(() => {
    Alert.alert("Swipe Left", "You swiped left on Luna!");
  }, []);

  const handleSwipeRight = useCallback(() => {
    Alert.alert("Swipe Right", "You swiped right on Luna!");
  }, []);

  const handleSwipeUp = useCallback(() => {
    Alert.alert("Swipe Up", "You swiped up on Luna!");
  }, []);

  const handleLoadingTest = useCallback(async () => {
    setIsLoading(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    Alert.alert("Loading Complete", "The loading animation has finished!");
  }, [setIsLoading]);

  return (
    <EliteContainer gradient="primary">
      <EliteHeader
        title="Component Showcase"
        subtitle="Experience the new architecture"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[getAnimatedStyle(0), entranceStyle]}>
          <FXContainerPresets.holographic style={styles.heroSection}>
            <Heading1 style={styles.heroTitle}>Project Hyperion</Heading1>
            <Body style={styles.heroSubtitle}>
              Experience the future of mobile UI with our new component
              architecture
            </Body>
          </FXContainerPresets.holographic>
        </View>

        {/* Button Showcase */}
        <View style={getAnimatedStyle(1)}>
          <FXContainerPresets.glass style={styles.section}>
            <Heading2 style={styles.sectionTitle}>EliteButton System</Heading2>
            <BodySmall style={styles.sectionSubtitle}>
              Composable buttons with premium effects
            </BodySmall>

            <View style={styles.buttonGrid}>
              {/* Basic Variants */}
              <View style={styles.buttonGroup}>
                <Label style={styles.buttonGroupTitle}>Basic Variants</Label>
                <EliteButton
                  title="Primary"
                  variant="primary"
                  size="md"
                  onPress={() => {
                    handleButtonPress("Primary");
                  }}
                />
                <EliteButton
                  title="Secondary"
                  variant="secondary"
                  size="md"
                  onPress={() => {
                    handleButtonPress("Secondary");
                  }}
                />
                <EliteButton
                  title="Outline"
                  variant="outline"
                  size="md"
                  onPress={() => {
                    handleButtonPress("Outline");
                  }}
                />
              </View>

              {/* Effect Variants */}
              <View style={styles.buttonGroup}>
                <Label style={styles.buttonGroupTitle}>With Effects</Label>
                <EliteButton
                  title="Glow Effect"
                  variant="primary"
                  size="md"
                  glowEffect={true}
                  onPress={() => {
                    handleButtonPress("Glow Effect");
                  }}
                />
                <EliteButton
                  title="Magnetic"
                  variant="secondary"
                  size="md"
                  magneticEffect={true}
                  onPress={() => {
                    handleButtonPress("Magnetic");
                  }}
                />
                <EliteButton
                  title="Shimmer"
                  variant="primary"
                  size="md"
                  shimmerEffect={true}
                  onPress={() => {
                    handleButtonPress("Shimmer");
                  }}
                />
              </View>

              {/* Preset Buttons */}
              <View style={styles.buttonGroup}>
                <Label style={styles.buttonGroupTitle}>Premium Presets</Label>
                <EliteButtonPresets.holographic
                  title="Holographic"
                  size="md"
                  onPress={() => {
                    handleButtonPress("Holographic");
                  }}
                />
                <EliteButtonPresets.glass
                  title="Glass Morphism"
                  size="md"
                  onPress={() => {
                    handleButtonPress("Glass Morphism");
                  }}
                />
                <EliteButton
                  title="Loading Test"
                  variant="primary"
                  size="md"
                  loading={isLoading}
                  onPress={handleLoadingTest}
                />
              </View>
            </View>
          </FXContainerPresets.glass>
        </View>

        {/* Container Showcase */}
        <View style={getAnimatedStyle(2)}>
          <FXContainerPresets.glass style={styles.section}>
            <Heading2 style={styles.sectionTitle}>FXContainer System</Heading2>
            <BodySmall style={styles.sectionSubtitle}>
              Unified visual effects container
            </BodySmall>

            <View style={styles.containerGrid}>
              <FXContainer
                type="glass"
                variant="medium"
                style={styles.demoContainer}
              >
                <Label>Glass Morphism</Label>
                <BodySmall>Backdrop blur with transparency</BodySmall>
              </FXContainer>

              <FXContainer
                type="glow"
                variant="strong"
                style={styles.demoContainer}
              >
                <Label>Glow Effect</Label>
                <BodySmall>Animated glow with color cycling</BodySmall>
              </FXContainer>

              <FXContainer
                type="holographic"
                variant="intense"
                style={styles.demoContainer}
              >
                <Label>Holographic</Label>
                <BodySmall>Shimmer with color animation</BodySmall>
              </FXContainer>
            </View>
          </FXContainerPresets.glass>
        </View>

        {/* Swipe Card Showcase */}
        <View style={getAnimatedStyle(3)}>
          <FXContainerPresets.glass style={styles.section}>
            <Heading2 style={styles.sectionTitle}>ModernSwipeCard</Heading2>
            <BodySmall style={styles.sectionSubtitle}>
              Enhanced swipe interactions with gesture handling
            </BodySmall>

            <View style={styles.swipeCardContainer}>
              <ModernSwipeCard
                pet={mockPet}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                isTopCard={true}
              />
            </View>
          </FXContainerPresets.glass>
        </View>

        {/* Photo Upload Showcase */}
        <View style={getAnimatedStyle(4)}>
          <FXContainerPresets.glass style={styles.section}>
            <Heading2 style={styles.sectionTitle}>ModernPhotoUpload</Heading2>
            <BodySmall style={styles.sectionSubtitle}>
              Premium photo handling with staggered animations
            </BodySmall>

            <ModernPhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={6}
            />
          </FXContainerPresets.glass>
        </View>

        {/* Typography Showcase */}
        <View style={getAnimatedStyle(5)}>
          <FXContainerPresets.glass style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Typography System</Heading2>
            <BodySmall style={styles.sectionSubtitle}>
              Unified typography with semantic components
            </BodySmall>

            <View style={styles.typographyShowcase}>
              <Heading1>Heading 1 - Main Title</Heading1>
              <Heading2>Heading 2 - Section Title</Heading2>
              <Heading3>Heading 3 - Subsection</Heading3>
              <Body>
                Body text - Regular content with proper line height and spacing.
              </Body>
              <BodySmall>
                Body Small - Secondary information and captions.
              </BodySmall>
              <Label>Label - Form labels and UI elements</Label>
            </View>
          </FXContainerPresets.glass>
        </View>

        {/* Performance Testing Suite */}
        <View style={getAnimatedStyle(6)}>
          <PerformanceTestSuite
            onTestComplete={(results) => {
              Alert.alert(
                "Performance Test Complete",
                `Overall Grade: ${results.overallGrade}\nFPS: ${results.animationFPS}\nMemory: ${Math.round(results.memoryUsage / 1024 / 1024)}MB`,
              );
            }}
          />
        </View>

        {/* Architecture Benefits */}
        <View style={getAnimatedStyle(7)}>
          <FXContainerPresets.holographic style={styles.section}>
            <Heading2 style={styles.sectionTitle}>
              Architecture Benefits
            </Heading2>
            <BodySmall style={styles.sectionSubtitle}>
              What makes this system special
            </BodySmall>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Body>✅ 60fps animations guaranteed</Body>
              </View>
              <View style={styles.benefitItem}>
                <Body>✅ Composable architecture</Body>
              </View>
              <View style={styles.benefitItem}>
                <Body>✅ Single source of truth</Body>
              </View>
              <View style={styles.benefitItem}>
                <Body>✅ TypeScript support</Body>
              </View>
              <View style={styles.benefitItem}>
                <Body>✅ Accessibility aware</Body>
              </View>
              <View style={styles.benefitItem}>
                <Body>✅ Performance optimized</Body>
              </View>
            </View>
          </FXContainerPresets.holographic>
        </View>
      </ScrollView>
    </EliteContainer>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing["4xl"],
  },
  heroSection: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    alignItems: "center",
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: Theme.spacing.md,
  },
  heroSubtitle: {
    textAlign: "center",
    color: getTextColor(Theme, "secondary"),
  },
  section: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    marginBottom: Theme.spacing.lg,
    color: getTextColor(Theme, "secondary"),
  },
  buttonGrid: {
    gap: Theme.spacing.lg,
  },
  buttonGroup: {
    gap: Theme.spacing.sm,
  },
  buttonGroupTitle: {
    marginBottom: Theme.spacing.sm,
    color: getTextColor("primary").accent,
  },
  containerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  demoContainer: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - Theme.spacing.xl * 2 - Theme.spacing.md * 2) / 3,
    padding: Theme.spacing.md,
    alignItems: "center",
  },
  swipeCardContainer: {
    height: 600,
    marginHorizontal: -Theme.spacing.md,
  },
  typographyShowcase: {
    gap: Theme.spacing.md,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    color: getTextColor(Theme, "secondary"),
    marginBottom: Theme.spacing.xs,
  },
  metricValue: {
    color: getTextColor("primary").accent,
    fontWeight: Theme.typography.fontWeight.bold,
  },
  benefitsList: {
    gap: Theme.spacing.sm,
  },
  benefitItem: {
    paddingLeft: Theme.spacing.md,
  },
});
