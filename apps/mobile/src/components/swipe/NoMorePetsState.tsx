import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EliteContainer } from '../elite/containers';
import { FXContainerPresets } from '../containers/FXContainer';
import { EliteButtonPresets } from '../buttons/EliteButton';
import { Heading2, Body } from '../typography/ModernTypography';
import { useTheme } from '../../theme';
import type { AppTheme } from '../../theme';
import { getExtendedColors } from '../../theme/adapters';

interface NoMorePetsStateProps {
  loadPets: () => void;
}

const makeStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyCard: {
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    emptyTitle: {
      textAlign: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    emptySubtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
  });
};

export const NoMorePetsState: React.FC<NoMorePetsStateProps> = ({ loadPets }) => {
  const theme = useTheme();
  const colors = useMemo(() => getExtendedColors(theme), [theme]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <EliteContainer gradient="primary">
      <View style={styles.emptyContainer}>
        <FXContainerPresets.glass style={styles.emptyCard}>
          <Ionicons
            name="heart-outline"
            size={80}
            color={colors.primary}
          />
          <Heading2 style={[styles.emptyTitle, { color: colors.onSurface }]}>
            No more pets!
          </Heading2>
          <Body style={[styles.emptySubtitle, { color: colors.onMuted }]}>
            Check back later for more matches
          </Body>
          <EliteButtonPresets.premium
            title="Refresh"
            leftIcon="refresh"
            onPress={loadPets}
          />
        </FXContainerPresets.glass>
      </View>
    </EliteContainer>
  );
};
