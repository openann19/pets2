/**
 * Additional showcase demo components
 * These are placeholder components for showcasing UI patterns
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { Button } from './Button';
import { Stack } from './layout/Stack';
import { Badge } from './Badge';

// Mock Chat Header
export function ChatHeaderDemo() {
  return (
    <Card variant="surface" padding="md">
      <Stack direction="row" justify="between" align="center">
        <Stack>
          <Text variant="h6">Bella the Beagle</Text>
          <Text variant="caption" tone="muted">Online now</Text>
        </Stack>
        <Stack direction="row" gap="xs">
          <Button title="📞" variant="ghost" size="sm" onPress={() => {} />
          <Button title="🎥" variant="ghost" size="sm" onPress={() => {} />
          <Button title="⋯" variant="ghost" size="sm" onPress={() => {} />
        </Stack>
      </Stack>
    </Card>
  );
}

// Mock Message Bubble
export function MessageBubbleDemo() {
  const theme = { colors: { bg: '#fff', text: '#000' } };
  
  return (
    <Stack gap="md">
      {/* Own message */}
      <View style={{ alignItems: 'flex-end' } >
        <Card variant="elevated" padding="md" style={{ maxWidth: '75%', backgroundColor: '#007AFF' } >
          <Text style={{ color: '#fff' } >Hey! How's it going? 📸</Text>
          <Text variant="caption" style={{ color: '#fff', opacity: 0.7, marginTop: 4 } >
            2:30 PM
          </Text>
        </Card>
      </View>

      {/* Other message */}
      <View style={{ alignItems: 'flex-start' } >
        <Card variant="surface" padding="md" style={{ maxWidth: '75%' } >
          <Text>Good! Want to meet at the park? 🏞️</Text>
          <Stack direction="row" align="center" gap="xs" style={{ marginTop: 4 } >
            <Text variant="caption" tone="muted">2:32 PM</Text>
            <Badge label="✓✓" variant="success" size="sm" />
          </Stack>
        </Card>
      </View>
    </Stack>
  );
}

// Mock Message Input
export function MessageInputDemo() {
  return (
    <Card variant="elevated" padding="sm">
      <Stack direction="row" align="center" gap="xs">
        <Button title="➕" variant="ghost" size="sm" onPress={() => {} />
        <View style={{ flex: 1, paddingHorizontal: 8 } >
          <Text variant="body" tone="muted">Type a message...</Text>
        </View>
        <Button title="📎" variant="ghost" size="sm" onPress={() => {} />
        <Button title="🎤" variant="primary" size="sm" onPress={() => {} />
      </Stack>
    </Card>
  );
}

// Mock Video Call Interface
export function VideoCallDemo() {
  return (
    <Card variant="elevated" padding="md" style={{ aspectRatio: 16/9, backgroundColor: '#1a1a1a' } >
      <Stack justify="between" style={{ height: '100%' } >
        {/* Remote video placeholder */}
        <View style={{ flex: 1, backgroundColor: '#333', borderRadius: 8, justifyContent: 'center', alignItems: 'center' } >
          <Text style={{ color: '#fff', fontSize: 48 } >🎥</Text>
        </View>

        {/* Local video (PiP) */}
        <View style={{ position: 'absolute', top: 16, right: 16, width: 80, height: 60, backgroundColor: '#555', borderRadius: 8, justifyContent: 'center', alignItems: 'center' } >
          <Text style={{ color: '#fff', fontSize: 24 } >📹</Text>
        </View>

        {/* Controls */}
        <Stack direction="row" justify="center" gap="md" style={{ paddingTop: 16 } >
          <Button title="🔇" variant="ghost" size="md" onPress={() => {} />
          <Button title="📹" variant="ghost" size="md" onPress={() => {} />
          <Button title="📞" variant="danger" size="md" onPress={() => {} />
        </Stack>
      </Stack>
    </Card>
  );
}

// Mock Voice Call Interface
export function VoiceCallDemo() {
  return (
    <Card variant="elevated" padding="xl" style={{ backgroundColor: '#667eea', minHeight: 400 } >
      <Stack align="center" gap="xl" style={{ paddingVertical: 32 } >
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' } >
          <Text style={{ fontSize: 48 } >🐕</Text>
        </View>
        <Stack align="center" gap="xs">
          <Text variant="h4" style={{ color: '#fff' } >Bella the Beagle</Text>
          <Text style={{ color: '#fff', opacity: 0.8 } >Connected</Text>
        </Stack>
        <Stack direction="row" justify="center" gap="lg">
          <Button title="🔇" variant="ghost" size="lg" onPress={() => {} />
          <Button title="📞" variant="danger" size="lg" onPress={() => {} />
        </Stack>
      </Stack>
    </Card>
  );
}

// Mock Advanced Header
export function AdvancedHeaderDemo() {
  return (
    <Card variant="elevated" padding="none" style={{ overflow: 'hidden' } >
      <View style={{ padding: 16, backgroundColor: '#000', opacity: 0.9 } >
        <Stack direction="row" justify="between" align="center">
          <Stack>
            <Text variant="h6" style={{ color: '#fff' } >Discover</Text>
            <Text variant="caption" style={{ color: '#fff', opacity: 0.6 } >
              Find your perfect match
            </Text>
          </Stack>
          <Stack direction="row" gap="xs">
            <Button title="Filter" variant="ghost" size="sm" onPress={() => {} />
            <Button title="❤️" variant="ghost" size="sm" onPress={() => {} />
          </Stack>
        </Stack>
      </View>
    </Card>
  );
}

// Mock Panel/Card with Filter Controls
export function FilterPanelDemo() {
  return (
    <Card variant="elevated" padding="md">
      <Stack gap="md">
        <Text variant="h6">Filters</Text>
        <Stack gap="sm">
          <Card variant="outlined" padding="sm">
            <Text variant="caption">Age: 1-5 years</Text>
          </Card>
          <Card variant="outlined" padding="sm">
            <Text variant="caption">Size: Small to Medium</Text>
          </Card>
          <Card variant="outlined" padding="sm">
            <Text variant="caption">Personality: Friendly</Text>
          </Card>
        </Stack>
        <Button title="Apply Filters" variant="primary" onPress={() => {} />
      </Stack>
    </Card>
  );
}

// Mock Empty State
export function EmptyStateDemo() {
  return (
    <Card variant="surface" padding="xl" style={{ alignItems: 'center' } >
      <Text style={{ fontSize: 64, marginBottom: 16 } >📭</Text>
      <Text variant="h5" style={{ marginBottom: 8 } >No Messages Yet</Text>
      <Text variant="bodyMuted" style={{ textAlign: 'center', marginBottom: 24 } >
        Start a conversation to see messages here
      </Text>
      <Button title="Send First Message" variant="primary" onPress={() => {} />
    </Card>
  );
}

// Mock Swipe Card
export function SwipeCardDemo() {
  return (
    <Card variant="elevated" padding="none" style={{ aspectRatio: 0.7, overflow: 'hidden' } >
      <View style={{ flex: 1, backgroundColor: '#FFE5B4', justifyContent: 'center', alignItems: 'center' } >
        <Text style={{ fontSize: 64 } >🐕</Text>
      </View>
      <View style={{ padding: 16, backgroundColor: '#fff' } >
        <Text variant="h5">Bella</Text>
        <Text variant="bodyMuted">Beagle • 3 years old</Text>
      </View>
    </Card>
  );
}

// Mock Loading State
export function LoadingStateDemo() {
  return (
    <Stack align="center" gap="md">
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc' } />
      <Stack align="center" gap="xs">
        <Text variant="body">Loading...</Text>
        <Text variant="caption" tone="muted">Please wait</Text>
      </Stack>
    </Stack>
  );
}

