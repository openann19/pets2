import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { logger } from "@pawfectmatch/core";
import { AdvancedCard, CardConfigs } from "../../../components/Advanced/AdvancedCard";
import { DoubleTapLikePlus } from "../../../components/Gestures/DoubleTapLikePlus";
import { useDoubleTapMetrics } from "../../../hooks/useInteractionMetrics";
import { matchesAPI } from "../../../services/api";
import SmartImage from "../../../components/common/SmartImage";
import { useTheme } from "../../../theme/Provider";
import * as Haptics from "expo-haptics";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

interface ProfileHeaderSectionProps {
  user: User | null;
}

export const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = React.memo(({ user }) => {
  const theme = useTheme();
  const { startInteraction, endInteraction } = useDoubleTapMetrics();

  const handleProfileLike = useCallback(async () => {
    if (!user?._id) return;
    startInteraction('profileLike', { userId: user._id });
    await matchesAPI.likeUser(user._id).catch(() => null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    endInteraction('profileLike', true);
  }, [user?._id, startInteraction, endInteraction]);

  const handleCardPress = useCallback(async () => {
    const userProfile = await matchesAPI.getUserProfile();
    logger.info("Loaded user profile:", { userProfile });
  }, []);

  const styles = StyleSheet.create({
    header: {
      padding: 20,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 16,
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      marginBottom: 4,
    },
    memberSince: {
      fontSize: 14,
    },
  });

  return (
    <AdvancedCard
      {...CardConfigs.glass({
        interactions: ["hover", "press", "glow"],
        haptic: "light",
        apiAction: handleCardPress,
      })}
      style={styles.header}
    >
      <View style={styles.profileSection}>
        <DoubleTapLikePlus
          onDoubleTap={handleProfileLike}
          heartColor="#ff69b4"
          particles={5}
          haptics={{ enabled: true, style: "light" }}
        >
          <SmartImage
            source={{
              uri: user?.avatar ?? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
            }}
            style={styles.profileImage}
            useShimmer={true}
            rounded={40}
          />
        </DoubleTapLikePlus>
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: theme.colors.text }]>
            {user?.firstName ?? "User"} {user?.lastName ?? ""}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textMuted }]>
            {user?.email ?? "user@example.com"}
          </Text>
          <Text style={[styles.memberSince, { color: theme.colors.textMuted }]>
            Member since {new Date().getFullYear()}
          </Text>
        </View>
      </View>
    </AdvancedCard>
  );
});

ProfileHeaderSection.displayName = 'ProfileHeaderSection';
