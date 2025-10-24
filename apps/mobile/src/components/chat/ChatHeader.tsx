import React, { useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { EliteHeader } from "../EliteHeader";
import { EliteButton } from "../EliteButton";
import { tokens } from "@pawfectmatch/design-tokens";

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
        magnetic={true}
        ripple={true}
        glow={true}
        onPress={handleVoiceCall}
      />
      <EliteButton
        title=""
        variant="glass"
        size="sm"
        icon="videocam"
        magnetic={true}
        ripple={true}
        glow={true}
        onPress={handleVideoCall}
      />
      <EliteButton
        title=""
        variant="glass"
        size="sm"
        icon="ellipsis-vertical"
        magnetic={true}
        ripple={true}
        onPress={handleMoreOptions}
      />
    </View>
  );

  return (
    <EliteHeader
      title={petName}
      subtitle={isOnline ? "Online now" : "Last seen recently"}
      blur={true}
      onBack={onBack}
      rightComponent={rightComponent}
    />
  );
}

const styles = StyleSheet.create({
  rightComponent: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
  },
});
