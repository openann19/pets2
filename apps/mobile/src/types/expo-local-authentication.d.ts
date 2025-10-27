// Type definitions for expo-local-authentication
declare module 'expo-local-authentication' {
  export enum AuthenticationType {
    FINGERPRINT = 1,
    FACIAL_RECOGNITION = 2,
    IRIS = 3,
  }
  
  export enum SecurityLevel {
    NONE = 0,
    SECRET = 1,
    BIOMETRIC_WEAK = 2,
    BIOMETRIC_STRONG = 3,
  }
  
  export interface AuthenticationResult {
    success: boolean;
    warning?: string;
    error?: string;
  }
  
  export interface LocalAuthenticationResult {
    success: boolean;
    error?: string;
    warning?: string;
  }
  
  export function hasHardwareAsync(): Promise<boolean>;
  export function supportedAuthenticationTypesAsync(): Promise<AuthenticationType[]>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(options?: {
    promptMessage?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
    fallbackLabel?: string;
    requireConfirmation?: boolean;
  }): Promise<AuthenticationResult>;
}
