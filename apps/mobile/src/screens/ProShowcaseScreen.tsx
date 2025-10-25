/**
 * 🎨 PRO SHOWCASE SCREEN
 *
 * Demonstration of jaw-dropping pro components
 */

import React from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { HyperText, AuroraBackground, StellarCard3D } from "../components/pro";

const { width, height } = Dimensions.get("window");

export default function ProShowcaseScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <AuroraBackground width={width} height={height} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.section}>
          <HyperText
            variant="display"
            effects={["gradient", "shimmer"]}
            gradientColors={["#ec4899", "#f472b6", "#f9a8d4"]}
            animated
            animationType="fadeInUp"
            animationDuration={800}
          >
            Pawfect Match
          </HyperText>

          <HyperText
            variant="subtitle"
            color="rgba(255,255,255,0.8)"
            animated
            animationType="fadeInUp"
            animationDelay={200}
            style={{ marginTop: 8 }}
          >
            Find loving homes for every pet
          </HyperText>
        </View>

        {/* Card Examples */}
        <View style={styles.section}>
          <HyperText
            variant="h3"
            effects={["gradient"]}
            gradientColors={["#0ea5e9", "#22d3ee", "#a855f7"]}
            animated
            animationType="slideInLeft"
            animationDelay={400}
            style={{ marginBottom: 16 }}
          >
            Interactive 3D Cards
          </HyperText>

          <StellarCard3D
            gradient={["#ec4899", "#f472b6", "#f9a8d4"]}
            glowColor="rgba(236,72,153,0.35)"
          >
            <View>
              <Text style={styles.cardTitle}>Premium Card</Text>
              <Text style={styles.cardText}>Tilt me with your finger!</Text>
              <Text style={styles.cardSubtext}>
                Gesture-driven 3D transforms with gradient borders and moving
                highlights
              </Text>
            </View>
          </StellarCard3D>

          <View style={{ height: 24 }} />

          <StellarCard3D
            gradient={["#0ea5e9", "#22d3ee", "#a855f7"]}
            glowColor="rgba(14,165,233,0.35)"
          >
            <View>
              <Text style={styles.cardTitle}>Another Card</Text>
              <Text style={styles.cardText}>Smooth haptic feedback</Text>
              <Text style={styles.cardSubtext}>
                Each interaction provides subtle haptic feedback for a premium
                feel
              </Text>
            </View>
          </StellarCard3D>
        </View>

        {/* Text Effects */}
        <View style={styles.section}>
          <HyperText
            variant="h3"
            effects={["gradient", "neon"]}
            gradientColors={["#f59e0b", "#f97316", "#fb923c"]}
            glowColor="#f59e0b"
            animated
            animationType="scaleIn"
            animationDelay={600}
            style={{ marginBottom: 16 }}
          >
            Text Effects
          </HyperText>

          <View style={styles.textGrid}>
            <HyperText
              variant="h4"
              effects={["gradient"]}
              gradientColors={["#ec4899", "#f472b6"]}
              animated
              animationType="fadeInUp"
              animationDelay={700}
            >
              Gradient
            </HyperText>

            <HyperText
              variant="h4"
              effects={["gradient", "shimmer"]}
              gradientColors={["#0ea5e9", "#22d3ee"]}
              animated
              animationType="fadeInUp"
              animationDelay={800}
            >
              Shimmer
            </HyperText>

            <HyperText
              variant="h4"
              effects={["gradient", "neon"]}
              gradientColors={["#a855f7", "#c084fc"]}
              glowColor="#a855f7"
              animated
              animationType="fadeInUp"
              animationDelay={900}
            >
              Neon Glow
            </HyperText>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.section, { paddingBottom: 40 }]}>
          <HyperText
            variant="caption"
            color="rgba(255,255,255,0.6)"
            align="center"
            animated
            animationType="fadeInUp"
            animationDelay={1000}
          >
            Built with React Native Reanimated 3 + MaskedView
          </HyperText>
          <HyperText
            variant="caption"
            color="rgba(255,255,255,0.6)"
            align="center"
            animated
            animationType="fadeInUp"
            animationDelay={1100}
            style={{ marginTop: 4 }}
          >
            No Skia required • Production-ready • Theme-integrated
          </HyperText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  section: {
    marginBottom: 32,
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 20,
  },
  textGrid: {
    gap: 16,
  },
});
