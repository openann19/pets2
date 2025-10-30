import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface MapPin {
  _id: string;
  petId: string;
  activity: string;
  message?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export type PulsePin = MapPin & {
  pulseIntensity?: number;
  radius?: number;
};

interface Props {
  visible: boolean;
  pin: MapPin | null;
  activityTypes: string[];
  onClose: () => void;
  onLike?: () => void;
  onChat?: () => void;
  testID?: string;
}

export function PinDetailsModal({
  visible,
  pin,
  activityTypes: _activityTypes,
  onClose,
  onLike,
  onChat,
  testID,
}: Props) {
  const nav = useNavigation<any>();
  const theme = useTheme();
  const styles = makeStyles(theme);
  if (!visible || !pin) return null;

  const handleLike = async () => {
    if (onLike) {
      onLike();
    } else {
      const API_URL = process.env['EXPO_PUBLIC_API_URL'] || process.env['API_URL'] || '';
      await fetch(`${API_URL}/api/matches/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: pin.petId }),
      }).catch(() => null);
      onClose();
      nav.navigate('Matches');
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat();
    } else {
      onClose();
      nav.navigate('Chat', { petId: pin.petId });
    }
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`;
    Linking.openURL(url).catch(() => null);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
      testID={testID || 'modal-pin-details'}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{pin.activity.toUpperCase()}</Text>
            <TouchableOpacity
              onPress={onClose}
              testID="btn-close-pin"
              accessibilityLabel="Close pin details"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {pin.message ? <Text style={styles.message}>{pin.message}</Text> : null}
          <Text style={styles.meta}>
            {new Date(pin.timestamp).toLocaleTimeString()} · {pin.latitude.toFixed(4)},
            {pin.longitude.toFixed(4)}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.like]}
              onPress={handleLike}
              testID="btn-like-pin"
              accessibilityLabel="Like this pet"
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>❤️ Like</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.chat]}
              onPress={handleChat}
              testID="btn-chat-pin"
              accessibilityLabel="Start chat with this pet"
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>💬 Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.directions]}
              onPress={openMaps}
              testID="btn-directions-pin"
              accessibilityLabel="Get directions to this location"
              accessibilityRole="button"
            >
              <Text style={styles.btnText}>🧭 Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(theme: AppTheme) {
  // Helper for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    message: {
      marginTop: theme.spacing.sm,
      color: theme.colors.onMuted,
    },
    meta: {
      marginTop: theme.spacing.xs + theme.spacing.xs / 2,
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    btn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm + theme.spacing.xs / 2,
      borderRadius: theme.radii.md + theme.radii.xs / 2,
    },
    like: {
      backgroundColor: alpha(theme.colors.danger, 0.1),
    },
    chat: {
      backgroundColor: alpha(theme.colors.info, 0.1),
    },
    directions: {
      backgroundColor: alpha(theme.colors.success, 0.1),
    },
    btnText: {
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
  });
}
export default PinDetailsModal;
