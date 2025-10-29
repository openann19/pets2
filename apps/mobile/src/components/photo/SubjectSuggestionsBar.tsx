import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AutoCropEngine, type SuggestionType } from "../../utils/AutoCropEngine";
import { Theme } from "../../theme/unified-theme";
import { BouncePressable } from "../micro";

type Rect = { x: number; y: number; width: number; height: number };

interface Props {
  uri: string;
  ratios?: string[];                     // ["1:1","4:5","9:16",...]
  onFocus?: (focus: Rect) => void;       // use cropper.focusTo(focus)
  onApply?: (crop: Rect) => void;        // apply immediately
}

export const SubjectSuggestionsBar: React.FC<Props> = ({ uri, ratios = ["1:1","4:5","9:16"], onFocus, onApply }) => {
  const [loading, setLoading] = useState(true);
  const [sugs, setSugs] = useState<SuggestionType[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const base = await AutoCropEngine.suggestCrops(uri, ratios, { eyeWeight: 0.6, padPct: 0.16 });
        const thumbs = await AutoCropEngine.makeThumbnails(uri, base, { size: 220, quality: 0.9 });
        if (mounted) setSugs(thumbs);
      } catch {
        if (mounted) setSugs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [uri, ratios]);

  if (loading) {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator size="small" color={Theme.colors.primary[500}]} />
        <Text style={styles.meta}>Finding the best frames…</Text>
      </View>
    );
  }

  if (!sugs.length) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.meta}>No suggestions—try manual crop.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {sugs.map((s) => (
          <View key={s.ratio} style={styles.card}>
            <BouncePressable
              onPress={() => { Haptics.selectionAsync(); onFocus?.(s.focus); }}
              style={styles.thumbBtn}
              accessibilityLabel={`Preview ${s.ratio} crop`}
            >
              {s.thumbUri ? (
                <Image source={{ uri: s.thumbUri }} style={styles.thumbImg} resizeMode="cover" />
              ) : (
                <View style={[styles.thumbImg, { justifyContent: "center", alignItems:"center"}]>
                  <Ionicons name="image" size={24} color="#fff" />
                </View>
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{s.ratio}</Text>
              </View>
            </BouncePressable>

            <BouncePressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onApply?.(s.crop); }}
              style={styles.useBtn}
              accessibilityLabel={`Apply ${s.ratio} crop`}
            >
              <Ionicons name="flash" size={14} color="#fff" />
              <Text style={styles.useTxt}>Use</Text>
            </BouncePressable>

            <Text style={styles.meta}>
              {s.method === "eyes" ? "Eye-focus" : s.method === "face" ? "Face" : "Smart"} • {s.ratio}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingVertical: 12, paddingHorizontal: 16 },
  row: { gap: 12 },
  card: { width: 140, alignItems: "center" },
  thumbBtn: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  thumbImg: { width: 140, height: 140, backgroundColor: "rgba(255,255,255,0.06)" },
  badge: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.55)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 },
  badgeTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  useBtn: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Theme.colors.primary[500], borderRadius: 10 },
  useTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
  meta: { marginTop: 6, color: "rgba(255,255,255,0.7)", fontSize: 12, textAlign: "center" },
});
