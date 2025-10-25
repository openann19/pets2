/**
 * PROJECT HYPERION: MIGRATION EXAMPLE SCREEN
 *
 * This screen demonstrates how to gradually migrate from legacy components
 * to the new architecture. It shows both old and new approaches side by side
 * for easy comparison and gradual migration.
 */

import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

// Import both old and new components
import {
  // New architecture
  Theme,
  EliteButton,
  EliteButtonPresets,
  FXContainer,
  FXContainerPresets,
  ModernText,
  Heading1,
  Heading2,
  Body,
  useStaggeredAnimation,
  useEntranceAnimation,
} from "../components";

// Legacy components (to be migrated)
import { EliteContainer, EliteHeader } from "../components/EliteComponents";
import { EliteButton as LegacyEliteButton } from "../components/EliteComponents";
import { getTextColorString } from "../theme/helpers";

export default function MigrationExampleScreen() {
  const [useNewArchitecture, setUseNewArchitecture] = useState(true);
  const [selectedExample, setSelectedExample] = useState<
    "buttons" | "containers" | "typography"
  >("buttons");

  // Animation hooks
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(3, 100);

  const { start: startEntrance, animatedStyle: entranceStyle } =
    useEntranceAnimation("fadeInUp", 0);

  React.useEffect(() => {
    startStaggeredAnimation();
    startEntrance();
  }, [startStaggeredAnimation, startEntrance]);

  const renderButtonExamples = () => (
    <View style={styles.exampleSection}>
      <Heading2 style={styles.exampleTitle}>
        {useNewArchitecture ? "New Architecture" : "Legacy Architecture"}
      </Heading2>

      {useNewArchitecture ? (
        // NEW ARCHITECTURE - Composition Pattern
        <View style={styles.buttonGrid}>
          <View style={getAnimatedStyle(0)}>
            <EliteButtonPresets.premium
              title="Premium Button"
              leftIcon="star"
              onPress={() => {
                logger.info("Premium pressed");
              }}
            />
          </View>

          <View style={getAnimatedStyle(1)}>
            <EliteButtonPresets.holographic
              title="Holographic"
              leftIcon="sparkles"
              onPress={() => {
                logger.info("Holographic pressed");
              }}
            />
          </View>

          <View style={getAnimatedStyle(2)}>
            <EliteButtonPresets.magnetic
              title="Magnetic"
              leftIcon="magnet"
              onPress={() => {
                logger.info("Magnetic pressed");
              }}
            />
          </View>
        </View>
      ) : (
        // LEGACY ARCHITECTURE - Monolithic Pattern
        <View style={styles.buttonGrid}>
          <View style={getAnimatedStyle(0)}>
            <LegacyEliteButton
              title="Premium Button"
              variant="primary"
              size="md"
              leftIcon="star"
              magneticEffect={true}
              rippleEffect={true}
              glowEffect={true}
              onPress={() => {
                logger.info("Legacy premium pressed");
              }}
            />
          </View>

          <View style={getAnimatedStyle(1)}>
            <LegacyEliteButton
              title="Holographic"
              variant="holographic"
              size="md"
              leftIcon="sparkles"
              magneticEffect={true}
              rippleEffect={true}
              glowEffect={true}
              shimmerEffect={true}
              onPress={() => {
                logger.info("Legacy holographic pressed");
              }}
            />
          </View>

          <View style={getAnimatedStyle(2)}>
            <LegacyEliteButton
              title="Magnetic"
              variant="primary"
              size="md"
              leftIcon="magnet"
              magneticEffect={true}
              rippleEffect={true}
              glowEffect={true}
              onPress={() => {
                logger.info("Legacy magnetic pressed");
              }}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderContainerExamples = () => (
    <View style={styles.exampleSection}>
      <Heading2 style={styles.exampleTitle}>
        {useNewArchitecture ? "New Architecture" : "Legacy Architecture"}
      </Heading2>

      {useNewArchitecture ? (
        // NEW ARCHITECTURE - Unified FXContainer
        <View style={styles.containerGrid}>
          <View style={getAnimatedStyle(0)}>
            <FXContainerPresets.glass style={styles.exampleContainer}>
              <Body>Glass Container</Body>
            </FXContainerPresets.glass>
          </View>

          <View style={getAnimatedStyle(1)}>
            <FXContainerPresets.holographic style={styles.exampleContainer}>
              <Body>Holographic Container</Body>
            </FXContainerPresets.holographic>
          </View>

          <View style={getAnimatedStyle(2)}>
            <FXContainerPresets.glow style={styles.exampleContainer}>
              <Body>Glow Container</Body>
            </FXContainerPresets.glow>
          </View>
        </View>
      ) : (
        // LEGACY ARCHITECTURE - Scattered Containers
        <View style={styles.containerGrid}>
          <View style={getAnimatedStyle(0)}>
            <View style={[styles.legacyContainer, styles.glassContainer]}>
              <Body>Legacy Glass Container</Body>
            </View>
          </View>

          <View style={getAnimatedStyle(1)}>
            <View style={[styles.legacyContainer, styles.holographicContainer]}>
              <Body>Legacy Holographic Container</Body>
            </View>
          </View>

          <View style={getAnimatedStyle(2)}>
            <View style={[styles.legacyContainer, styles.glowContainer]}>
              <Body>Legacy Glow Container</Body>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderTypographyExamples = () => (
    <View style={styles.exampleSection}>
      <Heading2 style={styles.exampleTitle}>
        {useNewArchitecture ? "New Architecture" : "Legacy Architecture"}
      </Heading2>

      {useNewArchitecture ? (
        // NEW ARCHITECTURE - Unified Typography
        <View style={styles.typographyGrid}>
          <View style={getAnimatedStyle(0)}>
            <Heading1>Heading 1</Heading1>
            <Heading2>Heading 2</Heading2>
            <Body>Body text with consistent styling</Body>
            <BodySmall>Small body text</BodySmall>
          </View>

          <View style={getAnimatedStyle(1)}>
            <ModernText variant="h1" gradient="primary">
              Gradient Heading
            </ModernText>
            <ModernText variant="body" gradient="secondary">
              Gradient Body Text
            </ModernText>
          </View>

          <View style={getAnimatedStyle(2)}>
            <ModernText variant="h2" animated={true}>
              Animated Heading
            </ModernText>
            <ModernText variant="body" animated={true}>
              Animated body text
            </ModernText>
          </View>
        </View>
      ) : (
        // LEGACY ARCHITECTURE - Scattered Typography
        <View style={styles.typographyGrid}>
          <View style={getAnimatedStyle(0)}>
            <Text style={styles.legacyHeading1}>Legacy Heading 1</Text>
            <Text style={styles.legacyHeading2}>Legacy Heading 2</Text>
            <Text style={styles.legacyBody}>Legacy body text</Text>
            <Text style={styles.legacyBodySmall}>Legacy small text</Text>
          </View>

          <View style={getAnimatedStyle(1)}>
            <Text style={[styles.legacyHeading1, styles.legacyGradient]}>
              Legacy Gradient Heading
            </Text>
            <Text style={[styles.legacyBody, styles.legacyGradient]}>
              Legacy gradient body text
            </Text>
          </View>

          <View style={getAnimatedStyle(2)}>
            <Text style={styles.legacyHeading2}>Legacy Animated Heading</Text>
            <Text style={styles.legacyBody}>Legacy animated body text</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <EliteContainer gradient="primary">
      <EliteHeader
        title="Migration Example"
        subtitle="Compare old vs new architecture"
        rightComponent={
          <EliteButton
            title={useNewArchitecture ? "Legacy" : "New"}
            variant="outline"
            size="sm"
            leftIcon={useNewArchitecture ? "arrow-back" : "arrow-forward"}
            onPress={() => {
              setUseNewArchitecture(!useNewArchitecture);
            }}
          />
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Architecture Toggle */}
        <View style={styles.toggleSection}>
          <FXContainerPresets.glass style={styles.toggleContainer}>
            <Heading2 style={styles.toggleTitle}>
              Architecture Comparison
            </Heading2>
            <Body style={styles.toggleDescription}>
              Toggle between legacy and new architecture to see the differences.
              The new architecture provides better performance, maintainability,
              and consistency.
            </Body>

            <View style={styles.toggleButtons}>
              <EliteButton
                title="Legacy"
                variant={!useNewArchitecture ? "primary" : "outline"}
                size="sm"
                onPress={() => {
                  setUseNewArchitecture(false);
                }}
              />
              <EliteButton
                title="New Architecture"
                variant={useNewArchitecture ? "primary" : "outline"}
                size="sm"
                onPress={() => {
                  setUseNewArchitecture(true);
                }}
              />
            </View>
          </FXContainerPresets.glass>
        </View>

        {/* Example Selector */}
        <View style={styles.selectorSection}>
          <View style={styles.selectorButtons}>
            {[
              { key: "buttons", label: "Buttons", icon: "radio-button-on" },
              { key: "containers", label: "Containers", icon: "square" },
              { key: "typography", label: "Typography", icon: "text" },
            ].map(({ key, label, icon }) => (
              <EliteButton
                key={key}
                title={label}
                variant={selectedExample === key ? "primary" : "outline"}
                size="sm"
                leftIcon={icon as any}
                onPress={() => {
                  setSelectedExample(key as any);
                }}
              />
            ))}
          </View>
        </View>

        {/* Examples */}
        {selectedExample === "buttons" && renderButtonExamples()}
        {selectedExample === "containers" && renderContainerExamples()}
        {selectedExample === "typography" && renderTypographyExamples()}

        {/* Migration Benefits */}
        <View style={styles.benefitsSection}>
          <FXContainerPresets.glass style={styles.benefitsContainer}>
            <Heading2 style={styles.benefitsTitle}>Migration Benefits</Heading2>

            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={24} color={getPrimaryColor(500)} />
              <View style={styles.benefitContent}>
                <Body style={styles.benefitTitle}>Performance</Body>
                <BodySmall style={styles.benefitDescription}>
                  All animations run on UI thread for guaranteed 60fps
                </BodySmall>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons
                name="construct"
                size={24}
                color={getPrimaryColor(500)}
              />
              <View style={styles.benefitContent}>
                <Body style={styles.benefitTitle}>Maintainability</Body>
                <BodySmall style={styles.benefitDescription}>
                  Single source of truth for design tokens and components
                </BodySmall>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="layers" size={24} color={getPrimaryColor(500)} />
              <View style={styles.benefitContent}>
                <Body style={styles.benefitTitle}>Composition</Body>
                <BodySmall style={styles.benefitDescription}>
                  Build complex components from simple, reusable parts
                </BodySmall>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons
                name="accessibility"
                size={24}
                color={getPrimaryColor(500)}
              />
              <View style={styles.benefitContent}>
                <Body style={styles.benefitTitle}>Accessibility</Body>
                <BodySmall style={styles.benefitDescription}>
                  Built-in accessibility support and reduced motion awareness
                </BodySmall>
              </View>
            </View>
          </FXContainerPresets.glass>
        </View>
      </ScrollView>
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing["4xl"],
  },
  toggleSection: {
    marginBottom: Theme.spacing.xl,
  },
  toggleContainer: {
    padding: Theme.spacing.xl,
  },
  toggleTitle: {
    marginBottom: Theme.spacing.sm,
  },
  toggleDescription: {
    marginBottom: Theme.spacing.lg,
    color: getTextColor(Theme, "secondary"),
  },
  toggleButtons: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  selectorSection: {
    marginBottom: Theme.spacing.xl,
  },
  selectorButtons: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  exampleSection: {
    marginBottom: Theme.spacing.xl,
  },
  exampleTitle: {
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  buttonGrid: {
    gap: Theme.spacing.lg,
  },
  containerGrid: {
    gap: Theme.spacing.lg,
  },
  exampleContainer: {
    padding: Theme.spacing.lg,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  legacyContainer: {
    padding: Theme.spacing.lg,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.depth.md,
  },
  glassContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  holographicContainer: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: getPrimaryColor(500),
  },
  glowContainer: {
    backgroundColor: Theme.colors.neutral[0],
    ...Theme.glow.primary,
  },
  typographyGrid: {
    gap: Theme.spacing.lg,
  },
  legacyHeading1: {
    fontSize: Theme.typography.fontSize["4xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: getTextColor("primary").primary,
    marginBottom: Theme.spacing.sm,
  },
  legacyHeading2: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.semibold,
    color: getTextColor("primary").primary,
    marginBottom: Theme.spacing.sm,
  },
  legacyBody: {
    fontSize: Theme.typography.fontSize.base,
    color: getTextColor("primary").primary,
    marginBottom: Theme.spacing.sm,
  },
  legacyBodySmall: {
    fontSize: Theme.typography.fontSize.sm,
    color: getTextColor(Theme, "secondary"),
    marginBottom: Theme.spacing.sm,
  },
  legacyGradient: {
    // This would be a complex gradient implementation in legacy
    color: getPrimaryColor(500),
  },
  benefitsSection: {
    marginTop: Theme.spacing.xl,
  },
  benefitsContainer: {
    padding: Theme.spacing.xl,
  },
  benefitsTitle: {
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Theme.spacing.lg,
  },
  benefitContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  benefitTitle: {
    fontWeight: Theme.typography.fontWeight.semibold,
    marginBottom: Theme.spacing.xs,
  },
  benefitDescription: {
    color: getTextColor(Theme, "secondary"),
  },
});
