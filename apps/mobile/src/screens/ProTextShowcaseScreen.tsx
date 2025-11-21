// apps/mobile/src/screens/ProTextShowcaseScreen.tsx
/**
 * ProText Showcase Screen
 * 
 * Interactive gallery of all ProText presets for design QA and selection.
 * Demonstrates GPU-accelerated typography with live preview.
 */

import React, { useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  ProTextHero,
  ProTextPremium,
  ProTextNeon,
  ProTextHolographic,
  ProTextSubtle,
  ProTextGlitch,
  ProTextGold,
  ProTextAurora,
  ProTextPlasma,
  ProTextCrystal,
  ProTextFire,
  ProTextOcean,
  ProTextMidnight,
  ProTextEmerald,
  ProTextRuby,
  ProTextCosmic,
  ProTextPastel,
  ProTextHeroMax,
  ProTextThemeAware,
  ProTextMinimal,
} from "../components";
import Text from "../components/Text";
import { useTheme } from "../theme/useTheme";

type RootStackParamList = {
  ProTextShowcase: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "ProTextShowcase">;

interface PresetDemo {
  name: string;
  component: React.ComponentType<{ fontSrc?: number; children: string }>;
  description: string;
  category: "basic" | "advanced" | "specialty";
}

const PRESETS: PresetDemo[] = [
  // Basic Presets
  {
    name: "Hero",
    component: ProTextHero,
    description: "Jaw-dropping entrance with all effects",
    category: "basic",
  },
  {
    name: "Premium",
    component: ProTextPremium,
    description: "Clean gradient title",
    category: "basic",
  },
  {
    name: "Neon",
    component: ProTextNeon,
    description: "Bright glow effect",
    category: "basic",
  },
  {
    name: "Holographic",
    component: ProTextHolographic,
    description: "Rainbow shimmer",
    category: "basic",
  },
  {
    name: "Subtle",
    component: ProTextSubtle,
    description: "Soft shadow for body",
    category: "basic",
  },
  {
    name: "Glitch",
    component: ProTextGlitch,
    description: "RGB aberration",
    category: "basic",
  },
  {
    name: "Gold",
    component: ProTextGold,
    description: "Luxury metallic",
    category: "basic",
  },
  // Advanced Presets
  {
    name: "Aurora",
    component: ProTextAurora,
    description: "Animated rainbow shimmer",
    category: "advanced",
  },
  {
    name: "Plasma",
    component: ProTextPlasma,
    description: "Vibrant cyber gradient",
    category: "advanced",
  },
  {
    name: "Crystal",
    component: ProTextCrystal,
    description: "Elegant shimmer with glow",
    category: "advanced",
  },
  {
    name: "Fire",
    component: ProTextFire,
    description: "Warm gradient with intense glow",
    category: "advanced",
  },
  {
    name: "Ocean",
    component: ProTextOcean,
    description: "Cool blue gradient",
    category: "advanced",
  },
  {
    name: "Midnight",
    component: ProTextMidnight,
    description: "Dark gradient for dark mode",
    category: "advanced",
  },
  {
    name: "Emerald",
    component: ProTextEmerald,
    description: "Luxury green for success",
    category: "advanced",
  },
  {
    name: "Ruby",
    component: ProTextRuby,
    description: "Rich red for alerts",
    category: "advanced",
  },
  {
    name: "Cosmic",
    component: ProTextCosmic,
    description: "Deep space gradient",
    category: "advanced",
  },
  {
    name: "Pastel",
    component: ProTextPastel,
    description: "Soft multi-color",
    category: "advanced",
  },
  // Specialty
  {
    name: "HeroMax",
    component: ProTextHeroMax,
    description: "Maximum impact with all effects",
    category: "specialty",
  },
  {
    name: "ThemeAware",
    component: ProTextThemeAware,
    description: "Adapts to theme colors",
    category: "specialty",
  },
  {
    name: "Minimal",
    component: ProTextMinimal,
    description: "Performance-optimized",
    category: "specialty",
  },
];

export default function ProTextShowcaseScreen(_props: Props) {
  const { colors } = useTheme();
  const [fontsEnabled, setFontsEnabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "basic" | "advanced" | "specialty"
  >("all");

  const fontSrc: number | undefined = fontsEnabled
    ? (require("../assets/fonts/Inter-Bold.ttf") as number)
    : undefined;

  const filteredPresets =
    selectedCategory === "all"
      ? PRESETS
      : PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" weight="bold" style={styles.title}>
            ProText Showcase
          </Text>
          <Text variant="body" style={[styles.subtitle, { color: colors.textMuted }]}>
            GPU-accelerated typography presets
          </Text>
        </View>

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: colors.surface }]}>
          <View style={styles.controlRow}>
            <Text variant="body" weight="medium">
              Enable Fonts
            </Text>
            <Switch
              value={fontsEnabled}
              onValueChange={setFontsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.categoryButtons}>
            {(["all", "basic", "advanced", "specialty"] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      selectedCategory === cat ? colors.primary : colors.surfaceMuted,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                }}
              >
                <Text
                  variant="caption"
                  weight="semibold"
                  style={{
                    color:
                      selectedCategory === cat
                        ? colors.primaryForeground
                        : colors.text,
                  }}
                >
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Presets Gallery */}
        <View style={styles.gallery}>
          {filteredPresets.map((preset) => {
            const PresetComponent = preset.component;
            return (
              <View
                key={preset.name}
                style={[styles.presetCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.presetHeader}>
                  <Text variant="caption" weight="semibold" style={{ color: colors.primary }}>
                    {preset.name}
                  </Text>
                  <Text variant="caption" style={{ color: colors.textMuted }}>
                    {preset.category}
                  </Text>
                </View>

                <View style={styles.presetPreview}>
                  <PresetComponent fontSrc={fontSrc}>
                    {preset.name}
                  </PresetComponent>
                </View>

                <Text
                  variant="caption"
                  style={[styles.presetDescription, { color: colors.textMuted }]}
                >
                  {preset.description}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer Info */}
        <View style={[styles.footer, { backgroundColor: colors.surfaceMuted }]}>
          <Text variant="caption" style={{ color: colors.textMuted, textAlign: "center" }}>
            All effects run on GPU via @shopify/react-native-skia
          </Text>
          <Text variant="caption" style={{ color: colors.textMuted, textAlign: "center" }}>
            Toggle fonts to see graceful fallback chain
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  controls: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  gallery: {
    gap: 16,
  },
  presetCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  presetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  presetPreview: {
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  presetDescription: {
    opacity: 0.7,
  },
  footer: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
});
