import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  InteractionManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type UserIntentScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'UserIntent'>;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 400,
  mass: 0.8,
};

const ELITE_TIMING_CONFIG = {
  duration: 600,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

const UserIntentScreen = ({ navigation }: UserIntentScreenProps) => {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Enhanced animation values
  const scale1 = useSharedValue(0.8);
  const scale2 = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const card1Opacity = useSharedValue(0);
  const card2Opacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    
    // Staggered entrance animations
    InteractionManager.runAfterInteractions(() => {
      // Header animation
      headerOpacity.value = withTiming(1, ELITE_TIMING_CONFIG);
      headerTranslateY.value = withSpring(0, SPRING_CONFIG);
      
      // Cards staggered animation
      card1Opacity.value = withDelay(200, withTiming(1, ELITE_TIMING_CONFIG));
      scale1.value = withDelay(200, withSpring(1, SPRING_CONFIG));
      
      card2Opacity.value = withDelay(400, withTiming(1, ELITE_TIMING_CONFIG));
      scale2.value = withDelay(400, withSpring(1, SPRING_CONFIG));
      
      // Footer animation
      footerOpacity.value = withDelay(600, withTiming(1, ELITE_TIMING_CONFIG));
      
      // Container animation
      opacity.value = withTiming(1, { duration: 800 });
      translateY.value = withSpring(0, SPRING_CONFIG);
    });
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const animatedCard1Style = useAnimatedStyle(() => ({
    opacity: card1Opacity.value,
    transform: [{ scale: scale1.value }],
  }));

  const animatedCard2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
    transform: [{ scale: scale2.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedFooterStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const triggerHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleIntentSelect = (intent: string, scaleValue: any) => {
    if (isNavigating) return;
    
    setSelectedIntent(intent);
    setIsNavigating(true);
    
    // Enhanced haptic feedback
    runOnJS(triggerHapticFeedback)();
    
    // Elite selection animation sequence
    scaleValue.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1.05, { ...SPRING_CONFIG, damping: 15 }),
      withSpring(1, SPRING_CONFIG)
    );

    // Exit animation for non-selected card
    const otherScale = scaleValue === scale1 ? scale2 : scale1;
    const otherOpacity = scaleValue === scale1 ? card2Opacity : card1Opacity;
    
    otherScale.value = withTiming(0.9, ELITE_TIMING_CONFIG);
    otherOpacity.value = withTiming(0.3, ELITE_TIMING_CONFIG);

    // Navigate with delay for smooth animation
    setTimeout(() => {
      if (intent === 'adopt') {
        navigation.navigate('PreferencesSetup', { userIntent: intent });
      } else {
        navigation.navigate('PetProfileSetup', { userIntent: intent });
      }
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* Elite Background Gradient */}
      <LinearGradient
        colors={['#fef7ff', '#f3e8ff', '#e9d5ff']}
        style={styles.backgroundGradient}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View style={[styles.content, animatedContainerStyle]}>
            {/* Elite Header with Glassmorphic Design */}
            <Animated.View style={[styles.header, animatedHeaderStyle]}>
              <BlurView intensity={20} style={styles.logoContainer}>
                <Text style={styles.logo}>🐾 PawfectMatch</Text>
              </BlurView>
              <Text style={styles.title}>Welcome to PawfectMatch!</Text>
              <Text style={styles.subtitle}>
                Let's get started by understanding what you're looking for
              </Text>
            </Animated.View>

            {/* Elite Intent Cards */}
            <View style={styles.intentCards}>
              {/* Adopt a Pet Card */}
              <Animated.View style={[styles.intentCard, animatedCard1Style]}>
                <TouchableOpacity
                  style={[
                    styles.cardButton,
                    selectedIntent === 'adopt' && styles.selectedCard
                  ]}
                  onPress={() => { handleIntentSelect('adopt', scale1); }}
                  activeOpacity={0.9}
                  disabled={isNavigating}
                >
                  <LinearGradient
                    colors={
                      selectedIntent === 'adopt' 
                        ? ['#fdf2f8', '#fce7f3', '#fbcfe8']
                        : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                    }
                    style={styles.cardGradient}
                  >
                    <BlurView intensity={selectedIntent === 'adopt' ? 30 : 15} style={styles.cardBlur}>
                      <View style={styles.cardIcon}>
                        <LinearGradient
                          colors={['#ec4899', '#be185d']}
                          style={styles.iconGradient}
                        >
                          <Text style={styles.cardEmoji}>🏠</Text>
                        </LinearGradient>
                      </View>
                      <Text style={styles.cardTitle}>I want to adopt a pet</Text>
                      <Text style={styles.cardDescription}>
                        Find your perfect companion from loving pets looking for their forever home
                      </Text>
                      <View style={styles.cardFeatures}>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>✨</Text>
                          <Text style={styles.featureText}>Browse available pets</Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>💝</Text>
                          <Text style={styles.featureText}>Connect with pet owners</Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>🤝</Text>
                          <Text style={styles.featureText}>Schedule meet & greets</Text>
                        </View>
                      </View>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* List Pets Card */}
              <Animated.View style={[styles.intentCard, animatedCard2Style]}>
                <TouchableOpacity
                  style={[
                    styles.cardButton,
                    selectedIntent === 'list' && styles.selectedCard
                  ]}
                  onPress={() => { handleIntentSelect('list', scale2); }}
                  activeOpacity={0.9}
                  disabled={isNavigating}
                >
                  <LinearGradient
                    colors={
                      selectedIntent === 'list' 
                        ? ['#f0f9ff', '#e0f2fe', '#bae6fd']
                        : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                    }
                    style={styles.cardGradient}
                  >
                    <BlurView intensity={selectedIntent === 'list' ? 30 : 15} style={styles.cardBlur}>
                      <View style={styles.cardIcon}>
                        <LinearGradient
                          colors={['#0ea5e9', '#0284c7']}
                          style={styles.iconGradient}
                        >
                          <Text style={styles.cardEmoji}>📝</Text>
                        </LinearGradient>
                      </View>
                      <Text style={styles.cardTitle}>I have pets to list</Text>
                      <Text style={styles.cardDescription}>
                        Share your pets for adoption, mating, or playdates with other pet lovers
                      </Text>
                      <View style={styles.cardFeatures}>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>📋</Text>
                          <Text style={styles.featureText}>Create pet profiles</Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>⚡</Text>
                          <Text style={styles.featureText}>Manage applications</Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>🔍</Text>
                          <Text style={styles.featureText}>Screen potential adopters</Text>
                        </View>
                      </View>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Elite Footer */}
            <Animated.View style={[styles.additionalOptions, animatedFooterStyle]}>
              <BlurView intensity={25} style={styles.footerBlur}>
                <Text style={styles.optionsTitle}>You can always do both later!</Text>
                <Text style={styles.optionsSubtext}>
                  This helps us personalize your experience, but you can change this anytime in settings
                </Text>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // === CONTAINER & LAYOUT ===
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  
  // === ELITE HEADER ===
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7c3aed',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  
  // === ELITE INTENT CARDS ===
  intentCards: {
    gap: 24,
    marginBottom: 40,
  },
  intentCard: {
    width: '100%',
  },
  cardButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  selectedCard: {
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  cardGradient: {
    borderRadius: 24,
  },
  cardBlur: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  // === CARD CONTENT ===
  cardIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  
  // === FEATURE LIST ===
  cardFeatures: {
    alignItems: 'stretch',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureBullet: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  
  // === ELITE FOOTER ===
  additionalOptions: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerBlur: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default UserIntentScreen;
