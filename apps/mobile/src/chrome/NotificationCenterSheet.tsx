/**
 * NotificationCenterSheet – animated sheet with poof effects
 */

import { useState } from 'react';
import { Modal, View, Text, FlatList, Pressable } from 'react-native';
import Animated, { withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { durations, easings } from '@/foundation/motion';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { useTheme } from '@/theme';
import { Poof } from './Poof';

export type Notice = { id: string; title: string; body?: string; unread?: boolean };

export function NotificationCenterSheet({
  visible,
  data,
  onClose,
  onItemOpen,
  onItemRead,
}: {
  visible: boolean;
  data: Notice[];
  onClose: () => void;
  onItemOpen: (n: Notice) => void;
  onItemRead: (n: Notice) => void;
}) {
  const [poofs, setPoofs] = useState<{ id: string; x: number; y: number }[]>([]);
  const reduced = useReducedMotion();
  const theme = useTheme();

  const style = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: withTiming(visible ? 0 : -240, {
            duration: durations.md,
            easing: Easing.bezier(...easings.enter),
          }),
        },
      ],
    }),
    [visible],
  );

  return (
    <Modal transparent visible={visible} animationType={reduced ? 'none' : 'fade'} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} accessibilityLabel="Close notifications">
        <Animated.View style={[{ position: 'absolute', top: 12, right: 12, left: 12, borderRadius: 16, overflow: 'hidden' }, style]}>
          <View style={{ padding: 12, backgroundColor: 'rgba(20,20,22,0.98)', borderRadius: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text accessibilityRole="header" style={{ color: theme.colors.onSurface, fontWeight: '800', fontSize: 18 }}>
                Notifications
              </Text>
              <View style={{ flex: 1 }} />
              <Pressable onPress={onClose} accessibilityLabel="Close">
                <Text style={{ color: theme.colors.onMuted, fontSize: 16 }}>Close</Text>
              </Pressable>
            </View>
            <FlatList
              data={data}
              keyExtractor={n => n.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onItemOpen(item)}
                  onLongPress={e => {
                    const { pageX: x, pageY: y } = e.nativeEvent;
                    setPoofs(p => [...p, { id: `${item.id}-${Date.now()}`, x, y }]);
                    onItemRead(item);
                  }}
                  style={{ paddingVertical: 10 }}
                  accessibilityLabel={`${item.title}${item.unread ? ', unread' : ''}`}
                >
                  <Text style={{ color: item.unread ? theme.colors.onSurface : theme.colors.onMuted, fontWeight: item.unread ? '800' : '600', fontSize: 15 }}>
                    {item.title}
                  </Text>
                  {!!item.body && <Text style={{ color: theme.colors.onMuted, marginTop: 2 }}>{item.body}</Text>}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />}
              style={{ maxHeight: 420 }}
              removeClippedSubviews
              initialNumToRender={8}
              windowSize={5}
            />
          </View>
        </Animated.View>
        {poofs.map(p => (
          <Poof key={p.id} x={p.x} y={p.y} onEnd={() => setPoofs(arr => arr.filter(a => a.id !== p.id))} />
        ))}
      </Pressable>
    </Modal>
  );
}

