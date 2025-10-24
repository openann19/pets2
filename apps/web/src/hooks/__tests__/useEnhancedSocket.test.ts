import { renderHook, act } from '@testing-library/react';
import { useEnhancedSocket } from '../useEnhancedSocket';

jest.mock('../../lib/auth-store', () => ({
  useAuthStore: () => ({ user: null, accessToken: undefined }),
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    id: 'sock1',
  })),
}));

describe('useEnhancedSocket', () => {
  test('does not connect without auth and exposes safe methods', () => {
    const { result, unmount } = renderHook(() => useEnhancedSocket());

    expect(result.current.socket).toBeNull();
    expect(result.current.state.isConnected).toBe(false);

    act(() => {
      result.current.connect();
    });

    // Still no socket without auth
    expect(result.current.socket).toBeNull();

    // Calling messaging methods should not throw when disconnected
    act(() => {
      result.current.sendMessage('m1', { content: 'hi' });
      result.current.joinMatch('m1');
      result.current.leaveMatch('m1');
      result.current.startTyping('m1');
      result.current.stopTyping('m1');
      result.current.updatePresence('online');
      result.current.emit('custom', { x: 1 });
    });

    unmount();
  });
});
