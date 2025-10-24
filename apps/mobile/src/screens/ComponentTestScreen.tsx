/**
 * SIMPLE COMPONENT TEST SCREEN
 * 
 * This screen tests if the new components can be imported and used.
 * It's a minimal test to verify the wiring is correct.
 */

import React from 'react'
import { logger } from '@pawfectmatch/core';
;
import { View, Text, StyleSheet } from 'react-native';

// Test imports - if these work, the components are properly wired
import { Theme, EliteButton, FXContainer } from '../components/NewComponents';

export default function ComponentTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Component Test</Text>
      <Text style={styles.subtitle}>
        If you can see this, the basic imports are working!
      </Text>
      <Text style={styles.info}>
        Theme colors: {Object.keys(Theme.colors).length} color groups
      </Text>
      
      {/* Test if components can be rendered */}
      <View style={styles.testContainer}>
        <EliteButton
          title="Test Button"
          variant="primary"
          size="md"
          onPress={() => { logger.info('Button pressed!'); }}
        />
      </View>
      
      <FXContainer type="glass" variant="medium" style={styles.testContainer}>
        <Text style={styles.info}>FXContainer Test</Text>
      </FXContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  info: {
    fontSize: 14,
    color: '#888',
  },
  testContainer: {
    marginTop: 20,
    padding: 10,
  },
});
