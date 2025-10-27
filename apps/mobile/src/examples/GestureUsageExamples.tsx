import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Alert } from 'react-native';
import { DoubleTapLikePlus, PinchZoomPro } from '../components/Gestures';
import { ReactionBarMagnetic } from '../components/chat';

// Example 1: Instagram-style double-tap like with particle burst
export function InstagramLikeExample() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      // TODO: Send like to server
    }
  };

  const handleSingleTap = () => {
    // Optional: show UI or navigate
    console.log('Single tap - could show details');
  };

  return (
    <View style={styles.container}>
      <DoubleTapLikePlus
        onDoubleTap={handleLike}
        onSingleTap={handleSingleTap}
        heartColor="#ff3b5c"
        particles={6}
        haptics={{ enabled: true, style: "medium" }}
      >
        <Image
          source={{ uri: 'https://example.com/pet-photo.jpg' }}
          style={styles.postImage}
          resizeMode="cover"
        />
      </DoubleTapLikePlus>
      
      <View style={styles.postFooter}>
        <Text style={styles.likeCount}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Text>
      </View>
    </View>
  );
}

// Example 2: Elastic pinch-to-zoom for photo viewing
export function PhotoViewerExample() {
  const [scale, setScale] = useState(1);

  return (
    <View style={styles.container}>
      <PinchZoomPro
        source={{ uri: 'https://example.com/high-res-photo.jpg' }}
        width={350}
        height={400}
        minScale={1}
        maxScale={4}
        enableMomentum={true}
        haptics={true}
        onScaleChange={setScale}
        backgroundColor="#000"
      />
      <Text style={styles.scaleIndicator}>
        Scale: {scale.toFixed(2)}x
      </Text>
    </View>
  );
}

// Example 3: Magnetic reaction bar for chat messages
export function ChatReactionExample() {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleReactionSelect = (emoji: string) => {
    setSelectedReaction(emoji);
    Alert.alert('Reaction Selected', `You selected: ${emoji}`);
    // TODO: Send reaction to server
  };

  const customReactions = [
    { emoji: "❤️", label: "Love" },
    { emoji: "😂", label: "Laugh" },
    { emoji: "😮", label: "Wow" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "👍", label: "Like" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.messageExample}>
        <Text style={styles.messageText}>
          Check out this amazing pet photo! 🐕
        </Text>
      </View>
      
      <ReactionBarMagnetic
        reactions={customReactions}
        onSelect={handleReactionSelect}
        onCancel={() => { console.log('Reaction cancelled'); }}
        influenceRadius={100}
        baseSize={32}
        backgroundColor="#fff"
        borderColor="#e0e0e0"
      />
      
      {selectedReaction && (
        <Text style={styles.selectedReaction}>
          Selected: {selectedReaction}
        </Text>
      )}
    </View>
  );
}

// Example 4: Combined usage - Photo with like and reactions
export function CombinedGestureExample() {
  const [liked, setLiked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const handleReactionSelect = (emoji: string) => {
    setReactions(prev => [...prev, emoji]);
    setShowReactions(false);
  };

  return (
    <View style={styles.container}>
      <DoubleTapLikePlus
        onDoubleTap={handleLike}
        onSingleTap={handleLongPress} // Could be long press in real implementation
        heartColor={liked ? "#ff3b5c" : "#666"}
        particles={liked ? 8 : 0}
      >
        <PinchZoomPro
          source={{ uri: 'https://example.com/pet-photo.jpg' }}
          width={300}
          height={300}
          maxScale={3}
          haptics={true}
        />
      </DoubleTapLikePlus>

      {showReactions && (
        <View style={styles.reactionOverlay}>
          <ReactionBarMagnetic
            onSelect={handleReactionSelect}
            onCancel={() => { setShowReactions(false); }}
          />
        </View>
      )}

      <View style={styles.interactionSummary}>
        <Text>Liked: {liked ? '❤️' : '🤍'}</Text>
        <Text>Reactions: {reactions.join(' ')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  postImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
  },
  postFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scaleIndicator: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  messageExample: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedReaction: {
    marginTop: 12,
    fontSize: 18,
    color: '#333',
  },
  reactionOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  interactionSummary: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
});
