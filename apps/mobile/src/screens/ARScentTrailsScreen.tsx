import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as Location from "expo-location";
import { DeviceMotion } from "expo-sensors";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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
    <View style={styles.container}>
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
                testID={`marker-${i}`}
              >
                <Text style={styles.markerText}>
                  {p.activity} • {Math.round(dist)}m
                </Text>
              </View>
            );
          })}

          {/* Compass indicator */}
          <View style={styles.compass}>
            <Ionicons name="compass" size={48} color="#fff" style={{ transform: [{ rotate: `${heading}deg` }] }} />
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowHUD(!showHUD)}
          testID="btn-toggle-hud"
        >
          <Ionicons name={showHUD ? "eye" : "eye-off"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  message: {
    color: "#fff",
    fontSize: 16,
  },
  hud: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
  },
  markerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  compass: {
    position: "absolute",
    top: 60,
    right: 20,
    alignItems: "center",
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
});
