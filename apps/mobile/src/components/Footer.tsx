import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { useEffect } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getExtendedColors } from '../theme/adapters';
import AnimatedButton from './AnimatedButton';

interface FooterProps {
  showCopyright?: boolean;
  showLegal?: boolean;
  showVersion?: boolean;
  showSupport?: boolean;
  variant?: 'default' | 'minimal' | 'premium';
  style?: object;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Footer({
  showCopyright = true,
  showLegal = true,
  showVersion = false,
  showSupport = true,
  variant = 'default',
  style,
  accessibilityLabel = 'App footer with legal links and support information',
  accessibilityHint = 'Contains links to terms of service, privacy policy, and support contact',
}: FooterProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 100 }));
  }, [opacity.value, translateY.value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleLinkPress = async (url: string): Promise<void> => {
    try {
      // Haptic feedback
      if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      logger.error('Error opening link:', { error });
    }
  };

  const handleSupportPress = (): void => {
    handleLinkPress('mailto:support@pawfectmatch.com?subject=Mobile App Support');
  };

  const handleTermsPress = (): void => {
    handleLinkPress('https://pawfectmatch.com/terms');
  };

  const handlePrivacyPress = (): void => {
    handleLinkPress('https://pawfectmatch.com/privacy');
  };

  const renderDefaultFooter = (): React.ReactElement => (
    <Animated.View
      // Animated style cast to any to satisfy RN/Reanimated type unions
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.onPrimary },
        style,
        animatedStyle as any,
      ])}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.content}>
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.brandContainer}>
            <View
              style={StyleSheet.flatten([
                styles.logoContainer,
                { backgroundColor: colors.primary },
              ])}
            >
              <Text style={styles.logoEmoji}>🐾</Text>
            </View>
            <Text
              style={StyleSheet.flatten([styles.brandName, { color: theme.palette.neutral[800] }])}
            >
              PawfectMatch
            </Text>
          </View>

          {showVersion ? (
            <Text
              style={StyleSheet.flatten([
                styles.versionText,
                { color: theme.palette.neutral[500] },
              ])}
            >
              Version 1.0.0
            </Text>
          ) : null}
        </View>

        {/* Legal Links */}
        {showLegal ? (
          <View style={styles.legalSection}>
            <AnimatedButton
              onPress={handleTermsPress}
              style={styles.legalLink}
              textStyle={[styles.legalLinkText, { color: colors.primary }]}
              accessibilityLabel="Terms of Service"
              accessibilityHint="Opens Terms of Service in browser"
              accessibilityRole="link"
            >
              Terms of Service
            </AnimatedButton>

            <Text
              style={StyleSheet.flatten([styles.separator, { color: theme.palette.neutral[400] }])}
            >
              •
            </Text>

            <AnimatedButton
              onPress={handlePrivacyPress}
              style={styles.legalLink}
              textStyle={[styles.legalLinkText, { color: colors.primary }]}
              accessibilityLabel="Privacy Policy"
              accessibilityHint="Opens Privacy Policy in browser"
              accessibilityRole="link"
            >
              Privacy Policy
            </AnimatedButton>
          </View>
        ) : null}

        {/* Support Section */}
        {showSupport ? (
          <AnimatedButton
            onPress={handleSupportPress}
            style={styles.supportSection}
            accessibilityLabel="Contact Support"
            accessibilityHint="Opens email client to contact support"
            accessibilityRole="button"
          >
            <View style={styles.supportContent}>
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={theme.palette.neutral[500]}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.supportText,
                  { color: theme.palette.neutral[500] },
                ])}
              >
                Need Help? Contact Support
              </Text>
            </View>
          </AnimatedButton>
        ) : null}

        {/* Copyright */}
        {showCopyright ? (
          <View style={styles.copyrightSection}>
            <Text
              style={StyleSheet.flatten([
                styles.copyrightText,
                { color: theme.palette.neutral[500] },
              ])}
            >
              © {new Date().getFullYear()} PawfectMatch Inc. All rights reserved.
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderMinimalFooter = (): React.ReactElement => (
    <Animated.View
      style={StyleSheet.flatten([
        styles.minimalContainer,
        { backgroundColor: colors.onPrimary },
        style,
        animatedStyle as any,
      ])}
    >
      <View style={styles.minimalContent}>
        <Text
          style={StyleSheet.flatten([styles.minimalBrand, { color: theme.palette.neutral[600] }])}
        >
          🐾 PawfectMatch
        </Text>
        {showCopyright ? (
          <Text
            style={StyleSheet.flatten([
              styles.minimalCopyright,
              { color: theme.palette.neutral[500] },
            ])}
          >
            © {new Date().getFullYear()}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderPremiumFooter = (): React.ReactElement => (
    <Animated.View style={animatedStyle as any}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)'] as [string, string]}
        style={StyleSheet.flatten([styles.premiumContainer, style])}
      >
        <BlurView
          intensity={20}
          style={styles.premiumBlur}
        >
          <View style={styles.premiumContent}>
            <View style={styles.premiumBrand}>
              <View style={styles.premiumLogoContainer}>
                <Text style={styles.premiumLogoEmoji}>💎</Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.premiumBrandName,
                  { color: theme.palette.neutral[800] },
                ])}
              >
                PawfectMatch Premium
              </Text>
            </View>

            <View style={styles.premiumLinks}>
              <AnimatedButton
                onPress={handleTermsPress}
                style={styles.premiumLink}
                textStyle={[styles.premiumLinkText, { color: colors.primary }]}
              >
                Terms
              </AnimatedButton>

              <Text
                style={StyleSheet.flatten([
                  styles.separator,
                  { color: theme.palette.neutral[400] },
                ])}
              >
                •
              </Text>

              <AnimatedButton
                onPress={handlePrivacyPress}
                style={styles.premiumLink}
                textStyle={[styles.premiumLinkText, { color: colors.primary }]}
              >
                Privacy
              </AnimatedButton>

              <Text
                style={StyleSheet.flatten([
                  styles.separator,
                  { color: theme.palette.neutral[400] },
                ])}
              >
                •
              </Text>

              <AnimatedButton
                onPress={handleSupportPress}
                style={styles.premiumLink}
                textStyle={[styles.premiumLinkText, { color: colors.primary }]}
              >
                Support
              </AnimatedButton>
            </View>

            {showCopyright ? (
              <Text
                style={StyleSheet.flatten([
                  styles.premiumCopyright,
                  { color: theme.palette.neutral[500] },
                ])}
              >
                © {new Date().getFullYear()} PawfectMatch Inc.
              </Text>
            ) : null}
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimalFooter();
    case 'premium':
      return renderPremiumFooter();
    default:
      return renderDefaultFooter();
  }
}

const styles = StyleSheet.create({
  // Default Footer Styles
  container: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoEmoji: {
    fontSize: 16,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legalLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  legalLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  supportSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    marginLeft: 6,
  },
  copyrightSection: {
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Minimal Footer Styles
  minimalContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  minimalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimalBrand: {
    fontSize: 14,
    fontWeight: '600',
  },
  minimalCopyright: {
    fontSize: 12,
  },

  // Premium Footer Styles
  premiumContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumContent: {
    padding: 20,
    alignItems: 'center',
  },
  premiumBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumLogoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  premiumLogoEmoji: {
    fontSize: 18,
  },
  premiumBrandName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  premiumLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  premiumCopyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});
