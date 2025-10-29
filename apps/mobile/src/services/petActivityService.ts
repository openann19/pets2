import * as Location from "expo-location";
import { Platform } from "react-native";
import { logger } from "@pawfectmatch/core";
import { socketClient } from "./socket";

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";

export type ActivityKind =
  | "walk"
  | "play"
  | "feeding"
  | "rest"
  | "training"
  | "lost_pet";

export interface StartActivityPayload {
  petId: string;
  activity: ActivityKind;
  message?: string;
  shareToMap?: boolean;
  radiusMeters?: number;
}

export interface ActivityRecord {
  _id: string;
  petId: string;
  activity: ActivityKind;
  message?: string;
  lat: number;
  lng: number;
  radius?: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

export async function startPetActivity(data: StartActivityPayload): Promise<ActivityRecord> {
  const loc = await getCurrentLocation();
  const body = {
    petId: data.petId,
    activity: data.activity,
    message: data.message || "",
    shareToMap: data.shareToMap ?? true,
    location: loc,
    radius: data.radiusMeters ?? 500,
    device: Platform.OS,
  };

  // REST (authoritative) + socket (realtime)
  const res = await fetch(`${API_URL}/api/pets/activity/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`startPetActivity failed: ${res.status} ${t}`);
  }
  const result = await res.json();
  const record: ActivityRecord = result.data;

  // Realtime broadcast
  if (socketClient) {
    socketClient.emit("activity:start", { ...body, _id: record._id });
  }

  logger.info("Activity started", { record });
  return record;
}

export async function endPetActivity(activityId: string): Promise<ActivityRecord> {
  const res = await fetch(`${API_URL}/api/pets/activity/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activityId }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`endPetActivity failed: ${res.status} ${t}`);
  }
  const result = await res.json();
  const record: ActivityRecord = result.data;

  if (socketClient) {
    socketClient.emit("activity:end", { _id: record._id });
  }
  logger.info("Activity ended", { record });

  return record;
}

export async function getActivityHistory(petId: string): Promise<ActivityRecord[]> {
  const res = await fetch(`${API_URL}/api/pets/activity/history?petId=${encodeURIComponent(petId)}`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`getActivityHistory failed: ${res.status} ${t}`);
  }
  const result = await res.json();
  return result.data as ActivityRecord[];
}

