/**
 * Motion Lab Screen
 * Experimental screen for testing animations and motion components
 */

import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';

/**
 * MotionLabScreen - Testing ground for motion and animation components
 */
export default function MotionLabScreen(): React.ReactElement {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Motion Lab</Text>
        <Text style={styles.subtitle}>Experimental animations and motion components</Text>
        {/* TODO: Add motion testing components */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});
