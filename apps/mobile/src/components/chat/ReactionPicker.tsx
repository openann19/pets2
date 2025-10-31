/**
 * Reaction Picker Component
 * Displays emoji reactions for messages
 */

import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface Reaction {
  emoji: string;
  label: string;
}

const REACTIONS: Reaction[] = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👍', label: 'Like' },
  { emoji: '👏', label: 'Clap' },
];

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reaction: string) => void;
  position?: { x: number; y: number };
}

export function ReactionPicker({
  visible,
  onClose,
  onSelect,
  position,
}: ReactionPickerProps): JSX.Element {
  const theme = useTheme() as AppTheme;
  const styles = makeStyles(theme);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleSelect = (reaction: string): void => {
    setSelectedReaction(reaction);
    onSelect(reaction);
    // Auto close after selection
    setTimeout(() => {
      onClose();
      setSelectedReaction(null);
    }, 300);
  };

  const renderReaction: ListRenderItem<Reaction> = ({ item }) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.reactionButton,
        selectedReaction === item.emoji && styles.selectedReaction,
      ])}
      onPress={() => {
        handleSelect(item.emoji);
      }}
      accessibilityRole="button"
      accessibilityLabel={`React with ${item.label}`}
      accessibilityHint={`Tap to react with ${item.emoji}`}
      hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
    >
      <Text style={styles.emoji} allowFontScaling>{item.emoji}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
      accessibilityLabel="Reaction picker"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close reaction picker"
        accessibilityHint="Tap outside to close reaction picker"
      >
        <View
          style={StyleSheet.flatten([
            styles.container,
            position && {
              position: 'absolute',
              top: position.y,
              left: position.x,
            },
          ])}
        >
          <FlatList
            data={REACTIONS}
            renderItem={renderReaction}
            keyExtractor={(item) => item.emoji}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reactionsList}
            accessibilityRole="list"
            accessibilityLabel="Reaction picker"
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.3),
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    reactionsList: {
      paddingHorizontal: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    reactionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.05),
    },
    selectedReaction: {
      backgroundColor: theme.utils.alpha(theme.colors.primary, 0.1),
      transform: [{ scale: 1.1 }],
    },
    emoji: {
      fontSize: 24,
    },
  });
