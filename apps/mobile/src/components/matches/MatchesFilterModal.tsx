import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Theme } from "../../theme/unified-theme";

export type MatchesFilter = {
  q?: string;
  species?: "dog" | "cat" | "other" | "";
  minDist?: number;
  maxDist?: number;
  sort?: "newest" | "oldest" | "alpha";
};

interface Props {
  visible: boolean;
  initial: MatchesFilter;
  onApply: (f: MatchesFilter) => void;
  onClose: () => void;
}

export default function MatchesFilterModal({ visible, initial, onApply, onClose }: Props) {
  const [f, setF] = useState<MatchesFilter>(initial);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={S.backdrop}>
        <View style={S.card} testID="matches-filter-modal">
          <Text style={S.h1}>Filter Matches</Text>

          <Text style={S.label}>Search</Text>
          <TextInput
            testID="filter-q"
            style={S.input}
            value={f.q ?? ""}
            onChangeText={(q) => setF({ ...f, q })}
            placeholder="Search by pet name"
            placeholderTextColor={Theme.colors.neutral[400]}
          />

          <Text style={S.label}>Species</Text>
          <View style={S.row}>
            {(["", "dog", "cat", "other"] as const).map((s) => (
              <TouchableOpacity
                key={s || "all"}
                style={[S.pill, (f.species ?? "") === s && S.pillActive]}
                onPress={() => setF({ ...f, species: s })}
                testID={`filter-species-${s || "all"}`}
              >
                <Text style={S.pillText}>{s || "All"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={S.label}>Distance (km)</Text>
          <View style={S.row}>
            <TextInput
              testID="filter-minDist"
              style={[S.input, S.inputHalf]}
              value={f.minDist?.toString() ?? ""}
              onChangeText={(v) => setF({ ...f, minDist: v ? Number(v) : undefined })}
              keyboardType="numeric"
              placeholder="Min"
              placeholderTextColor={Theme.colors.neutral[400]}
            />
            <TextInput
              testID="filter-maxDist"
              style={[S.input, S.inputHalf]}
              value={f.maxDist?.toString() ?? ""}
              onChangeText={(v) => setF({ ...f, maxDist: v ? Number(v) : undefined })}
              keyboardType="numeric"
              placeholder="Max"
              placeholderTextColor={Theme.colors.neutral[400]}
            />
          </View>

          <Text style={S.label}>Sort</Text>
          <View style={S.row}>
            {(["newest", "oldest", "alpha"] as const).map((k) => (
              <TouchableOpacity
                key={k}
                style={[S.pill, (f.sort ?? "newest") === k && S.pillActive]}
                onPress={() => setF({ ...f, sort: k })}
                testID={`filter-sort-${k}`}
              >
                <Text style={S.pillText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={S.actions}>
            <TouchableOpacity onPress={onClose} style={[S.btn, S.btnGhost]} testID="filter-cancel">
              <Text style={S.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onApply(f)}
              style={[S.btn, S.btnPrimary]}
              testID="filter-apply"
            >
              <Text style={S.btnPrimaryText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const S = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  card: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 },
  h1: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "600", color: Theme.colors.neutral[600], marginTop: 8 },
  input: { borderWidth: 1, borderColor: Theme.colors.neutral[200], borderRadius: 10, padding: 10, color: "#111" },
  inputHalf: { flex: 1 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 999, backgroundColor: Theme.colors.neutral[100] },
  pillActive: { backgroundColor: `${Theme.colors.primary[500]}22` },
  pillText: { fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: Theme.colors.neutral[200] },
  btnGhostText: { fontWeight: "700", color: Theme.colors.neutral[700] },
  btnPrimary: { backgroundColor: Theme.colors.primary[500] },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
});

