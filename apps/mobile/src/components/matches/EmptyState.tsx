import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export function EmptyState(): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityLabel="No matches found">
        <Image source={require('../../../assets/empty-matches.png')} style={styles.image} />
        <Text style={styles.title}>No matches yet</Text>
        <Text style={styles.subtitle}>Try adjusting your filters or start swiping to find your perfect match!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    image: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#a21caf',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
});
