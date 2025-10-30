import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useReduceMotion } from "../hooks/useReducedMotion";

const { width, height } = Dimensions.get("window");

function bearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const φ1 = from.lat * Math.PI / 180;
  const φ2 = to.lat * Math.PI / 180;
  const Δλ = (to.lng - from.lng) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360;
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

interface Pin {
  latitude: number;
  longitude: number;
  activity: string;
}

export default function ARScentTrailsScreen() {
  const route = useRoute();
  const pins: Pin[] = (route.params as any)?.pins ?? [];
  const reducedMotion = useReduceMotion();
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.bg,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.bg,
    },
    message: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    hud: {
      ...StyleSheet.absoluteFillObject,
    },
    marker: {
      position: "absolute",
      backgroundColor: theme.colors.overlay,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    markerText: {
      color: theme.colors.onSurface,
      fontWeight: "700",
      fontSize: 12,
    },
    compass: {
      position: "absolute",
      top: theme.spacing['4xl'],
      right: theme.spacing.lg,
      alignItems: "center",
    },
    controls: {
      position: "absolute",
      bottom: theme.spacing.xl,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
    },
    controlButton: {
      backgroundColor: theme.colors.overlay,
      width: 50,
      height: 50,
      borderRadius: theme.radii.full,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: theme.spacing.sm,
    },
  }), [theme]);

  const [perm, setPerm] = useState(false);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState(0);
  const [showHUD, setShowHUD] = useState(true);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (cameraStatus === "granted" && locationStatus === "granted") {
        setPerm(true);

        // Watch location
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 1 },
          (p) => {
            setLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
          }
        );

        // Watch device motion for heading
        const subscription = DeviceMotion.addListener((data) => {
          const gamma = data.rotation?.gamma ?? 0;
          const h = gamma * (180 / Math.PI);
          setHeading(((h % 360) + 360) % 360);
        });

        return () => {
          sub?.remove();
          subscription?.remove();
        };
      } else {
        Alert.alert("Permissions Required", "Camera and location permissions are required");
      }
    })();
  }, []);

  if (!perm) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Grant camera & location permissions</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="ar-scent-trails-screen" accessibilityLabel="AR scent trails view">
      <Camera style={StyleSheet.absoluteFill} type={CameraType.back} />

      {/* HUD Overlay */}
      {showHUD && (
        <View style={styles.hud}>
          {loc && pins.slice(0, 12).map((p, i) => {
            const dist = haversine(loc, { lat: p.latitude, lng: p.longitude });
            const brg = bearing(loc, { lat: p.latitude, lng: p.longitude });
            const rel = ((brg - heading) + 360) % 360;

            // Convert bearing to screen position
            const x = (rel / 60) * (width / 2);
            const clampedX = Math.max(-width / 2, Math.min(width / 2, x));
            const screenX = width / 2 + clampedX;

            // Y position based on distance
            const y = height * 0.65 - Math.min(200, dist / 5);

            if (screenX < -50 || screenX > width + 50 || y < -50 || y > height + 50) {
              return null;
            }

            return (
              <View
                key={i}
                style={[styles.marker, { left: screenX - 30, top: y - 30 }]}
                testID={`ar-marker-${i}`}
                accessibilityLabel={`${p.activity} marker, ${Math.round(dist)} meters away`}
              >
                <Text style={styles.markerText}>
                  {p.activity} • {Math.round(dist)}m
                </Text>
              </View>
            );
          })}

          {/* Compass indicator */}
          <View style={styles.compass} testID="ar-compass" accessibilityLabel={`Compass pointing ${Math.round(heading)} degrees`}>
            <Ionicons 
              name="compass" 
              size={48} 
              color={theme.colors.onSurface} 
              style={{ transform: [{ rotate: `${reducedMotion ? 0 : heading}deg` }] }}
              accessibilityLabel="Compass icon"
            />
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          testID="btn-toggle-hud"
          accessibilityLabel={showHUD ? "Hide HUD" : "Show HUD"}
          accessibilityRole="button"
          onPress={() => { setShowHUD(!showHUD); }}
        >
          <Ionicons name={showHUD ? "eye" : "eye-off"} size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
