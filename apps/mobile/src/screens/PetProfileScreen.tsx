import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';

type PetProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'PetProfile'>;

/**
 * PetProfileScreen - View individual pet profile
 */
export default function PetProfileScreen({ route }: PetProfileScreenProps): React.ReactElement {
  const { petId } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pet Profile</Text>
        {petId && <Text style={styles.subtitle}>Pet ID: {petId}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
