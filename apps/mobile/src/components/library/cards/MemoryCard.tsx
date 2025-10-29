import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

import { useTheme } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface MemoryNode {
  id: string;
  type: 'text' | 'image' | 'video' | 'location';
  content: string;
  title: string;
  timestamp: string;
  metadata?: {
    location?: string;
    participants?: string[];
    emotion?: 'happy' | 'excited' | 'love' | 'playful';
  };
}

interface MemoryCardProps {
  memory: MemoryNode;
  index: number;
  scrollX: Animated.SharedValue<number>;
  formatTimestamp: (timestamp: string) => string;
  getEmotionColor: (emotion?: string) => string;
  getEmotionEmoji: (emotion?: string) => string;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  index,
  scrollX,
  formatTimestamp,
  getEmotionColor,
  getEmotionEmoji,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth];

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolation.CLAMP);

    const rotateYValue = interpolate(scrollX.value, inputRange, [45, 0, -45], Extrapolation.CLAMP);

    const opacityValue = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);

    return {
      transform: [{ scale: scaleValue }, { perspective: 1000 }, { rotateY: `${rotateYValue}deg` }],
      opacity: opacityValue,
    };
  });

  return (
    <Animated.View
      key={memory.id}
      style={StyleSheet.flatten([styles.memoryCard, animatedStyle])}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={styles.cardGradient}
      >
        <BlurView
          intensity={20}
          style={styles.cardBlur}
        >
          {/* Memory Header */}
          <View style={styles.memoryHeader}>
            <View style={styles.memoryTitleContainer}>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.memoryTimestamp}>{formatTimestamp(memory.timestamp)}</Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.emotionBadge,
                {
                  backgroundColor: `${getEmotionColor(memory.metadata?.emotion)}30`,
                },
              ])}
            >
              <Text style={styles.emotionEmoji}>{getEmotionEmoji(memory.metadata?.emotion)}</Text>
            </View>
          </View>

          {/* Memory Content */}
          <View style={styles.memoryContent}>
            {memory.type === 'image' ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: memory.content }}
                  style={styles.memoryImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)']}
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
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#ffffff"
                  />
                  <Text style={styles.metadataText}>{memory.metadata.location}</Text>
                </View>
              )}
              {memory.metadata.participants && (
                <View style={styles.metadataItem}>
                  <Ionicons
                    name="people-outline"
                    size={14}
                    color="#ffffff"
                  />
                  <Text style={styles.metadataText}>
                    {memory.metadata.participants.join(' & ')}
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

const makeStyles = (theme: any) =>
  StyleSheet.create({
    memoryCard: {
      width: screenWidth * 0.85,
      height: Dimensions.get('window').height * 0.6,
      marginHorizontal: screenWidth * 0.075,
      borderRadius: 20,
      overflow: 'hidden',
    },
    cardGradient: {
      flex: 1,
      borderRadius: 20,
    },
    cardBlur: {
      flex: 1,
      padding: 20,
    },
    memoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    memoryTitleContainer: {
      flex: 1,
    },
    memoryTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.neutral[0],
      marginBottom: 4,
    },
    memoryTimestamp: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
    },
    emotionBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    emotionEmoji: {
      fontSize: 20,
    },
    memoryContent: {
      flex: 1,
      marginBottom: 20,
    },
    imageContainer: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    memoryImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
    textContainer: {
      flex: 1,
    },
    memoryText: {
      fontSize: 18,
      color: theme.colors.neutral[0],
      lineHeight: 26,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    memoryMetadata: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    metadataText: {
      fontSize: 12,
      color: Theme.colors.neutral[0],
      marginLeft: 4,
    },
  });
