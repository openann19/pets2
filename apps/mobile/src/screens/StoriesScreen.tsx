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

import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ResizeMode, Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    PanResponder,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSocket } from '../hooks/useSocket';
import apiClient from '../services/apiClient';

// Navigation types
type MainStackParamList = {
    Stories: { groupIndex?: number } | undefined;
    [key: string]: any;
};

type StoriesScreenRouteProp = RouteProp<MainStackParamList, 'Stories'>;
type StoriesScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Stories'>;

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
    mediaType: 'photo' | 'video';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StoriesScreen() {
    const route = useRoute<StoriesScreenRouteProp>();
    const navigation = useNavigation<StoriesScreenNavigationProp>();
    const initialGroupIndex = route.params?.groupIndex ?? 0;

    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [_showReplyInput, setShowReplyInput] = useState(false); // Future feature

    const videoRef = useRef<Video>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const socket = useSocket();

    // Fetch stories feed
    const { data: storyGroups } = useQuery({
        queryKey: ['stories-feed'],
        queryFn: async () => {
            const response = await apiClient.get<StoriesFeedResponse>('/stories');
            return response.stories;
        },
    });

    const currentGroup = storyGroups?.[currentGroupIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];

    // Mark story as viewed
    const viewStoryMutation = useMutation({
        mutationFn: async (storyId: string) => {
            const response = await apiClient.post<ViewStoryResponse>(
                `/stories/${storyId}/view`
            );
            return response;
        },
        onSuccess: (data: ViewStoryResponse) => {
            setViewCount(data.viewCount);
        },
    });

    // Navigation functions
    const goToNextStory = useCallback(() => {
        if (!currentGroup) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1);
            setProgress(0);
        } else if (storyGroups && currentGroupIndex < storyGroups.length - 1) {
            setCurrentGroupIndex((prev) => prev + 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            navigation.goBack();
        }
    }, [currentGroup, currentStoryIndex, currentGroupIndex, storyGroups, navigation]);

    const goToPreviousStory = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (currentStoryIndex > 0) {
            setCurrentStoryIndex((prev) => prev - 1);
            setProgress(0);
        } else if (currentGroupIndex > 0 && storyGroups) {
            const prevGroupIndex = currentGroupIndex - 1;
            const prevGroup = storyGroups[prevGroupIndex];
            if (prevGroup) {
                setCurrentGroupIndex(prevGroupIndex);
                setCurrentStoryIndex(prevGroup.stories.length - 1);
                setProgress(0);
            }
        }
    }, [currentStoryIndex, currentGroupIndex, storyGroups]);

    // Pan responder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (_evt) => {
                // Long press detection
                longPressTimer.current = setTimeout(() => {
                    setIsPaused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }, 200);
            },
            onPanResponderRelease: (evt, gestureState) => {
                // Clear long press timer
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = null;
                }
                setIsPaused(false);

                const { locationX } = evt.nativeEvent;
                const { dx, dy } = gestureState;

                // Swipe down to close
                if (dy > 100) {
                    navigation.goBack();
                    return;
                }

                // Swipe up for reply
                if (dy < -100) {
                    setShowReplyInput(true);
                    return;
                }

                // Horizontal swipe or tap
                if (Math.abs(dx) > 50) {
                    if (dx > 0) {
                        goToPreviousStory();
                    } else {
                        goToNextStory();
                    }
                } else {
                    // Tap navigation
                    if (locationX < SCREEN_WIDTH / 3) {
                        goToPreviousStory();
                    } else {
                        goToNextStory();
                    }
                }
            },
        })
    ).current;

    // Auto-advance timer
    useEffect(() => {
        if (!currentStory || isPaused) return;

        const duration = currentStory.duration * 1000;
        const startTime = Date.now();

        // Progress update interval
        progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);
        }, 16); // ~60fps

        // Auto-advance timer
        timerRef.current = setTimeout(() => {
            goToNextStory();
        }, duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [currentStory, isPaused, goToNextStory]);

    // Mark story as viewed
    useEffect(() => {
        if (currentStory) {
            viewStoryMutation.mutate(currentStory._id);
        }
    }, [currentStory?._id]);

    // Socket.io real-time view updates
    useEffect(() => {
        if (!socket || !currentStory) return;

        const handleStoryViewed = (data: { storyId: string; viewCount: number }) => {
            if (data.storyId === currentStory._id) {
                setViewCount(data.viewCount);
            }
        };

        socket.on('story:viewed', handleStoryViewed);
        return () => {
            socket.off('story:viewed', handleStoryViewed);
        };
    }, [socket, currentStory?._id]);

    // Video controls
    useEffect(() => {
        if (videoRef.current && currentStory?.mediaType === 'video') {
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
                <ActivityIndicator size="large" color="#A855F7" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Story Content */}
            <View style={styles.storyContainer} {...panResponder.panHandlers}>
                {currentStory.mediaType === 'photo' ? (
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
                            if ('didJustFinish' in status && status.didJustFinish) {
                                goToNextStory();
                            }
                        }}
                    />
                )}

                {/* Progress Bars */}
                <View style={styles.progressContainer}>
                    {currentGroup.stories.map((story: Story, index: number) => (
                        <View key={story._id} style={styles.progressBarBg}>
                            <Animated.View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${index < currentStoryIndex
                                            ? 100
                                            : index === currentStoryIndex
                                                ? progress
                                                : 0
                                            }%`,
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Image
                            source={{
                                uri: currentGroup.user.profilePhoto || 'https://via.placeholder.com/40',
                            }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.username}>{currentGroup.user.username}</Text>
                            <Text style={styles.timestamp}>
                                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.headerActions}>
                        {/* View Count */}
                        <View style={styles.viewCount}>
                            <Ionicons name="eye" size={16} color="#fff" />
                            <Text style={styles.viewCountText}>{viewCount}</Text>
                        </View>

                        {/* Mute Toggle */}
                        {currentStory.mediaType === 'video' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setIsMuted(!isMuted);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={styles.iconButton}
                            >
                                <Ionicons
                                    name={isMuted ? 'volume-mute' : 'volume-high'}
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        )}

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.iconButton}
                        >
                            <Ionicons name="close" size={24} color="#fff" />
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
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyContainer: {
        flex: 1,
        position: 'relative',
    },
    media: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    progressContainer: {
        position: 'absolute',
        top: 50,
        left: 8,
        right: 8,
        flexDirection: 'row',
        gap: 4,
        zIndex: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    header: {
        position: 'absolute',
        top: 70,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    username: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    timestamp: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    viewCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    viewCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captionContainer: {
        position: 'absolute',
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 10,
    },
    caption: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
});
