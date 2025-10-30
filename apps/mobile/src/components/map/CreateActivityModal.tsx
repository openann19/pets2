import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { startPetActivity, type ActivityKind } from '../../services/petActivityService';
import { logger } from '../../services/logger';
import { useTheme } from '@/theme';

export interface ActivityType {
  id: string;
  label: string;
  emoji?: string;
}

export interface PetLite {
  _id: string;
  name: string;
}

export interface CreateActivityForm {
  petId: string;
  activity: string;
  message: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  pets: PetLite[];
  activityTypes: string[] | ActivityType[];
}

export default function CreateActivityModal({ visible, onClose, pets, activityTypes }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [pet, setPet] = useState<string | null>(pets?.[0]?._id ?? null);
  const [act, setAct] = useState<string | null>(
    typeof activityTypes[0] === 'string' ? activityTypes[0] : (activityTypes[0] as ActivityType).id,
  );
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!pet || !act) return;
    try {
      setLoading(true);
      await startPetActivity({ petId: pet, activity: act as ActivityKind, message: msg });
      onClose();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to start activity', { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.container}>
        <Text
          style={styles.header}
          accessibilityRole="header"
        >
          Start Activity
        </Text>
        <Text style={styles.subHeader}>Pet</Text>
        {pets.map((p) => (
          <TouchableOpacity
            key={p._id}
            onPress={() => {
              setPet(p._id);
            }}
            style={[styles.option, pet === p._id && styles.selected]}
            accessibilityRole="radio"
            accessibilityState={{ selected: pet === p._id }}
            accessibilityLabel={`Select ${p.name}`}
          >
            <Text>{p.name}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.subHeader, { marginTop: theme.spacing.md }]}>Activity</Text>
        {activityTypes.map((t) => {
          const id = typeof t === 'string' ? t : t.id;
          const label = typeof t === 'string' ? t : `${t.emoji ?? ''} ${t.label}`;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => {
                setAct(id);
              }}
              style={[styles.option, act === id && styles.selected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: act === id }}
              accessibilityLabel={`Select ${label}`}
            >
              <Text>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Message (optional)"
          style={styles.input}
          placeholderTextColor={theme.colors.onMuted}
          accessibilityLabel="Activity message"
          accessibilityHint="Optional message to include with the activity"
        />
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.button}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={submit}
            style={[styles.button, styles.primaryButton]}
            disabled={loading}
            accessibilityLabel={loading ? 'Sharing activity' : 'Share activity'}
            accessibilityRole="button"
            accessibilityState={{ disabled: loading, busy: loading }}
          >
            <Text style={styles.primaryText}>{loading ? 'Sharing...' : 'Share'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  // Helper for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.bg,
    },
    header: {
      fontWeight: theme.typography.h1.weight,
      fontSize: theme.typography.h2.size,
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    subHeader: {
      fontWeight: theme.typography.h2.weight,
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    option: {
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md + theme.radii.xs / 2,
      marginBottom: theme.spacing.sm,
    },
    selected: {
      borderColor: theme.colors.primary,
      backgroundColor: alpha(theme.colors.primary, 0.1),
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md + theme.radii.xs / 2,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    button: {
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md + theme.radii.xs / 2,
      flex: 1,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    primaryText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
  });
}
