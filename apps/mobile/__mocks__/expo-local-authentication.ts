// Mock for expo-local-authentication
export const AuthenticationType = {
  FINGERPRINT: 1,
  FACIAL_RECOGNITION: 2,
  IRIS: 3,
};

export const SecurityLevel = {
  NONE: 0,
  SECRET: 1,
  BIOMETRIC_WEAK: 2,
  BIOMETRIC_STRONG: 3,
};

export const hasHardwareAsync = jest.fn().mockResolvedValue(true);
export const supportedAuthenticationTypesAsync = jest.fn().mockResolvedValue([AuthenticationType.FINGERPRINT]);
export const isEnrolledAsync = jest.fn().mockResolvedValue(true);
export const authenticateAsync = jest.fn().mockResolvedValue({
  success: true,
  error: undefined,
  warning: undefined,
});
export const getEnrolledLevelAsync = jest.fn().mockResolvedValue(SecurityLevel.BIOMETRIC_STRONG);
export const cancelAuthenticate = jest.fn();

// Default export
const LocalAuthentication = {
  AuthenticationType,
  SecurityLevel,
  hasHardwareAsync,
  supportedAuthenticationTypesAsync,
  isEnrolledAsync,
  authenticateAsync,
  getEnrolledLevelAsync,
  cancelAuthenticate,
};

export default LocalAuthentication;
