// Mock for expo-secure-store
export const setItemAsync = jest.fn().mockResolvedValue(undefined);
export const getItemAsync = jest.fn().mockResolvedValue(null);
export const deleteItemAsync = jest.fn().mockResolvedValue(undefined);
export const isAvailableAsync = jest.fn().mockResolvedValue(true);

export const SecureStoreOptions = {
  WHEN_UNLOCKED: 'whenUnlocked',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK: 'afterFirstUnlock',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'afterFirstUnlockThisDeviceOnly',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'whenPasscodeSetThisDeviceOnly',
};

export default {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
  isAvailableAsync,
  SecureStoreOptions,
};
