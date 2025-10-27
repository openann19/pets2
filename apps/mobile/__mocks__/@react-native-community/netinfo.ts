// Mock for @react-native-community/netinfo
export enum NetInfoStateType {
  unknown = 'unknown',
  none = 'none',
  cellular = 'cellular',
  wifi = 'wifi',
  bluetooth = 'bluetooth',
  ethernet = 'ethernet',
  wimax = 'wimax',
  vpn = 'vpn',
  other = 'other',
}

export const NetInfo = {
  configure: jest.fn(),
  fetch: jest.fn().mockResolvedValue({
    type: NetInfoStateType.wifi,
    isConnected: true,
    isInternetReachable: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'TestWiFi',
      strength: 100,
    },
  }),
  refresh: jest.fn().mockResolvedValue(undefined),
  addEventListener: jest.fn().mockReturnValue(jest.fn()), // returns unsubscribe function
  useNetInfo: jest.fn(),
};

export default NetInfo;
