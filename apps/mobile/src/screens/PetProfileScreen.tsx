import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';

type PetProfileScreenProps = RootStackScreenProps<'PetProfile'>;

export default function PetProfileScreen({ route }: PetProfileScreenProps): React.ReactElement {
  // Stub implementation
  return (
    <View style={styles.container}>
      <Text>Pet Profile Screen - {route.params?.petId ?? 'Unknown'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
