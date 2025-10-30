import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@mobile/theme";
import type { AppTheme } from "@mobile/theme";
import type { RootStackScreenProps } from "../navigation/types";
import { useMemoryWeaveScreen } from "../hooks/screens/useMemoryWeaveScreen";
import { useReduceMotion } from "../hooks/useReducedMotion";

// Import extracted components
// import { MemoryCard, ConnectionPath } from "../components/library";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MemoryNode {
  id: string;
  type: "text" | "image" | "video" | "location";
  content: string;
  title: string;
  timestamp: string;
  metadata?: {
    location?: string;
    participants?: string[];
    emotion?: "happy" | "excited" | "love" | "playful";
  };
}

type MemoryWeaveScreenProps = RootStackScreenProps<"MemoryWeave">;

export default function MemoryWeaveScreen({
  navigation,
  route,
}: MemoryWeaveScreenProps) {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const styles = makeStyles(theme);
  
  // Use the extracted hook for all business logic
  const {
    memories,
    currentIndex,
    scrollX,
    fadeAnim,
    scaleAnim,
    scrollViewRef,
    scrollToIndex,
    handleScroll,
    getEmotionColor,
    getEmotionEmoji,
    formatTimestamp,
    petName,
  } = useMemoryWeaveScreen(route.params ? { params: route.params } : { params: undefined });

  const isAnimating = false; // Not used in current implementation

  const renderMemoryCard = (memory: MemoryNode, index: number) => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const scale = reducedMotion ? 1 : scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const rotateY = reducedMotion ? "0deg" : scrollX.interpolate({
      inputRange,
      outputRange: ["45deg", "0deg", "-45deg"],
      extrapolate: "clamp",
    });

    const opacity = reducedMotion ? 1 : scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={memory.id}
        style={StyleSheet.flatten([
          styles.memoryCard,
          {
            transform: [{ scale }, { perspective: 1000 }, { rotateY }],
            opacity,
          },
        ])}
      >
        <LinearGradient
          colors={[
            theme.colors.overlay || `${theme.colors.surface}80`,
            theme.colors.overlay || `${theme.colors.surface}30`,
          ]}
          style={styles.cardGradient}
        >
          <BlurView intensity={20} style={styles.cardBlur}>
            {/* Memory Header */}
            <View style={styles.memoryHeader}>
              <View style={styles.memoryTitleContainer}>
                <Text style={styles.memoryTitle}>{memory.title}</Text>
                <Text style={styles.memoryTimestamp}>
                  {formatTimestamp(memory.timestamp)}
                </Text>
              </View>
              <View
                style={StyleSheet.flatten([
                  styles.emotionBadge,
                  {
                    backgroundColor: `${getEmotionColor(memory.metadata?.emotion)}30`,
                  },
                ])}
              >
                <Text style={styles.emotionEmoji}>
                  {getEmotionEmoji(memory.metadata?.emotion)}
                </Text>
              </View>
            </View>

            {/* Memory Content */}
            <View style={styles.memoryContent}>
              {memory.type === "image" ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: memory.content }}
                    style={styles.memoryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={[
                      "transparent",
                      theme.colors.overlay || `${theme.palette.neutral[950]}4D`,
                    ]}
                    style={styles.imageOverlay}
                  />
                </View>
              ) : (
                <ScrollView
                  style={styles.textContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.memoryText}>"{memory.content}"</Text>
                </ScrollView>
              )}
            </View>

            {/* Memory Metadata */}
            {memory.metadata && (
              <View style={styles.memoryMetadata}>
                {memory.metadata.location && (
                  <View style={styles.metadataItem}>
                    <Ionicons name="location-outline" size={14} color={theme.colors.onSurface} />
                    <Text style={styles.metadataText}>
                      {memory.metadata.location}
                    </Text>
                  </View>
                )}
                {memory.metadata.participants && (
                  <View style={styles.metadataItem}>
                    <Ionicons name="people-outline" size={14} color={theme.colors.onSurface} />
                    <Text style={styles.metadataText}>
                      {memory.metadata.participants.join(" & ")}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderConnectionPath = () => {
    const pathPoints = memories.map((_, index) => {
      const x = (index / (memories.length - 1)) * (screenWidth - 80) + 40;
      const y = screenHeight * 0.85;
      return { x, y };
    });

    return (
      <View style={styles.connectionPath}>
        {pathPoints.map((point, index) => {
          if (index === pathPoints.length - 1) return null;

          const nextPoint = pathPoints[index + 1];
          if (!nextPoint) return null;

          const distance = Math.sqrt(
            Math.pow(nextPoint.x - point.x, 2) +
              Math.pow(nextPoint.y - point.y, 2),
          );
          const angle =
            (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180) /
            Math.PI;

          return (
            <View
              key={index}
              style={StyleSheet.flatten([
                styles.pathSegment,
                {
                  left: point.x,
                  top: point.y,
                  width: distance,
                  transform: [{ rotate: `${angle}deg` }],
                  opacity: index <= currentIndex ? 1 : 0.3,
                },
              ])}
            />
          );
        })}

        {pathPoints.map((point, index) => (
            <TouchableOpacity
              key={`dot-${index}`}
              style={StyleSheet.flatten([
                styles.pathDot,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.onSurface,
                  transform: [{ scale: index === currentIndex ? (reducedMotion ? 1 : 1.2) : 1 }],
                },
              ])}
              testID={`memory-dot-${index}`}
              accessibilityLabel={`Go to memory ${index + 1} of ${memories.length}`}
              accessibilityRole="button"
              onPress={() => {
                scrollToIndex(index);
              }}
            />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          theme.palette.neutral[950],
          theme.palette.neutral[900],
          theme.palette.neutral[800],
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Animated.View
          style={StyleSheet.flatten([
            styles.headerContent,
            { opacity: fadeAnim },
          ])}
        >
          <TouchableOpacity
            style={styles.backButton}
            testID="MemoryWeaveScreen-back-button"
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Memory Weave</Text>
            <Text style={styles.headerSubtitle}>{petName}</Text>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            testID="MemoryWeaveScreen-share-button"
            accessibilityLabel="Share memory weave"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Share functionality
            }}
          >
            <BlurView intensity={20} style={styles.shareButtonBlur}>
              <Ionicons name="share-outline" size={24} color={theme.colors.onSurface} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Memory Cards */}
      <Animated.View
        style={StyleSheet.flatten([
          styles.cardsContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ])}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            scrollX.setValue(offsetX);
            handleScroll && handleScroll(event);
          }}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="center"
        >
          {memories.map((memory, index) => renderMemoryCard(memory, index))}
        </ScrollView>
      </Animated.View>

      {/* Connection Path */}
      <Animated.View
        style={StyleSheet.flatten([
          styles.pathContainer,
          { opacity: fadeAnim },
        ])}
      >
        {renderConnectionPath()}
      </Animated.View>

      {/* Memory Counter */}
      <Animated.View
        style={StyleSheet.flatten([
          styles.counterContainer,
          { opacity: fadeAnim },
        ])}
      >
        <BlurView intensity={20} style={styles.counterBlur}>
          <Text style={styles.counterText}>
            {currentIndex + 1} of {memories.length}
          </Text>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg + theme.spacing.xs,
    paddingTop: theme.spacing.sm + theme.spacing.xs / 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.full,
    overflow: "hidden",
  },
  backButtonBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.typography.h2.size,
    fontWeight: theme.typography.h1.weight,
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    fontSize: theme.typography.body.size * 0.875,
    color: theme.colors.onMuted,
    marginTop: theme.spacing.xs / 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.full,
    overflow: "hidden",
  },
  shareButtonBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardsContainer: {
    flex: 1,
    paddingTop: theme.spacing['2xl'] + theme.spacing.xs,
  },
  memoryCard: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
    marginHorizontal: screenWidth * 0.075,
    borderRadius: theme.radii.xl,
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    borderRadius: theme.radii.xl,
  },
  cardBlur: {
    flex: 1,
    padding: theme.spacing.lg + theme.spacing.xs,
  },
  memoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg + theme.spacing.xs,
  },
  memoryTitleContainer: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: theme.typography.h2.size * 1.2,
    fontWeight: theme.typography.h1.weight,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  memoryTimestamp: {
    fontSize: theme.typography.body.size * 0.875,
    color: theme.colors.onMuted,
  },
  emotionBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginStart: theme.spacing.md,
  },
  emotionEmoji: {
    fontSize: theme.typography.body.size * 1.25,
  },
  memoryContent: {
    flex: 1,
    marginBottom: theme.spacing.lg + theme.spacing.xs,
  },
  imageContainer: {
    flex: 1,
    borderRadius: theme.radii.lg,
    overflow: "hidden",
  },
  memoryImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  textContainer: {
    flex: 1,
  },
  memoryText: {
    fontSize: theme.typography.body.size * 1.125,
    color: theme.colors.onSurface,
    lineHeight: theme.typography.body.lineHeight * 1.625,
    fontStyle: "italic",
    textAlign: "center",
  },
  memoryMetadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    opacity: 0.7,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.lg,
  },
  metadataText: {
    fontSize: theme.typography.body.size * 0.75,
    color: theme.colors.onSurface,
    marginStart: theme.spacing.xs,
  },
  pathContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    height: 40,
  },
  connectionPath: {
    flex: 1,
    position: "relative",
  },
  pathSegment: {
    position: "absolute",
    height: 2,
    backgroundColor: theme.colors.onSurface,
    opacity: 0.3,
  },
  pathDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: theme.radii.xs + theme.radii.xs / 2,
    borderWidth: 2,
    borderColor: theme.colors.onSurface,
  },
  counterContainer: {
    position: "absolute",
    bottom: theme.spacing['2xl'] + theme.spacing.xs,
    alignSelf: "center",
    borderRadius: theme.radii.xl,
    overflow: "hidden",
  },
  counterBlur: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  counterText: {
    fontSize: theme.typography.body.size * 0.875,
    color: theme.colors.onSurface,
    fontWeight: theme.typography.h2.weight,
  },
});
