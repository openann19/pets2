import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import {
  Heading3,
  Body,
  BodySmall,
  Label,
} from "../Text";
import { matchesAPI } from "../../services/api";
import { logger } from "@pawfectmatch/core";

interface BoostOption {
  id: string;
  duration: "30m" | "1h" | "3h";
  label: string;
  multiplier: string;
  icon: string;
  popular?: boolean;
}

interface BoostButtonProps {
  onPress: () => void;
  isPremium: boolean;
  isActive?: boolean;
  expiresAt?: string;
}

interface BoostModalProps {
  visible: boolean;
  onClose: () => void;
  isPremium: boolean;
  onBoostActivated: (expiresAt: string) => void;
}

const BOOST_OPTIONS: BoostOption[] = [
  {
    id: "30m",
    duration: "30m",
    label: "30 Minutes",
    multiplier: "2x",
    icon: "flash",
  },
  {
    id: "1h",
    duration: "1h",
    label: "1 Hour",
    multiplier: "3x",
    icon: "flash",
    popular: true,
  },
  {
    id: "3h",
    duration: "3h",
    label: "3 Hours",
    multiplier: "5x",
    icon: "flash",
  },
];

export function BoostButton({
  onPress,
  isPremium,
  isActive = false,
  expiresAt,
}: BoostButtonProps) {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isActive, pulseAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  const getTimeRemaining = () => {
    if (!expiresAt) return "";
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return "Expired";
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return String(minutes) + "m";
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return String(hours) + "h " + String(remainingMinutes) + "m";
  };

  return (
    <TouchableOpacity
      style={styles.boostButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={
            isActive
              ? ["#f59e0b", "#d97706"]
              : isPremium
              ? ["#8b5cf6", "#7c3aed"]
              : ["#6b7280", "#4b5563"]
          }
          style={styles.boostGradient}
        >
          <Ionicons
            name={isActive ? "flash" : "flash-outline"}
            size={20}
            color="#fff"
          />
          {isActive && (
            <BodySmall style={styles.boostTimer}>
              {getTimeRemaining()}
            </BodySmall>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function BoostModal({
  visible,
  onClose,
  isPremium,
  onBoostActivated,
}: BoostModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("1h");
  const [isActivating, setIsActivating] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(optionId);
  };

  const handleActivateBoost = async () => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Profile Boost is a premium feature. Upgrade to PawfectMatch Premium to use this feature.",
        [{ text: "OK" }],
      );
      return;
    }

    const option = BOOST_OPTIONS.find((opt) => opt.id === selectedOption);
    if (!option) return;

    try {
      setIsActivating(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await matchesAPI.boostProfile(option.duration);

      Alert.alert(
        "Boost Activated! 🚀",
        `Your profile is now boosted with ${option.multiplier} visibility for ${option.label}.\n\nYou'll be shown to more users and get more matches!`,
        [
          {
            text: "Great!",
            onPress: () => {
              onBoostActivated(result.expiresAt);
              onClose();
            },
          },
        ],
      );

      logger.info("Profile boost activated", {
        duration: option.duration,
        expiresAt: result.expiresAt,
        increase: result.visibilityIncrease,
      });
    } catch (error) {
      logger.error("Failed to activate boost:", { error });
      Alert.alert(
        "Activation Failed",
        "Failed to activate boost. Please try again or contact support.",
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={["#f59e0b", "#d97706"]}
                    style={styles.iconGradient}
                  >
                    <Ionicons name="flash" size={32} color="#fff" />
                  </LinearGradient>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Heading3 style={styles.title}>Boost Your Profile</Heading3>
                <Body style={styles.description}>
                  Get more visibility and matches! Your profile will be shown to
                  more users during the boost period.
                </Body>

                {/* Boost Options */}
                <View style={styles.optionsContainer}>
                  {BOOST_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        selectedOption === option.id && styles.optionCardSelected,
                      ]}
                      onPress={() => {
                        handleOptionSelect(option.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={
                          selectedOption === option.id
                            ? ["#fef3c7", "#fde68a"]
                            : ["#ffffff", "#f9fafb"]
                        }
                        style={styles.optionGradient}
                      >
                        {option.popular && (
                          <View style={styles.popularBadge}>
                            <LinearGradient
                              colors={["#8b5cf6", "#7c3aed"]}
                              style={styles.popularGradient}
                            >
                              <BodySmall style={styles.popularText}>
                                POPULAR
                              </BodySmall>
                            </LinearGradient>
                          </View>
                        )}
                        <View style={styles.optionIcon}>
                          <Ionicons
                            name={option.icon as "flash"}
                            size={24}
                            color="#f59e0b"
                          />
                        </View>
                        <Label style={styles.optionLabel}>
                          {option.label}
                        </Label>
                        <Body style={styles.optionMultiplier}>
                          {option.multiplier} Visibility
                        </Body>
                        {selectedOption === option.id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#f59e0b"
                            style={styles.checkmark}
                          />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Benefits */}
                <View style={styles.benefitsContainer}>
                  <Label style={styles.benefitsTitle}>What you get:</Label>
                  {[
                    "Priority placement in swipe queue",
                    "Shown to more users in your area",
                    "Increased match potential",
                    "Real-time boost status",
                  ].map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <BodySmall style={styles.benefitText}>{benefit}</BodySmall>
                    </View>
                  ))}
                </View>

                {!isPremium && (
                  <View style={styles.premiumNotice}>
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <BodySmall style={styles.premiumNoticeText}>
                      Premium feature - Upgrade to unlock
                    </BodySmall>
                  </View>
                )}
              </View>

              {/* Activate Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.activateButton,
                    isActivating && styles.activateButtonDisabled,
                  ]}
                  onPress={() => {
                    void handleActivateBoost();
                  }}
                  disabled={isActivating}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      isActivating
                        ? ["#d1d5db", "#9ca3af"]
                        : ["#f59e0b", "#d97706"]
                    }
                    style={styles.activateGradient}
                  >
                    {isActivating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={20} color="#fff" />
                        <Label style={styles.activateText}>
                          Activate Boost
                        </Label>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  boostButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  boostGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
  },
  boostTimer: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  blurContainer: {
    width: "90%",
    maxWidth: 500,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalContainer: {
    width: "100%",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  optionCardSelected: {
    borderColor: "#f59e0b",
  },
  optionGradient: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  popularGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  optionMultiplier: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  benefitsContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: "#6b7280",
  },
  premiumNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 12,
  },
  premiumNoticeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d97706",
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  activateButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  activateButtonDisabled: {
    opacity: 0.6,
  },
  activateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  activateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
