import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@mobile/theme';

export type MatchesFilter = {
  q?: string;
  species?: 'dog' | 'cat' | 'other' | '';
  minDist?: number;
  maxDist?: number;
  sort?: 'newest' | 'oldest' | 'alpha';
};

interface Props {
  visible: boolean;
  initial: MatchesFilter;
  onApply: (f: MatchesFilter) => void;
  onClose: () => void;
}

export default function MatchesFilterModal({ visible, initial, onApply, onClose }: Props) {
  const theme = useTheme();
  const [f, setF] = useState<MatchesFilter>(initial);
  const styles = makeStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.backdrop}>
        <View
          style={styles.card}
          testID="matches-filter-modal"
        >
          <Text style={styles.h1}>Filter Matches</Text>

          <Text style={styles.label}>Search</Text>
          <TextInput
            testID="filter-q"
            style={styles.input}
            value={f.q ?? ''}
            onChangeText={(q) => {
              setF({ ...f, q });
            }}
            placeholder="Search by pet name"
            placeholderTextColor={theme.palette.neutral[400]}
          />

          <Text style={styles.label}>Species</Text>
          <View style={styles.row}>
            {(['', 'dog', 'cat', 'other'] as const).map((s) => (
              <TouchableOpacity
                key={s || 'all'}
                style={[styles.pill, (f.species ?? '') === s && styles.pillActive]}
                onPress={() => {
                  setF({ ...f, species: s });
                }}
                testID={`filter-species-${s || 'all'}`}
              >
                <Text style={styles.pillText}>{s || 'All'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Distance (km)</Text>
          <View style={styles.row}>
            <TextInput
              testID="filter-minDist"
              style={[styles.input, styles.inputHalf]}
              value={f.minDist?.toString() ?? ''}
              onChangeText={(v) => {
                setF({ ...f, minDist: v ? Number(v) : undefined });
              }}
              keyboardType="numeric"
              placeholder="Min"
              placeholderTextColor={theme.palette.neutral[400]}
            />
            <TextInput
              testID="filter-maxDist"
              style={[styles.input, styles.inputHalf]}
              value={f.maxDist?.toString() ?? ''}
              onChangeText={(v) => {
                setF({ ...f, maxDist: v ? Number(v) : undefined });
              }}
              keyboardType="numeric"
              placeholder="Max"
              placeholderTextColor={theme.palette.neutral[400]}
            />
          </View>

          <Text style={styles.label}>Sort</Text>
          <View style={styles.row}>
            {(['newest', 'oldest', 'alpha'] as const).map((k) => (
              <TouchableOpacity
                key={k}
                style={[styles.pill, (f.sort ?? 'newest') === k && styles.pillActive]}
                onPress={() => {
                  setF({ ...f, sort: k });
                }}
                testID={`filter-sort-${k}`}
              >
                <Text style={styles.pillText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.btn, styles.btnGhost]}
              testID="filter-cancel"
            >
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onApply(f);
              }}
              style={[styles.btn, styles.btnPrimary]}
              testID="filter-apply"
            >
              <Text style={styles.btnPrimaryText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    card: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderTopLeftRadius: theme.radii.lg,
      borderTopRightRadius: theme.radii.lg,
      gap: theme.spacing.xs,
    },
    h1: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.palette.neutral[600],
      marginTop: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.palette.neutral[200],
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      color: theme.colors.onSurface,
    },
    inputHalf: { flex: 1 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
    pill: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.full,
      backgroundColor: theme.palette.neutral[100],
    },
    pillActive: { backgroundColor: `${theme.colors.primary}22` },
    pillText: { fontWeight: '600', color: theme.colors.onSurface },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    btn: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
    },
    btnGhost: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.palette.neutral[200],
    },
    btnGhostText: { fontWeight: '700', color: theme.palette.neutral[700] },
    btnPrimary: { backgroundColor: theme.colors.primary },
    btnPrimaryText: { color: theme.colors.onSurface, fontWeight: '700' },
  });
}
