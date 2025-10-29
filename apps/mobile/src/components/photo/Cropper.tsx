// components/photo/Cropper.tsx
import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, Image as RNImage, Dimensions, Text, TouchableOpacity } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";

const { width: SCREEN_W } = Dimensions.get("window");

type Rect = { x: number; y: number; width: number; height: number };
type Ratio = "FREE" | "1:1" | "4:5" | "9:16" | "16:9" | "3:2";
const ratioToNum = (r: Ratio): number | null => {
  switch (r) {
    case "1:1": return 1;
    case "4:5": return 4 / 5;
    case "9:16": return 9 / 16;
    case "16:9": return 16 / 9;
    case "3:2": return 3 / 2;
    default: return null;
  }
};

export type CropperHandle = {
  /** Smoothly zoom & center the view so this rectangle (in image pixels) fills the crop window */
  focusTo: (rect: Rect) => void;
};

interface Props {
  uri: string;
  containerW: number;
  containerH: number;
  defaultRatio?: Ratio;
  onCropped: (newUri: string) => void;
  showStoryGuides?: boolean;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const Cropper = forwardRef<CropperHandle, Props>(
({ uri, containerW, containerH, defaultRatio = "4:5", onCropped, showStoryGuides = false }, ref) => {
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [ratio, setRatio] = useState<Ratio>(defaultRatio);

  useEffect(() => {
    RNImage.getSize(uri, (w, h) => { setImgW(w); setImgH(h); }, () => {});
  }, [uri]);

  // base "contain" scale (no transforms yet)
  const baseScale = useMemo(() => (!imgW || !imgH ? 1 : Math.min(containerW / imgW, containerH / imgH)), [imgW, imgH, containerW, containerH]);

  // crop window (centered)
  const ar = ratioToNum(ratio);
  const cropW = ar ? Math.min(containerW, containerH * ar) : Math.min(containerW, containerH);
  const cropH = ar ? cropW / ar : Math.min(containerW, containerH);
  const cropLeft = (containerW - cropW) / 2;
  const cropTop = (containerH - cropH) / 2;
  const cropRight = cropLeft + cropW;
  const cropBottom = cropTop + cropH;

  // transforms
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // Rubber-band factor when dragging outside
  const RUBBER = 0.45;

  const edgeClamp = () => {
    "worklet";
    const dispW = imgW * baseScale * scale.value;
    const dispH = imgH * baseScale * scale.value;
    const minTx = cropRight - containerW / 2 - dispW / 2;
    const maxTx = cropLeft - containerW / 2 + dispW / 2;
    const minTy = cropBottom - containerH / 2 - dispH / 2;
    const maxTy = cropTop - containerH / 2 + dispH / 2;
    tx.value = clamp(tx.value, minTx, maxTx);
    ty.value = clamp(ty.value, minTy, maxTy);
  };

  const pan = Gesture.Pan()
    .onChange((e) => {
      // allow a bit of overshoot with rubber effect
      const dispW = imgW * baseScale * scale.value;
      const dispH = imgH * baseScale * scale.value;
      const minTx = cropRight - containerW / 2 - dispW / 2;
      const maxTx = cropLeft - containerW / 2 + dispW / 2;
      const minTy = cropBottom - containerH / 2 - dispH / 2;
      const maxTy = cropTop - containerH / 2 + dispH / 2;

      const nextX = tx.value + e.changeX;
      const nextY = ty.value + e.changeY;

      const overX = nextX < minTx ? nextX - minTx : nextX > maxTx ? nextX - maxTx : 0;
      const overY = nextY < minTy ? nextY - minTy : nextY > maxTy ? nextY - maxTy : 0;

      tx.value = overX ? nextX - overX * (1 - RUBBER) : nextX;
      ty.value = overY ? nextY - overY * (1 - RUBBER) : nextY;
    })
    .onEnd(() => {
      edgeClamp();
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); })
    .onChange((e) => {
      const prev = scale.value;
      scale.value = clamp(prev * e.scale, 1, 6);
    })
    .onEnd(() => {
      edgeClamp();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });

  const composed = Gesture.Simultaneous(pan, pinch);

  // Animate to subject focus rectangle
  const focusTo = (rect: Rect) => {
    "worklet";
    const pad = 1.10; // 10% padding around subject
    const needScale = Math.max(
      (cropW * pad) / (rect.width * baseScale),
      (cropH * pad) / (rect.height * baseScale),
    );
    const nextScale = clamp(needScale, 1, 6);
    const dispW = imgW * baseScale * nextScale;
    const dispH = imgH * baseScale * nextScale;

    // Find tx/ty that centers rect inside crop window
    const rx = rect.x + rect.width / 2;
    const ry = rect.y + rect.height / 2;

    const targetTx = dispW / 2 - rx * baseScale * nextScale;
    const targetTy = dispH / 2 - ry * baseScale * nextScale;

    scale.value = withSpring(nextScale, { damping: 18, stiffness: 300 }, () => {
      // after scaling, clamp
    });
    tx.value = withSpring(targetTx, { damping: 18, stiffness: 300 }, edgeClamp);
    ty.value = withSpring(targetTy, { damping: 18, stiffness: 300 }, edgeClamp);
  };

  useImperativeHandle(ref, () => ({ focusTo }));

  const imgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const applyCrop = async () => {
    const s = scale.value;
    const dispW = imgW * baseScale * s;
    const dispH = imgH * baseScale * s;

    // Image top-left (display) given current tx/ty
    const cx = containerW / 2 + tx.value;
    const cy = containerH / 2 + ty.value;
    const left = cx - dispW / 2;
    const top = cy - dispH / 2;

    // Normalize crop window inside image (0..1)
    const u = (cropLeft - left) / dispW;
    const v = (cropTop - top) / dispH;
    const uw = cropW / dispW;
    const vh = cropH / dispH;

    // Convert to original pixels & guard edges
    const originX = clamp(Math.round(u * imgW), 0, imgW - 1);
    const originY = clamp(Math.round(v * imgH), 0, imgH - 1);
    const widthPx = clamp(Math.round(uw * imgW), 1, imgW - originX);
    const heightPx = clamp(Math.round(vh * imgH), 1, imgH - originY);

    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX, originY, width: widthPx, height: heightPx } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      onCropped(result.uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={{ width: containerW, height: containerH }}>
      {/* Image layer */}
      <GestureDetector gesture={composed}>
        <Animated.Image
          source={{ uri }}
          style={[styles.img, { width: imgW * baseScale, height: imgH * baseScale }, imgStyle]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </GestureDetector>

      {/* Mask + Crop window + Grid */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
        <View style={{ height: cropH, flexDirection: "row" }}>
          <View style={{ width: cropLeft, backgroundColor: "rgba(0,0,0,0.6)" }} />
          <View style={{ width: cropW, borderWidth: 1, borderColor: "rgba(255,255,255,0.85)" }}>
            {/* thirds grid */}
            <View style={styles.gridRow} />
            <View style={styles.gridRow} />
            <View style={styles.gridRow} />
            <View style={[StyleSheet.absoluteFill, { flexDirection: "row" }]>
              <View style={styles.gridCol} />
              <View style={styles.gridCol} />
              <View style={styles.gridCol} />
            </View>
          </View>
          <View style={{ width: cropLeft, backgroundColor: "rgba(0,0,0,0.6)" }} />
        </View>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
      </View>

      {/* Story safe area guides */}
      {showStoryGuides && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {/* Top safe band */}
          <View style={[styles.storyBand, { top: cropTop + 64 }] />
          {/* Bottom safe band */}
          <View style={[styles.storyBand, { bottom: (containerH - cropBottom) + 120 }] />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {(["FREE","1:1","4:5","9:16","16:9","3:2"] as Ratio[]).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => { setRatio(r); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.ratioBtn, r===ratio && styles.ratioBtnActive]}>
            <Text style={[styles.ratioTxt, r===ratio && styles.ratioTxtActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={applyCrop} style={styles.applyBtn}>
          <Ionicons name="crop" size={16} color="#fff" />
          <Text style={styles.applyTxt}>Apply Crop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  img: { position: "absolute", left: 0, top: 0 },
  gridRow: { flex: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  gridCol: { flex: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  controls: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  ratioBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  ratioBtnActive: { backgroundColor: "rgba(236,72,153,0.22)", borderColor: Theme.colors.primary[500] },
  ratioTxt: { color: "#fff", fontSize: 12, fontWeight: "600" },
  ratioTxtActive: { color: "#fff" },
  applyBtn: { marginLeft: 8, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: Theme.colors.primary[500] },
  applyTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  storyBand: {
    position: "absolute",
    left: 0, right: 0,
    height: 60,
    borderColor: "rgba(14,165,233,0.7)",
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
