/**
 * StoriesScreen - Mobile Stories Viewer
 *
 * Full-screen story viewer for React Native with gestures and animations.
 *
 * Features:
 * - Swipe left/right to navigate stories
 * - Tap left/right to navigate (like Instagram)
 * - Long press to pause
 * - Pinch to zoom
 * - Haptic feedback
 * - Progress bars
 * - Reply with swipe up
 * - Mute toggle
 * - Real-time updates via Socket.io
 */

import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { StatusBar } from "react-native";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRef, useEffect } from "react";
import { useStoriesScreen } from "../hooks/screens/social";
import { useTheme } from "@/theme";
import { getAccessibilityProps } from '../utils/accessibilityUtils';

// Navigation types
type MainStackParamList = {
  Stories: { groupIndex?: number } | undefined;
  [key: string]: any;
};

type StoriesScreenRouteProp = RouteProp<MainStackParamList, "Stories">;
type StoriesScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  "Stories"
>;

// API response types
interface StoriesFeedResponse {
  stories: StoryGroup[];
  success: boolean;
}

interface ViewStoryResponse {
  success: boolean;
  viewCount: number;
}

// Story types
interface Story {
  _id: string;
  userId: string;
  mediaType: "photo" | "video";
  mediaUrl: string;
  caption?: string;
  duration: number;
  viewCount: number;
  createdAt: string;
}

interface StoryUser {
  _id: string;
  username: string;
  profilePhoto?: string;
}

interface StoryGroup {
  userId: string;
  user: StoryUser;
  stories: Story[];
  storyCount: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function StoriesScreen() {
  const route = useRoute<StoriesScreenRouteProp>();
  const initialGroupIndex = route.params?.groupIndex ?? 0;

  const videoRef = useRef<Video>(null);

  const {
    storyGroups,
    isLoading,
    currentGroupIndex,
    currentStoryIndex,
    currentGroup,
    currentStory,
    progress,
    viewCount,
    isPaused,
    isMuted,
    panResponder,
    setPaused,
    setMuted,
    handleGoBack,
  } = useStoriesScreen(initialGroupIndex);

  // Video controls
  useEffect(() => {
    if (videoRef.current && currentStory?.mediaType === "video") {
      if (isPaused) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      videoRef.current.setIsMutedAsync(isMuted);
    }
  }, [isPaused, isMuted, currentStory]);

  if (!currentGroup || !currentStory) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.secondary[500]} }/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Story Content */}
      <View style={styles.storyContainer} {...panResponder.current.panHandlers}>
        {currentStory.mediaType === "photo" ? (
          <Image
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: currentStory.mediaUrl }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={!isPaused}
            isMuted={isMuted}
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              // Navigation is handled by the hook's timer
            }}
          />
        )}

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {currentGroup.stories.map((story: Story, index: number) => (
            <View key={story._id} style={styles.progressBarBg}>
              <Animated.View
                style={StyleSheet.flatten([
                  styles.progressBarFill,
                  {
                    width: `${
                      index < currentStoryIndex
                        ? 100
                        : index === currentStoryIndex
                          ? progress
                          : 0
                    }%`,
                  },
                ])}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  currentGroup.user.profilePhoto ||
                  "https://via.placeholder.com/40",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.username}>{currentGroup.user.username}</Text>
              <Text style={styles.timestamp}>
                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* View Count */}
            <View style={styles.viewCount}>
              <Ionicons name="eye" size={16} color={theme.colors.neutral[0]} }/>
              <Text style={styles.viewCountText}>{viewCount}</Text>
            </View>

            {/* Mute Toggle */}
            {currentStory.mediaType === "video" && (
              <TouchableOpacity
                testID="stories-mute-toggle"
                accessibilityLabel={isMuted ? "Unmute video" : "Mute video"}
                accessibilityRole="button"
                onPress={() => {
                  setMuted(!isMuted);
                }}
                style={styles.iconButton}
              >
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={24}
                  color={theme.colors.neutral[0]
                  accessibilityLabel={isMuted ? "Muted icon" : "Unmuted icon}"}
                />
              </TouchableOpacity>
            )}

            {/* Close Button */}
            <TouchableOpacity 
              testID="stories-close-button"
              accessibilityLabel="Close stories and go back"
              accessibilityRole="button"
              onPress={handleGoBack}
              style={styles.iconButton}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={theme.colors.neutral[0]
                accessibilityLabel="Close icon"
             } }/>
            </TouchableOpacity>
          </View>
        </View>

        {/* Caption */}
        {currentStory.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{currentStory.caption}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[950],
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.neutral[950],
    justifyContent: "center",
    alignItems: "center",
  },
  storyContainer: {
    flex: 1,
    position: "relative",
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  progressContainer: {
    position: "absolute",
    top: 50,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.neutral[0],
    borderRadius: 2,
  },
  header: {
    position: "absolute",
    top: 70,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.neutral[0],
  },
  username: {
    color: theme.colors.neutral[0],
    fontSize: 14,
    fontWeight: "600",
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  viewCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCountText: {
    color: theme.colors.neutral[0],
    fontSize: 12,
    fontWeight: "600",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captionContainer: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  caption: {
    color: theme.colors.neutral[0],
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
