import { request } from './api';

export interface Settings {
  notifications?: {
    matches?: boolean;
    messages?: boolean;
    likes?: boolean;
    activity?: boolean;
    push?: boolean;
    email?: boolean;
  };
  preferences?: {
    maxDistance?: number;
    ageRange?: { min: number; max: number };
    species?: string[];
    intents?: string[];
  };
}

export async function getSettings(): Promise<Settings> {
  const response = await request<Settings>('/settings/me', {
    method: 'GET',
  });
  return response;
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const response = await request<Settings>('/settings/me', {
    method: 'PATCH',
    body: settings,
  });
  return response;
}

