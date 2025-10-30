import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EliteHeader, EliteButton } from '../EliteComponents';
import { Spacing } from '../../animation';

interface ChatHeaderProps {
  petName: string;
  isOnline: boolean;
  onBack: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onMoreOptions?: () => void;
}

export function ChatHeader({
  petName,
  isOnline,
  onBack,
  onVoiceCall,
  onVideoCall,
  onMoreOptions,
}: ChatHeaderProps): React.JSX.Element {
  const handleVoiceCall = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVoiceCall?.();
  }, [onVoiceCall]);

  const handleVideoCall = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVideoCall?.();
  }, [onVideoCall]);

  const handleMoreOptions = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMoreOptions?.();
  }, [onMoreOptions]);

  const rightComponent = (
    <View style={styles.rightComponent}>
      <EliteButton
        title=""
        variant="glass"
        size="sm"
        icon="call"
        ripple={true}
        glow={true}
        onPress={handleVoiceCall}
      />
      <EliteButton
        title=""
        variant="glass"
        size="sm"
        icon="videocam"
        ripple={true}
        glow={true}
        onPress={handleVideoCall}
      />
      <EliteButton
        title=""
        variant="glass"
        size="sm"
        icon="ellipsis-vertical"
        ripple={true}
        onPress={handleMoreOptions}
      />
    </View>
  );

  return (
    <EliteHeader
      title={petName}
      subtitle={isOnline ? 'Online now' : 'Last seen recently'}
      blur={true}
      onBack={onBack}
      rightComponent={rightComponent}
    />
  );
}

const styles = StyleSheet.create({
  rightComponent: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});
