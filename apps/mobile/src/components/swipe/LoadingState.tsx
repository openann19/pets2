import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EliteContainer } from '../elite/containers';
import FXContainer from '../containers/FXContainer';
import { FXContainerPresets } from '../containers/FXContainer';
import { EliteButtonPresets } from '../buttons/EliteButton';
import { Heading1, Body } from '../typography/ModernTypography';
import { Theme } from '../../theme';

interface LoadingStateProps {
  loadPets: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ loadPets }) => {
  return (
    <EliteContainer gradient="primary">
      <View style={styles.loadingContainer}>
        <FXContainer
          type="glass"
          style={styles.loadingCard}
        >
          <Heading1
            animated={true}
            style={styles.loadingTitle}
          >
            Finding Matches
          </Heading1>
          <Body style={styles.loadingSubtitle}>Discovering your perfect pet companions...</Body>
        </FXContainer>
      </View>
    </EliteContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  loadingCard: {
    padding: Theme.spacing['4xl'],
    alignItems: 'center',
  },
  loadingTitle: {
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  loadingSubtitle: {
    textAlign: 'center',
    color: Theme.colors.text.secondary,
  },
});
