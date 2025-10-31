/**
 * 🎯 EXAMPLE USAGE - MatchMoment Integration
 * 
 * Example of how to trigger MatchMoment on successful match
 */

import { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MatchMoment } from '@/components/effects/MatchMoment';

export function MatchMomentExample() {
  const [matchActive, setMatchActive] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const handleMatch = () => {
    setMatchActive(true);
    // Your match logic here
    // e.g., await matchService.createMatch(petId);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={handleMatch}
      >
        <Text style={styles.buttonText}>Create Match</Text>
      </Pressable>

      <Text style={styles.count}>Matches: {matchCount}</Text>

      {/* Match Moment - Mount absolutely in screen root */}
      <MatchMoment
        active={matchActive}
        onComplete={() => setMatchActive(false)}
        badgeCount={matchCount}
        onBadgeIncrement={(count) => {
          setMatchCount(count);
          // Update your match count state/service
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

