import { View, StyleSheet } from 'react-native';
import { EliteContainer } from '../elite/containers';
import FXContainer from '../containers/FXContainer';
import { FXContainerPresets } from '../containers/FXContainer';
import { EliteButtonPresets } from '../buttons/EliteButton';
import { Heading1, Body } from '../typography/ModernTypography';
import { useTheme } from '../../theme';

interface LoadingStateProps {
  loadPets: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ loadPets }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

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

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingCard: {
      padding: theme.spacing['4xl'],
      alignItems: 'center',
    },
    loadingTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    loadingSubtitle: {
      textAlign: 'center',
      color: theme.colors.onMuted,
    },
  });
}
