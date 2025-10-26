import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, FlatList
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../theme/unified-theme";

type Pet = { _id: string; name: string; breed?: string };

const ACTIVITY_KINDS = [
  { key: "walk", label: "Walk", icon: "walk" },
  { key: "play", label: "Play", icon: "tennisball" },
  { key: "feeding", label: "Feeding", icon: "restaurant" },
  { key: "rest", label: "Rest", icon: "bed" },
  { key: "training", label: "Training", icon: "ribbon" },
  { key: "lost_pet", label: "Lost Pet", icon: "alert-circle" },
] as const;

export type CreateActivityForm = {
  petId: string;
  activity: typeof ACTIVITY_KINDS[number]["key"];
  message?: string;
  shareToMap: boolean;
  radiusMeters: number;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onStart: (form: CreateActivityForm) => Promise<void> | void;
  testID?: string;
}

export default function CreateActivityModal({ visible, onClose, onStart, testID }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [form, setForm] = useState<CreateActivityForm>({
    petId: "",
    activity: "walk",
    message: "",
    shareToMap: true,
    radiusMeters: 800,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        setLoadingPets(true);
        const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";
        const res = await fetch(`${API_URL}/api/pets/mine`);
        const list: Pet[] = res.ok ? await res.json() : [];
        setPets(list);
        if (list.length && !form.petId) {
          setForm((f) => ({ ...f, petId: list[0]._id }));
        }
      } finally {
        setLoadingPets(false);
      }
    })();
  }, [visible]);

  const canSubmit = useMemo(() => !!form.petId && !!form.activity && !submitting, [form, submitting]);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onStart(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" testID={testID || "create-activity-modal"}>
      <View style={styles.backdrop}>
        <BlurView intensity={30} style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Start Pet Activity</Text>
            <TouchableOpacity accessibilityLabel="Close" onPress={onClose} testID="btn-close-create-activity">
              <Ionicons name="close" size={24} color={Theme.colors.neutral[800]} />
            </TouchableOpacity>
          </View>

          {/* Pet picker */}
          <Text style={styles.label}>Pet</Text>
          {loadingPets ? (
            <ActivityIndicator color={Theme.colors.primary[500]} />
          ) : pets.length ? (
            <FlatList
              horizontal
              data={pets}
              keyExtractor={(p) => p._id}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => {
                const active = item._id === form.petId;
                return (
                  <TouchableOpacity
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setForm((f) => ({ ...f, petId: item._id }))}
                    testID={`chip-pet-${item._id}`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.name}{item.breed ? ` · ${item.breed}` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <Text style={styles.hint}>No pets found. Add one in "My Pets".</Text>
          )}

          {/* Activity kinds */}
          <Text style={[styles.label, { marginTop: 16 }]}>Activity</Text>
          <View style={styles.chipsRow}>
            {ACTIVITY_KINDS.map((k) => {
              const active = form.activity === k.key;
              return (
                <TouchableOpacity
                  key={k.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setForm((f) => ({ ...f, activity: k.key }))}
                  testID={`chip-activity-${k.key}`}
                >
                  <Ionicons
                    name={k.icon as any}
                    size={16}
                    color={active ? Theme.colors.primary[700] : Theme.colors.neutral[600]}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{k.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message */}
          <Text style={[styles.label, { marginTop: 16 }]}>Message (optional)</Text>
          <View style={styles.input}>
            <TextInput
              value={form.message}
              onChangeText={(t) => setForm((f) => ({ ...f, message: t }))}
              placeholder="e.g., At the park near 5th street"
              placeholderTextColor={Theme.colors.neutral[400]}
              style={styles.inputText}
              maxLength={140}
              testID="input-activity-message"
            />
          </View>

          {/* Share + radius */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.toggle, form.shareToMap && styles.toggleOn]}
              onPress={() => setForm((f) => ({ ...f, shareToMap: !f.shareToMap }))}
              testID="toggle-share-map"
            >
              <Ionicons
                name={form.shareToMap ? "eye" : "eye-off"}
                size={16}
                color={form.shareToMap ? Theme.colors.neutral[0] : Theme.colors.neutral[700]}
              />
              <Text style={[styles.toggleText, form.shareToMap && styles.toggleTextOn]}>
                Share to Map
              </Text>
            </TouchableOpacity>

            <View style={styles.radiusPill}>
              <Text style={styles.radiusText}>{form.radiusMeters} m</Text>
              <View style={styles.radiusButtons}>
                <TouchableOpacity
                  onPress={() => setForm((f) => ({ ...f, radiusMeters: Math.max(200, f.radiusMeters - 200) }))}
                  testID="btn-radius-dec"
                >
                  <Ionicons name="remove-circle" size={22} color={Theme.colors.neutral[600]} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setForm((f) => ({ ...f, radiusMeters: Math.min(3000, f.radiusMeters + 200) }))}
                  testID="btn-radius-inc"
                >
                  <Ionicons name="add-circle" size={22} color={Theme.colors.neutral[600]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && { opacity: 0.5 }]}
            onPress={submit}
            disabled={!canSubmit}
            testID="btn-start-activity"
          >
            {submitting ? (
              <ActivityIndicator color={Theme.colors.neutral[0]} />
            ) : (
              <Text style={styles.primaryBtnText}>Start Activity</Text>
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: { padding: 16, paddingBottom: 24, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "700", color: Theme.colors.neutral[800] },
  label: { fontSize: 14, fontWeight: "600", color: Theme.colors.neutral[700], marginBottom: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Theme.colors.neutral[100],
  },
  chipActive: { backgroundColor: "#fde7f2", borderWidth: 1, borderColor: Theme.colors.primary[300] },
  chipText: { color: Theme.colors.neutral[700], fontWeight: "600" },
  chipTextActive: { color: Theme.colors.primary[700] },
  hint: { color: Theme.colors.neutral[500], marginBottom: 8 },
  input: { borderRadius: 12, backgroundColor: Theme.colors.neutral[100], paddingHorizontal: 12, paddingVertical: 8 },
  inputText: { color: Theme.colors.neutral[800], fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  toggle: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Theme.colors.neutral[100], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  toggleOn: { backgroundColor: Theme.colors.primary[500] },
  toggleText: { color: Theme.colors.neutral[700], fontWeight: "700" },
  toggleTextOn: { color: Theme.colors.neutral[0] },
  radiusPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Theme.colors.neutral[100], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  radiusText: { fontWeight: "700", color: Theme.colors.neutral[700] },
  radiusButtons: { flexDirection: "row", gap: 8 },
  primaryBtn: {
    marginTop: 16, backgroundColor: Theme.colors.primary[500],
    alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12,
  },
  primaryBtnText: { color: Theme.colors.neutral[0], fontSize: 16, fontWeight: "700" },
});

