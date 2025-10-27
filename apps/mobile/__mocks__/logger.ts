// Mock logger to prevent infinite loops during testing
export const MobileLogger = jest.fn().mockImplementation(() => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  security: jest.fn(),
  bufferOfflineLog: jest.fn().mockResolvedValue(undefined),
  flushOfflineLogs: jest.fn().mockResolvedValue(undefined),
  setUserInfo: jest.fn(),
  clearUserInfo: jest.fn(),
  getSessionId: jest.fn().mockReturnValue('test-session'),
  destroy: jest.fn(),
}));

export const logger = new MobileLogger();
