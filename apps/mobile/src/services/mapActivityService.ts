import { api } from './api';
import * as Location from 'expo-location';

export interface CreateActivityParams {
  petId: string;
  activity: string;
  message?: string;
  shareToMap?: boolean;
  radiusMeters?: number;
}

export interface MapPin {
  _id: string;
  userId: string;
  petId: string;
  activity: string;
  message?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  radiusMeters: number;
  shareToMap: boolean;
  active: boolean;
  likes: Array<{
    userId: string;
    likedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MapSearchParams {
  latitude: number;
  longitude: number;
  maxDistance?: number;
}

export async function startActivity(params: CreateActivityParams): Promise<MapPin> {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { request } = await import('./api');
  const response = await request<MapPin>('/map/activity/start', {
    method: 'POST',
    body: {
      ...params,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    },
  });

  return response;
}

export async function endActivity(activityId: string): Promise<void> {
  const { request } = await import('./api');
  await request('/map/activity/end', {
    method: 'POST',
    body: { activityId },
  });
}

export async function getNearbyPins(
  latitude: number,
  longitude: number,
  maxDistance?: number,
): Promise<MapPin[]> {
  const { request } = await import('./api');
  const params: Record<string, number> = { latitude, longitude };
  if (maxDistance) params.maxDistance = maxDistance;

  const response = await request<MapPin[]>('/map/pins', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
  return response;
}

export async function likePin(pinId: string): Promise<{ likes: number }> {
  const { request } = await import('./api');
  const response = await request<{ likes: number }>(`/map/pins/${pinId}/like`, {
    method: 'POST',
  });
  return response;
}

export async function commentOnPin(pinId: string, text: string): Promise<{ comments: number }> {
  const { request } = await import('./api');
  const response = await request<{ comments: number }>(`/map/pins/${pinId}/comment`, {
    method: 'POST',
    body: { text },
  });
  return response;
}
