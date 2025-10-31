/**
 * Example Usage: MicroInteractionCard
 * 
 * Comprehensive examples demonstrating all features of MicroInteractionCard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MicroInteractionCard } from '@/components/Animations';

// ============================================================================
// Basic Examples
// ============================================================================

export function BasicCardExamples() {
  return (
    <View style={styles.container}>
      {/* Simple card */}
      <MicroInteractionCard>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Simple Card</Text>
          <Text style={styles.cardBody}>This is a basic card</Text>
        </View>
      </MicroInteractionCard>

      {/* Clickable card */}
      <MicroInteractionCard clickable onPress={() => console.log('Card pressed')}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Clickable Card</Text>
          <Text style={styles.cardBody}>Tap to interact</Text>
        </View>
      </MicroInteractionCard>
    </View>
  );
}

// ============================================================================
// Effect Examples
// ============================================================================

export function EffectCardExamples() {
  return (
    <View style={styles.container}>
      {/* Hoverable card */}
      <MicroInteractionCard hoverable>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Hoverable Card</Text>
          <Text style={styles.cardBody}>Hover to see effect</Text>
        </View>
      </MicroInteractionCard>

      {/* Tilt card */}
      <MicroInteractionCard tilt>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Tilt Card</Text>
          <Text style={styles.cardBody}>Drag to tilt</Text>
        </View>
      </MicroInteractionCard>

      {/* Magnetic card */}
      <MicroInteractionCard magnetic>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Magnetic Card</Text>
          <Text style={styles.cardBody}>Magnetic attraction effect</Text>
        </View>
      </MicroInteractionCard>

      {/* Gradient overlay */}
      <MicroInteractionCard gradient hoverable>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Gradient Card</Text>
          <Text style={styles.cardBody}>Gradient overlay on hover</Text>
        </View>
      </MicroInteractionCard>

      {/* Glow effect */}
      <MicroInteractionCard glow hoverable>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Glow Card</Text>
          <Text style={styles.cardBody}>Glow effect on hover</Text>
        </View>
      </MicroInteractionCard>
    </View>
  );
}

// ============================================================================
// Feedback Examples
// ============================================================================

export function FeedbackCardExamples() {
  return (
    <View style={styles.container}>
      {/* With haptic feedback */}
      <MicroInteractionCard clickable haptic onPress={() => console.log('Pressed')}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Haptic Card</Text>
          <Text style={styles.cardBody}>Haptic feedback on press</Text>
        </View>
      </MicroInteractionCard>

      {/* With sound effect */}
      <MicroInteractionCard
        clickable
        sound={{
          uri: require('@/assets/sounds/card.mp3'),
          volume: 0.5,
          enabled: true,
        }}
        onPress={() => console.log('Pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Sound Card</Text>
          <Text style={styles.cardBody}>Sound effect on press</Text>
        </View>
      </MicroInteractionCard>

      {/* All feedback combined */}
      <MicroInteractionCard
        clickable
        haptic
        sound={{
          uri: require('@/assets/sounds/card.mp3'),
          volume: 0.5,
        }}
        onPress={() => console.log('Pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Full Feedback</Text>
          <Text style={styles.cardBody}>Haptic + sound</Text>
        </View>
      </MicroInteractionCard>
    </View>
  );
}

// ============================================================================
// All Features Combined
// ============================================================================

export function FullFeaturedCardExamples() {
  return (
    <View style={styles.container}>
      {/* All features enabled */}
      <MicroInteractionCard
        hoverable
        clickable
        tilt
        magnetic
        gradient
        glow
        haptic
        sound={{
          uri: require('@/assets/sounds/card.mp3'),
          volume: 0.5,
          enabled: true,
        }}
        onPress={() => console.log('Full featured card pressed')}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Full Featured Card</Text>
          <Text style={styles.cardBody}>
            All effects enabled: hover, tilt, magnetic, gradient, glow, haptic, and sound
          </Text>
        </View>
      </MicroInteractionCard>
    </View>
  );
}

// ============================================================================
// Real-World Examples
// ============================================================================

export function RealWorldCardExamples() {
  return (
    <View style={styles.container}>
      {/* Product card */}
      <MicroInteractionCard
        hoverable
        clickable
        tilt
        gradient
        glow
        onPress={() => console.log('Product selected')}
      >
        <View style={styles.cardContent}>
          <View style={styles.productImage} />
          <Text style={styles.cardTitle}>Product Name</Text>
          <Text style={styles.cardBody}>$99.99</Text>
        </View>
      </MicroInteractionCard>

      {/* Profile card */}
      <MicroInteractionCard
        hoverable
        clickable
        magnetic
        haptic
        onPress={() => console.log('Profile opened')}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatar} />
          <Text style={styles.cardTitle}>User Name</Text>
          <Text style={styles.cardBody}>Bio text here</Text>
        </View>
      </MicroInteractionCard>

      {/* Notification card */}
      <MicroInteractionCard
        clickable
        haptic
        sound={{
          uri: require('@/assets/sounds/notification.mp3'),
          volume: 0.3,
        }}
        onPress={() => console.log('Notification opened')}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>New Message</Text>
          <Text style={styles.cardBody}>You have a new message</Text>
        </View>
      </MicroInteractionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardBody: {
    fontSize: 14,
    opacity: 0.7,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    marginBottom: 8,
  },
});

