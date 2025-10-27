export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

export const requestMediaLibraryPermissionsAsync = jest.fn(async () => ({
  granted: true,
  status: 'granted' as const,
}));

export const launchImageLibraryAsync = jest.fn(async () => ({
  canceled: false,
  assets: [
    { uri: 'file:///tmp/test.jpg', width: 100, height: 100, fileSize: 12345, type: 'image/jpeg', fileName: 'test.jpg' }
  ],
}));
