import { StyleSheet, View } from 'react-native';

import { EliteHeader } from '../EliteComponents';
import { EliteButton } from '../EliteComponents';

interface SwipeHeaderProps {
  onBack: () => void;
  onFilterPress: () => void;
  onMatchesPress: () => void;
}

export function SwipeHeader({ onBack, onFilterPress, onMatchesPress }: SwipeHeaderProps) {
  return (
    <EliteHeader
      title="Discover"
      subtitle="Find your perfect match"
      blur={true}
      onBack={onBack}
      rightComponent={
        <View style={styles.headerActions}>
          <EliteButton
            title="Filter"
            variant="glass"
            size="sm"
            icon="options-outline"
            magnetic={true}
            ripple={true}
            onPress={onFilterPress}
          />
          <EliteButton
            title=""
            variant="glass"
            size="sm"
            icon="heart"
            magnetic={true}
            ripple={true}
            glow={true}
            onPress={onMatchesPress}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
