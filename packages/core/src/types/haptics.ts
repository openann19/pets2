import { HAPTICS, HAPTIC_SETTINGS } from '../constants';

export interface HapticSettings {
    enabled: boolean;
    intensity: number;
    duration: number;
    customElement?: string;
}

export interface HapticFeedback {
    type: typeof HAPTICS[keyof typeof HAPTICS];
    intensity?: number;
    duration?: number;
    element?: string;
}

export type HapticSettingKey = keyof typeof HAPTIC_SETTINGS;