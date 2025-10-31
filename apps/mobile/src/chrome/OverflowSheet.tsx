/**
 * 🎯 OVERFLOW SHEET - Bottom sheet for overflow actions
 * Smooth animations, backdrop dismiss, accessibility
 */

import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { HeaderAction as ActionType } from './actions';

import type { HeaderContext } from './actions';

type Props = {
  visible: boolean;
  actions: ActionType[];
  ctx: HeaderContext;
  onClose: () => void;
  onActionPress: (action: ActionType) => void;
};

export function OverflowSheet({
  visible,
  actions,
  ctx,
  onClose,
  onActionPress,
}: Props) {
  const theme = useTheme() as AppTheme;
  const styles = makeStyles(theme);

  // Platform-specific component - TypeScript can't infer union type from ternary
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const Shell = Platform.OS === 'ios' ? BlurView : View;
  // Platform-specific props - types differ between BlurView (intensity, tint) and View (style)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const shellProps =
    Platform.OS === 'ios'
      ? ({ intensity: 20, tint: 'dark' } as const)
      : ({ style: { backgroundColor: theme.colors.surface } } as const);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.content}>
          <Shell {...shellProps} style={styles.shell}>
            <FlatList
              data={actions}
              keyExtractor={(a) => a.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onClose();
                    onActionPress(item);
                  }}
                  style={styles.item}
                  accessibilityLabel={item.a11yLabel || item.label}
                  accessibilityRole="button"
                >
                  <Ionicons
                    // Icon name is validated at runtime - type assertion is safe
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    name={item.icon as never}
                    size={20}
                    color={theme.colors.onSurface}
                    style={styles.icon}
                  />
                  <Text style={styles.label}>{item.label}</Text>
                  {item.badge && (() => {
                    const badgeValue = item.badge(ctx);
                    return badgeValue !== undefined && badgeValue > 0 ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {badgeValue}
                        </Text>
                      </View>
                    ) : null;
                  })()}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Shell>
        </View>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    content: {
      position: 'absolute',
      bottom: 20,
      left: 16,
      right: 16,
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      maxHeight: '60%',
    },
    shell: {
      padding: theme.spacing.md,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      minHeight: 44,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    label: {
      flex: 1,
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: '500',
    },
    badge: {
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.full,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.colors.onSurface,
      fontSize: 10,
      fontWeight: '700',
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
    },
  });

