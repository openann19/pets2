/**
 * Pet Profile Screen
 * Displays detailed information about a pet profile
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Text } from 'react-native';

type PetProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'PetProfile'>;

/**
 * PetProfileScreen - Displays a pet's full profile
 */
export default function PetProfileScreen(): React.ReactElement {
  const route = useRoute<PetProfileScreenProps['route']>();
  const navigation = useNavigation<PetProfileScreenProps['navigation']>();
  const { petId } = route.params;

  // TODO: Fetch pet data using petId
  // TODO: Display pet information, photos, bio, etc.

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pet Profile</Text>
        <Text style={styles.subtitle}>Pet ID: {petId}</Text>
        {/* TODO: Add pet profile UI components */}
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
